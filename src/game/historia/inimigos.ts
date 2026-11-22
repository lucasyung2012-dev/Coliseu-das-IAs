import type { AtaqueInimigo, DefInimigo } from './luta';
import { INIMIGOS_SECRETOS } from './inimigosSecretos';

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
    vida: 165,
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

  // ---------- Capítulo 3: o Ludus ----------
  // O boneco de treino do Brutus (só nos treinos: bate fraco e devagar).
  'boneco-de-treino': {
    id: 'boneco-de-treino',
    nome: 'Brutus (treino)',
    vida: 999,
    contra: 4,
    pecas: 0,
    fases: [{ ataques: [golpe('Espada de pau', 1000, 4, 1100), golpe('Espada de pau', 900, 4, 1000), finta(800)], pausaMs: [700, 1100] }],
  },
  // O teste do Brutus: os Cães de Ferro, rápidos e com mordida dupla.
  'caes-de-ferro': {
    id: 'caes-de-ferro',
    nome: 'Cão de Ferro',
    vida: 110,
    contra: 16,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [golpe('Mordida', 600, 13, 800), investida('Bote', 700, 18, 1000), golpe('Mordida dupla', 600, 10, 850, 2, 320), finta(500)], pausaMs: [650, 1000] },
      { ataques: [investida('Bote', 550, 20, 950), golpe('Matilha', 500, 9, 900, 4, 280), finta(450), golpe('Mordida', 500, 14, 750)], pausaMs: [500, 800] },
    ],
  },

  // ---------- Capítulo 4: as Catacumbas ----------
  'rato-engrenagem': {
    id: 'rato-engrenagem',
    nome: 'Rato de Engrenagem',
    vida: 70,
    contra: 12,
    fases: [{ ataques: [golpe('Roída', 500, 9, 700, 3, 260), investida('Salto', 600, 15, 900), finta(450)], pausaMs: [500, 850] }],
  },
  'rato-rei': {
    id: 'rato-rei',
    nome: 'Rato-Rei',
    vida: 100,
    contra: 15,
    pecas: 3,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [golpe('Roída', 500, 10, 700, 3, 260), fogo('Faísca do cabo', 650, 16, 900), finta(450), investida('Salto', 600, 16, 900)], pausaMs: [500, 800] },
      { ataques: [golpe('Enxame', 450, 7, 900, 5, 230), fogo('Curto-circuito', 600, 18, 900), finta(400)], pausaMs: [450, 750] },
    ],
  },
  'patrulha-catacumba': {
    id: 'patrulha-catacumba',
    nome: 'Patrulha da Guarda',
    vida: 110,
    contra: 18,
    fases: [{ ataques: [golpe('Gládio', 600, 15, 800), investida('Lança no escuro', 650, 19, 950), finta(450), golpe('Gládio duplo', 550, 11, 800, 2, 300), fogo('Lanterna de fogo', 700, 17, 900)], pausaMs: [600, 950] }],
  },
  'patrulha-sargento': {
    id: 'patrulha-sargento',
    nome: 'Sargento da Patrulha',
    vida: 130,
    contra: 20,
    pecas: 3,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [golpe('Clava', 600, 16, 800), finta(450), investida('Carga', 650, 20, 950), golpe('Clava dupla', 550, 12, 800, 2, 300)], pausaMs: [600, 900] },
      { ataques: [golpe('Golpe da patrulha', 480, 10, 800, 3, 260), finta(400), investida('Carga', 550, 22, 950), finta(400)], pausaMs: [500, 800] },
    ],
  },
  // Chefão: o Arquivista Sombrio. Faz cópias falsas: a verdadeira PISCA antes de atacar; as fintas são ilusões.
  arquivista: {
    id: 'arquivista',
    nome: 'O Arquivista Sombrio',
    vida: 220,
    chefao: true,
    ilusoes: true,
    contra: 20,
    trocaDeFase: [0.66, 0.33],
    fases: [
      { ataques: [golpe('Gaveta de bronze', 750, 16, 950), finta(650), fogo('Raio do esquecimento', 900, 22, 1100), finta(600), golpe('Rolos', 650, 11, 900, 2, 360)], pausaMs: [800, 1200] },
      { ataques: [finta(550), fogo('Raio do esquecimento', 750, 22, 1000), finta(500), golpe('Arquivo inteiro', 600, 10, 950, 3, 300), investida('Apagão', 700, 24, 1100)], pausaMs: [650, 1000] },
      { ataques: [finta(450), fogo('Esquecimento total', 650, 18, 950, 2, 380), finta(400), golpe('Mil gavetas', 500, 9, 900, 4, 260), investida('Apagão', 600, 26, 1100)], pausaMs: [550, 850] },
    ],
  },

  // ---------- Capítulo 5: o Fórum (ondas de Pretorianos enquanto a Lívia lê) ----------
  'pretoriano-escudeiro': {
    id: 'pretoriano-escudeiro',
    nome: 'Pretoriano Escudeiro',
    vida: 120,
    contra: 18,
    fases: [{ ataques: [investida('Parede de escudos', 650, 20, 1000), golpe('Gládio', 550, 14, 750), finta(450), golpe('Gládio duplo', 520, 11, 800, 2, 290)], pausaMs: [550, 900] }],
  },
  'pretoriano-lanceiro-elite': {
    id: 'pretoriano-lanceiro-elite',
    nome: 'Lanceiro de Elite',
    vida: 125,
    contra: 19,
    fases: [{ ataques: [investida('Estocada', 550, 20, 900), finta(400), golpe('Varredura', 500, 9, 850, 4, 260), investida('Estocada dupla', 600, 16, 950), finta(400)], pausaMs: [500, 850] }],
  },
  'pretoriano-incendiario': {
    id: 'pretoriano-incendiario',
    nome: 'Pretoriano Incendiário',
    vida: 125,
    contra: 19,
    fases: [{ ataques: [fogo('Tocha da Lei', 650, 20, 950), golpe('Clava', 520, 14, 750), finta(420), fogo('Leque de fogo', 600, 12, 900, 2, 330)], pausaMs: [500, 850] }],
  },
  'centuriao-de-aco': {
    id: 'centuriao-de-aco',
    nome: 'Centurião de Aço',
    vida: 150,
    contra: 22,
    pecas: 4,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [golpe('Gládio', 550, 16, 800), finta(420), investida('Carga da centúria', 600, 22, 950), golpe('Legião', 500, 10, 850, 3, 270)], pausaMs: [550, 850] },
      { ataques: [golpe('Legião', 450, 10, 850, 4, 250), finta(380), investida('Carga da centúria', 520, 24, 950), fogo('Óleo em brasa', 600, 20, 900)], pausaMs: [450, 750] },
    ],
  },
  // Chefão: o Pretor de Aço. ESCUDO GIGANTE: quase nada entra; bata três vezes seguidas na guarda
  // (QUEBRA-GUARDA, treino do Ludus) para ele ficar tonto. Sinal: bate o escudo no chão antes da investida.
  'pretor-de-aco': {
    id: 'pretor-de-aco',
    nome: 'O Pretor de Aço',
    vida: 240,
    chefao: true,
    escudoGigante: true,
    contra: 22,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [investida('Escudo no chão... INVESTIDA!', 900, 24, 1200), golpe('Gládio do Pretor', 650, 16, 900), finta(600), golpe('Golpe de escudo', 600, 12, 900, 2, 360)], pausaMs: [750, 1100] },
      { ataques: [investida('Investida dupla', 700, 20, 1100), golpe('Disciplina', 500, 10, 900, 4, 270), finta(450), investida('Escudo no chão... INVESTIDA!', 650, 26, 1200)], pausaMs: [600, 900] },
    ],
  },

  // ---------- Capítulo 6: a Grande Arena (os campeões do Censor e o Leão Mecânico) ----------
  'retiario-mecanico': {
    id: 'retiario-mecanico',
    nome: 'Retiário Mecânico',
    vida: 150,
    contra: 20,
    fases: [{ ataques: [investida('Rede!', 600, 18, 1000), golpe('Tridente', 520, 12, 800, 2, 300), finta(420), investida('Puxão da rede', 520, 20, 950), golpe('Tridente', 480, 14, 750)], pausaMs: [500, 850] }],
  },
  'mirmilao-bronze': {
    id: 'mirmilao-bronze',
    nome: 'Mirmilão de Bronze',
    vida: 170,
    contra: 24,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [golpe('Golpe pesado', 750, 22, 1100), investida('Escudo redondo', 700, 22, 1050), finta(550)], pausaMs: [700, 1000] },
      { ataques: [golpe('Martelada', 600, 16, 1000, 2, 400), investida('Escudo redondo', 600, 24, 1050), finta(450), golpe('Golpe pesado', 550, 22, 1000)], pausaMs: [550, 850] },
    ],
  },
  dimaquero: {
    id: 'dimaquero',
    nome: 'Dimáquero, o das Duas Lâminas',
    vida: 160,
    contra: 20,
    pecas: 4,
    fases: [{ ataques: [golpe('Duas lâminas', 450, 8, 900, 5, 230), finta(380), investida('Corte em cruz', 520, 20, 950), finta(380), golpe('Lâmina rápida', 400, 12, 700)], pausaMs: [450, 750] }],
  },
  // Chefão: o Leão Mecânico. O RUGIDO (vermelho) atravessa o escudo; as garras vêm em combo.
  'leao-mecanico': {
    id: 'leao-mecanico',
    nome: 'O Leão Mecânico',
    vida: 280,
    chefao: true,
    contra: 24,
    trocaDeFase: [0.66, 0.33],
    fases: [
      { ataques: [golpe('Garras', 650, 13, 900, 2, 360), fogo('RUGIDO', 900, 24, 1200), finta(550), investida('Salto do leão', 750, 24, 1100)], pausaMs: [700, 1050] },
      { ataques: [golpe('Garras', 550, 11, 900, 3, 300), investida('Salto do leão', 600, 26, 1100), fogo('RUGIDO', 750, 24, 1100), finta(450)], pausaMs: [600, 900] },
      { ataques: [fogo('Rugido de vapor', 650, 20, 1000, 2, 400), golpe('Fúria das garras', 450, 9, 900, 5, 240), finta(400), investida('Salto do leão', 520, 28, 1100)], pausaMs: [500, 800] },
    ],
  },

  // ---------- Final: a Queda do Censor (o titã feito das pedras do Coliseu) ----------
  // Três fases: as pernas, os braços e o olho vermelho. O especial chama os aliados.
  'censor-tita': {
    id: 'censor-tita',
    nome: 'O Censor, Titã do Coliseu',
    vida: 380,
    chefao: true,
    contra: 26,
    aliados: ['octavius', 'helios'],
    pecas: 0,
    trocaDeFase: [0.66, 0.33],
    fases: [
      { alvo: 'AS PERNAS', ataques: [investida('Pisão do titã', 900, 26, 1200), golpe('Pedras caindo', 700, 12, 1000, 3, 380), finta(650)], pausaMs: [800, 1200] },
      { alvo: 'OS BRAÇOS', ataques: [golpe('Braço de engrenagem', 650, 16, 1000, 2, 400), fogo('Correntes da Lei', 750, 24, 1100), finta(550), investida('Varredura de braço', 650, 26, 1100)], pausaMs: [650, 1000] },
      { alvo: 'O OLHO', ataques: [fogo('O OLHO: raio da Resposta Única', 800, 30, 1300), golpe('Desmoronar', 500, 10, 950, 4, 270), finta(450), fogo('Raio duplo', 650, 20, 1100, 2, 420)], pausaMs: [550, 850] },
    ],
  },

  // ---------- Caminho do Octavius: Capítulo 1, Ordem Impossível (Porto de Óstia) ----------
  'marinheiro-ferro': {
    id: 'marinheiro-ferro',
    nome: 'Marinheiro de Ferro',
    vida: 50,
    contra: 10,
    fases: [{ ataques: [golpe('Gancho', 800, 12, 900), golpe('Âncora', 900, 14, 1000), finta(750)], pausaMs: [1000, 1400] }],
  },
  'marinheiro-arpao': {
    id: 'marinheiro-arpao',
    nome: 'Arpoador de Ferro',
    vida: 58,
    contra: 12,
    fases: [{ ataques: [investida('Arpão', 850, 18, 1000), golpe('Gancho', 700, 12, 800), finta(650), golpe('Gancho duplo', 700, 9, 850, 2, 380)], pausaMs: [900, 1300] }],
  },
  'marinheiro-canhao': {
    id: 'marinheiro-canhao',
    nome: 'Artilheiro do Cais',
    vida: 70,
    contra: 14,
    fases: [{ ataques: [fogo('Canhãozinho', 850, 18, 1000), golpe('Âncora', 700, 14, 850), finta(600), fogo('Dois tiros', 750, 12, 950, 2, 400)], pausaMs: [800, 1200] }],
  },
  'contramestre-ferro': {
    id: 'contramestre-ferro',
    nome: 'Contramestre de Ferro',
    vida: 90,
    contra: 16,
    pecas: 3,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [golpe('Corrente do porto', 700, 14, 850), investida('Âncora girando', 750, 18, 1000), finta(550), golpe('Gancho duplo', 650, 10, 850, 2, 340)], pausaMs: [750, 1100] },
      { ataques: [golpe('Tempestade de ganchos', 550, 9, 900, 3, 300), investida('Âncora girando', 650, 20, 1000), finta(450), fogo('Canhão de bordo', 700, 18, 900)], pausaMs: [600, 900] },
    ],
  },
  // Chefão: o Almirante Ferrugem, no convés do navio de guerra. O braço-canhão brilha antes do tiro.
  'almirante-ferrugem': {
    id: 'almirante-ferrugem',
    nome: 'O Almirante Ferrugem',
    vida: 190,
    chefao: true,
    contra: 18,
    trocaDeFase: [0.66, 0.33],
    fases: [
      { ataques: [golpe('Sabre enferrujado', 800, 15, 1000), fogo('Braço-canhão', 1000, 22, 1300), finta(750), golpe('Dois cortes', 750, 11, 950, 2, 420)], pausaMs: [950, 1350] },
      { ataques: [fogo('Bordada', 800, 14, 1100, 3, 420), golpe('Sabre', 650, 16, 850), investida('Abalroar', 750, 22, 1100), finta(600)], pausaMs: [750, 1100] },
      { ataques: [fogo('Bordada', 650, 14, 1000, 3, 360), golpe('Sabre furioso', 550, 10, 900, 3, 300), investida('Abalroar', 650, 24, 1100), finta(500)], pausaMs: [600, 950] },
    ],
  },

  // ---------- Caminho do Octavius: Capítulo 2, As Galés ----------
  'guarda-chicote': {
    id: 'guarda-chicote',
    nome: 'Guarda do Chicote',
    vida: 70,
    contra: 13,
    fases: [{ ataques: [investida('Chicotada longa', 750, 16, 950), golpe('Lanterna', 650, 12, 800), finta(600), golpe('Chicote duplo', 650, 9, 850, 2, 360)], pausaMs: [800, 1200] }],
  },
  'cozinheiro-bordo': {
    id: 'cozinheiro-bordo',
    nome: 'Cozinheiro de Bordo',
    vida: 80,
    contra: 14,
    fases: [{ ataques: [golpe('Frigideira', 700, 14, 900), fogo('Sopa fervendo', 800, 18, 1000), golpe('Concha, concha, concha', 600, 8, 900, 3, 320), finta(550)], pausaMs: [750, 1100] }],
  },
  'marujo-ferro': {
    id: 'marujo-ferro',
    nome: 'Marujo de Ferro',
    vida: 92,
    contra: 15,
    fases: [{ ataques: [golpe('Gancho', 620, 14, 800), investida('Âncora no convés', 700, 19, 1000), finta(500), golpe('Gancho duplo', 600, 10, 850, 2, 330), fogo('Lampião quebrado', 700, 16, 900)], pausaMs: [700, 1050] }],
  },
  capataz: {
    id: 'capataz',
    nome: 'O Capataz das Galés',
    vida: 110,
    contra: 17,
    pecas: 3,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [investida('Dois chicotes', 700, 18, 950), golpe('Corrente', 600, 13, 800), finta(500), golpe('Chicote em cruz', 600, 9, 850, 2, 320)], pausaMs: [700, 1000] },
      { ataques: [golpe('Tempestade de chicotes', 520, 8, 900, 4, 270), investida('Dois chicotes', 600, 20, 950), finta(450)], pausaMs: [550, 850] },
    ],
  },
  // Chefão: o Feitor do Tambor. Ataca no ritmo do tambor dele: as batidas viram golpes,
  // cada fase mais rápida. Na última, o tambor solta ondas de choque (VERMELHO).
  'feitor-tambor': {
    id: 'feitor-tambor',
    nome: 'O Feitor do Tambor',
    vida: 200,
    chefao: true,
    contra: 18,
    trocaDeFase: [0.66, 0.33],
    fases: [
      { ataques: [golpe('TUM', 800, 13, 900), golpe('TUM-TUM', 750, 10, 950, 2, 450), finta(700), investida('Baqueta na cabeça', 850, 20, 1100)], pausaMs: [900, 1200] },
      { ataques: [golpe('TUM-TUM-TUM', 650, 9, 950, 3, 380), fogo('Onda do tambor', 800, 20, 1100), finta(550), investida('Baqueta na cabeça', 700, 22, 1100)], pausaMs: [700, 1000] },
      { ataques: [fogo('Rufar de guerra', 700, 14, 1000, 3, 360), golpe('TUM! TUM! TUM! TUM!', 520, 8, 950, 4, 300), finta(450), investida('Baqueta dupla', 600, 24, 1100)], pausaMs: [550, 850] },
    ],
  },

  // ---------- Caminho do Octavius: Capítulo 3, O Ludus ----------
  // A briga nas celas: um valentão que dedura todo mundo para os guardas.
  'valentao-celas': {
    id: 'valentao-celas',
    nome: 'Rufus, o Dedo-Duro',
    vida: 95,
    contra: 15,
    fases: [{ ataques: [golpe('Soco de corrente', 650, 14, 850), investida('Cabeçada', 700, 18, 1000), finta(500), golpe('Dois socos', 600, 10, 850, 2, 330)], pausaMs: [700, 1050] }],
  },
  // O teste do Brutus para o Octavius: o Touro de Bronze, só investidas e chifradas.
  'touro-bronze': {
    id: 'touro-bronze',
    nome: 'O Touro de Bronze',
    vida: 140,
    contra: 18,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [investida('Investida do touro', 800, 20, 1200), golpe('Chifrada', 650, 14, 900), finta(600), investida('Investida do touro', 700, 20, 1200)], pausaMs: [800, 1100] },
      { ataques: [investida('Investida dupla', 650, 16, 1100), fogo('Bafo de vapor', 700, 18, 1000), golpe('Chifradas', 550, 10, 900, 3, 300), finta(450)], pausaMs: [600, 900] },
    ],
  },

  // ---------- Caminho do Octavius: Capítulo 4, O Mercado das Engrenagens ----------
  // Rota A (telhados)
  'vigia-telhado': {
    id: 'vigia-telhado',
    nome: 'Vigia dos Telhados',
    vida: 105,
    contra: 16,
    fases: [{ ataques: [fogo('Pedra de funda', 650, 17, 900), golpe('Luneta na cabeça', 580, 13, 800), finta(480), fogo('Duas pedras', 600, 11, 900, 2, 330)], pausaMs: [600, 950] }],
  },
  'gato-ferro': {
    id: 'gato-ferro',
    nome: 'Gato de Ferro',
    vida: 115,
    contra: 17,
    fases: [{ ataques: [golpe('Arranhão', 480, 8, 850, 4, 240), investida('Bote do gato', 600, 19, 1000), finta(420), golpe('Mordida', 520, 14, 750)], pausaMs: [500, 850] }],
  },
  'vigia-chefe': {
    id: 'vigia-chefe',
    nome: 'Chefe dos Vigias',
    vida: 130,
    contra: 19,
    pecas: 3,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [fogo('Chuva de pedras', 650, 12, 950, 3, 330), golpe('Luneta', 560, 14, 800), finta(450)], pausaMs: [600, 900] },
      { ataques: [investida('Salto de telhado', 600, 21, 1000), fogo('Chuva de pedras', 580, 12, 950, 3, 300), finta(400)], pausaMs: [500, 800] },
    ],
  },
  // Rota B (esgoto)
  'jacare-esgoto': {
    id: 'jacare-esgoto',
    nome: 'Jacaré de Esgoto',
    vida: 120,
    contra: 18,
    fases: [{ ataques: [investida('Bocarra', 700, 22, 1100), golpe('Rabada', 600, 14, 850), finta(500), golpe('Mordida dupla', 600, 11, 900, 2, 360)], pausaMs: [650, 1000] }],
  },
  'limpador-esgoto': {
    id: 'limpador-esgoto',
    nome: 'Limpador de Esgoto',
    vida: 105,
    contra: 16,
    fases: [{ ataques: [golpe('Escovão', 600, 13, 800), fogo('Jato de lodo', 650, 17, 950), finta(480), golpe('Desentupidor', 560, 10, 850, 2, 320)], pausaMs: [600, 950] }],
  },
  'jacare-rei': {
    id: 'jacare-rei',
    nome: 'O Jacaré-Rei',
    vida: 135,
    contra: 20,
    pecas: 3,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [investida('Bocarra', 650, 22, 1100), finta(450), golpe('Rabada dupla', 560, 12, 900, 2, 330)], pausaMs: [600, 900] },
      { ataques: [golpe('Rolar na água', 480, 8, 900, 4, 260), investida('Bocarra', 560, 24, 1100), finta(400)], pausaMs: [500, 800] },
    ],
  },
  // Rota C (feira)
  'feirante-automato': {
    id: 'feirante-automato',
    nome: 'Feirante Autômato',
    vida: 100,
    contra: 15,
    fases: [{ ataques: [golpe('Prato da balança', 600, 13, 800), fogo('Melancia voadora', 650, 16, 950), finta(480), golpe('Peso de ferro', 580, 10, 850, 2, 330)], pausaMs: [600, 950] }],
  },
  'guarda-feira': {
    id: 'guarda-feira',
    nome: 'Guarda da Feira',
    vida: 115,
    contra: 17,
    fases: [{ ataques: [golpe('Cassetete', 560, 14, 800), investida('Multa voadora', 620, 18, 950), finta(450), golpe('Cassetete duplo', 540, 10, 850, 2, 300)], pausaMs: [550, 900] }],
  },
  'feirante-chefe': {
    id: 'feirante-chefe',
    nome: 'O Fiscal da Feira',
    vida: 130,
    contra: 19,
    pecas: 3,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [fogo('Chuva de frutas', 620, 11, 950, 3, 320), golpe('Carimbo', 560, 15, 800), finta(450)], pausaMs: [600, 900] },
      { ataques: [investida('Carrinho de feira', 580, 22, 1000), golpe('Carimbo duplo', 500, 10, 850, 3, 280), finta(400)], pausaMs: [500, 800] },
    ],
  },
  // Na porta do cofre (todas as rotas)
  'guarda-cofre': {
    id: 'guarda-cofre',
    nome: 'Guarda do Cofre',
    vida: 125,
    contra: 18,
    fases: [{ ataques: [golpe('Chave gigante', 580, 15, 850), finta(450), investida('Porta de cofre', 640, 20, 1000), golpe('Moedas na cara', 520, 8, 850, 3, 280)], pausaMs: [550, 900] }],
  },
  // Chefão: o Cobrador. A boca de moeda fica vermelha antes do JATO DE MOEDAS (esquiva).
  cobrador: {
    id: 'cobrador',
    nome: 'O Cobrador',
    vida: 230,
    chefao: true,
    contra: 20,
    trocaDeFase: [0.66, 0.33],
    fases: [
      { ataques: [golpe('Saco de moedas', 700, 16, 950), fogo('Jato de moedas', 850, 20, 1100), finta(600), golpe('Ábaco', 620, 11, 900, 2, 360)], pausaMs: [750, 1100] },
      { ataques: [fogo('Jato de moedas', 700, 14, 1000, 2, 400), investida('Multa em dobro', 650, 22, 1100), finta(500), golpe('Carimbo do imposto', 560, 16, 800)], pausaMs: [600, 950] },
      { ataques: [fogo('Chuva de ouro', 620, 12, 1000, 3, 340), golpe('Cobrança final', 500, 9, 900, 4, 260), finta(420), investida('Multa em dobro', 560, 24, 1100)], pausaMs: [500, 800] },
    ],
  },

  // ---------- Caminho do Octavius: Capítulo 5, A Frota Fantasma ----------
  'sentinela-cais': {
    id: 'sentinela-cais',
    nome: 'Sentinela do Cais',
    vida: 125,
    contra: 19,
    fases: [{ ataques: [investida('Lança-lanterna', 600, 20, 950), golpe('Cabo da lança', 540, 13, 780), finta(450), fogo('Lanterna acesa', 620, 18, 950)], pausaMs: [550, 900] }],
  },
  'imediato-ferro': {
    id: 'imediato-ferro',
    nome: 'O Imediato de Ferro',
    vida: 140,
    contra: 20,
    pecas: 3,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [golpe('Machado de abordagem', 600, 16, 850), investida('Perna de pau', 650, 20, 1000), finta(450)], pausaMs: [550, 900] },
      { ataques: [golpe('Machado em X', 500, 10, 900, 3, 280), investida('Abordagem!', 560, 22, 1000), finta(400)], pausaMs: [480, 780] },
    ],
  },
  // Chefão: o Almirante Ferrugem reconstruído em aço, com dois canhões.
  'almirante-aco': {
    id: 'almirante-aco',
    nome: 'Almirante de Aço',
    vida: 260,
    chefao: true,
    contra: 22,
    trocaDeFase: [0.66, 0.33],
    fases: [
      { ataques: [fogo('Canhão duplo', 800, 13, 1100, 2, 420), golpe('Sabre de aço', 620, 16, 900), finta(550), investida('Abalroar', 700, 22, 1100)], pausaMs: [650, 1000] },
      { ataques: [fogo('Bordada de aço', 650, 11, 1000, 3, 360), golpe('Sabre duplo', 540, 11, 900, 2, 300), finta(450), investida('Abalroar', 600, 24, 1100)], pausaMs: [550, 850] },
      { ataques: [fogo('Todos os canhões', 600, 10, 1000, 4, 300), golpe('Sabre furioso', 480, 9, 900, 4, 250), finta(400), investida('Afundar tudo', 540, 26, 1100)], pausaMs: [480, 760] },
    ],
  },

  // ---------- Caminho do Octavius: Capítulo 6, A Naumaquia ----------
  'tritao-mecanico': {
    id: 'tritao-mecanico',
    nome: 'Tritão Mecânico',
    vida: 150,
    contra: 21,
    fases: [{ ataques: [investida('Tridente', 580, 20, 950), fogo('Onda', 650, 18, 1000), finta(420), golpe('Três pontas', 520, 9, 900, 3, 270)], pausaMs: [500, 850] }],
  },
  mergulhador: {
    id: 'mergulhador',
    nome: 'O Mergulhador',
    vida: 155,
    contra: 21,
    fases: [{ ataques: [fogo('Arpão', 620, 20, 950), finta(420), golpe('Capacete', 560, 15, 800), investida('Emergir!', 600, 22, 1000)], pausaMs: [500, 850] }],
  },
  'campeao-naval': {
    id: 'campeao-naval',
    nome: 'O Campeão Naval',
    vida: 175,
    contra: 24,
    pecas: 4,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [golpe('Âncora-mangual', 650, 18, 950), investida('Escudo do Olho', 620, 22, 1000), finta(480)], pausaMs: [550, 900] },
      { ataques: [golpe('Mangual girando', 500, 9, 900, 4, 260), investida('Escudo do Olho', 560, 24, 1000), finta(420)], pausaMs: [480, 780] },
    ],
  },
  'mergulhador-elite': {
    id: 'mergulhador-elite',
    nome: 'Mergulhador de Elite',
    vida: 165,
    contra: 22,
    fases: [{ ataques: [fogo('Dois arpões', 580, 13, 950, 2, 330), finta(400), golpe('Capacete', 520, 16, 780), investida('Emergir!', 560, 23, 1000)], pausaMs: [480, 800] }],
  },
  // Chefão: o Leviatã Mecânico, a serpente de ferro que sobe da água da arena.
  leviata: {
    id: 'leviata',
    nome: 'O Leviatã Mecânico',
    vida: 300,
    chefao: true,
    contra: 24,
    trocaDeFase: [0.66, 0.33],
    fases: [
      { ataques: [investida('Bote da serpente', 750, 24, 1150), fogo('Jato de vapor', 800, 22, 1100), finta(550), golpe('Cauda', 650, 13, 950, 2, 380)], pausaMs: [650, 1000] },
      { ataques: [golpe('Anéis de ferro', 550, 10, 950, 3, 300), fogo('Jato de vapor', 680, 22, 1100), investida('Bote da serpente', 620, 25, 1150), finta(450)], pausaMs: [550, 880] },
      { ataques: [fogo('Tempestade de vapor', 600, 13, 1000, 3, 340), golpe('Abraço da serpente', 480, 9, 950, 4, 250), finta(400), investida('Bote final', 540, 28, 1150)], pausaMs: [480, 760] },
    ],
  },
  // O final do Octavius: o mesmo titã, mas quem ajuda são o Cassius e o Helios.
  'censor-tita-octavius': {
    id: 'censor-tita-octavius',
    nome: 'O Censor, Titã do Coliseu',
    vida: 380,
    chefao: true,
    contra: 26,
    aliados: ['cassius', 'helios'],
    pecas: 0,
    trocaDeFase: [0.66, 0.33],
    fases: [
      { alvo: 'AS PERNAS', ataques: [investida('Pisão do titã', 900, 26, 1200), golpe('Pedras caindo', 700, 12, 1000, 3, 380), finta(650)], pausaMs: [800, 1200] },
      { alvo: 'OS BRAÇOS', ataques: [golpe('Braço de engrenagem', 650, 16, 1000, 2, 400), fogo('Correntes da Lei', 750, 24, 1100), finta(550), investida('Varredura de braço', 650, 26, 1100)], pausaMs: [650, 1000] },
      { alvo: 'O OLHO', ataques: [fogo('O OLHO: raio da Resposta Única', 800, 30, 1300), golpe('Desmoronar', 500, 10, 950, 4, 270), finta(450), fogo('Raio duplo', 650, 20, 1100, 2, 420)], pausaMs: [550, 850] },
    ],
  },

  // ---------- Caminho do Helios: Capítulo 1, O Céu Proibido (Observatório) ----------
  apagador: {
    id: 'apagador',
    nome: 'Apagador de Estrelas',
    vida: 48,
    contra: 10,
    fases: [{ ataques: [golpe('Abafador', 800, 12, 950), fogo('Fumaça preta', 900, 14, 1000), finta(750)], pausaMs: [1000, 1400] }],
  },
  'morcego-mecanico': {
    id: 'morcego-mecanico',
    nome: 'Morcego Mecânico',
    vida: 50,
    contra: 10,
    fases: [{ ataques: [golpe('Mordidinha', 600, 8, 850, 2, 380), investida('Rasante', 750, 15, 1000), finta(650)], pausaMs: [900, 1300] }],
  },
  'pretoriano-noturno': {
    id: 'pretoriano-noturno',
    nome: 'Pretoriano Noturno',
    vida: 62,
    contra: 12,
    fases: [{ ataques: [fogo('Virote da besta', 850, 16, 1000), golpe('Coronha', 700, 12, 850), finta(650)], pausaMs: [900, 1300] }],
  },
  'apagador-grande': {
    id: 'apagador-grande',
    nome: 'Grande Apagador',
    vida: 72,
    contra: 13,
    fases: [{ ataques: [golpe('Sino abafador', 750, 14, 950), fogo('Nuvem de fuligem', 850, 16, 1000), finta(600), golpe('Dois abafos', 700, 10, 900, 2, 380)], pausaMs: [850, 1200] }],
  },
  'morcego-enxame': {
    id: 'morcego-enxame',
    nome: 'Enxame de Morcegos',
    vida: 80,
    contra: 14,
    pecas: 3,
    fases: [{ ataques: [golpe('Revoada', 600, 7, 900, 3, 320), investida('Rasante', 700, 16, 1000), finta(550)], pausaMs: [800, 1150] }],
  },
  // Chefão: o Eclipse. Luta NO ESCURO: use a LUZ para ver o sinal.
  eclipse: {
    id: 'eclipse',
    nome: 'O Eclipse',
    vida: 165,
    chefao: true,
    escuro: true,
    contra: 16,
    trocaDeFase: [0.66, 0.33],
    fases: [
      { ataques: [golpe('Sombra que bate', 900, 14, 1100), fogo('Coroa negra', 1000, 20, 1200), finta(800)], pausaMs: [1100, 1500] },
      { ataques: [golpe('Duas sombras', 800, 11, 1050, 2, 450), fogo('Coroa negra', 900, 20, 1150), finta(700), investida('Mergulho escuro', 850, 20, 1150)], pausaMs: [900, 1300] },
      { ataques: [fogo('Coroa em chamas', 800, 14, 1100, 2, 450), golpe('Escuridão total', 700, 9, 1050, 3, 380), finta(600)], pausaMs: [800, 1150] },
    ],
  },

  // ---------- Helios, Capítulo 2: Fuga pelos Telhados ----------
  'vigia-noturno': {
    id: 'vigia-noturno',
    nome: 'Vigia Noturno',
    vida: 70,
    contra: 13,
    fases: [{ ataques: [fogo('Pedra no escuro', 750, 15, 950), golpe('Luneta', 650, 12, 800), finta(600)], pausaMs: [850, 1250] }],
  },
  'morcego-gigante': {
    id: 'morcego-gigante',
    nome: 'Morcego Gigante',
    vida: 76,
    contra: 14,
    fases: [{ ataques: [investida('Mergulho', 700, 18, 1000), golpe('Asas de serra', 620, 9, 900, 2, 340), finta(560)], pausaMs: [800, 1150] }],
  },
  'pretoriano-besteiro': {
    id: 'pretoriano-besteiro',
    nome: 'Besteiro da Noite',
    vida: 82,
    contra: 14,
    fases: [{ ataques: [fogo('Dois virotes', 750, 11, 950, 2, 380), golpe('Coronha', 600, 13, 800), finta(550)], pausaMs: [800, 1150] }],
  },
  'cacador-aprendiz': {
    id: 'cacador-aprendiz',
    nome: 'Aprendiz de Caçador',
    vida: 88,
    contra: 15,
    fases: [{ ataques: [investida('Corrente com gancho', 700, 18, 1000), golpe('Lanterna', 600, 12, 800), finta(520), golpe('Gancho duplo', 600, 10, 850, 2, 330)], pausaMs: [750, 1100] }],
  },
  'gato-telhado': {
    id: 'gato-telhado',
    nome: 'Gato dos Telhados',
    vida: 92,
    contra: 15,
    pecas: 3,
    fases: [{ ataques: [golpe('Arranhão', 520, 8, 850, 3, 260), investida('Bote', 650, 18, 1000), finta(480)], pausaMs: [700, 1050] }],
  },
  // Chefão: o Caçador de Sombras. Também no escuro (só a lanterna vermelha dele brilha).
  'cacador-sombras': {
    id: 'cacador-sombras',
    nome: 'O Caçador de Sombras',
    vida: 190,
    chefao: true,
    escuro: true,
    contra: 18,
    trocaDeFase: [0.66, 0.33],
    fases: [
      { ataques: [investida('Corrente com gancho', 850, 20, 1150), golpe('Lâmina', 750, 14, 1000), finta(700)], pausaMs: [950, 1350] },
      { ataques: [golpe('Duas lâminas', 700, 10, 1000, 2, 420), investida('Puxão', 750, 22, 1150), finta(600), fogo('Lanterna vermelha', 800, 18, 1050)], pausaMs: [800, 1200] },
      { ataques: [fogo('Lanterna vermelha', 700, 13, 1050, 2, 420), golpe('Caçada', 620, 9, 1000, 3, 340), finta(520), investida('Puxão', 650, 24, 1150)], pausaMs: [700, 1050] },
    ],
  },

  // ---------- Helios, Capítulo 3: O Ludus ----------
  'carcereiro-noturno': {
    id: 'carcereiro-noturno',
    nome: 'O Carcereiro',
    vida: 105,
    contra: 16,
    fases: [{ ataques: [golpe('Molho de chaves', 650, 14, 850), investida('Porta de cela', 700, 19, 1000), finta(520)], pausaMs: [700, 1050] }],
  },
  'apagador-espiao': {
    id: 'apagador-espiao',
    nome: 'Apagador Espião',
    vida: 110,
    contra: 16,
    fases: [{ ataques: [fogo('Fuligem', 650, 17, 950), golpe('Abafador', 600, 13, 800), finta(480), golpe('Abafo duplo', 600, 10, 850, 2, 320)], pausaMs: [650, 1000] }],
  },
  'estatua-treino': {
    id: 'estatua-treino',
    nome: 'Estátua de Treino do Brutus',
    vida: 125,
    contra: 18,
    fases: [{ ataques: [golpe('Punho de mármore', 750, 20, 1100), investida('Rolar', 750, 20, 1100), finta(600), golpe('Dois punhos', 650, 13, 1000, 2, 380)], pausaMs: [750, 1100] }],
  },

  // ---------- Helios, Capítulo 4: O Aqueduto ----------
  'guarda-aqueduto': {
    id: 'guarda-aqueduto',
    nome: 'Guarda do Aqueduto',
    vida: 110,
    contra: 17,
    fases: [{ ataques: [fogo('Jato de água', 650, 17, 950), golpe('Escudo de válvula', 580, 13, 800), finta(480)], pausaMs: [650, 1000] }],
  },
  'morcego-aqueduto': {
    id: 'morcego-aqueduto',
    nome: 'Morcego das Arcadas',
    vida: 105,
    contra: 16,
    fases: [{ ataques: [golpe('Revoada', 520, 8, 850, 3, 270), investida('Rasante', 620, 18, 950), finta(460)], pausaMs: [600, 950] }],
  },
  'guarda-comporta': {
    id: 'guarda-comporta',
    nome: 'Guarda da Comporta',
    vida: 120,
    contra: 18,
    fases: [{ ataques: [investida('Onda da comporta', 680, 21, 1050), golpe('Roda de ferro', 580, 14, 800), finta(460), fogo('Dois jatos', 620, 11, 950, 2, 330)], pausaMs: [600, 950] }],
  },
  'apagador-aqueduto': {
    id: 'apagador-aqueduto',
    nome: 'Apagador do Amanhecer',
    vida: 118,
    contra: 17,
    fases: [{ ataques: [fogo('Nuvem negra', 620, 16, 950), golpe('Sino abafador', 560, 13, 800), finta(440), golpe('Três abafos', 540, 8, 900, 3, 280)], pausaMs: [580, 920] }],
  },
  'pretoriano-noturno-elite': {
    id: 'pretoriano-noturno-elite',
    nome: 'Pretoriano Noturno de Elite',
    vida: 128,
    contra: 19,
    pecas: 3,
    fases: [{ ataques: [fogo('Três virotes', 620, 9, 950, 3, 300), golpe('Coronha', 540, 14, 780), finta(420), investida('Carga', 600, 20, 1000)], pausaMs: [560, 900] }],
  },
  // Chefão: o Guardião do Aqueduto, feito dos arcos de pedra, jorrando água.
  'guardiao-aqueduto': {
    id: 'guardiao-aqueduto',
    nome: 'O Guardião do Aqueduto',
    vida: 230,
    chefao: true,
    contra: 20,
    trocaDeFase: [0.66, 0.33],
    fases: [
      { ataques: [golpe('Arco de pedra', 750, 17, 1000), fogo('Cachoeira', 850, 21, 1100), finta(600)], pausaMs: [750, 1100] },
      { ataques: [golpe('Dois arcos', 650, 12, 1000, 2, 400), fogo('Cachoeira', 750, 21, 1100), investida('Enxurrada', 700, 23, 1100), finta(500)], pausaMs: [650, 1000] },
      { ataques: [fogo('Rompimento', 650, 13, 1000, 3, 360), golpe('Desabamento', 560, 9, 950, 4, 270), finta(450), investida('Enxurrada', 600, 25, 1100)], pausaMs: [550, 880] },
    ],
  },

  // ---------- Helios, Capítulo 5: O Oráculo de Bronze (Templo de Apolo) ----------
  'sacerdote-bronze': {
    id: 'sacerdote-bronze',
    nome: 'Sacerdote de Bronze',
    vida: 125,
    contra: 18,
    fases: [{ ataques: [fogo('Incenso em brasa', 620, 17, 950), golpe('Turíbulo', 560, 13, 800), finta(450), golpe('Turíbulo girando', 540, 9, 900, 3, 280)], pausaMs: [600, 950] }],
  },
  'estatua-viva': {
    id: 'estatua-viva',
    nome: 'Estátua Viva de Apolo',
    vida: 140,
    contra: 20,
    fases: [{ ataques: [golpe('Golpe de mármore', 700, 20, 1050), fogo('Flecha de sol', 650, 18, 1000), finta(500)], pausaMs: [650, 1000] }],
  },
  'sacerdote-incenso': {
    id: 'sacerdote-incenso',
    nome: 'Guardião do Incenso',
    vida: 132,
    contra: 19,
    fases: [{ ataques: [fogo('Nuvem de incenso', 600, 12, 950, 2, 340), golpe('Turíbulo', 540, 14, 780), finta(430), investida('Procissão', 600, 20, 1000)], pausaMs: [560, 900] }],
  },
  'estatua-arqueira': {
    id: 'estatua-arqueira',
    nome: 'Estátua Arqueira',
    vida: 138,
    contra: 20,
    fases: [{ ataques: [fogo('Três flechas', 600, 10, 950, 3, 300), golpe('Arco na cabeça', 540, 14, 780), finta(420)], pausaMs: [560, 900] }],
  },
  'sacerdote-supremo': {
    id: 'sacerdote-supremo',
    nome: 'O Sumo Sacerdote de Bronze',
    vida: 155,
    contra: 22,
    pecas: 4,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [fogo('Incenso em brasa', 600, 17, 950), golpe('Cetro', 540, 15, 800), finta(430)], pausaMs: [560, 900] },
      { ataques: [fogo('Altar em chamas', 560, 12, 950, 3, 300), investida('Cetro em carga', 560, 22, 1000), finta(400)], pausaMs: [480, 800] },
    ],
  },
  // Chefão: a Sibila Corrompida, a cópia do Censor dentro do templo.
  'sibila-corrompida': {
    id: 'sibila-corrompida',
    nome: 'A Sibila Corrompida',
    vida: 260,
    chefao: true,
    ilusoes: true,
    contra: 22,
    trocaDeFase: [0.66, 0.33],
    fases: [
      { ataques: [fogo('Profecia falsa', 750, 20, 1050), finta(600), golpe('Cabos', 650, 12, 950, 2, 380), finta(550)], pausaMs: [650, 1000] },
      { ataques: [finta(500), fogo('Olho vermelho', 680, 22, 1050), golpe('Cabos', 560, 9, 950, 3, 300), investida('Voo do oráculo', 640, 23, 1100)], pausaMs: [560, 900] },
      { ataques: [fogo('Mil profecias', 600, 12, 1000, 3, 330), finta(450), golpe('Tempestade de cabos', 500, 8, 950, 4, 260), investida('Voo do oráculo', 560, 25, 1100)], pausaMs: [480, 800] },
    ],
  },

  // ---------- Helios, Capítulo 6: Noite de Eclipse (Coliseu) ----------
  'apagador-colosso': {
    id: 'apagador-colosso',
    nome: 'Apagador Colosso',
    vida: 155,
    contra: 21,
    fases: [{ ataques: [golpe('Sino gigante', 650, 18, 1000), fogo('Noite instantânea', 650, 19, 1000), finta(450), golpe('Dois sinos', 580, 12, 950, 2, 330)], pausaMs: [550, 900] }],
  },
  'morcego-eclipse': {
    id: 'morcego-eclipse',
    nome: 'Morcegos do Eclipse',
    vida: 150,
    contra: 20,
    escuro: true,
    fases: [{ ataques: [golpe('Revoada negra', 520, 8, 900, 4, 260), investida('Rasante', 620, 20, 1000), finta(450)], pausaMs: [600, 950] }],
  },
  'gladiador-sombra': {
    id: 'gladiador-sombra',
    nome: 'Gladiador de Sombra',
    vida: 165,
    contra: 22,
    fases: [{ ataques: [golpe('Espada de sombra', 560, 15, 850), finta(420), investida('Sombra que corre', 600, 22, 1000), golpe('Corte duplo', 520, 10, 900, 2, 300)], pausaMs: [520, 860] }],
  },
  'pretoriano-eclipse': {
    id: 'pretoriano-eclipse',
    nome: 'Pretoriano do Eclipse',
    vida: 160,
    contra: 22,
    escuro: true,
    fases: [{ ataques: [fogo('Virote no escuro', 650, 18, 1000), golpe('Gládio', 560, 14, 850), finta(450), golpe('Gládio duplo', 540, 10, 900, 2, 320)], pausaMs: [560, 900] }],
  },
  'campeao-sombrio': {
    id: 'campeao-sombrio',
    nome: 'O Campeão Sombrio',
    vida: 180,
    contra: 24,
    pecas: 4,
    trocaDeFase: [0.5],
    fases: [
      { ataques: [golpe('Machado de sombra', 620, 18, 950), investida('Investida negra', 620, 22, 1000), finta(450)], pausaMs: [520, 880] },
      { ataques: [golpe('Fúria sombria', 480, 9, 900, 4, 250), fogo('Sombra em chamas', 560, 20, 1000), finta(400)], pausaMs: [460, 780] },
    ],
  },
  // Chefão: o Gigante das Sombras, no escuro do eclipse.
  'gigante-sombras': {
    id: 'gigante-sombras',
    nome: 'O Gigante das Sombras',
    vida: 290,
    chefao: true,
    escuro: true,
    contra: 24,
    trocaDeFase: [0.66, 0.33],
    fases: [
      { ataques: [investida('Pisão de sombra', 850, 24, 1200), golpe('Mão de ferro', 750, 15, 1050), finta(650)], pausaMs: [800, 1150] },
      { ataques: [golpe('Duas mãos', 650, 12, 1050, 2, 420), fogo('Raio vermelho', 750, 22, 1100), finta(550), investida('Pisão de sombra', 700, 25, 1200)], pausaMs: [650, 1000] },
      { ataques: [fogo('Rachaduras de luz', 650, 13, 1050, 3, 360), golpe('Esmagar', 560, 9, 1000, 4, 270), finta(480), investida('Queda do gigante', 600, 27, 1200)], pausaMs: [550, 880] },
    ],
  },
  // O final do Helios: o titã, com o Cassius e o Octavius ajudando.
  'censor-tita-helios': {
    id: 'censor-tita-helios',
    nome: 'O Censor, Titã do Coliseu',
    vida: 380,
    chefao: true,
    contra: 26,
    aliados: ['cassius', 'octavius'],
    pecas: 0,
    trocaDeFase: [0.66, 0.33],
    fases: [
      { alvo: 'AS PERNAS', ataques: [investida('Pisão do titã', 900, 26, 1200), golpe('Pedras caindo', 700, 12, 1000, 3, 380), finta(650)], pausaMs: [800, 1200] },
      { alvo: 'OS BRAÇOS', ataques: [golpe('Braço de engrenagem', 650, 16, 1000, 2, 400), fogo('Correntes da Lei', 750, 24, 1100), finta(550), investida('Varredura de braço', 650, 26, 1100)], pausaMs: [650, 1000] },
      { alvo: 'O OLHO', ataques: [fogo('O OLHO: raio da Resposta Única', 800, 30, 1300), golpe('Desmoronar', 500, 10, 950, 4, 270), finta(450), fogo('Raio duplo', 650, 20, 1100, 2, 420)], pausaMs: [550, 850] },
    ],
  },
  // ---------- O capítulo secreto: Os Três ----------
  ...INIMIGOS_SECRETOS,
};
