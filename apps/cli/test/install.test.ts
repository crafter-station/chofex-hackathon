import { afterEach, describe, expect, test } from "bun:test";
import { execFile } from "node:child_process";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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
    const installDirectory = join(directory, "installed");
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
    expect(result.stdout).toContain(`export PATH=${installDirectory}:$PATH`);
  });
});
