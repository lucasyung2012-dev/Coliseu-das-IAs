import { useEffect, useRef, useState, type ReactNode } from 'react';
import Icone from '@/ui/pixel/Icones';
import type { Fala, Lugar } from '@/game/historia/roteiro';
import { desbloquear } from '@/ui/som';
import { tocar } from '@/ui/somHistoria';
import { Falas, Palco } from './Cenas';
import { Retrato } from './Cenarios';

/**
 * Os minigames do Helios (docs/HISTORIA.md, seção 5.3), todos de luz e de céu:
 * - TELESCÓPIO (Cap. 1): achar no céu a constelação igual ao desenho do mapa;
 * - SALTOS (Cap. 2): segurar para carregar o pulo e soltar na força certa para cada vão;
 * - ESPELHOS (Ludus, Aqueduto, Eclipse): girar os espelhos para a luz do sol chegar no alvo;
 * - MAPA DO CÉU (Ludus): achar as estrelas que formam o desenho, sem tocar nas falsas;
 * - ENIGMAS (Cap. 5): as adivinhas da Sibila, com tempo.
 */

type Fase = 'antes' | 'jogo' | 'ok' | 'perdeu';

function Vidas({ n, max }: { n: number; max: number; icone?: string }) {
  return (
    <span className="font-pixel text-[10px] sm:text-xs" aria-label={`${n} chances`}>
      {Array.from({ length: max }, (_, k) => (
        <span key={k} className={k < n ? '' : 'opacity-25'}>
          <Icone nome="coracao" className="inline-block w-[1.1em] align-middle" />
        </span>
      ))}
    </span>
  );
}

function Perdeu({ titulo, dica, onDeNovo }: { titulo: string; dica: string; onDeNovo: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/80 p-3 text-center">
      <p className="font-pixel text-sm text-[#ff5a5a] sm:text-base">{titulo}</p>
      <p className="max-w-sm text-sm text-white/80">{dica}</p>
      <button type="button" autoFocus onClick={onDeNovo} className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent">
        ↻ TENTAR DE NOVO
      </button>
    </div>
  );
}

function useTique(ligado: boolean, ms: number, fn: () => void) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!ligado) return;
    const id = window.setInterval(() => ref.current(), ms);
    return () => window.clearInterval(id);
  }, [ligado, ms]);
}

interface Base {
  lugar: Lugar;
  antes?: Fala[];
  depois: Fala[];
  onFim: () => void;
}

function Cabecalho({ children, vidas }: { children: ReactNode; vidas?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="font-pixel text-[9px] text-[#ffe08a] sm:text-[10px]">{children}</p>
      {vidas}
    </div>
  );
}

// ---------- TELESCÓPIO ----------
export type Ponto = [number, number];
const CONSTELACOES: { nome: string; pontos: Ponto[] }[] = [
  { nome: 'A COROA', pontos: [[0, 0.6], [0.25, 0.2], [0.5, 0.5], [0.75, 0.2], [1, 0.6]] },
  { nome: 'O ESCORPIÃO', pontos: [[0, 0.1], [0.2, 0.3], [0.35, 0.55], [0.55, 0.75], [0.75, 0.85], [0.95, 0.6]] },
  { nome: 'A LIRA', pontos: [[0.5, 0], [0.25, 0.4], [0.75, 0.4], [0.3, 0.95], [0.7, 0.95]] },
  { nome: 'A FLECHA', pontos: [[0, 0.5], [0.4, 0.5], [0.8, 0.5], [0.6, 0.25], [0.6, 0.75]] },
  { nome: 'O CISNE', pontos: [[0.5, 0], [0.5, 0.45], [0.5, 1], [0.05, 0.4], [0.95, 0.4]] },
  { nome: 'A BALANÇA', pontos: [[0.5, 0], [0.1, 0.5], [0.9, 0.5], [0.1, 0.9], [0.9, 0.9]] },
];

function Desenho({ pontos, tam = 1, linhas = true, cor = '#ffe08a' }: { pontos: Ponto[]; tam?: number; linhas?: boolean; cor?: string }) {
  return (
    <svg viewBox="-10 -10 120 120" className="h-full w-full overflow-visible" aria-hidden>
      {linhas && <polyline points={pontos.map(([x, y]) => `${x * 100},${y * 100}`).join(' ')} fill="none" stroke={cor} strokeOpacity={0.5} strokeWidth={2} />}
      {pontos.map(([x, y], k) => (
        <circle key={k} cx={x * 100} cy={y * 100} r={6 * tam} fill={cor} />
      ))}
    </svg>
  );
}

const RODADAS_TELESCOPIO = 5;

export function MinigameTelescopio({ lugar, antes, depois, onFim }: Base) {
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [rodada, setRodada] = useState(0);
  const [alvo, setAlvo] = useState(0);
  const [opcoes, setOpcoes] = useState<{ c: number; x: number; y: number }[]>([]);
  const [lentes, setLentes] = useState(3);
  const [t, setT] = useState(0);
  const [inicio, setInicio] = useState(0);

  const nova = (r: number) => {
    const ids = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5).slice(0, r < 2 ? 3 : 4);
    setAlvo(ids[0]!);
    const pos: [number, number][] = [
      [18, 18],
      [60, 14],
      [30, 46],
      [70, 44],
    ];
    setOpcoes(ids.map((c, k) => ({ c, x: pos[k]![0], y: pos[k]![1] })).sort(() => Math.random() - 0.5));
    setInicio(Date.now());
  };
  useEffect(() => {
    if (fase === 'jogo') nova(rodada);
  }, [fase, rodada]);
  useTique(fase === 'jogo', 50, () => setT((x) => x + 1));
  const tempo = Math.max(0, 9000 - (Date.now() - inicio));
  useEffect(() => {
    if (fase === 'jogo' && inicio && tempo <= 0) errar();
  }, [tempo <= 0]);

  const errar = () => {
    tocar('falha');
    if (lentes <= 1) {
      setFase('perdeu');
      return;
    }
    setLentes((l) => l - 1);
    nova(rodada);
  };
  const escolher = (c: number) => {
    if (fase !== 'jogo') return;
    desbloquear();
    if (c !== alvo) return errar();
    tocar('pergunta');
    if (rodada + 1 >= RODADAS_TELESCOPIO) {
      tocar('fanfarra');
      setFase('ok');
    } else setRodada((r) => r + 1);
  };

  return (
    <div className="flex flex-col gap-2">
      <Cabecalho vidas={<Vidas n={lentes} max={3} icone="" />}>
        O TELESCÓPIO: ache no céu a constelação do mapa. {Math.min(rodada + 1, RODADAS_TELESCOPIO)}/{RODADAS_TELESCOPIO}
      </Cabecalho>
      <Palco lugar={lugar}>
        <div className="absolute inset-0 z-[5] bg-[#05061e]/80" aria-hidden />
        {fase === 'jogo' && (
          <>
            {/* o mapa (o desenho a achar) */}
            <div className="absolute right-2 top-2 z-20 w-[22%] border-2 border-[#c8962a] bg-[#2a1a0a]/90 p-1 text-center">
              <span className="block font-pixel text-[7px] text-[#f2c14e] sm:text-[9px]">{CONSTELACOES[alvo]!.nome}</span>
              <div className="aspect-square w-full">
                <Desenho pontos={CONSTELACOES[alvo]!.pontos} />
              </div>
            </div>
            {/* o céu, com as constelações (sem as linhas) passando devagar */}
            {opcoes.map((o, k) => (
              <button
                key={`${rodada}-${o.c}`}
                type="button"
                onPointerDown={(ev) => {
                  ev.preventDefault();
                  escolher(o.c);
                }}
                className="absolute z-10 aspect-square w-[20%] rounded-full hover:bg-white/10"
                style={{ left: `${o.x + Math.sin((t + k * 40) / 60) * 3}%`, top: `${o.y + Math.cos((t + k * 30) / 70) * 3}%` }}
                aria-label={`Constelação ${k + 1}`}
              >
                <Desenho pontos={CONSTELACOES[o.c]!.pontos} linhas={false} tam={0.8} cor="#ffffff" />
              </button>
            ))}
            <div className="absolute inset-x-[10%] bottom-[4%] z-20 h-2 border border-black bg-black/60">
              <div className="h-full bg-[#ffe08a]" style={{ width: `${(tempo / 9000) * 100}%` }} />
            </div>
          </>
        )}
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && (
          <Perdeu
            titulo="AS LENTES QUEBRARAM"
            dica="Olhe o desenho no mapa (canto de cima) e procure no céu as estrelas na mesma posição. Sem as linhas, é a forma que conta."
            onDeNovo={() => {
              setLentes(3);
              setRodada(0);
              setFase('jogo');
              nova(0);
            }}
          />
        )}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
    </div>
  );
}

// ---------- SALTOS NOS TELHADOS ----------
const VAOS = 10;

/**
 * SALTOS (22/11/2026: os três ficaram diferentes). Nível 1: a força certa para cada vão.
 * Nível 2: o vento mexe a faixa verde enquanto você carrega. Nível 3 (o aqueduto): a força
 * sobe e desce sozinha, mais rápido, e a faixa é mais estreita.
 */
export function MinigameSaltos({ lugar, antes, depois, onFim, nivel = 1 }: Base & { nivel?: number }) {
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [vao, setVao] = useState(0);
  const [forca, setForca] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [vidas, setVidas] = useState(3);
  const [pulo, setPulo] = useState<'ok' | 'caiu' | null>(null);
  // Cada vão pede uma força: a faixa verde da barra.
  const faixa = (n: number): [number, number] => {
    const centro = 25 + ((n * 37) % 60);
    const largura = Math.max(10, 22 - n);
    return [centro - largura / 2, centro + largura / 2];
  };
  const [tic, setTic] = useState(0);
  const [subindo, setSubindo] = useState(true);
  const [min0, max0] = faixa(vao);
  // Nível 2: o vento empurra a faixa de um lado para o outro. Nível 3: a faixa fica mais estreita.
  const vento = nivel === 2 ? Math.sin(tic / 14) * 12 : 0;
  const aperta = nivel === 3 ? 3 : 0;
  const min = Math.max(2, min0 + vento + aperta);
  const max = Math.min(98, max0 + vento - aperta);
  useTique(fase === 'jogo', 30, () => {
    setTic((n) => n + 1);
    if (!carregando) return;
    const passo = nivel === 3 ? 2.6 : nivel === 2 ? 1.9 : 1.6;
    // Nível 3: a força sobe e desce sozinha (solte na hora certa).
    if (nivel === 3)
      setForca((f) => {
        const n = subindo ? f + passo : f - passo;
        if (n >= 100) setSubindo(false);
        if (n <= 0) setSubindo(true);
        return Math.max(0, Math.min(100, n));
      });
    else setForca((f) => (f >= 100 ? 100 : f + passo));
  });

  const soltar = () => {
    if (fase !== 'jogo' || !carregando) return;
    setCarregando(false);
    if (forca >= min && forca <= max) {
      tocar('esquiva');
      setPulo('ok');
      window.setTimeout(() => {
        setPulo(null);
        setForca(0);
        if (vao + 1 >= VAOS) {
          tocar('fanfarra');
          setFase('ok');
        } else setVao((v) => v + 1);
      }, 450);
    } else {
      tocar('falha');
      setPulo('caiu');
      window.setTimeout(() => {
        setPulo(null);
        setForca(0);
        if (vidas <= 1) setFase('perdeu');
        else setVidas((v) => v - 1);
      }, 600);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Cabecalho vidas={<Vidas n={vidas} max={3} icone="" />}>
        SALTOS: segure para carregar e solte com a força na faixa verde. Vão {Math.min(vao + 1, VAOS)}/{VAOS}
      </Cabecalho>
      <Palco lugar={lugar}>
        <div
          className="absolute bottom-[14%] z-10 w-[10%] -translate-x-1/2 transition-[left,bottom] duration-300"
          style={{ left: pulo === 'ok' ? '62%' : '28%', bottom: pulo === 'ok' ? '30%' : pulo === 'caiu' ? '-10%' : '14%' }}
          aria-hidden
        >
          <div className={carregando ? 'tremer-t' : 'respirar'}>
            <Retrato quem="helios" />
          </div>
        </div>
        {/* os dois telhados (de telhas) e o vão entre eles, do tamanho da força que pede */}
        <div className="pointer-events-none absolute bottom-0 left-0 z-[6] h-[16%] w-[36%] border-t-4 border-[#5a2418] bg-[repeating-linear-gradient(90deg,#9a4a32_0_10px,#8a422c_10px_12px)]" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 z-[6] h-[22%] bg-[linear-gradient(180deg,#0a0812,#1a1424)]" style={{ left: '36%', width: `${12 + ((min + max) / 2) * 0.2}%` }} aria-hidden />
        <div className="pointer-events-none absolute bottom-0 right-0 z-[6] h-[30%] border-t-4 border-[#5a2418] bg-[repeating-linear-gradient(90deg,#9a4a32_0_10px,#8a422c_10px_12px)]" style={{ left: `${48 + ((min + max) / 2) * 0.2}%` }} aria-hidden />
        {nivel === 2 && <div className="vento-fase pointer-events-none absolute inset-0 z-[7] opacity-60" aria-hidden />}
        {fase === 'jogo' && (
          <div className="absolute inset-x-[8%] top-[10%] z-20 h-6 border-2 border-black bg-black/70 sm:h-8">
            <div className="absolute inset-y-0 bg-[#4ad46a]/70" style={{ left: `${min}%`, width: `${max - min}%` }} />
            <div className="absolute inset-y-0 left-0 bg-[#ffe08a]/80" style={{ width: `${forca}%` }} />
          </div>
        )}
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && (
          <Perdeu
            titulo="CAIU DO TELHADO"
            dica="Cada vão pede uma força diferente: segure o botão e solte quando a barra amarela estiver dentro do verde."
            onDeNovo={() => {
              setVidas(3);
              setVao(0);
              setForca(0);
              setFase('jogo');
            }}
          />
        )}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
      <button
        type="button"
        disabled={fase !== 'jogo' || pulo !== null}
        onPointerDown={(ev) => {
          ev.preventDefault();
          desbloquear();
          setForca(0);
          setCarregando(true);
        }}
        onPointerUp={soltar}
        onPointerLeave={soltar}
        className="pixel-box select-none py-4 font-pixel text-xs text-[#ffe08a] disabled:opacity-40"
        style={{ boxShadow: '0 0 0 2px #ffe08a' }}
      >
        SEGURE E SOLTE PARA PULAR
      </button>
    </div>
  );
}

// ---------- ESPELHOS ----------
// Uma grade com espelhos que giram ( / ou \ ). A luz entra pela esquerda e anda reto;
// cada espelho a desvia. Gire os espelhos até a luz chegar no alvo.
export type Celula = '' | '/' | '\\' | 'X' | 'A';
export interface Nivel {
  w: number;
  h: number;
  entrada: number;
  grade: Celula[][];
}
const N = (linhas: string[], entrada: number): Nivel => ({
  w: linhas[0]!.length,
  h: linhas.length,
  entrada,
  grade: linhas.map((l) => l.split('').map((ch) => (ch === '.' ? '' : (ch as Celula)))),
});
// Os níveis começam com os espelhos virados para o lado errado.
export const NIVEIS: Nivel[] = [
  N(['......', '../...', '......', '../..A'], 1),
  N(['./.X/A', '......', './..\\.', '......'], 0),
  N(['..\\..\\', '......', '.....A', '../.X.'], 3),
  N(['.\\.\\X.', '......', '.\\X..A', '..././'], 2),
];
const NIVEIS_POR_CAPITULO: Record<number, number[]> = { 1: [0, 1], 2: [1, 2], 3: [2, 3] };

export function caminho(n: Nivel, grade: Celula[][]): { cel: Ponto[]; chegou: boolean } {
  let x = -1;
  let y = n.entrada;
  let dx = 1;
  let dy = 0;
  const cel: Ponto[] = [];
  for (let passos = 0; passos < 60; passos++) {
    x += dx;
    y += dy;
    if (x < 0 || y < 0 || x >= n.w || y >= n.h) return { cel, chegou: false };
    const c = grade[y]![x]!;
    cel.push([x, y]);
    if (c === 'A') return { cel, chegou: true };
    if (c === 'X') return { cel, chegou: false };
    if (c === '/') [dx, dy] = [-dy, -dx];
    else if (c === '\\') [dx, dy] = [dy, dx];
  }
  return { cel, chegou: false };
}

export function MinigameEspelhos({ lugar, antes, depois, onFim, nivel = 1, titulo = 'ESPELHOS DE BRONZE' }: Base & { nivel?: number; titulo?: string }) {
  const lista = NIVEIS_POR_CAPITULO[nivel] ?? [0, 1];
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [qual, setQual] = useState(0);
  const n = NIVEIS[lista[qual]!]!;
  const [grade, setGrade] = useState<Celula[][]>(() => n.grade.map((l) => [...l]));
  const [acendeu, setAcendeu] = useState(false);
  const r = caminho(n, grade);

  useEffect(() => {
    setGrade(NIVEIS[lista[qual]!]!.grade.map((l) => [...l]));
    setAcendeu(false);
  }, [qual]);
  useEffect(() => {
    if (fase !== 'jogo' || !r.chegou || acendeu) return;
    setAcendeu(true);
    tocar('reflexo');
    window.setTimeout(() => {
      if (qual + 1 >= lista.length) {
        tocar('fanfarra');
        setFase('ok');
      } else setQual((q) => q + 1);
    }, 900);
  }, [r.chegou, fase]);

  const girar = (x: number, y: number) => {
    if (fase !== 'jogo' || acendeu) return;
    const c = grade[y]![x]!;
    if (c !== '/' && c !== '\\') return;
    desbloquear();
    tocar('clique');
    setGrade((g) => g.map((l, j) => l.map((v, i) => (i === x && j === y ? (v === '/' ? '\\' : '/') : v))));
  };

  const luz = new Set(r.cel.map(([x, y]) => `${x},${y}`));
  return (
    <div className="flex flex-col gap-2">
      <Cabecalho>
        {titulo}: toque nos espelhos para girar. Leve a luz até o alvo. Espelho {qual + 1}/{lista.length}
      </Cabecalho>
      <Palco lugar={lugar}>
        {fase === 'jogo' && (
          <div className="absolute inset-[8%] z-10 flex items-center gap-1">
            <span className="text-2xl sm:text-4xl" style={{ marginTop: `${(n.entrada - (n.h - 1) / 2) * 22}%` }} aria-hidden>
              <Icone nome="sol" className="inline-block w-[1em] align-middle" />
            </span>
            <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: `repeat(${n.w}, minmax(0, 1fr))` }}>
              {grade.flatMap((linha, y) =>
                linha.map((c, x) => {
                  const acesa = luz.has(`${x},${y}`);
                  return (
                    <button
                      key={`${x}-${y}`}
                      type="button"
                      onPointerDown={(ev) => {
                        ev.preventDefault();
                        girar(x, y);
                      }}
                      className="flex aspect-square items-center justify-center border border-white/20 font-pixel text-lg sm:text-3xl"
                      style={{ background: acesa ? (c === 'A' ? '#ffe08a' : 'rgba(255,224,138,0.45)') : 'rgba(0,0,0,0.55)', color: '#c8962a' }}
                      aria-label={c === '/' || c === '\\' ? 'Espelho' : c === 'A' ? 'Alvo' : c === 'X' ? 'Pedra' : 'Vazio'}
                    >
                      {c === '/' ? '╱' : c === '\\' ? '╲' : c === 'A' ? <Icone nome="alvo" className="inline-block w-[80%] align-middle" /> : c === 'X' ? <Icone nome="muro" className="inline-block w-[90%] align-middle" /> : ''}
                    </button>
                  );
                }),
              )}
            </div>
          </div>
        )}
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
      <p className="text-center text-xs text-muted">A luz anda reto até bater num espelho, e o espelho desvia para cima ou para baixo. Pedra bloqueia.</p>
    </div>
  );
}

// ---------- MAPA DO CÉU ----------
const RODADAS_MAPA = 3;

export function MinigameMapaCeu({ lugar, antes, depois, onFim }: Base) {
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [rodada, setRodada] = useState(0);
  const [c, setC] = useState(0);
  const [falsas, setFalsas] = useState<Ponto[]>([]);
  const [achadas, setAchadas] = useState<number[]>([]);
  const [vidas, setVidas] = useState(3);
  // A constelação fica num quadrado no meio do céu.
  const caixa = { x: 22, y: 12, w: 56, h: 56 };
  const nova = (r: number) => {
    setC((r * 2 + 1) % CONSTELACOES.length);
    setFalsas(Array.from({ length: 5 + r * 2 }, () => [Math.random(), Math.random()] as Ponto));
    setAchadas([]);
  };
  useEffect(() => {
    if (fase === 'jogo') nova(rodada);
  }, [fase, rodada]);
  const pts = CONSTELACOES[c]!.pontos;

  const tocarVerdadeira = (k: number) => {
    if (fase !== 'jogo' || achadas.includes(k)) return;
    desbloquear();
    tocar('pergunta');
    const a = [...achadas, k];
    setAchadas(a);
    if (a.length === pts.length) {
      tocar('reflexo');
      window.setTimeout(() => {
        if (rodada + 1 >= RODADAS_MAPA) {
          tocar('fanfarra');
          setFase('ok');
        } else setRodada((r) => r + 1);
      }, 700);
    }
  };
  const tocarFalsa = () => {
    if (fase !== 'jogo') return;
    tocar('falha');
    if (vidas <= 1) setFase('perdeu');
    else setVidas((v) => v - 1);
  };

  return (
    <div className="flex flex-col gap-2">
      <Cabecalho vidas={<Vidas n={vidas} max={3} icone="" />}>
        O MAPA DO CÉU: toque só nas estrelas que formam {CONSTELACOES[c]!.nome} (o desenho apagado). {Math.min(rodada + 1, RODADAS_MAPA)}/{RODADAS_MAPA}
      </Cabecalho>
      <Palco lugar={lugar}>
        <div className="absolute inset-0 z-[5] bg-[#05061e]/80" aria-hidden />
        {fase === 'jogo' && (
          <>
            <div className="pointer-events-none absolute z-10 opacity-60" style={{ left: `${caixa.x}%`, top: `${caixa.y}%`, width: `${caixa.w}%`, height: `${caixa.h}%` }}>
              <Desenho pontos={pts} tam={0.01} cor="#9fe8ff" />
            </div>
            {falsas.map(([x, y], k) => (
              <button
                key={`f${rodada}-${k}`}
                type="button"
                onPointerDown={(ev) => {
                  ev.preventDefault();
                  tocarFalsa();
                }}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 p-2 text-base sm:text-2xl"
                style={{ left: `${6 + x * 88}%`, top: `${6 + y * 70}%` }}
                aria-label="Estrela"
              >
                ✦
              </button>
            ))}
            {pts.map(([x, y], k) => (
              <button
                key={`v${rodada}-${k}`}
                type="button"
                onPointerDown={(ev) => {
                  ev.preventDefault();
                  tocarVerdadeira(k);
                }}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 p-2 text-base sm:text-2xl"
                style={{
                  left: `${caixa.x + x * caixa.w}%`,
                  top: `${caixa.y + y * caixa.h}%`,
                  color: achadas.includes(k) ? '#ffe08a' : '#ffffff',
                  filter: achadas.includes(k) ? 'drop-shadow(0 0 8px #ffe08a)' : undefined,
                }}
                aria-label="Estrela"
              >
                ✦
              </button>
            ))}
          </>
        )}
        <div className="absolute bottom-[12%] left-[10%] z-10 w-[12%] -translate-x-1/2" aria-hidden>
          <Retrato quem="helios" />
        </div>
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && (
          <Perdeu
            titulo="O MAPA ERROU O CÉU"
            dica="O desenho apagado mostra onde ficam as estrelas certas. As outras são de mentira."
            onDeNovo={() => {
              setVidas(3);
              setRodada(0);
              setFase('jogo');
              nova(0);
            }}
          />
        )}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
    </div>
  );
}

// ---------- OS ENIGMAS DA SIBILA ----------
const ENIGMAS: { pergunta: string; certa: string; erradas: [string, string] }[] = [
  { pergunta: 'Tenho cidades, mas nenhuma casa. Tenho montanhas, mas nenhuma árvore. Tenho água, mas nenhum peixe. O que eu sou?', certa: 'Um mapa', erradas: ['Um sonho', 'Um quadro'] },
  { pergunta: 'Quanto mais você tira de mim, maior eu fico. O que eu sou?', certa: 'Um buraco', erradas: ['Uma vela', 'Um pão'] },
  { pergunta: 'Sou seu, mas os outros me usam muito mais do que você. O que eu sou?', certa: 'O seu nome', erradas: ['A sua sombra', 'O seu chapéu'] },
  { pergunta: 'Estou no céu o tempo todo, mas só apareço quando o sol vai embora. O que eu sou?', certa: 'Uma estrela', erradas: ['Um vaga-lume', 'Uma nuvem'] },
  { pergunta: 'O que é que sobe, sobe, e nunca desce?', certa: 'A sua idade', erradas: ['A fumaça', 'Um balão'] },
  { pergunta: 'A pergunta que o Censor mais odeia: quantas respostas certas uma pergunta pode ter?', certa: 'Mais de uma', erradas: ['Só uma', 'Nenhuma'] },
];
const TEMPO_ENIGMA = 15000;

export function MinigameEnigmas({ lugar, antes, depois, onFim }: Base) {
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [n, setN] = useState(0);
  const [ordem, setOrdem] = useState<string[]>([]);
  const [vidas, setVidas] = useState(3);
  const [inicio, setInicio] = useState(0);
  const [agora, setAgora] = useState(0);
  const [erro, setErro] = useState(false);
  const e = ENIGMAS[n];

  useEffect(() => {
    if (fase === 'jogo' && e) {
      setOrdem([e.certa, ...e.erradas].sort(() => Math.random() - 0.5));
      setInicio(Date.now());
      setAgora(Date.now());
    }
  }, [fase, n]);
  useTique(fase === 'jogo', 100, () => setAgora(Date.now()));
  const resta = Math.max(0, TEMPO_ENIGMA - (agora - inicio));
  useEffect(() => {
    if (fase === 'jogo' && inicio && resta <= 0) errar();
  }, [resta <= 0]);

  const errar = () => {
    tocar('falha');
    setErro(true);
    window.setTimeout(() => setErro(false), 400);
    if (vidas <= 1) {
      setFase('perdeu');
      return;
    }
    setVidas((v) => v - 1);
    setInicio(Date.now());
  };
  const responder = (r: string) => {
    if (fase !== 'jogo' || !e) return;
    desbloquear();
    if (r !== e.certa) return errar();
    tocar('pergunta');
    if (n + 1 >= ENIGMAS.length) {
      tocar('fanfarra');
      setFase('ok');
    } else setN((x) => x + 1);
  };

  return (
    <div className="flex flex-col gap-2">
      <Cabecalho vidas={<Vidas n={vidas} max={3} icone="" />}>
        OS ENIGMAS DA SIBILA: responda antes da vela apagar. Enigma {Math.min(n + 1, ENIGMAS.length)}/{ENIGMAS.length}
      </Cabecalho>
      <Palco lugar={lugar} className={erro ? 'tremer' : ''}>
        <div className="absolute bottom-[12%] left-[18%] z-10 w-[12%] -translate-x-1/2" aria-hidden>
          <div className="respirar">
            <Retrato quem="sibila" />
          </div>
        </div>
        {fase === 'jogo' && e && (
          <div className="absolute inset-x-[6%] top-[8%] z-20 flex flex-col items-center gap-2 border-2 border-[#c8962a] bg-black/80 p-3 text-center">
            <p className="text-sm text-white sm:text-lg">{e.pergunta}</p>
            <div className="h-2 w-full border border-black bg-black/60">
              <div className="h-full bg-[#ffe08a]" style={{ width: `${(resta / TEMPO_ENIGMA) * 100}%` }} />
            </div>
          </div>
        )}
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && (
          <Perdeu
            titulo="A VELA APAGOU"
            dica="Leia com calma. Os enigmas da Sibila parecem difíceis, mas a resposta está sempre na pergunta."
            onDeNovo={() => {
              setVidas(3);
              setN(0);
              setFase('jogo');
            }}
          />
        )}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
      {fase === 'jogo' && (
        <div className="grid gap-2 sm:grid-cols-3">
          {ordem.map((o) => (
            <button
              key={`${n}-${o}`}
              type="button"
              onClick={() => responder(o)}
              className="pixel-box pixel-hover py-3 text-sm"
              style={{ boxShadow: '0 0 0 2px #c8962a' }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
