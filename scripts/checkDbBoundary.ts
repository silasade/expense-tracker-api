import fs from "node:fs";
import path from "node:path";

interface Violation {
  filePath: string;
  line: number;
  content: string;
  rule: string;
}

const SRC_DIR = path.resolve(process.cwd(), "src");

function getAllTsFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllTsFiles(fullPath));
    } else if (file.endsWith(".ts")) {
      results.push(fullPath);
    }
  }
  return results;
}

export function checkDatabaseBoundaries(): Violation[] {
  const violations: Violation[] = [];
  const files = getAllTsFiles(SRC_DIR);

  for (const filePath of files) {
    const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, "/");
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    const isServices = relativePath.startsWith("src/services/");
    const isModels = relativePath.startsWith("src/models/");
    const isDbConfig = relativePath === "src/config/db.ts";

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Skip comments
      if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
        return;
      }

      // Check 1: Direct mongoose import
      // Only src/models/** and src/config/db.ts are permitted to import mongoose directly
      const importsMongoose =
        /from\s+["']mongoose["']/.test(trimmed) ||
        /require\s*\(\s*["']mongoose["']\s*\)/.test(trimmed);

      if (importsMongoose && !isModels && !isDbConfig) {
        // Allow pure type imports: e.g. import type { ... } from "mongoose"
        const isTypeOnly = /^import\s+type\s+/.test(trimmed);
        if (!isTypeOnly) {
          violations.push({
            filePath: relativePath,
            line: index + 1,
            content: trimmed,
            rule: "Direct 'mongoose' database interaction is only allowed in src/models/ and src/config/db.ts.",
          });
        }
      }

      // Check 2: Direct model import
      // Only src/services/** and src/models/** are permitted to import database models
      const importsModel =
        /from\s+["'].*models\/.*["']/.test(trimmed) ||
        /require\s*\(\s*["'].*models\/.*["']\s*\)/.test(trimmed);

      if (importsModel && !isServices && !isModels) {
        // Allow pure type imports: e.g. import type { IUser } from "../models/User.models"
        const isTypeOnly = /^import\s+type\s+/.test(trimmed);
        if (!isTypeOnly) {
          violations.push({
            filePath: relativePath,
            line: index + 1,
            content: trimmed,
            rule: "Database models can only be imported and accessed directly from the service layer (src/services/).",
          });
        }
      }
    });
  }

  return violations;
}

// When executed directly as CLI script
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFilePath);
if (isMain) {
  console.log("🔍 Checking database architectural boundaries...");
  const violations = checkDatabaseBoundaries();

  if (violations.length > 0) {
    console.error("\n❌ Architectural Boundary Violation Detected!");
    console.error("Only the service layer (src/services/) is allowed to interact with the database directly.\n");

    violations.forEach((v) => {
      console.error(`  - ${v.filePath}:${v.line}`);
      console.error(`    ${v.content}`);
      console.error(`    Rule: ${v.rule}\n`);
    });

    process.exit(1);
  } else {
    console.log("✅ Architectural Boundary Check Passed: Only services interact with the database directly.\n");
    process.exit(0);
  }
}
