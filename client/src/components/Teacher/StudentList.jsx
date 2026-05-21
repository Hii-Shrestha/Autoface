import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiTrash2, FiEdit, FiRefreshCw, FiCheck, FiX, FiMail, FiBook, FiHash } from 'react-icons/fi';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [editingStudent, setEditingStudent] = useState(null);
  const [editData, setEditData] = useState({ name: '', rollNumber: '', department: '', email: '', semester: '' });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://autoface.onrender.com/api/attendance/all-students', {
        headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
      });
      setStudents(res.data);
    } catch (err) {
      console.error("Fetch error", err.response);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleUpdate = async () => {
    if (!editingStudent) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`https://autoface.onrender.com/api/attendance/update-student/${editingStudent}`, editData, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
      });

      if (res.data) {
        setStudents(prevStudents => 
          prevStudents.map(s => s._id === editingStudent ? { ...s, ...res.data, semester: editData.semester } : s)
        );
        setEditingStudent(null);
        alert("Student Details Updated! ✅");
      }
    } catch (err) { 
      console.error("Update error:", err);
      alert("Update Failed!"); 
    }
  };

  const deleteStudent = async (id) => {
    if (window.confirm("Bhai, pakka delete karna hai? Ye data Atlas se hat jayega.")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://autoface.onrender.com/api/attendance/delete-student/${id}`, {
          headers: { 'x-auth-token': token }
        });
        setStudents(students.filter(s => s._id !== id));
      } catch (err) { alert("Delete failed!"); }
    }
  };

  const filteredStudents = students.filter(s => 
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.rollNumber || '').includes(searchTerm) ||
    (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid px-0 animate-in fade-in">
      {/* 🔝 Update Modal */}
      {editingStudent && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style={{ zIndex: 2000 }}>
          <div className="card border-0 rounded-5 p-4 shadow-lg w-100 mx-3" style={{ maxWidth: '450px' }}>
            <h5 className="fw-black mb-4 text-center text-primary uppercase smaller tracking-widest border-bottom pb-2">Edit Student Profile</h5>
            <div className="row g-2">
              <div className="col-12">
                <input type="text" className="form-control rounded-pill mb-2 fw-bold border-0 bg-light px-4 py-2" placeholder="Full Name" 
                  value={editData.name || ''} 
                  onChange={(e) => setEditData({...editData, name: e.target.value})} 
                />
              </div>
              <div className="col-12">
                <input type="email" className="form-control rounded-pill mb-2 fw-bold border-0 bg-light px-4 py-2" placeholder="Email Address" 
                  value={editData.email || ''} 
                  onChange={(e) => setEditData({...editData, email: e.target.value})} 
                />
              </div>
              <div className="col-6">
                <input type="text" className="form-control rounded-pill mb-2 fw-bold border-0 bg-light px-4 py-2" placeholder="Roll No" 
                  value={editData.rollNumber || ''} 
                  onChange={(e) => setEditData({...editData, rollNumber: e.target.value})} 
                />
              </div>
              <div className="col-6">
                <select className="form-select rounded-pill mb-2 fw-bold border-0 bg-light px-4 py-2" 
                  value={editData.semester || ''} 
                  onChange={(e) => setEditData({...editData, semester: e.target.value})}
                >
                  <option value="">Select Semester</option>
                  {[1,2,3,4,5,6,7,8].map(num => <option key={num} value={num}>{num}th Sem</option>)}
                </select>
              </div>
              <div className="col-12">
                <input type="text" className="form-control rounded-pill mb-4 fw-bold border-0 bg-light px-4 py-2" placeholder="Department" 
                  value={editData.department || ''} 
                  onChange={(e) => setEditData({...editData, department: e.target.value})} 
                />
              </div>
            </div>
            <div className="d-flex gap-2">
              <button onClick={handleUpdate} className="btn btn-primary rounded-pill flex-grow-1 fw-black py-3 border-0 shadow-sm text-uppercase small">Save Changes</button>
              <button onClick={() => setEditingStudent(null)} className="btn btn-light rounded-pill flex-grow-1 fw-black py-3 border-0 text-muted text-uppercase small">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 Clean Header - Link Removed */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-black text-dark m-0 display-6">Student Directory</h2>
          <p className="text-muted small fw-bold m-0 mt-1">Manage and update student records in real-time</p>
        </div>
        <button onClick={fetchStudents} className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
          <FiRefreshCw className={`me-2 ${loading ? 'spinner-border spinner-border-sm border-0' : ''}`} /> Sync Database
        </button>
      </div>

      {/* Search */}
      <div className="mb-4" style={{ maxWidth: '400px' }}>
        <div className="position-relative">
          <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <input type="text" placeholder="Search students by name, roll or email..." className="form-control border-0 shadow-sm rounded-pill ps-5 py-3 fw-bold" onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-lg rounded-5 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
           <thead className="bg-light text-center text-muted smaller fw-black">
             <tr className="text-uppercase tracking-wider">
             <th className="ps-5 py-3 border-0 text-start">Student</th>
             <th className="border-0">Status</th>
             <th className="border-0">Roll Number</th>
             <th className="pe-5 text-end border-0">Time</th>
  </tr>
</thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5 fw-bold text-primary animate-pulse">Fetching Data...</td></tr>
              ) : filteredStudents.map((st) => (
                <tr key={st._id} className="border-bottom border-light text-center">
                  <td className="px-4 py-4 text-start">
                    <div className="d-flex align-items-center gap-3">
                      <div className="avatar rounded-circle overflow-hidden bg-primary-subtle d-flex align-items-center justify-content-center fw-black text-primary border" style={{ width: '45px', height: '45px' }}>
                        {st.profileImage ? <img src={st.profileImage} className="w-100 h-100 object-fit-cover" alt="st" /> : (st.name || 'P').charAt(0)}
                      </div>
                      <div>
                        <p className="m-0 fw-black text-dark small">{st.name}</p>
                        <p className="m-0 text-muted smaller fw-bold uppercase">{st.department || 'CS'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-muted smaller fw-bold">{st.email}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="badge bg-light text-primary border rounded-pill px-3 py-1 small fw-black">{st.rollNumber}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="fw-bold text-dark small">{st.semester ? `${st.semester}th` : 'N/A'}</span>
                  </td>
                  <td className="px-4 py-4 text-end">
                    <button onClick={() => { setEditingStudent(st._id); setEditData({ name: st.name, rollNumber: st.rollNumber, department: st.department, email: st.email, semester: st.semester }); }} className="btn btn-link text-primary p-2 me-1 hover-scale shadow-none">
                      <FiEdit size={18} />
                    </button>
                    <button onClick={() => deleteStudent(st._id)} className="btn btn-link text-danger p-2 hover-scale shadow-none">
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .fw-black { font-weight: 900 !important; } 
        .object-fit-cover { object-fit: cover; }
        .hover-scale:hover { transform: scale(1.1); transition: 0.2s; }
      `}</style>
    </div>
  );
};

export default StudentList;