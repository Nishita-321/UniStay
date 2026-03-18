import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hostel name is required"],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["boys", "girls"],
      required: [true, "Hostel type is required"],
    },
    totalRooms: {
      type: Number,
      required: true,
      min: 1,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    occupancy: {
      type: Number,
      default: 0,
      min: 0,
    },
    warden: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    address: {
      type: String,
      trim: true,
    },
    facilities: [{ type: String, trim: true }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Hostel = mongoose.model("Hostel", hostelSchema);

export default Hostel;
