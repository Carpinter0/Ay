import React, { useState } from 'react';
import { useSuscripcion, cancelSuscripcion } from '../hooks/useSuscripcion.js';
import { AlertCircle, Calendar, CreditCard, X } from 'lucide-react';

export default function MiSuscripcion() {
  const { data: suscripcion, loading } = useSuscripcion();
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCancel = async () => {
    setCancelLoading(true);
    setError('');

    try {
      await cancelSuscripcion(cancelReason);
      setSuccess('Tu suscripción ha sido cancelada');
      setShowCancelModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cancelar la suscripción');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page py-12 text-center">
        <p className="text-mahogany">Cargando tu suscripción...</p>
      </div>
    );
  }

  if (!suscripcion) {
    return (
      <div className="container-page py-12">
        <div className="card text-center">
          <AlertCircle className="w-12 h-12 text-rose-medium mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-mahogany mb-2">
            No tienes suscripción activa
          </h2>
          <p className="text-mahogany text-opacity-70 mb-6">
            Elige un plan para comenzar a disfrutar de sorpresas mensuales.
          </p>
          <a href="/planes" className="btn-primary inline-block">
            Ver Planes
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12 max-w-2xl">
      <h1 className="text-4xl font-display font-bold text-mahogany mb-8">Mi Suscripción</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      <div className="card mb-8">
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-sm text-mahogany text-opacity-60 mb-1">Estado</p>
            <p className="text-2xl font-display font-bold text-mahogany capitalize">
              {suscripcion.estado}
            </p>
          </div>
          <div>
            <p className="text-sm text-mahogany text-opacity-60 mb-1">Plan</p>
            <p className="text-2xl font-display font-bold text-rose-deep capitalize">
              {suscripcion.planId}
            </p>
          </div>
        </div>

        <div className="space-y-4 border-t border-rose-soft border-opacity-30 pt-6">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-rose-medium" />
            <div>
              <p className="text-sm text-mahogany text-opacity-60">Inicio de Suscripción</p>
              <p className="font-semibold text-mahogany">
                {new Date(suscripcion.inicioEn).toLocaleDateString('es-CO')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <CreditCard className="w-5 h-5 text-gold" />
            <div>
              <p className="text-sm text-mahogany text-opacity-60">Próxima Factura</p>
              <p className="font-semibold text-mahogany">
                {new Date(suscripcion.proximaFacturaEn).toLocaleDateString('es-CO')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowCancelModal(true)}
        className="btn-secondary w-full"
      >
        Cancelar Suscripción
      </button>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-display font-bold text-mahogany">
                Cancelar Suscripción
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-mahogany hover:text-rose-deep"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-mahogany text-opacity-70 mb-4">
              ¿Estás seguro de que deseas cancelar tu suscripción? Perderás acceso a las sorpresas.
            </p>

            <textarea
              placeholder="¿Por qué te vas? (opcional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-3 border border-rose-soft rounded-lg mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-deep"
              rows={3}
            />

            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="btn-ghost flex-1"
              >
                Mantener
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="btn-primary flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelando...' : 'Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
