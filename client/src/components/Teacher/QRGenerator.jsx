import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react'; 
import { FiPlay, FiStopCircle, FiMaximize, FiClock, FiBook, FiInfo } from 'react-icons/fi';

const QRGenerator = ({ user }) => {
  const [activeSession, setActiveSession] = useState(false);
  const [subject, setSubject] = useState('');
  const [tempToken, setTempToken] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(120); 
  const sessionTimer = useRef(null);
  const qrRefresher = useRef(null);

  const handleToggleSession = () => {
    if (!activeSession) {
      if (!subject) return alert("Please select a subject first!");
      
      // ✅ 1. Pehle subject save karo taaki AttendanceReport usey read kar sake
      localStorage.setItem('activeSubject', subject);

      setActiveSession(true);
      setTimeLeft(120); 

      qrRefresher.current = setInterval(() => {
        setTempToken(Date.now());
      }, 30000);

      sessionTimer.current = setTimeout(() => {
        stopSession();
        alert("Session Expired! ⏱️");
      }, 120000);
    } else {
      stopSession();
    }
  };

  const stopSession = () => {
    setActiveSession(false);
    clearInterval(qrRefresher.current);
    clearTimeout(sessionTimer.current);
    // Optional: Session stop hone par subject clear kar sakte hain
    // localStorage.removeItem('activeSubject'); 
  };

  useEffect(() => {
    let interval = null;
    if (activeSession && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      stopSession();
    }
    return () => clearInterval(interval);
  }, [activeSession, timeLeft]);

  const qrData = JSON.stringify({
    s: subject,
    t: user?.name || "Prof. Shivi",
    tk: tempToken
  });

  return (
    <div className="card border-0 shadow-lg rounded-5 overflow-hidden bg-white animate-in fade-in">
      <div className="card-body p-4 p-md-5">
        
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="fw-black text-dark mb-0 tracking-tighter">Session Control</h2>
          </div>
          {activeSession && (
            <div className="bg-primary-subtle text-primary px-4 py-2 rounded-4 fw-black d-flex align-items-center gap-2 animate-pulse">
              <FiClock /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
        
        <div className="row g-5">
          <div className="col-lg-6">
            <div className="mb-4">
              <label className="smaller text-muted fw-black text-uppercase tracking-widest mb-2 d-block ml-1">Active Subject</label>
              <div className="input-group border-0 shadow-sm rounded-4 overflow-hidden">
                <span className="input-group-text bg-light border-0"><FiBook className="text-primary" /></span>
                <select 
                  className="form-select border-0 bg-light fw-bold py-3 shadow-none cursor-pointer"
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={activeSession}
                  value={subject}
                >
                  <option value="">-- Choose Module --</option>
                  <option value="Advanced Mathematics">Advanced Mathematics</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="Data Structures">Data Structures</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Physics">Physics</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleToggleSession}
              className={`btn ${activeSession ? 'btn-danger' : 'btn-primary'} w-100 py-4 rounded-4 fw-black shadow-lg border-0 transition-all transform active:scale-95 mb-4 d-flex align-items-center justify-content-center gap-3`}
            >
              {activeSession ? (
                <><FiStopCircle size={22} /> STOP SESSION</>
              ) : (
                <><FiPlay size={22} /> START ATTENDANCE</>
              )}
            </button>

            <div className="p-4 rounded-4 bg-light border-start border-4 border-primary mt-2">
               <div className="d-flex gap-2 text-primary mb-2">
                 <FiInfo /> <span className="smaller fw-black uppercase tracking-widest">Teacher Guide</span>
               </div>
               <p className="smaller text-muted fw-medium mb-0">
                 The QR code refreshes periodically to ensure security. 
                 Session will auto-terminate after **2 minutes**.
               </p>
            </div>
          </div>

          <div className="col-lg-6 text-center">
            <div className={`qr-display-area d-flex align-items-center justify-content-center rounded-5 transition-all ${activeSession ? 'bg-white border-primary shadow-lg' : 'bg-light border-dashed'}`} 
                 style={{ minHeight: '320px', border: '3px solid' }}>
              
              {activeSession ? (
                <div className="animate-in zoom-in p-3 bg-white">
                  <QRCodeSVG 
                    value={qrData} 
                    size={240} 
                    level={"L"} 
                    includeMargin={false}
                    className="qr-svg-style"
                  />
                  <div className="mt-3">
                    <span className="badge bg-success text-white rounded-pill px-3 py-2 fw-black uppercase tracking-tighter">
                      Live Secured QR
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-muted opacity-50 px-4">
                  <FiMaximize size={60} className="mb-3 mx-auto d-block" />
                  <h5 className="fw-black tracking-tighter">Ready to Broadcast</h5>
                  <p className="smaller fw-medium">Select subject and start session</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .smaller { font-size: 0.65rem; }
        .bg-primary-subtle { background-color: #e0e7ff; }
        .cursor-pointer { cursor: pointer; }
        .qr-display-area { border-color: #f1f5f9; position: relative; overflow: hidden; }
        .qr-svg-style { filter: drop-shadow(0 10px 15px rgba(0,0,0,0.05)); }
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(0.98); } }
      `}</style>
    </div>
  );
};

export default QRGenerator;