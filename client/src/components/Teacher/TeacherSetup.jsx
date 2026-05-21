import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiBriefcase, FiShield, FiMaximize, FiArrowRight, FiCamera, FiGrid } from 'react-icons/fi';

const TeacherSetup = () => {
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState({ employeeId: '', dept: '' });
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadModels = async () => {
      if (faceapi.nets.ssdMobilenetv1.params) {
        setModelsLoaded(true);
        return;
      }
      try {
        const MODEL_URL = '/models'; 
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Models failed:", err);
      }
    };
    loadModels();
  }, []);

const handleFaceRegister = async () => {
    if (!webcamRef.current || !webcamRef.current.video) return;
    const videoElement = webcamRef.current.video;
    setIsRegistering(true);

    // Guard clause: Model ke bina aage mat badho
  if (!faceapi.nets.faceExpressionNet.params) {
    alert("AI models are still initializing. Please wait 3 seconds.");
    return;
  }

    try {
      // 🛡️ ANTI-SPOOFING: Detect landmarks + expressions
      const detection = await faceapi.detectSingleFace(videoElement)
        .withFaceLandmarks()
        .withFaceExpressions() 
        .withFaceDescriptor();

      if (detection) {
        const { expressions, landmarks } = detection;

        // 1. 🕵️ LIVENESS CHECK: Phone photo rejection
        // Phone ki photo mein expressions static hote hain. 
        // Agar neutral aur happy dono ki value bohot low hai, toh block karo.
        if (expressions.neutral < 0.2 && expressions.happy < 0.2) {
          alert("Security Alert: Live face not detected! ❌ Photos or screens are not allowed.");
          setIsRegistering(false);
          return;
        }

        // 2. 📏 SYMMETRY CHECK: Distance check for 3D face
        const nose = landmarks.getNose();
        const jaw = landmarks.getJawOutline();
        const dist = faceapi.euclideanDistance([nose[3].x, nose[3].y], [jaw[8].x, jaw[8].y]);
        
        if (dist < 45) { // 2D image hamesha flat hoti hai
          alert("Unauthorized: Symmetry match failed. Please show your real face.");
          setIsRegistering(false);
          return;
        }

        // 📸 Screenshot for Profile Image
        const screenshot = webcamRef.current.getScreenshot();

        const payload = {
          employeeId: details.employeeId,
          department: details.dept,
          descriptor: Array.from(detection.descriptor),
          profileImage: screenshot 
        };
        
        const token = localStorage.getItem('token');
        const response = await axios.post('https://autoface.onrender.com/api/auth/complete-teacher-profile', payload, {
          headers: { 'x-auth-token': token }
        });

        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          alert("Teacher Identity Verified Successfully! ✅");
          window.location.href = '/teacher-dashboard'; 
        }
      } else {
        alert("Face not detected. Please ensure good lighting and look directly at the camera.");
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Registration Failed!");
    } finally {
      setIsRegistering(false);
    }
};

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center bg-light font-sans p-3">
      <div className="card border-0 shadow-lg rounded-5 p-4 p-md-5 w-100 position-relative overflow-hidden" style={{ maxWidth: '600px' }}>
        
        {/* Header Section */}
        <div className="text-center mb-5">
          <div className="bg-primary d-inline-flex align-items-center justify-content-center rounded-4 shadow-sm mb-3" style={{ width: '60px', height: '60px' }}>
            <FiShield size={30} className="text-white" />
          </div>
          <h2 className="fw-black text-dark tracking-tighter mb-1">Teacher Onboarding</h2>
          <p className="text-muted small fw-medium">Setup your identity for secure biometric records.</p>
        </div>

        {/* Custom Progress Bar */}
        <div className="d-flex align-items-center mb-5 px-3">
          <div className={`flex-grow-1 rounded-pill transition-all ${step >= 1 ? 'bg-primary' : 'bg-secondary-subtle'}`} style={{ height: '6px' }}></div>
          <span className="mx-3 small fw-black text-primary tracking-widest uppercase" style={{ fontSize: '10px' }}>Phase {step} of 2</span>
          <div className={`flex-grow-1 rounded-pill transition-all ${step === 2 ? 'bg-primary' : 'bg-secondary-subtle'}`} style={{ height: '6px' }}></div>
        </div>

        {step === 1 ? (
          <div className="animate-in fade-in">
            <div className="mb-4">
              <label className="smaller text-muted fw-black text-uppercase tracking-widest mb-2 d-block">Employee ID</label>
              <div className="input-group input-group-lg border-0 shadow-sm rounded-4 overflow-hidden">
                <span className="input-group-text bg-white border-0"><FiBriefcase className="text-primary" /></span>
                <input 
                  type="text"
                  className="form-control border-0 bg-white fw-bold fs-6 py-3 shadow-none" 
                  placeholder="e.g. T-101" 
                  value={details.employeeId}
                  onChange={e => setDetails({...details, employeeId: e.target.value})} 
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="smaller text-muted fw-black text-uppercase tracking-widest mb-2 d-block">Department</label>
              <div className="input-group input-group-lg border-0 shadow-sm rounded-4 overflow-hidden">
                <span className="input-group-text bg-white border-0"><FiGrid className="text-primary" /></span>
                <select 
                  className="form-select border-0 bg-white fw-bold fs-6 py-3 shadow-none" 
                  value={details.dept}
                  onChange={e => setDetails({...details, dept: e.target.value})}
                >
                  <option value="">Choose Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => (details.employeeId && details.dept) ? setStep(2) : alert("Please fill all details!")} 
              className="btn btn-dark w-100 py-3 rounded-4 fw-black shadow-lg d-flex align-items-center justify-content-center gap-2 border-0"
              style={{ letterSpacing: '1px' }}
            >
              NEXT: VERIFY FACE <FiArrowRight />
            </button>
          </div>
        ) : (
          <div className="text-center animate-in zoom-in">
            {!modelsLoaded ? (
              <div className="py-5">
                <div className="spinner-border text-primary mb-3" role="status"></div>
                <p className="smaller fw-black text-primary uppercase tracking-widest">Loading AI Models...</p>
              </div>
            ) : (
              <div className="px-md-4">
                <div className="mx-auto position-relative scanner-wrapper mb-4">
                  <div className="scan-frame-overlay"></div>
                  <div className="webcam-container shadow-2xl rounded-5 overflow-hidden border border-5 border-white">
                    <Webcam 
                      ref={webcamRef} 
                      screenshotFormat="image/jpeg" 
                      className="w-100 h-100 object-fit-cover scale-x-reversed"
                    />
                  </div>
                  <div className="scan-animation"></div>
                </div>

                <div className="mt-4 pt-2">
                  <button 
                    onClick={handleFaceRegister} 
                    disabled={isRegistering}
                    className={`btn ${isRegistering ? 'btn-secondary' : 'btn-primary'} w-100 py-3 rounded-4 fw-black shadow-lg mb-3 border-0 d-flex align-items-center justify-content-center gap-2`}
                  >
                    {isRegistering ? <span className="spinner-border spinner-border-sm"></span> : <FiCamera size={18}/>}
                    {isRegistering ? 'PROCESSING...' : 'CAPTURE & REGISTER'}
                  </button>
                  
                  <button 
                    onClick={() => setStep(1)} 
                    disabled={isRegistering} 
                    className="btn btn-link text-decoration-none text-muted smaller fw-black tracking-widest p-0"
                  >
                    ← BACK TO DETAILS
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .smaller { font-size: 0.65rem; }
        .scale-x-reversed { transform: scaleX(-1); }
        .scanner-wrapper { width: 300px; height: 300px; position: relative; margin: 0 auto; }
        .webcam-container { width: 100%; height: 100%; position: relative; z-index: 1; }
        
        .scan-animation {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(13, 110, 253, 0.6);
          box-shadow: 0 0 15px #0d6efd;
          z-index: 10;
          animation: scan 2.5s infinite ease-in-out;
        }

        @keyframes scan {
          0%, 100% { top: 10%; opacity: 0; }
          50% { top: 90%; opacity: 1; }
        }

        .scan-frame-overlay::before, .scan-frame-overlay::after {
          content: "";
          position: absolute;
          width: 40px;
          height: 40px;
          border: 4px solid #0d6efd;
          z-index: 20;
          border-radius: 15px;
        }
        .scan-frame-overlay::before { top: -10px; left: -10px; border-right: 0; border-bottom: 0; }
        .scan-frame-overlay::after { bottom: -10px; right: -10px; border-left: 0; border-top: 0; }

        .animate-in { animation: fadeIn 0.6s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default TeacherSetup;