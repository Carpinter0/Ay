import React from 'react';
import { Sorpresa } from '../hooks/useSorpresas.js';
import { Sparkles } from 'lucide-react';

interface SorpresaCardProps {
  sorpresa: Sorpresa;
  onOpen?: () => void;
}

export default function SorpresaCard({ sorpresa, onOpen }: SorpresaCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow cursor-pointer group" onClick={onOpen}>
      {sorpresa.imagenUrl && (
        <div className="mb-4 overflow-hidden rounded-lg h-40">
          <img
            src={sorpresa.imagenUrl}
            alt={sorpresa.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="text-xl font-display font-bold text-mahogany flex-1">{sorpresa.titulo}</h3>
        <Sparkles className="w-5 h-5 text-gold flex-shrink-0" />
      </div>

      <p className="text-rose-medium text-sm italic mb-3 line-clamp-2">{sorpresa.teaser}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {sorpresa.etiquetas.slice(0, 2).map((tag, idx) => (
          <span key={idx} className="text-xs bg-rose-soft bg-opacity-20 text-rose-deep px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-mahogany text-opacity-60">
        <span className="capitalize">{sorpresa.tipo}</span>
        {sorpresa.valoracionPromedio && (
          <span className="flex items-center gap-1">
            ⭐ {sorpresa.valoracionPromedio.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
}
