import React from 'react';
import { FiBookOpen, FiActivity, FiAlertCircle, FiCheckCircle, FiTrendingUp, FiLayers, FiZap } from 'react-icons/fi';

const SubjectMatrix = ({ user }) => {
  // ⚡ Database se aane wala pura attendance array
  const attendanceData = user?.attendance || [];

  const subjectsList = [
    { id: 'maths', name: "Advanced Mathematics", minReq: 75, color: '#3b82f6' },
    { id: 'cs', name: "Cyber Security", minReq: 75, color: '#10b981' },
    { id: 'os', name: "Operating Systems", minReq: 75, color: '#f59e0b' },
    { id: 'physics', name: "Physics", minReq: 75, color: '#6366f1' },
    { id: 'ds', name: "Data Structures", minReq: 75, color: '#ef4444' },
  ];

  // ⚡ REAL-TIME LOGIC: History se data uthayega taaki kal ki attendance bhi dikhe
  const getSubjectData = (subName) => {
    // Trim aur Lowercase logic taaki DB se mismatch na ho
    const records = attendanceData.filter(a => 
      a.subject?.trim().toLowerCase() === subName.trim().toLowerCase()
    );
    
    const total = records.length; // Isme Present + Absent dono count honge
    const present = records.filter(a => a.status?.toLowerCase() === 'present').length;
    
    if (total === 0) {
      return { percent: 0, ratio: "0/0", isShortage: false, noData: true };
    }

    const percent = Math.round((present / total) * 100);
    return {
      percent,
      ratio: `${present}/${total}`,
      isShortage: percent < 75,
      noData: false
    };
  };

  // Overall attendance calculation across all days
  const totalConducted = attendanceData.length;
  const totalPresent = attendanceData.filter(a => a.status?.toLowerCase() === 'present').length;
  const overallPercent = totalConducted > 0 
    ? Math.round((totalPresent / totalConducted) * 100) 
    : 0;

  return (
    <div className="matrix-container animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="d-flex align-items-center justify-content-between mb-4 px-2">
        <div>
          <h4 className="fw-black text-dark m-0">Subject Matrix</h4>
          <p className="text-muted small">Live biometric tracking enabled</p>
        </div>
        <div className="bg-white px-3 py-2 rounded-pill shadow-sm border d-flex align-items-center gap-2">
          <FiTrendingUp className="text-primary" />
          <span className="smaller fw-black text-uppercase">Overall: {overallPercent}%</span>
        </div>
      </div>

      <div className="row g-4">
        {subjectsList.map((sub) => {
          const { percent, ratio, isShortage, noData } = getSubjectData(sub.name);

          return (
            <div className="col-xl-6" key={sub.id}>
              <div className="card subject-card border-0 shadow-sm rounded-5 p-4 bg-white position-relative overflow-hidden transition-all">
                
                <div className="d-flex justify-content-between align-items-start mb-3 position-relative z-1">
                  <div className="d-flex gap-3 align-items-center">
                    <div className="icon-box-small" style={{ background: `${sub.color}15`, color: sub.color }}>
                      <FiLayers size={20} />
                    </div>
                    <div>
                      <h5 className="fw-black text-dark mb-0">{sub.name}</h5>
                      <span className="text-muted fw-bold" style={{ fontSize: '0.7rem' }}>
                        {noData ? "NO SESSIONS RECORDED" : `LECTURES: ${ratio}`}
                      </span>
                    </div>
                  </div>
                  <div className={`percentage-badge ${noData ? 'neutral' : (isShortage ? 'danger' : 'success')}`}>
                    {percent}%
                  </div>
                </div>

                <div className="my-3 position-relative">
                  <div className="progress rounded-pill bg-light" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar rounded-pill shadow-sm"
                      style={{ 
                        width: `${percent}%`, 
                        backgroundColor: noData ? '#e2e8f0' : sub.color,
                        transition: 'width 1.5s ease-in-out' 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3 position-relative z-1">
                  <div className="d-flex align-items-center gap-2">
                    <FiZap className="text-warning" size={14} />
                    <span className="smaller text-muted fw-bold">MIN REQ: {sub.minReq}%</span>
                  </div>
                  
                  <div className={`status-indicator ${noData ? 'none' : (isShortage ? 'crit' : 'opt')}`}>
                    {noData ? "Waiting for Data" : (isShortage ? <><FiAlertCircle /> Low Attendance</> : <><FiCheckCircle /> Optimal</>)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    <style>{`
      .fw-black { font-weight: 850 !important; }
      .smaller { font-size: 0.7rem; }
      .subject-card { border: 1px solid #f1f5f9 !important; border-radius: 25px !important; }
      .icon-box-small { width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
      .percentage-badge { padding: 6px 14px; border-radius: 12px; font-weight: 800; font-size: 0.95rem; }
      .percentage-badge.success { background: #ecfdf5; color: #059669; }
      .percentage-badge.danger { background: #fff1f2; color: #e11d48; }
      .percentage-badge.neutral { background: #f8fafc; color: #94a3b8; }
      
      .status-indicator { font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 8px; }
      .status-indicator.opt { color: #10b981; background: #f0fdf4; }
      .status-indicator.crit { color: #f43f5e; background: #fff1f2; }
      .status-indicator.none { color: #94a3b8; background: #f1f5f9; }

      @media (max-width: 768px) {
        .subject-card { margin-bottom: 12px !important; padding: 15px !important; }
        .icon-box-small { width: 36px; height: 36px; }
        .percentage-badge { padding: 4px 10px; font-size: 0.8rem; border-radius: 10px; }
        .status-indicator { font-size: 0.65rem; padding: 3px 8px; }
        .d-flex.justify-content-between { align-items: center !important; }
        .smaller { font-size: 0.65rem; }
      }
    `}</style>
    </div>
  );
};

export default SubjectMatrix;