import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../src/middlewares/validateRequest.middlewares";

describe("Validate Request Middleware", () => {
  const testSchema = z.object({
    body: z.object({
      email: z.string().email("Invalid email format"),
      age: z.number().min(18, "Must be at least 18"),
    }),
  });

  const createMockRes = () => {
    const res = { locals: {} } as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it("should call next() when request data is valid", () => {
    const req = {
      body: { email: "user@example.com", age: 25 },
      query: {},
      params: {},
    } as unknown as Request;
    const res = createMockRes();
    const next = vi.fn() as unknown as NextFunction;

    const middleware = validate(testSchema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should store parsed (coerced and trimmed) data on res.locals.validated", () => {
    const coerceSchema = z.object({
      body: z.object({ name: z.string().trim() }),
      query: z.object({ from: z.coerce.date() }),
    });
    const req = {
      body: { name: "  Silas  " },
      query: { from: "2026-10-01" },
      params: {},
    } as unknown as Request;
    const res = createMockRes();
    const next = vi.fn() as unknown as NextFunction;

    validate(coerceSchema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.locals.validated.body.name).toBe("Silas");
    expect(res.locals.validated.query.from).toBeInstanceOf(Date);
  });

  it("should return 400 with formatted error details when validation fails", () => {
    const req = {
      body: { email: "not-an-email", age: 15 },
      query: {},
      params: {},
    } as unknown as Request;
    const res = createMockRes();
    const next = vi.fn() as unknown as NextFunction;

    const middleware = validate(testSchema);
    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
      errors: [
        { field: "body.email", message: "Invalid email format" },
        { field: "body.age", message: "Must be at least 18" },
      ],
    });
  });

  it("should pass unexpected non-Zod errors to next(error)", () => {
    const badSchema = {
      parse: () => {
        throw new Error("Unexpected error");
      },
    } as unknown as z.ZodSchema;

    const req = { body: {}, query: {}, params: {} } as Request;
    const res = createMockRes();
    const next = vi.fn() as unknown as NextFunction;

    const middleware = validate(badSchema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
  });
});
