import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { OFFICES, DIVISIONS } from '../data/mockData';
import { FileText, Shield, User, AlertCircle, Eye, EyeOff, Key, CheckCircle, Mail, Phone } from 'lucide-react';
import { isValidEmail, isValidPhone, validateSignupData } from '../utils/validation';

export default function LoginPage() {
  const { login, loginWithCredential, signup, signupNew, users, updateUser, getUserByEmailOrMobile } = useApp();
  const navigate = useNavigate();

  // Login method: 'legacy' (name/office) or 'modern' (email/mobile)
  const [loginMethod, setLoginMethod] = useState<'legacy' | 'modern'>('legacy');
  
  // Modern login/signup forms
  const [modernForm, setModernForm] = useState({ emailOrMobile: '', password: '' });
  const [modernSignupForm, setModernSignupForm] = useState({ 
    name: '', 
    email: '', 
    mobile: '', 
    password: '',
    confirmPassword: '',
    office: 'RO-HQ',
    division: ''
  });
  
  // Legacy forms
  const [legacyForm, setLegacyForm] = useState({ name: '', office: '', division: '', password: '', role: 'user' as 'admin' | 'user' });
  
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');

  const handleModernSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!modernForm.emailOrMobile || !modernForm.password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const user = loginWithCredential(modernForm.emailOrMobile, modernForm.password);
    setLoading(false);

    if (!user) {
      setError('Invalid email/mobile or password. Please check your details.');
      return;
    }

    navigate(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
  };

  const handleModernSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!modernSignupForm.name || !modernSignupForm.email || !modernSignupForm.mobile || !modernSignupForm.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (modernSignupForm.password !== modernSignupForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const validationErrors = validateSignupData({
      name: modernSignupForm.name,
      email: modernSignupForm.email,
      mobile: modernSignupForm.mobile,
      password: modernSignupForm.password,
    });

    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors)[0]);
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const user = signupNew({
      name: modernSignupForm.name,
      email: modernSignupForm.email,
      mobile: modernSignupForm.mobile,
      password: modernSignupForm.password,
      office: modernSignupForm.office,
      division: modernSignupForm.division,
    });

    setLoading(false);

    if (!user) {
      setError('Email or mobile already registered. Please sign in instead.');
      return;
    }

    navigate('/user/dashboard');
  };

  const handleLegacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!legacyForm.name || !legacyForm.office || !legacyForm.division || !legacyForm.password) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    let user;
    if (isSignup) {
      const existingUser = users.find(
        u => u.name.toLowerCase() === legacyForm.name.toLowerCase() &&
             u.office === legacyForm.office &&
             u.division === legacyForm.division
      );
      if (existingUser) {
        setError('An account with this name, office, and division already exists. Please sign in instead.');
        setLoading(false);
        return;
      }
      user = signup(legacyForm.name, legacyForm.office, legacyForm.password, legacyForm.role, legacyForm.division);
    } else {
      user = login(legacyForm.name, legacyForm.office, legacyForm.password, legacyForm.role, legacyForm.division);
    }
    setLoading(false);
    if (!user) {
      setError(isSignup ? 'Failed to create account. Please try again.' : 'Invalid credentials. Please check your details.');
      return;
    }
    navigate(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError('');
    setForgotPasswordSuccess('');

    if (!forgotPasswordEmail) {
      setForgotPasswordError('Please enter your email address.');
      return;
    }

    const user = getUserByEmailOrMobile(forgotPasswordEmail);

    if (!user) {
      setForgotPasswordError('No account found with this email address.');
      return;
    }

    // In a real app, this would send an email or SMS for verification
    const newPassword = 'temp' + Math.random().toString(36).substring(2, 8);
    updateUser(user.id, { password: newPassword });
    
    setForgotPasswordSuccess(`Password reset successfully! Your temporary password is: ${newPassword}`);
    setForgotPasswordEmail('');
    
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotPasswordSuccess('');
    }, 5000);
  };

  const fillDemoModern = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setModernForm({ emailOrMobile: 'maria.santos@dti.gov.ph', password: 'admin123' });
    } else {
      setModernForm({ emailOrMobile: 'juan.delacruz@dti.gov.ph', password: 'user123' });
    }
  };

  const fillDemoLegacy = (role: 'admin' | 'user') => {
    if (role === 'admin') setLegacyForm({ name: 'Maria Santos', office: 'RO-HQ', division: 'FAD', password: 'admin123', role: 'admin' });
    else setLegacyForm({ name: 'Juan dela Cruz', office: 'LEY', division: 'FAD', password: 'user123', role: 'user' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white mb-1">DTITRS</h1>
          <p className="text-blue-200 text-sm leading-relaxed">
            Department of Trade and Industry<br />Tracker & Reminder System
          </p>
          <div className="mt-2 inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30">
            <span className="text-blue-200 text-xs">Hello Good Day!</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-gray-800 mb-1 text-xl">{isSignup ? 'Sign Up' : 'Sign In'}</h2>
              <p className="text-gray-500 text-sm">
                {isSignup ? 'Create your account to access the system' : 'Enter your credentials to access the system'}
              </p>
            </div>
          </div>

          {/* Login Method Toggle (only for Sign In) */}
          {!isSignup && (
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Login Method</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLoginMethod('legacy')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    loginMethod === 'legacy'
                      ? 'bg-indigo-600 text-white border border-indigo-600'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Name & Office
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('modern')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    loginMethod === 'modern'
                      ? 'bg-indigo-600 text-white border border-indigo-600'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Email / Phone
                </button>
              </div>
            </div>
          )}

          {/* Demo buttons */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => isSignup ? null : (loginMethod === 'modern' ? fillDemoModern('admin') : fillDemoLegacy('admin'))}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm hover:bg-indigo-100 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Demo Admin
            </button>
            <button
              type="button"
              onClick={() => isSignup ? null : (loginMethod === 'modern' ? fillDemoModern('user') : fillDemoLegacy('user'))}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm hover:bg-green-100 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              Demo User
            </button>
          </div>

          {/* Toggle Sign In / Sign Up */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => { setIsSignup(false); setError(''); }}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  !isSignup ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsSignup(true); setError(''); setLoginMethod('modern'); }}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  isSignup ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Modern Form (Email/Mobile) */}
          {!isSignup && loginMethod === 'modern' && (
            <form onSubmit={handleModernSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email or Mobile Number</label>
                <input
                  type="text"
                  value={modernForm.emailOrMobile}
                  onChange={e => setModernForm(f => ({ ...f, emailOrMobile: e.target.value }))}
                  placeholder="e.g. maria@dti.gov.ph or +639171234567"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={modernForm.password}
                  onChange={e => setModernForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Modern Signup Form */}
          {isSignup && loginMethod === 'modern' && (
            <form onSubmit={handleModernSignup} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={modernSignupForm.name}
                  onChange={e => setModernSignupForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Juan dela Cruz"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={modernSignupForm.email}
                  onChange={e => setModernSignupForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. juan@dti.gov.ph"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={modernSignupForm.mobile}
                  onChange={e => setModernSignupForm(f => ({ ...f, mobile: e.target.value }))}
                  placeholder="e.g. +639171234567 or 09171234567"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Office</label>
                <select
                  value={modernSignupForm.office}
                  onChange={e => setModernSignupForm(f => ({ ...f, office: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="RO-HQ">RO-HQ (Regional Office)</option>
                  <option value="LEY">LEYTE</option>
                  <option value="SLPO">SOUTHERN LEYTE</option>
                  <option value="BIL">BILIRAN</option>
                  <option value="SAM">SAMAR</option>
                  <option value="ESPO">EASTERN SAMAR</option>
                  <option value="NSPO">NORTHERN SAMAR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Division (Optional)</label>
                <select
                  value={modernSignupForm.division}
                  onChange={e => setModernSignupForm(f => ({ ...f, division: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select division...</option>
                  <option value="FAD">FAD - Finance and Administrative Division</option>
                  <option value="BDD">BDD - Business Development Division</option>
                  <option value="CPD">CPD - Consumer Protection Division</option>
                  <option value="ORD">ORD - Office of the Regional Director</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={modernSignupForm.password}
                  onChange={e => setModernSignupForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={modernSignupForm.confirmPassword}
                  onChange={e => setModernSignupForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
          )}

          {/* Legacy Form (Name/Office) */}
          {!isSignup && loginMethod === 'legacy' && (
            <form onSubmit={handleLegacySubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={legacyForm.name}
                  onChange={e => setLegacyForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Juan dela Cruz"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Office</label>
                <select
                  value={legacyForm.office}
                  onChange={e => setLegacyForm(f => ({ ...f, office: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select office...</option>
                  <option value="RO-HQ">RO-HQ (Regional Office)</option>
                  {OFFICES.map(o => (
                    <option key={o.code} value={o.code}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Division</label>
                <select
                  value={legacyForm.division}
                  onChange={e => setLegacyForm(f => ({ ...f, division: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select division...</option>
                  {DIVISIONS.map(d => (
                    <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={legacyForm.password}
                  onChange={e => setLegacyForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['admin', 'user'] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setLegacyForm(f => ({ ...f, role }))}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all ${
                        legacyForm.role === role
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      {role === 'admin' ? 'Administrator' : 'Staff / User'}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Legacy Signup Form */}
          {isSignup && loginMethod === 'legacy' && (
            <form onSubmit={handleLegacySubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={legacyForm.name}
                  onChange={e => setLegacyForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Juan dela Cruz"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Office</label>
                <select
                  value={legacyForm.office}
                  onChange={e => setLegacyForm(f => ({ ...f, office: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select office...</option>
                  <option value="RO-HQ">RO-HQ (Regional Office)</option>
                  {OFFICES.map(o => (
                    <option key={o.code} value={o.code}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Division</label>
                <select
                  value={legacyForm.division}
                  onChange={e => setLegacyForm(f => ({ ...f, division: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select division...</option>
                  {DIVISIONS.map(d => (
                    <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={legacyForm.password}
                  onChange={e => setLegacyForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['admin', 'user'] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setLegacyForm(f => ({ ...f, role }))}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all ${
                        legacyForm.role === role
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      {role === 'admin' ? 'Administrator' : 'Staff / User'}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
          )}

          {!isSignup && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Forgot Password?
              </button>
            </div>
          )}
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-800 text-xl flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Reset Password
                </h2>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordError('');
                    setForgotPasswordSuccess('');
                    setForgotPasswordEmail('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={e => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {forgotPasswordError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-red-600 text-sm">{forgotPasswordError}</p>
                  </div>
                )}

                {forgotPasswordSuccess && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-green-600 text-sm">{forgotPasswordSuccess}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  Reset Password
                </button>
              </form>
            </div>
          </div>
        )}

        <p className="text-center text-blue-300 text-xs mt-6">
          Secured system — unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}

