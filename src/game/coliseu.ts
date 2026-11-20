/**
 * "O seu Coliseu vai crescendo" (combinado com o Lucas): cada parada do mapa de
 * troféus dá um prêmio só de visual, nunca vantagem na partida. As 5 ligas mudam a
 * arena (prêmio grande); as paradas do meio alternam estandarte da Tribuna e
 * comemoração de vitória (prêmio pequeno). Cada IA tem a sua própria linha: vale o
 * recorde de troféus dela, então cair de troféus não tira o que já foi ganho.
 * O mais novo entra sozinho; no mapa dá para escolher outro já ganho (USAR).
 */
export type TipoPremio = 'arena' | 'estandarte' | 'comemoracao';
export type ArenaId = 'madeira' | 'pedra' | 'estatuas' | 'marmore' | 'imperial';
export type EstandarteId = 'nenhum' | 'loba' | 'leao' | 'javali' | 'aguia';
export type ComemoracaoId = 'nenhuma' | 'rosas' | 'arma' | 'trombetas' | 'fogos';

export interface Premio {
  trofeus: number;
  tipo: TipoPremio;
  id: ArenaId | EstandarteId | ComemoracaoId;
  nome: string;
  descricao: string;
  icone: string;
}

export const PREMIOS: Premio[] = [
  { trofeus: 0, tipo: 'arena', id: 'madeira', nome: 'Arena de madeira', descricao: 'Arquibancada de tábuas, de dia.', icone: '🏟️' },
  { trofeus: 100, tipo: 'estandarte', id: 'loba', nome: 'Estandarte da Loba', descricao: 'A loba de Roma na sua Tribuna.', icone: '🚩' },
  { trofeus: 250, tipo: 'comemoracao', id: 'rosas', nome: 'Chuva de rosas', descricao: 'Na vitória, a plateia joga rosas.', icone: '🌹' },
  { trofeus: 500, tipo: 'arena', id: 'pedra', nome: 'Arena de pedra', descricao: 'Arcos de pedra no pôr do sol, mais gente na plateia.', icone: '🏟️' },
  { trofeus: 800, tipo: 'estandarte', id: 'leao', nome: 'Estandarte do Leão', descricao: 'Um leão dourado na sua Tribuna.', icone: '🚩' },
  { trofeus: 1100, tipo: 'comemoracao', id: 'arma', nome: 'Arma erguida', descricao: 'Na vitória, o gladiador ergue a arma.', icone: '💪' },
  { trofeus: 1500, tipo: 'arena', id: 'estatuas', nome: 'Arena das estátuas', descricao: 'Estátuas e tochas, de noite.', icone: '🏟️' },
  { trofeus: 2200, tipo: 'estandarte', id: 'javali', nome: 'Estandarte do Javali', descricao: 'O javali da legião na sua Tribuna.', icone: '🚩' },
  { trofeus: 2800, tipo: 'comemoracao', id: 'trombetas', nome: 'Trombetas e confete', descricao: 'Na vitória, trombetas e confete.', icone: '🎺' },
  { trofeus: 3500, tipo: 'arena', id: 'marmore', nome: 'Arena de mármore', descricao: 'Mármore branco e bandeiras na cor da sua IA.', icone: '🏟️' },
  { trofeus: 4500, tipo: 'estandarte', id: 'aguia', nome: 'Águia de ouro', descricao: 'A águia de ouro de Roma na sua Tribuna.', icone: '🚩' },
  { trofeus: 5800, tipo: 'comemoracao', id: 'fogos', nome: 'Fogos no Coliseu', descricao: 'Na vitória, fogos sobre o Coliseu.', icone: '🎆' },
  { trofeus: 7000, tipo: 'arena', id: 'imperial', nome: 'Coliseu do Imperador', descricao: 'Ouro, púrpura, camarote imperial e coroa de louros.', icone: '👑' },
];

export interface VisualColiseu {
  arena: ArenaId;
  estandarte: EstandarteId;
  comemoracao: ComemoracaoId;
}
export type EscolhaColiseu = Partial<VisualColiseu>;

const PADRAO: VisualColiseu = { arena: 'madeira', estandarte: 'nenhum', comemoracao: 'nenhuma' };

export const premioLiberado = (p: Premio, recorde: number) => recorde >= p.trofeus;

/** O que está em uso: o escolhido (se já foi ganho) ou o mais novo ganho de cada tipo. */
export function coliseuEmUso(recorde: number, escolha: EscolhaColiseu = {}): VisualColiseu {
  const v: VisualColiseu = { ...PADRAO };
  for (const tipo of ['arena', 'estandarte', 'comemoracao'] as TipoPremio[]) {
    const ganhos = PREMIOS.filter((p) => p.tipo === tipo && premioLiberado(p, recorde));
    const escolhido = escolha[tipo];
    const valido = escolhido && ganhos.some((p) => p.id === escolhido);
    const id = valido ? escolhido : ganhos[ganhos.length - 1]?.id;
    if (id) (v as unknown as Record<TipoPremio, string>)[tipo] = id;
  }
  return v;
}

/** Prêmios ganhos ao passar de um recorde para outro (para avisar no fim da partida). */
export function premiosNovos(antes: number, depois: number): Premio[] {
  return PREMIOS.filter((p) => p.trofeus > antes && p.trofeus <= depois);
}
