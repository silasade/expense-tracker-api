import { describe, it, expect } from "vitest";
import { checkDatabaseBoundaries } from "../scripts/checkDbBoundary";

describe("Architectural Boundaries", () => {
  it("should enforce that only src/services/ interacts with database models directly", () => {
    const violations = checkDatabaseBoundaries();

    if (violations.length > 0) {
      const formattedErrors = violations
        .map(
          (v) =>
            `[${v.filePath}:${v.line}] ${v.content}\n  Rule violation: ${v.rule}`,
        )
        .join("\n\n");

      expect.fail(
        `Direct database interaction detected outside allowed layers:\n\n${formattedErrors}`,
      );
    }

    expect(violations).toHaveLength(0);
  });
});
