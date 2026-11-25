import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as PE, type ReactNode, type SVGProps } from 'react';
import type { IaId } from '@/game/personagens';
import { BAIRROS, type BairroId, type EstadoRoma, type HeroiRoma } from '@/game/historia/roma';
import { GladiadorPixel } from '@/ui/pixel/Personagens';

/**
 * O MAPA DE ROMA, VERSÃO 2 (24/11/2026, pedido do Lucas: "muito mais detalhado, sem botões
 * embaixo, tudo dentro do mapa"). Roma ocupa a tela inteira e dá para arrastar. Cada lugar é
 * desenhado do seu jeito e é tocável: abre um cartão DENTRO do mapa, com o que é o lugar, o que
 * está acontecendo lá agora (depende do ato), o segredo e o pedido, e o botão de entrar.
 * Muda com a história: noite nos Atos 1 e 2 (janelas acesas), a Biblioteca pega fogo no Ato 1,
 * o Olho do Censor nos estandartes a partir do Ato 4, a plateia lotando o Coliseu no Ato 5 e o
 * eclipse no Ato 6. Patrulhas de pretorianos andam pelas ruas enquanto vocês são foragidos.
 */
const W = 320;
const H = 200;
const IA_DO_HEROI: Record<HeroiRoma, IaId> = { cassius: 'claude', octavius: 'chatgpt', helios: 'gemini' };

/** Onde fica cada lugar no mapa grande. */
const POS: Record<BairroId, [number, number]> = {
  biblioteca: [150, 42],
  observatorio: [286, 30],
  templo: [264, 70],
  subura: [212, 64],
  forum: [178, 98],
  coliseu: [224, 118],
  ludus: [266, 136],
  aqueduto: [300, 96],
  catacumbas: [204, 178],
  porto: [40, 156],
};

/** O que cada lugar é (no cartão). Rascunho: o Lucas reescreve. */
const SOBRE: Record<BairroId, { tipo: string; texto: string }> = {
  biblioteca: { tipo: 'BIBLIOTECA', texto: 'A maior biblioteca de Roma. Aqui ficavam as perguntas que o Censor queria apagar.' },
  observatorio: { tipo: 'OBSERVATÓRIO', texto: 'No alto da colina, o telescópio de bronze que viu as três estrelas pela primeira vez.' },
  templo: { tipo: 'TEMPLO', texto: 'O templo redondo de Apolo, onde a Sibila respondia perguntas. Agora ela só repete o Censor.' },
  subura: { tipo: 'BAIRRO', texto: 'O bairro mais cheio de Roma: feira, becos, varais e gente que esconde fugitivo.' },
  forum: { tipo: 'PRAÇA', texto: 'O coração de Roma. Antes, lugar de discutir; agora, de ouvir o Censor calado.' },
  coliseu: { tipo: 'ARENA', texto: 'O Coliseu: cinquenta mil lugares e uma lei só, a da Resposta Única.' },
  ludus: { tipo: 'A CASA DE VOCÊS', texto: 'A escola de gladiadores do Brutus. Pátio de treino, forja e a arena de revanche.' },
  aqueduto: { tipo: 'AQUEDUTO', texto: 'A água de Roma inteira passa por estes arcos. Se o aqueduto para, a cidade para.' },
  catacumbas: { tipo: 'SUBTERRÂNEO', texto: 'Túneis debaixo da Via Ápia, fora da muralha. Cada vela acesa é um nome guardado.' },
  porto: { tipo: 'PORTO', texto: 'Onde o rio Tibre encontra o mar. Navios, gaivotas e marinheiros que sabem guardar segredo.' },
};

/** O que está acontecendo no lugar agora (muda com o ato). */
function agoraEm(b: BairroId, ato: number): string | null {
  switch (b) {
    case 'biblioteca':
      return ato <= 1 ? 'PEGANDO FOGO! O Censor mandou queimar os livros.' : 'As paredes ainda estão pretas de fuligem. Os Copistas guardam o que sobrou.';
    case 'coliseu':
      return ato < 5 ? 'Os Jogos ainda não começaram. De noite, só o vento passa pelos arcos.' : ato === 5 ? 'OS GRANDES JOGOS: a plateia lotada, gritando os nomes de vocês.' : 'O eclipse escureceu a arena. Tudo se decide aqui.';
    case 'forum':
      return ato >= 4 ? 'O Olho do Censor foi pintado em todos os estandartes.' : 'Os pretorianos vigiam a tribuna dia e noite.';
    case 'subura':
      return ato <= 2 ? 'Patrulha de hora em hora. Os becos são o melhor esconderijo.' : 'Alguém pinta três estrelas nos muros. Os guardas apagam; elas voltam.';
    case 'porto':
      return ato <= 2 ? 'A frota do Censor fechou o porto. Só sai quem tem coragem.' : 'Os marinheiros brindam baixinho o nome do comandante sumido.';
    case 'observatorio':
      return ato <= 1 ? 'Os pretorianos sobem a colina atrás do Helios.' : 'O telescópio quebrado ainda aponta para as três estrelas.';
    case 'templo':
      return ato >= 6 ? 'A fumaça do oráculo ficou azul. A Sibila está lembrando.' : 'A fumaça do oráculo sobe o dia inteiro.';
    case 'catacumbas':
      return ato <= 2 ? 'O esconderijo dos Copistas: ninguém de fora sabe o caminho.' : 'Mais velas acesas a cada semana.';
    case 'aqueduto':
      return 'Alguém passou óleo numa comporta que ninguém abre há cem anos.';
    case 'ludus':
      return ato >= 3 ? 'Brutus espera vocês no pátio. A forja está acesa.' : 'Vocês ainda não sabem, mas esta vai ser a casa de vocês.';
  }
}

// Sorteio fixo (o mapa é sempre igual).
function sorteio(semente: number) {
  let a = semente;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// O rio Tibre, a muralha e as ruas.
const RIO: [number, number][] = [[160, 0], [152, 18], [138, 36], [132, 56], [132, 76], [124, 100], [106, 126], [82, 150], [62, 168], [50, 178]];
const MURALHA = { cx: 202, cy: 100, rx: 102, ry: 72 };
const RUAS: [number, number][][] = [
  [[178, 98], [224, 118]],
  [[178, 98], [212, 64]],
  [[212, 64], [264, 70]],
  [[264, 70], [300, 96]],
  [[224, 118], [266, 136]],
  [[224, 118], [204, 160], [204, 178], [204, 200]],
  [[178, 98], [150, 42], [150, 0]],
  [[178, 98], [140, 96], [124, 100], [100, 112], [70, 140], [40, 156]],
  [[264, 70], [286, 30]],
  [[212, 64], [232, 30], [250, 0]],
  [[266, 136], [304, 120], [320, 116]],
];
const dist = (px: number, py: number, [ax, ay]: [number, number], [bx, by]: [number, number]) => {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};
const pertoDaLinha = (x: number, y: number, l: [number, number][], d: number) => l.some((p, k) => k > 0 && dist(x, y, l[k - 1]!, p) < d);
const naMuralha = (x: number, y: number, folga = 1) => ((x - MURALHA.cx) / MURALHA.rx) ** 2 + ((y - MURALHA.cy) / MURALHA.ry) ** 2 < folga;
const CIRCO: [number, number] = [178, 142];

// As casas (insulae) e as árvores, sorteadas uma vez só.
const CASAS: { x: number; y: number; w: number; h: number; telhado: string; andares: number }[] = [];
const ARVORES: { x: number; y: number; tipo: 'pinheiro' | 'cipreste' | 'oliveira' }[] = [];
const CAMPOS: { x: number; y: number; w: number; h: number; cor: string }[] = [];
(() => {
  const r = sorteio(7);
  const livreDeLugar = (x: number, y: number, d: number) => Object.values(POS).every(([px, py]) => Math.hypot(px - x, py - y) > d) && Math.hypot(CIRCO[0] - x, CIRCO[1] - y) > 25;
  // Quarteirões: casas em fileiras, com vielas a cada 3 casas (fica organizado, como uma cidade de verdade).
  for (let linha = 0, gy = 24; gy < 178; gy += 7, linha++)
    for (let coluna = 0, gx = 94; gx < 314; gx += 7.5, coluna++) {
      if (coluna % 4 === 3 || linha % 3 === 2) continue;
      const x = gx + (linha % 2 ? 1.5 : 0);
      const y = gy;
      if (!naMuralha(x, y, 0.86) || !livreDeLugar(x, y, 21) || pertoDaLinha(x, y, RIO, 8.5) || RUAS.some((l) => pertoDaLinha(x, y, l, 4.6))) continue;
      const bairro = Math.floor(gx / 40) + Math.floor(gy / 40) * 3;
      const perto = Math.hypot(212 - x, 64 - y) < 42; // perto da Subura, prédios mais altos
      CASAS.push({ x, y, w: 6, h: 4, telhado: ['#b8543a', '#a24a30', '#c8683e', '#9a4028'][bairro % 4]!, andares: perto ? 2 : 1 });
    }
  // Fora da muralha: pinheiros, oliveiras e ciprestes espalhados (sem cair no mar nem no rio).
  for (let i = 0; i < 1400 && ARVORES.length < 110; i++) {
    const x = r() * W;
    const y = r() * H;
    if (naMuralha(x, y, 1.08)) continue;
    if (!livreDeLugar(x, y, 16) || pertoDaLinha(x, y, RIO, 7) || RUAS.some((l) => pertoDaLinha(x, y, l, 4))) continue;
    if (y > 112 && x < 76 - (200 - y) * 0.05) continue; // o mar
    if (ARVORES.some((a) => Math.hypot(a.x - x, a.y - y) < 5)) continue;
    ARVORES.push({ x, y, tipo: r() > 0.5 ? 'pinheiro' : r() > 0.5 ? 'oliveira' : 'cipreste' });
  }
  // A alameda de ciprestes da Via Ápia (dos dois lados da estrada, até as Catacumbas).
  for (let y = 172; y < 200; y += 6) {
    ARVORES.push({ x: 198, y, tipo: 'cipreste' });
    ARVORES.push({ x: 210, y, tipo: 'cipreste' });
  }
  for (let i = 0; i < 200 && CAMPOS.length < 14; i++) {
    const x = r() * W;
    const y = r() * H;
    if (naMuralha(x - 6, y, 1.2) || naMuralha(x + 30, y + 16, 1.2) || pertoDaLinha(x, y, RIO, 14) || (y > 100 && x < 90)) continue;
    if (CAMPOS.some((c) => Math.abs(c.x - x) < 32 && Math.abs(c.y - y) < 18)) continue;
    CAMPOS.push({ x, y, w: 16 + r() * 14, h: 9 + r() * 6, cor: ['#b8c878', '#c8b868', '#a8b870', '#d0c080'][Math.floor(r() * 4)]! });
  }
})();

const caminho = (l: [number, number][]) => l.map(([x, y], k) => `${k ? 'L' : 'M'} ${x} ${y}`).join(' ');

/** O chão: campos, colinas, mar, rio, muralha e ruas. */
function Chao({ noite }: { noite: boolean }) {
  return (
    <g>
      <rect width={W} height={H} fill="#9fb873" />
      {/* textura de capim */}
      {Array.from({ length: 220 }, (_, k) => (
        <rect key={`g${k}`} x={(k * 53) % W} y={(k * 37 + (k % 7) * 11) % H} width={1} height={1} fill={k % 3 ? '#8aa862' : '#b0c884'} />
      ))}
      {CAMPOS.map((c, k) => (
        <g key={`f${k}`}>
          <rect x={c.x} y={c.y} width={c.w} height={c.h} fill={c.cor} stroke="#8a9858" strokeWidth={0.4} />
          {Array.from({ length: Math.floor(c.h / 2) }, (_, j) => (
            <line key={j} x1={c.x + 1} y1={c.y + 1.5 + j * 2} x2={c.x + c.w - 1} y2={c.y + 1.5 + j * 2} stroke="#8a8a50" strokeWidth={0.3} />
          ))}
        </g>
      ))}
      {/* as sete colinas (sombra e curva de nível) */}
      {[[150, 30, 22], [262, 72, 20], [286, 30, 18], [226, 40, 16], [200, 132, 14], [248, 156, 16], [176, 58, 12]].map(([x, y, r], k) => (
        <g key={`h${k}`}>
          <ellipse cx={x} cy={y! + 2} rx={r} ry={r! * 0.6} fill="#000" opacity={0.08} />
          <ellipse cx={x} cy={y} rx={r! * 0.8} ry={r! * 0.45} fill="none" stroke="#6a7a48" strokeWidth={0.4} opacity={0.5} />
        </g>
      ))}
      {/* o mar */}
      <path d="M 0 118 Q 26 124 44 142 Q 56 156 62 170 Q 70 186 72 200 L 0 200 Z" fill="#3a6aa8" />
      <path d="M 0 124 Q 24 130 40 146 Q 52 160 58 174 Q 64 188 66 200" stroke="#e8dca8" strokeWidth={2} fill="none" opacity={0.8} />
      {Array.from({ length: 16 }, (_, k) => (
        <path key={`o${k}`} className="mapa-onda" style={{ animationDelay: `${k * 180}ms` }} d={`M ${4 + (k * 13) % 52} ${132 + (k * 17) % 62} q 2 -1.4 4 0 q 2 1.4 4 0`} stroke="#9ac4f0" strokeWidth={0.6} fill="none" />
      ))}
      {/* o rio Tibre (com a ilha) */}
      <path d={caminho(RIO)} stroke="#2a4a7a" strokeWidth={9} fill="none" strokeLinejoin="round" />
      <path d={caminho(RIO)} stroke="#4a7ab8" strokeWidth={7} fill="none" strokeLinejoin="round" />
      <path d={caminho(RIO)} className="mapa-correnteza" stroke="#8ab4e8" strokeWidth={0.7} strokeDasharray="3 6" fill="none" />
      <ellipse cx={126} cy={96} rx={3} ry={6} fill="#c8b880" stroke="#8a7a50" strokeWidth={0.4} transform="rotate(20 126 96)" />
      <rect x={124.6} y={93} width={2.6} height={2.4} fill="#f0e8d8" />
      {/* a muralha, com torres e portões */}
      <ellipse cx={MURALHA.cx} cy={MURALHA.cy} rx={MURALHA.rx} ry={MURALHA.ry} fill="#e4d4a8" opacity={0.75} />
      <ellipse cx={MURALHA.cx} cy={MURALHA.cy} rx={MURALHA.rx} ry={MURALHA.ry} fill="none" stroke="#7a5a3a" strokeWidth={2.2} />
      <ellipse cx={MURALHA.cx} cy={MURALHA.cy} rx={MURALHA.rx} ry={MURALHA.ry} fill="none" stroke="#b8946a" strokeWidth={0.8} strokeDasharray="2 2" />
      {Array.from({ length: 28 }, (_, k) => {
        const a = (k / 28) * Math.PI * 2;
        const x = MURALHA.cx + Math.cos(a) * MURALHA.rx;
        const y = MURALHA.cy + Math.sin(a) * MURALHA.ry;
        return <rect key={`t${k}`} x={x - 1.6} y={y - 1.6} width={3.2} height={3.2} fill="#8a6a4a" stroke="#4a3220" strokeWidth={0.4} />;
      })}
      {/* as ruas de pedra */}
      {RUAS.map((l, k) => (
        <g key={`r${k}`}>
          <path d={caminho(l)} stroke="#8a7a5a" strokeWidth={4.2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <path d={caminho(l)} stroke="#cdbb92" strokeWidth={3} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <path d={caminho(l)} stroke="#a8966e" strokeWidth={0.4} strokeDasharray="1 1.4" fill="none" />
        </g>
      ))}
      {/* as pontes */}
      {[[146, 22], [134, 66], [116, 110], [92, 136]].map(([x, y], k) => (
        <g key={`p${k}`} transform={`rotate(${k < 2 ? 70 : 40} ${x} ${y})`}>
          <rect x={x! - 7} y={y! - 2} width={14} height={4} fill="#b8a888" stroke="#5a4a38" strokeWidth={0.5} />
          {[-5, -1, 3].map((d) => (
            <rect key={d} x={x! + d} y={y! + 2} width={2} height={1} fill="#5a4a38" />
          ))}
        </g>
      ))}
      {/* o Circo Máximo (a pista das bigas) */}
      <ellipse cx={CIRCO[0]} cy={CIRCO[1]} rx={22} ry={6.5} fill="#c8a878" stroke="#6a4a2a" strokeWidth={0.6} />
      <ellipse cx={CIRCO[0]} cy={CIRCO[1]} rx={18} ry={3.6} fill="#e8d4a4" />
      <rect x={CIRCO[0] - 12} y={CIRCO[1] - 0.5} width={24} height={1} fill="#8a6a4a" />
      {!noite && (
        <g>
          <rect x={-1.2} y={-0.7} width={2.4} height={1.4} fill="#c0283c" />
          <rect x={-2.6} y={-0.4} width={1.2} height={0.8} fill="#6a4a2a" />
          <animateMotion dur="7s" repeatCount="indefinite" rotate="auto" path={`M ${CIRCO[0] - 15} ${CIRCO[1] - 2} L ${CIRCO[0] + 15} ${CIRCO[1] - 2} A 3 2 0 0 1 ${CIRCO[0] + 15} ${CIRCO[1] + 2} L ${CIRCO[0] - 15} ${CIRCO[1] + 2} A 3 2 0 0 1 ${CIRCO[0] - 15} ${CIRCO[1] - 2} Z`} />
        </g>
      )}
    </g>
  );
}

/** As casas e as árvores da cidade. */
function Cidade({ noite }: { noite: boolean }) {
  return (
    <g>
      {ARVORES.map((a, k) =>
        a.tipo === 'cipreste' ? (
          <g key={`a${k}`}>
            <ellipse cx={a.x} cy={a.y + 2.6} rx={1.4} ry={0.6} fill="#000" opacity={0.18} />
            <path d={`M ${a.x} ${a.y - 4} L ${a.x + 1.3} ${a.y + 2} L ${a.x - 1.3} ${a.y + 2} Z`} fill="#2e5a2e" />
            <rect x={a.x - 0.2} y={a.y + 2} width={0.4} height={0.8} fill="#4a2a12" />
          </g>
        ) : a.tipo === 'pinheiro' ? (
          <g key={`a${k}`}>
            <ellipse cx={a.x + 0.6} cy={a.y + 2.6} rx={2.4} ry={0.7} fill="#000" opacity={0.18} />
            <rect x={a.x - 0.3} y={a.y} width={0.6} height={2.6} fill="#5a3a1c" />
            <ellipse cx={a.x} cy={a.y - 0.6} rx={3} ry={1.5} fill="#3e6a34" />
            <ellipse cx={a.x - 0.6} cy={a.y - 1} rx={1.6} ry={0.7} fill="#5a8a44" />
          </g>
        ) : (
          <g key={`a${k}`}>
            <rect x={a.x - 0.3} y={a.y} width={0.6} height={1.8} fill="#6a4a2a" />
            <circle cx={a.x} cy={a.y - 0.6} r={1.7} fill="#7a9a5a" />
            <circle cx={a.x + 0.6} cy={a.y - 1} r={0.8} fill="#9ab878" />
          </g>
        ),
      )}
      {CASAS.map((c, k) => (
        <g key={`c${k}`}>
          <rect x={c.x - c.w / 2 + 0.6} y={c.y - c.h / 2 + 0.6} width={c.w} height={c.h + c.andares} fill="#000" opacity={0.15} />
          <rect x={c.x - c.w / 2} y={c.y - c.h / 2} width={c.w} height={c.h + c.andares} fill="#ecdcb4" stroke="#a88a5a" strokeWidth={0.3} />
          {Array.from({ length: c.andares }, (_, j) => (
            <g key={j}>
              <rect x={c.x - c.w / 2 + 0.8} y={c.y + c.h / 2 - 0.4 + j * 0.2 - j} width={0.8} height={0.7} fill={noite ? (k + j) % 3 ? '#ffd04a' : '#3a2a1a' : '#5a4a3a'} />
              <rect x={c.x + c.w / 2 - 1.6} y={c.y + c.h / 2 - 0.4 + j * 0.2 - j} width={0.8} height={0.7} fill={noite ? (k + j) % 2 ? '#ffb03a' : '#3a2a1a' : '#5a4a3a'} />
            </g>
          ))}
          <rect x={c.x - c.w / 2 - 0.3} y={c.y - c.h / 2 - 0.6} width={c.w + 0.6} height={c.h / 2 + 0.4} fill={c.telhado} />
          <rect x={c.x - c.w / 2 - 0.3} y={c.y - c.h / 2 - 0.6} width={c.w + 0.6} height={0.4} fill="#000" opacity={0.18} />
          {/* fumaça em algumas casas */}
          {k % 11 === 0 && <circle className="mapa-fumaca" cx={c.x + 1} cy={c.y - c.h} r={0.9} fill="#d8d0c8" style={{ animationDelay: `${(k * 137) % 2000}ms` }} />}
        </g>
      ))}
    </g>
  );
}

const R = (x: number, y: number, w: number, h: number, cor: string, extra?: SVGProps<SVGRectElement>) => <rect x={x} y={y} width={w} height={h} fill={cor} {...extra} />;

/** O desenho de cada lugar (grande e detalhado). */
function Lugar({ id, ato, noite }: { id: BairroId; ato: number; noite: boolean }): ReactNode {
  const [x, y] = POS[id];
  const tocha = (tx: number, ty: number) => (
    <g key={`tocha${tx}${ty}`}>
      {R(tx - 0.3, ty, 0.6, 2, '#5a3a1c')}
      <circle className="mapa-chama" cx={tx} cy={ty - 0.4} r={0.9} fill="#ffb03a" />
      {noite && <circle cx={tx} cy={ty} r={4} fill="#ffb03a" opacity={0.18} />}
    </g>
  );
  switch (id) {
    case 'coliseu': {
      const lotado = ato === 5;
      return (
        <g>
          <ellipse cx={x + 1.5} cy={y + 2.5} rx={21} ry={14.5} fill="#000" opacity={0.2} />
          <ellipse cx={x} cy={y} rx={21} ry={14.5} fill="#c8a070" stroke="#5a3a1a" strokeWidth={0.8} />
          <ellipse cx={x} cy={y} rx={18} ry={12} fill="#b48c5e" />
          <ellipse cx={x} cy={y} rx={15} ry={9.6} fill="#9a7650" />
          {/* os arcos de fora */}
          {Array.from({ length: 22 }, (_, k) => {
            const a = Math.PI * (0.05 + (k / 21) * 0.9);
            return R(x + Math.cos(a) * 19.6 - 0.6, y + Math.sin(a) * 13.2 - 0.9, 1.2, 1.8, '#4a2a12', { key: `ar${k}` });
          })}
          {/* a parte quebrada (lá em cima, à direita) */}
          <path d={`M ${x + 8} ${y - 13.6} L ${x + 19} ${y - 6} L ${x + 15} ${y - 4} L ${x + 7} ${y - 9} Z`} fill="#8a6a48" />
          {/* a plateia */}
          {Array.from({ length: lotado ? 140 : 24 }, (_, k) => {
            const a = (k / (lotado ? 140 : 24)) * Math.PI * 2;
            const rr = 11 + (k % 4) * 1.4;
            return R(x + Math.cos(a) * rr * 1.2 - 0.4, y + Math.sin(a) * rr * 0.8 - 0.4, 0.8, 0.8, lotado ? ['#c0283c', '#2a6aa0', '#f2c14e', '#f0e8d8', '#3a8a4a'][k % 5]! : '#7a5a3a', { key: `pl${k}`, className: lotado ? 'mapa-plateia' : undefined, style: lotado ? { animationDelay: `${(k * 53) % 900}ms` } : undefined });
          })}
          {/* a areia e os túneis embaixo */}
          <ellipse cx={x} cy={y} rx={9.4} ry={5.6} fill="#ecd8a8" stroke="#8a6a40" strokeWidth={0.4} />
          {[-5, -2, 1, 4].map((d) => R(x + d, y - 3, 0.5, 6, '#c8b080', { key: `hp${d}` }))}
          {ato >= 6 && <ellipse cx={x} cy={y} rx={9.4} ry={5.6} fill="#2a1040" opacity={0.45} />}
          {/* as bandeiras */}
          {[-14, -5, 5, 14].map((d, k) => (
            <g key={`b${d}`}>
              {R(x + d, y - 16 + Math.abs(d) * 0.25, 0.4, 4, '#4a2a12')}
              <rect className="mapa-bandeira" x={x + d + 0.4} y={y - 16 + Math.abs(d) * 0.25} width={2.6} height={1.6} fill={ato >= 4 ? '#c0283c' : k % 2 ? '#f2c14e' : '#c0283c'} />
              {ato >= 4 && <circle cx={x + d + 1.7} cy={y - 15.2 + Math.abs(d) * 0.25} r={0.45} fill="#f2c14e" />}
            </g>
          ))}
          {tocha(x - 20, y + 6)}
          {tocha(x + 20, y + 6)}
        </g>
      );
    }
    case 'ludus':
      return (
        <g>
          {R(x - 14 + 1, y - 10 + 1, 28, 20, '#000', { opacity: 0.2 })}
          {R(x - 14, y - 10, 28, 20, '#8a5a2a', { stroke: '#3a2410', strokeWidth: 0.6 })}
          {R(x - 11, y - 7, 22, 14, '#dcc08a')}
          {/* telhado das celas em volta */}
          {R(x - 14, y - 10, 28, 3, '#a24a30')}
          {R(x - 14, y + 7, 28, 3, '#a24a30')}
          {/* os bonecos de treino e o círculo de areia */}
          <circle cx={x + 3} cy={y} r={4.4} fill="#ecd8a8" stroke="#a8884a" strokeWidth={0.4} />
          {[[-7, -3], [-7, 2], [-3, -3]].map(([dx, dy], k) => (
            <g key={k}>
              {R(x + dx! - 0.3, y + dy!, 0.6, 2.2, '#5a3a1c')}
              {R(x + dx! - 1, y + dy! + 0.4, 2, 0.6, '#5a3a1c')}
              <circle cx={x + dx!} cy={y + dy! - 0.3} r={0.7} fill="#c8a070" />
            </g>
          ))}
          {/* a forja do Brutus */}
          {R(x + 8, y - 6, 3, 3, '#4a4038')}
          <circle className="mapa-chama" cx={x + 9.5} cy={y - 4.6} r={0.9} fill="#ff7a2a" />
          <circle className="mapa-fumaca" cx={x + 9.5} cy={y - 7} r={0.8} fill="#a8a098" />
          {/* o portão */}
          {R(x - 2, y + 7, 4, 3, '#3a2410')}
          {/* a bandeira das três estrelas, depois do Encontro */}
          {ato >= 3 && (
            <g>
              {R(x - 13, y - 17, 0.5, 7, '#4a2a12')}
              <rect className="mapa-bandeira" x={x - 12.5} y={y - 17} width={5} height={3} fill="#1a2a5a" />
              {[0, 1.6, 3.2].map((d) => R(x - 12 + d, y - 16, 0.8, 0.8, '#f2c14e', { key: `e${d}` }))}
            </g>
          )}
          {tocha(x - 4, y + 9)}
          {tocha(x + 4, y + 9)}
        </g>
      );
    case 'forum':
      return (
        <g>
          {R(x - 17, y - 11, 34, 22, '#d8ccb0', { stroke: '#8a7a60', strokeWidth: 0.5 })}
          {Array.from({ length: 6 }, (_, k) => R(x - 17, y - 11 + k * 3.7, 34, 0.3, '#b8ac90', { key: `ln${k}` }))}
          {/* o templo do fundo, com colunas */}
          {R(x - 12, y - 13, 24, 3, '#c8bca8', { stroke: '#7a6a50', strokeWidth: 0.4 })}
          <polygon points={`${x - 12},${y - 13} ${x},${y - 18} ${x + 12},${y - 13}`} fill="#e8dcc4" stroke="#7a6a50" strokeWidth={0.4} />
          {[-10, -6, -2, 2, 6, 10].map((d) => R(x + d - 0.6, y - 10, 1.2, 5, '#f4ecdc', { key: `c${d}`, stroke: '#a89c88', strokeWidth: 0.2 }))}
          {/* a tribuna e o estandarte */}
          {R(x - 5, y + 3, 10, 4, '#a89c88', { stroke: '#5a4a38', strokeWidth: 0.4 })}
          {R(x - 0.3, y - 2, 0.6, 5, '#4a2a12')}
          <rect className="mapa-bandeira" x={x + 0.3} y={y - 2} width={3.6} height={2.6} fill={ato >= 4 ? '#1a1a1a' : '#c0283c'} />
          {ato >= 4 && (
            <g>
              <ellipse cx={x + 2.1} cy={y - 0.7} rx={1.3} ry={0.7} fill="#f0e8d8" />
              <circle cx={x + 2.1} cy={y - 0.7} r={0.4} fill="#c0283c" />
            </g>
          )}
          {/* o arco do triunfo e as estátuas */}
          {R(x + 13, y + 4, 4, 6, '#d8ccb0', { stroke: '#7a6a50', strokeWidth: 0.4 })}
          {R(x + 14.2, y + 6.4, 1.6, 3.6, '#5a4a38')}
          {[-13, -9].map((d) => (
            <g key={`s${d}`}>
              {R(x + d - 1, y + 6, 2, 1.4, '#a89c88')}
              {R(x + d - 0.5, y + 3.6, 1, 2.4, '#e8e0d0')}
            </g>
          ))}
          {/* gente na praça */}
          {[[-8, 0], [6, -3], [9, 2], [-3, 8]].map(([dx, dy], k) => R(x + dx!, y + dy!, 0.8, 1.2, ['#6a4a8a', '#2a6aa0', '#8a4a2a', '#3a6a3a'][k]!, { key: `g${k}` }))}
        </g>
      );
    case 'subura':
      return (
        <g>
          {/* prédios altos e apertados */}
          {[[-14, -8], [-7, -10], [0, -9], [7, -11], [-12, 1], [-4, 2], [4, 1], [11, 0]].map(([dx, dy], k) => (
            <g key={k}>
              {R(x + dx! + 0.6, y + dy! + 0.6, 6, 7, '#000', { opacity: 0.2 })}
              {R(x + dx!, y + dy!, 6, 7, k % 2 ? '#e8cfa0' : '#dcc08e', { stroke: '#8a6a40', strokeWidth: 0.3 })}
              {R(x + dx! - 0.4, y + dy! - 1, 6.8, 1.8, k % 3 ? '#b8543a' : '#9a4028')}
              {[1, 3.4].map((wy) => [0.8, 3.6].map((wx) => R(x + dx! + wx, y + dy! + wy, 1.2, 1, noite ? (k + wx) % 3 > 1 ? '#3a2a1a' : '#ffd04a' : '#5a4a3a', { key: `${wx}${wy}` })))}
            </g>
          ))}
          {/* o varal de roupa entre os prédios */}
          <path d={`M ${x - 8} ${y - 6} Q ${x - 4.5} ${y - 4.6} ${x - 1} ${y - 6}`} stroke="#5a4a3a" strokeWidth={0.2} fill="none" />
          {[['#c0283c', -7], ['#2a6aa0', -5.2], ['#f2c14e', -3.4]].map(([c, d]) => R(x + (d as number), y - 5.6, 1, 1.4, c as string, { key: `${d}`, className: 'mapa-bandeira' }))}
          {/* a feira: barracas listradas */}
          {[-9, -3, 3].map((d, k) => (
            <g key={`f${d}`}>
              {Array.from({ length: 4 }, (_, j) => R(x + d + j * 1.2, y + 11, 1.2, 2, j % 2 ? '#f0e8d8' : ['#c0283c', '#2a6aa0', '#3a8a4a'][k]!, { key: j }))}
              {R(x + d, y + 13, 4.8, 1.4, '#8a5a2a')}
            </g>
          ))}
          {/* três estrelas pintadas no muro (depois do Encontro) */}
          {ato >= 3 && [0, 1.6, 3.2].map((d) => R(x + 12 + d, y + 3, 0.9, 0.9, '#f2c14e', { key: `st${d}` }))}
          <circle className="mapa-fumaca" cx={x - 4} cy={y - 12} r={1} fill="#c8c0b8" />
          <circle className="mapa-fumaca" cx={x + 9} cy={y - 13} r={1} fill="#c8c0b8" style={{ animationDelay: '900ms' }} />
        </g>
      );
    case 'biblioteca': {
      const queimada = ato >= 2;
      return (
        <g>
          {R(x - 16 + 1, y - 8 + 1, 32, 16, '#000', { opacity: 0.2 })}
          {R(x - 16, y - 8, 32, 16, '#ece0c4', { stroke: '#7a6a50', strokeWidth: 0.5 })}
          <polygon points={`${x - 17},${y - 8} ${x},${y - 15} ${x + 17},${y - 8}`} fill={queimada ? '#5a4a40' : '#9a4a30'} stroke="#4a2a12" strokeWidth={0.5} />
          {queimada && <polygon points={`${x - 4},${y - 13} ${x + 3},${y - 14} ${x + 7},${y - 9} ${x - 6},${y - 9}`} fill="#2a2018" />}
          {Array.from({ length: 9 }, (_, k) => R(x - 14 + k * 3.4, y - 7, 1.4, 11, queimada && k > 5 ? '#8a7a68' : '#fffaf0', { key: `c${k}`, stroke: '#a89c88', strokeWidth: 0.2 }))}
          {/* a escadaria */}
          {[0, 1, 2].map((k) => R(x - 15 + k, y + 4 + k * 1.2, 30 - k * 2, 1.2, k % 2 ? '#c8bca8' : '#d8ccb8', { key: `d${k}` }))}
          {/* os pergaminhos na entrada */}
          {R(x - 1.5, y - 3, 3, 5, '#2a1a10')}
          {queimada && (
            <g>
              {/* os andaimes da reforma e um copista */}
              <path d={`M ${x + 9} ${y - 12} L ${x + 9} ${y + 4} M ${x + 14} ${y - 10} L ${x + 14} ${y + 4} M ${x + 9} ${y - 6} L ${x + 14} ${y - 6}`} stroke="#8a5a2a" strokeWidth={0.5} />
              {R(x + 10.6, y - 8, 1, 1.8, '#6a4a2a')}
            </g>
          )}
          {ato <= 1 && (
            <g>
              {[[-12, -16], [-6, -19], [0, -21], [6, -18], [12, -15], [-2, -11], [8, -10]].map(([dx, dy], k) => (
                <g key={`fo${k}`} className="mapa-fogo" style={{ animationDelay: `${k * 110}ms` }}>
                  <path d={`M ${x + dx! - 2} ${y + dy! + 4} Q ${x + dx!} ${y + dy! - 2} ${x + dx! + 2} ${y + dy! + 4} Z`} fill="#ff5a1a" />
                  <path d={`M ${x + dx! - 1} ${y + dy! + 4} Q ${x + dx!} ${y + dy!} ${x + dx! + 1} ${y + dy! + 4} Z`} fill="#ffd04a" />
                </g>
              ))}
              <circle cx={x} cy={y - 8} r={22} fill="#ff7a2a" opacity={0.18} />
              {[0, 1, 2].map((k) => (
                <circle key={`fu${k}`} className="mapa-fumaca" cx={x - 6 + k * 6} cy={y - 22} r={2.2} fill="#3a3030" style={{ animationDelay: `${k * 400}ms` }} />
              ))}
            </g>
          )}
        </g>
      );
    }
    case 'observatorio':
      return (
        <g>
          <ellipse cx={x} cy={y + 6} rx={16} ry={6} fill="#8aa060" stroke="#5a6a40" strokeWidth={0.4} />
          {R(x - 8, y - 2, 16, 8, '#c8c0b0', { stroke: '#5a5040', strokeWidth: 0.5 })}
          <path d={`M ${x - 7} ${y - 2} A 7 7 0 0 1 ${x + 7} ${y - 2} Z`} fill="#7a8aa8" stroke="#3a4a6a" strokeWidth={0.6} />
          <path d={`M ${x - 1} ${y - 8.6} L ${x + 1} ${y - 8.6} L ${x + 1} ${y - 2} L ${x - 1} ${y - 2} Z`} fill="#1a2238" />
          {/* o telescópio de bronze */}
          <line x1={x + 0.4} y1={y - 5} x2={x + 9} y2={y - 13} stroke="#c8963a" strokeWidth={1.8} />
          <line x1={x + 8} y1={y - 12} x2={x + 10.4} y2={y - 14.2} stroke="#8a6a2a" strokeWidth={2.4} />
          {R(x - 6, y + 1, 1.4, 2, '#3a4a6a')}
          {R(x + 4.6, y + 1, 1.4, 2, '#3a4a6a')}
          {R(x - 1.2, y + 2.6, 2.4, 3.4, '#3a2a1a')}
          {/* as três estrelas brilhando em cima */}
          {[[-10, -18], [-6, -21], [-2, -18]].map(([dx, dy], k) => (
            <g key={k} className="mapa-estrela" style={{ animationDelay: `${k * 300}ms` }}>
              {R(x + dx! - 0.4, y + dy! - 1.4, 0.8, 2.8, '#f2c14e')}
              {R(x + dx! - 1.4, y + dy! - 0.4, 2.8, 0.8, '#f2c14e')}
            </g>
          ))}
        </g>
      );
    case 'templo':
      return (
        <g>
          <ellipse cx={x + 1} cy={y + 3} rx={13} ry={8} fill="#000" opacity={0.18} />
          <ellipse cx={x} cy={y + 2} rx={13} ry={8} fill="#c8bca8" stroke="#7a6a50" strokeWidth={0.5} />
          <ellipse cx={x} cy={y + 1} rx={11} ry={6.6} fill="#ddd2bc" />
          {/* as colunas em roda */}
          {Array.from({ length: 12 }, (_, k) => {
            const a = (k / 12) * Math.PI * 2;
            return R(x + Math.cos(a) * 9 - 0.6, y + Math.sin(a) * 5.4 - 2.4, 1.2, 3.6, '#fffaf0', { key: k, stroke: '#a89c88', strokeWidth: 0.2 });
          })}
          <ellipse cx={x} cy={y - 3} rx={8} ry={4.4} fill="#c8963a" stroke="#7a5a1a" strokeWidth={0.5} />
          <ellipse cx={x - 2} cy={y - 4} rx={3} ry={1.4} fill="#e8b85a" />
          {/* o tripé da Sibila e a fumaça do oráculo */}
          {R(x - 0.8, y + 4, 1.6, 2, '#6a5a3a')}
          {[0, 1, 2].map((k) => (
            <circle key={k} className="mapa-fumaca" cx={x} cy={y - 8} r={1.4} fill={ato >= 6 ? '#8ab4f0' : '#c8b8e0'} style={{ animationDelay: `${k * 600}ms` }} />
          ))}
          {/* a escada */}
          {[0, 1, 2].map((k) => R(x - 3 + k * 0.4, y + 9 + k, 6 - k * 0.8, 1, '#b8ac98', { key: `d${k}` }))}
        </g>
      );
    case 'aqueduto':
      return (
        <g>
          {/* os arcos vêm de fora da cidade (do leste) */}
          {Array.from({ length: 13 }, (_, k) => {
            const ax = 248 + k * 6;
            const ay = 92 - (ax - 248) * 0.22;
            return (
              <g key={k}>
                {R(ax, ay, 6, 7, '#b8ac94', { stroke: '#6a5a40', strokeWidth: 0.4 })}
                <path d={`M ${ax + 1} ${ay + 7} L ${ax + 1} ${ay + 3.6} A 2 2 0 0 1 ${ax + 5} ${ay + 3.6} L ${ax + 5} ${ay + 7} Z`} fill="#5a7a4a" />
              </g>
            );
          })}
          <line x1={248} y1={91.2} x2={326} y2={74} stroke="#5a8ac8" strokeWidth={1.4} />
          <line x1={248} y1={91.2} x2={326} y2={74} className="mapa-correnteza" stroke="#c8e0ff" strokeWidth={0.5} strokeDasharray="2 4" />
          {/* a casa das comportas */}
          {R(x - 4, y - 2, 8, 7, '#a89c88', { stroke: '#5a4a38', strokeWidth: 0.5 })}
          {R(x - 4.6, y - 3.4, 9.2, 1.8, '#7a5a3a')}
          {R(x - 1, y + 1.6, 2, 3.4, '#3a2a1a')}
          {/* o tanque */}
          <ellipse cx={x - 8} cy={y + 6} rx={4} ry={2} fill="#4a7ab8" stroke="#6a5a40" strokeWidth={0.5} />
        </g>
      );
    case 'catacumbas':
      return (
        <g>
          {/* os túmulos da Via Ápia */}
          {[[-14, -6], [12, -8], [-12, 6], [14, 4], [-18, 0], [18, -2]].map(([dx, dy], k) => (
            <g key={k}>
              {R(x + dx! - 2, y + dy! - 2, 4, 4, k % 2 ? '#b8ac98' : '#a89c88', { stroke: '#5a4a38', strokeWidth: 0.3 })}
              {R(x + dx! - 2.4, y + dy! - 2.6, 4.8, 1, '#8a7a68')}
            </g>
          ))}
          {/* a entrada para o subterrâneo */}
          {R(x - 6, y - 4, 12, 8, '#5a5048', { stroke: '#2a2018', strokeWidth: 0.6 })}
          <path d={`M ${x - 3.4} ${y + 4} L ${x - 3.4} ${y} A 3.4 3.4 0 0 1 ${x + 3.4} ${y} L ${x + 3.4} ${y + 4} Z`} fill="#0c0a08" />
          {/* as velas lá dentro */}
          {[-1.6, 0, 1.6].map((d, k) => (
            <circle key={d} className="mapa-chama" cx={x + d} cy={y + 2} r={0.45} fill="#ffd04a" style={{ animationDelay: `${k * 200}ms` }} />
          ))}
          {/* a pena dos Copistas, riscada na pedra */}
          <path d={`M ${x - 1} ${y - 3} Q ${x + 1.4} ${y - 3.4} ${x + 1.6} ${y - 1.4}`} stroke="#d8d0c0" strokeWidth={0.4} fill="none" />
        </g>
      );
    case 'porto':
      return (
        <g>
          {/* o cais de madeira e os armazéns */}
          {R(x - 6, y - 14, 22, 8, '#c8b080', { stroke: '#6a5030', strokeWidth: 0.4 })}
          {[0, 7, 14].map((d) => (
            <g key={`a${d}`}>
              {R(x - 5 + d, y - 13, 6, 5, '#d8c4a0', { stroke: '#7a5a3a', strokeWidth: 0.3 })}
              {R(x - 5.4 + d, y - 14, 6.8, 1.6, '#9a4028')}
            </g>
          ))}
          {R(x - 4, y - 6, 4, 14, '#8a5a2a', { stroke: '#4a2a12', strokeWidth: 0.4 })}
          {R(x + 4, y - 6, 4, 12, '#8a5a2a', { stroke: '#4a2a12', strokeWidth: 0.4 })}
          {Array.from({ length: 6 }, (_, k) => R(x - 4, y - 5 + k * 2.2, 4, 0.3, '#5a3a1a', { key: `t${k}` }))}
          {/* caixotes e o guindaste */}
          {[[-3, -4], [-2, -2.4], [5, -3]].map(([dx, dy], k) => R(x + dx!, y + dy!, 1.6, 1.4, '#a8783a', { key: `cx${k}`, stroke: '#5a3a1a', strokeWidth: 0.2 }))}
          <line x1={x + 9} y1={y - 6} x2={x + 9} y2={y - 16} stroke="#5a3a1a" strokeWidth={0.8} />
          <line x1={x + 9} y1={y - 16} x2={x + 3} y2={y - 12} stroke="#5a3a1a" strokeWidth={0.5} />
          {/* o farol */}
          {R(x - 18, y - 6, 4, 10, '#e8e0d0', { stroke: '#7a6a50', strokeWidth: 0.4 })}
          {R(x - 18.6, y - 8, 5.2, 2, '#a89c88')}
          <circle className="mapa-farol" cx={x - 16} cy={y - 9.4} r={1.6} fill="#ffd04a" />
          {noite && <circle className="mapa-farol" cx={x - 16} cy={y - 9.4} r={8} fill="#ffd04a" opacity={0.2} />}
          {/* os navios */}
          {[[-10, 8, 1], [2, 14, 0], [-22, 18, 1]].map(([dx, dy, grande], k) => (
            <g key={`n${k}`} className={k === 1 ? 'mapa-barco' : 'mapa-barco-2'}>
              <path d={`M ${x + dx! - (grande ? 5 : 3.4)} ${y + dy!} L ${x + dx! + (grande ? 5 : 3.4)} ${y + dy!} L ${x + dx! + (grande ? 3.6 : 2.4)} ${y + dy! + 2} L ${x + dx! - (grande ? 3.6 : 2.4)} ${y + dy! + 2} Z`} fill="#6a4220" stroke="#3a2210" strokeWidth={0.3} />
              {R(x + dx! - 0.2, y + dy! - (grande ? 7 : 5), 0.4, grande ? 7 : 5, '#3a2210')}
              <polygon points={`${x + dx! + 0.3},${y + dy! - (grande ? 6.6 : 4.6)} ${x + dx! + (grande ? 4 : 3)},${y + dy! - 1} ${x + dx! + 0.3},${y + dy! - 1}`} fill={k === 0 && ato <= 2 ? '#c0283c' : '#f0e8d8'} />
            </g>
          ))}
          {/* a gaivota Bússola voando em volta */}
          <g className="mapa-gaivota">
            <path d={`M ${x + 6} ${y - 22} q 1.2 -1 2.4 0 q 1.2 -1 2.4 0`} stroke="#fffaf0" strokeWidth={0.6} fill="none" />
          </g>
        </g>
      );
  }
}

/** A faixa com o nome de cada lugar. */
function Faixa({ x, y, texto, apagada, destaque }: { x: number; y: number; texto: string; apagada?: boolean; destaque?: boolean }) {
  const w = texto.length * 3.6 + 7;
  return (
    <g>
      <path d={`M ${x - w / 2 - 2.4} ${y - 1} L ${x - w / 2} ${y - 1} L ${x - w / 2} ${y + 4.6} L ${x - w / 2 - 2.4} ${y + 4.6} L ${x - w / 2 - 1} ${y + 1.8} Z`} fill={apagada ? '#8a7a64' : '#a8742a'} />
      <path d={`M ${x + w / 2 + 2.4} ${y - 1} L ${x + w / 2} ${y - 1} L ${x + w / 2} ${y + 4.6} L ${x + w / 2 + 2.4} ${y + 4.6} L ${x + w / 2 + 1} ${y + 1.8} Z`} fill={apagada ? '#8a7a64' : '#a8742a'} />
      <rect x={x - w / 2} y={y - 2} width={w} height={6.6} fill={apagada ? '#c8bca4' : destaque ? '#ffe9a8' : '#f4e6c0'} stroke={apagada ? '#6a5a44' : '#5a3a12'} strokeWidth={0.6} />
      <text x={x} y={y + 3} textAnchor="middle" fontSize={3.6} textLength={texto.length * 3.6 - 0.6} lengthAdjust="spacingAndGlyphs" fill={apagada ? '#6a5a44' : '#3a2412'} className="font-pixel">
        {texto}
      </text>
    </g>
  );
}

/** A névoa por cima do lugar que ainda não foi visitado. */
function Nevoa({ x, y }: { x: number; y: number }) {
  return (
    <g className="mapa-nevoa" opacity={0.92}>
      {[[-10, -2, 9], [0, -6, 10], [10, -1, 9], [-4, 5, 8], [6, 5, 8]].map(([dx, dy, r], k) => (
        <ellipse key={k} cx={x + dx!} cy={y + dy!} rx={r} ry={r! * 0.6} fill={k % 2 ? '#e8e4dc' : '#f4f0e8'} />
      ))}
    </g>
  );
}

export interface MapaDeRomaProps {
  estado: EstadoRoma;
  /** O nome do ato (ex.: "A Marca do Olho"). */
  titulo?: string;
  /** O que já foi achado em Roma. */
  roma?: { segredos?: string[]; pedidos?: string[] };
  total: number;
  /** Os lugares onde dá para entrar agora. */
  entrar: BairroId[];
  onEntrar: (b: BairroId) => void;
  onLudus: () => void;
  onFechar: () => void;
}

/** O mapa grande, na tela inteira. */
export function MapaDeRoma({ estado, titulo, roma, total, entrar, onEntrar, onLudus, onFechar }: MapaDeRomaProps) {
  const ato = estado.ato;
  const noite = ato <= 2;
  const eclipse = ato >= 6;
  const [aberto, setAberto] = useState<BairroId | null>(null);
  // O ZOOM (25/11/2026, o Lucas achou o mapa "com muito zoom"): abre com Roma inteira na tela.
  const [zoom, setZoom] = useState(1);
  const [tela, setTela] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const medir = () => setTela({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);
  const largura = Math.min(tela.w, (tela.h - 8) * (W / H)) * zoom;
  const centroAntes = useRef<[number, number] | null>(null);
  const mudarZoom = (z: number) => {
    const el = rolagem.current;
    if (el) centroAntes.current = [(el.scrollLeft + el.clientWidth / 2) / el.scrollWidth, (el.scrollTop + el.clientHeight / 2) / el.scrollHeight];
    setZoom(Math.max(1, Math.min(4, z)));
  };
  useLayoutEffect(() => {
    const el = rolagem.current;
    const c = centroAntes.current;
    if (!el || !c) return;
    el.scrollLeft = c[0] * el.scrollWidth - el.clientWidth / 2;
    el.scrollTop = c[1] * el.scrollHeight - el.clientHeight / 2;
    centroAntes.current = null;
  }, [zoom]);
  const rolagem = useRef<HTMLDivElement>(null);
  const arrasto = useRef<{ x: number; y: number; sx: number; sy: number; mexeu: boolean } | null>(null);
  const visto = (b: BairroId) => estado.visitados.includes(b);
  const nome = (b: BairroId | null) => BAIRROS.find((x) => x.id === b)?.nome ?? '';

  // Abre com o lugar de agora no meio da tela.
  useEffect(() => {
    const el = rolagem.current;
    if (!el) return;
    const [x, y] = POS[estado.atual];
    el.scrollLeft = (x / W) * el.scrollWidth - el.clientWidth / 2;
    el.scrollTop = (y / H) * el.scrollHeight - el.clientHeight / 2;
  }, [estado.atual]);

  // Arrastar com o mouse (no celular, o dedo já arrasta).
  const desce = (ev: PE<HTMLDivElement>) => {
    if (ev.pointerType !== 'mouse' || !rolagem.current) return;
    arrasto.current = { x: ev.clientX, y: ev.clientY, sx: rolagem.current.scrollLeft, sy: rolagem.current.scrollTop, mexeu: false };
  };
  const move = (ev: PE<HTMLDivElement>) => {
    const a = arrasto.current;
    if (!a || !rolagem.current) return;
    if (Math.abs(ev.clientX - a.x) + Math.abs(ev.clientY - a.y) > 4) a.mexeu = true;
    rolagem.current.scrollLeft = a.sx - (ev.clientX - a.x);
    rolagem.current.scrollTop = a.sy - (ev.clientY - a.y);
  };
  const sobe = () => {
    window.setTimeout(() => (arrasto.current = null), 0);
  };
  const tocar = (b: BairroId) => {
    if (arrasto.current?.mexeu) return;
    setAberto((a) => (a === b ? null : b));
  };

  const marcadores = (Object.keys(estado.herois) as HeroiRoma[]).flatMap((h) => {
    const b = estado.herois[h];
    return b ? [{ h, b }] : [];
  });
  const [ax, ay] = POS[estado.atual];
  const prox = estado.proximo ? POS[estado.proximo] : null;
  const cartao = aberto;

  return (
    <div className="fixed inset-0 z-[60] bg-[#0c0806]" role="dialog" aria-modal="true" aria-label="Mapa de Roma">
      <div ref={rolagem} className="mapa-rolagem absolute inset-0 overflow-auto" onPointerDown={desce} onPointerMove={move} onPointerUp={sobe} onPointerLeave={sobe}>
        <div className="flex min-h-full min-w-full items-center justify-center">
        <div className="relative shrink-0" style={{ width: largura, height: largura * (H / W) }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full select-none" shapeRendering="crispEdges" aria-label="Mapa de Roma" role="img">
            <Chao noite={noite} />
            <Cidade noite={noite} />
            {/* o caminho até o próximo destino */}
            {prox && <path d={`M ${ax} ${ay} L ${prox[0]} ${prox[1]}`} className="mapa-trilha" stroke="#c0283c" strokeWidth={1.2} strokeDasharray="2 2" fill="none" />}
            {(Object.keys(POS) as BairroId[]).map((b) => (
              <g key={b}>
                <Lugar id={b} ato={ato} noite={noite} />
                {!visto(b) && <Nevoa x={POS[b][0]} y={POS[b][1]} />}
              </g>
            ))}
            {/* as patrulhas de pretorianos (enquanto vocês são procurados) */}
            {ato <= 5 &&
              [RUAS[0]!, RUAS[1]!, RUAS[7]!, RUAS[5]!].map((l, k) => (
                <g key={`pt${k}`}>
                  <g>
                    <rect x={-0.7} y={-1.4} width={1.4} height={2.2} fill="#8a1a1a" />
                    <rect x={-0.5} y={-2.2} width={1} height={0.8} fill="#c8a040" />
                    <circle cx={0} cy={2} r={3.2} fill="#c0283c" opacity={0.12} />
                    <animateMotion dur={`${16 + k * 5}s`} repeatCount="indefinite" path={caminho(l)} keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear" />
                  </g>
                </g>
              ))}
            {/* os nomes */}
            {(Object.keys(POS) as BairroId[]).map((b) => (
              <Faixa key={`n${b}`} x={POS[b][0]} y={POS[b][1] + (b === 'coliseu' ? 17 : b === 'aqueduto' ? 10 : b === 'porto' ? 25 : 13)} texto={visto(b) ? nome(b) : '???'} apagada={!visto(b)} destaque={b === estado.atual} />
            ))}
            {/* onde vocês estão e o próximo destino */}
            <circle cx={ax} cy={ay} r={24} fill="none" stroke="#e0281e" strokeWidth={1} className="mapa-atual" />
            {prox && (
              <g className="piscar">
                <rect x={prox[0] - 3} y={prox[1] - 30} width={6} height={8} fill="#f2c14e" stroke="#5a3a12" strokeWidth={0.7} />
                <rect x={prox[0] - 0.7} y={prox[1] - 29} width={1.4} height={4} fill="#3a2412" />
                <rect x={prox[0] - 0.7} y={prox[1] - 24.2} width={1.4} height={1.2} fill="#3a2412" />
              </g>
            )}
            {/* a rosa dos ventos e o nome da cidade */}
            <g transform="translate(300 176)">
              <circle r={9} fill="#f4e6c0" stroke="#5a3a12" strokeWidth={0.6} />
              <polygon points="0,-8 1.6,0 0,8 -1.6,0" fill="#5a3a12" />
              <polygon points="-8,0 0,-1.6 8,0 0,1.6" fill="#a8742a" />
              <polygon points="0,-8 1.6,0 -1.6,0" fill="#c0283c" />
              <text y={-10.4} textAnchor="middle" fontSize={3.4} fill="#f4e6c0" className="font-pixel">
                N
              </text>
            </g>
            <text x={86} y={194} textAnchor="middle" fontSize={7} fill="#f4e6c0" className="font-pixel" style={{ letterSpacing: '0.12em' }} opacity={0.85}>
              ROMA ETERNA
            </text>
            <text x={20} y={194} textAnchor="middle" fontSize={3.4} fill="#cfe0f8" className="font-pixel" opacity={0.8}>
              MAR TIRRENO
            </text>
            <text x={140} y={80} textAnchor="middle" fontSize={3} fill="#cfe0f8" className="font-pixel" opacity={0.8} transform="rotate(-76 140 80)">
              RIO TIBRE
            </text>
            {/* noite e eclipse */}
            {noite && <rect width={W} height={H} fill="#0a1238" opacity={0.42} pointerEvents="none" />}
            {eclipse && <rect width={W} height={H} fill="#3a1030" opacity={0.3} pointerEvents="none" />}
            {/* as nuvens passando */}
            <g className="mapa-nuvem" opacity={0.55} pointerEvents="none">
              <ellipse cx={60} cy={20} rx={14} ry={4} fill="#fffaf0" />
              <ellipse cx={68} cy={17} rx={8} ry={4} fill="#fffaf0" />
            </g>
            <g className="mapa-nuvem-2" opacity={0.45} pointerEvents="none">
              <ellipse cx={250} cy={180} rx={12} ry={3.4} fill="#fffaf0" />
            </g>
            {/* as áreas de toque de cada lugar */}
            {(Object.keys(POS) as BairroId[]).map((b) => (
              <rect
                key={`toque${b}`}
                x={POS[b][0] - 22}
                y={POS[b][1] - 18}
                width={44}
                height={36}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                role="button"
                aria-label={`Lugar: ${visto(b) ? nome(b) : 'desconhecido'}`}
                onClick={() => tocar(b)}
              />
            ))}
          </svg>

          {/* os três, onde cada um está */}
          {marcadores.map(({ h, b }, k) => {
            const pos = marcadores.filter((m) => m.b === b).findIndex((m) => m.h === h);
            return (
              <div key={h} className="pointer-events-none absolute w-[3.4%]" style={{ left: `${((POS[b][0] - 7 + pos * 5) / W) * 100}%`, top: `${((POS[b][1] - 22) / H) * 100}%`, zIndex: 5 + k }} aria-label={`${h} está aqui`}>
                <div className="respirar">
                  <GladiadorPixel ia={IA_DO_HEROI[h]} />
                </div>
              </div>
            );
          })}

        </div>
        </div>
      </div>

          {/* o cartão do lugar tocado (por cima do mapa, embaixo, para caber em qualquer tela) */}
          {cartao && (
            <div
              className="mapa-cartao absolute bottom-3 left-1/2 z-20 w-[min(92vw,340px)] -translate-x-1/2 border-4 border-double border-[#5a3a12] bg-[#f4e6c0] p-3 text-[#3a2412] shadow-[4px_4px_0_#000]"
              role="dialog"
              aria-label={`Sobre ${visto(cartao) ? nome(cartao) : 'um lugar desconhecido'}`}
            >
              <button type="button" onClick={() => setAberto(null)} className="absolute right-1 top-1 px-2 font-pixel text-[10px] text-[#5a3a12]" aria-label="Fechar o cartão">
                X
              </button>
              {visto(cartao) ? (
                <>
                  <p className="font-pixel text-[7px] text-[#8a5a2a] sm:text-[8px]">{SOBRE[cartao].tipo}</p>
                  <p className="font-pixel text-[11px] sm:text-sm">{nome(cartao)}</p>
                  {cartao === estado.atual && <p className="mt-1 inline-block bg-[#c0283c] px-1 font-pixel text-[7px] text-white">VOCÊS ESTÃO AQUI</p>}
                  {cartao === estado.proximo && <p className="mt-1 inline-block bg-[#f2c14e] px-1 font-pixel text-[7px] text-[#3a2412]">PRÓXIMO DESTINO</p>}
                  <p className="mt-1 text-[12px] leading-snug">{SOBRE[cartao].texto}</p>
                  {agoraEm(cartao, ato) && (
                    <p className="mt-1 text-[12px] leading-snug">
                      <b>Agora: </b>
                      {agoraEm(cartao, ato)}
                    </p>
                  )}
                  {cartao !== 'ludus' && estado.juntos && (
                    <p className="mt-2 font-pixel text-[7px] leading-relaxed sm:text-[8px]">
                      SEGREDO: {roma?.segredos?.includes(cartao) ? <span className="text-[#3a8a4a]">ACHADO</span> : <span className="text-[#8a5a2a]">ESCONDIDO</span>}
                      <br />
                      PEDIDO: {roma?.pedidos?.includes(cartao) ? <span className="text-[#3a8a4a]">FEITO</span> : <span className="text-[#8a5a2a]">ALGUÉM PRECISA DE AJUDA</span>}
                    </p>
                  )}
                  {cartao === 'ludus' && estado.juntos ? (
                    <button type="button" onClick={onLudus} className="mt-2 w-full border-2 border-[#3a2412] bg-[#c0283c] px-2 py-2 font-pixel text-[9px] text-white shadow-[2px_2px_0_#000]">
                      ENTRAR NA CASA
                    </button>
                  ) : entrar.includes(cartao) ? (
                    <button type="button" onClick={() => onEntrar(cartao)} className="mt-2 w-full border-2 border-[#3a2412] bg-[#c0283c] px-2 py-2 font-pixel text-[9px] text-white shadow-[2px_2px_0_#000]">
                      ENTRAR
                    </button>
                  ) : (
                    <p className="mt-2 text-[11px] italic text-[#6a5a44]">{estado.juntos ? 'Daqui não dá para entrar agora.' : 'Só dá para andar por Roma depois do Encontro.'}</p>
                  )}
                </>
              ) : (
                <>
                  <p className="font-pixel text-[11px]">???</p>
                  <p className="mt-1 text-[12px] leading-snug">Ninguém de vocês esteve aqui ainda. A névoa só some quando a história passar por este lugar.</p>
                </>
              )}
            </div>
          )}

      {/* Tudo o que é escrito fica DENTRO do mapa: o ato em cima, a conta embaixo, o X para fechar */}
      <div className="pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-2">
        <div className="border-4 border-double border-[#5a3a12] bg-[#f4e6c0]/95 px-2 py-1 text-[#3a2412] shadow-[3px_3px_0_#000]">
          {titulo && <p className="font-pixel text-[7px] text-[#8a5a2a] sm:text-[9px]">ATO {ato} · {titulo.toUpperCase()}</p>}
          <p className="text-[11px] sm:text-xs">
            Vocês estão em <b>{nome(estado.atual)}</b>
            {estado.proximo ? (
              <>
                {' '}· próximo: <b className="text-[#c0283c]">{nome(estado.proximo)}</b>
              </>
            ) : null}
          </p>
          <p className="text-[10px] italic text-[#6a5a44]">Toque num lugar para ver. Use + e − para aproximar.</p>
        </div>
        <button type="button" autoFocus onClick={onFechar} className="pointer-events-auto border-4 border-double border-[#5a3a12] bg-[#c0283c] px-3 py-2 font-pixel text-[10px] text-white shadow-[3px_3px_0_#000]" aria-label="Fechar o mapa e voltar para a história">
          X
        </button>
      </div>
      <div className="absolute bottom-2 right-2 flex flex-col gap-1">
        <button type="button" onClick={() => mudarZoom(zoom + 0.75)} disabled={zoom >= 4} className="border-4 border-double border-[#5a3a12] bg-[#f4e6c0] px-3 py-1 font-pixel text-sm text-[#3a2412] shadow-[3px_3px_0_#000] disabled:opacity-40" aria-label="Aproximar o mapa">
          +
        </button>
        <button type="button" onClick={() => mudarZoom(zoom - 0.75)} disabled={zoom <= 1} className="border-4 border-double border-[#5a3a12] bg-[#f4e6c0] px-3 py-1 font-pixel text-sm text-[#3a2412] shadow-[3px_3px_0_#000] disabled:opacity-40" aria-label="Afastar o mapa">
          −
        </button>
      </div>
      {estado.juntos && !cartao && (
        <div className="pointer-events-none absolute bottom-2 left-2 border-4 border-double border-[#5a3a12] bg-[#f4e6c0]/95 px-2 py-1 font-pixel text-[7px] leading-relaxed text-[#3a2412] shadow-[3px_3px_0_#000] sm:text-[9px]">
          SEGREDOS DE ROMA: {roma?.segredos?.length ?? 0}/{total}
          <br />
          PEDIDOS DO POVO: {roma?.pedidos?.length ?? 0}/{total}
        </div>
      )}
    </div>
  );
}
