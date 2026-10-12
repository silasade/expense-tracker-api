import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { validateUser } from "../src/middlewares/validateUser.middlewares";
import { userService } from "../src/services/user.services";

describe("Validate User Middleware", () => {
  const secretKey = process.env.JWT_SECRET || "fallBackSecret";

  const createMockRes = () => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return error when Authorization header is missing", async () => {
    const req = { headers: {} } as Request;
    const res = createMockRes();
    const next = vi.fn() as unknown as NextFunction;

    await validateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Request must be Authorized",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when token is invalid or expired", async () => {
    const req = {
      headers: {
        authorization: "Bearer invalid-token-string",
      },
    } as unknown as Request;
    const res = createMockRes();
    const next = vi.fn() as unknown as NextFunction;

    await validateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid or expired token",
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() and attach user to req when token and user are valid", async () => {
    const fakeUser = {
      _id: "660000000000000000000001",
      email: "silas@example.com",
      firstName: "Silas",
    };

    const validToken = jwt.sign(
      { id: fakeUser._id, email: fakeUser.email },
      secretKey,
    );

    const req = {
      headers: {
        authorization: `Bearer ${validToken}`,
      },
    } as unknown as Request;
    const res = createMockRes();
    const next = vi.fn() as unknown as NextFunction;

    vi.spyOn(userService, "findUserById").mockResolvedValue(fakeUser as any);

    await validateUser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((req as any).user).toEqual(fakeUser);
  });
});
