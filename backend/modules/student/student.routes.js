import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import {
  getProfile,
  updateProfile,
  applyGatepass,
  getGatepasses,
  applyAccommodation,
  getAccommodations,
  getFees,
  payFee,
} from "./student.controller.js";

const router = Router();

// All routes require student authentication
router.use(authenticate, authorize("student"));

// Profile
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

// Gatepasses
router.post("/gatepasses", applyGatepass);
router.get("/gatepasses", getGatepasses);

// Accommodation
router.post("/accommodation", applyAccommodation);
router.get("/accommodation", getAccommodations);

// Fees
router.get("/fees", getFees);
router.post("/fees/:id/pay", payFee);

export default router;
