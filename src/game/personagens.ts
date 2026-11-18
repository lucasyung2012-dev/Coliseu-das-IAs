export type IaId = 'claude' | 'chatgpt' | 'gemini';

export interface Habilidade {
  nome: string;
  duelo: string;
  tribunal: string;
}

export interface Personagem {
  id: IaId;
  ia: string;
  gladiador: string;
  titulo: string;
  lema: string;
  emblema: string;
  /** Cor da IA em RGB separado por espaço, no mesmo formato dos tokens CSS. */
  cor: string;
  habilidade: Habilidade;
}

// Um nome por IA nos dois modos (decisão D11). Os nomes vêm do app do Lovable.
export const PERSONAGENS: Record<IaId, Personagem> = {
  claude: {
    id: 'claude',
    ia: 'Claude',
    gladiador: 'Cassius',
    titulo: 'o Estrategista',
    lema: 'Nuance e diplomacia',
    emblema: '❋',
    cor: '240 140 80',
    habilidade: {
      nome: 'Diplomacia',
      duelo: 'Transforma um empate em vitória.',
      tribunal: 'Acalma um jurado que está contra você e o traz de volta ao meio.',
    },
  },
  chatgpt: {
    id: 'chatgpt',
    ia: 'ChatGPT',
    gladiador: 'Octavius',
    titulo: 'o Versátil',
    lema: 'Versatilidade prática',
    emblema: '✦',
    cor: '64 220 170',
    habilidade: {
      nome: 'Improviso',
      duelo: 'Troca uma carta da mão por uma nova.',
      tribunal: 'Troca uma carta da mão por uma nova.',
    },
  },
  gemini: {
    id: 'gemini',
    ia: 'Gemini',
    gladiador: 'Helios',
    titulo: 'o Observador',
    lema: 'Contexto e conexões',
    emblema: '◈',
    cor: '110 150 255',
    habilidade: {
      nome: 'Visão',
      duelo: 'Espia uma das cartas do rival antes de escolher.',
      tribunal: 'Espia a carta que o rival vai jogar neste tempo.',
    },
  },
};

export const IAS: IaId[] = ['claude', 'chatgpt', 'gemini'];

/** Sorteia o rival entre as outras duas IAs (o matchmaking do documento, seção 4.2). */
export function sortearRival(ia: IaId, aleatorio: () => number = Math.random): IaId {
  const outras = IAS.filter((id) => id !== ia);
  return outras[Math.floor(aleatorio() * outras.length)] ?? outras[0]!;
}

/** Nome completo usado nas telas: "Cassius, o Estrategista". */
export function nomeGladiador(id: IaId): string {
  const p = PERSONAGENS[id];
  return `${p.gladiador}, ${p.titulo}`;
}
