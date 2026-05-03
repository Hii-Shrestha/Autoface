import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FiMail, FiLock, FiShield, FiCpu, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiKey, FiActivity, FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';

const Settings = () => {
  const { authState } = useContext(AuthContext);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = authState.user;

  const [showPass, setShowPass] = useState(false);
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '' });
  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
    liveness: true,
    antiSpoof: true
  });

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/auth/update-password', passData, {
        headers: { 'x-auth-token': token }
      });
      alert("Password updated! 🔐");
      setPassData({ oldPassword: '', newPassword: '' });
    } catch (err) {
      alert(err.response?.data?.msg || "Update Failed");
    } finally { setLoading(false); }
  };

  const handleToggle = async (field) => {
    const newVal = !security[field];
    setSecurity(prev => ({ ...prev, [field]: newVal }));
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/auth/update-security', { [field]: newVal }, {
        headers: { 'x-auth-token': token }
      });
    } catch (err) { console.error("Failed to sync security setting"); }
  };

  return (
    <div className="container-fluid px-0 animate-in fade-in pb-5">
      <div className="mb-5">
        <h2 className="fw-black text-dark m-0 tracking-tighter display-6">Security & Access</h2>
        <p className="text-muted fw-medium small">Manage your identity verification and system permissions.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-lg rounded-5 p-4 p-md-5 bg-white h-100">
            <h4 className="fw-black text-dark mb-4 d-flex align-items-center gap-2"><FiShield className="text-primary" /> Identity Verification</h4>
            <div className="verification-card p-4 rounded-5 bg-light border mb-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="d-flex align-items-center gap-3">
                  <div className={`p-3 rounded-4 ${user?.isVerified ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                    {user?.isVerified ? <FiCheckCircle size={24} /> : <FiAlertCircle size={24} />}
                  </div>
                  <div>
                    <h6 className="fw-black m-0 text-dark">Email Authentication</h6>
                    <p className="smaller text-muted fw-bold m-0">{user?.email}</p>
                  </div>
                </div>
                <span className={`badge rounded-pill px-3 py-2 fw-black smaller ${user?.isVerified ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
                  {user?.isVerified ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>
              {!user?.isVerified && (
                <div className="mt-4 pt-3 border-top border-2 border-white">
                  <button onClick={async () => {
                    setVerifying(true);
                    try {
                      await axios.post('http://localhost:5000/api/auth/resend-verification', {}, {
                        headers: { 'x-auth-token': localStorage.getItem('token') }
                      });
                      alert("Sent! 📧");
                    } catch { alert("Error"); }
                    finally { setVerifying(false); }
                  }} disabled={verifying} className="btn btn-white border shadow-sm rounded-4 px-4 py-2 fw-black smaller d-flex align-items-center gap-2">
                    {verifying ? <FiRefreshCw className="spinner" /> : <FiMail />} RESEND LINK
                  </button>
                </div>
              )}
            </div>
            <div className="row g-3">
               <div className="col-md-6">
                  <div className="p-3 border rounded-4 bg-white shadow-sm h-100">
                    <FiKey className="text-primary mb-2" size={20} />
                    <p className="smaller fw-black text-dark mb-1 uppercase">Two-Factor Auth</p>
                    <div className="form-check form-switch mt-2">
                       <input className="form-check-input cursor-pointer" type="checkbox" checked={security.twoFactor} onChange={() => handleToggle('twoFactor')} />
                    </div>
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="p-3 border rounded-4 bg-white shadow-sm h-100">
                    <FiActivity className="text-primary mb-2" size={20} />
                    <p className="smaller fw-black text-dark mb-1 uppercase">Login Alerts</p>
                    <div className="form-check form-switch mt-2">
                       <input className="form-check-input cursor-pointer" type="checkbox" checked={security.loginAlerts} onChange={() => handleToggle('loginAlerts')} />
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-lg rounded-5 p-4 p-md-5 bg-white mb-4">
            <h4 className="fw-black text-dark mb-4 d-flex align-items-center gap-2"><FiLock className="text-danger" /> Credentials</h4>
            <form onSubmit={handlePasswordUpdate}>
              <div className="mb-3">
                <input 
                  type="password" 
                  autoComplete="current-password"
                  className="form-control bg-light border-0 rounded-4 p-3 small fw-bold" 
                  placeholder="Current Password"
                  value={passData.oldPassword}
                  onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                  required 
                />
              </div>
              <div className="mb-4 position-relative">
                <input 
                  type={showPass ? "text" : "password"} 
                  autoComplete="new-password"
                  className="form-control bg-light border-0 rounded-4 p-3 small fw-bold" 
                  placeholder="New Password"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                  required 
                />
                <div className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </div>
              </div>
              <button disabled={loading} type="submit" className="btn btn-danger w-100 py-3 rounded-4 fw-black d-flex align-items-center justify-content-center gap-2">
                {loading ? <FiRefreshCw className="spinner" /> : <FiLock />} UPDATE PASSWORD
              </button>
            </form>
          </div>

          <div className="card border-0 shadow-lg rounded-5 p-4 p-md-5 bg-dark text-white">
            <h4 className="fw-black mb-4 d-flex align-items-center gap-2 text-primary"><FiCpu /> AI Security Engine</h4>
            <div className="form-check form-switch mb-3">
              <input className="form-check-input cursor-pointer" type="checkbox" checked={security.liveness} onChange={() => handleToggle('liveness')} />
              <label className="ms-2 small fw-bold">Live Liveness Detection</label>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input cursor-pointer" type="checkbox" checked={security.antiSpoof} onChange={() => handleToggle('antiSpoof')} />
              <label className="ms-2 small fw-bold">Anomaly Detection</label>
            </div>
          </div>
        </div>
      </div>
      <style>{`.fw-black{font-weight:900!important}.smaller{font-size:.65rem}.cursor-pointer{cursor:pointer}.spinner{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default Settings;