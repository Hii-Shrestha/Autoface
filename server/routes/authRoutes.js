const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const authMiddleware = require('../middleware/auth');
const Student = require('../models/Student');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- 1. SIGNUP ---
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let student = await Student.findOne({ email });
    if (student) return res.status(400).json({ msg: 'User already exists' });
 
    const tempRoll = role === 'teacher' ? `T-${Date.now()}` : "";
    student = new Student({ 
      name, 
      email, 
      password, 
      role: role || 'student',
      rollNumber: tempRoll, // Teacher ke liye temporary roll number generate kar diya, student ke liye khali chhoda
      department: "" 
    });

    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(password, salt);

    await student.save();
    res.json({ msg: "User created successfully", role: student.role });  
  } catch (err) { 
    console.error("Signup Error:", err.message);
    res.status(500).json({ msg: 'Server Error during Signup' });
  }
});

// --- 2. LOGIN ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: student.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: student // 👈 Seedha student object bhejo taaki saari fields frontend ko mil jayein
      });
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).send('Server Error during Login');
  }
});

// --- 3. GET LOGGED IN USER (FIXED: Ab saara data jayega) ---
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) return res.status(404).json({ msg: "User not found" });

    // ⚡ FIX: Console log variable name corrected (student instead of user)
    console.log("Real-time Syncing for:", student.name, "| Roll:", student.rollNumber); 

    // ⚡ FIX: Saari fields bhejna zaroori hai dashboard ke liye
    res.json(student); 
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- 4. GOOGLE LOGIN ---
const authController = require('../controllers/authController');
router.post('/google', authController.googleLogin);

// --- 5. COMPLETE STUDENT PROFILE (Secure & Anti-Spoofing) ---
router.post('/complete-profile', authMiddleware, async (req, res) => {
  try {
    const { roll, dept, year, semester, descriptor, profileImage } = req.body;

    // 1. 🛡️ LIVENESS & DESCRIPTOR VALIDATION
    // Agar descriptor khali hai ya usme saari values 0 hain (Fake Scan Check)
    if (!descriptor || descriptor.length !== 128 || descriptor.every(v => v === 0)) {
      return res.status(400).json({ msg: "Invalid Biometric! Please show a live face." });
    }

    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    // 2. DATA CLEANING
    // Role check (Optional but safe for travelCluster Data)
    if (student.role.trim() !== 'student') {
      return res.status(403).json({ msg: "Only students can complete biometric enrollment." });
    }

    // Updating fields
    student.rollNumber = roll;
    student.department = dept;
    student.batch = year;
    student.semester = semester;
    student.faceDescriptor = descriptor; 
    student.profileImage = profileImage; 
    student.isProfileComplete = true;

    // 3. ⚡ FORCE DATABASE UPDATE
    // markModified zaroori hai kyunki faceDescriptor ek Array hai
    student.markModified('faceDescriptor');

    await student.save();
    
    console.log(`Identity Registered for: ${student.name} (${roll})`);
    res.json({ msg: "Identity Registered Successfully! ✅", user: student });

  } catch (err) {
    // 4. DUPLICATE ROLL NO CHECK
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Ye Roll Number pehle se kisi aur student ka hai!" });
    }
    console.error("Complete Profile Error:", err.message);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});
// --- 6. COMPLETE TEACHER PROFILE (Secure & Anti-Spoofing) ---
router.post('/complete-teacher-profile', authMiddleware, async (req, res) => {
  try {
    const { employeeId, department, descriptor, profileImage } = req.body;

    // 1. 🛡️ LIVENESS & DESCRIPTOR VALIDATION
    // Face Descriptor 128 float values ka array hona chahiye
    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({ msg: "Biometric Data Corrupted! Please rescan your face." });
    }

    // Checking for Fake/Blank Scans (All zeros check)
    if (descriptor.every(v => v === 0)) {
      return res.status(400).json({ msg: "Security Alert: Fake biometric detected. Use a live face!" });
    }

    // 2. FIND TEACHER IN DATABASE
    const teacher = await Student.findById(req.user.id);
    if (!teacher) return res.status(404).json({ msg: "Teacher profile not found in Atlas!" });

    // 3. 🆔 UNIQUE EMPLOYEE ID CHECK
    if (employeeId) {
      const existing = await Student.findOne({ rollNumber: employeeId });
      // Agar ye ID kisi aur ki hai toh error do
      if (existing && existing._id.toString() !== req.user.id) {
        return res.status(400).json({ msg: "Ye Employee ID (Roll No) pehle se registered hai!" });
      }
    }

    // 4. UPDATING TEACHER DATA
    teacher.rollNumber = employeeId;
    teacher.department = department;
    teacher.faceDescriptor = descriptor; 
    
    if (profileImage) {
      teacher.profileImage = profileImage;
    }
    
    teacher.isProfileComplete = true;

    // ⚡ CRITICAL: Mongoose ko batana padta hai ki Array update hua hai
    teacher.markModified('faceDescriptor');

    await teacher.save();
    
    console.log(`Success: Teacher ${teacher.name} verified securely.`);
    
    res.json({ 
      msg: "Teacher Identity Verified Successfully! ✅", 
      user: {
        id: teacher._id,
        name: teacher.name,
        role: teacher.role,
        isProfileComplete: teacher.isProfileComplete
      } 
    });

  } catch (err) {
    console.error("Teacher Setup Error:", err.message);
    res.status(500).json({ msg: "Internal Server Error", error: err.message });
  }
});


router.put('/update-password', authMiddleware, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        let user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Current password galat hai' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ msg: 'Password updated' });
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/update-security', authMiddleware, async (req, res) => {
    res.json({ msg: 'Security updated in Atlas' });
});

// @route   POST api/auth/resend-verification
router.post('/resend-verification', authMiddleware, async (req, res) => {
    res.json({ msg: 'Verification link sent' });
});


module.exports = router;