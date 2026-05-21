const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 1. Config load karein
dotenv.config();

const app = express();
app.get("/", (req, res) => {
  res.send("Server is running successfully");
});

// 2. Middlewares (Isme 50mb limit zaroori hai photo ke liye)
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ AutoFace DB Connected"))
  .catch(err => {
    console.log("❌ DB Error:", err.message);
  });

// 4. Routes (Check karein file ka naam 'authRoutes.js' hi hai na?)
// Agar error line 31 par hai, toh isi line mein issue hai
app.use('/api/auth', require('./routes/authRoutes')); 
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/attendance', require('./routes/attendance'));

// 5. Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});