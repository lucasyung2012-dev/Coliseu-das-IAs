import { CAPITULOS, type Capitulo, type Cena, type Falante, type Lugar } from './roteiro';
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
      { heroi: 'cassius', corte: { lugar: 'ludus-patio', texto: 'O portão do Ludus. Três condenados. Uma cela só.' }, cenas: trecho(C3C, 'c3-chegada', 'c3-memoria') },
      { heroi: 'helios', cenas: so(C3H, 'h3-estatua') },
      { heroi: 'cassius', cenas: trecho(C3C, 'c3-trio') },
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
