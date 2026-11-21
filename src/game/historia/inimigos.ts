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
      { ataques: [investida('Pisão do titã', 900, 26, 1200), golpe('Pedras caindo', 700, 12, 1000, 3, 380), finta(650)], pausaMs: [800, 1200] },
      { ataques: [golpe('Braço de engrenagem', 650, 16, 1000, 2, 400), fogo('Correntes da Lei', 750, 24, 1100), finta(550), investida('Varredura de braço', 650, 26, 1100)], pausaMs: [650, 1000] },
      { ataques: [fogo('O OLHO: raio da Resposta Única', 800, 30, 1300), golpe('Desmoronar', 500, 10, 950, 4, 270), finta(450), fogo('Raio duplo', 650, 20, 1100, 2, 420)], pausaMs: [550, 850] },
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
};
