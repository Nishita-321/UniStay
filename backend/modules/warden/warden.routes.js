import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import {
  getStudents,
  getGatepasses,
  updateGatepass,
  getAccommodations,
  updateAccommodation,
  getFees,
} from "./warden.controller.js";

const router = Router();

// All routes require warden authentication
router.use(authenticate, authorize("warden"));

// Students
router.get("/students", getStudents);

// Gatepasses
router.get("/gatepasses", getGatepasses);
router.patch("/gatepasses/:id", updateGatepass);

// Accommodation
router.get("/accommodation", getAccommodations);
router.patch("/accommodation/:id", updateAccommodation);

// Fees
router.get("/fees", getFees);

export default router;
