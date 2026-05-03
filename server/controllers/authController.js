const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- SIGNUP LOGIC ---
exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudent = new Student({
      name, 
      email, 
      password: hashedPassword,
      role: role || 'student', 
      isProfileComplete: false
    });
    await newStudent.save();
    res.status(201).json({ msg: "User created" });
  } catch (err) { res.status(500).json({ msg: "Error in Signup" }); }
};

// --- LOGIN LOGIC ---
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    // ✅ JWT mein Role pack kar diya hai taaki 401 Error na aaye
    const token = jwt.sign(
      { id: student._id, role: student.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role, 
        isProfileComplete: student.isProfileComplete
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

// --- GOOGLE LOGIN LOGIC ---
exports.googleLogin = async (req, res) => {
  const { token, role } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token, // 👈 'idToken' consistent rakho controller aur frontend ke beech
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, picture } = ticket.getPayload();

    let student = await Student.findOne({ email });

    if (!student) {
      student = new Student({
        name,
        email,
        avatar: picture,
        role: role || 'student',
        password: `google_${Date.now()}`,
        isProfileComplete: false,
      });
      await student.save();
    } else if (role && student.role !== role) {
      student.role = role;
      await student.save();
    }

    const jwtToken = jwt.sign(
      { id: student._id, role: student.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        isProfileComplete: student.isProfileComplete
      }
    });
  } catch (error) {
    res.status(400).json({ msg: "Google Verification Failed" });
  }
};

// --- 🚀 FINALIZE ATTENDANCE (ABSENT LOGIC) ---
exports.finalizeAttendance = async (req, res) => {
  try {
    const { subject } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // 1. Sirf unhe dhundo jo 'student' hain
    const allStudents = await Student.find({ role: 'student' });

    // 2. Optimized Bulk Write Operations
    const bulkOps = allStudents.map(student => {
      // Check agar aaj ki attendance already hai (Present/Verified)
      const hasRecord = student.attendance && student.attendance.some(
        att => att.date === today && att.subject === subject
      );

      // Agar koi record nahi mila, toh 'Absent' mark karo
      if (!hasRecord) {
        return {
          updateOne: {
            filter: { _id: student._id },
            update: { 
              $push: { 
                attendance: { 
                  date: today, 
                  subject: subject, 
                  status: 'Absent', 
                  markedAt: new Date() 
                } 
              } 
            }
          }
        };
      }
      return null;
    }).filter(op => op !== null);

    if (bulkOps.length > 0) {
      await Student.bulkWrite(bulkOps);
    }

    res.status(200).json({ 
        msg: "Attendance Processed Successfully", 
        absenteesMarked: bulkOps.length 
    });
  } catch (err) {
    console.error("Finalize Error:", err);
    res.status(500).json({ msg: "Server Error during finalization" });
  }
};