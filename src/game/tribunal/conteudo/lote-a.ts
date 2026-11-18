import { dilema } from './fazer';

// Dilemas escritos à mão (decisão D6), lote A.

export const TRANSPORTE = dilema(
  'transporte',
  'As cidades devem priorizar transporte público?',
  {
    tese: 'Ônibus e metrô levam muita gente gastando pouco espaço.',
    tempos: [
      [
        ['Cabe mais gente', 'Um ônibus cheio tira dezenas de carros da rua.', ['logica', 'viabilidade']],
        ['Para quem não dirige', 'Crianças, idosos e quem não tem carro também precisam chegar.', ['pessoas', 'tradicao']],
        ['Mais barato no bolso', 'A passagem custa menos que gasolina, estacionamento e conserto.', ['custo', 'pessoas']],
        ['Ar mais limpo', 'Cidades com bom metrô costumam ter menos fumaça no ar.', ['prova', 'imagem']],
        ['Ônibus elétrico', 'Ônibus elétricos já rodam em várias cidades, sem barulho e sem fumaça.', ['inovacao', 'prova']],
        ['A cidade que anda', 'Imagine chegar à escola sem ficar preso no engarrafamento.', ['imagem', 'logica']],
      ],
      [
        ['Lento porque falta', 'Meu rival diz que o ônibus é lento. É lento porque divide a pista com os carros.', ['logica', 'viabilidade']],
        ['Faixa exclusiva', 'Pintar uma faixa só para ônibus é rápido e barato.', ['viabilidade', 'custo']],
        ['Funciona lá fora', 'Cidades que investiram em metrô viram o trânsito melhorar.', ['prova', 'inovacao']],
        ['Liberdade para todos', 'Meu rival fala em liberdade do carro. E quem não pode pagar um carro?', ['pessoas', 'imagem']],
        ['O bonde de antigamente', 'Nossas cidades já tiveram bondes e trens por toda parte.', ['tradicao', 'prova']],
        ['Aplicativo do ônibus', 'Hoje o celular mostra a hora exata em que o ônibus chega.', ['inovacao', 'pessoas']],
      ],
      [
        ['Espaço para todos', 'A rua é de todo mundo. Quem leva mais gente merece passar primeiro.', ['logica', 'pessoas']],
        ['Conta mais leve', 'Menos gasto com gasolina para as famílias e com asfalto para a cidade.', ['custo', 'viabilidade']],
        ['Já deu certo', 'Onde o transporte público é bom, as pessoas usam de verdade.', ['prova', 'logica']],
        ['Volta às origens', 'Antes do carro, as cidades cresceram em volta dos trilhos.', ['tradicao', 'imagem']],
        ['Futuro sobre trilhos', 'Metrô moderno, ônibus elétrico e bicicleta juntos. Esse é o futuro.', ['inovacao', 'viabilidade']],
        ['Rua com árvore', 'Imagine ruas com menos carros e mais árvores e praças.', ['imagem', 'pessoas']],
      ],
    ],
  },
  {
    tese: 'Cada família tem sua rotina, e o carro ainda resolve o que o ônibus não alcança.',
    tempos: [
      [
        ['Onde o ônibus não vai', 'Em muitos bairros, o ponto mais perto fica longe demais.', ['viabilidade', 'pessoas']],
        ['Obra que não acaba', 'Linha de metrô leva anos para ficar pronta e custa muito caro.', ['custo', 'prova']],
        ['A feira da semana', 'Levar compras, criança pequena e cachorro de ônibus não é fácil.', ['pessoas', 'logica']],
        ['Liberdade de ir e vir', 'Com carro, a família sai na hora que quer, para onde quer.', ['tradicao', 'imagem']],
        ['Carro também evolui', 'Carros elétricos e compartilhados já poluem bem menos.', ['inovacao', 'logica']],
        ['Ônibus lotado', 'Imagine uma hora em pé, apertado, num ônibus quente.', ['imagem', 'prova']],
      ],
      [
        ['Faixa tira espaço', 'Meu rival quer faixa exclusiva. Isso aperta ainda mais quem precisa do carro.', ['logica', 'pessoas']],
        ['Quem paga o metrô?', 'Meu rival diz que é barato. O metrô usa dinheiro de imposto de todo mundo.', ['custo', 'logica']],
        ['Cidade espalhada', 'Nossas cidades cresceram espalhadas. Trilho não chega em todo canto.', ['viabilidade', 'tradicao']],
        ['Promessa velha', 'Muitas linhas prometidas nunca saíram do papel.', ['prova', 'imagem']],
        ['O jeito brasileiro', 'Ter o próprio carro ainda é um sonho de muitas famílias.', ['tradicao', 'pessoas']],
        ['Carona por aplicativo', 'Aplicativos de carona dividem o carro e enchem os bancos vazios.', ['inovacao', 'viabilidade']],
      ],
      [
        ['Escolha de cada um', 'Cada família sabe o que funciona para a sua rotina.', ['pessoas', 'logica']],
        ['Dinheiro bem usado', 'Consertar as ruas que já existem custa menos que cavar túnel.', ['custo', 'viabilidade']],
        ['Funcionar antes de crescer', 'Primeiro o ônibus que já existe precisa funcionar bem.', ['viabilidade', 'prova']],
        ['Hábito não muda à força', 'Ninguém larga o carro só porque a cidade mandou.', ['tradicao', 'logica']],
        ['O carro do futuro', 'O carro elétrico e compartilhado resolve sem obra gigante.', ['inovacao', 'custo']],
        ['Porta a porta', 'Imagine chegar em casa na chuva sem andar até o ponto.', ['imagem', 'pessoas']],
      ],
    ],
  },
);

export const PENSAMENTO = dilema(
  'pensamento',
  'O pensamento crítico deve ser ensinado desde cedo?',
  {
    tese: 'Criança que aprende a perguntar cresce sabendo decidir melhor.',
    tempos: [
      [
        ['Perguntar por quê', 'Crianças já perguntam o porquê de tudo. A escola só organiza isso.', ['logica', 'tradicao']],
        ['Notícia falsa', 'Quem aprende a checar a fonte cai menos em mentira na internet.', ['prova', 'inovacao']],
        ['Escolhas melhores', 'Pensar antes de agir ajuda a evitar brigas e enganos.', ['pessoas', 'logica']],
        ['Cabe em qualquer aula', 'Dá para treinar em matemática, ciências e até em histórias.', ['viabilidade', 'custo']],
        ['Mundo cheio de telas', 'Hoje as crianças veem vídeos e anúncios desde pequenas.', ['inovacao', 'pessoas']],
        ['Pequenos detetives', 'Imagine uma turma investigando se um boato é verdade.', ['imagem', 'prova']],
      ],
      [
        ['Não é desobedecer', 'Meu rival diz que a criança vai questionar tudo. Questionar com respeito é diferente de desobedecer.', ['logica', 'pessoas']],
        ['Nada de material caro', 'Meu rival fala em custo. Basta uma boa pergunta e uma conversa.', ['custo', 'viabilidade']],
        ['Escolas que já fazem', 'Escolas que treinam debate têm alunos que explicam melhor as ideias.', ['prova', 'imagem']],
        ['Os sábios perguntavam', 'Os grandes pensadores antigos ensinavam fazendo perguntas.', ['tradicao', 'logica']],
        ['Jogos que ensinam', 'Jogos de debate e enigmas ensinam a pensar brincando.', ['inovacao', 'viabilidade']],
        ['Proteção contra golpe', 'Quem aprende cedo a desconfiar cai menos em golpe de mensagem.', ['pessoas', 'prova']],
      ],
      [
        ['Hábito desde pequeno', 'O que se aprende cedo vira hábito para a vida toda.', ['logica', 'tradicao']],
        ['Cidadão de verdade', 'Quem pensa por conta própria escolhe melhor e participa mais.', ['pessoas', 'imagem']],
        ['Começar simples', 'Uma pergunta por dia na sala já é um começo.', ['viabilidade', 'custo']],
        ['Mais barato que consertar', 'Ensinar agora custa menos que corrigir enganos depois.', ['custo', 'logica']],
        ['Preparado para o novo', 'O mundo muda rápido. Quem sabe pensar se adapta.', ['inovacao', 'prova']],
        ['Mentes curiosas', 'Imagine uma geração que não engole qualquer coisa.', ['imagem', 'inovacao']],
      ],
    ],
  },
  {
    tese: 'Criança pequena precisa primeiro de base sólida; a crítica vem com o tempo.',
    tempos: [
      [
        ['Primeiro o básico', 'Antes de criticar, a criança precisa saber ler e fazer contas.', ['logica', 'viabilidade']],
        ['Cada idade tem seu tempo', 'Criança pequena ainda está aprendendo a confiar e a conviver.', ['pessoas', 'prova']],
        ['Professor sem preparo', 'Muitos professores nunca aprenderam a ensinar isso.', ['viabilidade', 'custo']],
        ['Respeito aos mais velhos', 'Escutar pais e professores também é um valor importante.', ['tradicao', 'pessoas']],
        ['Moda da educação', 'Toda hora surge um método novo que some no ano seguinte.', ['inovacao', 'imagem']],
        ['Criança que duvida de tudo', 'Imagine uma criança que não acredita nem quando o adulto avisa do perigo.', ['imagem', 'logica']],
      ],
      [
        ['Grade cheia', 'Meu rival diz que cabe em qualquer aula. A grade já está cheia de matérias.', ['viabilidade', 'logica']],
        ['Treinar professor custa', 'Meu rival diz que é barato. Formar todos os professores leva tempo e dinheiro.', ['custo', 'prova']],
        ['Casa é o lugar', 'Conversar sobre o certo e o errado sempre foi papel da família.', ['tradicao', 'pessoas']],
        ['Resultado incerto', 'Ainda não se sabe bem o que funciona com crianças tão novas.', ['prova', 'inovacao']],
        ['Brincar também ensina', 'Brincar livre já desenvolve o raciocínio, sem aula extra.', ['pessoas', 'imagem']],
        ['Debate vira briga', 'Sem maturidade, um debate pode virar só discussão.', ['logica', 'imagem']],
      ],
      [
        ['Base antes do telhado', 'Ninguém constrói o telhado antes da parede.', ['logica', 'tradicao']],
        ['Infância leve', 'Deixe a criança ser criança antes de tanta cobrança.', ['pessoas', 'imagem']],
        ['Na hora certa', 'Na adolescência, o pensamento crítico rende muito mais.', ['viabilidade', 'prova']],
        ['Dinheiro no essencial', 'Melhor investir em leitura e matemática que em novidade.', ['custo', 'inovacao']],
        ['O que sempre funcionou', 'Gerações aprenderam a pensar lendo bons livros.', ['tradicao', 'prova']],
        ['Passo a passo', 'Primeiro aprender, depois questionar. Assim fica mais seguro.', ['logica', 'custo']],
      ],
    ],
  },
);

export const FERRAMENTAS = dilema(
  'ferramentas',
  'Bibliotecas devem emprestar ferramentas?',
  {
    tese: 'Uma furadeira emprestada resolve o problema de muitos vizinhos.',
    tempos: [
      [
        ['Usada uma vez', 'Quase todo mundo usa a furadeira poucas vezes por ano.', ['logica', 'prova']],
        ['Economia para a família', 'Pegar emprestado é bem mais barato que comprar.', ['custo', 'pessoas']],
        ['Menos lixo', 'Menos ferramentas compradas, menos coisa jogada fora.', ['imagem', 'inovacao']],
        ['A biblioteca já empresta', 'A biblioteca já sabe emprestar e cobrar devolução.', ['viabilidade', 'tradicao']],
        ['Biblioteca viva', 'Uma biblioteca que oferece mais coisas atrai mais gente.', ['pessoas', 'inovacao']],
        ['Vizinho ajuda vizinho', 'Emprestar entre vizinhos sempre foi um costume antigo.', ['tradicao', 'logica']],
      ],
      [
        ['Ferramenta dura', 'Meu rival diz que vai quebrar. Ferramenta boa aguenta muito uso.', ['prova', 'logica']],
        ['Registro e prazo', 'Meu rival fala em perda. Cadastro e prazo funcionam com os livros.', ['viabilidade', 'tradicao']],
        ['Já existe no mundo', 'Várias cidades já têm bibliotecas de ferramentas funcionando.', ['prova', 'inovacao']],
        ['Aprender a consertar', 'Com a ferramenta na mão, a família conserta em vez de jogar fora.', ['pessoas', 'custo']],
        ['Oficina na biblioteca', 'A biblioteca pode ensinar a usar com segurança.', ['inovacao', 'pessoas']],
        ['Imagem moderna', 'Imagine a biblioteca do bairro virando um ponto de encontro.', ['imagem', 'custo']],
      ],
      [
        ['Faz sentido', 'Por que cada casa ter uma furadeira parada na gaveta?', ['logica', 'custo']],
        ['Bairro unido', 'Quem empresta e devolve cria confiança entre vizinhos.', ['pessoas', 'tradicao']],
        ['Começa pequeno', 'Uma prateleira com poucas ferramentas já é um começo.', ['viabilidade', 'prova']],
        ['Biblioteca do futuro', 'Biblioteca não é só livro: é lugar de aprender fazendo.', ['inovacao', 'imagem']],
        ['Planeta agradece', 'Dividir em vez de comprar é bom para o planeta.', ['imagem', 'logica']],
        ['Ideia já testada', 'Onde existe, a comunidade usa e pede mais.', ['prova', 'viabilidade']],
      ],
    ],
  },
  {
    tese: 'Biblioteca é lugar de leitura; ferramenta tem outros riscos e custos.',
    tempos: [
      [
        ['Lugar de livro', 'A biblioteca existe para a leitura e o estudo.', ['tradicao', 'logica']],
        ['Risco de acidente', 'Serra e furadeira podem machucar quem não sabe usar.', ['pessoas', 'prova']],
        ['Conserto caro', 'Ferramenta quebra, perde peça e precisa de manutenção.', ['custo', 'viabilidade']],
        ['Falta espaço', 'Muitas bibliotecas já não têm espaço nem para os livros.', ['viabilidade', 'imagem']],
        ['Modismo passageiro', 'Parece ideia bonita, mas pode acabar esquecida no depósito.', ['inovacao', 'logica']],
        ['Barulho na sala', 'Imagine estudar com gente testando furadeira ao lado.', ['imagem', 'pessoas']],
      ],
      [
        ['Livro não machuca', 'Meu rival compara com livros. Livro não corta o dedo de ninguém.', ['logica', 'pessoas']],
        ['Quem responde?', 'Se alguém se ferir, quem paga o prejuízo?', ['custo', 'prova']],
        ['Funcionário sem preparo', 'Bibliotecário entende de livro, não de motor.', ['viabilidade', 'tradicao']],
        ['Já existe aluguel', 'Lojas já alugam ferramentas por um preço baixo.', ['inovacao', 'custo']],
        ['Funciona em poucos lugares', 'Meu rival cita outros países. Lá, muitas dessas ideias fecharam.', ['prova', 'inovacao']],
        ['Dinheiro dos livros', 'Cada ferramenta comprada é um livro a menos na estante.', ['imagem', 'tradicao']],
      ],
      [
        ['Cada coisa no seu lugar', 'Biblioteca forte é biblioteca com bons livros.', ['tradicao', 'imagem']],
        ['Segurança primeiro', 'Emprestar ferramenta perigosa é um risco sem necessidade.', ['pessoas', 'logica']],
        ['Conta que cresce', 'Comprar, consertar e repor ferramentas não acaba nunca.', ['custo', 'viabilidade']],
        ['Melhor alternativa', 'Grupos de vizinhos podem emprestar entre si, sem a biblioteca.', ['viabilidade', 'inovacao']],
        ['Pouca procura', 'Ninguém mostrou que haveria procura no nosso bairro.', ['prova', 'logica']],
        ['Leitura precisa de ajuda', 'Ainda falta incentivo à leitura. Esse é o foco.', ['inovacao', 'prova']],
      ],
    ],
  },
);

export const CONGESTIONAMENTO = dilema(
  'congestionamento',
  'Uma cidade deve cobrar por ruas congestionadas?',
  {
    tese: 'Quem usa a rua mais cheia no pior horário ajuda a pagar por ela.',
    tempos: [
      [
        ['Menos carros', 'Quando passar custa, muita gente muda o horário ou o caminho.', ['logica', 'pessoas']],
        ['Funcionou lá fora', 'Cidades que cobraram viram o trânsito diminuir no centro.', ['prova', 'inovacao']],
        ['Dinheiro para o ônibus', 'O valor cobrado pode melhorar ônibus e ciclovias.', ['custo', 'viabilidade']],
        ['Câmeras fazem o trabalho', 'Câmeras leem a placa e cobram sem parar o carro.', ['inovacao', 'viabilidade']],
        ['Pedágio já existe', 'Pagar para usar estrada já é comum nas rodovias.', ['tradicao', 'custo']],
        ['Centro tranquilo', 'Imagine o centro com menos buzina e menos fumaça.', ['imagem', 'pessoas']],
      ],
      [
        ['Quem polui paga', 'Meu rival diz que é injusto. Injusto é todos respirarem a fumaça.', ['logica', 'imagem']],
        ['Isenção para quem precisa', 'Ambulância, ônibus e moradores podem ficar de fora.', ['pessoas', 'viabilidade']],
        ['Dinheiro com destino', 'Meu rival fala em imposto. A lei pode obrigar o uso só em transporte.', ['custo', 'tradicao']],
        ['Resultado medido', 'Dá para medir o trânsito antes e depois e ajustar.', ['prova', 'logica']],
        ['Só no pior horário', 'Fora do horário de pico, a rua continua de graça.', ['viabilidade', 'custo']],
        ['Cidade inteligente', 'Usar tecnologia para organizar o trânsito é coisa de cidade moderna.', ['inovacao', 'prova']],
      ],
      [
        ['Rua livre vale ouro', 'Tempo parado no trânsito é tempo perdido de todo mundo.', ['logica', 'pessoas']],
        ['Ônibus mais rápido', 'Com menos carros, o ônibus anda e todos ganham.', ['viabilidade', 'prova']],
        ['Paga quem usa', 'É justo que quem mais usa a rua cheia ajude a manter.', ['custo', 'tradicao']],
        ['Testar e ajustar', 'Começa num pedaço do centro e amplia se der certo.', ['inovacao', 'viabilidade']],
        ['Ar de verdade', 'Menos fumaça, menos crianças com tosse.', ['pessoas', 'imagem']],
        ['O centro renasce', 'Imagine calçadas cheias de gente em vez de carros parados.', ['imagem', 'prova']],
      ],
    ],
  },
  {
    tese: 'A rua é de todos, e cobrar pesa mais no bolso de quem tem menos.',
    tempos: [
      [
        ['Rua é de todos', 'A rua sempre foi pública e livre para circular.', ['tradicao', 'pessoas']],
        ['Pesa no bolso pobre', 'Quem tem mais dinheiro paga e passa. Quem tem menos fica de fora.', ['custo', 'pessoas']],
        ['Sem alternativa', 'Sem ônibus bom, muita gente não tem como deixar o carro.', ['viabilidade', 'logica']],
        ['Mais um imposto', 'Parece só mais uma forma de tirar dinheiro do povo.', ['imagem', 'custo']],
        ['Câmera vigiando', 'Câmeras anotando cada carro que passa podem invadir a privacidade.', ['inovacao', 'prova']],
        ['Trânsito muda de lugar', 'O carro desvia e o congestionamento vai para o bairro ao lado.', ['logica', 'prova']],
      ],
      [
        ['Primeiro o ônibus', 'Meu rival diz que o dinheiro melhora o ônibus. Melhore antes de cobrar.', ['logica', 'viabilidade']],
        ['Isenção vira confusão', 'Meu rival fala em isenção. Cada grupo vai querer a sua.', ['viabilidade', 'pessoas']],
        ['Comércio sofre', 'Lojas do centro podem perder clientes que não querem pagar.', ['custo', 'prova']],
        ['Promessa sem garantia', 'Dinheiro de imposto nem sempre chega onde foi prometido.', ['prova', 'tradicao']],
        ['Cidade diferente', 'Meu rival cita cidades ricas. Nossa realidade é outra.', ['inovacao', 'logica']],
        ['Cidade de quem pode', 'Imagine um centro só para quem pode pagar.', ['imagem', 'tradicao']],
      ],
      [
        ['Liberdade de circular', 'Ir e vir não deveria ter preço na própria cidade.', ['tradicao', 'pessoas']],
        ['Justiça no bolso', 'Cobrança igual pesa diferente para ricos e pobres.', ['custo', 'logica']],
        ['Outras saídas', 'Horário flexível e trabalho em casa diminuem o trânsito sem cobrar.', ['inovacao', 'viabilidade']],
        ['Arrumar antes', 'Primeiro ônibus bom, depois pensar em cobrar.', ['viabilidade', 'logica']],
        ['Resultado duvidoso', 'Ninguém garante que funcione aqui como funcionou fora.', ['prova', 'inovacao']],
        ['O centro vazio', 'Imagine as lojas do centro fechando por falta de cliente.', ['imagem', 'custo']],
      ],
    ],
  },
);

export const MUSEUS = dilema(
  'museus',
  'Museus devem devolver peças históricas?',
  {
    tese: 'Peças levadas sem permissão devem voltar para o povo que as criou.',
    tempos: [
      [
        ['Levado sem pedir', 'Muitas peças foram tiradas em guerras, sem o povo concordar.', ['logica', 'prova']],
        ['História de um povo', 'Para muitos povos, essas peças fazem parte da sua história.', ['tradicao', 'pessoas']],
        ['Justiça atrasada', 'Devolver é reconhecer um erro antigo e fazer o certo.', ['imagem', 'logica']],
        ['Já estão devolvendo', 'Alguns museus já devolveram peças e a relação melhorou.', ['prova', 'viabilidade']],
        ['Réplicas modernas', 'Impressão 3D faz cópias perfeitas para quem fica.', ['inovacao', 'custo']],
        ['Viagem curta', 'Ver a peça no lugar de origem pode atrair turistas para lá.', ['custo', 'pessoas']],
      ],
      [
        ['Lá também cuidam', 'Meu rival diz que só o museu grande cuida. Muitos países têm ótimos museus hoje.', ['logica', 'viabilidade']],
        ['De quem é?', 'Meu rival fala em patrimônio de todos. Mas quem fez a peça foi um povo só.', ['pessoas', 'tradicao']],
        ['Visita virtual', 'Fotos em 3D deixam qualquer pessoa ver a peça pela internet.', ['inovacao', 'custo']],
        ['Prova de origem', 'Documentos mostram de onde cada peça saiu.', ['prova', 'logica']],
        ['Empréstimo e troca', 'Os museus podem trocar exposições e continuar parceiros.', ['viabilidade', 'imagem']],
        ['Museu respeitado', 'Museu que devolve ganha respeito no mundo todo.', ['imagem', 'prova']],
      ],
      [
        ['O certo é devolver', 'Se foi tirado sem permissão, o certo é devolver.', ['logica', 'imagem']],
        ['Orgulho de volta', 'Imagine um povo vendo sua coroa antiga voltar para casa.', ['pessoas', 'tradicao']],
        ['Já acontece', 'Devoluções recentes mostram que dá para fazer.', ['prova', 'viabilidade']],
        ['Cópia que ensina', 'Com réplicas, nenhum museu fica vazio.', ['inovacao', 'custo']],
        ['Turismo na origem', 'A peça em casa leva visitantes e renda para quem precisa.', ['custo', 'pessoas']],
        ['Um mundo mais justo', 'Devolver é um passo para respeitar todas as culturas.', ['tradicao', 'inovacao']],
      ],
    ],
  },
  {
    tese: 'Peças em grandes museus são vistas e protegidas para o mundo todo.',
    tempos: [
      [
        ['Patrimônio de todos', 'A história humana pertence a toda a humanidade.', ['logica', 'pessoas']],
        ['Bem guardadas', 'Grandes museus têm cuidado, segurança e restauração.', ['viabilidade', 'prova']],
        ['Milhões de visitantes', 'Peças em museus famosos são vistas por muita gente.', ['pessoas', 'imagem']],
        ['Conservar é caro', 'Proteger peças antigas exige equipamento e dinheiro.', ['custo', 'viabilidade']],
        ['Séculos no mesmo lugar', 'Muitas peças estão no museu há séculos e viraram parte dele.', ['tradicao', 'logica']],
        ['Réplica não emociona', 'Meu rival vai falar em cópia, mas ver a peça real é outra coisa.', ['inovacao', 'imagem']],
      ],
      [
        ['Risco na viagem', 'Meu rival quer devolver. Transportar peça frágil pode danificá-la.', ['viabilidade', 'prova']],
        ['Para quem devolver?', 'Às vezes o povo antigo nem existe mais como país.', ['logica', 'tradicao']],
        ['Museu vazio', 'Se todos devolverem, os grandes museus ficam vazios.', ['imagem', 'custo']],
        ['Conservar custa', 'Meu rival diz que lá também cuidam. Nem todo lugar tem recursos.', ['custo', 'pessoas']],
        ['Virtual não basta', 'Meu rival fala em visita virtual. Tela não substitui a peça de verdade.', ['inovacao', 'pessoas']],
        ['Cuidado comprovado', 'Muitas peças só sobreviveram porque foram bem guardadas.', ['prova', 'tradicao']],
      ],
      [
        ['Proteger primeiro', 'O mais importante é a peça não se perder.', ['logica', 'viabilidade']],
        ['Aberto ao mundo', 'Em grandes museus, gente de todo lugar aprende com elas.', ['pessoas', 'imagem']],
        ['Parceria melhor', 'Emprestar por um tempo é melhor que devolver para sempre.', ['inovacao', 'viabilidade']],
        ['Conta da conservação', 'Manter peça antiga é caro, e quem já cuida faz bem.', ['custo', 'prova']],
        ['Uma longa história', 'Os museus guardam essas peças há gerações.', ['tradicao', 'logica']],
        ['Salvas do esquecimento', 'Imagine uma peça rara estragada por falta de cuidado.', ['imagem', 'custo']],
      ],
    ],
  },
);
