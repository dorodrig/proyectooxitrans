import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { LoginPage } from './pages/LoginPage';
import { RegistroPage } from './pages/RegistroPage';
import { DashboardPage } from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import React, { lazy, Suspense } from 'react';
const AdminUsuariosPage = lazy(() => import('./pages/AdminUsuariosPage'));


function App() {
  const { isAuthenticated, initializeAuth, isLoading } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <span>Cargando autenticación...</span>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
            } 
          />
          <Route 
            path="/registro" 
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <RegistroPage />
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <ForgotPasswordPage />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />
            } 
          />
          <Route
            path="/admin/usuarios"
            element={
              isAuthenticated ? (
                <Suspense fallback={<div>Cargando...</div>}>
                  <AdminUsuariosPage />
                </Suspense>
              ) : <Navigate to="/login" replace />
            }
          />
          <Route 
            path="/" 
            element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
