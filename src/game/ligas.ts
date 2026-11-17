export type Modo = 'duelo' | 'tribunal';

export interface Liga {
  id: 'recrutas' | 'gladiadores' | 'centurioes' | 'pretorianos' | 'imperadores';
  nome: string;
  min: number;
}

// Faixas e tabela de troféus do documento de especificação do Lucas (seção 4.1).
export const LIGAS: Liga[] = [
  { id: 'recrutas', nome: 'Recrutas', min: 0 },
  { id: 'gladiadores', nome: 'Gladiadores', min: 500 },
  { id: 'centurioes', nome: 'Centuriões', min: 1500 },
  { id: 'pretorianos', nome: 'Pretorianos', min: 3500 },
  { id: 'imperadores', nome: 'Imperadores', min: 7000 },
];

/** [ganho na vitória, perda na derrota], uma linha por liga, na ordem de LIGAS. */
const TABELA: Record<Modo, [number, number][]> = {
  tribunal: [
    [40, 5],
    [38, 12],
    [35, 20],
    [30, 25],
    [25, 30],
  ],
  duelo: [
    [15, 2],
    [14, 5],
    [12, 8],
    [10, 10],
    [8, 12],
  ],
};

export function indiceLiga(trofeus: number): number {
  let i = 0;
  LIGAS.forEach((liga, j) => {
    if (trofeus >= liga.min) i = j;
  });
  return i;
}

export function ligaDe(trofeus: number): Liga {
  return LIGAS[indiceLiga(trofeus)]!;
}

/** Próxima liga e quanto falta; null na última. */
export function proximaLiga(trofeus: number): { liga: Liga; faltam: number; progresso: number } | null {
  const i = indiceLiga(trofeus);
  const prox = LIGAS[i + 1];
  if (!prox) return null;
  const atual = LIGAS[i]!;
  return { liga: prox, faltam: prox.min - trofeus, progresso: (trofeus - atual.min) / (prox.min - atual.min) };
}

/** Variação de troféus de uma partida. Nunca deixa o total abaixo de zero. */
export function variacaoTrofeus(modo: Modo, trofeus: number, venceu: boolean): number {
  const [ganho, perda] = TABELA[modo][indiceLiga(trofeus)]!;
  if (venceu) return ganho;
  // Com 0 troféus a perda é 0 (e não -0, que apareceria como "-0" na tela).
  return trofeus > 0 ? -Math.min(perda, trofeus) : 0;
}
