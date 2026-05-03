import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper" style={{ 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh', 
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: '#1e293b' 
    }}>
      
      {/* --- 1. HEADER WITH "AF" LOGO --- */}
      <nav className="navbar navbar-expand-lg py-3 px-md-5 bg-white border-bottom sticky-top shadow-sm">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center fw-bold fs-3" to="/" style={{ color: '#0f172a', letterSpacing: '-1.5px' }}>
            <div className="logo-box bg-primary text-white rounded-3 me-2 d-flex align-items-center justify-content-center shadow" 
                 style={{ width: '42px', height: '42px', fontSize: '1.1rem', fontWeight: '800' }}>
              AF
            </div>
            AutoFace<span className="text-primary">AI</span>
          </Link>
          <div className="ms-auto d-flex gap-3 align-items-center">
            <button className="btn btn-link text-decoration-none text-secondary fw-semibold d-none d-md-block" onClick={() => navigate('/login')}>Faculty Login</button>
            <button className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm" style={{ transition: '0.3s' }} onClick={() => navigate('/student-signup')}>Join Now</button>
          </div>
        </div>
      </nav>

      {/* --- 2. HERO SECTION --- */}
      <section className="py-5 bg-white">
        <div className="container text-center py-5">
          <div className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3 fw-bold border border-primary border-opacity-25">
            <i className="fas fa-sparkles me-2"></i> Next-Gen Attendance Protocol
          </div>
          <h1 className="display-3 fw-black mb-3">Smart Attendance. <span className="text-primary">Redefined.</span></h1>
          <p className="lead text-muted mx-auto mb-5" style={{ maxWidth: '650px' }}>
            Our AI-driven identity engine ensures 99.8% accuracy using deep-learning 
            facial embeddings. Seamless, secure, and instant.
          </p>

          {/* --- UPDATED PROFESSIONAL CARDS --- */}
          <div className="row g-4 justify-content-center mt-2">
            {/* Faculty Card */}
            <div className="col-lg-5">
              <div className="portal-card h-100 p-5 border-0 shadow-sm position-relative overflow-hidden" 
                   onClick={() => navigate('/login')} 
                   style={{ cursor: 'pointer', borderRadius: '32px', background: '#ffffff' }}>
                
                <div className="position-absolute top-0 end-0 m-4">
                  <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 px-3 py-1">Admin Mode</span>
                </div>

                <div className="icon-wrapper mb-4 d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-4 shadow-sm" 
                     style={{ width: '70px', height: '70px' }}>
                  <i className="fas fa-user-shield fs-2"></i>
                </div>

                <h3 className="fw-bold text-dark mb-3">Faculty Portal</h3>
                <p className="text-muted mb-4 small">Full control over attendance logs, student databases, and analytical reports.</p>
                
                <div className="d-flex flex-wrap gap-2 mb-4 justify-content-center">
                   <span className="badge bg-light text-secondary border px-2 py-1 small">Real-time Logs</span>
                   <span className="badge bg-light text-secondary border px-2 py-1 small">PDF Exports</span>
                   <span className="badge bg-light text-secondary border px-2 py-1 small">Class Analytics</span>
                </div>

                <div className="fw-bold text-primary portal-btn-text">
                  Access Admin Dashboard <i className="fas fa-arrow-right ms-2 transition-icon"></i>
                </div>
              </div>
            </div>

            {/* Student Card */}
            <div className="col-lg-5">
              <div className="portal-card h-100 p-5 shadow-sm border-0 position-relative overflow-hidden" 
                   onClick={() => navigate('/student-login')} 
                   style={{ cursor: 'pointer', borderRadius: '32px', background: '#ffffff' }}>
                
                <div className="position-absolute top-0 end-0 m-4">
                  <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-10 px-3 py-1">Secure ID</span>
                </div>

                <div className="icon-wrapper mb-4 d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-4 shadow-sm" 
                     style={{ width: '70px', height: '70px' }}>
                  <i className="fas fa-face-smile fs-2"></i>
                </div>

                <h3 className="fw-bold text-dark mb-3">Student Hub</h3>
                <p className="text-muted mb-4 small">Personal dashboard to track history and manage biometric face enrollment.</p>

                <div className="d-flex flex-wrap gap-2 mb-4 justify-content-center">
                   <span className="badge bg-light text-secondary border px-2 py-1 small">Face Setup</span>
                   <span className="badge bg-light text-secondary border px-2 py-1 small">History View</span>
                   <span className="badge bg-light text-secondary border px-2 py-1 small">Profile Sync</span>
                </div>

                <div className="fw-bold text-success portal-btn-text">
                  Enter Student Portal <i className="fas fa-arrow-right ms-2 transition-icon"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. INFRASTRUCTURE DETAILS --- */}
      <section className="py-5 border-top" style={{ backgroundColor: '#fcfcfd' }}>
        <div className="container">
          <div className="row g-4 text-center text-md-start">
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-white shadow-sm border">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary"><i className="fas fa-microchip fs-4"></i></div>
                <div>
                  <h6 className="fw-bold mb-0">Face-API.js Engine</h6>
                  <p className="small text-muted mb-0">SSD Mobilenet v1 Detection</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-white shadow-sm border">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success"><i className="fas fa-shield-halved fs-4"></i></div>
                <div>
                  <h6 className="fw-bold mb-0">Identity Privacy</h6>
                  <p className="small text-muted mb-0">Encrypted Vector Storage</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-white shadow-sm border">
                <div className="bg-info bg-opacity-10 p-3 rounded-circle text-info"><i className="fas fa-bolt fs-4"></i></div>
                <div>
                  <h6 className="fw-bold mb-0">Cloud Sync</h6>
                  <p className="small text-muted mb-0">MERN Stack & MongoDB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 text-center border-top bg-white">
        <p className="text-muted small mb-0 fw-medium">© 2026 AutoFace AI Protocol | Developed with Precision</p>
      </footer>

      {/* --- CUSTOM CSS FOR THE POLISH --- */}
      <style>{`
        .fw-black { font-weight: 900; letter-spacing: -2.5px; }
        .portal-card {
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          border: 1px solid #f1f5f9 !important;
        }
        .portal-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 40px 80px rgba(0,0,0,0.06) !important;
          border-color: rgba(13, 110, 253, 0.2) !important;
        }
        .portal-card:hover .icon-wrapper {
          transform: scale(1.1) rotate(-5deg);
        }
        .portal-card:hover .transition-icon {
          transform: translateX(8px);
        }
        .transition-icon {
          transition: 0.3s ease;
        }
        .icon-wrapper {
          transition: 0.4s ease;
        }
        .btn-primary:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 20px rgba(13, 110, 253, 0.2);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;