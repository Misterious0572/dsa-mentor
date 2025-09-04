import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { SocketProvider } from './contexts/SocketContext';
import AuthFlow from './components/auth/AuthFlow';
import Dashboard from './components/dashboard/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gray-900">
            <Routes>
              <Route path="/auth" element={<AuthFlow />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </SocketProvider>
      </ProgressProvider>
    </AuthProvider>
  );
}

export default App;
