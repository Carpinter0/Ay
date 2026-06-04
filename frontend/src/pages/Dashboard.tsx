import React from 'react';
import { useSuscripcion } from '../hooks/useSuscripcion.js';
import { useSorpresas } from '../hooks/useSorpresas.js';
import { useCurrentUser } from '../hooks/useUser.js';
import SorpresaCard from '../components/SorpresaCard.js';
import { Heart, Sparkles, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { user } = useCurrentUser();
  const { data: suscripcion, loading: loadingSuscripcion } = useSuscripcion();
  const { data: sorpresas, loading: loadingSorpresas } = useSorpresas();

  if (loadingSuscripcion || loadingSorpresas) {
    return (
      <div className="container-page py-12 text-center">
        <p className="text-mahogany">Cargando tu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold text-mahogany mb-2">
          ¡Hola, {user?.nombre}! 💕
        </h1>
        <p className="text-mahogany text-opacity-70 text-lg">
          Bienvenido a tu dashboard de Ay Amor
        </p>
      </div>

      {/* Subscription Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-rose-deep" />
            <h3 className="text-lg font-display font-bold text-mahogany">Plan Actual</h3>
          </div>
          <p className="text-3xl font-display font-bold text-rose-deep capitalize">
            {user?.plan.toLowerCase()}
          </p>
          {suscripcion && (
            <p className="text-sm text-mahogany text-opacity-60 mt-2">
              Activo desde {new Date(suscripcion.inicioEn).toLocaleDateString('es-CO')}
            </p>
          )}
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-gold" />
            <h3 className="text-lg font-display font-bold text-mahogany">Sorpresas este Mes</h3>
          </div>
          <p className="text-3xl font-display font-bold text-mahogany">
            {sorpresas?.length || 0}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-rose-medium" />
            <h3 className="text-lg font-display font-bold text-mahogany">Próxima Factura</h3>
          </div>
          {suscripcion ? (
            <p className="text-lg text-mahogany font-semibold">
              {new Date(suscripcion.proximaFacturaEn).toLocaleDateString('es-CO')}
            </p>
          ) : (
            <p className="text-mahogany text-opacity-60">Sin suscripción activa</p>
          )}
        </div>
      </div>

      {/* Monthly Surprises */}
      <section>
        <h2 className="text-3xl font-display font-bold text-mahogany mb-8">
          ✨ Sorpresas de este mes
        </h2>
        {sorpresas && sorpresas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorpresas.map((sorpresa) => (
              <SorpresaCard key={sorpresa.id} sorpresa={sorpresa} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-mahogany text-opacity-70">No hay sorpresas disponibles en este momento.</p>
          </div>
        )}
      </section>
    </div>
  );
}
