import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  installClaudeSettings,
  uninstallClaudeSettings,
  readSettingsFile,
  updateClaudeSettingsOnDisk,
} from "../src/core/settings-writer.js";

test("settings merge preserves unrelated settings", () => {
  const merged = installClaudeSettings(
    {
      theme: "dark",
      hooks: {
        PreToolUse: [{ matcher: "Bash", hooks: [{ type: "command", command: "echo ok" }] }],
      },
    },
    { threshold: 90, mode: "warn", force: false },
  );

  assert.equal(merged.theme, "dark");
  assert.ok(String((merged.statusLine as { command: string }).command).includes("AGENT_HANDOFF_THRESHOLD=90"));
  assert.equal(((merged.hooks as Record<string, unknown[]>).PreToolUse).length, 1);
  assert.equal(((merged.hooks as Record<string, unknown[]>).UserPromptSubmit).length, 1);
});

test("install refuses to overwrite unrelated statusLine without force", () => {
  assert.throws(
    () => installClaudeSettings({ statusLine: { type: "command", command: "echo custom" } }, { threshold: 90, mode: "marker", force: false }),
    /--force/,
  );
});

test("force replaces unrelated statusLine", () => {
  const merged = installClaudeSettings(
    { statusLine: { type: "command", command: "echo custom" } },
    { threshold: 95, mode: "block", force: true },
  );
  assert.match(String((merged.statusLine as { command: string }).command), /AGENT_HANDOFF_THRESHOLD=95/);
});

test("uninstall removes only owned settings", () => {
  const installed = installClaudeSettings(
    {
      theme: "dark",
      hooks: {
        PreToolUse: [{ matcher: "Bash", hooks: [{ type: "command", command: "echo ok" }] }],
      },
    },
    { threshold: 90, mode: "warn", force: false },
  );
  const removed = uninstallClaudeSettings(installed);
  assert.equal(removed.theme, "dark");
  assert.equal(removed.statusLine, undefined);
  assert.deepEqual((removed.hooks as Record<string, unknown[]>).PreToolUse, [{ matcher: "Bash", hooks: [{ type: "command", command: "echo ok" }] }]);
  assert.equal((removed.hooks as Record<string, unknown[]>).UserPromptSubmit, undefined);
});

test("invalid JSON fails safely before writing", () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "agent-handoff-settings-"));
  const claude = path.join(home, ".claude");
  fs.mkdirSync(claude);
  const settings = path.join(claude, "settings.json");
  fs.writeFileSync(settings, "{ nope");

  assert.throws(
    () => updateClaudeSettingsOnDisk(home, (current) => current),
    /invalid JSON/,
  );
  assert.equal(fs.readFileSync(settings, "utf8"), "{ nope");
  fs.rmSync(home, { recursive: true, force: true });
});
