import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-soft to-cream">
      <div className="text-center">
        <h1 className="text-6xl font-display font-bold text-mahogany mb-2">404</h1>
        <p className="text-2xl font-display text-rose-medium mb-4">Página no encontrada</p>
        <p className="text-mahogany text-opacity-70 mb-8">La página que buscas no existe.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <Home className="w-5 h-5" />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
