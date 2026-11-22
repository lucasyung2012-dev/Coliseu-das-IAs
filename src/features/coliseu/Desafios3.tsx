import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Icone from '@/ui/pixel/Icones';
import type { Fala, Falante, Lugar } from '@/game/historia/roteiro';
import { prefereMenosMovimento } from '@/ui/movimento';
import { desbloquear } from '@/ui/som';
import { tocar } from '@/ui/somHistoria';
import { Falas, Palco } from './Cenas';
import { Retrato } from './Cenarios';
import Emote from '@/ui/pixel/Emotes';

/**
 * Desafios novos (21/11/2026), para as lutas não virem uma atrás da outra:
 * - FURTIVO: atravessar sem ser visto (só anda quando a luz não está olhando);
 * - RITMO: girar o guincho no tempo certo;
 * - PROTEGER: derrubar o que jogam na Lívia enquanto ela lê;
 * - ARMADILHAS: fugir dos espetos que sobem do chão da arena.
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

/** Um relógio que bate a cada `ms` enquanto `ligado`. */
function useTique(ligado: boolean, ms: number, fn: () => void) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!ligado) return;
    const id = window.setInterval(() => ref.current(), ms);
    return () => window.clearInterval(id);
  }, [ligado, ms]);
}

// ---------- FURTIVO ----------

type Luz = 'verde' | 'amarela' | 'vermelha';
const DURACAO_LUZ: Record<Luz, [number, number]> = { verde: [1800, 3000], amarela: [700, 700], vermelha: [1400, 2200] };
const PROXIMA_LUZ: Record<Luz, Luz> = { verde: 'amarela', amarela: 'vermelha', vermelha: 'verde' };

export function DesafioFurtivo({
  lugar,
  heroi,
  antes,
  depois,
  vigia,
  objetivo,
  onFim,
}: {
  lugar: Lugar;
  heroi: Falante;
  antes?: Fala[];
  depois: Fala[];
  /** O que vigia: o farol, a lanterna da patrulha... */
  vigia: string;
  objetivo: string;
  onFim: () => void;
}) {
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [pos, setPos] = useState(0);
  const [salvo, setSalvo] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [luz, setLuz] = useState<Luz>('verde');
  const [trocaEm, setTrocaEm] = useState(0);
  const [andando, setAndando] = useState(false);
  const [pego, setPego] = useState(false);

  const recomecar = () => {
    setPos(0);
    setSalvo(0);
    setVidas(3);
    setLuz('verde');
    setTrocaEm(Date.now() + 2500);
    setFase('jogo');
  };
  useEffect(() => {
    if (fase === 'jogo') setTrocaEm(Date.now() + 2500);
  }, [fase]);

  useTique(fase === 'jogo', 50, () => {
    const agora = Date.now();
    if (agora >= trocaEm) {
      const nova = PROXIMA_LUZ[luz];
      const [a, b] = DURACAO_LUZ[nova];
      setLuz(nova);
      setTrocaEm(agora + a + Math.random() * (b - a));
      if (nova === 'vermelha') tocar('pergunta');
    }
    if (!andando || pego) return;
    if (luz === 'vermelha') {
      // Pego no flagra: volta para o último esconderijo.
      tocar('falha');
      setPego(true);
      setAndando(false);
      window.setTimeout(() => setPego(false), 700);
      if (vidas <= 1) {
        setFase('perdeu');
        return;
      }
      setVidas((v) => v - 1);
      setPos(salvo);
      return;
    }
    const novo = Math.min(100, pos + 0.75);
    setPos(novo);
    // Esconderijos a cada 25%.
    if (Math.floor(novo / 25) > Math.floor(salvo / 25)) {
      setSalvo(Math.floor(novo / 25) * 25);
      tocar('selecionar');
    }
    if (novo >= 100) {
      tocar('fanfarra');
      setAndando(false);
      setFase('ok');
    }
  });

  const cor = luz === 'verde' ? '#4ad46a' : luz === 'amarela' ? '#ffd04a' : '#ff3a3a';
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">{objetivo}</p>
        <Vidas n={vidas} max={3} icone="" />
      </div>
      <Palco lugar={lugar} className={pego ? 'tremer-forte' : ''}>
        {/* a luz que vigia, varrendo a cena */}
        {fase === 'jogo' && (
          <div
            className="pointer-events-none absolute inset-0 z-[5] transition-opacity duration-300"
            style={{ background: `radial-gradient(ellipse at ${luz === 'vermelha' ? 50 : 85}% 10%, ${cor}55, transparent 65%)`, opacity: luz === 'verde' ? 0.25 : 0.9 }}
            aria-hidden
          />
        )}
        {/* O FURTIVO (redesenhado, 22/11/2026): quem vigia aparece de verdade (o farol girando, ou
            alguém com a lanterna), e o facho de luz varre o chão quando ele olha. Esconderijos maiores. */}
        {fase === 'jogo' && (
          <div
            className="pointer-events-none absolute bottom-[10%] right-[12%] z-[7] h-[46%] w-[82%] transition-opacity duration-200"
            style={{
              background: `linear-gradient(270deg, ${cor}cc, ${cor}55 55%, transparent)`,
              clipPath: 'polygon(100% 18%, 0 70%, 0 100%, 100% 26%)',
              opacity: luz === 'vermelha' ? 0.75 : luz === 'amarela' ? 0.25 : 0,
            }}
            aria-hidden
          />
        )}
        {vigia.includes('farol') ? (
          <div className="pointer-events-none absolute bottom-[12%] right-[3%] z-[8] h-[62%] w-[9%]" aria-hidden>
            <div className="absolute inset-x-[15%] bottom-0 top-[22%] bg-[repeating-linear-gradient(180deg,#f0e6d0_0_14%,#c0283c_14%_28%)]" />
            <div className="absolute inset-x-0 top-[8%] h-[16%] border-2 border-[#2a2a34] bg-[#ffe08a]" style={{ boxShadow: luz === 'vermelha' ? '0 0 30px 10px #ffe08a' : '0 0 8px #ffe08a' }} />
            <div className="absolute inset-x-[10%] top-0 h-[9%] bg-[#3a3a44]" />
          </div>
        ) : (
          <div className="pointer-events-none absolute bottom-[12%] right-[3%] z-[8] w-[11%]" aria-hidden>
            {pego && (
              <span className="emote-pula absolute -top-[30%] left-1/2 block w-[45%] -translate-x-1/2">
                <Emote emocao="bravo" />
              </span>
            )}
            {/* a lanterna na mão */}
            <span className="absolute left-[8%] top-[46%] z-10 block aspect-square w-[22%] rounded-sm border-2 border-[#3a2a1a] bg-[#ffe08a]" style={{ boxShadow: luz === 'verde' ? '0 0 6px #ffe08a' : '0 0 18px 6px #ffe08a' }} />
            <Retrato quem="guarda" espelhar={luz !== 'verde'} />
          </div>
        )}
        {/* esconderijos: barris e caixotes grandes, com sombra */}
        {[25, 50, 75].map((x, j) => (
          <span key={x} className="absolute bottom-[11%] z-[11] block w-[9%] -translate-x-1/2" style={{ left: `${6 + x * 0.86}%` }} aria-hidden>
            <span className="absolute -bottom-[6%] left-[5%] h-[14%] w-[90%] rounded-[50%] bg-black/45" />
            <Icone nome={j === 1 ? 'barril' : 'caixote'} className="w-full" />
            {salvo >= x && <span className="absolute -top-[30%] left-1/2 -translate-x-1/2 font-pixel text-[7px] text-[#4ad46a] [text-shadow:1px_1px_0_#000] sm:text-[9px]">OK</span>}
          </span>
        ))}
        <span className="absolute bottom-[14%] right-[3%] z-[6] font-pixel text-[8px] text-[#4ad46a] sm:text-[10px]">CHEGADA ▶</span>
        {/* o herói */}
        <div className="absolute bottom-[14%] z-10 w-[12%] -translate-x-1/2" style={{ left: `${6 + pos * 0.86}%` }} aria-hidden>
          {/* parado, ele se agacha (fica menor e mais escuro) */}
          <div className={andando ? 'andar' : 'respirar'} style={{ scale: andando ? undefined : '1 0.88', transformOrigin: '50% 100%', filter: andando ? undefined : 'brightness(0.7)' }}>
            <Retrato quem={heroi} />
          </div>
        </div>
        {fase === 'jogo' && (
          <span className="absolute left-1/2 top-[12%] z-20 -translate-x-1/2 whitespace-nowrap border-2 border-black px-2 py-1 font-pixel text-[8px] text-black sm:text-xs" style={{ background: cor }}>
            {luz === 'verde' ? `${vigia.toUpperCase()} OLHANDO PRO OUTRO LADO: ANDE!` : luz === 'amarela' ? 'CUIDADO...' : `${vigia.toUpperCase()} OLHANDO: PARADO!`}
          </span>
        )}
        {pego && <span className="absolute left-1/2 top-[40%] z-20 -translate-x-1/2 font-pixel text-sm text-[#ff5a5a] [text-shadow:2px_2px_0_#000] sm:text-xl">VISTO! DE VOLTA AO ESCONDERIJO</span>}
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && <Perdeu titulo="PEGO!" dica={`Só ande com a luz verde. No amarelo, solte o botão: ${vigia} já vai olhar.`} onDeNovo={recomecar} />}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
      <button
        type="button"
        disabled={fase !== 'jogo'}
        onPointerDown={(ev) => {
          ev.preventDefault();
          desbloquear();
          setAndando(true);
        }}
        onPointerUp={() => setAndando(false)}
        onPointerLeave={() => setAndando(false)}
        onKeyDown={(ev) => {
          if (ev.key === ' ' || ev.key === 'Enter') setAndando(true);
        }}
        onKeyUp={() => setAndando(false)}
        className="pixel-box select-none py-4 font-pixel text-xs text-[#f2c14e] active:translate-y-0.5 disabled:opacity-40"
      >
        SEGURE PARA ANDAR (solte para parar)
      </button>
    </div>
  );
}

// ---------- RITMO ----------

export function DesafioRitmo({
  lugar,
  antes,
  depois,
  objetivo,
  acao,
  quantos,
  onFim,
}: {
  lugar: Lugar;
  antes?: Fala[];
  depois: Fala[];
  objetivo: string;
  /** O que cada toque certo faz ("GIRAR", "REMAR"). */
  acao: string;
  quantos: number;
  onFim: () => void;
}) {
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [feitos, setFeitos] = useState(0);
  const [erros, setErros] = useState(0);
  const [t, setT] = useState(0);
  const [flash, setFlash] = useState<'ok' | 'erro' | null>(null);
  const velocidade = 0.9 + feitos * 0.08;
  // O ponteiro vai e volta de 0 a 100.
  const ponteiro = Math.abs(((t * velocidade) % 200) - 100);
  const zona: [number, number] = [42, 58];

  useTique(fase === 'jogo', 30, () => setT((x) => x + 2.2));

  const tocarBotao = () => {
    if (fase !== 'jogo') return;
    desbloquear();
    if (ponteiro >= zona[0] && ponteiro <= zona[1]) {
      tocar('escudoMetal');
      setFlash('ok');
      if (feitos + 1 >= quantos) {
        tocar('fanfarra');
        setFase('ok');
      }
      setFeitos((f) => f + 1);
    } else {
      tocar('falha');
      setFlash('erro');
      if (erros + 1 >= 3) setFase('perdeu');
      setErros((e) => e + 1);
      setFeitos((f) => Math.max(0, f - 1));
    }
    window.setTimeout(() => setFlash(null), 200);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">{objetivo}</p>
        <Vidas n={3 - erros} max={3} icone="" />
      </div>
      <Palco lugar={lugar} className={flash === 'erro' ? 'tremer-forte' : ''}>
        {fase === 'jogo' && (
          <div className="absolute inset-x-[8%] top-[38%] z-20 flex flex-col items-center gap-2">
            <span className="font-pixel text-[10px] text-white [text-shadow:2px_2px_0_#000] sm:text-sm">
              {acao}: {feitos}/{quantos}
            </span>
            <div className="relative h-6 w-full border-2 border-black bg-black/70 sm:h-8">
              <div className="absolute inset-y-0 bg-[#4ad46a]/70" style={{ left: `${zona[0]}%`, width: `${zona[1] - zona[0]}%` }} />
              <div className="absolute inset-y-[-4px] w-1.5 bg-white shadow-[0_0_6px_#fff]" style={{ left: `${ponteiro}%` }} />
            </div>
            {flash === 'ok' && <span className="font-pixel text-xs text-[#4ad46a] [text-shadow:2px_2px_0_#000]">CREC! </span>}
          </div>
        )}
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && (
          <Perdeu
            titulo="TRAVOU!"
            dica="Toque só quando a linha branca estiver dentro do verde. Ela fica mais rápida a cada acerto."
            onDeNovo={() => {
              setFeitos(0);
              setErros(0);
              setFase('jogo');
            }}
          />
        )}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
      <button
        type="button"
        disabled={fase !== 'jogo'}
        onPointerDown={(ev) => {
          ev.preventDefault();
          tocarBotao();
        }}
        className="pixel-box select-none py-4 font-pixel text-xs text-[#f2c14e] active:translate-y-0.5 disabled:opacity-40"
      >
        {acao}!
      </button>
    </div>
  );
}

// ---------- PROTEGER A LÍVIA ----------

interface Coisa {
  id: number;
  icone: string;
  y: number;
  nasceu: number;
  /** Quanto tempo leva para cruzar a cena (ms). */
  voo: number;
}
const COISAS = [
  { icone: 'tomate', voo: 3600 },
  { icone: 'pedra', voo: 3200 },
  { icone: 'brasa', voo: 2900 },
  { icone: 'flecha', voo: 2200 },
];
const DURACAO_PROTEGER = 24_000;

export function DesafioProteger({ lugar, antes, depois, onFim }: { lugar: Lugar; antes?: Fala[]; depois: Fala[]; onFim: () => void }) {
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [coisas, setCoisas] = useState<Coisa[]>([]);
  const [voz, setVoz] = useState(3);
  const [inicio, setInicio] = useState(0);
  const [agora, setAgora] = useState(0);
  const seq = useRef(0);
  const proxima = useRef(0);
  // O que o Cassius derrubou (estoura no ar) e quantas vezes ele defendeu (ele levanta o escudo).
  const [estouros, setEstouros] = useState<{ id: number; icone: string; x: number; y: number }[]>([]);
  const [defesas, setDefesas] = useState(0);

  const comecar = () => {
    setCoisas([]);
    setEstouros([]);
    setVoz(3);
    setInicio(Date.now());
    setAgora(Date.now());
    proxima.current = Date.now() + 800;
    setFase('jogo');
  };
  useEffect(() => {
    if (fase === 'jogo' && !inicio) comecar();
  }, [fase]);

  useTique(fase === 'jogo', 40, () => {
    const t = Date.now();
    setAgora(t);
    const passado = t - inicio;
    if (passado >= DURACAO_PROTEGER) {
      tocar('fanfarra');
      setFase('ok');
      return;
    }
    // Cada vez mais coisas voando.
    if (t >= proxima.current) {
      const tipo = COISAS[Math.floor(Math.random() * (passado > 12_000 ? 4 : 3))]!;
      seq.current += 1;
      setCoisas((c) => [...c, { id: seq.current, icone: tipo.icone, y: 22 + Math.random() * 46, nasceu: t, voo: tipo.voo }]);
      proxima.current = t + Math.max(550, 1300 - passado / 25);
    }
    // O que chegou na Lívia.
    const chegaram = coisas.filter((c) => t - c.nasceu >= c.voo);
    if (chegaram.length) {
      tocar('falha');
      setCoisas((c) => c.filter((x) => !chegaram.some((y) => y.id === x.id)));
      if (voz - chegaram.length <= 0) setFase('perdeu');
      setVoz((v) => v - chegaram.length);
    }
  });

  const restante = Math.max(0, DURACAO_PROTEGER - (agora - inicio));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">Toque no que voar na direção da Lívia! Ela precisa terminar a página.</p>
        <Vidas n={Math.max(0, voz)} max={3} icone="" />
      </div>
      <Palco lugar={lugar}>
        {/* PROTEGER A LÍVIA (redesenhado, 22/11/2026): a Lívia lendo em cima da tribuna, com o livro
            brilhando; o Cassius na frente, levantando o escudo a cada defesa; o que ele derruba
            estoura no ar (tomate espirra, pedra vira poeira, fogo vira faísca). */}
        <div className="pointer-events-none absolute bottom-[10%] left-[4%] z-[8] h-[20%] w-[22%]" aria-hidden>
          <div className="absolute inset-0 border-2 border-[#8a7e6a] bg-[#d8ccb4]" />
          <div className="absolute inset-x-0 top-0 h-[16%] bg-[#f0e6d0]" />
          <div className="absolute left-[10%] top-[40%] h-[30%] w-[18%] bg-[#a8742a]" />
          <div className="absolute right-[10%] top-[40%] h-[30%] w-[18%] bg-[#a8742a]" />
        </div>
        <div className="pointer-events-none absolute bottom-[29%] left-[15%] z-10 w-[9%] -translate-x-1/2" aria-hidden>
          <span className="absolute -inset-[40%] rounded-full bg-[#fff4c0]/25 blur-lg" />
          <div className="brilho-heroi">
            <Retrato quem="livia" />
          </div>
          <span className="pagina-voa absolute right-[-20%] top-[30%] block h-[14%] w-[22%] bg-[#f4ecd0]" />
        </div>
        <div className="pointer-events-none absolute bottom-[12%] left-[31%] z-10 w-[13%] -translate-x-1/2" aria-hidden>
          <div key={defesas} className={defesas ? 'pose-escudo' : 'respirar'}>
            <Retrato quem="cassius" />
          </div>
        </div>
        {estouros.map((e) => (
          <span key={`e${e.id}`} className="pointer-events-none absolute z-[21]" style={{ left: `${e.x}%`, top: `${e.y}%` }} aria-hidden>
            {[-50, -10, 30, 70, 110, 150, 190, 230].map((a, k) => (
              <span key={k} className="faisca-forja absolute block h-[5px] w-[5px]" style={{ '--ang': `${a}deg`, background: e.icone === 'tomate' ? '#e0282c' : e.icone === 'pedra' ? '#b8b0a0' : '#ffb03a' } as CSSProperties} />
            ))}
            <span className="tang absolute -left-3 -top-6 font-pixel text-[8px] text-white [text-shadow:1px_1px_0_#000] sm:text-sm">{e.icone === 'tomate' ? 'SPLAT!' : 'PAH!'}</span>
          </span>
        ))}
        {fase === 'jogo' &&
          coisas.map((c) => {
            const p = Math.min(1, (agora - c.nasceu) / c.voo);
            return (
              <button
                key={c.id}
                type="button"
                onPointerDown={(ev) => {
                  ev.preventDefault();
                  desbloquear();
                  tocar('espadas');
                  setCoisas((x) => x.filter((y) => y.id !== c.id));
                  setDefesas((n) => n + 1);
                  const id = c.id;
                  setEstouros((x) => [...x.slice(-5), { id, icone: c.icone, x: 96 - p * 80, y: c.y + p * (62 - c.y) }]);
                  window.setTimeout(() => setEstouros((x) => x.filter((y) => y.id !== id)), 600);
                }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 p-1 text-3xl drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] sm:text-5xl"
                style={{ left: `${96 - p * 80}%`, top: `${c.y + p * (62 - c.y)}%` }}
                aria-label={`Derrubar: ${c.icone}`}
              >
                <span className={prefereMenosMovimento() ? '' : 'girar-estrelas'}><Icone nome={c.icone} className="inline-block w-[1em]" /></span>
              </button>
            );
          })}
        {fase === 'jogo' && (
          <div className="pointer-events-none absolute inset-x-[10%] top-[5%] z-20 flex items-center gap-2" aria-hidden>
            <Icone nome="livro" className="w-5 sm:w-7" />
            <span className="font-pixel text-[7px] text-white [text-shadow:1px_1px_0_#000] sm:text-[10px]">PÁGINA</span>
            <div className="h-2 flex-1 border border-black bg-black/60">
              <div className="h-full bg-[#f2c14e]" style={{ width: `${100 - (restante / DURACAO_PROTEGER) * 100}%` }} />
            </div>
          </div>
        )}
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && <Perdeu titulo="A LÍVIA PAROU DE LER" dica="As flechas são as mais rápidas: derrube primeiro o que estiver mais perto dela." onDeNovo={comecar} />}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
    </div>
  );
}

// ---------- ARMADILHAS DA ARENA ----------

const RODADAS_ARMADILHA = 12;

export function DesafioArmadilhas({ lugar, heroi, antes, depois, onFim }: { lugar: Lugar; heroi: Falante; antes?: Fala[]; depois: Fala[]; onFim: () => void }) {
  const [fase, setFase] = useState<Fase>(antes?.length ? 'antes' : 'jogo');
  const [onde, setOnde] = useState(1);
  const [perigo, setPerigo] = useState<number[]>([]);
  const [espetos, setEspetos] = useState(false);
  const [rodada, setRodada] = useState(0);
  const [vidas, setVidas] = useState(3);
  const ondeRef = useRef(onde);
  ondeRef.current = onde;

  const comecar = () => {
    setOnde(1);
    setRodada(0);
    setVidas(3);
    setFase('jogo');
  };

  useEffect(() => {
    if (fase !== 'jogo') return;
    // Cada rodada: o chão acende (aviso), depois sobem os espetos.
    const dificil = rodada >= 6;
    const quantas = dificil && Math.random() < 0.6 ? 2 : 1;
    const linhas = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, quantas);
    setPerigo(linhas);
    setEspetos(false);
    const aviso = Math.max(650, 1200 - rodada * 50);
    let perdeu = false;
    const a = window.setTimeout(() => {
      setEspetos(true);
      tocar('pesada');
      if (linhas.includes(ondeRef.current)) {
        tocar('falha');
        if (vidas <= 1) {
          perdeu = true;
          setFase('perdeu');
          return;
        }
        setVidas((v) => v - 1);
      }
    }, aviso);
    const b = window.setTimeout(() => {
      if (perdeu) return;
      if (rodada + 1 >= RODADAS_ARMADILHA) {
        tocar('fanfarra');
        setFase('ok');
      } else setRodada((r) => r + 1);
    }, aviso + 650);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [fase, rodada]);

  const faixa = (k: number) => 18 + k * 32;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">
          Espetos! Fuja do chão que acender. Rodada {Math.min(rodada + 1, RODADAS_ARMADILHA)}/{RODADAS_ARMADILHA}
        </p>
        <Vidas n={vidas} max={3} icone="" />
      </div>
      <Palco lugar={lugar}>
        {fase === 'jogo' &&
          [0, 1, 2].map((k) => (
            <div
              key={k}
              className="absolute bottom-[6%] z-[6] h-[16%] w-[30%] -translate-x-1/2 border-2"
              style={{
                left: `${faixa(k)}%`,
                borderColor: perigo.includes(k) ? '#ff3a3a' : '#00000055',
                background: perigo.includes(k) ? (espetos ? '#5a1a1a' : '#ff3a3a44') : 'transparent',
              }}
              aria-hidden
            >
              {perigo.includes(k) && espetos && <span className="absolute inset-x-0 -top-[60%] flex justify-center text-2xl sm:text-4xl"><Icone nome="espeto" className="inline-block w-[1.6em]" /></span>}
            </div>
          ))}
        <div className="absolute bottom-[14%] z-10 w-[10%] -translate-x-1/2 transition-[left] duration-150" style={{ left: `${faixa(onde)}%` }} aria-hidden>
          <Retrato quem={heroi} />
        </div>
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'perdeu' && <Perdeu titulo="OS ESPETOS TE PEGARAM" dica="Olhe o chão vermelho e pule logo para um lado sem vermelho. No fim, são dois de cada vez!" onDeNovo={comecar} />}
        {fase === 'ok' && <Falas falas={depois} onFim={onFim} />}
      </Palco>
      <div className="grid grid-cols-3 gap-2">
        {['◀ ESQUERDA', 'MEIO', 'DIREITA ▶'].map((r, k) => (
          <button
            key={r}
            type="button"
            disabled={fase !== 'jogo'}
            onPointerDown={(ev) => {
              ev.preventDefault();
              desbloquear();
              setOnde(k);
            }}
            className={`pixel-box select-none py-4 font-pixel text-[10px] disabled:opacity-40 ${onde === k ? 'text-[#f2c14e]' : ''}`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
