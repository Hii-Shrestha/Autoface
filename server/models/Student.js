const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  role: { type: String, enum: ['student', 'teacher'], default: 'student' },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  
  rollNumber: { type: String, default: "" }, 
  department: { type: String, default: "" },
  batch: { type: String, default: "" },
  semester: { type: String, default: "1" }, // Semester bhi add kar diya
  profileImage: { type: String, default: "" }, // Photo store karne ke liye
  faceDescriptor: { type: [Number], default: [] }, 
  isProfileComplete: { type: Boolean, default: false },

  // ⚡ FIXED: Subject-wise attendance logic
  attendance: [{
    subject: { type: String, required: true }, // 👈 Ye zaroori tha Matrix ke liye
    teacher: { type: String, required: true }, // 👈 Teacher ka naam bhi store karna hai
    date: { type: String, required: true },    // Format: YYYY-MM-DD
    status: { type: String, enum: ['Present', 'Late', 'Absent'], default: 'Present' },
    markedAt: { type: Date, default: Date.now },
    method:{type:String, enum: ['manual', 'face-recognition'], default: 'manual'}
  }]
}, { timestamps: true });

// Roll number unique hona chahiye within the same department
studentSchema.index({ rollNumber: 1, department: 1 }, { 
  unique: true, 
  partialFilterExpression: { rollNumber: { $gt: "" } } // Khali roll number par error nahi aayega
});

module.exports = mongoose.model('Student', studentSchema);