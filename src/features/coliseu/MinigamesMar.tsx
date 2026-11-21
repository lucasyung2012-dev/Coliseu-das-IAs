import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Fala, Lugar } from '@/game/historia/roteiro';
import { desbloquear } from '@/ui/som';
import { tocar } from '@/ui/somHistoria';
import { Falas, Palco } from './Cenas';
import { Retrato } from './Cenarios';

/**
 * Os minigames do mar do Octavius (Capítulo 2, As Galés):
 * - REMAR: o Feitor bate o tambor e diz o lado (TUM à esquerda, TÁ à direita);
 *   reme do lado certo no tempo da batida;
 * - TEMPESTADE: as ondas avisam quais cordas vão arrebentar; amarre as cordas certas
 *   antes de a onda bater.
 */

type Fase = 'antes' | 'jogo' | 'ok' | 'perdeu';

function Vidas({ n, max, icone }: { n: number; max: number; icone: string }) {
  return (
    <span className="font-pixel text-[10px] sm:text-xs" aria-label={`${n} chances`}>
      {Array.from({ length: max }, (_, k) => (
        <span key={k} className={k < n ? '' : 'opacity-25'}>
          {icone}
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

function Botao({ children, onApertar, disabled, cor = '#f2c14e' }: { children: ReactNode; onApertar: () => void; disabled?: boolean; cor?: string }) {
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

// ---------- REMAR NO RITMO DO TAMBOR ----------
const REMADAS = 20;
const PRECISA_REMAR = 15;

export function DesafioRemar({ lugar, antes, depois, onFim }: Base) {
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [batida, setBatida] = useState(-1);
  const [lado, setLado] = useState<0 | 1>(0);
  const [respondeu, setRespondeu] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [chicote, setChicote] = useState(0);
  const [brilho, setBrilho] = useState<'ok' | 'erro' | null>(null);
  const intervalo = Math.max(650, 1200 - batida * 25);
  // O tambor lê o valor atual (não o da batida anterior).
  const respondeuRef = useRef(false);
  respondeuRef.current = respondeu;
  const acertosRef = useRef(0);
  acertosRef.current = acertos;

  const recomecar = () => {
    setBatida(-1);
    setAcertos(0);
    setChicote(0);
    setFase('jogo');
  };

  // O tambor: a cada batida sorteia o lado. Quem não remou na batida, leva bronca.
  useEffect(() => {
    if (fase !== 'jogo') return;
    const id = window.setTimeout(() => {
      if (batida >= 0 && !respondeuRef.current) errar();
      if (batida + 1 >= REMADAS) {
        if (acertosRef.current >= PRECISA_REMAR) {
          tocar('fanfarra');
          setFase('ok');
        } else setFase('perdeu');
        return;
      }
      tocar('tambor');
      setLado(Math.random() < 0.5 ? 0 : 1);
      setRespondeu(false);
      setBatida((b) => b + 1);
    }, batida < 0 ? 900 : intervalo);
    return () => window.clearTimeout(id);
  }, [fase, batida]);

  const errar = () => {
    tocar('falha');
    setBrilho('erro');
    window.setTimeout(() => setBrilho(null), 200);
    setChicote((c) => {
      if (c + 1 >= 4) setFase('perdeu');
      return c + 1;
    });
  };

  const remar = (l: 0 | 1) => {
    if (fase !== 'jogo' || batida < 0 || respondeu) return;
    setRespondeu(true);
    if (l === lado) {
      tocar('remo');
      setAcertos((a) => a + 1);
      setBrilho('ok');
      window.setTimeout(() => setBrilho(null), 150);
    } else errar();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">
          🥁 REME NO TAMBOR: TUM = esquerda, TÁ = direita. Remadas certas {acertos}/{PRECISA_REMAR}
        </p>
        <Vidas n={4 - chicote} max={4} icone="⛓️" />
      </div>
      <Palco lugar={lugar} className={brilho === 'erro' ? 'tremer-forte' : ''}>
        {fase === 'jogo' && batida >= 0 && (
          <span
            key={batida}
            className="surgir absolute top-[16%] z-20 font-pixel text-2xl [text-shadow:3px_3px_0_#000] sm:text-5xl"
            style={{ left: lado === 0 ? '18%' : '62%', color: lado === 0 ? '#ffd04a' : '#4ef0dc' }}
          >
            🥁 {lado === 0 ? 'TUM!' : 'TÁ!'}
          </span>
        )}
        <div className="absolute bottom-[12%] left-[45%] z-10 w-[11%] -translate-x-1/2" aria-hidden>
          <div className={brilho === 'ok' ? 'investida-dir' : 'respirar'} key={acertos}>
            <Retrato quem="octavius" />
          </div>
        </div>
        <div className="absolute bottom-[12%] left-[62%] z-10 w-[10%] -translate-x-1/2" aria-hidden>
          <Retrato quem="pistao" espelhar />
        </div>
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && (
          <Perdeu
            titulo="O FEITOR FICOU BRAVO"
            dica={`Reme do lado que o tambor mandar, logo na batida. Precisa de ${PRECISA_REMAR} remadas certas em ${REMADAS}.`}
            onDeNovo={recomecar}
          />
        )}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
      <div className="grid grid-cols-2 gap-2">
        <Botao disabled={fase !== 'jogo'} onApertar={() => remar(0)}>
          ◀ REMO ESQUERDO (TUM)
        </Botao>
        <Botao disabled={fase !== 'jogo'} onApertar={() => remar(1)} cor="#4ef0dc">
          REMO DIREITO (TÁ) ▶
        </Botao>
      </div>
    </div>
  );
}

// ---------- A TEMPESTADE ----------
const CORDAS = ['🪢 PROA', '🪢 MASTRO', '🪢 VELA', '🪢 POPA'];
const ONDAS = 9;

export function DesafioTempestade({ lugar, antes, depois, onFim }: Base) {
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [onda, setOnda] = useState(0);
  const [alvo, setAlvo] = useState<number[]>([]);
  const [amarradas, setAmarradas] = useState<number[]>([]);
  const [bateEm, setBateEm] = useState(0);
  const [agora, setAgora] = useState(0);
  const [casco, setCasco] = useState(3);
  const [batendo, setBatendo] = useState(false);

  const nova = (n: number) => {
    const q = n < 3 ? 1 : n < 6 ? 2 : 3;
    setAlvo([0, 1, 2, 3].sort(() => Math.random() - 0.5).slice(0, q));
    setAmarradas([]);
    setBateEm(Date.now() + Math.max(1700, 3000 - n * 150));
  };
  useEffect(() => {
    if (fase === 'jogo') nova(onda);
  }, [fase, onda]);

  useTique(fase === 'jogo', 50, () => {
    const t = Date.now();
    setAgora(t);
    if (t < bateEm || batendo) return;
    // A onda bate: corda certa que não foi amarrada arrebenta.
    setBatendo(true);
    tocar('onda');
    const soltas = alvo.filter((a) => !amarradas.includes(a)).length;
    window.setTimeout(() => setBatendo(false), 500);
    if (soltas > 0) {
      tocar('falha');
      if (casco - 1 <= 0) {
        setFase('perdeu');
        return;
      }
      setCasco((c) => c - 1);
    }
    if (onda + 1 >= ONDAS) {
      tocar('fanfarra');
      setFase('ok');
    } else setOnda((o) => o + 1);
  });

  const amarrar = (k: number) => {
    if (fase !== 'jogo' || amarradas.includes(k)) return;
    if (alvo.includes(k)) {
      tocar('escudoMetal');
      setAmarradas((a) => [...a, k]);
    } else {
      // Amarrou a errada: perde tempo.
      tocar('falha');
      setBateEm((b) => b - 400);
    }
  };

  const falta = Math.max(0, bateEm - agora);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">
          🌊 TEMPESTADE: amarre as cordas que piscarem antes da onda! Onda {Math.min(onda + 1, ONDAS)}/{ONDAS}
        </p>
        <Vidas n={casco} max={3} icone="🚢" />
      </div>
      <Palco lugar={lugar} className={batendo ? 'tremer-forte' : ''}>
        {fase === 'jogo' && (
          <>
            <div className="absolute inset-x-[10%] top-[8%] z-20 h-2 border border-black bg-black/60">
              <div className="h-full bg-[#5ab0ff]" style={{ width: `${Math.min(100, 100 - falta / 30)}%` }} />
            </div>
            <span className="absolute left-1/2 top-[14%] z-20 -translate-x-1/2 whitespace-nowrap font-pixel text-[9px] text-white [text-shadow:2px_2px_0_#000] sm:text-sm">
              {batendo ? '🌊 SPLAAASH!' : `A ONDA VEM AÍ: ${(falta / 1000).toFixed(1)} s`}
            </span>
          </>
        )}
        <div className="absolute bottom-[12%] left-[50%] z-10 w-[11%] -translate-x-1/2" aria-hidden>
          <div className={batendo ? 'tremer' : 'respirar'}>
            <Retrato quem="octavius" />
          </div>
        </div>
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && (
          <Perdeu
            titulo="O MASTRO QUEBROU"
            dica="Quando a onda vem, as cordas que vão arrebentar ficam piscando. Amarre só essas, rápido!"
            onDeNovo={() => {
              setCasco(3);
              setOnda(0);
              setFase('jogo');
              nova(0);
            }}
          />
        )}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CORDAS.map((c, k) => {
          const pisca = fase === 'jogo' && alvo.includes(k) && !amarradas.includes(k);
          return (
            <button
              key={c}
              type="button"
              disabled={fase !== 'jogo'}
              onPointerDown={(ev) => {
                ev.preventDefault();
                desbloquear();
                amarrar(k);
              }}
              className={`pixel-box select-none py-4 font-pixel text-[10px] disabled:opacity-40 ${pisca ? 'piscar' : ''}`}
              style={{ boxShadow: `0 0 0 2px ${amarradas.includes(k) ? '#4ad46a' : pisca ? '#ff3a3a' : '#444'}` }}
            >
              {amarradas.includes(k) ? '✔ ' : ''}
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
