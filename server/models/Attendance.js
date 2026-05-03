const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'Present' },
  method: { type: String, default: 'Face-AI' }
});

// Same day, same subject, same student ke liye duplicate entry na ho
attendanceSchema.index({ studentId: 1, subject: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);