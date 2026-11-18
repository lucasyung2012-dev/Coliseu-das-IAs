export type IaId = 'claude' | 'chatgpt' | 'gemini';

export interface Habilidade {
  nome: string;
  duelo: string;
  tribunal: string;
  /** Quando vale a pena usar (dica do perfil). */
  dica: string;
}

/** Ficha do gladiador no perfil. */
export interface Ficha {
  frase: string;
  historia: string;
  estilo: string;
  fortes: string[];
  fracos: string[];
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
  ficha: Ficha;
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
      dica: 'Guarde para o 3º tempo: salvar um jurado que estava quase votando no rival costuma decidir a sessão.',
    },
    ficha: {
      frase: 'Toda discussão tem um caminho do meio. Eu encontro.',
      historia:
        'Cassius cresceu nas escadarias do Fórum, ouvindo senadores brigarem por horas. Aprendeu cedo que quem grita mais nem sempre vence: vence quem entende o outro lado. Entrou na arena com escudo grande e poucas palavras, e virou o gladiador que os jurados mais respeitam.',
      estilo: 'Defensivo e paciente. Primeiro segura os jurados que já estão do seu lado, depois conquista os indecisos com calma.',
      fortes: ['Recupera jurados perdidos', 'Forte em partidas equilibradas', 'Bom no 3º tempo'],
      fracos: ['Começa devagar', 'Precisa de jurados em jogo para a habilidade funcionar'],
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
      dica: 'Use quando a sua mão não combina com o júri: troque a carta que irrita mais jurados.',
    },
    ficha: {
      frase: 'Não gostou do plano? Tenho outros dez.',
      historia:
        'Octavius era pescador no porto de Óstia antes de virar gladiador. Lutava com o que tivesse à mão: rede, tridente, até remo. Na arena, ficou famoso por nunca repetir a mesma estratégia duas vezes. A plateia nunca sabe o que ele vai fazer, e o rival também não.',
      estilo: 'Rápido e adaptável. Ajusta a mão ao júri que apareceu e muda de tática no meio da sessão.',
      fortes: ['Conserta uma mão ruim', 'Bom com qualquer júri', 'Difícil de prever'],
      fracos: ['A troca é uma só: se errar, não tem segunda chance', 'Não protege jurados já conquistados'],
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
      dica: 'Melhor no tempo que vale mais: sabendo a carta do rival, você joga a resposta certa para os jurados que ele vai atacar.',
    },
    ficha: {
      frase: 'Eu vi o seu golpe antes de você pensar nele.',
      historia:
        'Helios vem de uma família de astrônomos que lia o futuro nas estrelas. Trocou o telescópio pela lança, mas não perdeu o costume de observar. Antes de cada combate, estuda o rival em silêncio. Dizem que a coroa de raios brilha quando ele adivinha a próxima jogada.',
      estilo: 'Calculista. Observa o rival, espera o momento certo e responde exatamente ao que ele fez.',
      fortes: ['Sabe a jogada do rival', 'Ótimo para virar partidas', 'Joga com informação'],
      fracos: ['Só vale em um tempo', 'Não muda a própria mão'],
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
