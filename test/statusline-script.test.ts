import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { statuslineScriptTemplate } from "../src/adapters/claude-code/statusline-template.js";

function makeScript(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-handoff-script-"));
  const script = path.join(dir, "statusline-handoff-watch.sh");
  const content = statuslineScriptTemplate();
  assert.equal(content.includes("jq "), false);
  fs.writeFileSync(script, content);
  fs.chmodSync(script, 0o755);
  return script;
}

function run(script: string, input: unknown, env: Record<string, string> = {}): string {
  return execFileSync(script, {
    input: JSON.stringify(input),
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

test("statusline script creates marker and state above threshold", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "agent-handoff-proj-"));
  const script = makeScript();

  const output = run(script, {
    workspace: { current_dir: project },
    context_window: { used_percentage: 91.2 },
  });

  assert.match(output, /ctx:91.2% handoff:needed/);
  assert.equal(fs.existsSync(path.join(project, ".handoff-needed")), true);
  assert.equal(fs.existsSync(path.join(project, ".agent-handoff", "state.json")), true);
  const state = JSON.parse(fs.readFileSync(path.join(project, ".agent-handoff", "state.json"), "utf8"));
  assert.equal(state.usedPercentage, 91.2);
  assert.equal(state.threshold, 90);

  fs.rmSync(project, { recursive: true, force: true });
  fs.rmSync(path.dirname(script), { recursive: true, force: true });
});

test("statusline script does nothing below threshold", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "agent-handoff-proj-"));
  const script = makeScript();

  run(script, {
    workspace: { current_dir: project },
    context_window: { used_percentage: 50 },
  });

  assert.equal(fs.existsSync(path.join(project, ".handoff-needed")), false);
  assert.equal(fs.existsSync(path.join(project, ".agent-handoff", "state.json")), false);

  fs.rmSync(project, { recursive: true, force: true });
  fs.rmSync(path.dirname(script), { recursive: true, force: true });
});

test("statusline script does nothing with missing cwd or missing context percentage", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "agent-handoff-proj-"));
  const script = makeScript();

  run(script, { context_window: { used_percentage: 99 } });
  run(script, { workspace: { current_dir: project } });

  assert.equal(fs.existsSync(path.join(project, ".handoff-needed")), false);
  assert.equal(fs.existsSync(path.join(project, ".agent-handoff", "state.json")), false);

  fs.rmSync(project, { recursive: true, force: true });
  fs.rmSync(path.dirname(script), { recursive: true, force: true });
});

test("statusline script does not overwrite handoff.md", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "agent-handoff-proj-"));
  const script = makeScript();
  const handoff = path.join(project, "handoff.md");
  fs.writeFileSync(handoff, "keep me");

  run(script, {
    workspace: { current_dir: project },
    context_window: { used_percentage: 99 },
  });

  assert.equal(fs.readFileSync(handoff, "utf8"), "keep me");

  fs.rmSync(project, { recursive: true, force: true });
  fs.rmSync(path.dirname(script), { recursive: true, force: true });
});
