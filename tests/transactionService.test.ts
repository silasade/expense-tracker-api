import { describe, it, expect, vi, beforeEach } from "vitest";
import { transactionService } from "../src/services/transaction.service";
import { Transaction } from "../src/models/Transaction.models";

describe("TransactionService Unit Tests", () => {
  const userId = "660000000000000000000001";
  const transactionId = "507f1f77bcf86cd799439011";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("createTransaction", () => {
    it("should create transaction with assigned userId", async () => {
      const body = {
        amount: 50,
        category: "Food",
        date: new Date("2026-10-14"),
        description: "Lunch",
        type: "expense" as const,
        currency: "USD",
      };

      const mockCreated = { _id: transactionId, ...body, user: userId };
      const createSpy = vi
        .spyOn(Transaction, "create")
        .mockResolvedValue(mockCreated as any);

      const result = await transactionService.createTransaction(userId, body);

      expect(createSpy).toHaveBeenCalledWith({
        amount: 50,
        category: "Food",
        date: body.date,
        description: "Lunch",
        type: "expense",
        currency: "USD",
        user: userId,
      });
      expect(result).toEqual(mockCreated);
    });
  });

  describe("getTransactionById", () => {
    it("should query by both _id and user", async () => {
      const mockTx = { _id: transactionId, user: userId, amount: 20 };
      const findOneSpy = vi
        .spyOn(Transaction, "findOne")
        .mockResolvedValue(mockTx as any);

      const result = await transactionService.getTransactionById(
        userId,
        transactionId,
      );

      expect(findOneSpy).toHaveBeenCalledWith({
        _id: transactionId,
        user: userId,
      });
      expect(result).toEqual(mockTx);
    });
  });

  describe("getAllTransactions", () => {
    it("should build query with userId only when no filters are provided", async () => {
      const sortMock = vi.fn().mockResolvedValue([]);
      const findSpy = vi
        .spyOn(Transaction, "find")
        .mockReturnValue({ sort: sortMock } as any);

      await transactionService.getAllTransactions(userId, {});

      expect(findSpy).toHaveBeenCalledWith({ user: userId });
      expect(sortMock).toHaveBeenCalledWith({ date: -1 });
    });

    it("should build query with type and date range filters ($gte, $lte)", async () => {
      const sortMock = vi.fn().mockResolvedValue([]);
      const findSpy = vi
        .spyOn(Transaction, "find")
        .mockReturnValue({ sort: sortMock } as any);

      const minDate = new Date("2026-01-01");
      const maxDate = new Date("2026-12-31");

      await transactionService.getAllTransactions(userId, {
        type: "income",
        minDate,
        maxDate,
      });

      expect(findSpy).toHaveBeenCalledWith({
        user: userId,
        type: "income",
        date: {
          $gte: minDate,
          $lte: maxDate,
        },
      });
      expect(sortMock).toHaveBeenCalledWith({ date: -1 });
    });
  });

  describe("updateTransaction", () => {
    it("should call findOneAndUpdate with user, id, $set, and validators enabled", async () => {
      const updateBody = { amount: 75, description: "Updated lunch" };
      const mockUpdated = { _id: transactionId, user: userId, ...updateBody };

      const updateSpy = vi
        .spyOn(Transaction, "findOneAndUpdate")
        .mockResolvedValue(mockUpdated as any);

      const result = await transactionService.updateTransaction(
        userId,
        transactionId,
        updateBody,
      );

      expect(updateSpy).toHaveBeenCalledWith(
        { user: userId, _id: transactionId },
        { $set: updateBody },
        { new: true, runValidators: true },
      );
      expect(result).toEqual(mockUpdated);
    });
  });

  describe("deleteTransactions", () => {
    it("should call findOneAndDelete scoped to user and transactionId", async () => {
      const mockDeleted = { _id: transactionId, user: userId };

      const deleteSpy = vi
        .spyOn(Transaction, "findOneAndDelete")
        .mockResolvedValue(mockDeleted as any);

      const result = await transactionService.deleteTransactions(
        userId,
        transactionId,
      );

      expect(deleteSpy).toHaveBeenCalledWith({
        user: userId,
        _id: transactionId,
      });
      expect(result).toEqual(mockDeleted);
    });
  });
});
