import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { initProject, START } from "../src/commands/init-project.js";

test("init-project inserts handoff block idempotently", () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "agent-handoff-init-"));
  fs.writeFileSync(path.join(cwd, "CLAUDE.md"), "# Project\n");

  initProject(cwd);
  initProject(cwd);
  const content = fs.readFileSync(path.join(cwd, "CLAUDE.md"), "utf8");

  assert.equal((content.match(new RegExp(START, "g")) ?? []).length, 1);
  assert.match(content, /At the beginning of each response/);

  fs.rmSync(cwd, { recursive: true, force: true });
});
