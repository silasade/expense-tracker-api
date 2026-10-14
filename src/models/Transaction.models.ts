import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: "income" | "expense";
  amount: number;
  currency?: string;
  category: string;
  description: string;
  date: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    type: {
      required: [true, "Type is required"],
      type: String,
      trim: true,
      enum: {
        values: ["income", "expense"],
        message: "Type must be either income or expense",
      },
    },
    amount: {
      required: [true, "Amount is required"],
      type: Number,
      trim: true,
      min: [0.01, "Amount must be greater than 0"],
    },
    category: {
      required: [true, "Category is required"],
      type: String,
      trim: true,
    },
    currency: {
      required: [false],
      type: String,
      default: "NGN",
    },
    date: {
      required: [true, "Date transaction was made is required"],
      type: Date,
      trim: true,
    },
    description: {
      required: [
        true,
        "Description of transaction is required for better summary",
      ],
      type: String,
      trim: true,
    },
    user: {
      required: [true, "User ID is required"],
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);
transactionSchema.index({ user: 1, date: -1 });
export const TransactionModel = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema,
);
