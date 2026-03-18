import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import Gatepass from "./gatepass.model.js";

// GET /api/security/gatepasses
export const getGatepasses = asyncHandler(async (req, res) => {
  const { status = "approved", search, page = 1, limit = 20 } = req.query;

  const filter = { status };

  const gatepasses = await Gatepass.find(filter)
    .sort({ fromDate: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("student", "name rollNumber phone hostel roomNumber")
    .populate("hostel", "name")
    .populate("approvedBy", "name");

  let results = gatepasses;
  if (search) {
    const searchLower = search.toLowerCase();
    results = gatepasses.filter(
      (g) =>
        g.student?.name?.toLowerCase().includes(searchLower) ||
        g.student?.rollNumber?.toLowerCase().includes(searchLower)
    );
  }

  const total = await Gatepass.countDocuments(filter);

  res.json({
    success: true,
    data: { gatepasses: results, total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

// GET /api/security/gatepasses/:id
export const getGatepassById = asyncHandler(async (req, res) => {
  const gatepass = await Gatepass.findById(req.params.id)
    .populate("student", "name rollNumber phone hostel roomNumber parentName parentPhone")
    .populate("hostel", "name")
    .populate("approvedBy", "name");

  if (!gatepass) {
    throw new ApiError(404, "Gatepass not found.");
  }

  res.json({ success: true, data: { gatepass } });
});

// PATCH /api/security/gatepasses/:id/out
export const markOut = asyncHandler(async (req, res) => {
  const gatepass = await Gatepass.findById(req.params.id);

  if (!gatepass) {
    throw new ApiError(404, "Gatepass not found.");
  }

  if (gatepass.status !== "approved") {
    throw new ApiError(400, "Only approved gatepasses can be used for check-out.");
  }

  if (gatepass.outTime) {
    throw new ApiError(400, "Student has already checked out.");
  }

  const now = new Date();
  if (now < new Date(gatepass.fromDate)) {
    throw new ApiError(400, "Gatepass is not yet valid. Check the from-date.");
  }

  gatepass.outTime = now;
  gatepass.outMarkedBy = req.user._id;
  await gatepass.save();

  res.json({
    success: true,
    message: "Student checked out successfully.",
    data: { gatepass },
  });
});

// PATCH /api/security/gatepasses/:id/in
export const markIn = asyncHandler(async (req, res) => {
  const gatepass = await Gatepass.findById(req.params.id);

  if (!gatepass) {
    throw new ApiError(404, "Gatepass not found.");
  }

  if (!gatepass.outTime) {
    throw new ApiError(400, "Student has not checked out yet.");
  }

  if (gatepass.inTime) {
    throw new ApiError(400, "Student has already checked in.");
  }

  gatepass.inTime = new Date();
  gatepass.inMarkedBy = req.user._id;
  await gatepass.save();

  const isLate = gatepass.inTime > new Date(gatepass.toDate);

  res.json({
    success: true,
    message: isLate
      ? "Student checked in (LATE — returned after gatepass expiry)."
      : "Student checked in successfully.",
    data: { gatepass, isLate },
  });
});

// GET /api/security/audit-log
export const getAuditLog = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  const logs = await Gatepass.find({
    $or: [{ outTime: { $exists: true } }, { inTime: { $exists: true } }],
  })
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("student", "name rollNumber")
    .populate("hostel", "name")
    .populate("outMarkedBy", "name")
    .populate("inMarkedBy", "name");

  res.json({ success: true, data: { logs } });
});
