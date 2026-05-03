const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const { finalizeAttendance } = require('../controllers/authController');

// @route   POST api/attendance/mark (Student QR Scan)
router.post('/mark', auth, async (req, res) => {
  try {
    const { descriptor, subject, teacher } = req.body;
    const userId = req.user.id;

    const student = await Student.findById(userId);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    // Face Match Logic
    if (student.faceDescriptor && student.faceDescriptor.length > 0) {
      const dbDescriptor = new Float32Array(student.faceDescriptor);
      const liveDescriptor = new Float32Array(descriptor);
      const distance = Math.sqrt(dbDescriptor.reduce((sum, val, i) => sum + Math.pow(val - liveDescriptor[i], 2), 0));
      if (distance > 0.6) return res.status(401).json({ msg: "Face Mismatch! Access Denied." });
    }

    if (!student.attendance) student.attendance = [];
    const today = new Date().toISOString().split('T')[0];

    const alreadyMarked = student.attendance.some(entry => 
      entry.date === today && entry.subject === (subject || "General")
    );

    if (alreadyMarked) {
      return res.status(400).json({ msg: `${subject || "General"} ki attendance aaj lag chuki hai!` });
    }

    const newEntry = { 
      date: today, 
      subject: subject || "General",
      teacher: teacher || "Prof. Priya", 
      status: 'Present',
      markedAt: new Date(),
      method: "QR Scanner"
    };

    student.attendance.push(newEntry);
    student.markModified('attendance'); 
    await student.save({ validateBeforeSave: false });

    return res.status(200).json({ 
      msg: `Success! Attendance lag gayi.`,
      attendance: student.attendance 
    }); 

  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error", error: err.message });
  }
});

// ⚡ Manual Mark Route
router.post('/manual-mark', auth, async (req, res) => {
    const { studentId, status, subject, teacher } = req.body; 
    const today = new Date().toISOString().split('T')[0];

    try {
        const student = await Student.findById(studentId); 
        if (!student) return res.status(404).json({ msg: "Student nahi mila" });

        if (!student.attendance) student.attendance = [];
        
        const recordIndex = student.attendance.findIndex(entry => entry.date === today && entry.subject === (subject || "General"));

        if (recordIndex !== -1) {
            student.attendance[recordIndex].status = status || "Present";
            student.attendance[recordIndex].teacher = teacher || "Teacher";
        } else {
            student.attendance.push({
                date: today,
                subject: subject || "General",
                status: status || "Present",
                teacher: teacher || "Teacher",
                markedAt: new Date(),
                method: "Manual Admin Entry"
            });
        }

        student.markModified('attendance');
        await student.save({ validateBeforeSave: false });
        res.json({ msg: `Attendance marked successfully! ✅` });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// 🚀 Bulk Mark Route
router.post('/bulk-mark', auth, async (req, res) => {
    const { attendance, subject, teacher } = req.body; 
    const today = new Date().toISOString().split('T')[0];

    try {
        const ids = Object.keys(attendance);
        for (let id of ids) {
            const user = await Student.findById(id); 
            if (!user || user.role.trim().toLowerCase() !== 'student') continue; 

            if (!user.attendance) user.attendance = [];
            const currentStatus = attendance[id] === 'present' ? 'Present' : 'Absent';

            const recordIndex = user.attendance.findIndex(a => a.date === today && a.subject === subject);
            
            if (recordIndex !== -1) {
                user.attendance[recordIndex].status = currentStatus;
                user.attendance[recordIndex].teacher = teacher;
            } else {
                user.attendance.push({
                    date: today,
                    subject: subject || "General",
                    status: currentStatus,
                    teacher: teacher || "Teacher",
                    markedAt: new Date(),
                    method: "Manual Bulk Entry"
                });
            }
            user.markModified('attendance');
            await user.save({ validateBeforeSave: false });
        }
        res.json({ msg: "Attendance synced! ✅" });
    } catch (err) {
        res.status(500).json({ msg: "Server Error: " + err.message });
    }
});

// ⚡ FIX: All Students Route (Role check improved)
router.get('/all-students', auth, async (req, res) => {
    try {
      const user = await Student.findById(req.user.id);
      
      // Role ko normalize kiya taaki 'Teacher' ya 'faculty' dono kaam karein
      const role = user.role.trim().toLowerCase();
      if (!user || (role !== 'teacher' && role !== 'faculty')) {
          return res.status(401).json({ msg: "Access Denied: Teachers only" });
      }

      const students = await Student.find({ role: 'student' }).select('-password');
      res.json(students);
    } catch (err) { 
        res.status(500).send('Server Error'); 
    }
});

router.delete('/delete-student/:id', auth, async (req, res) => {
    try {
      await Student.findByIdAndDelete(req.params.id);
      res.json({ msg: "Student removed" });
    } catch (err) { res.status(500).send("Server Error"); }
});

router.put('/update-student/:id', auth, async (req, res) => {
    try {
      const updated = await Student.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
      res.json(updated);
    } catch (err) { res.status(500).send("Server Error"); }
});

router.post('/finalize', auth, finalizeAttendance);

module.exports = router;