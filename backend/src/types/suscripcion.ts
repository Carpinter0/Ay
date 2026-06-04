import { PlanTier } from './usuario.js';

export interface PagoRegistro {
  stripeInvoiceId: string;
  monto: number;
  moneda: string;
  estado: 'pagado' | 'fallido';
  fecha: string; // ISO 8601
}

export type SuscripcionEstado = 'activa' | 'cancelada' | 'pausada' | 'trial' | 'past_due';

export interface Suscripcion {
  id: string; // = stripeSubscriptionId
  usuarioUid: string;
  planId: PlanTier;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  estado: SuscripcionEstado;
  inicioEn: string; // ISO 8601
  proximaFacturaEn: string; // ISO 8601
  canceladaEn?: string; // ISO 8601
  sorpresasDesbloqueadasIds: string[];
  historialPagos: PagoRegistro[];
}
