import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Please enter the admin username');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter the admin password');
      return;
    }

    setIsLoading(true);

    // Brief smooth transition for responsive feel
    setTimeout(() => {
      const result = login(username, password);
      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please check credentials.');
      }
    }, 250);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-between items-center p-4 sm:p-6 text-slate-100 selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      
      {/* Subtle Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-emerald-800/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Header Branding */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
            ت
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-white block leading-tight">
              Tajneed App
            </span>
            <span className="text-[11px] text-slate-400 block leading-none">
              Ahmadiyya Muslim Jama'at Bangladesh
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Admin Portal</span>
        </div>
      </header>

      {/* Center Login Box */}
      <div className="w-full max-w-md my-auto py-6 relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
          
          {/* Header & Icon */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Admin Authentication
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Sign in to manage tajneed registry, member records, analytics & reports
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-950/60 border border-red-800/80 text-red-200 p-3 rounded-xl flex items-start gap-2.5 text-xs animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username */}
            <div className="space-y-1.5">
              <label 
                htmlFor="admin-username" 
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="admin-password" 
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                >
                  Password
                </label>
                <span className="text-[11px] text-slate-500">Case-sensitive</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 rounded-md transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-admin-submit-login"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-950/50 transition cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-2 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500">
              Session is saved locally in your browser. Log out when using shared devices.
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto py-3 text-center text-xs text-slate-600 relative z-10">
        Tajneed Management System • Ahmadiyya Muslim Jama'at Bangladesh
      </footer>

    </div>
  );
};
