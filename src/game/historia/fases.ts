import type { Fase } from './fase';

/**
 * As fases abertas do modo História. A primeira (teste, 22/11/2026) é a Biblioteca
 * pegando fogo, no capítulo 1 do Cassius: no lugar do antigo "explorar o salão".
 * Três telas: o salão, a ala em chamas e a escada para as catacumbas.
 */
export const FASES: Record<string, Fase> = {
  'biblioteca-em-chamas': {
    id: 'biblioteca-em-chamas',
    telas: ['biblioteca-salao', 'biblioteca-chamas', 'biblioteca-escada'],
    objetivo: 'Salve os livros e chegue à escada das catacumbas. Cuidado com o fogo!',
    plataformas: [
      // Tela 1: o salão (mesas de leitura e uma estante)
      { x: 22, w: 14, y: 8, tipo: 'mesa' },
      { x: 44, w: 12, y: 15, tipo: 'estante' },
      { x: 60, w: 14, y: 8, tipo: 'mesa' },
      { x: 80, w: 12, y: 18, tipo: 'sacada' },
      // Tela 2: a ala em chamas (pule de mesa em mesa por cima do fogo)
      { x: 112, w: 12, y: 9, tipo: 'mesa' },
      { x: 130, w: 10, y: 17, tipo: 'viga' },
      { x: 146, w: 12, y: 10, tipo: 'mesa' },
      { x: 164, w: 10, y: 19, tipo: 'viga' },
      { x: 180, w: 12, y: 9, tipo: 'mesa' },
      // Tela 3: a escada (uma estante alta e a sacada da torre)
      { x: 214, w: 12, y: 10, tipo: 'mesa' },
      { x: 232, w: 10, y: 20, tipo: 'estante' },
      { x: 250, w: 14, y: 11, tipo: 'sacada' },
    ],
    perigos: [
      { x: 38, w: 6, tipo: 'fogo', acesoMs: 1600, apagadoMs: 1400 },
      { x: 104, w: 8, tipo: 'fogo', acesoMs: 0, apagadoMs: 0 },
      { x: 124, w: 22, tipo: 'fogo', acesoMs: 0, apagadoMs: 0 },
      { x: 158, w: 22, tipo: 'fogo', acesoMs: 2200, apagadoMs: 1100, atrasoMs: 500 },
      { x: 194, w: 10, tipo: 'fogo', acesoMs: 1400, apagadoMs: 1400, atrasoMs: 900 },
      { x: 242, w: 8, tipo: 'fogo', acesoMs: 1800, apagadoMs: 1200, atrasoMs: 300 },
    ],
    coletaveis: [
      { id: 'livro-1', x: 50, y: 18, icone: '', nome: 'O Livro das Mil Perguntas' },
      { id: 'livro-2', x: 86, y: 21, icone: '', nome: 'Mapas do Mundo Antigo' },
      { id: 'livro-3', x: 135, y: 20, icone: '', nome: 'Poemas Proibidos' },
      { id: 'livro-4', x: 169, y: 22, icone: '', nome: 'A Guerra das Ideias' },
      { id: 'livro-5', x: 237, y: 23, icone: '', nome: 'O Diário do Guardião Zero' },
    ],
    comentarios: [
      { id: 'janela', x: 30, quem: 'cassius', icone: '', texto: 'Roma lá fora está escura. Só a Biblioteca brilha... de fogo.' },
      { id: 'estatua', x: 70, quem: 'narrador', icone: '', texto: 'A estátua do GUARDIÃO ZERO. Na base: "O escudo certo, na hora certa, vira página de história."' },
      { id: 'chamas', x: 104, quem: 'cassius', texto: 'A ala de história está em chamas! Por cima das mesas, rápido!' },
      { id: 'fogo-pisca', x: 156, quem: 'cassius', texto: 'Esse fogo acende e apaga. Espera ele baixar... e passa!' },
      { id: 'livia', x: 270, quem: 'livia', personagem: 'livia', texto: 'Mestre Cass! Aqui! A porta da escada! Traz os livros!' },
    ],
    saida: { x: 286, rotulo: 'ESCADA DAS CATACUMBAS' },
    precisa: 3,
  },
  // Capítulo 2 do Cassius (22/11/2026): a fuga pelo beco e pelo mercado, de dia. Por cima dos
  // caixotes e dos toldos, desviando dos braseiros dos assados, seguindo os sinais dos Copistas.
  // Os comentários do Cassius são rascunho: o Lucas pode reescrever.
  'fuga-mercado': {
    id: 'fuga-mercado',
    telas: ['beco', 'rua-mercado'],
    objetivo: 'Fuja pelo beco e pelo mercado. Siga os sinais dos Copistas (a pena riscada a carvão).',
    plataformas: [
      // Tela 1: o beco (caixotes empilhados e o toldo de um sapateiro)
      { x: 16, w: 10, y: 8, tipo: 'caixote' },
      { x: 28, w: 8, y: 15, tipo: 'caixote' },
      { x: 44, w: 16, y: 18, tipo: 'toldo' },
      { x: 66, w: 12, y: 9, tipo: 'caixote' },
      { x: 82, w: 14, y: 16, tipo: 'toldo' },
      // Tela 2: o mercado (barracas, caixotes de fruta)
      { x: 104, w: 18, y: 12, tipo: 'toldo' },
      { x: 128, w: 10, y: 8, tipo: 'caixote' },
      { x: 142, w: 16, y: 17, tipo: 'toldo' },
      { x: 166, w: 10, y: 10, tipo: 'caixote' },
    ],
    perigos: [
      { x: 36, w: 6, tipo: 'fogo', acesoMs: 1600, apagadoMs: 1400 },
      { x: 58, w: 6, tipo: 'fogo', acesoMs: 1400, apagadoMs: 1400, atrasoMs: 700 },
      { x: 116, w: 8, tipo: 'fogo', acesoMs: 1800, apagadoMs: 1200, atrasoMs: 300 },
      { x: 156, w: 8, tipo: 'fogo', acesoMs: 0, apagadoMs: 0 },
    ],
    coletaveis: [
      { id: 'pena-1', x: 32, y: 20, icone: 'pagina', nome: 'Sinal dos Copistas' },
      { id: 'pena-2', x: 89, y: 22, icone: 'pagina', nome: 'Sinal dos Copistas' },
      { id: 'pena-3', x: 150, y: 23, icone: 'pagina', nome: 'Sinal dos Copistas' },
    ],
    comentarios: [
      { id: 'pena', x: 26, quem: 'cassius', texto: 'Uma pena riscada a carvão. O sinal dos Copistas. Eles marcam o caminho seguro.' },
      { id: 'braseiro', x: 52, quem: 'cassius', texto: 'Os braseiros dos assados. Por cima dos toldos!' },
      { id: 'mercado', x: 102, quem: 'cassius', texto: 'O mercado. Gente demais para a Guarda ver a gente... por enquanto.' },
    ],
    saida: { x: 194, rotulo: 'PRAÇA DO MERCADO' },
    precisa: 3,
  },
};
