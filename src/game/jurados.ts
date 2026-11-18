import type { Acessorio } from '@/ui/pixel/sprites';

export type JuradoId =
  | 'logico'
  | 'cetico'
  | 'empatico'
  | 'tradicionalista'
  | 'estrategista'
  | 'cientista'
  | 'comerciante'
  | 'artista';

export interface Jurado {
  id: JuradoId;
  nome: string;
  sensibilidade: string;
  /** Quanto custa mudar a opinião dele: 1 = fácil, 3 = difícil. */
  resistencia: number;
  toga: string;
  cabelo: string;
  acessorio: Acessorio;
  corAcessorio: string;
}

// Os 5 primeiros vêm do app do Lovable; os 3 últimos são novos (jurados que mudam, decisão D9).
export const JURADOS: Record<JuradoId, Jurado> = {
  logico: { id: 'logico', nome: 'Lógico', sensibilidade: 'Consistência e premissas', resistencia: 2, toga: '#3d6fd8', cabelo: '#2a1a12', acessorio: 'oculos', corAcessorio: '#9fe8ff' },
  cetico: { id: 'cetico', nome: 'Cético', sensibilidade: 'Evidência e limites', resistencia: 3, toga: '#7d8296', cabelo: '#e6e6ea', acessorio: 'nenhum', corAcessorio: '#000000' },
  empatico: { id: 'empatico', nome: 'Empático', sensibilidade: 'Consequências humanas', resistencia: 1, toga: '#e0587e', cabelo: '#6b3a1e', acessorio: 'nenhum', corAcessorio: '#000000' },
  tradicionalista: { id: 'tradicionalista', nome: 'Tradicionalista', sensibilidade: 'Continuidade e princípios', resistencia: 2, toga: '#7a4bc4', cabelo: '#d8d8d8', acessorio: 'louros', corAcessorio: '#f2c14e' },
  estrategista: { id: 'estrategista', nome: 'Estrategista', sensibilidade: 'Viabilidade e riscos', resistencia: 2, toga: '#1f9e8f', cabelo: '#141018', acessorio: 'nenhum', corAcessorio: '#000000' },
  cientista: { id: 'cientista', nome: 'Cientista', sensibilidade: 'Experimentos e dados novos', resistencia: 2, toga: '#e8ecf4', cabelo: '#b0582a', acessorio: 'protetor', corAcessorio: '#5ce0ff' },
  comerciante: { id: 'comerciante', nome: 'Comerciante', sensibilidade: 'Custos e benefícios', resistencia: 2, toga: '#d9902a', cabelo: '#3a2414', acessorio: 'chapeu', corAcessorio: '#5a3a1e' },
  artista: { id: 'artista', nome: 'Artista', sensibilidade: 'Criatividade e boas imagens', resistencia: 1, toga: '#c23cc8', cabelo: '#141018', acessorio: 'boina', corAcessorio: '#e83a4a' },
};

export const TODOS_JURADOS = Object.keys(JURADOS) as JuradoId[];

/** Sorteia jurados diferentes entre si (embaralhamento de Fisher-Yates). */
export function sortearJurados(quantidade = 5, aleatorio: () => number = Math.random): JuradoId[] {
  const lista = [...TODOS_JURADOS];
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [lista[i], lista[j]] = [lista[j]!, lista[i]!];
  }
  return lista.slice(0, quantidade);
}
