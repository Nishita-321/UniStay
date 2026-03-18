import mongoose from "mongoose";
import User from "../user/user.model.js";

const wardenSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
    trim: true,
  },
  assignedHostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
  },
});

// Warden is a discriminator of User with role = "warden"
const Warden = User.discriminator("warden", wardenSchema);

export default Warden;
