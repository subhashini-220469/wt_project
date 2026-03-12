import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Building, ArrowRight, Briefcase, UserCheck, CheckCircle, Shield, Zap, Users, BarChart3, Star, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import authClient from "../services/authClient";
import '../styles/AuthPage.css';

const AUTH_BASE = "http://localhost:5000";

const AuthPage = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    role: 'user',
    officeName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // State for first-time Google users who need to pick a role
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null); // { accessToken }
  const [selectedRole, setSelectedRole] = useState(null);
  const [googleOfficeName, setGoogleOfficeName] = useState('');
  const [roleLoading, setRoleLoading] = useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    if (pendingGoogleUser) {
        document.title = 'Select Role | HireAI Pro';
    } else {
        document.title = isLogin ? 'Sign In | HireAI Pro' : 'Create Account | HireAI Pro';
    }
  }, [isLogin, pendingGoogleUser]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        `${AUTH_BASE}/api/auth/google`,
        { token: credentialResponse.credential },
        { withCredentials: true }
      );

      localStorage.setItem('accessToken', res.data.accessToken);

      if (res.data.roleRequired) {
        // First-time Google user — show inline role picker
        setPendingGoogleUser({ accessToken: res.data.accessToken });
      } else {
        if (onLoginSuccess) {
          onLoginSuccess(res.data.role || 'user');
        }
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Google Login Failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Login Failed. Please try again.');
  };

  const handleSetRole = async () => {
    if (!selectedRole) return;
    if (selectedRole === 'hr' && !googleOfficeName.trim()) {
        setError('Company name is required for HR recruiters');
        return;
    }
    setRoleLoading(true);
    setError(null);
    try {
      // Use authClient – it attaches the stored access token automatically
      localStorage.setItem('accessToken', pendingGoogleUser.accessToken);
      const res = await authClient.post('/api/auth/set-role', { 
          role: selectedRole,
          officeName: selectedRole === 'hr' ? googleOfficeName : undefined
      });

      localStorage.setItem('accessToken', res.data.accessToken);

      if (onLoginSuccess) {
        onLoginSuccess(res.data.role);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to set role');
    } finally {
      setRoleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Manual client-side validation (noValidate disables browser tooltips)
    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }
    if (!formData.password) {
      setError('Please enter your password.');
      setLoading(false);
      return;
    }
    if (!isLogin && !formData.username.trim()) {
      setError('Please enter your full name.');
      setLoading(false);
      return;
    }
    if (!isLogin && formData.role === 'hr' && !formData.officeName.trim()) {
      setError('Please enter your company name.');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/signin' : '/api/auth/signup';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { ...formData, provider: 'local' };

      const res = await fetch(`${AUTH_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        // Show the specific error from the backend (e.g. "Password must contain at least one uppercase letter")
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      if (isLogin) {
        localStorage.setItem('accessToken', data.accessToken);
        if (onLoginSuccess) {
          onLoginSuccess(data.role || 'user');
        }
        navigate('/');
      } else {
        setIsLogin(true);
        setSuccessMessage('Account created successfully! Please sign in.');
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccessMessage(null);
  };

  // ── Role Selection Screen (first-time Google users) ──────────────────────
  if (pendingGoogleUser) {
    return (
      <div className="auth-container">
        <div className="auth-split">
          <div className="auth-visuals">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="visual-content"
            >
              <h1>Almost There!</h1>
              <p>Tell us how you'll be using the platform so we can personalise your experience.</p>
            </motion.div>
          </div>

          <div className="auth-form-section">
            <div className="form-wrapper">
              <div className="form-header">
                <h2>Pick Your Role</h2>
                <p>You can only set this once, so choose carefully.</p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="error-banner">
                  {error}
                </motion.div>
              )}

              <div className="role-picker-grid">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={`role-card ${selectedRole === 'user' ? 'role-card--selected' : ''}`}
                  onClick={() => setSelectedRole('user')}
                  type="button"
                >
                  <UserCheck size={36} strokeWidth={1.5} />
                  <span className="role-card__title">Candidate</span>
                  <span className="role-card__desc">Browse jobs and apply for positions</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={`role-card ${selectedRole === 'hr' ? 'role-card--selected' : ''}`}
                  onClick={() => setSelectedRole('hr')}
                  type="button"
                >
                  <Briefcase size={36} strokeWidth={1.5} />
                  <span className="role-card__title">HR / Recruiter</span>
                  <span className="role-card__desc">Post jobs and screen candidates</span>
                </motion.button>
              </div>

              <AnimatePresence>
                {selectedRole === 'hr' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="input-group"
                  >
                    <Building className="input-icon" size={18} />
                    <input
                      type="text"
                      placeholder="Enter Company Name"
                      value={googleOfficeName}
                      onChange={(e) => setGoogleOfficeName(e.target.value)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                className="submit-btn"
                style={{ marginTop: '2rem' }}
                onClick={handleSetRole}
                disabled={!selectedRole || roleLoading}
              >
                {roleLoading ? 'Saving...' : 'Continue'}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Login / Signup Screen ────────────────────────────────────────────
  return (
    <div className="auth-container">
      <div className="auth-split">
        {/* Left Side - Professional Visuals */}
        <div className="auth-visuals">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="visual-content"
          >
            <div className="system-badge">
              <span className="badge-dot"></span>
              AI-Powered ATS
            </div>
            <h1>{isLogin ? 'Welcome Back to HireAI Pro' : 'Start Hiring Smarter'}</h1>
            <p>{isLogin
              ? 'Your AI recruitment dashboard is ready. Sign in to continue managing candidates and jobs.'
              : 'Join thousands of companies using AI to find top talent faster than ever.'
            }</p>

            {/* Stats Row */}
            <div className="auth-stats-row">
              <div className="auth-stat">
                <span className="auth-stat__number">10K+</span>
                <span className="auth-stat__label">Resumes Screened</span>
              </div>
              <div className="auth-stat">
                <span className="auth-stat__number">95%</span>
                <span className="auth-stat__label">Match Accuracy</span>
              </div>
              <div className="auth-stat">
                <span className="auth-stat__number">3x</span>
                <span className="auth-stat__label">Faster Hiring</span>
              </div>
            </div>

            {/* Feature List */}
            <div className="auth-features">
              <motion.div className="auth-feature" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <div className="auth-feature__icon"><Zap size={18} /></div>
                <div>
                  <div className="auth-feature__title">AI-Powered Screening</div>
                  <div className="auth-feature__desc">Instantly score resumes against job descriptions</div>
                </div>
              </motion.div>
              <motion.div className="auth-feature" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <div className="auth-feature__icon"><BarChart3 size={18} /></div>
                <div>
                  <div className="auth-feature__title">Smart Analytics</div>
                  <div className="auth-feature__desc">Track hiring metrics and candidate pipelines</div>
                </div>
              </motion.div>
              <motion.div className="auth-feature" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                <div className="auth-feature__icon"><Users size={18} /></div>
                <div>
                  <div className="auth-feature__title">Automated Outreach</div>
                  <div className="auth-feature__desc">Email top candidates automatically</div>
                </div>
              </motion.div>
            </div>

            {/* Trust Badge */}
            <div className="auth-trust">
              <Shield size={14} />
              <span>Enterprise-grade security  •  SOC 2 Compliant  •  GDPR Ready</span>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-section">
          <div className="form-wrapper">
            <div className="form-header">
              <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
              <p>{isLogin ? 'Please enter your credentials to continue.' : 'Fill in your details to get started.'}</p>
            </div>

            {successMessage && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="success-banner">
                <CheckCircle size={18} />
                {successMessage}
              </motion.div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="error-banner">
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    key="signup-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="extra-fields"
                  >
                    <div className="input-group">
                      <User className="input-icon" size={18} />
                      <input
                        type="text"
                        name="username"
                        placeholder="Full Name"
                        required={!isLogin}
                        value={formData.username}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="role-selector">
                      <label>
                        <input
                          type="radio"
                          name="role"
                          value="user"
                          checked={formData.role === 'user'}
                          onChange={handleInputChange}
                        />
                        <span>Candidate</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="role"
                          value="hr"
                          checked={formData.role === 'hr'}
                          onChange={handleInputChange}
                        />
                        <span>HR / Recruiter</span>
                      </label>
                    </div>

                    <AnimatePresence>
                      {formData.role === 'hr' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          className="input-group"
                        >
                          <Building className="input-icon" size={18} />
                          <input
                            type="text"
                            name="officeName"
                            placeholder="Company Name"
                            required={formData.role === 'hr'}
                            value={formData.officeName}
                            onChange={handleInputChange}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="input-group">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="input-group">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>


              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="google-btn-wrapper" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              {googleLoading ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Signing in with Google…</p>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  width="100%"
                  text={isLogin ? "signin_with" : "signup_with"}
                />
              )}
            </div>

            <div className="auth-footer">
              <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button type="button" onClick={toggleMode} className="toggle-btn">
                  {isLogin ? 'Create one' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
