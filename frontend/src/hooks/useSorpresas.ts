import api from '../lib/api.js';
import { useQuery } from '../lib/queryClient.js';

export interface Sorpresa {
  id: string;
  titulo: string;
  teaser: string;
  descripcion: string;
  tipo: string;
  contenido: string;
  planMinimo: string;
  imagenUrl?: string;
  etiquetas: string[];
  temporada?: string;
  valoracionPromedio?: number;
  creadoEn: string;
}

export function useSorpresas() {
  return useQuery(
    ['sorpresas'],
    async () => {
      const response = await api.get<{ success: boolean; data: Sorpresa[] }>('/sorpresas/del-mes');
      return response.data.data;
    },
    { staleTime: 1000 * 60 * 30 } // 30 minutes
  );
}

export function useSorpresa(id: string) {
  return useQuery(
    ['sorpresa', id],
    async () => {
      const response = await api.get<{ success: boolean; data: Sorpresa }>(`/sorpresas/${id}`);
      return response.data.data;
    },
    { enabled: !!id, staleTime: 1000 * 60 * 30 }
  );
}
