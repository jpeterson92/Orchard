import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const liveUrl = "https://orchard.jpeterson92.workers.dev";
const mainRef = "refs/heads/main";
const wranglerConfig = "dist/orchard/wrangler.json";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const npmPath = process.env.npm_execpath;

function readCommand(command: string, ...args: string[]): string {
  return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();
}

function assertReleaseCommit(commit: string): void {
  if (
    readCommand("git", "rev-parse", "--abbrev-ref", "HEAD") !== "main" ||
    readCommand("git", "rev-parse", "HEAD") !== commit ||
    readCommand("git", "status", "--porcelain")
  ) {
    throw new Error("Deploy from a clean main checkout at the release commit.");
  }
}

function artifactDigest(): string {
  const digest = createHash("sha256");
  for (const directory of ["dist/client", "dist/orchard"]) {
    const files = readdirSync(directory, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => join(entry.parentPath, entry.name))
      .sort();
    for (const file of files) {
      digest.update(`${file}\0`).update(createHash("sha256").update(readFileSync(file)).digest());
    }
  }
  return digest.digest("hex");
}

async function deploy(): Promise<void> {
  if (args.length > (dryRun ? 1 : 0)) throw new Error("Usage: npm run deploy [-- --dry-run]");
  if (!npmPath) throw new Error("Run this command with npm run deploy.");
  const npm = (args: string[], env = process.env) =>
    execFileSync(process.execPath, [npmPath, ...args], { env, stdio: "inherit" });

  const commit = readCommand("git", "rev-parse", "HEAD");
  assertReleaseCommit(commit);
  if (!dryRun) {
    const previousRuns = JSON.parse(
      readCommand(
        "gh",
        "run",
        "list",
        "--workflow",
        "ci.yml",
        "--branch",
        "main",
        "--event",
        "push",
        "--limit",
        "1",
        "--json",
        "conclusion,status,url",
      ),
    ) as { conclusion: string; status: string; url: string }[];
    const previous = previousRuns[0];
    if (previous?.conclusion === "failure") throw new Error(`Previous CI failed. Review ${previous.url}`);
    console.log(previous ? `Previous CI: ${previous.conclusion || previous.status}` : "Previous CI: no run");
  }

  npm(["run", "data:check", "--", "--production"]);
  npm(["run", "check:code"]);
  npm(["run", "build:app"]);
  const builtFiles = artifactDigest();
  const entryAsset = readFileSync("dist/client/index.html", "utf8").match(/\/assets\/index-[\w-]+\.js/)?.[0];
  if (!entryAsset) throw new Error("The built homepage is missing its app script.");

  npm(["run", "e2e"], { ...process.env, ORCHARD_E2E_PREBUILT: "1" });
  assertReleaseCommit(commit);
  if (!dryRun) {
    execFileSync("git", ["push", "origin", `${commit}:${mainRef}`], { stdio: "inherit" });
    const remote = readCommand("git", "ls-remote", "--exit-code", "origin", mainRef);
    if (remote.split(/\s+/)[0] !== commit) throw new Error("GitHub main differs from the tested commit.");
  }
  if (artifactDigest() !== builtFiles) throw new Error("The build files changed after the build finished.");

  npm([
    "exec",
    "--offline",
    "--",
    "wrangler",
    "deploy",
    "--config",
    wranglerConfig,
    ...(dryRun ? ["--dry-run"] : ["--message", `Orchard ${commit}`]),
  ]);
  if (dryRun) {
    console.log(`Dry run passed for ${commit}.`);
    return;
  }

  console.log(`Published ${commit}. Checking the live site.`);
  const fetchLive = (path: string) => fetch(`${liveUrl}${path}`, { signal: AbortSignal.timeout(15_000) });
  const [home, health] = await Promise.all([fetchLive("/"), fetchLive("/api/health")]);
  if (!home.ok || !(await home.text()).includes(entryAsset)) {
    throw new Error(`Live homepage did not serve the deployed app script (HTTP ${home.status}).`);
  }
  if (!health.ok || ((await health.json()) as { ok?: boolean }).ok !== true) {
    throw new Error(`Live Worker health check failed (HTTP ${health.status}).`);
  }
  console.log(`Live homepage and Worker health verified at ${liveUrl}`);
}

try {
  await deploy();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
