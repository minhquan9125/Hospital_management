import Lab from "../models/lab.js";
import Checkup from "../models/checkup.js";
import Surgery from "../models/surgery.js";
import Doctor from "../models/doctor.js";
import User from "../models/User.js"; 

// ---------- Generic CRUD Helpers ----------
const getAll = (Model) => async (req, res) => {
  try {
    const records = await Model.find({});
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateById = (Model) => async (req, res) => {
  try {
    const updated = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteById = (Model) => async (req, res) => {
  try {
    const deleted = await Model.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------- Doctors ----------
/**
 * Create new doctor
 * POST /api/doctors/create
 * 
 * Request body: {name, specialization, availability, photoUrl, department, departmentId}
 * 
 * Response codes:
 *  0: Success (no error)
 *  1: Missing required data
 *  2: Duplicate doctor (already exists)
 *  3: Database error
 *  4: Invalid input format
 */
export const createDoctor = async (req, res) => {
  try {
    const { name, specialization, availability, photoUrl, department, departmentId } = req.body;

    // Error Code 1: Check missing required fields
    if (!name || !specialization || !availability || !photoUrl) {
      return res.status(400).json({ 
        code: 1, 
        message: "Missing required data (name, specialization, availability, photoUrl)",
        success: false 
      });
    }

    // Validate input format
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ 
        code: 4, 
        message: "Invalid input format: name must be non-empty string",
        success: false 
      });
    }

    // Check for duplicate doctor (by name and specialization)
    const existingDoctor = await Doctor.findOne({ name, specialization });
    if (existingDoctor) {
      return res.status(409).json({ 
        code: 2, 
        message: "Doctor already exists with same name and specialization",
        success: false 
      });
    }

    // Create new doctor
    const newDoctor = new Doctor({ 
      name: name.trim(), 
      specialization, 
      availability, 
      photoUrl,
      department: department || "General",
      departmentId: departmentId || "GEN001"
    });

    const saved = await newDoctor.save();

    // Error Code 0: Success
    return res.status(201).json({ 
      code: 0, 
      message: "Doctor created successfully",
      success: true,
      data: saved 
    });
  } catch (err) {
    console.error("Error creating doctor:", err);
    // Error Code 3: Database error
    return res.status(500).json({ 
      code: 3, 
      message: "Database error: " + err.message,
      success: false 
    });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;
    const query = specialization ? { specialization } : {};
    const doctors = await Doctor.find(query);
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const { name, specialization, availability, photoUrl } = req.body;
    doctor.name = name || doctor.name;
    doctor.specialization = specialization || doctor.specialization;
    doctor.availability = availability || doctor.availability;
    doctor.photoUrl = photoUrl || doctor.photoUrl;

    const updated = await doctor.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    await doctor.deleteOne();
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadDoctorsJSON = async (req, res) => {
  try {
    const { specialization } = req.query;
    const query = specialization ? { specialization } : {};
    const doctors = await Doctor.find(query);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="doctors.json"');
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// API 1: Get doctors list as JSON (public)
export const getDoctorsJSON = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      message: "Doctors list retrieved successfully",
      data: doctors
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// API 2: Get doctors by department ID (public)
export const getDoctorsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required"
      });
    }

    const doctors = await Doctor.find({ departmentId });
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      message: `Doctors in department ${departmentId} retrieved successfully`,
      departmentId: departmentId,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// API 3: Get doctors with authentication (requires token)
export const getDoctorsAuthenticatedJSON = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      message: "Doctors list retrieved successfully (Authenticated)",
      authenticatedUser: req.userId,
      userRole: req.userRole,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ---------- Users (Admin Only) ----------
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // don’t send password hash
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------- Exports for Labs / Checkups / Surgeries ----------
export const getAllLabs = getAll(Lab);
export const updateLab = updateById(Lab);
export const deleteLab = deleteById(Lab);

export const getAllCheckups = getAll(Checkup);
export const updateCheckup = updateById(Checkup);
export const deleteCheckup = deleteById(Checkup);

export const getAllSurgeries = getAll(Surgery);
export const updateSurgery = updateById(Surgery);
export const deleteSurgery = deleteById(Surgery);
