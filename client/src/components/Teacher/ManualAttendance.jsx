import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthContext } from '../../context/AuthContext';
import { FiSearch, FiSave, FiDownload, FiUsers, FiUserCheck, FiUserX, FiEdit3, FiLock, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const ManualAttendance = () => {
  const { authState } = useContext(AuthContext);
  const teacher = authState?.user;

  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [isSubmitted, setIsSubmitted] = useState(false); 
  const [isLocked, setIsLocked] = useState(false);      
  
  const [selectedSubject, setSelectedSubject] = useState('Cyber Security');
  const subjects = ["Cyber Security", "Operating System ", "Data Structures ", "Advanced Mathematics", "Physics"];

  const handleRefresh = () => {
    if (isSubmitted && !isLocked) {
      if (!window.confirm("Attendance lag chuki hai par lock nahi hui. Kya aap naya session start karna chahte hain?")) return;
    }
    setAttendanceData({});
    setIsSubmitted(false);
    setIsLocked(false);
    alert("Board Refreshed! Ab aap nayi attendance laga sakte hain. 🔄");
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/attendance/all-students', {
          headers: { 'x-auth-token': token }
        });
        const onlyStudents = res.data.filter(u => u.role.trim() === 'student');
        setStudents(onlyStudents);
      } catch (err) { console.error(err); }
    };
    fetchStudents();
  }, []);

  const markLocal = (id, status) => {
    if (isLocked) return; 
    setAttendanceData(prev => ({ ...prev, [id]: status }));
  };

  const handleAction = async () => {
    if (Object.keys(attendanceData).length < students.length) {
      return alert("Pehle sabhi bacho ki attendance mark karein!");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/attendance/bulk-mark', {
        attendance: attendanceData,
        subject: selectedSubject,
        teacherId: teacher?.rollNumber
      }, { headers: { 'x-auth-token': token } });

      if (!isSubmitted) {
        setIsSubmitted(true);
        alert("Attendance Saved! Ab aap PDF download kar sakte hain ya ek baar EDIT kar sakte hain. ✅");
      } else {
        setIsLocked(true);
        alert("Attendance Permanently LOCKED! 🔒");
      }
    } catch (err) {
      alert("Error saving attendance!");
    } finally {
      setLoading(false);
    }
  };

  // 📄 FIXED PDF: Added Teacher Details, Proper Header & Signature
  const generatePDF = () => {
    if (!isSubmitted) {
      return alert("Pehle 'SUBMIT ATTENDANCE' par click karke data save karein! ⚠️");
    }

    const doc = new jsPDF();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // --- Header Background ---
    doc.setFillColor(30, 41, 59); // Dark Slate Blue (Professional)
    doc.rect(0, 0, 210, 45, 'F');

    // --- Report Title ---
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL ATTENDANCE SUMMARY", 14, 20);

    // --- Teacher & Session Details ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`FACULTY: ${teacher?.name?.toUpperCase() || 'N/A'}`, 14, 30);
    doc.text(`EMPLOYEE ID: ${teacher?.rollNumber || 'N/A'}`, 14, 35);
    doc.text(`SUBJECT: ${selectedSubject.toUpperCase()}`, 14, 40);

    doc.text(`DATE: ${dateStr}`, 150, 30);
    doc.text(`GEN. TIME: ${timeStr}`, 150, 35);

    // --- Stats Summary Table ---
    const presentCount = Object.values(attendanceData).filter(v => v === 'present').length;
    const absentCount = Object.values(attendanceData).filter(v => v === 'absent').length;

    autoTable(doc, {
      startY: 50,
      head: [['TOTAL ENROLLED', 'PRESENT COUNT', 'ABSENT COUNT']],
      body: [[students.length, presentCount, absentCount]],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], halign: 'center' },
      styles: { halign: 'center', fontSize: 11, fontStyle: 'bold' },
    });

    // --- Main Attendance Table ---
    const tableBody = filtered.map(s => [
      s.rollNumber,
      s.name.toUpperCase(),
      attendanceData[s._id] === 'present' ? 'PRESENT' : 'ABSENT'
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['ROLL NO', 'STUDENT NAME', 'STATUS']],
      body: tableBody,
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59], halign: 'center' },
      columnStyles: { 0: { halign: 'center' }, 2: { halign: 'center' } },
    });

    // --- Signature Section ---
    const finalY = doc.lastAutoTable.finalY + 35;
    doc.setDrawColor(200, 200, 200);
    doc.line(140, finalY, 195, finalY); // Signature line
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "bold");
    doc.text("Authorized Signature", 150, finalY + 7);

    doc.save(`${selectedSubject}_Attendance_${dateStr}.pdf`);
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="container-fluid p-0 pb-5">
      <div className="px-4 pt-4 d-flex justify-content-end">
        <button onClick={handleRefresh} className="btn btn-outline-primary rounded-pill px-4 fw-black shadow-sm d-flex align-items-center gap-2">
          <FiRefreshCw /> REFRESH BOARD
        </button>
      </div>

      <div className="row g-3 p-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-5 p-3 bg-white">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-light rounded-4 text-primary"><FiUsers size={24}/></div>
              <div><h6 className="m-0 text-muted smaller fw-black">TOTAL</h6><h4 className="fw-black m-0">{students.length}</h4></div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-5 p-3 bg-white">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-light rounded-4 text-success"><FiUserCheck size={24}/></div>
              <div><h6 className="m-0 text-muted smaller fw-black">PRESENT</h6><h4 className="fw-black m-0">{Object.values(attendanceData).filter(v => v === 'present').length}</h4></div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-5 p-3 bg-white">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-light rounded-4 text-danger"><FiUserX size={24}/></div>
              <div><h6 className="m-0 text-muted smaller fw-black">ABSENT</h6><h4 className="fw-black m-0">{Object.values(attendanceData).filter(v => v === 'absent').length}</h4></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 mx-4 rounded-5 shadow-sm mb-4 d-flex justify-content-between align-items-center border">
        <div>
          <h2 className="fw-black m-0 text-dark">Attendance Board</h2>
          <p className="text-muted small fw-bold m-0 uppercase">Teacher: {teacher?.name}</p>
        </div>
        <select disabled={isLocked} className="form-select rounded-4 fw-bold border-light w-auto" onChange={(e) => setSelectedSubject(e.target.value)}>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card border-0 shadow-lg rounded-5 bg-white p-4 mx-4">
        <input type="text" className="form-control bg-light border-0 rounded-pill px-4 py-3 fw-bold mb-4 shadow-none" placeholder="Search student name..." onChange={(e) => setSearchTerm(e.target.value)} />

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="text-muted smaller fw-black uppercase">
                <th>Identity</th>
                <th className="text-center">Control</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id}>
                  <td>
                    <div className="fw-black small">{s.name} <br/><span className="text-muted smaller">{s.rollNumber}</span></div>
                  </td>
                  <td className="text-end">
                    <div className={`btn-group rounded-pill overflow-hidden border ${isLocked ? 'opacity-50' : ''}`}>
                      <button disabled={isLocked} onClick={() => markLocal(s._id, 'present')} className={`btn btn-sm px-4 fw-black ${attendanceData[s._id] === 'present' ? 'btn-success' : 'btn-white text-muted'}`}>PRESENT</button>
                      <button disabled={isLocked} onClick={() => markLocal(s._id, 'absent')} className={`btn btn-sm px-4 fw-black ${attendanceData[s._id] === 'absent' ? 'btn-danger' : 'btn-white text-muted'}`}>ABSENT</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 pt-4 border-top d-flex justify-content-end gap-3 align-items-center">
          <button onClick={generatePDF} className={`btn rounded-pill px-5 py-3 fw-black shadow-sm ${!isSubmitted ? 'btn-light text-muted cursor-not-allowed' : 'btn-dark'}`}>
            {!isSubmitted && <FiAlertCircle className="me-2 text-warning"/>}
            <FiDownload className="me-2"/> DOWNLOAD PDF
          </button>

          {!isLocked && (
            <button onClick={handleAction} disabled={loading} className={`btn rounded-pill px-5 py-3 fw-black shadow-lg ${isSubmitted ? 'btn-warning' : 'btn-primary'}`}>
              {loading ? 'SYNCING...' : isSubmitted ? <><FiEdit3 className="me-2"/> FINALIZE & LOCK</> : <><FiSave className="me-2"/> SUBMIT ATTENDANCE</>}
            </button>
          )}
          {isLocked && <span className="badge bg-danger p-3 rounded-pill fw-black"><FiLock className="me-1"/> RECORDS LOCKED</span>}
        </div>
      </div>
     <style>{`
  .fw-black { font-weight: 900 !important; }
  .smaller { font-size: 0.65rem; }
  .cursor-not-allowed { cursor: not-allowed !important; }

  @media (max-width: 768px) {
    .mx-4.mt-4.p-4 { 
      margin: 10px !important; 
      padding: 12px 15px !important; 
    }
    .d-flex.justify-content-between.align-items-center {
      flex-direction: row !important;
      justify-content: space-between !important;
    }
    button.btn-primary.shadow-sm {
      padding: 5px 12px !important;
      font-size: 0.7rem !important;
    }
    .mt-5.pt-4, .d-flex.gap-3 {
      flex-direction: column !important;
      width: 100% !important;
      gap: 10px !important;
      display: flex !important;
    }
    .btn-dark, .btn-primary, .btn-warning {
      width: 100% !important;
      margin: 0 !important;
      padding: 12px !important;
      border-radius: 10px !important;
    }
  }
`}</style>
    </div>
  );
};

export default ManualAttendance;