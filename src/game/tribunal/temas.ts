import type { JuradoId } from '../jurados';

export type Tema = 'logica' | 'prova' | 'pessoas' | 'tradicao' | 'viabilidade' | 'custo' | 'inovacao' | 'imagem';

export const TEMAS: Record<Tema, { nome: string; icone: string }> = {
  logica: { nome: 'Lógica', icone: '🧩' },
  prova: { nome: 'Prova', icone: '🔬' },
  pessoas: { nome: 'Pessoas', icone: '❤️' },
  tradicao: { nome: 'Tradição', icone: '🏛️' },
  viabilidade: { nome: 'Viabilidade', icone: '🛠️' },
  custo: { nome: 'Custo', icone: '💰' },
  inovacao: { nome: 'Inovação', icone: '🚀' },
  imagem: { nome: 'Imagem', icone: '🎨' },
};

export interface Gostos {
  ama: Tema;
  gosta: Tema;
  naoGosta: Tema;
}

// A tabela que decide tudo: ama +2, gosta +1, não gosta −1. Equilibrada em 18/11/2026:
// cada tema tem exatamente 1 jurado que ama, 1 que gosta e 1 que não gosta, então
// nenhuma carta é "grátis" e a melhor jogada depende de quem está no júri.
export const GOSTOS: Record<JuradoId, Gostos> = {
  logico: { ama: 'logica', gosta: 'viabilidade', naoGosta: 'imagem' },
  cetico: { ama: 'prova', gosta: 'logica', naoGosta: 'inovacao' },
  empatico: { ama: 'pessoas', gosta: 'imagem', naoGosta: 'custo' },
  tradicionalista: { ama: 'tradicao', gosta: 'pessoas', naoGosta: 'prova' },
  estrategista: { ama: 'viabilidade', gosta: 'custo', naoGosta: 'tradicao' },
  cientista: { ama: 'inovacao', gosta: 'prova', naoGosta: 'viabilidade' },
  comerciante: { ama: 'custo', gosta: 'tradicao', naoGosta: 'pessoas' },
  artista: { ama: 'imagem', gosta: 'inovacao', naoGosta: 'logica' },
};

export type Reacao = 'ama' | 'gosta' | 'naoGosta';

/** O que cada jurado diz quando uma carta toca no tema que ele ama, gosta ou não gosta. */
export const REACOES: Record<JuradoId, Record<Reacao, string[]>> = {
  logico: {
    ama: ['Raciocínio limpo. Cada passo leva ao próximo.', 'Isso fecha do começo ao fim.'],
    gosta: ['Se funciona na prática, faz sentido.', 'Um plano que dá para fazer: lógico.'],
    naoGosta: ['Bonito, mas cadê o argumento?', 'Imagem não é raciocínio.'],
  },
  cetico: {
    ama: ['Isso tem número de verdade. Gostei.', 'Agora sim: uma prova.'],
    gosta: ['Pelo menos o raciocínio é coerente.', 'Faz sentido, vou admitir.'],
    naoGosta: ['Novidade não prova nada.', 'Promessa de futuro? Desconfio.'],
  },
  empatico: {
    ama: ['Pensou em quem vai sentir na pele. Isso importa.', 'Isso toca no que mais importa: as pessoas.'],
    gosta: ['Consegui imaginar. Me tocou.', 'Que imagem bonita.'],
    naoGosta: ['Nem tudo se mede em dinheiro.', 'Falar só de custo é frio demais.'],
  },
  tradicionalista: {
    ama: ['Assim se fez por gerações. Respeito isso.', 'Valorizar o que já funcionou é sabedoria.'],
    gosta: ['Pensar na comunidade é o que sempre nos guiou.', 'As famílias vêm primeiro, como sempre.'],
    naoGosta: ['Estudo novo toda semana... prefiro o que já é sabido.', 'Número muda; costume fica.'],
  },
  estrategista: {
    ama: ['Dá para fazer. Isso é o que conta.', 'Plano claro, fácil de executar.'],
    gosta: ['Conta bem feita. Gosto disso.', 'Barato e eficiente.'],
    naoGosta: ['"Sempre foi assim" não é plano.', 'O passado não resolve o problema de hoje.'],
  },
  cientista: {
    ama: ['Uma ideia nova! Quero testar.', 'Isso nunca foi tentado. Fascinante!'],
    gosta: ['Dados! Adoro dados.', 'Bom, isso dá para medir.'],
    naoGosta: ['Fazer correndo, sem testar antes? Não.', 'Prático demais: cadê o experimento?'],
  },
  comerciante: {
    ama: ['Agora falou a minha língua: quanto custa.', 'Barato e rende. Fechado!'],
    gosta: ['Cliente fiel é o que sempre funcionou.', 'O jeito antigo dá lucro até hoje.'],
    naoGosta: ['Sentimento não fecha a conta.', 'Bonito, mas quem paga?'],
  },
  artista: {
    ama: ['Que cena! Consegui ver tudo.', 'Essa imagem fica na cabeça.'],
    gosta: ['Algo novo, que ousadia!', 'Gosto de ideia diferente.'],
    naoGosta: ['Frio demais, parece uma planilha.', 'Tanta lógica e nenhuma emoção.'],
  },
};

export const FALAS_PRETOR = {
  abertura: 'Ordem no tribunal! Apresentem suas teses.',
  tempoEsgotado: 'Silêncio não é argumento! O tribunal jogou uma carta por você.',
  veredito: 'O júri decidiu. Ouçam o veredito!',
};
