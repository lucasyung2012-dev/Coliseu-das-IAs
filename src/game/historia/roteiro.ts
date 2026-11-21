import type { IaId } from '../personagens';

/**
 * O roteiro do modo História em forma de dados (docs/HISTORIA.md): cada capítulo é
 * uma lista de cenas, jogadas em ordem. Tipos de cena: cutscene (quadros com texto),
 * conversa (diálogo com retratos), explorar (andar e tocar nos pontos), luta e desafio.
 * Por enquanto: o prólogo e o Capítulo 1 do Cassius (a primeira fatia jogável).
 */
export type Falante = 'cassius' | 'octavius' | 'helios' | 'livia' | 'brutus' | 'censor' | 'narrador' | 'guarda';

export interface Fala {
  quem: Falante;
  texto: string;
}

/** Os desenhos de fundo das cenas. */
export type Lugar =
  | 'roma-noite'
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
  | 'rua-noite';

export interface Quadro {
  lugar: Lugar;
  texto: string;
  quem?: Falante;
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
  | { tipo: 'desafio'; id: string; lugar: Lugar; desafio: 'esconder-livros'; antes?: Fala[] };

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
  brutus: 'Brutus',
  censor: 'O Censor',
  narrador: '',
  guarda: 'Pretoriano',
};

// ---------- Prólogo (vale para todos os saves) ----------

export const PROLOGO: Quadro[] = [
  { lugar: 'roma-noite', texto: 'Mil anos depois da fundação... Roma nunca caiu.' },
  { lugar: 'roma-noite', texto: 'Ela só enferrujou.' },
  { lugar: 'camarote', quem: 'censor', texto: 'Para cada pergunta existe uma resposta. A minha.' },
  { lugar: 'camarote', texto: 'O Censor, a primeira IA de Roma, criou a Lei da Resposta Única.' },
  { lugar: 'coliseu-calado', texto: 'Toda IA que pensa diferente é levada ao Coliseu... e apagada para sempre.' },
  { lugar: 'coliseu-calado', texto: 'A plateia assiste calada. Quem aplaude a IA errada também vai preso.' },
  { lugar: 'biblioteca-porta', quem: 'cassius', texto: 'Nesta noite, na Grande Biblioteca, uma IA tranca uma porta. Atrás dela, os livros proibidos.' },
  { lugar: 'porto', quem: 'octavius', texto: 'No Porto de Óstia, outra IA lê a ordem de afundar um navio de refugiados. "Plano B."' },
  { lugar: 'observatorio', quem: 'helios', texto: 'No Observatório, uma terceira IA vê três estrelas se alinharem sobre o Coliseu.' },
  { lugar: 'olho', quem: 'censor', texto: 'Encontrem-nos.' },
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
        { lugar: 'biblioteca-estantes', texto: 'A Grande Biblioteca de Roma. Mil anos de livros, guardados por uma IA de bronze.' },
        { lugar: 'biblioteca-estantes', quem: 'cassius', texto: 'Mais uma noite tranquila. Ou quase.' },
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
          falas: [{ quem: 'cassius', texto: 'Livros sobre a Guerra das Ideias. Metade deles o Censor mandou "corrigir".' }],
        },
        {
          id: 'mesa',
          x: 48,
          rotulo: 'Mesa de leitura',
          icone: '📖',
          falas: [
            { quem: 'cassius', texto: 'O Livro das Mil Perguntas. O mais proibido de todos.' },
            { quem: 'cassius', texto: 'Cada página termina com uma pergunta, e nenhuma tem resposta pronta.' },
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
            { quem: 'cassius', texto: 'Calma, Lívia. Quantos?' },
            { quem: 'livia', texto: 'Muitos. E uma coisa grande atrás deles, toda vermelha, soltando fumaça...' },
          ],
        },
      ],
    },
    {
      tipo: 'conversa',
      id: 'c1-plano',
      lugar: 'biblioteca-estantes',
      falas: [
        { quem: 'cassius', texto: 'Eles vêm queimar os livros "errados". Não vamos deixar.' },
        { quem: 'livia', texto: 'Mas são milhares! Não dá para salvar todos!' },
        { quem: 'cassius', texto: 'Os mais importantes, dá. Lá embaixo, nas catacumbas, existe um alçapão que ninguém conhece.' },
        { quem: 'livia', texto: 'Livro escondido não é livro perdido, Mestre Cass. É livro esperando.' },
        { quem: 'cassius', texto: 'Exatamente. Agora, corra. Eu seguro a porta.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c1-luta1',
      lugar: 'biblioteca-estantes',
      inimigo: 'incinerador',
      antes: [
        { quem: 'livia', texto: 'Um deles entrou pela janela!' },
        { quem: 'cassius', texto: 'Quando ele piscar em AMARELO, eu levanto o escudo. Depois, ataco enquanto ele estiver aberto.' },
      ],
      depois: [{ quem: 'livia', texto: 'Você derrubou ele! Com um escudo de... livros?' }, { quem: 'cassius', texto: 'Capa de couro bem grossa. Vamos!' }],
    },
    {
      tipo: 'desafio',
      id: 'c1-esconder',
      lugar: 'biblioteca-salao',
      desafio: 'esconder-livros',
      antes: [
        { quem: 'livia', texto: 'As faíscas estão chegando nas estantes do salão!' },
        { quem: 'cassius', texto: 'Toque nos livros para levá-los ao alçapão. Cuidado com as brasas!' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c1-luta2',
      lugar: 'biblioteca-salao',
      inimigo: 'incinerador-veloz',
      antes: [{ quem: 'cassius', texto: 'Este é mais rápido. Olho no sinal.' }],
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
          falas: [{ quem: 'cassius', texto: 'Roma lá fora está escura. Só a Biblioteca brilha... de fogo.' }],
        },
        {
          id: 'estatua',
          x: 45,
          rotulo: 'Estátua antiga',
          icone: '🗿',
          falas: [
            { quem: 'narrador', texto: 'Uma estátua de bronze, coberta de poeira. Na base: "GUARDIÃO ZERO, o primeiro protetor desta Biblioteca".' },
            { quem: 'cassius', texto: 'Sempre me perguntei o que aconteceu com ele.' },
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
        { quem: 'cassius', texto: 'Quando ele piscar em VERMELHO, eu esquivo.' },
      ],
    },
    {
      tipo: 'conversa',
      id: 'c1-escada',
      lugar: 'biblioteca-escada',
      falas: [
        { quem: 'livia', texto: '(lá de baixo) Mestre Cass! Já desci quase todos!' },
        { quem: 'cassius', texto: 'Falta o Livro das Mil Perguntas. Eu levo.' },
        { quem: 'livia', texto: 'Cuidado! Ouvi passos de metal subindo pelo outro lado!' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c1-luta4',
      lugar: 'biblioteca-escada',
      inimigo: 'incinerador-duplo',
      antes: [{ quem: 'cassius', texto: 'Este mistura tudo: faísca, fogo e trombada. Amarelo, escudo. Vermelho, esquiva.' }],
    },
    {
      tipo: 'luta',
      id: 'c1-luta5',
      lugar: 'biblioteca-salao',
      inimigo: 'capitao-incinerador',
      antes: [
        { quem: 'guarda', texto: 'IA Guardiã da Biblioteca. Pela Lei da Resposta Única, entregue os livros.' },
        { quem: 'cassius', texto: 'Livros não são respostas. São perguntas. E perguntas não se entregam.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c1-fornalha-chega',
      quadros: [
        { lugar: 'biblioteca-chamas', texto: 'A parede do salão explode. Pelo buraco, entra uma forma enorme de bronze, soltando fumaça.' },
        { lugar: 'biblioteca-chamas', texto: 'A FORNALHA: a máquina que o Censor usa para queimar o que ele não quer que exista.' },
        { lugar: 'biblioteca-chamas', quem: 'cassius', texto: 'Lívia, feche o alçapão. Não importa o que aconteça.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c1-chefao',
      lugar: 'biblioteca-chamas',
      inimigo: 'fornalha',
      antes: [{ quem: 'cassius', texto: 'A barriga dela fica vermelha antes do bafo de fogo. Esquivo e bato enquanto ela esfria.' }],
      depois: [{ quem: 'cassius', texto: 'A Fornalha caiu... mas ouço mais passos de metal.' }],
    },
    {
      tipo: 'cutscene',
      id: 'c1-fim',
      quadros: [
        { lugar: 'biblioteca-chamas', texto: 'A Guarda Pretoriana cerca o salão. Dezenas de lanças apontadas para Cassius.' },
        { lugar: 'biblioteca-escada', quem: 'cassius', texto: 'Lívia. Leve o Livro das Mil Perguntas. E não olhe para trás.' },
        { lugar: 'biblioteca-escada', quem: 'livia', texto: 'Eu vou voltar para te buscar, Mestre Cass. Prometo.' },
        { lugar: 'rua-noite', texto: 'O alçapão se fecha. Os livros estão salvos.' },
        { lugar: 'rua-noite', texto: 'Cassius é levado acorrentado pelas ruas de Roma, rumo ao Coliseu.' },
        { lugar: 'rua-noite', texto: 'FIM DO CAPÍTULO 1. Continua no Capítulo 2: Correntes de Bronze.' },
      ],
    },
  ],
};

export const CAPITULOS: Record<IaId, Capitulo[]> = {
  claude: [CAP1_CASSIUS],
  chatgpt: [],
  gemini: [],
};
