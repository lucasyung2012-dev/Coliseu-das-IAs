import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import Sprite from '@/ui/pixel/Sprite';
import { LOUROS, PALETA_OURO } from '@/ui/pixel/sprites';
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
        <p className="dica-moeda pointer-events-none absolute inset-x-0 top-[3vh] px-16 text-center font-pixel text-[9px] leading-relaxed text-[rgb(242_193_78)] sm:text-xs">
          TOQUE NA FENDA DA MOEDA ▼
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

/**
 * Fundo: um fliperama antigo e meio esquecido. Luz fraca de uma luminária com
 * poeira no ar, placas de neon com letras queimadas, máquinas velhas apagadas
 * (uma só com chiado na tela) e o carpete colorido gasto.
 */
function SalaDeFliperama({ ligada }: { ligada: boolean }) {
  return (
    <div className="sala-fliperama absolute inset-0" aria-hidden>
      <div className="parede-velha absolute inset-x-0 top-0 h-[68%]" />

      <p className="absolute left-[5%] top-[9%] -rotate-3 font-pixel text-lg text-[#ff4fc8] sm:text-3xl">
        <span className="neon-velho">ARC</span>
        <span className="neon-queimado">A</span>
        <span className="neon-velho">DE</span>
      </p>
      <p className="absolute right-[5%] top-[13%] rotate-2 font-pixel text-[10px] text-[#4ef0dc] sm:text-base">
        <span className="neon-velho neon-velho-2">HIGH</span> <span className="neon-queimado">SCORE</span>
      </p>
      <div className="cartaz-velho absolute left-[7%] top-[24%] hidden w-[16%] max-w-[120px] p-2 text-center sm:block">
        <p className="font-pixel text-[8px] text-[#c9a46a]">TORNEIO</p>
        <p className="mt-1 font-pixel text-[11px] text-[#e0b070]">MCMLXXXVI</p>
      </div>

      {/* luminária pendurada */}
      <div className="absolute left-1/2 top-0 h-[7%] w-[2px] -translate-x-1/2 bg-[#2a2236]" />
      <div className="absolute left-1/2 top-[7%] h-3 w-14 -translate-x-1/2 rounded-b-full bg-[#3a3048]" />
      <div className="cone-luz absolute left-1/2 top-[8%] h-[92%] w-[80%] -translate-x-1/2" />
      {POEIRA.map(([x, y, d], i) => (
        <span key={i} className="poeira absolute h-[2px] w-[2px] bg-[#fff3d0]" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} />
      ))}

      <MaquinaVelha className="bottom-[9%] left-[-5%] h-[50%]" tela="estatica" />
      <MaquinaVelha className="bottom-[17%] left-[13%] hidden h-[37%] sm:block" tela="apagada" />
      <MaquinaVelha className="bottom-[9%] right-[-5%] h-[50%]" tela="apagada" />
      <MaquinaVelha className="bottom-[17%] right-[13%] hidden h-[37%] sm:block" tela="fraca" />

      <div className="carpete absolute inset-x-0 bottom-0 h-[34%]" />
      <div className="vinheta-pesada absolute inset-0" />
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${ligada ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'radial-gradient(ellipse at 50% 55%, rgb(78 240 220 / 0.25), transparent 50%)' }}
      />
    </div>
  );
}

// Grãos de poeira dentro do cone de luz: [x%, y%, atraso em s].
const POEIRA: [number, number, number][] = [
  [44, 20, 0],
  [52, 28, 1.2],
  [48, 40, 2.1],
  [57, 46, 0.6],
  [40, 52, 1.7],
  [61, 33, 2.8],
  [46, 62, 0.3],
  [55, 70, 1.4],
  [38, 74, 2.4],
  [63, 58, 3.1],
];

function MaquinaVelha({ className, tela }: { className: string; tela: 'estatica' | 'apagada' | 'fraca' }) {
  return (
    <div className={`maquina-velha absolute w-[19%] max-w-[150px] ${className}`}>
      <div className="mx-[8%] mt-[6%] h-[10%] bg-[#1a1226]" />
      <div className={`mx-[10%] mt-[8%] h-[32%] rounded-sm ${tela === 'estatica' ? 'tela-estatica' : tela === 'fraca' ? 'tela-fraca' : 'tela-apagada'}`} />
      <div className="mx-[6%] mt-[10%] h-[8%] bg-[#1c1430]" />
    </div>
  );
}

/** A máquina de fliperama, de frente: letreiro, tela, painel com controle e botões, porta da moeda. */
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
        <div className={`maquina-frente ${ligada ? 'ligada' : ''}`}>
          {/* letreiro */}
          <div className={`maquina-letreiro ${ligada ? 'aceso' : ''}`}>
            <span className="font-pixel">IMPERIUM ARCADE</span>
          </div>
          {/* tela */}
          <div className="maquina-moldura">
            <div ref={telaRef} className={`maquina-tela ${ligada ? 'ligada' : ''}`}>
              {ligada && (
                // Ao ligar: o logo do jogo e a barra de carregar; depois vem o zoom.
                <div className={`flex h-full flex-col items-center justify-center gap-[8%] px-[8%] ${fase === 'ligando' ? 'crt-linha' : ''}`}>
                  <p className="neon text-center font-pixel text-[8px] leading-snug text-accent sm:text-xs">
                    IMPERIUM
                    <br />
                    ARCADE
                  </p>
                  <div className="h-[8%] w-[80%] border-2 border-accent p-[2px]">
                    <div className="barra-carregar h-full bg-accent" />
                  </div>
                  <span className="font-pixel text-[5px] text-[rgb(242_193_78)] sm:text-[7px]">CARREGANDO · CRÉDITO 01</span>
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
