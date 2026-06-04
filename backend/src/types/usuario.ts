export type PlanTier = 'gratuito' | 'romantico' | 'apasionado' | 'eterno';

export interface FechaEspecial {
  nombre: string;           // e.g. "Aniversario", "Cumpleaños de mi amor"
  fecha: string;            // MM-DD (year-agnostic)
  recordarDiasAntes: number;
}

export interface Usuario {
  uid: string;
  email: string;
  nombre: string;
  fotoUrl?: string;
  stripeCustomerId?: string;
  plan: PlanTier;
  suscripcionActivaDesde?: string;   // ISO 8601
  fechasEspeciales?: FechaEspecial[];
  creadoEn: string;                  // ISO 8601
  isActive: boolean;
}
