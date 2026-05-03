import React, { useContext, useEffect, useState } from 'react';
import { FiUser, FiMail, FiBook, FiHash, FiCalendar, FiShield, FiCheck } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext'; 

const StudentProfile = () => {
  const { authState, refreshUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  // 🔄 Real-time Sync: Page load hote hi Atlas se fresh data lao
  useEffect(() => {
    const syncData = async () => {
      if (refreshUser) await refreshUser();
      setLoading(false);
    };
    syncData();
  }, []);

  const user = authState?.user;
  const profileImg = user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name}&background=0D6EFD&color=fff&size=128`;

  if (loading) return (
    <div className="p-5 text-center">
      <div className="spinner-border text-primary mb-2"></div>
      <p className="fw-bold text-muted">Fetching live data from [travelCluster](https://cloud.mongodb.com/v2/68d6b728d05df0633868122f)...</p>
    </div>
  );

  return (
    <div className="container-fluid p-0 animate-in fade-in duration-700">
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 rounded-5 bg-primary overflow-hidden shadow-lg position-relative" style={{ height: '180px' }}>
            <div className="position-absolute top-0 end-0 p-4 opacity-10"><FiShield size={150} /></div>
            <div className="p-4 pt-5">
               <h4 className="text-white fw-black opacity-50 m-0">STUDENT PASSPORT</h4>
               <p className="text-white-50 small font-monospace">DATA_SYNC: LIVE_ACTIVE</p>
            </div>
          </div>
          
          <div className="px-4 position-relative" style={{ marginTop: '-70px' }}>
            <div className="d-flex align-items-end gap-4 flex-wrap flex-md-nowrap">
              <div className="position-relative">
                <img src={profileImg} alt="Registered Face" className="rounded-circle border border-5 border-white shadow-lg bg-white" style={{ width: '140px', height: '140px', objectFit: 'cover' }} />
                {user?.faceDescriptor && (
                  <div className="position-absolute bottom-0 end-0 bg-success border border-3 border-white rounded-circle p-2 animate-pulse">
                     <FiCheck className="text-white" size={16} />
                  </div>
                )}
              </div>
              <div className="pb-3">
                <h2 className="fw-black text-dark mb-1">{user?.name || 'Tanya'}</h2>
                <div className="d-flex gap-2">
                   <span className="badge bg-primary rounded-pill px-3 py-2 fw-bold">ID: {user?.rollNumber || 'Not Set'}</span>
                   <span className="badge bg-dark rounded-pill px-3 py-2 fw-bold">Batch: {user?.batch || '2025'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-5 p-4 bg-white">
        <h5 className="fw-black mb-4 text-primary d-flex align-items-center gap-2"><FiUser /> Identity Record</h5>
        <div className="row g-4">
          {[
            { label: 'Full Name', value: user?.name, icon: <FiUser/> },
            { label: 'Official Email', value: user?.email, icon: <FiMail/> },
            { label: 'Roll Number', value: user?.rollNumber, icon: <FiHash/> },
            { label: 'Major/Department', value: user?.department, icon: <FiBook/> },
            { label: 'Biometric Status', value: user?.faceDescriptor ? 'Verified 128-bit' : 'Pending', icon: <FiShield/> }
          ].map((field, index) => (
            <div key={index} className="col-md-4">
              <div className="p-4 bg-light rounded-5 border border-white h-100 transition-all hover-up">
                <div className="d-flex align-items-center gap-2 mb-2 text-muted">
                   {field.icon}
                   <label className="smaller fw-bold text-uppercase tracking-widest">{field.label}</label>
                </div>
                <p className="fw-black m-0 text-dark fs-5 text-truncate">{field.value || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    <style>{`
  /* Desktop Styles (Jo tumne diye hain) */
  .fw-black { font-weight: 900 !important; }
  .hover-up { transition: all 0.3s ease; } /* Smooth transition ke liye */
  .hover-up:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

  /* 📱 MOBILE RESPONSIVE (Strictly for Phone) */
  @media (max-width: 768px) {
    .hover-up:hover { 
      transform: none !important; /* Mobile par card upar niche nahi hoga */
      box-shadow: 0 5px 15px rgba(0,0,0,0.08) !important; /* Par halki shadow dikhegi tap karne par */
    }

    .fw-black { 
      font-size: 1.15rem !important; /* Headings mobile screen ke liye optimized */
    }

    /* Cards ke beech spacing manage karne ke liye */
    .hover-up {
      margin-bottom: 12px;
    }
  }
`}</style>
    </div>
  );
};

export default StudentProfile;