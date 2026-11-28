import { heroiDaCena, parte1, TIME_DESDE_O_ATO } from './historiaUnica';
import { livre, type Mundo } from './mundo';
import { MAPAS, mundoDoExplorar } from './mundos';
import { INTERIORES } from './interiores';
import type { Cena, Falante, Lugar } from './roteiro';

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
 * OS BAIRROS VIVOS (24/11/2026). Depois do Encontro, dá para entrar nos bairros já visitados pelo
 * mapa e andar à vontade. Cada bairro tem a sua gente (três pessoas contando novidades), UM
 * SEGREDO escondido e UM PEDIDO (alguém perdeu uma coisa no bairro). Segredo achado vale 3 peças;
 * pedido feito, 5. Tudo em rascunho (o Lucas reescreve). As pessoas ficam perto da entrada, para
 * não sumirem fora da tela.
 */
interface Pedido {
  quem: Falante;
  pede: string;
  obrigado: string;
  acha: string;
}
interface Passeio {
  mapa: string;
  lugar: Lugar;
  gente: [Falante, string][];
  pedido: Pedido;
  segredo: string;
}

export const PASSEIOS: Partial<Record<BairroId, Passeio>> = {
  biblioteca: {
    mapa: 'biblioteca-reaberta',
    lugar: 'biblioteca-salao',
    gente: [
      ['povo', 'Dizem que um gladiador de bronze salvou os livros daqui. Eu não vi nada. (Pisca.)'],
      ['povo', 'As cinzas ainda cheiram a papel. Mas as estantes de baixo... ninguém sabe o que tem lá.'],
      ['copista', 'Eu sou copista. Copio de noite, escondido. De dia, eu finjo que vendo pão.'],
    ],
    pedido: {
      quem: 'crianca',
      pede: 'Perdi o meu livro de figuras aqui dentro! Tem um cavalo voando na capa. Acha pra mim?',
      obrigado: 'Meu livro! Agora eu já sei ler a parte do cavalo. Obrigada!',
      acha: 'Debaixo de uma mesa: um livro de figuras com um cavalo voando na capa. A dona vai ficar feliz.',
    },
    segredo: 'Atrás da estante, riscado na madeira: três estrelas e uma frase. "Livro escondido não é livro perdido."',
  },
  porto: {
    mapa: 'porto-cais',
    lugar: 'porto-docas',
    gente: [
      ['marinheiro', 'O comandante da frota sumiu na noite da ordem. Os marinheiros ainda brindam o nome dele, baixinho.'],
      ['povo', 'Tem uma gaivota que rouba sardinha de todo mundo. Mas dos refugiados ela nunca rouba.'],
      ['marinheiro', 'Dizem que o Esperança ainda navega por aí, de noite, sem luz nenhuma.'],
    ],
    pedido: {
      quem: 'feirante',
      pede: 'Uma gaivota roubou a minha melhor sardinha e escondeu em algum canto do cais. Acha pra mim?',
      obrigado: 'Minha sardinha! ...Meio mordida. Mas é minha. Obrigado!',
      acha: 'Escondida num canto do cais: uma sardinha meio mordida. Cheiro de gaivota.',
    },
    segredo: 'Num poste do cais, pintadas com piche: três estrelas. Embaixo, alguém escreveu "obrigado, comandante".',
  },
  observatorio: {
    mapa: 'observatorio',
    lugar: 'observatorio-dentro',
    gente: [
      ['povo', 'O telescópio quebrou na noite do ataque. Mesmo assim, toda noite alguém sobe aqui para olhar o céu.'],
      ['povo', 'Três estrelas alinhadas. Minha avó dizia que isso é sinal de mudança.'],
      ['povo', 'Eu não entendo nada de estrelas. Mas gosto de olhar.'],
    ],
    pedido: {
      quem: 'crianca',
      pede: 'Eu deixei cair o meu caderno de estrelas aqui em cima. Tem o desenho das três!',
      obrigado: 'Meu caderno! Olha: eu desenhei vocês três como estrelas.',
      acha: 'No chão do Observatório: um caderno de criança, cheio de estrelas desenhadas. Três delas são bem maiores.',
    },
    segredo: 'Na parede, perto do telescópio quebrado, uma frase antiga: "O céu é de quem olha."',
  },
  subura: {
    mapa: 'subura-feira',
    lugar: 'subura-mercado',
    gente: [
      ['povo', 'Os pretorianos passam aqui de hora em hora. Se perguntarem, você não me viu.'],
      ['povo', 'Alguém pintou três estrelas na parede do beco. Já apagaram duas vezes. Elas sempre voltam.'],
      ['feirante', 'Engrenagem nova, engrenagem usada, engrenagem que já foi de um pretoriano. Não pergunta de onde veio.'],
    ],
    pedido: {
      quem: 'feirante',
      pede: 'Uma das minhas balanças sumiu! Sem ela eu não vendo nada. Deve estar por aqui.',
      obrigado: 'Minha balança! Agora sim, o peso é justo. Obrigado!',
      acha: 'Atrás de umas caixas: uma balança de bronze, com um nome gravado embaixo.',
    },
    segredo: 'No muro do beco, meio apagadas: três estrelas. Alguém pintou de novo por cima, com cuidado.',
  },
  forum: {
    mapa: 'forum',
    lugar: 'forum',
    gente: [
      ['povo', 'Antes, aqui era lugar de discussão. Agora todo mundo fala baixinho.'],
      ['povo', 'Ouvi uma música proibida ontem à noite. Desafinada. Linda.'],
      ['povo', 'Eu fiz uma pergunta em voz alta ontem. Uma só. Meu coração ainda está batendo forte.'],
    ],
    pedido: {
      quem: 'povo',
      pede: 'Eu deixei cair um bilhete com uma pergunta escrita. Se um guarda achar, eu estou perdido!',
      obrigado: 'Meu bilhete! Obrigado. Quer saber a pergunta? "Por quê?" Só isso.',
      acha: 'No chão do Fórum: um bilhete dobrado. Dentro, uma palavra só: "Por quê?"',
    },
    segredo: 'Na base de uma coluna, bem pequenininho: três estrelas e as letras L e F.',
  },
  catacumbas: {
    mapa: 'catacumbas-tuneis',
    lugar: 'catacumbas',
    gente: [
      ['povo', 'Não desce sem luz. Dizem que as paredes guardam os nomes que o Censor apagou.'],
      ['copista', 'Os Copistas desenham uma pena onde é seguro.'],
      ['copista', 'Aqui embaixo a gente guarda os nomes. Cada vela é um nome.'],
    ],
    pedido: {
      quem: 'copista',
      pede: 'Uma vela apagou no fundo do túnel. Cada vela é um nome. Me traz ela?',
      obrigado: 'Obrigado. Vou acender de novo. Esse nome não vai ser esquecido.',
      acha: 'No fundo do túnel: uma vela apagada, com um nome escrito na cera.',
    },
    segredo: 'Numa parede, entre os nomes riscados: uma pena desenhada a carvão. O sinal dos Copistas.',
  },
  aqueduto: {
    mapa: 'aqueduto',
    lugar: 'aqueduto',
    gente: [
      ['povo', 'A água de Roma inteira passa por aqui. Se o aqueduto para, a cidade para.'],
      ['zelador', 'Tem uma comporta que ninguém abre há cem anos. Mas alguém passou óleo nela semana passada.'],
      ['zelador', 'Eu cuido do aqueduto há trinta anos. A água nunca mentiu para mim.'],
    ],
    pedido: {
      quem: 'zelador',
      pede: 'Perdi a minha chave de comporta. Sem ela, um bairro inteiro fica sem água.',
      obrigado: 'Minha chave! A água volta hoje mesmo. Obrigado!',
      acha: 'Presa numa pedra do canal: uma chave de comporta, enferrujada e pesada.',
    },
    segredo: 'Escrito na pedra, por baixo do musgo: "A água corre para todos." E três estrelas.',
  },
  templo: {
    mapa: 'templo-oraculo',
    lugar: 'templo-oraculo',
    gente: [
      ['povo', 'A Sibila parou de responder perguntas. Agora ela só repete o que o Censor manda.'],
      ['povo', 'A fumaça do oráculo dá visões. Eu vi o meu gato falando. Não recomendo.'],
      ['sacerdote', 'Eu acendia o incenso para a Sibila. Agora eu só espero ela voltar a perguntar.'],
    ],
    pedido: {
      quem: 'sacerdote',
      pede: 'Sumiu o sino do templo. Sem ele, ninguém sabe a hora das perguntas.',
      obrigado: 'O sino! Agora toca de novo, para quem quiser perguntar.',
      acha: 'Atrás de uma coluna: um sino pequeno de bronze. Ainda toca bonito.',
    },
    segredo: 'No chão, perto do tripé: três estrelas gravadas. Do lado, alguém escreveu "dúvida também é resposta".',
  },
  coliseu: {
    mapa: 'coliseu-tunel',
    lugar: 'coliseu-tunel',
    gente: [
      ['povo', 'Os Jogos começam logo. Dizem que o Censor quer apagar alguém na frente de todo mundo.'],
      ['povo', 'Por baixo da arena tem um barulho, como um coração de ferro. Tum. Tum.'],
      ['arauto', 'Senhoras e senhores... ah, desculpa. Ensaio. Eu ensaio sempre, até sozinho. A voz é tudo.'],
    ],
    pedido: {
      quem: 'crianca',
      pede: 'Eu perdi a minha estrela de pano! A plateia jogou na arena e eu não achei mais.',
      obrigado: 'Minha estrela! Na próxima luta eu jogo de novo. Pra você!',
      acha: 'No canto do túnel: uma estrela de pano, meio pisada. Alguém jogou da plateia.',
    },
    segredo: 'Riscado no portão do túnel: noventa e nove riscos e um espaço vazio. O espaço do Brutus.',
  },
};

/** O que já foi achado em Roma (fica no save). */
export interface RomaFeita {
  segredos?: string[];
  pedidos?: string[];
}
export const PECAS_SEGREDO = 3;
export const PECAS_PEDIDO = 5;

/** Os ladrilhos onde dá para andar, do mais perto da entrada ao mais longe (busca em largura). */
function caminhaveis(m: Mundo): [number, number][] {
  const ok = (x: number, y: number) => y >= 0 && y < m.mapa.length && x >= 0 && x < (m.mapa[0]?.length ?? 0) && livre(m, x + 0.5, y + 0.8);
  const fila: [number, number][] = [[m.inicio[0], m.inicio[1]]];
  const visto = new Set([`${m.inicio[0]},${m.inicio[1]}`]);
  for (let i = 0; i < fila.length; i++) {
    const [x, y] = fila[i]!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx;
      const ny = y + dy;
      if (visto.has(`${nx},${ny}`) || !ok(nx, ny)) continue;
      visto.add(`${nx},${ny}`);
      fila.push([nx, ny]);
    }
  }
  return fila;
}

/** O bairro para passear: o mapa dele com a gente, o segredo e o pedido (o que já foi feito some). */
export function mundoDePasseio(b: BairroId, feito: RomaFeita = {}): Mundo | null {
  const p = PASSEIOS[b];
  const m = p ? (INTERIORES[b] ?? MAPAS[p.mapa]) : undefined;
  if (!p || !m) return null;
  const nome = BAIRROS.find((x) => x.id === b)?.nome ?? '';
  const base = mundoDoExplorar({ tipo: 'explorar', id: `passeio-${b}`, lugar: p.lugar, objetivo: `Passeio livre (${nome}). Converse com o povo, ache o segredo do bairro e ajude quem pediu. Para voltar, toque em VOLTAR AO MAPA.`, pontos: [] }, m);
  const casas = caminhaveis(base);
  const em = (k: number): [number, number] => casas[Math.min(casas.length - 1, Math.max(0, k))] ?? [m.inicio[0], m.inicio[1]];
  const fezPedido = (feito.pedidos ?? []).includes(b);
  const achouSegredo = (feito.segredos ?? []).includes(b);
  const n = casas.length;
  // A gente fica em lugar aberto (os quatro vizinhos livres), para nunca tampar um corredor, e anda
  // só até o ladrilho do lado (pessoa anda em linha reta). Perto da entrada; o dono do pedido, um pouco depois.
  const chave = new Set(casas.map(([x, y]) => `${x},${y}`));
  const abertos = casas.slice(2).filter(([x, y]) => ([[1, 0], [-1, 0], [0, 1], [0, -1]] as const).every(([dx, dy]) => chave.has(`${x + dx},${y + dy}`)));
  const lugar = (k: number): [number, number][] => {
    const a = abertos[Math.min(k, abertos.length - 1)] ?? em(3 + k);
    const lado: [number, number] = chave.has(`${a[0] + 1},${a[1]}`) ? [a[0] + 1, a[1]] : a;
    return [a, lado];
  };
  const pessoas = p.gente.map(([quem, texto], k) => ({ id: `gente-${k}`, quem, rota: lugar(1 + k * 4), falas: [{ quem, texto }] }));
  pessoas.push({ id: 'pedido', quem: p.pedido.quem, rota: [lugar(15)[0]!], falas: [{ quem: p.pedido.quem, texto: fezPedido ? p.pedido.obrigado : p.pedido.pede }] });
  // o que se acha: a coisa perdida bem longe da entrada, o segredo no meio do caminho
  const coisas = [...base.coisas];
  if (!fezPedido) {
    const [x, y] = em(n - 2);
    coisas.push({ id: 'perdido', x, y, falas: [{ quem: 'narrador', texto: `${p.pedido.acha} (+${PECAS_PEDIDO} peças)` }], segredo: `roma-pedido-${b}` });
  }
  if (!achouSegredo) {
    const [x, y] = em(Math.floor(n * 0.6));
    coisas.push({ id: 'segredo', x, y, falas: [{ quem: 'narrador', texto: `SEGREDO DE ROMA: ${p.segredo} (+${PECAS_SEGREDO} peças)` }], segredo: `roma-segredo-${b}` });
  }
  return { ...base, pessoas: [...base.pessoas, ...pessoas], coisas };
}

/** Os bairros onde já dá para passear (depois do Encontro, e só os já visitados). */
export function bairrosParaPassear(e: EstadoRoma): BairroId[] {
  if (!e.juntos) return [];
  return BAIRROS.map((b) => b.id).filter((id) => e.visitados.includes(id) && !!PASSEIOS[id] && !!MAPAS[PASSEIOS[id]!.mapa]);
}

/** Quantos segredos e pedidos existem (para a conta do mapa). */
export const TOTAL_ROMA = Object.keys(PASSEIOS).length;
