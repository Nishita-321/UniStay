import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import {
  // User creation
  createUser,
  createUsersBulk,
  // Users CRUD
  getUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  deleteUser,
  // Students
  getStudents,
  assignHostel,
  // Hostels
  createHostel,
  getHostels,
  getHostelById,
  updateHostel,
  deleteHostel,
  assignWarden,
  // Gatepasses
  getGatepasses,
  deleteGatepass,
  // Fees
  createFee,
  createFeesBulk,
  getFees,
  updateFee,
  deleteFee,
  // Dashboard
  getDashboard,
} from "./admin.controller.js";

const router = Router();

// All routes require admin authentication
router.use(authenticate, authorize("admin"));

// ─── USER CREATION ──────────────────────────────────────────
router.post("/users", createUser);
router.post("/users/bulk", createUsersBulk);

// ─── USERS CRUD ─────────────────────────────────────────────
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id", updateUser);
router.patch("/users/:id/deactivate", deactivateUser);
router.patch("/users/:id/activate", activateUser);
router.delete("/users/:id", deleteUser);

// ─── STUDENTS ───────────────────────────────────────────────
router.get("/students", getStudents);
router.patch("/students/:id/assign-hostel", assignHostel);

// ─── HOSTELS ────────────────────────────────────────────────
router.post("/hostels", createHostel);
router.get("/hostels", getHostels);
router.get("/hostels/:id", getHostelById);
router.patch("/hostels/:id", updateHostel);
router.delete("/hostels/:id", deleteHostel);
router.patch("/hostels/:id/assign-warden", assignWarden);

// ─── GATEPASSES ─────────────────────────────────────────────
router.get("/gatepasses", getGatepasses);
router.delete("/gatepasses/:id", deleteGatepass);

// ─── FEES ───────────────────────────────────────────────────
router.post("/fees", createFee);
router.post("/fees/bulk", createFeesBulk);
router.get("/fees", getFees);
router.patch("/fees/:id", updateFee);
router.delete("/fees/:id", deleteFee);

// ─── DASHBOARD ──────────────────────────────────────────────
router.get("/dashboard", getDashboard);

export default router;
