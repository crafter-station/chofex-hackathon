import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

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

export const upgradeCli = async (runner: NpmRunner = runNpm): Promise<void> => {
  const cacheDirectory = await mkdtemp(join(tmpdir(), "chofex-npm-cache-"));
  try {
    const result = await runner(npmUpgradeArguments(cacheDirectory));
    if (result.exitCode === 0) return;

    let detail = "";
    if (result.stderr) detail = `: ${result.stderr}`;
    throw new Error(`npm exited with code ${result.exitCode}${detail}`);
  } finally {
    await rm(cacheDirectory, { recursive: true, force: true });
  }
};
