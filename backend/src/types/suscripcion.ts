import type { PlanTier } from './usuario';

export interface PagoRegistro {
  stripeInvoiceId: string;
  monto: number;
  moneda: string;
  estado: 'pagado' | 'fallido';
  fecha: string;
}

export type EstadoSuscripcion = 'activa' | 'cancelada' | 'pausada' | 'trial' | 'past_due';

export interface Suscripcion {
  id: string;                          // = stripeSubscriptionId
  usuarioUid: string;
  planId: PlanTier;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  estado: EstadoSuscripcion;
  inicioEn: string;
  proximaFacturaEn: string;
  canceladaEn?: string;
  sorpresasDesbloqueadasIds: string[];
  historialPagos: PagoRegistro[];
}
