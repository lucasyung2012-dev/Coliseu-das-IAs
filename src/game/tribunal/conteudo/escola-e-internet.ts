import { dilema } from './fazer';

// Dilemas escritos à mão (decisão D6), 18/11/2026. Toda carta tem 2 temas diferentes.

export const PROJETOS = dilema(
  'projetos',
  'A escola deve trocar provas por projetos?',
  {
    tese: 'Aprender fazendo: o projeto mostra o que você sabe de verdade.',
    tempos: [
      [
        ['Aprender fazendo', 'Construir um projeto obriga a usar o que você aprendeu, não só a decorar.', ['logica', 'inovacao']],
        ['Trabalho em equipe', 'No projeto, a turma aprende a dividir tarefas e a ajudar quem tem dificuldade.', ['pessoas', 'viabilidade']],
        ['Sem branco na hora', 'Muitos alunos travam na prova mesmo sabendo a matéria. O projeto mede melhor.', ['pessoas', 'prova']],
        ['A feira de ciências', 'Imagine a escola cheia de maquetes, robôs e experimentos criados pelos alunos.', ['imagem', 'inovacao']],
        ['Sucata e criatividade', 'Projeto pode usar sucata, papel e imaginação. Não precisa de material caro.', ['custo', 'viabilidade']],
        ['Alunos mais interessados', 'Escolas que trocaram parte das provas por projetos viram os alunos mais animados com as aulas.', ['prova', 'logica']],
      ],
      [
        ['Dá para dar nota', 'Meu rival diz que projeto é difícil de avaliar. Com critérios claros, o professor avalia cada parte.', ['logica', 'viabilidade']],
        ['Quem não faz, aparece', 'Com etapas e apresentação, quem não trabalhou no grupo fica visível.', ['viabilidade', 'pessoas']],
        ['Decorar não é saber', 'Uma semana depois da prova, quase tudo já foi esquecido. O projeto fica na memória.', ['prova', 'logica']],
        ['O mundo trabalha assim', 'Nas profissões, ninguém faz prova: todo mundo entrega projetos.', ['inovacao', 'viabilidade']],
        ['Mestre e aprendiz', 'Os artesãos sempre aprenderam fazendo, ao lado de um mestre. Projeto é isso.', ['tradicao', 'imagem']],
        ['Menos papel', 'Sem imprimir prova toda semana, a escola economiza.', ['custo', 'inovacao']],
      ],
      [
        ['Saber usar', 'O projeto mostra se você sabe usar o que aprendeu, não só se lembra.', ['logica', 'prova']],
        ['Cada um brilha', 'Cada aluno contribui com o que faz melhor, e ninguém fica para trás.', ['pessoas', 'imagem']],
        ['Começa por uma matéria', 'Troca a prova de uma matéria por bimestre e vai ajustando.', ['viabilidade', 'custo']],
        ['A escola que resolve', 'Uma escola onde os alunos criam soluções para o próprio bairro.', ['inovacao', 'pessoas']],
        ['Como sempre se aprendeu', 'Antes de existir prova, aprendia-se construindo. Voltar a isso é sabedoria.', ['tradicao', 'logica']],
        ['O orgulho de mostrar', 'Imagine apresentar para os pais algo que você mesmo construiu.', ['imagem', 'tradicao']],
      ],
    ],
  },
  {
    tese: 'A prova é justa e igual para todos; projeto pode complementar.',
    tempos: [
      [
        ['Igual para todos', 'Na prova, todo mundo responde às mesmas perguntas. É justo.', ['logica', 'tradicao']],
        ['Quem fez o trabalho?', 'No projeto, às vezes um faz tudo e todos ganham a mesma nota.', ['pessoas', 'prova']],
        ['Cartolina custa', 'Material, impressão, cartolina... Nem toda família consegue pagar.', ['custo', 'pessoas']],
        ['Semanas demais', 'Um projeto toma semanas que poderiam ser usadas para ensinar mais conteúdo.', ['viabilidade', 'logica']],
        ['Provas funcionam', 'Gerações aprenderam com provas e chegaram longe.', ['tradicao', 'prova']],
        ['Moda da escola', 'Toda década aparece um método novo que promete tudo. Poucos duram.', ['inovacao', 'viabilidade']],
      ],
      [
        ['Nota de gosto', 'Meu rival fala em critérios claros, mas a nota do projeto depende muito do gosto do professor.', ['logica', 'prova']],
        ['A pressão também ensina', 'Saber lidar com um teste é uma habilidade para a vida, como numa entrevista de emprego.', ['pessoas', 'viabilidade']],
        ['Vestibular é prova', 'Para entrar na faculdade e em concursos, vai ter prova. É preciso treinar.', ['viabilidade', 'tradicao']],
        ['Ajuda de casa', 'Projeto feito em casa favorece quem tem pais com tempo e dinheiro para ajudar.', ['pessoas', 'custo']],
        ['Bonito por fora', 'Uma maquete linda pode esconder que o aluno não entendeu a matéria.', ['imagem', 'logica']],
        ['Rápida e barata', 'Uma folha e uma hora mostram o que a turma inteira aprendeu.', ['custo', 'viabilidade']],
      ],
      [
        ['Justiça em primeiro lugar', 'Mesmas perguntas, mesmo tempo, mesma régua. Isso é justo.', ['logica', 'pessoas']],
        ['Os dois juntos', 'Prova para medir, projeto para complementar. Trocar tudo é exagero.', ['viabilidade', 'tradicao']],
        ['A vida cobra', 'A vida vai cobrar provas. A escola não pode fingir que não.', ['prova', 'viabilidade']],
        ['Sem gasto extra', 'Prova não pesa no bolso de nenhuma família.', ['custo', 'pessoas']],
        ['Séculos de prova', 'Provas existem há séculos porque funcionam.', ['tradicao', 'prova']],
        ['A sala concentrada', 'Todos concentrados, cada um mostrando o que sabe, sem depender de ninguém.', ['imagem', 'logica']],
      ],
    ],
  },
);

export const JOGOS = dilema(
  'jogos',
  'Jogos digitais devem ensinar cidadania na escola?',
  {
    tese: 'Jogando, a gente aprende a decidir, a respeitar regras e a pensar no outro.',
    tempos: [
      [
        ['Errar sem medo', 'No jogo você erra, tenta de novo e aprende com isso, sem medo de nota.', ['logica', 'pessoas']],
        ['Os alunos prestam atenção', 'Pesquisas mostram que os alunos prestam mais atenção quando a aula tem jogo.', ['prova', 'pessoas']],
        ['A cidade de mentirinha', 'Imagine a turma governando uma cidade virtual e vendo o resultado das escolhas.', ['imagem', 'inovacao']],
        ['Grátis e no celular', 'Muitos jogos educativos são gratuitos e rodam no celular que o aluno já tem.', ['custo', 'viabilidade']],
        ['Regras de convivência', 'Jogo tem regra, tem vez de cada um, tem respeito ao adversário: igual à vida em sociedade.', ['tradicao', 'logica']],
        ['Cidadania digital', 'O mundo virou digital. Ensinar a ser cidadão na internet também é cidadania.', ['inovacao', 'viabilidade']],
      ],
      [
        ['Jogo não é bagunça', 'Meu rival acha que jogo distrai. Um jogo bem escolhido tem objetivo, e o professor guia.', ['logica', 'viabilidade']],
        ['A turma participa', 'Escolas que testaram viram os alunos mais participativos nos debates.', ['prova', 'pessoas']],
        ['O tímido se solta', 'Quem não fala na sala às vezes se solta jogando em equipe.', ['pessoas', 'imagem']],
        ['Do tabuleiro à tela', 'Jogos sempre ensinaram: xadrez, dama, tabuleiro. O digital só continua isso.', ['tradicao', 'inovacao']],
        ['Sem comprar nada', 'Usa o computador da escola e jogos gratuitos.', ['custo', 'viabilidade']],
        ['Errar no jogo custa zero', 'Errar no jogo não custa nada. Errar na vida custa caro.', ['custo', 'logica']],
      ],
      [
        ['Cidadão que treina', 'Quem treina decisões no jogo decide melhor na vida.', ['logica', 'prova']],
        ['Uma turma unida', 'Jogar junto ensina a ouvir e a cooperar.', ['pessoas', 'tradicao']],
        ['Uma aula por mês', 'Uma aula por mês com um jogo já faz diferença.', ['viabilidade', 'custo']],
        ['A aula inesquecível', 'Imagine lembrar da aula em que a sua turma salvou a cidade virtual.', ['imagem', 'pessoas']],
        ['A escola que evolui', 'A escola sempre usou o que havia de novo para ensinar.', ['inovacao', 'tradicao']],
        ['Progresso medido', 'Dá para acompanhar o avanço de cada aluno pelo próprio jogo.', ['prova', 'inovacao']],
      ],
    ],
  },
  {
    tese: 'Cidadania se aprende na vida real: conversando, participando, convivendo.',
    tempos: [
      [
        ['Tela demais', 'As crianças já passam horas na tela. A escola deveria ser o lugar de sair dela.', ['pessoas', 'logica']],
        ['A vida não tem "tentar de novo"', 'No jogo dá para recomeçar. Na cidade de verdade, as escolhas têm peso.', ['logica', 'imagem']],
        ['Nem todo mundo tem aparelho', 'Aluno sem celular ou internet fica de fora.', ['pessoas', 'custo']],
        ['Conversa olho no olho', 'Debate, assembleia, visita à prefeitura: assim se aprende cidadania há gerações.', ['tradicao', 'pessoas']],
        ['Estudo pago pela empresa', 'Muitos estudos sobre jogos educativos são pequenos e pagos pelas próprias empresas de jogos.', ['prova', 'inovacao']],
        ['Computador quebrado', 'A sala de informática sempre tem máquina estragada e internet caindo.', ['viabilidade', 'custo']],
      ],
      [
        ['Só pensa em pontos', 'Meu rival fala em objetivo, mas no jogo o aluno quer pontos, não pensar no outro.', ['logica', 'pessoas']],
        ['Grêmio ensina mais', 'Um grêmio estudantil ensina mais cidadania que qualquer jogo.', ['tradicao', 'viabilidade']],
        ['O grátis que sai caro', 'Licença, manutenção, internet: o "grátis" sai caro.', ['custo', 'prova']],
        ['Prender não é ensinar', 'Jogos são feitos para prender a atenção, não para fazer pensar.', ['inovacao', 'logica']],
        ['A sala em silêncio', 'Uma turma inteira calada, cada um na sua tela.', ['imagem', 'pessoas']],
        ['Professor sem treino', 'Sem formação, o professor não sabe usar o jogo direito.', ['viabilidade', 'prova']],
      ],
      [
        ['Cidadania é encontro', 'Aprender a conviver exige gente de verdade na sua frente.', ['pessoas', 'tradicao']],
        ['A escola longe da tela', 'O melhor que a escola pode oferecer hoje é um tempo longe das telas.', ['logica', 'imagem']],
        ['Projeto no bairro', 'Limpar a praça ou visitar a Câmara ensina mais e custa pouco.', ['viabilidade', 'custo']],
        ['O que sempre formou cidadãos', 'Debates, eleição de turma e assembleias formam cidadãos há séculos.', ['tradicao', 'prova']],
        ['Mais uma moda', 'Jogo na escola pode ser só mais uma novidade que passa.', ['inovacao', 'logica']],
        ['A praça cheia', 'Imagine a turma inteira cuidando da praça do bairro, juntos.', ['imagem', 'pessoas']],
      ],
    ],
  },
);

export const PUBLICIDADE = dilema(
  'publicidade',
  'Influenciadores devem avisar quando é propaganda?',
  {
    tese: 'Quem assiste tem o direito de saber quando alguém está sendo pago.',
    tempos: [
      [
        ['Direito de saber', 'Se alguém está sendo pago para elogiar, quem assiste precisa saber.', ['logica', 'pessoas']],
        ['Criança não percebe', 'Pesquisas mostram que crianças não percebem quando um vídeo é propaganda.', ['prova', 'pessoas']],
        ['É só uma etiqueta', 'Escrever "publicidade" no vídeo leva um segundo.', ['viabilidade', 'custo']],
        ['Como na TV', 'Na televisão, propaganda sempre foi separada do programa. Na internet deve ser igual.', ['tradicao', 'logica']],
        ['Confiança vale ouro', 'Influenciador honesto ganha seguidores que ficam.', ['custo', 'imagem']],
        ['Internet transparente', 'Imagine saber, em todo vídeo, o que é opinião e o que é anúncio.', ['imagem', 'inovacao']],
      ],
      [
        ['Não atrapalha ninguém', 'Meu rival diz que estraga o vídeo. Uma etiqueta pequena não estraga nada.', ['logica', 'viabilidade']],
        ['Outros países já fazem', 'Vários países já exigem o aviso, e os influenciadores continuam ganhando bem.', ['prova', 'inovacao']],
        ['Protege quem tem pouco', 'Quem compra por uma indicação falsa perde um dinheiro que faz falta.', ['pessoas', 'custo']],
        ['Mudou o lugar, não a regra', 'Propaganda sempre teve regras. Mudou o lugar, não o princípio.', ['tradicao', 'prova']],
        ['O botão já existe', 'As redes já têm o botão de "parceria paga". É só usar.', ['viabilidade', 'inovacao']],
        ['Honestidade é bonita', 'Um criador dizendo "é patrocinado, mas eu gosto mesmo" passa confiança.', ['imagem', 'pessoas']],
      ],
      [
        ['Transparência é justiça', 'Saber quem paga é o mínimo para escolher bem.', ['logica', 'pessoas']],
        ['Os dados são claros', 'Sem o aviso, crianças e adultos são enganados. Com ele, bem menos.', ['prova', 'logica']],
        ['Custa zero', 'Uma etiqueta não custa nada e protege muita gente.', ['custo', 'viabilidade']],
        ['Regra antiga e boa', 'Propaganda honesta é uma regra antiga e boa.', ['tradicao', 'imagem']],
        ['Redes melhores', 'Redes mais honestas são redes melhores para todo mundo.', ['inovacao', 'pessoas']],
        ['Seguidor que fica', 'Quem é honesto ganha seguidores fiéis, e isso rende mais.', ['custo', 'imagem']],
      ],
    ],
  },
  {
    tese: 'Regra demais trava a criatividade, e quem assiste já percebe.',
    tempos: [
      [
        ['O público não é bobo', 'Quem segue um influenciador já sabe que ele faz parceria com marcas.', ['logica', 'pessoas']],
        ['Liberdade para criar', 'Regras demais atrapalham a criatividade de quem faz vídeo.', ['inovacao', 'imagem']],
        ['Impossível fiscalizar', 'São milhões de vídeos por dia. Quem vai conferir todos?', ['viabilidade', 'prova']],
        ['O pequeno criador sofre', 'Quem está começando pode perder patrocínio por medo da regra.', ['custo', 'pessoas']],
        ['Indicação de amigo', 'Desde sempre, indicar um produto de que você gosta é normal entre amigos.', ['tradicao', 'logica']],
        ['Ganhou de presente', 'Às vezes ganhou de presente e gostou. É propaganda? Fica confuso.', ['prova', 'custo']],
      ],
      [
        ['Etiqueta que ninguém lê', 'Meu rival fala de uma etiqueta. As pessoas passam direto e nem veem.', ['prova', 'logica']],
        ['Ensinar em vez de multar', 'Melhor ensinar as crianças a desconfiar do que multar quem faz vídeo.', ['pessoas', 'viabilidade']],
        ['Multa assusta', 'Uma multa pode acabar com um canal pequeno.', ['custo', 'viabilidade']],
        ['A internet cresceu livre', 'A internet cresceu justamente por não ter as regras da TV.', ['inovacao', 'tradicao']],
        ['Cada vídeo é um caso', 'Review, parceria, presente: uma regra só não serve para tudo.', ['logica', 'imagem']],
        ['O vídeo fica feio', 'Um aviso grande em todo vídeo atrapalha quem está assistindo.', ['imagem', 'pessoas']],
      ],
      [
        ['Confie no público', 'As pessoas sabem escolher. Não precisam de etiqueta para pensar.', ['logica', 'pessoas']],
        ['Educação resolve', 'Ensinar a pensar vale mais que qualquer aviso, como sempre valeu.', ['pessoas', 'tradicao']],
        ['Lei só no papel', 'Sem como fiscalizar, a lei fica só no papel.', ['viabilidade', 'prova']],
        ['Mais ideias novas', 'Menos regras, mais criatividade.', ['inovacao', 'imagem']],
        ['Proteja quem começa', 'Protejam quem está começando, não só as grandes marcas.', ['custo', 'pessoas']],
        ['Livre como nasceu', 'A internet cresceu livre e criativa. Não vamos travar isso.', ['inovacao', 'tradicao']],
      ],
    ],
  },
);
