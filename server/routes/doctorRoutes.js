import express from "express";
import { 
  getAllDoctors, 
  downloadDoctorsJSON,
  getDoctorsJSON,
  getDoctorsByDepartment,
  getDoctorsAuthenticatedJSON
} from "../controllers/adminController.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

// API 1: Get all doctors in JSON format (public)
router.get("/list-json", getDoctorsJSON);

// API 2: Get doctors by department ID (public)
router.get("/department/:departmentId", getDoctorsByDepartment);

// API 3: Get all doctors with authentication (requires token)
router.get("/authenticated", isAuthenticated, getDoctorsAuthenticatedJSON);

// Existing routes
router.get("/", getAllDoctors);
router.get("/download", downloadDoctorsJSON);

export default router;