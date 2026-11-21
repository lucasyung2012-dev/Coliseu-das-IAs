import type { AtaqueInimigo, DefInimigo } from './luta';

/**
 * Os inimigos do modo História. Capítulo 1 do Cassius (A Noite das Chamas):
 * os Incineradores do Censor, cada um ensinando uma coisa, e a Fornalha (chefão).
 * Sinal AMARELO = golpe de corpo (dá para defender); VERMELHO = fogo ou investida (esquive).
 */
const faisca: AtaqueInimigo = { nome: 'Faísca', tipo: 'corpo', sinalMs: 1000, dano: 8, abertoMs: 1100 };
const faiscaRapida: AtaqueInimigo = { nome: 'Faísca rápida', tipo: 'corpo', sinalMs: 650, dano: 8, abertoMs: 900 };
const jatinho: AtaqueInimigo = { nome: 'Jato de fogo', tipo: 'fogo', sinalMs: 1100, dano: 12, abertoMs: 1200 };
const trombada: AtaqueInimigo = { nome: 'Trombada', tipo: 'investida', sinalMs: 900, dano: 12, abertoMs: 1100 };

export const INIMIGOS: Record<string, DefInimigo> = {
  // Luta 1: ensina o escudo (só golpes de corpo, devagar).
  incinerador: { id: 'incinerador', nome: 'Incinerador', vida: 32, fases: [{ ataques: [faisca], pausaMs: [1400, 2000] }] },
  // Luta 2: mais rápido.
  'incinerador-veloz': { id: 'incinerador-veloz', nome: 'Incinerador Veloz', vida: 36, fases: [{ ataques: [faiscaRapida, faisca], pausaMs: [1000, 1500] }] },
  // Luta 3: ensina a esquiva (o jato de fogo não dá para segurar no escudo).
  'incinerador-lanca-chamas': {
    id: 'incinerador-lanca-chamas',
    nome: 'Lança-Chamas',
    vida: 40,
    fases: [{ ataques: [jatinho, faisca, jatinho], pausaMs: [1200, 1700] }],
  },
  // Luta 4: mistura tudo.
  'incinerador-duplo': {
    id: 'incinerador-duplo',
    nome: 'Incinerador de Guerra',
    vida: 46,
    fases: [{ ataques: [faisca, jatinho, faiscaRapida, trombada], pausaMs: [1000, 1500] }],
  },
  // Luta 5: o capitão dos Incineradores, antes do chefão.
  'capitao-incinerador': {
    id: 'capitao-incinerador',
    nome: 'Capitão Incinerador',
    vida: 56,
    fases: [{ ataques: [faiscaRapida, trombada, jatinho, faiscaRapida], pausaMs: [900, 1300] }],
  },
  // Chefão: a Fornalha. A barriga fica vermelha antes do jato; na segunda metade da vida, fica furiosa.
  fornalha: {
    id: 'fornalha',
    nome: 'A Fornalha',
    vida: 120,
    chefao: true,
    trocaDeFase: [0.5],
    fases: [
      {
        ataques: [
          { nome: 'Pisão de bronze', tipo: 'corpo', sinalMs: 950, dano: 12, abertoMs: 1100 },
          { nome: 'Bafo de fornalha', tipo: 'fogo', sinalMs: 1300, dano: 18, abertoMs: 1500 },
          { nome: 'Pisão de bronze', tipo: 'corpo', sinalMs: 950, dano: 12, abertoMs: 1100 },
        ],
        pausaMs: [1200, 1700],
      },
      {
        ataques: [
          { nome: 'Pisão furioso', tipo: 'corpo', sinalMs: 700, dano: 14, abertoMs: 900 },
          { nome: 'Bafo de fornalha', tipo: 'fogo', sinalMs: 1000, dano: 20, abertoMs: 1300 },
          { nome: 'Rolo de brasas', tipo: 'investida', sinalMs: 900, dano: 16, abertoMs: 1400 },
        ],
        pausaMs: [800, 1200],
      },
    ],
  },
};
