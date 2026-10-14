import { Transaction } from "../models/Transaction.models";
import { CreateTransactionSchemaType } from "../routes/transaction.routes";

class TransactionService {
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
}

export const transactionService = new TransactionService();
