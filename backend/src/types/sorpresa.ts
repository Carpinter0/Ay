import { PlanTier } from './usuario.js';

export type TipoSorpresa = 'mensaje' | 'actividad' | 'regalo_digital' | 'reto_pareja' | 'playlist';

export type Temporada = 'san_valentin' | 'aniversarios' | 'navidad' | 'todo_el_año';

export interface Sorpresa {
  id: string;
  titulo: string;
  teaser: string; // Max 80 chars
  descripcion: string;
  tipo: TipoSorpresa;
  contenido: string; // URL or Markdown
  planMinimo: PlanTier;
  imagenUrl?: string;
  etiquetas: string[];
  temporada?: Temporada;
  valoracionPromedio?: number;
  isActive: boolean;
  creadoEn: string; // ISO 8601
}
