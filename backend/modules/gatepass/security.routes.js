import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import {
  getGatepasses,
  getGatepassById,
  markOut,
  markIn,
  getAuditLog,
} from "./security.controller.js";

const router = Router();

// All routes require security authentication
router.use(authenticate, authorize("security"));

router.get("/gatepasses", getGatepasses);
router.get("/gatepasses/:id", getGatepassById);
router.patch("/gatepasses/:id/out", markOut);
router.patch("/gatepasses/:id/in", markIn);
router.get("/audit-log", getAuditLog);

export default router;
