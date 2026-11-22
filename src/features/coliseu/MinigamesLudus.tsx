import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import Emote from '@/ui/pixel/Emotes';
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
  // Quantas certas seguidas (o Brutus gosta) e o número da martelada (as faíscas recomeçam a cada uma).
  const [seguidas, setSeguidas] = useState(0);
  const [batida, setBatida] = useState(0);
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
      setSeguidas((n) => n + 1);
    } else {
      tocar('falha');
      setBrilho('erro');
      setSeguidas(0);
    }
    setBatida((n) => n + 1);
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
        {/* A FORJA (redesenhada, 22/11/2026): a barra de ferro em brasa
            trazendo o calor, a bigorna com a armadura amassada (fica reta a cada martelada certa),
            o Cassius de martelo e o Brutus olhando. Faíscas e TANG! quando acerta. */}
        {fase === 'jogo' && (
          <div className="pointer-events-none absolute left-[30%] right-[16%] top-[44%] z-20 h-[12%]" aria-hidden>
            {/* a barra de ferro: esquenta do lado da fornalha */}
            <div className="absolute inset-x-0 top-1/2 h-[30%] -translate-y-1/2 bg-[linear-gradient(90deg,#3a3a44,#5a4a4a_60%,#c8501a)] shadow-[0_2px_0_#000]" />
            {chegadas.current.map((_, k) => {
              const x = ((pos(k) - 15) / 85) * 100;
              return resolvidas.includes(k) || x > 100 || x < -6 ? null : (
                <span key={k} className="brasa-forja absolute top-1/2 block aspect-square w-[5%] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${x}%` }} />
              );
            })}
          </div>
        )}
        {/* a bigorna e a armadura em cima dela */}
        <div className="pointer-events-none absolute bottom-[12%] left-[30%] z-[12] w-[14%] -translate-x-1/2" aria-hidden>
          <div className={`mx-auto h-[14px] w-[70%] rounded-t-[40%] border-2 border-black sm:h-[26px] ${acertos >= PRECISA_FORJA ? 'bg-[#d8d8e8]' : acertos > PRECISA_FORJA / 2 ? 'bg-[#a8a8b8]' : 'bg-[#8a6a5a]'}`} style={{ clipPath: `polygon(0 ${Math.max(0, 40 - acertos * 4)}%, 30% 0, 50% ${Math.max(0, 30 - acertos * 3)}%, 70% 0, 100% ${Math.max(0, 40 - acertos * 4)}%, 100% 100%, 0 100%)` }} />
          <div className="h-[10px] w-full bg-[#3a3a44] sm:h-[18px]" />
          <div className="mx-auto h-[14px] w-[40%] bg-[#2a2a34] sm:h-[24px]" />
          <div className="mx-auto h-[6px] w-[70%] bg-[#3a3a44] sm:h-[10px]" />
          <div className={`absolute inset-x-[10%] top-0 h-[40%] rounded-full ${brilho === 'ok' ? 'bg-[#ffd04a]/60' : 'bg-transparent'} blur-md`} />
        </div>
        {/* faíscas e TANG! na martelada certa */}
        {brilho === 'ok' && (
          <div key={batida} className="pointer-events-none absolute bottom-[30%] left-[30%] z-[25]" aria-hidden>
            {[-60, -35, -10, 15, 40, 65, 90, -85].map((a, k) => (
              <span key={k} className="faisca-forja absolute block h-[3px] w-[3px] bg-[#ffe08a]" style={{ '--ang': `${a}deg` } as CSSProperties} />
            ))}
            <span className="tang absolute -top-8 left-2 font-pixel text-sm text-[#ffd04a] [text-shadow:2px_2px_0_#000] sm:text-2xl">TANG!</span>
          </div>
        )}
        {/* o Cassius com o martelo (balança a cada martelada) */}
        <div className="pointer-events-none absolute bottom-[12%] left-[19%] z-[11] w-[15%] -translate-x-1/2" aria-hidden>
          <div key={batida} className={batida ? 'martelada' : 'respirar'}>
            <Retrato quem="cassius" />
          </div>
        </div>
        {/* o Brutus olhando: gosta das seguidas, bufa no erro */}
        <div className="pointer-events-none absolute bottom-[12%] left-[56%] z-10 w-[14%] -translate-x-1/2" aria-hidden>
          {(brilho === 'erro' || seguidas >= 3) && (
            <span className="emote-pula absolute -top-[20%] left-1/2 block w-[40%] -translate-x-1/2">
              <Emote emocao={brilho === 'erro' ? 'bravo' : 'feliz'} />
            </span>
          )}
          <Retrato quem="brutus" espelhar />
        </div>
        {/* a armadura ficando pronta */}
        {fase === 'jogo' && (
          <div className="pointer-events-none absolute inset-x-[4%] top-[6%] z-20 flex items-center gap-2" aria-hidden>
            <span className="font-pixel text-[7px] text-white [text-shadow:1px_1px_0_#000] sm:text-[10px]">ARMADURA</span>
            <div className="h-2 flex-1 border border-black bg-black/60">
              <div className="h-full bg-[linear-gradient(90deg,#8a6a5a,#d8d8e8)] transition-[width]" style={{ width: `${Math.min(100, (acertos / PRECISA_FORJA) * 100)}%` }} />
            </div>
            {seguidas >= 3 && <span className="font-pixel text-[7px] text-[#ffd04a] sm:text-[10px]">×{seguidas}</span>}
          </div>
        )}
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
  // O que o Cassius acabou de fazer (repete o golpe com o corpo) e se acertou.
  const [ultimo, setUltimo] = useState<{ g: number; ok: boolean; n: number } | null>(null);
  const [rodadaCerta, setRodadaCerta] = useState(false);

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
    setUltimo((u) => ({ g, ok: seq[r.length - 1] === g, n: (u?.n ?? 0) + 1 }));
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
      } else {
        setRodadaCerta(true);
        window.setTimeout(() => {
          setRodadaCerta(false);
          setRodada((x) => x + 1);
        }, 900);
      }
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
        {/* A MEMÓRIA (redesenhada, 22/11/2026): o Brutus e o Cassius frente a frente na areia. O
            Brutus faz cada golpe com o corpo (avança, levanta o escudo, pula de lado) e a placa
            mostra qual é; depois o Cassius repete com o corpo o que você apertar. */}
        <div className="pointer-events-none absolute inset-x-[10%] bottom-[9%] z-[4] h-[6%] rounded-[50%] bg-black/30" aria-hidden />
        {/* o Brutus */}
        <div className="pointer-events-none absolute bottom-[12%] left-[68%] z-10 w-[17%] -translate-x-1/2" aria-hidden>
          {atual && (
            <span key={`p${mostrando}`} className="surgir absolute -top-[46%] left-1/2 flex -translate-x-1/2 flex-col items-center gap-1">
              <span className="flex aspect-square w-14 items-center justify-center rounded-full border-4 border-black sm:w-24" style={{ background: atual.cor, boxShadow: `0 0 18px ${atual.cor}` }}>
                <Icone nome={atual.icone} className="w-[62%]" />
              </span>
              <span className="whitespace-nowrap border-2 border-black bg-[#f4e2b4] px-1 font-pixel text-[7px] text-black sm:text-[10px]">{atual.nome}</span>
            </span>
          )}
          {(ultimo && !ultimo.ok) || rodadaCerta ? (
            <span className="emote-pula absolute -top-[18%] left-[80%] block w-[34%]">
              <Emote emocao={rodadaCerta ? 'feliz' : 'bravo'} />
            </span>
          ) : null}
          <div key={`b${mostrando}`} className={atual ? `pose-${atual.id}-b` : 'respirar'}>
            <Retrato quem="brutus" espelhar />
          </div>
        </div>
        {/* o Cassius, repetindo */}
        <div className="pointer-events-none absolute bottom-[12%] left-[30%] z-10 w-[15%] -translate-x-1/2" aria-hidden>
          {ultimo && !ultimo.ok && (
            <span key={`x${ultimo.n}`} className="tang absolute -top-[30%] left-1/2 -translate-x-1/2 font-pixel text-2xl text-[#ff4a4a] [text-shadow:2px_2px_0_#000] sm:text-4xl">X</span>
          )}
          <div key={`c${ultimo?.n ?? 0}`} className={ultimo ? (ultimo.ok ? `pose-${GOLPES[ultimo.g]!.id}` : 'tropeca') : 'respirar'}>
            <Retrato quem="cassius" />
          </div>
        </div>
        {fase === 'jogo' && (
          <div className="pointer-events-none absolute inset-x-0 top-[5%] z-20 flex flex-col items-center gap-1" aria-hidden>
            {/* as placas da sequência: vão se acendendo com o que você acertou */}
            <div className="flex gap-1 sm:gap-2">
              {seq.map((s, k) => {
                const feito = k < resposta.length;
                const g = GOLPES[s]!;
                return (
                  <span key={k} className={`flex aspect-square w-6 items-center justify-center border-2 sm:w-10 ${feito ? 'border-[#4ad46a] bg-black/70' : 'border-[#6a5a48] bg-[#3a2e24]/80'}`} style={feito ? { boxShadow: `0 0 8px ${g.cor}` } : undefined}>
                    {feito && <Icone nome={g.icone} className="w-[70%]" />}
                  </span>
                );
              })}
            </div>
            <span className="font-pixel text-[8px] text-white [text-shadow:2px_2px_0_#000] sm:text-xs">
              {rodadaCerta ? 'RODADA CERTA!' : atual ? 'OLHE O BRUTUS...' : mostrando < 0 ? `SUA VEZ! ${resposta.length}/${seq.length}` : ''}
            </span>
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
  // Os bonecos derrubados voam girando; e cada gladiador ataca (a animação recomeça a cada golpe).
  const [caidos, setCaidos] = useState<{ id: number; faixa: number; x: number; em: number }[]>([]);
  const [ataques, setAtaques] = useState([0, 0, 0]);
  const derrubar = (b: { id: number; faixa: number; nasceu: number }, t: number) => {
    setCaidos((c) => [...c.filter((x) => t - x.em < 700), { id: b.id, faixa: b.faixa, x: 92 - Math.min(1, (t - b.nasceu) / ANDA) * 78, em: t }]);
    setAtaques((a) => a.map((n, k) => (k === b.faixa ? n + 1 : n)));
  };

  const comecar = () => {
    setBonecos([]);
    setCaidos([]);
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
        derrubar(b, t);
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
      derrubar(alvo, Date.now());
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
        {/* O TRIO (redesenhado, 22/11/2026): três raias de areia com cerca de madeira, cada
            gladiador grande na ponta da raia dele, a zona de acertar marcada no chão, os bonecos
            de palha marchando e voando girando quando apanham. */}
        {ORDEM.map((q, k) => (
          <div key={q} className="absolute inset-x-0 z-[6]" style={{ top: `${22 + k * 24}%`, height: '22%' }} aria-hidden>
            <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${minha(k) ? PAPEL[q].cor + '40' : '#00000030'}, ${minha(k) ? PAPEL[q].cor + '18' : '#00000010'})` }} />
            {/* a cerca de madeira em cima da raia */}
            <div className="absolute inset-x-0 top-0 h-[8%] bg-[#6a4220]" />
            {Array.from({ length: 12 }, (_, j) => (
              <span key={j} className="absolute top-[-6%] block h-[18%] w-[1.2%] bg-[#4a2a14]" style={{ left: `${4 + j * 8.4}%` }} />
            ))}
            {/* a zona de acertar: um círculo no chão, aceso na sua raia */}
            {minha(k) && <div className="zona-trio absolute bottom-[6%] left-[16%] h-[34%] w-[22%] rounded-[50%] border-2" style={{ borderColor: PAPEL[q].cor, boxShadow: `0 0 12px ${PAPEL[q].cor}` }} />}
            {/* o gladiador da raia, grande, atacando a cada boneco derrubado */}
            <div className="absolute bottom-[2%] left-[2%] w-[13%]">
              <div key={ataques[k]} className={ataques[k] ? 'pose-golpe' : 'respirar'}>
                <Retrato quem={q} />
              </div>
            </div>
            <span className="absolute left-[15%] top-[10%] font-pixel text-[6px] sm:text-[9px]" style={{ color: PAPEL[q].cor, textShadow: '1px 1px 0 #000' }}>
              {minha(k) ? 'VOCÊ' : ''}
            </span>
          </div>
        ))}
        {caidos.map((c) => (
          <span key={`c${c.id}`} className="boneco-voa absolute z-[11] block w-[7%]" style={{ left: `${c.x}%`, top: `${33 + c.faixa * 24}%`, translate: '-50% -50%' }} aria-hidden>
            <Icone nome="boneco" className="w-full" />
            <span className="tang absolute -top-[60%] left-0 font-pixel text-[8px] text-[#ffd04a] [text-shadow:1px_1px_0_#000] sm:text-sm">PUM!</span>
          </span>
        ))}
        {fase === 'jogo' &&
          bonecos.map((b) => {
            const p = Math.min(1, (agora - b.nasceu) / ANDA);
            const escondido = ORDEM[b.faixa] === 'helios' && Math.floor((agora - b.nasceu) / 400) % 2 === 1;
            return (
              <span
                key={b.id}
                className="boneco-anda absolute z-10 block w-[7%]"
                style={{ left: `${92 - p * 78}%`, top: `${33 + b.faixa * 24}%`, opacity: escondido ? 0.25 : 1, translate: '-50% -50%', filter: 'drop-shadow(0 3px 0 #00000066)' }}
                aria-hidden
              >
                <Icone nome="boneco" className="w-full" />
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
