import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { FiMail, FiBookOpen, FiAward, FiCalendar, FiEdit3, FiActivity, FiCheck, FiX } from 'react-icons/fi';

const Profile = () => {
  const { authState } = useContext(AuthContext);
  const user = authState?.user;

  // ⚡ States for Real-time Editing
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dept, setDept] = useState(user?.department || "Computer Science");

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/auth/complete-teacher-profile', {
        department: dept,
        employeeId: user?.rollNumber,
      }, {
        headers: { 'x-auth-token': token }
      });

      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        alert("Profile Updated Successfully! ✅");
        setIsEditing(false);
        window.location.reload(); // Refresh to sync everything
      }
    } catch (err) {
      alert("Update Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-0 animate-in fade-in">
      <div className="card border-0 shadow-lg rounded-5 overflow-hidden bg-white mb-5">
        <div className="bg-primary p-5 position-relative" style={{ minHeight: '160px' }}>
          {/* 📸 Profile Image */}
          <div className="position-absolute translate-middle-y start-50 translate-middle-x" style={{ top: '100%' }}>
            <div className="bg-white rounded-circle shadow-lg d-flex align-items-center justify-content-center fw-black text-primary border border-5 border-white overflow-hidden" style={{ width: '130px', height: '130px' }}>
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-100 h-100 object-fit-cover" />
              ) : (
                <span style={{ fontSize: '48px' }}>{user?.name?.charAt(0) || 'P'}</span>
              )}
            </div>
          </div>
        </div>

        <div className="card-body p-5 pt-5 mt-4 text-center">
          <h1 className="fw-black text-dark mb-1 display-6 text-capitalize">{user?.name || 'Instructor Name'}</h1>
          <p className="text-primary fw-bold mb-4 text-uppercase tracking-widest small d-flex align-items-center justify-content-center gap-2">
            <FiAward /> Senior Faculty @ AutoFace AI
          </p>
          
          <div className="d-flex justify-content-center gap-2 mb-5">
             <span className="badge bg-light text-dark border px-3 py-2 rounded-pill smaller fw-black">EMP ID: {user?.rollNumber || 'FAC-2026'}</span>
             <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill smaller fw-black">ACTIVE</span>
          </div>

          <div className="row g-4 text-start">
            <div className="col-md-6">
              <div className="p-4 rounded-5 bg-light h-100 border-0">
                <label className="smaller text-muted fw-black uppercase tracking-widest mb-2 d-block">Official Email</label>
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 bg-white rounded-3 shadow-sm text-primary"><FiMail /></div>
                  <p className="fw-bold m-0 text-dark">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-4 rounded-5 bg-light h-100 border-0 transition-all hover-lift">
                <label className="smaller text-muted fw-black uppercase tracking-widest mb-2 d-block">Department</label>
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 bg-white rounded-3 shadow-sm text-primary"><FiBookOpen /></div>
                  {isEditing ? (
                    <select className="form-select border-0 shadow-none fw-bold bg-transparent p-0" value={dept} onChange={(e) => setDept(e.target.value)}>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics">Electronics</option>
                    </select>
                  ) : (
                    <p className="fw-bold m-0 text-dark">{user?.department || 'Not Assigned'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 📅 Joined Date (Added) */}
            <div className="col-md-6">
              <div className="p-4 rounded-5 bg-light h-100 border-0 transition-all hover-lift">
                <label className="smaller text-muted fw-black uppercase tracking-widest mb-2 d-block">Joined Date</label>
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 bg-white rounded-3 shadow-sm text-primary"><FiCalendar /></div>
                  <p className="fw-bold m-0 text-dark">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Apr 29, 2026'}
                  </p>
                </div>
              </div>
            </div>

            {/* 🎭 System Role (Added) */}
            <div className="col-md-6">
              <div className="p-4 rounded-5 bg-light h-100 border-0 transition-all hover-lift">
                <label className="smaller text-muted fw-black uppercase tracking-widest mb-2 d-block">System Role</label>
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 bg-white rounded-3 shadow-sm text-primary"><FiActivity /></div>
                  <p className="fw-bold m-0 text-dark text-capitalize">{user?.role || 'Teacher'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-top">
            {isEditing ? (
              <div className="d-flex justify-content-center gap-3">
                <button onClick={handleUpdate} disabled={loading} className="btn btn-success btn-lg rounded-pill px-5 py-3 fw-black small shadow-lg border-0 d-flex align-items-center gap-2">
                   {loading ? <span className="spinner-border spinner-border-sm"></span> : <FiCheck />}
                   {loading ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
                <button onClick={() => setIsEditing(false)} className="btn btn-light btn-lg rounded-pill px-4 py-3 fw-black border-0">
                  <FiX /> CANCEL
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="btn btn-dark btn-lg rounded-pill px-5 py-3 fw-black small d-inline-flex align-items-center gap-2 shadow-lg border-0 transition-all hover-scale"
              >
                <FiEdit3 /> UPDATE PROFILE DATA
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .smaller { font-size: 0.65rem; }
        .object-fit-cover { object-fit: cover; }
        .hover-lift:hover { transform: translateY(-5px); background: #fff !important; box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important; }
        .bg-success-subtle { background-color: #dcfce7 !important; }
      `}</style>
    </div>
  );
};

export default Profile;