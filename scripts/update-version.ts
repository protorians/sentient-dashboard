import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

function getLatestTag() {
  try {
    return execSync("git describe --tags --abbrev=0").toString().trim();
  } catch {
    return null;
  }
}

function getCurrentBranch() {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
  } catch {
    return "main";
  }
}

function getCommitsSince(tag: string | null) {
  const range = tag ? `${tag}..HEAD` : "HEAD";
  try {
    const output = execSync(`git log ${range} --format=%s`).toString().trim();
    return output ? output.split("\n") : [];
  } catch {
    return [];
  }
}

function determineIncrement(commits: string[]) {
  let increment: "major" | "minor" | "patch" | null = null;

  for (let commit of commits) {
    commit = commit.trim().toLowerCase();
    if (
        commit.includes("breaking change") ||
        commit.includes("!") ||
        commit.startsWith("release") ||
        commit.startsWith("upgrade")
    ) {
      return "major";
    }
    if (
        commit.startsWith("feat") ||
        commit.startsWith("update") ||
        commit.startsWith("add")
    ) {
      increment = "minor";
    } else if (
        !increment &&
        commit.startsWith("fix") ||
        commit.startsWith("remove")
    ) {
      increment = "patch";
    }
  }

  return increment;
}

function updateVersion(increment: "major" | "minor" | "patch", branch: string) {
  const packageJsonPath = path.resolve(process.cwd(), "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  const currentVersion = packageJson.version;

  // Identification du suffixe de branche (alpha, beta, rc)
  let preReleaseType: string | null = null;
  if (branch.startsWith("alpha")) preReleaseType = "alpha";
  else if (branch.startsWith("beta")) preReleaseType = "beta";
  else if (branch.startsWith("rc")) preReleaseType = "rc";

  // Extraction de la version de base et de la pre-release
  // Format: major.minor.patch-type.num
  const [versionPart, preReleasePart] = currentVersion.split("-");
  const [major, minor, patch] = versionPart.split(".").map(Number);

  let nextVersion = "";
  if (increment === "major") {
    nextVersion = `${major + 1}.0.0`;
  } else if (increment === "minor") {
    nextVersion = `${major}.${minor + 1}.0`;
  } else {
    nextVersion = `${major}.${minor}.${patch + 1}`;
  }

  // Si nous sommes sur une branche de pre-release
  if (preReleaseType) {
    let preReleaseCount = 0;
    if (preReleasePart && preReleasePart.startsWith(preReleaseType)) {
      // Si on était déjà sur le même type de pre-release, on incrémente le compteur
      // Si la version de base a changé suite à l'incrément, on repart à 0 ?
      // Généralement si on fait un "feat" sur une branche alpha, on incrémente le patch ou le minor
      // MAIS on garde le suffixe alpha.
      const match = preReleasePart.match(/\d+$/);
      preReleaseCount = match ? parseInt(match[0], 10) + 1 : 0;

      // Si la version de base a été incrémentée, on pourrait vouloir repartir de 0,
      // mais ici on suit la logique demandée : ajouter le nom de la branche.
    }

    nextVersion = `${nextVersion}-${preReleaseType}.${preReleaseCount}`;
  }

  packageJson.version = nextVersion;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
  console.log(`Version updated from ${currentVersion} to ${nextVersion} (branch: ${branch})`);
  return nextVersion;
}

function main() {
  const latestTag = getLatestTag();
  console.log(`Latest tag: ${latestTag || "None"}`);

  const commits = getCommitsSince(latestTag);
  console.log(`Commits since last tag: ${commits.length}`);

  if (commits.length === 0) {
    console.log("No new commits. Skipping version update.");
    return;
  }

  const increment = determineIncrement(commits);
  if (!increment) {
    console.log("No version-triggering commits found (feat, fix, BREAKING CHANGE). Skipping version update.");
    return;
  }

  console.log(`Determined increment: ${increment}`);
  const branch = getCurrentBranch();
  updateVersion(increment, branch);
}

main();
