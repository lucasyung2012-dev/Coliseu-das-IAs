import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { INIMIGOS } from '@/game/historia/inimigos';
import { agir, usarPlano, ANIMO_MAX, ataqueAtual, ATRIBUTOS_INICIAIS, FOLEGO_MAX, novaLuta, passoLuta, TICK_LUTA, type AtributosLuta, type EstadoLuta, type EventoLuta } from '@/game/historia/luta';
import type { Fala, Falante, Lugar } from '@/game/historia/roteiro';
import Sprite, { type Paleta } from '@/ui/pixel/Sprite';
import {
  CAPITAO_INCINERADOR,
  DECURIAO,
  FORNALHA,
  GLADIADOR_SUCATA,
  INCINERADOR,
  INCINERADOR_GUERRA,
  INCINERADOR_LANCA,
  INCINERADOR_VELOZ,
  PALETA_CAPITAO,
  PALETA_GUERRA,
  PALETA_INCINERADOR,
  PALETA_LANCA,
  PALETA_PRETORIANO,
  PALETA_SUCATA,
  paletaFornalha,
  PRETORIANO_BATEDOR,
  PRETORIANO_LANCEIRO,
} from '@/ui/pixel/historia';
import {
  CAO_DE_FERRO,
  CENSOR_TITA,
  DIMAQUERO,
  MARINHEIRO_FERRO,
  MIRMILAO_BRONZE,
  PALETA_ALMIRANTE,
  PALETA_CAO_DE_FERRO,
  PALETA_DIMAQUERO,
  PALETA_MARINHEIRO,
  PALETA_MIRMILAO,
  PALETA_PRETOR,
  PALETA_RATO,
  PALETA_RETIARIO,
  ALMIRANTE_FERRUGEM,
  ARQUIVISTA,
  LEAO_MECANICO,
  paletaArquivista,
  paletaLeao,
  paletaTita,
  PRETOR_DE_ACO,
  RATO_ENGRENAGEM,
  RETIARIO_MECANICO,
} from '@/ui/pixel/historia2';
import { BRUTUS, PALETA_BRUTUS } from '@/ui/pixel/historia';
import {
  CAPATAZ,
  COZINHEIRO_BORDO,
  FEITOR_TAMBOR,
  GUARDA_CHICOTE,
  PALETA_CAPATAZ,
  PALETA_COZINHEIRO,
  PALETA_FEITOR,
  PALETA_GUARDA_CHICOTE,
  COBRADOR,
  LEVIATA,
  paletaCobrador,
  paletaLeviata,
  PALETA_TOURO,
  TOURO_BRONZE,
} from '@/ui/pixel/historia3';
import {
  ALMIRANTE_ACO,
  CAMPEAO_NAVAL,
  FEIRANTE_AUTOMATO,
  GATO_FERRO,
  GUARDA_FEIRA,
  IMEDIATO_FERRO,
  JACARE_ESGOTO,
  LIMPADOR_ESGOTO,
  MERGULHADOR,
  PALETA_CAMPEAO_NAVAL,
  PALETA_FEIRANTE,
  PALETA_GATO_FERRO,
  PALETA_GUARDA_FEIRA,
  PALETA_IMEDIATO,
  PALETA_JACARE,
  PALETA_LIMPADOR,
  PALETA_MERGULHADOR,
  PALETA_SENTINELA,
  PALETA_TRITAO,
  PALETA_VIGIA_TELHADO,
  paletaAlmiranteAco,
  SENTINELA_CAIS,
  TRITAO_MECANICO,
  VIGIA_TELHADO,
} from '@/ui/pixel/historia4';
import {
  APAGADOR,
  APAGADOR_GRANDE,
  CACADOR_SOMBRAS,
  ECLIPSE,
  ESTATUA_VIVA,
  GIGANTE_SOMBRAS,
  GUARDA_AQUEDUTO,
  GUARDIAO_AQUEDUTO,
  MORCEGO_MECANICO,
  PALETA_APAGADOR,
  PALETA_APAGADOR_GRANDE,
  PALETA_CACADOR,
  PALETA_ESTATUA,
  PALETA_GUARDA_AQUEDUTO,
  PALETA_MORCEGO,
  PALETA_PRETORIANO_NOTURNO,
  PALETA_SACERDOTE,
  paletaEclipse,
  paletaGiganteSombras,
  paletaGuardiaoAqueduto,
  paletaSibilaCorrompida,
  PRETORIANO_NOTURNO,
  SACERDOTE_BRONZE,
  SIBILA_CORROMPIDA,
} from '@/ui/pixel/historia5';
import { desbloquear } from '@/ui/som';
import { tocar, type SomHistoria } from '@/ui/somHistoria';
import { Falas, Palco } from './Cenas';
import { Retrato } from './Cenarios';

/** O desenho e o tamanho de cada inimigo (em % da largura da cena). */
const VISUAL: Record<string, { grade: string[]; paleta: Paleta; largura: number }> = {
  incinerador: { grade: INCINERADOR, paleta: PALETA_INCINERADOR, largura: 13 },
  'incinerador-veloz': { grade: INCINERADOR_VELOZ, paleta: { ...PALETA_INCINERADOR, F: '#4ab0ff', Y: '#c8f0ff', M: '#4a5a7a', W: '#8aa0c8' }, largura: 15 },
  'incinerador-lanca-chamas': { grade: INCINERADOR_LANCA, paleta: PALETA_LANCA, largura: 17 },
  'incinerador-duplo': { grade: INCINERADOR_GUERRA, paleta: PALETA_GUERRA, largura: 15 },
  'capitao-incinerador': { grade: CAPITAO_INCINERADOR, paleta: PALETA_CAPITAO, largura: 16 },
  'pretoriano-batedor': { grade: PRETORIANO_BATEDOR, paleta: PALETA_PRETORIANO, largura: 13 },
  'pretoriano-lanceiro': { grade: PRETORIANO_LANCEIRO, paleta: PALETA_PRETORIANO, largura: 13 },
  'pretoriano-veterano': { grade: DECURIAO, paleta: { ...PALETA_PRETORIANO, S: '#d8c070', s: '#8a7030' }, largura: 14 },
  'gladiador-de-sucata': { grade: GLADIADOR_SUCATA, paleta: PALETA_SUCATA, largura: 19 },
  'boneco-de-treino': { grade: BRUTUS, paleta: PALETA_BRUTUS, largura: 17 },
  'caes-de-ferro': { grade: CAO_DE_FERRO, paleta: PALETA_CAO_DE_FERRO, largura: 20 },
  'rato-engrenagem': { grade: RATO_ENGRENAGEM, paleta: PALETA_RATO, largura: 13 },
  'rato-rei': { grade: RATO_ENGRENAGEM, paleta: { ...PALETA_RATO, E: '#ffd04a' }, largura: 19 },
  'patrulha-catacumba': { grade: PRETORIANO_LANCEIRO, paleta: { ...PALETA_PRETORIANO, R: '#5a3a6a', C: '#3a2a4a' }, largura: 13 },
  'patrulha-sargento': { grade: PRETORIANO_BATEDOR, paleta: { ...PALETA_PRETORIANO, R: '#5a3a6a', C: '#3a2a4a', S: '#c8b070' }, largura: 14 },
  'pretoriano-escudeiro': { grade: DECURIAO, paleta: PALETA_PRETORIANO, largura: 14 },
  'pretoriano-lanceiro-elite': { grade: PRETORIANO_LANCEIRO, paleta: { ...PALETA_PRETORIANO, S: '#e0e4f0', R: '#e04a3a' }, largura: 14 },
  'pretoriano-incendiario': { grade: PRETORIANO_BATEDOR, paleta: { ...PALETA_PRETORIANO, R: '#ff6a2a', C: '#a83a10', E: '#ffd04a' }, largura: 14 },
  'centuriao-de-aco': { grade: DECURIAO, paleta: { ...PALETA_PRETORIANO, S: '#f2c14e', s: '#8a6a1a', R: '#8a1a1a' }, largura: 15 },
  'pretor-de-aco': { grade: PRETOR_DE_ACO, paleta: PALETA_PRETOR, largura: 22 },
  'retiario-mecanico': { grade: RETIARIO_MECANICO, paleta: PALETA_RETIARIO, largura: 19 },
  'mirmilao-bronze': { grade: MIRMILAO_BRONZE, paleta: PALETA_MIRMILAO, largura: 19 },
  dimaquero: { grade: DIMAQUERO, paleta: PALETA_DIMAQUERO, largura: 18 },
  'marinheiro-ferro': { grade: MARINHEIRO_FERRO, paleta: PALETA_MARINHEIRO, largura: 15 },
  'marinheiro-arpao': { grade: MARINHEIRO_FERRO, paleta: { ...PALETA_MARINHEIRO }, largura: 15 },
  'marinheiro-canhao': { grade: MARINHEIRO_FERRO, paleta: { ...PALETA_MARINHEIRO }, largura: 16 },
  'contramestre-ferro': { grade: MARINHEIRO_FERRO, paleta: { ...PALETA_MARINHEIRO }, largura: 18 },
  'almirante-ferrugem': { grade: ALMIRANTE_FERRUGEM, paleta: PALETA_ALMIRANTE, largura: 22 },
  'guarda-chicote': { grade: GUARDA_CHICOTE, paleta: PALETA_GUARDA_CHICOTE, largura: 15 },
  'cozinheiro-bordo': { grade: COZINHEIRO_BORDO, paleta: PALETA_COZINHEIRO, largura: 17 },
  'marujo-ferro': { grade: MARINHEIRO_FERRO, paleta: { ...PALETA_MARINHEIRO, E: '#ffd04a' }, largura: 16 },
  capataz: { grade: CAPATAZ, paleta: PALETA_CAPATAZ, largura: 18 },
  'feitor-tambor': { grade: FEITOR_TAMBOR, paleta: PALETA_FEITOR, largura: 24 },
  'valentao-celas': { grade: GLADIADOR_SUCATA, paleta: { ...PALETA_SUCATA, G: '#6a4a3a', g: '#a8806a', E: '#ffd04a', A: '#5a3a2a' }, largura: 18 },
  'touro-bronze': { grade: TOURO_BRONZE, paleta: { ...PALETA_TOURO, E: '#ffb02a' }, largura: 26 },
  'vigia-telhado': { grade: VIGIA_TELHADO, paleta: PALETA_VIGIA_TELHADO, largura: 15 },
  'gato-ferro': { grade: GATO_FERRO, paleta: PALETA_GATO_FERRO, largura: 20 },
  'vigia-chefe': { grade: VIGIA_TELHADO, paleta: { ...PALETA_VIGIA_TELHADO, E: '#ffd04a' }, largura: 17 },
  'jacare-esgoto': { grade: JACARE_ESGOTO, paleta: PALETA_JACARE, largura: 26 },
  'limpador-esgoto': { grade: LIMPADOR_ESGOTO, paleta: PALETA_LIMPADOR, largura: 16 },
  'jacare-rei': { grade: JACARE_ESGOTO, paleta: { ...PALETA_JACARE, E: '#ffd04a' }, largura: 32 },
  'feirante-automato': { grade: FEIRANTE_AUTOMATO, paleta: PALETA_FEIRANTE, largura: 16 },
  'guarda-feira': { grade: GUARDA_FEIRA, paleta: PALETA_GUARDA_FEIRA, largura: 16 },
  'feirante-chefe': { grade: FEIRANTE_AUTOMATO, paleta: { ...PALETA_FEIRANTE, E: '#ffd04a' }, largura: 18 },
  'guarda-cofre': { grade: GUARDA_FEIRA, paleta: { ...PALETA_GUARDA_FEIRA, E: '#ffd04a' }, largura: 17 },
  'sentinela-cais': { grade: SENTINELA_CAIS, paleta: PALETA_SENTINELA, largura: 15 },
  'imediato-ferro': { grade: IMEDIATO_FERRO, paleta: PALETA_IMEDIATO, largura: 18 },
  'tritao-mecanico': { grade: TRITAO_MECANICO, paleta: PALETA_TRITAO, largura: 18 },
  mergulhador: { grade: MERGULHADOR, paleta: PALETA_MERGULHADOR, largura: 17 },
  'mergulhador-elite': { grade: MERGULHADOR, paleta: { ...PALETA_MERGULHADOR, E: '#ffd04a' }, largura: 18 },
  'campeao-naval': { grade: CAMPEAO_NAVAL, paleta: PALETA_CAMPEAO_NAVAL, largura: 20 },
  apagador: { grade: APAGADOR, paleta: PALETA_APAGADOR, largura: 15 },
  'morcego-mecanico': { grade: MORCEGO_MECANICO, paleta: PALETA_MORCEGO, largura: 16 },
  'pretoriano-noturno': { grade: PRETORIANO_NOTURNO, paleta: PALETA_PRETORIANO_NOTURNO, largura: 15 },
  'apagador-grande': { grade: APAGADOR_GRANDE, paleta: PALETA_APAGADOR_GRANDE, largura: 18 },
  'morcego-enxame': { grade: MORCEGO_MECANICO, paleta: { ...PALETA_MORCEGO, E: '#ffd04a' }, largura: 20 },
  'vigia-noturno': { grade: PRETORIANO_NOTURNO, paleta: { ...PALETA_PRETORIANO_NOTURNO, E: '#ffd04a' }, largura: 15 },
  'morcego-gigante': { grade: MORCEGO_MECANICO, paleta: PALETA_MORCEGO, largura: 22 },
  'pretoriano-besteiro': { grade: PRETORIANO_NOTURNO, paleta: PALETA_PRETORIANO_NOTURNO, largura: 16 },
  'cacador-aprendiz': { grade: CACADOR_SOMBRAS, paleta: { ...PALETA_CACADOR, E: '#ffd04a' }, largura: 16 },
  'gato-telhado': { grade: GATO_FERRO, paleta: { ...PALETA_GATO_FERRO, E: '#ffd04a' }, largura: 20 },
  'cacador-sombras': { grade: CACADOR_SOMBRAS, paleta: PALETA_CACADOR, largura: 20 },
  'carcereiro-noturno': { grade: PRETORIANO_NOTURNO, paleta: { ...PALETA_PRETORIANO_NOTURNO, E: '#ff8a3a' }, largura: 16 },
  'apagador-espiao': { grade: APAGADOR, paleta: PALETA_APAGADOR, largura: 16 },
  'estatua-treino': { grade: ESTATUA_VIVA, paleta: { ...PALETA_ESTATUA, E: '#ffd04a' }, largura: 17 },
  'guarda-aqueduto': { grade: GUARDA_AQUEDUTO, paleta: PALETA_GUARDA_AQUEDUTO, largura: 16 },
  'morcego-aqueduto': { grade: MORCEGO_MECANICO, paleta: PALETA_MORCEGO, largura: 18 },
  'guarda-comporta': { grade: GUARDA_AQUEDUTO, paleta: { ...PALETA_GUARDA_AQUEDUTO, E: '#ffd04a' }, largura: 17 },
  'apagador-aqueduto': { grade: APAGADOR_GRANDE, paleta: PALETA_APAGADOR_GRANDE, largura: 18 },
  'pretoriano-noturno-elite': { grade: PRETORIANO_NOTURNO, paleta: { ...PALETA_PRETORIANO_NOTURNO, E: '#ffd04a' }, largura: 17 },
  'sacerdote-bronze': { grade: SACERDOTE_BRONZE, paleta: PALETA_SACERDOTE, largura: 15 },
  'estatua-viva': { grade: ESTATUA_VIVA, paleta: PALETA_ESTATUA, largura: 17 },
  'sacerdote-incenso': { grade: SACERDOTE_BRONZE, paleta: { ...PALETA_SACERDOTE, E: '#ffd04a' }, largura: 16 },
  'estatua-arqueira': { grade: ESTATUA_VIVA, paleta: PALETA_ESTATUA, largura: 17 },
  'sacerdote-supremo': { grade: SACERDOTE_BRONZE, paleta: { ...PALETA_SACERDOTE, E: '#ff3a3a' }, largura: 19 },
  'apagador-colosso': { grade: APAGADOR_GRANDE, paleta: { ...PALETA_APAGADOR_GRANDE, E: '#ffd04a' }, largura: 22 },
  'morcego-eclipse': { grade: MORCEGO_MECANICO, paleta: PALETA_MORCEGO, largura: 22 },
  'gladiador-sombra': { grade: CACADOR_SOMBRAS, paleta: PALETA_CACADOR, largura: 18 },
  'pretoriano-eclipse': { grade: PRETORIANO_NOTURNO, paleta: PALETA_PRETORIANO_NOTURNO, largura: 17 },
  'campeao-sombrio': { grade: CACADOR_SOMBRAS, paleta: { ...PALETA_CACADOR, E: '#ff3a3a' }, largura: 21 },
};

/** Larguras dos inimigos que mudam de cor com a fase (desenhados à parte). */
const LARGURA_ESPECIAL: Record<string, number> = { fornalha: 30, arquivista: 20, 'leao-mecanico': 32, 'censor-tita': 38, 'censor-tita-octavius': 38, 'censor-tita-helios': 38, eclipse: 26, 'guardiao-aqueduto': 26, 'sibila-corrompida': 20, 'gigante-sombras': 32, cobrador: 22, leviata: 34, 'almirante-aco': 24 };

function SpriteInimigo({ e }: { e: EstadoLuta }) {
  const sinalFogo = e.inimigo.estado === 'sinal' && ataqueAtual(e).tipo === 'fogo';
  if (e.def.id === 'fornalha') return <Sprite grade={FORNALHA} paleta={paletaFornalha(sinalFogo, e.inimigo.fase)} espelhar />;
  if (e.def.id === 'arquivista') return <Sprite grade={ARQUIVISTA} paleta={paletaArquivista(false)} espelhar />;
  if (e.def.id === 'leao-mecanico') return <Sprite grade={LEAO_MECANICO} paleta={paletaLeao(e.inimigo.fase > 0 || sinalFogo)} espelhar />;
  if (e.def.id === 'eclipse') return <Sprite grade={ECLIPSE} paleta={paletaEclipse(e.inimigo.fase)} espelhar />;
  if (e.def.id === 'guardiao-aqueduto') return <Sprite grade={GUARDIAO_AQUEDUTO} paleta={paletaGuardiaoAqueduto(e.inimigo.fase)} espelhar />;
  if (e.def.id === 'sibila-corrompida') return <Sprite grade={SIBILA_CORROMPIDA} paleta={paletaSibilaCorrompida(e.inimigo.fase)} espelhar />;
  if (e.def.id === 'gigante-sombras') return <Sprite grade={GIGANTE_SOMBRAS} paleta={paletaGiganteSombras(e.inimigo.fase)} espelhar />;
  if (e.def.id === 'censor-tita' || e.def.id === 'censor-tita-octavius' || e.def.id === 'censor-tita-helios') return <Sprite grade={CENSOR_TITA} paleta={paletaTita(e.inimigo.fase)} espelhar />;
  if (e.def.id === 'cobrador') return <Sprite grade={COBRADOR} paleta={paletaCobrador(e.inimigo.fase > 0 || sinalFogo)} espelhar />;
  if (e.def.id === 'leviata') return <Sprite grade={LEVIATA} paleta={paletaLeviata(e.inimigo.fase)} espelhar />;
  if (e.def.id === 'almirante-aco') return <Sprite grade={ALMIRANTE_ACO} paleta={paletaAlmiranteAco(e.inimigo.fase)} espelhar />;
  const v = VISUAL[e.def.id] ?? VISUAL.incinerador!;
  return <Sprite grade={v.grade} paleta={v.paleta} espelhar />;
}

function Barra({ valor, max, cor, rotulo, fina = false }: { valor: number; max: number; cor: string; rotulo: string; fina?: boolean }) {
  return (
    <div role="meter" aria-label={rotulo} aria-valuenow={Math.round(valor)} aria-valuemin={0} aria-valuemax={max} className={`w-full border border-black bg-black/60 ${fina ? 'h-1.5 sm:h-2' : 'h-2.5 sm:h-3'}`}>
      <div className="h-full transition-[width] duration-150" style={{ width: `${(valor / max) * 100}%`, background: cor }} />
    </div>
  );
}

const SOM: Partial<Record<string, SomHistoria>> = {
  acerto: 'espadas',
  bloqueio: 'escudoMetal',
  esquiva: 'esquiva',
  dano: 'dano',
  especial: 'especial',
  fase: 'fase',
  guarda: 'guarda',
  finta: 'finta',
  contra: 'contra',
  cansado: 'cansado',
  riposta: 'riposta',
  quebra: 'quebra',
  plano: 'plano',
  reflexo: 'reflexo',
  aliado: 'aliado',
};
const TEXTO: Record<string, string> = {
  bloqueio: 'BLOQUEOU!',
  esquiva: 'ESQUIVOU!',
  especial: '⭐ ESPECIAL!',
  guarda: 'NA GUARDA',
  fase: '🔥 FURIOSO!',
  finta: 'FINTA!',
  contra: '⚠ CONTRA-ATAQUE!',
  cansado: 'SEM FÔLEGO',
  riposta: '⚡ CONTRA-ATAQUE!',
  plano: '⚓ PLANO B!',
  reflexo: '☀️ REFLETIU!',
  quebra: '💥 GUARDA QUEBRADA!',
  aliado: '',
};

/** O que pode aparecer no cenário para o Octavius usar (no porto, no navio...). */
const PLANOS = [
  { icone: '🛢️', nome: 'ROLAR O BARRIL' },
  { icone: '🕸️', nome: 'REDE DE PESCA' },
  { icone: '🪝', nome: 'GANCHO DO GUINDASTE' },
  { icone: '🪢', nome: 'PUXAR A CORDA' },
  { icone: '📦', nome: 'CAIXOTE NA CABEÇA' },
];

/** Faíscas voando para todos os lados, um corte e um anel: o impacto de um golpe. */
function Impacto({ x, cor, corte = false, grande = false }: { x: string; cor: string; corte?: boolean; grande?: boolean }) {
  const n = grande ? 14 : 9;
  return (
    <span className="pointer-events-none absolute bottom-[34%] z-20 h-0 w-0" style={{ left: x }} aria-hidden>
      <span className="anel-impacto absolute h-16 w-16 rounded-full border-4 sm:h-24 sm:w-24" style={{ borderColor: cor, left: '-2rem', top: '-2rem' }} />
      {corte && <span className="corte-golpe absolute -left-10 -top-1 h-1.5 w-20 bg-white shadow-[0_0_8px_#fff] sm:-left-14 sm:w-28" />}
      {Array.from({ length: n }, (_, k) => {
        const ang = (k / n) * Math.PI * 2 + (k % 2) * 0.3;
        const dist = (grande ? 70 : 42) + (k % 3) * 12;
        return (
          <span
            key={k}
            className="faisca-voa absolute h-1.5 w-1.5 sm:h-2 sm:w-2"
            style={{ background: k % 3 ? cor : '#ffffff', '--dx': `${Math.cos(ang) * dist}px`, '--dy': `${Math.sin(ang) * dist}px` } as CSSProperties}
          />
        );
      })}
    </span>
  );
}

/**
 * A luta do modo História: falas antes, a luta, falas depois. Perdeu? Tenta de novo.
 * Controles: ⚔️ golpe, 🛡️ escudo, 💨 esquiva e ⭐ especial (Ânimo cheio).
 * Teclado: J golpe, K escudo, L esquiva, espaço especial.
 * No Coliseu, o Ânimo vem da PLATEIA: ela começa vaiando e muda de lado com as boas jogadas.
 */
export function LutaHistoria({
  lugar,
  inimigo,
  heroi,
  antes,
  depois,
  onFim,
  atributos = ATRIBUTOS_INICIAIS,
  treino,
  onVitoria,
}: {
  lugar: Lugar;
  inimigo: string;
  heroi: Falante;
  antes?: Fala[];
  depois?: Fala[];
  onFim: () => void;
  /** Força, defesa, vida, carisma e os golpes aprendidos (vêm do save). */
  atributos?: AtributosLuta;
  /** Treino do Ludus: o objetivo é fazer `quantos` vezes o evento; não dá para perder. */
  treino?: { evento: EventoLuta['tipo']; quantos: number; rotulo: string };
  /** Venceu: recebe as peças de máquina que o inimigo deixou. */
  onVitoria?: (pecas: number) => void;
}) {
  const def = INIMIGOS[inimigo]!;
  const noColiseu = lugar === 'coliseu-arena' || lugar === 'coliseu-noite';
  // O Octavius luta com PLANOS: coisas do cenário que aparecem e dá para usar.
  const comPlanos = heroi === 'octavius' && !treino;
  const [planosUsados, setPlanosUsados] = useState<number[]>([]);
  // Luta no escuro (Helios): só se vê o sinal com a LUZ (dura 4 s e recarrega em 5,5 s).
  const escuro = !!def.escuro;
  const [luzAte, setLuzAte] = useState(0);
  const [luzPronta, setLuzPronta] = useState(0);
  const acenderRef = useRef<() => void>(() => undefined);
  const [feitos, setFeitos] = useState(0);
  const [fase, setFase] = useState<'antes' | 'luta' | 'depois' | 'derrota'>(antes?.length ? 'antes' : 'luta');
  const [e, setE] = useState<EstadoLuta>(() => novaLuta(def, atributos));
  const [tentativas, setTentativas] = useState(1);
  const visto = useRef(0);
  // Golpes seguidos sem apanhar (o COMBO na tela).
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    if (fase !== 'luta') return;
    const id = window.setInterval(() => setE((s) => passoLuta(s, atributos)), TICK_LUTA);
    return () => window.clearInterval(id);
  }, [fase]);

  // Fim da luta e os sons de cada acontecimento.
  useEffect(() => {
    for (const ev of e.eventos) {
      if (ev.id <= visto.current) continue;
      const som = SOM[ev.tipo];
      if (som) tocar(som);
      if (ev.tipo === 'acerto' || ev.tipo === 'especial' || ev.tipo === 'plano') setCombo((c) => c + 1);
      if (ev.tipo === 'dano' || ev.tipo === 'contra') setCombo(0);
      if (treino && ev.tipo === treino.evento) setFeitos((n) => n + 1);
    }
    visto.current = Math.max(visto.current, ...e.eventos.map((x) => x.id), 0);
    if (fase === 'luta' && e.fim === 'vitoria') {
      tocar('vitoria');
      onVitoria?.(def.pecas ?? (def.chefao ? 6 : 2));
      if (noColiseu) tocar('plateia');
      setFase('depois');
    }
    if (fase === 'luta' && e.fim === 'derrota') {
      // No treino não tem derrota: o Brutus te levanta e segue.
      if (treino) {
        setE(novaLuta(def, atributos));
        return;
      }
      tocar('derrota');
      setFase('derrota');
    }
  }, [e]);

  const apertar = (acao: 'golpe' | 'escudo' | 'esquiva' | 'especial') => {
    if (fase !== 'luta') return;
    desbloquear();
    setE((s) => agir(s, acao, atributos));
  };

  useEffect(() => {
    if (fase !== 'luta') return;
    const tecla = (ev: KeyboardEvent) => {
      if (ev.repeat) return;
      const k = ev.key.toLowerCase();
      if (k === 'j' || k === 'arrowright') apertar('golpe');
      else if (k === 'k' || k === 'arrowdown') apertar('escudo');
      else if (k === 'l' || k === 'arrowleft') apertar('esquiva');
      else if (k === 'u') acenderRef.current();
      else if (k === ' ') {
        ev.preventDefault();
        apertar('especial');
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [fase]);

  const j = e.jogador;
  const i = e.inimigo;
  const at = ataqueAtual(e);
  const sinal = i.estado === 'sinal';
  const corSinal = at.tipo === 'corpo' ? '#ffd04a' : at.tipo === 'finta' ? '#ffd04a' : '#ff3a3a';
  const cheio = e.animo >= ANIMO_MAX;
  const acaoJ = e.tempo < j.acaoAte ? j.acao : 'parado';
  const largura = LARGURA_ESPECIAL[def.id] ?? VISUAL[def.id]?.largura ?? 13;
  const apanhou = e.eventos.some((ev) => ev.tipo === 'acerto' && ev.ate - e.tempo > 550);
  const plateiaLado = e.animo >= 50;
  // O inimigo avança quando o golpe dele chega; cai quando perde.
  const atacou = e.eventos.some((ev) => (ev.tipo === 'dano' || ev.tipo === 'bloqueio' || ev.tipo === 'esquiva') && ev.ate - e.tempo > 450);
  const vencido = e.fim === 'vitoria';
  // O Arquivista: nas fintas, quem treme são as cópias falsas; a verdadeira fica parada.
  const ilusao = !!def.ilusoes && sinal && at.tipo === 'finta';
  // No escuro, o sinal do inimigo só aparece com a LUZ acesa.
  const aceso = !escuro || e.tempo < luzAte;
  const podeLuz = escuro && fase === 'luta' && e.tempo >= luzPronta;
  acenderRef.current = () => {
    if (!podeLuz) return;
    desbloquear();
    tocar('reflexo');
    setLuzAte(e.tempo + 4000);
    setLuzPronta(e.tempo + 5500);
  };
  const aliado = e.eventos.find((ev) => ev.tipo === 'aliado');
  const quemAjuda = aliado && def.aliados ? (def.aliados[aliado.valor ?? 0] as Falante | undefined) : undefined;

  // Treino: chegou no objetivo, acabou (as falas de "depois" aparecem).
  useEffect(() => {
    if (treino && fase === 'luta' && feitos >= treino.quantos) {
      tocar('vitoria');
      setFase('depois');
    }
  }, [feitos]);

  return (
    <div className="flex flex-col gap-2">
      <Palco lugar={lugar} className={acaoJ === 'ferido' ? 'tremer-forte' : ''}>
        {/* Placar: vida dos dois, o fôlego e o Ânimo (ou a plateia, no Coliseu) */}
        <div className="absolute inset-x-2 top-2 z-20 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-pixel text-[7px] text-white [text-shadow:1px_1px_0_#000] sm:text-[9px]">{heroi.toUpperCase()}</span>
            <Barra valor={j.vida} max={j.vidaMax} cor="#4ad46a" rotulo="Sua vida" />
            <Barra valor={j.folego} max={FOLEGO_MAX} cor={j.folego < 25 ? '#ff8a3a' : '#5ab0ff'} rotulo="Fôlego" fina />
            <Barra valor={e.animo} max={ANIMO_MAX} cor={cheio ? '#f2c14e' : '#c8962a'} rotulo={noColiseu ? 'Plateia' : 'Ânimo'} />
            <span className={`font-pixel text-[6px] sm:text-[8px] ${cheio ? 'piscar text-[#f2c14e]' : 'text-white/70'}`}>
              {cheio ? (noColiseu ? '📣 A PLATEIA GRITA SEU NOME!' : '⭐ ÂNIMO CHEIO!') : noColiseu ? (plateiaLado ? '👏 A PLATEIA MUDOU DE LADO' : '👎 A PLATEIA VAIA') : 'ÂNIMO'}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="font-pixel text-[7px] text-white [text-shadow:1px_1px_0_#000] sm:text-[9px]">
              {def.chefao && '👑 '}
              {def.nome.toUpperCase()}
              {def.trocaDeFase && ` · FASE ${i.fase + 1}`}
            </span>
            <Barra valor={i.vida} max={def.vida} cor="#e04a3a" rotulo={`Vida de ${def.nome}`} />
          </div>
        </div>

        {/* Sombras no chão */}
        <span className="pointer-events-none absolute bottom-[12%] left-[22%] z-[9] h-[4%] w-[11%] -translate-x-1/2 rounded-[50%] bg-black/50" aria-hidden style={{ scale: acaoJ === 'esquiva' ? '0.6' : '1', transition: 'scale 120ms' }} />
        {!vencido && <span className="pointer-events-none absolute bottom-[10%] left-[70%] z-[9] h-[4%] -translate-x-1/2 rounded-[50%] bg-black/50" style={{ width: `${largura * 0.85}%` }} aria-hidden />}

        {/* A sombra que fica para trás na esquiva */}
        {acaoJ === 'esquiva' && (
          <div className="rastro-esquiva pointer-events-none absolute bottom-[14%] left-[22%] z-[9] w-[13%] -translate-x-1/2 opacity-40" aria-hidden>
            <Retrato quem={heroi} />
          </div>
        )}

        {/* O herói */}
        <div
          className={`absolute bottom-[14%] left-[22%] z-10 w-[13%] -translate-x-1/2 ${acaoJ === 'golpe' || acaoJ === 'especial' ? 'investida-dir' : acaoJ === 'parado' ? 'respirar-t' : ''}`}
          style={{
            translate: acaoJ === 'esquiva' ? '-60% -22%' : acaoJ === 'ferido' ? '-18% 0' : undefined,
            transition: 'translate 120ms ease-out',
            filter: acaoJ === 'ferido' ? 'brightness(2.4) saturate(0)' : acaoJ === 'especial' ? 'drop-shadow(0 0 12px #f2c14e)' : undefined,
          }}
        >
          <Retrato quem={heroi} />
          {acaoJ === 'escudo' && (
            <span className="absolute -right-[40%] top-[15%] text-3xl drop-shadow-[0_0_8px_#9fe8ff] sm:text-5xl" aria-hidden>
              🛡️
            </span>
          )}
        </div>

        {/* O inimigo, com o sinal antes do ataque */}
        <div
          className={`absolute bottom-[12%] left-[70%] z-10 -translate-x-1/2 ${vencido ? 'inimigo-vencido' : atacou ? 'investida-esq' : sinal && !ilusao ? 'tremer-t' : ilusao ? 'respirar-t' : def.chefao || def.id.startsWith('pretoriano') || def.id === 'gladiador-de-sucata' ? 'respirar-t' : 'flutuar'}`}
          style={{
            width: `${largura}%`,
            translate: apanhou && !vencido ? '8% 0' : undefined,
            transition: 'translate 90ms ease-out',
            filter: apanhou ? 'brightness(2.6)' : !aceso ? 'brightness(0.55) saturate(0.4)' : sinal && !ilusao ? `drop-shadow(0 0 10px ${corSinal})` : i.estado === 'atordoado' ? 'saturate(0.3)' : undefined,
          }}
        >
          <SpriteInimigo e={e} />
          {/* fumaça saindo da chaminé da Fornalha */}
          {def.id === 'fornalha' &&
            [0, 1, 2].map((k) => (
              <span
                key={k}
                className="fumaca-subindo absolute left-[46%] top-[-6%] h-[8%] w-[10%] rounded-full bg-[#3a3a3a]/70"
                style={{ animationDelay: `${k * 600}ms` }}
                aria-hidden
              />
            ))}
          {sinal && !ilusao && aceso && (
            <span
              className="absolute -top-[22%] left-1/2 -translate-x-1/2 whitespace-nowrap border-2 border-black px-1 font-pixel text-[7px] text-black sm:text-[10px]"
              style={{ background: corSinal }}
            >
              ! {at.tipo === 'corpo' || at.tipo === 'finta' ? '🛡️ DEFENDA' : '💨 ESQUIVE'}
              {i.contra && ' (RÁPIDO!)'}
            </span>
          )}
          {(i.estado === 'aberto' || i.estado === 'atordoado') && (
            <span className="absolute -top-[22%] left-1/2 -translate-x-1/2 whitespace-nowrap border-2 border-black bg-[#4ad46a] px-1 font-pixel text-[7px] text-black sm:text-[10px]">
              {i.estado === 'atordoado' ? '💫 TONTO!' : '⚔️ ABERTO!'}
            </span>
          )}
        </div>

        {/* As cópias falsas do Arquivista: nas fintas, são elas que tremem e brilham */}
        {def.ilusoes && !vencido &&
          [52, 88].map((x) => (
            <div
              key={x}
              className={`pointer-events-none absolute bottom-[12%] z-[9] -translate-x-1/2 opacity-60 ${ilusao ? 'tremer-t' : 'flutuar'}`}
              style={{ left: `${x}%`, width: `${largura * 0.85}%`, filter: ilusao ? 'drop-shadow(0 0 10px #ffd04a)' : undefined }}
              aria-hidden
            >
              <Sprite grade={ARQUIVISTA} paleta={paletaArquivista(true)} espelhar />
            </div>
          ))}

        {/* Na luta final, o especial chama um aliado que entra correndo */}
        {quemAjuda && aliado && (
          <div key={aliado.id} className="pointer-events-none absolute inset-0 z-20" aria-hidden>
            <div className="entra-esq absolute bottom-[14%] left-[44%] w-[13%] -translate-x-1/2">
              <Retrato quem={quemAjuda} />
            </div>
            <span className="lute-entra absolute left-1/2 top-[30%] -translate-x-1/2 whitespace-nowrap font-pixel text-xs text-[#f2c14e] [text-shadow:2px_2px_0_#000] sm:text-xl">
              {quemAjuda === 'octavius' ? '⚓ OCTAVIUS: CARGA EM EQUIPE!' : quemAjuda === 'helios' ? '☀️ HELIOS: RAIO DE SOL!' : '📚 CASSIUS: ESCUDO DE LIVROS!'}
            </span>
          </div>
        )}

        {/* No escuro: tudo apagado, só um círculo de luz em volta do herói (ou a arena toda com a LUZ) */}
        {escuro && fase === 'luta' && (
          <div
            className="pointer-events-none absolute inset-0 z-[15] transition-opacity duration-300"
            style={{ background: 'radial-gradient(circle at 22% 70%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.82) 30%), radial-gradient(ellipse at 70% 72%, rgba(40,30,60,0.35) 0%, transparent 22%)', opacity: aceso ? 0 : 1 }}
            aria-hidden
          />
        )}
        {escuro && fase === 'luta' && !aceso && sinal && (
          <span className="pointer-events-none absolute left-[70%] top-[30%] z-20 -translate-x-1/2 font-pixel text-[9px] text-white/80 sm:text-xs">❓ ALGO SE MEXE... (LUZ!)</span>
        )}

        {/* Os PLANOS do Octavius: a cada 7 segundos aparece algo no cenário para usar */}
        {comPlanos && fase === 'luta' && !vencido && (() => {
          const vez = Math.floor(e.tempo / 7000);
          const resto = e.tempo % 7000;
          if (vez < 1 || resto < 3800 || planosUsados.includes(vez)) return null;
          const item = PLANOS[vez % PLANOS.length]!;
          return (
            <button
              key={vez}
              type="button"
              onPointerDown={(ev) => {
                ev.preventDefault();
                desbloquear();
                setPlanosUsados((u) => [...u, vez]);
                setE((s) => usarPlano(s, atributos));
              }}
              className="surgir absolute z-20 flex -translate-x-1/2 flex-col items-center border-2 border-[#f2c14e] bg-black/80 px-2 py-1"
              style={{ left: `${44 + (vez % 3) * 5}%`, top: `${30 + (vez % 2) * 12}%` }}
              aria-label={`Usar o plano: ${item.nome}`}
            >
              <span className="piscar text-2xl sm:text-4xl" aria-hidden>
                {item.icone}
              </span>
              <span className="whitespace-nowrap font-pixel text-[7px] text-[#f2c14e] sm:text-[9px]">PLANO: {item.nome}</span>
            </button>
          );
        })()}

        {/* Treino do Ludus: o objetivo e quanto falta */}
        {treino && fase === 'luta' && (
          <span className="absolute left-1/2 top-[30%] z-20 -translate-x-1/2 whitespace-nowrap border-2 border-[#c8962a] bg-black/80 px-2 py-1 font-pixel text-[8px] text-[#f2c14e] sm:text-[11px]">
            🏋️ {treino.rotulo}: {Math.min(feitos, treino.quantos)}/{treino.quantos}
          </span>
        )}

        {/* Impactos: faíscas, cortes, anéis, clarões */}
        {e.eventos.map((ev) => {
          const x = ev.lado === 'jogador' ? '22%' : '70%';
          if (ev.tipo === 'acerto') return <Impacto key={`fx${ev.id}`} x={x} cor="#ffd04a" corte />;
          if (ev.tipo === 'dano') return <Impacto key={`fx${ev.id}`} x={x} cor="#ff4a3a" />;
          if (ev.tipo === 'bloqueio') return <Impacto key={`fx${ev.id}`} x="30%" cor="#9fe8ff" />;
          if (ev.tipo === 'especial' || ev.tipo === 'aliado') return <Impacto key={`fx${ev.id}`} x="70%" cor="#f2c14e" corte grande />;
          if (ev.tipo === 'riposta') return <Impacto key={`fx${ev.id}`} x="66%" cor="#9fe8ff" corte grande />;
          if (ev.tipo === 'quebra') return <Impacto key={`fx${ev.id}`} x="68%" cor="#ff8a3a" grande />;
          if (ev.tipo === 'plano') return <Impacto key={`fx${ev.id}`} x="70%" cor="#c8962a" grande />;
          if (ev.tipo === 'reflexo') return <Impacto key={`fx${ev.id}`} x="66%" cor="#ffe08a" corte grande />;
          return null;
        })}
        {e.eventos.some((ev) => ev.tipo === 'dano' || ev.tipo === 'contra') && <div className="clarao-vermelho pointer-events-none absolute inset-0 z-[19]" aria-hidden />}
        {e.eventos.some((ev) => ev.tipo === 'especial' || ev.tipo === 'fase') && <div className="clarao pointer-events-none absolute inset-0 z-[19] bg-white" aria-hidden />}
        {/* pouca vida: as bordas pulsam vermelho */}
        {fase === 'luta' && j.vida / j.vidaMax < 0.3 && <div className="perigo-bordas pointer-events-none absolute inset-0 z-[18]" aria-hidden />}
        {/* LUTE! no começo */}
        {fase === 'luta' && e.tempo < 1100 && (
          <span className="lute-entra pointer-events-none absolute left-1/2 top-[38%] z-30 -translate-x-1/2 font-pixel text-3xl text-[#f2c14e] [text-shadow:3px_3px_0_#5a2a12] sm:text-5xl">LUTE!</span>
        )}
        {/* COMBO */}
        {combo >= 3 && fase === 'luta' && (
          <span key={combo} className="combo-pop pointer-events-none absolute left-[46%] top-[24%] z-20 -translate-x-1/2 whitespace-nowrap font-pixel text-[10px] text-[#ffd04a] [text-shadow:2px_2px_0_#000] sm:text-base">
            COMBO ×{combo}
          </span>
        )}

        {/* Números e avisos que sobem */}
        {e.eventos.map((ev) => (
          <span
            key={ev.id}
            className={`subir-sumir pointer-events-none absolute z-20 -translate-x-1/2 whitespace-nowrap font-pixel [text-shadow:2px_2px_0_#000] ${ev.tipo === 'acerto' || ev.tipo === 'dano' ? 'text-sm sm:text-xl' : 'text-[9px] sm:text-sm'}`}
            style={{
              left: ev.lado === 'jogador' ? '22%' : '70%',
              bottom: '58%',
              color: ev.tipo === 'dano' || ev.tipo === 'contra' ? '#ff5a5a' : ev.tipo === 'guarda' || ev.tipo === 'cansado' ? '#bbb' : '#f2c14e',
            }}
          >
            {ev.tipo === "acerto" || ev.tipo === "dano" ? (ev.valor ? `-${ev.valor}` : "🛡 NADA ENTRA!") : TEXTO[ev.tipo]}
          </span>
        ))}

        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('luta')} />}
        {fase === 'depois' && <Falas falas={depois ?? []} onFim={onFim} />}
        {fase === 'derrota' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/75 p-3 text-center">
            <p className="font-pixel text-lg text-[#ff5a5a] sm:text-2xl">VOCÊ CAIU</p>
            <p className="max-w-sm text-sm text-white/80">
              {tentativas >= 2
                ? 'Dicas: não gaste fôlego à toa (cuidado com as FINTAS); bater na guarda três vezes faz ele CONTRA-ATACAR; espere o ABERTO e bata duas ou três vezes.'
                : 'Lembre: sinal AMARELO, escudo. VERMELHO, esquiva. E bata quando ele ficar ABERTO.'}
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => {
                tocar('start');
                setTentativas((t) => t + 1);
                setE(novaLuta(def, atributos));
                setCombo(0);
                setPlanosUsados([]);
                setLuzAte(0);
                setLuzPronta(0);
                setFase('luta');
              }}
              className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent"
            >
              ↻ TENTAR DE NOVO
            </button>
          </div>
        )}
      </Palco>

      {/* Os botões grandes (bons para o iPad) */}
      <div className="botoes-luta grid grid-cols-4 gap-2">
        {(
          [
            ['golpe', '⚔️', 'GOLPE', '#e04a3a'],
            ['escudo', '🛡️', 'ESCUDO', '#ffd04a'],
            ['esquiva', '💨', 'ESQUIVA', '#ff3a3a'],
            ['especial', '⭐', 'ESPECIAL', '#f2c14e'],
          ] as const
        ).map(([acao, icone, nome, cor]) => (
          <button
            key={acao}
            type="button"
            disabled={fase !== 'luta' || (acao === 'especial' && !cheio)}
            onPointerDown={(ev) => {
              ev.preventDefault();
              apertar(acao);
            }}
            className={`pixel-box flex select-none flex-col items-center gap-0.5 py-3 active:translate-y-0.5 disabled:opacity-35 sm:py-4 ${acao === 'especial' && cheio ? 'piscar' : ''}`}
            style={{ boxShadow: `0 0 0 2px ${cor}` }}
            aria-label={nome}
          >
            <span className="text-2xl sm:text-3xl" aria-hidden>
              {icone}
            </span>
            <span className="font-pixel text-[7px] sm:text-[9px]" style={{ color: cor }}>
              {nome}
            </span>
          </button>
        ))}
      </div>
      {/* Helios no escuro: a LUZ mostra o sinal do inimigo por alguns segundos */}
      {escuro && (
        <button
          type="button"
          disabled={!podeLuz}
          onPointerDown={(ev) => {
            ev.preventDefault();
            acenderRef.current();
          }}
          className={`pixel-box select-none py-3 font-pixel text-[10px] text-[#ffe08a] disabled:opacity-40 sm:text-xs ${podeLuz && !aceso ? 'animate-pulse' : ''}`}
          style={{ boxShadow: '0 0 0 2px #ffe08a' }}
        >
          ☀️ LUZ {aceso ? '(ACESA)' : podeLuz ? '(PRONTA: toque para ver o sinal)' : '(recarregando...)'} · tecla U
        </button>
      )}
      <p className="dica-luta text-center text-[10px] text-muted">
        Amarelo: 🛡️ · Vermelho: 💨 · ⚔️ no ABERTO · cada ação gasta fôlego (barra azul) · cuidado com as fintas · teclado: J, K, L e espaço
      </p>
    </div>
  );
}
