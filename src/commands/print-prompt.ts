import { codexPrompt } from "../adapters/codex/prompt-template.js";
import { geminiPrompt } from "../adapters/gemini/prompt-template.js";

export function promptFor(adapter: string): string {
  if (adapter === "codex") return codexPrompt();
  if (adapter === "gemini") return geminiPrompt();
  throw new Error("print-prompt supports: codex, gemini");
}
