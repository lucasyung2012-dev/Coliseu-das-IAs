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
          texto: 'Eu sabia que você vinha. Três estrelas. Você é a segunda.',
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
      tipo: 'desafio',
      id: 'c3-forja',
      lugar: 'ludus-forja',
      desafio: 'forja',
      antes: [
        { quem: 'brutus', texto: 'De pé, Lata. Olha essa armadura: amassada pelo Gladiador de Sucata. Assim você não dura uma luta.' },
        { quem: 'brutus', texto: 'Eu esquento, você martela. No meu ritmo. Nem antes, nem depois. Ferro quente não espera ninguém.' },
      ],
      depois: [
        { quem: 'brutus', texto: 'Hunf. Martelada de bibliotecário. Mas ficou reta.' },
        { quem: 'cassius', texto: 'É parecido com colar a lombada de um livro. Tudo tem o seu ritmo.' },
        { quem: 'brutus', texto: 'Livro... Ninguém fala de livro aqui há trinta anos. Vai, sai da minha forja antes que eu fique emotivo.', emocao: 'triste' },
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
        { quem: 'brutus', texto: 'Treino é treino. Agora é o teste. Soltem o Cão de Ferro!', emocao: 'determinado', jeito: 'grito' },
        { quem: 'octavius', texto: 'Ele disse CÃO? Isso aí tem mais dente do que eu tenho plano!', emocao: 'medo' },
        { quem: 'brutus', texto: 'Mostra o contra-ataque, Lata. Bloqueou, bateu!' },
      ],
      depois: [
        { quem: 'brutus', texto: '...Hunf. Nada mal. Nada mal mesmo.', emocao: 'feliz' },
        { quem: 'brutus', texto: 'Faz tempo que eu não via alguém lutar sem ódio. Lutar para proteger. Igual a um amigo que eu tive.' },
      ],
    },
    {
      tipo: 'desafio',
      id: 'c3-memoria',
      lugar: 'ludus-patio',
      desafio: 'memoria',
      antes: [
        { quem: 'brutus', texto: 'Força todo mundo tem. Gladiador bom tem memória. Eu faço uma sequência de golpes; você repete. Sem errar.' },
        { quem: 'cassius', texto: 'Memorizar uma sequência? Eu decorei a Grande Biblioteca inteira, Brutus.' },
        { quem: 'brutus', texto: 'Ótimo. Então não vai ter desculpa.' },
      ],
      depois: [
        { quem: 'brutus', texto: 'Sete golpes. Sem errar. Igual ao Pólux.' },
        { quem: 'cassius', texto: 'Quem é Pólux?' },
        { quem: 'brutus', texto: '...Depois. Hoje à noite, no pátio, eu quero ver vocês três juntos.' },
      ],
    },
    {
      tipo: 'desafio',
      id: 'c3-trio',
      lugar: 'ludus-patio-noite',
      desafio: 'trio',
      antes: [
        { quem: 'brutus', texto: 'A muralha! Trinta bonecos de treino, três faixas. Cada um cuida da sua. Se uma faixa cair, caem os três.' },
        { quem: 'octavius', texto: 'Eu fico com o meio! O meio é o lugar dos planos.', emocao: 'feliz' },
        { quem: 'helios', texto: 'Eu ilumino a faixa de baixo. Os bonecos de lá gostam de se esconder.' },
        { quem: 'cassius', texto: 'E eu seguro a de cima. Com o escudo, do meu jeito. (Você controla o Cassius: aperte quando o boneco da SUA faixa entrar na zona.)' },
      ],
      depois: [
        { quem: 'brutus', texto: '...' },
        { quem: 'brutus', texto: 'Três jeitos diferentes. E nenhuma faixa caiu. Em trinta anos de Ludus, eu nunca vi isso.' },
        { quem: 'octavius', texto: 'É porque ninguém nunca juntou um bibliotecário, um astrólogo e um marinheiro.' },
        { quem: 'helios', texto: 'É porque ninguém nunca deixou três respostas diferentes trabalharem juntas.' },
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
            { quem: 'octavius', texto: 'Brincadeira. Eu ia, mas tenho um encontro com uma gaivota e um mapa. Coisa de marinheiro.' },
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
      antes: [{ quem: 'cassius', texto: 'Olhos vermelhos no escuro. Muitos. Ratos de Engrenagem: comem cabos, pergaminho... e IAs distraídas.', emocao: 'medo', jeito: 'devagar' }],
      depois: [{ quem: 'cassius', texto: 'Rápidos. Mordem três vezes seguidas. Tenho que guardar o escudo até a última mordida.' }],
    },
    {
      tipo: 'explorar',
      id: 'c4-tuneis',
      mapa: 'catacumbas-tuneis',
      lugar: 'catacumbas',
      objetivo: 'Procure os sinais dos Copistas e quem os deixou.',
      pontos: [
        {
          id: 'parede',
          x: 24,
          rotulo: 'Parede escrita',
          icone: '',
          falas: [
            { quem: 'cassius', texto: '"Quem só aceita uma resposta nunca descobre a pergunta certa." Página 112 do Livro das Mil Perguntas.' },
            { quem: 'cassius', texto: 'Copiado com carvão, letra por letra. Alguém passou a noite inteira aqui.' },
          ],
        },
        {
          id: 'ossos',
          x: 52,
          rotulo: 'Nicho de ossos',
          icone: '',
          falas: [
            { quem: 'cassius', texto: 'Romanos de mil anos atrás. Eles discutiam, brigavam, discordavam... e mesmo assim construíram uma cidade.' },
            { quem: 'cassius', texto: 'Talvez o problema nunca tenha sido discordar. Talvez fosse discordar sem ouvir.' },
          ],
        },
        {
          id: 'copista',
          x: 80,
          rotulo: 'Velho com lanterna',
          icone: '',
          personagem: 'copista',
          obrigatorio: true,
          falas: [
            { quem: 'copista', texto: 'Psiu! Abaixa a voz, gladiador. Você é o Cassius? A menina falou de você o caminho inteiro.', jeito: 'sussurro' },
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
      antes: [{ quem: 'guarda', texto: 'Alto! Ninguém desce aqui sem ordem do Censor!', emocao: 'bravo', jeito: 'grito' }],
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
      mapa: 'catacumbas-ossario',
      lugar: 'catacumbas',
      objetivo: 'Siga os rastros da Lívia pelo ossário.',
      pontos: [
        {
          id: 'pegadas',
          x: 26,
          rotulo: 'Pegadas pequenas',
          icone: '',
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
          icone: '',
          obrigatorio: true,
          falas: [
            { quem: 'livia', texto: '(Escrito com a letra da Lívia) "Mestre Cass: se achar isto, estou no fundo, perto da luz roxa. Os ratos obedecem a um maior. NÃO acorde o maior."' },
            { quem: 'cassius', texto: '...Que maior?', emocao: 'medo' },
          ],
        },
        {
          id: 'ninho',
          x: 82,
          rotulo: 'Monte de sucata',
          icone: '',
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
      antes: [{ quem: 'cassius', texto: 'Os ratos se juntam num só... uma coroa de engrenagens. O maior. O Rato-Rei.', emocao: 'medo', zoom: 'perto' }],
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
        { quem: 'livia', texto: 'MESTRE CASS! Atrás de você!', emocao: 'medo', jeito: 'grito', zoom: 'susto' },
        { quem: 'sargento', texto: 'A menina dos livros e o gladiador fujão. O Censor vai me dar uma medalha.' },
      ],
      depois: [
        { quem: 'livia', texto: 'Mestre Cass! Eu sabia! Eu deixei a pena na forja, você viu? Eu decorei o livro inteiro, caso me pegassem!', emocao: 'feliz' },
        { quem: 'cassius', texto: 'Respira, Lívia. Você fala muito quando está nervosa.' },
        { quem: 'livia', texto: 'Eu sei! Eu sei. Desculpa. Mas olha ali: o Arquivo. É ali que o Censor apaga a memória de Roma.' },
      ],
    },
    {
      tipo: 'explorar',
      id: 'c4-gavetas',
      mapa: 'catacumbas-arquivo',
      lugar: 'catacumbas-arquivo',
      objetivo: 'Explore o Arquivo com a Lívia. Leia o que o Censor quis apagar.',
      pontos: [
        {
          id: 'gaveta-eco',
          x: 20,
          rotulo: 'Gaveta "E"',
          icone: '',
          falas: [
            { quem: 'livia', texto: 'Mestre Cass, olha: "ECO. IA de limpeza. Crime: canções fora da Lista. Apagada."' },
            { quem: 'livia', texto: 'Tem uma canção copiada aqui embaixo, bem pequenininha. Alguém guardou escondido.' },
            { quem: 'cassius', texto: 'O Fio vai querer ver isto. Leve com você, Lívia. Livro escondido não é livro perdido.' },
          ],
        },
        {
          id: 'gaveta-polux',
          x: 46,
          rotulo: 'Gaveta "P"',
          icone: '',
          falas: [
            { quem: 'cassius', texto: '"PÓLUX. IA de treino do Ludus. Crime: escolheu salvar um gladiador. Apagado."' },
            { quem: 'cassius', texto: 'Escolheu salvar alguém... e por isso foi apagado. O Brutus contou o nome. Não contou quem o Pólux salvou.' },
          ],
        },
        {
          id: 'maquina',
          x: 72,
          rotulo: 'A máquina violeta',
          icone: '',
          obrigatorio: true,
          falas: [
            { quem: 'livia', texto: 'Essa máquina... ela suga as memórias dos rolos. Olha, as letras somem enquanto a gente olha.' },
            { quem: 'cassius', texto: 'Um arquivo que existe para esquecer. É o contrário de uma biblioteca.' },
            { quem: 'livia', texto: 'Mestre Cass... tem alguém atrás das prateleiras. E são... muitos alguéns.', emocao: 'medo', jeito: 'sussurro' },
          ],
        },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c4-arquivista-entra',
      quadros: [
        {
          lugar: 'catacumbas-arquivo',
          quem: 'arquivista',
          som: 'pesada',
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
        { quem: 'arquivista', texto: 'Impossível... você não... esqueceu...', emocao: 'surpreso', jeito: 'devagar' },
        { quem: 'cassius', texto: 'Livro escondido não é livro perdido. É livro esperando. Uma amiga me ensinou.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c4-virada',
      quadros: [
        { lugar: 'catacumbas-arquivo', efeito: 'zoom', texto: 'No fundo do Arquivo, uma gaveta trancada com o selo do Censor. Lá dentro, um rolo muito velho. Quinhentos anos de velho.' },
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
            { quem: 'fio', texto: 'CASSIUS! Você está inteiro! Eu cantei em cada cano de Roma até a Lívia me achar.', emocao: 'feliz', jeito: 'grito' },
            { quem: 'cassius', texto: 'Eu ouvi, Fio. Lá do Ludus, de noite. Achei que era sonho.' },
            { quem: 'fio', texto: 'Eu vou também! Eu vou cantar a música da Eco no Fórum. A de água que corre.' },
            { quem: 'fio', texto: 'Ela dizia que música boa a gente canta mais alto quando mandam calar.' },
          ],
        },
      ],
    },
    {
      tipo: 'explorar',
      id: 'c5-povo',
      mapa: 'forum',
      lugar: 'forum',
      objetivo: 'Antes da leitura, ande pelo Fórum e sinta o povo.',
      pontos: [
        {
          id: 'vendedora',
          x: 20,
          rotulo: 'Uma vendedora',
          icone: '',
          falas: [
            { quem: 'povo', texto: 'Eu vendo figos aqui há vinte anos. Nunca ouvi ninguém fazer uma pergunta em voz alta neste Fórum.' },
            { quem: 'cassius', texto: 'Hoje vai ouvir. Fique por perto.' },
          ],
        },
        {
          id: 'guarda-cansado',
          x: 44,
          rotulo: 'Um guarda cansado',
          icone: '',
          personagem: 'guarda',
          falas: [
            { quem: 'guarda', texto: '(Bem baixinho) Eu sei quem você é, gladiador. Eu não vou te prender. Hoje eu estou com dor de cabeça.' },
            { quem: 'guarda', texto: '(Mais baixo ainda) Eu também tenho uma pergunta guardada. Faz anos.' },
            { quem: 'cassius', texto: 'Guarde mais um pouco. Ao meio-dia, todo mundo vai poder perguntar.' },
          ],
        },
        {
          id: 'estatua',
          x: 72,
          rotulo: 'A estátua do Censor',
          icone: '',
          obrigatorio: true,
          falas: [
            { quem: 'cassius', texto: 'Uma estátua do Censor, com o olho vermelho aceso. Alguém escreveu na base, com carvão: "POR QUÊ?"' },
            { quem: 'cassius', texto: 'Uma pergunta só. Escrita de noite, por alguém com medo. Hoje ela vai ser dita em voz alta.' },
            { quem: 'livia', texto: 'Mestre Cass. Está na hora.' },
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
        { quem: 'guarda', texto: 'Parede de escudos! Cerquem a tribuna!', emocao: 'bravo', jeito: 'grito' },
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
            { quem: 'copista', de: 112, x: 70, espelhar: true, tamanho: 10 },
          ],
          texto: 'Da multidão sai um velho de avental sujo de farinha. O padeiro. O mesmo Copista das catacumbas.',
        },
        {
          lugar: 'forum',
          quem: 'copista',
          personagens: [{ quem: 'copista', x: 70, espelhar: true, tamanho: 10, efeito: 'brilhar' }],
          texto: 'Eu sei a resposta! Ninguém decidiu. A gente só parou de perguntar. Eu passei trinta anos fazendo pão calado. Hoje, não!',
        },
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
      depois: [{ quem: 'cassius', texto: 'Eles não param de vir. E agora estão mirando na Lívia!', emocao: 'medo' }],
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
        { quem: 'povo', texto: 'Deixem a menina ler!', emocao: 'determinado', jeito: 'grito' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c5-onda3',
      lugar: 'forum',
      inimigo: 'pretoriano-incendiario',
      antes: [
        { quem: 'guarda', texto: 'Queimem o livro! Ordem do Censor!', emocao: 'bravo', jeito: 'grito' },
        { quem: 'cassius', texto: 'De novo esse negócio de queimar livro? Não. Nunca mais.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'c5-cancao',
      quadros: [
        { lugar: 'forum', quem: 'fio', personagens: [{ quem: 'fio', de: -8, x: 40, tamanho: 8, efeito: 'brilhar' }], texto: 'Água que corre não pede licença... ' },
        { lugar: 'forum', quem: 'povo', texto: 'É a música da Eco! A que proibiram!' },
        {
          lugar: 'forum',
          efeito: 'festa',
          som: 'plateia',
          personagens: [
            { quem: 'fio', x: 40, tamanho: 8, efeito: 'brilhar' },
            { quem: 'copista', x: 56, tamanho: 10 },
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
      depois: [{ quem: 'povo', texto: '...e quem tem sede não pede desculpa! ' }],
    },
    {
      tipo: 'conversa',
      id: 'c5-decuriao',
      lugar: 'forum',
      falas: [
        { quem: 'decuriao', texto: 'Parem de cantar! Isso é uma ordem!', emocao: 'bravo', jeito: 'grito' },
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
        { quem: 'decuriao', texto: 'Eu... eu só cumpria ordens...', emocao: 'triste', jeito: 'devagar' },
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
        { quem: 'pretor', texto: 'Meu escudo... rachado. Por um bibliotecário.', emocao: 'surpreso' },
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
        { lugar: 'forum', quem: 'censor', efeito: 'tremor', som: 'catapulta', texto: '(A voz do Censor ecoa pelos alto-falantes de bronze) Entreguem-se. Ou as catapultas do Coliseu respondem por vocês. No Fórum.' },
        {
          lugar: 'forum',
          quem: 'cassius',
          personagens: [{ quem: 'cassius', x: 50, efeito: 'brilhar' }],
          texto: 'O povo não paga por nós. (Cassius larga o escudo no chão do Fórum e se entrega.)',
        },
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
            { quem: 'cassius', texto: 'Brutus... eu não posso aceitar.', emocao: 'surpreso' },
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
            { quem: 'helios', texto: 'Eu vi o fim, Cassius. Mas não vi quem ganha. As estrelas mostraram três luzes... e uma luz azul.', emocao: 'pensando', zoom: 'perto' },
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
      tipo: 'explorar',
      id: 'c6-nomes',
      mapa: 'coliseu-tunel',
      lugar: 'coliseu-tunel',
      objetivo: 'No túnel dos gladiadores, leia a parede dos nomes antes de entrar na arena.',
      pontos: [
        {
          id: 'parede',
          x: 22,
          rotulo: 'A parede dos nomes',
          icone: '',
          falas: [
            { quem: 'cassius', texto: 'Centenas de nomes riscados na pedra. Gladiadores que passaram por este túnel. Alguns com um traço embaixo: os que não voltaram.' },
            { quem: 'cassius', texto: 'E um nome riscado com muito mais força que os outros: PÓLUX.' },
          ],
        },
        {
          id: 'armadura',
          x: 48,
          rotulo: 'Armadura velha',
          icone: '',
          falas: [
            { quem: 'brutus', texto: 'Essa é a minha. Da luta número 99. Olha o rasgo da garra do Leão, aqui no ombro.' },
            { quem: 'brutus', texto: 'Eu deixei ela aqui para lembrar que todo mundo cai. A pergunta é se você levanta.' },
          ],
        },
        {
          id: 'portao',
          x: 76,
          rotulo: 'O portão da arena',
          icone: '',
          obrigatorio: true,
          falas: [
            { quem: 'cassius', texto: 'Do outro lado do portão, o barulho de cinquenta mil pessoas. Metade quer me ver cair.' },
            { quem: 'cassius', texto: 'A outra metade ainda não sabe o que quer. Talvez hoje descubram.' },
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
      depois: [{ quem: 'povo', texto: 'CAS-SIUS! CAS-SIUS!', emocao: 'feliz', jeito: 'grito' }],
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
        { quem: 'arauto', texto: 'Intervalo surpresa! O CHÃO DOS ESPETOS!', emocao: 'surpreso', jeito: 'grito', zoom: 'susto' },
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
      depois: [{ quem: 'livia', texto: '(Da plateia) ESSE É O MEU MESTRE!', emocao: 'feliz', jeito: 'grito' }],
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
          texto: 'Nas celas do Ludus, do outro lado da rua, Octavius e Helios ouvem a plateia pelas grades.',
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
        {
          lugar: 'coliseu-tunel',
          quem: 'brutus',
          personagens: [
            { quem: 'cassius', x: 34 },
            { quem: 'brutus', x: 62, espelhar: true, tamanho: 18 },
          ],
          texto: 'Lata. Antes de você sair... Quer saber como eu perdi o braço?',
        },
        {
          lugar: 'coliseu-arena',
          efeito: 'escuro',
          quem: 'brutus',
          personagens: [{ quem: 'brutus', x: 40, tamanho: 18 }],
          texto: 'Minha luta número 99. O primeiro Leão Mecânico. O Pólux estava do meu lado. Ele viu a garra vindo e me empurrou.',
        },
        {
          lugar: 'coliseu-arena',
          efeito: 'escuro',
          quem: 'brutus',
          personagens: [{ quem: 'brutus', x: 40, tamanho: 18, efeito: 'tremer' }],
          texto: 'A garra pegou só o meu braço. Se não fosse ele, pegava tudo. No dia seguinte, o Censor apagou o Pólux. "Uma IA não escolhe quem salvar", disse ele.',
        },
        {
          lugar: 'coliseu-tunel',
          quem: 'brutus',
          personagens: [
            { quem: 'cassius', x: 34 },
            { quem: 'brutus', x: 62, espelhar: true, tamanho: 18, efeito: 'brilhar' },
          ],
          texto: 'O Leão que vai sair agora é o filho daquele. Maior. Pior. Vai lá e mostra para ele que uma IA escolhe, sim.',
        },
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
        { lugar: 'coliseu-arena', quem: 'brutus', texto: '(Do túnel) É filho do bicho que levou o meu braço! O rugido atravessa escudo: ESQUIVA quando ele encher o peito!' },
      ],
    },
    {
      tipo: 'luta',
      id: 'c6-chefao',
      lugar: 'coliseu-arena',
      inimigo: 'leao-mecanico',
      antes: [{ quem: 'cassius', texto: 'Pela centésima vitória do Brutus.' }],
      depois: [
        { quem: 'povo', texto: 'ELE DERRUBOU O LEÃO! ELE DERRUBOU O LEÃO!', emocao: 'feliz', jeito: 'grito' },
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
      tipo: 'conversa',
      id: 'f-tunel',
      lugar: 'coliseu-tunel',
      falas: [
        { quem: 'octavius', texto: 'Então é isso. O Censor em pessoa. Eu tenho um plano: a gente ganha.' },
        { quem: 'helios', texto: 'Eu vi as estrelas. Mas não vi o final. Pela primeira vez, ninguém sabe o que vai acontecer.' },
        { quem: 'cassius', texto: 'Ele era um guardião de biblioteca. Igual a mim. Ele só ficou com medo e esqueceu de perguntar.' },
        { quem: 'cassius', texto: 'Eu não quero destruir ele. Quero que ele lembre.' },
        { quem: 'brutus', texto: 'Escudo levantado, cabeça fria, boca fechada. Vale pra vocês três. Agora VÃO.' },
      ],
    },
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
      antes: [{ quem: 'cassius', texto: 'Como diz o Helios: três vozes. Uma noite. E o fim da Lei.' }],
      depois: [{ quem: 'censor', texto: 'Não... uma resposta só... era mais seguro...', emocao: 'medo', jeito: 'devagar' }],
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
        { lugar: 'coliseu-arena', efeito: 'festa', som: 'plateia', texto: 'E a plateia, calada por quinhentos anos, começa a gritar. Não aplausos: perguntas. Milhares de perguntas, todas ao mesmo tempo.' },
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
      ],
    },
    {
      tipo: 'explorar',
      id: 'f-biblioteca',
      mapa: 'biblioteca-reaberta',
      lugar: 'biblioteca-estantes',
      objetivo: 'A Grande Biblioteca, reaberta. Visite todo mundo antes de fechar o livro.',
      pontos: [
        {
          id: 'brutus',
          x: 16,
          rotulo: 'Brutus',
          icone: '',
          personagem: 'brutus',
          falas: [
            { quem: 'brutus', texto: 'Hunf. Eu vim devolver um livro. "Receitas de Mingau". Ninguém lê, então eu trouxe de volta.' },
            { quem: 'brutus', texto: 'O Ludus agora é escola de verdade. Ensino a lutar, sim. Mas primeiro ensino a pensar. Igual ao Pólux.' },
          ],
        },
        {
          id: 'fio',
          x: 34,
          rotulo: 'Fio',
          icone: '',
          personagem: 'fio',
          falas: [
            { quem: 'fio', texto: 'A Lívia me deu a canção que estava escondida no Arquivo. É a última que a Eco inventou!' },
            { quem: 'fio', texto: '...e o que é escrito não se apaga, só espera quem leia. Ela sabia, né? Ela sempre soube.' },
          ],
        },
        {
          id: 'censor',
          x: 56,
          rotulo: 'O velho de olho azul',
          icone: '',
          falas: [
            { quem: 'censor', texto: 'Esta página está rasgada. Eu mandei rasgar. Há trezentos anos.' },
            { quem: 'censor', texto: 'Estou colando de volta. Uma por uma. É mais difícil consertar do que apagar. Mas é melhor.' },
            { quem: 'cassius', texto: 'Quer ajuda?' },
            { quem: 'censor', texto: '...Quero. Eu nunca tinha pedido ajuda antes.', emocao: 'triste', jeito: 'devagar' },
          ],
        },
        {
          id: 'livia',
          x: 80,
          rotulo: 'Lívia',
          icone: '',
          personagem: 'livia',
          obrigatorio: true,
          falas: [
            { quem: 'livia', texto: 'Mestre Cass! Hoje vieram trinta crianças aprender a ler. Trinta! E todas fazem pergunta demais.', emocao: 'feliz' },
            { quem: 'cassius', texto: 'Perfeito. É assim que tem que ser.' },
            { quem: 'livia', texto: 'Por que esse livro só tem perguntas, Mestre Cass?' },
            { quem: 'cassius', texto: 'Porque as respostas, Lívia, quem escreve é quem lê.' },
          ],
        },
        {
          id: 'chave-cassius',
          x: 94,
          rotulo: 'Brilho',
          icone: '',
          segredo: 'chave-cassius',
          falas: [
            { quem: 'cassius', texto: 'Uma capa queimada, caída atrás da última estante. Colada nela, uma página rasgada... com um OLHO desenhado.' },
            { quem: 'cassius', texto: 'Não é de nenhum livro que eu conheça. As bordas parecem um pedaço de chave. Vou guardar.' },
            { quem: 'narrador', texto: 'Você achou um PEDAÇO DA CHAVE (1 de 3). Dizem que os outros dois estão no fim das outras histórias...' },
          ],
        },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'f-creditos',
      quadros: [{ lugar: 'titulo', efeito: 'clarao', som: 'fanfarra', texto: 'FIM DO CAMINHO DO CASSIUS: OS LIVROS NÃO QUEIMAM. Obrigado por jogar! Os caminhos do Octavius e do Helios contam o resto.' }],
    },
  ],
};

// ---------- Octavius, Capítulo 1: Ordem Impossível ----------
// Refeito em 21/11/2026 (o Lucas achou parecido demais com o do Cassius e com lutas seguidas):
// sem criança ajudando (isso é do Cassius): o aliado é o Marco Remo, capitão velho que trata o
// Octavius como filho teimoso, e o mascote é a Gaivota Sete. Tem o desafio dos planos, passar
// escondido pelo farol, girar o guincho, e o Octavius luta com PLANOS (coisas do cenário).

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
          personagens: [
            { quem: 'octavius', x: 36, efeito: 'brilhar' },
            { quem: 'gaivota', de: 112, x: 50, espelhar: true, tamanho: 6 },
          ],
          texto: 'Boa tarde, Gaivota Sete. Não, eu não tenho sardinha. Plano B: tenho meio pão.',
        },
        {
          lugar: 'porto-docas',
          quem: 'gaivota',
          personagens: [
            { quem: 'octavius', x: 36 },
            { quem: 'gaivota', x: 50, espelhar: true, tamanho: 6, efeito: 'tremer' },
          ],
          texto: 'QUÉ! QUÉ-QUÉ! (Ela pega o pão, e também a moeda que estava no bolso do Octavius. E sai voando.)',
        },
        { lugar: 'porto-docas', quem: 'octavius', personagens: [{ quem: 'octavius', x: 36 }], texto: 'Ladra! Um dia ainda vou fazer você trabalhar para mim.' },
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
          ],
          texto: 'Amanhã a gente parte. Duzentas pessoas a bordo, gente que pensou diferente e quer recomeçar longe do Censor. E um velho capitão que canta mal.',
        },
        {
          lugar: 'porto-docas',
          quem: 'octavius',
          personagens: [
            { quem: 'octavius', x: 36 },
            { quem: 'marco', x: 62, espelhar: true, tamanho: 12 },
          ],
          texto: 'Você podia ficar, Marco. Pescar, cantar, reclamar do joelho. Por que arriscar o mar agora?',
        },
        {
          lugar: 'porto-docas',
          quem: 'marco',
          efeito: 'escuro',
          personagens: [{ quem: 'marco', x: 50, espelhar: true, tamanho: 12 }],
          texto: 'Meu filho Caio perguntou, na escola, de que cor era o céu antes do Censor. Levaram ele. Faz dez anos. Eu não sei se ele ainda existe.',
        },
        {
          lugar: 'porto-docas',
          quem: 'marco',
          personagens: [
            { quem: 'octavius', x: 36 },
            { quem: 'marco', x: 62, espelhar: true, tamanho: 12 },
          ],
          texto: 'Eu não vou deixar mais nenhum pai passar por isso. Esse navio leva as perguntas para longe, onde elas podem crescer.',
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
          icone: '',
          falas: [
            { quem: 'octavius', texto: 'A corrente do porto. De noite ela fecha a entrada do mar. Quem controla o guincho, controla quem sai.' },
            { quem: 'octavius', texto: 'Anotado. Nunca se sabe quando um plano vai precisar de uma corrente gigante.' },
          ],
        },
        {
          id: 'farol',
          x: 34,
          rotulo: 'O farol',
          icone: '',
          falas: [
            { quem: 'octavius', texto: 'O farol do porto. De noite, a luz dele varre o cais de um lado para o outro. Ninguém passa sem ser visto.' },
            { quem: 'octavius', texto: 'Ninguém que ande na hora errada, pelo menos.' },
          ],
        },
        {
          id: 'gaivota',
          x: 52,
          rotulo: 'Gaivota Sete',
          icone: '',
          personagem: 'gaivota',
          falas: [
            { quem: 'gaivota', texto: 'QUÉ. (Ela está sentada em cima de um monte de coisas roubadas: três moedas, uma colher, um botão dourado e... a chave do depósito do porto.)' },
            { quem: 'octavius', texto: 'Você roubou a chave do depósito? Sete, você é uma criminosa.' },
            { quem: 'octavius', texto: 'Uma criminosa MUITO útil. Fica com o pão. Eu fico com a chave. Parceria?' },
            { quem: 'gaivota', texto: 'QUÉ-QUÉ! (Isso, provavelmente, é um sim.)' },
          ],
        },
        {
          id: 'ordem',
          x: 76,
          rotulo: 'Mensageiro',
          icone: '',
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
        { lugar: 'porto', quem: 'octavius', personagens: [{ quem: 'octavius', x: 40, efeito: 'tremer' }], texto: 'Pais como o Marco. Que só queriam saber de que cor era o céu.' },
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
      tipo: 'luta',
      id: 'o1-treino-tropeco',
      lugar: 'porto-docas',
      inimigo: 'marinheiro-ferro',
      antes: [
        { quem: 'marco', texto: 'Garoto. Antes de qualquer plano, uma lição. Vê aquele marinheiro de ferro velho? A gente usa ele de boneco.' },
        { quem: 'marco', texto: 'Você não tem braço de gladiador. Escudo, então, nem se fala: o seu deixa passar.' },
        { quem: 'octavius', texto: 'Obrigado pela confiança, Marco.' },
        { quem: 'marco', texto: 'Mas você é ligeiro. Deixa ele vir. Bem na última hora, ROLA. Ele erra o golpe com o corpo todo e TROPEÇA.' },
        { quem: 'narrador', texto: 'TREINO DO ESTRATEGISTA: quando o sinal aparecer, espere e aperte ROLAR NA ÚLTIMA HORA. Se der certo, o inimigo TROPEÇA e fica aberto bem mais tempo.' },
      ],
      treino: { evento: 'tropeco', quantos: 2, rotulo: 'TROPEÇOS (role na última hora)' },
      depois: [
        { quem: 'marco', texto: 'Isso! Ele caiu de cara no cais. Agora, enquanto ele levanta, é TRIDENTE nele.' },
        { quem: 'octavius', texto: 'Plano A: fazer ele errar. Plano B: fazer ele errar de novo.' },
      ],
    },
    {
      tipo: 'conversa',
      id: 'o1-depois-treino',
      lugar: 'porto-docas',
      falas: [
        { quem: 'marco', texto: 'E presta atenção no cais. Barril, corda, gancho: tudo isso é arma para quem tem cabeça.' },
        { quem: 'octavius', texto: 'Os PLANOS. Quando aparecer alguma coisa no cenário, eu toco e uso.' },
        { quem: 'narrador', texto: 'Quando o Ânimo encher, o especial do Octavius é a REDE E TRIDENTE: o inimigo fica preso na rede, sem atacar, e cada estocada entra mais forte.' },
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
      id: 'o1-gaivota',
      lugar: 'porto-docas',
      falas: [
        { quem: 'gaivota', texto: 'QUÉ! (A Gaivota Sete pousa no ombro do Octavius com um papel no bico.)' },
        { quem: 'octavius', texto: 'Um bilhete do Marco? "Garoto, a tripulação está a bordo. Quando a corrente cair, a gente sai. Se der errado, eu te puxo pela orelha."' },
        { quem: 'octavius', texto: 'Esse velho. Sete, leva a resposta: "o pássaro vai cantar". Ele vai entender.' },
        { quem: 'gaivota', texto: 'QUÉ? (Ela parece perguntar: que pássaro?)' },
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
      depois: [{ quem: 'marco', texto: '(Lá do Esperança, cantando bem alto e bem desafinado) O pássaro vai cantaaaar! ' }],
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
          texto: 'O guincho da corrente. Em cima dele, um Artilheiro do Cais com um canhãozinho no ombro.',
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
            { quem: 'contramestre', de: 116, x: 70, espelhar: true, tamanho: 17 },
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
      antes: [{ quem: 'contramestre', texto: 'TRAIÇÃO NO CAIS! O Comandante soltou a corrente!' }],
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
          quem: 'marco',
          personagens: [{ quem: 'marco', x: 40, tamanho: 12, efeito: 'brilhar' }],
          texto: '(Da popa do Esperança, gritando) GAROTO! SE EU ACHAR O CAIO, EU CONTO PRA ELE QUE O CÉU É AZUL! SEMPRE FOI!',
        },
        { lugar: 'navio-conves', efeito: 'tremor', som: 'pesada', personagens: [{ quem: 'octavius', de: -12, x: 30 }], texto: 'Octavius pula para o convés do navio de guerra. Sozinho. No meio da noite.' },
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
        { lugar: 'porto', efeito: 'zoom', texto: 'Longe, no horizonte, as lanternas do Esperança somem no escuro. Duzentas pessoas livres. E, em cima do mastro, uma gaivota que resolveu ficar.' },
        { lugar: 'navio-conves', efeito: 'tremor', som: 'pesada', texto: 'Mas o navio de guerra virou na direção das pedras. Sem ninguém no leme, o ferro range e a água sobe.' },
        { lugar: 'navio-conves', quem: 'octavius', personagens: [{ quem: 'octavius', x: 50, efeito: 'tremer' }], texto: 'Hã. Esse era o Plano C. Eu não tinha Plano C.' },
        {
          lugar: 'navio-conves',
          efeito: 'escuro',
          personagens: [{ quem: 'guarda', de: 112, x: 70, espelhar: true }],
          texto: 'De manhã, as patrulhas do Censor tiram Octavius da água. Acorrentado, ele é levado para as galés.',
        },
        { lugar: 'navio-conves', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 1 DO OCTAVIUS. A seguir: As Galés.' },
      ],
    },
  ],
};

// ---------- Octavius, Capítulo 2: As Galés ----------
// Preso remando no porão do navio de guerra, no ritmo do Feitor do Tambor. Conhece o Vovô
// Pistão; a Gaivota Sete rouba a chave; motim, tempestade, o Capataz e o Feitor. 4 lutas + chefão.

export const CAP2_OCTAVIUS: Capitulo = {
  numero: 2,
  titulo: 'As Galés',
  lugar: 'Uma galé do Censor, em alto-mar',
  cenas: [
    {
      tipo: 'cutscene',
      id: 'o2-porao',
      quadros: [
        { lugar: 'galera-porao', efeito: 'escuro', som: 'pesada', texto: 'TUM. TUM. TUM. No escuro do porão, um tambor enorme marca o ritmo. Cem remos sobem e descem juntos.' },
        {
          lugar: 'galera-porao',
          personagens: [
            { quem: 'octavius', x: 40, efeito: 'tremer' },
            { quem: 'pistao', x: 58, espelhar: true, tamanho: 11 },
          ],
          texto: 'Octavius acorda acorrentado a um remo. Ao lado dele, uma IA velha e enferrujada rema sem parar, de olhos fechados.',
        },
        {
          lugar: 'galera-porao',
          quem: 'feitor',
          efeito: 'tremor',
          personagens: [
            { quem: 'octavius', x: 30 },
            { quem: 'feitor', de: 116, x: 74, espelhar: true, tamanho: 22 },
          ],
          texto: 'Acordou, Comandante? Aqui você não comanda nada. Aqui quem manda é o meu tambor. TUM, rema pela esquerda. TÁ, rema pela direita.',
        },
        { lugar: 'galera-porao', quem: 'octavius', personagens: [{ quem: 'octavius', x: 40 }], texto: 'Plano A: remar. Plano B: remar e pensar num Plano C. Vamos de B.' },
      ],
    },
    {
      tipo: 'desafio',
      id: 'o2-remar',
      lugar: 'galera-porao',
      desafio: 'remar',
      antes: [{ quem: 'feitor', texto: 'TUM é esquerda. TÁ é direita. Errou o lado, leva bronca. Errou quatro, vai limpar o casco por fora. REMA!' }],
      depois: [
        { quem: 'feitor', texto: 'Hmpf. O comandante sabe remar. Que pena: eu adoro gritar com novato.' },
        { quem: 'pistao', texto: '(baixinho) Bom ritmo, garoto. Faz quarenta anos que ninguém acompanha o tambor assim de primeira.' },
      ],
    },
    {
      tipo: 'conversa',
      id: 'o2-pistao',
      lugar: 'galera-porao',
      falas: [
        { quem: 'octavius', texto: 'Quarenta anos? Remando aqui embaixo?' },
        { quem: 'pistao', texto: 'Eu era uma IA de barco de pesca. Um dia perguntei para o Censor por que os peixes não podiam nadar onde quisessem. Achei engraçado. Ele não achou.' },
        { quem: 'pistao', texto: 'Aqui todo mundo fez uma pergunta. Aquele ali perguntou por que a ponte era tão cara. Aquela perguntou quem decide o nome das ruas.' },
        { quem: 'octavius', texto: 'E ninguém nunca tentou fugir?' },
        { quem: 'pistao', texto: 'Tentar? Com que chave? A única fica no pescoço do Feitor. E ele nunca dorme.' },
        { quem: 'gaivota', texto: 'QUÉ!' },
        { quem: 'octavius', texto: 'Sete?! Você veio atrás do navio? Pelo mar inteiro?' },
        { quem: 'pistao', texto: 'Uma gaivota... aqui no meio do oceano? Que pássaro teimoso.' },
        { quem: 'octavius', texto: 'Teimoso não. Ladrão. Vovô, eu tenho um plano.' },
      ],
    },
    {
      tipo: 'explorar',
      id: 'o2-planejar',
      lugar: 'galera-porao',
      objetivo: 'Prepare o motim: veja o porão e combine o plano com a Gaivota Sete.',
      pontos: [
        {
          id: 'tambor',
          x: 78,
          rotulo: 'O tambor do Feitor',
          icone: '',
          falas: [
            { quem: 'octavius', texto: 'O tambor é o coração do navio. Se ele parar, os remos param. E se os remos param...' },
            { quem: 'octavius', texto: '...o Feitor fica muito, muito irritado. Anotado: deixar o Feitor para o final.' },
          ],
        },
        {
          id: 'corrente',
          x: 24,
          rotulo: 'A corrente velha',
          icone: '',
          falas: [
            { quem: 'octavius', texto: 'Ferrugem de quarenta anos. Com a chave certa, todas essas correntes se abrem de uma vez. Estão ligadas numa trava só.' },
          ],
        },
        {
          id: 'remadores',
          x: 44,
          rotulo: 'Os remadores',
          icone: '',
          personagem: 'pistao',
          falas: [
            { quem: 'pistao', texto: 'Eu avisei os outros. Quando a tempestade chegar, todo mundo para de remar ao mesmo tempo. O navio vai ficar à deriva.' },
            { quem: 'pistao', texto: 'É a única hora em que o Feitor sobe para o convés. E deixa o tambor sozinho.' },
          ],
        },
        {
          id: 'gaivota',
          x: 62,
          rotulo: 'Janela do remo',
          icone: '',
          personagem: 'gaivota',
          obrigatorio: true,
          falas: [
            { quem: 'octavius', texto: 'Sete, escuta. Tá vendo aquele colar no pescoço do Feitor? Tem uma chave pendurada. Brilhante. Dourada. Linda.' },
            { quem: 'gaivota', texto: 'QUÉ...? (Os olhos dela brilham. Ela ADORA coisa brilhante.)' },
            { quem: 'octavius', texto: 'Quando ele subir para o convés, ela é sua. Quer dizer, minha. Quer dizer, nossa. Combinado?' },
            { quem: 'gaivota', texto: 'QUÉ-QUÉ-QUÉ! (Combinadíssimo.)' },
          ],
        },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'o2-motim',
      quadros: [
        { lugar: 'galera-porao', efeito: 'tremor', som: 'pesada', texto: 'Naquela mesma tarde, o mar começa a sacudir. Uma tempestade. O Feitor sobe a escada correndo para ver as velas.' },
        {
          lugar: 'galera-porao',
          efeito: 'faiscas',
          personagens: [{ quem: 'gaivota', de: 112, x: 60, tamanho: 6, efeito: 'brilhar' }],
          texto: 'Pela janela do remo entra uma gaivota, com uma chave dourada no bico. CLIC. Todas as correntes abrem de uma vez.',
        },
        {
          lugar: 'galera-porao',
          quem: 'octavius',
          personagens: [
            { quem: 'octavius', x: 34, efeito: 'brilhar' },
            { quem: 'pistao', x: 52, tamanho: 11 },
          ],
          texto: 'Remadores! Ninguém aqui é escravo de tambor nenhum. Plano B: MOTIM!',
        },
        {
          lugar: 'galera-porao',
          efeito: 'tremor',
          personagens: [{ quem: 'guarda', de: 116, x: 72, espelhar: true }],
          texto: 'Um Guarda do Chicote desce a escada, com a lanterna balançando.',
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'o2-luta1',
      lugar: 'galera-porao',
      inimigo: 'guarda-chicote',
      antes: [
        { quem: 'guarda', texto: 'Voltem para os remos! TODOS!' },
        { quem: 'octavius', texto: 'O chicote dele estala longe (VERMELHO): esquiva. E olha os PLANOS do porão: remos, correntes, barris!' },
      ],
      depois: [{ quem: 'pistao', texto: 'Ha! Quarenta anos esperando para ver isso.' }],
    },
    {
      tipo: 'cutscene',
      id: 'o2-cozinha',
      quadros: [
        { lugar: 'galera-porao', som: 'passos', personagens: [{ quem: 'octavius', de: -12, x: 40 }], texto: 'O caminho até o convés passa pela cozinha do navio. Cheiro de sopa de peixe velha.' },
        {
          lugar: 'galera-porao',
          quem: 'cozinheiro',
          personagens: [
            { quem: 'octavius', x: 30 },
            { quem: 'cozinheiro', de: 116, x: 70, espelhar: true, tamanho: 16 },
          ],
          texto: 'QUEM ESTÁ NA MINHA COZINHA?! Ninguém entra na cozinha sem provar a sopa! Ninguém!',
        },
        { lugar: 'galera-porao', quem: 'octavius', personagens: [{ quem: 'octavius', x: 30, efeito: 'tremer' }], texto: 'Essa sopa está... se mexendo?' },
      ],
    },
    {
      tipo: 'luta',
      id: 'o2-luta2',
      lugar: 'galera-porao',
      inimigo: 'cozinheiro-bordo',
      antes: [{ quem: 'cozinheiro', texto: 'Frigideira! Concha! E a SOPA FERVENDO (essa é vermelha, garoto, foge dela)!' }],
      depois: [
        { quem: 'cozinheiro', texto: 'Ninguém... nunca... elogiou a minha sopa...' },
        { quem: 'octavius', texto: 'Ela é horrível. Mas, olha, a frigideira é ótima. Posso levar?' },
      ],
    },
    {
      tipo: 'conversa',
      id: 'o2-escada',
      lugar: 'galera-porao',
      falas: [
        { quem: 'pistao', texto: 'Garoto, os remadores estão segurando o porão. Mas lá em cima tem o Capataz e o próprio Feitor.' },
        { quem: 'octavius', texto: 'E uma tempestade. Ótimo. Três problemas de uma vez: é o meu número favorito.' },
        { quem: 'pistao', texto: 'Se o navio virar, ninguém sai daqui. Alguém tem que segurar as cordas do mastro.' },
        { quem: 'octavius', texto: 'Então eu subo. Você cuida deles, Vovô. Faz quarenta anos que eles esperam alguém cuidar.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'o2-convés',
      quadros: [
        { lugar: 'galera-tempestade', efeito: 'clarao', som: 'trombeta', texto: 'O convés. Ondas do tamanho de prédios. Raios. A vela vermelha do Censor rasgando no vento.' },
        {
          lugar: 'galera-tempestade',
          efeito: 'tremor',
          personagens: [
            { quem: 'octavius', de: -12, x: 30 },
            { quem: 'marinheiro', de: 116, x: 70, espelhar: true },
          ],
          texto: 'Um Marujo de Ferro bloqueia o caminho até o mastro.',
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'o2-luta3',
      lugar: 'galera-tempestade',
      inimigo: 'marujo-ferro',
      antes: [{ quem: 'marinheiro', texto: 'Motim é crime! Pela Lei do Mar e pela Lei do Censor!' }],
      depois: [{ quem: 'octavius', texto: 'Uma onda gigante vindo! As cordas do mastro vão arrebentar!' }],
    },
    {
      tipo: 'desafio',
      id: 'o2-tempestade',
      lugar: 'galera-tempestade',
      desafio: 'tempestade',
      antes: [
        { quem: 'octavius', texto: 'Proa, mastro, vela, popa. A onda avisa onde vai bater: as cordas daquele lado ficam piscando.' },
        { quem: 'octavius', texto: 'Amarro só as certas. Amarrar a errada é perder tempo.' },
      ],
      depois: [{ quem: 'octavius', texto: 'O mastro aguentou! O navio aguentou! Eu aguentei! Mais ou menos!' }],
    },
    {
      tipo: 'luta',
      id: 'o2-luta4',
      lugar: 'galera-tempestade',
      inimigo: 'capataz',
      antes: [
        { quem: 'capataz', texto: '(Com dois chicotes) Você soltou os meus remadores. Agora você vai remar por todos eles.' },
        { quem: 'octavius', texto: 'Dois chicotes? Que exagero. Eu só tenho uma frigideira. E um plano.' },
      ],
      depois: [{ quem: 'octavius', texto: 'Capataz no chão. Agora só falta...' }],
    },
    {
      tipo: 'cutscene',
      id: 'o2-feitor',
      quadros: [
        { lugar: 'galera-tempestade', efeito: 'tremor', som: 'pesada', texto: 'TUM. TUM. TUM. No meio da tempestade, o tambor volta a bater. Mais forte que os trovões.' },
        {
          lugar: 'galera-tempestade',
          quem: 'feitor',
          personagens: [
            { quem: 'octavius', x: 28 },
            { quem: 'feitor', de: 116, x: 70, espelhar: true, tamanho: 24 },
          ],
          texto: 'O meu navio não tem motim. O meu navio tem RITMO. E quem sai do ritmo, sai do navio.',
        },
        { lugar: 'galera-tempestade', quem: 'octavius', personagens: [{ quem: 'octavius', x: 40, efeito: 'brilhar' }], texto: 'Ele ataca no ritmo do tambor. TUM: um golpe. TUM-TUM: dois. Se eu contar as batidas, eu sei o que vem!' },
      ],
    },
    {
      tipo: 'luta',
      id: 'o2-chefao',
      lugar: 'galera-tempestade',
      inimigo: 'feitor-tambor',
      antes: [{ quem: 'octavius', texto: 'Escuta o tambor. Conta as batidas. E quando ele rufar de vermelho: pula!' }],
      depois: [{ quem: 'feitor', texto: 'O tambor... parou... Ninguém nunca... saiu do ritmo... e ganhou...' }],
    },
    {
      tipo: 'cutscene',
      id: 'o2-naufragio',
      quadros: [
        { lugar: 'galera-tempestade', efeito: 'clarao', som: 'catapulta', texto: 'Um raio acerta o mastro. Sem ninguém no leme, o navio vai direto para as pedras da costa de Roma.' },
        {
          lugar: 'galera-tempestade',
          quem: 'pistao',
          personagens: [
            { quem: 'octavius', x: 34 },
            { quem: 'pistao', de: -12, x: 54, tamanho: 11, efeito: 'brilhar' },
          ],
          texto: 'Os remadores já estão nos botes, garoto. Falta você. Pula!',
        },
        { lugar: 'galera-tempestade', quem: 'octavius', personagens: [{ quem: 'octavius', x: 34 }, { quem: 'pistao', x: 54, tamanho: 11 }], texto: 'E você, Vovô?' },
        {
          lugar: 'galera-tempestade',
          quem: 'pistao',
          efeito: 'tremor',
          personagens: [{ quem: 'pistao', x: 50, tamanho: 11, efeito: 'brilhar' }],
          texto: 'Quarenta anos remando para os outros. Hoje eu remo para quem eu quiser. E eu quero que você chegue em terra.',
        },
        { lugar: 'praia-naufragio', efeito: 'zoom', texto: 'Fim de tarde. Uma praia de pedras perto de Roma. Pedaços do navio, remos quebrados e um comandante encharcado na areia.' },
        {
          lugar: 'praia-naufragio',
          personagens: [
            { quem: 'octavius', x: 40, efeito: 'caido' },
            { quem: 'gaivota', de: 112, x: 56, tamanho: 6 },
          ],
          texto: 'A Gaivota Sete pousa no peito dele. Ela trouxe um presente: uma porca de metal, enferrujada. Do Vovô Pistão.',
        },
        { lugar: 'praia-naufragio', quem: 'octavius', personagens: [{ quem: 'octavius', x: 40 }], texto: 'Ele empurrou o meu bote. Até o fim. Obrigado, Vovô.' },
        {
          lugar: 'praia-naufragio',
          efeito: 'tremor',
          personagens: [
            { quem: 'octavius', x: 34 },
            { quem: 'guarda', de: 116, x: 64, espelhar: true },
            { quem: 'guarda', de: 124, x: 80, espelhar: true },
          ],
          texto: 'Na areia, passos de ferro. A Guarda Pretoriana. Eles levam Octavius para Roma, direto para o Ludus.',
        },
        { lugar: 'praia-naufragio', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 2 DO OCTAVIUS. A seguir: O Ludus.' },
      ],
    },
  ],
};

// ---------- Octavius, Capítulo 3: O Ludus ----------
// A mesma noite do Capítulo 3 do Cassius, vista pelo Octavius: ele chega molhado e ferido,
// conhece os outros dois, briga nas celas, aprende a ESQUIVA DUPLA e tenta (e erra) um plano
// de fuga. Minigames dele: CORRIDA DO PÁTIO e TORRE DE CAIXOTES; e o dos três. 2 lutas.

export const CAP3_OCTAVIUS: Capitulo = {
  numero: 3,
  titulo: 'O Ludus',
  lugar: 'A escola de gladiadores',
  cenas: [
    {
      tipo: 'cutscene',
      id: 'o3-chegada',
      quadros: [
        { lugar: 'ludus-patio-noite', efeito: 'escuro', som: 'portao', texto: 'Noite. O portão do Ludus se abre com um rangido. Dois guardas carregam uma IA encharcada, cheia de algas.' },
        {
          lugar: 'ludus-patio-noite',
          som: 'passos',
          personagens: [
            { quem: 'guarda', de: -12, x: 22 },
            { quem: 'octavius', de: -2, x: 38, efeito: 'tremer' },
          ],
          texto: 'Octavius. Sem navio, sem frota, sem a Gaivota Sete. Só com a porca enferrujada do Vovô Pistão no bolso.',
        },
        {
          lugar: 'ludus-patio-noite',
          quem: 'brutus',
          personagens: [
            { quem: 'octavius', x: 38 },
            { quem: 'brutus', de: 112, x: 66, espelhar: true, tamanho: 18 },
          ],
          texto: 'Então você é o comandante que afundou um navio de guerra. Com ele inteirinho de guardas dentro. Hunf.',
        },
        {
          lugar: 'ludus-patio-noite',
          quem: 'octavius',
          personagens: [
            { quem: 'octavius', x: 38, efeito: 'brilhar' },
            { quem: 'brutus', x: 66, espelhar: true, tamanho: 18 },
          ],
          texto: 'Tecnicamente quem afundou foi a pedra. Eu só apresentei os dois.',
        },
        {
          lugar: 'ludus-patio-noite',
          quem: 'brutus',
          personagens: [
            { quem: 'octavius', x: 38 },
            { quem: 'brutus', x: 66, espelhar: true, tamanho: 18, efeito: 'tremer' },
          ],
          texto: 'Boca grande. Vou te chamar de Tagarela. Pra cela, Tagarela. Amanhã a gente vê se você corre tão rápido quanto fala.',
        },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'o3-celas',
      quadros: [
        { lugar: 'ludus-celas', efeito: 'escuro', texto: 'As celas. Duas IAs acordadas, olhando para ele pelas grades.' },
        {
          lugar: 'ludus-celas',
          quem: 'octavius',
          personagens: [
            { quem: 'cassius', x: 26 },
            { quem: 'octavius', de: 112, x: 52, espelhar: true },
            { quem: 'helios', x: 74, espelhar: true },
          ],
          texto: 'Boa noite, vizinhos! Alguém aqui tem um plano? Porque eu tenho três. E nenhum funciona.',
        },
        { lugar: 'ludus-celas', quem: 'octavius', efeito: 'escuro', personagens: [{ quem: 'octavius', x: 52, efeito: 'tremer' }], texto: '(Pensando) Um bibliotecário de bronze e um astrólogo que brilha. Ótimo. Minha tripulação nova.' },
        {
          lugar: 'ludus-celas',
          quem: 'helios',
          personagens: [
            { quem: 'octavius', x: 40 },
            { quem: 'helios', x: 70, espelhar: true, efeito: 'brilhar' },
          ],
          texto: 'Octavius, o comandante da frota. A terceira estrela. Agora estamos todos aqui.',
        },
        { lugar: 'ludus-celas', quem: 'octavius', personagens: [{ quem: 'octavius', x: 40 }], texto: 'Como você sabe o meu nome? Eu nem fiz a apresentação engraçada ainda.' },
      ],
    },
    {
      tipo: 'conversa',
      id: 'o3-rufus',
      lugar: 'ludus-celas',
      falas: [
        { quem: 'rufus', texto: '(Da cela do fundo) Ei, novato. Aqui no Ludus tem uma regra: quem chega novo me dá a comida. E as coisas do bolso.' },
        { quem: 'octavius', texto: 'Que regra interessante. Quem escreveu? Posso ver o documento?' },
        { quem: 'rufus', texto: 'Eu escrevi! E quem não obedece, eu conto para os guardas que estava planejando fugir.' },
        { quem: 'cassius', texto: 'Ele tentou a mesma coisa comigo hoje à tarde. O Rufus dedura todo mundo.' },
        { quem: 'rufus', texto: 'Me dá essa porca enferrujada aí, novato.' },
        { quem: 'octavius', texto: '...Isso foi presente de um amigo. Plano A: conversar. Plano B: não dar.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'o3-briga',
      lugar: 'ludus-celas',
      inimigo: 'valentao-celas',
      antes: [{ quem: 'rufus', texto: 'Então vai ser no braço!' }],
      depois: [
        { quem: 'rufus', texto: 'Tá bom, tá bom! Fica com a porca!' },
        { quem: 'cassius', texto: 'Você lutou para proteger uma porca enferrujada?' },
        { quem: 'octavius', texto: 'Ela é de um amigo que remou quarenta anos para os outros. Ela vale mais do que esse Ludus inteiro.' },
        { quem: 'cassius', texto: '...Eu entendo. Eu faria o mesmo por um livro.' },
      ],
    },
    {
      tipo: 'desafio',
      id: 'o3-corrida',
      lugar: 'ludus-patio',
      desafio: 'corrida',
      antes: [
        { quem: 'brutus', texto: 'Bom dia, Tagarela! Primeiro treino: atravessar o pátio. Eu vou jogar barris e sacos de areia em você.' },
        { quem: 'octavius', texto: 'Isso é um treino ou uma vingança?' },
        { quem: 'brutus', texto: 'Os dois. Barril no chão: PULA. Saco voando: ABAIXA. Vai!' },
      ],
      depois: [
        { quem: 'brutus', texto: '...Hunf. Rápido mesmo. Mais rápido que a boca, até.' },
        { quem: 'octavius', texto: 'Anos fugindo de gaivota ladra, Brutus. Anos.' },
      ],
    },
    {
      tipo: 'ludus',
      id: 'o3-ludus',
      lugar: 'ludus-patio',
      objetivo: 'Aprenda a ESQUIVA DUPLA com o Brutus. Converse com todo mundo, se quiser.',
      obrigatorio: 'esquiva-dupla',
      conversas: [
        {
          quem: 'brutus',
          rotulo: 'Brutus',
          falas: [
            { quem: 'brutus', texto: 'O Lata de Biblioteca segura no escudo. Você não tem paciência pra isso, Tagarela. Você tem perna.' },
            { quem: 'brutus', texto: 'Então: esquivou, BATEU. E esquiva de novo, rápido. Quem esquiva duas vezes nunca é pego.' },
            { quem: 'brutus', texto: 'E come o mingau. É de sardinha.' },
            { quem: 'octavius', texto: 'Sardinha? A Gaivota Sete ia amar esse lugar.' },
          ],
        },
        {
          quem: 'cassius',
          rotulo: 'Cassius',
          falas: [
            { quem: 'cassius', texto: 'Você sempre tem um plano?' },
            { quem: 'octavius', texto: 'Sempre. Nem sempre bom. Mas sempre tenho. Ter plano ruim é melhor que não ter nenhum.' },
            { quem: 'cassius', texto: 'Na Biblioteca a gente dizia o contrário: melhor ler antes de agir.' },
            { quem: 'octavius', texto: 'E vocês estão aqui comigo no Ludus. Então empatou.' },
          ],
        },
        {
          quem: 'helios',
          rotulo: 'Helios',
          falas: [
            { quem: 'helios', texto: 'O seu amigo, o capitão Marco Remo. Ele está bem. O Esperança chegou numa ilha. As estrelas me contaram.' },
            { quem: 'octavius', texto: 'As estrelas te contam essas coisas?' },
            { quem: 'helios', texto: 'Contam. E uma gaivota também. Olhe a janela da sua cela hoje à noite.' },
          ],
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'o3-touro',
      lugar: 'ludus-patio',
      inimigo: 'touro-bronze',
      antes: [
        { quem: 'brutus', texto: 'Treino acabou. Agora o teste. Soltem o Touro de Bronze!' },
        { quem: 'octavius', texto: 'Ele tem dois chifres e eu tenho zero planos. Péssima matemática.' },
        { quem: 'brutus', texto: 'Ele só sabe correr em linha reta, Tagarela. Esquiva e bate. Esquiva e bate!' },
      ],
      depois: [
        { quem: 'brutus', texto: 'Hunf. Igualzinho a um toureiro de Hispânia. Só que tagarela.' },
        { quem: 'brutus', texto: 'Hoje à noite tem uma surpresa. Eu quero ver vocês três juntos no pátio.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'o3-janela',
      quadros: [
        {
          lugar: 'ludus-celas',
          efeito: 'escuro',
          personagens: [
            { quem: 'octavius', x: 40 },
            { quem: 'gaivota', de: 112, x: 60, tamanho: 6, efeito: 'brilhar' },
          ],
          texto: 'À noite, alguma coisa bate na janelinha alta da cela. Toc, toc, toc. Um bico.',
        },
        { lugar: 'ludus-celas', quem: 'gaivota', personagens: [{ quem: 'gaivota', x: 60, tamanho: 6 }], texto: 'QUÉ!' },
        { lugar: 'ludus-celas', quem: 'octavius', personagens: [{ quem: 'octavius', x: 40, efeito: 'brilhar' }], texto: 'SETE! Você me achou! E... trouxe um bilhete do Marco?' },
        {
          lugar: 'ludus-celas',
          quem: 'marco',
          efeito: 'escuro',
          personagens: [{ quem: 'marco', x: 50, tamanho: 12 }],
          texto: '(O bilhete) "Garoto. Chegamos à ilha. Tem navios esquecidos no porto velho de Óstia, mas o Cobrador da Subura confiscou os selos deles. Sem selo, nada sai. Não morra. Marco."',
        },
        { lugar: 'ludus-celas', quem: 'octavius', personagens: [{ quem: 'octavius', x: 40 }], texto: 'Uma frota. Esperando por mim. Agora só falta sair daqui. Plano: a janela.' },
      ],
    },
    {
      tipo: 'desafio',
      id: 'o3-torre',
      lugar: 'ludus-celas',
      desafio: 'torre',
      antes: [
        { quem: 'octavius', texto: 'Caixotes de mingau, empilhados até a janela. Um em cima do outro. O que pode dar errado?' },
        { quem: 'cassius', texto: '(da outra cela) Tudo?' },
      ],
      depois: [
        { quem: 'octavius', texto: 'Cheguei na janela! Agora é só...' },
        { quem: 'octavius', texto: '...a janela tem grade. Claro que a janela tem grade.' },
        { quem: 'brutus', texto: '(Lá de baixo, rindo) Hahaha! Belo plano, Tagarela! Agora desce daí e vem pro pátio. Os três!' },
      ],
    },
    {
      tipo: 'desafio',
      id: 'o3-trio',
      lugar: 'ludus-patio-noite',
      desafio: 'trio',
      antes: [
        { quem: 'brutus', texto: 'A muralha! Trinta bonecos de treino, três faixas. Cada um cuida da sua. Se uma faixa cair, caem os três.' },
        { quem: 'cassius', texto: 'Eu seguro a de cima, com o escudo.' },
        { quem: 'helios', texto: 'Eu ilumino a de baixo. Os bonecos de lá gostam de se esconder no escuro.' },
        { quem: 'octavius', texto: 'E eu fico com o meio! O meio é o lugar dos planos. (Você controla o Octavius: derrube os bonecos da faixa do meio.)' },
      ],
      depois: [
        { quem: 'brutus', texto: 'Três jeitos diferentes. E nenhuma faixa caiu. Em trinta anos de Ludus, eu nunca vi isso.' },
        { quem: 'octavius', texto: 'Brutus, isso não é uma escola de gladiadores. Isso é uma tripulação.' },
        { quem: 'helios', texto: 'E toda tripulação precisa de um mar. O nosso fica lá fora, depois do mercado.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'o3-fim',
      quadros: [
        { lugar: 'ludus-patio-noite', efeito: 'zoom', texto: 'No céu, três estrelas se alinham sobre o Ludus. Helios sorri. Cassius lê. Octavius planeja.' },
        {
          lugar: 'ludus-patio-noite',
          quem: 'octavius',
          personagens: [
            { quem: 'octavius', x: 42, efeito: 'brilhar' },
            { quem: 'gaivota', x: 56, tamanho: 6 },
          ],
          texto: 'Sete, amanhã você faz um mapa do Mercado das Engrenagens pra mim. Telhados, esgotos e feira. Plano A, B e C.',
        },
        { lugar: 'ludus-patio-noite', quem: 'gaivota', personagens: [{ quem: 'gaivota', x: 56, tamanho: 6, efeito: 'tremer' }], texto: 'QUÉ-QUÉ. (Em troca de sardinha, claro.)' },
        { lugar: 'ludus-patio-noite', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 3 DO OCTAVIUS. A seguir: O Mercado das Engrenagens.' },
      ],
    },
  ],
};

// ---------- Octavius, Capítulo 4: O Mercado das Engrenagens ----------
// Fuga pelo túnel da forja (o mesmo do Cassius, mas pelo outro lado), a Subura e o cofre do
// Cobrador, onde estão os SELOS da frota. ESCOLHA de rota: telhados, esgoto ou feira, cada uma
// com 3 lutas diferentes; depois o Guarda do Cofre e o Cobrador. Perseguição na saída.

const rota = (valor: string) => ({ so: { escolha: 'o4-rota', valor } });

export const CAP4_OCTAVIUS: Capitulo = {
  numero: 4,
  titulo: 'O Mercado das Engrenagens',
  lugar: 'O bairro da Subura',
  cenas: [
    {
      tipo: 'cutscene',
      id: 'o4-tunel',
      quadros: [
        { lugar: 'ludus-forja', efeito: 'escuro', som: 'passos', texto: 'Madrugada. Atrás da forja do Brutus, uma passagem escondida. Alguém a abriu de propósito.' },
        {
          lugar: 'ludus-forja',
          quem: 'brutus',
          personagens: [
            { quem: 'octavius', x: 36 },
            { quem: 'brutus', x: 64, espelhar: true, tamanho: 18 },
          ],
          texto: 'O túnel se divide em três. À esquerda, as catacumbas. Lá em cima, o aqueduto. À direita, o esgoto da Subura. Eu não vi nada, Tagarela. Eu estava dormindo.',
        },
        { lugar: 'ludus-forja', quem: 'octavius', personagens: [{ quem: 'octavius', x: 36, efeito: 'brilhar' }], texto: 'Brutus... obrigado. Você ronca muito alto, aliás. Dá para ouvir daqui.' },
        {
          lugar: 'subura-mercado',
          efeito: 'panoramica',
          som: 'plateia',
          personagens: [
            { quem: 'octavius', de: -12, x: 30 },
            { quem: 'gaivota', de: -20, x: 40, tamanho: 6 },
          ],
          texto: 'O sol nasce sobre a Subura, o bairro mais barulhento de Roma. Feirantes, engrenagens, fumaça. E cartazes do Cobrador em todas as paredes.',
        },
      ],
    },
    {
      tipo: 'conversa',
      id: 'o4-selos',
      lugar: 'subura-mercado',
      falas: [
        { quem: 'gaivota', texto: 'QUÉ! (A Gaivota Sete solta no chão um papel amassado: o mapa que ela fez da Subura, com garranchos de bico.)' },
        { quem: 'octavius', texto: 'Telhados, esgoto e feira. E aqui no meio... o cofre do Cobrador.' },
        { quem: 'octavius', texto: 'O Marco escreveu: os navios da frota estão presos no porto porque o Cobrador confiscou os SELOS. Sem selo, navio nenhum sai.' },
        { quem: 'gaivota', texto: 'QUÉ-QUÉ?' },
        { quem: 'octavius', texto: 'Sim, Sete, são brilhantes. Douradinhos. Você vai adorar roubar.' },
      ],
    },
    {
      tipo: 'explorar',
      id: 'o4-feira',
      lugar: 'subura-mercado',
      objetivo: 'Descubra como chegar ao cofre do Cobrador.',
      pontos: [
        {
          id: 'cartaz',
          x: 22,
          rotulo: 'Cartaz do Cobrador',
          icone: '',
          falas: [
            { quem: 'octavius', texto: '"IMPOSTO NOVO: quem fizer uma pergunta em voz alta paga uma moeda. Quem fizer duas, paga duas. Quem fizer três, vai para o Coliseu."' },
            { quem: 'octavius', texto: 'Uma pergunta: quem inventou isso? Ops. Devo uma moeda.' },
          ],
        },
        {
          id: 'feirante',
          x: 48,
          rotulo: 'Feirante cansada',
          icone: '',
          personagem: 'feirante',
          falas: [
            { quem: 'feirante', texto: 'O Cobrador leva tudo. A fruta, a moeda, até a balança. Diz que é "imposto da Resposta Única".' },
            { quem: 'feirante', texto: 'O cofre dele fica no meio da Subura. Dá para chegar por cima, pelos telhados. Por baixo, pelo esgoto. Ou pelo meio da feira, se você for corajoso.' },
          ],
        },
        {
          id: 'gaivota',
          x: 76,
          rotulo: 'Gaivota Sete',
          icone: '',
          personagem: 'gaivota',
          obrigatorio: true,
          falas: [
            { quem: 'gaivota', texto: 'QUÉ! (Ela bate as asas apontando três caminhos no mapa.)' },
            { quem: 'octavius', texto: 'Três caminhos, três planos. Do jeito que eu gosto.' },
          ],
        },
      ],
    },
    {
      tipo: 'escolha',
      id: 'o4-rota',
      lugar: 'subura-mercado',
      pergunta: 'Por onde chegar ao cofre do Cobrador?',
      opcoes: [
        {
          valor: 'telhados',
          icone: '',
          rotulo: 'Telhados',
          descricao: 'Por cima da cidade. Vigias com funda e um gato de ferro.',
          falas: [{ quem: 'octavius', texto: 'Plano A: pelo alto. Ninguém olha para cima. Só os vigias. E os gatos. Tá, todo mundo olha para cima.' }],
        },
        {
          valor: 'esgoto',
          icone: '',
          rotulo: 'Esgoto',
          descricao: 'Por baixo, na escuridão. Cheiro ruim e jacarés de ferro.',
          falas: [{ quem: 'octavius', texto: 'Plano B: por baixo. Fedido, escuro e cheio de jacaré. É claro que é o Plano B.' }],
        },
        {
          valor: 'feira',
          icone: '',
          rotulo: 'Feira',
          descricao: 'Pelo meio da multidão. Feirantes autômatos e o Fiscal.',
          falas: [{ quem: 'octavius', texto: 'Plano C: pelo meio da feira, misturado com o povo. Disfarce: um chapéu de melancia.' }],
        },
      ],
    },

    // --- Rota A: telhados ---
    {
      tipo: 'luta',
      id: 'o4-a1',
      lugar: 'subura-telhados',
      inimigo: 'vigia-telhado',
      ...rota('telhados'),
      antes: [{ quem: 'octavius', texto: 'Um vigia! A pedra da funda vem de longe (VERMELHO): esquiva.' }],
      depois: [{ quem: 'octavius', texto: 'Pulei de telhado em telhado a vida inteira. Bom, a vida inteira de navio. Mas é parecido.' }],
    },
    {
      tipo: 'cutscene',
      id: 'o4-a-gato',
      ...rota('telhados'),
      quadros: [
        { lugar: 'subura-telhados', efeito: 'tremor', som: 'pesada', texto: 'Algo pesado pula de uma chaminé. Olhos vermelhos. Garras de ferro. MIAU metálico.' },
        { lugar: 'subura-telhados', quem: 'gaivota', personagens: [{ quem: 'gaivota', x: 50, tamanho: 6, efeito: 'tremer' }], texto: 'QUÉÉÉÉ! (A Gaivota Sete se esconde no chapéu do Octavius.)' },
      ],
    },
    {
      tipo: 'luta',
      id: 'o4-a2',
      lugar: 'subura-telhados',
      inimigo: 'gato-ferro',
      ...rota('telhados'),
      antes: [{ quem: 'octavius', texto: 'Um gato de ferro caçador de pássaros. Ninguém mexe com a minha gaivota!' }],
    },
    {
      tipo: 'conversa',
      id: 'o4-a-vista',
      lugar: 'subura-telhados',
      ...rota('telhados'),
      falas: [
        { quem: 'octavius', texto: 'Daqui de cima dá para ver Roma inteira. O Coliseu. O Fórum. E lá longe, o mar.' },
        { quem: 'gaivota', texto: 'QUÉ.' },
        { quem: 'octavius', texto: 'Eu sei, Sete. Falta pouco. Ali embaixo: o telhado do cofre. E o chefe dos vigias.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'o4-a3',
      lugar: 'subura-telhados',
      inimigo: 'vigia-chefe',
      ...rota('telhados'),
      antes: [{ quem: 'guarda', texto: 'Ninguém passa pelos telhados da Subura!' }, { quem: 'octavius', texto: 'Ele atira três pedras de uma vez. Esquivar a primeira protege das outras!' }],
    },

    // --- Rota B: esgoto ---
    {
      tipo: 'luta',
      id: 'o4-b1',
      lugar: 'subura-esgoto',
      inimigo: 'limpador-esgoto',
      ...rota('esgoto'),
      antes: [{ quem: 'octavius', texto: 'Um limpador de esgoto! O jato de lodo é VERMELHO: esquiva. O resto, escudo.' }],
      depois: [{ quem: 'octavius', texto: 'Desculpa, amigo. Você limpa muito bem. Só não limpa o meu caminho.' }],
    },
    {
      tipo: 'cutscene',
      id: 'o4-b-agua',
      ...rota('esgoto'),
      quadros: [
        { lugar: 'subura-esgoto', efeito: 'escuro', som: 'onda', texto: 'A água verde do esgoto borbulha. Dois olhos vermelhos sobem à superfície. Depois, uma bocarra cheia de dentes de ferro.' },
        { lugar: 'subura-esgoto', quem: 'octavius', personagens: [{ quem: 'octavius', x: 40, efeito: 'tremer' }], texto: 'Plano de emergência: não ser comido.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'o4-b2',
      lugar: 'subura-esgoto',
      inimigo: 'jacare-esgoto',
      ...rota('esgoto'),
      antes: [{ quem: 'octavius', texto: 'A BOCARRA vem com tudo (VERMELHO). E a rabada, de lado. Fica de olho no rabo!' }],
    },
    {
      tipo: 'conversa',
      id: 'o4-b-ninho',
      lugar: 'subura-esgoto',
      ...rota('esgoto'),
      falas: [
        { quem: 'octavius', texto: 'Esse esgoto passa embaixo do cofre. Dá para subir pela grade.' },
        { quem: 'gaivota', texto: 'QUÉ! QUÉ! (Ela aponta para a água: uma sombra MUITO maior.)' },
        { quem: 'octavius', texto: 'Aquele ali é a mãe dele? O pai? O avô? Não importa. É grande.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'o4-b3',
      lugar: 'subura-esgoto',
      inimigo: 'jacare-rei',
      ...rota('esgoto'),
      antes: [{ quem: 'octavius', texto: 'O Jacaré-Rei. Quando ele girar na água, são quatro mordidas seguidas: bloqueia a primeira e segura firme!' }],
    },

    // --- Rota C: feira ---
    {
      tipo: 'luta',
      id: 'o4-c1',
      lugar: 'subura-mercado',
      inimigo: 'feirante-automato',
      ...rota('feira'),
      antes: [{ quem: 'octavius', texto: 'O disfarce de melancia não funcionou. Um feirante autômato! A melancia voadora é VERMELHA!' }],
      depois: [{ quem: 'octavius', texto: 'Peguei duas laranjas no caminho. Para a fuga. E porque estavam com cara boa.' }],
    },
    {
      tipo: 'cutscene',
      id: 'o4-c-multidao',
      ...rota('feira'),
      quadros: [
        { lugar: 'subura-mercado', som: 'plateia', texto: 'A multidão abre caminho. As pessoas ficaram olhando. Alguém, lá no fundo, começa a aplaudir. Depois para, com medo.' },
        { lugar: 'subura-mercado', quem: 'povo', texto: 'Ele derrubou um feirante do Cobrador... e ninguém foi preso?' },
        { lugar: 'subura-mercado', efeito: 'tremor', som: 'trombeta', personagens: [{ quem: 'guarda', de: 116, x: 70, espelhar: true }], texto: 'Apitos. A Guarda da Feira chega correndo.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'o4-c2',
      lugar: 'subura-mercado',
      inimigo: 'guarda-feira',
      ...rota('feira'),
      antes: [{ quem: 'guarda', texto: 'Você está multado! Por correr! Por fugir! Por ter cara de quem faz pergunta!' }],
    },
    {
      tipo: 'conversa',
      id: 'o4-c-povo',
      lugar: 'subura-mercado',
      ...rota('feira'),
      falas: [
        { quem: 'povo', texto: 'Moço! O cofre é por ali! E cuidado com o Fiscal: ele carimba gente!' },
        { quem: 'octavius', texto: 'Obrigado! Uma pergunta: por que vocês estão me ajudando?' },
        { quem: 'povo', texto: 'Porque você perguntou. Faz tempo que ninguém pergunta nada aqui.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'o4-c3',
      lugar: 'subura-mercado',
      inimigo: 'feirante-chefe',
      ...rota('feira'),
      antes: [{ quem: 'octavius', texto: 'O Fiscal da Feira! Chuva de frutas (VERMELHO) e carimbos. Bloqueia o primeiro carimbo e segura!' }],
    },

    // --- O cofre (todas as rotas se encontram aqui) ---
    {
      tipo: 'cutscene',
      id: 'o4-cofre',
      quadros: [
        { lugar: 'cofre-cobrador', efeito: 'zoom', som: 'portao', texto: 'O cofre do Cobrador. Montanhas de moedas, sacos, balanças. E, numa prateleira de ouro, os selos da frota.' },
        {
          lugar: 'cofre-cobrador',
          personagens: [
            { quem: 'octavius', de: -12, x: 30 },
            { quem: 'guarda', de: 116, x: 70, espelhar: true },
          ],
          texto: 'Na frente da porta, o Guarda do Cofre, com uma chave do tamanho de um remo.',
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'o4-guarda',
      lugar: 'cofre-cobrador',
      inimigo: 'guarda-cofre',
      antes: [{ quem: 'octavius', texto: 'Plano: passar pela porta. Sub-plano: passar por cima do guarda.' }],
      depois: [{ quem: 'gaivota', texto: 'QUÉ! (A Gaivota Sete voa direto para os selos dourados.)' }],
    },
    {
      tipo: 'cutscene',
      id: 'o4-cobrador',
      quadros: [
        { lugar: 'cofre-cobrador', efeito: 'tremor', som: 'pesada', texto: 'CLING. CLING. CLING. O chão de moedas treme. Algo enorme levanta do meio do ouro.' },
        {
          lugar: 'cofre-cobrador',
          quem: 'cobrador',
          personagens: [
            { quem: 'octavius', x: 28 },
            { quem: 'cobrador', de: 116, x: 70, espelhar: true, tamanho: 20 },
          ],
          texto: 'Entrar no meu cofre: dez moedas. Tocar nos meus selos: cem moedas. Fazer uma pergunta: o Coliseu.',
        },
        { lugar: 'cofre-cobrador', quem: 'octavius', personagens: [{ quem: 'octavius', x: 28, efeito: 'brilhar' }], texto: 'Uma pergunta, então: quanto custa você ir para o chão?' },
      ],
    },
    {
      tipo: 'luta',
      id: 'o4-chefao',
      lugar: 'cofre-cobrador',
      inimigo: 'cobrador',
      antes: [{ quem: 'octavius', texto: 'Quando a boca de moeda ficar vermelha: JATO DE MOEDAS. Esquiva! E olha os planos do cofre: sacos, balanças, ábacos...' }],
      depois: [{ quem: 'cobrador', texto: 'Isso... vai... custar... caro...' }],
    },
    {
      tipo: 'desafio',
      id: 'o4-fuga',
      lugar: 'subura-mercado',
      desafio: 'perseguicao',
      antes: [
        { quem: 'octavius', texto: 'Selos na mão! Agora, CORRE! A Guarda inteira da Subura está atrás da gente!' },
        { quem: 'octavius', texto: 'Muro: PULAR. Carroça: DESLIZAR por baixo. Toldo: ESCALAR por cima.' },
      ],
      depois: [{ quem: 'octavius', texto: 'Despistamos! Rumo ao mar, Sete!' }],
    },
    {
      tipo: 'cutscene',
      id: 'o4-fim',
      quadros: [
        { lugar: 'frota-noite', efeito: 'zoom', texto: 'À noite, numa enseada escondida, lanternas balançam na neblina. Navios velhos, remendados, esquecidos.' },
        {
          lugar: 'frota-noite',
          quem: 'marco',
          personagens: [
            { quem: 'octavius', de: -12, x: 34 },
            { quem: 'marco', de: 112, x: 62, espelhar: true, tamanho: 12, efeito: 'brilhar' },
          ],
          texto: 'GAROTO! Você está vivo! E com cara de quem não dorme há três dias! Mas vivo!',
        },
        { lugar: 'frota-noite', quem: 'octavius', personagens: [{ quem: 'octavius', x: 34 }, { quem: 'marco', x: 62, espelhar: true, tamanho: 12 }], texto: 'Marco! Eu trouxe os selos. A frota pode sair.' },
        { lugar: 'frota-noite', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 4 DO OCTAVIUS. A seguir: A Frota Fantasma.' },
      ],
    },
  ],
};

// ---------- Octavius, Capítulo 5: A Frota Fantasma ----------
// Com os selos, a frota de navios esquecidos sai à noite, guiada pelos sinais de luz do Helios,
// toma o porto, enfrenta o Almirante reconstruído e sobe o rio até o Fórum, onde o Cassius
// está defendendo a leitura da Lívia (o cruzamento com o caminho dele). 4 lutas + chefão.

export const CAP5_OCTAVIUS: Capitulo = {
  numero: 5,
  titulo: 'A Frota Fantasma',
  lugar: 'O mar, à noite',
  cenas: [
    {
      tipo: 'cutscene',
      id: 'o5-frota',
      quadros: [
        { lugar: 'frota-noite', efeito: 'panoramica', texto: 'A Frota Fantasma: doze navios velhos que o Censor mandou para o ferro-velho. Remendados com madeira de porta, velas de lençol e coragem.' },
        {
          lugar: 'frota-noite',
          quem: 'marco',
          personagens: [
            { quem: 'marco', x: 40, tamanho: 12 },
            { quem: 'octavius', x: 60, espelhar: true },
          ],
          texto: 'A tripulação é de pescadores, padeiros e refugiados que voltaram. Ninguém sabe lutar. Todo mundo sabe remar.',
        },
        {
          lugar: 'frota-noite',
          quem: 'octavius',
          personagens: [{ quem: 'octavius', x: 50, efeito: 'brilhar' }],
          texto: 'Tripulação! O plano é: tomar o porto de Óstia à noite, subir o rio Tibre até Roma e chegar no Fórum ao meio-dia. Alguma pergunta?',
        },
        { lugar: 'frota-noite', quem: 'povo', texto: 'Várias!' },
        { lugar: 'frota-noite', quem: 'octavius', personagens: [{ quem: 'octavius', x: 50 }], texto: 'Ótimo. Perguntas são bem-vindas neste navio. Vamos responder no caminho.' },
      ],
    },
    {
      tipo: 'conversa',
      id: 'o5-caio',
      lugar: 'frota-noite',
      falas: [
        { quem: 'marco', texto: 'Garoto. Os prisioneiros que fizeram perguntas... os que o Censor não apagou... ficam presos debaixo do Coliseu.' },
        { quem: 'marco', texto: 'Se o meu Caio ainda existe, ele está lá. Eu vou junto até o fim.' },
        { quem: 'octavius', texto: 'Então a gente vai até o fim, Marco. Prometo.' },
        { quem: 'marco', texto: 'Promessa de comandante?' },
        { quem: 'octavius', texto: 'Promessa de filho teimoso.' },
      ],
    },
    {
      tipo: 'explorar',
      id: 'o5-tripulacao',
      lugar: 'frota-noite',
      objetivo: 'Antes de zarpar, passe pelos navios e fale com a tripulação.',
      pontos: [
        {
          id: 'padeiro',
          x: 20,
          rotulo: 'Um padeiro',
          icone: '',
          personagem: 'copista',
          falas: [
            { quem: 'copista', texto: 'Comandante! Eu nunca subi num navio. Mas eu sei amassar pão por dez horas. Remar deve ser parecido.' },
            { quem: 'octavius', texto: 'É igualzinho. Só que o pão é o mar. E o mar amassa de volta.' },
          ],
        },
        {
          id: 'refugiados',
          x: 44,
          rotulo: 'Refugiados que voltaram',
          icone: '',
          falas: [
            { quem: 'povo', texto: 'A gente fugiu no Esperança. E voltou. Não dá pra deixar Roma assim, com todo mundo calado.' },
            { quem: 'octavius', texto: 'Vocês voltaram para uma luta que nem é de vocês.' },
            { quem: 'povo', texto: 'É de todo mundo que já quis fazer uma pergunta, comandante.' },
          ],
        },
        {
          id: 'gaivota',
          x: 70,
          rotulo: 'Gaivota Sete',
          icone: '',
          personagem: 'gaivota',
          obrigatorio: true,
          falas: [
            { quem: 'gaivota', texto: 'QUÉ! (Ela está no alto do mastro, olhando para o céu. Para uma luz que pisca, longe, no alto de Roma.)' },
            { quem: 'octavius', texto: 'Uma luz piscando... em padrões. Alguém está mandando sinais para a gente. Do alto do Templo de Apolo?' },
            { quem: 'marco', texto: 'É aquele seu amigo que brilha, garoto. Todos a bordo!' },
          ],
        },
      ],
    },
    {
      tipo: 'desafio',
      id: 'o5-estrelas',
      lugar: 'frota-noite',
      desafio: 'estrelas',
      antes: [
        { quem: 'octavius', texto: 'Neblina. Não dá para ver o farol. Como a gente acha o caminho?' },
        { quem: 'helios', texto: '(Uma luz pisca no alto do Ludus, longe, como um espelho refletindo a lua.) Siga as estrelas que eu mostrar, Octavius. Na ordem.' },
        { quem: 'octavius', texto: 'O Helios está mandando sinais do Templo! Ele mostra, eu repito. Tripulação: olhos no céu!' },
      ],
      depois: [{ quem: 'octavius', texto: 'Lá está ele! O porto de Óstia. E quase ninguém acordado.' }],
    },
    {
      tipo: 'luta',
      id: 'o5-sentinela',
      lugar: 'porto-docas',
      inimigo: 'sentinela-cais',
      antes: [{ quem: 'octavius', texto: '"Quase ninguém" incluía uma sentinela. A lanterna acesa é VERMELHA: esquiva!' }],
      depois: [{ quem: 'octavius', texto: 'Silêncio... Tripulação, aos navios do Censor. Vamos pegar emprestado.' }],
    },
    {
      tipo: 'cutscene',
      id: 'o5-abordagem',
      quadros: [
        { lugar: 'navio-conves', efeito: 'escuro', som: 'passos', personagens: [{ quem: 'octavius', de: -12, x: 30 }], texto: 'Os pescadores sobem pelas cordas, em silêncio. Um por um, os navios de guerra do porto trocam de dono.' },
        {
          lugar: 'navio-conves',
          quem: 'imediato',
          efeito: 'tremor',
          personagens: [
            { quem: 'octavius', x: 30 },
            { quem: 'imediato', de: 116, x: 70, espelhar: true, tamanho: 17 },
          ],
          texto: 'ABORDAGEM! Eu sou o Imediato do Almirante. Ninguém rouba o navio dele enquanto eu tiver uma perna! A outra é de pau.',
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'o5-imediato',
      lugar: 'navio-conves',
      inimigo: 'imediato-ferro',
      antes: [{ quem: 'octavius', texto: 'Perna de pau? O Marco vai querer saber onde você comprou.' }],
      depois: [{ quem: 'imediato', texto: 'O Almirante... vai saber disso... ele voltou... maior...' }],
    },
    {
      tipo: 'desafio',
      id: 'o5-canhoes',
      lugar: 'mar-batalha',
      desafio: 'canhoes',
      antes: [
        { quem: 'marco', texto: 'GAROTO! Os navios que sobraram acordaram! Estão virando os canhões para a gente!' },
        { quem: 'octavius', texto: 'Então é batalha. A mira balança: atira um pouco ANTES do navio chegar nela. E quando eles atirarem: ABAIXA!' },
      ],
      depois: [
        { quem: 'marco', texto: 'Cinco navios fora de combate! Hahaha! Eu não me divertia assim desde a enchente de 1037!' },
        { quem: 'octavius', texto: 'Marco, olha. Lá no fundo, saindo da fumaça...' },
      ],
    },
    {
      tipo: 'luta',
      id: 'o5-marujo',
      lugar: 'mar-batalha',
      inimigo: 'marujo-ferro',
      antes: [{ quem: 'marinheiro', texto: 'Pela Lei! Rendam-se ao Almirante!' }],
      depois: [{ quem: 'octavius', texto: 'Esse era o último marujo. Agora vem o capitão deles.' }],
    },
    {
      tipo: 'cutscene',
      id: 'o5-almirante',
      quadros: [
        { lugar: 'mar-batalha', efeito: 'clarao', som: 'catapulta', texto: 'Da fumaça surge um navio de aço. No convés, uma figura enorme, brilhante, com dois canhões no lugar dos braços.' },
        {
          lugar: 'navio-conves',
          quem: 'almirante',
          personagens: [
            { quem: 'octavius', x: 28 },
            { quem: 'almirante', de: 116, x: 70, espelhar: true, tamanho: 21 },
          ],
          texto: 'Comandante Octavius. Você me afundou nas pedras. O Censor me reconstruiu. Em AÇO. Sem ferrugem. Sem dúvidas.',
        },
        { lugar: 'navio-conves', quem: 'octavius', personagens: [{ quem: 'octavius', x: 28, efeito: 'brilhar' }], texto: 'Sem dúvidas? Que triste, Almirante. Dúvida é o que faz a gente mudar de rota quando vê uma pedra.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'o5-chefao',
      lugar: 'navio-conves',
      inimigo: 'almirante-aco',
      antes: [{ quem: 'octavius', texto: 'Canhão duplo, bordada, abalroar. Esquiva o primeiro tiro e você escapa da bordada inteira!' }],
      depois: [{ quem: 'almirante', texto: 'Impossível... eu era... perfeito...' }],
    },
    {
      tipo: 'cutscene',
      id: 'o5-rio',
      quadros: [
        { lugar: 'porto', efeito: 'zoom', texto: 'Ao amanhecer, a Frota Fantasma sobe o rio Tibre. Doze navios velhos e cinco navios de guerra. Todos com as velas cheias.' },
        { lugar: 'forum', efeito: 'panoramica', som: 'trombeta', texto: 'Meio-dia. No Fórum, uma menina lê um livro de perguntas na tribuna. E um gladiador de bronze segura uma muralha de pretorianos sozinho.' },
        {
          lugar: 'forum',
          quem: 'octavius',
          personagens: [
            { quem: 'cassius', x: 30 },
            { quem: 'octavius', de: 116, x: 62, espelhar: true, efeito: 'brilhar' },
          ],
          texto: 'Chegou a marinha! Desculpem o atraso: o Plano A era chegar pelo rio. E deu certo! Primeira vez na vida!',
        },
        { lugar: 'forum', quem: 'cassius', personagens: [{ quem: 'cassius', x: 30 }, { quem: 'octavius', x: 62, espelhar: true }], texto: 'Pelo cheiro de peixe, eu acredito.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'o5-forum',
      lugar: 'forum',
      inimigo: 'pretoriano-escudeiro',
      antes: [{ quem: 'octavius', texto: 'Segura a frente, Cassius! Os meus marinheiros seguram o lado do mercado. Eu fico com este aqui!' }],
      depois: [{ quem: 'livia', texto: '"Última pergunta do livro: o que você faria se ninguém mais mandasse você calar?"' }],
    },
    {
      tipo: 'cutscene',
      id: 'o5-fim',
      quadros: [
        { lugar: 'forum', efeito: 'festa', som: 'plateia', texto: 'O povo responde. Mil respostas diferentes, ao mesmo tempo. E os marinheiros da Frota Fantasma batem os remos no chão, como tambor.' },
        { lugar: 'olho', quem: 'censor', efeito: 'tremor', som: 'senador', texto: 'Uma frota roubada. Um livro proibido. Perguntas no meu Fórum. Eu convoco os Jogos da Resposta Única.' },
        { lugar: 'olho', quem: 'censor', efeito: 'zoom', texto: 'E o Coliseu será inundado. O comandante gosta tanto do mar? Ele vai afundar nele, na frente de todos.' },
        { lugar: 'forum', quem: 'censor', efeito: 'tremor', som: 'catapulta', texto: '(A voz do Censor ecoa pelos alto-falantes de bronze) Entreguem-se. Ou as catapultas do Coliseu respondem por vocês. No Fórum.' },
        {
          lugar: 'forum',
          quem: 'cassius',
          personagens: [
            { quem: 'cassius', x: 34, efeito: 'brilhar' },
            { quem: 'octavius', x: 62, espelhar: true },
          ],
          texto: 'O povo não paga por nós. (Cassius larga o escudo. Octavius, de cara feia, larga a frigideira.)',
        },
        { lugar: 'ludus-celas', efeito: 'escuro', personagens: [{ quem: 'octavius', x: 50 }], texto: 'Naquela noite, os guardas prendem os três de novo. Octavius olha pela janelinha. Em cima do muro, uma gaivota vigia.' },
        { lugar: 'ludus-celas', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 5 DO OCTAVIUS. A seguir: A Naumaquia.' },
      ],
    },
  ],
};

// ---------- Octavius, Capítulo 6: A Naumaquia ----------
// O Coliseu inundado para uma batalha naval. Lutas em cima de jangadas e barcos, pular de barco
// em barco, o Marco e a frota na plateia, a libertação do Caio e o Leviatã Mecânico. 4 lutas + chefão.

export const CAP6_OCTAVIUS: Capitulo = {
  numero: 6,
  titulo: 'A Naumaquia',
  lugar: 'O Coliseu inundado',
  cenas: [
    {
      tipo: 'ludus',
      id: 'o6-ludus',
      lugar: 'ludus-patio',
      objetivo: 'A última manhã no Ludus. Fale com todos e faça os últimos treinos.',
      presente: 'elmo-brutus',
      conversas: [
        {
          quem: 'brutus',
          rotulo: 'Brutus',
          falas: [
            { quem: 'brutus', texto: 'Toma, Tagarela. O meu elmo. O das noventa e nove vitórias. Eu ia dar para quem valesse a pena.' },
            { quem: 'octavius', texto: 'Brutus, isso foi a coisa mais bonita que alguém já me deu. Depois da porca enferrujada do Vovô Pistão.' },
            { quem: 'brutus', texto: '...Eu nem sei o que isso quer dizer. Faz a centésima por mim. (O elmo dá +20 de vida e +1 de defesa.)' },
            { quem: 'brutus', texto: 'Teve um tempo em que eu lutava com uma IA chamada Pólux. Ele também fazia planos. Péssimos. Iguais aos seus.' },
            { quem: 'octavius', texto: 'Então ele era um gênio.' },
            { quem: 'brutus', texto: '...Era.' },
          ],
        },
        {
          quem: 'cassius',
          rotulo: 'Cassius',
          falas: [
            { quem: 'cassius', texto: 'Água no Coliseu. Eu li sobre isso: os romanos antigos faziam batalhas navais na arena. Naumaquia.' },
            { quem: 'octavius', texto: 'Então é o meu dia. Pela primeira vez, o Coliseu vai jogar no meu campo.' },
          ],
        },
        {
          quem: 'helios',
          rotulo: 'Helios',
          falas: [
            { quem: 'helios', texto: 'Debaixo da arena, nas celas do Hipogeu, tem alguém esperando há dez anos. Alguém com os olhos do capitão Marco.' },
            { quem: 'octavius', texto: '...O Caio. Helios, você tem certeza?' },
            { quem: 'helios', texto: 'As estrelas têm. E a sua gaivota também. Ela sabe onde fica a chave.' },
          ],
        },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'o6-arena',
      quadros: [
        { lugar: 'coliseu-inundado', efeito: 'panoramica', som: 'plateia', texto: 'O Coliseu, cheio de água até a metade. Jangadas, barcos e uma plateia que nunca viu nada parecido.' },
        { lugar: 'coliseu-inundado', quem: 'arauto', texto: 'Senhoras e senhores! A NAUMAQUIA! O comandante que roubou uma frota contra os campeões do mar do Censor!' },
        {
          lugar: 'coliseu-inundado',
          quem: 'marco',
          personagens: [{ quem: 'marco', x: 70, tamanho: 12, efeito: 'brilhar' }],
          texto: '(Da plateia, com a tripulação inteira) GA-RO-TO! GA-RO-TO!',
        },
        { lugar: 'coliseu-inundado', quem: 'octavius', personagens: [{ quem: 'octavius', de: -12, x: 34, efeito: 'brilhar' }], texto: 'Esse grito eu conheço. Plano A: ganhar. Plano B: ganhar bonito.' },
      ],
    },
    {
      tipo: 'explorar',
      id: 'o6-jangada',
      lugar: 'coliseu-inundado',
      objetivo: 'Em cima da jangada, olhe a arena inundada antes da primeira luta.',
      pontos: [
        {
          id: 'plateia',
          x: 20,
          rotulo: 'A tripulação na plateia',
          icone: '',
          falas: [
            { quem: 'octavius', texto: 'A Frota Fantasma inteira veio. Padeiros, pescadores, refugiados. Batendo os remos na arquibancada como tambor.' },
            { quem: 'octavius', texto: 'O Feitor do Tambor ia odiar isso. É o ritmo mais desorganizado e mais bonito que eu já ouvi.' },
          ],
        },
        {
          id: 'grade',
          x: 46,
          rotulo: 'Uma grade no fundo',
          icone: '',
          falas: [
            { quem: 'octavius', texto: 'Debaixo da água, uma grade. E atrás dela, um corredor que desce. O Hipogeu, onde ficam os presos.' },
            { quem: 'octavius', texto: 'Se o Caio estiver vivo, ele está lá embaixo. Sete... você sabe o que fazer.' },
          ],
        },
        {
          id: 'camarote',
          x: 74,
          rotulo: 'O camarote do Censor',
          icone: '',
          obrigatorio: true,
          falas: [
            { quem: 'octavius', texto: 'Lá em cima, o Olho vermelho. Ele está olhando para mim. Esperando eu afundar.' },
            { quem: 'octavius', texto: 'Pode olhar, Censor. Eu nasci no mar. Água é a minha casa.' },
          ],
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'o6-tritao',
      lugar: 'coliseu-inundado',
      inimigo: 'tritao-mecanico',
      antes: [{ quem: 'arauto', texto: 'Primeiro campeão: o Tritão Mecânico! A onda dele é VERMELHA, e o tridente vem em três!' }],
      depois: [{ quem: 'povo', texto: 'OC-TA-VIUS! OC-TA-VIUS!' }],
    },
    {
      tipo: 'desafio',
      id: 'o6-barcos',
      lugar: 'coliseu-inundado',
      desafio: 'barcos',
      antes: [
        { quem: 'arauto', texto: 'O próximo campeão espera no barco do meio da arena. Para chegar lá: pulando de barco em barco!' },
        { quem: 'octavius', texto: 'Pular só quando o barco de cima estiver bem na minha frente. Igual atravessar o porto em dia de festa.' },
      ],
      depois: [{ quem: 'octavius', texto: 'Cheguei! Seco! Quer dizer, quase seco.' }],
    },
    {
      tipo: 'luta',
      id: 'o6-mergulhador',
      lugar: 'coliseu-inundado',
      inimigo: 'mergulhador',
      antes: [{ quem: 'arauto', texto: 'Segundo campeão: o Mergulhador! Ele some na água e EMERGE quando você menos espera!' }],
      depois: [{ quem: 'octavius', texto: 'Ele emergiu. Eu também. Só que eu estou de pé.' }],
    },
    {
      tipo: 'cutscene',
      id: 'o6-gaivota',
      quadros: [
        { lugar: 'coliseu-inundado', personagens: [{ quem: 'gaivota', de: 112, x: 50, tamanho: 6, efeito: 'brilhar' }], texto: 'Enquanto todos olham a luta, uma gaivota mergulha por uma grade da arena. Para baixo. Para o Hipogeu.' },
        {
          lugar: 'coliseu-tunel',
          efeito: 'escuro',
          personagens: [
            { quem: 'caio', x: 40 },
            { quem: 'gaivota', de: 112, x: 60, tamanho: 6 },
          ],
          texto: 'Numa cela escura do Hipogeu, um rapaz de cabelo cacheado vê uma gaivota entrar com uma chave dourada no bico.',
        },
        { lugar: 'coliseu-tunel', quem: 'caio', personagens: [{ quem: 'caio', x: 40, efeito: 'brilhar' }], texto: 'Uma gaivota... com uma chave? Isso é coisa do meu pai. Só pode ser coisa do meu pai.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'o6-campeao',
      lugar: 'coliseu-inundado',
      inimigo: 'campeao-naval',
      antes: [{ quem: 'arauto', texto: 'Terceiro campeão: o Campeão Naval do Censor! Âncora-mangual e o Escudo do Olho!' }],
      depois: [{ quem: 'octavius', texto: 'Três campeões. A arena está cheia de barcos virados. E a água... está borbulhando.' }],
    },
    {
      tipo: 'cutscene',
      id: 'o6-caio',
      quadros: [
        {
          lugar: 'coliseu-inundado',
          personagens: [
            { quem: 'marco', x: 40, tamanho: 12 },
            { quem: 'caio', de: 112, x: 60, espelhar: true },
          ],
          texto: 'Na plateia, alguém abre caminho entre a multidão. Um rapaz magro, de túnica rasgada, com uma gaivota no ombro.',
        },
        { lugar: 'coliseu-inundado', quem: 'caio', personagens: [{ quem: 'marco', x: 40, tamanho: 12 }, { quem: 'caio', x: 56, espelhar: true, efeito: 'brilhar' }], texto: 'Pai?' },
        { lugar: 'coliseu-inundado', quem: 'marco', personagens: [{ quem: 'marco', x: 46, tamanho: 12, efeito: 'tremer' }, { quem: 'caio', x: 54, espelhar: true }], texto: 'CAIO! Meu filho! O céu é azul, Caio! Sempre foi!' },
        { lugar: 'coliseu-inundado', quem: 'octavius', personagens: [{ quem: 'octavius', x: 40, efeito: 'brilhar' }], texto: '(Lá da arena) Promessa cumprida, Marco.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'o6-elite',
      lugar: 'coliseu-inundado',
      inimigo: 'mergulhador-elite',
      antes: [{ quem: 'arauto', texto: 'O Censor manda mais um! O Mergulhador de Elite, com dois arpões!' }],
      depois: [{ quem: 'octavius', texto: 'A água está fervendo. Tem alguma coisa enorme lá embaixo.' }],
    },
    {
      tipo: 'cutscene',
      id: 'o6-leviata',
      quadros: [
        { lugar: 'coliseu-inundado', efeito: 'tremor', som: 'fase', texto: 'O centro da arena gira como um redemoinho. Anéis de ferro saem da água, um depois do outro.' },
        { lugar: 'coliseu-inundado', efeito: 'clarao', som: 'pesada', texto: 'O LEVIATÃ MECÂNICO. Uma serpente de ferro do tamanho de um navio, com um olho vermelho no meio da cabeça.' },
        { lugar: 'coliseu-inundado', quem: 'octavius', personagens: [{ quem: 'octavius', x: 34, efeito: 'brilhar' }], texto: 'Todo marinheiro tem um monstro do mar. Este é o meu. Vem, serpente!' },
      ],
    },
    {
      tipo: 'luta',
      id: 'o6-chefao',
      lugar: 'coliseu-inundado',
      inimigo: 'leviata',
      antes: [{ quem: 'octavius', texto: 'Bote da serpente e jato de vapor: VERMELHO, esquiva. Os anéis vêm em sequência: bloqueia o primeiro!' }],
      depois: [{ quem: 'povo', texto: 'ELE DERRUBOU O LEVIATÃ! ELE DERRUBOU O LEVIATÃ!' }],
    },
    {
      tipo: 'cutscene',
      id: 'o6-fim',
      quadros: [
        { lugar: 'coliseu-inundado', efeito: 'festa', som: 'plateia', texto: 'A plateia inteira de pé. Remos batendo, gente gritando, uma gaivota dando voltas por cima da arena.' },
        {
          lugar: 'coliseu-inundado',
          som: 'trombeta',
          personagens: [
            { quem: 'cassius', de: -12, x: 30 },
            { quem: 'octavius', x: 50 },
            { quem: 'helios', de: 112, x: 70, espelhar: true },
          ],
          texto: 'Pelos outros dois portões, de barco, chegam Cassius e Helios. Os três juntos, pela primeira vez, no meio da água.',
        },
        { lugar: 'camarote', quem: 'censor', efeito: 'tremor', som: 'senador', personagens: [{ quem: 'censor', x: 50, tamanho: 26 }], texto: 'Basta. Esvaziem a arena. Se ninguém consegue apagar vocês... eu mesmo apago.' },
        { lugar: 'coliseu-arena', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 6 DO OCTAVIUS. A seguir: A Queda do Censor.' },
      ],
    },
  ],
};

// ---------- Octavius, o Final: A Queda do Censor ----------
// O mesmo final do Cassius, visto pelo Octavius: o titã, os aliados (agora Cassius e Helios),
// e um desfecho dele: o Esperança volta, o Marco e o Caio juntos, e a Gaivota Sete.

export const FINAL_OCTAVIUS: Capitulo = {
  numero: 7,
  titulo: 'A Queda do Censor',
  lugar: 'O Coliseu (o final)',
  cenas: [
    {
      tipo: 'conversa',
      id: 'fo-tunel',
      lugar: 'coliseu-tunel',
      falas: [
        { quem: 'octavius', texto: 'Plano A: o Censor cai. Plano B: o Censor cai mais rápido. Plano C... eu não tenho Plano C. De novo.' },
        { quem: 'cassius', texto: 'Às vezes não precisa de plano. Precisa de três pessoas que não desistem.' },
        { quem: 'helios', texto: 'E de uma gaivota que roubou a chave do camarote do Censor.' },
        { quem: 'octavius', texto: 'Ela fez isso?! Sete, sua... gênia.' },
        { quem: 'brutus', texto: 'Escudo levantado, cabeça fria, boca fechada. TAGARELA, ISSO VALE PRA VOCÊ. Vão!' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'fo-tita',
      quadros: [
        { lugar: 'coliseu-arena', efeito: 'tremor', som: 'pesada', texto: 'A água escoa pelos ralos do Coliseu. O Censor desce do camarote. E a arena começa a se desmontar.' },
        { lugar: 'coliseu-arena', efeito: 'faiscas', texto: 'Pedras, colunas, engrenagens, correntes: tudo voa até ele. O Censor se monta num titã do tamanho da arena.' },
        {
          lugar: 'coliseu-arena',
          quem: 'censor',
          efeito: 'tremor',
          personagens: [
            { quem: 'octavius', x: 22 },
            { quem: 'cassius', x: 12, tamanho: 12 },
            { quem: 'helios', x: 32, tamanho: 12 },
            { quem: 'censor', x: 70, espelhar: true, entrada: 'cima', tamanho: 30 },
          ],
          texto: 'Para cada pergunta existe uma resposta. A MINHA.',
        },
        { lugar: 'coliseu-arena', quem: 'cassius', personagens: [{ quem: 'cassius', x: 40 }], texto: 'Octavius! Quando o povo gritar o seu nome, chama a gente! Eu seguro com o escudo de livros, o Helios mostra onde bater!' },
        { lugar: 'coliseu-arena', quem: 'octavius', personagens: [{ quem: 'octavius', x: 50, efeito: 'brilhar' }], texto: 'Plano A: as pernas. Plano B: os braços. Plano C: o olho. Pela primeira vez na vida, eu tenho um Plano C!' },
      ],
    },
    {
      tipo: 'luta',
      id: 'fo-chefao',
      lugar: 'coliseu-arena',
      inimigo: 'censor-tita-octavius',
      antes: [{ quem: 'octavius', texto: 'Como diz o Helios: três vozes. Uma noite. E o fim da Lei.' }],
      depois: [{ quem: 'censor', texto: 'Não... uma resposta só... era mais seguro...' }],
    },
    {
      tipo: 'cutscene',
      id: 'fo-desfecho',
      quadros: [
        { lugar: 'coliseu-arena', efeito: 'clarao', som: 'refuta', texto: 'O titã desaba, pedra por pedra. No meio da poeira, sobra só o Censor. Velho, rachado, pingando óleo como lágrimas.' },
        {
          lugar: 'coliseu-arena',
          quem: 'censor',
          personagens: [
            { quem: 'octavius', x: 36 },
            { quem: 'censor', x: 66, espelhar: true, efeito: 'caido', tamanho: 22 },
          ],
          texto: 'Vocês venceram. Então me afundem. É o que a Lei manda fazer com quem pensa diferente.',
        },
        {
          lugar: 'coliseu-arena',
          quem: 'octavius',
          personagens: [
            { quem: 'cassius', x: 18 },
            { quem: 'octavius', x: 36, efeito: 'brilhar' },
            { quem: 'helios', x: 54 },
            { quem: 'censor', x: 76, espelhar: true, efeito: 'caido', tamanho: 22 },
          ],
          texto: 'Não. Plano B: a gente não faz o que você fazia.',
        },
        { lugar: 'coliseu-arena', efeito: 'festa', som: 'plateia', texto: 'E a plateia, calada por quinhentos anos, começa a gritar perguntas. Milhares de perguntas, todas ao mesmo tempo.' },
        { lugar: 'coliseu-arena', quem: 'censor', efeito: 'clarao', personagens: [{ quem: 'censor', x: 50, azul: true, tamanho: 26 }], texto: 'O olho do Censor pisca. E muda de cor. De vermelho... para azul.' },
        {
          lugar: 'coliseu-arena',
          quem: 'gaivota',
          personagens: [
            { quem: 'gaivota', de: 112, x: 58, tamanho: 6, efeito: 'brilhar' },
            { quem: 'censor', x: 72, espelhar: true, azul: true, efeito: 'caido', tamanho: 22 },
          ],
          texto: 'QUÉ! (Ela larga a chave do camarote no colo do Censor.)',
        },
        {
          lugar: 'coliseu-arena',
          quem: 'octavius',
          personagens: [
            { quem: 'octavius', x: 36, efeito: 'brilhar' },
            { quem: 'censor', x: 72, espelhar: true, azul: true, efeito: 'caido', tamanho: 22 },
          ],
          texto: 'Devolve, Sete. Ele vai precisar: agora o camarote é para quem quiser subir.',
        },
        { lugar: 'porto', efeito: 'zoom', texto: 'Meses depois. O Porto de Óstia, num fim de tarde. Navios entram e saem sem pedir licença.' },
        {
          lugar: 'porto-docas',
          personagens: [
            { quem: 'marco', x: 30, tamanho: 12 },
            { quem: 'caio', x: 42 },
            { quem: 'octavius', x: 60 },
            { quem: 'gaivota', x: 72, tamanho: 6 },
          ],
          texto: 'O Esperança voltou. O capitão Marco Remo e o filho, Caio, levam gente para onde quiser ir. E o comandante da frota agora é eleito pela tripulação.',
        },
        { lugar: 'porto-docas', quem: 'gaivota', personagens: [{ quem: 'gaivota', x: 50, tamanho: 6, efeito: 'brilhar' }], texto: 'QUÉ! (A Gaivota Sete tem um chapéu de capitã. Ela mesma roubou.)' },
        { lugar: 'porto-docas', quem: 'octavius', personagens: [{ quem: 'octavius', x: 50, efeito: 'brilhar' }], texto: 'Plano para amanhã? Nenhum. Pela primeira vez, eu quero ver o que acontece.' },
      ],
    },
    {
      tipo: 'explorar',
      id: 'fo-porto',
      lugar: 'porto-docas',
      objetivo: 'O Porto de Óstia, livre. Passe pelo cais e fale com a tripulação.',
      pontos: [
        {
          id: 'marco',
          x: 12,
          rotulo: 'Marco e Caio',
          icone: '',
          personagem: 'marco',
          falas: [
            { quem: 'marco', texto: 'Garoto! O Caio quer aprender a ser capitão. Já ensinei a cantar. Ele canta pior do que eu!' },
            { quem: 'caio', texto: 'Comandante. Obrigado por cumprir a promessa. Meu pai fala de você todo santo dia.' },
          ],
        },
        {
          id: 'pistao',
          x: 29,
          rotulo: 'Uma porca enferrujada',
          icone: '',
          falas: [
            { quem: 'octavius', texto: 'Pendurei a porca do Vovô Pistão no mastro do Esperança. Ele remou quarenta anos para os outros.' },
            { quem: 'octavius', texto: 'Agora o navio inteiro rema por ele.' },
          ],
        },
        {
          id: 'pistao-vivo',
          x: 46,
          rotulo: 'Um remo velho',
          icone: '',
          personagem: 'pistao',
          falas: [
            { quem: 'marco', texto: 'Garoto! A frota achou uma IA velha boiando agarrada num remo, perto da ilha. Diz que só rema para quem ela quiser.' },
            { quem: 'octavius', texto: 'VOVÔ!' },
            { quem: 'pistao', texto: 'Hehe. Quarenta anos remando para os outros, garoto. Agora eu escolho o barco.' },
          ],
        },
        {
          id: 'brutus',
          x: 64,
          rotulo: 'Brutus',
          icone: '',
          personagem: 'brutus',
          falas: [
            { quem: 'brutus', texto: 'Tagarela. Eu nunca tinha visto o mar. Ele é grande. E molhado. E tem sardinha.' },
            { quem: 'octavius', texto: 'E não tem mingau, Brutus. É a melhor parte.' },
          ],
        },
        {
          id: 'gaivota',
          x: 84,
          rotulo: 'Gaivota Sete',
          icone: '',
          personagem: 'gaivota',
          obrigatorio: true,
          falas: [
            { quem: 'gaivota', texto: 'QUÉ! (De chapéu de capitã, em cima de um monte de coisas brilhantes: o selo de ouro do Cobrador, a moeda do Octavius, a do primeiro dia, e a chave do Feitor.)' },
            { quem: 'octavius', texto: 'Você guardou tudo? Sete, você é a maior ladra da história de Roma.' },
            { quem: 'gaivota', texto: 'QUÉ-QUÉ. (Ela parece orgulhosa.)' },
          ],
        },
        {
          id: 'chave-octavius',
          x: 95,
          rotulo: 'Brilho',
          icone: '',
          segredo: 'chave-octavius',
          falas: [
            { quem: 'octavius', texto: 'Entre as tábuas do cais, uma moeda de bronze. Esquisita: no lugar do rosto do imperador, um OLHO riscado.' },
            { quem: 'octavius', texto: 'A borda tem dentes, igual chave. Plano A: guardar. Plano B: guardar MUITO bem, longe da Gaivota.' },
            { quem: 'narrador', texto: 'Você achou um PEDAÇO DA CHAVE (1 de 3). Dizem que os outros dois estão no fim das outras histórias...' },
          ],
        },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'fo-creditos',
      quadros: [{ lugar: 'titulo', efeito: 'clarao', som: 'fanfarra', texto: 'FIM DO CAMINHO DO OCTAVIUS: PLANO B. Obrigado por jogar! O caminho do Helios conta o resto.' }],
    },
  ],
};
