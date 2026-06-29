import { markManual } from "../adapters/generic/manual.js";

export function runMark(cwd = process.cwd()) {
  return markManual(cwd);
}
