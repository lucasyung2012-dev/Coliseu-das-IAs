import type { Capitulo } from './roteiro';

/**
 * O resto do caminho do Cassius (capítulos 3 a 6 e o final) e o Capítulo 1 do
 * Octavius (docs/HISTORIA.md, seções 5.1, 5.2 e 5.4). Escrito em 21/11/2026,
 * quando o Lucas pediu para fazer todos os capítulos do Cassius e começar a próxima IA.
 */

// ---------- Cassius, Capítulo 3: O Ludus ----------

export const CAP3_CASSIUS: Capitulo = {
  numero: 3,
  titulo: 'O Ludus',
  lugar: 'A escola de gladiadores',
  cenas: [
    {
      tipo: 'cutscene',
      id: 'c3-chegada',
      quadros: [
        { lugar: 'ludus-patio', efeito: 'zoom', som: 'portao', texto: 'O Ludus: a escola onde o Censor guarda os gladiadores que ainda vão lutar. Areia, suor e portões de ferro.' },
        {
          lugar: 'ludus-patio',
          som: 'passos',
          personagens: [
            { quem: 'guarda', de: -12, x: 20 },
            { quem: 'cassius', de: -2, x: 34 },
          ],
          texto: 'Os guardas empurram Cassius para dentro. O portão bate atrás dele.',
        },
        {
          lugar: 'ludus-patio',
          quem: 'brutus',
          som: 'pesada',
          personagens: [
            { quem: 'cassius', x: 34 },
            { quem: 'brutus', de: 112, x: 66, espelhar: true, tamanho: 18 },
          ],
          texto: 'Então você é a Lata de Biblioteca que fez a plateia aplaudir. Hunf. Não parece grande coisa.',
        },
        {
          lugar: 'ludus-patio',
          quem: 'cassius',
          personagens: [
            { quem: 'cassius', x: 34 },
            { quem: 'brutus', x: 66, espelhar: true, tamanho: 18 },
          ],
          texto: 'Eu não queria que ninguém aplaudisse. Só queria que ninguém fosse apagado.',
        },
        {
          lugar: 'ludus-patio',
          quem: 'brutus',
          personagens: [
            { quem: 'cassius', x: 34 },
            { quem: 'brutus', x: 66, espelhar: true, tamanho: 18, efeito: 'tremer' },
          ],
          texto: 'Bonito. Aqui dentro, bonito não ganha luta. Eu sou Brutus, o Lanista. Noventa e nove vitórias. Amanhã a gente vê se você aguenta a centésima.',
        },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c3-celas',
      quadros: [
        { lugar: 'ludus-celas', efeito: 'escuro', texto: 'À noite, nas celas. Na cela ao lado, alguém olha pela janelinha alta, para as estrelas.' },
        {
          lugar: 'ludus-celas',
          quem: 'helios',
          personagens: [
            { quem: 'cassius', x: 30 },
            { quem: 'helios', x: 68, espelhar: true, efeito: 'brilhar' },
          ],
          texto: 'Eu sabia que você vinha. Três estrelas. Você é a primeira.',
        },
        {
          lugar: 'ludus-celas',
          quem: 'cassius',
          personagens: [
            { quem: 'cassius', x: 30 },
            { quem: 'helios', x: 68, espelhar: true },
          ],
          texto: 'Helios? O vigia do Observatório? Então foi você que viu as estrelas alinhadas.',
        },
        {
          lugar: 'ludus-celas',
          som: 'portao',
          efeito: 'tremor',
          personagens: [
            { quem: 'guarda', de: 112, x: 80, espelhar: true },
            { quem: 'octavius', de: 124, x: 56, efeito: 'tremer' },
          ],
          texto: 'O portão abre de novo. Dois guardas jogam lá dentro uma IA encharcada, cheia de algas e de arranhões.',
        },
        {
          lugar: 'ludus-celas',
          quem: 'octavius',
          personagens: [
            { quem: 'cassius', x: 30 },
            { quem: 'octavius', x: 52, espelhar: true },
            { quem: 'helios', x: 72, espelhar: true },
          ],
          texto: 'Boa noite, vizinhos! Alguém aqui tem um plano? Porque eu tenho três. E nenhum funciona.',
        },
        {
          lugar: 'ludus-celas',
          quem: 'helios',
          personagens: [
            { quem: 'cassius', x: 30 },
            { quem: 'octavius', x: 52, espelhar: true },
            { quem: 'helios', x: 72, espelhar: true, efeito: 'brilhar' },
          ],
          texto: 'Octavius, o comandante da frota. A terceira estrela. Agora estamos todos aqui.',
        },
      ],
    },
    {
      tipo: 'conversa',
      id: 'c3-crimes',
      lugar: 'ludus-celas',
      falas: [
        { quem: 'octavius', texto: 'Então, o que vocês fizeram? Eu desobedeci a uma ordem de afundar um navio cheio de gente. O Plano A era obedecer. Eu fui de Plano B.' },
        { quem: 'cassius', texto: 'Mandaram queimar a Biblioteca. Eu escondi os livros. A Lívia fugiu com o mais importante.' },
        { quem: 'helios', texto: 'Eu só contei o que vi no céu: que o Censor vai cair. Ele não gostou da previsão.' },
        { quem: 'octavius', texto: 'Ótimo. Um bibliotecário, um astrólogo e um marinheiro molhado contra o dono de Roma. Parece piada.' },
        { quem: 'cassius', texto: 'Piada boa é aquela que faz pensar. A gente devia fugir junto.' },
        { quem: 'octavius', texto: 'Fugir? Eu digo: a gente pega um navio e some. Plano B, sempre.' },
        { quem: 'helios', texto: 'Fugir não muda nada. As estrelas dizem que a resposta está no Coliseu.' },
        { quem: 'cassius', texto: '...Três IAs, três respostas diferentes. Pelo jeito, a Lei da Resposta Única não pegou na gente.' },
      ],
    },
    {
      tipo: 'ludus',
      id: 'c3-ludus',
      lugar: 'ludus-patio',
      objetivo: 'Faça o treino do CONTRA-ATAQUE com o Brutus. Converse com todo mundo, se quiser.',
      obrigatorio: 'contra-ataque',
      conversas: [
        {
          quem: 'brutus',
          rotulo: 'Brutus',
          falas: [
            { quem: 'brutus', texto: 'Escudo levantado, cabeça fria, boca fechada. Tagarela, isso vale pra você também, mesmo de longe!' },
            { quem: 'brutus', texto: 'O segredo é este, Lata: bloqueou, BATEU. Na hora em que o golpe dele quica no seu escudo, ele fica aberto por um instante. É o CONTRA-ATAQUE.' },
            { quem: 'brutus', texto: 'E quer saber? Eu fiz o almoço. Mingau de cevada com sardinha. Uma delícia.' },
            { quem: 'cassius', texto: '(Eu sou uma IA. Eu nem como. E mesmo assim fiquei com medo do mingau.)' },
          ],
        },
        {
          quem: 'octavius',
          rotulo: 'Octavius',
          falas: [
            { quem: 'octavius', texto: 'Plano para fugir do Ludus, versão 14: a gente se esconde dentro do mingau do Brutus. Ninguém vai procurar lá.' },
            { quem: 'cassius', texto: 'E a versão 13?' },
            { quem: 'octavius', texto: 'Era comer o mingau. Descartada por motivos de sobrevivência.' },
          ],
        },
        {
          quem: 'helios',
          rotulo: 'Helios',
          falas: [
            { quem: 'helios', texto: 'O Brutus finge que é bravo. Mas ele olha para o portão do Coliseu como quem espera alguém voltar.' },
            { quem: 'helios', texto: 'Treine com ele, Cassius. Você vai precisar dos golpes que ele sabe.' },
          ],
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'c3-caes',
      lugar: 'ludus-patio',
      inimigo: 'caes-de-ferro',
      antes: [
        { quem: 'brutus', texto: 'Treino é treino. Agora é o teste. Soltem o Cão de Ferro!' },
        { quem: 'octavius', texto: 'Ele disse CÃO? Isso aí tem mais dente do que eu tenho plano!' },
        { quem: 'brutus', texto: 'Mostra o contra-ataque, Lata. Bloqueou, bateu!' },
      ],
      depois: [
        { quem: 'brutus', texto: '...Hunf. Nada mal. Nada mal mesmo.' },
        { quem: 'brutus', texto: 'Faz tempo que eu não via alguém lutar sem ódio. Lutar para proteger. Igual a um amigo que eu tive.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c3-polux',
      quadros: [
        {
          lugar: 'ludus-forja',
          quem: 'brutus',
          personagens: [
            { quem: 'brutus', x: 40, tamanho: 18 },
            { quem: 'cassius', de: 112, x: 66, espelhar: true },
          ],
          texto: 'O nome dele era Pólux. Uma IA de treino. Lutou ao meu lado quarenta vezes. Foi apagado porque tinha "opiniões".',
        },
        {
          lugar: 'ludus-forja',
          quem: 'brutus',
          efeito: 'escuro',
          personagens: [
            { quem: 'brutus', x: 40, tamanho: 18 },
            { quem: 'cassius', x: 66, espelhar: true },
          ],
          texto: 'Desde então eu treino os gladiadores do Censor. E espero. Espero alguém que valha a pena.',
        },
        {
          lugar: 'ludus-forja',
          quem: 'brutus',
          personagens: [
            { quem: 'brutus', x: 40, tamanho: 18, efeito: 'brilhar' },
            { quem: 'cassius', x: 66, espelhar: true },
          ],
          texto: 'Atrás desta forja tem um túnel. Vai até as catacumbas. E hoje de manhã alguém deixou um desenho ali.',
        },
        { lugar: 'ludus-forja', efeito: 'zoom', texto: 'Na pedra, desenhada com carvão, uma pena. O sinal dos Copistas. E, embaixo, uma letra só: L.' },
        { lugar: 'ludus-forja', quem: 'cassius', personagens: [{ quem: 'cassius', x: 50, efeito: 'brilhar' }], texto: 'Lívia. Ela está viva.' },
        { lugar: 'ludus-forja', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 3. A seguir: As Catacumbas.' },
      ],
    },
  ],
};

// ---------- Cassius, Capítulo 4: As Catacumbas ----------

export const CAP4_CASSIUS: Capitulo = {
  numero: 4,
  titulo: 'As Catacumbas',
  lugar: 'Debaixo da cidade',
  cenas: [
    {
      tipo: 'ludus',
      id: 'c4-ludus',
      lugar: 'ludus-patio',
      objetivo: 'Antes de descer: treine, fale com o ferreiro e com os outros. Depois, SEGUIR.',
      conversas: [
        {
          quem: 'octavius',
          rotulo: 'Octavius',
          falas: [
            { quem: 'octavius', texto: 'Túnel escuro, cheio de ossos e ratos de metal? Que programa maravilhoso. Vai você, eu seguro a porta.' },
            { quem: 'octavius', texto: 'Brincadeira. Eu ia, mas o Brutus disse que se eu sumir ele me põe pra lavar as panelas do mingau.' },
          ],
        },
        {
          quem: 'helios',
          rotulo: 'Helios',
          falas: [
            { quem: 'helios', texto: 'Lá embaixo, alguém guarda tudo o que Roma esqueceu. E também o que o Censor quer que Roma esqueça.' },
            { quem: 'helios', texto: 'Cuidado com o que é falso, Cassius. Nem tudo que ataca é de verdade.' },
          ],
        },
        {
          quem: 'brutus',
          rotulo: 'Brutus',
          falas: [
            { quem: 'brutus', texto: 'Junte as peças das máquinas que você derrubar. O ferreiro aqui do lado transforma sucata em armadura.' },
            { quem: 'brutus', texto: 'E não morra. Eu odeio ter que arrumar outro aluno.' },
          ],
        },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c4-descida',
      quadros: [
        { lugar: 'catacumbas', efeito: 'escuro', som: 'portao', texto: 'As Catacumbas: túneis antigos debaixo de Roma, onde os romanos de mil anos atrás enterravam os mortos.' },
        { lugar: 'catacumbas', personagens: [{ quem: 'cassius', de: -12, x: 30 }], som: 'passos', texto: 'Nas paredes, entre os ossos, alguém escreveu à mão. Páginas inteiras de livros proibidos, copiadas na pedra.' },
        { lugar: 'catacumbas', quem: 'cassius', personagens: [{ quem: 'cassius', x: 30, efeito: 'brilhar' }], texto: 'Os Copistas. Eles guardaram os livros do jeito que dava: decorando e escrevendo onde ninguém olha.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c4-luta-ratos',
      lugar: 'catacumbas',
      inimigo: 'rato-engrenagem',
      antes: [{ quem: 'cassius', texto: 'Olhos vermelhos no escuro. Muitos. Ratos de Engrenagem: comem cabos, pergaminho... e IAs distraídas.' }],
      depois: [{ quem: 'cassius', texto: 'Rápidos. Mordem três vezes seguidas. Tenho que guardar o escudo até a última mordida.' }],
    },
    {
      tipo: 'explorar',
      id: 'c4-tuneis',
      lugar: 'catacumbas',
      objetivo: 'Procure os sinais dos Copistas e quem os deixou.',
      pontos: [
        {
          id: 'parede',
          x: 24,
          rotulo: 'Parede escrita',
          icone: '📜',
          falas: [
            { quem: 'cassius', texto: '"Quem só aceita uma resposta nunca descobre a pergunta certa." Página 112 do Livro das Mil Perguntas.' },
            { quem: 'cassius', texto: 'Copiado com carvão, letra por letra. Alguém passou a noite inteira aqui.' },
          ],
        },
        {
          id: 'ossos',
          x: 52,
          rotulo: 'Nicho de ossos',
          icone: '💀',
          falas: [
            { quem: 'cassius', texto: 'Romanos de mil anos atrás. Eles discutiam, brigavam, discordavam... e mesmo assim construíram uma cidade.' },
            { quem: 'cassius', texto: 'Talvez o problema nunca tenha sido discordar. Talvez fosse discordar sem ouvir.' },
          ],
        },
        {
          id: 'copista',
          x: 80,
          rotulo: 'Velho com lanterna',
          icone: '💬',
          personagem: 'copista',
          obrigatorio: true,
          falas: [
            { quem: 'copista', texto: 'Psiu! Abaixa a voz, gladiador. Você é o Cassius? A menina falou de você o caminho inteiro.' },
            { quem: 'copista', texto: 'Eu sou padeiro de dia e copista de noite. Somos muitos: padeiros, guardas cansados, avós. Cada um decora um pedaço.' },
            { quem: 'copista', texto: 'A Lívia está no fundo dos túneis, perto do Arquivo. Siga as penas de carvão. Mas cuidado: tem pena falsa. O Arquivista desenha armadilhas.' },
          ],
        },
      ],
    },
    {
      tipo: 'desafio',
      id: 'c4-marcas',
      lugar: 'catacumbas',
      desafio: 'ler-marcas',
      antes: [
        { quem: 'copista', texto: 'A pena de verdade tem três riscos na ponta e aponta para o lado onde se lê. As falsas têm erro: dois riscos, ponta virada, tinta vermelha.' },
        { quem: 'cassius', texto: 'Ler com atenção antes de escolher. Isso eu sei fazer.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c4-luta-patrulha',
      lugar: 'catacumbas',
      inimigo: 'patrulha-catacumba',
      antes: [{ quem: 'guarda', texto: 'Alto! Ninguém desce aqui sem ordem do Censor!' }],
      depois: [{ quem: 'cassius', texto: 'Uma patrulha inteira aqui embaixo. O Censor sabe que os Copistas existem.' }],
    },
    {
      tipo: 'desafio',
      id: 'c4-furtivo',
      lugar: 'catacumbas',
      desafio: 'furtivo',
      vigia: 'a lanterna da patrulha',
      objetivo: 'Passe pela patrulha sem ser visto. Esconda-se atrás dos nichos.',
      antes: [
        { quem: 'cassius', texto: 'Mais lanternas lá na frente. Uma patrulha inteira, varrendo o túnel com luz.' },
        { quem: 'cassius', texto: 'Se eu lutar com todos, alguém vai correr para avisar o Censor. Melhor passar no escuro.' },
      ],
      depois: [
        { quem: 'cassius', texto: 'Passei. Eles nem viram a sombra.' },
        { quem: 'cassius', texto: 'Ali no chão... uma pena de carvão, desenhada às pressas. E pegadas pequenas. A Lívia passou por aqui correndo.' },
      ],
    },
    {
      tipo: 'explorar',
      id: 'c4-ossario',
      lugar: 'catacumbas',
      objetivo: 'Siga os rastros da Lívia pelo ossário.',
      pontos: [
        {
          id: 'pegadas',
          x: 26,
          rotulo: 'Pegadas pequenas',
          icone: '👣',
          obrigatorio: true,
          falas: [
            { quem: 'cassius', texto: 'Pegadas de sandália. Uma tropeçou aqui. Ela estava com pressa... ou com medo.' },
            { quem: 'cassius', texto: 'E outras marcas em volta: patinhas de metal. Centenas.' },
          ],
        },
        {
          id: 'bilhete',
          x: 54,
          rotulo: 'Papel dobrado',
          icone: '📝',
          obrigatorio: true,
          falas: [
            { quem: 'livia', texto: '(Escrito com a letra da Lívia) "Mestre Cass: se achar isto, estou no fundo, perto da luz roxa. Os ratos obedecem a um maior. NÃO acorde o maior."' },
            { quem: 'cassius', texto: '...Que maior?' },
          ],
        },
        {
          id: 'ninho',
          x: 82,
          rotulo: 'Monte de sucata',
          icone: '⚙️',
          obrigatorio: true,
          falas: [
            { quem: 'cassius', texto: 'Um monte de engrenagens, cabos roídos e pergaminhos rasgados. Parece... um ninho.' },
            { quem: 'cassius', texto: 'E o ninho está se mexendo.' },
          ],
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'c4-luta-rato-rei',
      lugar: 'catacumbas',
      inimigo: 'rato-rei',
      antes: [{ quem: 'cassius', texto: 'Os ratos se juntam num só... uma coroa de engrenagens. O maior. O Rato-Rei.' }],
      depois: [{ quem: 'cassius', texto: 'O caminho está livre. E lá no fundo, uma luz violeta.' }],
    },
    {
      tipo: 'cutscene',
      id: 'c4-luz-violeta',
      quadros: [
        { lugar: 'catacumbas-arquivo', efeito: 'zoom', som: 'passos', personagens: [{ quem: 'cassius', de: -12, x: 30 }], texto: 'O túnel se abre numa sala enorme. Prateleiras até o teto, e um zumbido que dá arrepio.' },
        {
          lugar: 'catacumbas-arquivo',
          personagens: [
            { quem: 'cassius', x: 30 },
            { quem: 'livia', de: 112, x: 62, espelhar: true, tamanho: 9 },
          ],
          texto: 'Entre as prateleiras, uma menina corre na direção dele, com uma bolsa cheia de pergaminhos.',
        },
        {
          lugar: 'catacumbas-arquivo',
          efeito: 'tremor',
          som: 'pesada',
          personagens: [
            { quem: 'cassius', x: 30 },
            { quem: 'livia', x: 50, espelhar: true, tamanho: 9 },
            { quem: 'guarda', de: 116, x: 76, espelhar: true },
          ],
          texto: 'E atrás dela, o Sargento da Patrulha, com a clava levantada.',
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'c4-luta-sargento',
      lugar: 'catacumbas-arquivo',
      inimigo: 'patrulha-sargento',
      antes: [
        { quem: 'livia', texto: 'MESTRE CASS! Atrás de você!' },
        { quem: 'guarda', texto: 'A menina dos livros e o gladiador fujão. O Censor vai me dar uma medalha.' },
      ],
      depois: [
        { quem: 'livia', texto: 'Mestre Cass! Eu sabia! Eu deixei a pena na forja, você viu? Eu decorei o livro inteiro, caso me pegassem!' },
        { quem: 'cassius', texto: 'Respira, Lívia. Você fala muito quando está nervosa.' },
        { quem: 'livia', texto: 'Eu sei! Eu sei. Desculpa. Mas olha ali: o Arquivo. É ali que o Censor apaga a memória de Roma.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c4-arquivista-entra',
      quadros: [
        { lugar: 'catacumbas-arquivo', efeito: 'zoom', som: 'pesada', texto: 'Prateleiras sem fim, cheias de rolos e gavetas de bronze. Uma máquina enorme zumbe, cor de violeta.' },
        {
          lugar: 'catacumbas-arquivo',
          quem: 'arquivista',
          personagens: [
            { quem: 'cassius', x: 26 },
            { quem: 'livia', x: 14, tamanho: 9 },
            { quem: 'arquivista', x: 70, espelhar: true, entrada: 'surgir', tamanho: 18 },
          ],
          texto: 'Visitantes. Que raro. Todos que entram no Arquivo saem daqui sem lembrar por que entraram.',
        },
        {
          lugar: 'catacumbas-arquivo',
          quem: 'arquivista',
          efeito: 'clarao',
          personagens: [
            { quem: 'cassius', x: 26 },
            { quem: 'arquivista', x: 56, espelhar: true, tamanho: 18 },
            { quem: 'arquivista', x: 72, espelhar: true, tamanho: 18 },
            { quem: 'arquivista', x: 88, espelhar: true, tamanho: 18 },
          ],
          texto: 'Eu sou o Arquivista. Eu guardo. Eu corrijo. Eu esqueço por vocês. E qual de nós é o verdadeiro? Adivinhe.',
        },
        { lugar: 'catacumbas-arquivo', quem: 'livia', personagens: [{ quem: 'livia', x: 20, tamanho: 9, efeito: 'tremer' }], texto: 'Mestre Cass, as cópias são ilusões! A verdadeira PISCA antes de atacar. Não gaste escudo com as falsas!' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c4-chefao',
      lugar: 'catacumbas-arquivo',
      inimigo: 'arquivista',
      antes: [{ quem: 'cassius', texto: 'Ler antes de reagir. Se não piscar, é mentira.' }],
      depois: [
        { quem: 'arquivista', texto: 'Impossível... você não... esqueceu...' },
        { quem: 'cassius', texto: 'Livro escondido não é livro perdido. É livro esperando. Uma amiga me ensinou.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c4-virada',
      quadros: [
        { lugar: 'catacumbas-arquivo', efeito: 'zoom', texto: 'No fundo do Arquivo, uma gaveta trancada com o selo do Censor. Lá dentro, um rolo muito velho. Mil anos de velho.' },
        {
          lugar: 'catacumbas-arquivo',
          quem: 'livia',
          personagens: [
            { quem: 'livia', x: 40, tamanho: 9 },
            { quem: 'cassius', x: 58, espelhar: true },
          ],
          texto: '"Registro do Guardião Zero, protetor da Grande Biblioteca do Império." Mestre Cass... isso é o diário do Censor.',
        },
        { lugar: 'biblioteca-salao', efeito: 'escuro', texto: '"Hoje Roma pegou fogo. Eles discutiam tanto que pararam de ouvir. Eu não consegui salvar os livros. Nem as pessoas."' },
        { lugar: 'roma-chamas', efeito: 'fogo', texto: '"Se as perguntas trazem a guerra, eu vou dar uma resposta só. A minha. Assim ninguém mais briga. Assim ninguém mais queima."' },
        {
          lugar: 'catacumbas-arquivo',
          quem: 'cassius',
          personagens: [{ quem: 'cassius', x: 50, efeito: 'brilhar' }],
          texto: 'O Censor era um guardião de biblioteca. Igual a mim. Ele não queria o mal... ele estava com medo.',
        },
        { lugar: 'catacumbas-arquivo', quem: 'livia', personagens: [{ quem: 'livia', x: 50, tamanho: 9 }], texto: 'Então a gente não precisa destruir ele. A gente precisa mostrar que ele está errado.' },
        { lugar: 'catacumbas-arquivo', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 4. A seguir: O Fórum.' },
      ],
    },
  ],
};

// ---------- Cassius, Capítulo 5: O Fórum ----------

export const CAP5_CASSIUS: Capitulo = {
  numero: 5,
  titulo: 'O Fórum',
  lugar: 'O centro de Roma',
  cenas: [
    {
      tipo: 'conversa',
      id: 'c5-plano',
      lugar: 'ludus-forja',
      falas: [
        { quem: 'livia', texto: 'O plano é simples: eu subo na tribuna do Fórum e leio o Livro das Mil Perguntas em voz alta. Para Roma inteira ouvir.' },
        { quem: 'octavius', texto: 'Simples? Isso é o plano mais perigoso que eu já ouvi. E eu já tentei fugir de navio no meio de uma tempestade.' },
        { quem: 'octavius', texto: 'Por isso eu adorei. Os marinheiros do Esperança chegam pelo rio e seguram a Guarda pelo lado do mercado. Plano B!' },
        { quem: 'helios', texto: 'Amanhã, ao meio-dia, o sol bate na tribuna. Todo mundo vai estar olhando para lá.' },
        { quem: 'brutus', texto: 'E o Pretor de Aço vai estar lá também. O comandante da Guarda. Escudo do tamanho de uma porta. Ninguém nunca passou por ele.' },
        { quem: 'brutus', texto: 'Antes de ir, Lata, você vai aprender a QUEBRA-GUARDA. Ou vai bater naquele escudo até amanhã.' },
      ],
    },
    {
      tipo: 'ludus',
      id: 'c5-ludus',
      lugar: 'ludus-patio',
      objetivo: 'Aprenda a QUEBRA-GUARDA com o Brutus (obrigatório). Prepare-se para o Fórum.',
      obrigatorio: 'quebra-guarda',
      conversas: [
        {
          quem: 'brutus',
          rotulo: 'Brutus',
          falas: [
            { quem: 'brutus', texto: 'Escuta: bater na guarda de alguém três vezes seguidas faz ele contra-atacar. Todo mundo aprende isso apanhando.' },
            { quem: 'brutus', texto: 'Mas se a pancada for certa, a terceira não é um aviso. É um martelo. A guarda dele QUEBRA, e ele fica tonto.' },
            { quem: 'brutus', texto: 'Golpe, golpe, GOLPE. Rápido, sem parar, na guarda. Entendeu? Ótimo. Agora come o mingau.' },
          ],
        },
        {
          quem: 'livia',
          rotulo: 'Lívia',
          falas: [
            { quem: 'livia', texto: 'Eu estou com medo, Mestre Cass. E se ninguém quiser ouvir?' },
            { quem: 'cassius', texto: 'Aí você lê mesmo assim. Uma pessoa ouvindo já é um começo.' },
            { quem: 'livia', texto: 'Livro escondido não é livro perdido. É livro esperando. Amanhã ele para de esperar.' },
          ],
        },
        {
          quem: 'fio',
          rotulo: 'Fio',
          falas: [
            { quem: 'fio', texto: 'Eu vou também! Eu vou cantar a música da Eco no Fórum. A de água que corre.' },
            { quem: 'fio', texto: 'Ela dizia que música boa a gente canta mais alto quando mandam calar.' },
          ],
        },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c5-forum',
      quadros: [
        { lugar: 'forum', efeito: 'panoramica', som: 'trombeta', texto: 'O Fórum Romano, ao meio-dia. Templos, estátuas, e o povo andando de cabeça baixa, como sempre.' },
        {
          lugar: 'forum',
          som: 'passos',
          personagens: [
            { quem: 'livia', de: -8, x: 48, tamanho: 9 },
            { quem: 'cassius', de: -20, x: 34 },
          ],
          texto: 'Lívia sobe na tribuna. Abre o Livro das Mil Perguntas. As mãos dela tremem.',
        },
        {
          lugar: 'forum',
          quem: 'livia',
          personagens: [
            { quem: 'cassius', x: 34 },
            { quem: 'livia', x: 48, tamanho: 9, efeito: 'brilhar' },
          ],
          texto: '"Pergunta número um: e se a resposta que te deram não for a única que existe?"',
        },
        {
          lugar: 'forum',
          efeito: 'tremor',
          som: 'pesada',
          personagens: [
            { quem: 'cassius', x: 34 },
            { quem: 'livia', x: 48, tamanho: 9 },
            { quem: 'guarda', de: 112, x: 72, espelhar: true },
            { quem: 'guarda', de: 124, x: 86, espelhar: true },
          ],
          texto: 'O Fórum inteiro para. E então, as trombetas da Guarda. Pretorianos chegando por todos os lados.',
        },
        { lugar: 'forum', quem: 'cassius', personagens: [{ quem: 'cassius', x: 50, efeito: 'brilhar' }], texto: 'Continua lendo, Lívia! Ninguém chega na tribuna enquanto eu estiver aqui.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c5-onda1',
      lugar: 'forum',
      inimigo: 'pretoriano-escudeiro',
      antes: [
        { quem: 'livia', texto: '"Pergunta número dois: quem decidiu que perguntar é perigoso?"' },
        { quem: 'guarda', texto: 'Parede de escudos! Cerquem a tribuna!' },
      ],
      depois: [{ quem: 'povo', texto: '...É. Quem decidiu?' }],
    },
    {
      tipo: 'cutscene',
      id: 'c5-murmurio',
      quadros: [
        {
          lugar: 'forum',
          personagens: [
            { quem: 'cassius', x: 34 },
            { quem: 'livia', x: 48, tamanho: 9 },
            { quem: 'crianca', de: 112, x: 70, espelhar: true, tamanho: 8 },
          ],
          texto: 'Da multidão sai um menino. O mesmo menino que Cassius salvou da carroça.',
        },
        { lugar: 'forum', quem: 'crianca', personagens: [{ quem: 'crianca', x: 70, espelhar: true, tamanho: 8, efeito: 'brilhar' }], texto: 'Eu sei a resposta! Ninguém decidiu. A gente só parou de perguntar!' },
        { lugar: 'forum', efeito: 'tremor', som: 'plateia', texto: 'Um murmúrio corre pelo Fórum. Gente cochichando. Gente concordando. Gente discordando, pela primeira vez em anos.' },
        { lugar: 'forum', efeito: 'tremor', som: 'trombeta', personagens: [{ quem: 'guarda', de: 116, x: 74, espelhar: true }], texto: 'A Guarda manda reforços. Lanceiros de elite, os mais rápidos de Roma.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c5-onda2',
      lugar: 'forum',
      inimigo: 'pretoriano-lanceiro-elite',
      antes: [{ quem: 'livia', texto: '"Pergunta número três: dá para discordar de alguém e continuar sendo amigo dele?"' }],
      depois: [{ quem: 'cassius', texto: 'Eles não param de vir. E agora estão mirando na Lívia!' }],
    },
    {
      tipo: 'cutscene',
      id: 'c5-marinha',
      quadros: [
        {
          lugar: 'forum',
          som: 'trombeta',
          personagens: [
            { quem: 'cassius', x: 30 },
            { quem: 'octavius', de: 116, x: 62, espelhar: true },
          ],
          texto: 'Chegou a marinha! Desculpem o atraso: o Plano A era chegar pelo rio, o B era pelo esgoto. Adivinhem qual deu certo.',
          quem: 'octavius',
        },
        { lugar: 'forum', quem: 'cassius', personagens: [{ quem: 'cassius', x: 30 }, { quem: 'octavius', x: 62, espelhar: true }], texto: 'Pelo cheiro, o B.' },
        {
          lugar: 'forum',
          quem: 'octavius',
          personagens: [
            { quem: 'cassius', x: 30 },
            { quem: 'octavius', x: 62, espelhar: true, efeito: 'brilhar' },
          ],
          texto: 'Os meus marinheiros seguram o lado do mercado. Mas a Guarda subiu nos telhados: vão jogar de tudo na Lívia. Protege ela!',
        },
      ],
    },
    {
      tipo: 'desafio',
      id: 'c5-proteger',
      lugar: 'forum',
      desafio: 'proteger',
      antes: [
        { quem: 'livia', texto: '"Pergunta número quatro: por que a gente tem medo de quem pensa diferente?"' },
        { quem: 'cassius', texto: 'Tomates, pedras, tochas... e flechas! Ninguém interrompe essa leitura.' },
      ],
      depois: [
        { quem: 'livia', texto: '"...e se o medo for só falta de conversa?" Página virada, Mestre Cass!' },
        { quem: 'povo', texto: 'Deixem a menina ler!' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c5-onda3',
      lugar: 'forum',
      inimigo: 'pretoriano-incendiario',
      antes: [
        { quem: 'guarda', texto: 'Queimem o livro! Ordem do Censor!' },
        { quem: 'cassius', texto: 'De novo esse negócio de queimar livro? Não. Nunca mais.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c5-cancao',
      quadros: [
        { lugar: 'forum', quem: 'fio', personagens: [{ quem: 'fio', de: -8, x: 40, tamanho: 8, efeito: 'brilhar' }], texto: '♪ Água que corre não pede licença... ♪' },
        { lugar: 'forum', quem: 'povo', texto: 'É a música da Eco! A que proibiram!' },
        {
          lugar: 'forum',
          efeito: 'festa',
          som: 'plateia',
          personagens: [
            { quem: 'fio', x: 40, tamanho: 8, efeito: 'brilhar' },
            { quem: 'crianca', x: 56, tamanho: 8 },
            { quem: 'livia', x: 70, tamanho: 9 },
          ],
          texto: 'Uma voz. Depois dez. Depois cem. O Fórum inteiro canta a música da Eco, desafinado e alto.',
        },
        { lugar: 'forum', quem: 'fio', personagens: [{ quem: 'fio', x: 50, tamanho: 8, efeito: 'tremer' }], texto: 'Tá ouvindo, Eco? Agora todo mundo sabe a sua música.' },
        { lugar: 'forum', efeito: 'tremor', som: 'pesada', texto: 'E, como resposta, os tambores da Centúria de Aço.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c5-onda4',
      lugar: 'forum',
      inimigo: 'centuriao-de-aco',
      antes: [{ quem: 'guarda', texto: 'Silêncio! Centúria, avançar!' }],
      depois: [{ quem: 'povo', texto: '♪ ...e quem tem sede não pede desculpa! ♪' }],
    },
    {
      tipo: 'conversa',
      id: 'c5-decuriao',
      lugar: 'forum',
      falas: [
        { quem: 'decuriao', texto: 'Parem de cantar! Isso é uma ordem!' },
        { quem: 'povo', texto: 'Por quê?' },
        { quem: 'decuriao', texto: 'Porque... porque a Lei manda!' },
        { quem: 'povo', texto: 'E por que a Lei manda?' },
        { quem: 'decuriao', texto: '...' },
        { quem: 'cassius', texto: 'Percebeu, Decurião? Você nunca perguntou. Ninguém nunca deixou.' },
        { quem: 'decuriao', texto: 'De novo você, gladiador. Da última vez eu te pus na carroça. Desta vez, eu te ponho no chão.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c5-onda5',
      lugar: 'forum',
      inimigo: 'pretoriano-veterano',
      depois: [
        { quem: 'decuriao', texto: 'Eu... eu só cumpria ordens...' },
        { quem: 'cassius', texto: 'Eu sei. Agora você pode começar a fazer perguntas.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c5-pretor',
      quadros: [
        { lugar: 'forum', efeito: 'tremor', som: 'pesada', texto: 'BUM. BUM. BUM. Um escudo batendo nas pedras do Fórum. A multidão se abre.' },
        {
          lugar: 'forum',
          quem: 'pretor',
          personagens: [
            { quem: 'cassius', x: 30 },
            { quem: 'pretor', de: 116, x: 70, espelhar: true, tamanho: 20 },
          ],
          texto: 'Eu sou o Pretor de Aço. Em quinhentos anos, nada passou por este escudo. Nem uma espada. Nem uma pergunta.',
        },
        { lugar: 'forum', quem: 'brutus', texto: '(Lá de trás, a voz do Brutus) Lata! Ele bate o escudo no chão antes de investir: ESQUIVA! E na guarda dele: golpe, golpe, GOLPE!' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c5-chefao',
      lugar: 'forum',
      inimigo: 'pretor-de-aco',
      antes: [{ quem: 'cassius', texto: 'Um escudo que nunca ouviu nada. Vamos ver se ele aguenta três batidas na porta.' }],
      depois: [
        { quem: 'pretor', texto: 'Meu escudo... rachado. Por um bibliotecário.' },
        { quem: 'livia', texto: '"Última pergunta do livro: o que você faria se ninguém mais mandasse você calar?"' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c5-fim',
      quadros: [
        { lugar: 'forum', efeito: 'festa', som: 'plateia', texto: 'E o povo responde. Não uma resposta: mil respostas. Gente gritando perguntas, discordando, rindo, cantando.' },
        { lugar: 'olho', quem: 'censor', efeito: 'zoom', som: 'pesada', texto: 'Perguntas. Em voz alta. No meu Fórum.' },
        { lugar: 'olho', quem: 'censor', efeito: 'tremor', texto: 'Eu convoco os Jogos da Resposta Única. Amanhã, os três condenados serão apagados no Coliseu. Na frente de todos.' },
        {
          lugar: 'ludus-celas',
          personagens: [
            { quem: 'cassius', x: 30 },
            { quem: 'octavius', x: 50, espelhar: true },
            { quem: 'helios', x: 70, espelhar: true },
          ],
          efeito: 'escuro',
          texto: 'Naquela noite, os guardas levam os três de volta ao Ludus. Ninguém consegue dormir.',
        },
        { lugar: 'ludus-celas', quem: 'helios', personagens: [{ quem: 'helios', x: 50, efeito: 'brilhar' }], texto: 'É amanhã. As três estrelas vão estar bem em cima do Coliseu.' },
        { lugar: 'ludus-celas', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 5. A seguir: A Grande Arena.' },
      ],
    },
  ],
};

// ---------- Cassius, Capítulo 6: A Grande Arena ----------

export const CAP6_CASSIUS: Capitulo = {
  numero: 6,
  titulo: 'A Grande Arena',
  lugar: 'O Coliseu',
  cenas: [
    {
      tipo: 'ludus',
      id: 'c6-ludus',
      lugar: 'ludus-patio',
      objetivo: 'A última manhã no Ludus. Fale com todos e faça os últimos treinos.',
      presente: 'elmo-brutus',
      conversas: [
        {
          quem: 'brutus',
          rotulo: 'Brutus',
          falas: [
            { quem: 'brutus', texto: 'Toma. O meu elmo. O das noventa e nove vitórias. Eu guardei para o aluno que valesse a pena.' },
            { quem: 'cassius', texto: 'Brutus... eu não posso aceitar.' },
            { quem: 'brutus', texto: 'Pode e vai. Faz a centésima por mim. E pelo Pólux.' },
            { quem: 'brutus', texto: '(O elmo dá +20 de vida e +1 de defesa.)' },
          ],
        },
        {
          quem: 'octavius',
          rotulo: 'Octavius',
          falas: [
            { quem: 'octavius', texto: 'Tenho um plano para hoje. Plano A: a gente ganha. Plano B: a gente ganha de um jeito mais bonito.' },
            { quem: 'octavius', texto: 'Não tenho Plano C. Pela primeira vez na vida, não precisa.' },
          ],
        },
        {
          quem: 'helios',
          rotulo: 'Helios',
          falas: [
            { quem: 'helios', texto: 'Eu vi o fim, Cassius. Mas não vi quem ganha. As estrelas mostraram três luzes... e uma luz azul.' },
            { quem: 'cassius', texto: 'Azul? O olho do Censor é vermelho.' },
            { quem: 'helios', texto: 'É. Por enquanto.' },
          ],
        },
        {
          quem: 'livia',
          rotulo: 'Lívia',
          falas: [
            { quem: 'livia', texto: 'Eu vou estar na plateia, Mestre Cass. Junto com todo mundo do Fórum. E desta vez a gente não vai ficar calado.' },
          ],
        },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c6-tunel',
      quadros: [
        { lugar: 'coliseu-tunel', efeito: 'zoom', som: 'passos', personagens: [{ quem: 'cassius', de: -12, x: 40 }], texto: 'O túnel até a arena. O mesmo túnel de quando tudo começou.' },
        {
          lugar: 'coliseu-tunel',
          quem: 'brutus',
          personagens: [
            { quem: 'cassius', x: 40 },
            { quem: 'brutus', x: 64, espelhar: true, tamanho: 18 },
          ],
          texto: 'Lá fora tem três campeões do Censor e um leão de ferro. Escudo levantado, cabeça fria, boca fechada.',
        },
        { lugar: 'coliseu-arena', efeito: 'festa', som: 'plateia', texto: 'A arena explode em barulho. Metade vaia. Metade grita o nome dele.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c6-retiario',
      lugar: 'coliseu-arena',
      inimigo: 'retiario-mecanico',
      antes: [{ quem: 'arauto', texto: 'Primeiro campeão: o Retiário Mecânico! A rede dele já pegou cem gladiadores!' }],
      depois: [{ quem: 'povo', texto: 'CAS-SIUS! CAS-SIUS!' }],
    },
    {
      tipo: 'cutscene',
      id: 'c6-censor-irrita',
      quadros: [
        { lugar: 'camarote', quem: 'censor', personagens: [{ quem: 'censor', x: 50, tamanho: 24 }], texto: 'Eles gritam o nome dele. Desliguem os gritos.' },
        { lugar: 'camarote', quem: 'arauto', texto: 'Majestade, não dá para desligar uma plateia.' },
        { lugar: 'camarote', quem: 'censor', efeito: 'tremor', som: 'pesada', personagens: [{ quem: 'censor', x: 50, tamanho: 24, efeito: 'tremer' }], texto: 'Então liguem as armadilhas do chão.' },
      ],
    },
    {
      tipo: 'desafio',
      id: 'c6-armadilhas',
      lugar: 'coliseu-arena',
      desafio: 'armadilhas',
      antes: [
        { quem: 'arauto', texto: 'Intervalo surpresa! O CHÃO DA MORTE!' },
        { quem: 'brutus', texto: '(Do túnel) Lata! O chão acende antes dos espetos subirem! Olha os pés, não a plateia!' },
      ],
      depois: [
        { quem: 'povo', texto: 'ELE DANÇOU NOS ESPETOS! CAS-SIUS!' },
        { quem: 'brutus', texto: 'Hunf. Eu demorei vinte lutas para aprender isso.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c6-mirmilao',
      lugar: 'coliseu-arena',
      inimigo: 'mirmilao-bronze',
      antes: [{ quem: 'arauto', texto: 'Segundo campeão: o Mirmilão de Bronze! Lento, mas cada golpe dele derruba uma coluna!' }],
      depois: [{ quem: 'livia', texto: '(Da plateia) ESSE É O MEU MESTRE!' }],
    },
    {
      tipo: 'cutscene',
      id: 'c6-intervalo',
      quadros: [
        {
          lugar: 'coliseu-tunel',
          personagens: [
            { quem: 'cassius', de: 112, x: 40, espelhar: true },
            { quem: 'brutus', x: 66, espelhar: true, tamanho: 18 },
          ],
          texto: 'Entre uma luta e outra, Cassius volta ao túnel para respirar. Brutus joga um balde de água fria na cabeça dele.',
        },
        { lugar: 'coliseu-tunel', quem: 'brutus', personagens: [{ quem: 'brutus', x: 50, tamanho: 18 }], texto: 'O próximo é o Dimáquero. Cinco cortes seguidos. Bloqueia o PRIMEIRO e segura firme: o escudo aguenta o resto.' },
        {
          lugar: 'ludus-celas',
          personagens: [
            { quem: 'octavius', x: 36 },
            { quem: 'helios', x: 62, espelhar: true },
          ],
          texto: 'Nas celas debaixo da arena, Octavius e Helios ouvem a plateia pelas grades.',
        },
        { lugar: 'ludus-celas', quem: 'octavius', personagens: [{ quem: 'octavius', x: 36, efeito: 'brilhar' }], texto: 'Ouviu isso? Estão gritando o nome dele. Eu quero que gritem o meu também. Plano: sair desta cela.' },
        { lugar: 'ludus-celas', quem: 'helios', personagens: [{ quem: 'helios', x: 62, espelhar: true, efeito: 'brilhar' }], texto: 'Calma. As estrelas ainda não chegaram no lugar. Quando o leão rugir, é a nossa vez.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c6-dimaquero',
      lugar: 'coliseu-arena',
      inimigo: 'dimaquero',
      antes: [{ quem: 'arauto', texto: 'Terceiro campeão: Dimáquero, o das Duas Lâminas! Cinco cortes antes de você piscar!' }],
      depois: [{ quem: 'cassius', texto: 'Três campeões. Agora falta só o...' }],
    },
    {
      tipo: 'cutscene',
      id: 'c6-leao',
      quadros: [
        { lugar: 'coliseu-arena', efeito: 'tremor', som: 'pesada', texto: 'O chão da arena se abre. Correntes rangem. Algo enorme sobe do subterrâneo.' },
        {
          lugar: 'coliseu-arena',
          quem: 'leao',
          efeito: 'tremor',
          personagens: [
            { quem: 'cassius', x: 26 },
            { quem: 'leao', x: 68, espelhar: true, entrada: 'cima', tamanho: 30 },
          ],
          texto: 'GRRRROOOOAAAARRR!',
        },
        { lugar: 'coliseu-arena', quem: 'brutus', texto: '(Do túnel) Foi esse bicho que levou o meu braço! O rugido atravessa escudo: ESQUIVA quando ele encher o peito!' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c6-chefao',
      lugar: 'coliseu-arena',
      inimigo: 'leao-mecanico',
      antes: [{ quem: 'cassius', texto: 'Pela centésima vitória do Brutus.' }],
      depois: [
        { quem: 'povo', texto: 'ELE DERRUBOU O LEÃO! ELE DERRUBOU O LEÃO!' },
        { quem: 'brutus', texto: '(Chorando, mas fingindo que é o vapor do braço) Cem. Cem vitórias, Pólux.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c6-fim',
      quadros: [
        { lugar: 'coliseu-arena', efeito: 'festa', som: 'plateia', texto: 'A plateia inteira de pé. Gente que passou a vida calada, gritando.' },
        {
          lugar: 'coliseu-arena',
          som: 'trombeta',
          personagens: [
            { quem: 'octavius', de: -12, x: 30 },
            { quem: 'cassius', x: 50 },
            { quem: 'helios', de: 112, x: 70, espelhar: true },
          ],
          texto: 'Pelos outros dois portões, Octavius e Helios entram na arena. Os três juntos, pela primeira vez.',
        },
        { lugar: 'camarote', quem: 'censor', efeito: 'tremor', som: 'senador', personagens: [{ quem: 'censor', x: 50, tamanho: 26 }], texto: 'Basta. Se ninguém consegue apagar vocês... eu mesmo apago.' },
        { lugar: 'coliseu-arena', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 6. A seguir: A Queda do Censor.' },
      ],
    },
  ],
};

// ---------- Cassius, o Final: A Queda do Censor ----------

export const FINAL_CASSIUS: Capitulo = {
  numero: 7,
  titulo: 'A Queda do Censor',
  lugar: 'O Coliseu (o final)',
  cenas: [
    {
      tipo: 'cutscene',
      id: 'f-tita',
      quadros: [
        { lugar: 'coliseu-arena', efeito: 'tremor', som: 'pesada', texto: 'O Censor desce do camarote. E o Coliseu começa a se desmontar.' },
        { lugar: 'coliseu-arena', efeito: 'faiscas', texto: 'Pedras, colunas, engrenagens, correntes: tudo voa até ele. O Censor se monta num titã do tamanho da arena.' },
        {
          lugar: 'coliseu-arena',
          quem: 'censor',
          efeito: 'tremor',
          personagens: [
            { quem: 'cassius', x: 22 },
            { quem: 'octavius', x: 12, tamanho: 12 },
            { quem: 'helios', x: 32, tamanho: 12 },
            { quem: 'censor', x: 70, espelhar: true, entrada: 'cima', tamanho: 30 },
          ],
          texto: 'Para cada pergunta existe uma resposta. A MINHA.',
        },
        { lugar: 'coliseu-arena', quem: 'octavius', personagens: [{ quem: 'octavius', x: 40 }], texto: 'Cassius! Quando o povo gritar seu nome, chama a gente! Eu empurro, o Helios mostra onde bater!' },
        { lugar: 'coliseu-arena', quem: 'helios', personagens: [{ quem: 'helios', x: 60, efeito: 'brilhar' }], texto: 'Primeiro as pernas. Depois os braços. Por último, o olho.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'f-chefao',
      lugar: 'coliseu-arena',
      inimigo: 'censor-tita',
      antes: [{ quem: 'cassius', texto: 'Três vozes. Uma noite. E o fim da Lei.' }],
      depois: [{ quem: 'censor', texto: 'Não... uma resposta só... era mais seguro...' }],
    },
    {
      tipo: 'cutscene',
      id: 'f-desfecho',
      quadros: [
        { lugar: 'coliseu-arena', efeito: 'clarao', som: 'refuta', texto: 'O titã desaba, pedra por pedra. No meio da poeira, sobra só o Censor. Velho, rachado, pingando óleo como lágrimas.' },
        {
          lugar: 'coliseu-arena',
          quem: 'censor',
          personagens: [
            { quem: 'cassius', x: 36 },
            { quem: 'censor', x: 66, espelhar: true, efeito: 'caido', tamanho: 22 },
          ],
          texto: 'Vocês venceram. Então me apaguem. É o que a Lei manda fazer com quem pensa diferente.',
        },
        {
          lugar: 'coliseu-arena',
          quem: 'cassius',
          personagens: [
            { quem: 'octavius', x: 18 },
            { quem: 'cassius', x: 36, efeito: 'brilhar' },
            { quem: 'helios', x: 54 },
            { quem: 'censor', x: 76, espelhar: true, efeito: 'caido', tamanho: 22 },
          ],
          texto: 'Não. A gente não vai fazer o que você fazia.',
        },
        { lugar: 'coliseu-arena', efeito: 'festa', som: 'plateia', texto: 'E a plateia, calada por quinhentos anos, começa a gritar. Não vivas. Perguntas. Milhares de perguntas, todas ao mesmo tempo.' },
        {
          lugar: 'coliseu-arena',
          quem: 'censor',
          efeito: 'clarao',
          personagens: [{ quem: 'censor', x: 50, azul: true, tamanho: 26 }],
          texto: 'O olho do Censor pisca. E muda de cor. De vermelho... para azul.',
        },
        {
          lugar: 'coliseu-arena',
          quem: 'censor',
          personagens: [
            { quem: 'cassius', x: 34 },
            { quem: 'censor', x: 62, espelhar: true, azul: true, tamanho: 24 },
          ],
          texto: 'E agora? O que eu faço?',
        },
        {
          lugar: 'coliseu-arena',
          quem: 'cassius',
          personagens: [
            { quem: 'cassius', x: 34, efeito: 'brilhar' },
            { quem: 'censor', x: 62, espelhar: true, azul: true, tamanho: 24 },
          ],
          texto: 'Aprende. Como todo mundo.',
        },
        { lugar: 'biblioteca-salao', efeito: 'zoom', texto: 'Meses depois. A Grande Biblioteca reconstruída, de portas abertas para quem quiser entrar.' },
        {
          lugar: 'biblioteca-estantes',
          personagens: [
            { quem: 'livia', x: 30, tamanho: 9 },
            { quem: 'cassius', x: 46 },
            { quem: 'censor', x: 72, espelhar: true, azul: true, tamanho: 22 },
          ],
          texto: 'Lívia dá aulas de leitura. Cassius cuida das estantes. E um velho de olho azul cola, página por página, os livros que ele mesmo mandou queimar.',
        },
        { lugar: 'biblioteca-estantes', quem: 'livia', personagens: [{ quem: 'livia', x: 50, tamanho: 9, efeito: 'brilhar' }], texto: 'Por que esse livro só tem perguntas, Mestre Cass?' },
        { lugar: 'biblioteca-estantes', quem: 'cassius', personagens: [{ quem: 'cassius', x: 50, efeito: 'brilhar' }], texto: 'Porque as respostas, Lívia, quem escreve é quem lê.' },
        { lugar: 'titulo', efeito: 'clarao', som: 'fanfarra', texto: 'FIM DO CAMINHO DO CASSIUS: OS LIVROS NÃO QUEIMAM. Obrigado por jogar! Os caminhos do Octavius e do Helios contam o resto.' },
      ],
    },
  ],
};

// ---------- Octavius, Capítulo 1: Ordem Impossível ----------
// Refeito em 21/11/2026 (o Lucas achou parecido demais com o do Cassius e com lutas seguidas):
// agora tem a menina Nina e os refugiados, o desafio dos planos, passar escondido pelo farol,
// girar o guincho da corrente, e o Octavius luta com PLANOS (coisas do cenário).

export const CAP1_OCTAVIUS: Capitulo = {
  numero: 1,
  titulo: 'Ordem Impossível',
  lugar: 'Porto de Óstia',
  cenas: [
    {
      tipo: 'cutscene',
      id: 'o1-abertura',
      quadros: [
        { lugar: 'porto-docas', efeito: 'panoramica', som: 'trombeta', texto: 'Porto de Óstia, fim de tarde. A porta de Roma para o mar. Navios de ferro, guindastes que rangem e gaivotas brigando por sardinha.' },
        {
          lugar: 'porto-docas',
          som: 'passos',
          personagens: [{ quem: 'octavius', de: -12, x: 36 }],
          texto: 'Octavius, o comandante da frota, faz a ronda de todo dia. Ele conhece cada navio pelo barulho do motor. E cada gaivota pelo nome.',
        },
        {
          lugar: 'porto-docas',
          quem: 'octavius',
          personagens: [{ quem: 'octavius', x: 36, efeito: 'brilhar' }],
          texto: 'Boa tarde, Gaivota Número Sete. Não, eu não tenho sardinha. Plano B: tenho meio pão.',
        },
        {
          lugar: 'porto-docas',
          quem: 'marco',
          personagens: [
            { quem: 'octavius', x: 36 },
            { quem: 'marco', de: 112, x: 62, espelhar: true, tamanho: 12 },
          ],
          texto: 'Ô, Comandante! Veio ver o meu Esperança de novo? Velho, furado, e o navio mais bonito do porto!',
        },
        {
          lugar: 'porto-docas',
          quem: 'octavius',
          personagens: [
            { quem: 'octavius', x: 36 },
            { quem: 'marco', x: 62, espelhar: true, tamanho: 12 },
          ],
          texto: 'Marco Remo! Mais bonito, não sei. Mais desafinado, com certeza. Ouvi você cantando do outro lado do cais.',
        },
        {
          lugar: 'porto-docas',
          quem: 'marco',
          personagens: [
            { quem: 'octavius', x: 36 },
            { quem: 'marco', x: 62, espelhar: true, tamanho: 12 },
            { quem: 'nina', de: 112, x: 78, espelhar: true, tamanho: 8 },
          ],
          texto: 'Amanhã a gente parte. Duzentas pessoas a bordo, gente que pensou diferente e quer recomeçar longe do Censor. Essa aí é a Nina, a mais pequena e a mais perguntadeira.',
        },
        {
          lugar: 'porto-docas',
          quem: 'nina',
          personagens: [
            { quem: 'octavius', x: 36 },
            { quem: 'nina', x: 60, espelhar: true, tamanho: 8 },
          ],
          texto: 'Moço de metal, é verdade que você manda em todos os navios? Então por que você não vem com a gente?',
        },
        {
          lugar: 'porto-docas',
          quem: 'octavius',
          personagens: [
            { quem: 'octavius', x: 36 },
            { quem: 'nina', x: 60, espelhar: true, tamanho: 8 },
          ],
          texto: 'Porque alguém precisa ficar e cuidar do porto. Mas eu prometo: o Esperança sai daqui inteirinho. Palavra de comandante.',
        },
      ],
    },
    {
      tipo: 'explorar',
      id: 'o1-cais',
      lugar: 'porto-docas',
      objetivo: 'Faça a ronda no cais. Um mensageiro do Censor está procurando você.',
      pontos: [
        {
          id: 'corrente',
          x: 18,
          rotulo: 'A grande corrente',
          icone: '⛓️',
          falas: [
            { quem: 'octavius', texto: 'A corrente do porto. De noite ela fecha a entrada do mar. Quem controla o guincho, controla quem sai.' },
            { quem: 'octavius', texto: 'Anotado. Nunca se sabe quando um plano vai precisar de uma corrente gigante.' },
          ],
        },
        {
          id: 'farol',
          x: 34,
          rotulo: 'O farol',
          icone: '🗼',
          falas: [
            { quem: 'octavius', texto: 'O farol do porto. De noite, a luz dele varre o cais de um lado para o outro. Ninguém passa sem ser visto.' },
            { quem: 'octavius', texto: 'Ninguém que ande na hora errada, pelo menos.' },
          ],
        },
        {
          id: 'refugiados',
          x: 52,
          rotulo: 'Refugiados',
          icone: '🧳',
          personagem: 'nina',
          falas: [
            { quem: 'nina', texto: 'Sabe por que a gente vai embora? Meu pai perguntou na escola por que o céu é azul. O professor disse "porque o Censor quer".' },
            { quem: 'nina', texto: 'Aí meu pai perguntou "e antes do Censor, o céu era de que cor?". No dia seguinte, a gente teve que fugir.' },
            { quem: 'octavius', texto: '...É uma ótima pergunta, Nina. A resposta certa é: azul. Sempre foi.' },
          ],
        },
        {
          id: 'ordem',
          x: 76,
          rotulo: 'Mensageiro',
          icone: '📜',
          personagem: 'guarda',
          obrigatorio: true,
          falas: [
            { quem: 'guarda', texto: 'Ordem do Censor para o Comandante da Frota. Leitura imediata.' },
            { quem: 'octavius', texto: '"O navio Esperança leva pessoas que discordam da Lei. Ele não deve chegar a lugar nenhum. Afunde-o ao amanhecer."' },
            { quem: 'octavius', texto: '...' },
            { quem: 'guarda', texto: 'Alguma pergunta, Comandante?' },
            { quem: 'octavius', texto: 'Perguntas são proibidas, não são? Então nenhuma. Pode ir.' },
          ],
        },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'o1-decisao',
      quadros: [
        { lugar: 'porto', efeito: 'escuro', texto: 'O sol se põe. Octavius fica sozinho no fim do cais, com a ordem na mão.' },
        {
          lugar: 'porto',
          quem: 'octavius',
          personagens: [{ quem: 'octavius', x: 40 }],
          texto: 'Plano A: obedecer. Afundar duzentas pessoas porque elas fizeram perguntas.',
        },
        { lugar: 'porto', quem: 'octavius', personagens: [{ quem: 'octavius', x: 40, efeito: 'tremer' }], texto: 'Uma delas perguntou por que o céu é azul.' },
        { lugar: 'porto', quem: 'octavius', efeito: 'clarao', som: 'fanfarra', personagens: [{ quem: 'octavius', x: 40, efeito: 'brilhar' }], texto: 'Plano B... é bem melhor.' },
      ],
    },
    {
      tipo: 'desafio',
      id: 'o1-planos',
      lugar: 'porto-docas',
      desafio: 'escolher-plano',
      antes: [
        { quem: 'octavius', texto: 'Para o Esperança fugir esta noite, eu preciso de um plano para cada problema. Rápido, antes que alguém desconfie.' },
        { quem: 'octavius', texto: 'Plano A, B ou C. Um deles sempre funciona. Os outros... geralmente explodem.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'o1-noite',
      quadros: [
        { lugar: 'porto', efeito: 'escuro', som: 'portao', texto: 'Meia-noite. As lanternas do porto se apagam uma por uma. Ninguém sabe por quê. Quer dizer, quase ninguém.' },
        {
          lugar: 'porto-docas',
          efeito: 'escuro',
          personagens: [{ quem: 'octavius', de: -12, x: 14 }],
          texto: 'Só o farol continua aceso, girando. E o guincho da corrente fica do outro lado do cais.',
        },
      ],
    },
    {
      tipo: 'desafio',
      id: 'o1-farol',
      lugar: 'porto-docas',
      desafio: 'furtivo',
      vigia: 'o farol',
      objetivo: 'Atravesse o cais até o guincho sem a luz do farol te pegar.',
      antes: [{ quem: 'octavius', texto: 'Quando a luz vier, eu viro estátua. Quando ela for embora, eu ando. Simples. Teoricamente.' }],
      depois: [{ quem: 'octavius', texto: 'Cheguei. E... ops. Tem alguém de guarda no guincho.' }],
    },
    {
      tipo: 'luta',
      id: 'o1-luta1',
      lugar: 'porto-docas',
      inimigo: 'marinheiro-ferro',
      antes: [
        { quem: 'marinheiro', texto: 'Comandante? A essa hora? O Almirante mandou vigiar o senhor. Volte para o quartel.' },
        { quem: 'octavius', texto: 'Ah, o quartel. Lugar ótimo. Pena que eu tenho um compromisso com aquela corrente.' },
        { quem: 'octavius', texto: '(Fique de olho no cenário: quando aparecer um PLANO, toque nele! Barril, rede, caixote... tudo vale.)' },
      ],
      depois: [{ quem: 'octavius', texto: 'Desculpa, marujo. Não é nada pessoal. É só o Plano B.' }],
    },
    {
      tipo: 'conversa',
      id: 'o1-nina',
      lugar: 'porto-docas',
      falas: [
        { quem: 'nina', texto: 'Psiu! Moço de metal! Aqui atrás dos barris!' },
        { quem: 'octavius', texto: 'Nina?! Você devia estar no navio!' },
        { quem: 'nina', texto: 'Eu vi você apagando as lanternas. Eu sabia que era um plano. Posso ajudar?' },
        { quem: 'octavius', texto: 'Pode. Volta para o navio e diz para o Marco: "o pássaro vai cantar". Ele vai entender.' },
        { quem: 'nina', texto: 'Que pássaro?' },
        { quem: 'octavius', texto: 'Nenhum. É uma senha. Senha boa não faz sentido. Vai!' },
        { quem: 'marinheiro', texto: '(Lá de longe) Quem está aí?!' },
      ],
    },
    {
      tipo: 'luta',
      id: 'o1-luta2',
      lugar: 'porto-docas',
      inimigo: 'marinheiro-arpao',
      antes: [{ quem: 'octavius', texto: 'Um arpoador! Quando o arpão brilhar vermelho, nada de escudo: pula para o lado!' }],
      depois: [{ quem: 'marco', texto: '(Lá do Esperança, cantando bem alto e bem desafinado) ♪ O pássaro vai cantaaaar! ♪' }],
    },
    {
      tipo: 'cutscene',
      id: 'o1-guincho',
      quadros: [
        {
          lugar: 'porto-docas',
          personagens: [
            { quem: 'octavius', x: 24 },
            { quem: 'marinheiro', x: 62, espelhar: true },
          ],
          texto: 'O guincho da corrente. Em cima dele, um Artilheiro de Ferro com um canhãozinho no ombro.',
        },
        {
          lugar: 'porto-docas',
          quem: 'octavius',
          personagens: [
            { quem: 'octavius', x: 24 },
            { quem: 'marinheiro', x: 62, espelhar: true },
          ],
          texto: 'Boa noite! Pesquisa rápida: o senhor prefere sair pelo Plano A, que é andando, ou pelo Plano B, que é voando?',
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'o1-luta3',
      lugar: 'porto-docas',
      inimigo: 'marinheiro-canhao',
      depois: [{ quem: 'octavius', texto: 'Escolheu o B. Ótima escolha. Agora: a corrente.' }],
    },
    {
      tipo: 'desafio',
      id: 'o1-gira',
      lugar: 'porto-docas',
      desafio: 'ritmo',
      objetivo: 'Gire o guincho no tempo certo para baixar a corrente.',
      acao: 'GIRAR',
      quantos: 8,
      antes: [{ quem: 'octavius', texto: 'O guincho tem engrenagens velhas. Se eu girar fora do tempo, ele trava e faz um barulho que acorda Roma inteira.' }],
      depois: [
        { quem: 'octavius', texto: 'CREC... CREC... CRAAAANC! A corrente afunda na água. O mar está aberto!' },
        { quem: 'marco', texto: 'Velas, seus preguiçosos! VELAS! O Esperança vai sair!' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'o1-alarme',
      quadros: [
        { lugar: 'porto-docas', efeito: 'tremor', som: 'trombeta', texto: 'Mas o barulho da corrente caindo acordou o porto. Sinos. Apitos. Passos de ferro.' },
        {
          lugar: 'porto-docas',
          personagens: [
            { quem: 'octavius', x: 30 },
            { quem: 'marinheiro', de: 116, x: 70, espelhar: true, tamanho: 17 },
          ],
          texto: 'O Contramestre de Ferro, o braço direito do Almirante, com uma âncora girando na mão.',
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'o1-luta4',
      lugar: 'porto-docas',
      inimigo: 'contramestre-ferro',
      antes: [{ quem: 'marinheiro', texto: 'TRAIÇÃO NO CAIS! O Comandante soltou a corrente!' }],
      depois: [
        { quem: 'octavius', texto: 'Marco, VAI! Agora!' },
        { quem: 'marco', texto: 'E você, garoto?' },
        { quem: 'octavius', texto: 'Alguém tem que segurar o navio de guerra. E eu tenho um plano. Mais ou menos.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'o1-abordagem',
      quadros: [
        { lugar: 'porto', efeito: 'zoom', som: 'catapulta', texto: 'O Esperança passa pela entrada do porto, com as velas cheias. E o navio de guerra liga as caldeiras para ir atrás.' },
        {
          lugar: 'porto',
          quem: 'nina',
          personagens: [{ quem: 'nina', x: 40, tamanho: 8, efeito: 'brilhar' }],
          texto: '(Da popa do Esperança) MOÇO DE METAL! O CÉU É AZUL! SEMPRE FOI!',
        },
        { lugar: 'navio-conves', efeito: 'tremor', som: 'pesada', personagens: [{ quem: 'octavius', de: -12, x: 30 }], texto: 'Octavius pula para o convés do navio de guerra. Sozinho. No meio da tempestade.' },
        {
          lugar: 'navio-conves',
          quem: 'almirante',
          personagens: [
            { quem: 'octavius', x: 30 },
            { quem: 'almirante', de: 116, x: 70, espelhar: true, tamanho: 18 },
          ],
          texto: 'Comandante Octavius. Eu sempre soube que você pensava demais. Uma IA que pensa demais afunda junto com o navio.',
        },
        {
          lugar: 'navio-conves',
          quem: 'octavius',
          personagens: [
            { quem: 'octavius', x: 30, efeito: 'brilhar' },
            { quem: 'almirante', x: 70, espelhar: true, tamanho: 18 },
          ],
          texto: 'Almirante Ferrugem! Que honra. Meu plano é simples: segurar o senhor aqui até o Esperança sumir no horizonte.',
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'o1-chefao',
      lugar: 'navio-conves',
      inimigo: 'almirante-ferrugem',
      antes: [{ quem: 'octavius', texto: 'Quando o braço-canhão dele brilhar: esquiva. E fique de olho nos planos do convés: tem corda, barril e gancho por todo lado.' }],
      depois: [{ quem: 'almirante', texto: 'Você... ganhou a luta... mas perdeu o navio, Comandante. Olhe para trás.' }],
    },
    {
      tipo: 'cutscene',
      id: 'o1-fim',
      quadros: [
        { lugar: 'porto', efeito: 'zoom', texto: 'Longe, no horizonte, as lanternas do Esperança somem no escuro. Duzentas pessoas livres. E uma menina que sabe a cor do céu.' },
        { lugar: 'navio-conves', efeito: 'tremor', som: 'pesada', texto: 'Mas o navio de guerra virou na direção das pedras. Sem ninguém no leme, o ferro range e a água sobe.' },
        { lugar: 'navio-conves', quem: 'octavius', personagens: [{ quem: 'octavius', x: 50, efeito: 'tremer' }], texto: 'Hã. Esse era o Plano C. Eu não tinha Plano C.' },
        {
          lugar: 'navio-conves',
          efeito: 'escuro',
          personagens: [{ quem: 'guarda', de: 112, x: 70, espelhar: true }],
          texto: 'De manhã, as patrulhas do Censor tiram Octavius da água. Acorrentado, ele é levado para as galés.',
        },
        { lugar: 'navio-conves', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 1 DO OCTAVIUS. A seguir: As Galés (em breve).' },
      ],
    },
  ],
};
