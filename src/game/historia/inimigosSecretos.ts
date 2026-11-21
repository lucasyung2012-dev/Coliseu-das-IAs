import type { AtaqueInimigo, DefInimigo } from './luta';

/**
 * Os inimigos do capítulo secreto, Os Três (roteiro4.ts). Mais fortes que os dos
 * caminhos, porque o jogador tem os três gladiadores e troca no meio da luta.
 * Cada sombra copia o jeito de lutar de um deles:
 * - a do Cassius se defende com o escudo gigante (só o quebra-guarda ou a hora em que ela ataca);
 * - a do Octavius finge muito (fintas);
 * - a do Helios luta no escuro e com ilusões.
 * O Núcleo muda de modo a cada fase: escudo gigante, escuro e ilusões, com o Censor de olho azul ajudando.
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

export const INIMIGOS_SECRETOS: Record<string, DefInimigo> = {
  'sombra-cassius': {
    id: 'sombra-cassius',
    nome: 'A Sombra do Cassius',
    vida: 170,
    contra: 22,
    pecas: 0,
    escudoGigante: true,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [golpe('Livro pesado', 680, 16, 1000), golpe('Páginas cortantes', 620, 9, 950, 3, 320), finta(520)], pausaMs: [650, 1000] },
      { ataques: [investida('Avalanche de livros', 650, 22, 1100), golpe('Escudo de capa dura', 560, 10, 950, 3, 300), finta(450)], pausaMs: [560, 900] },
    ],
  },
  'sombra-octavius': {
    id: 'sombra-octavius',
    nome: 'A Sombra do Octavius',
    vida: 180,
    contra: 22,
    pecas: 0,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [finta(480), golpe('Golpe de remo', 600, 15, 950), finta(420), investida('Abordagem', 650, 20, 1050), finta(400)], pausaMs: [520, 860] },
      { ataques: [finta(380), golpe('Remo duplo', 560, 10, 950, 2, 320), finta(380), fogo('Pólvora de mentira', 600, 20, 1000), finta(350)], pausaMs: [460, 800] },
    ],
  },
  'sombra-helios': {
    id: 'sombra-helios',
    nome: 'A Sombra do Helios',
    vida: 180,
    contra: 22,
    pecas: 0,
    escuro: true,
    ilusoes: true,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [fogo('Raio de sombra', 700, 18, 1050), golpe('Lança de eclipse', 620, 14, 950), finta(500)], pausaMs: [650, 1000] },
      { ataques: [fogo('Três raios', 640, 10, 1050, 3, 340), golpe('Lança de eclipse', 560, 15, 950), finta(450), investida('Mergulho no escuro', 620, 21, 1100)], pausaMs: [560, 900] },
    ],
  },
  'guardiao-nucleo': {
    id: 'guardiao-nucleo',
    nome: 'O Guardião do Núcleo',
    vida: 240,
    contra: 24,
    pecas: 0,
    escudoGigante: true,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [golpe('Lança em dois tempos', 650, 11, 1050, 2, 380), investida('Avanço de escudo', 700, 22, 1150), finta(500)], pausaMs: [650, 1000] },
      { ataques: [golpe('Lança em três tempos', 600, 9, 1050, 3, 330), fogo('Ponta em brasa', 620, 21, 1050), investida('Avanço de escudo', 620, 23, 1150), finta(450)], pausaMs: [560, 880] },
    ],
  },
  // Chefão final do capítulo secreto: cada fase com um modo diferente.
  nucleo: {
    id: 'nucleo',
    nome: 'O Núcleo',
    vida: 420,
    chefao: true,
    contra: 26,
    pecas: 0,
    aliados: ['censor'],
    trocaDeFase: [0.66, 0.33],
    fases: [
      {
        escudoGigante: true,
        ataques: [golpe('Chicote de cabos', 700, 12, 1050, 2, 400), investida('Esmagar com a esfera', 800, 24, 1200), finta(600)],
        pausaMs: [700, 1050],
      },
      {
        escuro: true,
        ataques: [fogo('Raio no escuro', 700, 22, 1100), golpe('Cabos no escuro', 620, 10, 1000, 3, 340), finta(500), investida('Tremor', 700, 24, 1200)],
        pausaMs: [620, 960],
      },
      {
        ilusoes: true,
        ataques: [fogo('A RESPOSTA ÚNICA', 800, 28, 1300), golpe('Cópias atacando', 560, 9, 1000, 4, 270), finta(450), fogo('Raio duplo', 640, 18, 1100, 2, 400)],
        pausaMs: [540, 860],
      },
    ],
  },
};
