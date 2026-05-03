import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiShield, FiUserCheck, FiClock } from 'react-icons/fi';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    role: '' // Default set kar diya taaki empty na jaye
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return alert("Passwords do not match!");
    }

    try {
      const { confirmPassword, ...signupData } = formData;
      await axios.post('http://localhost:5000/api/auth/signup', signupData);
      alert(`Account created successfully as ${formData.role.toUpperCase()}!`);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed");
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        {/* Left Side: Branding/Visual */}
        <div className="signup-sidebar">
          <div className="sidebar-content">
            <h2 className="fw-black text-white">AutoFace AI</h2>
            <p className="text-white-50 small">Next-gen biometric attendance powered by deep learning.</p>
            <div className="feature-list mt-4">
              <div className="feature-item"><FiShield /> <span>Secure Biometric Data</span></div>
              <div className="feature-item"><FiClock /> <span>Real-time Sync</span></div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="signup-form-area">
          <div className="form-header text-center">
            <h3 className="fw-black text-dark">Create Account</h3>
            <p className="text-muted small">Join the future of classroom management</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-4">
            {/* Role Switcher (Modern Toggle Style) */}
            <div className="role-selector mb-4">
              <label className="d-block text-muted smaller fw-black text-uppercase tracking-widest mb-2">Register As</label>
              <div className="d-flex gap-2">
                <button 
                  type="button"
                  className={`role-btn ${formData.role === 'student' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, role: 'student'})}
                >
                  <FiUser className="me-2"/> Student
                </button>
                <button 
                  type="button"
                  className={`role-btn ${formData.role === 'teacher' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, role: 'teacher'})}
                >
                  <FiUserCheck className="me-2"/> Teacher
                </button>
              </div>
            </div>

            <div className="input-group-custom">
              <div className="input-field">
                <FiUser className="input-icon" />
                <input type="text" placeholder="Full Name" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>

              <div className="input-field">
                <FiMail className="input-icon" />
                <input type="email" placeholder="Email Address" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>

              <div className="input-field">
                <FiLock className="input-icon" />
                <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
              </div>

              <div className="input-field">
                <FiShield className="input-icon" />
                <input type="password" placeholder="Confirm Password" onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
              </div>
            </div>

            <button type="submit" className="btn-signup mt-4">
              Create Account
            </button>
          </form>

          <p className="footer-text mt-4">
            Already a member? <Link to="/login" className="fw-bold text-primary">Login Now</Link>
          </p>
        </div>
      </div>

      <style>{`
        .signup-wrapper { min-height: 100vh; background: #f4f7fe; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: 'Inter', sans-serif; }
        .signup-card { background: white; width: 100%; max-width: 900px; display: flex; border-radius: 30px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
        
        /* Sidebar Styles */
        .signup-sidebar { width: 40%; background: linear-gradient(135deg, #0d6efd 0%, #002d72 100%); padding: 40px; display: flex; align-items: center; position: relative; }
        .signup-sidebar::before { content: ''; position: absolute; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%; top: -50px; left: -50px; }
        .fw-black { font-weight: 900 !important; }
        .feature-item { display: flex; align-items: center; gap: 10px; color: white; font-size: 0.85rem; margin-bottom: 12px; opacity: 0.9; }

        /* Form Styles */
        .signup-form-area { width: 60%; padding: 50px; background: white; }
        .input-field { position: relative; margin-bottom: 15px; }
        .input-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #adb5bd; }
        .input-field input { width: 100%; padding: 12px 15px 12px 45px; border: 1px solid #e9ecef; border-radius: 12px; outline: none; transition: 0.3s; font-size: 0.95rem; }
        .input-field input:focus { border-color: #0d6efd; box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1); }

        /* Role Buttons */
        .role-btn { flex: 1; padding: 10px; border: 1px solid #e9ecef; background: #f8f9fa; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: 0.3s; color: #6c757d; display: flex; align-items: center; justify-content: center; }
        .role-btn.active { background: #0d6efd; color: white; border-color: #0d6efd; box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2); }

        .btn-signup { width: 100%; padding: 14px; background: #0d6efd; color: white; border: none; border-radius: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; transition: 0.3s; }
        .btn-signup:hover { background: #0056b3; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(13, 110, 253, 0.2); }
        .footer-text { text-align: center; font-size: 0.85rem; color: #6c757d; }
        
        @media (max-width: 768px) {
          .signup-card { flex-direction: column; }
          .signup-sidebar { width: 100%; padding: 30px; text-align: center; justify-content: center; }
          .signup-form-area { width: 100%; padding: 30px; }
        }
      `}</style>
    </div>
  );
};

export default Signup;