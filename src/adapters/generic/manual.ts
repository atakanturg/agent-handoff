import { markHandoffNeeded } from "../../core/marker.js";

export function markManual(cwd = process.cwd()) {
  return markHandoffNeeded({
    cwd,
    reason: "manual handoff requested",
    triggeredBy: "generic-manual",
  });
}
