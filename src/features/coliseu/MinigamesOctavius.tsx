import { useEffect, useRef, useState, type ReactNode } from 'react';
import Icone from '@/ui/pixel/Icones';
import type { Fala, Lugar } from '@/game/historia/roteiro';
import { desbloquear } from '@/ui/som';
import { tocar } from '@/ui/somHistoria';
import { Falas, Palco } from './Cenas';
import { Retrato } from './Cenarios';

/**
 * Os minigames dos capítulos 4 a 6 do Octavius (docs/HISTORIA.md, seção 5.2):
 * - PERSEGUIÇÃO (Cap. 4): a Guarda corre atrás; cada obstáculo pede a ação certa
 *   (muro: PULAR, carroça: DESLIZAR, toldo: ESCALAR);
 * - CANHÕES (Cap. 5): a mira balança sozinha; atire adiantado (a bala demora) e
 *   ABAIXE quando o navio inimigo disparar;
 * - ESTRELAS (Cap. 5): o Helios mostra as estrelas da rota; toque nelas na mesma ordem
 *   antes de as nuvens cobrirem;
 * - BARCOS (Cap. 6): na arena inundada, pule de barco em barco quando o barco de cima
 *   estiver bem na sua frente.
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
      className="pixel-box select-none py-4 font-pixel text-[10px] active:translate-y-0.5 disabled:opacity-40 sm:text-xs"
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

// ---------- PERSEGUIÇÃO ----------
const OBSTACULOS = [
  { id: 'muro', icone: 'muro', acao: 'PULAR' },
  { id: 'carroca', icone: 'carroca', acao: 'DESLIZAR' },
  { id: 'toldo', icone: 'toldo', acao: 'ESCALAR' },
] as const;
const TOTAL_PERSEGUICAO = 18;

export function MinigamePerseguicao({ lugar, antes, depois, onFim }: Base) {
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [atual, setAtual] = useState<{ tipo: number; nasceu: number } | null>(null);
  const [agora, setAgora] = useState(0);
  const [passados, setPassados] = useState(0);
  const [distancia, setDistancia] = useState(3);
  const [pose, setPose] = useState<string | null>(null);
  const tempo = Math.max(1100, 2000 - passados * 50);

  const novo = () => setAtual({ tipo: Math.floor(Math.random() * 3), nasceu: Date.now() });
  const comecar = () => {
    setPassados(0);
    setDistancia(3);
    setFase('jogo');
    novo();
  };
  useEffect(() => {
    if (fase === 'jogo' && !atual) novo();
  }, [fase]);

  const resolver = (certo: boolean) => {
    if (certo) {
      tocar('esquiva');
      if (passados + 1 >= TOTAL_PERSEGUICAO) {
        tocar('fanfarra');
        setFase('ok');
        return;
      }
      setPassados((p) => p + 1);
    } else {
      tocar('dano');
      // A Guarda chega mais perto.
      if (distancia <= 1) {
        setFase('perdeu');
        return;
      }
      setDistancia((d) => d - 1);
      setPassados((p) => p + 1);
    }
    setAtual(null);
    window.setTimeout(novo, 250);
  };

  useTique(fase === 'jogo', 40, () => {
    setAgora(Date.now());
    if (atual && Date.now() - atual.nasceu >= tempo) resolver(false);
  });

  const agir = (acao: string) => {
    if (fase !== 'jogo' || !atual) return;
    setPose(acao);
    window.setTimeout(() => setPose(null), 300);
    resolver(OBSTACULOS[atual.tipo]!.acao === acao);
  };

  const p = atual ? Math.min(1, (agora - atual.nasceu) / tempo) : 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">
          FUJA PELA SUBURA: PULAR · DESLIZAR · ESCALAR. {Math.min(passados, TOTAL_PERSEGUICAO)}/{TOTAL_PERSEGUICAO}
        </p>
        <Vidas n={distancia} max={3} icone="" />
      </div>
      <Palco lugar={lugar}>
        <div className="absolute bottom-[12%] left-[30%] z-10 w-[14%] -translate-x-1/2 transition-[bottom] duration-100" style={{ bottom: pose === 'PULAR' || pose === 'ESCALAR' ? '30%' : '12%' }} aria-hidden>
          <div className={pose ? '' : 'andar'} style={{ scale: pose === 'DESLIZAR' ? '1.2 0.55' : undefined, transformOrigin: 'bottom' }}>
            <Retrato quem="octavius" />
          </div>
        </div>
        {/* a Guarda atrás, cada vez mais perto quando você erra */}
        <div className="absolute bottom-[12%] z-10 w-[10%] -translate-x-1/2 transition-[left] duration-300" style={{ left: `${4 + (3 - distancia) * 6}%` }} aria-hidden>
          <div className="andar">
            <Retrato quem="guarda" />
          </div>
        </div>
        {fase === 'jogo' && atual && (
          <span className="absolute bottom-[14%] z-20 -translate-x-1/2 text-4xl sm:text-6xl" style={{ left: `${92 - p * 58}%` }} aria-hidden>
            <Icone nome={OBSTACULOS[atual.tipo]!.icone} className="inline-block w-[1em]" />
          </span>
        )}
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && <Perdeu titulo="A GUARDA TE PEGOU" dica="Muro: PULAR. Carroça: DESLIZAR por baixo. Toldo: ESCALAR por cima. Responda antes do obstáculo chegar." onDeNovo={comecar} />}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
      <div className="grid grid-cols-3 gap-2">
        <Botao disabled={fase !== 'jogo'} onApertar={() => agir('PULAR')}>
          PULAR
        </Botao>
        <Botao disabled={fase !== 'jogo'} onApertar={() => agir('DESLIZAR')} cor="#4ef0dc">
          DESLIZAR
        </Botao>
        <Botao disabled={fase !== 'jogo'} onApertar={() => agir('ESCALAR')} cor="#ff5ab8">
          ESCALAR
        </Botao>
      </div>
    </div>
  );
}

// ---------- CANHÕES ----------
const ACERTOS_CANHAO = 5;
const VOO_BALA = 700;

export function MinigameCanhoes({ lugar, antes, depois, onFim }: Base) {
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [t, setT] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [casco, setCasco] = useState(3);
  const [balas, setBalas] = useState<{ id: number; x: number; chega: number }[]>([]);
  const [explosao, setExplosao] = useState<{ x: number; ate: number; acertou: boolean } | null>(null);
  const [ataque, setAtaque] = useState<number | null>(null);
  const [abaixado, setAbaixado] = useState(0);
  const seq = useRef(0);
  const proximoAtaque = useRef(0);

  // O navio inimigo anda de um lado para o outro; a mira balança mais rápido.
  const navio = 50 + Math.sin(t * 0.018) * 32;
  const mira = 50 + Math.sin(t * 0.045 + 1) * 40;

  const comecar = () => {
    setAcertos(0);
    setCasco(3);
    setBalas([]);
    setAtaque(null);
    proximoAtaque.current = Date.now() + 3500;
    setFase('jogo');
  };
  useEffect(() => {
    if (fase === 'jogo') proximoAtaque.current = Date.now() + 3500;
  }, [fase]);

  useTique(fase === 'jogo', 30, () => {
    const agora = Date.now();
    setT((x) => x + 1);
    // Balas chegando.
    for (const b of balas) {
      if (agora >= b.chega) {
        const acertou = Math.abs(b.x - navio) < 8;
        setBalas((bs) => bs.filter((y) => y.id !== b.id));
        setExplosao({ x: b.x, ate: agora + 400, acertou });
        if (acertou) {
          tocar('catapulta');
          if (acertos + 1 >= ACERTOS_CANHAO) {
            tocar('fanfarra');
            setFase('ok');
            return;
          }
          setAcertos((a) => a + 1);
        } else tocar('onda');
      }
    }
    // O navio inimigo atira: ABAIXE em 1,1 s.
    if (ataque === null && agora >= proximoAtaque.current) {
      setAtaque(agora + 1100);
      tocar('contra');
    }
    if (ataque !== null && agora >= ataque) {
      setAtaque(null);
      proximoAtaque.current = agora + 3000 + Math.random() * 2000;
      if (agora > abaixado) {
        tocar('dano');
        if (casco <= 1) {
          setFase('perdeu');
          return;
        }
        setCasco((c) => c - 1);
      } else tocar('escudoMetal');
    }
  });

  const atirar = () => {
    if (fase !== 'jogo' || balas.length >= 2) return;
    tocar('pesada');
    seq.current += 1;
    setBalas((b) => [...b, { id: seq.current, x: mira, chega: Date.now() + VOO_BALA }]);
  };
  const abaixar = () => {
    if (fase !== 'jogo') return;
    setAbaixado(Date.now() + 700);
  };

  const ex = explosao && Date.now() < explosao.ate ? explosao : null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">
          CANHÕES: atire um pouco ANTES do navio chegar na mira (a bala demora). Acertos {acertos}/{ACERTOS_CANHAO}
        </p>
        <Vidas n={casco} max={3} icone="" />
      </div>
      <Palco lugar={lugar} className={ataque !== null ? 'tremer' : ''}>
        {fase === 'jogo' && (
          <>
            <span className="absolute top-[34%] z-10 -translate-x-1/2 text-3xl sm:text-5xl" style={{ left: `${navio}%` }} aria-hidden>
              <Icone nome="navio" className="inline-block w-[100%] align-middle" />
            </span>
            <span className="absolute top-[30%] z-20 block w-[8%] -translate-x-1/2" style={{ left: `${mira}%`, filter: 'drop-shadow(0 0 4px #ff3a3a)' }} aria-hidden>
              <Icone nome="alvo" className="w-full" />
            </span>
            {/* o mar batendo e o nosso canhão, que dá coice e solta fumaça a cada tiro */}
            <div className="chuva-forte pointer-events-none absolute inset-x-0 bottom-[22%] z-[9] h-[10%] opacity-40" aria-hidden />
            <div key={balas.length} className="coice-canhao pointer-events-none absolute bottom-[14%] left-[32%] z-[11] h-[6%] w-[12%] rounded-r-full border-2 border-black bg-[linear-gradient(180deg,#5a5a64,#2a2a34)]" aria-hidden>
              {balas.length > 0 && <span className="fumaca-tiro absolute -right-[30%] top-1/2 block h-[160%] w-[50%] -translate-y-1/2 rounded-full bg-[#d8d8e0]/70" />}
            </div>
            {balas.map((b) => (
              <span key={b.id} className="absolute z-20 h-2 w-2 -translate-x-1/2 rounded-full bg-black shadow-[0_0_4px_#fff]" style={{ left: `${b.x}%`, top: `${70 - (1 - Math.max(0, b.chega - Date.now()) / VOO_BALA) * 32}%` }} />
            ))}
            {ex && (
              <span className="absolute top-[32%] z-20 -translate-x-1/2 text-3xl sm:text-5xl" style={{ left: `${ex.x}%` }} aria-hidden>
                <Icone nome={ex.acertou ? 'explosao' : 'respingo'} className="inline-block w-[1em]" />
              </span>
            )}
            {ataque !== null && (
              <span className="piscar absolute left-1/2 top-[12%] z-30 -translate-x-1/2 whitespace-nowrap border-2 border-black bg-[#ff3a3a] px-2 py-1 font-pixel text-[9px] text-black sm:text-sm">
                ELES VÃO ATIRAR: ABAIXE!
              </span>
            )}
          </>
        )}
        <div className="absolute bottom-[12%] left-[20%] z-10 w-[14%] -translate-x-1/2" aria-hidden style={{ scale: Date.now() < abaixado ? '1 0.6' : undefined, transformOrigin: 'bottom' }}>
          <Retrato quem="octavius" />
        </div>
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && <Perdeu titulo="O NAVIO AFUNDOU" dica="A bala demora um pouco: atire ANTES do navio chegar na mira. E quando aparecer o aviso vermelho, ABAIXE logo." onDeNovo={comecar} />}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
      <div className="grid grid-cols-2 gap-2">
        <Botao disabled={fase !== 'jogo'} onApertar={atirar}>
          FOGO!
        </Botao>
        <Botao disabled={fase !== 'jogo'} onApertar={abaixar} cor="#ff5a5a">
          ABAIXAR
        </Botao>
      </div>
    </div>
  );
}

// ---------- ESTRELAS ----------
const RODADAS_ESTRELAS = [3, 4, 5, 5];

export function MinigameEstrelas({ lugar, antes, depois, onFim }: Base) {
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [rodada, setRodada] = useState(0);
  const [estrelas, setEstrelas] = useState<{ x: number; y: number }[]>([]);
  const [rota, setRota] = useState<number[]>([]);
  const [mostrando, setMostrando] = useState(-1);
  const [tocadas, setTocadas] = useState<number[]>([]);
  const [vidas, setVidas] = useState(3);
  const [nuvem, setNuvem] = useState(-30);

  const nova = (r: number) => {
    const es = Array.from({ length: 9 }, (_, k) => ({ x: 8 + ((k * 37 + r * 13) % 84), y: 12 + ((k * 23 + r * 7) % 48) }));
    setEstrelas(es);
    setRota([0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5).slice(0, RODADAS_ESTRELAS[r]!));
    setTocadas([]);
    setMostrando(0);
    setNuvem(-30);
  };
  useEffect(() => {
    if (fase === 'jogo') nova(rodada);
  }, [fase, rodada]);
  useEffect(() => {
    if (mostrando < 0) return;
    if (mostrando >= rota.length) {
      const id = window.setTimeout(() => setMostrando(-1), 500);
      return () => window.clearTimeout(id);
    }
    tocar('pergunta');
    const id = window.setTimeout(() => setMostrando((m) => m + 1), 750);
    return () => window.clearTimeout(id);
  }, [mostrando, rota]);
  // A nuvem vem cobrindo o céu enquanto você responde.
  useTique(fase === 'jogo' && mostrando < 0, 50, () => {
    setNuvem((n) => {
      if (n + 0.5 >= 100) {
        errar();
        return -30;
      }
      return n + 0.5;
    });
  });

  const errar = () => {
    tocar('falha');
    if (vidas <= 1) {
      setFase('perdeu');
      return;
    }
    setVidas((v) => v - 1);
    nova(rodada);
  };

  const tocarEstrela = (k: number) => {
    if (fase !== 'jogo' || mostrando >= 0) return;
    desbloquear();
    const proxima = rota[tocadas.length];
    if (k !== proxima) return errar();
    tocar('selecionar');
    const t = [...tocadas, k];
    setTocadas(t);
    if (t.length === rota.length) {
      if (rodada + 1 >= RODADAS_ESTRELAS.length) {
        tocar('fanfarra');
        setFase('ok');
      } else window.setTimeout(() => setRodada((r) => r + 1), 400);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">
          NAVEGUE PELAS ESTRELAS: veja a ordem que o Helios mostra e toque nas estrelas igual. Rota {Math.min(rodada + 1, RODADAS_ESTRELAS.length)}/{RODADAS_ESTRELAS.length}
        </p>
        <Vidas n={vidas} max={3} icone="" />
      </div>
      <Palco lugar={lugar}>
        <div className="absolute inset-0 z-[5] bg-[#04051a]/75" aria-hidden />
        {fase === 'jogo' &&
          estrelas.map((e, k) => {
            const acesa = mostrando >= 0 && rota[mostrando] === k;
            const feita = tocadas.includes(k);
            return (
              <button
                key={`${rodada}-${k}`}
                type="button"
                onPointerDown={(ev) => {
                  ev.preventDefault();
                  tocarEstrela(k);
                }}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 p-2 text-2xl sm:text-4xl"
                style={{ left: `${e.x}%`, top: `${e.y}%`, filter: acesa ? 'drop-shadow(0 0 12px #ffd04a)' : feita ? 'drop-shadow(0 0 8px #4ef0dc)' : undefined, scale: acesa ? '1.6' : '1' }}
                aria-label={`Estrela ${k + 1}`}
              >
                <Icone nome="estrela" className={`inline-block w-[1em] ${feita ? 'brilho-estrela' : ''}`} />
              </button>
            );
          })}
        {fase === 'jogo' && mostrando < 0 && <span className="pointer-events-none absolute top-[6%] z-20 text-5xl opacity-90 sm:text-7xl" style={{ left: `${nuvem}%` }} aria-hidden><span className="inline-flex w-[2.2em] gap-1"><Icone nome="nuvem" className="w-full" /><Icone nome="nuvem" className="w-full" /></span></span>}
        <div className="absolute bottom-[12%] left-[16%] z-10 w-[10%] -translate-x-1/2" aria-hidden>
          <div className="brilho-heroi">
            <Retrato quem="helios" />
          </div>
        </div>
        <div className="absolute bottom-[12%] left-[30%] z-10 w-[10%] -translate-x-1/2" aria-hidden>
          <Retrato quem="octavius" />
        </div>
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && <Perdeu titulo="O NAVIO SE PERDEU" dica="Olhe a ordem em que as estrelas brilham e toque nelas igual, antes das nuvens passarem." onDeNovo={() => { setVidas(3); setRodada(0); setFase('jogo'); nova(0); }} />}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
      <p className="text-center text-xs text-muted">{mostrando >= 0 ? 'Olhe bem: o Helios está mostrando a rota...' : 'Sua vez: toque nas estrelas na mesma ordem.'}</p>
    </div>
  );
}

// ---------- BARCOS ----------
const FILEIRAS = 6;

export function MinigameBarcos({ lugar, antes, depois, onFim }: Base) {
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [fileira, setFileira] = useState(0);
  const [t, setT] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [caiu, setCaiu] = useState(false);
  // Cada fileira tem um barco indo e voltando, mais rápido lá em cima.
  const barco = (f: number) => 50 + Math.sin(t * (0.02 + f * 0.006) + f * 1.7) * 38;
  const heroiX = fileira === 0 ? 50 : barco(fileira - 1);

  useTique(fase === 'jogo', 30, () => setT((x) => x + 1));

  const pular = () => {
    if (fase !== 'jogo' || caiu) return;
    const alvo = barco(fileira);
    if (Math.abs(alvo - heroiX) < 9) {
      tocar('esquiva');
      if (fileira + 1 >= FILEIRAS) {
        tocar('fanfarra');
        setFase('ok');
        return;
      }
      setFileira((f) => f + 1);
    } else {
      tocar('onda');
      setCaiu(true);
      window.setTimeout(() => setCaiu(false), 700);
      if (vidas <= 1) {
        setFase('perdeu');
        return;
      }
      setVidas((v) => v - 1);
      setFileira(0);
    }
  };

  const yFileira = (f: number) => 80 - f * 12;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">PULE DE BARCO EM BARCO até o barco do campeão! Fileira {fileira}/{FILEIRAS}</p>
        <Vidas n={vidas} max={3} icone="" />
      </div>
      <Palco lugar={lugar} className={caiu ? 'tremer-forte' : ''}>
        <div className="absolute inset-0 z-[5] bg-[#1a4a7a]/35" aria-hidden />
        {/* as faixas de mar com as ondinhas correndo */}
        {fase === 'jogo' &&
          Array.from({ length: FILEIRAS }, (_, f) => (
            <div key={`m${f}`} className="mar-faixa pointer-events-none absolute inset-x-0 z-[6] h-[6%] -translate-y-1/2" style={{ top: `${yFileira(f + 1)}%`, animationDuration: `${2.4 - f * 0.25}s` }} aria-hidden />
          ))}
        {fase === 'jogo' &&
          Array.from({ length: FILEIRAS }, (_, f) => (
            <span key={f} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-4xl" style={{ left: `${barco(f)}%`, top: `${yFileira(f + 1)}%`, opacity: f === fileira ? 1 : 0.65 }} aria-hidden>
              <Icone nome={f === FILEIRAS - 1 ? 'bandeira' : 'barco'} className="inline-block w-[1em]" />
            </span>
          ))}
        {fase === 'jogo' && (
          <div className="absolute z-20 w-[8%] -translate-x-1/2 -translate-y-full transition-[left,top] duration-200" style={{ left: `${heroiX}%`, top: `${yFileira(fileira)}%` }} aria-hidden>
            <div className={caiu ? 'apagar-ia' : 'respirar'}>
              <Retrato quem="octavius" />
            </div>
          </div>
        )}
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && <Perdeu titulo="SPLASH!" dica="Pule só quando o barco de cima estiver bem na sua frente. Lá em cima eles andam mais rápido!" onDeNovo={() => { setVidas(3); setFileira(0); setFase('jogo'); }} />}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
      <Botao disabled={fase !== 'jogo'} onApertar={pular}>
        PULAR PARA O PRÓXIMO BARCO
      </Botao>
    </div>
  );
}
