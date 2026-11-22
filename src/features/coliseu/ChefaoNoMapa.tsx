import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react';
import { CHEFOES_MAPA, furioso, golpearChefao, novoChefao, passoChefao, type EstadoChefao } from '@/game/historia/chefaoMapa';
import { INIMIGOS } from '@/game/historia/inimigos';
import { novaLuta } from '@/game/historia/luta';
import { novoMundo, passoMundo, type EntradaMundo, type EstadoMundo } from '@/game/historia/mundo';
import type { Fala, Falante } from '@/game/historia/roteiro';
import Emote from '@/ui/pixel/Emotes';
import Icone from '@/ui/pixel/Icones';
import { desbloquear } from '@/ui/som';
import { tocar } from '@/ui/somHistoria';
import { Falas } from './Cenas';
import { escalaDe, Retrato } from './Cenarios';
import { SpriteInimigo } from './Luta';
import { BotaoSeta, MapaDesenhado } from './MundoAberto';
import { usePausado } from './Pausa';

/**
 * O CHEFÃO NO MAPA ABERTO (22/11/2026, o teste combinado com o Lucas): o Rato-Rei nas
 * catacumbas. Andar pelas setas (ou WASD), GOLPE no botão (ou J, espaço, E). Ele mira, corre
 * reto e, se bater nas colunas, fica tonto: aí é bater. Cair = tentar de novo.
 */
export function ChefaoNoMapa({ heroi, antes, depois, onFim, chefe = 'rato-rei' }: { heroi: Falante; antes?: Fala[]; depois?: Fala[]; onFim: () => void; chefe?: string }) {
  const def = CHEFOES_MAPA[chefe] ?? CHEFOES_MAPA['rato-rei']!;
  const m = def.arena;
  const nome = (INIMIGOS[def.id]?.nome ?? 'Chefão').toUpperCase();
  const W = m.mapa[0]!.length;
  const H = m.mapa.length;
  const [fase, setFase] = useState<'antes' | 'luta' | 'depois' | 'derrota'>(antes?.length ? 'antes' : 'luta');
  const [s, setS] = useState<EstadoMundo>(() => novoMundo(m));
  const [st, setSt] = useState<EstadoChefao>(() => novoChefao(100, def.id));
  const ref = useRef({ s, st });
  const entrada = useRef<EntradaMundo>({ cima: false, baixo: false, esq: false, dir: false });
  const faseRef = useRef(fase);
  faseRef.current = fase;
  const pausado = usePausado();
  const pausadoRef = useRef(pausado);
  pausadoRef.current = pausado;

  const golpe = () => {
    if (faseRef.current !== 'luta' || pausadoRef.current) return;
    desbloquear();
    const antesDoGolpe = ref.current.st;
    const novo = golpearChefao(antesDoGolpe, ref.current.s);
    if (novo === antesDoGolpe) return;
    ref.current.st = novo;
    setSt(novo);
    tocar(novo.chefe.vida < antesDoGolpe.chefe.vida ? 'espadas' : 'escudoMetal');
  };

  // O relógio: o gladiador anda (passoMundo) e o Rato-Rei corre (passoChefao).
  useEffect(() => {
    let ultimo = performance.now();
    let id = 0;
    const quadro = (agora: number) => {
      const dt = Math.min(50, agora - ultimo);
      ultimo = agora;
      if (faseRef.current === 'luta' && !pausadoRef.current) {
        const s2 = passoMundo(m, ref.current.s, entrada.current, dt);
        const st2 = passoChefao(m, ref.current.st, s2, dt);
        if (st2.vida < ref.current.st.vida) tocar('dano');
        if (st2.chefe.estado === 'tonto' && ref.current.st.chefe.estado === 'carga') tocar('pesada');
        ref.current = { s: s2, st: st2 };
        setS(s2);
        setSt(st2);
        if (st2.fim === 'vitoria') setFase('depois');
        if (st2.fim === 'derrota') setFase('derrota');
      }
      id = requestAnimationFrame(quadro);
    };
    id = requestAnimationFrame(quadro);
    return () => cancelAnimationFrame(id);
  }, []);

  // O teclado.
  useEffect(() => {
    const teclas: Record<string, keyof EntradaMundo> = { ArrowUp: 'cima', w: 'cima', W: 'cima', ArrowDown: 'baixo', s: 'baixo', S: 'baixo', ArrowLeft: 'esq', a: 'esq', A: 'esq', ArrowRight: 'dir', d: 'dir', D: 'dir' };
    const desce = (ev: KeyboardEvent) => {
      const t = teclas[ev.key];
      if (t) {
        ev.preventDefault();
        entrada.current = { ...entrada.current, [t]: true };
      } else if (['j', 'J', ' ', 'e', 'E', 'Enter'].includes(ev.key)) {
        ev.preventDefault();
        golpe();
      }
    };
    const sobe = (ev: KeyboardEvent) => {
      const t = teclas[ev.key];
      if (t) entrada.current = { ...entrada.current, [t]: false };
    };
    window.addEventListener('keydown', desce);
    window.addEventListener('keyup', sobe);
    return () => {
      window.removeEventListener('keydown', desce);
      window.removeEventListener('keyup', sobe);
    };
  }, []);

  const botao = (tecla: keyof EntradaMundo) => ({
    onPointerDown: (ev: PointerEvent) => {
      ev.preventDefault();
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

  const rei = useMemo(() => novaLuta(INIMIGOS[def.id]!), [def.id]);
  const c = st.chefe;
  const emMapa = (x: number, y: number): CSSProperties => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` });
  const ferido = st.tempo < st.feridoAte;
  const ultimo = st.eventos[st.eventos.length - 1];
  const recente = ultimo && st.tempo - ultimo.em < 700 ? ultimo : null;
  // A linha da mira: do Rato-Rei até o gladiador.
  const salto = def.jeito === 'salto';
  const noAr = salto && c.estado === 'carga' ? Math.sin((1 - Math.max(0, c.ate - st.tempo) / 850) * Math.PI) : 0;
  const mira = c.estado === 'mira' && !salto ? { ang: (Math.atan2(s.y - 0.6 - (c.y - 0.6), s.x - c.x) * 180) / Math.PI, d: Math.hypot(s.x - c.x, s.y - c.y) } : null;

  const tentarDeNovo = () => {
    const s0 = novoMundo(m);
    const st0 = novoChefao(100, def.id);
    ref.current = { s: s0, st: st0 };
    setS(s0);
    setSt(st0);
    setFase('luta');
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">{m.objetivo}</p>
      {/* As vidas: o gladiador e o Rato-Rei */}
      <div className="grid grid-cols-2 gap-3 font-pixel text-[8px] sm:text-[10px]">
        <div>
          <span className="text-[#f4e2b4]">VOCÊ</span>
          <div className="mt-1 h-2 bg-black/60"><div className="h-full bg-[#4ad46a] transition-[width]" style={{ width: `${(st.vida / st.vidaMax) * 100}%` }} /></div>
        </div>
        <div className="text-right">
          <span className={furioso(st) ? 'piscar text-[#ff5a5a]' : 'text-[#f4e2b4]'}>{nome}{furioso(st) ? ' (FURIOSO)' : ''}</span>
          <div className="mt-1 h-2 bg-black/60"><div className="ml-auto h-full bg-[#e04a3a] transition-[width]" style={{ width: `${(c.vida / def.vida) * 100}%` }} /></div>
        </div>
      </div>
      <div className="area-jogo relative flex flex-col gap-2">
        <div className={`pixel-box mundo-aberto relative w-full select-none overflow-hidden bg-black ${recente?.tipo === 'parede' ? 'tremer-forte' : ''}`} style={{ aspectRatio: `${W} / ${H}`, touchAction: 'none' }}>
          <MapaDesenhado mundo={m} />
          {/* A mira: a linha vermelha piscando até você */}
          {mira && (
            <span
              className="piscar pointer-events-none absolute z-[8] block h-[3px] origin-left bg-[#ff3a3a]/70"
              style={{ ...emMapa(c.x, c.y - 0.6), width: `${(mira.d / W) * 100}%`, rotate: `${mira.ang}deg` }}
              aria-hidden
            />
          )}
          {/* O Leão: a sombra redonda onde ele vai cair (pisca mais forte quando trava) */}
          {salto && c.ax !== undefined && c.ay !== undefined && (c.estado === 'mira' || c.estado === 'carga') && (
            <span
              className={`pointer-events-none absolute z-[7] block rounded-[50%] ${c.estado === 'carga' || c.ate - st.tempo <= 500 ? 'sombra-salto-forte' : 'sombra-salto'}`}
              style={{ ...emMapa(c.ax, c.ay - 0.2), width: `${(2.6 / W) * 100}%`, aspectRatio: '2.4 / 1', translate: '-50% -50%' }}
              aria-hidden
            />
          )}
          {/* O gladiador e o chefão, na ordem de quem está na frente */}
          {[
            { id: 'heroi', y: s.y },
            { id: 'rei', y: c.y },
          ]
            .sort((a, b) => a.y - b.y)
            .map((p) =>
              p.id === 'heroi' ? (
                <div key="h" className={`absolute ${ferido ? 'piscar' : ''}`} style={{ ...emMapa(s.x, s.y), width: `${((1.15 * escalaDe(heroi)) / W) * 100}%`, translate: '-50% -100%', zIndex: 10 + Math.floor(s.y * 10) }}>
                  <span className="absolute bottom-[-4%] left-1/2 h-[10%] w-[70%] -translate-x-1/2 rounded-[50%] bg-black/45" />
                  <div className={s.andando ? 'andar' : 'respirar'}>
                    <Retrato quem={heroi} espelhar={s.dir === 'esq'} />
                  </div>
                </div>
              ) : (
                <div key="r" className="absolute" style={{ ...emMapa(c.x, c.y), width: `${((salto ? 2.6 : 2.1) / W) * 100}%`, translate: `-50% ${-92 - noAr * 70}%`, zIndex: salto && noAr > 0 ? 300 : 10 + Math.floor(c.y * 10) }}>
                  <span className="absolute bottom-[2%] left-1/2 h-[10%] w-[80%] -translate-x-1/2 rounded-[50%] bg-black/50" />
                  <div className={st.fim === 'vitoria' ? 'inimigo-vencido' : c.estado === 'mira' ? 'tremer-t' : c.estado === 'carga' ? '' : 'respirar-t'} style={{ transform: c.dir === 'esq' ? undefined : 'scaleX(-1)', filter: c.estado === 'tonto' ? 'saturate(0.4)' : furioso(st) ? 'drop-shadow(0 0 6px #ff3a3a)' : undefined }}>
                    <SpriteInimigo e={rei} />
                  </div>
                  {c.estado === 'tonto' && !st.fim && (
                    <>
                      <span className="emote-pula absolute -top-[22%] left-1/2 block w-[34%] -translate-x-1/2">
                        <Emote emocao="surpreso" />
                      </span>
                      <span className="absolute -top-[40%] left-1/2 -translate-x-1/2 whitespace-nowrap border-2 border-black bg-[#4ad46a] px-1 font-pixel text-[7px] text-black sm:text-[10px]">TONTO! BATA!</span>
                    </>
                  )}
                </div>
              ),
            )}
          {recente?.tipo === 'bloqueou' && (
            <span className="pointer-events-none absolute z-[300] -translate-x-1/2 font-pixel text-[8px] text-[#bbb] [text-shadow:1px_1px_0_#000] sm:text-xs" style={emMapa(c.x, c.y - 2.2)}>
              NÃO ENTRA! ESPERE ELE FICAR TONTO
            </span>
          )}
          {recente?.tipo === 'furia' && (
            <span className="pointer-events-none absolute left-1/2 top-[10%] z-[300] -translate-x-1/2 font-pixel text-xs text-[#ff5a5a] [text-shadow:1px_1px_0_#000] sm:text-base">{nome} FICOU FURIOSO!</span>
          )}
          <div className="pointer-events-none absolute inset-0 z-[250]" style={{ background: 'radial-gradient(ellipse at 50% 55%, transparent 40%, rgba(4,2,12,0.6) 100%)' }} aria-hidden />

          {fase === 'antes' && antes && (
            <div className="absolute inset-0 z-[500]">
              <Falas falas={antes} onFim={() => setFase('luta')} />
            </div>
          )}
          {fase === 'depois' && (
            <div className="absolute inset-0 z-[500]">
              <Falas falas={depois ?? []} onFim={onFim} />
            </div>
          )}
          {fase === 'derrota' && (
            <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center gap-3 bg-black/75 p-3 text-center">
              <p className="font-pixel text-lg text-[#ff5a5a] sm:text-2xl">VOCÊ CAIU</p>
              <p className="max-w-sm text-sm text-white/80">{def.dica}</p>
              <button type="button" onClick={tentarDeNovo} className="pixel-box pixel-hover px-4 py-2 font-pixel text-xs text-[#f2c14e]">
                TENTAR DE NOVO
              </button>
            </div>
          )}
        </div>

        {/* Os controles: setas à esquerda, GOLPE à direita */}
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
              golpe();
            }}
            className="pixel-box botao-luta flex flex-col items-center gap-1 px-5 py-3"
            style={{ '--cor': '#e04a3a' } as CSSProperties}
            aria-label="Golpe"
          >
            <span className="medalhao">
              <Icone nome="gladio" className="w-[62%]" />
            </span>
            <span className="font-pixel text-[8px] text-[#f4e2b4]">GOLPE</span>
          </button>
        </div>
      </div>
      <p className="dica-teclado text-center text-[10px] text-muted">Teclado: setas ou WASD para andar · J, E ou espaço para o golpe</p>
    </div>
  );
}
