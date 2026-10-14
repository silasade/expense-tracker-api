import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../src/app";
import { userService } from "../src/services/user.services";
import { transactionService } from "../src/services/transaction.service";

describe("Transaction Routes (/api/transactions)", () => {
  const app = createApp();
  const secretKey = process.env.JWT_SECRET || "fallBackSecret";

  const mockUser = {
    _id: "660000000000000000000001",
    email: "silas@example.com",
    firstName: "Silas",
    lastName: "Ade",
  };

  const validToken = jwt.sign(
    { id: mockUser._id, email: mockUser.email },
    secretKey,
  );

  const authHeader = `Bearer ${validToken}`;

  const validTransactionId = "507f1f77bcf86cd799439011";

  const validTransactionPayload = {
    type: "expense",
    amount: 150.5,
    category: "Groceries",
    description: "Weekly supermarket shopping",
    date: "2026-10-14T10:00:00.000Z",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    // Default mock for authenticated user
    vi.spyOn(userService, "findUserById").mockResolvedValue(mockUser as any);
  });

  describe("Authentication Guard", () => {
    it("should reject requests without token with 401", async () => {
      const response = await request(app).get("/api/transactions");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Request must be Authorized",
      });
    });

    it("should reject requests with invalid token with 401", async () => {
      const response = await request(app)
        .get("/api/transactions")
        .set("Authorization", "Bearer invalid.token.value");

      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          message: "Invalid or expired token",
        }),
      );
    });
  });

  describe("POST /api/transactions", () => {
    it("should return 400 when body validation fails", async () => {
      const response = await request(app)
        .post("/api/transactions")
        .set("Authorization", authHeader)
        .send({
          type: "invalid_type",
          amount: -5,
          category: "",
          description: "",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it("should return 201 and created transaction on success", async () => {
      const createdTransaction = {
        _id: validTransactionId,
        ...validTransactionPayload,
        date: new Date(validTransactionPayload.date),
        user: mockUser._id,
      };

      const createSpy = vi
        .spyOn(transactionService, "createTransaction")
        .mockResolvedValue(createdTransaction as any);

      const response = await request(app)
        .post("/api/transactions")
        .set("Authorization", authHeader)
        .send(validTransactionPayload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: "Transaction created successfully",
        data: expect.objectContaining({
          _id: validTransactionId,
          amount: 150.5,
          category: "Groceries",
          type: "expense",
        }),
      });

      expect(createSpy).toHaveBeenCalledWith(
        mockUser._id,
        expect.objectContaining({
          amount: 150.5,
          category: "Groceries",
          type: "expense",
        }),
      );
    });
  });

  describe("GET /api/transactions", () => {
    it("should return 200 and list of all transactions for the user", async () => {
      const mockList = [
        {
          _id: validTransactionId,
          amount: 100,
          category: "Transport",
          description: "Cab",
          type: "expense",
          date: new Date("2026-10-10"),
        },
      ];

      const listSpy = vi
        .spyOn(transactionService, "getAllTransactions")
        .mockResolvedValue(mockList as any);

      const response = await request(app)
        .get("/api/transactions")
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Transactions fetched successfully",
        data: expect.any(Array),
      });
      expect(response.body.data).toHaveLength(1);
      expect(listSpy).toHaveBeenCalledWith(mockUser._id, {});
    });

    it("should pass query filters (type, minDate, maxDate) to service", async () => {
      const listSpy = vi
        .spyOn(transactionService, "getAllTransactions")
        .mockResolvedValue([]);

      const response = await request(app)
        .get(
          "/api/transactions?type=income&minDate=2026-01-01&maxDate=2026-12-31",
        )
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(listSpy).toHaveBeenCalledWith(
        mockUser._id,
        expect.objectContaining({
          type: "income",
          minDate: expect.any(Date),
          maxDate: expect.any(Date),
        }),
      );
    });

    it("should return 400 when query parameter is invalid", async () => {
      const response = await request(app)
        .get("/api/transactions?type=unknown_type")
        .set("Authorization", authHeader);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/transactions/:transactionId", () => {
    it("should return 400 when transactionId is not a valid ObjectId", async () => {
      const response = await request(app)
        .get("/api/transactions/invalid-id")
        .set("Authorization", authHeader);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");
    });

    it("should return 404 when transaction is not found", async () => {
      vi.spyOn(transactionService, "getTransactionById").mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/transactions/${validTransactionId}`)
        .set("Authorization", authHeader);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: "Transaction not found",
      });
    });

    it("should return 200 and transaction details on success", async () => {
      const mockTx = {
        _id: validTransactionId,
        amount: 250,
        category: "Utilities",
        description: "Electricity bill",
        type: "expense",
        date: new Date("2026-10-12"),
      };

      vi.spyOn(transactionService, "getTransactionById").mockResolvedValue(
        mockTx as any,
      );

      const response = await request(app)
        .get(`/api/transactions/${validTransactionId}`)
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Transaction fetched successfully",
        data: expect.objectContaining({
          _id: validTransactionId,
          amount: 250,
        }),
      });
    });
  });

  describe("PATCH /api/transactions/:transactionId", () => {
    it("should return 400 on invalid param or body", async () => {
      const response = await request(app)
        .patch("/api/transactions/invalid-id")
        .set("Authorization", authHeader)
        .send({ amount: -10 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 404 when transaction to update is not found", async () => {
      vi.spyOn(transactionService, "updateTransaction").mockResolvedValue(null);

      const response = await request(app)
        .patch(`/api/transactions/${validTransactionId}`)
        .set("Authorization", authHeader)
        .send({ amount: 99.9 });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: "Transaction not found",
      });
    });

    it("should return 200 and updated transaction on success", async () => {
      const updatedTx = {
        _id: validTransactionId,
        amount: 99.9,
        category: "Groceries",
        description: "Updated description",
        type: "expense",
      };

      const updateSpy = vi
        .spyOn(transactionService, "updateTransaction")
        .mockResolvedValue(updatedTx as any);

      const response = await request(app)
        .patch(`/api/transactions/${validTransactionId}`)
        .set("Authorization", authHeader)
        .send({ amount: 99.9, description: "Updated description" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Transaction updated successfully",
        data: expect.objectContaining({
          amount: 99.9,
          description: "Updated description",
        }),
      });

      expect(updateSpy).toHaveBeenCalledWith(
        mockUser._id,
        validTransactionId,
        expect.objectContaining({
          amount: 99.9,
          description: "Updated description",
        }),
      );
    });
  });

  describe("DELETE /api/transactions/:transactionId", () => {
    it("should return 400 on invalid transactionId param", async () => {
      const response = await request(app)
        .delete("/api/transactions/invalid-id")
        .set("Authorization", authHeader);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 404 when transaction to delete is not found", async () => {
      vi.spyOn(transactionService, "deleteTransactions").mockResolvedValue(null);

      const response = await request(app)
        .delete(`/api/transactions/${validTransactionId}`)
        .set("Authorization", authHeader);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: "Transaction not found",
      });
    });

    it("should return 200 when transaction is successfully deleted", async () => {
      const deletedTx = {
        _id: validTransactionId,
        user: mockUser._id,
      };

      const deleteSpy = vi
        .spyOn(transactionService, "deleteTransactions")
        .mockResolvedValue(deletedTx as any);

      const response = await request(app)
        .delete(`/api/transactions/${validTransactionId}`)
        .set("Authorization", authHeader);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Transaction deleted successfully",
      });

      expect(deleteSpy).toHaveBeenCalledWith(
        mockUser._id,
        validTransactionId,
      );
    });
  });
});
