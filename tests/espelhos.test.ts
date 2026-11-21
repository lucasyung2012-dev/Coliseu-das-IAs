import { caminho, NIVEIS, type Celula } from '@/features/coliseu/MinigamesHelios';

/** Todas as combinações de espelhos (cada um / ou \) de um nível. */
function combinacoes(grade: Celula[][]): Celula[][][] {
  const espelhos: [number, number][] = [];
  grade.forEach((l, y) => l.forEach((c, x) => (c === '/' || c === '\' ? espelhos.push([x, y]) : null)));
  const todas: Celula[][][] = [];
  for (let m = 0; m < 1 << espelhos.length; m++) {
    const g = grade.map((l) => [...l]);
    espelhos.forEach(([x, y], k) => (g[y]![x] = m & (1 << k) ? '/' : '\'));
    todas.push(g);
  }
  return todas;
}

describe('espelhos do Helios', () => {
  it.each(NIVEIS.map((n, k) => [k, n] as const))('o nível %i tem solução e não começa resolvido', (_, n) => {
    expect(caminho(n, n.grade).chegou).toBe(false);
    expect(combinacoes(n.grade).some((g) => caminho(n, g).chegou)).toBe(true);
  });
});
