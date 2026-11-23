import { heroiDaCena, parte1, TIME_DESDE_O_ATO } from './historiaUnica';
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
  { id: 'porto', nome: 'PORTO DE ÓSTIA', x: 22, y: 84 },
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
