import { readFileSync } from "node:fs";
import path from "node:path";

export const FRONTEND_DESIGN_SKILL = readFileSync(
  path.join(process.cwd(), "lib/engine/frontend-design-skill.md"),
  "utf-8",
);
