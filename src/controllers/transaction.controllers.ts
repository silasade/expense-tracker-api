import { Response, NextFunction } from "express";
import { transactionService } from "../services/transaction.service";
import {
  CreateTransactionSchemaType,
  ListTransactionsSchemaType,
  TransactionIdSchemaType,
  UpdateTransactionSchemaType,
} from "../routes/transaction.routes";
import { AuthenticateRequest } from "../middlewares/validateUser.middlewares";
const createTransaction = async (
  req: AuthenticateRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = res.locals.validated as CreateTransactionSchemaType;
    const transaction = await transactionService.createTransaction(
      String(req.user!._id),
      body,
    );
    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (
  req: AuthenticateRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { transactionId } = req.params as TransactionIdSchemaType["params"];
    const transaction = await transactionService.getTransactionById(
      String(req.user?._id),
      transactionId,
    );
    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    return res.status(200).json({
      success: true,
      message: "Transaction fetched successfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (
  req: AuthenticateRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // In updateTransaction:
    const { params, body } = res.locals
      .validated as UpdateTransactionSchemaType;
    const { transactionId } = params;

    const transaction = await transactionService.updateTransaction(
      String(req.user?._id),
      transactionId,
      body,
    );
    if (!transaction) {
      res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
      return;
    }
    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const getAllTransactions = async (
  req: AuthenticateRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { query } = res.locals.validated as ListTransactionsSchemaType;
    const transactions = await transactionService.getAllTransactions(
      String(req.user?._id),
      query,
    );
    return res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (
  req: AuthenticateRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { params } = res.locals.validated as TransactionIdSchemaType;
    const { transactionId } = params;
    const transaction = await transactionService.deleteTransactions(
      String(req.user?._id),
      transactionId,
    );

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export {
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getAllTransactions,
};
