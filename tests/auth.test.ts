import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { userService } from "../src/services/user.services";

describe("Auth Routes (/api/auth)", () => {
  const app = createApp();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/auth/register", () => {
    const validRegisterData = {
      email: "newuser@example.com",
      firstName: "Jane",
      lastName: "Doe",
      password: "password123",
    };

    it("should return 400 when validation fails", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "invalid-email",
          firstName: "",
          password: "123",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          message: "Validation failed",
          errors: expect.any(Array),
        }),
      );
    });

    it("should return 409 if user with email already exists", async () => {
      vi.spyOn(userService, "findUserByEmail").mockResolvedValue({
        _id: "660000000000000000000001",
        email: validRegisterData.email,
      } as any);

      const response = await request(app)
        .post("/api/auth/register")
        .send(validRegisterData);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        success: false,
        message: "User with email already exist",
      });
    });

    it("should return 201 and user data on successful registration", async () => {
      vi.spyOn(userService, "findUserByEmail").mockResolvedValue(null);
      vi.spyOn(userService, "createUser").mockResolvedValue({
        _id: "660000000000000000000002",
        email: validRegisterData.email,
        firstName: validRegisterData.firstName,
        lastName: validRegisterData.lastName,
      } as any);

      const response = await request(app)
        .post("/api/auth/register")
        .send(validRegisterData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: "User created successfully",
        data: {
          id: "660000000000000000000002",
          email: validRegisterData.email,
          firstName: validRegisterData.firstName,
          lastName: validRegisterData.lastName,
        },
      });
    });
  });

  describe("POST /api/auth/login", () => {
    const validLoginData = {
      email: "jane@example.com",
      password: "password123",
    };

    it("should return 400 when login data fails validation", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "not-an-email",
          password: "short",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 when email does not exist", async () => {
      vi.spyOn(userService, "findUserByEmail").mockResolvedValue(null);

      const response = await request(app)
        .post("/api/auth/login")
        .send(validLoginData);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Invalid email or password",
      });
    });

    it("should return 401 when password is wrong", async () => {
      const mockUser = {
        _id: "660000000000000000000003",
        email: validLoginData.email,
        comparePassword: vi.fn().mockResolvedValue(false),
      };
      vi.spyOn(userService, "findUserByEmail").mockResolvedValue(mockUser as any);

      const response = await request(app)
        .post("/api/auth/login")
        .send(validLoginData);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Invalid email or password",
      });
    });

    it("should return 201 and a JWT token when login is successful", async () => {
      const mockUser = {
        _id: "660000000000000000000003",
        email: validLoginData.email,
        firstName: "Jane",
        lastName: "Doe",
        comparePassword: vi.fn().mockResolvedValue(true),
      };
      vi.spyOn(userService, "findUserByEmail").mockResolvedValue(mockUser as any);

      const response = await request(app)
        .post("/api/auth/login")
        .send(validLoginData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: "User logged in successfully",
        data: expect.objectContaining({
          id: mockUser._id,
          email: mockUser.email,
          firstName: "Jane",
          lastName: "Doe",
          token: expect.any(String),
        }),
      });
    });
  });
});
