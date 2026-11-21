import { useEffect, useRef, useState, type ReactNode } from 'react';
import Icone from '@/ui/pixel/Icones';
import type { Fala, Falante, Lugar } from '@/game/historia/roteiro';
import { desbloquear } from '@/ui/som';
import { tocar } from '@/ui/somHistoria';
import { Falas, Palco } from './Cenas';
import { Retrato } from './Cenarios';

/**
 * Os minigames do Ludus no Capítulo 3 (docs/HISTORIA.md, seção 6), pedido do Lucas
 * em 21/11/2026: dois só de cada gladiador e um dos três juntos.
 * - Cassius: A FORJA DO BRUTUS (martelar no ritmo) e MEMÓRIA DOS GOLPES (repetir a sequência);
 * - Octavius: CORRIDA DO PÁTIO (pular e abaixar) e TORRE DE CAIXOTES (empilhar balançando);
 * - Os três: OS TRÊS CONTRA A MURALHA (cada um cuida de uma faixa; você joga a sua).
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

function BotaoGrande({ children, onApertar, disabled, cor = '#f2c14e' }: { children: ReactNode; onApertar: () => void; disabled?: boolean; cor?: string }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={(ev) => {
        ev.preventDefault();
        desbloquear();
        onApertar();
      }}
      className="pixel-box select-none py-4 font-pixel text-xs active:translate-y-0.5 disabled:opacity-40"
      style={{ color: cor, boxShadow: `0 0 0 2px ${cor}` }}
    >
      {children}
    </button>
  );
}

interface Base {
  lugar: Lugar;
  antes?: Fala[];
  depois: Fala[];
  onFim: () => void;
}

// ---------- CASSIUS 1: A FORJA DO BRUTUS ----------
// As batidas vêm deslizando até a bigorna; martele quando cada uma chegar na linha.
const BATIDAS = 18;
const PRECISA_FORJA = 14;

export function MinigameForja({ lugar, antes, depois, onFim }: Base) {
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [t, setT] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [resolvidas, setResolvidas] = useState<number[]>([]);
  const [brilho, setBrilho] = useState<'ok' | 'erro' | null>(null);
  // Cada batida chega na linha num tempo (em décimos de segundo); o ritmo aperta no fim.
  const chegadas = useRef(Array.from({ length: BATIDAS }, (_, k) => 20 + k * (k < 10 ? 8 : 6) + (k % 3 === 2 ? 3 : 0)));
  const pos = (k: number) => 15 + (chegadas.current[k]! - t) * 2.2;

  useTique(fase === 'jogo', 100, () => {
    setT((x) => x + 1);
    // Batidas que passaram sem martelar.
    const perdidas = chegadas.current.map((c, k) => (t - c > 3 && !resolvidas.includes(k) ? k : -1)).filter((k) => k >= 0);
    if (perdidas.length) setResolvidas((r) => [...r, ...perdidas]);
    if (resolvidas.length + perdidas.length >= BATIDAS) {
      if (acertos >= PRECISA_FORJA) {
        tocar('fanfarra');
        setFase('ok');
      } else setFase('perdeu');
    }
  });

  const martelar = () => {
    if (fase !== 'jogo') return;
    const k = chegadas.current.findIndex((c, i) => !resolvidas.includes(i) && Math.abs(c - t) <= 2);
    if (k >= 0) {
      tocar('martelo');
      setAcertos((a) => a + 1);
      setResolvidas((r) => [...r, k]);
      setBrilho('ok');
    } else {
      tocar('falha');
      setBrilho('erro');
    }
    window.setTimeout(() => setBrilho(null), 150);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">A FORJA DO BRUTUS: martele quando a brasa chegar na bigorna.</p>
        <span className="font-pixel text-[10px]">
          {acertos}/{PRECISA_FORJA}
        </span>
      </div>
      <Palco lugar={lugar} className={brilho === 'erro' ? 'tremer' : ''}>
        {fase === 'jogo' && (
          <div className="absolute inset-x-0 top-[40%] z-20 h-[18%]">
            <div className="absolute inset-0 bg-black/50" />
            {/* a bigorna (a linha) */}
            <div className={`absolute inset-y-0 left-[13%] w-[5%] border-x-4 ${brilho === 'ok' ? 'border-[#ffd04a] bg-[#ffd04a]/40' : 'border-white/70'}`} />
            {chegadas.current.map((_, k) =>
              resolvidas.includes(k) || pos(k) > 102 || pos(k) < 5 ? null : (
                <span key={k} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-4xl" style={{ left: `${pos(k)}%` }} aria-hidden>
                  <Icone nome="brasa" className="inline-block w-[1em] align-middle" />
                </span>
              ),
            )}
          </div>
        )}
        <div className="absolute bottom-[12%] left-[30%] z-10 w-[14%] -translate-x-1/2" aria-hidden>
          <Retrato quem="brutus" />
        </div>
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && (
          <Perdeu
            titulo="A ARMADURA ENTORTOU"
            dica={`Você precisa de ${PRECISA_FORJA} marteladas certas. Martele quando a brasa estiver dentro da bigorna, nem antes, nem depois.`}
            onDeNovo={() => {
              setT(0);
              setAcertos(0);
              setResolvidas([]);
              setFase('jogo');
            }}
          />
        )}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
      <BotaoGrande disabled={fase !== 'jogo'} onApertar={martelar}>
        MARTELAR!
      </BotaoGrande>
    </div>
  );
}

// ---------- CASSIUS 2: MEMÓRIA DOS GOLPES ----------
const GOLPES = [
  { id: 'golpe', icone: 'gladio', nome: 'GOLPE', cor: '#e04a3a' },
  { id: 'escudo', icone: 'escudo', nome: 'ESCUDO', cor: '#ffd04a' },
  { id: 'esquiva', icone: 'esquiva', nome: 'ESQUIVA', cor: '#5ab0ff' },
] as const;
const RODADAS_MEMORIA = [3, 4, 5, 6, 7];

export function MinigameMemoria({ lugar, antes, depois, onFim }: Base) {
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [rodada, setRodada] = useState(0);
  const [seq, setSeq] = useState<number[]>([]);
  const [mostrando, setMostrando] = useState(-1);
  const [resposta, setResposta] = useState<number[]>([]);
  const [vidas, setVidas] = useState(3);

  const nova = (r: number) => {
    const s = Array.from({ length: RODADAS_MEMORIA[r]! }, () => Math.floor(Math.random() * 3));
    setSeq(s);
    setResposta([]);
    setMostrando(0);
  };
  useEffect(() => {
    if (fase === 'jogo') nova(rodada);
  }, [fase, rodada]);
  // O Brutus mostra um golpe por vez.
  useEffect(() => {
    if (mostrando < 0) return;
    if (mostrando >= seq.length) {
      const id = window.setTimeout(() => setMostrando(-1), 400);
      return () => window.clearTimeout(id);
    }
    tocar('clique');
    const id = window.setTimeout(() => setMostrando((m) => m + 1), 700 - rodada * 60);
    return () => window.clearTimeout(id);
  }, [mostrando, seq]);

  const apertar = (g: number) => {
    if (fase !== 'jogo' || mostrando >= 0) return;
    const r = [...resposta, g];
    if (seq[r.length - 1] !== g) {
      tocar('falha');
      if (vidas <= 1) setFase('perdeu');
      else {
        setVidas((v) => v - 1);
        nova(rodada);
      }
      return;
    }
    tocar('selecionar');
    setResposta(r);
    if (r.length === seq.length) {
      if (rodada + 1 >= RODADAS_MEMORIA.length) {
        tocar('fanfarra');
        setFase('ok');
      } else window.setTimeout(() => setRodada((x) => x + 1), 500);
    }
  };

  const atual = mostrando >= 0 && mostrando < seq.length ? GOLPES[seq[mostrando]!] : null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">
          MEMÓRIA DOS GOLPES: repita o que o Brutus fizer. Rodada {Math.min(rodada + 1, RODADAS_MEMORIA.length)}/{RODADAS_MEMORIA.length}
        </p>
        <Vidas n={vidas} max={3} icone="" />
      </div>
      <Palco lugar={lugar}>
        <div className="absolute bottom-[12%] left-[40%] z-10 w-[15%] -translate-x-1/2" aria-hidden>
          <div className={atual ? 'investida-dir' : 'respirar'} key={mostrando}>
            <Retrato quem="brutus" />
          </div>
        </div>
        {fase === 'jogo' && (
          <div className="absolute right-[8%] top-[24%] z-20 flex flex-col items-center gap-2">
            {atual ? (
              <span key={mostrando} className="surgir text-5xl sm:text-7xl" style={{ filter: `drop-shadow(0 0 10px ${atual.cor})` }}>
                <Icone nome={atual.icone} className="inline-block w-[1em]" />
              </span>
            ) : (
              <span className="font-pixel text-[10px] text-white [text-shadow:2px_2px_0_#000] sm:text-sm">
                SUA VEZ! {resposta.length}/{seq.length}
              </span>
            )}
            <div className="flex gap-1">
              {seq.map((_, k) => (
                <span key={k} className={`h-2 w-4 border border-black ${k < resposta.length ? 'bg-[#4ad46a]' : 'bg-black/60'}`} />
              ))}
            </div>
          </div>
        )}
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && (
          <Perdeu
            titulo="ESQUECEU A SEQUÊNCIA"
            dica="Olhe com calma: o Brutus faz os golpes em ordem. Repita na mesma ordem."
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
      <div className="grid grid-cols-3 gap-2">
        {GOLPES.map((g, k) => (
          <BotaoGrande key={g.id} cor={g.cor} disabled={fase !== 'jogo' || mostrando >= 0} onApertar={() => apertar(k)}>
            <Icone nome={g.icone} className="inline-block w-[1.2em] align-middle" /> {g.nome}
          </BotaoGrande>
        ))}
      </div>
    </div>
  );
}

// ---------- OCTAVIUS 1: CORRIDA DO PÁTIO ----------
// O Brutus joga coisas: barril rolando (PULE) e saco voando (ABAIXE).
interface Obstaculo {
  id: number;
  tipo: 'barril' | 'saco';
  nasceu: number;
}
const TOTAL_CORRIDA = 16;

export function MinigameCorrida({ lugar, antes, depois, onFim }: Base) {
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [obs, setObs] = useState<Obstaculo[]>([]);
  const [agora, setAgora] = useState(0);
  const [pose, setPose] = useState<'corre' | 'pulo' | 'abaixa'>('corre');
  const [passados, setPassados] = useState(0);
  const [vidas, setVidas] = useState(3);
  const seq = useRef(0);
  const proximo = useRef(0);
  const poseAte = useRef(0);
  const VOO = 2200;

  const comecar = () => {
    setObs([]);
    setPassados(0);
    setVidas(3);
    seq.current = 0;
    proximo.current = Date.now() + 1000;
    setFase('jogo');
  };
  useEffect(() => {
    if (fase === 'jogo' && seq.current === 0) proximo.current = Date.now() + 1000;
  }, [fase]);

  useTique(fase === 'jogo', 40, () => {
    const t = Date.now();
    setAgora(t);
    if (t > poseAte.current && pose !== 'corre') setPose('corre');
    if (seq.current < TOTAL_CORRIDA && t >= proximo.current) {
      seq.current += 1;
      setObs((o) => [...o, { id: seq.current, tipo: Math.random() < 0.5 ? 'barril' : 'saco', nasceu: t }]);
      proximo.current = t + Math.max(700, 1500 - seq.current * 45);
    }
    // Chegou no Octavius (posição 20%): ele estava na pose certa?
    for (const o of obs) {
      if (t - o.nasceu >= VOO * 0.86) {
        const certo = (o.tipo === 'barril' && pose === 'pulo') || (o.tipo === 'saco' && pose === 'abaixa');
        setObs((x) => x.filter((y) => y.id !== o.id));
        if (certo) {
          tocar('selecionar');
          setPassados((p) => p + 1);
        } else {
          tocar('falha');
          if (vidas <= 1) {
            setFase('perdeu');
            return;
          }
          setVidas((v) => v - 1);
          setPassados((p) => p + 1);
        }
      }
    }
    if (passados >= TOTAL_CORRIDA) {
      tocar('fanfarra');
      setFase('ok');
    }
  });

  const fazer = (p: 'pulo' | 'abaixa') => {
    if (fase !== 'jogo') return;
    setPose(p);
    poseAte.current = Date.now() + 450;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">
          CORRIDA DO PÁTIO: barril, PULE! Saco voando, ABAIXE! {Math.min(passados, TOTAL_CORRIDA)}/{TOTAL_CORRIDA}
        </p>
        <Vidas n={vidas} max={3} icone="" />
      </div>
      <Palco lugar={lugar}>
        <div
          className="absolute left-[20%] z-10 w-[14%] -translate-x-1/2 transition-[bottom] duration-100"
          style={{ bottom: pose === 'pulo' ? '34%' : '12%', scale: pose === 'abaixa' ? '1 0.6' : undefined, transformOrigin: 'bottom' }}
          aria-hidden
        >
          <div className={pose === 'corre' ? 'andar' : ''}>
            <Retrato quem="octavius" />
          </div>
        </div>
        <div className="absolute bottom-[12%] right-[4%] z-10 w-[16%]" aria-hidden>
          <Retrato quem="brutus" espelhar />
        </div>
        {fase === 'jogo' &&
          obs.map((o) => {
            const p = Math.min(1, (agora - o.nasceu) / VOO);
            return (
              <span
                key={o.id}
                className="absolute z-20 -translate-x-1/2 text-3xl sm:text-5xl"
                style={{ left: `${88 - p * 80}%`, bottom: o.tipo === 'barril' ? '12%' : '40%', rotate: o.tipo === 'barril' ? `${-p * 900}deg` : undefined }}
                aria-hidden
              >
                <Icone nome={o.tipo === 'barril' ? 'barril' : 'saco'} className="inline-block w-[1em]" />
              </span>
            );
          })}
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && <Perdeu titulo="DERRUBADO NA AREIA" dica="Barril rola no chão: PULE. Saco voa alto: ABAIXE. Aperte quando estiver bem perto." onDeNovo={comecar} />}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
      <div className="grid grid-cols-2 gap-2">
        <BotaoGrande disabled={fase !== 'jogo'} onApertar={() => fazer('pulo')}>
          PULAR
        </BotaoGrande>
        <BotaoGrande disabled={fase !== 'jogo'} onApertar={() => fazer('abaixa')} cor="#5ab0ff">
          ABAIXAR
        </BotaoGrande>
      </div>
    </div>
  );
}

// ---------- OCTAVIUS 2: TORRE DE CAIXOTES ----------
// O caixote balança no guindaste; solte em cima da torre. O que sobrar para fora, cai.
const ALTURA_TORRE = 8;

export function MinigameTorre({ lugar, antes, depois, onFim }: Base) {
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [torre, setTorre] = useState<{ x: number; w: number }[]>([{ x: 40, w: 20 }]);
  const [t, setT] = useState(0);
  const [caindo, setCaindo] = useState(false);
  const topo = torre[torre.length - 1]!;
  const w = topo.w;
  // Balança de um lado para o outro, cada vez mais rápido.
  const x = 10 + (Math.sin(t * (0.05 + torre.length * 0.008)) + 1) * (80 - w) * 0.5;

  useTique(fase === 'jogo' && !caindo, 30, () => setT((v) => v + 1));

  const soltar = () => {
    if (fase !== 'jogo' || caindo) return;
    const esq = Math.max(x, topo.x);
    const dir = Math.min(x + w, topo.x + topo.w);
    const sobra = dir - esq;
    setCaindo(true);
    window.setTimeout(() => setCaindo(false), 250);
    if (sobra < 3) {
      tocar('falha');
      setFase('perdeu');
      return;
    }
    tocar('escudoMetal');
    const nova = [...torre, { x: esq, w: sobra }];
    setTorre(nova);
    if (nova.length - 1 >= ALTURA_TORRE) {
      tocar('fanfarra');
      setFase('ok');
    }
  };

  const altura = 8;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">TORRE DE CAIXOTES: solte o caixote em cima da torre até a janela.</p>
        <span className="font-pixel text-[10px]">
          {torre.length - 1}/{ALTURA_TORRE}
        </span>
      </div>
      <Palco lugar={lugar}>
        {/* a janela da cela lá no alto */}
        <span className="absolute left-1/2 top-[4%] z-10 -translate-x-1/2 font-pixel text-[8px] text-[#4ad46a] [text-shadow:1px_1px_0_#000] sm:text-[10px]">A JANELA</span>
        {torre.map((c, k) => (
          <div
            key={k}
            className="absolute z-10 border-2 border-[#3a2210] bg-[#8a5a2a]"
            style={{ left: `${c.x}%`, width: `${c.w}%`, bottom: `${10 + k * altura}%`, height: `${altura}%`, opacity: k === 0 ? 0.6 : 1 }}
            aria-hidden
          />
        ))}
        {fase === 'jogo' && (
          <>
            <div className="absolute top-0 z-10 w-0.5 bg-[#3a3040]" style={{ left: `${x + w / 2}%`, height: `${Math.max(4, 86 - (10 + torre.length * altura) - altura)}%` }} aria-hidden />
            <div
              className="absolute z-10 border-2 border-[#3a2210] bg-[#c8862a]"
              style={{ left: `${x}%`, width: `${w}%`, bottom: `${Math.min(86 - altura, 10 + torre.length * altura + 10)}%`, height: `${altura}%` }}
              aria-hidden
            />
          </>
        )}
        <div className="absolute bottom-[12%] left-[10%] z-10 w-[10%] -translate-x-1/2" aria-hidden>
          <Retrato quem="octavius" />
        </div>
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && (
          <Perdeu
            titulo="A TORRE DESABOU"
            dica="Solte quando o caixote estiver bem em cima da torre: o pedaço que fica para fora cai, e o próximo caixote fica menor."
            onDeNovo={() => {
              setTorre([{ x: 40, w: 20 }]);
              setT(0);
              setFase('jogo');
            }}
          />
        )}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
      <BotaoGrande disabled={fase !== 'jogo'} onApertar={soltar}>
        SOLTAR!
      </BotaoGrande>
    </div>
  );
}

// ---------- OS TRÊS CONTRA A MURALHA ----------
// Três faixas de bonecos de treino. Cada IA cuida da sua; você joga a do seu gladiador.
const PAPEL: Record<'cassius' | 'octavius' | 'helios', { acao: string; icone: string; cor: string }> = {
  cassius: { acao: 'SEGURAR COM O ESCUDO', icone: 'escudo', cor: '#f08c50' },
  octavius: { acao: 'PLANO: DERRUBAR', icone: 'barril', cor: '#4ef0dc' },
  helios: { acao: 'ILUMINAR', icone: 'sol', cor: '#5ab0ff' },
};
const ORDEM: ('cassius' | 'octavius' | 'helios')[] = ['cassius', 'octavius', 'helios'];
const BONECOS_TRIO = 18;

/**
 * `todos`: no capítulo secreto, você controla os TRÊS (uma faixa para cada botão).
 */
export function MinigameTrio({ lugar, antes, depois, onFim, heroi, todos = false }: Base & { heroi: Falante; todos?: boolean }) {
  const meu = (ORDEM as Falante[]).includes(heroi) ? (heroi as 'cassius' | 'octavius' | 'helios') : 'cassius';
  const faixa = ORDEM.indexOf(meu);
  const minha = (f: number) => todos || f === faixa;
  const meta = todos ? Math.round(BONECOS_TRIO * 0.75) : BONECOS_TRIO / 2;
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [bonecos, setBonecos] = useState<{ id: number; faixa: number; nasceu: number }[]>([]);
  const [agora, setAgora] = useState(0);
  const [derrubados, setDerrubados] = useState(0);
  const [vidas, setVidas] = useState(3);
  const seq = useRef(0);
  const proximo = useRef(0);
  const ANDA = 3200;

  const comecar = () => {
    setBonecos([]);
    setDerrubados(0);
    setVidas(3);
    seq.current = 0;
    proximo.current = Date.now() + 800;
    setFase('jogo');
  };
  useEffect(() => {
    if (fase === 'jogo' && seq.current === 0) proximo.current = Date.now() + 800;
  }, [fase]);

  useTique(fase === 'jogo', 40, () => {
    const t = Date.now();
    setAgora(t);
    if (t >= proximo.current) {
      seq.current += 1;
      // Metade dos bonecos vem na sua faixa; os outros dois cuidam do resto sozinhos.
      const f = todos ? (seq.current * 7) % 3 : seq.current % 2 === 0 ? faixa : [0, 1, 2].filter((x) => x !== faixa)[seq.current % 4 < 2 ? 0 : 1]!;
      setBonecos((b) => [...b, { id: seq.current, faixa: f, nasceu: t }]);
      proximo.current = t + Math.max(600, 1200 - seq.current * 25);
    }
    for (const b of bonecos) {
      const p = (t - b.nasceu) / ANDA;
      // Os aliados derrubam o boneco deles quando chega na linha.
      if (!minha(b.faixa) && p >= 0.75) {
        setBonecos((x) => x.filter((y) => y.id !== b.id));
        tocar('clique');
      }
      if (minha(b.faixa) && p >= 1) {
        setBonecos((x) => x.filter((y) => y.id !== b.id));
        tocar('falha');
        if (vidas <= 1) {
          setFase('perdeu');
          return;
        }
        setVidas((v) => v - 1);
      }
    }
    if (derrubados >= meta) {
      tocar('fanfarra');
      setFase('ok');
    }
  });

  const agir = (lane: number = faixa) => {
    if (fase !== 'jogo') return;
    // Derruba o boneco daquela faixa que estiver na zona (perto da linha).
    const alvo = bonecos.find((b) => b.faixa === lane && (agora - b.nasceu) / ANDA >= 0.55);
    if (alvo) {
      tocar('espadas');
      setBonecos((x) => x.filter((y) => y.id !== alvo.id));
      setDerrubados((d) => d + 1);
    } else tocar('falha');
  };

  const papel = PAPEL[meu];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">
          OS TRÊS CONTRA A MURALHA: {todos ? 'você controla os TRÊS' : 'cuide da SUA faixa'}. {Math.min(derrubados, meta)}/{meta}
        </p>
        <Vidas n={vidas} max={3} icone="" />
      </div>
      <Palco lugar={lugar}>
        {ORDEM.map((q, k) => (
          <div key={q} className="absolute inset-x-0 z-[6]" style={{ top: `${22 + k * 24}%`, height: '22%' }} aria-hidden>
            <div className="absolute inset-0" style={{ background: minha(k) ? `${PAPEL[q].cor}33` : 'transparent', borderTop: `2px dashed ${PAPEL[q].cor}66` }} />
            <div className="absolute left-[3%] top-0 h-full w-[9%]">
              <Retrato quem={q} />
            </div>
            {/* a zona de acertar */}
            {minha(k) && <div className="absolute inset-y-0 left-[16%] w-[22%] border-x-2 border-white/40" />}
          </div>
        ))}
        {fase === 'jogo' &&
          bonecos.map((b) => {
            const p = Math.min(1, (agora - b.nasceu) / ANDA);
            const escondido = ORDEM[b.faixa] === 'helios' && Math.floor((agora - b.nasceu) / 400) % 2 === 1;
            return (
              <span
                key={b.id}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-4xl"
                style={{ left: `${92 - p * 78}%`, top: `${33 + b.faixa * 24}%`, opacity: escondido ? 0.25 : 1 }}
                aria-hidden
              >
                <Icone nome="boneco" className="inline-block w-[100%] align-middle" />
              </span>
            );
          })}
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && <Perdeu titulo="A MURALHA PASSOU" dica={todos ? "Cada botão é de uma faixa: aperte quando o boneco daquela faixa entrar na zona branca." : "Aperte quando o boneco da SUA faixa entrar na zona branca, perto do seu gladiador."} onDeNovo={comecar} />}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
      {todos ? (
        <div className="grid grid-cols-3 gap-2">
          {ORDEM.map((q, k) => (
            <BotaoGrande key={q} disabled={fase !== 'jogo'} onApertar={() => agir(k)} cor={PAPEL[q].cor}>
              <Icone nome={PAPEL[q].icone} className="inline-block w-[1.2em] align-middle" /> {PAPEL[q].acao}
            </BotaoGrande>
          ))}
        </div>
      ) : (
        <BotaoGrande disabled={fase !== 'jogo'} onApertar={() => agir()} cor={papel.cor}>
          <Icone nome={papel.icone} className="inline-block w-[1.2em] align-middle" /> {papel.acao}!
        </BotaoGrande>
      )}
    </div>
  );
}
