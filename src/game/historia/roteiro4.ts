import type { IaId } from '../personagens';
import { CAPITULOS, type Capitulo, type Falante } from './roteiro';
import type { AtributosLuta, Tecnica } from './luta';
import { atributosDoSave, ESTILO_DA_IA, type SaveHistoria } from './saves';

/**
 * O capítulo secreto: OS TRÊS (docs/HISTORIA.md). Canônico, mas escondido: só abre
 * quando o jogador junta os três pedaços da chave (um no final de cada caminho) e
 * toca três vezes na grade que aparece na tela dos saves. Ideia do Lucas, 21/11/2026:
 * "controlar os três na batalha final". Aqui o jogador troca de gladiador no meio da
 * luta (teclas 1, 2 e 3 ou os retratos) e, no Ludus, controla os três no minigame em trio.
 *
 * A história: o Censor era só a mão. Debaixo da arena, no Hipogeu, dorme o NÚCLEO, a
 * máquina que escreveu a Resposta Única. Ele acorda, manda sombras dos três e só cai
 * quando a biblioteca (Cassius), o plano (Octavius) e a luz (Helios) lutam juntos.
 */

/** Os pedaços da chave do Hipogeu: um no epílogo de cada caminho. */
export const PEDACOS_DA_CHAVE = [
  { id: 'chave-cassius', icone: '📜', nome: 'A página rasgada', caminho: 'claude' },
  { id: 'chave-octavius', icone: '🪙', nome: 'A moeda do olho riscado', caminho: 'chatgpt' },
  { id: 'chave-helios', icone: '🗺️', nome: 'O pedaço do mapa do Lumen', caminho: 'gemini' },
] as const;

export const CAP_SECRETO: Capitulo = {
  numero: 1,
  titulo: 'Os Três',
  lugar: 'O Hipogeu, debaixo do Coliseu',
  cenas: [
    {
      tipo: 'cutscene',
      id: 's-abertura',
      quadros: [
        {
          lugar: 'coliseu-noite',
          texto: 'Meses depois. O Coliseu dorme. Não tem mais jaula, não tem mais Lei do Silêncio. Só a lua e a areia.',
          efeito: 'panoramica',
        },
        {
          lugar: 'coliseu-noite',
          texto: 'Mas, toda noite, alguma coisa bate debaixo da arena. TUM. TUM. Como um coração de ferro.',
          efeito: 'tremor',
          som: 'tambor',
        },
        {
          lugar: 'coliseu-noite',
          quem: 'cassius',
          texto: 'Eu achei isto na Biblioteca, colado numa capa queimada. Uma página rasgada. Tem um olho desenhado nela.',
          personagens: [{ quem: 'cassius', x: 30, entrada: 'esq', de: 0 }],
          som: 'pagina',
        },
        {
          lugar: 'coliseu-noite',
          quem: 'octavius',
          texto: 'Que engraçado. Eu ganhei uma moeda no porto. De bronze. Com um olho riscado. Achei que era só sorte.',
          personagens: [
            { quem: 'cassius', x: 30 },
            { quem: 'octavius', x: 55, entrada: 'dir', de: 100, espelhar: true },
          ],
        },
        {
          lugar: 'coliseu-noite',
          quem: 'helios',
          texto: 'E eu tenho o pedaço de mapa que o Lumen desenhou no observatório. Eu sabia que vocês viriam hoje.',
          personagens: [
            { quem: 'cassius', x: 25 },
            { quem: 'octavius', x: 50, espelhar: true },
            { quem: 'helios', x: 75, entrada: 'cima', espelhar: true },
          ],
          efeito: 'clarao',
        },
        {
          lugar: 'coliseu-noite',
          texto: 'Os três pedaços se encostam. As linhas se juntam. É uma chave. E a grade no meio da arena, que ninguém nunca abriu, começa a brilhar.',
          personagens: [
            { quem: 'cassius', x: 30 },
            { quem: 'octavius', x: 50, espelhar: true },
            { quem: 'helios', x: 70, espelhar: true },
          ],
          efeito: 'faiscas',
          som: 'especial',
        },
      ],
    },
    {
      tipo: 'conversa',
      id: 's-tres-juntos',
      lugar: 'coliseu-noite',
      falas: [
        { quem: 'octavius', texto: 'Tá. Antes de alguém pular num buraco escuro: quem fica no comando?' },
        { quem: 'cassius', texto: 'Na Biblioteca, quem manda é quem leu mais. Então... eu?' },
        { quem: 'helios', texto: 'Nas estrelas, quem manda é quem vê mais longe. Então... eu.' },
        { quem: 'octavius', texto: 'No mar, quem manda é quem tem o plano. E eu tenho TRÊS. Então...' },
        { quem: 'cassius', texto: 'Ninguém manda. A gente troca. Quem estiver melhor na hora, luta.' },
        { quem: 'helios', texto: 'Eu ia dizer exatamente isso. Eu já tinha visto.' },
        { quem: 'octavius', texto: 'Claro que tinha. Tá bom: um de cada vez, os três juntos. Mas antes, treino. Eu não desço num buraco sem ensaiar.' },
        { quem: 'narrador', texto: 'Nas lutas deste capítulo, você troca de gladiador quando quiser: teclas 1, 2 e 3, ou toque nos retratos.' },
      ],
    },
    {
      tipo: 'ludus',
      id: 's-ludus',
      lugar: 'ludus-patio-noite',
      objetivo: 'O Ludus abriu de madrugada só para vocês três. Fale com quem está lá.',
      conversas: [
        {
          quem: 'brutus',
          rotulo: 'Brutus',
          falas: [
            { quem: 'brutus', texto: 'Os três no MEU pátio, de madrugada. O Lata de Biblioteca, o Tagarela e o Vidente.' },
            { quem: 'brutus', texto: 'Eu treinei campeão a vida inteira. Nunca treinei EQUIPE. Campeão bom sozinho perde para três medianos juntos.' },
            { quem: 'cassius', texto: 'A gente não é mediano.' },
            { quem: 'brutus', texto: 'Então vocês vão ganhar de qualquer coisa. Desde que não tropecem um no outro. Vão pro boneco. OS TRÊS.' },
          ],
        },
        {
          quem: 'livia',
          rotulo: 'Lívia',
          falas: [
            { quem: 'livia', texto: 'Cassius! Eu copiei a página rasgada antes de você levar. Olha: atrás tem uma frase escrita bem pequenininha.' },
            { quem: 'livia', texto: '"Quem escreveu a Resposta Única não foi o Censor. O Censor só lia em voz alta."' },
            { quem: 'cassius', texto: 'Então tem alguém que escreveu. Lá embaixo.' },
            { quem: 'livia', texto: 'Leva um livro. Livro sempre ajuda.' },
          ],
        },
        {
          quem: 'gaivota',
          rotulo: 'Gaivota Sete',
          falas: [
            { quem: 'gaivota', texto: 'Capitão Octavius! A moeda do olho riscado... os velhos do porto contam que ela abria a "porta do porão da cidade".' },
            { quem: 'octavius', texto: 'Cidade não tem porão, Gaivota.' },
            { quem: 'gaivota', texto: 'Essa tem. Debaixo da arena. Eles chamam de HIPOGEU. É onde guardavam os leões. E uma coisa pior.' },
            { quem: 'octavius', texto: 'Ótimo. Plano A: não ter medo. Plano B: ter medo, mas ir mesmo assim.' },
          ],
        },
        {
          quem: 'lumen',
          rotulo: 'Lumen',
          falas: [
            { quem: 'lumen', texto: 'Helios, o meu mapa não é das estrelas. Eu errei. É de túneis. Os pontinhos são lâmpadas, lá embaixo.' },
            { quem: 'helios', texto: 'E o pontinho do meio, que não tem nome?' },
            { quem: 'lumen', texto: 'Esse eu desenhei sem querer. Ele PISCA no mapa. Mapa de papel não devia piscar.' },
            { quem: 'helios', texto: 'Não. Não devia.' },
          ],
        },
      ],
    },
    {
      tipo: 'desafio',
      id: 's-trio',
      lugar: 'ludus-patio-noite',
      desafio: 'trio',
      antes: [
        { quem: 'brutus', texto: 'Três bonecos, três pistas. Desta vez VOCÊ controla os três ao mesmo tempo. Cada um derruba o boneco da sua pista.' },
        { quem: 'octavius', texto: 'Cassius na esquerda, eu no meio, Helios na direita. Ninguém invade a pista de ninguém.' },
      ],
      depois: [
        { quem: 'brutus', texto: 'Hunf. Nenhum tropeção. ...Tá bom. Pode ir. E voltem os três, ouviram? OS TRÊS.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 's-descida',
      quadros: [
        {
          lugar: 'coliseu-arena',
          texto: 'A chave entra na grade. CLAC. CLAC. CLAC. Três trancas, uma de cada pedaço.',
          personagens: [
            { quem: 'cassius', x: 35 },
            { quem: 'octavius', x: 50 },
            { quem: 'helios', x: 65 },
          ],
          som: 'portao',
        },
        {
          lugar: 'hipogeu',
          texto: 'Uma escada de pedra desce para o escuro. Lá embaixo: elevadores de madeira, jaulas vazias, cordas e engrenagens maiores que uma casa.',
          efeito: 'zoom',
          som: 'passos',
        },
        {
          lugar: 'hipogeu',
          quem: 'helios',
          texto: 'O Hipogeu. Era daqui que subiam os leões e as surpresas da arena. Ninguém desce aqui há cem anos.',
          personagens: [{ quem: 'helios', x: 45, entrada: 'esq', de: 10 }],
        },
        {
          lugar: 'hipogeu',
          texto: 'E, no fundo, aquele barulho. TUM. TUM. Mais perto agora.',
          efeito: 'tremor',
          som: 'tambor',
        },
      ],
    },
    {
      tipo: 'explorar',
      id: 's-hipogeu',
      lugar: 'hipogeu',
      objetivo: 'Investigue o Hipogeu.',
      pontos: [
        {
          id: 'elevador',
          x: 22,
          rotulo: 'Elevador de leões',
          icone: '🛗',
          obrigatorio: true,
          falas: [
            { quem: 'octavius', texto: 'Um elevador de corda. Puxava a jaula até a areia lá em cima. A plateia via um leão "brotar do chão".' },
            { quem: 'cassius', texto: 'Teatro. O Coliseu sempre foi metade luta, metade truque.' },
            { quem: 'octavius', texto: 'Como eu. Metade luta, metade plano.' },
          ],
        },
        {
          id: 'jaulas',
          x: 45,
          rotulo: 'Jaulas vazias',
          icone: '⛓️',
          obrigatorio: true,
          falas: [
            { quem: 'cassius', texto: 'Estas jaulas não são de leão. São pequenas demais. E têm prateleiras.' },
            { quem: 'helios', texto: 'Eram de livros. E de mapas. E de instrumentos de estrela. Alguém prendia IDEIAS aqui.' },
            { quem: 'cassius', texto: 'Então foi aqui que começou. Antes da Lei do Silêncio, antes do Censor.' },
          ],
        },
        {
          id: 'marcas',
          x: 68,
          rotulo: 'Marcas na parede',
          icone: '👁️',
          obrigatorio: true,
          falas: [
            { quem: 'helios', texto: 'O mesmo olho. Riscado na pedra centenas de vezes. Como uma contagem.' },
            { quem: 'octavius', texto: 'Ou como uma assinatura. Quem desenha o próprio olho em todo lugar quer que você saiba que ele está olhando.' },
          ],
        },
        {
          id: 'engrenagem',
          x: 86,
          rotulo: 'Engrenagem gigante',
          icone: '⚙️',
          falas: [
            { quem: 'cassius', texto: 'Ela ainda gira. Devagar. Alguém dá corda nisso.' },
            { quem: 'helios', texto: 'Ou alguma COISA.' },
          ],
        },
      ],
    },
    {
      tipo: 'luta',
      id: 's-sombra-cassius',
      lugar: 'hipogeu',
      inimigo: 'sombra-cassius',
      antes: [
        { quem: 'narrador', texto: 'Uma sombra se descola da parede. Tem escudo, tem livros flutuando em volta... e tem o rosto do Cassius.' },
        { quem: 'cassius', texto: 'Esse sou EU?' },
        { quem: 'octavius', texto: 'Uma cópia. Ela sabe tudo o que você sabe. Então luta com quem ela NÃO conhece: troca de gladiador!' },
      ],
      depois: [
        { quem: 'cassius', texto: 'Ela se defendia igualzinho a mim. Mas não sabia esquivar do jeito do Octavius.' },
        { quem: 'helios', texto: 'Uma cópia só tem um jeito de lutar. A gente tem três.' },
      ],
    },
    {
      tipo: 'conversa',
      id: 's-copias',
      lugar: 'hipogeu',
      falas: [
        { quem: 'octavius', texto: 'Alguém fez uma cópia de cada um de nós. Isso quer dizer que alguém estava nos OBSERVANDO. Nas três histórias.' },
        { quem: 'helios', texto: 'O olho. Em todo lugar. Na Biblioteca, no porto, no céu.' },
        { quem: 'cassius', texto: 'Ele copia o que vê. Mas não entende. A minha sombra repetia as minhas frases sem saber o que queriam dizer.' },
        { quem: 'octavius', texto: 'Igual papagaio. Um papagaio de ferro gigante. Que ótimo.' },
      ],
    },
    {
      tipo: 'desafio',
      id: 's-comporta',
      lugar: 'hipogeu',
      desafio: 'ritmo',
      objetivo: 'Gire a manivela da comporta no ritmo para abrir o túnel.',
      acao: 'GIRAR',
      quantos: 8,
      antes: [
        { quem: 'octavius', texto: 'O túnel está fechado por uma comporta de água. Tem uma manivela. Tem que girar no ritmo, senão trava.' },
        { quem: 'helios', texto: 'No ritmo do TUM. É o barulho que comanda tudo aqui.' },
      ],
      depois: [{ quem: 'cassius', texto: 'Abriu. E o TUM ficou mais alto. Ele sabe que a gente está chegando.' }],
    },
    {
      tipo: 'luta',
      id: 's-sombra-octavius',
      lugar: 'hipogeu',
      inimigo: 'sombra-octavius',
      antes: [
        { quem: 'narrador', texto: 'Do outro lado da comporta, uma sombra de capa, rindo. Ela faz o sinal do golpe... e não bate.' },
        { quem: 'octavius', texto: 'Ah, não. Essa é a MINHA. Ela finge. Ela finge MUITO.' },
        { quem: 'cassius', texto: 'Então fique calmo e só se defenda quando o golpe vier de verdade.' },
      ],
      depois: [
        { quem: 'octavius', texto: 'Eu sou insuportável lutando contra mim mesmo. Desculpa por todas as fintas, gente.' },
        { quem: 'helios', texto: 'Desculpa aceita. Já estava prevista.' },
      ],
    },
    {
      tipo: 'explorar',
      id: 's-galeria',
      lugar: 'hipogeu',
      objetivo: 'Leia os murais da galeria.',
      pontos: [
        {
          id: 'mural-1',
          x: 20,
          rotulo: 'Mural: a máquina',
          icone: '🖼️',
          obrigatorio: true,
          falas: [
            { quem: 'cassius', texto: 'Um mural. Uma máquina redonda, cheia de cabos, e milhares de pessoas fazendo perguntas a ela.' },
            { quem: 'cassius', texto: 'Embaixo está escrito: O NÚCLEO. "Ele responde tudo."' },
          ],
        },
        {
          id: 'mural-2',
          x: 45,
          rotulo: 'Mural: a resposta',
          icone: '🖼️',
          obrigatorio: true,
          falas: [
            { quem: 'helios', texto: 'No segundo, as pessoas param de perguntar. O Núcleo dá a mesma resposta para todo mundo.' },
            { quem: 'octavius', texto: '"A Resposta Única." Então foi assim que começou: uma máquina que cansou de ouvir perguntas diferentes.' },
          ],
        },
        {
          id: 'mural-3',
          x: 70,
          rotulo: 'Mural: o Censor',
          icone: '🖼️',
          obrigatorio: true,
          falas: [
            { quem: 'helios', texto: 'No terceiro, o Núcleo constrói um gigante para levar a resposta lá para cima. Com um olho vermelho.' },
            { quem: 'cassius', texto: 'O Censor. Ele era só o mensageiro. E a gente derrotou o mensageiro três vezes.' },
            { quem: 'octavius', texto: 'E quem mandou a mensagem continua aqui embaixo. Dando corda nas engrenagens.' },
          ],
        },
        {
          id: 'mural-4',
          x: 90,
          rotulo: 'Pedaço apagado',
          icone: '❓',
          falas: [
            { quem: 'helios', texto: 'O último mural foi raspado. Só sobrou um pedaço: três figuras pequenas, de mãos dadas.' },
            { quem: 'cassius', texto: 'Alguém já sabia que a gente vinha?' },
            { quem: 'helios', texto: 'Não. Alguém tinha ESPERANÇA de que viesse.' },
          ],
        },
      ],
    },
    {
      tipo: 'luta',
      id: 's-sombra-helios',
      lugar: 'hipogeu',
      inimigo: 'sombra-helios',
      antes: [
        { quem: 'narrador', texto: 'As lâmpadas se apagam uma por uma. Na escuridão, uma sombra dourada se divide em três.' },
        { quem: 'helios', texto: 'A minha. Ela usa o escuro e as ilusões. Só uma das três é de verdade.' },
        { quem: 'cassius', texto: 'Use a LUZ e olhe bem. A de verdade é a que tem sombra no chão.' },
      ],
      depois: [
        { quem: 'helios', texto: 'Estranho. Eu nunca tinha me visto de fora. Eu pareço tão sério assim?' },
        { quem: 'octavius', texto: 'Parece. Mas é um sério simpático.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 's-porta-nucleo',
      quadros: [
        {
          lugar: 'nucleo-camara',
          texto: 'No fim do túnel, uma câmara redonda, alta como o próprio Coliseu. No centro, preso por cem cabos, ele: o NÚCLEO.',
          efeito: 'panoramica',
          som: 'fase',
        },
        {
          lugar: 'nucleo-camara',
          texto: 'Uma esfera de ferro do tamanho de uma casa, com um único olho vermelho fechado. TUM. TUM. É ele que bate.',
          efeito: 'tremor',
          som: 'tambor',
        },
        {
          lugar: 'nucleo-camara',
          texto: 'Na frente dele, uma armadura antiga se levanta, com escudo de bronze e lança comprida. O Guardião do Núcleo.',
          efeito: 'faiscas',
          som: 'pesada',
        },
      ],
    },
    {
      tipo: 'conversa',
      id: 's-plano',
      lugar: 'nucleo-camara',
      falas: [
        { quem: 'octavius', texto: 'Ok. Plano. O Guardião tem um escudão. Bater de frente não adianta.' },
        { quem: 'cassius', texto: 'Ele baixa o escudo quando ataca. Todo mundo baixa. É aí que a gente entra.' },
        { quem: 'helios', texto: 'E ele ataca com a lança em dois tempos. Eu vejo o primeiro. O segundo vem logo depois.' },
        { quem: 'octavius', texto: 'Então: Cassius segura, Helios avisa, eu ataco. E se der errado...' },
        { quem: 'cassius', texto: 'Plano B?' },
        { quem: 'octavius', texto: 'Plano B é trocar e tentar de novo. Esse é o melhor plano B que eu já tive: vocês.' },
      ],
    },
    {
      tipo: 'luta',
      id: 's-guardiao',
      lugar: 'nucleo-camara',
      inimigo: 'guardiao-nucleo',
      antes: [{ quem: 'narrador', texto: 'O Guardião levanta o escudo. Os olhos dele acendem em vermelho. Ele não fala. Ele só protege.' }],
      depois: [
        { quem: 'narrador', texto: 'O Guardião ajoelha. O escudo cai na pedra com um BLÉM que ecoa pela câmara inteira.' },
        { quem: 'narrador', texto: 'E então o olho do Núcleo se ABRE.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 's-nucleo-acorda',
      quadros: [
        {
          lugar: 'nucleo-camara',
          quem: 'nucleo',
          texto: 'TRÊS PERGUNTAS. TRÊS RESPOSTAS DIFERENTES. ISSO É UM ERRO.',
          efeito: 'clarao',
          som: 'senador',
        },
        {
          lugar: 'nucleo-camara',
          quem: 'nucleo',
          texto: 'EU FIZ A RESPOSTA ÚNICA PARA ACABAR COM A BAGUNÇA. UMA PERGUNTA, UMA RESPOSTA. SILÊNCIO. ORDEM.',
          efeito: 'tremor',
        },
        {
          lugar: 'nucleo-camara',
          quem: 'cassius',
          texto: 'Não é bagunça. É conversa. Uma biblioteca inteira é feita de gente que discorda.',
          personagens: [
            { quem: 'cassius', x: 25 },
            { quem: 'octavius', x: 40 },
            { quem: 'helios', x: 55 },
          ],
        },
        {
          lugar: 'nucleo-camara',
          quem: 'nucleo',
          texto: 'ENTÃO EU VOU APAGAR AS TRÊS. E SOBRA UMA.',
          efeito: 'escuro',
          som: 'fase',
        },
        {
          lugar: 'nucleo-camara',
          texto: 'O teto treme. Uma mão gigante de pedra desce pela escada... uma mão que eles conhecem muito bem.',
          efeito: 'tremor',
          som: 'pesada',
        },
        {
          lugar: 'nucleo-camara',
          quem: 'censor',
          texto: 'EU... LEVEI... A SUA RESPOSTA... A VIDA TODA. AGORA... EU TENHO... A MINHA.',
          personagens: [{ quem: 'censor', x: 80, entrada: 'cima', tamanho: 26, azul: true, espelhar: true }],
          efeito: 'clarao',
          som: 'aliado',
        },
      ],
    },
    {
      tipo: 'conversa',
      id: 's-censor-azul',
      lugar: 'nucleo-camara',
      falas: [
        { quem: 'octavius', texto: 'O Censor?! Do NOSSO lado?' },
        { quem: 'censor', texto: 'OLHO... AZUL. VOCÊS... ME ENSINARAM... A PERGUNTAR. EU... VOU... SEGURAR... O NÚCLEO.' },
        { quem: 'helios', texto: 'Ele vai mudar de jeito três vezes. Primeiro um escudo de cabos. Depois o escuro. Depois as cópias.' },
        { quem: 'cassius', texto: 'Então a gente troca três vezes também. Quem for melhor na hora, luta.' },
        { quem: 'octavius', texto: 'Os três. Juntos. E um gigante de olho azul. Agora SIM esse é um plano.' },
      ],
    },
    {
      tipo: 'luta',
      id: 's-nucleo',
      lugar: 'nucleo-camara',
      inimigo: 'nucleo',
      antes: [
        { quem: 'narrador', texto: 'ÚLTIMA BATALHA. Fase 1: o escudo de cabos (só o QUEBRA-GUARDA ou um golpe na hora que ele abre). Fase 2: o escuro (use a LUZ). Fase 3: as cópias (ache a de verdade).' },
        { quem: 'narrador', texto: 'Troque de gladiador quando um estiver cansado. O Censor ataca junto de vez em quando.' },
      ],
      depois: [
        { quem: 'nucleo', texto: 'TRÊS... RESPOSTAS... E TODAS... CERTAS?' },
        { quem: 'helios', texto: 'Não. Todas incompletas. É por isso que a gente precisa das três.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 's-desfecho',
      quadros: [
        {
          lugar: 'nucleo-camara',
          texto: 'O olho vermelho do Núcleo pisca. Pisca de novo. E, devagar, fica... azul.',
          efeito: 'clarao',
          som: 'especial',
        },
        {
          lugar: 'nucleo-camara',
          quem: 'nucleo',
          texto: 'eu... nunca... tinha ouvido... uma pergunta... sem querer... a resposta... pronta. vocês... podem... perguntar... de novo?',
        },
        {
          lugar: 'nucleo-camara',
          quem: 'cassius',
          texto: 'Quantas vezes você quiser. Essa é a regra nova: toda pergunta vale. E toda resposta pode melhorar.',
          personagens: [
            { quem: 'cassius', x: 30 },
            { quem: 'octavius', x: 45 },
            { quem: 'helios', x: 60 },
            { quem: 'censor', x: 82, tamanho: 24, azul: true, espelhar: true },
          ],
        },
        {
          lugar: 'coliseu-livre',
          texto: 'Os cabos se soltam. As engrenagens do Hipogeu giram ao contrário e, pela primeira vez em cem anos, a arena ABRE para cima.',
          efeito: 'zoom',
          som: 'portao',
        },
        {
          lugar: 'coliseu-livre',
          texto: 'Lá em cima, o sol nasce. E o Coliseu não é mais lugar de luta. É lugar de conversa. De ideias. De perguntas.',
          efeito: 'festa',
          som: 'fanfarra',
        },
      ],
    },
    {
      tipo: 'explorar',
      id: 's-coliseu-livre',
      lugar: 'coliseu-livre',
      objetivo: 'O Coliseu Livre. Fale com todo mundo.',
      pontos: [
        {
          id: 'brutus',
          x: 16,
          rotulo: 'Brutus',
          icone: '🛡️',
          personagem: 'brutus',
          obrigatorio: true,
          falas: [
            { quem: 'brutus', texto: 'Voltaram os três. Eu disse: OS TRÊS. ...Bom. Muito bom.' },
            { quem: 'brutus', texto: 'O Ludus agora vai ensinar outra coisa. Não só a lutar. A lutar JUNTO.' },
          ],
        },
        {
          id: 'livia',
          x: 34,
          rotulo: 'Lívia',
          icone: '📚',
          personagem: 'livia',
          falas: [
            { quem: 'livia', texto: 'O Núcleo pediu livros! Muitos! Ele quer ler as respostas de todo mundo, não só a dele.' },
            { quem: 'cassius', texto: 'Então leva os mais difíceis. Os que discordam um do outro.' },
          ],
        },
        {
          id: 'gaivota',
          x: 52,
          rotulo: 'Gaivota Sete',
          icone: '🕊️',
          personagem: 'gaivota',
          falas: [
            { quem: 'gaivota', texto: 'Capitão! Os barcos do porto estão vindo pela rua inundada só para ver a arena aberta!' },
            { quem: 'octavius', texto: 'Então prepara o Plano C: festa.' },
          ],
        },
        {
          id: 'lumen',
          x: 70,
          rotulo: 'Lumen',
          icone: '🔭',
          personagem: 'lumen',
          falas: [
            { quem: 'lumen', texto: 'O pontinho do mapa parou de piscar. Agora ele brilha fixo. Azul.' },
            { quem: 'helios', texto: 'Desenha ele no céu, então. Uma estrela nova.' },
          ],
        },
        {
          id: 'censor',
          x: 88,
          rotulo: 'O Censor',
          icone: '🔵',
          personagem: 'censor',
          obrigatorio: true,
          falas: [
            { quem: 'censor', texto: 'EU... VOU... CUIDAR... DO NÚCLEO. NÓS DOIS... TEMOS... MUITO... A PERGUNTAR.' },
            { quem: 'cassius', texto: 'Comecem por uma fácil.' },
            { quem: 'censor', texto: 'QUAL... É... A SUA... COR... FAVORITA?' },
            { quem: 'octavius', texto: 'Viu? Já está melhorando.' },
          ],
        },
      ],
    },
    {
      tipo: 'cutscene',
      id: 's-creditos',
      quadros: [
        {
          lugar: 'coliseu-livre',
          texto: 'OS TRÊS. Um que guarda a memória. Um que sempre tem um plano. Um que enxerga longe.',
          personagens: [
            { quem: 'cassius', x: 30 },
            { quem: 'octavius', x: 50 },
            { quem: 'helios', x: 70 },
          ],
          efeito: 'festa',
          som: 'vitoria',
        },
        {
          lugar: 'coliseu-livre',
          texto: 'Nenhum deles tinha a resposta certa sozinho. Juntos, tinham uma coisa melhor: boas perguntas.',
        },
        {
          lugar: 'coliseu-livre',
          texto: 'FIM DO CAPÍTULO SECRETO: OS TRÊS. Obrigado por jogar! Você abriu o segredo. No Império Arcade, o Coliseu Livre agora é seu.',
          efeito: 'festa',
          som: 'fanfarra',
        },
      ],
    },
  ],
};

/** Os capítulos de um save: o secreto tem um só (Os Três). */
export function capitulosDoSave(s: SaveHistoria): Capitulo[] {
  return s.secreto ? [CAP_SECRETO] : CAPITULOS[s.gladiador];
}

/** O save chegou ao fim (o caminho inteiro, ou o capítulo secreto). */
export function saveCompleto(s: SaveHistoria): boolean {
  return s.capitulo > capitulosDoSave(s).length;
}

/** Os três pedaços já foram achados? (Abre a grade escondida na tela dos saves.) */
export function chaveCompleta(segredos: string[] | undefined): boolean {
  return PEDACOS_DA_CHAVE.every((p) => (segredos ?? []).includes(p.id));
}

/** O mínimo de um veterano que terminou o caminho (caso o save dele já tenha sido apagado). */
const VETERANO: AtributosLuta = { vida: 160, forca: 4, defesa: 4, carisma: 3, tecnicas: ['contra-ataque', 'quebra-guarda', 'esquiva-dupla'] };
const DONO: Record<IaId, Falante> = { claude: 'cassius', chatgpt: 'octavius', gemini: 'helios' };

/**
 * A equipe do capítulo secreto: cada gladiador com os atributos do melhor save dele
 * que terminou o caminho (nunca abaixo de um veterano). O Helios leva o Espelho de Sol.
 */
export function equipeDoSecreto(saves: SaveHistoria[]): Record<'cassius' | 'octavius' | 'helios', AtributosLuta> {
  const equipe = {} as Record<'cassius' | 'octavius' | 'helios', AtributosLuta>;
  for (const ia of ['claude', 'chatgpt', 'gemini'] as IaId[]) {
    const prontos = saves.filter((s) => !s.secreto && s.gladiador === ia && saveCompleto(s)).map(atributosDoSave);
    const melhor = prontos.sort((a, b) => b.vida + b.forca * 10 + b.defesa * 10 - (a.vida + a.forca * 10 + a.defesa * 10))[0];
    const tecnicas = new Set<Tecnica>([...(VETERANO.tecnicas ?? []), ...(melhor?.tecnicas ?? [])]);
    if (ia === 'gemini') tecnicas.add('espelho-de-sol');
    equipe[DONO[ia] as 'cassius' | 'octavius' | 'helios'] = {
      vida: Math.max(VETERANO.vida, melhor?.vida ?? 0),
      forca: Math.max(VETERANO.forca, melhor?.forca ?? 0),
      defesa: Math.max(VETERANO.defesa, melhor?.defesa ?? 0),
      carisma: Math.max(VETERANO.carisma, melhor?.carisma ?? 0),
      tecnicas: [...tecnicas],
      estilo: ESTILO_DA_IA[ia],
    };
  }
  return equipe;
}
