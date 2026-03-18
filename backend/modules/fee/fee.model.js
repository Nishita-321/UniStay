import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    type: {
      type: String,
      enum: ["hostel", "mess", "fine", "other"],
      required: [true, "Fee type is required"],
    },
    description: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    paidAt: Date,
    transactionId: {
      type: String,
      trim: true,
    },
    semester: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

feeSchema.index({ student: 1, status: 1 });
feeSchema.index({ type: 1, status: 1 });

const Fee = mongoose.model("Fee", feeSchema);

export default Fee;
