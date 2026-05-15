import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Frontend Design Skill — vendored from Anthropic's Claude Code repo.
 * Source: https://raw.githubusercontent.com/anthropics/claude-code/main/plugins/frontend-design/skills/frontend-design/SKILL.md
 *
 * Loaded at module init via readFileSync because the .md file lives outside
 * the Next.js bundle. Server-side only — never imported from client code.
 */
export const FRONTEND_DESIGN_SKILL = readFileSync(
  path.join(process.cwd(), "lib/engine/frontend-design-skill.md"),
  "utf-8",
);
