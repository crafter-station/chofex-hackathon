import { afterEach, describe, expect, test } from "bun:test";
import { execFile, spawn } from "node:child_process";
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const installerPath = new URL("../../web/public/install", import.meta.url);
const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("curl installer", () => {
  test("installs a supplied executable without Node.js or npm", async () => {
    const directory = await mkdtemp(join(tmpdir(), "chofex-installer-test-"));
    temporaryDirectories.push(directory);
    const source = join(directory, "source-chofex");
    const installDirectory = join(directory, "installed cli");
    await writeFile(source, "#!/bin/sh\necho chofex-test\n");
    await chmod(source, 0o755);

    const result = await execFileAsync("bash", [
      installerPath.pathname,
      "--binary",
      source,
      "--install-dir",
      installDirectory,
      "--no-modify-path",
    ]);

    const installed = join(installDirectory, "chofex");
    expect(await readFile(installed, "utf8")).toBe(
      "#!/bin/sh\necho chofex-test\n",
    );
    expect((await execFileAsync(installed)).stdout.trim()).toBe("chofex-test");
    const pathCommand = result.stdout
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.startsWith("export PATH="));
    expect(pathCommand).toBeDefined();
    const command = `${pathCommand}; chofex`;
    expect((await execFileAsync("bash", ["-c", command])).stdout.trim()).toBe(
      "chofex-test",
    );
  });

  test("replaces a Windows executable after its parent exits", async () => {
    const directory = await mkdtemp(join(tmpdir(), "chofex-updater-test-"));
    temporaryDirectories.push(directory);
    const source = join(directory, "source-chofex");
    const installDirectory = join(directory, "installed");
    const installed = join(installDirectory, "chofex");
    const fakeBin = join(directory, "fake-bin");
    const moveAttempts = join(directory, "move-attempts");
    await writeFile(source, "new binary");
    await mkdir(installDirectory);
    await mkdir(fakeBin);
    await writeFile(installed, "old binary");
    await writeFile(
      join(fakeBin, "mv"),
      `#!/bin/sh
attempts=0
if [ -f "$CHOFEX_TEST_MOVE_ATTEMPTS" ]; then
  attempts="$(cat "$CHOFEX_TEST_MOVE_ATTEMPTS")"
fi
attempts=$((attempts + 1))
printf "%s" "$attempts" > "$CHOFEX_TEST_MOVE_ATTEMPTS"
if [ "$attempts" -lt 3 ]; then exit 1; fi
exec /bin/mv "$@"
`,
    );
    await chmod(join(fakeBin, "mv"), 0o755);

    const parent = spawn("sleep", ["0.2"]);
    if (parent.pid === undefined) throw new Error("Test parent did not start");
    const parentClosed = new Promise<void>((resolve) =>
      parent.on("close", () => resolve()),
    );
    await execFileAsync(
      "bash",
      [
        installerPath.pathname,
        "--binary",
        source,
        "--install-dir",
        installDirectory,
        "--no-modify-path",
        "--defer-until-pid",
        String(parent.pid),
      ],
      {
        env: {
          ...process.env,
          PATH: `${fakeBin}:${process.env.PATH}`,
          CHOFEX_TEST_MOVE_ATTEMPTS: moveAttempts,
        },
      },
    );

    await parentClosed;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      if ((await readFile(installed, "utf8")) === "new binary") return;
      await Bun.sleep(100);
    }
    expect(await readFile(installed, "utf8")).toBe("new binary");
    expect(await readFile(moveAttempts, "utf8")).toBe("3");
  });

  test("updates every existing Bash startup file", async () => {
    const directory = await mkdtemp(join(tmpdir(), "chofex-path-test-"));
    temporaryDirectories.push(directory);
    const source = join(directory, "source-chofex");
    const installDirectory = join(directory, "installed cli");
    const bashrc = join(directory, ".bashrc");
    const bashProfile = join(directory, ".bash_profile");
    await writeFile(source, "chofex");
    await writeFile(bashrc, "# interactive\n");
    await writeFile(bashProfile, "# login\n");

    await execFileAsync(
      "bash",
      [
        installerPath.pathname,
        "--binary",
        source,
        "--install-dir",
        installDirectory,
      ],
      {
        env: {
          ...process.env,
          HOME: directory,
          SHELL: "/bin/bash",
        },
      },
    );

    for (const configFile of [bashrc, bashProfile]) {
      expect(await readFile(configFile, "utf8")).toContain(
        `export PATH=${installDirectory.replace(" ", "\\ ")}:$PATH`,
      );
    }
  });
});
