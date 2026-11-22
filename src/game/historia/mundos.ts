import type { Coisa, Mundo, Pessoa, SaidaMundo, TemaMundo } from './mundo';
import type { Cena, ConversaLudus, Lugar } from './roteiro';

/**
 * Os mapas do mundo visto de cima. O primeiro (22/11/2026) é a Grande Biblioteca à
 * noite, no capítulo 1 do Cassius, no lugar do antigo "explorar as estantes". As falas
 * são as do roteiro (o humor novo a gente escreve junto com o Lucas).
 *
 * Ladrilhos: # parede · J janela · E estante · . chão · c tapete · T mesa · S estátua ·
 * p coluna · v castiçal · P saída (a escada das catacumbas).
 */
export const MUNDOS: Record<string, Mundo> = {
  'biblioteca-noite': {
    id: 'biblioteca-noite',
    tema: 'biblioteca',
    lugar: 'biblioteca-estantes',
    objetivo: 'Ande pela Biblioteca e encontre a Lívia.',
    saida: { rotulo: 'ESCADA DAS CATACUMBAS', estilo: 'escada' },
    inicio: [3, 12],
    mapa: [
      '########################',
      '#EEEEE##JJJ##JJJ##EEEEE#',
      '#......................#',
      '#.p..cccccccccccccc..p.#',
      '#....c..TT....TT..c....#',
      '#EE..c............c..EE#',
      '#EE..c.....TT.....c..EE#',
      '#EE..c............c..EE#',
      '#....c..TT....TT..c....#',
      '#.p..cccccccccccccc..p.#',
      '#......................#',
      '#EEEE.EEEE....EEEE.EEEE#',
      '#......................#',
      '#v....................P#',
      '########################',
    ],
    coisas: [
      {
        id: 'estante',
        x: 7,
        y: 11,
        falas: [
          { quem: 'cassius', texto: 'Livros sobre a Guerra das Ideias. Metade deles o Censor mandou "corrigir".' },
          { quem: 'cassius', texto: 'Corrigir. Que palavra bonita para apagar.', emocao: 'triste' },
        ],
      },
      {
        id: 'mesa',
        x: 8,
        y: 4,
        falas: [
          { quem: 'cassius', texto: 'O Livro das Mil Perguntas. O mais proibido de todos.' },
          { quem: 'cassius', texto: 'Cada página termina com uma pergunta, e nenhuma tem resposta pronta. Foi nele que a Lívia aprendeu a ler.', emocao: 'feliz' },
        ],
      },
      {
        id: 'janela',
        x: 9,
        y: 1,
        falas: [{ quem: 'cassius', texto: 'Roma lá fora está escura. Ninguém nas janelas das casas. Todo mundo de luz apagada, fingindo que não pensa.', emocao: 'triste' }],
      },
    ],
    pessoas: [
      {
        id: 'livia',
        quem: 'livia',
        obrigatorio: true,
        rota: [
          [18, 12],
          [12, 12],
          [12, 10],
          [18, 10],
        ],
        falas: [
          { quem: 'livia', texto: 'Mestre Cass! Mestre Cass!', emocao: 'surpreso', jeito: 'grito' },
          { quem: 'livia', texto: 'Eles estão vindo! Os Incineradores do Censor! Vi da janela da torre!', emocao: 'medo', jeito: 'grito' },
          { quem: 'cassius', texto: 'Calma, Lívia. Respire. Quantos?', emocao: 'pensando' },
          { quem: 'livia', texto: 'Muitos. E uma coisa enorme atrás deles, toda vermelha, soltando fumaça pela cabeça...', emocao: 'medo', jeito: 'devagar' },
          { quem: 'cassius', texto: 'A Fornalha. Então o Censor não quer só os livros. Quer a Biblioteca inteira.', emocao: 'determinado', zoom: 'perto' },
        ],
      },
    ],
  },
};

/**
 * OS MAPAS DOS PONTOS DE EXPLORAR (22/11/2026): a cena de explorar continua no roteiro
 * (as mesmas falas, os mesmos pontos, o pedaço da chave), e o mapa só diz onde cada ponto
 * fica. Ponto com personagem vira uma pessoa no mapa; os outros viram coisas para examinar.
 *
 * Ladrilhos novos: o nicho de ossos · m mármore · f fonte · t barraca · g grade de ferro ·
 * x monte de sucata · M a máquina violeta · N parede com nomes gravados.
 */
export interface MapaDeExplorar {
  tema: TemaMundo;
  mapa: string[];
  inicio: [number, number];
  /** Onde fica cada ponto (pelo id do ponto) e, se for gente, por onde anda. */
  pontos: Record<string, [number, number]>;
  rotas?: Record<string, [number, number][]>;
}

export const MAPAS: Record<string, MapaDeExplorar> = {
  // Capítulo 4: os túneis das catacumbas, com os sinais dos Copistas.
  'catacumbas-tuneis': {
    tema: 'catacumbas',
    inicio: [2, 6],
    mapa: [
      '######################',
      '#oooo#oooooo#ooooooo##',
      '#....#......#.......v#',
      '#....#..##..#........#',
      '#.v..#..##..####..####',
      '#.......##...........#',
      '#....................#',
      '####..#####..###.....#',
      '#ooo..ooooo..ooo.....#',
      '#v.................v.#',
      '#...................P#',
      '######################',
    ],
    pontos: { parede: [8, 7], ossos: [14, 8], copista: [17, 9] },
  },
  // Capítulo 4: o ossário, seguindo os rastros da Lívia.
  'catacumbas-ossario': {
    tema: 'catacumbas',
    inicio: [2, 8],
    mapa: [
      '######################',
      '#oooooooo####ooooooo##',
      '#........#..#........#',
      '#..v.....#..#.....v..#',
      '#........#..#........#',
      '#....................#',
      '#..oo.........oo.....#',
      '#..oo.........oo..xx.#',
      '#.................xx.#',
      '#...................P#',
      '######################',
    ],
    pontos: { pegadas: [6, 5], bilhete: [10, 8], ninho: [18, 7] },
  },
  // Capítulo 4: o Arquivo Proibido, com as gavetas e a máquina violeta.
  'catacumbas-arquivo': {
    tema: 'catacumbas',
    inicio: [3, 8],
    mapa: [
      '######################',
      '#EEEEEE##EEEEEE##EEE##',
      '#......##......##....#',
      '#....................#',
      '#.EE..EE..EE......MM.#',
      '#.EE..EE..EE......MM.#',
      '#....................#',
      '#.EE..EE..EE.........#',
      '#....................#',
      '#v..................P#',
      '######################',
    ],
    pontos: { 'gaveta-eco': [2, 4], 'gaveta-polux': [6, 7], maquina: [18, 4] },
  },
  // Capítulo 5: o Fórum, antes da leitura (mármore, colunas, fonte, barracas e a estátua do Censor).
  forum: {
    tema: 'forum',
    inicio: [2, 10],
    mapa: [
      '########################',
      '#p..p..p..p..p..p..p..p#',
      '#......................#',
      '#..tt......mmmm......tt#',
      '#.........mmmmmm.......#',
      '#........mmmSSmmm......#',
      '#........mmmSSmmm......#',
      '#.........mmmmmm.......#',
      '#..ff......mmmm......tt#',
      '#..ff..................#',
      '#......................#',
      '#p..p..p..p..p..p..p..p#',
      '#.....................P#',
      '########################',
    ],
    pontos: { vendedora: [3, 3], 'guarda-cansado': [20, 9], estatua: [12, 5] },
    rotas: {
      'guarda-cansado': [
        [20, 9],
        [20, 6],
        [16, 9],
      ],
    },
  },
  // Capítulo 6: o túnel dos gladiadores, com a parede dos nomes e o portão da arena.
  'coliseu-tunel': {
    tema: 'tunel',
    inicio: [2, 4],
    mapa: [
      '####################',
      '####################',
      '##NNNNNNNN###v###gg#',
      '#................gg#',
      '#..............P.gg#',
      '#v.........S.......#',
      '#..................#',
      '####v######v########',
      '####################',
    ],
    pontos: { parede: [5, 2], armadura: [11, 5], portao: [17, 3] },
  },
  // O final: a Grande Biblioteca reaberta, de dia, com todo mundo (e o pedaço da chave num canto).
  'biblioteca-reaberta': {
    tema: 'biblioteca',
    inicio: [3, 12],
    mapa: [
      '########################',
      '#EEEEE##JJJ##JJJ##EEEEE#',
      '#......................#',
      '#.p..cccccccccccccc..p.#',
      '#....c..TT....TT..c....#',
      '#EE..c............c..EE#',
      '#EE..c.....TT.....c..EE#',
      '#EE..c............c..EE#',
      '#....c..TT....TT..c....#',
      '#.p..cccccccccccccc..p.#',
      '#......................#',
      '#EEEE.EEEE....EEEE.EEEE#',
      '#......................#',
      '#v....................P#',
      '########################',
    ],
    pontos: { brutus: [6, 6], fio: [16, 6], censor: [14, 8], livia: [12, 10], 'chave-cassius': [21, 2] },
    rotas: {
      livia: [
        [12, 10],
        [18, 10],
        [18, 12],
        [12, 12],
      ],
      brutus: [
        [6, 6],
        [6, 9],
      ],
    },
  },
  // ---------- OCTAVIUS (22/11/2026) ----------
  // Capítulo 1: o cais de Óstia de noite, com o farol, a amarra e o píer.
  'porto-cais': {
    tema: 'porto',
    inicio: [2, 7],
    mapa: [
      'wwwwwwwwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwwwwwwwww',
      'www..wwwwwwwwwwwHHwwww',
      'www..wwwwwwwwwwwHHwwww',
      'www..wwwwww..www..wwww',
      'w.....r....k.........w',
      'w..bb..............b.w',
      'w....................w',
      '#kk.......bb.......kk#',
      '#v..................P#',
      '######################',
    ],
    pontos: { corrente: [6, 5], farol: [16, 3], gaivota: [3, 3], ordem: [12, 7] },
    rotas: {
      gaivota: [
        [3, 3],
        [4, 4],
      ],
      ordem: [
        [12, 7],
        [16, 7],
      ],
    },
  },
  // Capítulo 2: o porão da galera, com os bancos dos remadores e o tambor.
  'galera-porao': {
    tema: 'navio',
    inicio: [2, 2],
    mapa: [
      '######################',
      '#v........A.........v#',
      '#....................#',
      '#.qqq..qqq..qqq..qqq.#',
      '#....................#',
      '#.qqq..qqq..qqq..qqq.#',
      '#....................#',
      '#r..bb.........kk...P#',
      '######################',
    ],
    pontos: { tambor: [10, 1], corrente: [1, 7], remadores: [8, 4], gaivota: [16, 6] },
    rotas: {
      remadores: [
        [5, 4],
        [12, 4],
      ],
      gaivota: [
        [16, 6],
        [18, 2],
      ],
    },
  },
  // Capítulo 4: a feira da Subura, barracas, a fonte e o cartaz do Censor.
  'subura-feira': {
    tema: 'mercado',
    inicio: [2, 2],
    mapa: [
      '######################',
      '#####C########C#######',
      '#....................#',
      '#.tt...tt...tt...tt..#',
      '#....................#',
      '#..bb.....ff.....kk..#',
      '#.........ff.........#',
      '#.tt...tt.......tt...#',
      '#v..................P#',
      '######################',
    ],
    pontos: { cartaz: [5, 1], feirante: [8, 4], gaivota: [15, 6] },
    rotas: {
      gaivota: [
        [15, 6],
        [19, 4],
      ],
    },
  },
  // Capítulo 5: o cais da frota, de noite, com os navios encostados.
  'frota-cais': {
    tema: 'porto',
    inicio: [2, 7],
    mapa: [
      'wwwwwwwwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwwwwwwwww',
      'wnnnnnwwwwnnnnnwwwwwww',
      'wnnnnnwwwwnnnnnwwwwwww',
      'ww..wwwwwwww..wwwwwwww',
      'w....................w',
      'w..kk....bb....kk....w',
      'w....................w',
      '#v...kk.........v...P#',
      '######################',
    ],
    pontos: { padeiro: [6, 5], refugiados: [3, 6], gaivota: [12, 4] },
    rotas: {
      gaivota: [
        [12, 4],
        [12, 7],
      ],
    },
  },
  // Capítulo 6: a jangada no meio do Coliseu inundado.
  'coliseu-inundado': {
    tema: 'arena',
    inicio: [5, 2],
    mapa: [
      'BBBBBBBXXBBBBBB',
      'Bwwdddddddddddg',
      'Bwwdddddddddddg',
      'BwwdddddddddPwB',
      'BwwwwwwwwwwwwwB',
      'BwwwwwwwwwwwwwB',
      'BwwwwwwwwwwwwwB',
      'BBBBBBBBBBBBBBB',
    ],
    pontos: { plateia: [4, 0], grade: [14, 1], camarote: [7, 0] },
  },
  // O final: o Porto de Óstia livre, de dia, com o Esperança no cais.
  'porto-livre': {
    tema: 'porto',
    inicio: [2, 7],
    mapa: [
      'wwwwwwwwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwwwwwwwww',
      'www..wwwwwwwnnnnnnwwww',
      'www..wwwwwwwnnnnnnwwww',
      'www..wwwwwwww..wwwwwww',
      'w.....r..............w',
      'w..bb..............b.w',
      'w....................w',
      '#kk.......bb.......kk#',
      '#v..................P#',
      '######################',
    ],
    pontos: { marco: [8, 6], pistao: [13, 3], 'pistao-vivo': [16, 5], brutus: [5, 7], gaivota: [3, 3], 'chave-octavius': [20, 8] },
    rotas: {
      'pistao-vivo': [
        [16, 5],
        [16, 7],
      ],
    },
  },
  // ---------- HELIOS (22/11/2026) ----------
  // O Observatório: telescópio, planetário, mapas do céu e as janelas.
  observatorio: {
    tema: 'observatorio',
    inicio: [3, 8],
    mapa: [
      '######################',
      '##KK######JJ######KK##',
      '#....................#',
      '#..TT.........UU.....#',
      '#.............UU.....#',
      '#......OO............#',
      '#......OO.........E..#',
      '#.cccccccccccccccccc.#',
      '#v..................P#',
      '######################',
    ],
    pontos: {
      orrery: [7, 5],
      mapas: [2, 1],
      lumen: [12, 4],
      lente: [14, 3],
      diario: [3, 3],
      senhora: [15, 4],
      brutus: [10, 2],
      sibila: [5, 7],
      'chave-helios': [18, 6],
    },
    rotas: {
      lumen: [
        [12, 4],
        [17, 6],
      ],
      sibila: [
        [5, 7],
        [10, 7],
      ],
    },
  },
  // Capítulo 2: os telhados de Roma de noite, entre chaminés.
  telhados: {
    tema: 'telhados',
    inicio: [2, 2],
    mapa: [
      '########W######W##VVV#',
      '#....h...........h...#',
      '#....................#',
      '#..h........h........#',
      '#....................#',
      '#v.......h.........P.#',
      '######################',
    ],
    pontos: { janela: [8, 0], chamine: [5, 1], coliseu: [19, 0] },
  },
  // Capítulo 4: em cima do aqueduto, o canal de água no meio e a ponte.
  aqueduto: {
    tema: 'aqueduto',
    inicio: [2, 1],
    mapa: [
      'VVVVVVVVVVVVVVVVVVVVVV',
      '#....................#',
      '#...v.........v......#',
      'wwwwwwwwwddwwwwwwwwgww',
      '#....................#',
      '#..................P.#',
      'VVVVVVVVVVVVVVVVVVVVVV',
    ],
    pontos: { comporta: [19, 3], vista: [6, 0], lumen: [14, 4] },
    rotas: {
      lumen: [
        [14, 4],
        [17, 5],
      ],
    },
  },
  // Capítulo 5: a câmara do oráculo, colunas, mosaico e o tripé.
  'templo-oraculo': {
    tema: 'templo',
    inicio: [2, 2],
    mapa: [
      '######################',
      '#p..p..p..p..p..p..p.#',
      '#....................#',
      '#.....ZZZZZZZZZZ.....#',
      '#.....ZZZZQZZZZZ.....#',
      '#.....ZZZZZZZZZZ.....#',
      '#p..p..p..p..p..p..p.#',
      '#v..................P#',
      '######################',
    ],
    pontos: { mosaico: [7, 3], tripe: [10, 4], sibila: [14, 2] },
    rotas: {
      sibila: [
        [14, 2],
        [17, 4],
      ],
    },
  },
  // Capítulo 6: a arena antes do eclipse, com os espelhos.
  'arena-eclipse': {
    tema: 'arena',
    inicio: [2, 1],
    mapa: [
      'BBBBBBBBBBXXBBBBBBBBBB',
      'B....................B',
      'B..Y..aaaaaaaaaa..Y..B',
      'B.....aaaaaaaaaa.....B',
      'B.....aaaaaaaaaa.....B',
      'B..Y..aaaaaaaaaa..Y..B',
      'B..................P.B',
      'BBBBBBBBBBBBBBBBBBBBBB',
    ],
    pontos: { espelhos: [3, 2], sol: [11, 3], sibila: [16, 4] },
    rotas: {
      sibila: [
        [16, 4],
        [16, 1],
      ],
    },
  },
  // ---------- O CAPÍTULO SECRETO (22/11/2026) ----------
  // O Hipogeu: o elevador, as jaulas, as marcas na parede e as engrenagens.
  hipogeu: {
    tema: 'tunel',
    inicio: [2, 5],
    mapa: [
      '######################',
      '##gg####NNN###########',
      '#....................#',
      '#.........v..........#',
      '#.gg..............xx.#',
      '#....................#',
      '#v..................P#',
      '######################',
    ],
    pontos: { elevador: [2, 1], jaulas: [2, 4], marcas: [9, 1], engrenagem: [18, 4] },
  },
  // A galeria dos murais, debaixo da arena.
  'hipogeu-galeria': {
    tema: 'tunel',
    inicio: [2, 3],
    mapa: [
      '######################',
      '##II###II###II###II###',
      '#....................#',
      '#..v......v......v...#',
      '#....................#',
      '#..................P.#',
      '######################',
    ],
    pontos: { 'mural-1': [2, 1], 'mural-2': [7, 1], 'mural-3': [12, 1], 'mural-4': [17, 1] },
  },
  // O Coliseu Livre: a arena de dia, com todo mundo.
  'coliseu-livre': {
    tema: 'arena',
    inicio: [2, 1],
    mapa: [
      'BBBBBBBBBBXXBBBBBBBBBB',
      'B....................B',
      'B.....aaaaaaaaaa.....B',
      'B.....aaaaaaaaaa.....B',
      'B.....aaaaaaaaaa.....B',
      'B.....aaaaaaaaaa.....B',
      'B..................P.B',
      'BBBBBBBBBBBBBBBBBBBBBB',
    ],
    pontos: { brutus: [6, 2], livia: [10, 4], gaivota: [14, 2], lumen: [17, 5], censor: [4, 5] },
    rotas: {
      brutus: [
        [6, 2],
        [9, 2],
      ],
      gaivota: [
        [14, 2],
        [17, 3],
      ],
    },
  },
};

/** Monta o mapa de uma cena de explorar: os pontos dela, nos lugares que o mapa diz. */
/**
 * A SAÍDA DE CADA CENA (22/11/2026): cada lugar sai do seu jeito, com o seu nome. Sem
 * `estilo`, o mapa não tem lugar de saída (o P vira chão) e aparece o botão de seguir.
 */
export const SAIDAS: Record<string, SaidaMundo> = {
  // Cassius
  'c4-tuneis': { rotulo: 'TÚNEL DOS SINAIS', estilo: 'arco' },
  'c4-ossario': { rotulo: 'NINHO DOS RATOS', estilo: 'arco' },
  'c4-gavetas': { rotulo: 'SEGUIR COM A LÍVIA' },
  'c5-povo': { rotulo: 'COMEÇAR A LEITURA' },
  'c6-nomes': { rotulo: 'PORTÃO DA ARENA', estilo: 'grade' },
  'f-biblioteca': { rotulo: 'FECHAR O LIVRO' },
  // Octavius
  'o1-cais': { rotulo: 'BOLAR UM PLANO' },
  'o2-planejar': { rotulo: 'ESCOTILHA DO CONVÉS', estilo: 'escadaMao' },
  'o4-feira': { rotulo: 'BECO DO COFRE', estilo: 'portao' },
  'o5-tripulacao': { rotulo: 'SUBIR NO ESPERANÇA', estilo: 'prancha' },
  'o6-jangada': { rotulo: 'REMAR PARA O MEIO' },
  'fo-porto': { rotulo: 'ZARPAR' },
  // Helios
  'h1-observatorio': { rotulo: 'IR PARA O TELESCÓPIO' },
  'h1-lente': { rotulo: 'PORTA DOS FUNDOS', estilo: 'porta' },
  'h2-janelas': { rotulo: 'SEGUIR PELOS TELHADOS' },
  'h4-canal': { rotulo: 'CAMINHO DO TEMPLO', estilo: 'arco' },
  'h5-oraculo': { rotulo: 'SEGUIR A SIBILA' },
  'h6-arena-olhar': { rotulo: 'COMEÇAR O DUELO' },
  'fh-observatorio': { rotulo: 'OLHAR O CÉU' },
  // O capítulo secreto
  's-hipogeu': { rotulo: 'GALERIA DOS MURAIS', estilo: 'arco' },
  's-galeria': { rotulo: 'SEGUIR EM FRENTE' },
  's-coliseu-livre': { rotulo: 'FIM' },
};

export function mundoDoExplorar(cena: Extract<Cena, { tipo: 'explorar' }>, m: MapaDeExplorar): Mundo {
  const coisas: Coisa[] = [];
  const pessoas: Pessoa[] = [];
  for (const p of cena.pontos) {
    const [x, y] = m.pontos[p.id] ?? m.inicio;
    if (p.personagem) {
      pessoas.push({ id: p.id, quem: p.personagem, rota: m.rotas?.[p.id] ?? [[x, y]], falas: p.falas, obrigatorio: p.obrigatorio });
    } else {
      coisas.push({ id: p.id, x, y, falas: p.falas, obrigatorio: p.obrigatorio, segredo: p.segredo });
    }
  }
  const saida = SAIDAS[cena.id];
  // Sem lugar de saída: o P vira chão.
  const mapa = saida && !saida.estilo ? m.mapa.map((l) => l.replace('P', '.')) : m.mapa;
  return { id: cena.id, tema: m.tema, lugar: cena.lugar as Lugar, mapa, objetivo: cena.objetivo, inicio: m.inicio, coisas, pessoas, saida };
}

/**
 * O PÁTIO DO LUDUS visto de cima (22/11/2026): a arena de areia no meio, a forja do
 * ferreiro no canto, os bonecos de treino e as pessoas da cena andando. Examinar o
 * boneco abre os treinos do Brutus; examinar a forja abre o ferreiro.
 */
export const MAPA_LUDUS = [
  '########################',
  '#FF..xx........xx..vv..#',
  '#FF....................#',
  '#......aaaaaaaaaa......#',
  '#.p...aaaaaaaaaaaa...p.#',
  '#.....aaaaaaaaaaaa.....#',
  '#.....aaaaaaaaaaaa..D..#',
  '#.....aaaaaaaaaaaa.....#',
  '#.p...aaaaaaaaaaaa..D.p#',
  '#......aaaaaaaaaa......#',
  '#..............D.......#',
  '#xx..................xx#',
  '########################',
];
const LUGARES_LUDUS: [number, number][] = [
  [10, 5],
  [15, 4],
  [17, 9],
  [7, 8],
  [12, 10],
];

export function mundoDoLudus(conversas: ConversaLudus[], lugar: Lugar, objetivo: string): Mundo {
  // O Brutus anda em volta da arena, de olho em todo mundo; os outros ficam cada um no seu canto.
  let vaga = 1;
  const pessoas: Pessoa[] = conversas.map((c, k) => {
    const rota: [number, number][] =
      c.quem === 'brutus'
        ? [
            [10, 5],
            [14, 8],
            [8, 8],
          ]
        : [LUGARES_LUDUS[vaga++ % LUGARES_LUDUS.length]!];
    return { id: `${c.quem}-${k}`, quem: c.quem, rota, falas: c.falas };
  });
  const coisas: Coisa[] = [
    { id: 'boneco', x: 20, y: 6, falas: [] },
    { id: 'forja', x: 1, y: 1, falas: [] },
  ];
  return { id: 'ludus', tema: 'ludus', lugar, mapa: MAPA_LUDUS, objetivo, inicio: [3, 9], coisas, pessoas };
}
