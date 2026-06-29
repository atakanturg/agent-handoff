import os from "node:os";
import { uninstallClaudeCode } from "../adapters/claude-code/uninstall.js";

export function runUninstall(adapter: string, home = os.homedir()) {
  if (adapter !== "claude-code") throw new Error("uninstall supports: claude-code");
  return uninstallClaudeCode(home);
}
