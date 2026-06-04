import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-soft to-cream flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-3xl font-display font-bold text-mahogany text-center mb-8">
            Inicia Sesión
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-mahogany mb-2">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-rose-medium" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-rose-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-deep"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-mahogany mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-rose-medium" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-rose-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-deep"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-center text-mahogany text-opacity-70 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-rose-deep font-semibold hover:text-mahogany">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
