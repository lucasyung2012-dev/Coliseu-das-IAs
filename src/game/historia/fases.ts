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
    fim: { coisa: 'SINAIS DOS COPISTAS', todos: 'Todos os sinais. O caminho está claro.', alguns: 'O bastante para não se perder.' },
  },
  // Capítulo 4 do Cassius (22/11/2026): os túneis alagados das catacumbas, logo depois da
  // descida. Água funda e gelada, pedras, tampas de sarcófago e vigas; as páginas que os
  // Copistas esconderam entre os ossos. A segunda tela é a primeira espelhada (não repete).
  // Os comentários do Cassius são rascunho: o Lucas pode reescrever.
  'tuneis-alagados': {
    id: 'tuneis-alagados',
    telas: ['catacumbas', 'catacumbas'],
    objetivo: 'Atravesse os túneis alagados de pedra em pedra. Recolha as páginas dos Copistas.',
    plataformas: [
      { x: 14, w: 8, y: 5, tipo: 'pedra' },
      { x: 28, w: 8, y: 7, tipo: 'pedra' },
      { x: 40, w: 12, y: 9, tipo: 'sarcofago' },
      { x: 58, w: 8, y: 6, tipo: 'pedra' },
      { x: 70, w: 14, y: 15, tipo: 'viga' },
      { x: 90, w: 8, y: 8, tipo: 'pedra' },
      { x: 106, w: 8, y: 6, tipo: 'pedra' },
      { x: 120, w: 14, y: 10, tipo: 'sarcofago' },
      { x: 140, w: 8, y: 7, tipo: 'pedra' },
      { x: 152, w: 12, y: 16, tipo: 'viga' },
      { x: 170, w: 8, y: 8, tipo: 'pedra' },
      { x: 184, w: 8, y: 5, tipo: 'pedra' },
    ],
    perigos: [
      { x: 22, w: 36, tipo: 'agua', acesoMs: 0, apagadoMs: 0 },
      { x: 86, w: 20, tipo: 'agua', acesoMs: 0, apagadoMs: 0 },
      { x: 132, w: 20, tipo: 'agua', acesoMs: 0, apagadoMs: 0 },
      { x: 166, w: 16, tipo: 'agua', acesoMs: 0, apagadoMs: 0 },
    ],
    coletaveis: [
      { id: 'pagina-1', x: 46, y: 14, icone: 'pagina', nome: 'Página copiada' },
      { id: 'pagina-2', x: 77, y: 20, icone: 'pagina', nome: 'Página copiada' },
      { id: 'pagina-3', x: 158, y: 21, icone: 'pagina', nome: 'Página copiada' },
      { id: 'pagina-4', x: 188, y: 10, icone: 'pagina', nome: 'Página copiada' },
    ],
    comentarios: [
      { id: 'agua', x: 10, quem: 'cassius', texto: 'A água aqui embaixo é funda e gelada. Pedra por pedra.' },
      { id: 'pagina', x: 44, quem: 'cassius', texto: 'Uma página copiada a carvão, presa entre os ossos. Os Copistas passaram por aqui.' },
      { id: 'patinhas', x: 120, quem: 'cassius', texto: 'Patinhas de metal no escuro... Rápido.' },
    ],
    saida: { x: 196, rotulo: 'FUNDO DO TÚNEL' },
    precisa: 3,
    fim: { coisa: 'PÁGINAS RECOLHIDAS', todos: 'Todas as páginas, secas e inteiras.', alguns: 'As outras ficaram com a água... mas estas estão salvas.' },
  },
  // Capítulo 5 do Cassius (22/11/2026): abrindo caminho pelo Fórum até a tribuna, antes da
  // leitura. Por cima das barracas e dos degraus dos templos, desviando dos incensários acesos;
  // o povo escondeu perguntas escritas em papel pelo caminho. Comentários em rascunho.
  'caminho-tribuna': {
    id: 'caminho-tribuna',
    telas: ['forum', 'forum'],
    objetivo: 'Abra caminho até a tribuna. Recolha as perguntas que o povo escondeu pelo Fórum.',
    plataformas: [
      { x: 14, w: 16, y: 9, tipo: 'toldo' },
      { x: 34, w: 14, y: 6, tipo: 'sacada' },
      { x: 52, w: 10, y: 14, tipo: 'sacada' },
      { x: 68, w: 16, y: 9, tipo: 'toldo' },
      { x: 90, w: 12, y: 17, tipo: 'sacada' },
      { x: 108, w: 16, y: 10, tipo: 'toldo' },
      { x: 130, w: 10, y: 6, tipo: 'caixote' },
      { x: 144, w: 14, y: 15, tipo: 'sacada' },
      { x: 164, w: 16, y: 8, tipo: 'toldo' },
    ],
    perigos: [
      { x: 30, w: 6, tipo: 'fogo', acesoMs: 1500, apagadoMs: 1500 },
      { x: 62, w: 6, tipo: 'fogo', acesoMs: 1500, apagadoMs: 1300, atrasoMs: 600 },
      { x: 124, w: 6, tipo: 'fogo', acesoMs: 1700, apagadoMs: 1200, atrasoMs: 300 },
      { x: 158, w: 6, tipo: 'fogo', acesoMs: 0, apagadoMs: 0 },
    ],
    coletaveis: [
      { id: 'pergunta-1', x: 57, y: 19, icone: 'pagina', nome: 'Pergunta escrita' },
      { id: 'pergunta-2', x: 96, y: 22, icone: 'pagina', nome: 'Pergunta escrita' },
      { id: 'pergunta-3', x: 150, y: 20, icone: 'pagina', nome: 'Pergunta escrita' },
      { id: 'pergunta-4', x: 172, y: 13, icone: 'pagina', nome: 'Pergunta escrita' },
    ],
    comentarios: [
      { id: 'papel', x: 20, quem: 'cassius', texto: 'Papeizinhos dobrados entre as barracas. Perguntas! O povo escreveu e escondeu.' },
      { id: 'incenso', x: 60, quem: 'cassius', texto: 'Os incensários dos templos. Espere a brasa baixar.' },
      { id: 'tribuna', x: 170, quem: 'cassius', texto: 'A tribuna. Daqui ninguém chega na Lívia.' },
    ],
    saida: { x: 194, rotulo: 'A TRIBUNA' },
    precisa: 3,
    fim: { coisa: 'PERGUNTAS DO POVO', todos: 'Todas. Hoje elas vão ser lidas.', alguns: 'As outras, o povo vai ter coragem de dizer em voz alta.' },
  },
  // Capítulo 1 do Octavius (22/11/2026): o alarme tocou e a fuga é pelos barcos do porto, de
  // barco em barco (eles balançam) e de caixote em caixote, até o Esperança. Os pedaços da rota
  // de fuga caíram pelo caminho. Comentários em rascunho (o Lucas pode reescrever).
  'fuga-pelos-barcos': {
    id: 'fuga-pelos-barcos',
    telas: ['porto-docas', 'porto-docas'],
    objetivo: 'O alarme tocou! Fuja pelos barcos até o Esperança. Recolha os pedaços da rota.',
    plataformas: [
      { x: 14, w: 12, y: 5, tipo: 'barco' },
      { x: 30, w: 8, y: 9, tipo: 'caixote' },
      { x: 42, w: 14, y: 5, tipo: 'barco' },
      { x: 60, w: 14, y: 13, tipo: 'toldo' },
      { x: 80, w: 12, y: 6, tipo: 'barco' },
      { x: 96, w: 8, y: 10, tipo: 'caixote' },
      { x: 108, w: 14, y: 5, tipo: 'barco' },
      { x: 126, w: 12, y: 14, tipo: 'toldo' },
      { x: 142, w: 12, y: 6, tipo: 'barco' },
      { x: 160, w: 8, y: 10, tipo: 'caixote' },
      { x: 172, w: 14, y: 5, tipo: 'barco' },
    ],
    perigos: [{ x: 12, w: 174, tipo: 'agua', acesoMs: 0, apagadoMs: 0 }],
    coletaveis: [
      { id: 'rota-1', x: 34, y: 14, icone: 'mapa', nome: 'Pedaço da rota' },
      { id: 'rota-2', x: 67, y: 18, icone: 'mapa', nome: 'Pedaço da rota' },
      { id: 'rota-3', x: 132, y: 19, icone: 'mapa', nome: 'Pedaço da rota' },
      { id: 'rota-4', x: 164, y: 15, icone: 'mapa', nome: 'Pedaço da rota' },
    ],
    comentarios: [
      { id: 'alarme', x: 6, quem: 'octavius', texto: 'O alarme tocou. Pelos barcos até o Esperança!' },
      { id: 'rota', x: 32, quem: 'octavius', texto: 'Um pedaço do mapa da rota. Caiu do meu bolso na correria.' },
      { id: 'esperanca', x: 168, quem: 'octavius', texto: 'O Esperança está logo ali.' },
    ],
    saida: { x: 194, rotulo: 'O ESPERANÇA' },
    precisa: 3,
    fim: { coisa: 'PEDAÇOS DA ROTA', todos: 'A rota inteira. Plano completo.', alguns: 'O resto, dá para improvisar.' },
  },
  // Capítulo 2 do Octavius (22/11/2026): o convés da galera na tempestade. As ondas varrem o
  // convés e voltam (espere baixar); barris, o castelo da popa e as vergas do mastro para
  // subir; as cordas soltas para recolher. Comentários em rascunho (o Lucas pode reescrever).
  'conves-tempestade': {
    id: 'conves-tempestade',
    telas: ['galera-tempestade', 'galera-tempestade'],
    objetivo: 'Atravesse o convés na tempestade. Espere as ondas baixarem e recolha as cordas soltas.',
    plataformas: [
      { x: 16, w: 8, y: 8, tipo: 'caixote' },
      { x: 30, w: 16, y: 12, tipo: 'sacada' },
      { x: 52, w: 12, y: 18, tipo: 'viga' },
      { x: 70, w: 8, y: 8, tipo: 'caixote' },
      { x: 84, w: 14, y: 11, tipo: 'sacada' },
      { x: 104, w: 8, y: 8, tipo: 'caixote' },
      { x: 116, w: 12, y: 17, tipo: 'viga' },
      { x: 134, w: 16, y: 11, tipo: 'sacada' },
      { x: 156, w: 8, y: 8, tipo: 'caixote' },
      { x: 168, w: 12, y: 16, tipo: 'viga' },
    ],
    perigos: [
      { x: 24, w: 6, tipo: 'onda', acesoMs: 1400, apagadoMs: 1600 },
      { x: 46, w: 24, tipo: 'onda', acesoMs: 1800, apagadoMs: 1600, atrasoMs: 400 },
      { x: 98, w: 6, tipo: 'onda', acesoMs: 1200, apagadoMs: 1400, atrasoMs: 700 },
      { x: 150, w: 18, tipo: 'onda', acesoMs: 1800, apagadoMs: 1500, atrasoMs: 900 },
    ],
    coletaveis: [
      { id: 'corda-1', x: 58, y: 23, icone: 'corda', nome: 'Corda solta' },
      { id: 'corda-2', x: 91, y: 16, icone: 'corda', nome: 'Corda solta' },
      { id: 'corda-3', x: 122, y: 22, icone: 'corda', nome: 'Corda solta' },
      { id: 'corda-4', x: 174, y: 21, icone: 'corda', nome: 'Corda solta' },
    ],
    comentarios: [
      { id: 'ondas', x: 8, quem: 'octavius', texto: 'As ondas lavam o convés. Espera a água baixar!' },
      { id: 'cordas', x: 56, quem: 'octavius', texto: 'Cordas soltas! Sem elas, o mastro cai.' },
      { id: 'proa', x: 172, quem: 'octavius', texto: 'Mais um pouco até a proa.' },
    ],
    saida: { x: 194, rotulo: 'A PROA' },
    precisa: 3,
    fim: { coisa: 'CORDAS RECOLHIDAS', todos: 'Todas as cordas. O mastro aguenta.', alguns: 'O mastro range... mas aguenta.' },
  },
};
