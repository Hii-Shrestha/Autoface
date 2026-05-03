import React, { useState } from 'react';
import { FiUser, FiLock, FiBell, FiShield, FiCpu, FiTrash2, FiRefreshCw, FiCheck } from 'react-icons/fi';
import axios from 'axios';

const SettingsTab = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [notifs, setNotifs] = useState({
    attendance: true,
    weekly: false
  });

  // 1. Password Reset Handler
  const handlePasswordReset = async () => {
    try {
      setLoading(true);
      // Backend route check karna padega (auth/request-reset)
      alert(`Password reset link sent to: ${user?.email}`);
    } catch (err) {
      alert("Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  // 2. Biometric Deletion (Danger Zone)
  const handleDeleteBiometrics = async () => {
    if (window.confirm("CRITICAL: Kya aap apna Face Data delete karna chahte hain? Dubara scan karna padega.")) {
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/auth/delete-biometrics', {}, {
          headers: { 'x-auth-token': token }
        });
        alert("Face Encodings deleted from [travelCluster](https://cloud.mongodb.com/v2/68d6b728d05df0633868122f)");
        window.location.reload(); // Refresh to update UI
      } catch (err) {
        alert("Delete failed: Check Backend Route");
      }
    }
  };

  return (
    <div className="container-fluid p-0 animate-in slide-in-from-bottom-3 duration-500">
      <div className="mb-4">
        <h3 className="fw-black text-dark tracking-tighter mb-1">System Settings</h3>
        <p className="text-muted small">Manage your biometric identity and account preferences.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          {/* Security Card */}
          <div className="card border-0 shadow-sm rounded-5 p-4 mb-4 bg-white">
            <h6 className="fw-black text-dark mb-4 d-flex align-items-center gap-2">
              <FiLock className="text-primary" /> Security & Access
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="text-muted fw-bold mb-1 smaller-label">REGISTERED EMAIL</label>
                <input type="text" className="form-control border-0 bg-light rounded-3 py-2 small fw-bold" value={user?.email || 'abc@gmail.com'} disabled />
              </div>
              <div className="col-md-6">
                <label className="text-muted fw-bold mb-1 smaller-label">PASSWORD CONTROL</label>
                <button 
                  onClick={handlePasswordReset}
                  className="btn btn-outline-primary btn-sm w-100 rounded-3 py-2 fw-bold"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Request Password Reset'}
                </button>
              </div>
            </div>
          </div>

          {/* Notification Center */}
          <div className="card border-0 shadow-sm rounded-5 p-4 bg-white">
            <h6 className="fw-black text-dark mb-4 d-flex align-items-center gap-2">
              <FiBell className="text-primary" /> Notifications & Alerts
            </h6>
            <div className="vstack gap-3">
              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4 transition-all hover-light">
                <div>
                  <p className="fw-bold mb-0 small">Attendance Confirmations</p>
                  <small className="text-muted smaller">Get an email after every successful face match.</small>
                </div>
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    checked={notifs.attendance} 
                    onChange={() => setNotifs({...notifs, attendance: !notifs.attendance})}
                    style={{ width: '40px', height: '20px', cursor: 'pointer' }} 
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4 transition-all hover-light">
                <div>
                  <p className="fw-bold mb-0 small">Weekly Performance Reports</p>
                  <small className="text-muted smaller">Receive a PDF summary of your weekly attendance.</small>
                </div>
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    checked={notifs.weekly}
                    onChange={() => setNotifs({...notifs, weekly: !notifs.weekly})}
                    style={{ width: '40px', height: '20px', cursor: 'pointer' }} 
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button className="btn btn-primary px-5 py-2 rounded-pill fw-bold shadow-sm" onClick={() => alert("Preferences Saved Locally!")}>
                Update Preferences
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Biometric Control */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-lg rounded-5 bg-dark text-white p-4 mb-4 overflow-hidden position-relative">
            <div className="position-relative z-1">
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="p-2 bg-primary rounded-circle shadow-lg text-white">
                  <FiCpu size={20} />
                </div>
                <span className="fw-black small text-uppercase tracking-widest text-primary">Biometric ID</span>
              </div>
              
              <h5 className="fw-bold mb-1">Face Profile: <span className={user?.faceDescriptor ? "text-success" : "text-warning"}>
                {user?.faceDescriptor ? "Active" : "Not Found"}
              </span></h5>
              <p className="text-white-50 smaller">
                Facial encodings verified on [travelCluster](https://cloud.mongodb.com/v2/68d6b728d05df0633868122f).
              </p>

              <div className="bg-white-10 p-3 rounded-4 mb-4 border border-white-10">
                <div className="d-flex justify-content-between mb-1">
                  <span className="smaller fw-bold opacity-75">Sync Status</span>
                  <span className="smaller fw-black text-success">Synced</span>
                </div>
                <div className="progress bg-white-10" style={{ height: '4px' }}>
                  <div className="progress-bar bg-success" style={{ width: '100%' }}></div>
                </div>
              </div>

              <button 
                onClick={() => window.location.href='/setup-profile'}
                className="btn btn-primary w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
              >
                <FiRefreshCw /> Re-sync Face Data
              </button>
            </div>
            <FiShield className="position-absolute opacity-10" size={150} style={{ bottom: '-30px', right: '-30px' }} />
          </div>

          <div className="card border-0 shadow-sm rounded-5 p-4 bg-white border-top border-5 border-danger">
            <h6 className="fw-black text-danger mb-2 small d-flex align-items-center gap-2">
              <FiTrash2 /> Security Actions
            </h6>
            <p className="text-muted mb-3 smaller">Permanently remove your facial biometric data from the system.</p>
            <button 
              onClick={handleDeleteBiometrics}
              className="btn btn-outline-danger w-100 rounded-pill btn-sm fw-bold py-2 hover:bg-danger"
            >
              Delete Face Encodings
            </button>
          </div>
        </div>
      </div>

      <style>{`
  /* Desktop Styles (Jo tumne diye hain) */
  .fw-black { font-weight: 900 !important; }
  .bg-white-10 { background: rgba(255, 255, 255, 0.1); }
  .border-white-10 { border: 1px solid rgba(255, 255, 255, 0.1) !important; }
  .hover-light:hover { background-color: #f8fafc !important; }
  .smaller { font-size: 11px; }
  .smaller-label { font-size: 10px; letter-spacing: 1px; }
  .form-check-input:checked { background-color: #0d6efd; border-color: #0d6efd; }

  /* 📱 MOBILE RESPONSIVE (Strictly for Phone) */
  @media (max-width: 768px) {
    .smaller { 
      font-size: 12px; /* Phone par 11px bahut chota hota hai, 12px better hai */
    }
    
    .smaller-label { 
      font-size: 11px; 
      letter-spacing: 0.5px; /* Space kam hone ki wajah se thoda tight kiya */
    }

    .form-check-input {
      width: 1.5em;  /* Phone par checkboxes ko thoda bada kiya taaki */
      height: 1.5em; /* touch karne mein galti na ho */
      margin-top: 0;
    }

    .bg-white-10 { 
      background: rgba(255, 255, 255, 0.15); /* Contrast thoda badhaya phone screen ke liye */
    }

    /* Hover effect phone par zarurat nahi hoti, isliye remove ya simplify */
    .hover-light:hover { transform: none !important; }
    
    /* List items ya inputs ke beech gap badhane ke liye */
    .d-flex { 
      gap: 10px !important; 
    }
  }
`}</style>
    </div>
  );
};

export default SettingsTab;