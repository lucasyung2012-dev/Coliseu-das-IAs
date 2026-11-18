import { dilema } from './fazer';

// Dilemas escritos à mão (decisão D6), 18/11/2026. Toda carta tem 2 temas diferentes.

export const ROBOS = dilema(
  'robos',
  'Robôs devem ajudar a cuidar de idosos?',
  {
    tese: 'Robôs fazem as tarefas pesadas, e as pessoas ficam com o carinho.',
    tempos: [
      [
        ['Nunca esquece o remédio', 'Um robô lembra o horário de cada remédio, todo dia, sem falhar.', ['viabilidade', 'pessoas']],
        ['Socorro na hora', 'Se o idoso cair, o robô percebe e chama ajuda em segundos. Nas casas que testaram, o socorro chegou bem mais rápido.', ['prova', 'pessoas']],
        ['Cuidador descansado', 'Com o robô carregando peso e arrumando a casa, o cuidador tem mais tempo e energia para conversar.', ['logica', 'pessoas']],
        ['Mais barato do que parece', 'Um robô ajudante custa menos que horas extras todo mês e funciona dia e noite.', ['custo', 'viabilidade']],
        ['A casa do futuro', 'Imagine a vovó pedindo música, o robô dançando junto e a família vendo tudo pelo celular.', ['imagem', 'inovacao']],
        ['Já existe de verdade', 'Robôs assim já são usados no Japão. Não é ficção: é uma ferramenta nova pronta para usar.', ['inovacao', 'prova']],
      ],
      [
        ['Robô não tira o abraço', 'Meu rival diz que o robô tira o carinho. Mas ele faz o serviço pesado justamente para sobrar tempo para o abraço.', ['logica', 'pessoas']],
        ['Faltam cuidadores', 'Tem cada vez mais idosos e menos cuidadores. Sem ajuda, muita gente fica sozinha de qualquer jeito.', ['prova', 'viabilidade']],
        ['Segredo guardado em casa', 'Dá para o robô guardar tudo dentro de casa, sem mandar nada para a internet.', ['viabilidade', 'logica']],
        ['A conta fecha', 'Cuidador 24 horas é caro demais para muitas famílias. O robô deixa o cuidado ao alcance de mais gente.', ['custo', 'pessoas']],
        ['Ajudante antigo, ferramenta nova', 'As famílias sempre usaram ajuda: bengala, cadeira de rodas, alarme. O robô é só o próximo ajudante.', ['tradicao', 'inovacao']],
        ['Uma tarde possível', 'O neto chega da escola e encontra o avô descansado, de banho tomado, contando o que o robô aprontou.', ['imagem', 'tradicao']],
      ],
      [
        ['Mais tempo para amar', 'Robô no trabalho pesado, gente no carinho. É assim que se cuida melhor.', ['pessoas', 'imagem']],
        ['Testado e aprovado', 'Os testes mostram menos quedas sem socorro e menos remédios esquecidos.', ['prova', 'logica']],
        ['Começa com um ajudante', 'Não precisa de um robô gigante: um ajudante simples já cuida de remédio, alarme e luzes.', ['viabilidade', 'custo']],
        ['O cuidado de sempre, mais forte', 'A família continua no centro. O robô só ajuda a manter a tradição de cuidar em casa.', ['tradicao', 'pessoas']],
        ['Para todas as famílias', 'Com o preço caindo, cuidado de qualidade deixa de ser só para quem é rico.', ['custo', 'inovacao']],
        ['Ninguém esperando no chão', 'Um mundo em que nenhum idoso fica caído horas esperando ajuda.', ['imagem', 'inovacao']],
      ],
    ],
  },
  {
    tese: 'Cuidar de alguém é trabalho de gente, não de máquina.',
    tempos: [
      [
        ['Solidão de lata', 'Um idoso cercado de máquinas pode passar dias sem conversar com ninguém de verdade.', ['pessoas', 'imagem']],
        ['E se der defeito?', 'Robô trava, a bateria acaba, o sistema atualiza. E o idoso fica esperando.', ['logica', 'viabilidade']],
        ['Caro demais', 'Um robô bom custa uma fortuna e ainda precisa de conserto. Muitas famílias não conseguem pagar.', ['custo', 'viabilidade']],
        ['Cuidar é tradição', 'Por gerações, filhos e netos cuidaram dos mais velhos. Esse laço não se terceiriza.', ['tradicao', 'pessoas']],
        ['Pouca prova', 'Os testes com robôs foram curtos e com poucas pessoas. Ainda não sabemos os efeitos a longo prazo.', ['prova', 'logica']],
        ['Câmera dentro de casa', 'Um robô que vê e ouve tudo pode expor a vida do idoso. Novidade com risco.', ['inovacao', 'prova']],
      ],
      [
        ['O tempo que some', 'Meu rival diz que sobra tempo para o abraço. Na prática, a família visita menos porque "o robô está lá".', ['pessoas', 'logica']],
        ['Formar gente é melhor', 'Com o dinheiro do robô dá para formar cuidadores e criar empregos no bairro.', ['custo', 'pessoas']],
        ['O Japão não é aqui', 'O que funciona num país rico pode não funcionar em casa pequena e com internet ruim.', ['viabilidade', 'prova']],
        ['Moda passageira', 'Toda hora aparece um aparelho "revolucionário" que some no ano seguinte.', ['tradicao', 'inovacao']],
        ['Robô não vê tristeza', 'A máquina nota uma queda, mas não nota quando a vovó está triste.', ['logica', 'imagem']],
        ['Quem conserta?', 'Peça cara, técnico longe, garantia curta. O cuidado vira dor de cabeça.', ['viabilidade', 'custo']],
      ],
      [
        ['Ninguém quer envelhecer sozinho', 'No fim da vida, o que conta é uma mão segurando a sua.', ['pessoas', 'imagem']],
        ['Primeiro gente, depois máquina', 'Invista em cuidadores primeiro. Robô pode ser um extra, nunca o principal.', ['logica', 'viabilidade']],
        ['O que nos faz família', 'Cuidar dos nossos velhos é o que nos faz família. Não vamos trocar isso por um aparelho.', ['tradicao', 'pessoas']],
        ['A conta de verdade', 'Somando robô, conserto e internet, sai mais caro do que parece.', ['custo', 'prova']],
        ['Prudência', 'Sem estudos longos, o mais seguro é esperar antes de pôr robôs em toda casa.', ['prova', 'tradicao']],
        ['A festa sem netos', 'Um aniversário com um robô cantando parabéns e nenhum neto na sala.', ['imagem', 'inovacao']],
      ],
    ],
  },
);

export const MEDICINA = dilema(
  'medicina',
  'A IA deve ajudar os médicos a decidir?',
  {
    tese: 'A IA dá uma segunda opinião; quem decide é o médico.',
    tempos: [
      [
        ['Segunda opinião', 'A IA olha os exames junto com o médico, como um colega que nunca cansa.', ['logica', 'pessoas']],
        ['Acha mais cedo', 'Em estudos, a IA encontrou doenças em raio-X que tinham passado despercebidas.', ['prova', 'inovacao']],
        ['Atende mais gente', 'Com a IA ajudando, o médico atende mais pacientes sem perder qualidade.', ['viabilidade', 'pessoas']],
        ['Descobrir cedo sai barato', 'Tratar uma doença no começo custa muito menos do que tratar quando ela já avançou.', ['custo', 'logica']],
        ['O hospital do futuro', 'Imagine resultado na hora e ninguém esperando semanas por um diagnóstico.', ['imagem', 'inovacao']],
        ['O médico no comando', 'Como sempre foi: quem decide é o médico. A IA só aponta o que ele deve olhar com atenção.', ['tradicao', 'viabilidade']],
      ],
      [
        ['Errar também é humano', 'Meu rival teme os erros da IA. Mas médico cansado também erra, e os dois juntos erram menos.', ['logica', 'prova']],
        ['Tudo registrado', 'Cada sugestão da IA fica registrada e o médico assina. A responsabilidade não some.', ['viabilidade', 'tradicao']],
        ['Para a cidade pequena', 'Onde falta especialista, a IA ajuda o médico do interior a não deixar nada passar.', ['pessoas', 'viabilidade']],
        ['Testada como remédio', 'Toda IA de saúde passa por testes, como um remédio novo, antes de chegar ao hospital.', ['prova', 'tradicao']],
        ['Economia que vira leito', 'O dinheiro economizado em exames repetidos pode virar mais leitos.', ['custo', 'pessoas']],
        ['"Pegamos cedo"', 'Imagine uma mãe ouvindo "pegamos cedo, vai ficar tudo bem".', ['imagem', 'pessoas']],
      ],
      [
        ['Quatro olhos veem mais', 'Médico e IA juntos enxergam mais do que cada um sozinho.', ['logica', 'inovacao']],
        ['Os números confirmam', 'Hospitais que usam IA como apoio reduziram os diagnósticos atrasados.', ['prova', 'viabilidade']],
        ['Saúde para todos', 'Um bom diagnóstico não pode depender de morar perto de um hospital grande.', ['pessoas', 'custo']],
        ['Ferramenta nova, tradição antiga', 'A medicina sempre adotou ferramentas novas: o estetoscópio, o raio-X. A IA é a próxima.', ['tradicao', 'inovacao']],
        ['Começar com cuidado', 'Primeiro em exames simples, sempre com o médico revisando. Dá para fazer já.', ['viabilidade', 'logica']],
        ['Menos espera, menos medo', 'Imagine trocar semanas de angústia por uma resposta no mesmo dia.', ['imagem', 'viabilidade']],
      ],
    ],
  },
  {
    tese: 'Na saúde, quem decide precisa ser gente que responde pelo que faz.',
    tempos: [
      [
        ['Caixa-preta', 'Muitas IAs não explicam por que deram uma resposta. Como confiar sem entender?', ['logica', 'prova']],
        ['Aprendeu torto', 'Se a IA aprendeu com exames de poucos tipos de pessoas, ela erra mais com quem ficou de fora.', ['prova', 'pessoas']],
        ['Olho no olho', 'O paciente precisa de conversa e confiança, não de uma tela cheia de números.', ['pessoas', 'tradicao']],
        ['Equipamento caro', 'Computadores potentes e licenças caras pesam no orçamento do hospital.', ['custo', 'viabilidade']],
        ['Confiança cega', 'Com o tempo, o médico pode parar de pensar e só obedecer à máquina.', ['logica', 'inovacao']],
        ['O consultório frio', 'Imagine um consultório onde a máquina fala mais que o médico.', ['imagem', 'pessoas']],
      ],
      [
        ['Assinar não basta', 'Meu rival diz que o médico assina. Mas quem tem 5 minutos por paciente vai assinar o que a máquina disser.', ['logica', 'viabilidade']],
        ['Laboratório não é hospital', 'A IA vai bem no teste e tropeça no hospital cheio e bagunçado.', ['prova', 'viabilidade']],
        ['Dinheiro melhor gasto', 'Com o mesmo valor dá para contratar mais médicos e enfermeiros.', ['custo', 'pessoas']],
        ['Medicina também é arte', 'Por séculos, o bom médico foi quem sabe escutar. Isso não cabe num programa.', ['tradicao', 'imagem']],
        ['Segredo em risco', 'Exame é segredo. Mandar tudo para sistemas novos aumenta o risco de vazamento.', ['inovacao', 'prova']],
        ['E quando errar?', 'Se a IA errar, quem responde? A empresa, o médico, o hospital? Ninguém sabe ainda.', ['logica', 'tradicao']],
      ],
      [
        ['Gente cuidando de gente', 'Na hora mais difícil, o paciente merece alguém que responda pelo que fez.', ['pessoas', 'tradicao']],
        ['Sem explicação, sem decisão', 'Se ninguém consegue explicar a resposta, ela não pode decidir uma vida.', ['logica', 'prova']],
        ['Primeiro o básico', 'Antes da IA, faltam médicos, exames e leitos. Vamos resolver isso primeiro.', ['viabilidade', 'custo']],
        ['Promessa de milagre', 'Toda tecnologia nova promete milagres. Na saúde, cautela salva vidas.', ['inovacao', 'logica']],
        ['Faltam estudos longos', 'Ainda não há estudos longos mostrando que os pacientes vivem melhor com IA.', ['prova', 'viabilidade']],
        ['O médico que eu quero', 'Um médico que olha para mim, e não para a tela.', ['imagem', 'pessoas']],
      ],
    ],
  },
);

export const FACIAL = dilema(
  'facial',
  'As escolas devem usar reconhecimento facial?',
  {
    tese: 'A câmera ajuda na segurança e na chamada, com regras claras.',
    tempos: [
      [
        ['Chamada automática', 'A câmera faz a chamada sozinha, e o professor ganha dez minutos de aula.', ['viabilidade', 'custo']],
        ['Só entra quem é da escola', 'O portão reconhece alunos e funcionários e avisa se entrar um estranho.', ['pessoas', 'logica']],
        ['Pais avisados', 'Os pais recebem uma mensagem quando o filho chega à escola.', ['pessoas', 'inovacao']],
        ['Tecnologia já testada', 'Aeroportos e bancos usam isso há anos, com bons resultados.', ['prova', 'tradicao']],
        ['Bom-dia pelo nome', 'Imagine entrar na escola e o portão dar bom-dia chamando você pelo nome.', ['imagem', 'inovacao']],
        ['Adeus, crachá perdido', 'Sem lista de papel e sem crachá esquecido em casa.', ['custo', 'logica']],
      ],
      [
        ['Dados guardados', 'Meu rival teme pelos dados. Com lei e senha forte, as imagens ficam guardadas só na escola.', ['viabilidade', 'logica']],
        ['Mais segurança comprovada', 'Escolas com controle de entrada tiveram menos invasões.', ['prova', 'pessoas']],
        ['Acabou o "presente" do amigo', 'Ninguém mais responde a chamada por quem faltou.', ['logica', 'tradicao']],
        ['Preço caindo', 'As câmeras estão cada vez mais baratas; o sistema se paga em poucos anos.', ['custo', 'inovacao']],
        ['Porteiro livre para cuidar', 'O porteiro para de conferir papel e passa a cuidar de quem precisa.', ['pessoas', 'viabilidade']],
        ['A mãe tranquila', 'Imagine a mãe trabalhando sossegada, sabendo que o filho chegou bem.', ['imagem', 'pessoas']],
      ],
      [
        ['Segurança primeiro', 'Escola segura é onde dá para aprender sem medo.', ['pessoas', 'logica']],
        ['Se protege aeroporto...', 'Se funciona para proteger aeroportos, pode proteger escolas.', ['prova', 'tradicao']],
        ['Mais minutos de aula', 'Minutos de chamada viram minutos de aprendizado.', ['viabilidade', 'custo']],
        ['Escola moderna', 'A escola precisa acompanhar o mundo em que os alunos vivem.', ['inovacao', 'imagem']],
        ['Com regras, sem medo', 'Lei clara, dados guardados e pais informados. Assim funciona.', ['logica', 'viabilidade']],
        ['Todo mundo seguro', 'Imagine uma escola onde todos se sentem protegidos.', ['imagem', 'pessoas']],
      ],
    ],
  },
  {
    tese: 'Escola não é aeroporto: criança não deve ser vigiada o tempo todo.',
    tempos: [
      [
        ['Criança vigiada', 'Ser filmado o dia todo ensina que é normal viver vigiado.', ['pessoas', 'logica']],
        ['A câmera erra', 'Estudos mostram que o reconhecimento facial erra mais com crianças e com pessoas de pele escura.', ['prova', 'pessoas']],
        ['Caro demais', 'Câmeras, servidores e manutenção custam o que daria para reformar a biblioteca.', ['custo', 'viabilidade']],
        ['Rosto vazado', 'Fotos do rosto de crianças nas mãos erradas é perigoso.', ['inovacao', 'prova']],
        ['Porteiro que conhece todo mundo', 'A escola sempre funcionou com um porteiro que chama cada aluno pelo nome.', ['tradicao', 'pessoas']],
        ['Clima de prisão', 'Imagine entrar na escola como quem passa pela porta de um presídio.', ['imagem', 'logica']],
      ],
      [
        ['Senha forte não basta', 'Meu rival fala em senha forte. Até bancos e governos já tiveram vazamentos.', ['prova', 'logica']],
        ['Chamada já é rápida', 'Uma chamada leva dois minutos. Não precisa de câmera para isso.', ['viabilidade', 'custo']],
        ['O erro machuca', 'Um aluno marcado como ausente por erro da máquina pode levar bronca sem culpa.', ['pessoas', 'prova']],
        ['Lugar de crescer livre', 'A escola sempre foi o lugar de crescer sem ser observado o tempo todo.', ['tradicao', 'imagem']],
        ['Dinheiro melhor usado', 'Com esse valor, contrate mais um porteiro e conserte a quadra.', ['custo', 'pessoas']],
        ['Rápido demais', 'Ninguém sabe o que vão fazer com esses dados daqui a dez anos.', ['inovacao', 'logica']],
      ],
      [
        ['Infância sem vigilância', 'Criança precisa de confiança para crescer, não de câmera.', ['pessoas', 'imagem']],
        ['Os erros são reais', 'Enquanto a máquina errar com crianças, ela não pode decidir quem entra.', ['prova', 'logica']],
        ['Gente cuida melhor', 'Um porteiro atento resolve, como sempre resolveu.', ['tradicao', 'viabilidade']],
        ['Prioridades', 'Primeiro livros, professores e quadra. Nenhuma câmera vem antes disso.', ['custo', 'logica']],
        ['Rosto não se troca', 'Senha vazada a gente troca. Rosto vazado, não.', ['inovacao', 'prova']],
        ['A escola que eu quero', 'Imagine uma escola aberta e alegre, sem um olho eletrônico em cada canto.', ['imagem', 'tradicao']],
      ],
    ],
  },
);
