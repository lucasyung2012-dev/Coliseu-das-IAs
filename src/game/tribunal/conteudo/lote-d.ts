import { dilema } from './fazer';

// Dilemas escritos à mão (decisão D6), lote D.

export const AGUA = dilema(
  'agua',
  'A água deve ter tarifa progressiva?',
  {
    tese: 'Quem gasta mais água deve pagar mais caro por cada litro.',
    tempos: [
      [
        ['O básico fica barato', 'A água para beber, cozinhar e tomar banho sai barata para todo mundo.', ['pessoas', 'custo']],
        ['Desperdício pesa no bolso', 'Quem lava a calçada com mangueira todo dia vai pensar duas vezes.', ['logica', 'imagem']],
        ['Funciona em muitos lugares', 'Várias cidades já cobram assim e o consumo exagerado diminuiu.', ['prova', 'viabilidade']],
        ['Água não é infinita', 'Em época de seca, cada litro economizado ajuda a represa a durar mais.', ['inovacao', 'logica']],
        ['Justo com quem tem pouco', 'Família pequena que economiza não deve pagar a piscina do vizinho.', ['pessoas', 'tradicao']],
        ['Fácil de aplicar', 'O relógio de água já mede o consumo. É só mudar a conta.', ['viabilidade', 'custo']],
      ],
      [
        ['Família grande tem saída', 'Meu rival fala das famílias grandes. Dá para ajustar a faixa pelo número de moradores.', ['viabilidade', 'pessoas']],
        ['Economizar sempre foi virtude', 'Nossos avós fechavam a torneira ao escovar os dentes. A conta só reforça isso.', ['tradicao', 'logica']],
        ['O preço ensina', 'Meu rival diz que ninguém muda hábito. Mas quando a conta sobe, todo mundo presta atenção.', ['prova', 'custo']],
        ['Novas ideias em casa', 'Caixa para guardar água da chuva e torneira econômica viram bons negócios.', ['inovacao', 'custo']],
        ['Cidade que cuida', 'Uma cidade que cobra o desperdício passa a imagem de quem cuida do futuro.', ['imagem', 'pessoas']],
        ['Represa cheia por mais tempo', 'Menos desperdício significa menos risco de faltar água no verão.', ['logica', 'prova']],
      ],
      [
        ['Pagar pelo que usa', 'Quem usa mais, paga mais. É simples e justo.', ['logica', 'pessoas']],
        ['Barato para o essencial', 'Beber e tomar banho continuam baratos para todos.', ['custo', 'viabilidade']],
        ['Já deu certo', 'Onde foi testado, o desperdício caiu sem deixar ninguém sem água.', ['prova', 'tradicao']],
        ['Futuro com água', 'Imagine a torneira aberta e a água chegando mesmo no ano mais seco.', ['imagem', 'inovacao']],
        ['Hábito novo', 'A conta muda o hábito, e o hábito novo passa de pais para filhos.', ['tradicao', 'pessoas']],
        ['Sem obra nenhuma', 'Não precisa construir nada. É só mudar a regra da conta.', ['viabilidade', 'inovacao']],
      ],
    ],
  },
  {
    tese: 'Água é direito de todos; o preço do litro deve ser igual para todos.',
    tempos: [
      [
        ['Casa cheia paga mais', 'Uma família com muitos filhos gasta mais água sem desperdiçar nada.', ['pessoas', 'logica']],
        ['Conta mais difícil', 'Com várias faixas de preço, pouca gente entende a própria conta.', ['viabilidade', 'imagem']],
        ['Prédio com um só relógio', 'Em muitos prédios, um único relógio mede todos. Quem economiza paga pelo vizinho.', ['prova', 'custo']],
        ['Preço igual é tradição', 'Sempre foi assim: o litro custa o mesmo para todos.', ['tradicao', 'pessoas']],
        ['Vazamento não é culpa', 'O cano vaza escondido na parede e a conta dispara sem a família saber.', ['custo', 'logica']],
        ['Consertar a rede primeiro', 'Muita água se perde nos canos da cidade antes de chegar às casas.', ['inovacao', 'viabilidade']],
      ],
      [
        ['Ajuste dá trabalho', 'Meu rival diz que dá para ajustar por morador. Isso exige cadastro e muita fiscalização.', ['viabilidade', 'custo']],
        ['Quem é rico nem sente', 'Meu rival diz que o preço ensina. Para quem tem muito dinheiro, a conta alta não muda nada.', ['logica', 'pessoas']],
        ['Pequenos negócios sofrem', 'Lavanderia e restaurante usam muita água para trabalhar e pagariam caro.', ['custo', 'prova']],
        ['Campanha também funciona', 'Propaganda e escola ensinando a economizar mudam hábitos sem punir ninguém.', ['tradicao', 'imagem']],
        ['Tecnologia na rede', 'Sensores nos canos acham vazamentos e salvam mais água que a conta cara.', ['inovacao', 'prova']],
        ['Imagem de castigo', 'A conta vira um castigo, e a água deixa de parecer um direito.', ['imagem', 'logica']],
      ],
      [
        ['Água é direito', 'Ninguém deve ter medo de abrir a torneira por causa do preço.', ['pessoas', 'imagem']],
        ['Simples é melhor', 'Um preço só, uma conta fácil de entender.', ['viabilidade', 'logica']],
        ['O problema está no cano', 'Consertar vazamentos da cidade economiza mais do que mudar a conta.', ['inovacao', 'custo']],
        ['Família grande não é culpada', 'Casa cheia não é desperdício. Não é justo pagar mais por isso.', ['tradicao', 'pessoas']],
        ['Riscos comprovados', 'Onde há um relógio para o prédio inteiro, a regra pune quem economiza.', ['prova', 'custo']],
        ['Ensinar em vez de punir', 'Educar dá mais resultado no longo prazo que cobrar caro.', ['logica', 'prova']],
      ],
    ],
  },
);

export const DADOS_DESASTRES = dilema(
  'dados-desastres',
  'Devemos compartilhar dados de desastres?',
  {
    tese: 'Abrir os dados de chuva, enchente e incêndio ajuda todo mundo a se proteger.',
    tempos: [
      [
        ['Aviso mais rápido', 'Com os dados abertos, aplicativos avisam no celular que a enchente está chegando.', ['inovacao', 'pessoas']],
        ['Mais olhos no problema', 'Cientistas de vários lugares podem achar padrões que ninguém viu.', ['logica', 'prova']],
        ['Já salvou vidas', 'Em vários países, alertas feitos com dados abertos tiraram famílias de áreas de risco.', ['prova', 'pessoas']],
        ['Custa quase nada', 'Os dados já existem. Colocar na internet é barato.', ['custo', 'viabilidade']],
        ['Ajudar o vizinho', 'Avisar o vizinho do perigo é costume antigo. Os dados fazem isso em escala.', ['tradicao', 'logica']],
        ['Mapa de risco na escola', 'Imagine os alunos estudando o mapa de enchentes do próprio bairro.', ['imagem', 'viabilidade']],
      ],
      [
        ['Dá para esconder nomes', 'Meu rival fala de privacidade. Dá para mostrar a rua alagada sem mostrar quem mora lá.', ['viabilidade', 'pessoas']],
        ['Dado parado não ajuda', 'Meu rival quer guardar os dados. Guardados na gaveta, eles não avisam ninguém.', ['logica', 'imagem']],
        ['Defesa civil mais forte', 'Com mais gente analisando, a defesa civil recebe ajuda de graça.', ['custo', 'prova']],
        ['Erros aparecem logo', 'Quando muita gente olha, um dado errado é percebido e corrigido rápido.', ['prova', 'inovacao']],
        ['Confiança no governo', 'Governo que mostra os dados ganha a confiança dos moradores.', ['imagem', 'tradicao']],
        ['Cidades aprendem juntas', 'Uma cidade aprende com a enchente da outra e se prepara antes.', ['tradicao', 'inovacao']],
      ],
      [
        ['Informação salva vidas', 'Quanto mais cedo o aviso, mais famílias saem a tempo.', ['pessoas', 'prova']],
        ['Barato e já pronto', 'Os dados existem. Só falta abrir a porta.', ['custo', 'viabilidade']],
        ['Juntos pensamos melhor', 'Muitas cabeças acham soluções que uma só não acharia.', ['logica', 'inovacao']],
        ['Cuidado com o próximo', 'Avisar quem está em perigo sempre foi o certo a fazer.', ['tradicao', 'pessoas']],
        ['Proteção com regras', 'Esconder nomes e endereços resolve o risco à privacidade.', ['viabilidade', 'logica']],
        ['Uma cidade preparada', 'Imagine cada morador sabendo o caminho seguro antes da chuva.', ['imagem', 'custo']],
      ],
    ],
  },
  {
    tese: 'Dados de desastre são delicados e precisam de cuidado antes de serem abertos.',
    tempos: [
      [
        ['Casas expostas', 'O mapa mostra quais casas ficaram vazias depois da enchente. Isso atrai ladrões.', ['pessoas', 'prova']],
        ['Pânico sem motivo', 'Um dado mal explicado pode espalhar medo e boatos pelo bairro.', ['imagem', 'logica']],
        ['Dado cru engana', 'Número solto, sem explicação, leva a conclusões erradas.', ['logica', 'prova']],
        ['Preparar custa caro', 'Limpar, organizar e explicar os dados exige equipe e tempo.', ['custo', 'viabilidade']],
        ['Especialista decide', 'Sempre coube à defesa civil avisar a população, com responsabilidade.', ['tradicao', 'viabilidade']],
        ['Aplicativo falso', 'Qualquer um pode criar um aplicativo de alerta errado usando os dados.', ['inovacao', 'custo']],
      ],
      [
        ['Esconder nomes não basta', 'Meu rival diz que dá para esconder nomes. Mas pela rua e pela casa dá para descobrir quem é.', ['pessoas', 'logica']],
        ['Erro custa vidas', 'Meu rival diz que muitos olhos corrigem erros. Até corrigirem, alguém já seguiu o alerta errado.', ['prova', 'pessoas']],
        ['Casa desvalorizada', 'Rua marcada como área de risco faz o preço das casas despencar.', ['custo', 'imagem']],
        ['Um canal oficial', 'Um aviso único e oficial evita confusão entre vários aplicativos.', ['viabilidade', 'tradicao']],
        ['Abrir aos poucos', 'Dá para testar com pesquisadores antes de abrir para todos.', ['inovacao', 'viabilidade']],
        ['Confiança se perde', 'Um único alarme falso faz as pessoas ignorarem o próximo aviso.', ['imagem', 'tradicao']],
      ],
      [
        ['Proteger as famílias', 'Quem já perdeu tudo na enchente não pode ainda ter a casa exposta.', ['pessoas', 'imagem']],
        ['Aviso certo, não rápido', 'Melhor um aviso confiável do que dez avisos confusos.', ['logica', 'prova']],
        ['Com calma e regra', 'Primeiro as regras de proteção, depois a abertura.', ['viabilidade', 'tradicao']],
        ['O custo escondido', 'Casa desvalorizada e boato espalhado também custam caro.', ['custo', 'prova']],
        ['Novidade com cuidado', 'Toda tecnologia nova precisa de cuidado antes de ser usada.', ['inovacao', 'logica']],
        ['A voz da defesa civil', 'Na hora do perigo, as pessoas precisam de uma voz confiável.', ['tradicao', 'imagem']],
      ],
    ],
  },
);

export const ONIBUS_NOTURNO = dilema(
  'onibus-noturno',
  'Transporte noturno deve ser subsidiado?',
  {
    tese: 'A cidade deve ajudar a pagar ônibus de madrugada, porque muita gente trabalha à noite.',
    tempos: [
      [
        ['A cidade não dorme', 'Enfermeiros, vigias e padeiros trabalham de madrugada e precisam voltar para casa.', ['pessoas', 'logica']],
        ['Sem ônibus, sem emprego', 'Quem não tem como voltar à noite perde vagas de trabalho.', ['prova', 'custo']],
        ['Mais seguro que a pé', 'Ônibus na madrugada evita gente andando sozinha em rua escura.', ['pessoas', 'viabilidade']],
        ['Menos carro na rua', 'Com ônibus de madrugada, menos gente dirige cansada ou depois da festa.', ['logica', 'imagem']],
        ['Linhas que já existem', 'Dá para usar as mesmas linhas e pontos do dia, com menos ônibus.', ['viabilidade', 'tradicao']],
        ['Aplicativo mostra a hora', 'Com aplicativo, o passageiro sabe exatamente quando o ônibus passa.', ['inovacao', 'tradicao']],
      ],
      [
        ['Vazio, mas essencial', 'Meu rival diz que o ônibus anda vazio. Para quem está dentro, ele é essencial.', ['pessoas', 'logica']],
        ['Barato perto do benefício', 'Meu rival fala em custo. Um acidente ou um emprego perdido custam mais.', ['custo', 'prova']],
        ['Ônibus menor', 'De madrugada dá para usar micro-ônibus, que gastam menos.', ['viabilidade', 'inovacao']],
        ['Comércio noturno cresce', 'Lanchonete e farmácia abertas à noite vendem mais quando há transporte.', ['custo', 'imagem']],
        ['Serviço público de verdade', 'Hospital e polícia funcionam à noite. O transporte também deveria.', ['tradicao', 'prova']],
        ['Rua com movimento', 'Rua com ônibus passando parece mais viva e mais segura.', ['imagem', 'inovacao']],
      ],
      [
        ['Ninguém fica para trás', 'Quem trabalha à noite também merece voltar para casa em segurança.', ['pessoas', 'imagem']],
        ['Dinheiro bem gasto', 'Ajudar o ônibus noturno evita gastos maiores com acidentes.', ['custo', 'logica']],
        ['Fácil de começar', 'Poucas linhas principais, ônibus menores, e pronto.', ['viabilidade', 'inovacao']],
        ['Cidades grandes fazem', 'Muitas cidades grandes já têm linhas de madrugada que funcionam.', ['prova', 'tradicao']],
        ['Igualdade de verdade', 'O ônibus do dia é ajudado pelo governo. O da noite também deve ser.', ['logica', 'tradicao']],
        ['A cidade acordada', 'Imagine a cidade funcionando à noite, segura e conectada.', ['imagem', 'prova']],
      ],
    ],
  },
  {
    tese: 'Ônibus quase vazio de madrugada gasta dinheiro que faria falta durante o dia.',
    tempos: [
      [
        ['Ônibus quase vazio', 'De madrugada, muitas viagens levam poucos passageiros.', ['prova', 'logica']],
        ['Dinheiro de outro lugar', 'O dinheiro do subsídio sai de escola, saúde ou do ônibus do dia.', ['custo', 'pessoas']],
        ['Lotação de dia', 'De manhã os ônibus andam lotados. Melhorar isso ajuda mais gente.', ['pessoas', 'viabilidade']],
        ['Motorista na madrugada', 'Achar motoristas para trabalhar de madrugada é difícil e caro.', ['viabilidade', 'custo']],
        ['A noite é para descansar', 'A cidade sempre se organizou para funcionar de dia.', ['tradicao', 'imagem']],
        ['Existem outras opções', 'Carona solidária e aplicativos de transporte já atendem parte da noite.', ['inovacao', 'logica']],
      ],
      [
        ['Essencial para poucos', 'Meu rival diz que é essencial. Mas atender poucos não pode tirar de muitos.', ['logica', 'pessoas']],
        ['Ônibus menor ainda custa', 'Meu rival fala em micro-ônibus. Ainda precisa de motorista, combustível e manutenção.', ['custo', 'viabilidade']],
        ['Empresa pode ajudar', 'Hospital e fábrica podem oferecer transporte para quem trabalha à noite.', ['viabilidade', 'tradicao']],
        ['Ponto escuro', 'Esperar ônibus em ponto vazio de madrugada também tem riscos.', ['prova', 'imagem']],
        ['Testar antes', 'Antes de gastar, vale testar uma linha e ver se alguém usa.', ['prova', 'inovacao']],
        ['Promessa bonita', 'Ônibus noturno parece ótimo no discurso, mas pode virar ônibus fantasma.', ['imagem', 'inovacao']],
      ],
      [
        ['Primeiro o dia', 'O ônibus lotado da manhã atinge muito mais pessoas.', ['pessoas', 'logica']],
        ['A conta pesa', 'Cada viagem vazia é dinheiro que some do orçamento.', ['custo', 'prova']],
        ['Quem emprega ajuda', 'Quem contrata à noite pode ajudar no transporte da equipe.', ['viabilidade', 'tradicao']],
        ['Soluções novas', 'Carona e transporte sob demanda podem custar menos que ônibus vazio.', ['inovacao', 'custo']],
        ['Medir antes de gastar', 'Sem saber quantos usariam, gastar é apostar no escuro.', ['logica', 'prova']],
        ['Ônibus fantasma', 'Imagine ônibus enormes rodando vazios a noite inteira.', ['imagem', 'tradicao']],
      ],
    ],
  },
);

export const BIBLIOTECA_DOMINGO = dilema(
  'biblioteca-domingo',
  'Bibliotecas devem abrir aos domingos?',
  {
    tese: 'Domingo é o dia em que a família está livre para ler junto.',
    tempos: [
      [
        ['Dia de família livre', 'Durante a semana todo mundo trabalha ou estuda. Domingo é o dia livre.', ['pessoas', 'logica']],
        ['Lugar calmo para estudar', 'Nem todo aluno tem um canto quieto em casa para estudar no fim de semana.', ['pessoas', 'viabilidade']],
        ['Passeio que não custa', 'Ir à biblioteca é um passeio de graça para quem não pode gastar.', ['custo', 'imagem']],
        ['Já existem exemplos', 'Algumas bibliotecas abrem no domingo e ficam cheias de famílias.', ['prova', 'tradicao']],
        ['Contação de histórias', 'Domingo com contação de histórias atrai crianças que nunca leram por diversão.', ['inovacao', 'prova']],
        ['Ler é tradição', 'Ler histórias no domingo é um costume antigo em muitas famílias.', ['tradicao', 'logica']],
      ],
      [
        ['Escala resolve', 'Meu rival diz que os funcionários perdem o domingo. Com escala, cada um folga em outro dia.', ['viabilidade', 'pessoas']],
        ['Fechar outro dia', 'Meu rival fala em custo. Dá para fechar na segunda, que tem menos movimento.', ['custo', 'logica']],
        ['Melhor que tela', 'Uma tarde na biblioteca afasta as crianças do celular por algumas horas.', ['pessoas', 'imagem']],
        ['Voluntários ajudam', 'Pais e estudantes podem ajudar em oficinas e na contação de histórias.', ['viabilidade', 'inovacao']],
        ['Prédio parado é desperdício', 'O prédio já existe. Deixar fechado no melhor dia é desperdiçar.', ['logica', 'custo']],
        ['Praça do bairro', 'A biblioteca vira ponto de encontro, como a praça de antigamente.', ['tradicao', 'prova']],
      ],
      [
        ['Leitura para todos', 'Abrir no domingo é abrir para quem não consegue ir durante a semana.', ['pessoas', 'logica']],
        ['Sem gastar mais', 'Troca o dia de folga e mantém o mesmo custo.', ['custo', 'viabilidade']],
        ['Funciona onde testaram', 'Onde abriu no domingo, as famílias foram.', ['prova', 'imagem']],
        ['Biblioteca viva', 'Oficinas e histórias mostram que a biblioteca pode ser divertida.', ['inovacao', 'imagem']],
        ['Costume que volta', 'Ler juntos no fim de semana é um costume que vale resgatar.', ['tradicao', 'pessoas']],
        ['Uma cidade leitora', 'Imagine crianças disputando o último livro da estante no domingo.', ['inovacao', 'tradicao']],
      ],
    ],
  },
  {
    tese: 'Bibliotecas devem melhorar a semana antes de abrir no domingo.',
    tempos: [
      [
        ['Funcionário também descansa', 'Bibliotecários também têm família e merecem o domingo livre.', ['pessoas', 'tradicao']],
        ['Mais um dia custa', 'Abrir mais um dia é mais luz, mais limpeza e mais salário.', ['custo', 'logica']],
        ['Pouca gente na semana', 'Se nem na semana a biblioteca enche, o domingo pode ficar vazio.', ['prova', 'logica']],
        ['Equipe pequena', 'Muitas bibliotecas já têm poucos funcionários para os dias normais.', ['viabilidade', 'pessoas']],
        ['Livro digital', 'Hoje dá para pegar livro emprestado pelo celular, sem sair de casa.', ['inovacao', 'viabilidade']],
        ['Domingo é de descanso', 'Na maioria das famílias, o domingo sempre foi dia de ficar junto em casa.', ['tradicao', 'imagem']],
      ],
      [
        ['Escala cansa', 'Meu rival fala em escala. Equipe pequena com escala fica sempre desfalcada.', ['viabilidade', 'pessoas']],
        ['Segunda também tem leitor', 'Meu rival quer fechar na segunda. E quem só pode ir na segunda?', ['logica', 'pessoas']],
        ['Voluntário não substitui', 'Voluntário ajuda, mas não cuida do acervo nem do empréstimo.', ['viabilidade', 'prova']],
        ['Melhor horário à noite', 'Abrir até mais tarde na semana atende quem trabalha, gastando menos.', ['custo', 'inovacao']],
        ['Prédio aberto, gastos abertos', 'Prédio aberto gasta energia, segurança e manutenção.', ['custo', 'imagem']],
        ['Livros que já faltam', 'Antes de abrir mais, falta comprar livros novos.', ['tradicao', 'inovacao']],
      ],
      [
        ['Respeitar quem trabalha', 'Quem cuida dos livros também merece o domingo.', ['pessoas', 'tradicao']],
        ['Dinheiro em livros', 'O dinheiro do domingo pode virar livros novos na estante.', ['custo', 'inovacao']],
        ['Primeiro a semana', 'Uma semana bem aberta vale mais que um domingo vazio.', ['logica', 'viabilidade']],
        ['Biblioteca no celular', 'O livro digital já chega no domingo sem abrir a porta.', ['inovacao', 'prova']],
        ['Medir antes', 'Sem saber se as pessoas iriam, abrir é um tiro no escuro.', ['prova', 'logica']],
        ['Estante cheia', 'Imagine uma biblioteca com livros novos e equipe descansada.', ['imagem', 'custo']],
      ],
    ],
  },
);

export const JURI_CIDADAO = dilema(
  'juri-cidadao',
  'Uma cidade deve criar júris cidadãos?',
  {
    tese: 'Moradores sorteados que estudam o assunto ajudam a cidade a decidir melhor.',
    tempos: [
      [
        ['Gente comum decide', 'Moradores sorteados trazem a visão de quem vive o problema todo dia.', ['pessoas', 'logica']],
        ['Estudam antes de opinar', 'O júri ouve especialistas e os dois lados antes de dar a opinião.', ['logica', 'prova']],
        ['Já testado no mundo', 'Várias cidades já usaram júris de moradores para decidir sobre parques e trânsito.', ['prova', 'inovacao']],
        ['Sorteio é justo', 'No sorteio, qualquer um pode ser chamado, rico ou pobre.', ['tradicao', 'pessoas']],
        ['Custa pouco', 'Algumas reuniões numa sala da prefeitura não custam quase nada.', ['custo', 'viabilidade']],
        ['Confiança na decisão', 'Uma decisão tomada com moradores parece mais justa para todos.', ['imagem', 'viabilidade']],
      ],
      [
        ['Ninguém nasce sabendo', 'Meu rival diz que morador não entende do assunto. Por isso o júri estuda antes.', ['logica', 'prova']],
        ['Sorteio evita panelinha', 'Meu rival teme pressão. Sorteados não devem favor a ninguém.', ['pessoas', 'imagem']],
        ['O tribunal já faz isso', 'Nos tribunais, cidadãos sorteados já ajudam a julgar casos sérios.', ['tradicao', 'prova']],
        ['Ajuda de custo simples', 'Uma pequena ajuda de custo garante que todos possam participar.', ['custo', 'pessoas']],
        ['Começar pequeno', 'Dá para começar com um tema só, como a reforma de uma praça.', ['viabilidade', 'inovacao']],
        ['Democracia renovada', 'É um jeito novo de ouvir a cidade além da eleição.', ['inovacao', 'custo']],
      ],
      [
        ['A voz de quem mora', 'Quem vive na cidade sabe o que ela precisa.', ['pessoas', 'imagem']],
        ['Decisão bem estudada', 'Estudar os dois lados leva a escolhas melhores.', ['logica', 'prova']],
        ['Ideia antiga e testada', 'O sorteio de cidadãos é usado nos tribunais há muito tempo.', ['tradicao', 'prova']],
        ['Barato e possível', 'Poucas reuniões, um tema por vez. Dá para fazer já.', ['custo', 'viabilidade']],
        ['Confiança de volta', 'Quando o vizinho ajuda a decidir, a cidade confia mais.', ['imagem', 'inovacao']],
        ['Experimento que ensina', 'Mesmo que erre, a cidade aprende a ouvir melhor.', ['inovacao', 'logica']],
      ],
    ],
  },
  {
    tese: 'Decidir pela cidade é papel de quem foi eleito e responde por isso.',
    tempos: [
      [
        ['Já votamos para isso', 'Elegemos vereadores e prefeito justamente para tomar essas decisões.', ['tradicao', 'logica']],
        ['Assunto difícil', 'Orçamento e obras são complicados. Poucas reuniões não bastam para entender.', ['logica', 'viabilidade']],
        ['Quem responde pelo erro', 'Se o júri errar, ninguém presta contas na próxima eleição.', ['pessoas', 'imagem']],
        ['Nem todos podem ir', 'Quem trabalha muito ou cuida dos filhos pode não ter tempo de participar.', ['pessoas', 'custo']],
        ['Resultados variam', 'Em alguns lugares, as sugestões dos júris foram ignoradas depois.', ['prova', 'inovacao']],
        ['Mais uma etapa', 'Mais uma reunião deixa as decisões da cidade ainda mais lentas.', ['viabilidade', 'custo']],
      ],
      [
        ['Estudar não é saber', 'Meu rival diz que o júri estuda antes. Algumas semanas não substituem anos de experiência.', ['logica', 'prova']],
        ['Especialista convence', 'Meu rival diz que sorteado não deve favor. Mas quem escolhe os especialistas influencia o júri.', ['pessoas', 'imagem']],
        ['Tribunal é outra coisa', 'No tribunal se julga um caso. Cidade inteira é muito mais complicado.', ['tradicao', 'logica']],
        ['Ajuda de custo soma', 'Pagar participantes, salas e especialistas vira um gasto a mais.', ['custo', 'viabilidade']],
        ['Consulta já existe', 'Audiência pública e consulta pela internet já ouvem os moradores.', ['viabilidade', 'inovacao']],
        ['Enfeite de decisão', 'O júri pode virar enfeite para uma decisão já tomada.', ['imagem', 'prova']],
      ],
      [
        ['Respeitar o voto', 'Quem decide deve ser quem foi eleito e pode ser cobrado.', ['tradicao', 'pessoas']],
        ['Assunto exige preparo', 'Decisões difíceis pedem gente preparada, não sorteada.', ['logica', 'prova']],
        ['Usar o que já existe', 'Melhorar as consultas públicas é mais simples que criar algo novo.', ['viabilidade', 'inovacao']],
        ['Mais gasto, mais demora', 'Cada júri custa tempo e dinheiro que a cidade não tem.', ['custo', 'viabilidade']],
        ['Risco de manipulação', 'Quem monta o júri pode guiar o resultado.', ['imagem', 'logica']],
        ['Promessa que frustra', 'Se a prefeitura ignorar o júri, os moradores ficam mais desconfiados.', ['pessoas', 'custo']],
      ],
    ],
  },
);
