import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlanes } from '../hooks/usePlanes.js';
import { startCheckout } from '../hooks/useSuscripcion.js';
import PlanCard from '../components/PlanCard.js';
import { AlertCircle } from 'lucide-react';

export default function Planes() {
  const navigate = useNavigate();
  const { data: planes, loading } = usePlanes();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlanId(planId);
    setCheckoutLoading(true);
    setError('');

    try {
      const checkoutUrl = await startCheckout(planId);
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al procesar el pago');
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page py-12 text-center">
        <p className="text-mahogany">Cargando planes...</p>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-4xl font-display font-bold text-mahogany text-center mb-4">
        Nuestros Planes
      </h1>
      <p className="text-mahogany text-opacity-70 text-lg text-center mb-12 max-w-2xl mx-auto">
        Elige el plan perfecto para celebrar tu amor con sorpresas especiales cada mes.
      </p>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {planes?.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onSelect={handleSelectPlan}
            isCurrentPlan={false}
          />
        ))}
      </div>

      {checkoutLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-mahogany font-semibold">Redirigiendo a Stripe...</p>
          </div>
        </div>
      )}
    </div>
  );
}
