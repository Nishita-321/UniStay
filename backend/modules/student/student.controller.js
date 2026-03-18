import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import Student from "./student.model.js";
import Gatepass from "../gatepass/gatepass.model.js";
import Accommodation from "../accommodation/accommodation.model.js";
import Fee from "../fee/fee.model.js";

// ─── PROFILE ────────────────────────────────────────────────

export const getProfile = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.user._id).populate("hostel");
  res.json({ success: true, data: { student } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["phone", "parentName", "parentPhone", "parentEmail", "address"];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const student = await Student.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).populate("hostel");

  res.json({ success: true, data: { student } });
});

// ─── GATEPASSES ─────────────────────────────────────────────

export const applyGatepass = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.user._id);
  if (!student.hostel) {
    throw new ApiError(400, "You are not assigned to any hostel.");
  }

  const { reason, type, fromDate, toDate } = req.body;

  if (!reason || !fromDate || !toDate) {
    throw new ApiError(400, "Reason, fromDate, and toDate are required.");
  }

  if (new Date(fromDate) >= new Date(toDate)) {
    throw new ApiError(400, "fromDate must be before toDate.");
  }

  if (new Date(fromDate) < new Date()) {
    throw new ApiError(400, "fromDate cannot be in the past.");
  }

  // Check for overlapping pending/approved gatepasses
  const overlap = await Gatepass.findOne({
    student: req.user._id,
    status: { $in: ["pending", "approved"] },
    $or: [
      { fromDate: { $lte: new Date(toDate) }, toDate: { $gte: new Date(fromDate) } },
    ],
  });

  if (overlap) {
    throw new ApiError(409, "You already have an active or pending gatepass for this period.");
  }

  const gatepass = await Gatepass.create({
    student: req.user._id,
    hostel: student.hostel,
    reason,
    type: type || "day",
    fromDate,
    toDate,
  });

  res.status(201).json({
    success: true,
    message: "Gatepass application submitted.",
    data: { gatepass },
  });
});

export const getGatepasses = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { student: req.user._id };
  if (status) filter.status = status;

  const gatepasses = await Gatepass.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("approvedBy", "name");

  const total = await Gatepass.countDocuments(filter);

  res.json({
    success: true,
    data: { gatepasses, total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

// ─── PARENT ACCOMMODATION ───────────────────────────────────

export const applyAccommodation = asyncHandler(async (req, res) => {
  const { visitorName, visitorRelation, visitorPhone, visitorIdProof, fromDate, toDate, purpose } =
    req.body;

  if (!visitorName || !visitorRelation || !visitorPhone || !fromDate || !toDate) {
    throw new ApiError(400, "Visitor name, relation, phone, fromDate, and toDate are required.");
  }

  if (new Date(fromDate) >= new Date(toDate)) {
    throw new ApiError(400, "fromDate must be before toDate.");
  }

  const accommodation = await Accommodation.create({
    student: req.user._id,
    visitorName,
    visitorRelation,
    visitorPhone,
    visitorIdProof,
    fromDate,
    toDate,
    purpose,
  });

  res.status(201).json({
    success: true,
    message: "Accommodation request submitted.",
    data: { accommodation },
  });
});

export const getAccommodations = asyncHandler(async (req, res) => {
  const requests = await Accommodation.find({ student: req.user._id })
    .sort({ createdAt: -1 })
    .populate("approvedBy", "name");

  res.json({ success: true, data: { accommodations: requests } });
});

// ─── FEES ───────────────────────────────────────────────────

export const getFees = asyncHandler(async (req, res) => {
  const { status, type } = req.query;
  const filter = { student: req.user._id };
  if (status) filter.status = status;
  if (type) filter.type = type;

  const fees = await Fee.find(filter).sort({ dueDate: 1 });

  const totalPending = fees
    .filter((f) => f.status !== "paid")
    .reduce((sum, f) => sum + f.amount, 0);

  res.json({ success: true, data: { fees, totalPending } });
});

export const payFee = asyncHandler(async (req, res) => {
  const fee = await Fee.findOne({ _id: req.params.id, student: req.user._id });

  if (!fee) {
    throw new ApiError(404, "Fee not found.");
  }

  if (fee.status === "paid") {
    throw new ApiError(400, "This fee is already paid.");
  }

  fee.status = "paid";
  fee.paidAt = new Date();
  fee.transactionId = req.body?.transactionId || `TXN_${Date.now()}`;
  await fee.save();

  res.json({ success: true, message: "Fee paid successfully.", data: { fee } });
});
