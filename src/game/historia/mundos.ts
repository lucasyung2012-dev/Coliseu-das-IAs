import type { Coisa, Mundo, Pessoa, TemaMundo } from './mundo';
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
};

/** Monta o mapa de uma cena de explorar: os pontos dela, nos lugares que o mapa diz. */
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
  return { id: cena.id, tema: m.tema, lugar: cena.lugar as Lugar, mapa: m.mapa, objetivo: cena.objetivo, inicio: m.inicio, coisas, pessoas };
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
