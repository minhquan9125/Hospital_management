// server/index.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import multer from "multer";

import Medicine from "./models/medicines.js";
import LabAppointment from "./models/lab.js";
import Doctor from "./models/doctor.js";
import CheckupAppointment from "./models/checkup.js";
import Surgery from "./models/surgery.js";

import authRoutes from "./routes/authRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";

// Load dotenv only in development, not in production (Railway sets vars directly)
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();

// Environment validation - fail fast if missing critical vars
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_dev_only";
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

console.log("📋 Environment:");
console.log("  NODE_ENV =", NODE_ENV);
console.log("  PORT =", PORT);
console.log("  MONGODB_URI =", MONGODB_URI ? "✓ Set" : "❌ MISSING");
console.log("  JWT_SECRET =", process.env.JWT_SECRET ? "✓ Set" : "⚠️  Using default (set for production)");

// Fail fast if critical vars missing
if (!MONGODB_URI) {
  console.error("❌ ERROR: MONGODB_URI environment variable is not set!");
  console.error("   Set either MONGODB_URI or MONGO_URI in your .env or Railway Variables");
  process.exit(1);
}

// for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Express session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "midcity_session_secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", (req, res) => {
  res.send("Backend is running successfully!");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ ok: true, env: NODE_ENV, timestamp: new Date().toISOString() });
});

// MongoDB connection
console.log("\n🔗 Connecting to MongoDB...");
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected successfully!");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin/medicines", medicineRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api", emergencyRoutes);
app.use("/api/doctors", doctorRoutes);

// Doctors routes moved to doctorRoutes.js

// Lab booking
app.post("/api/labs/book", async (req, res) => {
  try {
    console.log("Booking data:", req.body);
    const newAppointment = new LabAppointment(req.body);
    await newAppointment.save();
    res.status(201).json({ message: "Appointment booked successfully!" });
  } catch (err) {
    console.error("Error saving appointment:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Checkup booking
app.post("/api/checkup/book", async (req, res) => {
  try {
    const newAppointment = new CheckupAppointment(req.body);
    await newAppointment.save();
    res.status(201).json({ message: "Appointment booked successfully!" });
  } catch (err) {
    console.error("Error booking checkup appointment:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Surgery booking
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

app.post("/api/surgery/book", upload.single("prescription"), async (req, res) => {
  try {
    const { name, email, phone, doctor, surgeryType, date } = req.body;
    const prescriptionFileName = req.file?.filename || null;

    const newSurgery = new Surgery({
      name,
      email,
      phone,
      doctor,
      surgeryType,
      date,
      prescriptionFileName,
    });

    await newSurgery.save();
    res.status(201).json({ message: "Surgery appointment booked successfully" });
  } catch (err) {
    console.error("Error booking surgery:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`🔗 Base URL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});
