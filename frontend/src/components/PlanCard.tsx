import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Plan } from '../hooks/usePlanes.js';

interface PlanCardProps {
  plan: Plan;
  onSelect: (planId: string) => void;
  isCurrentPlan?: boolean;
}

export default function PlanCard({ plan, onSelect, isCurrentPlan }: PlanCardProps) {
  return (
    <div
      className={`card relative transition-transform hover:scale-105 ${
        isCurrentPlan ? 'ring-2 ring-rose-deep' : ''
      }`}
    >
      {isCurrentPlan && (
        <div className="absolute top-4 right-4 bg-rose-deep text-white px-3 py-1 rounded-full text-xs font-bold">
          Plan Actual
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-display font-bold text-mahogany mb-2">{plan.nombre}</h3>
        <p className="text-rose-medium text-sm italic">{plan.tagline}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-bold text-rose-deep font-display">${plan.precioCOP}</span>
          <span className="text-mahogany text-opacity-60">COP/mes</span>
        </div>
        <p className="text-mahogany text-opacity-70 text-sm">{plan.descripcion}</p>
      </div>

      <div className="mb-8 space-y-3">
        {plan.beneficios.map((beneficio, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-rose-deep flex-shrink-0 mt-0.5" />
            <span className="text-mahogany text-sm">{beneficio}</span>
          </div>
        ))}
        <div className="flex items-start gap-3 pt-2 border-t border-rose-soft border-opacity-30">
          <Heart className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
          <span className="text-mahogany font-semibold text-sm">
            {plan.sorpresasMensuales} sorpresas/mes
          </span>
        </div>
      </div>

      <button onClick={() => onSelect(plan.id)} className="btn-primary w-full">
        {isCurrentPlan ? 'Cambiar Plan' : 'Seleccionar'}
      </button>
    </div>
  );
}

import { Heart } from 'lucide-react';
