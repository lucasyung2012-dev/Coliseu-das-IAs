import { dilema } from './fazer';

// Dilemas escritos à mão (decisão D6), lote B.

export const DESPERDICIO = dilema(
  'desperdicio',
  'Restaurantes devem publicar o desperdício?',
  {
    tese: 'Mostrar quanta comida vai para o lixo faz todo mundo desperdiçar menos.',
    tempos: [
      [
        ['O que se mede, melhora', 'Quando o número fica à vista, o restaurante passa a cuidar dele todo dia.', ['logica', 'prova']],
        ['Comida que podia alimentar', 'Muita gente passa fome enquanto pratos inteiros vão para o lixo.', ['pessoas', 'imagem']],
        ['Lixo custa dinheiro', 'Comida jogada fora é dinheiro jogado fora, para o dono e para o cliente.', ['custo', 'logica']],
        ['Uma lousa na entrada', 'Basta uma lousa ou um aviso no cardápio. Não precisa de nada complicado.', ['viabilidade', 'inovacao']],
        ['Prato limpo', 'Nossas avós diziam para não deixar comida no prato.', ['tradicao', 'pessoas']],
        ['Selo de bom exemplo', 'Restaurante que desperdiça pouco ganha fama de cuidadoso.', ['imagem', 'inovacao']],
      ],
      [
        ['Não é para envergonhar', 'Meu rival diz que é para envergonhar. É para ajudar o restaurante a enxergar onde erra.', ['logica', 'imagem']],
        ['Balança barata', 'Meu rival fala em custo. Uma balança na cozinha custa pouco e mostra muito.', ['custo', 'viabilidade']],
        ['Cozinhas que testaram', 'Cozinhas que passaram a pesar o lixo começaram a comprar e cozinhar melhor.', ['prova', 'custo']],
        ['Cliente escolhe melhor', 'Sabendo do desperdício, o cliente pode preferir quem cuida da comida.', ['pessoas', 'logica']],
        ['Aplicativo ajuda', 'Aplicativos já vendem as sobras do dia mais baratas no fim da noite.', ['inovacao', 'viabilidade']],
        ['A feira sempre aproveitou', 'Na feira, a fruta madura vira doce. Aproveitar sempre fez parte da nossa cultura.', ['tradicao', 'prova']],
      ],
      [
        ['Transparência que ensina', 'Quem vê o tamanho do desperdício aprende a evitá-lo.', ['logica', 'pessoas']],
        ['Economia para todos', 'Menos lixo, menos compra desnecessária, preço melhor no prato.', ['custo', 'pessoas']],
        ['Fácil de começar', 'Pesa, anota e mostra. Qualquer restaurante consegue.', ['viabilidade', 'prova']],
        ['O lixo diminui', 'Onde o desperdício passa a ser medido, ele costuma cair.', ['prova', 'inovacao']],
        ['Respeito à comida', 'Respeitar a comida é um valor antigo que vale a pena manter.', ['tradicao', 'imagem']],
        ['Sobras que viram ajuda', 'Imagine as sobras boas indo para quem precisa, e não para o lixo.', ['imagem', 'inovacao']],
      ],
    ],
  },
  {
    tese: 'Obrigar a publicar o lixo pune o restaurante e não resolve o problema.',
    tempos: [
      [
        ['Conta difícil', 'Medir tudo que sobra dá trabalho, e o restaurante pequeno não tem tempo.', ['viabilidade', 'custo']],
        ['Número que engana', 'Restaurante cheio sempre tem mais sobra. O número sozinho não conta a história.', ['logica', 'prova']],
        ['Fama injusta', 'Um dia ruim pode manchar o nome de um lugar querido no bairro.', ['imagem', 'pessoas']],
        ['O prato do cliente', 'Boa parte da sobra é do cliente que pediu demais, não da cozinha.', ['pessoas', 'logica']],
        ['Cozinha de família', 'A cozinha de família sempre aproveitou sobras sem precisar de placa na porta.', ['tradicao', 'viabilidade']],
        ['Ideia sem prova', 'Ainda não se sabe se publicar o número faz o desperdício cair de verdade.', ['prova', 'inovacao']],
      ],
      [
        ['Lousa não basta', 'Meu rival diz que basta uma lousa. Mas alguém precisa pesar e anotar todo santo dia.', ['viabilidade', 'logica']],
        ['Fama tem dois lados', 'Meu rival fala em fama boa. Mas a mesma placa pode afastar clientes para sempre.', ['imagem', 'custo']],
        ['Aplicativo já resolve', 'Os aplicativos de sobras funcionam sem obrigar ninguém a nada.', ['inovacao', 'viabilidade']],
        ['O cozinheiro culpado', 'A pressão cai em cima do cozinheiro, que passa a servir pratos menores.', ['pessoas', 'prova']],
        ['Cliente com fome', 'Prato menor para evitar sobra deixa o cliente com fome e chateado.', ['pessoas', 'custo']],
        ['Ensinar funciona mais', 'Sempre se aprendeu a não desperdiçar em casa, com conversa e exemplo.', ['tradicao', 'logica']],
      ],
      [
        ['Ajudar, não obrigar', 'Ensinar e premiar funciona melhor que expor.', ['logica', 'imagem']],
        ['O pequeno sofre', 'Quem mais perde é o restaurante pequeno, sem tempo nem dinheiro.', ['custo', 'pessoas']],
        ['Primeiro testar', 'Antes de virar regra, falta mostrar que funciona.', ['prova', 'viabilidade']],
        ['Do jeito de sempre', 'Aproveitar sobra é costume antigo, e não precisa de placa para isso.', ['tradicao', 'inovacao']],
        ['Número sem contexto', 'Um número na porta sem explicação mais confunde do que ajuda.', ['logica', 'prova']],
        ['O restaurante do bairro', 'Imagine o restaurante da esquina fechando por causa de uma placa.', ['imagem', 'viabilidade']],
      ],
    ],
  },
);

export const AVALIAR_PROFESSORES = dilema(
  'avaliar-professores',
  'Alunos devem avaliar professores?',
  {
    tese: 'Quem passa o ano na sala de aula tem muito a dizer sobre ela.',
    tempos: [
      [
        ['Quem está na sala', 'O aluno vê a aula todos os dias. Ninguém conhece melhor como ela funciona.', ['logica', 'pessoas']],
        ['Professor que melhora', 'Saber o que funciona ajuda o professor a ensinar melhor.', ['pessoas', 'inovacao']],
        ['Formulário simples', 'Um questionário curto no fim do bimestre resolve. Não custa quase nada.', ['viabilidade', 'custo']],
        ['Já acontece por aí', 'Muitas faculdades já pedem a opinião dos alunos sobre as aulas.', ['prova', 'tradicao']],
        ['Voz para o aluno', 'Aluno ouvido se sente parte da escola e participa mais.', ['pessoas', 'imagem']],
        ['Escola moderna', 'Escola que escuta todo mundo mostra que está aberta a mudar.', ['inovacao', 'imagem']],
      ],
      [
        ['Não é vingança', 'Meu rival diz que o aluno vai se vingar da nota baixa. Com muitas respostas, a vingança some na média.', ['logica', 'prova']],
        ['Perguntas certas', 'Meu rival teme notas injustas. Perguntas boas, como "a explicação foi clara?", evitam isso.', ['viabilidade', 'logica']],
        ['Sem nome, sem medo', 'Com resposta anônima, o aluno fala a verdade sem medo.', ['pessoas', 'inovacao']],
        ['Barato e rápido', 'Dá para fazer no celular ou no papel, em poucos minutos.', ['custo', 'viabilidade']],
        ['Ouvir sempre foi bom', 'Bons professores sempre perguntaram à turma se todos entenderam.', ['tradicao', 'pessoas']],
        ['Confiança na escola', 'Pais confiam mais numa escola que ouve os filhos.', ['imagem', 'prova']],
      ],
      [
        ['Quem aprende sabe', 'Quem aprende sabe dizer se está aprendendo.', ['logica', 'pessoas']],
        ['Aula melhor para todos', 'Professor que ouve a turma ensina melhor, e todos ganham.', ['pessoas', 'prova']],
        ['Fácil de testar', 'Começa com uma turma, ajusta as perguntas e cresce aos poucos.', ['viabilidade', 'inovacao']],
        ['Custa quase nada', 'Um questionário é uma das mudanças mais baratas que uma escola pode fazer.', ['custo', 'viabilidade']],
        ['A roda de conversa', 'A velha roda de conversa, agora com espaço para todos falarem.', ['tradicao', 'inovacao']],
        ['Escola que escuta', 'Imagine uma escola onde cada aluno sabe que a sua voz conta.', ['imagem', 'logica']],
      ],
    ],
  },
  {
    tese: 'Avaliar professor exige experiência que o aluno ainda não tem.',
    tempos: [
      [
        ['Matéria difícil', 'O professor mais exigente pode ganhar nota baixa só porque cobra mais.', ['logica', 'pessoas']],
        ['Popular não é bom', 'O professor mais divertido nem sempre é o que mais ensina.', ['logica', 'imagem']],
        ['Professor com medo', 'Com medo da nota, o professor pode facilitar a prova para agradar.', ['pessoas', 'prova']],
        ['Quem avalia é quem sabe', 'Sempre foram coordenadores e diretores que avaliaram os professores.', ['tradicao', 'viabilidade']],
        ['Trabalho extra', 'Alguém precisa ler, organizar e cuidar de todas as respostas.', ['custo', 'viabilidade']],
        ['Moda passageira', 'Parece novidade boa, mas pode virar só mais um formulário esquecido.', ['inovacao', 'custo']],
      ],
      [
        ['Média não salva', 'Meu rival diz que a média corrige tudo. Mas uma turma inteira pode se juntar contra um professor.', ['logica', 'pessoas']],
        ['Anônimo machuca', 'Meu rival fala em anonimato. Sem nome, também aparecem comentários cruéis.', ['pessoas', 'inovacao']],
        ['Faculdade é outra coisa', 'Funcionar com adultos na faculdade não prova que funciona com crianças.', ['prova', 'logica']],
        ['Conversa já existe', 'Reunião de pais e conselho de classe já ouvem os alunos.', ['tradicao', 'viabilidade']],
        ['Papel que ninguém lê', 'Muitas escolas fazem pesquisa e não mudam nada depois. Esforço desperdiçado.', ['custo', 'prova']],
        ['Professor exposto', 'Imagine um professor dedicado vendo a sua nota baixa circular entre os pais.', ['imagem', 'pessoas']],
      ],
      [
        ['Respeito na sala', 'Ensinar exige autoridade. Nota do aluno pode enfraquecer isso.', ['tradicao', 'pessoas']],
        ['Cobrar não é defeito', 'O bom professor às vezes desagrada. Isso não pode virar castigo.', ['logica', 'imagem']],
        ['Quem estudou avalia', 'Avaliar ensino é trabalho de quem estudou para isso.', ['prova', 'viabilidade']],
        ['Ouvir de outro jeito', 'Dá para ouvir o aluno com conversa, sem dar nota ao professor.', ['viabilidade', 'inovacao']],
        ['Tempo melhor usado', 'O tempo do questionário pode virar mais aula.', ['custo', 'logica']],
        ['Prova fácil para todos', 'Imagine provas cada vez mais fáceis só para agradar a turma.', ['imagem', 'prova']],
      ],
    ],
  },
);

export const HORTAS = dilema(
  'hortas',
  'Bairros devem ter hortas comunitárias?',
  {
    tese: 'Uma horta no bairro dá comida fresca e junta os vizinhos.',
    tempos: [
      [
        ['Comida fresca perto', 'Alface e tomate colhidos na esquina, sem caminhão e sem agrotóxico.', ['custo', 'pessoas']],
        ['Terreno abandonado', 'Terreno vazio junta lixo. Com horta, vira lugar cuidado.', ['viabilidade', 'logica']],
        ['Já dá certo', 'Muitas cidades já têm hortas em praças e escolas funcionando bem.', ['prova', 'viabilidade']],
        ['Saber das avós', 'Plantar é um saber antigo que passa dos mais velhos para as crianças.', ['tradicao', 'pessoas']],
        ['Bairro verde', 'Imagine a praça cinza virando um jardim de comer.', ['imagem', 'inovacao']],
        ['Sala de aula viva', 'Criança que planta aprende de onde vem a comida e come melhor.', ['logica', 'inovacao']],
      ],
      [
        ['Pouco dinheiro', 'Meu rival fala em custo. Semente, terra e regador custam pouco.', ['custo', 'viabilidade']],
        ['Cuidado dividido', 'Meu rival diz que ninguém vai cuidar. Com escala de turnos, cada um rega um dia.', ['viabilidade', 'pessoas']],
        ['Menos lixo', 'Casca e resto de comida viram adubo em vez de ir para o lixão.', ['inovacao', 'custo']],
        ['Praça mais segura', 'Lugar movimentado e cuidado afasta o abandono e a sujeira.', ['logica', 'prova']],
        ['Como no interior', 'No interior, sempre se dividiu a colheita com o vizinho.', ['tradicao', 'imagem']],
        ['Os idosos voltam', 'Aposentados ganham atividade, companhia e motivo para sair de casa.', ['pessoas', 'prova']],
      ],
      [
        ['Bairro que se cuida', 'Uma horta transforma vizinhos em equipe.', ['pessoas', 'imagem']],
        ['Comida mais barata', 'Verdura colhida no bairro alivia o bolso de muitas famílias.', ['custo', 'logica']],
        ['Começa pequeno', 'Uns canteiros primeiro. Se der certo, a horta cresce.', ['viabilidade', 'inovacao']],
        ['Exemplos não faltam', 'Hortas em escolas e praças já mostram que funciona.', ['prova', 'viabilidade']],
        ['Raiz antiga', 'Plantar junto é uma das coisas mais antigas que a gente faz.', ['tradicao', 'logica']],
        ['Cidade que dá fruto', 'Imagine cada bairro com a sua horta e a sua colheita.', ['imagem', 'inovacao']],
      ],
    ],
  },
  {
    tese: 'Horta precisa de cuidado sem parar, e o bairro tem outras prioridades.',
    tempos: [
      [
        ['Quem vai cuidar?', 'No começo todo mundo ajuda. Depois de uns meses, sobra para poucos.', ['pessoas', 'prova']],
        ['Terra contaminada', 'Terreno da cidade pode ter terra suja de óleo e entulho.', ['prova', 'viabilidade']],
        ['Água e ferramenta', 'Regar todo dia gasta água, e ferramenta some ou quebra.', ['custo', 'viabilidade']],
        ['Horta abandonada', 'Horta largada vira mato, bicho e mosquito.', ['imagem', 'logica']],
        ['A praça é de todos', 'Praça sempre foi lugar de brincar e passear, não de plantar.', ['tradicao', 'pessoas']],
        ['Solução complicada', 'Verdura barata já tem na feira. A horta é um jeito complicado de conseguir pouco.', ['logica', 'inovacao']],
      ],
      [
        ['Escala que não dura', 'Meu rival fala em escala de turnos. Na prática, a escala some quando chegam as férias.', ['viabilidade', 'pessoas']],
        ['Barato só no começo', 'Meu rival diz que semente é barata. O caro é cercar, ter água e manter por anos.', ['custo', 'logica']],
        ['Briga de vizinho', 'Quem colhe mais? Quem trabalhou menos? Horta também gera briga.', ['pessoas', 'imagem']],
        ['Adubo que cheira', 'Adubo de resto de comida, mal cuidado, cheira mal e atrai ratos.', ['inovacao', 'prova']],
        ['Escola faz melhor', 'Horta na escola tem professor responsável. No bairro, a responsabilidade é de ninguém.', ['logica', 'tradicao']],
        ['A feira resolve', 'A feira de bairro sempre levou verdura fresca para perto das casas.', ['tradicao', 'prova']],
      ],
      [
        ['Cuidado que acaba', 'Horta sem dono vira mato. Já se viu muitas assim.', ['prova', 'imagem']],
        ['Outras prioridades', 'O bairro precisa antes de calçada, luz e lixeira.', ['pessoas', 'logica']],
        ['Conta que cresce', 'Água, cerca e conserto: a conta não para de chegar.', ['custo', 'viabilidade']],
        ['A praça livre', 'Deixe a praça livre para brincar, como sempre foi.', ['tradicao', 'imagem']],
        ['Bonita, mas difícil', 'Toda ideia nova parece fácil até alguém ter que regar no domingo.', ['inovacao', 'viabilidade']],
        ['A feira de sempre', 'A feira de sempre já traz verdura fresca sem trabalho extra.', ['tradicao', 'custo']],
      ],
    ],
  },
);

export const PREVENCAO = dilema(
  'prevencao',
  'Hospitais devem priorizar prevenção?',
  {
    tese: 'Evitar a doença é melhor e mais barato do que tratar depois.',
    tempos: [
      [
        ['Melhor que remédio', 'É melhor não ficar doente do que precisar de tratamento.', ['logica', 'pessoas']],
        ['Vacina funciona', 'Vacinas acabaram com doenças que antes enchiam os hospitais.', ['prova', 'tradicao']],
        ['Barato hoje, caro amanhã', 'Uma consulta de rotina custa muito menos que uma internação.', ['custo', 'logica']],
        ['Fila menor', 'Com menos gente doente, a fila da emergência anda mais rápido.', ['viabilidade', 'pessoas']],
        ['Lembrete no celular', 'O celular pode lembrar de vacina, exame e consulta.', ['inovacao', 'viabilidade']],
        ['Família saudável', 'Imagine avós ativos e crianças brincando, longe do hospital.', ['imagem', 'pessoas']],
      ],
      [
        ['Emergência continua', 'Meu rival diz que a emergência fica sem dinheiro. Ela continua, só com menos gente esperando.', ['logica', 'viabilidade']],
        ['Alívio que começa já', 'Meu rival diz que o resultado demora. Mas cada doença evitada hoje já é um alívio hoje.', ['prova', 'logica']],
        ['Agente de saúde', 'O agente que visita as casas descobre problemas antes de piorarem.', ['pessoas', 'prova']],
        ['Conta que diminui', 'Tratar doença avançada é caro. Prevenir reduz essa conta.', ['custo', 'viabilidade']],
        ['Ditado antigo', 'Os avós já diziam: melhor prevenir do que remediar.', ['tradicao', 'imagem']],
        ['Exame mais simples', 'Os exames rápidos de hoje descobrem doenças cedo e em poucos minutos.', ['inovacao', 'custo']],
      ],
      [
        ['Saúde de verdade', 'Hospital bom é aquele que a gente precisa usar pouco.', ['logica', 'imagem']],
        ['Cuidar antes do problema', 'Cuidar antes salva quem nem sabia que estava em risco.', ['pessoas', 'prova']],
        ['Economia que cuida', 'Cada doença evitada libera dinheiro para quem precisa de tratamento.', ['custo', 'pessoas']],
        ['Passo a passo', 'Mais agentes, mais vacina, mais exame. Dá para crescer aos poucos.', ['viabilidade', 'inovacao']],
        ['Sabedoria velha', 'Prevenir é o conselho mais antigo da medicina.', ['tradicao', 'logica']],
        ['Um país mais forte', 'Imagine um país onde ficar doente é exceção.', ['imagem', 'inovacao']],
      ],
    ],
  },
  {
    tese: 'Hospital existe para cuidar de quem já está doente, e essa pessoa não pode esperar.',
    tempos: [
      [
        ['Quem está doente agora', 'O paciente na maca precisa de atendimento hoje, não de campanha.', ['pessoas', 'logica']],
        ['Dinheiro curto', 'Se o dinheiro vai para prevenção, falta para cirurgia e UTI.', ['custo', 'viabilidade']],
        ['Hospital tem uma função', 'Hospital sempre foi lugar de tratar. Prevenção é trabalho do posto de saúde.', ['tradicao', 'logica']],
        ['Difícil de medir', 'Como saber quantas doenças foram evitadas? Prevenção é difícil de provar.', ['prova', 'viabilidade']],
        ['A fila na porta', 'Imagine a emergência lotada enquanto o hospital faz palestra.', ['imagem', 'pessoas']],
        ['Tecnologia salva', 'Máquinas e cirurgias novas salvam vidas que antes se perdiam.', ['inovacao', 'prova']],
      ],
      [
        ['Não dá para esperar', 'Meu rival diz que prevenir é mais barato. Mas quem chega infartando não pode esperar a conta fechar.', ['pessoas', 'custo']],
        ['Lembrete não basta', 'Meu rival fala em celular. Muita gente nem tem celular bom ou internet.', ['inovacao', 'viabilidade']],
        ['O posto já faz', 'Vacina e consulta de rotina já são trabalho do posto. Cada um no seu papel.', ['tradicao', 'viabilidade']],
        ['Hábito é escolha', 'O hospital não decide se a pessoa come bem ou faz exercício.', ['logica', 'pessoas']],
        ['Resultado longe', 'Prevenção mostra resultado em anos. A emergência está cheia agora.', ['prova', 'logica']],
        ['Plantão desfalcado', 'Médico em campanha é médico a menos no plantão.', ['custo', 'imagem']],
      ],
      [
        ['Urgência é urgência', 'Quem sofre agora vem primeiro. Sempre.', ['pessoas', 'logica']],
        ['O dinheiro não estica', 'Tirar da UTI para a prevenção é cobrir um lado e descobrir o outro.', ['custo', 'viabilidade']],
        ['Cada um no seu lugar', 'Posto previne, hospital trata. Assim funciona há muito tempo.', ['tradicao', 'viabilidade']],
        ['Tratamento comprovado', 'Uma cirurgia mostra o resultado na hora. Isso é certeza.', ['prova', 'inovacao']],
        ['Medicina de ponta', 'Hospital forte investe no que há de mais novo para tratar.', ['inovacao', 'imagem']],
        ['A porta aberta', 'Imagine chegar doente e encontrar a porta do hospital sempre aberta.', ['imagem', 'pessoas']],
      ],
    ],
  },
);

export const PARQUES = dilema(
  'parques',
  'Parques devem limitar visitantes?',
  {
    tese: 'Com menos gente de cada vez, a natureza respira e a visita fica melhor.',
    tempos: [
      [
        ['A natureza respira', 'Gente demais pisa as plantas, espanta os bichos e deixa lixo.', ['logica', 'imagem']],
        ['Trilha que some', 'Trilhas lotadas viram buracos e erosão em poucos anos.', ['prova', 'viabilidade']],
        ['Visita mais gostosa', 'Sem empurra-empurra, dá para ver os bichos e ouvir os pássaros.', ['pessoas', 'imagem']],
        ['Reserva pelo celular', 'Agendar a visita pelo celular é fácil e organiza tudo.', ['inovacao', 'viabilidade']],
        ['Menos limpeza', 'Menos gente, menos lixo para recolher e menos estrago para consertar.', ['custo', 'logica']],
        ['Parque para os netos', 'Cuidar hoje é deixar o parque inteiro para as próximas gerações.', ['tradicao', 'prova']],
      ],
      [
        ['Todo mundo entra', 'Meu rival diz que limita o acesso. Todos entram, só que em horários diferentes.', ['logica', 'pessoas']],
        ['Agendar é grátis', 'Meu rival fala em custo. Reservar um horário não precisa custar nada.', ['custo', 'viabilidade']],
        ['Parques famosos fazem', 'Parques famosos no mundo inteiro já limitam visitantes e continuam cheios de turistas.', ['prova', 'imagem']],
        ['Guarda que dá conta', 'Com menos gente, o guarda consegue cuidar de todos.', ['viabilidade', 'pessoas']],
        ['A terra descansa', 'Muitos povos tradicionais sempre deram tempo para a terra descansar.', ['tradicao', 'logica']],
        ['Contador na entrada', 'Uma catraca conta quem entra e avisa quando está cheio.', ['inovacao', 'custo']],
      ],
      [
        ['Cuidar para durar', 'Parque cuidado hoje é parque aberto amanhã.', ['logica', 'tradicao']],
        ['Visita melhor', 'Menos fila, menos barulho, mais natureza.', ['pessoas', 'imagem']],
        ['Fácil de organizar', 'Horário marcado pelo celular, e pronto.', ['viabilidade', 'inovacao']],
        ['Já funciona lá fora', 'Os parques que limitaram continuam bonitos e visitados.', ['prova', 'imagem']],
        ['Conta menor', 'Menos estrago, menos conserto, menos gasto.', ['custo', 'logica']],
        ['Herança verde', 'Imagine os seus netos vendo a mesma cachoeira que você viu.', ['tradicao', 'pessoas']],
      ],
    ],
  },
  {
    tese: 'Parque é de todos, e ninguém deveria ficar do lado de fora.',
    tempos: [
      [
        ['Parque é de todos', 'O parque é público. Barrar alguém na porta parece injusto.', ['pessoas', 'logica']],
        ['Domingo de família', 'Ir ao parque no fim de semana é tradição de muitas famílias.', ['tradicao', 'pessoas']],
        ['Fila para entrar', 'Limite cria fila, e a família que veio de longe pode voltar sem entrar.', ['viabilidade', 'imagem']],
        ['Quem não tem celular', 'Agendar pela internet deixa de fora quem não tem celular ou computador.', ['inovacao', 'pessoas']],
        ['Lazer de graça', 'Para muita gente, o parque é o único passeio que não custa nada.', ['custo', 'imagem']],
        ['Educar resolve', 'O problema é o lixo, não a quantidade de gente. Educação e lixeira resolvem.', ['logica', 'prova']],
      ],
      [
        ['Horário não serve', 'Meu rival diz que todos entram em outro horário. Mas quem trabalha só tem o domingo.', ['pessoas', 'logica']],
        ['Outro tipo de parque', 'Meu rival cita parques famosos. Mas a praça verde do bairro não é atração turística.', ['prova', 'tradicao']],
        ['Catraca custa', 'Catraca, sistema e funcionário para controlar custam caro.', ['custo', 'inovacao']],
        ['Mais guardas', 'Em vez de barrar gente, contrate mais guardas e mais lixeiras.', ['viabilidade', 'custo']],
        ['Ingresso à vista', 'Hoje a reserva é grátis. Amanhã pode virar ingresso pago.', ['logica', 'imagem']],
        ['Abrir mais parques', 'Se o parque está lotado, a cidade precisa de mais parques.', ['viabilidade', 'inovacao']],
      ],
      [
        ['Ninguém fica de fora', 'Parque público deve ter a porta aberta para todos.', ['pessoas', 'imagem']],
        ['Cuidar sem barrar', 'Lixeira, guarda e educação protegem sem deixar ninguém do lado de fora.', ['viabilidade', 'logica']],
        ['Domingo garantido', 'O passeio de domingo sempre foi de graça e sem hora marcada.', ['tradicao', 'custo']],
        ['Mais verde, não menos gente', 'A solução é abrir parques novos, não fechar os antigos.', ['inovacao', 'logica']],
        ['Barreira escondida', 'Toda vez que surge uma regra de entrada, quem tem menos é quem mais fica de fora.', ['custo', 'prova']],
        ['O portão fechado', 'Imagine uma criança chegando ao parque e encontrando o portão fechado.', ['imagem', 'pessoas']],
      ],
    ],
  },
);
