import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
   id: {
     type: Number,
     required: true,
     unique: true 
  },
  name: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  Experience:{
    type:String,
    required:true,
  },
  availability: {
    type: String,
    required: true,
  },
  photoUrl: {
    type: String,
    required: true,
  },
  departmentId: {
    type: String,
    required: false,
  },
  department: {
    type: String,
    required: false,
  },
});

export default mongoose.model('Doctor', doctorSchema);
