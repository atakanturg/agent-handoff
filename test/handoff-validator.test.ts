import test from "node:test";
import assert from "node:assert/strict";
import { HANDOFF_TEMPLATE } from "../src/core/handoff-schema.js";
import { validateHandoffMarkdown } from "../src/core/handoff-validator.js";

test("validator fails when required sections are missing", () => {
  const result = validateHandoffMarkdown("# Handoff\n\n## 1. Objective\nDone");
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("## 2. Current Status")));
});

test("validator accepts required sections and emits quality warnings", () => {
  const result = validateHandoffMarkdown(HANDOFF_TEMPLATE);
  assert.equal(result.ok, true);
  assert.ok(result.warnings.some((warning) => warning.includes("No changed files")));
  assert.ok(result.warnings.some((warning) => warning.includes("No commands")));
});

test("validator warns when tests pass are claimed without commands", () => {
  const result = validateHandoffMarkdown(`${HANDOFF_TEMPLATE}\nAll tests pass.`);
  assert.ok(result.warnings.some((warning) => warning.includes("claims tests pass")));
});
