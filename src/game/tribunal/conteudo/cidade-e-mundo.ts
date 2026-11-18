import { dilema } from './fazer';

// Dilemas escritos à mão (decisão D6), 18/11/2026. Toda carta tem 2 temas diferentes.

export const ESPACO = dilema(
  'espaco',
  'Devemos investir mais na exploração espacial?',
  {
    tese: 'O espaço traz descobertas que melhoram a vida aqui na Terra.',
    tempos: [
      [
        ['Satélites salvam vidas', 'Satélites avisam sobre furacões e enchentes dias antes de eles chegarem.', ['prova', 'pessoas']],
        ['Inventado para o espaço', 'GPS, câmera de celular e filtro de água vieram de pesquisas espaciais.', ['inovacao', 'prova']],
        ['O sonho que inspira', 'Imagine uma criança vendo o primeiro astronauta brasileiro pisar na Lua.', ['imagem', 'pessoas']],
        ['Empregos de futuro', 'Cada foguete dá trabalho para engenheiros, técnicos e fábricas.', ['custo', 'viabilidade']],
        ['Explorar está no sangue', 'A humanidade sempre explorou: mares, montanhas, polos. O espaço é o próximo.', ['tradicao', 'imagem']],
        ['O plano B', 'Aprender a viver fora da Terra prepara a gente para problemas que ainda vão vir.', ['logica', 'inovacao']],
      ],
      [
        ['Fatia pequena', 'Meu rival diz que é caro. Mas o dinheiro do espaço é uma fatia pequena perto do da saúde.', ['custo', 'logica']],
        ['De olho na floresta', 'Medir a Terra lá de cima é o jeito mais preciso de acompanhar o desmatamento.', ['prova', 'viabilidade']],
        ['Dividir a conta', 'Dá para dividir os custos com outros países e com empresas.', ['viabilidade', 'custo']],
        ['O espaço une povos', 'Na estação espacial, países rivais trabalham juntos.', ['pessoas', 'imagem']],
        ['Quem pesquisa sai na frente', 'Quem pesquisa agora sai na frente nas tecnologias de amanhã.', ['inovacao', 'logica']],
        ['Toda grande nação explorou', 'Os países que mais cresceram sempre investiram em descobrir.', ['tradicao', 'prova']],
      ],
      [
        ['Investimento que volta', 'Cada real no espaço volta em tecnologia para a Terra.', ['custo', 'prova']],
        ['Proteger quem está aqui', 'Mais satélites, mais avisos de desastre, mais vidas salvas.', ['pessoas', 'viabilidade']],
        ['O próximo passo', 'Somos exploradores desde sempre. Parar agora seria estranho.', ['tradicao', 'inovacao']],
        ['Ciência puxa ciência', 'Uma descoberta puxa a outra: quem pesquisa aprende cada vez mais rápido.', ['logica', 'prova']],
        ['Em etapas', 'Satélites primeiro, foguetes maiores depois. Dá para fazer passo a passo.', ['viabilidade', 'logica']],
        ['Bandeira entre as estrelas', 'Imagine a nossa bandeira entre as estrelas.', ['imagem', 'inovacao']],
      ],
    ],
  },
  {
    tese: 'Primeiro os problemas da Terra; o espaço pode esperar.',
    tempos: [
      [
        ['Problemas aqui embaixo', 'Ainda faltam escola, hospital e saneamento. O dinheiro rende mais aqui.', ['pessoas', 'custo']],
        ['Foguete caríssimo', 'Um único lançamento custa o mesmo que centenas de escolas.', ['custo', 'prova']],
        ['Ninguém mora em Marte', 'Viver em outro planeta ainda é ficção. É promessa longe demais.', ['logica', 'viabilidade']],
        ['Lixo no céu', 'Milhares de pedaços de satélites velhos já giram pela Terra causando riscos.', ['prova', 'inovacao']],
        ['Arrume a sua casa', 'Nossos avós ensinavam: primeiro arrume a sua casa.', ['tradicao', 'pessoas']],
        ['Passeio de bilionário', 'Bilionários passeando de foguete enquanto o bairro alaga.', ['imagem', 'custo']],
      ],
      [
        ['Pouco para quem?', 'Meu rival diz que é pouco dinheiro. Pouco para o governo é muito para uma escola.', ['custo', 'logica']],
        ['Satélite já existe', 'Para avisar enchente, os satélites que já existem bastam.', ['viabilidade', 'prova']],
        ['Inventar aqui mesmo', 'Pesquisa em saúde e energia limpa traz invenções sem sair do chão.', ['inovacao', 'viabilidade']],
        ['Vidas em risco', 'Astronautas arriscam a vida em missões que poderiam esperar.', ['pessoas', 'logica']],
        ['Pé no chão', 'Os grandes povos cresceram cuidando da própria terra.', ['tradicao', 'imagem']],
        ['Retorno demora', 'Missões levam décadas para dar retorno. Os problemas de hoje não esperam.', ['logica', 'prova']],
      ],
      [
        ['Primeiro as pessoas', 'Cada criança na escola vale mais que uma foto de Marte.', ['pessoas', 'imagem']],
        ['A conta não fecha', 'Com o mesmo dinheiro resolveríamos problemas que existem hoje.', ['custo', 'logica']],
        ['Um passo de cada vez', 'Resolver a Terra primeiro, o espaço depois. Sempre foi assim.', ['viabilidade', 'tradicao']],
        ['Promessa no céu', 'Muitas promessas espaciais nunca saíram do papel.', ['prova', 'inovacao']],
        ['A casa em ordem', 'Quem cuida da própria casa cuida do mundo.', ['tradicao', 'pessoas']],
        ['Rios limpos', 'Imagine investir tudo isso em florestas e rios limpos.', ['imagem', 'viabilidade']],
      ],
    ],
  },
);

export const QUATRO_DIAS = dilema(
  'quatro-dias',
  'Empresas devem adotar a semana de quatro dias?',
  {
    tese: 'Quatro dias bem trabalhados rendem mais que cinco cansados.',
    tempos: [
      [
        ['Descansado rende mais', 'Gente descansada erra menos e trabalha melhor.', ['logica', 'pessoas']],
        ['Os testes deram certo', 'Empresas que testaram mantiveram a produção e tiveram menos faltas.', ['prova', 'viabilidade']],
        ['Mais tempo com a família', 'Um dia a mais para ficar com filhos, pais e amigos.', ['pessoas', 'tradicao']],
        ['Escritório desligado', 'Um dia a menos de luz, ar-condicionado e café ligados no escritório.', ['custo', 'viabilidade']],
        ['O trabalho mudou', 'O computador faz em minutos o que antes levava horas.', ['inovacao', 'logica']],
        ['Sexta no parque', 'Imagine a cidade com menos trânsito e os parques cheios na sexta.', ['imagem', 'pessoas']],
      ],
      [
        ['Não é preguiça', 'Meu rival diz que é trabalhar menos. É trabalhar melhor, com menos reunião inútil.', ['logica', 'viabilidade']],
        ['Funcionário que fica', 'Empresa com 4 dias perde menos funcionários, e contratar de novo é caro.', ['custo', 'prova']],
        ['Menos estresse', 'Menos estresse significa menos gente doente e afastada.', ['pessoas', 'prova']],
        ['Revezamento', 'Loja e hospital revezam a equipe: ninguém fica sem atendimento.', ['viabilidade', 'custo']],
        ['Já mudamos antes', 'Já se trabalhou 6 dias por semana. Reduzir para 5 deu certo; 4 é o próximo passo.', ['tradicao', 'inovacao']],
        ['Uma cidade mais leve', 'Menos carros na rua um dia por semana: menos poluição.', ['imagem', 'inovacao']],
      ],
      [
        ['Produtividade comprovada', 'Os testes mostram o mesmo trabalho feito em menos dias.', ['prova', 'logica']],
        ['Família em primeiro lugar', 'Tempo com quem a gente ama não tem preço.', ['pessoas', 'imagem']],
        ['Seis meses de teste', 'Testa por seis meses e mede. Se não der certo, volta.', ['viabilidade', 'logica']],
        ['Barato para a empresa', 'Menos faltas, menos gente saindo, menos conta de luz.', ['custo', 'viabilidade']],
        ['O trabalho sempre muda', 'O trabalho sempre se adaptou ao seu tempo.', ['tradicao', 'inovacao']],
        ['Tempo para viver', 'Imagine trabalhar bem e ainda ter tempo para viver.', ['imagem', 'inovacao']],
      ],
    ],
  },
  {
    tese: 'Nem todo trabalho cabe em quatro dias, e o cliente não espera.',
    tempos: [
      [
        ['O cliente não espera', 'Padaria, hospital e loja precisam funcionar todo dia.', ['viabilidade', 'pessoas']],
        ['Dias mais longos', 'Muitas vezes o mesmo trabalho é espremido em 4 dias de 10 horas.', ['logica', 'pessoas']],
        ['A lojinha não aguenta', 'Uma lojinha teria que contratar mais gente para cobrir o dia livre.', ['custo', 'viabilidade']],
        ['Testes em escritório', 'Os testes foram em escritórios. Fábrica e comércio são outra história.', ['prova', 'logica']],
        ['A semana que funciona', 'A semana de 5 dias organiza a vida de todo mundo há décadas.', ['tradicao', 'prova']],
        ['Coisa de empresa grande', 'Parece coisa de empresa de tecnologia, longe da realidade da maioria.', ['inovacao', 'imagem']],
      ],
      [
        ['Revezar custa', 'Meu rival fala em revezar a equipe. Revezar é mais gente e mais salário.', ['custo', 'logica']],
        ['Pressão escondida', 'Com menos dias, cresce a cobrança para fazer tudo correndo.', ['pessoas', 'prova']],
        ['A escola não muda', 'Os filhos continuam com aula na sexta. Que descanso com a família é esse?', ['pessoas', 'tradicao']],
        ['O campo não para', 'Agricultura e indústria não param porque é sexta.', ['viabilidade', 'tradicao']],
        ['Efeito novidade', 'No começo todo mundo se anima. Depois de um ano, o rendimento pode cair.', ['inovacao', 'prova']],
        ['O padeiro sozinho', 'O dono da padaria trabalhando sozinho na sexta porque não pode pagar outro funcionário.', ['imagem', 'custo']],
      ],
      [
        ['Cada setor é diferente', 'Pode servir para alguns escritórios, nunca como regra para todos.', ['logica', 'viabilidade']],
        ['Quem paga a conta', 'Para as pequenas empresas, a conta não fecha.', ['custo', 'pessoas']],
        ['Prova antes de mudar', 'Antes de mudar o país, faltam testes em fábrica, loja e campo.', ['prova', 'tradicao']],
        ['Uma conquista antiga', 'A semana de 5 dias já é uma conquista. Mudar de novo é arriscado.', ['tradicao', 'inovacao']],
        ['Dia longo cansa', 'Um dia longo demais cansa tanto quanto uma semana longa.', ['pessoas', 'logica']],
        ['A farmácia fechada', 'Imagine precisar de um remédio na sexta e a farmácia fechada.', ['imagem', 'viabilidade']],
      ],
    ],
  },
);

export const ANIMAIS = dilema(
  'animais',
  'As cidades devem criar corredores para animais?',
  {
    tese: 'Pontes e caminhos verdes deixam os animais passarem sem morrer na estrada.',
    tempos: [
      [
        ['Menos atropelamentos', 'Onde existe passagem para a fauna, os atropelamentos de animais caem muito.', ['prova', 'viabilidade']],
        ['Motorista protegido', 'Animal na pista causa acidente. A passagem protege os motoristas também.', ['pessoas', 'logica']],
        ['A ponte dos macacos', 'Imagine macacos atravessando a avenida por uma ponte de cordas lá no alto.', ['imagem', 'inovacao']],
        ['Solução simples', 'Um túnel embaixo da estrada ou uma ponte de cordas já resolve muito.', ['viabilidade', 'custo']],
        ['Viver junto com os bichos', 'Nossos antepassados viviam junto com os bichos. Dá para respeitar isso na cidade.', ['tradicao', 'pessoas']],
        ['Cidade inteligente', 'Cidades modernas planejam espaço para as pessoas e para a natureza.', ['inovacao', 'logica']],
      ],
      [
        ['Acidente é mais caro', 'Meu rival fala em custo. Um acidente com animal custa muito mais em hospital e conserto.', ['custo', 'logica']],
        ['Os bichos usam', 'Nos países que construíram passagens, os animais começaram a usar logo nas primeiras semanas.', ['prova', 'inovacao']],
        ['Abelhas e pássaros', 'Corredores verdes trazem polinizadores, que ajudam hortas e jardins.', ['viabilidade', 'imagem']],
        ['Aula ao ar livre', 'As escolas podem visitar e aprender sobre os animais da própria cidade.', ['pessoas', 'tradicao']],
        ['Aproveitar o que já existe', 'Margem de rio e canteiro central viram corredor sem obra grande.', ['viabilidade', 'custo']],
        ['Planejar é mais barato', 'Quem planeja agora gasta menos do que quem conserta depois. Sempre foi assim.', ['logica', 'tradicao']],
      ],
      [
        ['Vidas salvas dos dois lados', 'Menos animais mortos e menos motoristas feridos.', ['pessoas', 'prova']],
        ['Pouco dinheiro, muito resultado', 'Um gasto pequeno para um resultado enorme.', ['custo', 'viabilidade']],
        ['Uma cidade viva', 'Imagine acordar com passarinhos cantando no meio da cidade.', ['imagem', 'tradicao']],
        ['Ideia que pega', 'Uma cidade começa, as outras copiam. É inovação que se espalha.', ['inovacao', 'prova']],
        ['Já passam por ali', 'Os animais já atravessam ali; só falta deixar o caminho seguro.', ['logica', 'viabilidade']],
        ['Respeito antigo', 'Cuidar dos bichos é cuidar do lugar onde vivemos, como sempre se ensinou.', ['tradicao', 'logica']],
      ],
    ],
  },
  {
    tese: 'Antes de ponte para bicho, a cidade precisa resolver os problemas das pessoas.',
    tempos: [
      [
        ['Gente em primeiro lugar', 'Falta calçada, ônibus e posto de saúde. Isso vem primeiro.', ['pessoas', 'logica']],
        ['Obra cara e demorada', 'Ponte e túnel para animais custam caro e levam anos.', ['custo', 'viabilidade']],
        ['Bicho perto de casa', 'Animal selvagem perto de casa pode trazer doenças e acidentes.', ['prova', 'pessoas']],
        ['Cada um no seu lugar', 'Animal silvestre vive na mata. A cidade sempre foi das pessoas.', ['tradicao', 'logica']],
        ['Ninguém garante', 'Em alguns lugares, os animais simplesmente ignoram a passagem.', ['prova', 'viabilidade']],
        ['Bonito no cartão-postal', 'Fica lindo na foto, mas não resolve o dia a dia.', ['imagem', 'inovacao']],
      ],
      [
        ['Manutenção para sempre', 'Meu rival diz que é barato, mas a manutenção de ponte e túnel não acaba nunca.', ['custo', 'prova']],
        ['Trânsito parado', 'Anos de obra na estrada atrapalham a vida de milhares de pessoas.', ['pessoas', 'viabilidade']],
        ['Proteja a mata', 'Em vez de corredor na cidade, proteja as florestas onde eles já vivem.', ['logica', 'tradicao']],
        ['Ideia importada', 'O que funciona em outro país pode não servir para as nossas cidades.', ['inovacao', 'prova']],
        ['Placa e radar', 'Placa de aviso e redutor de velocidade custam pouco e já ajudam.', ['viabilidade', 'custo']],
        ['A foto que engana', 'Uma ponte linda para macacos e o bairro sem esgoto.', ['imagem', 'pessoas']],
      ],
      [
        ['Quem mais precisa', 'Com os mesmos recursos, dá para cuidar de quem mais precisa.', ['pessoas', 'custo']],
        ['O simples primeiro', 'Placas e redutores agora; obra grande, talvez depois.', ['viabilidade', 'logica']],
        ['A mata é o corredor', 'Mata preservada é o melhor corredor que existe, como sempre foi.', ['tradicao', 'imagem']],
        ['Estudo antes da obra', 'Primeiro estudos aqui, para saber se os animais usariam mesmo.', ['prova', 'logica']],
        ['Sem pressa', 'Nem toda ideia moderna precisa ser feita já.', ['inovacao', 'tradicao']],
        ['A conta que sobra', 'Obra cara hoje vira manutenção cara para sempre.', ['custo', 'prova']],
      ],
    ],
  },
);
