import type { Tema } from './temas';
import { MEDICINA, ROBOS, FACIAL } from './conteudo/saude-e-tecnologia';
import { JOGOS, PROJETOS, PUBLICIDADE } from './conteudo/escola-e-internet';
import { ANIMAIS, ESPACO, QUATRO_DIAS } from './conteudo/cidade-e-mundo';

export interface Carta {
  id: string;
  titulo: string;
  texto: string;
  temas: [Tema] | [Tema, Tema];
}

export type LadoId = 'favor' | 'contra';

export interface Lado {
  nome: string;
  /** A tese do lado em uma frase, mostrada no briefing. */
  tese: string;
  /** Seis cartas para cada um dos 3 tempos; o jogo sorteia 4 de cada. */
  tempos: [Carta[], Carta[], Carta[]];
}

export interface Dilema {
  id: string;
  pergunta: string;
  lados: Record<LadoId, Lado>;
}

/** Ajuda a escrever: [título, texto, temas] → Carta com id estável. */
function cartas(prefixo: string, lista: [string, string, Carta['temas']][]): Carta[] {
  return lista.map(([titulo, texto, temas], i) => ({ id: `${prefixo}-${i + 1}`, titulo, texto, temas }));
}

// Textos escritos à mão (decisão D6). O 1º dilema está aqui; os outros 9 ficam em conteudo/.
export const DILEMAS: Dilema[] = [
  {
    id: 'celulares',
    pergunta: 'A escola deve limitar o uso de celulares?',
    lados: {
      favor: {
        nome: 'A favor',
        tese: 'Celular guardado na aula, liberado quando o professor pedir.',
        tempos: [
          cartas('cel-f1', [
            ['Atenção de volta', 'Quando o celular vibra, a cabeça sai da aula. Sem ele na mesa, dá para prestar atenção do começo ao fim.', ['logica', 'pessoas']],
            ['Os números falam', 'Escolas que guardaram os celulares viram as notas subirem, principalmente as de quem tinha mais dificuldade.', ['prova', 'pessoas']],
            ['Recreio de verdade', 'Imagine o pátio cheio de gente jogando bola e conversando, em vez de cabeças baixas olhando a tela.', ['imagem', 'pessoas']],
            ['Regra simples', 'Guardar o celular na mochila durante a aula é fácil de explicar e de cumprir. Não precisa de nada novo.', ['viabilidade', 'tradicao']],
            ['De graça', 'Uma caixa na sala custa quase nada e resolve. Não precisa comprar equipamento nem contratar ninguém.', ['custo', 'viabilidade']],
            ['Como sempre foi', 'Gerações aprenderam com caderno, lousa e conversa. A escola não precisa disputar atenção com uma tela.', ['tradicao', 'pessoas']],
          ]),
          cartas('cel-f2', [
            ['Emergência tem solução', 'Meu rival fala em emergências, mas a secretaria tem telefone e os pais podem ligar lá. Ninguém fica sem contato.', ['viabilidade', 'logica']],
            ['Limitar não é proibir', 'Quando a aula pedir pesquisa, o professor libera. No resto do tempo, o celular fica guardado.', ['logica', 'viabilidade']],
            ['Pergunte aos alunos', 'Muitos alunos dizem que é difícil parar de olhar sozinhos. A regra ajuda quem quer focar e não consegue.', ['pessoas', 'prova']],
            ['Menos bronca, mais aula', 'Sem celular na mesa, o professor gasta menos tempo chamando a atenção e mais tempo ensinando.', ['viabilidade', 'custo']],
            ['Caro é o tempo perdido', 'Cada minuto distraído é uma aula paga que ninguém aproveitou. Isso, sim, sai caro.', ['custo', 'logica']],
            ['Moda não é método', 'Colocar tela em tudo virou moda, mas moda não é método de ensino.', ['tradicao', 'logica']],
          ]),
          cartas('cel-f3', [
            ['A escolha mais segura', 'Juntando tudo: mais atenção, notas melhores e recreio com amigos. Quem guarda o celular não perde nada que importa.', ['logica', 'prova']],
            ['Uma geração que conversa', 'Daqui a dez anos, queremos lembrar de amizades feitas no pátio, não de horas rolando a tela.', ['pessoas', 'imagem']],
            ['Começa segunda-feira', 'Uma caixa, uma regra e um combinado com os pais. Dá para começar na semana que vem.', ['viabilidade', 'custo']],
            ['O que a escola sempre protegeu', 'Escola é lugar de aprender a pensar sozinho. Isso vale proteger, como sempre se protegeu.', ['tradicao', 'pessoas']],
            ['Os estudos confirmam', 'Pesquisas em vários países mostram o mesmo: menos celular na aula, mais aprendizado.', ['prova', 'logica']],
            ['Foco é o novo superpoder', 'Num mundo cheio de notificações, quem aprende a se concentrar sai na frente. A escola pode ensinar isso.', ['inovacao', 'imagem']],
          ]),
        ],
      },
      contra: {
        nome: 'Contra',
        tese: 'Ensinar a usar bem, em vez de esconder o celular.',
        tempos: [
          cartas('cel-c1', [
            ['Ferramenta de estudo', 'O celular tem dicionário, calculadora, mapas e vídeos de aula. Tirar isso é tirar uma ferramenta.', ['viabilidade', 'inovacao']],
            ['O mundo é digital', 'Lá fora todo mundo usa o celular para trabalhar. A escola deveria preparar para esse mundo, não fingir que ele não existe.', ['inovacao', 'logica']],
            ['Família tranquila', 'Muitos pais ficam mais tranquilos sabendo que o filho pode avisar se algo acontecer.', ['pessoas', 'viabilidade']],
            ['Proibir não ensina', 'Se a regra é só esconder, o aluno nunca aprende a se controlar sozinho. Ele precisa praticar.', ['logica', 'pessoas']],
            ['Sem gastar com fiscal', 'Fiscalizar celular em toda sala dá trabalho e toma tempo. Ensinar o uso certo sai mais barato.', ['custo', 'viabilidade']],
            ['Imagine a aula viva', 'Uma turma votando ao vivo pelo celular, vendo um vulcão em 3D, conversando com uma escola do outro lado do mundo.', ['imagem', 'inovacao']],
          ]),
          cartas('cel-c2', [
            ['Faltou prova', 'Meu rival mostra notas, mas o estudo mediu poucas escolas por pouco tempo. Isso ainda não prova nada.', ['prova', 'logica']],
            ['Quem não tem computador', 'Para muito aluno, o celular é o único aparelho para pesquisar. Limitar pesa mais para quem tem menos.', ['pessoas', 'custo']],
            ['A caixa vira briga', 'Caixa de celular vira confusão todo dia: quem guarda, quem perde, quem esconde. Não é tão simples.', ['viabilidade', 'pessoas']],
            ['O mundo mudou', 'Dizer que sempre foi assim não ajuda. O mundo mudou, e a escola também precisa mudar.', ['inovacao', 'logica']],
            ['Tem hora para tudo', 'Em vez de caixa, o professor combina com a turma quando usar. É como sempre foi com o caderno: tem hora para cada coisa.', ['tradicao', 'viabilidade']],
            ['Testar antes de proibir', 'Por que não testar um mês com regras de uso e medir o resultado? Decidir com dado, não com medo.', ['prova', 'inovacao']],
          ]),
          cartas('cel-c3', [
            ['Ensinar é melhor que esconder', 'Proibir resolve hoje; ensinar resolve para a vida. A escola existe para ensinar.', ['logica', 'pessoas']],
            ['Prontos para o futuro', 'Os empregos de amanhã pedem quem sabe usar tecnologia com responsabilidade. Isso se aprende na escola.', ['inovacao', 'viabilidade']],
            ['Mais barato e mais justo', 'Usar o aparelho que os alunos já têm custa zero e ajuda justamente quem não tem computador.', ['custo', 'pessoas']],
            ['Um combinado, não uma caixa', 'Regras claras de uso, combinadas com a turma, funcionam como as outras regras da escola sempre funcionaram.', ['tradicao', 'viabilidade']],
            ['Os dados pedem calma', 'As pesquisas ainda discordam entre si. Antes de proibir tudo, é preciso medir com cuidado.', ['prova', 'logica']],
            ['A aula que ninguém esquece', 'A melhor aula é aquela em que o aluno cria, descobre e mostra. O celular pode ser o pincel dessa aula.', ['imagem', 'inovacao']],
          ]),
        ],
      },
    },
  },
  ROBOS,
  MEDICINA,
  PROJETOS,
  ESPACO,
  JOGOS,
  QUATRO_DIAS,
  ANIMAIS,
  PUBLICIDADE,
  FACIAL,
];
