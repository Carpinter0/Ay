import api from '../lib/api.js';
import { useQuery } from '../lib/queryClient.js';
import { useAuth } from '../context/AuthContext.js';

export interface Plan {
  id: string;
  nombre: string;
  tagline: string;
  descripcion: string;
  precioCOP: number;
  precioUSD: number;
  beneficios: string[];
  sorpresasMensuales: number;
  colorAccent: string;
  orden: number;
}

export function usePlanes() {
  return useQuery(
    ['planes'],
    async () => {
      const response = await api.get<{ success: boolean; data: Plan[] }>('/planes');
      return response.data.data;
    },
    { staleTime: 1000 * 60 * 60 } // 1 hour
  );
}
