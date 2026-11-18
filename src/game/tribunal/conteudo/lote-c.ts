import { dilema } from './fazer';

// Dilemas escritos à mão (decisão D6), lote C.

export const VOTO = dilema(
  'voto',
  'Voto municipal deve ser facultativo?',
  {
    tese: 'Votar deve ser uma escolha: quem vota por vontade vota com mais cuidado.',
    tempos: [
      [
        ['Escolha de verdade', 'Quem vai votar porque quer costuma pesquisar mais sobre os candidatos.', ['logica', 'pessoas']],
        ['Já funciona lá fora', 'Muitos países têm voto livre e as eleições funcionam bem.', ['prova', 'tradicao']],
        ['Sem multa no caminho', 'Ninguém precisaria pagar multa nem correr atrás de justificativa.', ['custo', 'pessoas']],
        ['Fila menor', 'Com menos gente obrigada, as filas e a organização ficam mais simples.', ['viabilidade', 'custo']],
        ['Liberdade combina', 'Imagine um país onde votar é um gesto livre, como ser voluntário.', ['imagem', 'inovacao']],
        ['Convencer dá trabalho', 'Candidatos teriam que animar o eleitor a sair de casa, com ideias novas.', ['inovacao', 'viabilidade']],
      ],
      [
        ['Menos gente, mais atenção', 'Meu rival diz que menos gente vai votar. Mas quem vai, vai mais preparado.', ['logica', 'prova']],
        ['Obrigar não ensina', 'Meu rival diz que a obrigação educa. Ninguém aprende a gostar de algo à força.', ['pessoas', 'logica']],
        ['Voto em branco forçado', 'Quem vota só por obrigação muitas vezes anula ou escolhe qualquer um.', ['prova', 'imagem']],
        ['Dinheiro bem usado', 'O que se gasta cobrando multa pode ir para informar o eleitor.', ['custo', 'viabilidade']],
        ['Tradição de liberdade', 'Participar da comunidade sempre foi mais forte quando nasce da vontade.', ['tradicao', 'pessoas']],
        ['Votar pelo celular', 'Com voto livre, a cidade pode testar jeitos novos de facilitar a votação.', ['inovacao', 'viabilidade']],
      ],
      [
        ['Voto com vontade', 'Um voto dado com vontade vale mais que um voto dado com pressa.', ['logica', 'imagem']],
        ['Respeito ao eleitor', 'Tratar o eleitor como adulto que decide sozinho é sinal de respeito.', ['pessoas', 'tradicao']],
        ['Exemplo que existe', 'Vários países já mostram que o voto livre pode dar certo.', ['prova', 'viabilidade']],
        ['Sem custo extra', 'Menos multa, menos papelada, menos gasto para todo mundo.', ['custo', 'viabilidade']],
        ['Campanha melhor', 'Quem precisa conquistar o eleitor faz campanha mais criativa.', ['inovacao', 'logica']],
        ['A fila da vontade', 'Imagine uma fila de votação cheia de gente que escolheu estar ali.', ['imagem', 'inovacao']],
      ],
    ],
  },
  {
    tese: 'Votar é um dever de todos: a cidade é de todo mundo, e todos devem escolher.',
    tempos: [
      [
        ['Todos decidem', 'Com voto obrigatório, a escolha representa a cidade inteira, não só um grupo.', ['pessoas', 'logica']],
        ['Quem falta perde', 'Quem não vota deixa outros decidirem o bairro, a escola e o ônibus dele.', ['pessoas', 'viabilidade']],
        ['Hábito que se aprende', 'Votar desde jovem cria o costume de acompanhar a cidade.', ['tradicao', 'prova']],
        ['Eleição organizada', 'O sistema atual já está montado e funciona há muitos anos.', ['viabilidade', 'tradicao']],
        ['Mudar custa', 'Trocar as regras exige campanhas, ajustes e explicações para todos.', ['custo', 'inovacao']],
        ['Praça cheia de eleitores', 'Imagine o dia da eleição com gente de todos os bairros votando junto.', ['imagem', 'custo']],
      ],
      [
        ['Preparado não é garantido', 'Meu rival diz que quem vota livre vota melhor. Nada garante que pesquisou mais.', ['logica', 'prova']],
        ['Lá fora é diferente', 'Meu rival cita outros países. Cada lugar tem sua história e seus costumes.', ['tradicao', 'prova']],
        ['Quem tem menos tempo', 'Sem obrigação, quem trabalha muito e mora longe pode acabar ficando de fora.', ['pessoas', 'viabilidade']],
        ['Campanha de convencer', 'Voto livre pode virar disputa de quem leva mais gente à urna, não de ideias.', ['imagem', 'logica']],
        ['Novo nem sempre melhora', 'Mudar a regra é uma aposta, e o sistema atual já é conhecido.', ['inovacao', 'custo']],
        ['Multa pequena', 'A multa é baixa e a justificativa é simples. O incômodo é pequeno.', ['custo', 'inovacao']],
      ],
      [
        ['A cidade é de todos', 'Se a cidade é de todos, a escolha também deve ser de todos.', ['pessoas', 'imagem']],
        ['Dever que une', 'Votar junto lembra que somos uma comunidade, como sempre foi.', ['tradicao', 'pessoas']],
        ['Sistema que funciona', 'O jeito atual já funciona. Não há por que arriscar.', ['viabilidade', 'prova']],
        ['Representa melhor', 'Mais gente votando significa um resultado mais parecido com a cidade.', ['logica', 'prova']],
        ['Sem gasto com mudança', 'Manter o sistema evita gastar com novas regras e campanhas.', ['custo', 'viabilidade']],
        ['Todos na urna', 'Imagine cada vizinho ajudando a escolher o futuro da rua.', ['imagem', 'inovacao']],
      ],
    ],
  },
);

export const LOJAS_ANTIGAS = dilema(
  'lojas-antigas',
  'Devemos preservar lojas antigas?',
  {
    tese: 'Lojas antigas guardam a história do bairro e merecem ser protegidas.',
    tempos: [
      [
        ['História na vitrine', 'A loja do avô ainda tem o balcão de madeira e as fotos antigas.', ['tradicao', 'imagem']],
        ['O dono conhece você', 'Na loja antiga, o dono sabe seu nome e o que você gosta.', ['pessoas', 'tradicao']],
        ['Bairro com alma', 'Imagine uma rua só com prédios iguais. Lojas antigas deixam o bairro único.', ['imagem', 'logica']],
        ['Turista adora', 'Cidades que preservam o comércio antigo atraem mais visitantes.', ['prova', 'custo']],
        ['Ajuda simples', 'Desconto no imposto ou placa de patrimônio já ajudam a loja a ficar.', ['viabilidade', 'custo']],
        ['Antigo com ideia nova', 'A loja antiga pode vender pela internet sem perder o charme.', ['inovacao', 'viabilidade']],
      ],
      [
        ['Não é parar no tempo', 'Meu rival diz que é parar no tempo. Preservar é guardar o melhor e seguir em frente.', ['logica', 'inovacao']],
        ['Shopping também fecha', 'Meu rival fala do novo. Loja nova também fecha, e a antiga resistiu anos.', ['prova', 'logica']],
        ['Emprego do bairro', 'Loja antiga emprega gente do próprio bairro, que vai a pé trabalhar.', ['pessoas', 'viabilidade']],
        ['Dinheiro que fica', 'O que se gasta na loja do bairro fica circulando no bairro.', ['custo', 'pessoas']],
        ['Saber que se perde', 'O sapateiro e o alfaiate sabem consertar coisas que ninguém mais conserta.', ['tradicao', 'prova']],
        ['Foto que todo mundo tira', 'Fachadas antigas viram cartão-postal e enchem a rede social da cidade.', ['imagem', 'inovacao']],
      ],
      [
        ['Memória viva', 'Quando uma loja antiga fecha, um pedaço da história do bairro vai junto.', ['tradicao', 'pessoas']],
        ['Pouco custo, muito valor', 'Ajudar uma loja a ficar custa pouco perto do que ela representa.', ['custo', 'viabilidade']],
        ['Cidades que provam', 'Bairros que preservaram seu comércio ficaram mais vivos e visitados.', ['prova', 'imagem']],
        ['Rua que acolhe', 'Rua com comércio de bairro é rua com gente, luz e segurança.', ['pessoas', 'logica']],
        ['Novo e antigo juntos', 'Dá para ter loja nova e loja antiga na mesma rua.', ['inovacao', 'viabilidade']],
        ['A vitrine do avô', 'Imagine seu neto entrando na mesma loja onde você comprava doce.', ['imagem', 'logica']],
      ],
    ],
  },
  {
    tese: 'O comércio muda com o tempo; proteger só o antigo pode travar o bairro.',
    tempos: [
      [
        ['O cliente escolhe', 'Se as pessoas deixaram de comprar ali, é porque preferem outra coisa.', ['logica', 'pessoas']],
        ['Espaço para o novo', 'Uma loja protegida pode ocupar o lugar de um negócio novo e animado.', ['inovacao', 'viabilidade']],
        ['Quem paga a conta', 'Desconto de imposto para uma loja sai do bolso de todos.', ['custo', 'pessoas']],
        ['Prédio velho, risco', 'Prédio muito antigo pode ter fiação ruim e precisar de reforma cara.', ['prova', 'custo']],
        ['Comércio sempre mudou', 'O armazém virou mercado, que virou supermercado. Mudar faz parte.', ['tradicao', 'logica']],
        ['Museu a céu aberto', 'Um bairro só de lojas antigas pode parecer museu, bonito mas parado.', ['imagem', 'tradicao']],
      ],
      [
        ['Charme não paga aluguel', 'Meu rival fala em história. Mas história não paga o aluguel da loja.', ['custo', 'logica']],
        ['Escolher qual?', 'Meu rival quer preservar. Quem decide qual loja merece e qual não?', ['viabilidade', 'logica']],
        ['Turista não basta', 'Meu rival cita turistas. Muitos bairros não recebem quase nenhum.', ['prova', 'viabilidade']],
        ['Novos donos também', 'A loja nova também é de alguém do bairro que sonha crescer.', ['pessoas', 'inovacao']],
        ['Lembrar sem travar', 'Dá para guardar a história em fotos, placas e livros sem travar o imóvel.', ['tradicao', 'inovacao']],
        ['Fachada sem cliente', 'Uma fachada linda com a porta vazia não ajuda ninguém.', ['imagem', 'pessoas']],
      ],
      [
        ['O bairro precisa mudar', 'Um bairro vivo é um bairro que muda junto com as pessoas.', ['logica', 'inovacao']],
        ['Justo com todos', 'Ajuda só para os antigos é injusta com quem está começando agora.', ['pessoas', 'custo']],
        ['Regra difícil', 'Escolher quais lojas proteger gera briga e papelada sem fim.', ['viabilidade', 'prova']],
        ['Mudança é tradição', 'O comércio sempre se renovou. Essa é a verdadeira tradição.', ['tradicao', 'logica']],
        ['Dinheiro para o futuro', 'O dinheiro da proteção pode ajudar novos negócios a nascer.', ['custo', 'viabilidade']],
        ['Rua cheia de novidade', 'Imagine uma rua com lojas novas abrindo todo mês.', ['imagem', 'prova']],
      ],
    ],
  },
);

export const SOLAR = dilema(
  'solar',
  'Condomínios devem gerar energia solar?',
  {
    tese: 'Placas no telhado deixam a conta mais leve e a energia mais limpa.',
    tempos: [
      [
        ['Conta mais baixa', 'A energia do sol ajuda a pagar a luz do elevador, da garagem e do portão.', ['custo', 'logica']],
        ['Sol de graça', 'O sol aparece todo dia e ninguém cobra por ele.', ['logica', 'viabilidade']],
        ['Já tem muito telhado', 'Muitos condomínios já instalaram placas e a conta caiu.', ['prova', 'custo']],
        ['Ar mais limpo', 'Energia solar não solta fumaça nem barulho.', ['pessoas', 'imagem']],
        ['Tecnologia madura', 'As placas ficaram mais baratas e mais fortes com o tempo.', ['inovacao', 'prova']],
        ['Telhado que trabalha', 'Imagine o telhado vazio virando uma pequena usina do prédio.', ['imagem', 'tradicao']],
      ],
      [
        ['A conta se paga', 'Meu rival diz que é caro. Mas a economia na luz paga as placas com o tempo.', ['custo', 'logica']],
        ['Funciona com nuvem', 'Meu rival fala de dia nublado. As placas geram menos, mas continuam gerando.', ['prova', 'viabilidade']],
        ['Decisão em assembleia', 'Os moradores votam juntos, como sempre se fez no condomínio.', ['tradicao', 'pessoas']],
        ['Manutenção simples', 'Basta limpar as placas de vez em quando.', ['viabilidade', 'custo']],
        ['Prédio valorizado', 'Apartamento em prédio com energia solar costuma chamar mais atenção na venda.', ['imagem', 'inovacao']],
        ['Exemplo para os filhos', 'Crianças crescem vendo que dá para cuidar do planeta em casa.', ['pessoas', 'inovacao']],
      ],
      [
        ['Economia todo mês', 'Cada mês de sol é um mês de conta menor para todos.', ['custo', 'pessoas']],
        ['Provado em muitos prédios', 'Muitos condomínios já fizeram e não voltaram atrás.', ['prova', 'tradicao']],
        ['Energia do futuro', 'Quem começa agora aprende antes e economiza mais.', ['inovacao', 'logica']],
        ['Passo possível', 'Dá para começar com poucas placas e crescer depois.', ['viabilidade', 'logica']],
        ['Vizinhos unidos', 'Um projeto em comum aproxima os moradores, como uma festa junina.', ['tradicao', 'imagem']],
        ['O prédio do sol', 'Imagine morar no prédio que produz a própria energia.', ['imagem', 'viabilidade']],
      ],
    ],
  },
  {
    tese: 'Cada condomínio tem sua realidade; obrigar ou apressar pode pesar no bolso.',
    tempos: [
      [
        ['Gasto de entrada', 'Comprar e instalar placas exige um dinheiro alto de uma vez só.', ['custo', 'pessoas']],
        ['Telhado pequeno', 'Prédio alto tem muitos apartamentos e pouco telhado para placas.', ['logica', 'viabilidade']],
        ['Sombra do vizinho', 'Um prédio maior ao lado pode fazer sombra o dia inteiro.', ['viabilidade', 'prova']],
        ['Morador que discorda', 'Nem todo morador quer pagar a mais na taxa por um projeto novo.', ['pessoas', 'tradicao']],
        ['Promessa exagerada', 'Algumas empresas prometem economia que depois não aparece.', ['prova', 'imagem']],
        ['Tecnologia que muda', 'As placas melhoram rápido. Quem compra hoje pode ficar com a antiga amanhã.', ['inovacao', 'custo']],
      ],
      [
        ['Se paga, mas quando?', 'Meu rival diz que a conta se paga. Pode levar anos, e muita gente muda antes.', ['custo', 'logica']],
        ['Nem todo prédio', 'Meu rival cita prédios que deram certo. Os que deram errado não aparecem.', ['prova', 'imagem']],
        ['Briga na assembleia', 'Um gasto grande pode dividir os vizinhos por muito tempo.', ['pessoas', 'tradicao']],
        ['Conserto caro', 'Se um equipamento quebra, o conserto pode ser caro e demorado.', ['viabilidade', 'custo']],
        ['Outras prioridades', 'Às vezes o prédio precisa antes de pintura, portão ou elevador novo.', ['logica', 'viabilidade']],
        ['Esperar o melhor', 'Esperar a tecnologia ficar mais barata pode ser a escolha mais esperta.', ['inovacao', 'prova']],
      ],
      [
        ['Escolha de cada prédio', 'Cada condomínio deve decidir no seu tempo, sem pressão.', ['pessoas', 'tradicao']],
        ['Bolso em primeiro lugar', 'Não adianta economizar luz e apertar o orçamento das famílias.', ['custo', 'pessoas']],
        ['Nem todo telhado serve', 'Sem sol e sem espaço, a placa não faz milagre.', ['viabilidade', 'logica']],
        ['Conta com cuidado', 'Antes de comprar, é preciso medir de verdade quanto vai economizar.', ['prova', 'custo']],
        ['Sem moda', 'Não é porque está na moda que serve para todo mundo.', ['imagem', 'inovacao']],
        ['O prédio em ordem', 'Imagine placas novas no telhado e o elevador quebrado.', ['imagem', 'viabilidade']],
      ],
    ],
  },
);

export const RENDA_BASICA = dilema(
  'renda-basica',
  'Cidades devem testar renda básica?',
  {
    tese: 'Testar é o jeito mais honesto de descobrir se a ideia ajuda as pessoas.',
    tempos: [
      [
        ['Testar não é decidir', 'Um teste pequeno mostra se funciona antes de qualquer decisão grande.', ['logica', 'viabilidade']],
        ['Tranquilidade em casa', 'Com um valor fixo, a família consegue planejar comida e escola.', ['pessoas', 'custo']],
        ['Já testaram antes', 'Algumas cidades no mundo já fizeram testes e aprenderam com eles.', ['prova', 'tradicao']],
        ['Regra simples', 'Um valor igual e simples gasta menos com fila e papelada.', ['viabilidade', 'custo']],
        ['Ideia nova, medida', 'Política nova deve ser testada como remédio novo: com cuidado e medição.', ['inovacao', 'prova']],
        ['Comunidade que se ajuda', 'Imagine vizinhos com mais calma para cuidar uns dos outros.', ['imagem', 'tradicao']],
      ],
      [
        ['É só um teste', 'Meu rival diz que é caro. Um teste pequeno custa pouco e ensina muito.', ['custo', 'logica']],
        ['Vamos medir', 'Meu rival diz que as pessoas param de trabalhar. O teste serve justamente para medir.', ['prova', 'logica']],
        ['Gasto no bairro', 'O dinheiro recebido vira compra na padaria e na feira do bairro.', ['custo', 'pessoas']],
        ['Começar por um bairro', 'Dá para testar em um só bairro e comparar com outro.', ['viabilidade', 'inovacao']],
        ['Ajudar é antigo', 'Ajudar quem está passando aperto sempre fez parte das comunidades.', ['tradicao', 'pessoas']],
        ['Cidade que aprende', 'Uma cidade que testa ideias mostra que quer aprender.', ['imagem', 'inovacao']],
      ],
      [
        ['Saber antes de opinar', 'Com o teste, a discussão para de ser só opinião e vira fato.', ['prova', 'logica']],
        ['Pouco risco', 'Teste pequeno, com prazo para acabar. O risco é baixo.', ['viabilidade', 'custo']],
        ['Pessoas no centro', 'O foco é saber se a vida das famílias melhora.', ['pessoas', 'imagem']],
        ['Errar pequeno', 'Se não funcionar, a cidade aprende sem gastar muito.', ['custo', 'inovacao']],
        ['Cuidado de sempre', 'Testar antes de mudar é o cuidado que sempre se pediu.', ['tradicao', 'viabilidade']],
        ['A cidade laboratório', 'Imagine uma cidade que descobre respostas em vez de só discutir.', ['imagem', 'inovacao']],
      ],
    ],
  },
  {
    tese: 'O dinheiro é pouco; melhor usar em serviços que já sabemos que funcionam.',
    tempos: [
      [
        ['Dinheiro tem destino', 'O dinheiro do teste poderia ir para creche, posto de saúde e transporte.', ['custo', 'pessoas']],
        ['Serviço que funciona', 'Uma escola boa ajuda a criança todo dia, de um jeito conhecido.', ['prova', 'tradicao']],
        ['Difícil de organizar', 'Escolher quem recebe e acompanhar tudo exige muita estrutura.', ['viabilidade', 'logica']],
        ['Teste vira promessa', 'Depois que começa, fica difícil parar sem decepcionar as famílias.', ['pessoas', 'logica']],
        ['Resultado confuso', 'Testes pequenos às vezes mostram resultados que não servem para a cidade toda.', ['prova', 'inovacao']],
        ['Ideia da moda', 'Pode virar vitrine de novidade em vez de solução de verdade.', ['imagem', 'custo']],
      ],
      [
        ['Pouco ainda é dinheiro', 'Meu rival diz que o teste é barato. Pouco dinheiro ainda faz falta no hospital.', ['custo', 'logica']],
        ['Medir não é simples', 'Meu rival quer medir. Mas vida de família muda por muitos motivos ao mesmo tempo.', ['prova', 'logica']],
        ['Bairro vizinho de fora', 'Testar num bairro só pode parecer injusto para o bairro ao lado.', ['pessoas', 'viabilidade']],
        ['Ajuda que já existe', 'Já existem formas de ajuda. Melhorar o que existe pode ser mais fácil.', ['viabilidade', 'tradicao']],
        ['Nem tudo se testa', 'Uma ideia nova pode distrair a cidade dos problemas de sempre.', ['inovacao', 'imagem']],
        ['Fim do teste', 'Quando o teste acaba, as famílias voltam ao aperto de antes.', ['pessoas', 'tradicao']],
      ],
      [
        ['Primeiro o garantido', 'Escola, saúde e ônibus são apostas que já sabemos que funcionam.', ['prova', 'tradicao']],
        ['Conta apertada', 'Com pouco dinheiro, cada real precisa ir para o que é certo.', ['custo', 'logica']],
        ['Justo com todos', 'Serviço público atende todo mundo, não só quem foi sorteado.', ['pessoas', 'viabilidade']],
        ['Melhorar o que existe', 'Arrumar a ajuda que já existe é mais rápido que inventar outra.', ['viabilidade', 'inovacao']],
        ['Menos vitrine', 'A cidade precisa de resultado, não de manchete.', ['imagem', 'logica']],
        ['Creche aberta', 'Imagine o mesmo dinheiro abrindo vagas em creche.', ['imagem', 'custo']],
      ],
    ],
  },
);

export const UNIVERSIDADES = dilema(
  'universidades',
  'Universidades devem abrir aulas ao público?',
  {
    tese: 'Conhecimento compartilhado ajuda a cidade inteira a aprender.',
    tempos: [
      [
        ['Saber para todos', 'Qualquer pessoa poderia assistir a uma aula de história ou de ciência.', ['pessoas', 'logica']],
        ['Sala já existe', 'A sala, o professor e a aula já existem. É só abrir a porta.', ['viabilidade', 'custo']],
        ['Aula pela internet', 'Muitas universidades já colocam aulas na internet de graça.', ['prova', 'inovacao']],
        ['Curiosidade não tem idade', 'Avós e netos podem aprender juntos, como nas antigas rodas de conversa.', ['tradicao', 'pessoas']],
        ['Universidade perto', 'Imagine o vizinho saindo de uma aula de astronomia animado.', ['imagem', 'tradicao']],
        ['Descobrir vocação', 'Um jovem pode descobrir o que quer estudar assistindo a uma aula.', ['logica', 'imagem']],
      ],
      [
        ['Não precisa de todas', 'Meu rival diz que a sala lota. Dá para abrir só algumas aulas e algumas vagas.', ['viabilidade', 'logica']],
        ['Custo quase zero', 'Meu rival fala em gasto. Gravar uma aula custa pouco perto do que ela ensina.', ['custo', 'inovacao']],
        ['Já funciona', 'Palestras abertas acontecem há muito tempo e dão certo.', ['prova', 'tradicao']],
        ['Ponte com o bairro', 'Quem visita a universidade passa a cuidar dela e a valorizar a ciência.', ['pessoas', 'imagem']],
        ['Aluno também ganha', 'Perguntas de quem vem de fora trazem ideias novas para a sala.', ['inovacao', 'pessoas']],
        ['Cidade que estuda', 'Uma cidade que aprende junto toma decisões melhores.', ['logica', 'custo']],
      ],
      [
        ['Conhecimento circula', 'Saber guardado não ajuda ninguém. Saber aberto ajuda todo mundo.', ['logica', 'pessoas']],
        ['Simples de fazer', 'Algumas cadeiras extras ou uma câmera na sala já bastam.', ['viabilidade', 'custo']],
        ['Exemplos de sobra', 'Aulas abertas e na internet já ensinam milhões de pessoas.', ['prova', 'inovacao']],
        ['Aprender sempre', 'Estudar a vida inteira é um valor antigo e bonito.', ['tradicao', 'imagem']],
        ['Futuro de curiosos', 'Uma criança que assiste a uma aula hoje pode ser cientista amanhã.', ['inovacao', 'pessoas']],
        ['Portas abertas', 'Imagine a universidade como uma praça do saber, aberta a todos.', ['imagem', 'tradicao']],
      ],
    ],
  },
  {
    tese: 'A aula precisa de foco; abrir para todos pode atrapalhar quem estuda.',
    tempos: [
      [
        ['Sala cheia demais', 'Sala lotada atrapalha o aluno que precisa prestar atenção.', ['pessoas', 'viabilidade']],
        ['Aula tem sequência', 'Quem chega no meio do semestre não entende a matéria.', ['logica', 'prova']],
        ['Segurança no campus', 'Mais gente circulando exige mais controle e mais vigias.', ['custo', 'viabilidade']],
        ['Lugar de estudo', 'A universidade sempre foi um lugar de estudo com regras e matrícula.', ['tradicao', 'logica']],
        ['Professor sobrecarregado', 'Mais perguntas e mais gente significam mais trabalho para o professor.', ['pessoas', 'custo']],
        ['Tem outro jeito', 'Palestras e cursos livres já fazem isso sem mexer na aula regular.', ['inovacao', 'imagem']],
      ],
      [
        ['Abrir uma já muda', 'Meu rival diz que é só abrir algumas. Mesmo assim alguém precisa organizar.', ['viabilidade', 'logica']],
        ['Câmera também custa', 'Meu rival diz que gravar é barato. Equipamento e edição custam dinheiro.', ['custo', 'prova']],
        ['Internet já resolve', 'Quem quer aprender já encontra muitas aulas gratuitas na internet.', ['inovacao', 'prova']],
        ['Aluno com timidez', 'Com estranhos na sala, alguns alunos ficam com vergonha de perguntar.', ['pessoas', 'imagem']],
        ['Regra protege', 'A matrícula existe para garantir que o aluno tenha vaga e atenção.', ['tradicao', 'pessoas']],
        ['Bonito no papel', 'Parece ótimo na notícia, mas na prática pode virar bagunça.', ['imagem', 'tradicao']],
      ],
      [
        ['Foco no aluno', 'A primeira tarefa da universidade é ensinar bem quem está matriculado.', ['pessoas', 'logica']],
        ['Cada coisa no lugar', 'Aula regular para alunos, palestra aberta para o público.', ['viabilidade', 'tradicao']],
        ['Sem gasto extra', 'Manter como está evita gastar com segurança e equipamento.', ['custo', 'viabilidade']],
        ['O que já existe basta', 'Cursos livres e aulas online já cumprem esse papel.', ['prova', 'inovacao']],
        ['Novo sem bagunça', 'Inovar sim, mas sem atrapalhar quem já está estudando.', ['inovacao', 'logica']],
        ['A sala tranquila', 'Imagine tentar fazer uma prova com a sala cheia de visitantes.', ['imagem', 'custo']],
      ],
    ],
  },
);
