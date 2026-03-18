import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import connectDB from "./configs/db.js";
import errorHandler from "./middlewares/errorHandler.js";

// Route imports
import authRoutes from "./modules/user/auth.routes.js";
import studentRoutes from "./modules/student/student.routes.js";
import wardenRoutes from "./modules/warden/warden.routes.js";
import securityRoutes from "./modules/gatepass/security.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import { logger } from "./middlewares/logger.js";

dotenv.config();

const app = express();

// ─── MIDDLEWARE ──────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(logger);

// ─── ROUTES ─────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "UniStay API is running",
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/warden", wardenRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/admin", adminRoutes);

// ─── 404 HANDLER ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ─── GLOBAL ERROR HANDLER ───────────────────────────────────
app.use(errorHandler);

// ─── START SERVER ───────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer();
