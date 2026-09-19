import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export const cliPackageName = "chofex-cli";
export const upgradeVersion = "latest";

const npmUpgradeArguments = (cacheDirectory: string) => [
  "install",
  "--global",
  `${cliPackageName}@${upgradeVersion}`,
  "--force",
  "--prefer-online",
  `--cache=${cacheDirectory}`,
];

type NpmResult = {
  readonly exitCode: number;
  readonly stderr: string;
};

export type NpmRunner = (
  arguments_: ReadonlyArray<string>,
) => Promise<NpmResult>;

export type InstallerRunner = (installDirectory: string) => Promise<NpmResult>;

type UpgradeOptions = {
  readonly standalone?: boolean;
  readonly npmRunner?: NpmRunner;
  readonly installerRunner?: InstallerRunner;
};

const runNpm: NpmRunner = (arguments_) =>
  new Promise((resolve, reject) => {
    const executable = process.platform === "win32" ? "npm.cmd" : "npm";
    const child = spawn(executable, arguments_, {
      stdio: ["ignore", "ignore", "pipe"],
    });
    let stderr = "";

    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      resolve({ exitCode: exitCode ?? 1, stderr: stderr.trim() });
    });
  });

const installerUrl = "https://hacktheandes.com/install";

const runInstaller: InstallerRunner = async (installDirectory) => {
  const response = await fetch(installerUrl);
  if (!response.ok) {
    throw new Error(`installer download returned HTTP ${response.status}`);
  }
  const script = await response.text();
  return new Promise((resolve, reject) => {
    const child = spawn(
      "bash",
      ["-s", "--", "--install-dir", installDirectory, "--no-modify-path"],
      { stdio: ["pipe", "ignore", "pipe"] },
    );
    let stderr = "";

    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      resolve({ exitCode: exitCode ?? 1, stderr: stderr.trim() });
    });
    child.stdin.end(script);
  });
};

const isStandaloneExecutable = (): boolean =>
  typeof Bun !== "undefined" && Bun.isStandaloneExecutable;

const assertSuccessful = (result: NpmResult, program: string): void => {
  if (result.exitCode === 0) return;

  let detail = "";
  if (result.stderr) detail = `: ${result.stderr}`;
  throw new Error(`${program} exited with code ${result.exitCode}${detail}`);
};

export const upgradeCli = async (
  options: UpgradeOptions = {},
): Promise<void> => {
  const standalone = options.standalone ?? isStandaloneExecutable();
  if (standalone) {
    const runner = options.installerRunner ?? runInstaller;
    const result = await runner(dirname(process.execPath));
    assertSuccessful(result, "installer");
    return;
  }

  const runner = options.npmRunner ?? runNpm;
  const cacheDirectory = await mkdtemp(join(tmpdir(), "chofex-npm-cache-"));
  try {
    const result = await runner(npmUpgradeArguments(cacheDirectory));
    assertSuccessful(result, "npm");
  } finally {
    await rm(cacheDirectory, { recursive: true, force: true });
  }
};
