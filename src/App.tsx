import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './authContext';
import { ToastProvider } from './contexts/ToastContext';
import TeamEntryPage from './pages/TeamEntryPage';
import "./App.css"
import MissionControlPage from './pages/MissionControlPage';
import MissionDetailPage from './pages/MissionDetailPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminSubmissions from './pages/AdminSubmissions';
import AdminTeams from './pages/AdminTeams';
import AdminQuestions from './pages/AdminQuestions';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d47a1] to-[#1565c0] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/enter" replace />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    );
  }

  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
};
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/enter" element={<TeamEntryPage />} />

              {/* Protected User Routes */}
              {/* <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } /> */}

              {/* Default Redirects */}
              <Route path="/" element={<Navigate to="/enter" replace />} />
              <Route path="/mission-control" element={<ProtectedRoute>
                <MissionControlPage />
              </ProtectedRoute>} />

              <Route path="/mission/:id" element={
                <ProtectedRoute>
                  <MissionDetailPage />
                </ProtectedRoute>
              } />
// Add to your :
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />

              <Route path="/admin/submissions" element={
                <AdminRoute>
                  <AdminSubmissions />
                </AdminRoute>
              } />

              <Route path="/admin/teams" element={
                <AdminRoute>
                  <AdminTeams />
                </AdminRoute>
              } />

              <Route path="/admin/questions" element={
                <AdminRoute>
                  <AdminQuestions />
                </AdminRoute>
              } />

              <Route path="*" element={
                <div className="min-h-screen bg-gradient-to-br from-[#0d47a1] to-[#1565c0] flex items-center justify-center">
                  <div className="text-white text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-xl">Page not found</p>
                  </div>
                </div>
              } />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;