import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Users } from 'lucide-react';

export default function Landing() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-rose-soft from-10% via-cream to-champagne py-20 md:py-32">
        <div className="container-page text-center">
          <div className="mb-8 animate-float">
            <Heart className="w-16 h-16 text-rose-deep mx-auto" />
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-mahogany mb-4">
            Celebra el amor cada mes
          </h1>
          <p className="text-xl text-mahogany text-opacity-80 mb-8 max-w-2xl mx-auto">
            Sorpresas especiales, momentos inolvidables y experiencias románticas diseñadas para celebrar tu amor.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/registro" className="btn-primary">
              Comienza Hoy
            </Link>
            <Link to="/login" className="btn-secondary">
              Inicia Sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-page">
          <h2 className="text-4xl font-display font-bold text-center text-mahogany mb-16">
            ¿Por qué elegir Ay Amor?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <Sparkles className="w-12 h-12 text-rose-deep mx-auto mb-4" />
              <h3 className="text-2xl font-display font-bold text-mahogany mb-2">Sorpresas Mensuales</h3>
              <p className="text-mahogany text-opacity-70">
                Recibe sorpresas románticas curadas especialmente cada mes para ti y tu pareja.
              </p>
            </div>
            <div className="card text-center">
              <Heart className="w-12 h-12 text-rose-deep mx-auto mb-4" />
              <h3 className="text-2xl font-display font-bold text-mahogany mb-2">Planes Personalizados</h3>
              <p className="text-mahogany text-opacity-70">
                Elige el plan que mejor se adapte a tu estilo de vida y presupuesto.
              </p>
            </div>
            <div className="card text-center">
              <Users className="w-12 h-12 text-rose-deep mx-auto mb-4" />
              <h3 className="text-2xl font-display font-bold text-mahogany mb-2">Comunidad</h3>
              <p className="text-mahogany text-opacity-70">
                Únete a miles de parejas que están celebrando su amor con nosotros.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-mahogany text-cream py-16">
        <div className="container-page text-center">
          <h2 className="text-4xl font-display font-bold mb-6">
            ¿Listo para sorprender a tu amor?
          </h2>
          <p className="text-lg text-cream text-opacity-90 mb-8 max-w-2xl mx-auto">
            Únete a Ay Amor y comienza a celebrar cada momento especial con sorpresas excepcionales.
          </p>
          <Link to="/registro" className="inline-block bg-rose-soft text-mahogany px-8 py-3 rounded-lg font-bold hover:bg-gold transition-colors">
            Registrarse Gratis
          </Link>
        </div>
      </section>
    </div>
  );
}
