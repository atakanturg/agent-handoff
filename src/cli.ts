#!/usr/bin/env node
import os from "node:os";
import { runInstall } from "./commands/install.js";
import { runUninstall } from "./commands/uninstall.js";
import { initProject } from "./commands/init-project.js";
import { runMark } from "./commands/mark.js";
import { getStatus, formatStatus } from "./commands/status.js";
import { promptFor } from "./commands/print-prompt.js";
import { runValidate } from "./commands/validate.js";
import { runDoctor } from "./commands/doctor.js";

function parseFlags(args: string[]): { positionals: string[]; flags: Record<string, string | boolean> } {
  const positionals: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (key === "yes" || key === "force") {
      flags[key] = true;
      continue;
    }
    const value = args[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    flags[key] = value;
    index += 1;
  }
  return { positionals, flags };
}

function help(): string {
  return `agent-handoff

Commands:
  install claude-code --threshold 90 --mode marker|warn|block [--yes] [--force]
  uninstall claude-code [--yes]
  init-project [--yes]
  mark
  status
  print-prompt codex|gemini
  validate handoff.md
  doctor
`;
}

async function main(): Promise<void> {
  const [, , command, ...rest] = process.argv;
  if (!command || command === "--help" || command === "-h") {
    console.log(help());
    return;
  }
  const { positionals, flags } = parseFlags(rest);

  if (command === "install") {
    const result = runInstall(positionals[0] ?? "", flags);
    console.log(`Installed ${positionals[0]}.`);
    for (const file of result.files) console.log(`Wrote ${file}`);
    if (result.backupPath) console.log(`Backed up settings to ${result.backupPath}`);
    return;
  }
  if (command === "uninstall") {
    const result = runUninstall(positionals[0] ?? "");
    console.log(`Uninstalled ${positionals[0]}.`);
    for (const file of result.removed) console.log(`Removed ${file}`);
    if (result.backupPath) console.log(`Backed up settings to ${result.backupPath}`);
    return;
  }
  if (command === "init-project") {
    const file = initProject();
    console.log(`Updated ${file}`);
    return;
  }
  if (command === "mark") {
    const state = runMark();
    console.log(`Marked handoff needed in ${state.cwd}`);
    return;
  }
  if (command === "status") {
    console.log(formatStatus(getStatus()));
    return;
  }
  if (command === "print-prompt") {
    console.log(promptFor(positionals[0] ?? ""));
    return;
  }
  if (command === "validate") {
    const file = positionals[0];
    if (!file) throw new Error("validate requires a handoff.md path");
    const result = runValidate(file);
    for (const warning of result.warnings) console.error(`Warning: ${warning}`);
    for (const error of result.errors) console.error(`Error: ${error}`);
    if (!result.ok) process.exitCode = 1;
    else console.log("handoff.md contains all required sections.");
    return;
  }
  if (command === "doctor") {
    console.log(runDoctor(os.homedir()).join("\n"));
    return;
  }
  throw new Error(`Unknown command: ${command}\n\n${help()}`);
}

main().catch((error: Error) => {
  console.error(error.message);
  process.exitCode = 1;
});
