import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import { generateToken } from "../../utils/jwt.js";
import User from "../user/user.model.js";
import Student from "../student/student.model.js";
import Warden from "../warden/warden.model.js";
import Hostel from "../hostel/hostel.model.js";
import Gatepass from "../gatepass/gatepass.model.js";
import Accommodation from "../accommodation/accommodation.model.js";
import Fee from "../fee/fee.model.js";

// ═══════════════════════════════════════════════════════════
// USER CREATION (Admin-only registration)
// ═══════════════════════════════════════════════════════════

// Helper to create a single user based on role
const createUserByRole = async (userData) => {
  const { name, email, password, role, phone, ...extra } = userData;

  if (!name || !email || !password || !role) {
    throw new ApiError(400, "Name, email, password, and role are required.");
  }

  const validRoles = ["student", "warden", "security", "admin"];
  if (!validRoles.includes(role)) {
    throw new ApiError(400, `Invalid role. Must be one of: ${validRoles.join(", ")}`);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, `User with email '${email}' already exists.`);
  }

  let user;

  if (role === "student") {
    const { rollNumber, department, year, parentName, parentPhone, parentEmail, address, hostel, roomNumber } = extra;
    if (!rollNumber) throw new ApiError(400, "Roll number is required for students.");

    user = await Student.create({
      name, email, password, role, phone,
      rollNumber, department, year, parentName, parentPhone, parentEmail, address, hostel, roomNumber,
    });
  } else if (role === "warden") {
    const { employeeId, assignedHostel } = extra;
    user = await Warden.create({ name, email, password, role, phone, employeeId, assignedHostel });
  } else {
    user = await User.create({ name, email, password, role, phone });
  }

  return user;
};

// POST /api/admin/users — Create a single user
export const createUser = asyncHandler(async (req, res) => {
  const user = await createUserByRole(req.body);

  res.status(201).json({
    success: true,
    message: `${user.role} user created successfully.`,
    data: { user },
  });
});

// POST /api/admin/users/bulk — Create multiple users at once
export const createUsersBulk = asyncHandler(async (req, res) => {
  const { users } = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    throw new ApiError(400, "Provide an array of users in the 'users' field.");
  }

  if (users.length > 100) {
    throw new ApiError(400, "Maximum 100 users can be created at once.");
  }

  // Check for duplicate emails within the batch
  const emails = users.map((u) => u.email?.toLowerCase());
  const uniqueEmails = new Set(emails);
  if (uniqueEmails.size !== emails.length) {
    throw new ApiError(400, "Duplicate emails found within the batch.");
  }

  // Check for existing emails in the database
  const existingUsers = await User.find({ email: { $in: emails } }).select("email");
  if (existingUsers.length > 0) {
    const existingEmails = existingUsers.map((u) => u.email);
    throw new ApiError(
      409,
      `The following emails already exist: ${existingEmails.join(", ")}`
    );
  }

  const created = [];
  const errors = [];

  for (let i = 0; i < users.length; i++) {
    try {
      const user = await createUserByRole(users[i]);
      created.push(user);
    } catch (error) {
      errors.push({
        index: i,
        email: users[i].email,
        error: error.message,
      });
    }
  }

  res.status(201).json({
    success: true,
    message: `${created.length} of ${users.length} users created successfully.`,
    data: {
      created: created.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    },
  });
});

// ═══════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════

export const getUsers = asyncHandler(async (req, res) => {
  const { role, search, isActive, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: { users, total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");
  res.json({ success: true, data: { user } });
});

export const updateUser = asyncHandler(async (req, res) => {
  // Prevent password changes through this route
  const { password, ...updates } = req.body;

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new ApiError(404, "User not found.");
  res.json({ success: true, data: { user } });
});

export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!user) throw new ApiError(404, "User not found.");
  res.json({ success: true, message: "User deactivated.", data: { user } });
});

export const activateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true }
  );
  if (!user) throw new ApiError(404, "User not found.");
  res.json({ success: true, message: "User activated.", data: { user } });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");
  res.json({ success: true, message: "User deleted permanently." });
});

// ═══════════════════════════════════════════════════════════
// STUDENTS
// ═══════════════════════════════════════════════════════════

export const getStudents = asyncHandler(async (req, res) => {
  const { hostel, search, page = 1, limit = 20 } = req.query;
  const filter = { role: "student" };

  if (hostel) filter.hostel = hostel;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { rollNumber: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const students = await Student.find(filter)
    .populate("hostel", "name type")
    .sort({ rollNumber: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Student.countDocuments(filter);

  res.json({
    success: true,
    data: { students, total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

export const assignHostel = asyncHandler(async (req, res) => {
  const { hostelId, roomNumber } = req.body;

  const hostel = await Hostel.findById(hostelId);
  if (!hostel) throw new ApiError(404, "Hostel not found.");
  if (hostel.occupancy >= hostel.capacity) {
    throw new ApiError(400, "Hostel is at full capacity.");
  }

  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { hostel: hostelId, roomNumber },
    { new: true }
  ).populate("hostel", "name");

  if (!student) throw new ApiError(404, "Student not found.");

  hostel.occupancy += 1;
  await hostel.save();

  res.json({ success: true, data: { student } });
});

// ═══════════════════════════════════════════════════════════
// HOSTELS
// ═══════════════════════════════════════════════════════════

export const createHostel = asyncHandler(async (req, res) => {
  const hostel = await Hostel.create(req.body);
  res.status(201).json({ success: true, data: { hostel } });
});

export const getHostels = asyncHandler(async (req, res) => {
  const hostels = await Hostel.find()
    .populate("warden", "name email")
    .sort({ name: 1 });
  res.json({ success: true, data: { hostels } });
});

export const getHostelById = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findById(req.params.id).populate("warden", "name email phone");
  if (!hostel) throw new ApiError(404, "Hostel not found.");

  const studentCount = await Student.countDocuments({ hostel: req.params.id });
  res.json({ success: true, data: { hostel, studentCount } });
});

export const updateHostel = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!hostel) throw new ApiError(404, "Hostel not found.");
  res.json({ success: true, data: { hostel } });
});

export const deleteHostel = asyncHandler(async (req, res) => {
  const studentCount = await Student.countDocuments({ hostel: req.params.id });
  if (studentCount > 0) {
    throw new ApiError(400, "Cannot delete hostel with assigned students. Reassign them first.");
  }

  const hostel = await Hostel.findByIdAndDelete(req.params.id);
  if (!hostel) throw new ApiError(404, "Hostel not found.");
  res.json({ success: true, message: "Hostel deleted." });
});

export const assignWarden = asyncHandler(async (req, res) => {
  const { wardenId } = req.body;

  const warden = await Warden.findById(wardenId);
  if (!warden) throw new ApiError(404, "Warden not found.");

  const hostel = await Hostel.findByIdAndUpdate(
    req.params.id,
    { warden: wardenId },
    { new: true }
  ).populate("warden", "name email");

  if (!hostel) throw new ApiError(404, "Hostel not found.");

  warden.assignedHostel = hostel._id;
  await warden.save();

  res.json({ success: true, data: { hostel } });
});

// ═══════════════════════════════════════════════════════════
// GATEPASSES
// ═══════════════════════════════════════════════════════════

export const getGatepasses = asyncHandler(async (req, res) => {
  const { status, hostel, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (hostel) filter.hostel = hostel;

  const gatepasses = await Gatepass.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("student", "name rollNumber")
    .populate("hostel", "name")
    .populate("approvedBy", "name");

  const total = await Gatepass.countDocuments(filter);
  res.json({
    success: true,
    data: { gatepasses, total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

export const deleteGatepass = asyncHandler(async (req, res) => {
  const gatepass = await Gatepass.findByIdAndDelete(req.params.id);
  if (!gatepass) throw new ApiError(404, "Gatepass not found.");
  res.json({ success: true, message: "Gatepass deleted." });
});

// ═══════════════════════════════════════════════════════════
// FEES & FINES
// ═══════════════════════════════════════════════════════════

export const createFee = asyncHandler(async (req, res) => {
  const { student, type, description, amount, dueDate, semester } = req.body;

  if (!student || !type || !amount || !dueDate) {
    throw new ApiError(400, "Student, type, amount, and dueDate are required.");
  }

  const studentExists = await Student.findById(student);
  if (!studentExists) throw new ApiError(404, "Student not found.");

  const fee = await Fee.create({
    student, type, description, amount, dueDate, semester,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: { fee } });
});

export const createFeesBulk = asyncHandler(async (req, res) => {
  const { hostelId, type, description, amount, dueDate, semester } = req.body;

  if (!hostelId || !type || !amount || !dueDate) {
    throw new ApiError(400, "hostelId, type, amount, and dueDate are required.");
  }

  const students = await Student.find({ hostel: hostelId }).select("_id");
  if (students.length === 0) {
    throw new ApiError(404, "No students found in this hostel.");
  }

  const fees = await Fee.insertMany(
    students.map((s) => ({
      student: s._id,
      type,
      description,
      amount,
      dueDate,
      semester,
      createdBy: req.user._id,
    }))
  );

  res.status(201).json({
    success: true,
    message: `${fees.length} fee records created.`,
    data: { count: fees.length },
  });
});

export const getFees = asyncHandler(async (req, res) => {
  const { status, type, student, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (student) filter.student = student;

  const fees = await Fee.find(filter)
    .sort({ dueDate: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("student", "name rollNumber")
    .populate("createdBy", "name");

  const total = await Fee.countDocuments(filter);
  res.json({
    success: true,
    data: { fees, total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

export const updateFee = asyncHandler(async (req, res) => {
  const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!fee) throw new ApiError(404, "Fee not found.");
  res.json({ success: true, data: { fee } });
});

export const deleteFee = asyncHandler(async (req, res) => {
  const fee = await Fee.findByIdAndDelete(req.params.id);
  if (!fee) throw new ApiError(404, "Fee not found.");
  res.json({ success: true, message: "Fee record deleted." });
});

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════

export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalStudents,
    totalWardens,
    totalHostels,
    pendingGatepasses,
    pendingAccommodation,
    pendingFees,
    totalFeesPending,
  ] = await Promise.all([
    Student.countDocuments({ isActive: true }),
    Warden.countDocuments({ isActive: true }),
    Hostel.countDocuments({ isActive: true }),
    Gatepass.countDocuments({ status: "pending" }),
    Accommodation.countDocuments({ status: "pending" }),
    Fee.countDocuments({ status: { $in: ["pending", "overdue"] } }),
    Fee.aggregate([
      { $match: { status: { $in: ["pending", "overdue"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalStudents,
      totalWardens,
      totalHostels,
      pendingGatepasses,
      pendingAccommodation,
      pendingFees,
      totalFeesPendingAmount: totalFeesPending[0]?.total || 0,
    },
  });
});
