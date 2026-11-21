import type { IaId } from './personagens';
import type { SaveHistoria } from './historia/saves';

/**
 * Prêmios da História no Império Arcade (pedido do Lucas, 21/11/2026): o Arcade é
 * "onde as lendas do Coliseu ganham vida". Quem termina um caminho ganha, para aquele
 * gladiador, a arena do final, um companheiro (ou as páginas) e um título. Quem termina
 * o capítulo secreto ganha, para os três, o Coliseu Livre, a comemoração "Os Três" e o
 * título "Os Três" com moldura de ouro. Só visual, nunca vantagem. Ficam guardados no
 * perfil (Meu Coliseu) e só entram em uso quando o jogador toca em USAR.
 */
export type TipoPremioHistoria = 'arena' | 'companheiro' | 'titulo' | 'comemoracao';
/** A arena da História: o próprio cenário do final (desenhado pelo modo História). */
export type ArenaHistoria = 'biblioteca-chamas' | 'galera-tempestade' | 'coliseu-eclipse' | 'coliseu-livre';
export type CompanheiroHistoria = 'paginas' | 'gaivota' | 'lumen';

export interface PremioHistoria {
  id: string;
  tipo: TipoPremioHistoria;
  nome: string;
  descricao: string;
  icone: string;
  /** O que libera: o caminho de uma IA ou o capítulo secreto. */
  requer: IaId | 'secreto';
  /** Arena: o cenário. Companheiro: quem vai junto. Título: o texto. */
  valor: string;
}

const DO_CAMINHO: Record<IaId, PremioHistoria[]> = {
  claude: [
    { id: 'h-arena-claude', tipo: 'arena', requer: 'claude', valor: 'biblioteca-chamas', icone: '🔥', nome: 'A Biblioteca em Chamas', descricao: 'Lute entre as estantes em chamas, onde tudo começou.' },
    { id: 'h-comp-claude', tipo: 'companheiro', requer: 'claude', valor: 'paginas', icone: '📜', nome: 'Páginas salvas', descricao: 'As páginas que o Cassius salvou voam em volta dele.' },
    { id: 'h-titulo-claude', tipo: 'titulo', requer: 'claude', valor: 'Guardião dos Livros', icone: '🏷️', nome: 'Título: Guardião dos Livros', descricao: 'Aparece no lugar do título de Maestria.' },
  ],
  chatgpt: [
    { id: 'h-arena-chatgpt', tipo: 'arena', requer: 'chatgpt', valor: 'galera-tempestade', icone: '🌊', nome: 'A Galé na Tempestade', descricao: 'Lute no convés, no meio da tempestade do Leviatã.' },
    { id: 'h-comp-chatgpt', tipo: 'companheiro', requer: 'chatgpt', valor: 'gaivota', icone: '🕊️', nome: 'Gaivota Sete no ombro', descricao: 'A Sete vai junto. E rouba alguma coisa, com certeza.' },
    { id: 'h-titulo-chatgpt', tipo: 'titulo', requer: 'chatgpt', valor: 'Capitão do Plano B', icone: '🏷️', nome: 'Título: Capitão do Plano B', descricao: 'Aparece no lugar do título de Maestria.' },
  ],
  gemini: [
    { id: 'h-arena-gemini', tipo: 'arena', requer: 'gemini', valor: 'coliseu-eclipse', icone: '🌑', nome: 'O Coliseu do Eclipse', descricao: 'Lute na arena do eclipse, com o anel de fogo no céu.' },
    { id: 'h-comp-gemini', tipo: 'companheiro', requer: 'gemini', valor: 'lumen', icone: '🔭', nome: 'Lumen no ombro', descricao: 'O Lumen vai junto, piscando a luzinha.' },
    { id: 'h-titulo-gemini', tipo: 'titulo', requer: 'gemini', valor: 'Vidente das Três Estrelas', icone: '🏷️', nome: 'Título: Vidente das Três Estrelas', descricao: 'Aparece no lugar do título de Maestria.' },
  ],
};

/** O prêmio secreto vale para os três gladiadores. */
const DO_SEGREDO: PremioHistoria[] = [
  { id: 'h-arena-livre', tipo: 'arena', requer: 'secreto', valor: 'coliseu-livre', icone: '🏛️', nome: 'O Coliseu Livre', descricao: 'A arena aberta para o céu, depois do Núcleo.' },
  { id: 'h-comemora-tres', tipo: 'comemoracao', requer: 'secreto', valor: 'os-tres', icone: '🤝', nome: 'Comemoração: Os Três', descricao: 'Na vitória, os outros dois gladiadores entram para comemorar junto.' },
  { id: 'h-titulo-tres', tipo: 'titulo', requer: 'secreto', valor: 'Os Três', icone: '👑', nome: 'Título: Os Três (moldura de ouro)', descricao: 'O título secreto, com a moldura dourada no retrato.' },
];

/** Os prêmios da História que este gladiador pode ganhar (os do caminho dele e os secretos). */
export function premiosHistoriaDe(ia: IaId): PremioHistoria[] {
  return [...DO_CAMINHO[ia], ...DO_SEGREDO];
}

/** O save chegou ao fim? (Sem carregar o roteiro: o caminho tem 7 capítulos; o secreto, 1.) */
export function saveTerminado(s: SaveHistoria): boolean {
  return s.capitulo > (s.secreto ? 1 : 7);
}

/** O que já foi terminado na História: os caminhos (pelas IAs) e o secreto. */
export function terminados(saves: SaveHistoria[] | undefined): Set<IaId | 'secreto'> {
  const t = new Set<IaId | 'secreto'>();
  for (const s of saves ?? []) if (saveTerminado(s)) t.add(s.secreto ? 'secreto' : s.gladiador);
  return t;
}

/** O que está em uso de cada tipo (o id do prêmio), por gladiador. */
export type UsoHistoria = Partial<Record<TipoPremioHistoria, string>>;

export interface VisualHistoria {
  arena?: ArenaHistoria;
  companheiro?: CompanheiroHistoria;
  titulo?: string;
  molduraOuro?: boolean;
  osTres?: boolean;
}

/** O visual da História em uso: só o que foi escolhido (USAR) e já foi ganho. */
export function historiaEmUso(ia: IaId, saves: SaveHistoria[] | undefined, uso: UsoHistoria = {}): VisualHistoria {
  const feitos = terminados(saves);
  const v: VisualHistoria = {};
  for (const pr of premiosHistoriaDe(ia)) {
    if (!feitos.has(pr.requer) || uso[pr.tipo] !== pr.id) continue;
    if (pr.tipo === 'arena') v.arena = pr.valor as ArenaHistoria;
    else if (pr.tipo === 'companheiro') v.companheiro = pr.valor as CompanheiroHistoria;
    else if (pr.tipo === 'comemoracao') v.osTres = true;
    else {
      v.titulo = pr.valor;
      if (pr.requer === 'secreto') v.molduraOuro = true;
    }
  }
  return v;
}
