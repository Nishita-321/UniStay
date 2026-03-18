import mongoose from "mongoose";

const gatepassSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ["day", "overnight", "emergency"],
      default: "day",
    },
    fromDate: {
      type: Date,
      required: [true, "From date is required"],
    },
    toDate: {
      type: Date,
      required: [true, "To date is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
    rejectionReason: {
      type: String,
      trim: true,
    },
    // Security gate tracking
    outTime: Date,
    inTime: Date,
    outMarkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    inMarkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Index for efficient queries
gatepassSchema.index({ student: 1, status: 1 });
gatepassSchema.index({ hostel: 1, status: 1 });

const Gatepass = mongoose.model("Gatepass", gatepassSchema);

export default Gatepass;
