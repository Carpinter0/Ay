import type { PlanTier } from './usuario';

export interface Plan {
  id: PlanTier;
  nombre: string;
  tagline: string;
  descripcion: string;
  precioCOP: number;
  precioUSD: number;
  stripePriceId: string;
  beneficios: string[];
  sorpresasMensuales: number;
  colorAccent: string;
  isActive: boolean;
  orden: number;
}
