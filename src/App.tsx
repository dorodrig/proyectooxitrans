import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { LoginPage } from './pages/LoginPage';
import { RegistroPage } from './pages/RegistroPage';
import { DashboardPage } from './pages/DashboardPage';
import { lazy, Suspense } from 'react';
const AdminUsuariosPage = lazy(() => import('./pages/AdminUsuariosPage'));
const AsignarRolesPage = lazy(() => import('./pages/AsignarRolesPage'));
const ControlMaestroPage = lazy(() => import('./pages/ControlMaestroPage'));
const AsignarRegionalPage = lazy(() => import('./pages/AsignarRegionalPage'));
const RegionalesPage = lazy(() => import('./pages/RegionalesPage'));
const CargosPage = lazy(() => import('./pages/CargosPage'));
// La ruta /control-maestro debe ir dentro del return del componente App, no aquí
import HomePage from './pages/HomePage';
import NovedadesPage from './pages/NovedadesPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';


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
            path="/admin/asignar-roles"
            element={
              isAuthenticated ? (
                <Suspense fallback={<div>Cargando...</div>}>
                  <AsignarRolesPage />
                </Suspense>
              ) : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/control-maestro"
            element={
              isAuthenticated ? (
                <Suspense fallback={<div>Cargando...</div>}>
                  <ControlMaestroPage />
                </Suspense>
              ) : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/asignar-regional"
            element={
              isAuthenticated ? (
                <Suspense fallback={<div>Cargando...</div>}>
                  <AsignarRegionalPage />
                </Suspense>
              ) : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/regionales"
            element={
              isAuthenticated ? (
                <Suspense fallback={<div>Cargando...</div>}>
                  <RegionalesPage />
                </Suspense>
              ) : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/cargos"
            element={
              isAuthenticated ? (
                <Suspense fallback={<div>Cargando...</div>}>
                  <CargosPage />
                </Suspense>
              ) : <Navigate to="/login" replace />
            }
          />
          <Route 
            path="/" 
            element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />} 
          />
          <Route
            path="/novedades"
            element={
              isAuthenticated ? <NovedadesPage /> : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
