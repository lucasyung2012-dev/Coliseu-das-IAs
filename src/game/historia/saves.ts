import type { IaId } from '../personagens';
import { ATRIBUTOS_INICIAIS, type AtributosLuta, type Estilo, type Tecnica } from './luta';

/** O jeito de lutar de cada gladiador (Cassius guardião, Octavius estrategista, Helios vidente). */
export const ESTILO_DA_IA: Record<IaId, Estilo> = { claude: 'guardiao', chatgpt: 'estrategista', gemini: 'vidente' };

/**
 * Saves do modo História (docs/HISTORIA.md). Quantos o jogador quiser; cada save é
 * uma história com um gladiador. Ficam dentro do Progresso, então vão junto com a
 * conta do Dropbox. O jogo salva sozinho no começo de cada cena.
 * A partir do Capítulo 3 (o Ludus), o save guarda também os atributos, os golpes
 * aprendidos com o Brutus, as peças de máquina e o equipamento do ferreiro.
 */
export interface SaveHistoria {
  id: string;
  gladiador: IaId;
  /** Capítulo atual (1 a 7; o 7 é o final) e a cena dentro dele (índice no roteiro do capítulo). */
  capitulo: number;
  cena: number;
  /** Capítulos terminados. */
  concluidos: number[];
  criadoEm: string;
  atualizadoEm: string;
  /** Treinos de atributo (+1 cada): força, defesa, vida e carisma. */
  treinos?: Partial<Record<Treino, number>>;
  /** Treinos feitos, por capítulo ("3:forca"), para cada um valer uma vez por visita ao Ludus. */
  feitos?: string[];
  tecnicas?: Tecnica[];
  pecas?: number;
  equipamento?: Equipamento[];
  /** O que o jogador escolheu nas ESCOLHAS do capítulo (ex.: a rota no Mercado das Engrenagens). */
  escolhas?: Record<string, string>;
  /** O capítulo secreto, Os Três (os três gladiadores juntos; o `gladiador` é só quem começa). */
  secreto?: boolean;
  /** Versão da ordem das cenas (2 = capítulo 1 do Cassius com o treino no começo; 3 = a fuga do mercado no capítulo 2). */
  ordem?: number;
}

export type Treino = 'forca' | 'defesa' | 'vida' | 'carisma';
export type Equipamento = 'bracelete' | 'escudo-reforcado' | 'capa-vermelha' | 'peitoral' | 'elmo-brutus';

/** O que o ferreiro faz com as peças de máquina (só vale na História). */
export const FERREIRO: { id: Equipamento; nome: string; icone: string; custo: number; efeito: string }[] = [
  { id: 'bracelete', nome: 'Bracelete de bronze', icone: 'corrente', custo: 6, efeito: '+1 Força' },
  { id: 'escudo-reforcado', nome: 'Escudo reforçado', icone: 'escudo', custo: 8, efeito: '+1 Defesa' },
  { id: 'capa-vermelha', nome: 'Capa vermelha', icone: 'capa', custo: 8, efeito: '+1 Carisma (a plateia te ama)' },
  { id: 'peitoral', nome: 'Peitoral de engrenagens', icone: 'engrenagem', custo: 12, efeito: '+20 Vida' },
];

/** Caminhos que já dá para jogar. */
export const CAMINHOS_ABERTOS: IaId[] = ['claude', 'chatgpt', 'gemini'];

export const NOME_DO_CAMINHO: Record<IaId, string> = {
  claude: 'Os Livros Não Queimam',
  chatgpt: 'Plano B',
  gemini: 'As Três Estrelas',
};

export function criarSave(gladiador: IaId, agora = new Date()): SaveHistoria {
  const quando = agora.toISOString();
  return { id: `h-${agora.getTime()}-${Math.random().toString(36).slice(2, 6)}`, gladiador, capitulo: 1, cena: 0, concluidos: [], criadoEm: quando, atualizadoEm: quando, ordem: ORDEM_ATUAL };
}

/** O save do capítulo secreto: abre pela grade escondida, com os três pedaços da chave. */
export function criarSaveSecreto(agora = new Date()): SaveHistoria {
  return { ...criarSave('claude', agora), secreto: true };
}

/**
 * 22/11/2026: o capítulo 1 do Cassius mudou de ordem (a luta de treino veio para o começo
 * e entrou a cena do alçapão). Save antigo: a cena antiga vira a cena nova equivalente.
 */
const ORDEM_NOVA_CAP1_CASSIUS = [0, 1, 2, 5, 6, 8, 9, 3, 4, 10, 11, 12];
export function ajustarOrdem(s: SaveHistoria): SaveHistoria {
  const ordem = s.ordem ?? 1;
  if (ordem >= ORDEM_ATUAL) return s;
  const cassius = s.gladiador === 'claude' && !s.secreto;
  let cena = s.cena;
  if (ordem < 2 && cassius && s.capitulo === 1) cena = ORDEM_NOVA_CAP1_CASSIUS[cena] ?? cena + 1;
  // 3: a fuga do mercado entrou no capítulo 2 antes da luta no mercado (que era a cena 6).
  if (ordem < 3 && cassius && s.capitulo === 2 && cena >= 6) cena += 1;
  // 4: os túneis alagados entraram no capítulo 4 logo depois da descida (antes da cena 2).
  if (ordem < 4 && cassius && s.capitulo === 4 && cena >= 2) cena += 1;
  // 5: o caminho até a tribuna entrou no capítulo 5 depois do Fórum (antes da cena 3).
  if (ordem < 5 && cassius && s.capitulo === 5 && cena >= 3) cena += 1;
  return { ...s, cena, ordem: ORDEM_ATUAL };
}
/** A versão atual da ordem das cenas (save novo já nasce nela). */
export const ORDEM_ATUAL = 5;

/** Avança o save para uma cena (ou para o próximo capítulo, marcando o atual como concluído). */
export function avancarSave(s: SaveHistoria, capitulo: number, cena: number, agora = new Date()): SaveHistoria {
  const concluidos = capitulo > s.capitulo && !s.concluidos.includes(s.capitulo) ? [...s.concluidos, s.capitulo] : s.concluidos;
  return { ...s, capitulo, cena, concluidos, atualizadoEm: agora.toISOString() };
}

/** Os atributos de luta do save: base + treinos + equipamento + golpes aprendidos. */
export function atributosDoSave(s: SaveHistoria): AtributosLuta {
  const t = s.treinos ?? {};
  const eq = s.equipamento ?? [];
  const tem = (e: Equipamento) => (eq.includes(e) ? 1 : 0);
  return {
    vida: ATRIBUTOS_INICIAIS.vida + (t.vida ?? 0) * 10 + tem('peitoral') * 20 + tem('elmo-brutus') * 20,
    forca: ATRIBUTOS_INICIAIS.forca + (t.forca ?? 0) + tem('bracelete'),
    defesa: ATRIBUTOS_INICIAIS.defesa + (t.defesa ?? 0) + tem('escudo-reforcado') + tem('elmo-brutus'),
    carisma: ATRIBUTOS_INICIAIS.carisma + (t.carisma ?? 0) + tem('capa-vermelha'),
    tecnicas: s.tecnicas ?? [],
    estilo: ESTILO_DA_IA[s.gladiador],
  };
}

/** Terminou um treino de atributo no Ludus (vale uma vez por capítulo). */
export function treinar(s: SaveHistoria, treino: Treino): SaveHistoria {
  const chave = `${s.capitulo}:${treino}`;
  if (s.feitos?.includes(chave)) return s;
  return { ...s, treinos: { ...s.treinos, [treino]: (s.treinos?.[treino] ?? 0) + 1 }, feitos: [...(s.feitos ?? []), chave] };
}

export const treinoFeito = (s: SaveHistoria, treino: Treino | Tecnica) => (s.feitos ?? []).includes(`${s.capitulo}:${treino}`) || (s.tecnicas ?? []).includes(treino as Tecnica);

export function aprender(s: SaveHistoria, t: Tecnica): SaveHistoria {
  return (s.tecnicas ?? []).includes(t) ? s : { ...s, tecnicas: [...(s.tecnicas ?? []), t] };
}

export function ganharPecas(s: SaveHistoria, n: number): SaveHistoria {
  return { ...s, pecas: (s.pecas ?? 0) + n };
}

/** O ferreiro forja uma peça de equipamento (se der e se ainda não tiver). */
export function forjar(s: SaveHistoria, id: Equipamento): SaveHistoria {
  const item = FERREIRO.find((f) => f.id === id);
  const eq = s.equipamento ?? [];
  if (!item || eq.includes(id) || (s.pecas ?? 0) < item.custo) return s;
  return { ...s, pecas: (s.pecas ?? 0) - item.custo, equipamento: [...eq, id] };
}

export function ganharEquipamento(s: SaveHistoria, id: Equipamento): SaveHistoria {
  const eq = s.equipamento ?? [];
  return eq.includes(id) ? s : { ...s, equipamento: [...eq, id] };
}
