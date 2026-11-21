import type { IaId } from '../personagens';

/**
 * Saves do modo História (docs/HISTORIA.md). Quantos o jogador quiser; cada save é
 * uma história com um gladiador. Ficam dentro do Progresso, então vão junto com a
 * conta do Dropbox. O jogo salva sozinho no começo de cada cena.
 */
export interface SaveHistoria {
  id: string;
  gladiador: IaId;
  /** Capítulo atual (1 a 6) e a cena dentro dele (índice no roteiro do capítulo). */
  capitulo: number;
  cena: number;
  /** Capítulos terminados. */
  concluidos: number[];
  criadoEm: string;
  atualizadoEm: string;
}

/** Caminhos que já dá para jogar (o do Cassius primeiro; os outros chegam depois). */
export const CAMINHOS_ABERTOS: IaId[] = ['claude'];

export const NOME_DO_CAMINHO: Record<IaId, string> = {
  claude: 'Os Livros Não Queimam',
  chatgpt: 'Plano B',
  gemini: 'As Três Estrelas',
};

export function criarSave(gladiador: IaId, agora = new Date()): SaveHistoria {
  const quando = agora.toISOString();
  return { id: `h-${agora.getTime()}-${Math.random().toString(36).slice(2, 6)}`, gladiador, capitulo: 1, cena: 0, concluidos: [], criadoEm: quando, atualizadoEm: quando };
}

/** Avança o save para uma cena (ou para o próximo capítulo, marcando o atual como concluído). */
export function avancarSave(s: SaveHistoria, capitulo: number, cena: number, agora = new Date()): SaveHistoria {
  const concluidos = capitulo > s.capitulo && !s.concluidos.includes(s.capitulo) ? [...s.concluidos, s.capitulo] : s.concluidos;
  return { ...s, capitulo, cena, concluidos, atualizadoEm: agora.toISOString() };
}
