import { memo, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { marcarVisto, novoMundo, passoMundo, pertoDe, saidaAbertaMundo, type EntradaMundo, type EstadoMundo, type Mundo, type TemaMundo } from '@/game/historia/mundo';
import type { Fala, Falante } from '@/game/historia/roteiro';
import Emote from '@/ui/pixel/Emotes';
import Icone from '@/ui/pixel/Icones';
import { desbloquear } from '@/ui/som';
import { tocar } from '@/ui/somHistoria';
import { Falas } from './Cenas';
import { escalaDe, Retrato } from './Cenarios';
import { usePausado } from './Pausa';

/**
 * O MUNDO VISTO DE CIMA (Undertale + Stardew Valley, pedido do Lucas em 22/11/2026):
 * anda livre para todos os lados (setas, WASD ou o controle na tela), e um botão só
 * para interagir (E, Z, espaço ou a mão na tela): ler, examinar, falar. A câmera segue.
 */
const VISIVEL = 11; // quantos ladrilhos de largura cabem na tela
const PX = 16; // pixels de um ladrilho no desenho

export function MundoAberto({
  mundo,
  heroi,
  onFim,
  onSegredo,
  onCoisa,
}: {
  mundo: Mundo;
  heroi: Falante;
  onFim: () => void;
  onSegredo?: (id: string) => void;
  /** Coisa especial (o boneco de treino, a forja): se devolver true, não abre conversa. */
  onCoisa?: (id: string) => boolean }) {
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
    else if (onCoisa?.(alvo.c.id)) {
      estado.current = marcarVisto(estado.current, alvo.c.id);
      setS(estado.current);
    } else setConversa({ id: alvo.c.id, falas: alvo.c.falas, segredo: alvo.c.segredo });
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
  // Onde ficam as saídas, quem ainda precisa ser visto e a seta da beirada (saída fora da tela).
  const saidas = mundo.mapa.flatMap((linha, y) => linha.split('').flatMap((t, x) => (t === 'P' ? [[x, y] as [number, number]] : [])));
  const obrigatorios = [
    ...mundo.coisas.filter((c) => c.obrigatorio && !s.vistos.includes(c.id)).map((c) => ({ id: c.id, x: c.x + 0.5, y: c.y - 0.1 })),
    ...mundo.pessoas
      .filter((p) => p.obrigatorio && !s.vistos.includes(p.id))
      .map((p) => ({ id: p.id, x: s.pessoas[p.id]!.x, y: s.pessoas[p.id]!.y - 1.6 * escalaDe(p.quem) })),
  ];
  const setaSaida = (() => {
    const saida = saidas[0];
    if (!saida) return null;
    const ex = saida[0] + 0.5 - camera[0];
    const ey = saida[1] + 0.5 - camera[1];
    if (ex >= 0 && ex <= VISIVEL && ey >= 0 && ey <= alturaVisivel) return null;
    const dx = ex - VISIVEL / 2;
    const dy = ey - alturaVisivel / 2;
    const k = Math.min((0.43 * VISIVEL) / Math.max(0.001, Math.abs(dx)), (0.4 * alturaVisivel) / Math.max(0.001, Math.abs(dy)));
    return { x: ((VISIVEL / 2 + dx * k) / VISIVEL) * 100, y: ((alturaVisivel / 2 + dy * k) / alturaVisivel) * 100, angulo: (Math.atan2(dy, dx) * 180) / Math.PI };
  })();
  // Depois de falar com quem precisava: uma seta grande em volta do gladiador aponta a saída.
  const guia = (() => {
    const saida = saidas[0];
    if (!aberta || !saida) return null;
    const dx = saida[0] + 0.5 - s.x;
    const dy = saida[1] + 0.5 - (s.y - 0.6);
    const d = Math.hypot(dx, dy);
    if (d < 1.8) return null;
    return { x: s.x + (dx / d) * 1.25, y: s.y - 0.6 + (dy / d) * 1.25, angulo: (Math.atan2(dy, dx) * 180) / Math.PI };
  })();
  const [avisoSaida, setAvisoSaida] = useState(false);
  useEffect(() => {
    if (!aberta || saidas.length === 0) return;
    setAvisoSaida(true);
    const id = window.setTimeout(() => setAvisoSaida(false), 3500);
    return () => window.clearTimeout(id);
  }, [aberta]);
  const emMundo = (x: number, y: number): CSSProperties => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` });

  const botao = (tecla: keyof EntradaMundo) => ({
    onPointerDown: (ev: PointerEvent) => {
      ev.preventDefault();
      // Segura o dedo no botão: escorregar um pouco não solta (antes, andar travava no celular).
      ev.currentTarget.setPointerCapture?.(ev.pointerId);
      desbloquear();
      entrada.current = { ...entrada.current, [tecla]: true };
    },
    onPointerUp: () => {
      entrada.current = { ...entrada.current, [tecla]: false };
    },
    onPointerCancel: () => {
      entrada.current = { ...entrada.current, [tecla]: false };
    },
    onContextMenu: (ev: MouseEvent) => ev.preventDefault(),
  });

  return (
    <div className="flex flex-col gap-2">
      <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">
        {mundo.objetivo}{aberta && mundo.mapa.some((l) => l.includes('P')) ? ' · a saída está aberta' : ''}
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
              <div key={p.id} className="absolute" style={{ ...emMundo(p.x, p.y), width: `${((1.15 * escalaDe(p.quem)) / W) * 100}%`, transform: 'translate(-50%, -100%)', zIndex: 5 + Math.floor(p.y * 10) }}>
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
          {/* A saída: placa "SAÍDA" em cima; aberta, brilha e uma seta fica pulando */}
          {saidas.map(([x, y]) => (
            <div key={`${x}-${y}`} className="absolute" style={{ ...emMundo(x, y), width: `${(1 / W) * 100}%`, height: `${(1 / H) * 100}%`, zIndex: 250 }}>
              <span className={`absolute inset-0 block ${aberta ? 'saida-brilha' : ''}`} />
              <span className={`placa-ponto absolute -top-[95%] left-1/2 -translate-x-1/2 whitespace-nowrap px-1 font-pixel text-[6px] sm:text-[8px] ${aberta ? '' : 'vista'}`}>SAÍDA</span>
              {aberta && (
                <span className="seta-pula absolute -top-[190%] left-1/2 block w-[70%]">
                  <Icone nome="baixo" className="w-full" />
                </span>
              )}
            </div>
          ))}
          {guia && (
            <span className="guia-saida pointer-events-none absolute block" style={{ ...emMundo(guia.x, guia.y), width: `${(0.8 / W) * 100}%`, transform: `translate(-50%, -50%) rotate(${guia.angulo}deg)`, zIndex: 290 }} aria-hidden>
              <Icone nome="dir" className="w-full" />
            </span>
          )}
          {/* Quem (ou o que) você PRECISA encontrar: uma estrelinha dourada até ver */}
          {obrigatorios.map((o) => (
            <span key={`ob-${o.id}`} className="estrela-objetivo absolute block" style={{ ...emMundo(o.x, o.y), width: `${(0.5 / W) * 100}%`, transform: 'translate(-50%, -100%)', zIndex: 260 }}>
              <Icone nome="estrela" className="w-full" />
            </span>
          ))}
        </div>

        {/* A saída aberta fora da tela: uma seta na beirada aponta o caminho */}
        {aberta && setaSaida && (
          <span className="seta-borda pointer-events-none absolute z-[450] block w-[7%]" style={{ left: `${setaSaida.x}%`, top: `${setaSaida.y}%`, transform: `translate(-50%, -50%) rotate(${setaSaida.angulo}deg)` }} aria-hidden>
            <Icone nome="dir" className="w-full" />
          </span>
        )}

        {avisoSaida && (
          <span className="aviso-saida placa-ponto pointer-events-none absolute left-1/2 top-[8%] z-[460] -translate-x-1/2 whitespace-nowrap px-2 py-1 font-pixel text-[9px] sm:text-xs" aria-live="polite">
            SIGA A SETA ATÉ A SAÍDA
          </span>
        )}
        {/* A luz: escuro em volta, como uma noite de verdade */}
        <div
          className="pointer-events-none absolute inset-0 z-[400]"
          style={{ background: `radial-gradient(ellipse at 50% 55%, transparent ${mundo.tema === 'catacumbas' ? 28 : 45}%, rgba(4,2,12,${Math.min(0.9, CORES[mundo.tema].escuro + (mundo.lugar.includes('noite') ? 0.35 : 0))}) 100%)` }}
          aria-hidden
        />

        {conversa && (
          <div className="absolute inset-0 z-[500]">
            <Falas key={conversa.id} falas={conversa.falas} onFim={fimDaConversa} />
          </div>
        )}
      </div>

      {/* Os controles na tela: as setas à esquerda e a mão de interagir à direita */}
      <div className="controles-jogo flex items-center justify-between gap-3">
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

type PropsSeta = { onPointerDown: (ev: PointerEvent) => void; onPointerUp: () => void; onPointerCancel: () => void; onContextMenu: (ev: MouseEvent) => void };

function BotaoSeta({ nome, props }: { nome: string; props: PropsSeta }) {
  return (
    <button type="button" {...props} className="pixel-box flex aspect-square items-center justify-center" aria-label={`Andar: ${nome}`}>
      <Icone nome={nome} className="w-[60%]" />
    </button>
  );
}

/** As cores de cada tema: o chão, a parede (pedra e tijolo), a face da parede e quanto escurece em volta. */
const CORES: Record<TemaMundo, { chao1: string; chao2: string; parede1: string; parede2: string; face: string; faceTopo: string; escuro: number }> = {
  biblioteca: { chao1: '#5a4a3e', chao2: '#53443a', parede1: '#24180f', parede2: '#2e2016', face: '#4a3424', faceTopo: '#6a4c34', escuro: 0.55 },
  catacumbas: { chao1: '#3a3632', chao2: '#34302c', parede1: '#141210', parede2: '#1c1916', face: '#2e2a26', faceTopo: '#4a443c', escuro: 0.82 },
  forum: { chao1: '#a89a84', chao2: '#9e907a', parede1: '#8a7e6a', parede2: '#94887a', face: '#d8ccb4', faceTopo: '#f0e6d0', escuro: 0.18 },
  tunel: { chao1: '#6a5434', chao2: '#624e30', parede1: '#201810', parede2: '#2a2016', face: '#4a3a28', faceTopo: '#6a5438', escuro: 0.68 },
  ludus: { chao1: '#9a8460', chao2: '#927c58', parede1: '#3a2a1c', parede2: '#443222', face: '#6a5034', faceTopo: '#8a6a44', escuro: 0.25 },
};

/**
 * O mapa desenhado em pixel, ladrilho por ladrilho (feito uma vez só: memo). Cada ladrilho
 * tem o seu desenho: pedra, tapete com borda dourada, parede com tijolos e a face de frente,
 * janela com a lua, estante com livros coloridos, mesa, coluna, castiçal, estátua e a escada.
 */
const MapaDesenhado = memo(function MapaDesenhado({ mundo }: { mundo: Mundo }) {
  const W = mundo.mapa[0]!.length;
  const H = mundo.mapa.length;
  const t = (x: number, y: number) => mundo.mapa[y]?.[x] ?? '#';
  // O chão vai numa camada de baixo: assim uma peça grande (estátua, forja, fonte) nunca é cortada pelo chão do ladrilho vizinho.
  const fundo: ReactNode[] = [];
  const pecas: ReactNode[] = [];
  const luzes: ReactNode[] = [];
  const cor = CORES[mundo.tema];
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
      if ('.PTSpvftgxMDF'.includes(c)) fundo.push(chao(cor.chao1, cor.chao2));
      // Areia (o pátio do Ludus): grãos e marcas de pé.
      if (c === 'a')
        pecas.push(
          <g key={`ar${k}`}>
            <rect x={X} y={Y} width={PX} height={PX} fill="#d8b878" />
            <rect x={X + ((x * 5 + y * 3) % 12)} y={Y + ((x * 7 + y) % 12)} width="2" height="1" fill="#c0a060" />
            <rect x={X + ((x * 3 + y * 7) % 13)} y={Y + ((x + y * 5) % 13)} width="1" height="1" fill="#e8cc90" />
          </g>,
        );
      // Mármore (o Fórum): placas claras com veios.
      if (c === 'm')
        pecas.push(
          <g key={`mm${k}`}>
            <rect x={X} y={Y} width={PX} height={PX} fill="#e4dccc" />
            <rect x={X + ((x + y) % 2) * 8} y={Y} width="8" height={PX} fill="#d8cfbd" />
            <rect x={X + 2} y={Y + 5} width="6" height="1" fill="#c8bca4" />
            <rect x={X} y={Y + PX - 1} width={PX} height="1" fill="#b8ac94" />
          </g>,
        );
      // A fonte do Fórum (2 × 2: desenha uma vez, no canto de cima à esquerda).
      if (c === 'f' && t(x - 1, y) !== 'f' && t(x, y - 1) !== 'f')
        pecas.push(
          <g key={`fo${k}`}>
            <rect x={X + 2} y={Y + 4} width="28" height="24" fill="#b8ac94" />
            <rect x={X + 4} y={Y + 6} width="24" height="20" fill="#3a7aa0" />
            <rect x={X + 6} y={Y + 9} width="6" height="1" fill="#a8d8f0" className="luz-lua" />
            <rect x={X + 18} y={Y + 18} width="6" height="1" fill="#a8d8f0" className="luz-lua" />
            <rect x={X + 14} y={Y + 10} width="4" height="10" fill="#d8ccb4" />
            <rect x={X + 15} y={Y + 6} width="2" height="4" fill="#a8d8f0" />
          </g>,
        );
      // A barraca de feira: balcão de madeira e o toldo listrado.
      if (c === 't')
        pecas.push(
          <g key={`ba${k}`}>
            <rect x={X} y={Y + 8} width={PX} height="7" fill="#8a5a2a" />
            <rect x={X} y={Y + 8} width={PX} height="2" fill="#a8743a" />
            <rect x={X} y={Y} width={PX} height="7" fill={x % 2 ? '#c0283c' : '#f0e6cc'} />
            <rect x={X + 4} y={Y + 10} width="3" height="3" fill="#e0782c" />
            <rect x={X + 9} y={Y + 10} width="3" height="3" fill="#4ad46a" />
          </g>,
        );
      // A grade de ferro (o portão da arena): barras na frente do escuro.
      if (c === 'g')
        pecas.push(
          <g key={`gr${k}`}>
            <rect x={X} y={Y} width={PX} height={PX} fill="#120c08" />
            {[1, 5, 9, 13].map((b) => (
              <rect key={b} x={X + b} y={Y} width="2" height={PX} fill="#5a5a66" />
            ))}
            <rect x={X} y={Y + 6} width={PX} height="2" fill="#4a4a54" />
          </g>,
        );
      // O boneco de treino: poste de madeira, corpo de palha e o alvo no peito.
      if (c === 'D')
        pecas.push(
          <g key={`bo${k}`}>
            <rect x={X + 7} y={Y + 2} width="2" height="14" fill="#6a4220" />
            <rect x={X + 4} y={Y - 6} width="8" height="12" fill="#d8b860" />
            <rect x={X + 4} y={Y - 6} width="8" height="2" fill="#b89840" />
            <rect x={X + 1} y={Y - 3} width="14" height="3" fill="#c8a850" />
            <rect x={X + 6} y={Y - 2} width="4" height="4" fill="#c0283c" />
            <rect x={X + 7} y={Y - 1} width="2" height="2" fill="#f0e6cc" />
            <rect x={X + 5} y={Y - 11} width="6" height="5" fill="#d8b860" />
          </g>,
        );
      // A forja do ferreiro (2 × 2): fornalha de pedra com fogo, bigorna e martelo.
      if (c === 'F' && t(x - 1, y) !== 'F' && t(x, y - 1) !== 'F') {
        pecas.push(
          <g key={`fj${k}`}>
            <rect x={X + 1} y={Y} width="20" height="22" fill="#5a4a40" />
            <rect x={X + 1} y={Y} width="20" height="2" fill="#7a6a5a" />
            <rect x={X + 5} y={Y + 8} width="12" height="10" fill="#1a0e08" />
            <rect x={X + 6} y={Y + 11} width="10" height="7" fill="#ff6a1a" className="luz-vela" />
            <rect x={X + 8} y={Y + 13} width="6" height="4" fill="#ffd04a" />
            <rect x={X + 22} y={Y + 18} width="9" height="4" fill="#4a4a54" />
            <rect x={X + 24} y={Y + 22} width="5" height="6" fill="#3a3a44" />
            <rect x={X + 25} y={Y + 12} width="2" height="6" fill="#6a4220" />
            <rect x={X + 23} y={Y + 10} width="6" height="3" fill="#8a8a98" />
          </g>,
        );
        luzes.push(<circle key={`fl${k}`} cx={X + 11} cy={Y + 14} r="26" fill="#ff8a2a" opacity="0.2" className="luz-vela" />);
      }
      // O monte de sucata (o ninho dos ratos de metal).
      if (c === 'x')
        pecas.push(
          <g key={`su${k}`}>
            <rect x={X + 1} y={Y + 5} width="14" height="10" fill="#4a4a54" />
            <rect x={X + 3} y={Y + 2} width="8" height="6" fill="#6a6a74" />
            <rect x={X + 5} y={Y + 7} width="4" height="4" fill="#8a7a4a" />
            <rect x={X + 10} y={Y + 9} width="3" height="3" fill="#a8742a" />
            <rect x={X + 2} y={Y + 12} width="5" height="1" fill="#e8dcc0" />
          </g>,
        );
      // A máquina violeta do Arquivo (2 × 2): suga as letras dos rolos.
      if (c === 'M' && t(x - 1, y) !== 'M' && t(x, y - 1) !== 'M') {
        pecas.push(
          <g key={`ma${k}`}>
            <rect x={X + 2} y={Y} width="28" height="30" fill="#3a2a4a" />
            <rect x={X + 4} y={Y + 2} width="24" height="10" fill="#6a3aa0" />
            <rect x={X + 8} y={Y + 4} width="16" height="6" fill="#c08aff" className="luz-vela" />
            {[0, 1, 2, 3].map((r) => (
              <rect key={r} x={X + 6 + r * 6} y={Y + 16} width="3" height="10" fill="#8a5ac8" />
            ))}
          </g>,
        );
        luzes.push(<circle key={`ml${k}`} cx={X + 16} cy={Y + 8} r="30" fill="#a06aff" opacity="0.18" className="luz-vela" />);
      }
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
      if (c === '#' || c === 'J' || c === 'N' || c === 'o') {
        const frente = !'#JENo'.includes(t(x, y + 1));
        pecas.push(
          <g key={`p${k}`}>
            <rect x={X} y={Y} width={PX} height={PX} fill={cor.parede1} />
            {[0, 1, 2, 3].map((r) => (
              <rect key={r} x={X + (r % 2) * 6} y={Y + r * 4} width="9" height="3" fill={cor.parede2} />
            ))}
            {frente && <rect x={X} y={Y + 10} width={PX} height="6" fill={cor.face} />}
            {frente && <rect x={X} y={Y + 10} width={PX} height="1" fill={cor.faceTopo} />}
            {/* A parede dos nomes: riscos gravados na pedra */}
            {c === 'N' &&
              [2, 5, 8].map((r) => <rect key={`n${r}`} x={X + 2 + (r % 3)} y={Y + r} width={8 + ((x * r) % 4)} height="1" fill="#c8b890" opacity="0.7" />)}
            {/* O nicho de ossos: caveiras enfileiradas */}
            {c === 'o' &&
              [3, 9].map((cx) => (
                <g key={`o${cx}`}>
                  <rect x={X + cx - 1} y={Y + 3} width="5" height="5" fill="#e8dcc0" />
                  <rect x={X + cx} y={Y + 5} width="1" height="1" fill="#2a2018" />
                  <rect x={X + cx + 2} y={Y + 5} width="1" height="1" fill="#2a2018" />
                  <rect x={X + cx - 1} y={Y + 8} width="5" height="1" fill="#c8bca0" />
                </g>
              ))}
            {/* A janela grande, com arco em cima, vidros em grade e o céu da noite com estrelas */}
            {c === 'J' && (
              <>
                <rect x={X + 1} y={Y - 6} width="14" height="20" fill="#5a3c24" />
                <rect x={X + 3} y={Y - 8} width="10" height="3" fill="#5a3c24" />
                <rect x={X + 2} y={Y - 4} width="12" height="17" fill="#141c40" />
                <rect x={X + 4} y={Y - 6} width="8" height="2" fill="#141c40" />
                <rect x={X + 2} y={Y + 6} width="12" height="7" fill="#1c2a58" />
                <rect x={X + 7.5} y={Y - 6} width="1" height="19" fill="#5a3c24" />
                <rect x={X + 2} y={Y + 2} width="12" height="1" fill="#5a3c24" />
                <rect x={X + 4} y={Y - 2} width="1" height="1" fill="#f4ecd0" />
                <rect x={X + 10} y={Y + 4} width="1" height="1" fill="#f4ecd0" />
                <rect x={X + 11} y={Y - 3} width="1" height="1" fill="#c8d8ff" />
                <rect x={X} y={Y + 13} width="16" height="2" fill="#8a6a4a" />
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
        // A estante é ALTA (mais alta que o gladiador): sobe 12 pixels acima do ladrilho, com coroa e 5 prateleiras.
        pecas.push(
          <g key={`e${k}`}>
            <rect x={X} y={Y - 12} width={PX} height={PX + 12} fill="#4a2a14" />
            <rect x={X} y={Y - 14} width={PX} height="3" fill="#6a4220" />
            <rect x={X} y={Y - 14} width={PX} height="1" fill="#8a5a2a" />
            {[-10, -4, 2, 8, 13].map((r, j) => (
              <g key={r}>
                <rect x={X + 1} y={Y + r + 3} width="14" height="1.2" fill="#2a160a" />
                {[0, 1, 2, 3, 4, 5].map((b) => {
                  const alto = (b + x + j) % 3;
                  return (
                    <g key={b}>
                      <rect x={X + 1.5 + b * 2.3} y={Y + r - 1 + alto} width="2" height={4 - alto} fill={cores[(b + x * 3 + y + j) % cores.length]} />
                      <rect x={X + 1.5 + b * 2.3} y={Y + r + alto} width="2" height="0.6" fill="#f2c14e" opacity="0.6" />
                    </g>
                  );
                })}
              </g>
            ))}
            <rect x={X} y={Y - 12} width="1" height={PX + 12} fill="#6a4220" />
            <rect x={X + PX - 1} y={Y - 12} width="1" height={PX + 12} fill="#2a160a" />
          </g>,
        );
      }
      if (c === 'T') {
        const esq = t(x - 1, y) !== 'T';
        // A mesa de leitura (2 ladrilhos): tampo com borda, toalha vermelha no meio, um livro
        // aberto, uma pilha de livros, um pergaminho, a vela acesa, as pernas e os banquinhos.
        pecas.push(
          <g key={`m${k}`}>
            {esq && <rect x={X + 4} y={Y - 2} width="5" height="4" fill="#6a4220" />}
            {!esq && <rect x={X + 7} y={Y - 2} width="5" height="4" fill="#6a4220" />}
            <rect x={X} y={Y + 2} width={PX} height="10" fill="#8a5a2a" />
            <rect x={X} y={Y + 2} width={PX} height="1.5" fill="#b07c42" />
            <rect x={X} y={Y + 11} width={PX} height="2" fill="#5a3418" />
            <rect x={esq ? X + 6 : X} y={Y + 3} width="10" height="8" fill="#8a1c24" />
            <rect x={esq ? X + 6 : X} y={Y + 3} width="10" height="1" fill="#d8a83a" />
            <rect x={esq ? X + 6 : X} y={Y + 10} width="10" height="1" fill="#d8a83a" />
            {esq ? <rect x={X + 1} y={Y + 13} width="2" height="4" fill="#4a2a14" /> : <rect x={X + 13} y={Y + 13} width="2" height="4" fill="#4a2a14" />}
            {esq ? (
              <>
                <rect x={X + 2} y={Y + 4} width="9" height="6" fill="#f0e0b8" />
                <rect x={X + 6} y={Y + 4} width="1" height="6" fill="#a08060" />
                <rect x={X + 3} y={Y + 5.5} width="2.5" height="0.6" fill="#6a5a4a" />
                <rect x={X + 3} y={Y + 7} width="2.5" height="0.6" fill="#6a5a4a" />
                <rect x={X + 7.5} y={Y + 5.5} width="2.5" height="0.6" fill="#6a5a4a" />
                <rect x={X + 12} y={Y + 9} width="3" height="2" fill="#e8dcc0" />
              </>
            ) : (
              <>
                <rect x={X + 9} y={Y + 7} width="6" height="2" fill="#2a6aa0" />
                <rect x={X + 9} y={Y + 5} width="6" height="2" fill="#3a8a4a" />
                <rect x={X + 10} y={Y + 3} width="5" height="2" fill="#b83a2a" />
                <rect x={X + 3} y={Y + 4} width="2" height="5" fill="#f4ecd0" />
                <rect x={X + 2} y={Y + 9} width="4" height="1" fill="#c8a050" />
                <rect x={X + 3.5} y={Y + 1.5} width="1" height="2.5" fill="#ffb03a" className="chama-vela" />
              </>
            )}
          </g>,
        );
        if (!esq) luzes.push(<circle key={`v${k}`} cx={X + 5} cy={Y + 3} r="14" fill="#ffb03a" opacity="0.12" className="luz-vela" />);
      }
      if (c === 'p') {
        pecas.push(
          // A coluna de mármore: sombra no chão, base em degraus, fuste com caneluras e capitel com volutas.
          <g key={`co${k}`}>
            <ellipse cx={X + 8} cy={Y + 15} rx="8" ry="2" fill="#000" opacity="0.3" />
            <rect x={X} y={Y + 12} width="16" height="3" fill="#b8a880" />
            <rect x={X + 1} y={Y + 10} width="14" height="2" fill="#d0c098" />
            <rect x={X + 3} y={Y - 14} width="10" height="24" fill="#e8dcc0" />
            <rect x={X + 3} y={Y - 14} width="2" height="24" fill="#f8f0dc" />
            <rect x={X + 6} y={Y - 14} width="1" height="24" fill="#c8b890" />
            <rect x={X + 9} y={Y - 14} width="1" height="24" fill="#c8b890" />
            <rect x={X + 11} y={Y - 14} width="2" height="24" fill="#b8a880" />
            <rect x={X + 1} y={Y - 16} width="14" height="2" fill="#d8c8a0" />
            <rect x={X} y={Y - 19} width="16" height="3" fill="#e8dcc0" />
            <rect x={X - 1} y={Y - 18} width="3" height="3" fill="#c8b890" />
            <rect x={X + 14} y={Y - 18} width="3" height="3" fill="#c8b890" />
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
          // A estátua de bronze (redesenhada: o Lucas achou a anterior feia). Pedestal de pedra em
          // degraus com placa; o guardião em pé, de elmo com crista, escudo redondo e lança.
          <g key={`es${k}`}>
            <ellipse cx={X + 16} cy={Y + 31} rx="15" ry="3" fill="#000" opacity="0.3" />
            <rect x={X + 1} y={Y + 24} width="30" height="7" fill="#7a6e60" />
            <rect x={X + 1} y={Y + 24} width="30" height="1.5" fill="#a89a88" />
            <rect x={X + 4} y={Y + 18} width="24" height="7" fill="#8a7e70" />
            <rect x={X + 4} y={Y + 18} width="24" height="1.5" fill="#b8aa96" />
            <rect x={X + 11} y={Y + 20} width="10" height="3" fill="#c8a050" />
            {/* as pernas e a túnica */}
            <rect x={X + 12} y={Y + 10} width="3" height="8" fill="#8a5a22" />
            <rect x={X + 17} y={Y + 10} width="3" height="8" fill="#7a4a1a" />
            <rect x={X + 11} y={Y + 4} width="10" height="7" fill="#a8742a" />
            <rect x={X + 11} y={Y + 9} width="10" height="2" fill="#8a5a22" />
            {/* o peito e os braços */}
            <rect x={X + 11} y={Y - 4} width="10" height="9" fill="#b8843a" />
            <rect x={X + 12} y={Y - 3} width="3" height="6" fill="#d8a85a" />
            <rect x={X + 21} y={Y - 3} width="3" height="8" fill="#a8742a" />
            {/* a cabeça com o elmo e a crista */}
            <rect x={X + 12} y={Y - 11} width="8" height="7" fill="#b8843a" />
            <rect x={X + 12} y={Y - 12} width="8" height="2" fill="#a8742a" />
            <rect x={X + 13} y={Y - 16} width="6" height="4" fill="#c0283c" />
            <rect x={X + 14} y={Y - 8} width="4" height="1" fill="#3a2410" />
            {/* o escudo redondo, na mão esquerda */}
            <circle cx={X + 9} cy={Y + 2} r="6" fill="#9a6a2a" />
            <circle cx={X + 9} cy={Y + 2} r="4.5" fill="#b8843a" />
            <circle cx={X + 9} cy={Y + 2} r="1.6" fill="#e0b870" />
            {/* a lança, na mão direita */}
            <rect x={X + 24} y={Y - 18} width="1.5" height="36" fill="#6a4220" />
            <rect x={X + 23} y={Y - 22} width="3.5" height="5" fill="#c8c8d0" />
            {/* o brilho do bronze */}
            <rect x={X + 12} y={Y - 10} width="1" height="4" fill="#f0d090" opacity="0.7" />
            {/* no FÃ³rum, a estÃ¡tua Ã© a do Censor: capuz vermelho por cima do elmo */}
            {mundo.tema === 'forum' && (
              <>
                <rect x={X + 11} y={Y - 17} width="10" height="9" fill="#8a1a1a" />
                <rect x={X + 10} y={Y - 9} width="12" height="5" fill="#a82020" />
                <rect x={X + 14} y={Y - 12} width="4" height="2" fill="#1a0a0a" />
              </>
            )}
          </g>,
        );
      }
      if (c === 'P') {
        pecas.push(
          // A escada que desce: degraus escurecendo e uma placa pendurada em cima.
          <g key={`sa${k}`}>
            {[0, 1, 2, 3].map((d) => (
              <rect key={d} x={X + 1 + d} y={Y + 2 + d * 3.4} width={PX - 2 - d * 2} height="3" fill={['#3a2e26', '#2e241c', '#221a14', '#16100c'][d]} />
            ))}
            <rect x={X} y={Y} width="1" height={PX} fill="#6a5a4a" />
            <rect x={X + PX - 1} y={Y} width="1" height={PX} fill="#6a5a4a" />
          </g>,
        );
      }
    }),
  );
  return (
    <svg viewBox={`0 0 ${W * PX} ${H * PX}`} className="absolute inset-0 h-full w-full" shapeRendering="crispEdges" aria-hidden>
      {fundo}
      {pecas}
      <g style={{ mixBlendMode: 'screen' }}>{luzes}</g>
    </svg>
  );
});
