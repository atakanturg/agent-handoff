import fs from "node:fs";
import path from "node:path";

export interface ProjectInfo {
  packageManager: string;
  runtimeFramework: string;
}

export function detectProject(cwd = process.cwd()): ProjectInfo {
  const has = (file: string) => fs.existsSync(path.join(cwd, file));
  const packageManager = has("pnpm-lock.yaml")
    ? "pnpm"
    : has("yarn.lock")
      ? "yarn"
      : has("package-lock.json")
        ? "npm"
        : has("package.json")
          ? "npm (no lockfile detected)"
          : "unknown";
  const runtimeFramework = has("next.config.js") || has("next.config.mjs") || has("next.config.ts")
    ? "Next.js"
    : has("vite.config.js") || has("vite.config.ts")
      ? "Vite"
      : has("package.json")
        ? "Node.js"
        : "unknown";
  return { packageManager, runtimeFramework };
}
