import { desenhar, type Passo } from './desenho';
import Sprite from './Sprite';

/**
 * Ícones em pixel para os botões do modo História (pedido do Lucas, 22/11/2026: "os
 * botões ainda são emojis, tá bagunçado"). Desenhados com o mesmo pincel dos personagens
 * (formas simples e contorno escuro automático), num quadro de 16 × 16.
 */
const PALETA: Record<string, string> = {
  K: '#140c08',
  W: '#f4f0e8',
  S: '#b8c0cc',
  D: '#6a7280',
  Y: '#f2c14e',
  O: '#c8862a',
  B: '#8a5a2a',
  b: '#5a3418',
  R: '#d0383c',
  r: '#8a1c24',
  G: '#4ad46a',
  C: '#7ad0ff',
  c: '#3a8ac0',
  P: '#2a1a40',
  p: '#6a4aa0',
  T: '#2aa08a',
  E: '#e0782c',
};

/** Uma linha diagonal de pixels (para lâminas, cabos e lanças). */
function diagonal(cor: string, x: number, y: number, n: number, dx: 1 | -1, dy: 1 | -1, grossura = 1): Passo[] {
  const out: Passo[] = [];
  for (let k = 0; k < n; k++) out.push([cor, x + k * dx, y + k * dy, grossura, 1]);
  return out;
}

const L = 16;
const desenhos: Record<string, Passo[]> = {
  // ⚔ Gládio (Cassius): lâmina na diagonal, guarda dourada, cabo marrom.
  gladio: [...diagonal('S', 4, 9, 9, 1, -1, 2), ...diagonal('W', 5, 8, 8, 1, -1), ['Y', 2, 9, 5, 1], ['Y', 4, 7, 1, 5], ...diagonal('B', 3, 10, 3, -1, 1), ['Y', 0, 13, 2, 1]],
  // 🛡 Escudo romano (scutum) vermelho com o umbo dourado.
  escudo: [['R', 2, 1, 10, 12], ['r', 2, 1, 1, 12], ['Y', 2, 1, 10, 1], ['Y', 2, 12, 10, 1], ['Y', 6, 4, 2, 6], ['Y', 4, 6, 6, 2], ['W', 6, 6, 2, 2]],
  // 💨 Esquiva: o vulto correndo e as linhas de vento.
  esquiva: [['C', 0, 3, 6, 1], ['C', 1, 6, 4, 1], ['C', 0, 9, 5, 1], ['W', 7, 2, 4, 4], ['S', 7, 6, 4, 4], ['S', 6, 10, 2, 3], ['S', 10, 10, 2, 3], ['W', 11, 6, 2, 1]],
  // ⭐ Especial neutro: estrela de ouro.
  especial: [['Y', 6, 0, 2, 4], ['Y', 0, 5, 14, 2], ['Y', 3, 4, 8, 5], ['W', 5, 5, 4, 3], ['Y', 2, 9, 3, 3], ['Y', 9, 9, 3, 3], ['Y', 1, 12, 2, 1], ['Y', 11, 12, 2, 1]],
  // 📚 Muralha de livros: pilha de livros coloridos.
  muralha: [['R', 1, 10, 12, 3], ['W', 1, 11, 12, 1], ['c', 2, 6, 10, 3], ['W', 2, 7, 10, 1], ['G', 3, 2, 8, 3], ['W', 3, 3, 8, 1], ['Y', 11, 10, 1, 3], ['Y', 4, 2, 1, 3]],
  // 🔱 Tridente (Octavius).
  tridente: [['S', 2, 0, 2, 5], ['S', 6, 0, 2, 5], ['S', 10, 0, 2, 5], ['S', 2, 4, 10, 2], ['W', 6, 0, 1, 4], ['B', 6, 6, 2, 8]],
  // 🪵 Aparar: broquel de madeira com aro de ferro.
  aparar: [['D', 2, 2, 10, 10], ['B', 3, 3, 8, 8], ['b', 3, 6, 8, 1], ['b', 6, 3, 1, 8], ['S', 6, 6, 2, 2], ['D', 4, 1, 6, 1], ['D', 4, 12, 6, 1], ['D', 1, 4, 1, 6], ['D', 12, 4, 1, 6]],
  // 🌀 Rolar: seta girando.
  rolar: [['T', 3, 1, 7, 2], ['T', 10, 2, 2, 2], ['T', 11, 4, 2, 5], ['T', 9, 9, 3, 2], ['T', 3, 10, 6, 2], ['T', 1, 6, 2, 4], ['T', 1, 3, 2, 3], ['W', 0, 9, 4, 1], ['W', 1, 10, 2, 1], ['W', 1, 11, 1, 1]],
  // 🕸 Rede de pesca com pesos.
  rede: [['W', 1, 1, 12, 1], ['W', 1, 5, 12, 1], ['W', 1, 9, 12, 1], ['W', 1, 1, 1, 12], ['W', 5, 1, 1, 12], ['W', 9, 1, 1, 12], ['W', 13, 1, 1, 12], ['D', 0, 12, 2, 2], ['D', 4, 12, 2, 2], ['D', 8, 12, 2, 2], ['D', 12, 12, 2, 2]],
  // 🗡 Lança (Helios): cabo comprido e ponta dourada.
  lanca: [...diagonal('B', 1, 13, 10, 1, -1), ['Y', 10, 1, 3, 3], ['Y', 11, 0, 2, 1], ['W', 11, 1, 1, 1], ['Y', 8, 4, 2, 1]],
  // 🪞 Espelho de bronze, com o brilho.
  espelho: [['O', 3, 0, 8, 12], ['C', 4, 1, 6, 10], ['W', 5, 2, 2, 4], ['W', 5, 7, 1, 1], ['B', 6, 12, 2, 2]],
  // ✨ Lampejo: brilho em cruz.
  lampejo: [['Y', 6, 0, 2, 14], ['Y', 0, 6, 14, 2], ['W', 5, 5, 4, 4], ['Y', 2, 2, 2, 2], ['Y', 10, 2, 2, 2], ['Y', 2, 10, 2, 2], ['Y', 10, 10, 2, 2]],
  // 🌑 Eclipse: a lua escura e o anel de fogo.
  eclipse: [['Y', 3, 0, 8, 14], ['Y', 0, 3, 14, 8], ['Y', 1, 1, 12, 12], ['P', 3, 2, 8, 10], ['P', 2, 3, 10, 8], ['p', 4, 3, 3, 2]],
  // ◀ ▶ Setas e ⤒ pular.
  esq: [['Y', 1, 6, 12, 2], ['Y', 3, 4, 2, 6], ['Y', 5, 2, 2, 10], ['Y', 1, 5, 2, 4]],
  dir: [['Y', 1, 6, 12, 2], ['Y', 9, 4, 2, 6], ['Y', 7, 2, 2, 10], ['Y', 11, 5, 2, 4]],
  pular: [['G', 6, 3, 2, 10], ['G', 4, 5, 6, 2], ['G', 2, 7, 2, 2], ['G', 10, 7, 2, 2], ['G', 5, 1, 4, 2], ['W', 2, 13, 10, 1]],
};

const CACHE: Record<string, string[]> = {};
function grade(nome: string): string[] {
  if (!CACHE[nome]) CACHE[nome] = desenhar(L, L, desenhos[nome] ?? desenhos.especial!);
  return CACHE[nome]!;
}

export type NomeIcone = keyof typeof desenhos;
export const ICONES = Object.keys(desenhos) as NomeIcone[];

export default function Icone({ nome, className }: { nome: string; className?: string }) {
  return <Sprite grade={grade(nome)} paleta={PALETA} className={className} />;
}
