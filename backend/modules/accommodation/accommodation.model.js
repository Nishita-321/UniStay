import mongoose from "mongoose";

const accommodationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    visitorName: {
      type: String,
      required: [true, "Visitor name is required"],
      trim: true,
    },
    visitorRelation: {
      type: String,
      required: [true, "Relation is required"],
      enum: ["father", "mother", "guardian", "sibling", "other"],
    },
    visitorPhone: {
      type: String,
      required: [true, "Visitor phone is required"],
      match: [/^\d{10}$/, "Phone must be 10 digits"],
    },
    visitorIdProof: {
      type: String,
      trim: true,
    },
    fromDate: {
      type: Date,
      required: [true, "From date is required"],
    },
    toDate: {
      type: Date,
      required: [true, "To date is required"],
    },
    roomAssigned: {
      type: String,
      trim: true,
    },
    purpose: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);

accommodationSchema.index({ student: 1, status: 1 });

const Accommodation = mongoose.model("Accommodation", accommodationSchema);

export default Accommodation;
