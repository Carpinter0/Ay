import type { PlanTier } from './usuario';

export type TipoSorpresa = 'mensaje' | 'actividad' | 'regalo_digital' | 'reto_pareja' | 'playlist';

export type Temporada = 'san_valentin' | 'aniversarios' | 'navidad' | 'todo_el_año';

export interface Sorpresa {
  id: string;
  titulo: string;
  teaser: string;                // Short preview shown before unlock (max 80 chars)
  descripcion: string;
  tipo: TipoSorpresa;
  contenido: string;             // URL or Markdown text
  planMinimo: PlanTier;
  imagenUrl?: string;
  etiquetas: string[];
  temporada?: Temporada;
  valoracionPromedio?: number;   // 1–5
  isActive: boolean;
  creadoEn: string;
}
