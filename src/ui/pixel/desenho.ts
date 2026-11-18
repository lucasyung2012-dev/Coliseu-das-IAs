/**
 * Mini "pincel" para desenhar pixel art em código: cada passo pinta um retângulo
 * com um caractere da paleta, e no fim um contorno escuro (K) é traçado em volta
 * de tudo. Assim cada personagem é uma lista curta de formas, fácil de ajustar.
 */
export type Passo = [cor: string, x: number, y: number, largura?: number, altura?: number];

export function desenhar(largura: number, altura: number, passos: Passo[], margem = 1): string[] {
  const tela = Array.from({ length: altura }, () => Array<string>(largura).fill('.'));
  for (const [cor, x, y, w = 1, h = 1] of passos) {
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const px = x + i + margem;
        const py = y + j + margem;
        if (py >= 0 && py < altura && px >= 0 && px < largura) tela[py]![px] = cor;
      }
    }
  }
  // Contorno: todo pixel vazio encostado (em cruz) num pixel pintado vira K.
  const cheio = (x: number, y: number) => tela[y]?.[x] !== undefined && tela[y]![x] !== '.';
  const contorno: [number, number][] = [];
  tela.forEach((linha, y) =>
    linha.forEach((c, x) => {
      if (c === '.' && (cheio(x - 1, y) || cheio(x + 1, y) || cheio(x, y - 1) || cheio(x, y + 1))) contorno.push([x, y]);
    }),
  );
  for (const [x, y] of contorno) tela[y]![x] = 'K';
  return tela.map((l) => l.join(''));
}

/** Pixels alternados (xadrez) dentro de um retângulo, para rede, malha e textura. */
export function xadrez(cor: string, x: number, y: number, largura: number, altura: number): Passo[] {
  const out: Passo[] = [];
  for (let j = 0; j < altura; j++) for (let i = 0; i < largura; i++) if ((i + j) % 2 === 0) out.push([cor, x + i, y + j]);
  return out;
}
