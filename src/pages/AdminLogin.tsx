import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../authContext';
import { adminApiService } from '../adminApi';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { loginAdmin } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminApiService.login(username, password);
      
if (response.success) {
  loginAdmin(response.admin_token, response.username);
  navigate('/admin/dashboard');
}
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d47a1] to-[#1565c0] relative overflow-hidden">
      {/* Circuit Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-lg transform rotate-45"></div>
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 border-2 border-white transform -rotate-12"></div>
        <div className="absolute bottom-40 right-40 w-20 h-20 border-2 border-white rounded-lg"></div>
        
        {/* Circuit Lines */}
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/20 transform -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/20 transform -translate-y-1/2"></div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white"></div>
      <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white"></div>
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-white"></div>
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-white/80">Command Center Authentication</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-400 rounded-lg text-red-100">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Authentication Error</span>
                </div>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username.trim() || !password.trim()}
              className="w-full bg-white text-[#0d47a1] py-3 px-4 rounded-lg font-semibold hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0d47a1] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0d47a1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </div>
              ) : (
                '🔐 Access Command Center'
              )}
            </button>
          </form>

          {/* Demo Credentials Note */}
          <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-400 rounded-lg text-yellow-100">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Demo Access</span>
            </div>
            <p className="mt-1 text-sm">Username: <code>admin</code> | Password: <code>admin123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;