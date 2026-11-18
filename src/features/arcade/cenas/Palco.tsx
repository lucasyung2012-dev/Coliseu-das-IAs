import type { CSSProperties, ReactNode } from 'react';

/** Moldura 16:9 do "filminho", com botão de pular enquanto ele roda. */
export function Palco({ children, rodando, onPular, className = '' }: { children: ReactNode; rodando: boolean; onPular: () => void; className?: string }) {
  return (
    <div className={`pixel-box relative aspect-video w-full overflow-hidden ${className}`}>
      {children}
      {rodando && (
        <button
          type="button"
          onClick={onPular}
          className="absolute right-2 top-2 z-20 bg-black/60 px-2 py-1 font-pixel text-[8px] text-fg hover:text-accent sm:text-[10px]"
        >
          PULAR ▶▶
        </button>
      )}
    </div>
  );
}

/** Dois portões de pedra que cobrem o palco e se abrem para os lados. */
export function Portoes({ abrindo, children }: { abrindo: boolean; children?: ReactNode }) {
  const pedra =
    'bg-[repeating-linear-gradient(0deg,#3a2a40_0_10px,#2c1f32_10px_12px)] border-[rgb(242_193_78)] flex items-center';
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className={`${pedra} absolute inset-y-0 left-0 w-1/2 justify-end border-r-4 ${abrindo ? 'porta-esq' : ''}`} />
      <div className={`${pedra} absolute inset-y-0 right-0 w-1/2 border-l-4 ${abrindo ? 'porta-dir' : ''}`} />
      {!abrindo && children && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">{children}</div>}
    </div>
  );
}

const FAISCAS = [
  [-60, -40],
  [55, -48],
  [-70, 10],
  [70, 6],
  [-30, -70],
  [35, -66],
  [-45, 40],
  [48, 38],
  [0, -80],
  [5, 60],
];

/** Explosão de faíscas em pixel no ponto (x%, y%) do palco. */
export function Faiscas({ x, y, cor = '#f2c14e' }: { x: number; y: number; cor?: string }) {
  return (
    <div className="pointer-events-none absolute z-10" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden>
      {FAISCAS.map(([dx, dy], i) => (
        <span
          key={i}
          className="faisca absolute block h-2 w-2 sm:h-3 sm:w-3"
          style={{ background: i % 3 === 0 ? '#ffffff' : cor, '--dx': `${dx}px`, '--dy': `${dy}px`, animationDelay: `${(i % 4) * 30}ms` } as CSSProperties}
        />
      ))}
    </div>
  );
}

/** Clarão branco rápido sobre o palco. */
export function Clarao() {
  return <div className="clarao pointer-events-none absolute inset-0 z-10 bg-white" aria-hidden />;
}
