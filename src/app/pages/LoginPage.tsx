import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { OFFICES, DIVISIONS } from '../data/mockData';
import { FileText, Shield, User, AlertCircle, Eye, EyeOff, Key, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, signup, users, updateUser } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', office: '', division: '', password: '', role: 'user' as 'admin' | 'user' });
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordForm, setForgotPasswordForm] = useState({ name: '', office: '', division: '', newPassword: '' });
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.office || !form.division || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    let user;
    if (isSignup) {
      // Check if user already exists
      const existingUser = users.find(
        u => u.name.toLowerCase() === form.name.toLowerCase() &&
             u.office === form.office &&
             u.division === form.division
      );
      if (existingUser) {
        setError('An account with this name, office, and division already exists. Please sign in instead.');
        setLoading(false);
        return;
      }
      user = signup(form.name, form.office, form.password, form.role, form.division);
    } else {
      user = login(form.name, form.office, form.password, form.role, form.division);
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

    if (!forgotPasswordForm.name || !forgotPasswordForm.office || !forgotPasswordForm.division || !forgotPasswordForm.newPassword) {
      setForgotPasswordError('Please fill in all fields.');
      return;
    }

    const user = users.find(u => 
      u.name.toLowerCase() === forgotPasswordForm.name.toLowerCase() && 
      u.office === forgotPasswordForm.office &&
      u.division === forgotPasswordForm.division
    );

    if (!user) {
      setForgotPasswordError('No account found with this name and office.');
      return;
    }

    // In a real app, this would send an email or SMS for verification
    // For now, we'll just update the password directly
    updateUser(user.id, { password: forgotPasswordForm.newPassword });
    
    setForgotPasswordSuccess('Password reset successfully! You can now sign in with your new password.');
    setForgotPasswordForm({ name: '', office: '', division: '', newPassword: '' });
    
    // Close modal after 3 seconds
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotPasswordSuccess('');
    }, 3000);
  };

  const fillDemo = (role: 'admin' | 'user') => {
    if (role === 'admin') setForm({ name: 'Maria Santos', office: 'RO-HQ', division: 'FAD', password: 'admin123', role: 'admin' });
    else setForm({ name: 'Juan dela Cruz', office: 'LEY', division: 'FAD', password: 'user123', role: 'user' });
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
          <h2 className="text-gray-800 mb-1 text-xl">{isSignup ? 'Sign Up' : 'Sign In'}</h2>
          <p className="text-gray-500 text-sm mb-6">
            {isSignup ? 'Create your account to access the system' : 'Enter your credentials to access the system'}
          </p>

          {/* Demo buttons */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm hover:bg-indigo-100 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Demo Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('user')}
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
                onClick={() => setIsSignup(false)}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  !isSignup ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSignup(true)}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  isSignup ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Juan dela Cruz"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Office */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Office</label>
              <select
                value={form.office}
                onChange={e => setForm(f => ({ ...f, office: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Select office...</option>
                <option value="RO-HQ">RO-HQ (Regional Office)</option>
                {OFFICES.map(o => (
                  <option key={o.code} value={o.code}>{o.name}</option>
                ))}
              </select>
            </div>

            {/* Division */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Division</label>
              <select
                value={form.division}
                onChange={e => setForm(f => ({ ...f, division: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Select division...</option>
                {DIVISIONS.map(d => (
                  <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Enter your password"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                {(['admin', 'user'] as const).map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role }))}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all ${
                      form.role === role
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

            {/* Error */}
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
              {loading ? (isSignup ? 'Creating account...' : 'Signing in...') : (isSignup ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          {!isSignup && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-blue-400 hover:text-blue-300 text-sm underline"
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
                    setForgotPasswordForm({ name: '', office: '', division: '', newPassword: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={forgotPasswordForm.name}
                    onChange={e => setForgotPasswordForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Office</label>
                  <select
                    value={forgotPasswordForm.office}
                    onChange={e => setForgotPasswordForm(f => ({ ...f, office: e.target.value }))}
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
                    value={forgotPasswordForm.division}
                    onChange={e => setForgotPasswordForm(f => ({ ...f, division: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Select division...</option>
                    {DIVISIONS.map(d => (
                      <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={forgotPasswordForm.newPassword}
                    onChange={e => setForgotPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                    placeholder="Enter new password"
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
