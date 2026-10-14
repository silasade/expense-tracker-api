import z from "zod";
import express from "express";
import { validate } from "../middlewares/validateRequest.middlewares";
import { validateUser } from "../middlewares/validateUser.middlewares";
import {
  createTransaction,
  getTransactionById,
  updateTransaction,
} from "../controllers/transaction.controllers";
const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid transaction id");

const transactionBody = z.object({
  type: z.enum(["income", "expense"], {
    error: "Type must be either income or expense",
  }),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  currency: z.currencyCode().optional(),
  category: z.string().trim().min(1, "Category is required"),
  description: z.string().trim().min(1, "Description is required"),
  date: z.coerce.date({ error: "Enter a valid date" }),
});

// POST /transactions
export const createTransactionSchema = z.object({ body: transactionBody });

// PATCH /transactions/:transactionId
export const updateTransactionSchema = z.object({
  params: z.object({ transactionId: objectId }),
  body: transactionBody.partial(),
});

// GET / DELETE /transactions/:transactionId
export const transactionIdSchema = z.object({
  params: z.object({ transactionId: objectId }),
});

// GET /transactions?type=expense&minDate=...&maxDate=...
export const listTransactionsSchema = z.object({
  query: z.object({
    type: z.enum(["income", "expense"]).optional(),
    minDate: z.coerce.date().optional(),
    maxDate: z.coerce.date().optional(),
  }),
});

export type CreateTransactionSchemaType = z.infer<
  typeof createTransactionSchema
>;
export type UpdateTransactionSchemaType = z.infer<
  typeof updateTransactionSchema
>;
export type TransactionIdSchemaType = z.infer<typeof transactionIdSchema>;
export type ListTransactionsSchemaType = z.infer<typeof listTransactionsSchema>;

const router = express.Router();

router.get(
  `/:transactionId`,
  validateUser,
  validate(transactionIdSchema),
  getTransactionById,
);
router.patch(
  `/:transactionId`,
  validateUser,
  validate(updateTransactionSchema),
  updateTransaction,
);
router.post(
  "/",
  validateUser,
  validate(createTransactionSchema),
  createTransaction,
);

export default router;
