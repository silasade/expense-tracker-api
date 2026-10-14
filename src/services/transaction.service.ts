import { Transaction } from "../models/Transaction.models";
import {
  CreateTransactionSchemaType,
  TransactionIdSchemaType,
  UpdateTransactionSchemaType,
} from "../routes/transaction.routes";

class TransactionService {
  public getTransactionById = async (
    userId: string,
    transactionId: TransactionIdSchemaType["params"]["transactionId"],
  ) => {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      user: userId,
    });
    return transaction;
  };
  public createTransaction = async (
    userId: string,
    body: CreateTransactionSchemaType["body"],
  ) => {
    const { amount, category, date, description, type, currency } = body;
    const transaction = await Transaction.create({
      amount,
      category,
      date,
      description,
      type,
      currency,
      user: userId,
    });
    return transaction;
  };
  public updateTransaction = async (
    userId: string,
    transactionId: UpdateTransactionSchemaType["params"]["transactionId"],
    body: UpdateTransactionSchemaType["body"],
  ) => {
    const transaction = await Transaction.findOneAndUpdate(
      { user: userId, _id: transactionId },
      { $set: body },
      { new: true, runValidators: true },
    );

    return transaction;
  };
}

export const transactionService = new TransactionService();
