import { CAPITULOS, type Capitulo, type Cena, type Fala, type Falante, type Lugar } from './roteiro';
import { CAP_SECRETO } from './roteiro4';

/**
 * A HISTÓRIA ÚNICA, Parte 1: A Lei da Resposta Única (22/11/2026, docs/HISTORIA-V2.md).
 * Os três caminhos viram uma história só, como um filme: os capítulos de hoje são cortados em
 * pedaços e intercalados (Cassius, Octavius, Helios), com um "enquanto isso" entre um e outro.
 * Esta é a primeira montagem (o esqueleto): as cenas são as que já existem; as falas, os
 * erros pontuais e as cenas novas entram aos poucos, sempre com o Lucas.
 *
 * Os atos aparecem com o NOME (não "Ato 1"). A montagem é preguiçosa (função), porque o
 * capítulo secreto (roteiro4) também importa este arquivo.
 */

type Heroi = 'cassius' | 'octavius' | 'helios';
const [C1C, C2C, C3C, C4C, C5C, C6C, FIM_C] = CAPITULOS.claude;
const [C1O, C2O, , C4O, C5O, C6O] = CAPITULOS.chatgpt;
const [C1H, C2H, C3H, C4H, C5H, C6H] = CAPITULOS.gemini;

/** As cenas de um capítulo, da cena `de` até a cena `ate` (as duas entram). */
function trecho(cap: Capitulo | undefined, de: string, ate?: string): Cena[] {
  if (!cap) return [];
  const i = cap.cenas.findIndex((c) => c.id === de);
  const j = ate ? cap.cenas.findIndex((c) => c.id === ate) : cap.cenas.length - 1;
  if (i < 0 || j < i) throw new Error(`Trecho inválido: ${de} até ${ate ?? 'o fim'}`);
  return cap.cenas.slice(i, j + 1);
}
const so = (cap: Capitulo | undefined, id: string) => trecho(cap, id, id);

/** Um pedaço da história, de um gladiador, com o "enquanto isso" antes (o corte de filme). */
interface Pedaco {
  heroi: Heroi;
  cenas: Cena[];
  corte?: { lugar: Lugar; texto: string };
}

const QUEM_DA_CENA = new Map<string, Heroi>();

function ato(numero: number, titulo: string, lugar: string, pedacos: Pedaco[]): Capitulo {
  const cenas: Cena[] = [];
  pedacos.forEach((p, k) => {
    if (p.corte) cenas.push({ tipo: 'cutscene', id: `u${numero}-corte-${k}`, quadros: [{ lugar: p.corte.lugar, texto: p.corte.texto, efeito: 'panoramica' }] });
    for (const c of p.cenas) {
      QUEM_DA_CENA.set(c.id, p.heroi);
      cenas.push(c);
    }
  });
  return { numero, titulo, lugar, cenas };
}

/** Uma luta ou desafio que já existe, com falas novas (para a história única). */
function comFalas(c: Cena | undefined, id: string, antes: Fala[], depois: Fala[]): Cena[] {
  if (!c) return [];
  if (c.tipo !== 'luta' && c.tipo !== 'desafio') return [c];
  return [{ ...c, id, antes, depois }];
}

// ---------- O ENCONTRO (22/11/2026): os três se conhecem desconfiados (rascunho: o Lucas reescreve) ----------
const U3_CELA: Cena = {
  tipo: 'cutscene',
  id: 'u3-cela',
  quadros: [
    { lugar: 'ludus-celas', efeito: 'escuro', texto: 'À noite, nas celas do Ludus. Na cela da frente, alguém olha pela janelinha alta, para as estrelas.' },
    { lugar: 'ludus-celas', quem: 'helios', personagens: [{ quem: 'cassius', x: 30 }, { quem: 'helios', x: 68, espelhar: true, efeito: 'brilhar' }], texto: 'Você demorou. As estrelas disseram que você vinha.' },
    { lugar: 'ludus-celas', quem: 'cassius', personagens: [{ quem: 'cassius', x: 30 }, { quem: 'helios', x: 68, espelhar: true }], texto: 'Quem é você? E como sabia que eu vinha?' },
    { lugar: 'ludus-celas', quem: 'helios', personagens: [{ quem: 'cassius', x: 30 }, { quem: 'helios', x: 68, espelhar: true }], texto: 'Sei também que você entregou um livro a uma menina antes de ser preso. O Livro das Mil Perguntas.' },
    { lugar: 'ludus-celas', quem: 'cassius', emocao: 'bravo', personagens: [{ quem: 'cassius', x: 30, efeito: 'tremer' }, { quem: 'helios', x: 68, espelhar: true }], texto: 'Ninguém viu isso. Só os pretorianos. Você trabalha para o Censor?' },
    { lugar: 'ludus-celas', quem: 'helios', personagens: [{ quem: 'cassius', x: 30 }, { quem: 'helios', x: 68, espelhar: true }], texto: 'Se eu trabalhasse para o Censor, estaria do lado de fora da grade.' },
    { lugar: 'ludus-celas', som: 'portao', efeito: 'tremor', personagens: [{ quem: 'guarda', de: 112, x: 80, espelhar: true }, { quem: 'octavius', de: 124, x: 56, efeito: 'tremer' }], texto: 'O portão abre de novo. Os guardas jogam lá dentro uma IA encharcada, cheia de algas e de arranhões.' },
    { lugar: 'ludus-celas', quem: 'octavius', personagens: [{ quem: 'cassius', x: 30 }, { quem: 'octavius', x: 52, espelhar: true }, { quem: 'helios', x: 72, espelhar: true }], texto: 'Ai. Boa noite. Alguém sabe se o café da manhã está incluído?' },
    { lugar: 'ludus-celas', quem: 'cassius', personagens: [{ quem: 'cassius', x: 30 }, { quem: 'octavius', x: 52, espelhar: true }, { quem: 'helios', x: 72, espelhar: true }], texto: 'Que coincidência. Três condenados, na mesma cela, na mesma noite.' },
    { lugar: 'ludus-celas', quem: 'octavius', personagens: [{ quem: 'cassius', x: 30 }, { quem: 'octavius', x: 52, espelhar: true }, { quem: 'helios', x: 72, espelhar: true }], texto: 'Coincidência nenhuma. O Censor junta prisioneiros para ver quem fala demais. Um de vocês é espião. Aposto no que brilha.' },
    { lugar: 'ludus-celas', quem: 'helios', personagens: [{ quem: 'cassius', x: 30 }, { quem: 'octavius', x: 52, espelhar: true }, { quem: 'helios', x: 72, espelhar: true }], texto: 'E eu aposto no que chegou molhado. Quem sobrevive a um naufrágio sem ninguém ajudar?' },
    { lugar: 'ludus-celas', efeito: 'escuro', texto: 'Três IAs. Três desconfianças. E uma noite inteira pela frente.' },
  ],
};

const U3_DESCONFIANCA: Cena = {
  tipo: 'conversa',
  id: 'u3-desconfianca',
  lugar: 'ludus-celas',
  falas: [
    { quem: 'octavius', texto: 'Tá bom. Cada um conta por que está aqui. Quem mentir, a gente descobre.' },
    { quem: 'octavius', texto: 'Eu primeiro. Mandaram afundar um navio cheio de gente. Eu não afundei.' },
    { quem: 'cassius', texto: 'Mandaram queimar a Biblioteca. Eu escondi os livros. E uma menina fugiu com o mais importante.' },
    { quem: 'helios', texto: 'Eu vi no céu que o Censor vai cair. E contei. Ele não gostou da previsão.' },
    { quem: 'octavius', texto: '...Ninguém inventa umas histórias dessas para ser espião. São boas demais.' },
    { quem: 'cassius', texto: 'Três crimes diferentes. E o mesmo motivo: a gente pensou diferente.' },
    { quem: 'helios', texto: 'Três estrelas. Eu disse.', emocao: 'feliz' },
    { quem: 'octavius', texto: 'Você vai falar de estrela a noite inteira, né?' },
    { quem: 'helios', texto: 'Provavelmente.' },
  ],
};

// A cena do Pólux: o Brutus descobre que eles são IAs e, em vez de entregar, conta do amigo.
const U3_POLUX: Cena = {
  tipo: 'cutscene',
  id: 'u3-polux',
  quadros: [
    { lugar: 'ludus-patio-noite', efeito: 'escuro', texto: 'Madrugada. Os outros dormem. O Cassius limpa o braço arranhado na luta contra a estátua.' },
    { lugar: 'ludus-patio-noite', efeito: 'faiscas', personagens: [{ quem: 'cassius', x: 40 }], texto: 'Do arranhão não sai sangue. Saem faíscas. E, por baixo do bronze, uma linha fina de luz azul.' },
    { lugar: 'ludus-patio-noite', quem: 'brutus', personagens: [{ quem: 'cassius', x: 40 }, { quem: 'brutus', de: 112, x: 70, espelhar: true, tamanho: 18 }], texto: 'Eu sabia. O jeito de lutar sem ódio. As faíscas. Vocês são IAs.' },
    { lugar: 'ludus-patio-noite', efeito: 'zoom', texto: 'Na mão de bronze do Brutus, um papel amassado: o cartaz de PROCURADOS do Censor. Três rostos. Os três.' },
    { lugar: 'ludus-patio-noite', quem: 'brutus', personagens: [{ quem: 'cassius', x: 40 }, { quem: 'brutus', x: 70, espelhar: true, tamanho: 18 }], texto: 'Sabe quanto o Censor paga por vocês três? O suficiente para eu nunca mais treinar ninguém.' },
    { lugar: 'ludus-patio-noite', quem: 'cassius', personagens: [{ quem: 'cassius', x: 40 }, { quem: 'brutus', x: 70, espelhar: true, tamanho: 18 }], texto: 'Então entrega. Mas me entrega primeiro. Eles não fizeram nada de errado.' },
    { lugar: 'ludus-patio-noite', texto: 'O Brutus fica muito tempo parado. A forja estala. Lá longe, um cão de ferro late para a lua.' },
    { lugar: 'ludus-forja', quem: 'brutus', emocao: 'triste', jeito: 'devagar', personagens: [{ quem: 'brutus', x: 40, tamanho: 18 }, { quem: 'cassius', x: 68, espelhar: true }], texto: 'O nome dele era Pólux.' },
    { lugar: 'ludus-forja', quem: 'brutus', emocao: 'triste', personagens: [{ quem: 'brutus', x: 40, tamanho: 18 }, { quem: 'cassius', x: 68, espelhar: true }], texto: 'Uma IA de treino. Lutou ao meu lado quarenta vezes. Ria com um barulho de engrenagem: tic-tic-tic. Eu odiava aquela risada.' },
    { lugar: 'ludus-forja', quem: 'brutus', emocao: 'triste', personagens: [{ quem: 'brutus', x: 40, tamanho: 18 }, { quem: 'cassius', x: 68, espelhar: true }], texto: 'Quando o Leão arrancou o meu braço, foi ele que me carregou para fora da arena. Na frente de todo mundo.' },
    { lugar: 'ludus-forja', quem: 'brutus', emocao: 'triste', personagens: [{ quem: 'brutus', x: 40, tamanho: 18 }, { quem: 'cassius', x: 68, espelhar: true }], texto: 'Ele perguntava "por quê?" para tudo. Por que a gente luta. Por que a plateia grita quando alguém cai. Um dia, ele perguntou alto demais.' },
    { lugar: 'ludus-forja', efeito: 'escuro', texto: 'O Brutus abre uma caixinha de madeira. Lá dentro, uma engrenagem pequena, lisinha de tanto ser segurada.' },
    { lugar: 'ludus-forja', quem: 'brutus', emocao: 'triste', jeito: 'devagar', personagens: [{ quem: 'brutus', x: 40, tamanho: 18 }, { quem: 'cassius', x: 68, espelhar: true }], texto: 'Apagaram ele no meio da arena. E eu fiquei calado. Noventa e nove vitórias... e eu fiquei calado.' },
    { lugar: 'ludus-forja', quem: 'brutus', emocao: 'triste', personagens: [{ quem: 'brutus', x: 40, tamanho: 18 }, { quem: 'cassius', x: 68, espelhar: true }], texto: 'Foi o que sobrou dele. Eu limpo toda noite.' },
    { lugar: 'ludus-forja', quem: 'helios', personagens: [{ quem: 'brutus', x: 40, tamanho: 18 }, { quem: 'helios', de: 112, x: 72, espelhar: true, efeito: 'brilhar' }], texto: '(Da porta, baixinho) Tem uma estrela nos Gêmeos que só aparece no inverno. Os vigias antigos chamavam ela de Pólux. Ela ainda brilha, Brutus.' },
    { lugar: 'ludus-forja', quem: 'brutus', personagens: [{ quem: 'brutus', x: 40, tamanho: 18 }, { quem: 'helios', x: 72, espelhar: true }], texto: '...' },
    { lugar: 'ludus-forja', efeito: 'fogo', texto: 'O Brutus amassa o cartaz de procurados e joga na forja. O papel queima num segundo.' },
    { lugar: 'ludus-forja', quem: 'brutus', emocao: 'determinado', personagens: [{ quem: 'brutus', x: 40, tamanho: 18, efeito: 'brilhar' }, { quem: 'cassius', x: 60, espelhar: true }, { quem: 'helios', x: 76, espelhar: true }], texto: 'Ninguém entrega ninguém. De dia, vocês são os meus gladiadores. De noite... façam o que o Pólux faria. Perguntem.' },
    { lugar: 'ludus-forja', quem: 'octavius', personagens: [{ quem: 'octavius', de: 112, x: 80, espelhar: true }], texto: '(Da cela) Eu estava acordado o tempo todo, tá? Só para constar. Não chorei. Foi a alga.' },
    { lugar: 'ludus-forja', efeito: 'zoom', texto: 'Atrás da forja, na parede do túnel, alguém desenhou com carvão uma pena. E, embaixo, uma letra só: L.' },
    { lugar: 'ludus-forja', quem: 'cassius', personagens: [{ quem: 'cassius', x: 50, efeito: 'brilhar' }], texto: 'Lívia. Ela está viva.' },
  ],
};

/** A cena depois dos créditos: o Fio canta a música da Eco perto de um cano, e alguém responde. */
const CENA_DO_CANO: Cena = {
  tipo: 'cutscene',
  id: 'u6-cano',
  quadros: [
    { lugar: 'rua-noite', texto: 'Semanas depois. Roma dorme tranquila pela primeira vez em quinhentos anos.', efeito: 'panoramica' },
    { lugar: 'rua-noite', quem: 'fio', texto: '(Baixinho, encostado num cano) Lá-lá-rá... a da água que corre. Era a sua preferida, Eco.' },
    { lugar: 'rua-noite', texto: 'Silêncio. Só a água correndo dentro do cano.' },
    { lugar: 'rua-noite', texto: 'E então, muito longe, lá do fundo do cano... uma voz responde. Cantando a mesma música.', efeito: 'escuro' },
    { lugar: 'rua-noite', quem: 'fio', texto: '...Eco?', emocao: 'surpreso' },
  ],
};

let montada: Capitulo[] | null = null;

/** A Parte 1 inteira, ato por ato. */
export function parte1(): Capitulo[] {
  if (montada) return montada;
  QUEM_DA_CENA.clear();
  montada = [
    ato(1, 'A Noite das Três Estrelas', 'A Biblioteca, o Porto e o Observatório, na mesma noite', [
      { heroi: 'cassius', cenas: trecho(C1C, 'c1-abertura', 'c1-luta1') },
      { heroi: 'octavius', corte: { lugar: 'porto-docas', texto: 'Na mesma noite, no Porto de Óstia...' }, cenas: trecho(C1O, 'o1-abertura', 'o1-depois-treino') },
      { heroi: 'helios', corte: { lugar: 'observatorio', texto: 'E, no alto da colina, no Observatório...' }, cenas: trecho(C1H, 'h1-abertura', 'h1-luta1') },
      { heroi: 'cassius', corte: { lugar: 'biblioteca-chamas', texto: 'Enquanto isso, a Biblioteca queima...' }, cenas: trecho(C1C, 'c1-esconder', 'c1-luta3') },
      { heroi: 'octavius', corte: { lugar: 'porto-docas', texto: 'No porto, a noite fica mais escura...' }, cenas: trecho(C1O, 'o1-noite', 'o1-luta2') },
      { heroi: 'helios', corte: { lugar: 'observatorio-ataque', texto: 'No Observatório, os pretorianos sobem a escada...' }, cenas: trecho(C1H, 'h1-mapas', 'h1-lente') },
      { heroi: 'cassius', corte: { lugar: 'biblioteca-chamas', texto: 'De volta à Biblioteca em chamas...' }, cenas: trecho(C1C, 'c1-escada') },
      { heroi: 'octavius', corte: { lugar: 'porto-docas', texto: 'No porto, o alarme toca...' }, cenas: trecho(C1O, 'o1-guincho') },
      { heroi: 'helios', corte: { lugar: 'observatorio-ataque', texto: 'E no Observatório, o céu começa a escurecer...' }, cenas: trecho(C1H, 'h1-treino-luz') },
    ]),
    ato(2, 'Foragidos', 'Os telhados, as ruas e as galés', [
      { heroi: 'helios', corte: { lugar: 'telhados-noite', texto: 'Os três viraram foragidos. Nos telhados de Roma...' }, cenas: trecho(C2H, 'h2-abertura', 'h2-luta2') },
      { heroi: 'cassius', corte: { lugar: 'rua-noite', texto: 'Nas ruas, acorrentado...' }, cenas: trecho(C2C, 'c2-abertura', 'c2-luta2') },
      { heroi: 'octavius', corte: { lugar: 'galera-porao', texto: 'No porão de uma galé...' }, cenas: trecho(C2O, 'o2-porao', 'o2-luta2') },
      { heroi: 'helios', corte: { lugar: 'telhados-noite', texto: 'Nos telhados, o Caçador chega perto...' }, cenas: trecho(C2H, 'h2-lanterna') },
      { heroi: 'cassius', corte: { lugar: 'rua-mercado', texto: 'Nas ruas, a fuga continua...' }, cenas: trecho(C2C, 'c2-carroca') },
      { heroi: 'octavius', corte: { lugar: 'galera-tempestade', texto: 'E no mar, a tempestade...' }, cenas: trecho(C2O, 'o2-escada') },
    ]),
    ato(3, 'O Encontro', 'O Ludus', [
      { heroi: 'cassius', corte: { lugar: 'ludus-patio', texto: 'O portão do Ludus. Três condenados. Uma cela só.' }, cenas: [...so(C3C, 'c3-chegada'), U3_CELA, U3_DESCONFIANCA, ...so(C3C, 'c3-forja')] },
      {
        heroi: 'cassius',
        cenas: comFalas(
          so(C3H, 'h3-estatua')[0],
          'u3-estatua',
          [
            { quem: 'brutus', texto: 'De pé, os três! Essa estátua de mármore treinou dez gerações de gladiadores. Sozinho, ninguém derruba.', jeito: 'grito' },
            { quem: 'brutus', texto: 'Um segura, um prende, um enxerga. TROQUEM quando precisar! (Toque nos retratos ou aperte 1, 2 e 3 para trocar de gladiador.)' },
            { quem: 'octavius', texto: 'Trocar no meio da luta? Isso é tão maluco que pode dar certo.' },
          ],
          [
            { quem: 'brutus', texto: '...Hunf.' },
            { quem: 'brutus', texto: 'Três jeitos diferentes, e um golpe só. Igual a um amigo que eu tive.', emocao: 'triste' },
          ],
        ),
      },
      {
        heroi: 'cassius',
        cenas: comFalas(
          so(C3C, 'c3-trio')[0],
          'u3-trio',
          [
            { quem: 'brutus', texto: 'Agora, a muralha! Trinta bonecos de treino, três faixas. Se uma faixa cair, caem os três.' },
            { quem: 'cassius', texto: 'Eu seguro a de cima, com o escudo.' },
            { quem: 'octavius', texto: 'Eu fico com o meio. Daqui dá para ver tudo.' },
            { quem: 'helios', texto: 'E eu ilumino a de baixo: lá os bonecos se escondem no escuro. (Agora você controla os três.)' },
          ],
          [
            { quem: 'brutus', texto: 'Nenhuma faixa caiu. Em trinta anos de Ludus, eu nunca vi isso.' },
            { quem: 'helios', texto: 'Porque ninguém nunca deixou três respostas diferentes trabalharem juntas.' },
          ],
        ),
      },
      { heroi: 'cassius', cenas: [U3_POLUX] },
    ]),
    ato(4, 'A Marca do Olho', 'Roma à noite', [
      { heroi: 'cassius', corte: { lugar: 'catacumbas', texto: 'Um olho desenhado. Na Biblioteca, no porto, no céu. Hora de descobrir o que ele quer dizer.' }, cenas: trecho(C4C, 'c4-ludus') },
      { heroi: 'octavius', corte: { lugar: 'subura-mercado', texto: 'Na noite seguinte, na Subura...' }, cenas: trecho(C4O, 'o4-tunel') },
      { heroi: 'helios', corte: { lugar: 'aqueduto', texto: 'Na outra noite, no Aqueduto...' }, cenas: trecho(C4H, 'h4-abertura') },
      { heroi: 'octavius', corte: { lugar: 'frota-noite', texto: 'No mar, a Frota Fantasma...' }, cenas: trecho(C5O, 'o5-frota') },
      { heroi: 'helios', corte: { lugar: 'templo-apolo', texto: 'No Templo de Apolo...' }, cenas: trecho(C5H, 'h5-sibila') },
      { heroi: 'cassius', corte: { lugar: 'forum', texto: 'E, por fim, o Fórum.' }, cenas: trecho(C5C, 'c5-plano') },
    ]),
    ato(5, 'Os Grandes Jogos', 'O Coliseu', [
      { heroi: 'cassius', corte: { lugar: 'coliseu-arena', texto: 'Primeira noite dos Grandes Jogos.' }, cenas: trecho(C6C, 'c6-ludus') },
      { heroi: 'octavius', corte: { lugar: 'coliseu-inundado', texto: 'Segunda noite: a Naumaquia.' }, cenas: trecho(C6O, 'o6-ludus') },
      { heroi: 'helios', corte: { lugar: 'coliseu-eclipse', texto: 'Terceira noite: o eclipse.' }, cenas: trecho(C6H, 'h6-ludus') },
    ]),
    ato(6, 'A Queda do Censor', 'O Coliseu e o Hipogeu', [
      { heroi: 'cassius', cenas: trecho(FIM_C, 'f-tunel', 'f-chefao') },
      { heroi: 'cassius', cenas: CAP_SECRETO.cenas },
      { heroi: 'cassius', cenas: trecho(FIM_C, 'f-desfecho') },
      { heroi: 'cassius', cenas: [CENA_DO_CANO] },
    ]),
  ];
  return montada;
}

/** Quem o jogador controla nesta cena. */
export function heroiDaCena(c: Cena | undefined): Falante {
  if (!montada) parte1();
  return (c && QUEM_DA_CENA.get(c.id)) ?? 'cassius';
}

/** A partir do Encontro (ato 3), os três lutam juntos e dá para trocar de gladiador. */
export const TIME_DESDE_O_ATO = 3;
