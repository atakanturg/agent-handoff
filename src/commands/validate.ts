import { validateHandoffFile } from "../core/handoff-validator.js";

export function runValidate(file: string) {
  return validateHandoffFile(file);
}
