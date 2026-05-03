import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  FiPlus, FiUsers, FiBarChart2, FiSettings, 
  FiLogOut, FiActivity, FiMenu, FiUser, FiUserCheck 
} from 'react-icons/fi'; // 👈 FiUserCheck import kiya
import QRGenerator from '../components/Teacher/QRGenerator';
import AttendanceReport from '../components/Teacher/AttendanceReport';
import StudentList from '../components/Teacher/StudentList';
import Settings from '../components/Teacher/Settings';
import Profile from '../components/Teacher/Profile'; 
import ManualAttendance from '../components/Teacher/ManualAttendance'; // 👈 Import pehle se tha

const TeacherDashboard = () => {
  const { authState, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('generate');
  const user = authState?.user;

  // 📝 Menu Items Update: Manual Attendance yahan add kiya hai
  const menuItems = [
    { id: 'generate', label: 'Generate QR', icon: <FiPlus /> },
    { id: 'students', label: 'Manage Students', icon: <FiUsers /> },
    { id: 'manual', label: 'Manual Attendance', icon: <FiUserCheck /> }, // 👈 Naya Menu Item
    { id: 'reports', label: 'Attendance Reports', icon: <FiBarChart2 /> },
    { id: 'profile', label: 'My Profile', icon: <FiUser /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings /> },
  ];

  return (
    <div className="container-fluid p-0 vh-100 d-flex flex-column flex-md-row overflow-hidden bg-light font-sans">
      
      {/* 📱 Mobile Header */}
      <div className="d-md-none bg-white p-3 shadow-sm d-flex justify-content-between align-items-center" style={{zIndex: 1050}}>
        <h5 className="fw-black text-primary m-0 tracking-tighter uppercase">AutoFace TEACHER</h5>
        <div className="d-flex align-items-center gap-2">
          <div 
            onClick={() => setActiveTab('profile')}
            className="bg-light rounded-circle overflow-hidden border border-primary shadow-sm" 
            style={{ width: '35px', height: '35px', cursor: 'pointer' }}
          >
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Me" className="w-100 h-100 object-fit-cover" />
            ) : (
              <div className="w-100 h-100 d-flex align-items-center justify-content-center fw-black text-primary small">
                {user?.name?.charAt(0)}
              </div>
            )}
          </div>
          <button className="btn btn-primary border-0 rounded-3 shadow-sm" type="button" data-bs-toggle="offcanvas" data-bs-target="#teacherSidebar">
            <FiMenu size={20} />
          </button>
        </div>
      </div>

      {/* 💻 Sidebar Navigation */}
      <div className="offcanvas-md offcanvas-start bg-white border-end shadow-sm" tabIndex="-1" id="teacherSidebar" style={{ width: '280px' }}>
        <div className="p-4 h-100 d-flex flex-column">
          <div className="d-none d-md-flex align-items-center gap-3 mb-4 px-2">
            <div className="bg-primary rounded-4 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: '45px', height: '45px' }}>
              <FiActivity size={24} />
            </div>
            <div>
              <h4 className="fw-black m-0 text-dark tracking-tighter">AutoFace</h4>
              <span className="text-primary fw-bold tracking-widest uppercase" style={{fontSize: '9px'}}>Teacher Portal</span>
            </div>
          </div>

          <nav className="nav flex-column gap-1 flex-grow-1">
            {menuItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)} 
                className={`nav-link border-0 d-flex align-items-center gap-3 px-4 py-3 rounded-4 transition-all ${activeTab === item.id ? 'bg-primary text-white shadow-lg fw-bold scale-up' : 'text-secondary hover-bg-light'}`}
                data-bs-dismiss="offcanvas" 
                data-bs-target="#teacherSidebar"
              >
                {item.icon} <span className="small fw-bold">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-top">
            <div className="d-flex align-items-center gap-3 px-3 mb-4 cursor-pointer hover-lift-sm" onClick={() => setActiveTab('profile')}>
               <div className="bg-light rounded-circle border border-2 border-white shadow-sm overflow-hidden d-flex align-items-center justify-content-center fw-black text-primary" style={{ width: '45px', height: '45px' }}>
                 {user?.profileImage ? (
                   <img src={user.profileImage} alt="Teacher" className="w-100 h-100 object-fit-cover" />
                 ) : (
                   user?.name?.charAt(0) || 'T'
                 )}
               </div>
               <div>
                 <p className="m-0 fw-black text-dark small text-capitalize">{user?.name || 'Instructor'}</p>
                 <p className="m-0 text-muted" style={{fontSize: '10px'}}>Verified Faculty</p>
               </div>
            </div>
            <button onClick={logout} className="btn btn-link text-danger text-decoration-none fw-bold d-flex align-items-center gap-3 px-4 py-3 w-100 rounded-4 hover-bg-danger-subtle transition-all">
              <FiLogOut size={18} /> <span className="small">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🚀 Main Content Area */}
      <main className="flex-grow-1 overflow-auto p-3 p-md-5">
        <div className="container-fluid p-0">
          <div className="animate-in fade-in duration-500">
            {activeTab === 'generate' && <QRGenerator user={user} />}
            {activeTab === 'students' && <StudentList />}
            {activeTab === 'reports' && <AttendanceReport />}
            {activeTab === 'manual' && <ManualAttendance />} 
            {activeTab === 'profile' && <Profile onEdit={() => setActiveTab('settings')} />} 
            {activeTab === 'settings' && <Settings />}
          </div>
        </div>
      </main>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .smaller { font-size: 0.65rem; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .cursor-pointer { cursor: pointer; }
        .hover-bg-light:hover { background-color: #f8fafc; color: #0d6efd !important; }
        .hover-bg-danger-subtle:hover { background-color: #fff1f2; }
        .scale-up { transform: scale(1.02); }
        .object-fit-cover { object-fit: cover; }
        .animate-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;