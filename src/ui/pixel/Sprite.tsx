import type { CSSProperties } from 'react';

export type Paleta = Record<string, string>;

interface Props {
  /** Uma string por linha; cada caractere é um pixel. Caractere sem cor na paleta = transparente. */
  grade: string[];
  paleta: Paleta;
  /** Tamanho do pixel em px. Sem escala, o desenho ocupa a largura do elemento pai. */
  escala?: number;
  espelhar?: boolean;
  titulo?: string;
  className?: string;
  style?: CSSProperties;
}

// Junta pixels vizinhos da mesma cor numa faixa só: bem menos retângulos no SVG.
function faixas(grade: string[], paleta: Paleta) {
  const out: { x: number; y: number; w: number; cor: string }[] = [];
  grade.forEach((linha, y) => {
    let x = 0;
    while (x < linha.length) {
      const c = linha[x]!;
      let fim = x + 1;
      while (fim < linha.length && linha[fim] === c) fim++;
      const cor = paleta[c];
      if (cor) out.push({ x, y, w: fim - x, cor });
      x = fim;
    }
  });
  return out;
}

export default function Sprite({ grade, paleta, escala, espelhar, titulo, className, style }: Props) {
  const largura = Math.max(...grade.map((l) => l.length));
  const altura = grade.length;
  return (
    <svg
      viewBox={`0 0 ${largura} ${altura}`}
      width={escala ? largura * escala : '100%'}
      height={escala ? altura * escala : undefined}
      shapeRendering="crispEdges"
      className={className}
      style={{ ...(espelhar ? { transform: 'scaleX(-1)' } : null), display: 'block', ...style }}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      {faixas(grade, paleta).map((f) => (
        <rect key={`${f.x}-${f.y}`} x={f.x} y={f.y} width={f.w + 0.02} height={1.02} fill={f.cor} />
      ))}
    </svg>
  );
}
