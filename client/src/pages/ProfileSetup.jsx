import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiHash, FiBook, FiCalendar, FiArrowRight, FiCamera, FiCheckCircle, FiShield } from 'react-icons/fi';

const ProfileSetup = () => {
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState({ 
    roll: '', 
    dept: '', 
    year: '2024',
    semester: '1' 
  });
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadModels = async () => {
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
        console.error("Models failed to load");
      }
    };
    loadModels();
  }, []);

 // Purane handleFaceRegister function ko isse replace karo
  const handleFaceRegister = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    
    setIsRegistering(true);
    try {
      const img = await faceapi.fetchImage(imageSrc);
      
      // 🛡️ ANTI-SPOOFING DETECTOR (Symmetry + Expression logic)
      // Humne .withFaceExpressions() add kiya hai live check karne ke liye
      const detection = await faceapi.detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceExpressions() 
        .withFaceDescriptor();

      if (detection) {
        const { expressions, landmarks } = detection;

        // 1. LIVE CHECK: Asli chehra hamesha thoda move karta hai
        // Phone ki photo mein AI Neutral ya Happy values ko 0 detect karega.
        // Hum safety check 0.1 rakh rahe hain (0 matlab pakka photo hai)
        if (expressions.neutral < 0.1 && expressions.happy < 0.1) {
          alert("Security Error: Live human face not detected! Please do not use photos.");
          return; // Registration stop kar do
        }

        // 2. 2D PHOTO CHECK (Distance Check):
        // Asli chehre mein naak aur thodi ke beech ka angle change hota hai
        const nose = landmarks.getNose();
        const jaw = landmarks.getJawOutline();
        const dist = faceapi.euclideanDistance([nose[3].x, nose[3].y], [jaw[8].x, jaw[8].y]);
        
        // Agar distance bohot kam hai (flat face), toh block karo
        if (dist < 40) {
          alert("Unauthorized: Euclidean Symmetry match failed. Show live face.");
          return;
        }

        const payload = {
          roll: details.roll,
          dept: details.dept,
          year: details.year,
          semester: details.semester,
          descriptor: Array.from(detection.descriptor),
          profileImage: imageSrc
        };
        const token = localStorage.getItem('token');
        
        if (!token) {
          alert("Session expired! Please login again.");
          navigate('/login');
          return;
        }

        await axios.post('http://localhost:5000/api/auth/complete-profile', payload, {
          headers: { 
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });
        navigate('/dashboard');
      } else {
        alert("Face not detected. Ensure good lighting and look directly at camera.");
      }
    } catch (err) {
      console.error("Auth Error:", err);
      alert(err.response?.data?.msg || "Internal Server Error during biometric setup");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="setup-wrapper">
      <div className="setup-glass-card shadow-2xl">
        
        {/* Left Side: Modern Progress Sidebar */}
        <div className="setup-sidebar d-none d-lg-flex">
          <div className="brand-header mb-5">
            <FiShield size={32} className="text-white mb-2" />
            <h4 className="fw-black text-white m-0">AutoFace AI</h4>
          </div>
          
          <div className="step-indicator-list">
            <div className={`step-box ${step === 1 ? 'active' : 'done'}`}>
              <div className="icon-circle">{step > 1 ? <FiCheckCircle /> : '01'}</div>
              <div className="text-label">Personal Details</div>
            </div>
            <div className="connector"></div>
            <div className={`step-box ${step === 2 ? 'active' : ''}`}>
              <div className="icon-circle">02</div>
              <div className="text-label">Biometric Setup</div>
            </div>
          </div>

          <div className="sidebar-footer mt-auto">
             <p className="text-white-50 small m-0">Secure Enrollment Portal</p>
          </div>
        </div>

        {/* Right Side: Form Section */}
        <div className="setup-main-content">
          <div className="form-title-area mb-5">
            <h2 className="fw-black text-dark">Identity Enrollment</h2>
            <div className="accent-line"></div>
          </div>

          {step === 1 ? (
            <div className="animate-in fade-in">
              <div className="custom-input-group mb-4">
                <label className="input-label">Student Identification</label>
                <div className="input-with-icon">
                  <FiHash className="field-icon" />
                  <input type="text" placeholder="Enter Roll Number" value={details.roll} onChange={e => setDetails({...details, roll: e.target.value})} />
                </div>
              </div>

              <div className="custom-input-group mb-4">
                <label className="input-label">Academic Stream</label>
                <div className="input-with-icon">
                  <FiBook className="field-icon" />
                  <select value={details.dept} onChange={e => setDetails({...details, dept: e.target.value})}>
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="IT">Information Technology</option>
                    <option value="Mechanical">Mechanical Engineering</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-5">
                <div className="col-md-6">
                  <label className="input-label">Batch Year</label>
                  <div className="input-with-icon">
                    <FiCalendar className="field-icon" />
                    <select value={details.year} onChange={e => setDetails({...details, year: e.target.value})}>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="input-label">Current Term</label>
                  <div className="input-with-icon">
                    <FiArrowRight className="field-icon" />
                    <select value={details.semester} onChange={e => setDetails({...details, semester: e.target.value})}>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button className="btn-setup-action" onClick={() => details.roll ? setStep(2) : alert("Please complete all fields")}>
                Initialize Face Scan <FiArrowRight className="ms-2" />
              </button>
            </div>
          ) : (
            <div className="animate-in zoom-in text-center">
              {!modelsLoaded ? (
                <div className="loader-box py-5">
                  <div className="spinner-border text-primary mb-3"></div>
                  <p className="fw-bold text-muted">Configuring AI Neural Networks...</p>
                </div>
              ) : (
                <div className="camera-section">
                  <div className="scanner-container mx-auto mb-4">
                    <div className="scan-overlay"></div>
                    <div className="laser-line"></div>
                    <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="webcam-view" />
                  </div>
                  
                  <div className="instruction-pill mb-5">
                    <FiCamera className="me-2" /> Align your face within the frame
                  </div>

                  <div className="d-flex gap-3">
                    <button className="btn-setup-secondary" onClick={() => setStep(1)} disabled={isRegistering}>Go Back</button>
                    <button className="btn-setup-action flex-grow-1" onClick={handleFaceRegister} disabled={isRegistering}>
                      {isRegistering ? 'Processing Identity...' : 'Register Biometrics'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        
        .setup-wrapper { min-height: 100vh; background: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 25px; font-family: 'Plus Jakarta Sans', sans-serif; }
        .setup-glass-card { background: white; width: 100%; max-width: 950px; display: flex; border-radius: 40px; overflow: hidden; min-height: 600px; border: 1px solid #e2e8f0; }
        
        /* Sidebar Styles */
        .setup-sidebar { width: 35%; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 50px; flex-direction: column; }
        .step-box { display: flex; align-items: center; gap: 15px; color: rgba(255,255,255,0.4); transition: 0.4s; }
        .step-box.active { color: white; transform: translateX(10px); }
        .step-box.done { color: #4ade80; }
        .icon-circle { width: 40px; height: 40px; border: 2px solid currentColor; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; }
        .text-label { font-weight: 700; font-size: 0.95rem; }
        .connector { width: 2px; height: 40px; background: rgba(255,255,255,0.1); margin: 5px 0 5px 19px; }
        .fw-black { font-weight: 800; }

        /* Main Content Styles */
        .setup-main-content { width: 65%; padding: 60px; }
        .accent-line { width: 50px; height: 5px; background: #2563eb; border-radius: 10px; margin-top: 10px; }
        
        .input-label { display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; }
        .input-with-icon { position: relative; }
        .field-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #2563eb; }
        .input-with-icon input, .input-with-icon select { width: 100%; padding: 15px 15px 15px 50px; border: 2px solid #f1f5f9; border-radius: 18px; outline: none; transition: 0.3s; background: #f8fafc; font-weight: 600; color: #1e293b; }
        .input-with-icon input:focus { border-color: #2563eb; background: white; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.1); }
        
        .btn-setup-action { background: #2563eb; color: white; border: none; padding: 18px; border-radius: 20px; font-weight: 800; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
        .btn-setup-action:hover { background: #1d4ed8; transform: translateY(-3px); box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.2); }
        .btn-setup-secondary { border: 2px solid #f1f5f9; background: white; padding: 0 30px; border-radius: 20px; font-weight: 700; color: #64748b; transition: 0.3s; }
        .btn-setup-secondary:hover { background: #f8fafc; }

        /* Camera Aesthetics */
        .scanner-container { position: relative; width: 320px; height: 320px; border-radius: 40px; overflow: hidden; border: 6px solid #f1f5f9; }
        .webcam-view { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
        .scan-overlay { position: absolute; inset: 0; border: 2px dashed rgba(37, 99, 235, 0.3); border-radius: 40px; margin: 20px; pointer-events: none; z-index: 5; }
        .laser-line { position: absolute; width: 100%; height: 3px; background: #2563eb; z-index: 10; animation: scanMove 2.5s infinite; box-shadow: 0 0 20px #2563eb; }
        .instruction-pill { display: inline-flex; align-items: center; background: #eff6ff; color: #2563eb; padding: 10px 20px; border-radius: 50px; font-size: 0.85rem; font-weight: 700; border: 1px solid #dbeafe; }

        @keyframes scanMove { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
        @media (max-width: 992px) { .setup-sidebar { display: none !important; } .setup-main-content { width: 100%; padding: 40px; } }
      `}</style>
    </div>
  );
};

export default ProfileSetup;