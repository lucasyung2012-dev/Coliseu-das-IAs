import { memo, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { inimigoQueViu, livre, marcarVisto, novoMundo, vencerInimigo, passoMundo, pertoDe, saidaAbertaMundo, type EntradaMundo, type EstadoMundo, type EstiloSaida, type Mundo, type TemaMundo } from '@/game/historia/mundo';
import type { Fala, Falante } from '@/game/historia/roteiro';
import Emote from '@/ui/pixel/Emotes';
import Icone from '@/ui/pixel/Icones';
import { desbloquear } from '@/ui/som';
import { tocar } from '@/ui/somHistoria';
import { INIMIGOS } from '@/game/historia/inimigos';
import { novaLuta } from '@/game/historia/luta';
import { Falas } from './Cenas';
import { larguraDoInimigo, SpriteInimigo } from './Luta';
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
  onCoisa, lutar }: {
  mundo: Mundo;
  heroi: Falante;
  onFim: () => void;
  onSegredo?: (id: string) => void;
  /** Coisa especial (o boneco de treino, a forja): se devolver true, não abre conversa. */
  onCoisa?: (id: string) => boolean;
  /** O duelo com um inimigo de ronda (sem isso, o mapa não tem ronda). Chama onVenceu quando ganhar. */
  lutar?: (inimigo: string, pelasCostas: boolean, onVenceu: () => void) => ReactNode;
}) {
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
  // O duelo com um inimigo de ronda: primeiro o "!" em cima dele, depois a luta.
  const [luta, setLuta] = useState<{ id: string; inimigo: string; pelasCostas: boolean; ja: boolean } | null>(null);
  const lutaRef = useRef(luta);
  lutaRef.current = luta;

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
        const novo = passoMundo(mundo, estado.current, entrada.current, dt, !!conversaRef.current || !!lutaRef.current);
        estado.current = novo;
        setS(novo);
        if (lutar && !conversaRef.current && !lutaRef.current) {
          const viu = inimigoQueViu(mundo, novo);
          if (viu) {
            tocar(viu.pelasCostas ? 'escudoMetal' : 'pergunta');
            const l = { ...viu, ja: false };
            lutaRef.current = l;
            setLuta(l);
            window.setTimeout(() => setLuta((x) => (x && x.id === l.id ? { ...x, ja: true } : x)), 750);
          }
        }
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

  if (luta?.ja && lutar)
    return (
      <>
        {lutar(luta.inimigo, luta.pelasCostas, () => {
          estado.current = vencerInimigo(estado.current, luta.id);
          setS(estado.current);
          lutaRef.current = null;
          setLuta(null);
        })}
      </>
    );
  return (
    <div className="flex flex-col gap-2">
      <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">
        {mundo.objetivo}{aberta && mundo.mapa.some((l) => l.includes('P')) ? ' · a saída está aberta' : ''}
      </p>
      <div className="area-jogo relative flex flex-col gap-2">
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
            ...mundo.pessoas.filter((p) => !(p.inimigo && s.vistos.includes(p.id))).map((p) => ({ id: p.id, quem: p.quem, ...s.pessoas[p.id]!, andando: false, inimigo: p.inimigo })),
            { id: '__heroi', quem: heroi, x: s.x, y: s.y, dir: s.dir, andando: s.andando, inimigo: undefined as string | undefined },
          ]
            .sort((a, b) => a.y - b.y)
            .map((p) => (
              <div key={p.id} className="absolute" style={{ ...emMundo(p.x, p.y), width: `${((p.inimigo ? Math.max(0.95, (1.15 * larguraDoInimigo(p.inimigo)) / 21) : 1.15 * escalaDe(p.quem)) / W) * 100}%`, transform: 'translate(-50%, -100%)', zIndex: 5 + Math.floor(p.y * 10) }}>
                <span className="absolute bottom-[-4%] left-1/2 h-[10%] w-[70%] -translate-x-1/2 rounded-[50%] bg-black/45" />
                <div className={p.andando || p.inimigo ? 'andar' : 'respirar'}>
                  {p.inimigo ? <InimigoNoMapa id={p.inimigo} espelhar={p.dir !== 'esq'} /> : <Retrato quem={p.quem} espelhar={p.dir === 'esq'} />}
                </div>
                {/* O inimigo que te pegou: o "!" bravo em cima dele */}
                {luta?.id === p.id && (
                  <span className="emote-pula absolute -top-[30%] left-1/2 block w-[45%] -translate-x-1/2">
                    <Emote emocao={luta.pelasCostas ? 'surpreso' : 'bravo'} />
                  </span>
                )}
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
          {/* O olhar de cada inimigo de ronda: um leque vermelho na frente dele (fora do leque, dá para passar) */}
          {mundo.pessoas
            .filter((p) => p.inimigo && !s.vistos.includes(p.id))
            .map((p) => {
              const at = s.pessoas[p.id]!;
              const ang = { dir: 0, baixo: 90, esq: 180, cima: 270 }[at.dir];
              return (
                <span
                  key={`cone-${p.id}`}
                  className="cone-olhar pointer-events-none absolute block origin-left"
                  style={{ ...emMundo(at.x, at.y - 0.4), width: `${(3 / W) * 100}%`, height: `${(2.9 / H) * 100}%`, translate: '0 -50%', rotate: `${ang}deg`, zIndex: 4 }}
                  aria-hidden
                />
              );
            })}
          {/* A saída: placa "SAÍDA" em cima; aberta, brilha e uma seta fica pulando */}
          {saidas.map(([x, y]) => (
            <div key={`${x}-${y}`} className="absolute" style={{ ...emMundo(x, y), width: `${(1 / W) * 100}%`, height: `${(1 / H) * 100}%`, zIndex: 250 }}>
              <span className={`absolute inset-0 block ${aberta ? 'saida-brilha' : ''}`} />
              <span className={`placa-ponto absolute -top-[95%] left-1/2 -translate-x-1/2 whitespace-nowrap px-1 font-pixel text-[6px] sm:text-[8px] ${aberta ? '' : 'vista'}`}>{mundo.saida?.rotulo ?? 'SAÍDA'}</span>
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
          {/* Coisa para examinar que fica no chão (não num móvel): um brilhinho, para dar para achar */}
          {mundo.coisas
            .filter((c) => !c.segredo && !s.vistos.includes(c.id) && livre(mundo, c.x + 0.5, c.y + 0.8))
            .map((c) => (
              <span
                key={`br-${c.id}`}
                className="brilho-coisa absolute block rotate-45 bg-[#fff4c0] shadow-[0_0_6px_#ffd04a]"
                style={{ ...emMundo(c.x + 0.5, c.y + 0.5), width: `${(0.18 / W) * 100}%`, aspectRatio: '1', translate: '-50% -50%', zIndex: 240 }}
                aria-hidden
              />
            ))}
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
          <span className="aviso-saida placa-ponto pointer-events-none absolute left-1/2 top-[8%] z-[460] whitespace-nowrap px-2 py-1 font-pixel text-[9px] sm:text-xs" style={{ translate: '-50% 0' }} aria-live="polite">
            SIGA A SETA: {mundo.saida?.rotulo ?? 'SAÍDA'}
          </span>
        )}
        {/* Sem lugar de saída: depois de ver o que precisa, um botão para seguir a história (dá para continuar andando) */}
        {aberta && saidas.length === 0 && mundo.saida && !conversa && !acabou && (
          <button
            type="button"
            onClick={() => {
              desbloquear();
              tocar('portao');
              setAcabou(true);
              window.setTimeout(onFim, 300);
            }}
            className="botao-seguir pixel-box absolute bottom-[4%] right-[3%] z-[460] px-3 py-2 font-pixel text-[9px] text-[#f2c14e] sm:text-xs"
          >
            <span className="inline-flex items-center gap-1">{mundo.saida.rotulo} <Icone nome="dir" className="w-3 sm:w-4" /></span>
          </button>
        )}
        {/* A luz: escuro em volta, como uma noite de verdade */}
        <div
          className="pointer-events-none absolute inset-0 z-[400]"
          style={{ background: `radial-gradient(ellipse at 50% 55%, transparent ${mundo.tema === 'catacumbas' ? 28 : 45}%, rgba(4,2,12,${mundo.claro ? 0.12 : Math.min(0.9, CORES[mundo.tema].escuro + (mundo.lugar.includes('noite') || mundo.lugar.includes('eclipse') || mundo.lugar.includes('ataque') ? 0.35 : 0))}) 100%)` }}
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
      </div>
      <p className="dica-teclado text-center text-[10px] text-muted">Teclado: setas ou WASD para andar · E, Z ou espaço para interagir</p>
    </div>
  );
}

type PropsSeta = { onPointerDown: (ev: PointerEvent) => void; onPointerUp: () => void; onPointerCancel: () => void; onContextMenu: (ev: MouseEvent) => void };

export function BotaoSeta({ nome, props }: { nome: string; props: PropsSeta }) {
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
  porto: { chao1: '#7a5634', chao2: '#6e4c2c', parede1: '#2a2018', parede2: '#342a20', face: '#4a3a2a', faceTopo: '#6a5438', escuro: 0.5 },
  navio: { chao1: '#6a4a2a', chao2: '#5e4224', parede1: '#2a1a0e', parede2: '#342214', face: '#4a301a', faceTopo: '#6a4a2a', escuro: 0.6 },
  mercado: { chao1: '#7a6e5e', chao2: '#726656', parede1: '#3a2e24', parede2: '#44362a', face: '#5a4a3a', faceTopo: '#7a6650', escuro: 0.4 },
  observatorio: { chao1: '#4a4a5e', chao2: '#444458', parede1: '#1a1a2e', parede2: '#22223a', face: '#3a3a52', faceTopo: '#5a5a78', escuro: 0.45 },
  telhados: { chao1: '#9a4a32', chao2: '#8a422c', parede1: '#2a2030', parede2: '#342838', face: '#4a3a48', faceTopo: '#6a5868', escuro: 0.55 },
  aqueduto: { chao1: '#a8a08c', chao2: '#9e9682', parede1: '#2a3a6a', parede2: '#34447a', face: '#8a826e', faceTopo: '#b8ae98', escuro: 0.3 },
  templo: { chao1: '#d8ccb4', chao2: '#cec2aa', parede1: '#6a5e4c', parede2: '#746856', face: '#b8ac94', faceTopo: '#e0d4bc', escuro: 0.4 },
  arena: { chao1: '#c8a870', chao2: '#c0a068', parede1: '#5a4a38', parede2: '#645240', face: '#8a7a64', faceTopo: '#a89880', escuro: 0.25 },
};

/** O inimigo de ronda no mapa: o mesmo desenho da luta, parado (feito uma vez só). */
const InimigoNoMapa = memo(function InimigoNoMapa({ id, espelhar }: { id: string; espelhar: boolean }) {
  const e = useMemo(() => novaLuta(INIMIGOS[id]!), [id]);
  return (
    <div style={{ transform: espelhar ? undefined : 'scaleX(-1)', filter: 'drop-shadow(0 0 2px #ff5a3a) drop-shadow(0 1px 0 #000)' }}>
      <SpriteInimigo e={e} />
    </div>
  );
});

/** Cada saída do seu jeito (22/11/2026): escada, arco de pedra, portão, prancha, escada de mão, grade e porta. */
function DesenhoSaida({ estilo, X, Y }: { estilo: EstiloSaida; X: number; Y: number }) {
  switch (estilo) {
    case 'arco':
      // Arco de pedra com a passagem escura e uma tocha do lado.
      return (
        <g>
          <rect x={X} y={Y - 10} width={PX} height={PX + 10} fill="#6a5a4a" />
          <rect x={X + 1} y={Y - 10} width={PX - 2} height="2" fill="#8a7a66" />
          <rect x={X + 3} y={Y - 6} width="10" height="22" fill="#0a0806" />
          <rect x={X + 4} y={Y - 8} width="8" height="2" fill="#0a0806" />
          <rect x={X + 5} y={Y - 9} width="6" height="1" fill="#0a0806" />
          {[-4, 2, 8].map((r) => (
            <rect key={r} x={X} y={Y + r} width="3" height="1" fill="#4a3e32" />
          ))}
          <rect x={X + 14} y={Y - 4} width="1.5" height="5" fill="#5a3a1c" />
          <rect x={X + 13.5} y={Y - 7} width="2.5" height="3" fill="#ffb03a" className="chama-vela" />
        </g>
      );
    case 'portao':
      // Portão de madeira de duas folhas, com cintas de ferro e argolas.
      return (
        <g>
          <rect x={X} y={Y - 10} width={PX} height={PX + 10} fill="#3a2e24" />
          <rect x={X + 1} y={Y - 8} width="7" height="24" fill="#6a4220" />
          <rect x={X + 8} y={Y - 8} width="7" height="24" fill="#5a3818" />
          {[-4, 6].map((r) => (
            <rect key={r} x={X + 1} y={Y + r} width="14" height="1.5" fill="#3a3a44" />
          ))}
          <circle cx={X + 6.5} cy={Y + 2} r="1.2" fill="none" stroke="#8a8a98" strokeWidth="0.8" />
          <circle cx={X + 9.5} cy={Y + 2} r="1.2" fill="none" stroke="#8a8a98" strokeWidth="0.8" />
          <rect x={X + 7.6} y={Y - 8} width="0.8" height="24" fill="#2a1a0e" />
        </g>
      );
    case 'prancha':
      // A prancha de embarque: tábuas subindo para o navio, com as cordas dos lados.
      return (
        <g>
          {[0, 1, 2, 3, 4].map((d) => (
            <rect key={d} x={X + 3} y={Y + 13 - d * 3.6} width="10" height="3" fill={d % 2 ? '#8a6438' : '#9a7444'} />
          ))}
          <rect x={X + 2} y={Y - 6} width="1" height="22" fill="#c8b890" />
          <rect x={X + 13} y={Y - 6} width="1" height="22" fill="#c8b890" />
          <rect x={X + 1.5} y={Y - 7} width="2" height="2" fill="#5a3a1c" />
          <rect x={X + 12.5} y={Y - 7} width="2" height="2" fill="#5a3a1c" />
        </g>
      );
    case 'escadaMao':
      // Escada de mão subindo para a escotilha aberta, com a luz do convés lá em cima.
      return (
        <g>
          <rect x={X + 2} y={Y - 14} width="12" height="5" fill="#ffe8a0" opacity="0.85" />
          <rect x={X + 1} y={Y - 15} width="14" height="1.5" fill="#4a2a12" />
          <rect x={X + 4} y={Y - 12} width="1.5" height="28" fill="#8a6438" />
          <rect x={X + 10.5} y={Y - 12} width="1.5" height="28" fill="#8a6438" />
          {[-8, -4, 0, 4, 8, 12].map((r) => (
            <rect key={r} x={X + 4} y={Y + r} width="8" height="1.2" fill="#a87a44" />
          ))}
        </g>
      );
    case 'grade':
      // A grade de ferro do portão da arena, meio levantada, com a luz da arena atrás.
      return (
        <g>
          <rect x={X} y={Y - 10} width={PX} height={PX + 10} fill="#f0c878" opacity="0.5" />
          <rect x={X} y={Y - 10} width={PX} height="3" fill="#4a3e32" />
          {[1, 5, 9, 13].map((b) => (
            <rect key={b} x={X + b} y={Y - 8} width="2" height="14" fill="#4a4a54" />
          ))}
          <rect x={X} y={Y - 2} width={PX} height="2" fill="#3a3a44" />
          {[1, 5, 9, 13].map((b) => (
            <rect key={`p${b}`} x={X + b + 0.5} y={Y + 6} width="1" height="2" fill="#4a4a54" />
          ))}
        </g>
      );
    case 'porta':
      // Porta de madeira com a janelinha redonda e as estrelas lá fora.
      return (
        <g>
          <rect x={X} y={Y - 10} width={PX} height={PX + 10} fill="#2a2a3e" />
          <rect x={X + 2} y={Y - 8} width="12" height="24" fill="#6a4220" />
          <rect x={X + 2} y={Y - 8} width="12" height="1.5" fill="#8a5a2a" />
          <circle cx={X + 8} cy={Y - 2} r="3" fill="#14204a" stroke="#c8a050" strokeWidth="0.8" />
          <rect x={X + 7} y={Y - 3} width="1" height="1" fill="#fff4c0" />
          <rect x={X + 9} y={Y - 1} width="0.8" height="0.8" fill="#fff4c0" />
          <rect x={X + 11} y={Y + 5} width="1.5" height="1.5" fill="#c8a050" />
        </g>
      );
    default:
      // A escada que desce: degraus escurecendo.
      return (
        <g>
          {[0, 1, 2, 3].map((d) => (
            <rect key={d} x={X + 1 + d} y={Y + 2 + d * 3.4} width={PX - 2 - d * 2} height="3" fill={['#3a2e26', '#2e241c', '#221a14', '#16100c'][d]} />
          ))}
          <rect x={X} y={Y} width="1" height={PX} fill="#6a5a4a" />
          <rect x={X + PX - 1} y={Y} width="1" height={PX} fill="#6a5a4a" />
        </g>
      );
  }
}

/**
 * O mapa desenhado em pixel, ladrilho por ladrilho (feito uma vez só: memo). Cada ladrilho
 * tem o seu desenho: pedra, tapete com borda dourada, parede com tijolos e a face de frente,
 * janela com a lua, estante com livros coloridos, mesa, coluna, castiçal, estátua e a escada.
 */
export const MapaDesenhado = memo(function MapaDesenhado({ mundo }: { mundo: Mundo }) {
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
      const tabuas = (cor1: string, cor2: string, chave: string) => (
        // Tábuas de madeira (cais, convés, jangada): quatro tábuas por ladrilho, emendas e pregos.
        <g key={chave}>
          <rect x={X} y={Y} width={PX} height={PX} fill={cor1} />
          {[0, 1, 2, 3].map((r) => (
            <g key={r}>
              <rect x={X} y={Y + r * 4 + 3} width={PX} height="1" fill={cor2} />
              <rect x={X + ((x * 5 + r * 7) % 14)} y={Y + r * 4} width="1" height="3" fill={cor2} />
              <rect x={X + ((x * 3 + r * 5) % 12) + 2} y={Y + r * 4 + 1} width="1" height="1" fill="#2a1a0e" opacity="0.6" />
            </g>
          ))}
        </g>
      );
      const chao = (cor1: string, cor2: string) => {
        if (mundo.tema === 'porto' || mundo.tema === 'navio') return tabuas(cor1, cor2, `c${k}`);
        if (mundo.tema === 'telhados')
          // Telhas de barro em fileiras, cada fileira deslocada.
          return (
            <g key={`c${k}`}>
              <rect x={X} y={Y} width={PX} height={PX} fill={cor1} />
              {[0, 1, 2, 3].map((r) => (
                <g key={r}>
                  <rect x={X} y={Y + r * 4 + 3} width={PX} height="1" fill="#5a2418" />
                  {[0, 1].map((j) => (
                    <rect key={j} x={X + j * 8 + (r % 2) * 4} y={Y + r * 4} width="1" height="4" fill="#6a2a1c" />
                  ))}
                  <rect x={X + 1 + (r % 2) * 4} y={Y + r * 4} width="3" height="1" fill="#c86a48" opacity="0.6" />
                </g>
              ))}
            </g>
          );
        if (mundo.tema === 'arena')
          return (
            <g key={`c${k}`}>
              <rect x={X} y={Y} width={PX} height={PX} fill={cor1} />
              <rect x={X + ((x * 5 + y * 3) % 12)} y={Y + ((x * 7 + y) % 12)} width="2" height="1" fill={cor2} />
              <rect x={X + ((x * 3 + y * 7) % 13)} y={Y + ((x + y * 5) % 13)} width="1" height="1" fill="#e8cc90" />
            </g>
          );
        return (
          <g key={`c${k}`}>
            <rect x={X} y={Y} width={PX} height={PX} fill={cor1} />
            <rect x={X + ((x + y) % 2) * 8} y={Y + (y % 2) * 8} width="8" height="8" fill={cor2} />
            <rect x={X} y={Y + PX - 1} width={PX} height="1" fill="#3a2e26" opacity="0.5" />
          </g>
        );
      };
      if ('.PTSpvftgxMDFbkrqAUOhQYZLzlueRji12345678y*&'.includes(c)) fundo.push(chao(cor.chao1, cor.chao2));
      // Água (cais, aqueduto, arena inundada): fundo azul com ondinhas e a espuma na beirada.
      if (c === 'w' || c === 'n' || c === 'H')
        fundo.push(
          <g key={`w${k}`}>
            <rect x={X} y={Y} width={PX} height={PX} fill="#1a3a6a" />
            <rect className="agua-onda" x={X + ((x * 5 + y * 3) % 10)} y={Y + 4} width="4" height="1" fill="#4a7ab8" />
            <rect className="agua-onda" style={{ animationDelay: `${((x + y) % 4) * 300}ms` }} x={X + ((x * 3 + y * 7) % 9) + 3} y={Y + 10} width="5" height="1" fill="#3a6aa8" />
            {!'wnH'.includes(t(x, y - 1)) && <rect x={X} y={Y} width={PX} height="2" fill="#a8d0f0" opacity="0.7" />}
          </g>,
        );
      // A jangada: tábuas.
      if (c === 'd') fundo.push(tabuas('#8a6438', '#6a4a28', `d${k}`));
      // O mosaico do templo: pastilhas coloridas.
      if (c === 'Z')
        pecas.push(
          <g key={`z${k}`}>
            {[0, 1, 2, 3].map((q) => (
              <rect key={q} x={X + (q % 2) * 8 + 1} y={Y + Math.floor(q / 2) * 8 + 1} width="6" height="6" fill={['#2a6aa0', '#c0583a', '#d8a83a', '#3a8a6a'][(x + y + q) % 4]} />
            ))}
          </g>,
        );
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
      if ('#JNoCKWIG9s'.includes(c)) {
        const frente = !'#JENoCKWIG9sVBX'.includes(t(x, y + 1));
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
                <rect x={X + 2} y={Y - 4} width="12" height="17" fill={mundo.claro ? '#8ac8f0' : '#141c40'} />
                <rect x={X + 4} y={Y - 6} width="8" height="2" fill={mundo.claro ? '#8ac8f0' : '#141c40'} />
                <rect x={X + 2} y={Y + 6} width="12" height="7" fill={mundo.claro ? '#b8e0f8' : '#1c2a58'} />
                {mundo.claro && x % 3 === 1 && <circle cx={X + 10} cy={Y - 1} r="2.5" fill="#fff4a0" />}
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
          luzes.push(<path key={`l${k}`} d={`M${X + 4} ${Y + 13} L${X + 12} ${Y + 13} L${X + 22} ${Y + 52} L${X + 6} ${Y + 52} Z`} fill={mundo.claro ? '#fff0a0' : '#bcd4ff'} opacity={mundo.claro ? 0.28 : 0.13} className="luz-lua" />);
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
            {/* no Fórum, a estátua é a do Censor: capuz vermelho por cima do elmo */}
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
      // ---- A frota fantasma (22/11/2026): névoa no chão e lanternas verdes de navio ----
      if (c === '&')
        pecas.push(
          <g key={`nv${k}`} className="nevoa-mapa" opacity="0.35">
            <ellipse cx={X + 8} cy={Y + 10} rx="11" ry="4" fill="#d8e0e8" />
            <ellipse cx={X + 3} cy={Y + 7} rx="6" ry="2.5" fill="#e8f0f8" />
          </g>,
        );
      if (c === '*') {
        pecas.push(
          <g key={`lv2${k}`}>
            <rect x={X + 7} y={Y - 12} width="2" height="26" fill="#2a2a34" />
            <rect x={X + 2} y={Y - 12} width="7" height="1.5" fill="#2a2a34" />
            <rect x={X + 1} y={Y - 10} width="4" height="6" fill="#6aff9a" stroke="#1a3a2a" strokeWidth="0.8" className="luz-vela" />
          </g>,
        );
        luzes.push(<circle key={`lvl${k}`} cx={X + 3} cy={Y - 7} r="24" fill="#6aff9a" opacity="0.16" className="luz-vela" />);
      }
      // ---- O porão da galera (22/11/2026): portinholas, grilhões e redes de dormir ----
      // Portinhola do remo: um buraco na parede com o mar e a luz entrando.
      if (c === 's') {
        pecas.push(
          <g key={`pt${k}`}>
            <rect x={X + 4} y={Y + 3} width="8" height="6" fill="#4a7ab8" />
            <rect x={X + 4} y={Y + 7} width="8" height="2" fill="#2a4a7a" />
            <rect x={X + 3} y={Y + 2} width="10" height="1.5" fill="#3a2010" />
            <rect x={X + 7.5} y={Y + 3} width="1" height="12" fill="#a8844a" transform={`rotate(15 ${X + 8} ${Y + 6})`} />
          </g>,
        );
        luzes.push(<path key={`pl${k}`} d={`M${X + 4} ${Y + 9} L${X + 12} ${Y + 9} L${X + 16} ${Y + 30} L${X} ${Y + 30} Z`} fill="#bcd8ff" opacity="0.14" />);
      }
      // Grilhões presos na parede.
      if (c === '9')
        pecas.push(
          <g key={`gr2${k}`} stroke="#8a8a98" strokeWidth="1" fill="none">
            <path d={`M${X + 4} ${Y + 2} L${X + 4} ${Y + 7} M${X + 12} ${Y + 2} L${X + 12} ${Y + 7}`} />
            <circle cx={X + 4} cy={Y + 8.5} r="1.6" />
            <circle cx={X + 12} cy={Y + 8.5} r="1.6" />
          </g>,
        );
      // Rede de dormir pendurada (de lona, entre dois ganchos).
      if (c === 'y')
        pecas.push(
          <g key={`hm${k}`}>
            <path d={`M${X} ${Y + 2} Q${X + 8} ${Y + 12} ${X + 16} ${Y + 2}`} fill="#c8b890" stroke="#8a7a5a" strokeWidth="1" />
            {t(x - 1, y) !== 'y' && <rect x={X} y={Y - 2} width="1.5" height="16" fill="#5a3a1c" />}
            {t(x + 1, y) !== 'y' && <rect x={X + 14.5} y={Y - 2} width="1.5" height="16" fill="#5a3a1c" />}
          </g>,
        );
      // ---- O porto de Óstia (22/11/2026): guindaste, rede de pesca, âncora e lampião ----
      // O guindaste de madeira: torre, braço e o gancho pendurado.
      if (c === '5')
        pecas.push(
          <g key={`gd${k}`}>
            <rect x={X + 6} y={Y - 22} width="4" height="36" fill="#6a4220" />
            <rect x={X + 4} y={Y + 10} width="8" height="4" fill="#4a2a14" />
            <rect x={X - 8} y={Y - 22} width="26" height="3" fill="#7a5430" />
            <rect x={X - 6} y={Y - 19} width="1" height="14" fill="#c8b890" />
            <rect x={X - 8} y={Y - 6} width="5" height="2" fill="#8a8a98" />
            <rect x={X - 7} y={Y - 4} width="1.5" height="3" fill="#8a8a98" />
            <rect x={X + 8} y={Y - 19} width="10" height="1" fill="#c8b890" transform={`rotate(35 ${X + 8} ${Y - 19})`} />
          </g>,
        );
      // A rede de pesca secando entre dois postes.
      if (c === '6')
        pecas.push(
          <g key={`rd${k}`}>
            {t(x - 1, y) !== '6' && <rect x={X + 1} y={Y - 6} width="2" height="20" fill="#5a3a1c" />}
            {t(x + 1, y) !== '6' && <rect x={X + 13} y={Y - 6} width="2" height="20" fill="#5a3a1c" />}
            <rect x={X} y={Y - 5} width={PX} height="1" fill="#8a6a3a" />
            {[0, 1, 2, 3].map((r) => (
              <rect key={`h${r}`} x={X} y={Y - 2 + r * 3} width={PX} height="0.6" fill="#c8b890" opacity="0.8" />
            ))}
            {[2, 6, 10, 14].map((c2) => (
              <rect key={`v${c2}`} x={X + c2} y={Y - 4} width="0.6" height="13" fill="#c8b890" opacity="0.8" />
            ))}
          </g>,
        );
      // A âncora de ferro e o rolo de corda.
      if (c === '7')
        pecas.push(
          <g key={`an${k}`}>
            <circle cx={X + 11} cy={Y + 10} r="4" fill="none" stroke="#c8b890" strokeWidth="2" />
            <rect x={X + 4} y={Y - 4} width="2" height="15" fill="#4a4a54" />
            <rect x={X + 1} y={Y - 1} width="8" height="1.5" fill="#4a4a54" />
            <circle cx={X + 5} cy={Y - 5} r="1.6" fill="none" stroke="#4a4a54" strokeWidth="1" />
            <path d={`M${X} ${Y + 9} Q${X + 5} ${Y + 15} ${X + 10} ${Y + 9}`} fill="none" stroke="#4a4a54" strokeWidth="2" />
          </g>,
        );
      // O lampião no poste, com a luz em volta.
      if (c === '8') {
        pecas.push(
          <g key={`lp${k}`}>
            <rect x={X + 7} y={Y - 10} width="2" height="24" fill="#3a3a44" />
            <rect x={X + 5} y={Y - 14} width="6" height="5" fill="#ffd04a" stroke="#3a3a44" strokeWidth="1" className="luz-vela" />
            <rect x={X + 4} y={Y - 15} width="8" height="1.5" fill="#3a3a44" />
          </g>,
        );
        luzes.push(<circle key={`ll${k}`} cx={X + 8} cy={Y - 11} r="26" fill="#ffd04a" opacity="0.2" className="luz-vela" />);
      }
      // Vaso de flores (a Biblioteca reaberta).
      if (c === '4')
        pecas.push(
          <g key={`vs${k}`}>
            <rect x={X + 4} y={Y + 6} width="8" height="8" fill="#b8643a" />
            <rect x={X + 3} y={Y + 5} width="10" height="2" fill="#d8844a" />
            <rect x={X + 7.3} y={Y - 2} width="1.4" height="8" fill="#3a8a4a" />
            <rect x={X + 4} y={Y} width="1.2" height="6" fill="#3a8a4a" transform={`rotate(-20 ${X + 5} ${Y + 6})`} />
            <rect x={X + 11} y={Y} width="1.2" height="6" fill="#3a8a4a" transform={`rotate(20 ${X + 11} ${Y + 6})`} />
            <circle cx={X + 8} cy={Y - 3} r="2.2" fill="#f0c040" />
            <circle cx={X + 3.5} cy={Y} r="1.8" fill="#e05a8a" />
            <circle cx={X + 12.5} cy={Y} r="1.8" fill="#8a6ad8" />
          </g>,
        );
      // ---- O túnel dos gladiadores (22/11/2026): armas, banco e o balde de água do Brutus ----
      // Suporte de armas: lanças em pé e um escudo redondo pendurado.
      if (c === '1')
        pecas.push(
          <g key={`ar1${k}`}>
            <rect x={X + 1} y={Y + 10} width="14" height="2" fill="#6a4220" />
            <rect x={X + 1} y={Y - 2} width="14" height="2" fill="#6a4220" />
            {[3, 7, 11].map((px) => (
              <g key={px}>
                <rect x={X + px} y={Y - 10} width="1.2" height="23" fill="#8a6a3a" />
                <rect x={X + px - 0.8} y={Y - 13} width="2.8" height="4" fill="#c8c8d0" />
              </g>
            ))}
            {x % 2 === 0 && (
              <>
                <circle cx={X + 8} cy={Y + 5} r="4.5" fill="#a8742a" />
                <circle cx={X + 8} cy={Y + 5} r="1.5" fill="#e0b870" />
              </>
            )}
          </g>,
        );
      // Banco de madeira dos gladiadores.
      if (c === '2')
        pecas.push(
          <g key={`bc${k}`}>
            <rect x={X} y={Y + 5} width={PX} height="4" fill="#7a5430" />
            <rect x={X} y={Y + 5} width={PX} height="1" fill="#a87a44" />
            {t(x - 1, y) !== '2' && <rect x={X + 1} y={Y + 9} width="2" height="5" fill="#4a2a12" />}
            {t(x + 1, y) !== '2' && <rect x={X + 13} y={Y + 9} width="2" height="5" fill="#4a2a12" />}
          </g>,
        );
      // O balde de água fria do Brutus.
      if (c === '3')
        pecas.push(
          <g key={`bd${k}`}>
            <ellipse cx={X + 8} cy={Y + 14} rx="6" ry="1.5" fill="#000" opacity="0.3" />
            <rect x={X + 3} y={Y + 3} width="10" height="11" fill="#6a4a2a" />
            <rect x={X + 3} y={Y + 5} width="10" height="1.2" fill="#3a3a44" />
            <rect x={X + 3} y={Y + 11} width="10" height="1.2" fill="#3a3a44" />
            <ellipse cx={X + 8} cy={Y + 3.5} rx="5" ry="1.6" fill="#4a7ab8" />
            <path d={`M${X + 3} ${Y + 3} Q${X + 8} ${Y - 5} ${X + 13} ${Y + 3}`} fill="none" stroke="#3a3a44" strokeWidth="0.8" />
          </g>,
        );
      // ---- O Fórum (22/11/2026): a tribuna, o povo e os estandartes do Censor ----
      // A tribuna (2 × 2): plataforma de pedra com degraus, grade de bronze e as proas de navio.
      if (c === 'R' && t(x - 1, y) !== 'R' && t(x, y - 1) !== 'R')
        pecas.push(
          <g key={`ro${k}`}>
            <ellipse cx={X + 16} cy={Y + 31} rx="16" ry="2.5" fill="#000" opacity="0.3" />
            <rect x={X} y={Y + 4} width="32" height="20" fill="#d8ccb4" />
            <rect x={X} y={Y + 4} width="32" height="3" fill="#f0e6d0" />
            <rect x={X} y={Y + 18} width="32" height="6" fill="#b8ac94" />
            {[0, 1, 2].map((d) => (
              <rect key={d} x={X + 10 - d * 2} y={Y + 24 + d * 2.5} width={12 + d * 4} height="2.5" fill={['#c8bca4', '#b8ac94', '#a89c84'][d]} />
            ))}
            {[2, 9, 23, 30].map((px) => (
              <rect key={px} x={X + px - 1} y={Y - 2} width="1.5" height="7" fill="#a8742a" />
            ))}
            <rect x={X + 1} y={Y - 2} width="30" height="1.5" fill="#c8943a" />
            {[5, 25].map((px) => (
              <g key={`pr${px}`}>
                <rect x={X + px - 3} y={Y + 10} width="6" height="5" fill="#a8742a" />
                <rect x={X + px - 1} y={Y + 15} width="2" height="3" fill="#8a5a22" />
              </g>
            ))}
          </g>,
        );
      // O povo do Fórum: três pessoas juntas, cada uma de uma cor.
      if (c === 'j')
        pecas.push(
          <g key={`pv${k}`}>
            {[0, 1, 2].map((p) => (
              <g key={p}>
                <rect x={X + 1 + p * 5} y={Y + 3 + (p % 2) * 2} width="4" height="9" fill={['#2a6aa0', '#c0583a', '#3a8a4a', '#8a3aa0', '#d8a83a'][(x + y + p) % 5]} />
                <rect x={X + 1.5 + p * 5} y={Y - 1 + (p % 2) * 2} width="3" height="4" fill={['#e8c8a0', '#c89a70', '#8a5a3a'][(x + p) % 3]} />
                <rect x={X + 1.5 + p * 5} y={Y - 1.5 + (p % 2) * 2} width="3" height="1.5" fill="#3a2414" />
              </g>
            ))}
          </g>,
        );
      // O estandarte do Censor: mastro e o pano vermelho com o Olho.
      if (c === 'i')
        pecas.push(
          <g key={`ec${k}`}>
            <rect x={X + 7} y={Y - 12} width="1.5" height="26" fill="#6a4220" />
            <rect x={X + 3} y={Y - 10} width="10" height="14" fill="#a81a1a" />
            <rect x={X + 3} y={Y + 4} width="3" height="2" fill="#a81a1a" />
            <rect x={X + 10} y={Y + 4} width="3" height="2" fill="#a81a1a" />
            <ellipse cx={X + 8} cy={Y - 4} rx="3.5" ry="2" fill="#f0e6d0" />
            <circle cx={X + 8} cy={Y - 4} r="1.2" fill="#c0283c" />
          </g>,
        );
      // ---- As catacumbas (22/11/2026): páginas escritas à mão nas paredes, sarcófagos, crânios,
      // poças d'água, teias de aranha e os livros escondidos no Arquivo. ----
      // Página de livro copiada à mão na parede (os Copistas escrevem entre os ossos).
      if (c === 'G')
        pecas.push(
          <g key={`pg${k}`}>
            <rect x={X + 2} y={Y + 1} width="12" height="9" fill="#d8c8a0" transform={`rotate(${(x % 3) - 1} ${X + 8} ${Y + 5})`} />
            {[3, 5, 7].map((r) => (
              <rect key={r} x={X + 3.5} y={Y + r} width={7 + ((x + r) % 3)} height="0.8" fill="#3a2a1a" opacity="0.8" />
            ))}
            <rect x={X + 11} y={Y + 6} width="1" height="3" fill="#1a1a1a" transform={`rotate(30 ${X + 11} ${Y + 6})`} />
          </g>,
        );
      // Sarcófago de pedra, com a tampa entalhada.
      if (c === 'L')
        pecas.push(
          <g key={`sf${k}`}>
            <ellipse cx={X + 8} cy={Y + 15} rx="7" ry="1.5" fill="#000" opacity="0.35" />
            <rect x={X + 1} y={Y - 3} width="14" height="17" fill="#6a6258" />
            <rect x={X + 1} y={Y - 4} width="14" height="4" fill="#8a8276" />
            <rect x={X + 7} y={Y + 1} width="2" height="9" fill="#4a443c" />
            <rect x={X + 4} y={Y + 3} width="8" height="2" fill="#4a443c" />
            <rect x={X + 1} y={Y + 12} width="14" height="2" fill="#4a443c" />
          </g>,
        );
      // Pilha de crânios.
      if (c === 'z')
        pecas.push(
          <g key={`cr${k}`}>
            {[
              [2, 9],
              [7, 9],
              [12, 9],
              [4.5, 4],
              [9.5, 4],
              [7, -1],
            ].map(([a, b], j) => (
              <g key={j}>
                <rect x={X + a!} y={Y + b!} width="4" height="4" fill="#e8dcc0" />
                <rect x={X + a! + 0.6} y={Y + b! + 1.4} width="1" height="1" fill="#2a2018" />
                <rect x={X + a! + 2.4} y={Y + b! + 1.4} width="1" height="1" fill="#2a2018" />
              </g>
            ))}
          </g>,
        );
      // Poça d'água no chão (dá para pisar), com o brilho da tocha.
      if (c === 'u')
        pecas.push(
          <g key={`po${k}`}>
            <ellipse cx={X + 8} cy={Y + 9} rx="7" ry="4" fill="#14202e" opacity="0.85" />
            <ellipse className="agua-onda" cx={X + 6} cy={Y + 8} rx="2.5" ry="0.8" fill="#6a8ab0" opacity="0.6" />
          </g>,
        );
      // Teia de aranha no canto.
      if (c === 'e')
        pecas.push(
          <g key={`te${k}`} stroke="#e8e8f0" strokeWidth="0.4" opacity="0.45" fill="none">
            <path d={`M${X} ${Y} L${X + 10} ${Y + 10} M${X} ${Y} L${X + 12} ${Y + 3} M${X} ${Y} L${X + 3} ${Y + 12}`} />
            <path d={`M${X + 4} ${Y + 1} Q${X + 4} ${Y + 4} ${X + 1} ${Y + 4} M${X + 8} ${Y + 2} Q${X + 7} ${Y + 7} ${X + 2} ${Y + 8}`} />
          </g>,
        );
      // Pilha de livros escondidos (o Arquivo do Censor).
      if (c === 'l')
        pecas.push(
          <g key={`lv${k}`}>
            {['#c0283c', '#2a6aa0', '#d8a83a', '#3a8a4a'].map((cor2, j) => (
              <rect key={j} x={X + 2 + (j % 2)} y={Y + 10 - j * 4} width={12 - (j % 2) * 2} height="3.5" fill={cor2} stroke="#1a0a04" strokeWidth="0.5" />
            ))}
          </g>,
        );
      // ---- Peças novas (22/11/2026): os mapas do Octavius e do Helios ----
      // Cartaz do Censor na parede: o olho vermelho.
      if (c === 'C')
        pecas.push(
          <g key={`cz${k}`}>
            <rect x={X + 3} y={Y + 1} width="10" height="9" fill="#e8d8b0" />
            <rect x={X + 3} y={Y + 1} width="10" height="1" fill="#b8a880" />
            <rect x={X + 5} y={Y + 4} width="6" height="3" fill="#c0283c" />
            <rect x={X + 7} y={Y + 5} width="2" height="1" fill="#1a0a0a" />
            <rect x={X + 4} y={Y + 8} width="8" height="1" fill="#6a5a4a" />
          </g>,
        );
      // Mapa do céu pendurado: constelações em azul-escuro.
      if (c === 'K')
        pecas.push(
          <g key={`kc${k}`}>
            <rect x={X + 1} y={Y} width="14" height="11" fill="#c8a050" />
            <rect x={X + 2} y={Y + 1} width="12" height="9" fill="#14204a" />
            {[
              [4, 3],
              [7, 5],
              [11, 3],
              [9, 8],
              [4, 7],
            ].map(([a, b], j) => (
              <rect key={j} x={X + a!} y={Y + b!} width="1" height="1" fill="#fff4c0" />
            ))}
            <rect x={X + 4} y={Y + 4} width="4" height="0.5" fill="#8ab8ff" opacity="0.7" />
            <rect x={X + 8} y={Y + 4} width="3" height="0.5" fill="#8ab8ff" opacity="0.7" />
          </g>,
        );
      // Janela acesa de uma casa (os telhados de Roma).
      if (c === 'W') {
        pecas.push(
          <g key={`wj${k}`}>
            <rect x={X + 4} y={Y + 1} width="8" height="8" fill="#ffcc66" />
            <rect x={X + 7.5} y={Y + 1} width="1" height="8" fill="#5a3a24" />
            <rect x={X + 4} y={Y + 4.5} width="8" height="1" fill="#5a3a24" />
            <rect x={X + 3} y={Y + 9} width="10" height="1" fill="#6a4a34" />
          </g>,
        );
        luzes.push(<circle key={`wl${k}`} cx={X + 8} cy={Y + 8} r="18" fill="#ffb03a" opacity="0.18" className="luz-vela" />);
      }
      // Mural pintado na parede (o Hipogeu).
      if (c === 'I')
        pecas.push(
          <g key={`mu${k}`}>
            <rect x={X + 1} y={Y + 1} width="14" height="9" fill="#c8a878" />
            <rect x={X + 1} y={Y + 1} width="14" height="1" fill="#8a6a3a" />
            <rect x={X + 3} y={Y + 4} width="2" height="5" fill="#2a6aa0" />
            <rect x={X + 3} y={Y + 3} width="2" height="1" fill="#e8c8a0" />
            <rect x={X + 7} y={Y + 5} width="3" height="4" fill="#c0283c" />
            <rect x={X + 7} y={Y + 4} width="3" height="1" fill="#e8c8a0" />
            <rect x={X + 11} y={Y + 3} width="2" height="6" fill={['#d8a83a', '#8a3aa0', '#3a8a4a', '#e0782c'][x % 4]} />
          </g>,
        );
      // Barril de madeira com cintas de ferro.
      if (c === 'b')
        pecas.push(
          <g key={`ba${k}`}>
            <ellipse cx={X + 8} cy={Y + 14} rx="6" ry="2" fill="#000" opacity="0.3" />
            <rect x={X + 3} y={Y - 1} width="10" height="15" fill="#7a4a22" />
            <rect x={X + 2} y={Y + 2} width="12" height="9" fill="#8a5a2a" />
            <rect x={X + 2} y={Y + 2} width="12" height="1.5" fill="#4a4a54" />
            <rect x={X + 2} y={Y + 9} width="12" height="1.5" fill="#4a4a54" />
            <rect x={X + 3} y={Y - 2} width="10" height="2" fill="#a87a44" />
            <rect x={X + 5} y={Y + 1} width="1" height="11" fill="#a87a44" opacity="0.6" />
          </g>,
        );
      // Caixote de carga, com tábua cruzada.
      if (c === 'k')
        pecas.push(
          <g key={`cx${k}`}>
            <rect x={X + 1} y={Y - 3} width="14" height="17" fill="#a87a44" />
            <rect x={X + 1} y={Y - 3} width="14" height="3" fill="#c89a5a" />
            <rect x={X + 1} y={Y - 3} width="1.5" height="17" fill="#6a4a24" />
            <rect x={X + 13.5} y={Y - 3} width="1.5" height="17" fill="#6a4a24" />
            <rect x={X + 1} y={Y + 12.5} width="14" height="1.5" fill="#6a4a24" />
            <rect x={X + 2} y={Y + 5} width="12" height="1.5" fill="#7a5a2a" transform={`rotate(-35 ${X + 8} ${Y + 6})`} />
          </g>,
        );
      // A amarra do cais: poste de ferro com a corrente grossa.
      if (c === 'r')
        pecas.push(
          <g key={`am${k}`}>
            <rect x={X + 5} y={Y + 2} width="6" height="11" fill="#3a3a44" />
            <rect x={X + 4} y={Y} width="8" height="3" fill="#5a5a66" />
            <rect x={X + 6} y={Y + 3} width="1" height="9" fill="#6a6a78" />
            {[0, 1, 2, 3].map((j) => (
              <rect key={j} x={X + 10 + j * 2} y={Y + 6 + (j % 2)} width="2" height="1.5" fill="#8a8a98" />
            ))}
          </g>,
        );
      // O farol (2 × 2): torre listrada em cima da pedra, com a luz no alto.
      if (c === 'H' && t(x - 1, y) !== 'H' && t(x, y - 1) !== 'H') {
        pecas.push(
          <g key={`fa${k}`}>
            <rect x={X + 2} y={Y + 22} width="28" height="10" fill="#4a4a50" />
            <rect x={X + 2} y={Y + 22} width="28" height="2" fill="#6a6a72" />
            {[0, 1, 2, 3, 4].map((j) => (
              <rect key={j} x={X + 9 + j * 0.5} y={Y - 18 + j * 8} width={14 - j} height="8" fill={j % 2 ? '#c0283c' : '#f0e6d0'} />
            ))}
            <rect x={X + 8} y={Y - 26} width="16" height="8" fill="#2a2a34" />
            <rect x={X + 10} y={Y - 25} width="12" height="6" fill="#ffe08a" className="luz-vela" />
            <rect x={X + 7} y={Y - 29} width="18" height="3" fill="#3a3a44" />
            <rect x={X + 14} y={Y - 32} width="4" height="3" fill="#3a3a44" />
          </g>,
        );
        luzes.push(<circle key={`fl${k}`} cx={X + 16} cy={Y - 22} r="44" fill="#ffe08a" opacity="0.2" className="luz-vela" />);
      }
      // Casco do navio: convés de tábuas, borda escura, e o mastro com a vela.
      if (c === 'n') {
        pecas.push(
          <g key={`na${k}`}>
            <rect x={X} y={Y} width={PX} height={PX} fill="#7a5430" />
            {[3, 7, 11].map((r) => (
              <rect key={r} x={X} y={Y + r} width={PX} height="1" fill="#5a3a1c" />
            ))}
            {t(x, y - 1) !== 'n' && <rect x={X} y={Y} width={PX} height="2" fill="#4a2a12" />}
            {t(x, y + 1) !== 'n' && (
              <>
                <rect x={X} y={Y + 10} width={PX} height="6" fill="#4a2a12" />
                <rect x={X} y={Y + 11} width={PX} height="1" fill="#c8962a" />
              </>
            )}
            {t(x - 1, y) !== 'n' && <rect x={X} y={Y} width="2" height={PX} fill="#3a2010" />}
            {t(x + 1, y) !== 'n' && <rect x={X + PX - 2} y={Y} width="2" height={PX} fill="#3a2010" />}
          </g>,
        );
        if (t(x, y - 1) !== 'n' && t(x - 2, y) === 'n' && t(x - 3, y) !== 'n')
          pecas.push(
            <g key={`ms${k}`}>
              <rect x={X + 7} y={Y - 30} width="2" height="36" fill="#5a3a1c" />
              <rect x={X - 5} y={Y - 26} width="26" height="16" fill="#e8dcc0" />
              <rect x={X - 5} y={Y - 20} width="26" height="3" fill="#c0283c" />
              <rect x={X - 5} y={Y - 26} width="26" height="1" fill="#fff8e8" />
              <rect x={X + 9} y={Y - 34} width="7" height="4" fill="#c0283c" />
            </g>,
          );
      }
      // Banco dos remadores, com o remo.
      if (c === 'q')
        pecas.push(
          <g key={`re${k}`}>
            <rect x={X} y={Y + 6} width={PX} height="5" fill="#7a5430" />
            <rect x={X} y={Y + 6} width={PX} height="1" fill="#a87a44" />
            <rect x={X + 2} y={Y + 11} width="2" height="4" fill="#4a2a12" />
            <rect x={X + 12} y={Y + 11} width="2" height="4" fill="#4a2a12" />
            <rect x={X + 7} y={Y - 6} width="2" height="13" fill="#a8844a" />
            <rect x={X + 5} y={Y - 10} width="6" height="5" fill="#c89a5a" />
          </g>,
        );
      // O tambor do mestre dos remos.
      if (c === 'A')
        pecas.push(
          <g key={`ta${k}`}>
            <ellipse cx={X + 8} cy={Y + 14} rx="7" ry="2" fill="#000" opacity="0.3" />
            <rect x={X + 1} y={Y - 1} width="14" height="14" fill="#a83a2a" />
            <rect x={X + 1} y={Y - 4} width="14" height="4" fill="#e8d8b0" />
            {[2, 6, 10].map((j) => (
              <rect key={j} x={X + 1 + j} y={Y + 1} width="1" height="10" fill="#e8d8b0" transform={`rotate(25 ${X + 1 + j} ${Y + 6})`} />
            ))}
            <rect x={X + 1} y={Y + 11} width="14" height="2" fill="#6a1a12" />
            <rect x={X + 3} y={Y - 9} width="1.5" height="7" fill="#d8b860" transform={`rotate(-30 ${X + 3} ${Y - 3})`} />
            <rect x={X + 11} y={Y - 9} width="1.5" height="7" fill="#d8b860" transform={`rotate(30 ${X + 12} ${Y - 3})`} />
          </g>,
        );
      // O telescópio grande (2 × 2): tripé de madeira e o tubo de latão apontado para o céu.
      if (c === 'U' && t(x - 1, y) !== 'U' && t(x, y - 1) !== 'U')
        pecas.push(
          <g key={`te${k}`}>
            <ellipse cx={X + 16} cy={Y + 30} rx="12" ry="2.5" fill="#000" opacity="0.3" />
            <rect x={X + 15} y={Y + 12} width="2" height="18" fill="#6a4220" />
            <rect x={X + 8} y={Y + 14} width="2" height="17" fill="#6a4220" transform={`rotate(20 ${X + 9} ${Y + 14})`} />
            <rect x={X + 22} y={Y + 14} width="2" height="17" fill="#6a4220" transform={`rotate(-20 ${X + 23} ${Y + 14})`} />
            <g transform={`rotate(-38 ${X + 16} ${Y + 12})`}>
              <rect x={X + 4} y={Y + 9} width="30" height="7" fill="#c8a050" />
              <rect x={X + 4} y={Y + 9} width="30" height="2" fill="#f0d090" />
              <rect x={X + 30} y={Y + 8} width="5" height="9" fill="#8a6a2a" />
              <rect x={X + 12} y={Y + 8} width="2" height="9" fill="#8a6a2a" />
              <rect x={X + 22} y={Y + 8} width="2" height="9" fill="#8a6a2a" />
              <rect x={X + 34} y={Y + 10} width="1" height="5" fill="#a8d8ff" />
            </g>
          </g>,
        );
      // O planetário de latão (2 × 2): o sol no meio, os anéis e os planetas.
      if (c === 'O' && t(x - 1, y) !== 'O' && t(x, y - 1) !== 'O') {
        pecas.push(
          <g key={`or${k}`}>
            <ellipse cx={X + 16} cy={Y + 30} rx="10" ry="2" fill="#000" opacity="0.3" />
            <rect x={X + 8} y={Y + 27} width="16" height="4" fill="#6a4220" />
            <rect x={X + 15} y={Y + 10} width="2" height="18" fill="#c8a050" />
            <ellipse cx={X + 16} cy={Y + 9} rx="14" ry="5" fill="none" stroke="#c8a050" strokeWidth="1" />
            <ellipse cx={X + 16} cy={Y + 9} rx="9" ry="3" fill="none" stroke="#a8803a" strokeWidth="1" />
            <circle cx={X + 16} cy={Y + 9} r="4" fill="#ffd04a" />
            <circle cx={X + 16} cy={Y + 8} r="1.5" fill="#fff4c0" />
            <circle cx={X + 3} cy={Y + 10} r="2" fill="#4a8ad8" />
            <circle cx={X + 24} cy={Y + 7} r="1.6" fill="#c0583a" />
            <circle cx={X + 28} cy={Y + 11} r="2.2" fill="#8ad04a" />
          </g>,
        );
        luzes.push(<circle key={`ol${k}`} cx={X + 16} cy={Y + 9} r="16" fill="#ffd04a" opacity="0.15" />);
      }
      // Chaminé de tijolo soltando fumaça.
      if (c === 'h')
        pecas.push(
          <g key={`ch${k}`}>
            <rect x={X + 4} y={Y - 8} width="8" height="20" fill="#8a4a32" />
            {[-6, -2, 2, 6].map((r) => (
              <rect key={r} x={X + 4} y={Y + r} width="8" height="1" fill="#5a2a1c" />
            ))}
            <rect x={X + 3} y={Y - 10} width="10" height="3" fill="#4a3a32" />
            <circle cx={X + 9} cy={Y - 14} r="3" fill="#8a8a94" opacity="0.5" className="fumaca-mapa" />
            <circle cx={X + 12} cy={Y - 19} r="4" fill="#8a8a94" opacity="0.35" className="fumaca-mapa" style={{ animationDelay: '600ms' }} />
          </g>,
        );
      // Parapeito: a mureta de pedra e a cidade lá embaixo (o Coliseu aparece de vez em quando).
      if (c === 'V') {
        const alto = 3 + ((x * 7) % 5);
        pecas.push(
          <g key={`pa${k}`}>
            <rect x={X} y={Y} width={PX} height="11" fill={cor.parede1} />
            <rect x={X + ((x * 5) % 13)} y={Y + 1} width="1" height="1" fill="#fff4c0" opacity="0.8" />
            <rect x={X} y={Y + 10 - alto} width={PX} height={alto} fill="#140f22" />
            <rect x={X + 3} y={Y + 9 - alto} width="2" height="2" fill="#ffb03a" opacity="0.8" />
            {(x % 9 === 4 || (t(x - 1, y) === 'V' && t(x + 1, y) === 'V' && t(x - 2, y) !== 'V')) && (
              <>
                <rect x={X - 4} y={Y + 1} width="24" height="9" fill="#2a2238" />
                {[0, 1, 2, 3, 4].map((j) => (
                  <rect key={j} x={X - 2 + j * 4.5} y={Y + 3} width="2" height="3" fill="#ffcc66" opacity="0.7" />
                ))}
              </>
            )}
            <rect x={X} y={Y + 10} width={PX} height="6" fill="#a89a84" />
            <rect x={X} y={Y + 10} width={PX} height="1" fill="#d8ccb4" />
            <rect x={X + 1} y={Y + 8} width="5" height="2" fill="#a89a84" />
            <rect x={X + 9} y={Y + 8} width="5" height="2" fill="#a89a84" />
          </g>,
        );
      }
      // O tripé do oráculo: bacia de bronze com a fumaça violeta.
      if (c === 'Q') {
        pecas.push(
          <g key={`tr${k}`}>
            <rect x={X + 3} y={Y + 2} width="1.5" height="12" fill="#8a5a22" transform={`rotate(15 ${X + 4} ${Y + 2})`} />
            <rect x={X + 11} y={Y + 2} width="1.5" height="12" fill="#8a5a22" transform={`rotate(-15 ${X + 12} ${Y + 2})`} />
            <rect x={X + 7.3} y={Y + 2} width="1.5" height="12" fill="#6a4218" />
            <rect x={X + 2} y={Y - 1} width="12" height="4" fill="#a8742a" />
            <rect x={X + 2} y={Y - 1} width="12" height="1" fill="#d8a85a" />
            <circle cx={X + 8} cy={Y - 5} r="4" fill="#a88ad8" opacity="0.55" className="fumaca-mapa" />
            <circle cx={X + 6} cy={Y - 11} r="5" fill="#a88ad8" opacity="0.35" className="fumaca-mapa" style={{ animationDelay: '500ms' }} />
          </g>,
        );
        luzes.push(<circle key={`ql${k}`} cx={X + 8} cy={Y - 3} r="22" fill="#a8f0d8" opacity="0.16" className="luz-vela" />);
      }
      // O espelho grande num pé de bronze (a arena do eclipse).
      if (c === 'Y') {
        pecas.push(
          <g key={`ey${k}`}>
            <rect x={X + 7} y={Y + 3} width="2" height="11" fill="#8a6a2a" />
            <rect x={X + 4} y={Y + 13} width="8" height="2" fill="#6a4a1a" />
            <rect x={X + 2} y={Y - 11} width="12" height="15" fill="#c8a050" />
            <rect x={X + 4} y={Y - 9} width="8" height="11" fill="#c8e8ff" />
            <rect x={X + 5} y={Y - 8} width="2" height="6" fill="#ffffff" opacity="0.8" />
          </g>,
        );
        luzes.push(<circle key={`yl${k}`} cx={X + 8} cy={Y - 4} r="14" fill="#fff4c0" opacity="0.15" />);
      }
      // A arquibancada: degraus de pedra e a plateia (cabecinhas coloridas).
      if (c === 'B' || c === 'X') {
        pecas.push(
          <g key={`ab${k}`}>
            <rect x={X} y={Y} width={PX} height={PX} fill="#8a7a64" />
            {[3, 8, 13].map((r) => (
              <rect key={r} x={X} y={Y + r} width={PX} height="1" fill="#5a4a38" />
            ))}
            {[0, 1, 2].map((j) => (
              <rect key={j} x={X + 1 + j * 5 + ((x + y) % 2)} y={Y + 4 + (j % 2) * 5} width="3" height="3" fill={['#c0283c', '#2a6aa0', '#d8a83a', '#3a8a4a', '#e8c8a0'][(x * 3 + y * 5 + j) % 5]} />
            ))}
            {!'BX'.includes(t(x, y + 1)) && <rect x={X} y={Y + 12} width={PX} height="4" fill="#5a4a38" />}
          </g>,
        );
        // O camarote do imperador: toldo listrado e moldura dourada.
        if (c === 'X')
          pecas.push(
            <g key={`cm${k}`}>
              <rect x={X} y={Y} width={PX} height={PX} fill="#6a1a2a" />
              {[0, 1, 2, 3].map((j) => (
                <rect key={j} x={X + j * 4} y={Y} width="2" height="6" fill="#f0d080" />
              ))}
              <rect x={X} y={Y + 6} width={PX} height="1" fill="#c8962a" />
              <rect x={X + 5} y={Y + 9} width="6" height="5" fill="#c8962a" />
              <rect x={X} y={Y + 14} width={PX} height="2" fill="#c8962a" />
            </g>,
          );
      }
      if (c === 'P') pecas.push(<DesenhoSaida key={`sa${k}`} estilo={mundo.saida?.estilo ?? 'escada'} X={X} Y={Y} />);
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
