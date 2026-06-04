import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-mahogany text-cream mt-16">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Ay Amor
            </h3>
            <p className="text-cream text-opacity-80">Celebrando el amor cada mes con sorpresas especiales.</p>
          </div>
          <div>
            <h4 className="font-display font-bold mb-4">Enlaces</h4>
            <ul className="space-y-2 text-cream text-opacity-80">
              <li><a href="#" className="hover:text-cream transition-colors">Acerca de</a></li>
              <li><a href="#" className="hover:text-cream transition-colors">Planes</a></li>
              <li><a href="#" className="hover:text-cream transition-colors">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-cream text-opacity-80">
              <li><a href="#" className="hover:text-cream transition-colors">Términos</a></li>
              <li><a href="#" className="hover:text-cream transition-colors">Privacidad</a></li>
              <li><a href="#" className="hover:text-cream transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-cream border-opacity-20 pt-8 text-center text-cream text-opacity-80">
          <p>&copy; {currentYear} Ay Amor. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
