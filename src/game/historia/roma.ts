import { heroiDaCena, parte1, TIME_DESDE_O_ATO } from './historiaUnica';
import { MAPAS } from './mundos';
import type { Cena, Lugar } from './roteiro';

/**
 * ROMA (22/11/2026): os bairros do mapa de Roma da história única e onde cada lugar fica.
 * O mapa mostra o bairro da cena atual, os bairros já visitados (o resto fica na névoa), onde
 * está cada um dos três e o próximo destino. Funções puras, para dar para testar.
 */
export type BairroId = 'biblioteca' | 'porto' | 'observatorio' | 'ludus' | 'subura' | 'forum' | 'catacumbas' | 'aqueduto' | 'templo' | 'coliseu';
export type HeroiRoma = 'cassius' | 'octavius' | 'helios';

export interface Bairro {
  id: BairroId;
  nome: string;
  /** Onde fica no desenho do mapa (de 0 a 160 de largura e 0 a 100 de altura). */
  x: number;
  y: number;
}

export const BAIRROS: Bairro[] = [
  { id: 'biblioteca', nome: 'BIBLIOTECA', x: 36, y: 24 },
  { id: 'observatorio', nome: 'OBSERVATÓRIO', x: 132, y: 16 },
  { id: 'templo', nome: 'TEMPLO DE APOLO', x: 108, y: 32 },
  { id: 'subura', nome: 'SUBURA', x: 64, y: 30 },
  { id: 'forum', nome: 'FÓRUM', x: 82, y: 42 },
  { id: 'coliseu', nome: 'COLISEU', x: 94, y: 58 },
  { id: 'ludus', nome: 'LUDUS', x: 118, y: 66 },
  { id: 'aqueduto', nome: 'AQUEDUTO', x: 144, y: 46 },
  { id: 'catacumbas', nome: 'CATACUMBAS', x: 64, y: 74 },
  { id: 'porto', nome: 'PORTO DE ÓSTIA', x: 32, y: 84 },
];

/** Cada lugar da história fica num bairro de Roma (os navios e o mar contam como o Porto). */
export const BAIRRO_DO_LUGAR: Record<Lugar, BairroId> = {
  'biblioteca-porta': 'biblioteca',
  'biblioteca-estantes': 'biblioteca',
  'biblioteca-salao': 'biblioteca',
  'biblioteca-escada': 'biblioteca',
  'biblioteca-chamas': 'biblioteca',
  'roma-chamas': 'biblioteca',
  porto: 'porto',
  'porto-docas': 'porto',
  'navio-conves': 'porto',
  'galera-porao': 'porto',
  'galera-tempestade': 'porto',
  'praia-naufragio': 'porto',
  'frota-noite': 'porto',
  'mar-batalha': 'porto',
  observatorio: 'observatorio',
  'observatorio-dentro': 'observatorio',
  'observatorio-ataque': 'observatorio',
  olho: 'observatorio',
  'ludus-patio': 'ludus',
  'ludus-forja': 'ludus',
  'ludus-celas': 'ludus',
  'ludus-patio-noite': 'ludus',
  'roma-noite': 'subura',
  'rua-noite': 'subura',
  'jaula-carroca': 'subura',
  beco: 'subura',
  'rua-mercado': 'subura',
  'subura-mercado': 'subura',
  'subura-telhados': 'subura',
  'subura-esgoto': 'subura',
  'cofre-cobrador': 'subura',
  'telhados-noite': 'subura',
  forum: 'forum',
  'roma-praca': 'forum',
  catacumbas: 'catacumbas',
  'catacumbas-arquivo': 'catacumbas',
  aqueduto: 'aqueduto',
  'templo-apolo': 'templo',
  'templo-oraculo': 'templo',
  titulo: 'coliseu',
  camarote: 'coliseu',
  'coliseu-calado': 'coliseu',
  'coliseu-tunel': 'coliseu',
  'coliseu-arena': 'coliseu',
  'coliseu-noite': 'coliseu',
  'coliseu-inundado': 'coliseu',
  'coliseu-eclipse': 'coliseu',
  hipogeu: 'coliseu',
  'nucleo-camara': 'coliseu',
  'coliseu-livre': 'coliseu',
};

export const lugarDaCena = (c: Cena): Lugar => (c.tipo === 'cutscene' ? (c.quadros[0]?.lugar ?? 'roma-noite') : c.lugar);
export const bairroDaCena = (c: Cena): BairroId => BAIRRO_DO_LUGAR[lugarDaCena(c)];

export interface EstadoRoma {
  /** O ato atual (1 a 6; 7 = a Parte 1 terminou). */
  ato: number;
  atual: BairroId;
  visitados: BairroId[];
  /** Onde cada um dos três está (null = ainda não apareceu). */
  herois: Record<HeroiRoma, BairroId | null>;
  /** O próximo bairro aonde a história vai (null = ninguém sabe ainda). */
  proximo: BairroId | null;
  /** Os três já andam juntos (depois do Encontro). */
  juntos: boolean;
}

/** O estado de Roma para um save da história única (ato e cena). */
export function estadoRoma(ato: number, cena: number): EstadoRoma {
  const atos = parte1();
  const visitados = new Set<BairroId>();
  const herois: Record<HeroiRoma, BairroId | null> = { cassius: null, octavius: null, helios: null };
  const terminou = ato > atos.length;
  let atual: BairroId = 'coliseu';
  let proximo: BairroId | null = null;
  const sequencia = atos.flatMap((a, i) => a.cenas.map((c, j) => ({ c, i: i + 1, j })));
  const agora = terminou ? sequencia.length - 1 : sequencia.findIndex((x) => x.i === ato && x.j === cena);
  for (let k = 0; k <= agora && k < sequencia.length; k++) {
    const c = sequencia[k]!.c;
    const b = bairroDaCena(c);
    visitados.add(b);
    const h = heroiDaCena(c);
    if (h === 'cassius' || h === 'octavius' || h === 'helios') herois[h] = b;
    if (k === agora) atual = b;
  }
  for (let k = Math.max(0, agora) + 1; k < sequencia.length; k++) {
    const b = bairroDaCena(sequencia[k]!.c);
    if (b !== atual) {
      proximo = b;
      break;
    }
  }
  const juntos = ato >= TIME_DESDE_O_ATO;
  if (juntos) (Object.keys(herois) as HeroiRoma[]).forEach((h) => (herois[h] = atual));
  return { ato, atual, visitados: [...visitados], herois, proximo: terminou ? null : proximo, juntos };
}

/**
 * PASSEAR POR ROMA (22/11/2026, o começo da Roma livre): depois do Encontro, dá para entrar
 * nos bairros já visitados pelo mapa e andar à vontade, ouvindo o que o povo anda dizendo.
 * Cada bairro usa o mapa visto de cima que já existe; as falas são rascunho (o Lucas reescreve).
 */
export const PASSEIOS: Partial<Record<BairroId, { mapa: string; lugar: Lugar; rumores: [string, string] }>> = {
  biblioteca: { mapa: 'biblioteca-reaberta', lugar: 'biblioteca-salao', rumores: ['Dizem que um gladiador de bronze salvou os livros daqui. Eu não vi nada. (Pisca.)', 'As cinzas ainda cheiram a papel. Mas as estantes de baixo... ninguém sabe o que tem lá.'] },
  porto: { mapa: 'porto-cais', lugar: 'porto-docas', rumores: ['O comandante da frota sumiu na noite da ordem. Os marinheiros ainda brindam o nome dele, baixinho.', 'Tem uma gaivota que rouba sardinha de todo mundo. Mas dos refugiados ela nunca rouba.'] },
  observatorio: { mapa: 'observatorio', lugar: 'observatorio-dentro', rumores: ['O telescópio quebrou na noite do ataque. Mesmo assim, toda noite alguém sobe aqui para olhar o céu.', 'Três estrelas alinhadas. Minha avó dizia que isso é sinal de mudança.'] },
  subura: { mapa: 'subura-feira', lugar: 'subura-mercado', rumores: ['Os pretorianos passam aqui de hora em hora. Se perguntarem, você não me viu.', 'Alguém pintou três estrelas na parede do beco. Já apagaram duas vezes. Elas sempre voltam.'] },
  forum: { mapa: 'forum', lugar: 'forum', rumores: ['Antes, aqui era lugar de discussão. Agora todo mundo fala baixinho.', 'Ouvi uma música proibida ontem à noite. Desafinada. Linda.'] },
  catacumbas: { mapa: 'catacumbas-tuneis', lugar: 'catacumbas', rumores: ['Não desce sem luz. Dizem que as paredes guardam os nomes que o Censor apagou.', 'Os Copistas desenham uma pena onde é seguro.'] },
  aqueduto: { mapa: 'aqueduto', lugar: 'aqueduto', rumores: ['A água de Roma inteira passa por aqui. Se o aqueduto para, a cidade para.', 'Tem uma comporta que ninguém abre há cem anos. Mas alguém passou óleo nela semana passada.'] },
  templo: { mapa: 'templo-oraculo', lugar: 'templo-oraculo', rumores: ['A Sibila parou de responder perguntas. Agora ela só repete o que o Censor manda.', 'A fumaça do oráculo dá visões. Eu vi o meu gato falando. Não recomendo.'] },
  coliseu: { mapa: 'coliseu-tunel', lugar: 'coliseu-tunel', rumores: ['Os Jogos começam logo. Dizem que o Censor quer apagar alguém na frente de todo mundo.', 'Por baixo da arena tem um barulho, como um coração de ferro. Tum. Tum.'] },
};

/** A "cena" de passeio de um bairro: o mapa dele, sem objetivo, com duas pessoas contando novidades. */
export function cenaDePasseio(b: BairroId): Extract<Cena, { tipo: 'explorar' }> | null {
  const p = PASSEIOS[b];
  const m = p ? MAPAS[p.mapa] : undefined;
  if (!p || !m) return null;
  const nome = BAIRROS.find((x) => x.id === b)?.nome ?? '';
  const onde = Object.keys(m.pontos).slice(0, 2);
  return {
    tipo: 'explorar',
    id: `passeio-${b}`,
    lugar: p.lugar,
    objetivo: `Passeio: ${nome.toLowerCase()}. Ande à vontade e converse; para voltar, toque em VOLTAR AO MAPA.`,
    mapa: p.mapa,
    pontos: onde.map((id, k) => ({ id, x: 50, rotulo: 'Alguém de Roma', icone: 'pagina', personagem: 'povo' as const, falas: [{ quem: 'povo' as const, texto: p.rumores[k] ?? '' }] })),
  };
}

/** Os bairros onde já dá para passear (depois do Encontro, e só os já visitados). */
export function bairrosParaPassear(e: EstadoRoma): BairroId[] {
  if (!e.juntos) return [];
  return BAIRROS.map((b) => b.id).filter((id) => e.visitados.includes(id) && !!cenaDePasseio(id));
}
