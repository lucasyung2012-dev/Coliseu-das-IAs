import { useEffect, useState } from 'react';
import type { Fala, Lugar } from '@/game/historia/roteiro';
import { desbloquear, tocar } from '@/ui/som';
import { Falas, Palco } from './Cenas';

const TEMPO_MS = 25_000;
const PRECISA = 8;
// Onde ficam os livros nas estantes (porcentagem do cenário).
const LUGARES = [
  { x: 14, y: 28 },
  { x: 30, y: 40 },
  { x: 46, y: 26 },
  { x: 60, y: 44 },
  { x: 74, y: 30 },
  { x: 88, y: 42 },
  { x: 22, y: 56 },
  { x: 52, y: 58 },
  { x: 68, y: 60 },
  { x: 84, y: 58 },
];
const CORES = ['#a83a2a', '#3a6a9a', '#c8962a', '#4a8a3a', '#7a3a8a'];

/**
 * Desafio do Capítulo 1: esconder os livros antes que o fogo chegue. Toque nos
 * livros para levá-los ao alçapão; tocar nas brasas faz perder tempo.
 * Salvou 8 de 10 antes do fogo: passou. Senão, tenta de novo.
 */
export function DesafioLivros({ lugar, antes, onFim }: { lugar: Lugar; antes?: Fala[]; onFim: () => void }) {
  const [fase, setFase] = useState<'antes' | 'jogando' | 'ganhou' | 'perdeu'>(antes?.length ? 'antes' : 'jogando');
  const [salvos, setSalvos] = useState<number[]>([]);
  const [restante, setRestante] = useState(TEMPO_MS);
  const [brasa, setBrasa] = useState<number | null>(null);

  useEffect(() => {
    if (fase !== 'jogando') return;
    const id = window.setInterval(() => setRestante((r) => r - 100), 100);
    return () => window.clearInterval(id);
  }, [fase]);

  // Uma brasa aparece de vez em quando em cima de um livro que ainda não foi salvo.
  useEffect(() => {
    if (fase !== 'jogando') return;
    const id = window.setInterval(() => {
      setBrasa(() => {
        const livres = LUGARES.map((_, k) => k).filter((k) => !salvos.includes(k));
        return livres.length ? livres[Math.floor(Math.random() * livres.length)]! : null;
      });
    }, 1400);
    return () => window.clearInterval(id);
  }, [fase, salvos]);

  useEffect(() => {
    if (fase !== 'jogando') return;
    if (salvos.length >= PRECISA && (salvos.length === LUGARES.length || restante <= 0)) {
      tocar('vitoria');
      setFase('ganhou');
    } else if (restante <= 0) {
      if (salvos.length >= PRECISA) {
        tocar('vitoria');
        setFase('ganhou');
      } else {
        tocar('derrota');
        setFase('perdeu');
      }
    }
  }, [restante, salvos]);

  const tocarLivro = (k: number) => {
    if (fase !== 'jogando' || salvos.includes(k)) return;
    desbloquear();
    if (brasa === k) {
      // Pegou na brasa: queima a mão e perde tempo.
      tocar('falha');
      setRestante((r) => r - 3000);
      setBrasa(null);
      return;
    }
    tocar('clique');
    setSalvos((s) => [...s, k]);
  };

  const fogo = 1 - Math.max(0, restante) / TEMPO_MS;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 font-pixel text-[9px] sm:text-[10px]">
        <span className="text-[#f2c14e]">📚 SALVOS: {salvos.length}/{LUGARES.length} (precisa de {PRECISA})</span>
        <span className={restante < 8000 ? 'piscar text-[#ff5a5a]' : 'text-white/80'}>🔥 {Math.max(0, Math.ceil(restante / 1000))} s</span>
      </div>
      <Palco lugar={lugar}>
        {/* o fogo subindo de baixo */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 bg-gradient-to-t from-[#ff6a2a] to-transparent opacity-70 transition-[height]" style={{ height: `${fogo * 60}%` }} />
        {/* o alçapão */}
        <div className="absolute bottom-[4%] left-[3%] z-10 border-2 border-[#c8962a] bg-black/70 px-1 font-pixel text-[7px] text-[#f2c14e] sm:text-[9px]">⬇ ALÇAPÃO</div>
        {LUGARES.map((l, k) => {
          const salvo = salvos.includes(k);
          return (
            <button
              key={k}
              type="button"
              aria-label={salvo ? 'Livro salvo' : brasa === k ? 'Brasa! Não toque' : 'Livro'}
              onPointerDown={(ev) => {
                ev.preventDefault();
                tocarLivro(k);
              }}
              className="absolute z-10 h-[14%] w-[6%] -translate-x-1/2 transition-all duration-500"
              style={
                salvo
                  ? { left: '6%', top: '88%', opacity: 0, transform: 'scale(0.3)' }
                  : { left: `${l.x}%`, top: `${l.y}%` }
              }
            >
              <span className="block h-full w-full border-2 border-black" style={{ background: CORES[k % CORES.length], boxShadow: brasa === k ? '0 0 12px 4px #ff6a2a' : undefined }} />
              {brasa === k && (
                <span className="tocha absolute -top-3 left-1/2 -translate-x-1/2 text-base sm:text-xl" aria-hidden>
                  🔥
                </span>
              )}
            </button>
          );
        })}
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogando')} />}
        {fase === 'ganhou' && <Falas falas={[{ quem: 'livia', texto: `${salvos.length} livros no alçapão! Os mais importantes estão salvos!` }]} onFim={onFim} />}
        {fase === 'perdeu' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/75 text-center">
            <p className="font-pixel text-base text-[#ff5a5a] sm:text-xl">O FOGO CHEGOU PRIMEIRO</p>
            <p className="text-sm text-white/80">Salvou {salvos.length}. Precisa de {PRECISA}. Cuidado com as brasas!</p>
            <button
              type="button"
              autoFocus
              onClick={() => {
                tocar('start');
                setSalvos([]);
                setRestante(TEMPO_MS);
                setFase('jogando');
              }}
              className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent"
            >
              ↻ TENTAR DE NOVO
            </button>
          </div>
        )}
      </Palco>
      <p className="text-center text-[10px] text-muted">Toque nos livros para levar ao alçapão. Não toque nos que estão pegando fogo 🔥 (perde 3 s).</p>
    </div>
  );
}
