import React, { useContext, useEffect, useState } from 'react';
import { FiCheckCircle, FiActivity, FiAlertTriangle, FiClock, FiCalendar, FiDownload, FiXCircle } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StatsOverview = () => {
  const { authState, refreshUser } = useContext(AuthContext);
  const [localData, setLocalData] = useState([]);

  useEffect(() => {
    const sync = async () => { if (refreshUser) await refreshUser(); };
    sync();
  }, []);

  useEffect(() => {
    const user = authState?.user;
    const records = user?.attendance || user?.student?.attendance || [];
    setLocalData(records);
  }, [authState]);

  // --- ⚡ REAL-TIME LOGIC ---
  const presentRecords = localData.filter(rec => rec.status === "Present");
  const absentRecords = localData.filter(rec => rec.status === "Absent");
  
  const presentCount = presentRecords.length;
  const absentCount = absentRecords.length;
  const totalConducted = localData.length;

  const attendancePerc = totalConducted > 0 
    ? ((presentCount / totalConducted) * 100).toFixed(1) 
    : 0;

  const isLowAttendance = parseFloat(attendancePerc) < 75;

  const getStoredTime = (recId, index) => {
    const storageKey = `attendance_time_${recId || index}`;
    const savedTime = localStorage.getItem(storageKey);
    if (savedTime) return savedTime;
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    localStorage.setItem(storageKey, currentTime);
    return currentTime;
  };

  const todayDate = new Date().toISOString().split('T')[0]; 
  const todaysLectures = localData.filter(rec => rec.date === todayDate).slice(0, 6);

  // --- ⚡ UPDATED EXCEL WITH DETAILS ---
  const handleExcel = () => {
    const header = [
      ["ATTENDANCE VERIFICATION REPORT"],
      [`Student Name: ${authState?.user?.name || "N/A"}`],
      [`Roll No: ${authState?.user?.rollNo || "N/A"}`],
      [`Branch: ${authState?.user?.branch || "N/A"}`],
      [`Overall Attendance: ${attendancePerc}%`],
      [""],
      ["#", "Subject", "Date", "Scan Time", "Status"]
    ];

    const body = localData.map((rec, i) => [
      i + 1, 
      rec.subject, 
      rec.date, 
      getStoredTime(rec._id, i), 
      rec.status.toUpperCase()
    ]);

    const ws = XLSX.utils.aoa_to_sheet([...header, ...body]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Attendance_${authState?.user?.name}.xlsx`);
  };

  // --- ⚡ UPDATED PDF WITH DETAILS ---
  const handlePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Attendance Verification Report", 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Student Name: ${authState?.user?.name || "N/A"}`, 14, 30);
    doc.text(`Roll No: ${authState?.user?.rollNo || "N/A"}`, 14, 36);
    doc.text(`Branch: ${authState?.user?.branch || "N/A"}`, 14, 42);
    doc.text(`Overall Attendance: ${attendancePerc}%`, 14, 48);

    const tableRows = localData.map((rec, i) => [
      i + 1, 
      rec.subject, 
      rec.date, 
      getStoredTime(rec._id, i), 
      rec.status.toUpperCase()
    ]);

    autoTable(doc, { 
      head: [["#", "Subject", "Date", "Scan Time", "Status"]], 
      body: tableRows, 
      startY: 55,
      theme: 'grid',
      headStyles: { fillColor: [33, 37, 41] }
    });

    doc.save(`Report_${authState?.user?.name}.pdf`);
  };

  return (
    <div className="container-fluid p-0 animate-in fade-in">
      
      {isLowAttendance && totalConducted > 0 && (
        <div className="alert border-0 shadow-sm rounded-4 d-flex align-items-center p-3 mb-4" 
             style={{ background: '#fff5f5', borderLeft: '5px solid #ff4d4f' }}>
          <FiAlertTriangle className="text-danger me-3" size={24} />
          <div>
            <h6 className="fw-black text-danger m-0">Attendance Shortage</h6>
            <p className="small text-dark m-0 opacity-75">Your sync is at <b>{attendancePerc}%</b>. Maintain 75%.</p>
          </div>
        </div>
      )}

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-lg rounded-5 bg-dark text-white p-4 position-relative overflow-hidden h-100">
            <div className="position-absolute top-0 end-0 p-4 opacity-10"><FiActivity size={120} /></div>
            <div className="position-relative z-1">
              <h1 className="display-2 fw-black m-0">{attendancePerc}%</h1>
              <p className="opacity-75 fw-bold mb-4 uppercase tracking-wider">Overall Attendance</p>
              <div className="d-flex gap-2">
                <button onClick={handlePDF} className="btn btn-sm btn-outline-light rounded-pill px-3 border-opacity-50"><FiDownload /> PDF</button>
                <button onClick={handleExcel} className="btn btn-sm btn-outline-light rounded-pill px-3 border-opacity-50"><FiDownload /> Excel</button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm rounded-5 p-4 bg-white text-center h-100 border border-light">
            <h6 className="fw-black text-muted small tracking-widest text-uppercase mb-2">Present</h6>
            <h2 className="fw-black display-5 text-dark">{presentCount}</h2>
            <div className="small text-success fw-bold mt-2"><FiCheckCircle /> Verified</div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm rounded-5 p-4 bg-white text-center h-100 border border-light">
            <h6 className="fw-black text-muted small tracking-widest text-uppercase mb-2">Absent</h6>
            <h2 className="fw-black display-5 text-dark">{absentCount}</h2>
            <div className="small text-danger fw-bold mt-2"><FiXCircle /> By Teacher</div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-5 bg-white p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h5 className="fw-black m-0">Today's Verified Lectures</h5>
          <span className="badge bg-light text-dark border rounded-pill px-3 py-2 fw-bold">
            <FiCalendar className="me-1 text-primary" /> {todayDate}
          </span>
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="text-muted small uppercase fw-bold">
                <th className="border-0 pb-3">Subject & Faculty</th>
                <th className="border-0 pb-3 text-center">Scan Time</th>
                <th className="border-0 pb-3 text-end">Status</th>
              </tr>
            </thead>
            <tbody>
              {todaysLectures.length > 0 ? (
                todaysLectures.map((rec, i) => (
                  <tr key={i} className="hover-row">
                    <td className="border-0 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary"><FiClock /></div>
                        <div>
                          <div className="fw-black text-dark">{rec.subject}</div>
                          <div className="text-muted smaller fw-bold uppercase">Prof. {rec.teacher || "Faculty"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="border-0 text-center text-dark fw-bold small">
                      <div className="bg-light d-inline-block px-3 py-1 rounded-pill">{getStoredTime(rec._id, i)}</div>
                    </td>
                    <td className="border-0 text-end pe-0">
                      <span className={`badge ${rec.status === 'Absent' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} rounded-pill px-4 py-2 fw-black`}>
                        {rec.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="text-center py-5 fw-bold text-muted">No sessions verified for today.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .fw-black { font-weight: 900 !important; } 
        .bg-success-subtle { background: #ecfdf5 !important; color: #059669 !important; }
        .bg-danger-subtle { background: #fff5f5 !important; color: #ff4d4f !important; }
        .smaller { font-size: 0.7rem; }
        .hover-row:hover { background: #f8fafc; transition: 0.3s; }
        @media (max-width: 768px) {
          .display-2 { font-size: 3rem !important; }
          .fw-black { font-size: 1.1rem !important; }
        }
      `}</style>
    </div>
  );
};

export default StatsOverview;