import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext'; 
import { FiMail, FiLock, FiUser, FiUserCheck, FiLogIn, FiArrowRight, FiShield } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); 
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, loginWithToken } = useContext(AuthContext); 

  const handleRoleRedirect = (user) => {
    const finalRole = user.role || 'student';
    const isComplete = user.isProfileComplete;
    if (finalRole === 'teacher') {
      isComplete ? navigate('/teacher-dashboard') : navigate('/teacher-setup');
    } else {
      isComplete ? navigate('/dashboard') : navigate('/setup-profile');
    }
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user) {
        const backendRole = user.role || 'student';
        if (backendRole !== role) {
          alert(`Mismatched Role! Registered as ${backendRole.toUpperCase()}`);
          setLoading(false);
          return;
        }
        handleRoleRedirect(user);
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Login Failed: Check Credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = useCallback(async (response) => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/google', {
        token: response.credential,
        role: role 
      });
      await loginWithToken(res.data.token, res.data.user);
      handleRoleRedirect(res.data.user);
    } catch (err) {
      alert("Google Login Failed");
    } finally {
      setLoading(false);
    }
  }, [loginWithToken, role, navigate]);

  useEffect(() => {
    /* global google */
    const timer = setTimeout(() => {
      if (window.google) {
        google.accounts.id.initialize({
          client_id: "363819201891-b14ktbp0vd7p0vliv8fdq2oemg5dvo3n.apps.googleusercontent.com",
          callback: handleGoogleResponse,
        });
        const btnDiv = document.getElementById("googleSignInDiv");
        if (btnDiv) google.accounts.id.renderButton(btnDiv, { 
            theme: "outline", 
            size: "large", 
            width: "100%",
            shape: "pill",
            text: "signin_with" 
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [handleGoogleResponse]);

  return (
    <div className="login-wrapper">
      <div className="login-card shadow-2xl">
        {/* Left Visual Panel */}
        <div className="login-sidebar d-none d-md-flex">
          <div className="sidebar-content">
            <div className="logo-badge mb-4">
               <FiShield size={30} className="text-white" />
            </div>
            <h2 className="fw-black text-white">AutoFace AI</h2>
            <p className="text-white-50 small mb-4">Secure Biometric Attendance Portal</p>
            <div className="status-badge">
                <span className="pulse-dot"></span> System Live: 2026 Ready
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="login-form-area">
          <div className="text-center mb-4">
            <h3 className="fw-black text-dark m-0">Welcome Back</h3>
            <p className="text-muted small">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="mt-4">
            {/* Professional Role Toggle */}
            <div className="role-selector mb-4">
              <label className="d-block text-muted smaller fw-black text-uppercase tracking-widest mb-2">Login As:</label>
              <div className="d-flex gap-2">
                <button 
                  type="button"
                  className={`role-btn ${role === 'student' ? 'active' : ''}`}
                  onClick={() => setRole('student')}
                >
                  <FiUser className="me-2"/> Student
                </button>
                <button 
                  type="button"
                  className={`role-btn ${role === 'teacher' ? 'active' : ''}`}
                  onClick={() => setRole('teacher')}
                >
                  <FiUserCheck className="me-2"/> Teacher
                </button>
              </div>
            </div>

            <div className="input-group-custom">
              <div className="input-field">
                <FiMail className="input-icon" />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>

              <div className="input-field">
                <FiLock className="input-icon" />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-login mt-2">
              {loading ? 'Authenticating...' : <><FiLogIn className="me-2"/> Sign In</>}
            </button>
          </form>

          <div className="divider my-4"><span>OR CONTINUE WITH</span></div>

          <div id="googleSignInDiv" className="w-100 d-flex justify-center"></div>

          <p className="footer-text mt-4">
            New User? <Link to="/signup" className="fw-bold text-primary ms-1">Register Here <FiArrowRight /></Link>
          </p>
        </div>
      </div>

      <style>{`
        .login-wrapper { min-height: 100vh; background: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: 'Inter', sans-serif; }
        .login-card { background: white; width: 100%; max-width: 900px; display: flex; border-radius: 30px; overflow: hidden; }
        
        .login-sidebar { width: 40%; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 50px; flex-direction: column; justify-content: center; align-items: center; text-align: center; position: relative; }
        .logo-badge { background: rgba(255,255,255,0.2); padding: 15px; border-radius: 20px; }
        .status-badge { background: rgba(255,255,255,0.1); padding: 8px 15px; border-radius: 50px; font-size: 0.75rem; color: white; font-weight: 700; display: flex; align-items: center; gap: 8px; }
        .pulse-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 10px #22c55e; animation: pulse 2s infinite; }

        .login-form-area { width: 60%; padding: 50px; background: white; }
        .fw-black { font-weight: 900 !important; }
        
        .input-field { position: relative; margin-bottom: 20px; }
        .input-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .input-field input { width: 100%; padding: 14px 15px 14px 50px; border: 1.5px solid #e2e8f0; border-radius: 14px; outline: none; transition: 0.3s; font-size: 0.95rem; }
        .input-field input:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }

        .role-btn { flex: 1; padding: 12px; border: 1.5px solid #e2e8f0; background: #f8fafc; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; color: #64748b; display: flex; align-items: center; justify-content: center; }
        .role-btn.active { background: #2563eb; color: white; border-color: #2563eb; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2); }

        .btn-login { width: 100%; padding: 16px; background: #2563eb; color: white; border: none; border-radius: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
        .btn-login:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3); }

        .divider { display: flex; align-items: center; text-align: center; color: #cbd5e1; font-weight: 800; font-size: 0.7rem; letter-spacing: 1px; }
        .divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1.5px solid #f1f5f9; }
        .divider span { padding: 0 15px; }

        .footer-text { text-align: center; font-size: 0.9rem; color: #64748b; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        @media (max-width: 768px) {
          .login-card { flex-direction: column; }
          .login-sidebar { display: none !important; }
          .login-form-area { width: 100%; padding: 35px; }
        }
      `}</style>
    </div>
  );
};

export default Login;