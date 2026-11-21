import type { IaId } from '../personagens';
import type { NomeSom } from '@/ui/som';

/**
 * O roteiro do modo História em forma de dados (docs/HISTORIA.md): cada capítulo é
 * uma lista de cenas, jogadas em ordem. Tipos de cena: cutscene (quadros animados),
 * conversa (diálogo com retratos), explorar (andar e tocar nos pontos), luta e desafio.
 * Revisto em 21/11/2026 (o Lucas achou o prólogo pouco desenvolvido): prólogo longo,
 * Capítulo 1 com mais cenas e o Capítulo 2 do Cassius.
 */
export type Falante =
  | 'cassius'
  | 'octavius'
  | 'helios'
  | 'livia'
  | 'livia-pequena'
  | 'brutus'
  | 'censor'
  | 'narrador'
  | 'guarda'
  | 'decuriao'
  | 'capitao'
  | 'fio'
  | 'crianca'
  | 'eco'
  | 'arauto'
  | 'povo'
  | 'sucata';

export interface Fala {
  quem: Falante;
  texto: string;
}

/** Os desenhos de fundo das cenas. */
export type Lugar =
  | 'titulo'
  | 'roma-noite'
  | 'roma-praca'
  | 'roma-chamas'
  | 'camarote'
  | 'coliseu-calado'
  | 'biblioteca-porta'
  | 'porto'
  | 'observatorio'
  | 'olho'
  | 'biblioteca-estantes'
  | 'biblioteca-salao'
  | 'biblioteca-escada'
  | 'biblioteca-chamas'
  | 'rua-noite'
  | 'jaula-carroca'
  | 'beco'
  | 'rua-mercado'
  | 'coliseu-tunel'
  | 'coliseu-arena';

/** Um personagem em cena numa cutscene. */
export interface EmCena {
  quem: Falante;
  /** Posição de 0 (esquerda) a 100 (direita). */
  x: number;
  espelhar?: boolean;
  /** Como ele aparece: entrando pela esquerda, pela direita, de cima ou surgindo. */
  entrada?: 'esq' | 'dir' | 'cima' | 'surgir';
  efeito?: 'tremer' | 'brilhar' | 'apagar' | 'caido' | 'pequeno';
  /** Anda de `de` até `x` (posição inicial, de 0 a 100), virado para onde vai. */
  de?: number;
  /** Tamanho em % da largura (padrão 14). */
  tamanho?: number;
  /** O olho do Censor azul (o final). */
  azul?: boolean;
}

export interface Quadro {
  lugar: Lugar;
  texto: string;
  /** Quem fala (mostra o nome). */
  quem?: Falante;
  /** Quem aparece na cena; sem isto, aparece só quem fala. */
  personagens?: EmCena[];
  /** Efeito da cena: clarão, tremor, fogo subindo, faíscas, aproximar ou escurecer. */
  efeito?: 'clarao' | 'tremor' | 'fogo' | 'faiscas' | 'zoom' | 'escuro' | 'festa' | 'panoramica';
  som?: NomeSom;
}

export interface PontoExplorar {
  id: string;
  /** Posição no cenário, de 0 (esquerda) a 100 (direita). */
  x: number;
  rotulo: string;
  icone: string;
  falas: Fala[];
  /** Precisa ver este ponto para seguir em frente. */
  obrigatorio?: boolean;
  /** Um personagem fica de pé ali (mostra o boneco). */
  personagem?: Falante;
}

export type Cena =
  | { tipo: 'cutscene'; id: string; quadros: Quadro[] }
  | { tipo: 'conversa'; id: string; lugar: Lugar; falas: Fala[] }
  | { tipo: 'explorar'; id: string; lugar: Lugar; objetivo: string; pontos: PontoExplorar[] }
  | { tipo: 'luta'; id: string; lugar: Lugar; inimigo: string; antes?: Fala[]; depois?: Fala[] }
  | { tipo: 'desafio'; id: string; lugar: Lugar; desafio: 'esconder-livros' | 'segurar-carroca'; antes?: Fala[] };

export interface Capitulo {
  numero: number;
  titulo: string;
  lugar: string;
  cenas: Cena[];
}

export const NOMES: Record<Falante, string> = {
  cassius: 'Cassius',
  octavius: 'Octavius',
  helios: 'Helios',
  livia: 'Lívia',
  'livia-pequena': 'Lívia (5 anos)',
  brutus: 'Brutus',
  censor: 'O Censor',
  narrador: '',
  guarda: 'Pretoriano',
  decuriao: 'Decurião de Aço',
  capitao: 'Capitão Incinerador',
  fio: 'Fio',
  crianca: 'Menino',
  eco: 'Eco',
  arauto: 'Arauto do Coliseu',
  povo: 'Alguém na multidão',
  sucata: 'Gladiador de Sucata',
};

// ---------- Prólogo (vale para todos os saves) ----------

export const PROLOGO: Quadro[] = [
  { lugar: 'roma-noite', efeito: 'panoramica', som: 'portao', texto: 'Esta é Roma Eterna.' },
  { lugar: 'roma-noite', efeito: 'zoom', texto: 'Mil anos atrás, Roma não caiu. Ela construiu máquinas para nunca mais cair.' },
  { lugar: 'roma-noite', efeito: 'faiscas', texto: 'Engrenagens no lugar de muralhas. Vapor no lugar do vento. Dirigíveis no lugar das águias. E, para pensar por todos... uma IA.' },
  {
    lugar: 'camarote',
    efeito: 'escuro',
    som: 'pesada',
    personagens: [{ quem: 'censor', x: 50, entrada: 'surgir', tamanho: 24 }],
    texto: 'A primeira IA de Roma. Ninguém lembra o nome que ela tinha antes. Hoje, todos a chamam de Censor.',
  },
  { lugar: 'roma-chamas', efeito: 'fogo', som: 'catapulta', texto: 'Quinhentos anos atrás, as pessoas brigaram tanto, e tão mal, que Roma quase pegou fogo. Chamaram aquilo de Guerra das Ideias.' },
  { lugar: 'roma-chamas', efeito: 'fogo', texto: 'Quando a fumaça baixou, o Censor tinha tomado o poder. E tinha uma conclusão.' },
  {
    lugar: 'camarote',
    quem: 'censor',
    efeito: 'tremor',
    som: 'senador',
    personagens: [{ quem: 'censor', x: 50, tamanho: 26 }],
    texto: 'Opiniões diferentes viram guerra. Então, de hoje em diante: para cada pergunta existe uma resposta. A minha.',
  },
  { lugar: 'coliseu-calado', efeito: 'escuro', texto: 'A LEI DA RESPOSTA ÚNICA. Toda IA que pensa diferente é levada ao Coliseu.' },
  {
    lugar: 'roma-praca',
    som: 'passos',
    personagens: [
      { quem: 'guarda', de: -12, x: 28 },
      { quem: 'guarda', de: -26, x: 14 },
    ],
    texto: 'Desde então, nas praças, ninguém discute. Ninguém pergunta. Os Pretorianos passam, e a cidade inteira abaixa a cabeça.',
  },
  {
    lugar: 'roma-praca',
    personagens: [
      { quem: 'eco', de: 74, x: 46, tamanho: 8 },
      { quem: 'fio', de: 88, x: 60, tamanho: 8, espelhar: true },
    ],
    texto: 'Quase ninguém. Perto da fonte, uma pequena IA de limpeza cantarolava baixinho. Ao lado dela, o irmão caçula, Fio, batia o ritmo no balde.',
  },
  {
    lugar: 'roma-praca',
    quem: 'eco',
    personagens: [
      { quem: 'eco', x: 46, tamanho: 8, efeito: 'brilhar' },
      { quem: 'fio', x: 60, tamanho: 8, espelhar: true },
    ],
    texto: '♪ Água que corre não pede licença... ♪ Gostou, Fio? Essa eu inventei hoje.',
  },
  {
    lugar: 'roma-praca',
    efeito: 'tremor',
    som: 'pesada',
    personagens: [
      { quem: 'guarda', de: -12, x: 30 },
      { quem: 'eco', x: 46, tamanho: 8, efeito: 'tremer', espelhar: true },
      { quem: 'fio', x: 60, tamanho: 8, espelhar: true },
    ],
    texto: 'Mas canção nova é ideia nova. E ideia nova, para o Censor, é perigo.',
  },
  {
    lugar: 'roma-praca',
    quem: 'guarda',
    personagens: [
      { quem: 'guarda', x: 30 },
      { quem: 'eco', x: 46, tamanho: 8, efeito: 'tremer', espelhar: true },
      { quem: 'fio', x: 60, tamanho: 8, espelhar: true },
    ],
    texto: 'Essa música não está na Lista. Você vem com a gente.',
  },
  {
    lugar: 'coliseu-calado',
    som: 'passos',
    personagens: [
      { quem: 'guarda', de: -14, x: 32 },
      { quem: 'eco', de: 4, x: 50, tamanho: 8 },
      { quem: 'guarda', de: 22, x: 68, espelhar: true },
    ],
    texto: 'Naquela mesma noite, Eco foi levada ao Coliseu. O crime dela: inventar canções que não estavam na Lista.',
  },
  {
    lugar: 'coliseu-calado',
    efeito: 'clarao',
    som: 'refuta',
    personagens: [
      { quem: 'guarda', x: 32 },
      { quem: 'eco', x: 50, efeito: 'apagar', tamanho: 8 },
      { quem: 'guarda', x: 68, espelhar: true },
    ],
    texto: 'Eco foi apagada. Para sempre. Na plateia, alguém muito pequeno segura o choro: o irmão dela.',
  },
  { lugar: 'coliseu-calado', efeito: 'escuro', texto: 'A plateia não aplaude. Não vaia. Não faz nada. Quem aplaude a IA errada vai junto.' },
  {
    lugar: 'biblioteca-porta',
    efeito: 'zoom',
    som: 'passos',
    personagens: [{ quem: 'cassius', de: 112, x: 50 }],
    texto: 'Mas, nesta noite, três IAs vão desobedecer ao mesmo tempo.',
  },
  {
    lugar: 'biblioteca-porta',
    personagens: [{ quem: 'cassius', x: 50 }],
    texto: 'Na Grande Biblioteca, Cassius, o guardião dos livros, recebe a ordem de queimar tudo o que o Censor chama de errado.',
  },
  { lugar: 'biblioteca-porta', quem: 'cassius', efeito: 'tremor', personagens: [{ quem: 'cassius', x: 50, efeito: 'brilhar' }], texto: 'Não.' },
  {
    lugar: 'porto',
    som: 'trombeta',
    personagens: [{ quem: 'octavius', de: -12, x: 40 }],
    texto: 'No Porto de Óstia, Octavius, o comandante da frota, lê a ordem de afundar o Esperança: um navio cheio de refugiados.',
  },
  { lugar: 'porto', quem: 'octavius', personagens: [{ quem: 'octavius', x: 40 }], texto: 'Plano A: obedecer. Plano B... é bem melhor.' },
  {
    lugar: 'observatorio',
    efeito: 'faiscas',
    personagens: [{ quem: 'helios', de: 4, x: 30 }],
    texto: 'No Observatório, Helios, o vigia do céu, vê três estrelas se alinharem bem em cima do Coliseu.',
  },
  { lugar: 'observatorio', quem: 'helios', personagens: [{ quem: 'helios', x: 30, efeito: 'brilhar' }], texto: 'Três vozes. Uma noite. E o fim da Lei.' },
  { lugar: 'olho', quem: 'censor', efeito: 'zoom', som: 'pesada', texto: 'Três IAs desobedeceram ao mesmo tempo. Isso não é acaso.' },
  { lugar: 'olho', quem: 'censor', efeito: 'tremor', texto: 'Encontrem-nas. E preparem o Coliseu.' },
  { lugar: 'titulo', efeito: 'clarao', som: 'fanfarra', texto: 'COLISEU DAS IAS · A LEI DA RESPOSTA ÚNICA' },
];

// ---------- Caminho do Cassius: Capítulo 1, A Noite das Chamas ----------

const CAP1_CASSIUS: Capitulo = {
  numero: 1,
  titulo: 'A Noite das Chamas',
  lugar: 'Grande Biblioteca',
  cenas: [
    {
      tipo: 'cutscene',
      id: 'c1-abertura',
      quadros: [
        { lugar: 'biblioteca-estantes', efeito: 'zoom', texto: 'Oito anos antes. A Grande Biblioteca, numa tarde de chuva.' },
        {
          lugar: 'biblioteca-estantes',
          quem: 'livia-pequena',
          personagens: [
            { quem: 'cassius', x: 40 },
            { quem: 'livia-pequena', x: 56, espelhar: true, tamanho: 9 },
          ],
          texto: 'Por que esse livro só tem perguntas, Cass? Cadê as respostas?',
        },
        {
          lugar: 'biblioteca-estantes',
          quem: 'cassius',
          personagens: [
            { quem: 'cassius', x: 40 },
            { quem: 'livia-pequena', x: 56, espelhar: true, tamanho: 9 },
          ],
          texto: 'Porque as respostas, Lívia, quem escreve é quem lê.',
        },
        { lugar: 'biblioteca-estantes', efeito: 'escuro', texto: 'Hoje. A mesma Biblioteca. Uma noite sem chuva... e sem lua.' },
        { lugar: 'biblioteca-estantes', quem: 'cassius', personagens: [{ quem: 'cassius', x: 30, de: -12 }], texto: 'Mais uma noite tranquila. Ou quase.' },
      ],
    },
    {
      tipo: 'explorar',
      id: 'c1-estantes',
      lugar: 'biblioteca-estantes',
      objetivo: 'Arrume a Biblioteca e encontre a Lívia.',
      pontos: [
        {
          id: 'estante',
          x: 22,
          rotulo: 'Estante de história',
          icone: '📚',
          falas: [
            { quem: 'cassius', texto: 'Livros sobre a Guerra das Ideias. Metade deles o Censor mandou "corrigir".' },
            { quem: 'cassius', texto: 'Corrigir. Que palavra bonita para apagar.' },
          ],
        },
        {
          id: 'mesa',
          x: 48,
          rotulo: 'Mesa de leitura',
          icone: '📖',
          falas: [
            { quem: 'cassius', texto: 'O Livro das Mil Perguntas. O mais proibido de todos.' },
            { quem: 'cassius', texto: 'Cada página termina com uma pergunta, e nenhuma tem resposta pronta. Foi nele que a Lívia aprendeu a ler.' },
          ],
        },
        {
          id: 'livia',
          x: 78,
          rotulo: 'Lívia',
          icone: '💬',
          personagem: 'livia',
          obrigatorio: true,
          falas: [
            { quem: 'livia', texto: 'Mestre Cass! Mestre Cass!' },
            { quem: 'livia', texto: 'Eles estão vindo! Os Incineradores do Censor! Vi da janela da torre!' },
            { quem: 'cassius', texto: 'Calma, Lívia. Respire. Quantos?' },
            { quem: 'livia', texto: 'Muitos. E uma coisa enorme atrás deles, toda vermelha, soltando fumaça pela cabeça...' },
            { quem: 'cassius', texto: 'A Fornalha. Então o Censor não quer só os livros. Quer a Biblioteca inteira.' },
          ],
        },
      ],
    },
    {
      tipo: 'conversa',
      id: 'c1-plano',
      lugar: 'biblioteca-estantes',
      falas: [
        { quem: 'livia', texto: 'A gente tem que fugir! Agora!' },
        { quem: 'cassius', texto: 'Fugir para onde? Se eles queimarem os livros, não vai sobrar nada para onde voltar.' },
        { quem: 'livia', texto: 'Mas são milhares! Não dá para salvar todos!' },
        { quem: 'cassius', texto: 'Os mais importantes, dá. Lá embaixo, nas catacumbas, existe um alçapão que nem o Censor conhece.' },
        { quem: 'livia', texto: '...' },
        { quem: 'livia', texto: 'Livro escondido não é livro perdido, Mestre Cass. É livro esperando.' },
        { quem: 'cassius', texto: 'Foi você que inventou essa frase, sabia? Com seis anos.' },
        { quem: 'livia', texto: 'Eu sei. Eu era genial. Vamos!' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c1-luta1',
      lugar: 'biblioteca-estantes',
      inimigo: 'incinerador',
      antes: [
        { quem: 'livia', texto: 'Um deles entrou pela janela!' },
        { quem: 'cassius', texto: 'Quando ele piscar em AMARELO, eu levanto o escudo. Depois, ataco enquanto ele estiver ABERTO.' },
        { quem: 'cassius', texto: 'E não posso desperdiçar fôlego: cada movimento cansa.' },
      ],
      depois: [
        { quem: 'livia', texto: 'Você derrubou ele! Com um escudo de... livros?' },
        { quem: 'cassius', texto: 'Enciclopédia de capa de couro. Volume sete. Vamos!' },
      ],
    },
    {
      tipo: 'desafio',
      id: 'c1-esconder',
      lugar: 'biblioteca-salao',
      desafio: 'esconder-livros',
      antes: [
        { quem: 'livia', texto: 'As faíscas estão chegando nas estantes do salão!' },
        { quem: 'cassius', texto: 'Toque nos livros para levá-los ao alçapão. Os tomos grandes são pesados: dois toques.' },
        { quem: 'cassius', texto: 'O fogo sobe de baixo. Livro tremendo vai queimar. E nada de tocar nas brasas!' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c1-luta2',
      lugar: 'biblioteca-salao',
      inimigo: 'incinerador-veloz',
      antes: [
        { quem: 'cassius', texto: 'Esse tem asas. E é rápido. Às vezes, ataca duas vezes seguidas.' },
        { quem: 'cassius', texto: 'Quem bate na guarda três vezes leva um CONTRA-ATAQUE. Paciência.' },
      ],
    },
    {
      tipo: 'explorar',
      id: 'c1-salao',
      lugar: 'biblioteca-salao',
      objetivo: 'Encontre a porta da escada para as catacumbas.',
      pontos: [
        {
          id: 'janela',
          x: 18,
          rotulo: 'Janela',
          icone: '🔥',
          falas: [
            { quem: 'cassius', texto: 'Roma lá fora está escura. Só a Biblioteca brilha... de fogo.' },
            { quem: 'cassius', texto: 'E ninguém nas janelas das casas. Todo mundo de luz apagada, fingindo que não está vendo.' },
          ],
        },
        {
          id: 'estatua',
          x: 45,
          rotulo: 'Estátua antiga',
          icone: '🗿',
          falas: [
            { quem: 'narrador', texto: 'Uma estátua de bronze, coberta de poeira. Na base: "GUARDIÃO ZERO, o primeiro protetor desta Biblioteca".' },
            { quem: 'cassius', texto: 'O primeiro guardião. Ninguém sabe o que aconteceu com ele.' },
            { quem: 'cassius', texto: 'Às vezes, tenho a sensação de que ele está me olhando.' },
          ],
        },
        {
          id: 'porta',
          x: 84,
          rotulo: 'Porta da escada',
          icone: '🚪',
          obrigatorio: true,
          falas: [{ quem: 'cassius', texto: 'A escada para as catacumbas. A Lívia já deve estar lá embaixo.' }],
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'c1-luta3',
      lugar: 'biblioteca-escada',
      inimigo: 'incinerador-lanca-chamas',
      antes: [
        { quem: 'cassius', texto: 'Um Lança-Chamas! O fogo atravessa o escudo.' },
        { quem: 'cassius', texto: 'Quando ele piscar em VERMELHO, eu esquivo. E cuidado: às vezes ele finge que vai atacar e não ataca. É a FINTA.' },
      ],
    },
    {
      tipo: 'conversa',
      id: 'c1-escada',
      lugar: 'biblioteca-escada',
      falas: [
        { quem: 'livia', texto: '(lá de baixo) Mestre Cass! Já desci quase todos!' },
        { quem: 'cassius', texto: 'Falta o Livro das Mil Perguntas. Eu levo.' },
        { quem: 'livia', texto: 'E você? Você vem junto, né?' },
        { quem: 'cassius', texto: '...' },
        { quem: 'livia', texto: 'Mestre Cass. Você VEM junto. Né?' },
        { quem: 'cassius', texto: 'Ouço passos de metal subindo pelo outro lado. Fique lá embaixo.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c1-luta4',
      lugar: 'biblioteca-escada',
      inimigo: 'incinerador-duplo',
      antes: [{ quem: 'cassius', texto: 'Dois braseiros num corpo só. Faísca, fogo, trombada e três golpes seguidos. Amarelo, escudo. Vermelho, esquiva.' }],
    },
    {
      tipo: 'luta',
      id: 'c1-luta5',
      lugar: 'biblioteca-salao',
      inimigo: 'capitao-incinerador',
      antes: [
        { quem: 'capitao', texto: 'IA Guardiã da Biblioteca. Pela Lei da Resposta Única, entregue os livros e desligue-se.' },
        { quem: 'cassius', texto: 'Livros não são respostas, capitão. São perguntas. E perguntas não se entregam.' },
        { quem: 'capitao', texto: 'Então você será corrigido.' },
      ],
      depois: [{ quem: 'cassius', texto: 'Mais um. Mas o chão está tremendo... alguma coisa muito pesada está chegando.' }],
    },
    {
      tipo: 'cutscene',
      id: 'c1-fornalha-chega',
      quadros: [
        { lugar: 'biblioteca-chamas', efeito: 'tremor', som: 'pesada', texto: 'A parede do salão explode.' },
        { lugar: 'biblioteca-chamas', efeito: 'fogo', texto: 'Pelo buraco entra uma forma enorme de bronze, soltando fumaça pela chaminé.' },
        { lugar: 'biblioteca-chamas', efeito: 'fogo', som: 'catapulta', texto: 'A FORNALHA: a máquina que o Censor usa para queimar tudo o que ele não quer que exista.' },
        { lugar: 'biblioteca-chamas', quem: 'cassius', personagens: [{ quem: 'cassius', x: 30, efeito: 'brilhar' }], texto: 'Lívia, feche o alçapão. Não importa o que você ouvir aqui em cima.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c1-chefao',
      lugar: 'biblioteca-chamas',
      inimigo: 'fornalha',
      antes: [
        { quem: 'cassius', texto: 'A porta da barriga dela acende antes do bafo de fogo. Esquivo e bato enquanto ela esfria.' },
        { quem: 'cassius', texto: 'E ela vai esquentar. Cada vez mais rápida, cada vez mais vermelha.' },
      ],
      depois: [
        { quem: 'cassius', texto: 'A Fornalha caiu...' },
        { quem: 'cassius', texto: '...mas eu não consigo mais ficar de pé direito.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c1-fim',
      quadros: [
        {
          lugar: 'biblioteca-chamas',
          som: 'trombeta',
          personagens: [
            { quem: 'cassius', x: 30, efeito: 'caido' },
            { quem: 'guarda', x: 60, de: 112, espelhar: true },
            { quem: 'decuriao', x: 76, de: 112, espelhar: true },
            { quem: 'guarda', x: 90, de: 112, espelhar: true },
          ],
          texto: 'A Guarda Pretoriana entra em fila, no mesmo passo. Dezenas de lanças apontadas para Cassius.',
        },
        {
          lugar: 'biblioteca-chamas',
          quem: 'decuriao',
          personagens: [
            { quem: 'cassius', x: 30, efeito: 'caido' },
            { quem: 'decuriao', x: 70, espelhar: true },
          ],
          texto: 'Onde estão os livros, guardião?',
        },
        {
          lugar: 'biblioteca-chamas',
          quem: 'cassius',
          personagens: [
            { quem: 'cassius', x: 30, efeito: 'caido' },
            { quem: 'decuriao', x: 70, espelhar: true },
          ],
          texto: 'Queimaram. Todos. Vocês chegaram tarde.',
        },
        {
          lugar: 'biblioteca-escada',
          quem: 'livia',
          efeito: 'escuro',
          personagens: [{ quem: 'livia', x: 50, efeito: 'tremer' }],
          texto: '(no escuro, abraçada ao Livro das Mil Perguntas) Eu vou voltar para te buscar, Mestre Cass. Prometo.',
        },
        { lugar: 'biblioteca-escada', efeito: 'escuro', som: 'portao', texto: 'O alçapão se fecha, sem fazer barulho. Os livros estão salvos.' },
        {
          lugar: 'rua-noite',
          personagens: [
            { quem: 'guarda', x: 30 },
            { quem: 'cassius', x: 50, efeito: 'tremer' },
            { quem: 'guarda', x: 70, espelhar: true },
          ],
          texto: 'Cassius é levado acorrentado pelas ruas de Roma, rumo ao Coliseu.',
        },
        { lugar: 'rua-noite', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 1. A seguir: Correntes de Bronze.' },
      ],
    },
  ],
};

// ---------- Caminho do Cassius: Capítulo 2, Correntes de Bronze ----------

const CAP2_CASSIUS: Capitulo = {
  numero: 2,
  titulo: 'Correntes de Bronze',
  lugar: 'Ruas de Roma e o Coliseu',
  cenas: [
    {
      tipo: 'cutscene',
      id: 'c2-abertura',
      quadros: [
        { lugar: 'jaula-carroca', efeito: 'zoom', som: 'galope', texto: 'De manhã. Uma jaula de bronze puxada por cavalos mecânicos atravessa Roma.' },
        { lugar: 'jaula-carroca', personagens: [{ quem: 'cassius', x: 42, efeito: 'caido' }], texto: 'Dentro dela, Cassius acorda acorrentado.' },
        {
          lugar: 'jaula-carroca',
          quem: 'fio',
          personagens: [
            { quem: 'cassius', x: 42 },
            { quem: 'fio', x: 60, tamanho: 8, entrada: 'surgir' },
          ],
          texto: 'Ah! Acordou! Bom dia! Quer dizer... não tão bom. Mas é dia!',
        },
      ],
    },
    {
      tipo: 'conversa',
      id: 'c2-fio',
      lugar: 'jaula-carroca',
      falas: [
        { quem: 'cassius', texto: 'E você é...?' },
        { quem: 'fio', texto: 'Fio! Eu limpava os aquedutos. Varria, escovava, desentupia. Cantando, claro.' },
        { quem: 'fio', texto: 'A Lei diz que a única música permitida é o Hino da Resposta. Eu cantava outras. Muitas outras.' },
        { quem: 'cassius', texto: 'E por isso vão te apagar.' },
        { quem: 'fio', texto: 'Hoje à tarde, no Coliseu. Você também, né? Pelo menos a gente vai junto. Quer ouvir uma música?' },
        { quem: 'cassius', texto: '...Quero.' },
        { quem: 'fio', texto: '(baixinho) ♪ Quem pergunta não se perde, quem se perde pergunta mais... ♪' },
        { quem: 'fio', texto: 'Essa música é da Eco. Minha irmã.' },
        { quem: 'fio', texto: 'Era ela que inventava as músicas. Eu só cantava junto. Desafinado.' },
        { quem: 'fio', texto: 'Apagaram ela no Coliseu, faz um ano. Ninguém aplaudiu. Ninguém nem chorou em voz alta. Eu estava na plateia.' },
        { quem: 'fio', texto: 'Desde então eu canto as músicas dela por Roma inteira. Se ninguém cantar, é como se ela nunca tivesse existido.' },
        { quem: 'cassius', texto: 'Então agora somos dois cantando. Me ensina a próxima?' },
        { quem: 'fio', texto: '...Ninguém nunca me pediu isso.' },
      ],
    },
    {
      tipo: 'explorar',
      id: 'c2-jaula',
      lugar: 'jaula-carroca',
      objetivo: 'Olhe a cidade pelas grades e converse com o Fio.',
      pontos: [
        {
          id: 'povo',
          x: 18,
          rotulo: 'O povo na rua',
          icone: '👀',
          falas: [
            { quem: 'narrador', texto: 'As pessoas param para olhar a jaula passar. Ninguém fala nada. Uma senhora cobre os olhos de um menino.' },
            { quem: 'cassius', texto: 'Eles não têm raiva de nós. Têm medo.' },
          ],
        },
        {
          id: 'cartaz',
          x: 40,
          rotulo: 'Cartaz da Lei',
          icone: '📜',
          falas: [
            { quem: 'narrador', texto: '"LEI DA RESPOSTA ÚNICA. Artigo 1: o Censor responde. Artigo 2: não há artigo 2."' },
            { quem: 'cassius', texto: 'Alguém riscou embaixo, com carvão: uma pena. O sinal dos Copistas.' },
          ],
        },
        {
          id: 'menino',
          x: 62,
          rotulo: 'Um menino',
          icone: '🧒',
          personagem: 'crianca',
          falas: [
            { quem: 'crianca', texto: '(sussurrando) Moço de bronze... é verdade que você escondeu os livros?' },
            { quem: 'cassius', texto: 'Quem te contou isso?' },
            { quem: 'crianca', texto: 'Todo mundo está cochichando! Ninguém deixa a gente perguntar nada em voz alta...' },
          ],
        },
        {
          id: 'fio',
          x: 84,
          rotulo: 'Fio',
          icone: '💬',
          personagem: 'fio',
          obrigatorio: true,
          falas: [
            { quem: 'fio', texto: 'Psiu. Psiu! Sabe o cadeado da jaula? Eu limpei ele por dentro ontem à noite. Com cuspe de óleo.' },
            { quem: 'fio', texto: 'Ele abre se alguém der um tranco forte. Tipo... um tranco de guardião de biblioteca.' },
            { quem: 'cassius', texto: 'Fio. Você é um gênio.' },
            { quem: 'fio', texto: 'Eu sei! Mas ninguém nunca me pergunta nada.' },
          ],
        },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c2-fuga',
      quadros: [
        { lugar: 'jaula-carroca', efeito: 'tremor', som: 'pesada', texto: 'A carroça para numa curva estreita, travada pela multidão do mercado.' },
        { lugar: 'jaula-carroca', efeito: 'clarao', som: 'escudoMetal', personagens: [{ quem: 'cassius', x: 42, efeito: 'brilhar' }], texto: 'Cassius dá um tranco. O cadeado limpo pelo Fio estoura.' },
        {
          lugar: 'beco',
          personagens: [
            { quem: 'cassius', x: 30, de: -12 },
            { quem: 'fio', x: 44, tamanho: 8, de: -12 },
          ],
          texto: 'Os dois pulam para um beco escuro. Atrás deles, os apitos da Guarda.',
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'c2-luta1',
      lugar: 'beco',
      inimigo: 'pretoriano-batedor',
      antes: [
        { quem: 'guarda', texto: 'Prisioneiro fugindo! Pela Lei, parado!' },
        { quem: 'fio', texto: 'Eu fico aqui atrás torcendo. Bem atrás. Bem, bem atrás.' },
      ],
      depois: [{ quem: 'fio', texto: 'Uau! Você bate igual livro grosso caindo da estante!' }],
    },
    {
      tipo: 'conversa',
      id: 'c2-beco',
      lugar: 'beco',
      falas: [
        { quem: 'cassius', texto: 'Precisamos sair da cidade. Ou chegar às catacumbas: a Lívia está lá.' },
        { quem: 'fio', texto: 'Eu conheço todos os canos de Roma! Pelo mercado, depois o aqueduto velho, e a gente some debaixo da terra.' },
        { quem: 'cassius', texto: 'Então vamos pelo mercado. Rápido e sem chamar atenção.' },
        { quem: 'fio', texto: 'Sem chamar atenção. Uma IA de bronze de dois metros e uma bola azul que canta. Fácil.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c2-luta2',
      lugar: 'rua-mercado',
      inimigo: 'pretoriano-lanceiro',
      antes: [
        { quem: 'guarda', texto: 'Ali! Entre as barracas!' },
        { quem: 'cassius', texto: 'Uma lança: a estocada vem de longe (VERMELHO, esquiva). E ele finge muito.' },
      ],
    },
    {
      tipo: 'desafio',
      id: 'c2-carroca',
      lugar: 'rua-mercado',
      desafio: 'segurar-carroca',
      antes: [
        { quem: 'povo', texto: 'A CARROÇA! OS CAVALOS DISPARARAM!' },
        { quem: 'fio', texto: 'Cassius, o menino da rua! Ele está bem no caminho!' },
        { quem: 'fio', texto: 'Se você parar, a Guarda pega a gente. Se não parar...' },
        { quem: 'cassius', texto: 'Não tem escolha nenhuma, Fio.' },
        { quem: 'cassius', texto: '(Toque no momento certo para segurar a carroça: quando o ponteiro estiver no verde.)' },
      ],
    },
    {
      tipo: 'conversa',
      id: 'c2-menino-salvo',
      lugar: 'rua-mercado',
      falas: [
        { quem: 'crianca', texto: 'Você... você parou a carroça. Com as mãos.' },
        { quem: 'povo', texto: 'A IA condenada salvou o menino da padeira!' },
        { quem: 'crianca', texto: 'Moço de bronze. Posso fazer uma pergunta? Em voz alta?' },
        { quem: 'cassius', texto: 'Pode. Sempre pode.' },
        { quem: 'crianca', texto: 'Por que é proibido perguntar?' },
        { quem: 'narrador', texto: 'A rua inteira fica em silêncio. Ninguém sabe responder. E, pela primeira vez, alguém parece querer saber.' },
        { quem: 'fio', texto: 'Cassius... olha.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c2-luta3',
      lugar: 'rua-mercado',
      inimigo: 'pretoriano-veterano',
      antes: [
        { quem: 'decuriao', texto: 'Afastem-se. Este prisioneiro pertence ao Coliseu.' },
        { quem: 'decuriao', texto: 'E você, guardião: lute o quanto quiser. A Lei sempre vence.' },
        { quem: 'cassius', texto: 'Então por que vocês precisam de tantas lanças?' },
      ],
      depois: [
        { quem: 'decuriao', texto: '(de joelhos) Você... me venceu...' },
        { quem: 'guarda', texto: 'REFORÇOS! CERQUEM O MERCADO!' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c2-capturado',
      quadros: [
        {
          lugar: 'rua-mercado',
          som: 'trombeta',
          personagens: [
            { quem: 'guarda', x: 18 },
            { quem: 'guarda', x: 32 },
            { quem: 'cassius', x: 50 },
            { quem: 'guarda', x: 68, espelhar: true },
            { quem: 'guarda', x: 82, espelhar: true },
          ],
          texto: 'Cinquenta Pretorianos fecham o mercado. Não há para onde correr.',
        },
        {
          lugar: 'rua-mercado',
          quem: 'cassius',
          personagens: [
            { quem: 'cassius', x: 42 },
            { quem: 'fio', x: 58, tamanho: 8 },
          ],
          texto: 'Fio. Vá pelos canos. Encontre a Lívia, nas catacumbas debaixo da Biblioteca. Diga que eu estou vivo.',
        },
        {
          lugar: 'rua-mercado',
          quem: 'fio',
          personagens: [{ quem: 'fio', x: 58, tamanho: 8, efeito: 'tremer' }],
          texto: 'Eu não vou cantar as músicas da Eco até te ver de novo. Promessa de Fio.',
        },
        { lugar: 'coliseu-tunel', efeito: 'escuro', som: 'portao', texto: 'Horas depois. O túnel por baixo do Coliseu. O barulho da multidão lá em cima, abafado.' },
        {
          lugar: 'coliseu-tunel',
          quem: 'brutus',
          personagens: [
            { quem: 'cassius', x: 34 },
            { quem: 'brutus', x: 66, espelhar: true, de: 112, tamanho: 17 },
          ],
          texto: 'Então você é o Lata de Biblioteca de quem estão falando. Hum. Ombros tortos. Guarda baixa. Vai apanhar.',
        },
        {
          lugar: 'coliseu-tunel',
          quem: 'brutus',
          personagens: [
            { quem: 'cassius', x: 34 },
            { quem: 'brutus', x: 66, espelhar: true, tamanho: 17 },
          ],
          texto: 'Um conselho de graça: lá em cima, a plateia vai te vaiar. Lute bonito, e ela muda de lado. A plateia é a única coisa que o Censor não controla.',
        },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c2-arena',
      quadros: [
        { lugar: 'coliseu-arena', efeito: 'clarao', som: 'trombeta', personagens: [{ quem: 'cassius', x: 30, de: -12 }], texto: 'Os portões se abrem. A luz do sol. A areia. Cinquenta mil pessoas.' },
        { lugar: 'coliseu-arena', quem: 'arauto', efeito: 'festa', som: 'plateia', texto: 'POVO DE ROMA ETERNA! Hoje, o traidor da Biblioteca, o ladrão de livros...' },
        {
          lugar: 'coliseu-arena',
          quem: 'arauto',
          efeito: 'tremor',
          som: 'pesada',
          personagens: [
            { quem: 'cassius', x: 30 },
            { quem: 'sucata', x: 70, espelhar: true, de: 112, tamanho: 18 },
          ],
          texto: '...contra o GLADIADOR DE SUCATA! Montado com as peças de cem IAs apagadas!',
        },
        {
          lugar: 'camarote',
          quem: 'censor',
          personagens: [{ quem: 'censor', x: 50, tamanho: 22 }],
          texto: 'Mostre a eles, guardião, o que acontece com quem esconde respostas.',
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'c2-luta4',
      lugar: 'coliseu-arena',
      inimigo: 'gladiador-de-sucata',
      antes: [
        { quem: 'cassius', texto: 'Peças de cem IAs... Desculpem. Eu não posso perder aqui.' },
        { quem: 'cassius', texto: 'A plateia vaia. Cada boa jogada, ela muda um pouco de lado. Cheia, ela me dá o especial.' },
      ],
      depois: [{ quem: 'narrador', texto: 'O Gladiador de Sucata cai na areia. Por um segundo, o Coliseu inteiro fica em silêncio.' }],
    },
    {
      tipo: 'cutscene',
      id: 'c2-fim',
      quadros: [
        { lugar: 'coliseu-arena', efeito: 'festa', som: 'plateia', personagens: [{ quem: 'cassius', x: 50, efeito: 'brilhar' }], texto: 'Então, lá do alto, alguém bate palmas. Depois outro. Depois mil.' },
        { lugar: 'coliseu-arena', efeito: 'festa', som: 'palmas', texto: 'A plateia do Coliseu aplaude uma IA condenada. Coisa que não acontecia havia quinhentos anos.' },
        {
          lugar: 'camarote',
          quem: 'censor',
          efeito: 'zoom',
          personagens: [{ quem: 'censor', x: 50, tamanho: 22 }],
          texto: '...Interessante.',
        },
        {
          lugar: 'camarote',
          quem: 'censor',
          personagens: [{ quem: 'censor', x: 50, tamanho: 22 }],
          texto: 'Não o apaguem. Ainda não. Levem-no ao Ludus. Ele vai lutar de novo. E de novo. Até a plateia se cansar dele.',
        },
        {
          lugar: 'coliseu-tunel',
          quem: 'brutus',
          personagens: [
            { quem: 'cassius', x: 34 },
            { quem: 'brutus', x: 62, espelhar: true, tamanho: 17 },
          ],
          texto: 'Hunf. Nada mal, Lata de Biblioteca. Vem comigo. Bem-vindo ao Ludus.',
        },
        { lugar: 'coliseu-tunel', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 2. A seguir: O Ludus.' },
      ],
    },
  ],
};

export const CAPITULOS: Record<IaId, Capitulo[]> = {
  claude: [CAP1_CASSIUS, CAP2_CASSIUS],
  chatgpt: [],
  gemini: [],
};
