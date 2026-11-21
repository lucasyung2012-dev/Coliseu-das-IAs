import type { Mundo } from './mundo';

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
      '#EE..c.....SS.....c..EE#',
      '#EE..c.....SS.....c..EE#',
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
        id: 'estatua',
        x: 11,
        y: 6,
        falas: [
          { quem: 'narrador', texto: 'Uma estátua de bronze, coberta de poeira. Na base: "GUARDIÃO ZERO".' },
          { quem: 'cassius', texto: 'O primeiro guardião. Ninguém sabe o que aconteceu com ele.', emocao: 'pensando' },
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
