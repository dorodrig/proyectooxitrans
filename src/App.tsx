import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { LoginPage } from './pages/LoginPage';
import PremiumLoginPage from './pages/PremiumLoginPage';
import { RegistroPage } from './pages/RegistroPage';
import { DashboardPage } from './pages/DashboardPage';
import { lazy, Suspense } from 'react';

// Lazy load admin pages
const AdminUsuariosPage = lazy(() => import('./pages/AdminUsuariosPage'));
const AsignarRolesPage = lazy(() => import('./pages/AsignarRolesPage'));
const ControlMaestroPage = lazy(() => import('./pages/ControlMaestroPage'));
const AsignarRegionalPage = lazy(() => import('./pages/AsignarRegionalPage'));
const RegionalesPage = lazy(() => import('./pages/RegionalesPage'));
const CargosPage = lazy(() => import('./pages/CargosPage'));

// Lazy load access control pages
const AccesoPage = lazy(() => import('./pages/AccesoPage'));
const VisitantesPage = lazy(() => import('./pages/VisitantesPage'));
const ReportesPage = lazy(() => import('./pages/ReportesPage'));
const LogsPage = lazy(() => import('./pages/LogsPage'));
const AlertasPage = lazy(() => import('./pages/AlertasPage'));
const ConfiguracionPage = lazy(() => import('./pages/ConfiguracionPage'));

// Main pages
import HomePage from './pages/HomePage';
import NovedadesPage from './pages/NovedadesPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Crear instancia de QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <Router basename="/proyectooxitrans">
        <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <PremiumLoginPage />
            } 
          />
          <Route 
            path="/login-old" 
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
          <Route 
            path="/reset-password" 
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <ResetPasswordPage />
            } 
          />
          
          {/* Control de Acceso Routes */}
          <Route
            path="/acceso"
            element={
              isAuthenticated ? (
                <Suspense fallback={<div>Cargando...</div>}>
                  <AccesoPage />
                </Suspense>
              ) : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/visitantes"
            element={
              isAuthenticated ? (
                <Suspense fallback={<div>Cargando...</div>}>
                  <VisitantesPage />
                </Suspense>
              ) : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/reportes"
            element={
              isAuthenticated ? (
                <Suspense fallback={<div>Cargando...</div>}>
                  <ReportesPage />
                </Suspense>
              ) : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/logs"
            element={
              isAuthenticated ? (
                <Suspense fallback={<div>Cargando...</div>}>
                  <LogsPage />
                </Suspense>
              ) : <Navigate to="/login" replace />
            }
          />
          
          {/* Sistema Routes */}
          <Route
            path="/alertas"
            element={
              isAuthenticated ? (
                <Suspense fallback={<div>Cargando...</div>}>
                  <AlertasPage />
                </Suspense>
              ) : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/configuracion"
            element={
              isAuthenticated ? (
                <Suspense fallback={<div>Cargando...</div>}>
                  <ConfiguracionPage />
                </Suspense>
              ) : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </div>
    </Router>
    </QueryClientProvider>
  );
}

export default App;
