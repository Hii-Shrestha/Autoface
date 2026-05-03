import React, { useState, useRef, useEffect, useContext } from 'react';
import { QrReader } from 'react-qr-reader';
import { 
  FiCamera, FiCheckCircle, FiUser, FiInfo, FiActivity, 
  FiShield, FiMaximize, FiBookOpen, FiMapPin, FiClock 
} from 'react-icons/fi';
import * as faceapi from 'face-api.js'; 
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const AttendanceFlow = ({ user }) => {
  const { refreshUser } = useContext(AuthContext); 
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [classInfo, setClassInfo] = useState(null);
  const [scanStatus, setScanStatus] = useState("Waiting for QR...");
  const videoRef = useRef(null);

  // ⚡ ONLY RESET SCANNER (No Page Reload)
  const handleResetScanner = () => {
    setScanStatus("Waiting for QR...");
    setLoading(false);
    setClassInfo(null);
    setStep(1);
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
      } catch (err) { console.error("Model load error", err); }
    };
    loadModels();
  }, []);

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { alert("Camera access denied!"); }
  };

  const handleQRScan = (result) => {
    if (result && !loading) {
      setLoading(true);
      setScanStatus("Validating QR...");
      
      try {
        const data = JSON.parse(result);
        const currentTime = Date.now();
        const qrTime = data.tk; 
        const timeDiff = (currentTime - qrTime) / 1000;

        if (timeDiff > 60) {
          setScanStatus("Invalid QR: Expired! ⏱️");
          setLoading(false);
          return;
        }

        if (data.s && data.t) {
          setClassInfo({ 
            subject: data.s, 
            teacher: data.t, 
            room: data.r || "402-B" 
          });
          setScanStatus("QR Validated! Starting Camera...");
          setTimeout(() => {
            setStep(2);
            startCamera();
            setLoading(false);
          }, 1000);
        } else {
          setScanStatus("Invalid QR: Missing Info!");
          setLoading(false);
        }
      } catch (e) {
        setScanStatus("Invalid QR Format!");
        setLoading(false);
      }
    }
  };

  const handleFaceVerify = async () => {
    if (!videoRef.current || !classInfo) {
      alert("QR Data missing! Please scan again.");
      return;
    }
    setLoading(true);
    try {
      const detection = await faceapi.detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        alert("Face detect nahi hua!");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const attendanceData = {
        subject: classInfo.subject,
        teacher: classInfo.teacher,
        status: "Present",
        descriptor: Array.from(detection.descriptor)
      };

      await axios.post('http://localhost:5000/api/attendance/mark', attendanceData, { 
        headers: { 'x-auth-token': token } 
      });

      setStep(3);
      if (refreshUser) await refreshUser();
      setTimeout(() => { window.location.reload(); }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || "Verification Failed!");
    } finally { setLoading(false); }
  };

  useEffect(() => { return () => stopCamera(); }, []);

  return (
    <div className="container py-4 animate-in fade-in">
      <div className="card border-0 shadow-lg rounded-5 overflow-hidden mx-auto" style={{ maxWidth: '900px' }}>
        
        <div className="card-header bg-dark p-4 d-flex justify-content-between align-items-center border-0">
          <div className="d-flex align-items-center gap-2">
            <div className="status-online"></div>
            <span className="text-white fw-bold tracking-widest small uppercase">Secure Attendance Portal</span>
          </div>
          <div className="badge bg-primary rounded-pill px-3 py-2">Step {step} of 3</div>
        </div>

        <div className="card-body p-5">
          {step === 1 && (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 p-2 bg-white shadow-sm" style={{ maxWidth: '300px', borderRadius: '30px', border: scanStatus.includes("Expired") ? '2px dashed #dc3545' : '2px dashed #0d6efd' }}>
                {!scanStatus.includes("Expired") ? (
                  <QrReader 
                    onResult={(res) => res && handleQRScan(res.text)} 
                    constraints={{ facingMode: 'environment' }} 
                    className="w-100 rounded-4" 
                  />
                ) : (
                  <div className="py-5 text-danger">
                    <FiClock size={50} className="mb-2" />
                  </div>
                )}
              </div>
              
              <h4 className={`fw-black tracking-tighter ${scanStatus.includes("Expired") ? 'text-danger' : 'text-dark'}`}>
                {scanStatus}
              </h4>

              {scanStatus.includes("Expired") ? (
                <button 
                  onClick={handleResetScanner} // 👈 Sirf scanner reset karega
                  className="btn btn-outline-danger rounded-pill px-4 py-2 mt-3 fw-bold shadow-sm"
                >
                  Retry Scanner
                </button>
              ) : (
                <p className="text-muted small">Position the classroom QR within the frame.</p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="row g-5 align-items-center">
              <div className="col-lg-6">
                <div className="bg-light p-4 rounded-5 border-start border-5 border-primary mb-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className="badge bg-primary rounded-pill px-3 py-2 fw-black">SESSION ACTIVE</span>
                    <span className="text-muted small fw-bold"><FiMapPin className="me-1"/> Room {classInfo?.room}</span>
                  </div>
                  <div className="mb-4">
                    <label className="text-muted smaller fw-black text-uppercase tracking-widest mb-1 d-block">Subject</label>
                    <h3 className="fw-black text-dark m-0">{classInfo?.subject}</h3>
                  </div>
                  <div className="mb-4">
                    <label className="text-muted smaller fw-black text-uppercase tracking-widest mb-1 d-block">Instructor</label>
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-white p-2 rounded-circle shadow-sm text-primary"><FiUser size={16}/></div>
                      <span className="fw-bold text-dark">{classInfo?.teacher}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleFaceVerify} 
                  disabled={loading}
                  className="btn btn-primary w-100 py-3 rounded-4 fw-black shadow-lg border-0 d-flex align-items-center justify-content-center gap-3"
                >
                  {loading ? <div className="spinner-border spinner-border-sm"></div> : <FiMaximize size={20}/>}
                  {loading ? "VERIFYING..." : "CONFIRM ATTENDANCE"}
                </button>
              </div>

              <div className="col-lg-6 text-center">
                <div className="mx-auto position-relative scanner-container">
                  <video ref={videoRef} autoPlay muted className="video-feed" />
                  <div className="face-guideline"></div>
                  <div className="scan-line"></div>
                </div>
                <p className="mt-3 text-primary smaller fw-black tracking-widest animate-pulse">BIOMETRIC ENGINE READY</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-5">
              <FiCheckCircle size={80} className="text-success mb-4" />
              <h1 className="fw-black text-dark mb-2">Success!</h1>
              <p className="text-muted mb-4">Attendance for <b>{classInfo?.subject}</b> synced.</p>
              <button onClick={() => window.location.reload()} className="btn btn-dark px-5 py-3 rounded-pill fw-black">Done</button>
            </div>
          )}
        </div>
      </div>

<style>{`
  .fw-black { font-weight: 900 !important; }
  .smaller { font-size: 0.7rem; }
  .scanner-container { max-width: 320px; height: 320px; border-radius: 50%; overflow: hidden; border: 8px solid #fff; box-shadow: 0 0 0 4px #0d6efd; position: relative; margin: 0 auto; }
  .video-feed { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
  .scan-line { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: #0d6efd; animation: scanMove 2.5s infinite ease-in-out; }
  @keyframes scanMove { 0%, 100% { top: 0%; } 50% { top: 100%; } }
  @media (max-width: 768px) { .mx-4.mt-4.p-4 { padding: 12px 15px !important; margin: 10px !important; border-radius: 15px !important; } .scanner-container { max-width: 260px; height: 260px; border-width: 5px; } .fw-black { font-size: 1.1rem !important; } .btn { width: 100% !important; padding: 12px !important; } }
`}</style>
    </div>
  );
};

export default AttendanceFlow;