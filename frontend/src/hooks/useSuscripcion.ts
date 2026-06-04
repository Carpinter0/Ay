import api from '../lib/api.js';
import { useQuery } from '../lib/queryClient.js';

export interface Suscripcion {
  id: string;
  planId: string;
  estado: string;
  proximaFacturaEn: string;
  inicioEn: string;
  sorpresasDesbloqueadas: string[];
}

export interface Pago {
  monto: number;
  moneda: string;
  estado: string;
  fecha: string;
}

export function useSuscripcion() {
  return useQuery(
    ['suscripcion', 'mia'],
    async () => {
      const response = await api.get<{ success: boolean; data: Suscripcion | null }>(
        '/suscripciones/mia'
      );
      return response.data.data;
    },
    { staleTime: 1000 * 60 * 5 } // 5 minutes
  );
}

export function useSuscripcionStatus() {
  return useQuery(
    ['suscripcion', 'status'],
    async () => {
      const response = await api.get<{
        success: boolean;
        data: { plan: string; activeSuscripcion: Suscripcion | null };
      }>('/suscripciones/status');
      return response.data.data;
    },
    { staleTime: 1000 * 60 * 5 }
  );
}

export async function startCheckout(planId: string) {
  const response = await api.post<{ success: boolean; data: { checkoutUrl: string } }>(
    '/suscripciones/checkout',
    { planId }
  );
  return response.data.data.checkoutUrl;
}

export async function cancelSuscripcion(reason?: string) {
  await api.post('/suscripciones/cancelar', { reason });
}
