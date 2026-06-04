import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Heart } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-rose-soft border-opacity-30 shadow-sm">
      <div className="container-page flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <Heart className="w-6 h-6 text-rose-deep group-hover:text-mahogany transition-colors" />
          <span className="text-2xl font-bold font-display text-mahogany">Ay Amor</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link to="/dashboard" className="text-mahogany hover:text-rose-deep transition-colors font-body">
                Dashboard
              </Link>
              <Link to="/planes" className="text-mahogany hover:text-rose-deep transition-colors font-body">
                Planes
              </Link>
              <Link to="/mi-suscripcion" className="text-mahogany hover:text-rose-deep transition-colors font-body">
                Mi Suscripción
              </Link>
              <button
                onClick={logout}
                className="btn-secondary text-sm"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-mahogany hover:text-rose-deep transition-colors font-body">
                Iniciar Sesión
              </Link>
              <Link to="/registro" className="btn-primary text-sm">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
