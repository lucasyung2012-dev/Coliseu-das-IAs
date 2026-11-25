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
      // vigas em chamas caindo do teto (a sombra no chão avisa)
      { x: 74, w: 6, tipo: 'queda', figura: 'viga', acesoMs: 500, apagadoMs: 2300, atrasoMs: 200 },
      { x: 150, w: 6, tipo: 'queda', figura: 'viga', acesoMs: 500, apagadoMs: 2100, atrasoMs: 900 },
      { x: 222, w: 6, tipo: 'queda', figura: 'viga', acesoMs: 500, apagadoMs: 1900, atrasoMs: 1400 },
    ],
    coletaveis: [
      { id: 'livro-1', x: 50, y: 28, icone: '', nome: 'O Livro das Mil Perguntas' },
      { id: 'livro-2', x: 86, y: 31, icone: '', nome: 'Mapas do Mundo Antigo' },
      { id: 'livro-3', x: 135, y: 30, icone: '', nome: 'Poemas Proibidos' },
      { id: 'livro-4', x: 169, y: 32, icone: '', nome: 'A Guerra das Ideias' },
      { id: 'livro-5', x: 237, y: 33, icone: '', nome: 'O Diário do Guardião Zero' },
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
      // dois guardas fazendo ronda no chão: passe por cima, pelos toldos
      { x: 40, w: 5, tipo: 'inimigo', figura: 'guarda', acesoMs: 0, apagadoMs: 0, move: { de: 40, ate: 64, ms: 3200 } },
      { x: 120, w: 5, tipo: 'inimigo', figura: 'guarda', acesoMs: 0, apagadoMs: 0, move: { de: 120, ate: 150, ms: 3800 }, atrasoMs: 1200 },
    ],
    coletaveis: [
      { id: 'pena-1', x: 32, y: 28, icone: 'pagina', nome: 'Sinal dos Copistas' },
      { id: 'pena-2', x: 52, y: 31, icone: 'pagina', nome: 'Sinal dos Copistas' },
      { id: 'pena-3', x: 113, y: 25, icone: 'pagina', nome: 'Sinal dos Copistas' },
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
      { x: 28, w: 8, y: 7, tipo: 'pedra', afunda: 900 },
      { x: 40, w: 12, y: 9, tipo: 'sarcofago' },
      { x: 58, w: 8, y: 6, tipo: 'pedra' },
      { x: 70, w: 14, y: 15, tipo: 'viga' },
      { x: 90, w: 8, y: 8, tipo: 'pedra', afunda: 800 },
      { x: 106, w: 8, y: 6, tipo: 'pedra' },
      { x: 120, w: 14, y: 11, tipo: 'sarcofago' },
      { x: 140, w: 8, y: 7, tipo: 'pedra', afunda: 800 },
      { x: 152, w: 12, y: 16, tipo: 'viga' },
      { x: 170, w: 8, y: 8, tipo: 'pedra', afunda: 700 },
      { x: 184, w: 8, y: 5, tipo: 'pedra' },
    ],
    perigos: [
      { x: 22, w: 36, tipo: 'agua', acesoMs: 0, apagadoMs: 0 },
      { x: 86, w: 20, tipo: 'agua', acesoMs: 0, apagadoMs: 0 },
      { x: 132, w: 20, tipo: 'agua', acesoMs: 0, apagadoMs: 0 },
      { x: 166, w: 16, tipo: 'agua', acesoMs: 0, apagadoMs: 0 },
      // os ratos de engrenagem correndo no seco
      { x: 60, w: 4, tipo: 'inimigo', figura: 'rato', acesoMs: 0, apagadoMs: 0, move: { de: 60, ate: 82, ms: 1800 } },
      { x: 108, w: 4, tipo: 'inimigo', figura: 'rato', acesoMs: 0, apagadoMs: 0, move: { de: 108, ate: 128, ms: 1600 }, atrasoMs: 500 },
    ],
    coletaveis: [
      { id: 'pagina-1', x: 77, y: 28, icone: 'pagina', nome: 'Página copiada' },
      { id: 'pagina-2', x: 127, y: 24, icone: 'pagina', nome: 'Página copiada' },
      { id: 'pagina-3', x: 158, y: 29, icone: 'pagina', nome: 'Página copiada' },
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
      // os tomates que jogam dos telhados
      { x: 44, w: 6, tipo: 'queda', figura: 'tomate', acesoMs: 400, apagadoMs: 1800, atrasoMs: 300 },
      { x: 100, w: 6, tipo: 'queda', figura: 'tomate', acesoMs: 400, apagadoMs: 1600, atrasoMs: 1000 },
      { x: 138, w: 6, tipo: 'queda', figura: 'tomate', acesoMs: 400, apagadoMs: 1700, atrasoMs: 600 },
    ],
    coletaveis: [
      { id: 'pergunta-1', x: 57, y: 27, icone: 'pagina', nome: 'Pergunta escrita' },
      { id: 'pergunta-2', x: 96, y: 30, icone: 'pagina', nome: 'Pergunta escrita' },
      { id: 'pergunta-3', x: 151, y: 28, icone: 'pagina', nome: 'Pergunta escrita' },
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
      { x: 40, w: 12, y: 5, tipo: 'barco', move: { dx: 14, ms: 3200 } },
      { x: 64, w: 14, y: 13, tipo: 'toldo' },
      { x: 80, w: 12, y: 6, tipo: 'barco', move: { dx: 12, ms: 2800 } },
      { x: 100, w: 8, y: 11, tipo: 'caixote' },
      { x: 110, w: 12, y: 5, tipo: 'barco', move: { dx: 16, ms: 3400 } },
      { x: 134, w: 12, y: 14, tipo: 'toldo' },
      { x: 148, w: 12, y: 6, tipo: 'barco', move: { dx: 10, ms: 2600 } },
      { x: 164, w: 8, y: 11, tipo: 'caixote' },
      { x: 174, w: 12, y: 5, tipo: 'barco' },
    ],
    perigos: [{ x: 12, w: 174, tipo: 'agua', acesoMs: 0, apagadoMs: 0 }],
    coletaveis: [
      { id: 'rota-1', x: 71, y: 26, icone: 'mapa', nome: 'Pedaço da rota' },
      { id: 'rota-2', x: 104, y: 24, icone: 'mapa', nome: 'Pedaço da rota' },
      { id: 'rota-3', x: 140, y: 27, icone: 'mapa', nome: 'Pedaço da rota' },
      { id: 'rota-4', x: 168, y: 24, icone: 'mapa', nome: 'Pedaço da rota' },
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
      { id: 'corda-1', x: 38, y: 25, icone: 'corda', nome: 'Corda solta' },
      { id: 'corda-2', x: 58, y: 31, icone: 'corda', nome: 'Corda solta' },
      { id: 'corda-3', x: 122, y: 30, icone: 'corda', nome: 'Corda solta' },
      { id: 'corda-4', x: 142, y: 24, icone: 'corda', nome: 'Corda solta' },
    ],
    comentarios: [
      { id: 'ondas', x: 8, quem: 'octavius', texto: 'As ondas lavam o convés. Espera a água baixar!' },
      { id: 'cordas', x: 56, quem: 'octavius', texto: 'Cordas soltas! Sem elas, o mastro cai.' },
      { id: 'proa', x: 172, quem: 'octavius', texto: 'Mais um pouco até a proa.' },
    ],
    saida: { x: 194, rotulo: 'A PROA' },
    precisa: 3,
    vento: { forca: 120, cicloMs: 5200, duraMs: 1600 },
    fim: { coisa: 'CORDAS RECOLHIDAS', todos: 'Todas as cordas. O mastro aguenta.', alguns: 'O mastro range... mas aguenta.' },
  },
  // Capítulo 4 do Octavius (22/11/2026): uma fase para cada caminho até o cofre do Cobrador
  // (telhados, esgoto e feira), recolhendo as moedas que ele tirou do povo. Comentários em rascunho.
  'telhados-subura': {
    id: 'telhados-subura',
    telas: ['subura-telhados', 'subura-telhados'],
    objetivo: 'Pelos telhados até o cofre. Pule os vãos entre as casas e recolha as moedas do povo.',
    plataformas: [
      { x: 10, w: 12, y: 6, tipo: 'sacada' },
      { x: 30, w: 8, y: 12, tipo: 'caixote', afunda: 800 },
      { x: 46, w: 14, y: 8, tipo: 'sacada' },
      { x: 66, w: 10, y: 14, tipo: 'sacada', afunda: 700 },
      { x: 84, w: 8, y: 9, tipo: 'caixote' },
      { x: 100, w: 14, y: 15, tipo: 'sacada' },
      { x: 122, w: 10, y: 8, tipo: 'sacada', afunda: 800 },
      { x: 140, w: 8, y: 13, tipo: 'caixote' },
      { x: 156, w: 14, y: 7, tipo: 'sacada' },
      { x: 176, w: 10, y: 11, tipo: 'sacada', afunda: 900 },
    ],
    perigos: [
      { x: 22, w: 8, tipo: 'vao', acesoMs: 0, apagadoMs: 0 },
      { x: 60, w: 10, tipo: 'vao', acesoMs: 0, apagadoMs: 0 },
      { x: 92, w: 8, tipo: 'vao', acesoMs: 0, apagadoMs: 0 },
      { x: 132, w: 8, tipo: 'vao', acesoMs: 0, apagadoMs: 0 },
      { x: 168, w: 8, tipo: 'vao', acesoMs: 0, apagadoMs: 0 },
      // o gato de ferro correndo no telhado
      { x: 104, w: 4, tipo: 'inimigo', figura: 'gato', acesoMs: 0, apagadoMs: 0, move: { de: 104, ate: 126, ms: 2000 } },
    ],
    coletaveis: [
      { id: 'moeda-1', x: 34, y: 25, icone: 'moeda', nome: 'Moeda do povo' },
      { id: 'moeda-2', x: 71, y: 27, icone: 'moeda', nome: 'Moeda do povo' },
      { id: 'moeda-3', x: 107, y: 28, icone: 'moeda', nome: 'Moeda do povo' },
      { id: 'moeda-4', x: 144, y: 26, icone: 'moeda', nome: 'Moeda do povo' },
    ],
    comentarios: [
      { id: 'vaos', x: 8, quem: 'octavius', texto: 'Telhado em telhado. Cuidado com os vãos!' },
      { id: 'moedas', x: 36, quem: 'octavius', texto: 'Moedas do Cobrador, caídas entre as telhas.' },
    ],
    saida: { x: 194, rotulo: 'TELHADO DO COFRE' },
    precisa: 3,
    fim: { coisa: 'MOEDAS DO POVO', todos: 'Todas as moedas voltam para o povo.', alguns: 'Algumas já voltam para o povo.' },
  },
  'esgoto-subura': {
    id: 'esgoto-subura',
    telas: ['subura-esgoto', 'subura-esgoto'],
    objetivo: 'Pelo esgoto até o cofre. Pedra por pedra sobre a água suja, recolhendo as moedas do povo.',
    plataformas: [
      { x: 20, w: 8, y: 7, tipo: 'caixote' },
      { x: 34, w: 10, y: 12, tipo: 'pedra' },
      { x: 52, w: 8, y: 6, tipo: 'caixote' },
      { x: 88, w: 10, y: 9, tipo: 'pedra', afunda: 900 },
      { x: 104, w: 10, y: 14, tipo: 'pedra' },
      { x: 118, w: 8, y: 7, tipo: 'caixote' },
      { x: 150, w: 10, y: 10, tipo: 'pedra', afunda: 900 },
      { x: 166, w: 8, y: 15, tipo: 'caixote' },
    ],
    perigos: [
      // a enxurrada vem de tempos em tempos
      { x: 30, w: 20, tipo: 'onda', acesoMs: 1800, apagadoMs: 1400 },
      { x: 90, w: 24, tipo: 'onda', acesoMs: 1600, apagadoMs: 1600, atrasoMs: 500 },
      { x: 150, w: 20, tipo: 'onda', acesoMs: 1700, apagadoMs: 1300, atrasoMs: 900 },
      // os jacarés de ferro andando na beira
      { x: 60, w: 5, tipo: 'inimigo', figura: 'jacare', acesoMs: 0, apagadoMs: 0, move: { de: 60, ate: 84, ms: 2600 } },
      { x: 124, w: 5, tipo: 'inimigo', figura: 'jacare', acesoMs: 0, apagadoMs: 0, move: { de: 124, ate: 146, ms: 2400 }, atrasoMs: 800 },
    ],
    coletaveis: [
      { id: 'moeda-1', x: 39, y: 25, icone: 'moeda', nome: 'Moeda do povo' },
      { id: 'moeda-2', x: 109, y: 27, icone: 'moeda', nome: 'Moeda do povo' },
      { id: 'moeda-3', x: 170, y: 28, icone: 'moeda', nome: 'Moeda do povo' },
    ],
    comentarios: [
      { id: 'esgoto', x: 8, quem: 'octavius', texto: 'Água de esgoto. Melhor não cair.' },
      { id: 'moedas', x: 36, quem: 'octavius', texto: 'Moedas! O Cobrador deixou cair pelo caminho.' },
    ],
    saida: { x: 194, rotulo: 'GRADE DO COFRE' },
    precisa: 3,
    fim: { coisa: 'MOEDAS DO POVO', todos: 'Todas as moedas voltam para o povo.', alguns: 'Algumas já voltam para o povo.' },
  },
  'feira-subura': {
    id: 'feira-subura',
    telas: ['subura-mercado', 'subura-mercado'],
    objetivo: 'Pelo meio da feira até o cofre. Por cima das barracas, longe dos braseiros, recolhendo as moedas do povo.',
    plataformas: [
      { x: 18, w: 14, y: 10, tipo: 'toldo' },
      { x: 40, w: 8, y: 6, tipo: 'caixote' },
      { x: 54, w: 16, y: 14, tipo: 'toldo' },
      { x: 80, w: 8, y: 8, tipo: 'caixote' },
      { x: 96, w: 14, y: 12, tipo: 'toldo' },
      { x: 120, w: 16, y: 16, tipo: 'toldo' },
      { x: 146, w: 8, y: 9, tipo: 'caixote' },
      { x: 160, w: 14, y: 13, tipo: 'toldo' },
      { x: 180, w: 8, y: 6, tipo: 'caixote' },
    ],
    perigos: [
      { x: 34, w: 5, tipo: 'fogo', acesoMs: 1500, apagadoMs: 1400 },
      { x: 112, w: 5, tipo: 'fogo', acesoMs: 1600, apagadoMs: 1300, atrasoMs: 600 },
      // barris que um feirante derrubou: rolam a rua inteira (pule!)
      { x: 196, w: 4, tipo: 'inimigo', figura: 'barril', acesoMs: 0, apagadoMs: 0, move: { de: 196, ate: 4, ms: 5200, ida: true } },
      { x: 196, w: 4, tipo: 'inimigo', figura: 'barril', acesoMs: 0, apagadoMs: 0, move: { de: 196, ate: 4, ms: 5200, ida: true }, atrasoMs: 2600 },
    ],
    coletaveis: [
      { id: 'moeda-1', x: 62, y: 27, icone: 'moeda', nome: 'Moeda do povo' },
      { id: 'moeda-2', x: 103, y: 25, icone: 'moeda', nome: 'Moeda do povo' },
      { id: 'moeda-3', x: 128, y: 29, icone: 'moeda', nome: 'Moeda do povo' },
      { id: 'moeda-4', x: 167, y: 26, icone: 'moeda', nome: 'Moeda do povo' },
    ],
    comentarios: [
      { id: 'feira', x: 8, quem: 'octavius', texto: 'No meio da multidão. Cuidado com os braseiros.' },
      { id: 'moedas', x: 36, quem: 'octavius', texto: 'Moedas do povo, caídas da bolsa do Cobrador.' },
    ],
    saida: { x: 194, rotulo: 'PORTA DO COFRE' },
    precisa: 3,
    fim: { coisa: 'MOEDAS DO POVO', todos: 'Todas as moedas voltam para o povo.', alguns: 'Algumas já voltam para o povo.' },
  },
  // Capítulo 5 do Octavius (22/11/2026): a abordagem ao navio do Almirante. Balas de canhão
  // caindo no convés (a sombra avisa), o cordame balançando (pendure e vá junto) e as bandeiras
  // do Olho para arrancar lá no alto. Comentários em rascunho (o Lucas pode reescrever).
  'abordagem': {
    id: 'abordagem',
    telas: ['navio-conves', 'navio-conves'],
    objetivo: 'Atravesse o convés do Almirante. Arranque as bandeiras do Olho lá no alto.',
    plataformas: [
      { x: 14, w: 10, y: 7, tipo: 'caixote' },
      { x: 30, w: 10, y: 13, tipo: 'cordame', move: { dx: 14, ms: 2600 } },
      { x: 58, w: 14, y: 9, tipo: 'sacada' },
      { x: 76, w: 10, y: 16, tipo: 'viga' },
      { x: 94, w: 10, y: 11, tipo: 'cordame', move: { dx: 12, ms: 2400 } },
      { x: 118, w: 8, y: 6, tipo: 'caixote' },
      { x: 130, w: 14, y: 12, tipo: 'sacada' },
      { x: 150, w: 10, y: 18, tipo: 'viga' },
      { x: 164, w: 10, y: 10, tipo: 'cordame', move: { dx: 10, ms: 2200 } },
      { x: 180, w: 10, y: 7, tipo: 'caixote' },
    ],
    perigos: [
      { x: 44, w: 6, tipo: 'queda', figura: 'bala', acesoMs: 500, apagadoMs: 1900, atrasoMs: 300 },
      { x: 88, w: 6, tipo: 'queda', figura: 'bala', acesoMs: 500, apagadoMs: 1700, atrasoMs: 1100 },
      { x: 124, w: 6, tipo: 'queda', figura: 'bala', acesoMs: 500, apagadoMs: 1600, atrasoMs: 700 },
      { x: 168, w: 6, tipo: 'queda', figura: 'bala', acesoMs: 500, apagadoMs: 1500, atrasoMs: 200 },
      // um marujo de ferro fazendo ronda no convés
      { x: 100, w: 5, tipo: 'inimigo', figura: 'guarda', acesoMs: 0, apagadoMs: 0, move: { de: 100, ate: 116, ms: 2600 } },
    ],
    coletaveis: [
      { id: 'bandeira-1', x: 81, y: 29, icone: 'bandeira', nome: 'Bandeira do Olho' },
      { id: 'bandeira-2', x: 137, y: 25, icone: 'bandeira', nome: 'Bandeira do Olho' },
      { id: 'bandeira-3', x: 155, y: 31, icone: 'bandeira', nome: 'Bandeira do Olho' },
    ],
    comentarios: [
      { id: 'canhao', x: 8, quem: 'octavius', texto: 'Balas de canhão! Olha a sombra no convés.' },
      { id: 'cordame', x: 28, quem: 'octavius', texto: 'O cordame balança. Pula na hora certa e vai junto.' },
      { id: 'popa', x: 176, quem: 'octavius', texto: 'A popa. O Almirante está ali.' },
    ],
    saida: { x: 194, rotulo: 'A POPA' },
    precisa: 3,
    fim: { coisa: 'BANDEIRAS ARRANCADAS', todos: 'Nenhum Olho no navio. Ele agora é nosso.', alguns: 'O bastante para a tripulação saber quem manda.' },
  },
  // Capítulo 6 do Octavius (22/11/2026): a Naumaquia. A arena inundada, de destroço em
  // destroço (alguns afundam), pelos cascos dos navios afundados, e os TENTÁCULOS do Leviatã
  // subindo da água (pegam até quem pula baixo: espere descerem). A plateia joga estrelas de
  // pano para quem passa. Comentários em rascunho (o Lucas pode reescrever).
  'naumaquia': {
    id: 'naumaquia',
    telas: ['coliseu-inundado', 'coliseu-inundado'],
    objetivo: 'Atravesse a arena inundada. Cuidado com os tentáculos! Pegue as estrelas que a plateia joga.',
    plataformas: [
      { x: 12, w: 10, y: 5, tipo: 'barco' },
      { x: 28, w: 8, y: 8, tipo: 'caixote', afunda: 900 },
      { x: 42, w: 16, y: 11, tipo: 'barco' },
      { x: 64, w: 8, y: 7, tipo: 'caixote', afunda: 800 },
      { x: 78, w: 10, y: 16, tipo: 'viga' },
      { x: 94, w: 14, y: 6, tipo: 'barco' },
      { x: 114, w: 8, y: 11, tipo: 'caixote', afunda: 800 },
      { x: 128, w: 16, y: 14, tipo: 'barco' },
      { x: 150, w: 8, y: 7, tipo: 'caixote', afunda: 700 },
      { x: 164, w: 10, y: 17, tipo: 'viga' },
      { x: 180, w: 10, y: 6, tipo: 'barco' },
    ],
    perigos: [
      { x: 10, w: 180, tipo: 'agua', acesoMs: 0, apagadoMs: 0 },
      { x: 36, w: 6, tipo: 'queda', figura: 'tentaculo', altura: 15, acesoMs: 900, apagadoMs: 2200, atrasoMs: 400 },
      { x: 88, w: 6, tipo: 'queda', figura: 'tentaculo', altura: 15, acesoMs: 900, apagadoMs: 2000, atrasoMs: 1300 },
      { x: 144, w: 6, tipo: 'queda', figura: 'tentaculo', altura: 15, acesoMs: 900, apagadoMs: 1800, atrasoMs: 700 },
    ],
    coletaveis: [
      { id: 'estrela-1', x: 50, y: 24, icone: 'estrela', nome: 'Estrela da plateia' },
      { id: 'estrela-2', x: 83, y: 29, icone: 'estrela', nome: 'Estrela da plateia' },
      { id: 'estrela-3', x: 136, y: 27, icone: 'estrela', nome: 'Estrela da plateia' },
      { id: 'estrela-4', x: 169, y: 30, icone: 'estrela', nome: 'Estrela da plateia' },
    ],
    comentarios: [
      { id: 'arena', x: 6, quem: 'octavius', texto: 'A arena virou mar. Destroço por destroço.' },
      { id: 'tentaculo', x: 30, quem: 'octavius', texto: 'Tentáculo! Espera ele descer antes de passar.' },
      { id: 'fim', x: 176, quem: 'octavius', texto: 'Lá na frente, o portão das galés.' },
    ],
    saida: { x: 194, rotulo: 'O PORTÃO DAS GALÉS' },
    precisa: 3,
    fim: { coisa: 'ESTRELAS DA PLATEIA', todos: 'A plateia inteira grita o seu nome.', alguns: 'Metade da plateia já está do seu lado.' },
  },
  // ===== O CAMINHO DO HELIOS (22/11/2026): cinco fases, cada uma com uma mecânica só dele. =====
  // Capítulo 1: a cúpula do Observatório. PASSARELAS DE LUZ que acendem e apagam, o chão em chamas.
  'cupula-observatorio': {
    id: 'cupula-observatorio',
    telas: ['observatorio-dentro', 'observatorio-ataque', 'observatorio-ataque'],
    objetivo: 'Atravesse a cúpula pelas passarelas de luz e salve os mapas do céu.',
    plataformas: [
      // 24/11/2026: mais justa (simulação: os jogadores paravam no meio). Passarelas acesas por mais
      // tempo e mais largas, e uma sacada firme no meio do fogo para respirar.
      { x: 20, w: 16, y: 8, tipo: 'mesa' },
      { x: 44, w: 14, y: 14, tipo: 'luz', pisca: { acesoMs: 2600, apagadoMs: 1000 } },
      { x: 66, w: 14, y: 20, tipo: 'luz', pisca: { acesoMs: 2600, apagadoMs: 1000, atrasoMs: 700 } },
      { x: 88, w: 16, y: 12, tipo: 'sacada' },
      { x: 112, w: 14, y: 9, tipo: 'luz', pisca: { acesoMs: 2400, apagadoMs: 1200 } },
      { x: 132, w: 14, y: 16, tipo: 'sacada' },
      { x: 152, w: 12, y: 22, tipo: 'luz', pisca: { acesoMs: 2400, apagadoMs: 1200, atrasoMs: 900 } },
      { x: 174, w: 18, y: 14, tipo: 'sacada' },
      { x: 200, w: 12, y: 10, tipo: 'luz', pisca: { acesoMs: 2200, apagadoMs: 1200 } },
      { x: 220, w: 12, y: 10, tipo: 'luz', pisca: { acesoMs: 2200, apagadoMs: 1200, atrasoMs: 1100 } },
      { x: 240, w: 12, y: 16, tipo: 'luz', pisca: { acesoMs: 2200, apagadoMs: 1200 } },
      { x: 262, w: 16, y: 9, tipo: 'mesa' },
    ],
    perigos: [
      { x: 38, w: 48, tipo: 'fogo', acesoMs: 0, apagadoMs: 0 },
      { x: 106, w: 66, tipo: 'fogo', acesoMs: 0, apagadoMs: 0 },
      { x: 194, w: 66, tipo: 'fogo', acesoMs: 2000, apagadoMs: 1600 },
    ],
    coletaveis: [
      { id: 'mapa-1', x: 72, y: 32, icone: 'mapa', nome: 'Mapa do céu' },
      { id: 'mapa-2', x: 94, y: 24, icone: 'mapa', nome: 'Mapa do céu' },
      { id: 'mapa-3', x: 158, y: 34, icone: 'mapa', nome: 'Mapa do céu' },
      { id: 'mapa-4', x: 246, y: 28, icone: 'mapa', nome: 'Mapa do céu' },
    ],
    comentarios: [
      { id: 'cupula', x: 6, quem: 'helios', texto: 'As passarelas de luz da cúpula! Acendem e apagam: pule quando acenderem.' },
      { id: 'fogo', x: 100, quem: 'helios', texto: 'Os pretorianos puseram fogo no chão. Lá embaixo não dá.' },
      { id: 'fim', x: 280, quem: 'helios', texto: 'A escada da torre. A lente está lá em cima.' },
    ],
    saida: { x: 292, rotulo: 'A ESCADA DA TORRE' },
    precisa: 3,
    fim: { coisa: 'MAPAS DO CÉU SALVOS', todos: 'Todos os mapas do céu! O Lumen ia sorrir.', alguns: 'Alguns mapas queimaram... mas o céu continua lá em cima.' },
  },
  // Capítulo 2: os telhados no ESCURO. Só se vê em volta do Helios; cada lanterna acesa fica brilhando.
  'telhados-escuros': {
    id: 'telhados-escuros',
    telas: ['telhados-noite', 'telhados-noite', 'telhados-noite'],
    objetivo: 'Atravesse os telhados no escuro e acenda as lanternas pelo caminho.',
    // 24/11/2026: refeita (o Lucas travou aqui). Cada vão tem chão seguro antes e depois, as
    // patrulhas andam só no meio dos trechos (com um telhado por cima para passar sem ser
    // visto) e a luz em volta do Helios é maior.
    escuro: { raio: 27 },
    // Um pulo inteiro cobre uns 30: por isso há 24 de chão livre entre cada vão e cada patrulha.
    plataformas: [
      { x: 62, w: 16, y: 9, tipo: 'telhado' },
      { x: 130, w: 16, y: 11, tipo: 'telhado' },
      { x: 204, w: 16, y: 10, tipo: 'telhado' },
      { x: 268, w: 14, y: 11, tipo: 'telhado' },
    ],
    perigos: [
      { x: 40, w: 14, tipo: 'vao', acesoMs: 0, apagadoMs: 0 },
      { x: 92, w: 14, tipo: 'vao', acesoMs: 0, apagadoMs: 0 },
      { x: 170, w: 14, tipo: 'vao', acesoMs: 0, apagadoMs: 0 },
      { x: 244, w: 14, tipo: 'vao', acesoMs: 0, apagadoMs: 0 },
      { x: 134, w: 6, tipo: 'inimigo', figura: 'guarda', move: { de: 134, ate: 140, ms: 3200 }, acesoMs: 0, apagadoMs: 0 },
      { x: 208, w: 6, tipo: 'inimigo', figura: 'gato', move: { de: 208, ate: 214, ms: 2200 }, acesoMs: 0, apagadoMs: 0 },
    ],
    coletaveis: [
      { id: 'lanterna-1', x: 68, y: 20, icone: 'vela', nome: 'Lanterna' },
      { id: 'lanterna-2', x: 138, y: 22, icone: 'vela', nome: 'Lanterna' },
      { id: 'lanterna-3', x: 212, y: 22, icone: 'vela', nome: 'Lanterna' },
      { id: 'lanterna-4', x: 275, y: 22, icone: 'vela', nome: 'Lanterna' },
    ],
    comentarios: [
      { id: 'escuro', x: 6, quem: 'helios', texto: 'Escuro total. Cada lanterna que eu acender fica acesa.' },
      { id: 'vao', x: 32, quem: 'helios', texto: 'Cuidado com os vãos entre os telhados!' },
      { id: 'guarda', x: 112, quem: 'helios', texto: 'Os guardas nunca olham para cima. Passo por cima deles, pelo telhado.' },
      { id: 'fim', x: 280, quem: 'helios', texto: 'O Caçador está perto. Dá para sentir.' },
    ],
    saida: { x: 292, rotulo: 'O TELHADO DO CAÇADOR' },
    precisa: 3,
    fim: { coisa: 'LANTERNAS ACESAS', todos: 'Os telhados inteiros brilham. Nenhuma sombra para se esconder.', alguns: 'Um caminho de luz atrás de você. Já é alguma coisa.' },
  },
  // Capítulo 4: o canal do aqueduto. A ENCHENTE: a comporta abre e a água sobe até os arcos baixos.
  'canal-aqueduto': {
    id: 'canal-aqueduto',
    telas: ['aqueduto', 'aqueduto', 'aqueduto'],
    objetivo: 'Atravesse o canal pelos arcos. Quando a comporta abrir, suba nos arcos altos!',
    plataformas: [
      { x: 22, w: 14, y: 7, tipo: 'arco' },
      { x: 40, w: 10, y: 16, tipo: 'arco' },
      { x: 56, w: 14, y: 7, tipo: 'arco' },
      { x: 78, w: 12, y: 8, tipo: 'arco' },
      { x: 94, w: 10, y: 17, tipo: 'arco' },
      { x: 110, w: 16, y: 7, tipo: 'arco' },
      { x: 132, w: 12, y: 8, tipo: 'pedra', move: { dx: 20, ms: 3000 } },
      { x: 170, w: 10, y: 16, tipo: 'arco' },
      { x: 186, w: 14, y: 8, tipo: 'arco' },
      { x: 208, w: 12, y: 7, tipo: 'arco' },
      { x: 224, w: 10, y: 16, tipo: 'arco' },
      { x: 240, w: 14, y: 8, tipo: 'arco' },
      { x: 262, w: 14, y: 7, tipo: 'arco' },
    ],
    perigos: [{ x: 20, w: 260, tipo: 'agua', sobe: { altura: 12, cicloMs: 7000, duraMs: 2500 }, acesoMs: 0, apagadoMs: 0 }],
    coletaveis: [
      { id: 'engrenagem-1', x: 45, y: 28, icone: 'engrenagem', nome: 'Engrenagem da comporta' },
      { id: 'engrenagem-2', x: 99, y: 29, icone: 'engrenagem', nome: 'Engrenagem da comporta' },
      { id: 'engrenagem-3', x: 175, y: 28, icone: 'engrenagem', nome: 'Engrenagem da comporta' },
      { id: 'engrenagem-4', x: 229, y: 28, icone: 'engrenagem', nome: 'Engrenagem da comporta' },
    ],
    comentarios: [
      { id: 'canal', x: 6, quem: 'helios', texto: 'Quando a comporta abrir, a água sobe. Os arcos altos são o lugar seguro.' },
      { id: 'pedra', x: 122, quem: 'helios', texto: 'Essa pedra anda com a correnteza. Espere ela vir.' },
      { id: 'fim', x: 284, quem: 'helios', texto: 'A casa das comportas. O Guardião mora ali.' },
    ],
    saida: { x: 292, rotulo: 'A CASA DAS COMPORTAS' },
    precisa: 3,
    fim: { coisa: 'ENGRENAGENS DA COMPORTA', todos: 'Com todas as engrenagens, o aqueduto obedece de novo.', alguns: 'Faltou engrenagem... a água vai continuar teimosa.' },
  },
  // Capítulo 5: o templo das VISÕES. A fumaça do oráculo troca esquerda e direita; altares rachados.
  'templo-visoes': {
    id: 'templo-visoes',
    telas: ['templo-apolo', 'templo-oraculo', 'templo-oraculo'],
    objetivo: 'Atravesse o templo. Na visão (tela roxa), esquerda vira direita!',
    visao: { cicloMs: 6000, duraMs: 2200 },
    plataformas: [
      { x: 24, w: 14, y: 9, tipo: 'altar' },
      { x: 46, w: 10, y: 15, tipo: 'altar', afunda: 900 },
      { x: 66, w: 14, y: 10, tipo: 'altar' },
      { x: 96, w: 12, y: 14, tipo: 'altar' },
      { x: 116, w: 10, y: 20, tipo: 'altar', afunda: 800 },
      { x: 136, w: 16, y: 11, tipo: 'altar' },
      { x: 170, w: 12, y: 9, tipo: 'altar' },
      { x: 190, w: 10, y: 15, tipo: 'altar', afunda: 800 },
      { x: 210, w: 14, y: 20, tipo: 'altar' },
      { x: 236, w: 14, y: 12, tipo: 'altar' },
      { x: 262, w: 12, y: 8, tipo: 'altar' },
    ],
    perigos: [
      { x: 40, w: 22, tipo: 'fogo', acesoMs: 1800, apagadoMs: 1400 },
      { x: 84, w: 10, tipo: 'fogo', acesoMs: 1200, apagadoMs: 1200, atrasoMs: 600 },
      { x: 154, w: 14, tipo: 'fogo', acesoMs: 1600, apagadoMs: 1400, atrasoMs: 300 },
      { x: 226, w: 8, tipo: 'fogo', acesoMs: 1400, apagadoMs: 1200 },
      { x: 250, w: 10, tipo: 'fogo', acesoMs: 1500, apagadoMs: 1300, atrasoMs: 700 },
    ],
    coletaveis: [
      { id: 'profecia-1', x: 50, y: 27, icone: 'pagina', nome: 'Profecia verdadeira' },
      { id: 'profecia-2', x: 120, y: 31, icone: 'pagina', nome: 'Profecia verdadeira' },
      { id: 'profecia-3', x: 140, y: 23, icone: 'pagina', nome: 'Profecia verdadeira' },
      { id: 'profecia-4', x: 214, y: 32, icone: 'pagina', nome: 'Profecia verdadeira' },
    ],
    comentarios: [
      { id: 'visao', x: 6, quem: 'helios', texto: 'A fumaça do oráculo dá visões. Quando ficar tudo roxo, esquerda vira direita!' },
      { id: 'altar', x: 40, quem: 'helios', texto: 'Esses altares estão rachados. Não dá para ficar parado em cima.' },
      { id: 'fim', x: 280, quem: 'helios', texto: 'O Sumo Sacerdote está logo ali.' },
    ],
    saida: { x: 292, rotulo: 'O SALÃO DO SUMO SACERDOTE' },
    precisa: 3,
    fim: { coisa: 'PROFECIAS VERDADEIRAS', todos: 'Todas as profecias verdadeiras. A Sibila vai lembrar quem era.', alguns: 'Algumas profecias se perderam na fumaça.' },
  },
  // Capítulo 6: o Coliseu do eclipse. ESCURO, passarelas de luz e pedaços do eclipse caindo.
  'coliseu-do-eclipse': {
    id: 'coliseu-do-eclipse',
    telas: ['coliseu-eclipse', 'coliseu-eclipse', 'coliseu-eclipse'],
    objetivo: 'Atravesse a arena no escuro. Cada espelho que você pegar reflete luz.',
    escuro: { raio: 24 },
    plataformas: [
      { x: 20, w: 14, y: 8, tipo: 'pedra' },
      { x: 42, w: 12, y: 14, tipo: 'luz', pisca: { acesoMs: 2000, apagadoMs: 1400 } },
      { x: 62, w: 16, y: 10, tipo: 'pedra' },
      // 24/11/2026: mais justa (simulação). Vãos menores, passarelas mais tempo acesas e uma pedra firme no alto.
      { x: 86, w: 12, y: 16, tipo: 'luz', pisca: { acesoMs: 2200, apagadoMs: 1000, atrasoMs: 800 } },
      { x: 106, w: 12, y: 22, tipo: 'pedra' },
      { x: 128, w: 16, y: 13, tipo: 'pedra' },
      { x: 152, w: 12, y: 9, tipo: 'luz', pisca: { acesoMs: 2000, apagadoMs: 1000 } },
      { x: 172, w: 12, y: 15, tipo: 'luz', pisca: { acesoMs: 2000, apagadoMs: 1000, atrasoMs: 700 } },
      { x: 194, w: 16, y: 11, tipo: 'pedra' },
      { x: 218, w: 12, y: 18, tipo: 'luz', pisca: { acesoMs: 2200, apagadoMs: 1000 } },
      { x: 240, w: 16, y: 11, tipo: 'pedra' },
      { x: 262, w: 12, y: 8, tipo: 'luz', pisca: { acesoMs: 1500, apagadoMs: 1500, atrasoMs: 400 } },
    ],
    perigos: [
      { x: 96, w: 22, tipo: 'vao', acesoMs: 0, apagadoMs: 0 },
      { x: 158, w: 24, tipo: 'vao', acesoMs: 0, apagadoMs: 0 },
      { x: 220, w: 16, tipo: 'vao', acesoMs: 0, apagadoMs: 0 },
      { x: 70, w: 8, tipo: 'queda', figura: 'meteoro', altura: 14, acesoMs: 1200, apagadoMs: 2600 },
      { x: 136, w: 8, tipo: 'queda', figura: 'meteoro', altura: 14, acesoMs: 1200, apagadoMs: 2400, atrasoMs: 900 },
      { x: 200, w: 8, tipo: 'queda', figura: 'meteoro', altura: 14, acesoMs: 1100, apagadoMs: 2200, atrasoMs: 400 },
      { x: 250, w: 8, tipo: 'queda', figura: 'meteoro', altura: 14, acesoMs: 1000, apagadoMs: 2000, atrasoMs: 1300 },
    ],
    coletaveis: [
      { id: 'espelho-1', x: 112, y: 34, icone: 'espelho', nome: 'Espelho do Lumen' },
      { id: 'espelho-2', x: 134, y: 25, icone: 'espelho', nome: 'Espelho do Lumen' },
      { id: 'espelho-3', x: 178, y: 27, icone: 'espelho', nome: 'Espelho do Lumen' },
      { id: 'espelho-4', x: 224, y: 30, icone: 'espelho', nome: 'Espelho do Lumen' },
    ],
    comentarios: [
      { id: 'eclipse', x: 6, quem: 'helios', texto: 'O eclipse apagou o Coliseu. Cada espelho que eu pegar reflete luz.' },
      { id: 'pedras', x: 58, quem: 'helios', texto: 'Pedaços do eclipse caindo! Olhe a sombra no chão.' },
      { id: 'fim', x: 284, quem: 'helios', texto: 'O Gigante das Sombras está esperando.' },
    ],
    saida: { x: 292, rotulo: 'O CENTRO DA ARENA' },
    precisa: 3,
    fim: { coisa: 'ESPELHOS DO LUMEN', todos: 'Todos os espelhos! O Coliseu inteiro brilha.', alguns: 'Poucos espelhos... mas cada um é um pedaço de sol.' },
  },
};
