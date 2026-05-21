import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import { FiUsers, FiDownload, FiSearch, FiCheck, FiX, FiRefreshCw, FiCamera, FiSave, FiZap } from 'react-icons/fi';

const AttendanceReport = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [teacher, setTeacher] = useState({ name: '', department: '', subject: 'Syncing...' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // 🔄 REAL-TIME FETCH: Fixed for Atlas Sync
  const fetchAttendance = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      const activeSubject = localStorage.getItem('activeSubject') || 'General';

      if (!token) return;

      if (userData) {
        setTeacher({
          name: userData.name || 'Faculty',
          department: userData.department || 'Computer Science',
          subject: activeSubject 
        });
      }

      const res = await axios.get('https://autoface.onrender.com/api/attendance/all-students', {
        headers: { 'x-auth-token': token }
      });
      
      const processed = res.data.map(s => {
        // Log find logic for active subject and date
        const log = s.attendance?.find(a => a.date === selectedDate && a.subject === activeSubject);
        
        const currentStatus = log?.status?.toLowerCase() || '';
        const isVerifiedNow = currentStatus === 'verified' || currentStatus === 'present';
        const isAbsentNow = currentStatus === 'absent';

        return { 
          ...s, 
          isVerified: isVerifiedNow, 
          isAbsent: isAbsentNow,
          logTime: log ? new Date(log.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--:--',
          // Database se real method uthana
          method: log?.method || (isVerifiedNow ? 'QR + FACE_ID' : (isAbsentNow ? 'SYSTEM' : 'PENDING...'))
        };
      });

      setStudents(processed);
    } catch (err) { 
      console.error("Fetch Error:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const finalizeAttendance = async () => {
    if (!window.confirm("Finalize today's attendance? Missing students will be marked ABSENT.")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://autoface.onrender.com/api/attendance/finalize', 
        { subject: teacher.subject }, 
        { headers: { 'x-auth-token': token } }
      );
      alert("Attendance Submitted Successfully! ✅");
      fetchAttendance();
    } catch (err) {
      alert("Submission Error: Make sure you are logged in as Teacher.");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL ATTENDANCE REPORT", 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`FACULTY: ${teacher.name.toUpperCase()}`, 14, 30);
    doc.text(`SUBJECT: ${teacher.subject}`, 14, 40);
    doc.text(`DATE: ${selectedDate}`, 150, 30);

    autoTable(doc, {
      startY: 50,
      head: [['ROLL NO', 'STUDENT NAME', 'STATUS', 'LOG TIME']],
      body: filteredStudents.map(s => [
        s.rollNumber, s.name.toUpperCase(), 
        s.isVerified ? 'PRESENT' : (s.isAbsent ? 'ABSENT' : 'AWAITING'), 
        s.logTime
      ]),
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] }
    });
    doc.save(`Attendance_${teacher.subject}_${selectedDate}.pdf`);
  };
  
  // ⏱️ REAL-TIME SYNC: 3 second interval to detect student check-ins
  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(() => fetchAttendance(true), 3000); 
    return () => clearInterval(interval);
  }, [selectedDate, teacher.subject]);

  const filteredStudents = students.filter(s => 
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.rollNumber || '').includes(searchTerm)
  );

  return (
    <div className="report-wrapper p-4 min-vh-100 bg-faint font-sans">
      <div className="glass-card mb-4 p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="icon-box-primary"><FiZap size={24} /></div>
          <div>
            <h4 className="fw-900 m-0 text-dark tracking-tighter">Attendance Pulse</h4>
            <div className="d-flex align-items-center gap-2 mt-1">
               <input type="date" className="date-pill shadow-none" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
               <span className="subject-badge">{teacher.subject}</span>
            </div>
          </div>
        </div>

        <button onClick={finalizeAttendance} className="btn-main shadow-glow">
          {loading ? <FiRefreshCw className="spin" /> : <FiSave />} SUBMIT DATA
        </button>

        <div className="d-flex gap-2">
            <button onClick={() => fetchAttendance()} className="btn-icon-light">
                <FiRefreshCw className={loading ? 'spin' : ''} />
            </button>
            <button onClick={generatePDF} className="btn-icon-dark"><FiDownload /></button>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {[
          { label: 'Total Enrolled', val: students.length, icon: <FiUsers />, color: 'primary' },
          { label: 'Verified Present', val: students.filter(s => s.isVerified).length, icon: <FiCheck />, color: 'success' },
          { label: 'Auto Absent', val: students.filter(s => s.isAbsent).length, icon: <FiX />, color: 'danger' }
        ].map((item, i) => (
          <div className="col-md-4" key={i}>
            <div className={`stat-card border-top-${item.color}`}>
              <div className={`stat-icon text-${item.color}`}>{item.icon}</div>
              <div className="mt-3">
                <h2 className="fw-900 m-0">{item.val}</h2>
                <p className="text-muted fw-bold smaller text-uppercase m-0">{item.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden shadow-soft">
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-white">
          <h6 className="fw-900 m-0 tracking-tighter"><FiCamera className="me-2 text-primary" /> REAL-TIME MONITORING</h6>
          <div className="search-pill">
            <FiSearch className="text-muted me-2" />
            <input type="text" placeholder="Search..." onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table custom-table align-middle m-0">
            <thead>
              <tr>
                <th className="ps-5">Student Record</th>
                <th className="text-center">Verification Status</th>
                <th className="text-center">Auth Mode</th>
                <th className="text-end pe-5">Log Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? filteredStudents.map((s, idx) => (
                <tr key={idx}>
                  <td className="ps-5">
                    <div className="d-flex align-items-center gap-3">
                      <div className="avatar-frame">
                        <img src={s.profileImage || `https://ui-avatars.com/api/?name=${s.name}`} alt="p" />
                      </div>
                      <div>
                        <div className="fw-800 text-dark smaller">{s.name}</div>
                        <div className="text-muted tiny fw-bold uppercase">ROLL: {s.rollNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className={`status-pill ${s.isVerified ? 'is-verified' : (s.isAbsent ? 'is-absent' : 'is-pending')}`}>
                      {s.isVerified ? 'VERIFIED ✓' : (s.isAbsent ? 'ABSENT ✗' : 'AWAITING')}
                    </span>
                  </td>
                  <td className="text-center"><div className="tiny-badge">{s.method}</div></td>
                  <td className="text-end pe-5 fw-bold text-dark smaller">{s.logTime}</td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="text-center py-5 text-muted fw-bold smaller">NO STUDENTS FOUND</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .bg-faint { background-color: #fcfdfe; }
        .fw-900 { font-weight: 900; }
        .fw-800 { font-weight: 800; }
        .smaller { font-size: 0.75rem; }
        .tiny { font-size: 0.65rem; }
        .tracking-tighter { letter-spacing: -0.04em; }
        .glass-card { background: white; border: 1px solid #edf2f7; border-radius: 24px; transition: 0.3s; }
        .icon-box-primary { background: #0d6efd; color: white; padding: 12px; border-radius: 16px; box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3); }
        .date-pill { border: none; background: #f1f5f9; padding: 6px 14px; border-radius: 100px; font-weight: 700; color: #0d6efd; font-size: 0.75rem; cursor: pointer; }
        .subject-badge { font-size: 0.75rem; font-weight: 800; color: #64748b; background: #f8fafc; padding: 6px 14px; border-radius: 100px; }
        .btn-main { background: #000; color: #fff; border: none; padding: 12px 32px; border-radius: 100px; font-weight: 900; font-size: 0.8rem; transition: 0.3s; display: flex; align-items: center; gap: 8px; }
        .btn-main:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); background: #222; }
        .btn-icon-light { width: 42px; height: 42px; border-radius: 12px; border: 1px solid #edf2f7; background: white; color: #64748b; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-icon-light:hover { background: #f8fafc; color: #0d6efd; }
        .btn-icon-dark { width: 42px; height: 42px; border-radius: 12px; border: none; background: #1e293b; color: white; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .stat-card { background: white; padding: 24px; border-radius: 24px; border: 1px solid #edf2f7; transition: 0.3s; }
        .border-top-primary { border-top: 5px solid #0d6efd; }
        .border-top-success { border-top: 5px solid #10b981; }
        .border-top-danger { border-top: 5px solid #ef4444; }
        .search-pill { background: #f8fafc; padding: 6px 18px; border-radius: 100px; display: flex; align-items: center; border: 1px solid #edf2f7; }
        .search-pill input { border: none; background: none; font-size: 0.8rem; font-weight: 600; outline: none; width: 150px; }
        .status-pill { font-size: 0.6rem; font-weight: 900; padding: 6px 16px; border-radius: 100px; letter-spacing: 0.05em; }
        .is-verified { background: #ecfdf5; color: #10b981; }
        .is-absent { background: #fef2f2; color: #ef4444; }
        .is-pending { background: #f8fafc; color: #94a3b8; border: 1px solid #f1f5f9; }
        .tiny-badge { font-size: 0.6rem; font-weight: 800; background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; }
        .spin { animation: spin 1s infinite linear; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .avatar-frame { width: 48px; height: 48px; border-radius: 14px; overflow: hidden; border: 1px solid #edf2f7; background: #f8fafc; display: flex; align-items: center; justify-content: center; }
        .avatar-frame img { width: 100%; height: 100%; object-fit: cover; }
      `}</style>
    </div>
  );
};

export default AttendanceReport;