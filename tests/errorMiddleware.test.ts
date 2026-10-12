import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { errorHandler, type CustomError } from "../src/middlewares/error.middlewares";

describe("Error Handler Middleware", () => {
  const mockReq = {
    method: "GET",
    originalUrl: "/test-error",
  } as Request;

  const createMockRes = () => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  const mockNext = vi.fn() as unknown as NextFunction;

  it("should return the custom status code and error message", () => {
    const res = createMockRes();
    const customError: CustomError = new Error("Resource not found");
    customError.statusCode = 404;

    errorHandler(customError, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Resource not found",
      }),
    );
  });

  it("should default to status code 500 when statusCode is not provided", () => {
    const res = createMockRes();
    const genericError: CustomError = new Error("Database query failed");

    errorHandler(genericError, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Database query failed",
      }),
    );
  });
});
