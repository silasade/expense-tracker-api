import {  Response, NextFunction } from "express";
import { transactionService } from "../services/transaction.service";
import { CreateTransactionSchemaType } from "../routes/transaction.routes";
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
      success:true,
      message:"Transaction created successfully",
      data:transaction
    })
  } catch (error) {
    next(error);
  }
};

export { createTransaction };
