import { useEffect, useRef, useState } from 'react';
import type { Fala, Lugar } from '@/game/historia/roteiro';
import { desbloquear, tocar } from '@/ui/som';
import { Falas, Palco } from './Cenas';
import { Retrato } from './Cenarios';

/**
 * Desafio do Capítulo 1: esconder os livros antes que o fogo chegue.
 * Revisto em 21/11/2026 (o Lucas achou fácil demais):
 * - 14 livros, precisa salvar 11, em 24 segundos;
 * - cada livro tem o seu pavio: quando a estante dele pega fogo, ele queima e está perdido;
 * - os TOMOS PESADOS (maiores) precisam de 2 toques;
 * - as brasas pulam de livro em livro, até duas de cada vez; tocar numa brasa custa 3 segundos.
 */
const TEMPO_MS = 24_000;
const PRECISA = 11;

interface Livro {
  x: number;
  y: number;
  /** Quando a estante dele pega fogo (ms desde o começo). */
  queimaEm: number;
  pesado: boolean;
  cor: string;
}

const CORES = ['#a83a2a', '#3a6a9a', '#c8962a', '#4a8a3a', '#7a3a8a', '#d8c8a0'];

function novosLivros(): Livro[] {
  const posicoes = [
    [10, 22], [24, 34], [38, 20], [52, 36], [66, 22], [80, 34], [92, 20],
    [16, 50], [30, 62], [44, 48], [58, 62], [72, 50], [86, 62], [50, 74],
  ];
  return posicoes.map(([x, y], k) => ({
    x: x!,
    y: y!,
    // O fogo começa por baixo: os livros de baixo queimam primeiro.
    queimaEm: 9_000 + (100 - y!) * 120 + ((k * 997) % 5) * 900,
    pesado: k % 4 === 1,
    cor: CORES[k % CORES.length]!,
  }));
}

export function DesafioLivros({ lugar, antes, onFim }: { lugar: Lugar; antes?: Fala[]; onFim: () => void }) {
  const [fase, setFase] = useState<'antes' | 'jogando' | 'ganhou' | 'perdeu'>(antes?.length ? 'antes' : 'jogando');
  const [livros, setLivros] = useState<Livro[]>(novosLivros);
  const [salvos, setSalvos] = useState<number[]>([]);
  const [toques, setToques] = useState<Record<number, number>>({});
  const [passou, setPassou] = useState(0);
  const [penalidade, setPenalidade] = useState(0);
  const [brasas, setBrasas] = useState<number[]>([]);
  const inicio = useRef(0);

  useEffect(() => {
    if (fase !== 'jogando') return;
    inicio.current = Date.now();
    const id = window.setInterval(() => setPassou(Date.now() - inicio.current), 100);
    return () => window.clearInterval(id);
  }, [fase]);

  const restante = TEMPO_MS - passou - penalidade;
  const queimados = livros.map((_, k) => k).filter((k) => !salvos.includes(k) && passou >= livros[k]!.queimaEm);
  const vivos = livros.map((_, k) => k).filter((k) => !salvos.includes(k) && !queimados.includes(k));

  // Brasas pulando de livro em livro (até duas de cada vez).
  useEffect(() => {
    if (fase !== 'jogando') return;
    const id = window.setInterval(() => {
      setBrasas(() => {
        const livres = vivos;
        if (!livres.length) return [];
        const a = livres[Math.floor(Math.random() * livres.length)]!;
        const b = livres[Math.floor(Math.random() * livres.length)]!;
        return passou > 8_000 && a !== b ? [a, b] : [a];
      });
    }, 900);
    return () => window.clearInterval(id);
  }, [fase, vivos.length, passou > 8_000]);

  // Fim: salvou o bastante, acabou o tempo ou queimou demais.
  useEffect(() => {
    if (fase !== 'jogando') return;
    const daParaSalvar = salvos.length + vivos.length;
    if (salvos.length >= PRECISA && vivos.length === 0) {
      tocar('vitoria');
      setFase('ganhou');
    } else if (restante <= 0 || daParaSalvar < PRECISA) {
      if (salvos.length >= PRECISA) {
        tocar('vitoria');
        setFase('ganhou');
      } else {
        tocar('derrota');
        setFase('perdeu');
      }
    }
  }, [passou, salvos, penalidade]);

  const tocarLivro = (k: number) => {
    if (fase !== 'jogando' || salvos.includes(k) || queimados.includes(k)) return;
    desbloquear();
    if (brasas.includes(k)) {
      // Pegou na brasa: queima a mão e perde tempo.
      tocar('falha');
      setPenalidade((p) => p + 3000);
      setBrasas((b) => b.filter((x) => x !== k));
      return;
    }
    const livro = livros[k]!;
    const n = (toques[k] ?? 0) + 1;
    if (livro.pesado && n < 2) {
      tocar('clique');
      setToques((t) => ({ ...t, [k]: n }));
      return;
    }
    tocar('selecionar');
    setSalvos((s) => [...s, k]);
  };

  const recomecar = () => {
    tocar('start');
    setLivros(novosLivros());
    setSalvos([]);
    setToques({});
    setPenalidade(0);
    setPassou(0);
    setBrasas([]);
    setFase('jogando');
  };

  const fogo = Math.min(1, passou / TEMPO_MS);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 font-pixel text-[9px] sm:text-[10px]">
        <span className="text-[#f2c14e]">
          📚 SALVOS {salvos.length}/{PRECISA} · 🔥 QUEIMADOS {queimados.length}
        </span>
        <span className={restante < 8000 ? 'piscar text-[#ff5a5a]' : 'text-white/80'}>⏱ {Math.max(0, Math.ceil(restante / 1000))} s</span>
      </div>
      <Palco lugar={lugar}>
        {/* o fogo subindo de baixo */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 bg-gradient-to-t from-[#ff6a2a] via-[#ff6a2a]/50 to-transparent opacity-80" style={{ height: `${10 + fogo * 75}%` }} />
        {/* o alçapão */}
        <div className="absolute bottom-[3%] left-[2%] z-10 border-2 border-[#c8962a] bg-black/80 px-1 font-pixel text-[7px] text-[#f2c14e] sm:text-[9px]">⬇ ALÇAPÃO</div>
        {livros.map((l, k) => {
          const salvo = salvos.includes(k);
          const queimado = queimados.includes(k);
          const comBrasa = brasas.includes(k);
          const quase = !salvo && !queimado && l.queimaEm - passou < 2500;
          return (
            <button
              key={k}
              type="button"
              aria-label={salvo ? 'Livro salvo' : queimado ? 'Livro queimado' : comBrasa ? 'Brasa! Não toque' : l.pesado ? 'Tomo pesado (2 toques)' : 'Livro'}
              onPointerDown={(ev) => {
                ev.preventDefault();
                tocarLivro(k);
              }}
              className={`absolute z-10 -translate-x-1/2 transition-all duration-500 ${l.pesado ? 'h-[17%] w-[8%]' : 'h-[13%] w-[5.5%]'} ${quase ? 'tremer' : ''}`}
              style={salvo ? { left: '5%', top: '90%', opacity: 0, transform: 'scale(0.3)' } : { left: `${l.x}%`, top: `${l.y}%`, opacity: queimado ? 0.35 : 1 }}
            >
              <span
                className="block h-full w-full border-2 border-black"
                style={{
                  background: queimado ? '#2a1a14' : l.cor,
                  boxShadow: comBrasa ? '0 0 12px 4px #ff6a2a' : quase ? '0 0 8px 2px #ffb04a' : undefined,
                }}
              />
              {l.pesado && !queimado && <span className="absolute inset-x-0 top-1 text-center font-pixel text-[6px] text-black sm:text-[8px]">{(toques[k] ?? 0) === 1 ? '1/2' : '2×'}</span>}
              {(comBrasa || queimado) && (
                <span className="tocha absolute -top-3 left-1/2 -translate-x-1/2 text-base sm:text-xl" aria-hidden>
                  🔥
                </span>
              )}
            </button>
          );
        })}
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogando')} />}
        {fase === 'ganhou' && (
          <Falas
            falas={[
              { quem: 'livia', texto: `${salvos.length} livros no alçapão! Os mais importantes estão salvos!` },
              { quem: 'cassius', texto: 'E os que queimaram... alguém vai reescrever um dia. Agora, a escada!' },
            ]}
            onFim={onFim}
          />
        )}
        {fase === 'perdeu' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/75 text-center">
            <p className="font-pixel text-base text-[#ff5a5a] sm:text-xl">O FOGO FOI MAIS RÁPIDO</p>
            <p className="max-w-xs text-sm text-white/80">
              Salvou {salvos.length}, precisava de {PRECISA}. Dica: salve primeiro os livros de baixo (o fogo sobe) e os que estão tremendo.
            </p>
            <button type="button" autoFocus onClick={recomecar} className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent">
              ↻ TENTAR DE NOVO
            </button>
          </div>
        )}
      </Palco>
      <p className="text-center text-[10px] text-muted">Toque nos livros para levar ao alçapão. Tomos grandes: 2 toques. Livro tremendo vai queimar. Brasa 🔥: não toque (perde 3 s).</p>
    </div>
  );
}

/**
 * Desafio do Capítulo 2: segurar a carroça desgovernada antes que ela atinja o menino.
 * Um ponteiro vai e volta numa barra; toque quando ele estiver no VERDE. São 3 trancos
 * para parar a carroça; a faixa verde fica menor e o ponteiro mais rápido a cada um.
 * Errou 3 vezes: a carroça chega primeiro (tenta de novo).
 */
export function DesafioCarroca({ lugar, antes, onFim }: { lugar: Lugar; antes?: Fala[]; onFim: () => void }) {
  const [fase, setFase] = useState<'antes' | 'jogando' | 'ganhou' | 'perdeu'>(antes?.length ? 'antes' : 'jogando');
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [pos, setPos] = useState(0);
  const [aviso, setAviso] = useState<{ texto: string; bom: boolean } | null>(null);
  const t0 = useRef(0);
  const largura = [26, 18, 12][Math.min(acertos, 2)]!;
  const velocidade = [1.1, 1.5, 1.95][Math.min(acertos, 2)]!;
  const centro = 50;

  useEffect(() => {
    if (fase !== 'jogando') return;
    t0.current = performance.now();
    let quadro = 0;
    const anda = (agora: number) => {
      // Vai e volta de 0 a 100.
      const ciclo = ((agora - t0.current) / 1000) * velocidade;
      const f = ciclo % 2;
      setPos((f < 1 ? f : 2 - f) * 100);
      quadro = requestAnimationFrame(anda);
    };
    quadro = requestAnimationFrame(anda);
    return () => cancelAnimationFrame(quadro);
  }, [fase, acertos]);

  const tocarAgora = () => {
    if (fase !== 'jogando') return;
    desbloquear();
    if (Math.abs(pos - centro) <= largura / 2) {
      tocar('escudoMetal');
      setAviso({ texto: ['SEGUROU!', 'MAIS FORTE!', 'PAROU!'][acertos]!, bom: true });
      if (acertos + 1 >= 3) {
        tocar('vitoria');
        setFase('ganhou');
      }
      setAcertos((a) => a + 1);
    } else {
      tocar('falha');
      setAviso({ texto: 'ESCORREGOU!', bom: false });
      if (erros + 1 >= 3) {
        tocar('derrota');
        setFase('perdeu');
      }
      setErros((e) => e + 1);
    }
    window.setTimeout(() => setAviso(null), 600);
  };

  // A carroça chega mais perto a cada erro (e para de vez no terceiro acerto).
  const distancia = 62 - erros * 14 + acertos * 4;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between font-pixel text-[9px] sm:text-[10px]">
        <span className="text-[#f2c14e]">💪 TRANCOS {acertos}/3</span>
        <span className="text-[#ff5a5a]">{'❤'.repeat(3 - erros)}</span>
      </div>
      <Palco lugar={lugar}>
        {/* o menino parado no caminho */}
        <div className="absolute bottom-[14%] left-[12%] z-10 w-[7%] -translate-x-1/2" aria-hidden>
          <Retrato quem="crianca" />
        </div>
        {/* Cassius segurando */}
        <div className="absolute bottom-[14%] z-10 w-[13%] -translate-x-1/2 transition-[left] duration-300" style={{ left: `${distancia - 12}%` }} aria-hidden>
          <Retrato quem="cassius" />
        </div>
        {/* a carroça com o cavalo mecânico */}
        <div className={`absolute bottom-[12%] z-10 h-[30%] w-[26%] transition-[left] duration-300 ${fase === 'jogando' ? 'tremer' : ''}`} style={{ left: `${distancia}%` }} aria-hidden>
          <div className="absolute bottom-[25%] left-0 h-[55%] w-[70%] border-2 border-black bg-[#8a5a2a]" />
          <div className="absolute bottom-[78%] left-[4%] h-[12%] w-[62%] border-2 border-black bg-[#c0384a]" />
          <div className="absolute bottom-0 left-[8%] h-[30%] w-[22%] rounded-full border-2 border-black bg-[#4a3a2a]" />
          <div className="absolute bottom-0 left-[44%] h-[30%] w-[22%] rounded-full border-2 border-black bg-[#4a3a2a]" />
          <div className="absolute bottom-[30%] right-0 h-[50%] w-[28%] border-2 border-black bg-[#9a9aa8]" />
          <div className="absolute bottom-[70%] right-[4%] h-[22%] w-[14%] border-2 border-black bg-[#9a9aa8]" />
          <div className="absolute bottom-[78%] right-[8%] h-[6%] w-[5%] bg-[#ff3a3a]" />
        </div>
        {aviso && (
          <span className={`pancada absolute left-1/2 top-[28%] z-20 -translate-x-1/2 font-pixel text-sm sm:text-xl ${aviso.bom ? 'text-[#4ad46a]' : 'text-[#ff5a5a]'} [text-shadow:2px_2px_0_#000]`}>
            {aviso.texto}
          </span>
        )}
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogando')} />}
        {fase === 'ganhou' && <Falas falas={[{ quem: 'cassius', texto: '(segurando a carroça com as duas mãos) Calma... calma... pronto. Ninguém se machucou.' }]} onFim={onFim} />}
        {fase === 'perdeu' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/75 text-center">
            <p className="font-pixel text-base text-[#ff5a5a] sm:text-xl">A CARROÇA ESCAPOU</p>
            <p className="max-w-xs text-sm text-white/80">Por pouco! O menino pulou para o lado a tempo. Tente de novo: toque quando o ponteiro estiver bem no verde.</p>
            <button
              type="button"
              autoFocus
              onClick={() => {
                tocar('start');
                setAcertos(0);
                setErros(0);
                setFase('jogando');
              }}
              className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent"
            >
              ↻ TENTAR DE NOVO
            </button>
          </div>
        )}
      </Palco>
      {/* a barra com o ponteiro: toque no verde */}
      <button
        type="button"
        disabled={fase !== 'jogando'}
        onPointerDown={(ev) => {
          ev.preventDefault();
          tocarAgora();
        }}
        className="pixel-box relative h-14 w-full overflow-hidden disabled:opacity-40 sm:h-16"
        aria-label="Segurar a carroça (toque no verde)"
      >
        <span className="absolute inset-y-2 bg-[#4ad46a]/70" style={{ left: `${centro - largura / 2}%`, width: `${largura}%` }} />
        <span className="absolute inset-y-0 w-1.5 -translate-x-1/2 bg-white shadow-[0_0_8px_#fff]" style={{ left: `${pos}%` }} />
        <span className="relative font-pixel text-[9px] text-white [text-shadow:1px_1px_0_#000] sm:text-xs">TOQUE NO VERDE!</span>
      </button>
    </div>
  );
}
