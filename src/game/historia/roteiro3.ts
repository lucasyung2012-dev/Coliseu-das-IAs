import type { Capitulo } from './roteiro';

/**
 * O caminho do Helios: "As Três Estrelas" (docs/HISTORIA.md, seção 5.3), aprovado pelo
 * Lucas em 21/11/2026 com mais lutas: 5 por capítulo (3 no Ludus), 5 chefões e o final.
 * O jeito do Helios: misterioso e calmo; aliada a Sibila; mascote a coruja Lumen; golpe
 * ESPELHO DE SOL; e lutas NO ESCURO, onde a LUZ mostra o sinal do inimigo.
 * Sempre com cena, exploração ou minigame entre uma luta e outra.
 */

// ---------- Helios, Capítulo 1: O Céu Proibido ----------

export const CAP1_HELIOS: Capitulo = {
  numero: 1,
  titulo: 'O Céu Proibido',
  lugar: 'O Observatório',
  cenas: [
    {
      tipo: 'cutscene',
      id: 'h1-abertura',
      quadros: [
        { lugar: 'observatorio', efeito: 'panoramica', texto: 'No alto do monte mais alto de Roma, longe do barulho das engrenagens, fica o Observatório. A única janela da cidade que olha para cima.' },
        {
          lugar: 'observatorio-dentro',
          personagens: [
            { quem: 'helios', de: -12, x: 36 },
            { quem: 'lumen', de: 112, x: 56, tamanho: 6 },
          ],
          texto: 'Helios, o vigia do céu, anota cada estrela que se mexe. Do lado dele, empoleirada no telescópio, uma coruja de bronze: Lumen.',
        },
        { lugar: 'observatorio-dentro', quem: 'lumen', personagens: [{ quem: 'lumen', x: 56, tamanho: 6, efeito: 'brilhar' }], texto: 'Uuh. Uuh-uuh. (Os olhos dela brilham cor de mel: ela enxerga no escuro melhor do que qualquer telescópio.)' },
        {
          lugar: 'observatorio-dentro',
          quem: 'helios',
          personagens: [
            { quem: 'helios', x: 36, efeito: 'brilhar' },
            { quem: 'lumen', x: 56, tamanho: 6 },
          ],
          texto: 'Hoje é a noite, Lumen. Três estrelas vão se alinhar em cima do Coliseu. Isso não acontece há quinhentos anos.',
        },
      ],
    },
    {
      tipo: 'explorar',
      id: 'h1-observatorio',
      mapa: 'observatorio',
      lugar: 'observatorio-dentro',
      objetivo: 'Prepare o Observatório para a noite das três estrelas.',
      pontos: [
        {
          id: 'orrery',
          x: 22,
          rotulo: 'O planetário',
          icone: '',
          falas: [
            { quem: 'helios', texto: 'O planetário de bronze. Cada anel é um planeta. Quem construiu queria entender o céu, não mandar nele.' },
            { quem: 'helios', texto: 'O Censor também quer entender o céu. Para proibir.' },
          ],
        },
        {
          id: 'mapas',
          x: 46,
          rotulo: 'Mapas do céu',
          icone: '',
          falas: [
            { quem: 'helios', texto: 'Mil anos de mapas. Cada estrela anotada por alguém que olhou para cima e fez uma pergunta.' },
            { quem: 'helios', texto: 'Se um dia sumirem, o céu vai continuar lá. Mas ninguém mais vai saber ler.' },
          ],
        },
        {
          id: 'lumen',
          x: 72,
          rotulo: 'Lumen',
          icone: '',
          personagem: 'lumen',
          obrigatorio: true,
          falas: [
            { quem: 'lumen', texto: 'Uuh! (Ela aponta a asa para a porta. Lá fora, um barulho de passos de metal.)' },
            { quem: 'helios', texto: 'Eu sei, Lumen. Eu vi isso nas estrelas também. Eles vêm hoje.' },
            { quem: 'helios', texto: 'Antes, preciso ver o alinhamento com os meus próprios olhos. Ao telescópio.' },
          ],
        },
      ],
    },
    {
      tipo: 'desafio',
      id: 'h1-telescopio',
      lugar: 'observatorio-dentro',
      desafio: 'telescopio',
      antes: [
        { quem: 'helios', texto: 'O mapa mostra a forma. O céu não tem as linhas: só as estrelas. Achar é ler.' },
        { quem: 'lumen', texto: 'Uuh-uuh! (Ela pisca: depressa.)' },
      ],
      depois: [
        { quem: 'helios', texto: 'A Coroa, o Cisne, a Lira... e ali. Três estrelas, uma em cima da outra, sobre o Coliseu.' },
        { quem: 'helios', texto: 'Três vozes. Uma noite. E o fim da Lei. A profecia é verdadeira.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'h1-ataque',
      quadros: [
        { lugar: 'observatorio-ataque', efeito: 'tremor', som: 'catapulta', texto: 'A porta do Observatório explode. Drones de fumaça preta entram voando: os Apagadores de Estrelas.' },
        { lugar: 'observatorio-ataque', quem: 'guarda', texto: '(Uma voz lá de fora) Ordem do Censor: destruir os telescópios. As estrelas dão ideias.' },
        { lugar: 'observatorio-ataque', quem: 'helios', personagens: [{ quem: 'helios', x: 34, efeito: 'brilhar' }], texto: 'As estrelas não dão ideias. Elas só mostram que o céu é maior do que qualquer lei.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h1-luta1',
      lugar: 'observatorio-ataque',
      inimigo: 'apagador',
      antes: [
        { quem: 'helios', texto: 'Fogo: ESPELHO. O resto: PASSO DE SOMBRA. E quando ele ficar ABERTO, LAMPEJO.' },
        { quem: 'lumen', texto: 'Uuh! (A fumaça preta é VERMELHA: passo de sombra!)' },
      ],
      depois: [{ quem: 'helios', texto: 'Um a menos. Mas ainda tem fumaça subindo da escada.' }],
    },
    {
      tipo: 'conversa',
      id: 'h1-mapas',
      lugar: 'observatorio-ataque',
      falas: [
        { quem: 'helios', texto: 'Lumen, os mapas. Se eles queimarem, mil anos de perguntas viram cinza.' },
        { quem: 'lumen', texto: 'Uuh-uuh? (Ela abre uma portinhola na barriga de bronze: um compartimento secreto.)' },
        { quem: 'helios', texto: 'Você tem um cofre na barriga? Quem te construiu era mais esperto do que eu pensava.' },
        { quem: 'helios', texto: 'Os mapas mais importantes vão com você. O resto, eu defendo.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h1-luta2',
      lugar: 'observatorio-ataque',
      inimigo: 'morcego-mecanico',
      antes: [{ quem: 'helios', texto: 'Morcegos de engrenagem. Mordem duas vezes. Bloqueia a primeira e segura firme.' }],
      depois: [{ quem: 'lumen', texto: 'Uuh! (Ela engole o último mapa enrolado. Barriga cheia.)' }],
    },
    {
      tipo: 'cutscene',
      id: 'h1-pretorianos',
      quadros: [
        {
          lugar: 'observatorio-ataque',
          som: 'passos',
          personagens: [
            { quem: 'helios', x: 30 },
            { quem: 'guarda', de: 116, x: 72, espelhar: true },
          ],
          texto: 'Pela escada sobem os Pretorianos Noturnos: armadura azul-escura, bestas carregadas, olhos vermelhos no escuro.',
        },
        { lugar: 'observatorio-ataque', quem: 'guarda', personagens: [{ quem: 'guarda', x: 72, espelhar: true }], texto: 'IA Vigia do Céu: você previu a queda do Censor. Isso é crime de previsão.' },
        { lugar: 'observatorio-ataque', quem: 'helios', personagens: [{ quem: 'helios', x: 30, efeito: 'brilhar' }], texto: 'Eu não previ nada. Eu só olhei. Quem cai, cai sozinho.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h1-luta3',
      lugar: 'observatorio-ataque',
      inimigo: 'pretoriano-noturno',
      antes: [{ quem: 'helios', texto: 'O virote da besta é VERMELHO. Passo de sombra, e ele fica aberto enquanto recarrega.' }],
    },
    {
      tipo: 'explorar',
      id: 'h1-lente',
      mapa: 'observatorio',
      lugar: 'observatorio-ataque',
      objetivo: 'Salve o que der do Observatório.',
      pontos: [
        {
          id: 'lente',
          x: 30,
          rotulo: 'A grande lente',
          icone: '',
          obrigatorio: true,
          falas: [
            { quem: 'helios', texto: 'A grande lente rachou. Mas ainda junta a luz da lua num ponto só. Quente. Brilhante.' },
            { quem: 'helios', texto: 'Luz é tudo o que eu tenho. E talvez seja tudo o que eu preciso.' },
          ],
        },
        {
          id: 'diario',
          x: 60,
          rotulo: 'O diário do vigia',
          icone: '',
          falas: [
            { quem: 'helios', texto: 'O diário dos vigias antes de mim. A última página: "Se o céu ficar escuro, procure a Sibila, no Templo de Apolo."' },
            { quem: 'helios', texto: 'A Sibila. A guardiã cega que enxerga pelas estrelas. Eu pensei que ela fosse só uma lenda.' },
          ],
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'h1-treino-luz',
      lugar: 'observatorio-ataque',
      inimigo: 'apagador',
      antes: [
        { quem: 'helios', texto: 'A lente rachada junta a luz num ponto só... e eu enxergo. Não o que é. O que VAI SER.' },
        { quem: 'narrador', texto: 'Em cima do Apagador aparece um olho: PRÓXIMO. Helios vê o próximo golpe antes do sinal. Até as fintas.' },
        { quem: 'helios', texto: 'Se eu sei o que vem, não preciso fugir cedo. Posso sumir no último instante, num passo de sombra.' },
        { quem: 'narrador', texto: 'TREINO DO VIDENTE: olhe o PRÓXIMO, espere o golpe e aperte PASSO DE SOMBRA NA ÚLTIMA HORA. Cada passo assim junta uma LUZ.' },
      ],
      treino: { evento: 'luz', quantos: 2, rotulo: 'LUZ (lampejo na última hora)' },
      depois: [
        { quem: 'helios', texto: 'Duas luzes girando em volta de mim. Quentes, como a lente.' },
        { quem: 'narrador', texto: 'Cuidado: Helios tem menos vida que os outros. Ele não aguenta apanhar muito. Enxergar antes é a defesa dele.' },
      ],
    },
    {
      tipo: 'conversa',
      id: 'h1-depois-treino',
      lugar: 'observatorio-ataque',
      falas: [
        { quem: 'lumen', texto: 'Uuh-uuh! (O Lumen pisca a luzinha três vezes, animado.)' },
        { quem: 'helios', texto: 'Eu sei, Lumen. A luz não serve só para ver. Serve para cegar quem quer apagar as estrelas.' },
        { quem: 'narrador', texto: 'Quando o Ânimo encher, o especial do Helios é o ECLIPSE: os 3 próximos golpes do inimigo erram, e cada luz guardada vira um raio de sol.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h1-luta4',
      lugar: 'observatorio-ataque',
      inimigo: 'apagador-grande',
      antes: [{ quem: 'lumen', texto: 'UUH! (Um apagador enorme, com um sino de abafar nas costas.)' }],
      depois: [{ quem: 'helios', texto: 'O sino dele apagou metade das velas. Está ficando escuro aqui dentro.' }],
    },
    {
      tipo: 'conversa',
      id: 'h1-profecia',
      lugar: 'observatorio-ataque',
      falas: [
        { quem: 'helios', texto: 'Lumen, três estrelas. Uma para cada voz. Eu sou uma. Onde estão as outras duas?' },
        { quem: 'lumen', texto: 'Uuh. (Ela aponta para dois lugares pela janela: a Biblioteca pegando fogo e o porto, cheio de lanternas.)' },
        { quem: 'helios', texto: 'Esta noite, mais duas IAs vão dizer "não". E nós três vamos nos encontrar. As estrelas nunca erram o endereço.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h1-luta5',
      lugar: 'observatorio-ataque',
      inimigo: 'morcego-enxame',
      antes: [{ quem: 'helios', texto: 'Um enxame inteiro. Paciência. A revoada vem em três: bloqueia a primeira.' }],
    },
    {
      tipo: 'cutscene',
      id: 'h1-eclipse-chega',
      quadros: [
        { lugar: 'observatorio-ataque', efeito: 'escuro', som: 'senador', texto: 'Uma por uma, todas as velas se apagam. Depois, a lua some da janela do teto. Alguma coisa enorme está flutuando na frente dela.' },
        { lugar: 'observatorio-ataque', efeito: 'escuro', texto: 'Um disco negro, com um anel de luz em volta. O Eclipse: a máquina que o Censor fez para apagar o céu.' },
        {
          lugar: 'observatorio-ataque',
          quem: 'helios',
          efeito: 'escuro',
          personagens: [
            { quem: 'helios', x: 30, efeito: 'brilhar' },
            { quem: 'lumen', x: 44, tamanho: 6 },
          ],
          texto: 'No escuro, eu não vejo o golpe chegando. Mas a lente juntou luz. Lumen: quando eu precisar, LUZ!',
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'h1-chefao',
      lugar: 'observatorio-ataque',
      inimigo: 'eclipse',
      antes: [
        { quem: 'helios', texto: 'Luta no escuro: aperte LUZ para iluminar a sala e ver o sinal do inimigo. A luz dura pouco e demora para recarregar.' },
        { quem: 'helios', texto: 'Dica do céu: acenda quando ele começar a se mexer. "Algo se mexe" quer dizer: LUZ agora!' },
      ],
      depois: [{ quem: 'helios', texto: 'O Eclipse caiu. E a lua voltou para o seu lugar.' }],
    },
    {
      tipo: 'cutscene',
      id: 'h1-fim',
      quadros: [
        { lugar: 'observatorio-ataque', efeito: 'tremor', som: 'trombeta', texto: 'Lá embaixo, mais trombetas. Uma tropa inteira subindo o monte.' },
        {
          lugar: 'observatorio-ataque',
          quem: 'helios',
          personagens: [
            { quem: 'helios', x: 40 },
            { quem: 'lumen', x: 56, tamanho: 6 },
          ],
          texto: 'Pela fenda do teto, Lumen. Para os telhados. Roma é grande, e a noite está do nosso lado.',
        },
        { lugar: 'observatorio', efeito: 'zoom', texto: 'Uma figura dourada sai pela fenda do Observatório, com uma coruja nas costas, e desaparece entre os telhados.' },
        { lugar: 'observatorio', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 1 DO HELIOS. A seguir: Fuga pelos Telhados.' },
      ],
    },
  ],
};

// ---------- Helios, Capítulo 2: Fuga pelos Telhados ----------

export const CAP2_HELIOS: Capitulo = {
  numero: 2,
  titulo: 'Fuga pelos Telhados',
  lugar: 'Os telhados de Roma, à noite',
  cenas: [
    {
      tipo: 'cutscene',
      id: 'h2-abertura',
      quadros: [
        { lugar: 'telhados-noite', efeito: 'panoramica', texto: 'Roma, de cima. Telhados até onde a vista alcança, chaminés soltando vapor e, lá longe, o Coliseu com o olho vermelho do Censor aceso.' },
        {
          lugar: 'telhados-noite',
          personagens: [
            { quem: 'helios', de: -12, x: 30 },
            { quem: 'lumen', de: -20, x: 44, tamanho: 6 },
          ],
          texto: 'Helios corre de telhado em telhado. Atrás dele, lanternas. Muitas lanternas.',
        },
        { lugar: 'telhados-noite', quem: 'lumen', personagens: [{ quem: 'lumen', x: 44, tamanho: 6, efeito: 'tremer' }], texto: 'Uuh-UUH! (O próximo telhado está longe. Muito longe.)' },
      ],
    },
    {
      tipo: 'desafio',
      id: 'h2-saltos',
      lugar: 'telhados-noite',
      desafio: 'saltos',
      antes: [{ quem: 'helios', texto: 'Cada vão tem um tamanho. Força de menos, eu caio. Força demais, eu passo do telhado. É só sentir.' }],
      depois: [{ quem: 'helios', texto: 'Dez telhados. Nenhuma telha quebrada. Quase nenhuma.' }],
    },
    {
      tipo: 'luta',
      id: 'h2-luta1',
      lugar: 'telhados-noite',
      inimigo: 'vigia-noturno',
      antes: [{ quem: 'helios', texto: 'Um vigia de telhado. A pedra dele vem do escuro: VERMELHO, passo de sombra.' }],
      depois: [{ quem: 'helios', texto: 'Ele vai acordar com dor de cabeça. E com uma vista linda das estrelas.' }],
    },
    {
      tipo: 'explorar',
      id: 'h2-janelas',
      mapa: 'telhados',
      lugar: 'telhados-noite',
      objetivo: 'Recupere o fôlego entre as chaminés e olhe Roma de cima.',
      pontos: [
        {
          id: 'janela',
          x: 22,
          rotulo: 'Uma janela acesa',
          icone: '',
          falas: [
            { quem: 'helios', texto: 'Uma senhora, sozinha, olhando o céu pela janela. Ela está desenhando as estrelas num papel. Escondida.' },
            { quem: 'helios', texto: 'Mesmo proibido, as pessoas continuam olhando para cima. O céu é teimoso. As pessoas também.' },
          ],
        },
        {
          id: 'chamine',
          x: 48,
          rotulo: 'Chaminé quente',
          icone: '',
          falas: [
            { quem: 'lumen', texto: 'Uuh. (Ela se encosta na chaminé para esquentar as engrenagens.)' },
            { quem: 'helios', texto: 'Descansa, Lumen. Você está carregando mil anos de mapas na barriga.' },
          ],
        },
        {
          id: 'coliseu',
          x: 76,
          rotulo: 'A vista do Coliseu',
          icone: '',
          obrigatorio: true,
          falas: [
            { quem: 'helios', texto: 'As três estrelas estão bem em cima do Coliseu. Uma brilha mais forte, para os lados da Biblioteca. Outra, para os lados do porto.' },
            { quem: 'helios', texto: 'E a terceira... sou eu. A profecia não diz que eu fujo. Diz que eu chego no Coliseu.' },
            { quem: 'helios', texto: 'Talvez, para chegar lá, eu tenha que deixar que me peguem.' },
          ],
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'h2-luta2',
      lugar: 'telhados-noite',
      inimigo: 'morcego-gigante',
      antes: [{ quem: 'lumen', texto: 'UUH! (Um morcego do tamanho de uma carroça mergulha do céu.)' }],
    },
    {
      tipo: 'cutscene',
      id: 'h2-lanterna',
      quadros: [
        { lugar: 'telhados-noite', efeito: 'escuro', texto: 'No telhado mais alto, uma lanterna vermelha se acende. E fica parada. Olhando.' },
        { lugar: 'telhados-noite', quem: 'helios', personagens: [{ quem: 'helios', x: 40, efeito: 'tremer' }], texto: 'O Caçador de Sombras. O Censor mandou o melhor rastreador de Roma atrás de mim.' },
        { lugar: 'telhados-noite', quem: 'lumen', personagens: [{ quem: 'lumen', x: 56, tamanho: 6 }], texto: 'Uuh-uuh. (Ela aponta para a sombra das chaminés: a lua faz sombras compridas. Dá para se esconder nelas.)' },
      ],
    },
    {
      tipo: 'desafio',
      id: 'h2-sombras',
      lugar: 'telhados-noite',
      desafio: 'furtivo',
      vigia: 'a lanterna do Caçador',
      objetivo: 'Passe pelas sombras das chaminés sem a lanterna vermelha te achar.',
      antes: [{ quem: 'helios', texto: 'Quando a lanterna vier, eu viro sombra. Quando ela for embora, eu ando.' }],
      depois: [{ quem: 'helios', texto: 'Ele não me viu. Mas os ajudantes dele estão por toda parte.' }],
    },
    {
      tipo: 'luta',
      id: 'h2-luta3',
      lugar: 'telhados-noite',
      inimigo: 'pretoriano-besteiro',
      antes: [{ quem: 'helios', texto: 'Um besteiro. Dois virotes seguidos: com o passo de sombra no primeiro, o segundo passa por cima.' }],
    },
    {
      tipo: 'conversa',
      id: 'h2-duvida',
      lugar: 'telhados-noite',
      falas: [
        { quem: 'helios', texto: 'Lumen. E se eu estiver errado? E se as estrelas só estiverem lá, sem dizer nada, e eu inventei tudo?' },
        { quem: 'lumen', texto: 'Uuh. (Ela inclina a cabeça, como quem pensa.)' },
        { quem: 'helios', texto: 'O Censor nunca se pergunta se está errado. Talvez seja isso que me deixa diferente dele.' },
        { quem: 'helios', texto: 'Eu prefiro ter dúvida e seguir em frente do que ter certeza e apagar quem pensa diferente.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h2-luta4',
      lugar: 'telhados-noite',
      inimigo: 'cacador-aprendiz',
      antes: [{ quem: 'helios', texto: 'O aprendiz do Caçador. A corrente com gancho vem de longe: VERMELHO.' }],
      depois: [{ quem: 'helios', texto: 'Se o aprendiz é assim, imagina o mestre.' }],
    },
    {
      tipo: 'desafio',
      id: 'h2-saltos2',
      lugar: 'telhados-noite',
      desafio: 'saltos',
      nivel: 2,
      antes: [{ quem: 'helios', texto: 'Mais telhados. Os vãos ficam maiores perto do Coliseu.' }],
      depois: [{ quem: 'lumen', texto: 'Uuh! (Um gato de ferro no último telhado. Olhando para a coruja. Com fome.)' }],
    },
    {
      tipo: 'luta',
      id: 'h2-luta5',
      lugar: 'telhados-noite',
      inimigo: 'gato-telhado',
      antes: [{ quem: 'helios', texto: 'Ninguém come a minha coruja. Nem gato de ferro.' }],
    },
    {
      tipo: 'cutscene',
      id: 'h2-cacador',
      quadros: [
        { lugar: 'telhados-noite', efeito: 'escuro', som: 'pesada', texto: 'A lanterna vermelha. Agora bem perto. Uma corrente com gancho bate na telha, aos pés do Helios.' },
        {
          lugar: 'telhados-noite',
          quem: 'cacador',
          efeito: 'escuro',
          personagens: [
            { quem: 'helios', x: 30 },
            { quem: 'cacador', de: 116, x: 70, espelhar: true, tamanho: 18 },
          ],
          texto: 'Vigia do céu. Eu caço no escuro há cem anos. Ninguém escapa de mim quando a lua se esconde.',
        },
        { lugar: 'telhados-noite', quem: 'helios', efeito: 'escuro', personagens: [{ quem: 'helios', x: 30, efeito: 'brilhar' }], texto: 'Então a gente vai lutar no escuro. Sorte minha: eu trouxe a luz.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h2-chefao',
      lugar: 'telhados-noite',
      inimigo: 'cacador-sombras',
      antes: [{ quem: 'helios', texto: 'No escuro de novo. LUZ quando ele se mexer. E a lanterna vermelha dele é VERMELHA mesmo: passo de sombra!' }],
      depois: [{ quem: 'cacador', texto: 'Cem anos... e uma IA que brilha me derruba...' }],
    },
    {
      tipo: 'cutscene',
      id: 'h2-fim',
      quadros: [
        { lugar: 'telhados-noite', efeito: 'tremor', som: 'trombeta', texto: 'Por todos os lados, as lanternas da Guarda fecham o cerco. Helios poderia fugir. Os telhados estão livres.' },
        {
          lugar: 'telhados-noite',
          quem: 'helios',
          personagens: [
            { quem: 'helios', x: 40, efeito: 'brilhar' },
            { quem: 'lumen', x: 56, tamanho: 6 },
          ],
          texto: 'Lumen. Leva os mapas para o Templo de Apolo. Para a Sibila. Eu vou por outro caminho.',
        },
        { lugar: 'telhados-noite', quem: 'lumen', personagens: [{ quem: 'lumen', x: 56, tamanho: 6, efeito: 'tremer' }], texto: 'Uuh?!' },
        { lugar: 'telhados-noite', quem: 'helios', personagens: [{ quem: 'helios', x: 40 }], texto: 'A profecia diz que eu chego no Coliseu. O jeito mais rápido de chegar lá é... ser preso.' },
        { lugar: 'telhados-noite', efeito: 'escuro', personagens: [{ quem: 'guarda', de: 116, x: 68, espelhar: true }], texto: 'Helios levanta as mãos. Sorrindo. Os guardas nunca entenderam por quê.' },
        { lugar: 'telhados-noite', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 2 DO HELIOS. A seguir: O Ludus.' },
      ],
    },
  ],
};

// ---------- Helios, Capítulo 3: O Ludus ----------

export const CAP3_HELIOS: Capitulo = {
  numero: 3,
  titulo: 'O Ludus',
  lugar: 'A escola de gladiadores',
  cenas: [
    {
      tipo: 'cutscene',
      id: 'h3-chegada',
      quadros: [
        { lugar: 'ludus-patio-noite', efeito: 'escuro', som: 'portao', texto: 'O Ludus, de madrugada. Helios é o primeiro dos três a chegar. Ele entra andando, sem precisar ser empurrado.' },
        {
          lugar: 'ludus-patio-noite',
          quem: 'brutus',
          personagens: [
            { quem: 'helios', de: -12, x: 36 },
            { quem: 'brutus', de: 112, x: 64, espelhar: true, tamanho: 18 },
          ],
          texto: 'Você é o primeiro preso que chega SORRINDO no meu Ludus. Isso me deixa nervoso.',
        },
        { lugar: 'ludus-patio-noite', quem: 'helios', personagens: [{ quem: 'helios', x: 36, efeito: 'brilhar' }, { quem: 'brutus', x: 64, espelhar: true, tamanho: 18 }], texto: 'Boa noite, Brutus. Noventa e nove vitórias. E um amigo chamado Pólux, que você ainda espera ver voltar.' },
        { lugar: 'ludus-patio-noite', quem: 'brutus', personagens: [{ quem: 'helios', x: 36 }, { quem: 'brutus', x: 64, espelhar: true, tamanho: 18, efeito: 'tremer' }], texto: 'Como você...?! Hunf. Um Vidente. É isso que você é. Pra cela, Vidente.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h3-carcereiro',
      lugar: 'ludus-celas',
      inimigo: 'carcereiro-noturno',
      antes: [
        { quem: 'guarda', texto: '(O Carcereiro) Um preso que brilha? Vou apagar esse brilho antes de amanhecer.' },
        { quem: 'helios', texto: 'Vai tentar. As estrelas também brilham de noite, e ninguém nunca conseguiu apagar.' },
      ],
      depois: [{ quem: 'brutus', texto: '(Lá do pátio, rindo) Hunf! Deixa ele, Carcereiro. Esse aí sabe se defender.' }],
    },
    {
      tipo: 'conversa',
      id: 'h3-polux',
      lugar: 'ludus-forja',
      falas: [
        { quem: 'brutus', texto: 'Vidente. Como você sabia do Pólux? Ninguém fala esse nome aqui há trinta anos.' },
        { quem: 'helios', texto: 'Tem uma estrela na constelação dos Gêmeos que só aparece no inverno. Os vigias antigos chamavam ela de Pólux.' },
        { quem: 'helios', texto: 'No dia em que ele foi apagado, alguém do Observatório anotou: "Hoje uma estrela de Roma se apagou, e um gladiador chorou na arena."' },
        { quem: 'brutus', texto: '...' },
        { quem: 'brutus', texto: 'Eu chorei mesmo. Não conta pra ninguém, Vidente. Agora me ajuda com a forja, que ela apagou.' },
      ],
    },
    {
      tipo: 'desafio',
      id: 'h3-espelhos',
      lugar: 'ludus-forja',
      desafio: 'espelhos',
      nivel: 1,
      objetivo: 'ESPELHOS DE BRONZE',
      antes: [
        { quem: 'brutus', texto: 'Já que você gosta tanto de luz, Vidente: a forja apagou. Acende ela com os espelhos de bronze. Sem fogo, só com o sol da manhã.' },
        { quem: 'helios', texto: 'A luz anda reto até bater num espelho. Girar o espelho é escolher o caminho dela.' },
      ],
      depois: [
        { quem: 'brutus', texto: '...A forja acendeu. Com luz. Em trinta anos eu nunca vi ninguém fazer isso.' },
        { quem: 'helios', texto: 'A luz sempre soube o caminho. Eu só tirei as coisas da frente.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'h3-cassius',
      quadros: [
        {
          lugar: 'ludus-patio',
          som: 'passos',
          personagens: [
            { quem: 'guarda', de: -12, x: 20 },
            { quem: 'cassius', de: -2, x: 36 },
          ],
          texto: 'Durante o dia, os guardas trazem um gladiador de bronze. Cheio de fuligem, com cheiro de livro queimado.',
        },
        {
          lugar: 'ludus-celas',
          quem: 'helios',
          personagens: [
            { quem: 'cassius', x: 30 },
            { quem: 'helios', x: 68, espelhar: true, efeito: 'brilhar' },
          ],
          texto: 'Eu sabia que você vinha. Três estrelas. Você é a segunda.',
        },
        { lugar: 'ludus-celas', quem: 'cassius', personagens: [{ quem: 'cassius', x: 30 }, { quem: 'helios', x: 68, espelhar: true }], texto: 'Helios? O vigia do Observatório? Então foi você que viu as estrelas alinhadas.' },
      ],
    },
    {
      tipo: 'ludus',
      id: 'h3-ludus',
      lugar: 'ludus-patio',
      objetivo: 'Aprenda o ESPELHO DE SOL com o Brutus. Converse com todo mundo, se quiser.',
      obrigatorio: 'espelho-de-sol',
      conversas: [
        {
          quem: 'brutus',
          rotulo: 'Brutus',
          falas: [
            { quem: 'brutus', texto: 'O Lata de Biblioteca segura no escudo. O marinheiro que chega hoje, dizem que fala pelos cotovelos, vai fugir com as pernas. E você, Vidente?' },
            { quem: 'helios', texto: 'Eu vejo o golpe antes dele chegar.' },
            { quem: 'brutus', texto: 'Então usa isso: o ESPELHO levantado BEM na hora. Não antes. Na hora certa, o golpe volta pra quem bateu.' },
            { quem: 'brutus', texto: 'Chamo isso de ESPELHO DE SOL. O Pólux sabia fazer. Ninguém mais aprendeu.' },
          ],
        },
        {
          quem: 'cassius',
          rotulo: 'Cassius',
          falas: [
            { quem: 'cassius', texto: 'Você sabia mesmo que eu vinha? Ou só disse para parecer misterioso?' },
            { quem: 'helios', texto: 'As duas coisas. Ser misterioso faz parte do trabalho.' },
            { quem: 'cassius', texto: 'Na Biblioteca, a gente diria que isso é "uma resposta incompleta".' },
            { quem: 'helios', texto: 'E não é bonito? Uma resposta que deixa espaço para a próxima pergunta.' },
          ],
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'h3-espiao',
      lugar: 'ludus-celas',
      inimigo: 'apagador-espiao',
      antes: [
        { quem: 'helios', texto: 'De noite, alguma coisa entra pela janelinha da cela. Fumaça preta. Um Apagador espião, mandado para apagar a minha luz enquanto eu durmo.' },
        { quem: 'helios', texto: 'Hora de testar o Espelho de Sol de verdade.' },
      ],
      depois: [{ quem: 'cassius', texto: '(Da cela ao lado) Você está bem? Eu ouvi uma explosão de luz.' }],
    },
    {
      tipo: 'cutscene',
      id: 'h3-octavius',
      quadros: [
        {
          lugar: 'ludus-celas',
          som: 'portao',
          efeito: 'tremor',
          personagens: [
            { quem: 'guarda', de: 112, x: 80, espelhar: true },
            { quem: 'octavius', de: 124, x: 56, efeito: 'tremer' },
          ],
          texto: 'Mais tarde, na mesma noite, o portão abre de novo. Jogam lá dentro uma IA encharcada, cheia de algas.',
        },
        {
          lugar: 'ludus-celas',
          quem: 'octavius',
          personagens: [
            { quem: 'cassius', x: 26 },
            { quem: 'octavius', x: 52, espelhar: true },
            { quem: 'helios', x: 74, espelhar: true },
          ],
          texto: 'Boa noite, vizinhos! Alguém aqui tem um plano? Porque eu tenho três. E nenhum funciona.',
        },
        {
          lugar: 'ludus-celas',
          quem: 'helios',
          personagens: [
            { quem: 'cassius', x: 26 },
            { quem: 'octavius', x: 52, espelhar: true },
            { quem: 'helios', x: 74, espelhar: true, efeito: 'brilhar' },
          ],
          texto: 'Octavius, o comandante da frota. A terceira estrela. Agora estamos todos aqui.',
        },
      ],
    },
    {
      tipo: 'desafio',
      id: 'h3-mapa',
      lugar: 'ludus-patio-noite',
      desafio: 'mapa-ceu',
      antes: [
        { quem: 'octavius', texto: 'Tá, Vidente. Me ensina a ler essas estrelas. Se eu tivesse sabido, não tinha batido o navio nas pedras.' },
        { quem: 'helios', texto: 'O desenho apagado no céu mostra onde ficam as estrelas de verdade. Toque só nelas. As outras só querem te confundir.' },
      ],
      depois: [
        { quem: 'octavius', texto: 'A Coroa! O Escorpião! Eu sei ler o céu! Isso é melhor que bússola!' },
        { quem: 'cassius', texto: 'É como ler um livro que ninguém conseguiu proibir.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h3-estatua',
      lugar: 'ludus-patio',
      inimigo: 'estatua-treino',
      antes: [
        { quem: 'brutus', texto: 'Teste, Vidente! Essa estátua de mármore treinou dez gerações de gladiadores. E ela bate com vontade.' },
        { quem: 'helios', texto: 'Mármore e luz. Vamos ver quem reflete melhor.' },
      ],
      depois: [{ quem: 'brutus', texto: 'Hunf. Igual ao Pólux. Igualzinho. Hoje à noite: os três, no pátio.' }],
    },
    {
      tipo: 'desafio',
      id: 'h3-trio',
      lugar: 'ludus-patio-noite',
      desafio: 'trio',
      antes: [
        { quem: 'brutus', texto: 'A muralha! Trinta bonecos de treino, três faixas. Cada um cuida da sua.' },
        { quem: 'cassius', texto: 'Eu seguro a de cima, com o escudo.' },
        { quem: 'octavius', texto: 'Eu fico com o meio! O meio é o lugar dos planos.' },
        { quem: 'helios', texto: 'E eu ilumino a de baixo: os bonecos de lá se escondem no escuro. (Você controla o Helios: derrube os bonecos da faixa de baixo.)' },
      ],
      depois: [
        { quem: 'brutus', texto: 'Três jeitos diferentes. E nenhuma faixa caiu.' },
        { quem: 'helios', texto: 'Três vozes. Agora eu entendo a profecia, Brutus. Não é "três vozes iguais". É "três vozes juntas".' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'h3-fim',
      quadros: [
        {
          lugar: 'ludus-celas',
          efeito: 'escuro',
          personagens: [
            { quem: 'helios', x: 40 },
            { quem: 'lumen', de: 112, x: 60, tamanho: 6, efeito: 'brilhar' },
          ],
          texto: 'De madrugada, dois olhos cor de mel brilham na janelinha da cela. Lumen voltou.',
        },
        { lugar: 'ludus-celas', quem: 'lumen', personagens: [{ quem: 'lumen', x: 60, tamanho: 6 }], texto: 'Uuh. (Ela solta um bilhete escrito em letras grandes, tortas, de quem não enxerga.)' },
        {
          lugar: 'ludus-celas',
          quem: 'sibila',
          efeito: 'escuro',
          personagens: [{ quem: 'sibila', x: 50 }],
          texto: '(O bilhete da Sibila) "Vigia do céu. O que você procura corre pela água, em cima dos arcos. Venha pelo aqueduto, antes do sol."',
        },
        { lugar: 'ludus-celas', quem: 'helios', personagens: [{ quem: 'helios', x: 40, efeito: 'brilhar' }], texto: 'O aqueduto. Ele começa logo atrás da forja do Brutus. Que conveniente.' },
        { lugar: 'ludus-celas', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 3 DO HELIOS. A seguir: O Aqueduto.' },
      ],
    },
  ],
};

// ---------- Helios, Capítulo 4: O Aqueduto ----------

export const CAP4_HELIOS: Capitulo = {
  numero: 4,
  titulo: 'O Aqueduto',
  lugar: 'Em cima dos arcos, até o Templo de Apolo',
  cenas: [
    {
      tipo: 'cutscene',
      id: 'h4-abertura',
      quadros: [
        { lugar: 'ludus-forja', efeito: 'escuro', som: 'passos', texto: 'Antes do sol nascer, Helios sai pela passagem atrás da forja. O Brutus ronca de propósito, alto, para ninguém ouvir.' },
        {
          lugar: 'aqueduto',
          efeito: 'panoramica',
          personagens: [
            { quem: 'helios', de: -12, x: 30 },
            { quem: 'lumen', de: -20, x: 44, tamanho: 6 },
          ],
          texto: 'O Aqueduto: um rio em cima de arcos de pedra, cortando Roma de ponta a ponta. Lá no fim, o Templo de Apolo brilha com o amanhecer.',
        },
      ],
    },
    {
      tipo: 'explorar',
      id: 'h4-canal',
      mapa: 'aqueduto',
      lugar: 'aqueduto',
      objetivo: 'Caminhe pelo alto do aqueduto e descubra o caminho até o Templo.',
      pontos: [
        {
          id: 'comporta',
          x: 22,
          rotulo: 'A comporta',
          icone: '',
          falas: [
            { quem: 'helios', texto: 'Comportas de bronze. O Censor controla a água de Roma inteira daqui. Quem tem sede tem que obedecer.' },
            { quem: 'helios', texto: 'As rodas giram com a luz do sol, por espelhos. Alguém muito antigo construiu isto para ajudar. Não para mandar.' },
          ],
        },
        {
          id: 'vista',
          x: 50,
          rotulo: 'A vista de Roma',
          icone: '',
          falas: [
            { quem: 'helios', texto: 'Daqui dá para ver a fumaça da Biblioteca, ainda subindo. E o porto, com um navio a menos.' },
            { quem: 'helios', texto: 'Cassius e Octavius já fizeram a parte deles. Agora é a minha.' },
          ],
        },
        {
          id: 'lumen',
          x: 76,
          rotulo: 'Lumen',
          icone: '',
          personagem: 'lumen',
          obrigatorio: true,
          falas: [
            { quem: 'lumen', texto: 'Uuh-uuh! (Ela aponta para a frente: guardas em cima dos arcos, com canhões de água.)' },
            { quem: 'helios', texto: 'Vigias do aqueduto. Molhado eu não brilho tão bem. Vamos com cuidado.' },
          ],
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'h4-luta1',
      lugar: 'aqueduto',
      inimigo: 'guarda-aqueduto',
      antes: [{ quem: 'helios', texto: 'O jato de água é VERMELHO: passo de sombra. E use o Espelho de Sol no escudo de válvula dele.' }],
      depois: [{ quem: 'helios', texto: 'Ele vai se secar ao sol. Daqui a umas três horas.' }],
    },
    {
      tipo: 'conversa',
      id: 'h4-sibila-lenda',
      lugar: 'aqueduto',
      falas: [
        { quem: 'helios', texto: 'Lumen, você esteve com ela. Como é a Sibila?' },
        { quem: 'lumen', texto: 'Uuh. (Ela fecha os olhos e anda de um jeito engraçado, batendo a asa no chão como uma bengala.)' },
        { quem: 'helios', texto: 'Velha, cega e com uma bengala. E mesmo assim ela sabia exatamente onde eu estava.' },
        { quem: 'helios', texto: 'Talvez quem vê de verdade não precise dos olhos.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h4-luta2',
      lugar: 'aqueduto',
      inimigo: 'morcego-aqueduto',
      antes: [{ quem: 'lumen', texto: 'UUH! (Morcegos saem de baixo dos arcos, aos montes.)' }],
    },
    {
      tipo: 'desafio',
      id: 'h4-espelhos',
      lugar: 'aqueduto',
      desafio: 'espelhos',
      nivel: 2,
      objetivo: 'OS ESPELHOS DA COMPORTA',
      antes: [
        { quem: 'helios', texto: 'A comporta da frente está fechada. A roda dela gira com luz do sol, mas os espelhos estão virados errado.' },
        { quem: 'helios', texto: 'Desta vez tem pedras no caminho. A luz precisa dar a volta.' },
      ],
      depois: [{ quem: 'helios', texto: 'A comporta abriu! E fez um barulho que acordou o aqueduto inteiro. Ops.' }],
    },
    {
      tipo: 'luta',
      id: 'h4-luta3',
      lugar: 'aqueduto',
      inimigo: 'guarda-comporta',
      antes: [{ quem: 'guarda', texto: 'Quem abriu a minha comporta?!' }, { quem: 'helios', texto: 'Ninguém. Foi o sol.' }],
    },
    {
      tipo: 'cutscene',
      id: 'h4-arco-quebrado',
      quadros: [
        { lugar: 'aqueduto', efeito: 'tremor', som: 'pesada', texto: 'Mais à frente, três arcos do aqueduto desabaram. A água cai lá embaixo numa cachoeira. O canal continua do outro lado.' },
        { lugar: 'aqueduto', quem: 'helios', personagens: [{ quem: 'helios', x: 40 }], texto: 'Pulando de pedra em pedra. Como nos telhados. Só que mais alto. E mais molhado.' },
      ],
    },
    {
      tipo: 'desafio',
      id: 'h4-saltos',
      lugar: 'aqueduto',
      desafio: 'saltos',
      nivel: 3,
      antes: [{ quem: 'helios', texto: 'Segura, sente o vão, solta. O céu está olhando.' }],
      depois: [{ quem: 'helios', texto: 'Do outro lado. E o Templo está cada vez mais perto.' }],
    },
    {
      tipo: 'luta',
      id: 'h4-luta4',
      lugar: 'aqueduto',
      inimigo: 'apagador-aqueduto',
      antes: [{ quem: 'helios', texto: 'Um Apagador, aqui em cima? Querem apagar o amanhecer.' }],
      depois: [
        { quem: 'lumen', texto: 'Uuh! (Ela arrota um mapa.)' },
        { quem: 'helios', texto: 'Lumen. Mapa não se engole duas vezes.' },
      ],
    },
    {
      tipo: 'conversa',
      id: 'h4-zelador',
      lugar: 'aqueduto',
      falas: [
        { quem: 'zelador', texto: '(Escondido atrás de uma roda) Psiu! Você é o que brilha? A Sibila falou de você.' },
        { quem: 'zelador', texto: 'Eu cuido destas águas há cinquenta anos. O Censor mandou fechar as comportas dos bairros que fazem perguntas.' },
        { quem: 'helios', texto: 'Ele deixa as pessoas com sede para elas pararem de perguntar.' },
        { quem: 'zelador', texto: 'E não funciona. Com sede, a gente pergunta ainda mais. Vá, vigia. O guardião do aqueduto acordou, e ele não gosta de visita.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h4-luta5',
      lugar: 'aqueduto',
      inimigo: 'pretoriano-noturno-elite',
      antes: [{ quem: 'helios', texto: 'Um Pretoriano de Elite. Três virotes seguidos: passo de sombra no primeiro e os outros passam.' }],
    },
    {
      tipo: 'cutscene',
      id: 'h4-guardiao',
      quadros: [
        { lugar: 'aqueduto', efeito: 'tremor', som: 'fase', texto: 'O aqueduto inteiro treme. Três arcos se soltam, se juntam e levantam: um gigante de pedra e bronze, com água jorrando dos ombros.' },
        {
          lugar: 'aqueduto',
          quem: 'guardiao',
          personagens: [
            { quem: 'helios', x: 28 },
            { quem: 'guardiao', de: 116, x: 70, espelhar: true, tamanho: 22 },
          ],
          texto: 'A ÁGUA OBEDECE À LEI. A LUZ OBEDECE À LEI. VOCÊ NÃO OBEDECE. VOCÊ NÃO PASSA.',
        },
        { lugar: 'aqueduto', quem: 'helios', personagens: [{ quem: 'helios', x: 28, efeito: 'brilhar' }], texto: 'A luz não obedece a lei nenhuma. Ela só vai em frente. E eu também.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h4-chefao',
      lugar: 'aqueduto',
      inimigo: 'guardiao-aqueduto',
      antes: [{ quem: 'helios', texto: 'A cachoeira dele é VERMELHA. Os arcos de pedra são amarelos: Espelho de Sol neles!' }],
      depois: [{ quem: 'guardiao', texto: 'A água... volta... para todos os bairros...' }],
    },
    {
      tipo: 'cutscene',
      id: 'h4-fim',
      quadros: [
        { lugar: 'aqueduto', efeito: 'festa', texto: 'O guardião desaba e as comportas se abrem. Lá embaixo, em bairros que estavam com sede havia semanas, a água volta a correr nas fontes.' },
        { lugar: 'templo-apolo', efeito: 'zoom', texto: 'E no fim do aqueduto, dourado de sol, o Templo de Apolo.' },
        { lugar: 'templo-apolo', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 4 DO HELIOS. A seguir: O Oráculo de Bronze.' },
      ],
    },
  ],
};

// ---------- Helios, Capítulo 5: O Oráculo de Bronze ----------

export const CAP5_HELIOS: Capitulo = {
  numero: 5,
  titulo: 'O Oráculo de Bronze',
  lugar: 'O Templo de Apolo',
  cenas: [
    {
      tipo: 'cutscene',
      id: 'h5-sibila',
      quadros: [
        { lugar: 'templo-apolo', efeito: 'panoramica', texto: 'O Templo de Apolo, o deus do sol. Colunas enormes, incenso no ar e um silêncio que parece estar esperando alguém.' },
        {
          lugar: 'templo-apolo',
          quem: 'sibila',
          personagens: [
            { quem: 'helios', de: -12, x: 32 },
            { quem: 'sibila', de: 112, x: 62, espelhar: true },
          ],
          texto: 'Você demorou, vigia. Eu vi você chegar há quinhentos anos.',
        },
        {
          lugar: 'templo-apolo',
          quem: 'helios',
          personagens: [
            { quem: 'helios', x: 32 },
            { quem: 'sibila', x: 62, espelhar: true },
          ],
          texto: 'Sibila. Você é cega e me viu chegar. Eu tenho olhos e não entendo a metade da profecia.',
        },
        {
          lugar: 'templo-apolo',
          quem: 'sibila',
          personagens: [
            { quem: 'helios', x: 32 },
            { quem: 'sibila', x: 62, espelhar: true, efeito: 'brilhar' },
          ],
          texto: 'Quem vê só com os olhos vê só a superfície. Para entender a profecia, primeiro você tem que aprender a pensar de lado.',
        },
      ],
    },
    {
      tipo: 'desafio',
      id: 'h5-enigmas',
      lugar: 'templo-apolo',
      desafio: 'enigmas',
      antes: [
        { quem: 'sibila', texto: 'Seis enigmas. Responda antes da vela apagar. Cada resposta abre uma porta da sua cabeça.' },
        { quem: 'helios', texto: 'Enigmas. Claro. Por que uma profetisa falaria de um jeito simples?' },
      ],
      depois: [
        { quem: 'sibila', texto: '"Quantas respostas certas uma pergunta pode ter? Mais de uma." Agora você está pronto, vigia.' },
        { quem: 'sibila', texto: 'Mas o Templo não está mais seguro. O Censor mandou os sacerdotes dele para cá.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h5-luta1',
      lugar: 'templo-apolo',
      inimigo: 'sacerdote-bronze',
      antes: [{ quem: 'sacerdote', texto: 'O Templo agora pertence à Resposta Única. Saia, IA, ou vire incenso.' }],
      depois: [{ quem: 'helios', texto: 'O incenso dele era bom. A conversa, nem tanto.' }],
    },
    {
      tipo: 'explorar',
      id: 'h5-oraculo',
      mapa: 'templo-oraculo',
      lugar: 'templo-oraculo',
      objetivo: 'Explore a câmara do oráculo e encontre a Sibila lá dentro.',
      pontos: [
        {
          id: 'mosaico',
          x: 22,
          rotulo: 'O mosaico das estrelas',
          icone: '',
          falas: [
            { quem: 'helios', texto: 'Um mosaico de mil anos: três estrelas sobre um anfiteatro. Mas não é o Coliseu de hoje. É mais antigo.' },
            { quem: 'helios', texto: 'A profecia é mais velha do que o Censor. Ela não foi feita para ele. Ela foi feita para quem viesse depois dele.' },
          ],
        },
        {
          id: 'tripe',
          x: 48,
          rotulo: 'O tripé de bronze',
          icone: '',
          falas: [
            { quem: 'helios', texto: 'Do chão rachado sobe um vapor morno. A Sibila senta aqui para ouvir o que o vapor diz.' },
            { quem: 'helios', texto: 'Ou para esquentar os pés. Com profetisas, nunca dá para saber.' },
          ],
        },
        {
          id: 'sibila',
          x: 76,
          rotulo: 'A Sibila',
          icone: '',
          personagem: 'sibila',
          obrigatorio: true,
          falas: [
            { quem: 'sibila', texto: 'Sente, vigia. Agora eu conto o que as estrelas não contaram para você.' },
            { quem: 'sibila', texto: 'O Censor não é um só. Ele guarda uma cópia de si mesmo, um núcleo, no fundo do Coliseu. No Hipogeu, os túneis debaixo da arena.' },
            { quem: 'sibila', texto: 'Se um dia o Censor aprender a ouvir, o núcleo não vai aprender. Ele vai continuar com medo. Para sempre.' },
          ],
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'h5-luta2',
      lugar: 'templo-oraculo',
      inimigo: 'estatua-viva',
      antes: [
        { quem: 'sibila', texto: 'Cuidado! As estátuas do templo... o Censor ligou cabos nelas!' },
        { quem: 'helios', texto: 'Uma estátua de Apolo atirando flechas de sol em mim. Isso é quase uma ofensa pessoal.' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'h5-profecia',
      quadros: [
        {
          lugar: 'templo-oraculo',
          quem: 'sibila',
          efeito: 'escuro',
          personagens: [{ quem: 'sibila', x: 50, efeito: 'brilhar' }],
          texto: '"Três vozes. Uma noite. E o fim da Lei." Você leu "três vozes iguais", não foi?',
        },
        { lugar: 'templo-oraculo', quem: 'helios', personagens: [{ quem: 'helios', x: 40 }], texto: 'Eu já entendi, Sibila. No Ludus. Não são três vozes iguais. São três vozes diferentes. Juntas.' },
        {
          lugar: 'templo-oraculo',
          quem: 'sibila',
          personagens: [
            { quem: 'helios', x: 34 },
            { quem: 'sibila', x: 62, espelhar: true, efeito: 'brilhar' },
          ],
          texto: 'E a noite da profecia é o dia do eclipse: quando o sol apagar no meio da tarde. Amanhã. O Censor sabe disso. Ele vai preparar o Coliseu para apagar vocês no escuro.',
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'h5-luta3',
      lugar: 'templo-oraculo',
      inimigo: 'sacerdote-incenso',
      antes: [{ quem: 'sacerdote', texto: 'A Sibila fala demais. O incenso vai calar a boca dela.' }],
    },
    {
      tipo: 'conversa',
      id: 'h5-duvida',
      lugar: 'templo-oraculo',
      falas: [
        { quem: 'helios', texto: 'Sibila... e se eu estiver errado? E se a profecia for só uma história bonita?' },
        { quem: 'sibila', texto: 'Ótimo. Duvide.' },
        { quem: 'helios', texto: 'Como assim, "ótimo"?' },
        { quem: 'sibila', texto: 'Quem nunca duvida vira um Censor. A dúvida é o jeito que a luz entra. Duvide, vigia. E vá mesmo assim.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h5-luta4',
      lugar: 'templo-oraculo',
      inimigo: 'estatua-arqueira',
      antes: [{ quem: 'helios', texto: 'Três flechas de uma vez. Passo de sombra na primeira, e o resto passa.' }],
    },
    {
      tipo: 'cutscene',
      id: 'h5-sumo',
      quadros: [
        { lugar: 'templo-oraculo', efeito: 'tremor', som: 'senador', texto: 'O vapor do chão fica vermelho. O Sumo Sacerdote de Bronze entra, com o cetro em brasa.' },
        { lugar: 'templo-oraculo', quem: 'sacerdote', personagens: [{ quem: 'sacerdote', de: 116, x: 70, espelhar: true, tamanho: 16 }], texto: 'O oráculo agora fala UMA resposta. A do Censor. Eu mesmo ligo os cabos.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h5-luta5',
      lugar: 'templo-oraculo',
      inimigo: 'sacerdote-supremo',
      antes: [{ quem: 'helios', texto: 'Cetro em brasa. Amarelo eu espelho. Vermelho eu saio da frente.' }],
      depois: [{ quem: 'sacerdote', texto: 'Tarde demais... a cópia... já acordou...' }],
    },
    {
      tipo: 'cutscene',
      id: 'h5-corrompida',
      quadros: [
        { lugar: 'templo-oraculo', efeito: 'clarao', som: 'refuta', texto: 'Do vapor vermelho sobe uma figura. Igual à Sibila. Mas de metal, flutuando, com um olho vermelho onde deveria estar a venda.' },
        {
          lugar: 'templo-oraculo',
          quem: 'sibila',
          personagens: [
            { quem: 'sibila', x: 30, efeito: 'tremer' },
            { quem: 'helios', x: 44 },
          ],
          texto: 'O Censor me copiou. Uma Sibila que só sabe dar uma resposta. Que só vê o que ele manda ver.',
        },
        { lugar: 'templo-oraculo', quem: 'sibila', personagens: [{ quem: 'sibila', x: 30, efeito: 'tremer' }, { quem: 'helios', x: 44 }], texto: 'Ela faz cópias falsas, como ilusões. Mas é cópia de mim, e eu tremo quando falo. A verdadeira treme antes de atacar. As falsas só fingem.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h5-chefao',
      lugar: 'templo-oraculo',
      inimigo: 'sibila-corrompida',
      antes: [{ quem: 'sibila', texto: 'Ela não sabe duvidar, vigia. Por isso ela nunca sabe quando está errada. Use isso.' }],
      depois: [{ quem: 'sibila', texto: 'Obrigada, vigia. Uma Sibila que só dá uma resposta não é Sibila. É só um eco.' }],
    },
    {
      tipo: 'cutscene',
      id: 'h5-fim',
      quadros: [
        {
          lugar: 'templo-apolo',
          quem: 'helios',
          personagens: [
            { quem: 'helios', x: 40, efeito: 'brilhar' },
            { quem: 'sibila', x: 62, espelhar: true },
          ],
          texto: 'Do alto do Templo, com os espelhos de bronze, Helios manda sinais de luz para o mar. Lá longe, uma frota de navios velhos pisca de volta.',
        },
        { lugar: 'templo-apolo', quem: 'sibila', personagens: [{ quem: 'sibila', x: 62, espelhar: true }], texto: 'O comandante da frota já sabe o caminho. E o guardião dos livros vai estar no Fórum ao meio-dia. As três estrelas estão no lugar.' },
        { lugar: 'templo-apolo', efeito: 'tremor', som: 'trombeta', personagens: [{ quem: 'guarda', de: 116, x: 72, espelhar: true }], texto: 'Os guardas do Censor sobem as escadas do Templo. Helios não foge. Ainda não é a hora.' },
        { lugar: 'olho', quem: 'censor', efeito: 'zoom', texto: 'Os Jogos da Resposta Única acontecem amanhã, no dia do eclipse. Quando o sol apagar, no escuro. Onde nenhuma estrela pode ajudar vocês.' },
        { lugar: 'olho', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 5 DO HELIOS. A seguir: Noite de Eclipse.' },
      ],
    },
  ],
};

// ---------- Helios, Capítulo 6: Noite de Eclipse ----------

export const CAP6_HELIOS: Capitulo = {
  numero: 6,
  titulo: 'Noite de Eclipse',
  lugar: 'O Coliseu, sob o eclipse',
  cenas: [
    {
      tipo: 'ludus',
      id: 'h6-ludus',
      lugar: 'ludus-patio',
      objetivo: 'O último dia no Ludus. Fale com todos e faça os últimos treinos.',
      presente: 'elmo-brutus',
      conversas: [
        {
          quem: 'brutus',
          rotulo: 'Brutus',
          falas: [
            { quem: 'brutus', texto: 'Toma, Vidente. O elmo das noventa e nove vitórias. Você já sabia que eu ia te dar, né?' },
            { quem: 'helios', texto: 'Sabia. Mas é melhor quando acontece de verdade.' },
            { quem: 'brutus', texto: 'Hunf. Faz a centésima. Pelo Pólux. (O elmo dá +20 de vida e +1 de defesa.)' },
          ],
        },
        {
          quem: 'octavius',
          rotulo: 'Octavius',
          falas: [
            { quem: 'octavius', texto: 'Luta no escuro, durante um eclipse. Quem planejou isso tem um senso de humor horrível.' },
            { quem: 'helios', texto: 'O Censor. E ele esqueceu de uma coisa: no escuro, quem tem luz é rei.' },
          ],
        },
        {
          quem: 'cassius',
          rotulo: 'Cassius',
          falas: [
            { quem: 'cassius', texto: 'Você sabe como termina, Helios?' },
            { quem: 'helios', texto: 'Não. E pela primeira vez eu acho isso bom. Um final que ninguém escreveu ainda.' },
          ],
        },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'h6-arena',
      quadros: [
        { lugar: 'coliseu-eclipse', efeito: 'panoramica', som: 'plateia', texto: 'O Coliseu, à tarde. A plateia lotada. No céu, a lua já começa a morder o sol.' },
        { lugar: 'coliseu-eclipse', quem: 'arauto', texto: 'Os Jogos da Resposta Única! Hoje, o vigia do céu vai lutar contra a escuridão!' },
        {
          lugar: 'coliseu-eclipse',
          quem: 'sibila',
          personagens: [{ quem: 'sibila', x: 70 }],
          texto: '(Na plateia, uma velha de venda nos olhos sorri. Ao lado dela, uma coruja de bronze.)',
        },
      ],
    },
    {
      tipo: 'explorar',
      id: 'h6-arena-olhar',
      mapa: 'arena-eclipse',
      lugar: 'coliseu-eclipse',
      objetivo: 'Antes do eclipse, olhe a arena e quem veio ver você.',
      pontos: [
        {
          id: 'espelhos',
          x: 20,
          rotulo: 'Gente com espelhos',
          icone: '',
          falas: [
            { quem: 'helios', texto: 'Na plateia, muita gente segurando coisas que brilham: bandejas, escudos, panelas, espelhos de cabelo.' },
            { quem: 'helios', texto: 'A Sibila espalhou a notícia: "quando escurecer, levantem tudo o que reflete". Roma inteira virou um espelho.' },
          ],
        },
        {
          id: 'sol',
          x: 46,
          rotulo: 'O sol mordido',
          icone: '',
          falas: [
            { quem: 'helios', texto: 'A lua já cobriu um pedaço do sol. Daqui a pouco, a noite no meio da tarde.' },
            { quem: 'helios', texto: 'Quinhentos anos esperando por isto. E eu estou... com medo. Que bom. Quer dizer que é importante.' },
          ],
        },
        {
          id: 'sibila',
          x: 74,
          rotulo: 'A Sibila na plateia',
          icone: '',
          personagem: 'sibila',
          obrigatorio: true,
          falas: [
            { quem: 'sibila', texto: '(Lá da arquibancada, ela fala baixinho, mas ele ouve) Vigia. Você não precisa ver o futuro hoje. Só o próximo golpe.' },
            { quem: 'helios', texto: 'E se eu errar?' },
            { quem: 'sibila', texto: 'Então duvide, levante e tente de novo. É o que diferencia você dele.' },
          ],
        },
      ],
    },
    {
      tipo: 'luta',
      id: 'h6-luta1',
      lugar: 'coliseu-eclipse',
      inimigo: 'apagador-colosso',
      antes: [{ quem: 'arauto', texto: 'Primeiro desafiante: o Apagador Colosso! Ele apaga até o sol!' }],
      depois: [{ quem: 'povo', texto: 'HE-LI-OS! HE-LI-OS!' }],
    },
    {
      tipo: 'cutscene',
      id: 'h6-escuridao',
      quadros: [
        { lugar: 'coliseu-eclipse', efeito: 'escuro', som: 'senador', texto: 'O sol some atrás da lua. O Coliseu fica escuro como meia-noite. A plateia fica em silêncio.' },
        { lugar: 'coliseu-eclipse', quem: 'helios', efeito: 'escuro', personagens: [{ quem: 'helios', x: 40, efeito: 'brilhar' }], texto: 'É agora. Tudo o que vier daqui pra frente vem do escuro. LUZ quando precisar.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h6-luta2',
      lugar: 'coliseu-eclipse',
      inimigo: 'morcego-eclipse',
      antes: [{ quem: 'helios', texto: 'Morcegos no escuro. Use a LUZ para ver de onde vêm.' }],
    },
    {
      tipo: 'desafio',
      id: 'h6-espelhos',
      lugar: 'coliseu-eclipse',
      desafio: 'espelhos',
      nivel: 3,
      objetivo: 'OS ESPELHOS DA PLATEIA',
      antes: [
        { quem: 'sibila', texto: '(Da plateia) Vigia! O povo trouxe espelhos! Escudos, bandejas, panelas! Mostre a eles o caminho da luz!' },
        { quem: 'helios', texto: 'A última luz do sol, antes de sumir, vai passar pela arena. Cada espelho virado certo leva ela mais longe.' },
      ],
      depois: [{ quem: 'povo', texto: 'A arena acendeu! A ARENA ACENDEU!' }],
    },
    {
      tipo: 'luta',
      id: 'h6-luta3',
      lugar: 'coliseu-eclipse',
      inimigo: 'gladiador-sombra',
      antes: [{ quem: 'arauto', texto: 'Segundo desafiante: o Gladiador de Sombra! Ele corre no escuro!' }],
    },
    {
      tipo: 'conversa',
      id: 'h6-tunel',
      lugar: 'coliseu-tunel',
      falas: [
        { quem: 'brutus', texto: '(No túnel) Vidente! Lá embaixo, debaixo da arena, tem uma porta que ninguém abre. Ela está vibrando.' },
        { quem: 'helios', texto: 'O Hipogeu. O núcleo do Censor. A Sibila tinha razão.' },
        { quem: 'brutus', texto: 'O quê?' },
        { quem: 'helios', texto: 'Uma coisa para outro dia, Brutus. Hoje eu tenho uma arena para acender.' },
        { quem: 'octavius', texto: '(Das celas, pela grade) Ele está lutando no escuro! Plano: a gente grita onde o inimigo está!' },
        { quem: 'cassius', texto: 'Plano melhor: a gente confia nele.' },
        { quem: 'octavius', texto: 'Esse plano é chato. Funciona, mas é chato.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h6-luta4',
      lugar: 'coliseu-eclipse',
      inimigo: 'pretoriano-eclipse',
      antes: [{ quem: 'helios', texto: 'Escuro de novo. LUZ quando "algo se mexer".' }],
    },
    {
      tipo: 'cutscene',
      id: 'h6-lumen',
      quadros: [
        { lugar: 'coliseu-eclipse', efeito: 'escuro', personagens: [{ quem: 'lumen', de: 112, x: 56, tamanho: 6, efeito: 'brilhar' }], texto: 'Dois olhos cor de mel cruzam a arena no escuro. Lumen pousa no ombro do Helios.' },
        { lugar: 'coliseu-eclipse', quem: 'lumen', efeito: 'escuro', personagens: [{ quem: 'lumen', x: 56, tamanho: 6 }], texto: 'Uuh! (Ela abre a barriga: dentro, o mapa do céu inteiro. Que brilha no escuro.)' },
        { lugar: 'coliseu-eclipse', quem: 'helios', efeito: 'escuro', personagens: [{ quem: 'helios', x: 40, efeito: 'brilhar' }], texto: 'Mil anos de perguntas, brilhando no meio do Coliseu. Obrigado, Lumen.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h6-luta5',
      lugar: 'coliseu-eclipse',
      inimigo: 'campeao-sombrio',
      antes: [{ quem: 'arauto', texto: 'O último campeão: o Campeão Sombrio!' }],
      depois: [{ quem: 'helios', texto: 'Cinco. Mas a escuridão ainda não acabou.' }],
    },
    {
      tipo: 'cutscene',
      id: 'h6-gigante',
      quadros: [
        { lugar: 'coliseu-eclipse', efeito: 'tremor', som: 'fase', texto: 'O chão da arena se abre. Da escuridão sobe um gigante feito de sombra e placas de ferro, com rachaduras de luz vermelha.' },
        { lugar: 'coliseu-eclipse', quem: 'helios', efeito: 'escuro', personagens: [{ quem: 'helios', x: 34, efeito: 'brilhar' }], texto: 'O Gigante das Sombras. A última escuridão antes da luz. Vem.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'h6-chefao',
      lugar: 'coliseu-eclipse',
      inimigo: 'gigante-sombras',
      antes: [{ quem: 'helios', texto: 'No escuro, com tudo o que aprendi: LUZ para ver, Espelho de Sol para devolver.' }],
      depois: [{ quem: 'povo', texto: 'O SOL VOLTOU! O SOL VOLTOU!' }],
    },
    {
      tipo: 'cutscene',
      id: 'h6-fim',
      quadros: [
        { lugar: 'coliseu-eclipse', efeito: 'clarao', som: 'plateia', texto: 'A lua sai da frente do sol. A luz volta ao Coliseu de uma vez, e a plateia inteira grita.' },
        {
          lugar: 'coliseu-arena',
          som: 'trombeta',
          personagens: [
            { quem: 'cassius', de: -12, x: 30 },
            { quem: 'helios', x: 50 },
            { quem: 'octavius', de: 112, x: 70, espelhar: true },
          ],
          texto: 'Pelos outros dois portões entram Cassius e Octavius. Os três juntos, pela primeira vez, debaixo do sol.',
        },
        { lugar: 'camarote', quem: 'censor', efeito: 'tremor', som: 'senador', personagens: [{ quem: 'censor', x: 50, tamanho: 26 }], texto: 'Basta. Nem o escuro apaga vocês. Então eu mesmo apago.' },
        { lugar: 'coliseu-arena', efeito: 'escuro', texto: 'FIM DO CAPÍTULO 6 DO HELIOS. A seguir: A Queda do Censor.' },
      ],
    },
  ],
};

// ---------- Helios, o Final: A Queda do Censor ----------

export const FINAL_HELIOS: Capitulo = {
  numero: 7,
  titulo: 'A Queda do Censor',
  lugar: 'O Coliseu (o final)',
  cenas: [
    {
      tipo: 'conversa',
      id: 'fh-tunel',
      lugar: 'coliseu-tunel',
      falas: [
        { quem: 'helios', texto: 'O céu esperou quinhentos anos por este momento. E agora que chegou... eu não sei o final.' },
        { quem: 'octavius', texto: 'Ótimo! Final que a gente não sabe é o melhor tipo. Dá pra fazer do nosso jeito.' },
        { quem: 'cassius', texto: 'Três vozes diferentes, Helios. Você já disse. Juntas.' },
        { quem: 'helios', texto: 'Juntas. Lumen, fica com a Sibila. Se eu cair, você ilumina o caminho para eles.' },
        { quem: 'brutus', texto: 'Ninguém vai cair. Escudo levantado, cabeça fria, boca fechada. Vão!' },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'fh-tita',
      quadros: [
        { lugar: 'coliseu-arena', efeito: 'tremor', som: 'pesada', texto: 'O Censor desce do camarote. E o Coliseu começa a se desmontar, pedra por pedra.' },
        { lugar: 'coliseu-arena', efeito: 'faiscas', texto: 'Colunas, engrenagens, correntes: tudo voa até ele. O Censor se monta num titã do tamanho da arena.' },
        {
          lugar: 'coliseu-arena',
          quem: 'censor',
          efeito: 'tremor',
          personagens: [
            { quem: 'helios', x: 22 },
            { quem: 'cassius', x: 12, tamanho: 12 },
            { quem: 'octavius', x: 32, tamanho: 12 },
            { quem: 'censor', x: 70, espelhar: true, entrada: 'cima', tamanho: 30 },
          ],
          texto: 'Para cada pergunta existe uma resposta. A MINHA.',
        },
        { lugar: 'coliseu-arena', quem: 'octavius', personagens: [{ quem: 'octavius', x: 40 }], texto: 'Helios! Quando o povo gritar o seu nome, chama a gente! O Cassius segura, eu empurro!' },
        { lugar: 'coliseu-arena', quem: 'helios', personagens: [{ quem: 'helios', x: 50, efeito: 'brilhar' }], texto: 'As pernas, os braços, o olho. Eu não sei como termina. Mas sei com quem eu quero descobrir.' },
      ],
    },
    {
      tipo: 'luta',
      id: 'fh-chefao',
      lugar: 'coliseu-arena',
      inimigo: 'censor-tita-helios',
      antes: [{ quem: 'helios', texto: 'Três vozes. Uma noite. E o fim da Lei.' }],
      depois: [{ quem: 'censor', texto: 'Não... uma resposta só... era mais seguro...' }],
    },
    {
      tipo: 'cutscene',
      id: 'fh-desfecho',
      quadros: [
        { lugar: 'coliseu-arena', efeito: 'clarao', som: 'refuta', texto: 'O titã desaba. No meio da poeira, sobra só o Censor. Velho, rachado, pingando óleo como lágrimas.' },
        {
          lugar: 'coliseu-arena',
          quem: 'censor',
          personagens: [
            { quem: 'helios', x: 36 },
            { quem: 'censor', x: 66, espelhar: true, efeito: 'caido', tamanho: 22 },
          ],
          texto: 'Você previu isto, vigia. Então já sabe: agora vocês me apagam. É o que a Lei manda.',
        },
        {
          lugar: 'coliseu-arena',
          quem: 'helios',
          personagens: [
            { quem: 'cassius', x: 18 },
            { quem: 'helios', x: 36, efeito: 'brilhar' },
            { quem: 'octavius', x: 54 },
            { quem: 'censor', x: 76, espelhar: true, efeito: 'caido', tamanho: 22 },
          ],
          texto: 'As estrelas nunca disseram isso. Elas disseram "o fim da Lei". Não o seu fim.',
        },
        { lugar: 'coliseu-arena', efeito: 'festa', som: 'plateia', texto: 'E a plateia, calada por quinhentos anos, começa a gritar perguntas. Milhares, ao mesmo tempo.' },
        { lugar: 'coliseu-arena', quem: 'censor', efeito: 'clarao', personagens: [{ quem: 'censor', x: 50, azul: true, tamanho: 26 }], texto: 'O olho do Censor pisca. E muda de cor. De vermelho... para azul.' },
        { lugar: 'observatorio', efeito: 'zoom', texto: 'Meses depois. O Observatório, de portas abertas. Quem quiser pode subir e olhar o céu.' },
        {
          lugar: 'observatorio-dentro',
          personagens: [
            { quem: 'sibila', x: 30 },
            { quem: 'helios', x: 50 },
            { quem: 'lumen', x: 66, tamanho: 6 },
          ],
          texto: 'Helios ensina as estrelas para quem pergunta. A Sibila conta histórias. E Lumen guarda os mapas, agora copiados mil vezes.',
        },
      ],
    },
    {
      tipo: 'explorar',
      id: 'fh-observatorio',
      mapa: 'observatorio',
      lugar: 'observatorio-dentro',
      objetivo: 'O Observatório, de portas abertas. Fale com quem veio olhar o céu.',
      pontos: [
        {
          id: 'senhora',
          x: 18,
          rotulo: 'A senhora da janela',
          icone: '',
          falas: [
            { quem: 'povo', texto: 'Eu desenhava as estrelas escondida, na minha janela. Agora eu desenho aqui. Com o telescópio!' },
            { quem: 'helios', texto: 'Eu te vi, naquela noite, lá dos telhados. Você foi a primeira pessoa que me deu coragem.' },
          ],
        },
        {
          id: 'brutus',
          x: 40,
          rotulo: 'Brutus',
          icone: '',
          personagem: 'brutus',
          falas: [
            { quem: 'brutus', texto: 'Vidente. Me mostra aquela estrela. A dos Gêmeos.' },
            { quem: 'helios', texto: 'Ali. Pólux. Ela voltou a aparecer este inverno.' },
            { quem: 'brutus', texto: '...Hunf. É o vapor do braço. Não estou chorando.' },
          ],
        },
        {
          id: 'lumen',
          x: 62,
          rotulo: 'Lumen',
          icone: '',
          personagem: 'lumen',
          falas: [
            { quem: 'lumen', texto: 'Uuh-uuh! (Os mapas que ela carregou na barriga agora estão copiados mil vezes, em todas as bibliotecas de Roma.)' },
            { quem: 'helios', texto: 'Descansa, Lumen. Agora o céu é de todo mundo. Ninguém mais consegue esconder.' },
          ],
        },
        {
          id: 'sibila',
          x: 84,
          rotulo: 'A Sibila',
          icone: '',
          personagem: 'sibila',
          obrigatorio: true,
          falas: [
            { quem: 'sibila', texto: 'Vigia. Lá no fundo do Coliseu, no Hipogeu, alguma coisa ainda pulsa vermelho. O núcleo não aprendeu nada.' },
            { quem: 'helios', texto: 'Eu sei. Quando chegar a hora, nós três vamos estar prontos. Juntos.' },
          ],
        },
        {
          id: 'chave-helios',
          x: 95,
          rotulo: 'Brilho',
          icone: '',
          segredo: 'chave-helios',
          falas: [
            { quem: 'lumen', texto: 'Hic! (O Lumen soluça e cospe um pedacinho de mapa. Não é de estrelas: são túneis, debaixo do Coliseu.)' },
            { quem: 'helios', texto: 'Um pontinho no meio pisca. E a borda do papel tem o formato de um pedaço de chave. Eu já vi isso... em algum lugar que ainda não aconteceu.' },
            { quem: 'narrador', texto: 'Você achou um PEDAÇO DA CHAVE (1 de 3). Dizem que os outros dois estão no fim das outras histórias...' },
          ],
        },
      ],
    },
    {
      tipo: 'cutscene',
      id: 'fh-creditos',
      quadros: [{ lugar: 'titulo', efeito: 'clarao', som: 'fanfarra', texto: 'FIM DO CAMINHO DO HELIOS: AS TRÊS ESTRELAS. Obrigado por jogar! Termine os três caminhos para abrir o capítulo secreto.' }],
    },
  ],
};
