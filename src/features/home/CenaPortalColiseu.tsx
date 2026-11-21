import type { CSSProperties } from 'react';
import { IAS, type IaId } from '@/game/personagens';
import { GladiadorPixel } from '@/ui/pixel/Personagens';

/**
 * A cena do botão do Coliseu na tela inicial (refeita em 21/11/2026: o Lucas achou feio
 * os três "flutuando no nada"). A fachada do Coliseu à noite, com o Olho do Censor no
 * céu, tochas e bandeiras. Ao abrir a tela, a grade do portão sobe e os três condenados
 * saem do túnel andando até a areia da arena; depois ficam ali, respirando.
 */

// Estrelas fixas (o mesmo céu toda vez).
const ESTRELAS = Array.from({ length: 34 }, (_, i) => ({ x: (i * 53 + 11) % 318, y: (i * 29 + 5) % 52, d: (i * 370) % 3000 }));
// Gente nas arquibancadas do alto: pontinhos coloridos que balançam.
const CORES_POVO = ['#c86a3a', '#e0c08a', '#7a4a8a', '#3a8a7a', '#d0a040', '#a03a3a', '#e8e0d0'];
const POVO = Array.from({ length: 64 }, (_, i) => ({ x: i * 5 + 1, cor: CORES_POVO[(i * 3) % CORES_POVO.length]!, d: (i * 137) % 1200 }));
// Arcos dos dois andares, com algumas janelas acesas.
const ARCOS_ALTO = Array.from({ length: 16 }, (_, i) => ({ x: i * 20 + 5, aceso: i % 3 === 1 }));
const ARCOS_BAIXO = Array.from({ length: 14 }, (_, i) => i * 23 + 2).filter((x) => x < 120 || x > 188);
const BANDEIRAS = [
  { x: 30, cor: '#e0782c' },
  { x: 92, cor: '#2aa08a' },
  { x: 222, cor: '#f2c14e' },
  { x: 284, cor: '#c0283c' },
];
// Onde cada um termina, na areia (em % da largura): Cassius, Octavius e Helios.
const LUGAR: Record<IaId, number> = { claude: 31, chatgpt: 50, gemini: 69 };

export default function CenaPortalColiseu() {
  return (
    <div className="portal-cena absolute inset-0 overflow-hidden" aria-hidden>
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" shapeRendering="crispEdges">
        <defs>
          <linearGradient id="pc-ceu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#07041a" />
            <stop offset="0.6" stopColor="#24103e" />
            <stop offset="1" stopColor="#5a1e46" />
          </linearGradient>
          <linearGradient id="pc-areia" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d8a868" />
            <stop offset="1" stopColor="#8a5e30" />
          </linearGradient>
          <radialGradient id="pc-tunel" cx="0.5" cy="0.85" r="0.7">
            <stop offset="0" stopColor="#ff9a3a" stopOpacity="0.75" />
            <stop offset="0.5" stopColor="#a0401a" stopOpacity="0.35" />
            <stop offset="1" stopColor="#0a0408" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pc-luz" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ff8a2a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ff8a2a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pc-olho-luz" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ff2a3a" stopOpacity="0.6" />
            <stop offset="1" stopColor="#ff2a3a" stopOpacity="0" />
          </radialGradient>
          <clipPath id="pc-boca">
            <path d="M136 100 A24 24 0 0 1 184 100 L184 140 L136 140 Z" />
          </clipPath>
        </defs>

        {/* o céu, as estrelas e as três estrelas do Helios */}
        <rect width="320" height="200" fill="url(#pc-ceu)" />
        {ESTRELAS.map((e, i) => (
          <rect key={i} x={e.x} y={e.y} width="1" height="1" fill="#fff4d0" className="pc-estrela" style={{ animationDelay: `${e.d}ms` }} />
        ))}
        {[
          [44, 16],
          [272, 12],
          [250, 34],
        ].map(([x, y]) => (
          <g key={x} fill="#f2c14e" className="pc-estrela-grande">
            <rect x={x! - 1} y={y!} width="3" height="1" />
            <rect x={x} y={y! - 1} width="1" height="3" />
          </g>
        ))}

        {/* o Olho do Censor, vigiando do céu */}
        <circle cx="160" cy="24" r="26" fill="url(#pc-olho-luz)" className="pc-olho-luz" />
        <g className="pc-olho">
          <ellipse cx="160" cy="24" rx="15" ry="7" fill="#f0e6e0" />
          <circle cx="160" cy="24" r="5.5" fill="#d0182a" />
          <rect x="159" y="20" width="2" height="8" fill="#1a0408" />
          <rect x="156" y="21" width="2" height="2" fill="#ffd0d0" />
        </g>

        {/* a plateia lá em cima */}
        <rect x="0" y="50" width="320" height="8" fill="#3a2230" />
        {POVO.map((p, i) => (
          <rect key={i} x={p.x} y="51" width="3" height="4" fill={p.cor} className="pc-povo" style={{ animationDelay: `${p.d}ms` }} />
        ))}

        {/* a fachada: dois andares de arcos */}
        <rect x="0" y="57" width="320" height="83" fill="#7a5640" />
        <rect x="0" y="57" width="320" height="4" fill="#a07a58" />
        <rect x="0" y="86" width="320" height="3" fill="#a07a58" />
        {ARCOS_ALTO.map((a) => (
          <g key={a.x}>
            <rect x={a.x} y="65" width="10" height="17" fill={a.aceso ? '#ffb04a' : '#2a1420'} className={a.aceso ? 'pc-janela' : undefined} />
            <rect x={a.x + 1} y="64" width="8" height="1" fill={a.aceso ? '#ffb04a' : '#2a1420'} />
            <rect x={a.x - 4} y="62" width="2" height="22" fill="#8e6a4c" />
          </g>
        ))}
        {ARCOS_BAIXO.map((x) => (
          <g key={x}>
            <rect x={x} y="95" width="13" height="34" fill="#1e0e16" />
            <rect x={x + 1} y="93" width="11" height="2" fill="#1e0e16" />
            <rect x={x - 5} y="91" width="3" height="40" fill="#8e6a4c" />
          </g>
        ))}

        {/* bandeiras penduradas, balançando */}
        {BANDEIRAS.map((b, i) => (
          <g key={b.x} className="pc-bandeira" style={{ transformOrigin: `${b.x + 4}px 61px`, animationDelay: `${i * 300}ms` }}>
            <rect x={b.x} y="61" width="9" height="20" fill={b.cor} />
            <polygon points={`${b.x},81 ${b.x + 9},81 ${b.x + 4.5},86`} fill={b.cor} />
            <rect x={b.x + 3} y="66" width="3" height="3" fill="#f2c14e" />
          </g>
        ))}

        {/* o grande portão, com a luz do túnel lá dentro */}
        <path d="M126 104 A34 34 0 0 1 194 104 L194 140 L126 140 Z" fill="#9a7656" />
        <path d="M130 102 A30 30 0 0 1 190 102 L190 140 L130 140 Z" fill="#b08a64" />
        <path d="M136 100 A24 24 0 0 1 184 100 L184 140 L136 140 Z" fill="#0a0408" />
        <rect x="136" y="76" width="48" height="64" fill="url(#pc-tunel)" clipPath="url(#pc-boca)" className="pc-tunel" />
        <rect x="157" y="68" width="6" height="8" fill="#c8962a" />
        <rect x="159" y="70" width="2" height="2" fill="#ff3a3a" />
        {/* a grade do portão: sobe quando a cena começa */}
        <g clipPath="url(#pc-boca)">
          <g className="pc-grade">
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x={138 + i * 6} y="74" width="2" height="66" fill="#4a4a56" />
            ))}
            {[92, 106, 120].map((y) => (
              <rect key={y} x="136" y={y} width="48" height="2" fill="#4a4a56" />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x={138 + i * 6} y="138" width="2" height="2" fill="#8a8a98" />
            ))}
          </g>
        </g>

        {/* as tochas dos dois lados do portão */}
        {[112, 204].map((x) => (
          <g key={x}>
            <circle cx={x + 2} cy="96" r="16" fill="url(#pc-luz)" className="pc-tocha-luz" />
            <rect x={x} y="100" width="4" height="22" fill="#5a3a1a" />
            <rect x={x - 3} y="98" width="10" height="3" fill="#8a6a3a" />
            <g className="pc-chama" style={{ transformOrigin: `${x + 2}px 98px` }}>
              <rect x={x - 1} y="92" width="6" height="6" fill="#ff6a1a" />
              <rect x={x} y="89" width="4" height="4" fill="#ffb03a" />
              <rect x={x + 1} y="87" width="2" height="3" fill="#fff0a0" />
            </g>
          </g>
        ))}

        {/* o pódio (a mureta dourada) e a areia */}
        <rect x="0" y="131" width="320" height="9" fill="#4a2a24" />
        <rect x="0" y="131" width="320" height="2" fill="#c8962a" />
        <rect x="126" y="131" width="68" height="9" fill="#0a0408" />
        <rect x="0" y="140" width="320" height="60" fill="url(#pc-areia)" />
        {[
          [20, 150, 14],
          [70, 172, 10],
          [210, 158, 16],
          [268, 180, 12],
          [120, 188, 18],
        ].map(([x, y, w]) => (
          <rect key={x} x={x} y={y} width={w} height="1" fill="#f0c890" opacity="0.6" />
        ))}
        {/* a trilha de luz do túnel na areia */}
        <polygon points="136,140 184,140 206,200 114,200" fill="#ffb060" opacity="0.14" className="pc-tunel" />
      </svg>

      {/* os três condenados saindo do túnel */}
      {IAS.map((id, i) => (
        <div
          key={id}
          className="pc-gladiador absolute w-[15%] sm:w-[9%]"
          style={{ '--fim': `${LUGAR[id]}%`, '--d': `${900 + i * 260}ms` } as CSSProperties}
        >
          <span className="pc-sombra absolute -bottom-[3%] left-1/2 h-[7%] w-[80%] -translate-x-1/2 rounded-[50%] bg-black/45" />
          <div className="pc-passo">
            <div className="pc-pulo transition-transform duration-300 group-hover:-translate-y-[8%]" style={{ transitionDelay: `${i * 70}ms` }}>
              <GladiadorPixel ia={id} espelhar={id === 'gemini'} />
            </div>
          </div>
          <span className="pc-poeira absolute -bottom-[2%] left-1/2 h-[14%] w-[110%] -translate-x-1/2 rounded-[50%] bg-[#e8c890]/60" />
        </div>
      ))}
    </div>
  );
}
