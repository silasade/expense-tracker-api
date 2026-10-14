import { Transaction } from "../models/Transaction.models";
import {
  CreateTransactionSchemaType,
  ListTransactionsSchemaType,
  TransactionIdSchemaType,
  UpdateTransactionSchemaType,
} from "../routes/transaction.routes";

class TransactionService {
  public getAllTransactions = async (
    userId: string,
    query: ListTransactionsSchemaType["query"],
  ) => {
    const { maxDate, minDate, type } = query;
    const filter: any = { user: userId };
    if (minDate || maxDate) {
      filter.date = {};
      if (maxDate) {
        filter.date.$lte = maxDate;
      }
      if (minDate) {
        filter.date.$gte = minDate;
      }
    }
    if (type) {
      filter.type = type;
    }
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    return transactions;
  };
  public deleteTransactions = async (
    userId: string,
    transactionId: TransactionIdSchemaType["params"]["transactionId"],
  ) => {
   const transaction= await Transaction.findOneAndDelete({
      user: userId,
      _id: transactionId,
    });
    return transaction
  };
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
