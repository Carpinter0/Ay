import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import Landing from './pages/Landing.js';
import Login from './pages/Login.js';
import Registro from './pages/Registro.js';
import Dashboard from './pages/Dashboard.js';
import Planes from './pages/Planes.js';
import MiSuscripcion from './pages/MiSuscripcion.js';
import NotFound from './pages/NotFound.js';
import './styles/globals.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-mahogany">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/planes"
        element={
          <PrivateRoute>
            <Planes />
          </PrivateRoute>
        }
      />
      <Route
        path="/mi-suscripcion"
        element={
          <PrivateRoute>
            <MiSuscripcion />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
