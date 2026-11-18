import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import Sprite from '@/ui/pixel/Sprite';
import { LOUROS, PALETA_OURO } from '@/ui/pixel/sprites';
import { GladiadorPixel } from '@/ui/pixel/Personagens';
import { prefereMenosMovimento } from '@/ui/movimento';
import { desbloquear, tocar } from '@/ui/som';

/**
 * Entrada do Arcade: uma sala de fliperama com a máquina em 3D. O jogador põe a
 * moeda, a máquina liga, a câmera dá zoom na tela, a tela "buga" e aparece o
 * PRESS START. Fases, em ordem:
 */
type Fase = 'sala' | 'moeda' | 'ligando' | 'zoom' | 'falha' | 'pronto' | 'saindo';
const ORDEM: Fase[] = ['sala', 'moeda', 'ligando', 'zoom', 'falha', 'pronto', 'saindo'];
const depois = (a: Fase, b: Fase) => ORDEM.indexOf(a) >= ORDEM.indexOf(b);

export default function BootArcade({ onFim }: { onFim: () => void }) {
  const [fase, setFase] = useState<Fase>(() => (prefereMenosMovimento() ? 'pronto' : 'sala'));
  const [camera, setCamera] = useState<CSSProperties>({});
  const tela = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const agendar = (ms: number, f: () => void) => timers.current.push(window.setTimeout(f, ms));

  // Zoom: leva o centro da tela da máquina ao centro da janela e amplia até cobrir tudo.
  const darZoom = () => {
    const r = tela.current?.getBoundingClientRect();
    if (r && r.width > 0) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const ox = r.left + r.width / 2;
      const oy = r.top + r.height / 2;
      const escala = Math.max(vw / r.width, vh / r.height) * 1.1;
      setCamera({ transformOrigin: `${ox}px ${oy}px`, transform: `translate(${vw / 2 - ox}px, ${vh / 2 - oy}px) scale(${escala})` });
    }
    setFase('zoom');
  };

  const inserirMoeda = () => {
    if (fase !== 'sala') return;
    desbloquear();
    tocar('moeda');
    setFase('moeda');
    agendar(950, () => {
      tocar('ligar');
      setFase('ligando');
    });
    agendar(2100, darZoom);
    agendar(3250, () => {
      tocar('falha');
      setFase('falha');
    });
    agendar(4400, () => setFase('pronto'));
  };

  const entrar = () => {
    desbloquear();
    tocar('start');
    setFase('saindo');
    agendar(450, onFim);
  };

  const ligada = depois(fase, 'ligando');
  const naTela = depois(fase, 'falha');

  return (
    <div data-area="arcade" className="fixed inset-0 z-50 overflow-hidden bg-[#07040f]" role="dialog" aria-label="Entrada do Imperium Arcade">
      {/* Câmera: tudo da sala fica aqui dentro para o zoom */}
      <div className="absolute inset-0 transition-transform duration-[1100ms] ease-[cubic-bezier(.65,0,.3,1)]" style={camera}>
        <SalaDeFliperama ligada={ligada} />
        <div className="absolute inset-0 flex items-end justify-center pb-[3vh]">
          <Maquina telaRef={tela} fase={fase} ligada={ligada} onMoeda={inserirMoeda} />
        </div>
      </div>

      {/* A tela da máquina, agora ocupando tudo */}
      {naTela && (
        <div className={`absolute inset-0 flex items-center justify-center bg-black ${fase === 'saindo' ? 'sumir' : ''}`}>
          <div className={`flex w-full flex-col items-center gap-6 px-4 text-center ${fase === 'falha' ? 'crt-falha' : 'crt-acender'}`}>
            <div className="flex items-center gap-3 sm:gap-6">
              <Sprite grade={LOUROS} paleta={PALETA_OURO} escala={5} />
              <div>
                <p className="font-pixel text-[10px] tracking-[0.3em] text-accent-2 sm:text-xs">S.P.Q.R. · MMXXVI</p>
                <h1 className="neon mt-3 font-pixel text-2xl leading-tight text-accent sm:text-5xl">
                  IMPERIUM
                  <br />
                  ARCADE
                </h1>
              </div>
              <Sprite grade={LOUROS} paleta={PALETA_OURO} escala={5} espelhar />
            </div>
            {depois(fase, 'pronto') && (
              <button
                type="button"
                autoFocus
                onClick={entrar}
                className="piscar font-pixel text-sm text-[rgb(242_193_78)] outline-none focus-visible:underline sm:text-lg"
              >
                ▶ PRESS START
              </button>
            )}
          </div>
          <div className="crt-overlay" />
        </div>
      )}

      {fase === 'sala' && (
        <p className="piscar pointer-events-none absolute inset-x-0 top-[6vh] text-center font-pixel text-[10px] text-[rgb(242_193_78)] sm:text-sm">
          TOQUE NA FENDA PARA INSERIR A MOEDA
        </p>
      )}

      {fase !== 'saindo' && (
        <button
          type="button"
          onClick={onFim}
          className="absolute right-3 top-3 z-10 bg-black/60 px-2 py-1 font-pixel text-[9px] text-muted hover:text-accent"
          style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
        >
          PULAR ▶▶
        </button>
      )}
    </div>
  );
}

/** Fundo: parede com letreiros de neon, outras máquinas nos cantos e piso quadriculado. */
function SalaDeFliperama({ ligada }: { ligada: boolean }) {
  return (
    <div className="sala-fliperama absolute inset-0" aria-hidden>
      <p className="neon-placa absolute left-[6%] top-[8%] -rotate-6 font-pixel text-lg text-[#ff4fc8] sm:text-3xl">ARCADE</p>
      <p className="neon-placa neon-placa-2 absolute right-[6%] top-[12%] rotate-3 font-pixel text-[10px] text-[#4ef0dc] sm:text-base">
        HIGH SCORE
      </p>
      <div className="absolute left-1/2 top-[3%] w-10 -translate-x-1/2 opacity-80 sm:w-16">
        <Sprite grade={LOUROS} paleta={PALETA_OURO} />
      </div>
      {/* máquinas vizinhas, apagadas e cortadas pelas bordas */}
      <MaquinaVizinha className="left-[-6%] sm:left-[4%]" cor="#ff4fc8" />
      <MaquinaVizinha className="right-[-6%] sm:right-[4%]" cor="#4ef0dc" />
      <div className="piso-neon absolute inset-x-0 bottom-0 h-[34%]" />
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${ligada ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'radial-gradient(ellipse at 50% 55%, rgb(78 240 220 / 0.22), transparent 55%)' }}
      />
    </div>
  );
}

function MaquinaVizinha({ className, cor }: { className: string; cor: string }) {
  return (
    <div className={`absolute bottom-[10%] h-[52%] w-[22%] max-w-[180px] rounded-t-lg bg-[#140c26] opacity-60 ${className}`}>
      <div className="mx-[10%] mt-[12%] h-[34%] rounded-sm" style={{ background: cor, opacity: 0.35, animation: 'letreiro 1.4s steps(2) infinite' }} />
      <div className="mx-[18%] mt-[10%] h-[4%] rounded" style={{ background: cor, opacity: 0.5 }} />
    </div>
  );
}

/** A máquina de fliperama em 3D: letreiro, tela, painel com controle e botões, porta da moeda. */
function Maquina({
  telaRef,
  fase,
  ligada,
  onMoeda,
}: {
  telaRef: RefObject<HTMLDivElement>;
  fase: Fase;
  ligada: boolean;
  onMoeda: () => void;
}) {
  return (
    <div className="maquina-palco">
      <div className="maquina-3d">
        <div className="maquina-lateral" />
        <div className="maquina-frente">
          {/* letreiro */}
          <div className={`maquina-letreiro ${ligada ? 'aceso' : ''}`}>
            <span className="font-pixel">IMPERIUM ARCADE</span>
          </div>
          {/* tela */}
          <div className="maquina-moldura">
            <div ref={telaRef} className={`maquina-tela ${ligada ? 'ligada' : ''}`}>
              {ligada && (
                <div className={`flex h-full flex-col items-center justify-center gap-[6%] ${fase === 'ligando' ? 'crt-linha' : ''}`}>
                  <div className="flex w-[70%] items-end justify-center gap-[6%]">
                    <div className="w-1/4">
                      <GladiadorPixel ia="claude" />
                    </div>
                    <div className="w-1/4">
                      <GladiadorPixel ia="chatgpt" />
                    </div>
                    <div className="w-1/4">
                      <GladiadorPixel ia="gemini" espelhar />
                    </div>
                  </div>
                  <span className="font-pixel text-[6px] text-[rgb(242_193_78)] sm:text-[8px]">CRÉDITO 01</span>
                </div>
              )}
            </div>
          </div>
          {/* painel de controle inclinado */}
          <div className="maquina-painel">
            <span className="maquina-manche" />
            <span className="maquina-botao bg-[#ff4fc8]" />
            <span className="maquina-botao bg-[#4ef0dc]" />
            <span className="maquina-botao bg-[#f2c14e]" />
          </div>
          {/* porta da moeda */}
          <div className="maquina-porta">
            <button
              type="button"
              onClick={onMoeda}
              disabled={fase !== 'sala'}
              aria-label="Inserir moeda"
              className={`maquina-fenda ${fase === 'sala' ? 'piscar-suave' : ''}`}
            >
              <span className="maquina-fenda-risco" />
              {fase === 'moeda' && (
                <span className="moeda-voo" aria-hidden>
                  <span className="moeda-gira">✦</span>
                </span>
              )}
            </button>
            <p className="font-pixel text-[6px] text-[rgb(242_193_78)] sm:text-[8px]">INSERT COIN</p>
            <p className="font-pixel text-[6px] text-muted sm:text-[8px]">CRÉDITOS {fase === 'sala' ? '00' : '01'}</p>
          </div>
          <div className="maquina-faixa" />
        </div>
      </div>
    </div>
  );
}
