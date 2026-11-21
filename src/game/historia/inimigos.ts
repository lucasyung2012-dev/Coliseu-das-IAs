import type { AtaqueInimigo, DefInimigo } from './luta';

/**
 * Os inimigos do modo História. Dificuldade revista em 21/11/2026 (o Lucas achou
 * fácil demais): sinais mais curtos, mais dano, combos, fintas e contra-ataque.
 * Sinal AMARELO = golpe de corpo (escudo); VERMELHO = fogo ou investida (esquiva);
 * FINTA = o sinal aparece e o golpe não vem.
 */
const golpe = (nome: string, sinalMs: number, dano: number, abertoMs: number, combo?: number, comboMs?: number): AtaqueInimigo => ({
  nome,
  tipo: 'corpo',
  sinalMs,
  dano,
  abertoMs,
  combo,
  comboMs,
});
const fogo = (nome: string, sinalMs: number, dano: number, abertoMs: number, combo?: number, comboMs?: number): AtaqueInimigo => ({
  nome,
  tipo: 'fogo',
  sinalMs,
  dano,
  abertoMs,
  combo,
  comboMs,
});
const investida = (nome: string, sinalMs: number, dano: number, abertoMs: number): AtaqueInimigo => ({ nome, tipo: 'investida', sinalMs, dano, abertoMs });
const finta = (sinalMs: number): AtaqueInimigo => ({ nome: 'Finta', tipo: 'finta', sinalMs, dano: 0, abertoMs: 0 });

export const INIMIGOS: Record<string, DefInimigo> = {
  // ---------- Capítulo 1 do Cassius: os Incineradores e a Fornalha ----------
  // Luta 1: ensina o escudo (golpes de corpo, um pouco mais rápidos que antes).
  incinerador: { id: 'incinerador', nome: 'Incinerador', vida: 42, contra: 10, fases: [{ ataques: [golpe('Faísca', 800, 12, 900)], pausaMs: [1000, 1500] }] },
  // Luta 2: rápido e com golpe duplo.
  'incinerador-veloz': {
    id: 'incinerador-veloz',
    nome: 'Incinerador Veloz',
    vida: 46,
    contra: 11,
    fases: [{ ataques: [golpe('Faísca rápida', 560, 11, 750), golpe('Faísca dupla', 700, 10, 800, 2, 380)], pausaMs: [800, 1200] }],
  },
  // Luta 3: ensina a esquiva (o jato atravessa o escudo) e a primeira finta.
  'incinerador-lanca-chamas': {
    id: 'incinerador-lanca-chamas',
    nome: 'Lança-Chamas',
    vida: 54,
    contra: 12,
    fases: [{ ataques: [fogo('Jato de fogo', 900, 18, 1000), golpe('Faísca', 700, 12, 800), finta(700), fogo('Jato de fogo', 900, 18, 1000)], pausaMs: [900, 1300] }],
  },
  // Luta 4: mistura tudo, com combo de três.
  'incinerador-duplo': {
    id: 'incinerador-duplo',
    nome: 'Incinerador de Guerra',
    vida: 64,
    contra: 14,
    fases: [
      {
        ataques: [golpe('Martelo de brasa', 750, 14, 850), fogo('Jato de fogo', 850, 18, 950), golpe('Três brasas', 700, 9, 900, 3, 360), finta(600), investida('Trombada', 750, 16, 1000)],
        pausaMs: [800, 1200],
      },
    ],
  },
  // Luta 5: o capitão dos Incineradores, antes do chefão.
  'capitao-incinerador': {
    id: 'capitao-incinerador',
    nome: 'Capitão Incinerador',
    vida: 80,
    contra: 16,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [golpe('Golpe de comando', 650, 14, 800), finta(550), fogo('Leque de fogo', 800, 18, 950), golpe('Ordem dupla', 650, 11, 850, 2, 340)], pausaMs: [750, 1100] },
      { ataques: [investida('Carga do capitão', 650, 18, 950), golpe('Três ordens', 600, 10, 900, 3, 320), finta(500), fogo('Leque de fogo', 700, 18, 900)], pausaMs: [600, 900] },
    ],
  },
  // Chefão: a Fornalha. A porta da barriga acende antes do bafo de fogo. Três fases, cada vez mais quente.
  fornalha: {
    id: 'fornalha',
    nome: 'A Fornalha',
    vida: 180,
    chefao: true,
    contra: 18,
    trocaDeFase: [0.66, 0.33],
    fases: [
      {
        ataques: [golpe('Pisão de bronze', 850, 16, 1000), fogo('Bafo de fornalha', 1100, 24, 1300), finta(800), golpe('Tenaz', 800, 14, 900, 2, 420)],
        pausaMs: [1000, 1400],
      },
      {
        ataques: [golpe('Pisão furioso', 650, 18, 850), fogo('Bafo duplo', 900, 18, 1100, 2, 450), investida('Rolo de brasas', 750, 22, 1200), finta(600)],
        pausaMs: [750, 1100],
      },
      {
        // Superaquecida: tudo vermelho e rápido. Dá para vencer esquivando e batendo no ABERTO.
        ataques: [fogo('Erupção', 750, 20, 1000, 3, 380), golpe('Tenaz em brasa', 550, 18, 800, 2, 330), investida('Rolo de brasas', 650, 24, 1300), finta(450)],
        pausaMs: [600, 900],
      },
    ],
  },

  // ---------- Capítulo 2 do Cassius: as ruas de Roma e a primeira luta no Coliseu ----------
  // A Guarda Pretoriana: soldados de aço que marcham no mesmo passo.
  'pretoriano-batedor': {
    id: 'pretoriano-batedor',
    nome: 'Pretoriano Batedor',
    vida: 70,
    contra: 14,
    fases: [{ ataques: [golpe('Clava', 700, 14, 850), golpe('Clava dupla', 650, 11, 850, 2, 350), finta(600)], pausaMs: [800, 1200] }],
  },
  'pretoriano-lanceiro': {
    id: 'pretoriano-lanceiro',
    nome: 'Pretoriano Lanceiro',
    vida: 78,
    contra: 15,
    fases: [{ ataques: [investida('Estocada de lança', 750, 18, 1000), finta(550), golpe('Cabo da lança', 600, 12, 750), investida('Estocada de lança', 650, 18, 950), golpe('Varredura', 650, 10, 900, 3, 330)], pausaMs: [700, 1100] }],
  },
  'pretoriano-veterano': {
    id: 'pretoriano-veterano',
    nome: 'Decurião de Aço',
    vida: 96,
    contra: 18,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [golpe('Gládio', 650, 15, 850), finta(500), investida('Escudo à frente', 700, 18, 950), golpe('Gládio duplo', 600, 11, 850, 2, 330)], pausaMs: [700, 1000] },
      { ataques: [golpe('Golpe da legião', 550, 12, 800, 3, 300), finta(450), investida('Escudo à frente', 600, 20, 950), finta(450), golpe('Gládio', 500, 16, 750)], pausaMs: [550, 850] },
    ],
  },
  // A primeira luta no Coliseu: um gladiador montado com sucata de outras IAs apagadas.
  'gladiador-de-sucata': {
    id: 'gladiador-de-sucata',
    nome: 'Gladiador de Sucata',
    vida: 130,
    contra: 18,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [golpe('Machado enferrujado', 750, 16, 950), investida('Investida de ferro-velho', 800, 20, 1100), finta(600), golpe('Corrente', 650, 11, 900, 2, 360)], pausaMs: [800, 1100] },
      {
        // Na segunda metade, a plateia grita e ele se empolga: mais rápido e com combo de quatro.
        ataques: [golpe('Fúria de sucata', 550, 10, 950, 4, 300), finta(500), investida('Investida de ferro-velho', 650, 22, 1100), fogo('Faísca de solda', 700, 18, 900), finta(450)],
        pausaMs: [600, 900],
      },
    ],
  },
};
