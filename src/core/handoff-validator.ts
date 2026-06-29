import fs from "node:fs";
import { REQUIRED_SECTIONS } from "./handoff-schema.js";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

function sectionBody(markdown: string, heading: string): string {
  const start = markdown.indexOf(heading);
  if (start === -1) return "";
  const after = markdown.slice(start + heading.length);
  const next = after.search(/\n#{1,2} /);
  return (next === -1 ? after : after.slice(0, next)).trim();
}

function tableHasData(body: string): boolean {
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .some((line) => line.startsWith("|") && !/^\|\s*-+/.test(line) && !/File\s*\|/.test(line) && !/Command\s*\|/.test(line));
}

function hasConcreteList(body: string): boolean {
  return body.split(/\r?\n/).some((line) => /^\s*(?:[-*]|\d+\.)\s+\S/.test(line) && !/:\s*$/.test(line.trim()));
}

export function validateHandoffMarkdown(markdown: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const heading of REQUIRED_SECTIONS) {
    if (!markdown.includes(heading)) errors.push(`Missing required section: ${heading}`);
  }

  const files = sectionBody(markdown, "## 4. Files Changed");
  const commands = sectionBody(markdown, "## 7. Commands Run");
  const blockers = sectionBody(markdown, "## 8. Known Errors / Blockers");
  const nextSteps = sectionBody(markdown, "## 9. Next Steps");
  const doNotDo = sectionBody(markdown, "## 10. Do Not Do");
  const verification = sectionBody(markdown, "## 11. Verification Plan");
  const prompt = sectionBody(markdown, "## 12. Suggested Prompt For Next Agent");

  if (files && !tableHasData(files)) warnings.push("No changed files are listed.");
  if (commands && !tableHasData(commands)) warnings.push("No commands are listed.");
  if (nextSteps && !hasConcreteList(nextSteps)) warnings.push("No ordered next steps are listed.");
  if (!prompt || prompt.length < 40) warnings.push("No suggested next-agent prompt exists.");
  if (!blockers || blockers.length < 10) warnings.push("Handoff lacks blockers/known errors section detail.");
  if (!doNotDo || doNotDo.length < 10) warnings.push("Handoff lacks Do Not Do section detail.");
  if (/tests?\s+(?:pass|passed|passing)|all\s+checks\s+pass/i.test(markdown) && (!commands || !tableHasData(commands))) {
    warnings.push("Handoff claims tests pass without listing verification commands.");
  }
  if (verification && !hasConcreteList(verification) && !/`[^`]+`/.test(verification)) {
    warnings.push("Verification plan lacks concrete commands/checks.");
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function validateHandoffFile(file: string): ValidationResult {
  return validateHandoffMarkdown(fs.readFileSync(file, "utf8"));
}
