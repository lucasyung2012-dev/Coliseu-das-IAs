import { memo, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { marcarVisto, novoMundo, passoMundo, pertoDe, saidaAbertaMundo, type EntradaMundo, type EstadoMundo, type Mundo } from '@/game/historia/mundo';
import type { Fala, Falante } from '@/game/historia/roteiro';
import Emote from '@/ui/pixel/Emotes';
import Icone from '@/ui/pixel/Icones';
import { desbloquear } from '@/ui/som';
import { tocar } from '@/ui/somHistoria';
import { Falas } from './Cenas';
import { Retrato } from './Cenarios';
import { usePausado } from './Pausa';

/**
 * O MUNDO VISTO DE CIMA (Undertale + Stardew Valley, pedido do Lucas em 22/11/2026):
 * anda livre para todos os lados (setas, WASD ou o controle na tela), e um botão só
 * para interagir (E, Z, espaço ou a mão na tela): ler, examinar, falar. A câmera segue.
 */
const VISIVEL = 11; // quantos ladrilhos de largura cabem na tela
const PX = 16; // pixels de um ladrilho no desenho

export function MundoAberto({ mundo, heroi, onFim, onSegredo }: { mundo: Mundo; heroi: Falante; onFim: () => void; onSegredo?: (id: string) => void }) {
  const W = mundo.mapa[0]!.length;
  const H = mundo.mapa.length;
  const [s, setS] = useState<EstadoMundo>(() => novoMundo(mundo));
  const estado = useRef(s);
  const entrada = useRef<EntradaMundo>({ cima: false, baixo: false, esq: false, dir: false });
  const [conversa, setConversa] = useState<{ id: string; falas: Fala[]; segredo?: string } | null>(null);
  const conversaRef = useRef(conversa);
  conversaRef.current = conversa;
  const pausado = usePausado();
  const pausadoRef = useRef(pausado);
  pausadoRef.current = pausado;
  const [acabou, setAcabou] = useState(false);

  // O tamanho da tela em ladrilhos (a altura depende do celular em pé ou deitado).
  const palcoRef = useRef<HTMLDivElement>(null);
  const [alturaVisivel, setAlturaVisivel] = useState(VISIVEL * 0.6);
  useEffect(() => {
    const el = palcoRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const medir = () => el.clientWidth > 0 && setAlturaVisivel((el.clientHeight / el.clientWidth) * VISIVEL);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // O relógio do mundo.
  const [camera, setCamera] = useState<[number, number]>([0, 0]);
  const cam = useRef<[number, number] | null>(null);
  useEffect(() => {
    let ultimo = performance.now();
    let id = 0;
    const quadro = (agora: number) => {
      const dt = Math.min(50, agora - ultimo);
      ultimo = agora;
      if (!pausadoRef.current) {
        const novo = passoMundo(mundo, estado.current, entrada.current, dt, !!conversaRef.current);
        estado.current = novo;
        setS(novo);
        // A câmera segue com suavidade, sem sair do mapa.
        const alvoX = Math.max(0, Math.min(W - VISIVEL, novo.x - VISIVEL / 2));
        const alvoY = Math.max(0, Math.min(H - alturaRef.current, novo.y - 0.6 - alturaRef.current / 2));
        const c = cam.current ?? [alvoX, alvoY];
        const k = Math.min(1, dt / 140);
        cam.current = [c[0] + (alvoX - c[0]) * k, c[1] + (alvoY - c[1]) * k];
        setCamera(cam.current);
      }
      id = requestAnimationFrame(quadro);
    };
    id = requestAnimationFrame(quadro);
    return () => cancelAnimationFrame(id);
  }, [mundo]);
  const alturaRef = useRef(alturaVisivel);
  alturaRef.current = alturaVisivel;

  // Interagir: com quem (ou o quê) estiver na frente.
  const interagir = () => {
    if (conversaRef.current || pausadoRef.current) return;
    const alvo = pertoDe(mundo, estado.current);
    if (!alvo) return;
    desbloquear();
    tocar('pagina');
    if (alvo.tipo === 'pessoa') setConversa({ id: alvo.p.id, falas: alvo.p.falas });
    else setConversa({ id: alvo.c.id, falas: alvo.c.falas, segredo: alvo.c.segredo });
  };
  const fimDaConversa = () => {
    const c = conversaRef.current;
    if (c) {
      estado.current = marcarVisto(estado.current, c.id);
      setS(estado.current);
      if (c.segredo) onSegredo?.(c.segredo);
    }
    setConversa(null);
  };

  // Teclado: setas ou WASD para andar; E, Z, espaço ou Enter para interagir.
  useEffect(() => {
    const muda = (ev: KeyboardEvent, valor: boolean) => {
      const k = ev.key.toLowerCase();
      const mapa: Record<string, keyof EntradaMundo> = { arrowup: 'cima', w: 'cima', arrowdown: 'baixo', s: 'baixo', arrowleft: 'esq', a: 'esq', arrowright: 'dir', d: 'dir' };
      if (mapa[k]) {
        ev.preventDefault();
        entrada.current = { ...entrada.current, [mapa[k]!]: valor };
      } else if (valor && !conversaRef.current && (k === 'e' || k === 'z' || k === ' ' || k === 'enter')) {
        ev.preventDefault();
        interagir();
      }
    };
    const desce = (ev: KeyboardEvent) => muda(ev, true);
    const sobe = (ev: KeyboardEvent) => muda(ev, false);
    window.addEventListener('keydown', desce);
    window.addEventListener('keyup', sobe);
    return () => {
      window.removeEventListener('keydown', desce);
      window.removeEventListener('keyup', sobe);
    };
  }, []);

  useEffect(() => {
    if (s.fim && !acabou) {
      tocar('portao');
      setAcabou(true);
      window.setTimeout(onFim, 500);
    }
  }, [s.fim]);

  const alvo = conversa ? null : pertoDe(mundo, s);
  const aberta = saidaAbertaMundo(mundo, s);
  const emMundo = (x: number, y: number): CSSProperties => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` });

  const botao = (tecla: keyof EntradaMundo) => ({
    onPointerDown: (ev: PointerEvent) => {
      ev.preventDefault();
      desbloquear();
      entrada.current = { ...entrada.current, [tecla]: true };
    },
    onPointerUp: () => {
      entrada.current = { ...entrada.current, [tecla]: false };
    },
    onPointerLeave: () => {
      entrada.current = { ...entrada.current, [tecla]: false };
    },
    onContextMenu: (ev: MouseEvent) => ev.preventDefault(),
  });

  return (
    <div className="flex flex-col gap-2">
      <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">
        {mundo.objetivo}{aberta ? ' · a saída está aberta' : ''}
      </p>
      <div ref={palcoRef} className="pixel-box mundo-aberto relative w-full select-none overflow-hidden bg-black" style={{ touchAction: 'none' }}>
        {/* O mundo inteiro, que anda com a câmera */}
        <div
          className="absolute left-0 top-0"
          style={{
            width: `${(W / VISIVEL) * 100}%`,
            aspectRatio: `${W} / ${H}`,
            transform: `translate(${(-camera[0] / W) * 100}%, ${(-camera[1] / H) * 100}%)`,
          }}
        >
          <MapaDesenhado mundo={mundo} />

          {/* Pessoas e o gladiador, na ordem de quem está mais na frente */}
          {[
            ...mundo.pessoas.map((p) => ({ id: p.id, quem: p.quem, ...s.pessoas[p.id]!, andando: false })),
            { id: '__heroi', quem: heroi, x: s.x, y: s.y, dir: s.dir, andando: s.andando },
          ]
            .sort((a, b) => a.y - b.y)
            .map((p) => (
              <div key={p.id} className="absolute" style={{ ...emMundo(p.x, p.y), width: `${(1.35 / W) * 100}%`, transform: 'translate(-50%, -100%)', zIndex: 5 + Math.floor(p.y * 10) }}>
                <span className="absolute bottom-[-4%] left-1/2 h-[10%] w-[70%] -translate-x-1/2 rounded-[50%] bg-black/45" />
                <div className={p.andando ? 'andar' : 'respirar'}>
                  <Retrato quem={p.quem} espelhar={p.dir === 'esq'} />
                </div>
                {/* O "!" de quando dá para interagir */}
                {alvo?.tipo === 'pessoa' && alvo.p.id === p.id && (
                  <span className="emote-pula absolute -top-[30%] left-1/2 block w-[45%] -translate-x-1/2">
                    <Emote emocao="surpreso" />
                  </span>
                )}
              </div>
            ))}
          {alvo?.tipo === 'coisa' && (
            <span className="emote-pula absolute z-[300] block" style={{ ...emMundo(alvo.c.x + 0.5, alvo.c.y - 0.2), width: `${(0.6 / W) * 100}%`, transform: 'translate(-50%, -100%)' }}>
              <Emote emocao="surpreso" />
            </span>
          )}
          {/* A saída fechada mostra um cadeado desenhado; aberta, brilha */}
          {mundo.mapa.flatMap((linha, y) =>
            linha.split('').map((t, x) =>
              t === 'P' ? (
                <span key={`${x}-${y}`} className={`absolute block ${aberta ? 'saida-brilha' : ''}`} style={{ ...emMundo(x, y), width: `${(1 / W) * 100}%`, height: `${(1 / H) * 100}%` }} />
              ) : null,
            ),
          )}
        </div>

        {/* A luz: escuro em volta, como uma noite de verdade */}
        <div className="pointer-events-none absolute inset-0 z-[400] bg-[radial-gradient(ellipse_at_50%_55%,transparent_45%,rgba(4,2,12,0.55)_100%)]" aria-hidden />

        {conversa && (
          <div className="absolute inset-0 z-[500]">
            <Falas key={conversa.id} falas={conversa.falas} onFim={fimDaConversa} />
          </div>
        )}
      </div>

      {/* Os controles na tela: as setas à esquerda e a mão de interagir à direita */}
      <div className="flex items-center justify-between gap-3">
        <div className="grid w-[46%] max-w-[13rem] grid-cols-3 grid-rows-3 gap-1">
          <span />
          <BotaoSeta nome="cima" props={botao('cima')} />
          <span />
          <BotaoSeta nome="esq" props={botao('esq')} />
          <span />
          <BotaoSeta nome="dir" props={botao('dir')} />
          <span />
          <BotaoSeta nome="baixo" props={botao('baixo')} />
          <span />
        </div>
        <button
          type="button"
          onPointerDown={(ev) => {
            ev.preventDefault();
            interagir();
          }}
          disabled={!alvo}
          className="pixel-box botao-luta flex flex-col items-center gap-1 px-5 py-3 disabled:opacity-40"
          style={{ '--cor': '#f2c14e' } as CSSProperties}
          aria-label="Interagir"
        >
          <span className="medalhao">
            <Icone nome="acao" className="w-[62%]" />
          </span>
          <span className="font-pixel text-[8px] text-[#f4e2b4]">{alvo ? (alvo.tipo === 'pessoa' ? 'FALAR' : 'EXAMINAR') : 'INTERAGIR'}</span>
        </button>
      </div>
      <p className="text-center text-[10px] text-muted">Teclado: setas ou WASD para andar · E, Z ou espaço para interagir</p>
    </div>
  );
}

type PropsSeta = { onPointerDown: (ev: PointerEvent) => void; onPointerUp: () => void; onPointerLeave: () => void; onContextMenu: (ev: MouseEvent) => void };

function BotaoSeta({ nome, props }: { nome: string; props: PropsSeta }) {
  return (
    <button type="button" {...props} className="pixel-box flex aspect-square items-center justify-center" aria-label={`Andar: ${nome}`}>
      <Icone nome={nome} className="w-[60%]" />
    </button>
  );
}

/**
 * O mapa desenhado em pixel, ladrilho por ladrilho (feito uma vez só: memo). Cada ladrilho
 * tem o seu desenho: pedra, tapete com borda dourada, parede com tijolos e a face de frente,
 * janela com a lua, estante com livros coloridos, mesa, coluna, castiçal, estátua e a escada.
 */
const MapaDesenhado = memo(function MapaDesenhado({ mundo }: { mundo: Mundo }) {
  const W = mundo.mapa[0]!.length;
  const H = mundo.mapa.length;
  const t = (x: number, y: number) => mundo.mapa[y]?.[x] ?? '#';
  const pecas: ReactNode[] = [];
  const luzes: ReactNode[] = [];
  mundo.mapa.forEach((linha, y) =>
    linha.split('').forEach((c, x) => {
      const X = x * PX;
      const Y = y * PX;
      const k = `${x}-${y}`;
      const chao = (cor1: string, cor2: string) => (
        <g key={`c${k}`}>
          <rect x={X} y={Y} width={PX} height={PX} fill={cor1} />
          <rect x={X + ((x + y) % 2) * 8} y={Y + (y % 2) * 8} width="8" height="8" fill={cor2} />
          <rect x={X} y={Y + PX - 1} width={PX} height="1" fill="#3a2e26" opacity="0.5" />
        </g>
      );
      if (c === '.' || c === 'P' || c === 'T' || c === 'S' || c === 'p' || c === 'v') pecas.push(chao('#5a4a3e', '#53443a'));
      if (c === 'c') {
        pecas.push(
          <g key={`t${k}`}>
            <rect x={X} y={Y} width={PX} height={PX} fill="#7a2228" />
            <rect x={X + 4} y={Y + 4} width="8" height="8" fill="#8a2a30" />
            {t(x, y - 1) !== 'c' && <rect x={X} y={Y} width={PX} height="2" fill="#d8a83a" />}
            {t(x, y + 1) !== 'c' && <rect x={X} y={Y + PX - 2} width={PX} height="2" fill="#d8a83a" />}
            {t(x - 1, y) !== 'c' && <rect x={X} y={Y} width="2" height={PX} fill="#d8a83a" />}
            {t(x + 1, y) !== 'c' && <rect x={X + PX - 2} y={Y} width="2" height={PX} fill="#d8a83a" />}
          </g>,
        );
      }
      if (c === '#' || c === 'J') {
        const frente = t(x, y + 1) !== '#' && t(x, y + 1) !== 'J' && t(x, y + 1) !== 'E';
        pecas.push(
          <g key={`p${k}`}>
            <rect x={X} y={Y} width={PX} height={PX} fill="#24180f" />
            {[0, 1, 2, 3].map((r) => (
              <rect key={r} x={X + (r % 2) * 6} y={Y + r * 4} width="9" height="3" fill="#2e2016" />
            ))}
            {frente && <rect x={X} y={Y + 10} width={PX} height="6" fill="#4a3424" />}
            {frente && <rect x={X} y={Y + 10} width={PX} height="1" fill="#6a4c34" />}
            {c === 'J' && (
              <>
                <rect x={X + 3} y={Y + 2} width="10" height="11" fill="#6a4c34" />
                <rect x={X + 4} y={Y + 3} width="8" height="9" fill="#1c2c5c" />
                <rect x={X + 7.5} y={Y + 3} width="1" height="9" fill="#6a4c34" />
                <rect x={X + 4} y={Y + 7} width="8" height="1" fill="#6a4c34" />
                <rect x={X + 5} y={Y + 4} width="2" height="2" fill="#f4ecd0" />
              </>
            )}
          </g>,
        );
        // A luz da lua entrando pela janela, no chão.
        if (c === 'J' && t(x, y + 1) !== '#')
          luzes.push(<path key={`l${k}`} d={`M${X + 4} ${Y + 13} L${X + 12} ${Y + 13} L${X + 22} ${Y + 52} L${X + 6} ${Y + 52} Z`} fill="#bcd4ff" opacity="0.13" className="luz-lua" />);
      }
      if (c === 'E') {
        const cores = ['#b83a2a', '#2a6aa0', '#d8a83a', '#3a8a4a', '#8a3aa0', '#e0782c'];
        pecas.push(
          <g key={`e${k}`}>
            <rect x={X} y={Y} width={PX} height={PX} fill="#4a2a14" />
            {[2, 7, 12].map((r, j) => (
              <g key={r}>
                <rect x={X + 1} y={Y + r + 3} width="14" height="1" fill="#2a160a" />
                {[0, 1, 2, 3, 4, 5].map((b) => (
                  <rect key={b} x={X + 1.5 + b * 2.3} y={Y + r - 1 + ((b + x + j) % 2)} width="2" height={4 - ((b + x + j) % 2)} fill={cores[(b + x * 3 + y + j) % cores.length]} />
                ))}
              </g>
            ))}
            <rect x={X} y={Y} width="1" height={PX} fill="#6a4220" />
            <rect x={X + PX - 1} y={Y} width="1" height={PX} fill="#2a160a" />
          </g>,
        );
      }
      if (c === 'T') {
        const esq = t(x - 1, y) !== 'T';
        pecas.push(
          <g key={`m${k}`}>
            <rect x={X} y={Y + 3} width={PX} height="9" fill="#8a5a2a" />
            <rect x={X} y={Y + 3} width={PX} height="2" fill="#a8743a" />
            <rect x={X} y={Y + 12} width={PX} height="2" fill="#4a2a14" />
            {esq ? <rect x={X + 1} y={Y + 12} width="2" height="4" fill="#4a2a14" /> : <rect x={X + 13} y={Y + 12} width="2" height="4" fill="#4a2a14" />}
            {esq ? (
              <>
                <rect x={X + 5} y={Y + 5} width="7" height="5" fill="#f0e0b8" />
                <rect x={X + 8} y={Y + 5} width="1" height="5" fill="#a08060" />
              </>
            ) : (
              <>
                <rect x={X + 4} y={Y + 4} width="2" height="4" fill="#f4ecd0" />
                <rect x={X + 4.5} y={Y + 2} width="1" height="2" fill="#ffb03a" className="chama-vela" />
              </>
            )}
          </g>,
        );
        if (!esq) luzes.push(<circle key={`v${k}`} cx={X + 5} cy={Y + 3} r="14" fill="#ffb03a" opacity="0.12" className="luz-vela" />);
      }
      if (c === 'p') {
        pecas.push(
          <g key={`co${k}`}>
            <rect x={X + 3} y={Y - 10} width="10" height="24" fill="#e8dcc0" />
            <rect x={X + 3} y={Y - 10} width="3" height="24" fill="#f8f0dc" />
            <rect x={X + 10} y={Y - 10} width="3" height="24" fill="#c8b890" />
            <rect x={X + 1} y={Y - 12} width="14" height="3" fill="#d8c8a0" />
            <rect x={X + 1} y={Y + 12} width="14" height="3" fill="#b8a880" />
          </g>,
        );
      }
      if (c === 'v') {
        pecas.push(
          <g key={`ca${k}`}>
            <rect x={X + 7} y={Y + 2} width="2" height="12" fill="#6a5a3a" />
            <rect x={X + 4} y={Y + 13} width="8" height="2" fill="#6a5a3a" />
            <rect x={X + 6} y={Y} width="4" height="3" fill="#f4ecd0" />
            <rect x={X + 7} y={Y - 3} width="2" height="3" fill="#ffb03a" className="chama-vela" />
          </g>,
        );
        luzes.push(<circle key={`cv${k}`} cx={X + 8} cy={Y} r="20" fill="#ffb03a" opacity="0.15" className="luz-vela" />);
      }
      // A estátua do Guardião Zero ocupa 2 × 2: desenha uma vez, no canto de cima à esquerda.
      if (c === 'S' && t(x - 1, y) !== 'S' && t(x, y - 1) !== 'S') {
        pecas.push(
          <g key={`es${k}`}>
            <rect x={X + 2} y={Y + 20} width="28" height="10" fill="#8a7a6a" />
            <rect x={X + 2} y={Y + 20} width="28" height="2" fill="#a89a88" />
            <rect x={X + 11} y={Y - 2} width="10" height="22" fill="#a8742a" />
            <rect x={X + 12} y={Y - 8} width="8" height="7" fill="#b8843a" />
            <rect x={X + 6} y={Y + 4} width="6" height="10" fill="#9a6a2a" />
            <rect x={X + 20} y={Y + 2} width="7" height="12" fill="#8a5a22" />
            <rect x={X + 14} y={Y - 5} width="1.5" height="1.5" fill="#3a2410" />
            <rect x={X + 17} y={Y - 5} width="1.5" height="1.5" fill="#3a2410" />
          </g>,
        );
      }
      if (c === 'P') {
        pecas.push(
          <g key={`es${k}`}>
            {[0, 1, 2, 3].map((d) => (
              <rect key={d} x={X + 1 + d} y={Y + 2 + d * 3.4} width={PX - 2 - d * 2} height="3" fill={['#3a2e26', '#2e241c', '#221a14', '#16100c'][d]} />
            ))}
          </g>,
        );
      }
    }),
  );
  return (
    <svg viewBox={`0 0 ${W * PX} ${H * PX}`} className="absolute inset-0 h-full w-full" shapeRendering="crispEdges" aria-hidden>
      {pecas}
      <g style={{ mixBlendMode: 'screen' }}>{luzes}</g>
    </svg>
  );
});
