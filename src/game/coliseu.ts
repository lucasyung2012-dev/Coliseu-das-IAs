import type { IaId } from './personagens';

/**
 * "O seu Coliseu vai crescendo" (combinado com o Lucas): cada parada do mapa de
 * troféus dá um prêmio só de visual, nunca vantagem na partida. As 5 ligas mudam a
 * arena (prêmio grande); as paradas do meio alternam estandarte da Tribuna e
 * comemoração de vitória (prêmio pequeno). Cada combatente tem a SUA linha, com o
 * seu tema (pedido do Lucas, 20/11/2026): Cassius = o Sábio do Fórum, Octavius = o
 * General do Porto, Helios = o Vidente das Estrelas. Vale o recorde de troféus de
 * cada um (cair não tira). O mais novo entra sozinho; no mapa dá para escolher (USAR).
 */
export type TipoPremio = 'arena' | 'estandarte' | 'comemoracao';
/** O degrau da arena (um por liga); o desenho de cada degrau muda com o combatente. */
export type ArenaId = 'madeira' | 'pedra' | 'estatuas' | 'marmore' | 'imperial';
export type EstandarteId =
  | 'nenhum'
  | 'coruja'
  | 'balanca'
  | 'oliveira'
  | 'coruja-ouro'
  | 'ancora'
  | 'navio'
  | 'torre'
  | 'aguia'
  | 'estrela'
  | 'lua'
  | 'cometa'
  | 'sol';
export type ComemoracaoId =
  | 'nenhuma'
  | 'folhas'
  | 'pergaminho'
  | 'sinos'
  | 'lanternas'
  | 'moedas'
  | 'bandeiras'
  | 'tambores'
  | 'canhoes'
  | 'cadentes'
  | 'luz'
  | 'aurora'
  | 'eclipse';

export interface Premio {
  trofeus: number;
  tipo: TipoPremio;
  id: ArenaId | EstandarteId | ComemoracaoId;
  nome: string;
  descricao: string;
  icone: string;
}

const PARADAS: [number, TipoPremio][] = [
  [0, 'arena'],
  [100, 'estandarte'],
  [250, 'comemoracao'],
  [500, 'arena'],
  [800, 'estandarte'],
  [1100, 'comemoracao'],
  [1500, 'arena'],
  [2200, 'estandarte'],
  [2800, 'comemoracao'],
  [3500, 'arena'],
  [4500, 'estandarte'],
  [5800, 'comemoracao'],
  [7000, 'arena'],
];

function linha(lista: [Premio['id'], string, string, string][]): Premio[] {
  return lista.map(([id, nome, descricao, icone], i) => ({ trofeus: PARADAS[i]![0], tipo: PARADAS[i]![1], id, nome, descricao, icone }));
}

export const PREMIOS_POR_IA: Record<IaId, Premio[]> = {
  claude: linha([
    ['madeira', 'Jardim de oliveiras', 'Arena de madeira entre oliveiras, de dia.', '🏟️'],
    ['coruja', 'Estandarte da Coruja', 'A coruja da sabedoria na sua Tribuna.', '🦉'],
    ['folhas', 'Folhas de oliveira', 'Na vitória, folhas de oliveira caem sobre a arena.', '🍃'],
    ['pedra', 'Fórum de pedra', 'Colunas do Fórum no pôr do sol, mais gente na plateia.', '🏟️'],
    ['balanca', 'Estandarte da Balança', 'A balança do equilíbrio na sua Tribuna.', '⚖️'],
    ['pergaminho', 'Pergaminho da vitória', 'Na vitória, um pergaminho se abre com o seu nome.', '📜'],
    ['estatuas', 'Biblioteca de Alexandria', 'Estantes de pergaminhos e lamparinas, de noite.', '🏟️'],
    ['oliveira', 'Estandarte da Oliveira', 'O ramo de oliveira da paz na sua Tribuna.', '🌿'],
    ['sinos', 'Sinos do templo', 'Na vitória, os sinos do templo tocam.', '🔔'],
    ['marmore', 'Templo de Minerva', 'Mármore branco, a estátua da deusa e bandeiras laranja.', '🏟️'],
    ['coruja-ouro', 'Coruja de ouro', 'A coruja de ouro de Minerva na sua Tribuna.', '🦉'],
    ['lanternas', 'Lanternas no céu', 'Na vitória, lanternas sobem iluminando a noite.', '🏮'],
    ['imperial', 'Coliseu do Imperador Sábio', 'Ouro, púrpura, camarote imperial e a coroa de carvalho no gladiador.', '👑'],
  ]),
  chatgpt: linha([
    ['madeira', 'Acampamento da legião', 'Arena de madeira entre as tendas, de dia.', '🏟️'],
    ['ancora', 'Estandarte da Âncora', 'A âncora do porto na sua Tribuna.', '⚓'],
    ['moedas', 'Chuva de moedas', 'Na vitória, moedas de ouro caem do céu.', '🪙'],
    ['pedra', 'Porto de Óstia', 'Navios no mar ao pôr do sol, mais gente na plateia.', '🏟️'],
    ['navio', 'Estandarte do Navio', 'A galera de Roma na sua Tribuna.', '⛵'],
    ['bandeiras', 'Planos A, B e C', 'Na vitória, sobem as bandeiras dos seus três planos.', '🚩'],
    ['estatuas', 'Quartel das legiões', 'Mapas de batalha e tochas, de noite.', '🏟️'],
    ['torre', 'Estandarte da Torre', 'A torre do farol na sua Tribuna.', '🗼'],
    ['tambores', 'Tambores de guerra', 'Na vitória, os tambores tocam e a arena treme.', '🥁'],
    ['marmore', 'Fórum de mármore', 'Mármore branco e bandeiras verdes por toda parte.', '🏟️'],
    ['aguia', 'Águia das legiões', 'A águia de ouro das legiões na sua Tribuna.', '🦅'],
    ['canhoes', 'Canhões de confete', 'Na vitória, os navios disparam confete.', '🎉'],
    ['imperial', 'Palácio do Imperador', 'Ouro, púrpura, camarote imperial e a coroa naval no gladiador.', '👑'],
  ]),
  gemini: linha([
    ['madeira', 'Colina do amanhecer', 'Arena de madeira numa colina, com o céu do amanhecer.', '🏟️'],
    ['estrela', 'Estandarte da Estrela', 'Uma estrela brilhante na sua Tribuna.', '⭐'],
    ['cadentes', 'Estrelas cadentes', 'Na vitória, estrelas cadentes cruzam o céu.', '🌠'],
    ['pedra', 'Observatório de pedra', 'Torre de observar o céu no pôr do sol, mais gente na plateia.', '🏟️'],
    ['lua', 'Estandarte da Lua', 'A lua crescente na sua Tribuna.', '🌙'],
    ['luz', 'Chuva de luz', 'Na vitória, gotas de luz caem como chuva.', '✨'],
    ['estatuas', 'Arena das constelações', 'Constelações desenhadas no céu, de noite.', '🏟️'],
    ['cometa', 'Estandarte do Cometa', 'Um cometa de cauda longa na sua Tribuna.', '☄️'],
    ['aurora', 'Aurora no céu', 'Na vitória, uma aurora colorida dança no céu.', '🌌'],
    ['marmore', 'Templo do Sol', 'Mármore dourado, o disco do sol e bandeiras azuis.', '🏟️'],
    ['sol', 'Sol radiante', 'O sol de ouro na sua Tribuna.', '☀️'],
    ['eclipse', 'Eclipse dourado', 'Na vitória, a lua cobre o sol e um anel de ouro brilha.', '🌑'],
    ['imperial', 'Coliseu Celeste', 'Ouro, púrpura, camarote imperial e a coroa radiada no gladiador.', '👑'],
  ]),
};

export const premiosDe = (ia: IaId): Premio[] => PREMIOS_POR_IA[ia];

export interface VisualColiseu {
  arena: ArenaId;
  estandarte: EstandarteId;
  comemoracao: ComemoracaoId;
}
export type EscolhaColiseu = Partial<VisualColiseu>;

const PADRAO: VisualColiseu = { arena: 'madeira', estandarte: 'nenhum', comemoracao: 'nenhuma' };

export const premioLiberado = (p: Premio, recorde: number) => recorde >= p.trofeus;

/** O que está em uso: o escolhido (se já foi ganho) ou o mais novo ganho de cada tipo. */
export function coliseuEmUso(ia: IaId, recorde: number, escolha: EscolhaColiseu = {}): VisualColiseu {
  const v: VisualColiseu = { ...PADRAO };
  for (const tipo of ['arena', 'estandarte', 'comemoracao'] as TipoPremio[]) {
    const ganhos = premiosDe(ia).filter((p) => p.tipo === tipo && premioLiberado(p, recorde));
    const escolhido = escolha[tipo];
    const valido = escolhido && ganhos.some((p) => p.id === escolhido);
    const id = valido ? escolhido : ganhos[ganhos.length - 1]?.id;
    if (id) (v as unknown as Record<TipoPremio, string>)[tipo] = id;
  }
  return v;
}

/** Prêmios ganhos ao passar de um recorde para outro (para avisar no fim da partida). */
export function premiosNovos(ia: IaId, antes: number, depois: number): Premio[] {
  return premiosDe(ia).filter((p) => p.trofeus > antes && p.trofeus <= depois);
}

/** Nome do prêmio em uso deste combatente (ou "nenhum ainda"). */
export function nomeDoPremio(ia: IaId, id: string): string {
  return premiosDe(ia).find((p) => p.id === id)?.nome ?? 'nenhum ainda';
}
