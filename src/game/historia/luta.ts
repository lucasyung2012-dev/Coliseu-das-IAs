/**
 * A luta do modo História (docs/HISTORIA.md, seção 3): um contra um, de lado,
 * com 3 botões (golpe, escudo, esquiva). Cada inimigo dá um SINAL antes de atacar:
 * - sinal AMARELO (golpe de corpo): dá para defender com o ESCUDO (ou esquivar);
 * - sinal VERMELHO (fogo, investida): o escudo segura só metade, tem que ESQUIVAR;
 * - FINTA: o sinal aparece e o golpe não vem (quem se defendeu à toa gastou fôlego);
 * - COMBO: vários golpes seguidos, com sinal curto entre eles.
 * Depois de atacar, o inimigo fica ABERTO um tempo: é a hora de bater forte.
 * Bater nele em guarda quase não entra; três vezes seguidas, ele CONTRA-ATACA.
 * Golpe, escudo e esquiva gastam FÔLEGO, que volta sozinho quando você para.
 * Cada boa jogada enche o ÂNIMO; cheio, libera o golpe especial.
 * Funções puras: a tela chama `passoLuta` a cada tick e `agir` nos botões.
 * (Dificuldade revista em 21/11/2026: o Lucas achou fácil demais.)
 */
export const TICK_LUTA = 50;
export const ANIMO_MAX = 100;
export const FOLEGO_MAX = 100;
const GOLPE_MS = 250;
const RECARGA_GOLPE_MS = 380;
const ESCUDO_MS = 450;
const ESQUIVA_MS = 380;
const RECARGA_ESQUIVA_MS = 850;
const FERIDO_MS = 450;
const ATORDOADO_MS = 1100;
const CUSTO = { golpe: 10, escudo: 22, esquiva: 28 } as const;
/** Fôlego que volta por segundo (só quando não está defendendo nem esquivando). */
const FOLEGO_POR_SEGUNDO = 38;
const GUARDAS_ATE_CONTRA = 3;

export type TipoAtaque = 'corpo' | 'fogo' | 'investida' | 'finta';

export interface AtaqueInimigo {
  nome: string;
  tipo: TipoAtaque;
  /** Quanto tempo o sinal aparece antes do golpe. */
  sinalMs: number;
  dano: number;
  /** Quanto tempo o inimigo fica aberto (vulnerável) depois de atacar. */
  abertoMs: number;
  /** Golpes seguidos (o primeiro com o sinal normal, os outros com `comboMs`). */
  combo?: number;
  comboMs?: number;
}

export interface FaseInimigo {
  /** A fase pode mudar o jeito da luta (o Núcleo: escudo gigante, escuro, ilusões). */
  escudoGigante?: boolean;
  escuro?: boolean;
  ilusoes?: boolean;
  /** O ponto fraco desta fase (o Titã: AS PERNAS, OS BRAÇOS, O OLHO): aparece na luta. */
  alvo?: string;
  ataques: AtaqueInimigo[];
  /** Espera entre um ataque e outro (o jogo sorteia dentro do intervalo). */
  pausaMs: [number, number];
}

export interface DefInimigo {
  id: string;
  nome: string;
  vida: number;
  fases: FaseInimigo[];
  /** A partir de que fração da vida entra a fase seguinte (ex.: [0.66, 0.33]). */
  trocaDeFase?: number[];
  chefao?: boolean;
  /** Dano do contra-ataque quando o jogador bate três vezes na guarda dele. */
  contra?: number;
  /** Escudo gigante (o Pretor de Aço): golpe na guarda não entra nada; só a QUEBRA-GUARDA abre. */
  escudoGigante?: boolean;
  /** Faz cópias falsas (o Arquivista): só a tela muda, as fintas viram ilusões. */
  ilusoes?: boolean;
  /** Luta final: o especial chama os aliados (cada vez um). */
  aliados?: string[];
  /** Peças de máquina que ele deixa para o ferreiro (padrão: 2; chefão: 6). */
  pecas?: number;
  /** Luta no escuro (Helios): a tela fica escura e o sinal só aparece com a LUZ. */
  escuro?: boolean;
}

/** Golpes que o Brutus ensina no Ludus. */
export type Tecnica = 'contra-ataque' | 'quebra-guarda' | 'esquiva-dupla' | 'espelho-de-sol';

/**
 * O JEITO DE LUTAR de cada gladiador (pedido do Lucas, 21/11/2026: "cada um tem que ter
 * o seu estilo, não só atacar, defender, esquivar e especial"):
 * - GUARDIÃO (Cassius): defesa forte. Bloqueio na última hora guarda uma PÁGINA (até 3);
 *   o próximo golpe no aberto "cita" as páginas e bate muito mais. Esquiva lenta e cara.
 *   Especial MURALHA DE LIVROS: 4,5 s em que tudo é bloqueado e metade volta para o inimigo.
 * - ESTRATEGISTA (Octavius): truques. Esquiva na última hora faz o inimigo TROPEÇAR (fica
 *   aberto bem mais tempo). Escudo fraco (passa um pouco). Usa os PLANOS do cenário.
 *   Especial REDE E TRIDENTE: o inimigo fica preso 3 s e cada estocada entra mais forte.
 * - VIDENTE (Helios): adivinha. Vê o PRÓXIMO golpe antes; esquiva na última hora junta LUZ
 *   (até 3). Menos vida. Especial ECLIPSE: os próximos 3 ataques do inimigo erram, e a luz
 *   guardada vira um raio de sol.
 */
export type Estilo = 'guardiao' | 'estrategista' | 'vidente';

/** O que cada estilo guarda durante a luta. */
export interface RecursoEstilo {
  /** Guardião: páginas guardadas (0 a 3). */
  paginas: number;
  /** Guardião: até quando vale a Muralha de Livros. */
  muralhaAte: number;
  /** Estrategista: até quando o inimigo está preso na rede. */
  redeAte: number;
  /** Vidente: luz guardada (0 a 3). */
  luz: number;
  /** Vidente: quantos ataques do inimigo ainda erram (Eclipse). */
  cego: number;
}
export const RECURSO_ZERO: RecursoEstilo = { paginas: 0, muralhaAte: 0, redeAte: 0, luz: 0, cego: 0 };
/** Janela da defesa "na última hora" (ms entre apertar e o golpe chegar). */
const NA_HORA_ESCUDO_MS = 300;
const NA_HORA_ESQUIVA_MS = 250;
const MURALHA_MS = 4500;
/**
 * AS LUTAS ÚNICAS (22/11/2026, pedido do Lucas: "cada um bem diferente, respeitando o jeito de cada um").
 * Os quatro botões continuam sendo quatro, mas cada gladiador faz uma coisa diferente com eles:
 * - Cassius (guardião): GLÁDIO · ESCUDO (segura enquanto o dedo está em cima) · DEVOLVER (só logo
 *   depois de bloquear) · MURALHA. Não esquiva: o escudo dele, na hora certa, segura até o fogo.
 * - Octavius (estrategista): TRIDENTE (fura a guarda de longe) · REDE (prende quem está atacando
 *   ou aberto) · ROLAR (e o próximo golpe é pelas costas) · PLANO B. Não bloqueia.
 * - Helios (vidente): LAMPEJO (com luz guardada, no aviso, cancela o ataque) · ESPELHO (devolve o
 *   fogo) · PASSO DE SOMBRA (some e junta luz) · ECLIPSE.
 */
const ESCUDO_SEGURO_MS = 1500;
const REDE_PRESO_MS = 1800;
const REDE_RECARGA_MS = 5000;
const PLANO_B_MS = 2600;

export type AcaoJogador = 'parado' | 'golpe' | 'escudo' | 'esquiva' | 'especial' | 'ferido';
export type EstadoInimigo = 'espera' | 'sinal' | 'aberto' | 'atordoado';

export interface EventoLuta {
  id: number;
  tipo:
    | 'acerto'
    | 'bloqueio'
    | 'esquiva'
    | 'dano'
    | 'especial'
    | 'guarda'
    | 'fase'
    | 'finta'
    | 'contra'
    | 'cansado'
    | 'riposta'
    | 'quebra'
    | 'aliado'
    | 'plano'
    | 'reflexo'
    // os jeitos de lutar
    | 'pagina'
    | 'citacao'
    | 'muralha'
    | 'tropeco'
    | 'rede'
    | 'luz'
    | 'eclipse'
    | 'erro'
    // as lutas únicas
    | 'planob'
    | 'lampejo'
    | 'escapou';
  valor?: number;
  lado: 'jogador' | 'inimigo';
  ate: number;
}

export interface EstadoLuta {
  tempo: number;
  def: DefInimigo;
  jogador: {
    vida: number;
    vidaMax: number;
    folego: number;
    acao: AcaoJogador;
    acaoDesde: number;
    acaoAte: number;
    golpePronto: number;
    /** Até quando vale o CONTRA-ATAQUE (golpe logo depois de bloquear). */
    ripostaAte: number;
    esquivaPronta: number;
    /** Octavius: quando a REDE pode ser jogada de novo. */
    redePronta: number;
  };
  inimigo: {
    vida: number;
    estado: EstadoInimigo;
    estadoAte: number;
    fase: number;
    ataque: number;
    proximoEm: number;
    /** Golpes que ainda faltam no combo atual. */
    combo: number;
    /** Quantas vezes seguidas o jogador bateu na guarda dele. */
    guardas: number;
    /** O próximo golpe é um contra-ataque (rápido, depois de apanhar na guarda). */
    contra: boolean;
  };
  animo: number;
  /** O que o jeito de lutar do gladiador guardou (páginas, luz, rede, muralha). */
  estilo: RecursoEstilo;
  fim: null | 'vitoria' | 'derrota';
  eventos: EventoLuta[];
  seq: number;
}

/** Atributos do gladiador (sobem no Ludus, a partir do capítulo 3). */
export interface AtributosLuta {
  vida: number;
  forca: number;
  defesa: number;
  carisma: number;
  /** Golpes aprendidos no Ludus. */
  tecnicas?: Tecnica[];
  /** O jeito de lutar (sem estilo: a luta "neutra", usada nos testes antigos). */
  estilo?: Estilo;
}
export const ATRIBUTOS_INICIAIS: AtributosLuta = { vida: 100, forca: 1, defesa: 1, carisma: 1 };

/** O estilo de cada gladiador. */
export const ESTILO_DO_HEROI: Record<'cassius' | 'octavius' | 'helios', Estilo> = { cassius: 'guardiao', octavius: 'estrategista', helios: 'vidente' };

export type Aleatorio = () => number;

export function novaLuta(def: DefInimigo, atributos: AtributosLuta = ATRIBUTOS_INICIAIS): EstadoLuta {
  // O Vidente tem menos vida (enxerga longe, mas é frágil).
  const vida = atributos.estilo === 'vidente' ? Math.round(atributos.vida * 0.88) : atributos.vida;
  return {
    tempo: 0,
    def,
    estilo: RECURSO_ZERO,
    jogador: { vida, vidaMax: vida, folego: FOLEGO_MAX, acao: 'parado', acaoDesde: 0, acaoAte: 0, golpePronto: 0, esquivaPronta: 0, ripostaAte: 0, redePronta: 0 },
    inimigo: { vida: def.vida, estado: 'espera', estadoAte: 0, fase: 0, ataque: 0, proximoEm: 1500, combo: 0, guardas: 0, contra: false },
    animo: 0,
    fim: null,
    eventos: [],
    seq: 0,
  };
}

const evento = (s: EstadoLuta, tipo: EventoLuta['tipo'], lado: EventoLuta['lado'], valor?: number): EstadoLuta => ({
  ...s,
  seq: s.seq + 1,
  eventos: [...s.eventos, { id: s.seq + 1, tipo, lado, valor, ate: s.tempo + 700 }],
});

const ganharAnimo = (s: EstadoLuta, n: number, a: AtributosLuta): EstadoLuta => ({ ...s, animo: Math.min(ANIMO_MAX, s.animo + n * (1 + (a.carisma - 1) * 0.25)) });

const CONTRA_ATAQUE = (dano: number): AtaqueInimigo => ({ nome: 'Contra-ataque', tipo: 'corpo', sinalMs: 420, dano, abertoMs: 700 });

/** O ataque que o inimigo está preparando (ou o próximo). */
export function ataqueAtual(s: EstadoLuta): AtaqueInimigo {
  if (s.inimigo.contra) return CONTRA_ATAQUE(s.def.contra ?? 10);
  const fase = s.def.fases[s.inimigo.fase]!;
  return fase.ataques[s.inimigo.ataque % fase.ataques.length]!;
}

/** O jogador apertou um botão. */
export function agir(s: EstadoLuta, acao: 'golpe' | 'escudo' | 'esquiva' | 'especial' | 'soltar', a: AtributosLuta = ATRIBUTOS_INICIAIS): EstadoLuta {
  if (s.fim) return s;
  const j = s.jogador;
  // Cassius tirou o dedo do ESCUDO: abaixa.
  if (acao === 'soltar') return j.acao === 'escudo' && s.tempo < j.acaoAte ? { ...s, jogador: { ...j, acaoAte: s.tempo } } : s;
  if (j.acao === 'ferido' && s.tempo < j.acaoAte) return s;
  const ocupado = s.tempo < j.acaoAte && j.acao !== 'escudo';
  if (acao === 'especial') {
    if (s.animo < ANIMO_MAX) return s;
    const forca = 1 + (a.forca - 1) * 0.2;
    let r: EstadoLuta = { ...s, animo: 0, jogador: { ...j, acao: 'especial', acaoDesde: s.tempo, acaoAte: s.tempo + 700 } };
    // Na luta final, o especial também chama um aliado de cada vez (o valor do evento diz qual).
    const comAliado = (x: EstadoLuta) => (s.def.aliados?.length ? evento(x, 'aliado', 'jogador', x.seq % s.def.aliados.length) : x);
    const tonto = (x: EstadoLuta, ms: number): EstadoLuta =>
      x.fim ? x : { ...x, inimigo: { ...x.inimigo, estado: 'atordoado', estadoAte: s.tempo + ms, combo: 0, guardas: 0, contra: false } };
    if (a.estilo === 'guardiao') {
      // MURALHA DE LIVROS: um empurrão de escudo e, por 4,5 s, tudo é bloqueado e metade volta.
      r = bater(r, 14 * forca, true);
      r = { ...r, estilo: { ...r.estilo, muralhaAte: s.tempo + MURALHA_MS } };
      return comAliado(evento(tonto(r, 600), 'muralha', 'jogador'));
    }
    if (a.estilo === 'estrategista') {
      // PLANO B: o plano desenhado a giz acontece (barril, corda, guindaste): pancada e ele fica tonto um bom tempo.
      r = bater(r, 16 * forca, true);
      return comAliado(evento(tonto(r, PLANO_B_MS), 'planob', 'jogador'));
    }
    if (a.estilo === 'vidente') {
      // ECLIPSE: os próximos 3 ataques erram; a luz guardada vira um raio de sol.
      r = bater(r, (12 + 9 * s.estilo.luz) * forca, true);
      r = { ...r, estilo: { ...r.estilo, luz: 0, cego: 3 } };
      return comAliado(evento(tonto(r, 800), 'eclipse', 'jogador', s.estilo.luz));
    }
    r = bater(r, 28 * forca, true);
    const tipo = s.def.aliados?.length ? 'aliado' : 'especial';
    const qual = s.def.aliados?.length ? r.seq % s.def.aliados.length : undefined;
    if (r.fim) return evento(r, tipo, 'jogador', qual);
    return evento(tonto(r, ATORDOADO_MS), tipo, 'jogador', qual);
  }
  const forcaG = 1 + (a.forca - 1) * 0.2;
  // CASSIUS, DEVOLVER: só logo depois de bloquear. O golpe volta dobrado e ele fica tonto.
  if (a.estilo === 'guardiao' && acao === 'esquiva') {
    if (ocupado || s.tempo >= j.ripostaAte) return s;
    if (j.folego < 10) return evento(s, 'cansado', 'jogador');
    const r: EstadoLuta = { ...s, jogador: { ...j, folego: j.folego - 10, ripostaAte: 0, acao: 'golpe', acaoDesde: s.tempo, acaoAte: s.tempo + GOLPE_MS, golpePronto: s.tempo + RECARGA_GOLPE_MS } };
    const g = bater({ ...r, inimigo: { ...r.inimigo, guardas: 0 } }, 7 * forcaG * 2.4);
    const tonto = g.fim ? g : { ...g, inimigo: { ...g.inimigo, estado: 'atordoado' as const, estadoAte: s.tempo + 800, combo: 0, contra: false } };
    return ganharAnimo(evento(tonto, 'riposta', 'inimigo'), 10, a);
  }
  // OCTAVIUS, REDE: presa quem está atacando (cancela o golpe) ou aberto; na guarda, ele escapa.
  if (a.estilo === 'estrategista' && acao === 'escudo') {
    if (ocupado || s.tempo < j.redePronta) return s;
    if (j.folego < 20) return evento(s, 'cansado', 'jogador');
    const r: EstadoLuta = { ...s, jogador: { ...j, folego: j.folego - 20, acao: 'golpe', acaoDesde: s.tempo, acaoAte: s.tempo + GOLPE_MS, redePronta: s.tempo + REDE_RECARGA_MS } };
    const i = r.inimigo;
    if (i.estado === 'espera') return evento(r, 'escapou', 'inimigo');
    const preso: EstadoLuta = { ...r, estilo: { ...r.estilo, redeAte: s.tempo + REDE_PRESO_MS }, inimigo: { ...i, estado: 'atordoado', estadoAte: s.tempo + REDE_PRESO_MS, combo: 0, contra: false, guardas: 0, ataque: i.estado === 'sinal' ? i.ataque + 1 : i.ataque } };
    return ganharAnimo(evento(preso, 'rede', 'inimigo'), 8, a);
  }
  // HELIOS, LAMPEJO no aviso: com luz guardada, o raio cancela o ataque e ele fica aberto.
  if (a.estilo === 'vidente' && acao === 'golpe' && s.inimigo.estado === 'sinal' && s.estilo.luz > 0 && ataqueAtual(s).tipo !== 'finta') {
    if (ocupado || s.tempo < j.golpePronto) return s;
    if (j.folego < CUSTO.golpe) return evento(s, 'cansado', 'jogador');
    const at = ataqueAtual(s);
    const r: EstadoLuta = { ...s, estilo: { ...s.estilo, luz: s.estilo.luz - 1 }, jogador: { ...j, folego: j.folego - CUSTO.golpe, acao: 'golpe', acaoDesde: s.tempo, acaoAte: s.tempo + GOLPE_MS, golpePronto: s.tempo + RECARGA_GOLPE_MS } };
    const g = bater(r, 7 * forcaG * 0.8);
    if (g.fim) return evento(g, 'lampejo', 'jogador');
    const aberto: EstadoLuta = { ...g, inimigo: { ...g.inimigo, estado: 'aberto', estadoAte: s.tempo + at.abertoMs + 300, combo: 0, contra: false, ataque: g.inimigo.ataque + 1 } };
    return ganharAnimo(evento(aberto, 'lampejo', 'jogador'), 10, a);
  }
  if (acao !== 'golpe' && ocupado) return s;
  if (acao === 'golpe' && (ocupado || s.tempo < j.golpePronto)) return s;
  if (acao === 'esquiva' && s.tempo < j.esquivaPronta) return s;
  // O custo de cada ação muda com o estilo: o Guardião esquiva pesado; o Estrategista apara leve.
  const custo = CUSTO[acao] - (a.estilo === 'guardiao' && acao === 'escudo' ? 4 : 0);
  if (j.folego < custo) return evento(s, 'cansado', 'jogador');
  const folego = j.folego - custo;
  if (acao === 'golpe') {
    const r: EstadoLuta = { ...s, jogador: { ...j, folego, acao: 'golpe', acaoDesde: s.tempo, acaoAte: s.tempo + GOLPE_MS, golpePronto: s.tempo + RECARGA_GOLPE_MS } };
    const i = r.inimigo;
    const base = 7 * (1 + (a.forca - 1) * 0.2);
    const sabe = (t: Tecnica) => a.tecnicas?.includes(t) ?? false;
    // CONTRA-ATAQUE (aprendido no Ludus): golpe logo depois de bloquear entra dobrado e deixa ele tonto.
    // (A ESQUIVA DUPLA do Octavius faz o mesmo depois de esquivar.)
    if (s.tempo < j.ripostaAte && a.estilo !== 'guardiao') {
      const rr: EstadoLuta = { ...r, jogador: { ...r.jogador, ripostaAte: 0 } };
      const g = bater({ ...rr, inimigo: { ...i, guardas: 0 } }, base * 2.2);
      const tonto = g.fim ? g : { ...g, inimigo: { ...g.inimigo, estado: 'atordoado' as const, estadoAte: s.tempo + 700, combo: 0, contra: false } };
      return ganharAnimo(evento(tonto, 'riposta', 'inimigo'), 10, a);
    }
    // Escudo gigante: só entra golpe cheio com a guarda quebrada (tonto).
    const gigante = s.def.escudoGigante || s.def.fases[i.fase]?.escudoGigante;
    const muralha = gigante ? (i.estado === 'atordoado' ? 1 : 0.3) : 1;
    // Aberto ou atordoado: golpe cheio (e mais Ânimo). Em guarda: ele defende quase tudo.
    if (i.estado === 'aberto' || i.estado === 'atordoado') {
      const cheio = (i.estado === 'atordoado' ? base * 1.5 : base) * muralha;
      // Guardião: o golpe "cita" as páginas guardadas (cada uma +60%) e passa pelo escudo gigante.
      if (a.estilo === 'guardiao' && s.estilo.paginas > 0) {
        const n = s.estilo.paginas;
        const c = bater({ ...r, estilo: { ...r.estilo, paginas: 0 }, inimigo: { ...i, guardas: 0 } }, (i.estado === 'atordoado' ? base * 1.5 : base) * (1 + 0.6 * n));
        return ganharAnimo(evento(c, 'citacao', 'inimigo', n), 6 + 3 * n, a);
      }
      // Estrategista: preso na rede, cada estocada do tridente entra 25% mais forte (além do golpe no tonto).
      const naRede = a.estilo === 'estrategista' && s.tempo < s.estilo.redeAte ? 1.25 : 1;
      return ganharAnimo(bater({ ...r, inimigo: { ...i, guardas: 0 } }, cheio * naRede), 5, a);
    }
    if (i.estado === 'sinal') return ganharAnimo(bater(r, base * 0.5 * muralha), 2, a);
    if (a.estilo === 'estrategista') return ganharAnimo(evento(bater(r, gigante ? 0 : base * 0.35), 'guarda', 'inimigo'), 1, a);
    // Na guarda: quase nada entra, e na terceira vez seguida ele contra-ataca.
    const guardas = i.guardas + 1;
    let g = evento(bater(r, gigante ? 0 : 1), 'guarda', 'inimigo');
    if (g.fim) return g;
    // QUEBRA-GUARDA (aprendido no Ludus): a terceira pancada seguida arrebenta a guarda.
    if (guardas >= GUARDAS_ATE_CONTRA && sabe('quebra-guarda')) {
      return ganharAnimo(evento({ ...g, inimigo: { ...g.inimigo, guardas: 0, estado: 'atordoado', estadoAte: g.tempo + 1000, combo: 0, contra: false } }, 'quebra', 'inimigo'), 10, a);
    }
    if (guardas >= GUARDAS_ATE_CONTRA) {
      g = evento({ ...g, inimigo: { ...g.inimigo, guardas: 0, contra: true, estado: 'sinal', estadoAte: g.tempo + CONTRA_ATAQUE(0).sinalMs } }, 'contra', 'inimigo');
      return g;
    }
    return { ...g, inimigo: { ...g.inimigo, guardas } };
  }
  if (acao === 'escudo') return { ...s, jogador: { ...j, folego, acao: 'escudo', acaoDesde: s.tempo, acaoAte: s.tempo + (a.estilo === 'guardiao' ? ESCUDO_SEGURO_MS : ESCUDO_MS) } };
  // ESQUIVA DUPLA (Octavius): a esquiva recarrega na metade do tempo. O Guardião, de armadura, demora mais.
  const recarga = a.tecnicas?.includes('esquiva-dupla') ? RECARGA_ESQUIVA_MS / 2 : RECARGA_ESQUIVA_MS;
  return { ...s, jogador: { ...j, folego, acao: 'esquiva', acaoDesde: s.tempo, acaoAte: s.tempo + ESQUIVA_MS, esquivaPronta: s.tempo + recarga } };
}

function bater(s: EstadoLuta, dano: number, especial = false): EstadoLuta {
  const vida = Math.max(0, s.inimigo.vida - dano);
  let r: EstadoLuta = { ...s, inimigo: { ...s.inimigo, vida } };
  if (!especial) r = evento(r, 'acerto', 'inimigo', Math.round(dano));
  if (vida <= 0) return { ...r, fim: 'vitoria' };
  // Troca de fase do chefão (fica mais rápido e muda os golpes).
  const limite = s.def.trocaDeFase?.[r.inimigo.fase];
  if (limite !== undefined && vida / s.def.vida <= limite && r.inimigo.fase + 1 < s.def.fases.length) {
    r = evento({ ...r, inimigo: { ...r.inimigo, fase: r.inimigo.fase + 1, ataque: 0, combo: 0 } }, 'fase', 'inimigo');
  }
  return r;
}

/** Terminou um golpe: se ainda tem combo, já prepara o próximo; senão, fica aberto. */
function depoisDoGolpe(s: EstadoLuta, at: AtaqueInimigo, abertoMs: number): EstadoLuta {
  const i = s.inimigo;
  const restantes = i.combo > 0 ? i.combo - 1 : (at.combo ?? 1) - 1;
  if (restantes > 0 && !i.contra) {
    return { ...s, inimigo: { ...i, estado: 'sinal', estadoAte: s.tempo + (at.comboMs ?? 380), combo: restantes } };
  }
  return { ...s, inimigo: { ...i, estado: 'aberto', estadoAte: s.tempo + abertoMs, ataque: i.contra ? i.ataque : i.ataque + 1, combo: 0, contra: false } };
}

/**
 * Esquivou ou bloqueou o primeiro golpe de um combo: continua protegido até o último,
 * sem gastar fôlego de novo (antes, o segundo golpe de um combo de fogo vinha antes da
 * esquiva recarregar e não dava para escapar: o Lucas não conseguia vencer a Fornalha).
 */
function protegerCombo(s: EstadoLuta, acao: 'esquiva' | 'escudo'): EstadoLuta {
  if (s.inimigo.estado !== 'sinal' || s.inimigo.combo <= 0) return s;
  return { ...s, jogador: { ...s.jogador, acao, acaoAte: s.inimigo.estadoAte + 80 } };
}

/** O golpe do inimigo chegou: o que o jogador estava fazendo decide o resultado. */
function impacto(s: EstadoLuta, at: AtaqueInimigo, a: AtributosLuta): EstadoLuta {
  const j = s.jogador;
  // Finta: o golpe não vem. Ele volta para a guarda logo (quem se defendeu à toa gastou fôlego).
  if (at.tipo === 'finta') {
    const fase = s.def.fases[s.inimigo.fase]!;
    const r = evento(s, 'finta', 'inimigo');
    return { ...r, inimigo: { ...r.inimigo, estado: 'espera', ataque: r.inimigo.ataque + 1, proximoEm: s.tempo + fase.pausaMs[0] * 0.5 } };
  }
  const fazendo = s.tempo < j.acaoAte ? j.acao : 'parado';
  const forca = 1 + (a.forca - 1) * 0.2;
  // ECLIPSE (Vidente): cego, o inimigo erra o golpe e fica aberto.
  if (s.estilo.cego > 0) {
    const r = evento({ ...s, estilo: { ...s.estilo, cego: s.estilo.cego - 1 } }, 'erro', 'inimigo', s.estilo.cego - 1);
    return depoisDoGolpe({ ...r, inimigo: { ...r.inimigo, combo: 0 } }, { ...at, combo: 1 }, at.abertoMs + 200);
  }
  // MURALHA DE LIVROS (Guardião): bloqueia tudo, até fogo, e metade do golpe volta para o inimigo.
  if (s.tempo < s.estilo.muralhaAte) {
    let r = bater(evento(s, 'bloqueio', 'jogador'), at.dano * 0.5 * forca);
    r = evento(r, 'reflexo', 'inimigo');
    if (r.fim) return r;
    return depoisDoGolpe(r, at, at.abertoMs);
  }
  const naHora = (janela: number) => s.tempo - j.acaoDesde <= janela;
  // ESPELHO DE SOL (Helios): escudo levantado bem na hora do golpe (até 260 ms antes) reflete o
  // ataque, até o fogo e a investida. O inimigo leva o golpe de volta e fica tonto.
  // ESPELHO (Helios): o fogo volta inteiro para quem soprou, e ele fica tonto.
  if (fazendo === 'escudo' && a.estilo === 'vidente' && at.tipo === 'fogo') {
    let r = bater(s, at.dano * (1 + (a.forca - 1) * 0.2));
    r = ganharAnimo(evento(r, 'reflexo', 'inimigo'), 12, a);
    if (r.fim) return r;
    return protegerCombo(depoisDoGolpe(r, at, at.abertoMs + 400), 'escudo');
  }
  if (fazendo === 'escudo' && a.tecnicas?.includes('espelho-de-sol') && s.tempo - j.acaoDesde <= 260) {
    let r = bater(s, at.dano * 0.8 * (1 + (a.forca - 1) * 0.2));
    r = ganharAnimo(evento(r, 'reflexo', 'inimigo'), 12, a);
    if (r.fim) return r;
    return protegerCombo(depoisDoGolpe(r, at, at.abertoMs + 300), 'escudo');
  }
  if (fazendo === 'esquiva' || fazendo === 'especial') {
    // Esquivou: escapa de tudo; no último golpe do combo, ele fica mais tempo aberto.
    let esquivou = ganharAnimo(evento(s, 'esquiva', 'jogador'), 12, a);
    let aberto = at.abertoMs + 250;
    if (fazendo === 'esquiva' && naHora(NA_HORA_ESQUIVA_MS)) {
      // Estrategista: esquiva na última hora faz o inimigo TROPEÇAR (fica aberto bem mais tempo).
      if (a.estilo === 'estrategista') {
        esquivou = ganharAnimo(evento(esquivou, 'tropeco', 'inimigo'), 4, a);
        aberto += 800;
      }
      // Vidente: esquiva na última hora junta LUZ (até 3), que fortalece o Eclipse.
      if (a.estilo === 'vidente') {
        aberto += 600;
        if (esquivou.estilo.luz < 3) esquivou = evento({ ...esquivou, estilo: { ...esquivou.estilo, luz: esquivou.estilo.luz + 1 } }, 'luz', 'jogador', esquivou.estilo.luz + 1);
      }
    }
    // Octavius rolou: está nas costas dele, o próximo golpe entra como contra-ataque.
    const dupla = a.tecnicas?.includes('esquiva-dupla') || a.estilo === 'estrategista' ? { ...esquivou, jogador: { ...esquivou.jogador, ripostaAte: s.tempo + 650 } } : esquivou;
    return protegerCombo(depoisDoGolpe(dupla, at, aberto), 'esquiva');
  }
  if (fazendo === 'escudo' && at.tipo === 'corpo') {
    let bloqueou = ganharAnimo(evento(s, 'bloqueio', 'jogador'), 8, a);
    // Guardião: bloqueio na última hora guarda uma PÁGINA (até 3).
    if (a.estilo === 'guardiao' && naHora(NA_HORA_ESCUDO_MS) && bloqueou.estilo.paginas < 3) {
      bloqueou = evento({ ...bloqueou, estilo: { ...bloqueou.estilo, paginas: bloqueou.estilo.paginas + 1 } }, 'pagina', 'jogador', bloqueou.estilo.paginas + 1);
    }
    // Helios: o espelho é frágil contra pancada, passa metade do golpe.
    if (a.estilo === 'vidente') {
      const vaza = Math.round((at.dano * 0.5) / (1 + (a.defesa - 1) * 0.15));
      const vida = Math.max(0, bloqueou.jogador.vida - vaza);
      bloqueou = evento({ ...bloqueou, jogador: { ...bloqueou.jogador, vida } }, 'dano', 'jogador', vaza);
      if (vida <= 0) return { ...bloqueou, fim: 'derrota' };
    }
    // Cassius sempre pode DEVOLVER logo depois de bloquear (os outros, com o contra-ataque do Ludus).
    const comContra =
      a.estilo === 'guardiao' ? { ...bloqueou, jogador: { ...bloqueou.jogador, ripostaAte: s.tempo + 1400 } } : a.tecnicas?.includes('contra-ataque') ? { ...bloqueou, jogador: { ...bloqueou.jogador, ripostaAte: s.tempo + 550 } } : bloqueou;
    return protegerCombo(depoisDoGolpe(comContra, at, at.abertoMs), 'escudo');
  }
  // Cassius: escudo levantado na hora certa segura até o fogo e a investida, inteiros.
  if (fazendo === 'escudo' && a.estilo === 'guardiao' && naHora(NA_HORA_ESCUDO_MS)) {
    const r = ganharAnimo(evento(s, 'bloqueio', 'jogador'), 8, a);
    return protegerCombo(depoisDoGolpe(r, at, at.abertoMs), 'escudo');
  }
  // Escudo contra fogo ou investida segura só metade (o do Guardião segura 75%; o espelho não para investida).
  const fator = fazendo === 'escudo' ? (a.estilo === 'guardiao' ? 0.25 : a.estilo === 'vidente' && at.tipo === 'investida' ? 1 : 0.5) : 1;
  const dano = Math.round((at.dano * fator) / (1 + (a.defesa - 1) * 0.15));
  const vida = Math.max(0, j.vida - dano);
  let r: EstadoLuta = evento({ ...s, jogador: { ...j, vida, acao: 'ferido', acaoDesde: s.tempo, acaoAte: s.tempo + FERIDO_MS } }, 'dano', 'jogador', dano);
  r = depoisDoGolpe(r, at, Math.round(at.abertoMs * 0.5));
  return vida <= 0 ? { ...r, fim: 'derrota' } : r;
}

export function passoLuta(s0: EstadoLuta, a: AtributosLuta = ATRIBUTOS_INICIAIS, aleatorio: Aleatorio = Math.random): EstadoLuta {
  if (s0.fim) return s0;
  const tempo = s0.tempo + TICK_LUTA;
  let s: EstadoLuta = { ...s0, tempo, eventos: s0.eventos.filter((e) => e.ate > tempo) };
  const j = s.jogador;
  const defendendo = tempo < j.acaoAte && (j.acao === 'escudo' || j.acao === 'esquiva');
  const folego = defendendo ? j.folego : Math.min(FOLEGO_MAX, j.folego + (FOLEGO_POR_SEGUNDO * TICK_LUTA) / 1000);
  s = { ...s, jogador: { ...j, folego, acao: j.acaoAte <= tempo && j.acao !== 'parado' ? 'parado' : j.acao } };
  const i = s.inimigo;
  const fase = s.def.fases[i.fase]!;
  if (i.estado === 'sinal' && tempo >= i.estadoAte) return impacto(s, ataqueAtual(s), a);
  if ((i.estado === 'aberto' || i.estado === 'atordoado') && tempo >= i.estadoAte) {
    const [min, max] = fase.pausaMs;
    return { ...s, inimigo: { ...i, estado: 'espera', guardas: 0, proximoEm: tempo + min + aleatorio() * (max - min) } };
  }
  if (i.estado === 'espera' && tempo >= i.proximoEm) {
    return { ...s, inimigo: { ...i, estado: 'sinal', estadoAte: tempo + ataqueAtual(s).sinalMs } };
  }
  return s;
}

/**
 * Os PLANOS do Octavius: de vez em quando aparece no cenário um barril, uma rede, o
 * gancho do guindaste... Tocar nele acerta o inimigo (não importa se ele está na guarda)
 * e deixa ele tonto. É o jeito do Octavius lutar: usar o que tiver em volta.
 */
export function usarPlano(s: EstadoLuta, a: AtributosLuta = ATRIBUTOS_INICIAIS): EstadoLuta {
  if (s.fim) return s;
  const r = bater({ ...s, inimigo: { ...s.inimigo, guardas: 0 } }, 12 * (1 + (a.forca - 1) * 0.2));
  if (r.fim) return evento(r, 'plano', 'inimigo');
  return ganharAnimo(evento({ ...r, inimigo: { ...r.inimigo, estado: 'atordoado', estadoAte: s.tempo + 1000, combo: 0, contra: false } }, 'plano', 'inimigo'), 10, a);
}

/** O jeito da luta agora (vale o da fase, se a fase tiver; senão, o do inimigo). */
export function modoDaLuta(s: EstadoLuta): { escuro: boolean; ilusoes: boolean; escudoGigante: boolean } {
  const f = s.def.fases[s.inimigo.fase];
  return {
    escuro: !!(f?.escuro ?? s.def.escuro),
    ilusoes: !!(f?.ilusoes ?? s.def.ilusoes),
    escudoGigante: !!(f?.escudoGigante ?? s.def.escudoGigante),
  };
}
