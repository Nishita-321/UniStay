import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import Warden from "./warden.model.js";
import Student from "../student/student.model.js";
import Gatepass from "../gatepass/gatepass.model.js";
import Accommodation from "../accommodation/accommodation.model.js";
import Fee from "../fee/fee.model.js";

// ─── HELPER ─────────────────────────────────────────────────

const getWardenHostel = async (userId) => {
  const warden = await Warden.findById(userId);
  if (!warden || !warden.assignedHostel) {
    throw new ApiError(400, "You are not assigned to any hostel.");
  }
  return warden.assignedHostel;
};

// ─── STUDENTS ───────────────────────────────────────────────

export const getStudents = asyncHandler(async (req, res) => {
  const hostelId = await getWardenHostel(req.user._id);

  const { search, page = 1, limit = 20 } = req.query;
  const filter = { hostel: hostelId };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { rollNumber: { $regex: search, $options: "i" } },
    ];
  }

  const students = await Student.find(filter)
    .select("-password")
    .sort({ rollNumber: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Student.countDocuments(filter);

  res.json({
    success: true,
    data: { students, total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

// ─── GATEPASSES ─────────────────────────────────────────────

export const getGatepasses = asyncHandler(async (req, res) => {
  const hostelId = await getWardenHostel(req.user._id);

  const { status, page = 1, limit = 20 } = req.query;
  const filter = { hostel: hostelId };
  if (status) filter.status = status;

  const gatepasses = await Gatepass.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("student", "name rollNumber roomNumber phone");

  const total = await Gatepass.countDocuments(filter);

  res.json({
    success: true,
    data: { gatepasses, total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

export const updateGatepass = asyncHandler(async (req, res) => {
  const hostelId = await getWardenHostel(req.user._id);
  const { status, rejectionReason } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Status must be 'approved' or 'rejected'.");
  }

  const gatepass = await Gatepass.findOne({
    _id: req.params.id,
    hostel: hostelId,
  });

  if (!gatepass) {
    throw new ApiError(404, "Gatepass not found in your hostel.");
  }

  if (gatepass.status !== "pending") {
    throw new ApiError(400, `Gatepass is already ${gatepass.status}.`);
  }

  if (status === "rejected" && !rejectionReason) {
    throw new ApiError(400, "Rejection reason is required.");
  }

  gatepass.status = status;
  gatepass.approvedBy = req.user._id;
  gatepass.approvedAt = new Date();
  if (status === "rejected") gatepass.rejectionReason = rejectionReason;
  await gatepass.save();

  res.json({
    success: true,
    message: `Gatepass ${status}.`,
    data: { gatepass },
  });
});

// ─── ACCOMMODATION ──────────────────────────────────────────

export const getAccommodations = asyncHandler(async (req, res) => {
  const hostelId = await getWardenHostel(req.user._id);
  const studentIds = await Student.find({ hostel: hostelId }).distinct("_id");

  const { status } = req.query;
  const filter = { student: { $in: studentIds } };
  if (status) filter.status = status;

  const requests = await Accommodation.find(filter)
    .sort({ createdAt: -1 })
    .populate("student", "name rollNumber roomNumber");

  res.json({ success: true, data: { accommodations: requests } });
});

export const updateAccommodation = asyncHandler(async (req, res) => {
  const hostelId = await getWardenHostel(req.user._id);
  const studentIds = await Student.find({ hostel: hostelId }).distinct("_id");

  const { status, rejectionReason, roomAssigned } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Status must be 'approved' or 'rejected'.");
  }

  const request = await Accommodation.findOne({
    _id: req.params.id,
    student: { $in: studentIds },
  });

  if (!request) {
    throw new ApiError(404, "Accommodation request not found.");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, `Request is already ${request.status}.`);
  }

  request.status = status;
  request.approvedBy = req.user._id;
  request.approvedAt = new Date();
  if (status === "approved" && roomAssigned) request.roomAssigned = roomAssigned;
  if (status === "rejected") request.rejectionReason = rejectionReason;
  await request.save();

  res.json({
    success: true,
    message: `Accommodation request ${status}.`,
    data: { accommodation: request },
  });
});

// ─── FEES ───────────────────────────────────────────────────

export const getFees = asyncHandler(async (req, res) => {
  const hostelId = await getWardenHostel(req.user._id);
  const studentIds = await Student.find({ hostel: hostelId }).distinct("_id");

  const { status, type } = req.query;
  const filter = { student: { $in: studentIds } };
  if (status) filter.status = status;
  if (type) filter.type = type;

  const fees = await Fee.find(filter)
    .sort({ dueDate: 1 })
    .populate("student", "name rollNumber roomNumber");

  res.json({ success: true, data: { fees } });
});
