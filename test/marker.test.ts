import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { markHandoffNeeded } from "../src/core/marker.js";

test("marker and state are created", () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "agent-handoff-marker-"));
  const state = markHandoffNeeded({ cwd, reason: "test", triggeredBy: "unit", threshold: 90, usedPercentage: 91.2 });

  assert.equal(fs.existsSync(path.join(cwd, ".handoff-needed")), true);
  assert.equal(fs.existsSync(path.join(cwd, ".agent-handoff", "state.json")), true);
  const parsed = JSON.parse(fs.readFileSync(path.join(cwd, ".agent-handoff", "state.json"), "utf8"));
  assert.equal(parsed.needed, true);
  assert.equal(parsed.reason, "test");
  assert.equal(parsed.triggeredBy, "unit");
  assert.equal(parsed.usedPercentage, 91.2);
  assert.equal(state.cwd, cwd);

  fs.rmSync(cwd, { recursive: true, force: true });
});
