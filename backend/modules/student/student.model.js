import mongoose from "mongoose";
import User from "../user/user.model.js";

const studentSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: [true, "Roll number is required"],
    unique: true,
    trim: true,
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
  },
  roomNumber: {
    type: String,
    trim: true,
  },
  year: {
    type: Number,
    min: 1,
    max: 5,
  },
  department: {
    type: String,
    trim: true,
  },
  parentName: {
    type: String,
    trim: true,
  },
  parentPhone: {
    type: String,
    trim: true,
    match: [/^\d{10}$/, "Parent phone must be 10 digits"],
  },
  parentEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
  },
  messCardActive: {
    type: Boolean,
    default: false,
  },
});

// Student is a discriminator of User with role = "student"
const Student = User.discriminator("student", studentSchema);

export default Student;
