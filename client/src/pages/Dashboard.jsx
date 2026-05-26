import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiGrid, FiMaximize, FiFileText, FiUser, FiLogOut, FiMenu, FiSettings, FiBarChart2 } from 'react-icons/fi';
import StatsOverview from '../components/Dashboard/StatsOverview';
import AttendanceFlow from '../components/Dashboard/AttendanceFlow';
import AttendanceHistory from '../components/Dashboard/AttendanceHistory';
import StudentProfile from '../components/Dashboard/StudentProfile';
import SettingsTab from '../components/Dashboard/Settings';
import SubjectMatrix from '../components/Dashboard/SubjectMatrix'; // 👈 Sahi path

const Dashboard = () => {
  const { authState, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <FiGrid /> },
    { id: 'scan', label: 'Mark Attendance', icon: <FiMaximize /> },
    { id: 'subjects', label: 'Subject Matrix', icon: <FiBarChart2 /> },
    { id: 'history', label: 'History', icon: <FiFileText /> },
    { id: 'profile', label: 'My Profile', icon: <FiUser /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings /> },
  ];

  return (
    <div className="container-fluid p-0 vh-100 d-flex flex-column flex-md-row overflow-hidden bg-light">
      
      {/* 📱 Mobile Header */}
      <div className="d-md-none bg-white p-3 shadow-sm d-flex justify-content-between align-items-center" style={{zIndex: 1050}}>
        <h5 className="fw-black text-primary m-0 italic tracking-tighter text-uppercase">AutoFace AI</h5>
        <button className="btn btn-primary border-0 rounded-3 shadow-sm" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMenu">
          <FiMenu size={20} />
        </button>
      </div>

      {/* 💻 Responsive Sidebar */}
      <div className="offcanvas-md offcanvas-start bg-white border-end shadow-sm" tabIndex="-1" id="sidebarMenu" style={{ width: '280px' }}>
        <div className="p-4 h-100 d-flex flex-column">
          <div className="d-none d-md-flex align-items-center gap-3 mb-5 px-2">
            <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-primary-sm" style={{ width: '40px', height: '40px' }}>AF</div>
            <h4 className="fw-black m-0 text-dark tracking-tighter">AutoFace <span className="text-primary fs-6">AI</span></h4>
          </div>

          <nav className="nav flex-column gap-2 flex-grow-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)} 
                data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu"
                className={`nav-link border-0 d-flex align-items-center gap-3 px-4 py-3 rounded-4 transition-all ${activeTab === item.id ? 'bg-primary text-white shadow-sm fw-bold scale-up' : 'text-secondary hover-bg-light'}`}
              >
                {item.icon} <span className="small fw-bold">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-top">
            <button onClick={logout} className="btn btn-link text-danger text-decoration-none fw-bold d-flex align-items-center gap-3 px-4 py-2 w-100 rounded-4 hover-bg-danger-subtle transition-all">
              <FiLogOut size={18} /> <span className="small">Logout Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow-1 overflow-auto p-3 p-md-5">
        <div className="container-fluid p-0">
          <div className="mb-5 d-flex justify-content-between align-items-center">
            <div>
              {/* 💡 GOOGLE AUTH SE AAYA HUA NAME DISPLAY HO RHA HAI */}
              <h2 className="fw-black text-dark mb-1 tracking-tight text-capitalize">
                Hello, {authState?.user?.name || 'Student'}! 👋
              </h2>
              <p className="text-muted fw-medium small mb-0">Portal Status: <span className="text-success font-bold">Secure</span></p>
            </div>
            
            {/* 💡 NAVBAR MAIN AVATAR ELEMENT (Google image ke liye check lagaya) */}
            {authState?.user?.profileImage && (
              <img 
                src={authState.user.profileImage} 
                alt="Google Profile" 
                className="rounded-circle border border-2 border-white shadow-sm d-none d-md-block"
                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
              />
            )}
          </div>

          <div className="animate-in fade-in duration-500">
            {activeTab === 'overview' && <StatsOverview studentData={authState?.user} />}
            {activeTab === 'scan' && <AttendanceFlow user={authState?.user} />}
            {activeTab === 'history' && <AttendanceHistory user={authState?.user} />}
            
            {/* 💡 GOOGLE EMAIL, ROLL, DEPT DYNAMICALLY PASS HONGEY */}
            {activeTab === 'profile' && <StudentProfile user={authState?.user} />}
            
            {/* ⚡ Subject Matrix Tab - Ab ye alag file se load hoga */}
            {activeTab === 'subjects' && <SubjectMatrix user={authState?.user} />}

            {/* ⚙️ Professional Settings */}
            {activeTab === 'settings' && <SettingsTab user={authState?.user} />}
          </div>
        </div>
      </main>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .hover-bg-light:hover { background-color: #f8fafc; color: #0d6efd !important; }
        .hover-bg-danger-subtle:hover { background-color: #fff1f2; }
        .shadow-primary-sm { box-shadow: 0 4px 14px 0 rgba(13, 110, 253, 0.3); }
        .smaller { font-size: 0.72rem; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .hover-up:hover { transform: translateY(-5px); }
        .scale-up { transform: scale(1.02); }
      `}</style>
    </div>
  );
};

export default Dashboard;