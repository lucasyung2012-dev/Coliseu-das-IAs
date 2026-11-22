import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { furiosoChefe, golpearChefe, HABILIDADE, novoEstadoChefe, passoChefe, RECARGA, usarHabilidade, type DefChefe, type EstadoChefe } from '@/game/historia/chefoes';
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

/** Os chefões grandes ocupam mais espaço no mapa. */
const GRANDES = new Set(['censor-tita', 'censor-tita-octavius', 'censor-tita-helios', 'leviata', 'gigante-sombras', 'nucleo', 'leao-mecanico']);

/** O segundo botão de cada gladiador no mapa. */
const BOTAO_HAB = {
  escudo: { nome: 'ESCUDO', icone: 'escudo', cor: '#e0782c' },
  rede: { nome: 'REDE', icone: 'rede', cor: '#2aa08a' },
  passo: { nome: 'PASSO DE SOMBRA', icone: 'esquiva', cor: '#c8a0ff' },
} as const;

const AVISO: Record<string, string> = {
  investida: 'ELE VAI CORRER!',
  salto: 'ELE VAI PULAR! SAIA DA SOMBRA!',
  tiros: 'VAI ATIRAR!',
  onda: 'ONDA DE CHOQUE! FIQUE LONGE!',
  zonas: 'SAIA DOS CÍRCULOS!',
  feixe: 'O RAIO VAI GIRAR!',
  copias: 'CÓPIAS! ACHE O VERDADEIRO!',
};

/**
 * O CHEFÃO EM DUAS ETAPAS (22/11/2026). Primeira etapa: no mapa, fugir dos padrões dele e
 * bater quando ele ficar CANSADO, uma placa da armadura por golpe. Quando a armadura cai,
 * a segunda etapa (o duelo, que vem pronto em `duelo`) começa com ele enfraquecido.
 */
export function ChefaoEmEtapas({ def, heroi, antes, duelo }: { def: DefChefe; heroi: Falante; antes?: Fala[]; duelo: () => ReactNode }) {
  const m = def.arena;
  const nome = (INIMIGOS[def.inimigo]?.nome ?? 'Chefão').toUpperCase();
  const W = m.mapa[0]!.length;
  const H = m.mapa.length;
  const [fase, setFase] = useState<'antes' | 'mapa' | 'quebrou' | 'duelo' | 'derrota'>(antes?.length ? 'antes' : 'mapa');
  const [s, setS] = useState<EstadoMundo>(() => novoMundo(m));
  const [st, setSt] = useState<EstadoChefe>(() => novoEstadoChefe(def));
  const ref = useRef({ s, st });
  const entrada = useRef<EntradaMundo>({ cima: false, baixo: false, esq: false, dir: false });
  const faseRef = useRef(fase);
  faseRef.current = fase;
  const pausado = usePausado();
  const pausadoRef = useRef(pausado);
  pausadoRef.current = pausado;

  const hab = HABILIDADE[heroi] ?? 'escudo';
  const habilidade = () => {
    if (faseRef.current !== 'mapa' || pausadoRef.current) return;
    desbloquear();
    const { s: s0, st: a } = ref.current;
    const e = entrada.current;
    const ix = (e.dir ? 1 : 0) - (e.esq ? 1 : 0);
    const iy = (e.baixo ? 1 : 0) - (e.cima ? 1 : 0);
    const dir = ix || iy ? { x: ix, y: iy } : { x: s0.dir === 'esq' ? -1 : s0.dir === 'dir' ? 1 : 0, y: s0.dir === 'cima' ? -1 : s0.dir === 'baixo' ? 1 : 0 };
    const r = usarHabilidade(def, a, s0, hab, dir);
    if (r.st === a) return;
    const s1 = r.heroi ? { ...s0, x: r.heroi.x, y: r.heroi.y } : s0;
    ref.current = { s: s1, st: r.st };
    setS(s1);
    setSt(r.st);
    const ult = r.st.eventos[r.st.eventos.length - 1]?.tipo;
    tocar(hab === 'escudo' ? 'guarda' : ult === 'rede' ? 'plano' : ult === 'errou' ? 'falha' : 'esquiva');
  };

  const golpe = () => {
    if (faseRef.current !== 'mapa' || pausadoRef.current) return;
    desbloquear();
    const a = ref.current.st;
    const novo = golpearChefe(def, a, ref.current.s);
    if (novo === a) return;
    ref.current.st = novo;
    setSt(novo);
    const ult = novo.eventos[novo.eventos.length - 1];
    tocar(novo.armadura < a.armadura ? 'quebra' : ult?.tipo === 'falsa' && ult.em === novo.tempo ? 'finta' : ult?.tipo === 'bloqueou' && ult.em === novo.tempo ? 'escudoMetal' : 'esquiva');
    if (novo.fim === 'quebrou') {
      tocar('fase');
      setFase('quebrou');
      window.setTimeout(() => setFase('duelo'), 2000);
    }
  };

  useEffect(() => {
    let ultimo = performance.now();
    let id = 0;
    const quadro = (agora: number) => {
      const dt = Math.min(50, agora - ultimo);
      ultimo = agora;
      if (faseRef.current === 'mapa' && !pausadoRef.current) {
        const a = ref.current.st;
        const s1 = ref.current.s;
        let s2 = passoMundo(m, s1, entrada.current, dt);
        // Com o escudo levantado, o Cassius anda devagar.
        if (a.tempo < a.escudoAte) s2 = { ...s2, x: s1.x + (s2.x - s1.x) * 0.4, y: s1.y + (s2.y - s1.y) * 0.4 };
        const st2 = passoChefe(def, a, s2, dt);
        if (st2.vida < a.vida) tocar('dano');
        const novos = st2.eventos.filter((e) => e.em > a.tempo);
        if (novos.some((e) => e.tipo === 'explode')) tocar('pesada');
        if (novos.some((e) => e.tipo === 'parede')) tocar('martelo');
        if (st2.etapa === 'cansado' && a.etapa !== 'cansado') tocar('cansado');
        if (st2.etapa === 'ataque' && a.etapa === 'mira') {
          const p = def.padroes[st2.i % def.padroes.length]!;
          if (p.tipo === 'onda') tocar('onda');
          if (p.tipo === 'copias') tocar('reflexo');
          if (p.tipo === 'investida') tocar('galope');
        }
        ref.current = { s: s2, st: st2 };
        setS(s2);
        setSt(st2);
        if (st2.fim === 'derrota') {
          tocar('derrota');
          setFase('derrota');
        }
      }
      id = requestAnimationFrame(quadro);
    };
    id = requestAnimationFrame(quadro);
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const teclas: Record<string, keyof EntradaMundo> = { ArrowUp: 'cima', w: 'cima', W: 'cima', ArrowDown: 'baixo', s: 'baixo', S: 'baixo', ArrowLeft: 'esq', a: 'esq', A: 'esq', ArrowRight: 'dir', d: 'dir', D: 'dir' };
    const desce = (ev: KeyboardEvent) => {
      if (faseRef.current === 'duelo') return;
      const t = teclas[ev.key];
      if (t) {
        ev.preventDefault();
        entrada.current = { ...entrada.current, [t]: true };
      } else if (['k', 'K', 'Shift'].includes(ev.key) && faseRef.current === 'mapa') {
        ev.preventDefault();
        habilidade();
      } else if (['j', 'J', ' ', 'e', 'E', 'Enter'].includes(ev.key) && faseRef.current === 'mapa') {
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

  const sprite = useMemo(() => novaLuta(INIMIGOS[def.inimigo]!), [def.inimigo]);
  if (fase === 'duelo') return <>{duelo()}</>;

  const p = def.padroes[st.i % def.padroes.length]!;
  const emMapa = (x: number, y: number): CSSProperties => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` });
  const roda = (x: number, y: number, r: number): CSSProperties => ({ ...emMapa(x, y), width: `${((2 * r) / W) * 100}%`, height: `${((2 * r) / H) * 100}%`, translate: '-50% -50%' });
  const ferido = st.tempo < st.feridoAte;
  const ultimo = st.eventos[st.eventos.length - 1];
  const recente = ultimo && st.tempo - ultimo.em < 800 ? ultimo : null;
  const raiva = furiosoChefe(def, st);
  const tam = GRANDES.has(def.inimigo) ? 2.7 : 2.1;
  const noAr = p.tipo === 'salto' && st.etapa === 'ataque' ? Math.sin((1 - Math.max(0, st.ate - st.tempo) / 850) * Math.PI) : 0;
  const mira = st.etapa === 'mira' && (p.tipo === 'investida' || p.tipo === 'tiros') ? { ang: (Math.atan2(s.y - 0.6 - (st.y - 0.6), s.x - st.x) * 180) / Math.PI, d: Math.hypot(s.x - st.x, s.y - st.y) } : null;
  const cansado = st.etapa === 'cansado' && !st.fim && !st.apanhou;
  const escudo = st.tempo < st.escudoAte;
  const sombra = st.tempo < st.invulAte;
  const naRede = cansado && st.eventos.some((e) => e.tipo === 'rede' && st.tempo - e.em < def.cansaMs);
  const recarga = Math.max(0, st.habPronta - st.tempo) / RECARGA[hab];
  const bh = BOTAO_HAB[hab];
  const bossFiltro = cansado ? 'saturate(0.35) brightness(0.9)' : `drop-shadow(0 0 ${raiva ? 8 : def.escuro ? 6 : 0}px ${raiva ? '#ff3a3a' : def.cor})`;

  const desenhoChefe = (x: number, y: number, chave: string, copia = false) => (
    <div key={chave} className={`absolute ${copia ? 'copia-chefe' : ''}`} style={{ ...emMapa(x, y), width: `${(tam / W) * 100}%`, translate: `-50% ${-92 - noAr * 70}%`, zIndex: noAr > 0 ? 300 : 260 + Math.floor(y * 4) }}>
      <span className="absolute bottom-[2%] left-1/2 h-[10%] w-[80%] -translate-x-1/2 rounded-[50%] bg-black/50" />
      <div className={st.etapa === 'mira' ? 'tremer-t' : cansado ? 'respirar-t' : ''} style={{ transform: st.dir === 'esq' ? undefined : 'scaleX(-1)', filter: bossFiltro }}>
        <SpriteInimigo e={sprite} />
      </div>
    </div>
  );

  const tentarDeNovo = () => {
    const s0 = novoMundo(m);
    const st0 = novoEstadoChefe(def);
    ref.current = { s: s0, st: st0 };
    setS(s0);
    setSt(st0);
    setFase('mapa');
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">{m.objetivo}</p>
      <div className="grid grid-cols-2 gap-3 font-pixel text-[8px] sm:text-[10px]">
        <div>
          <span className="text-[#f4e2b4]">VOCÊ</span>
          <div className="mt-1 h-2 bg-black/60"><div className="h-full bg-[#4ad46a] transition-[width]" style={{ width: `${(st.vida / st.vidaMax) * 100}%` }} /></div>
        </div>
        <div className="text-right">
          <span className={raiva ? 'piscar text-[#ff5a5a]' : 'text-[#f4e2b4]'}>{nome}{raiva ? ' (FURIOSO)' : ''}</span>
          {/* A armadura: uma placa por golpe no cansado */}
          <div className="mt-1 flex justify-end gap-[3px]" aria-label={`Armadura: ${st.armadura} de ${def.armadura}`}>
            {Array.from({ length: def.armadura }, (_, k) => (
              <span key={k} className={`block h-2.5 w-3 border border-black sm:h-3 sm:w-4 ${k < st.armadura ? 'bg-[#b8c4d0] shadow-[inset_0_-2px_0_#6a7a8a]' : 'placa-caiu bg-black/50'}`} />
            ))}
          </div>
        </div>
      </div>
      <div className="area-jogo relative flex flex-col gap-2">
        <div className={`pixel-box mundo-aberto relative w-full select-none overflow-hidden bg-black ${recente?.tipo === 'parede' || recente?.tipo === 'explode' ? 'tremer-forte' : ''}`} style={{ aspectRatio: `${W} / ${H}`, touchAction: 'none' }}>
          <MapaDesenhado mundo={m} />

          {/* No escuro, só se vê em volta do gladiador */}
          {def.escuro && (
            <div
              className="pointer-events-none absolute inset-0 z-[240]"
              style={{ background: `radial-gradient(circle at ${(s.x / W) * 100}% ${((s.y - 0.5) / H) * 100}%, transparent 0, transparent 9%, rgba(4,2,14,0.93) 24%)` }}
              aria-hidden
            />
          )}

          {/* A mira: a linha piscando até você */}
          {mira && (
            <span className="piscar pointer-events-none absolute z-[270] block h-[3px] origin-left" style={{ ...emMapa(st.x, st.y - 0.6), width: `${(mira.d / W) * 100}%`, rotate: `${mira.ang}deg`, background: def.cor }} aria-hidden />
          )}
          {/* O salto: a sombra onde ele vai cair */}
          {p.tipo === 'salto' && st.alvo && st.etapa !== 'cansado' && (
            <span className={`pointer-events-none absolute z-[250] block rounded-[50%] ${st.etapa === 'ataque' || st.ate - st.tempo <= 500 ? 'sombra-salto-forte' : 'sombra-salto'}`} style={{ ...emMapa(st.alvo.x, st.alvo.y - 0.2), width: `${(2.8 / W) * 100}%`, aspectRatio: '2.4 / 1', translate: '-50% -50%' }} aria-hidden />
          )}
          {/* As zonas: o chão marca e depois explode */}
          {p.tipo === 'zonas' &&
            st.etapa !== 'cansado' &&
            (st.zonas ?? []).map((z, k) => (
              <span key={k} className={`pointer-events-none absolute z-[250] block rounded-full border-2 ${st.etapa === 'ataque' ? 'zona-quase' : 'zona-marca'}`} style={{ ...roda(z.x, z.y - 0.2, p.raio), borderColor: def.cor, background: `radial-gradient(circle, ${def.cor}55, ${def.cor}22 70%, transparent)` }} aria-hidden />
            ))}
          {recente?.tipo === 'explode' &&
            p.tipo !== 'onda' &&
            (p.tipo === 'zonas' ? (st.zonas ?? []).map((z) => ({ x: z.x, y: z.y - 0.2, r: p.raio * 1.3 })) : [{ x: st.x, y: st.y - 0.3, r: 2 }]).map((z, k) => (
              <span key={`ex${recente.em}-${k}`} className="explosao-chao pointer-events-none absolute z-[255] block rounded-full" style={{ ...roda(z.x, z.y, z.r), background: `radial-gradient(circle, #fff8, ${def.cor}aa 40%, transparent 70%)` }} aria-hidden />
            ))}
          {/* A onda de choque */}
          {st.onda !== undefined && (
            <span className="pointer-events-none absolute z-[255] block rounded-full border-4" style={{ ...roda(st.x, st.y - 0.3, Math.max(0.2, st.onda)), borderColor: def.cor, boxShadow: `0 0 12px ${def.cor}, inset 0 0 12px ${def.cor}` }} aria-hidden />
          )}
          {/* O raio que gira */}
          {p.tipo === 'feixe' && st.angulo !== undefined && (
            <span className="pointer-events-none absolute z-[256] block h-[6px] origin-left rounded-full" style={{ ...emMapa(st.x, st.y - 0.4), width: `${(p.comprimento / W) * 100}%`, rotate: `${(st.angulo * 180) / Math.PI}deg`, translate: '0 -50%', background: `linear-gradient(90deg, #fff, ${def.cor} 30%, ${def.cor}00)`, boxShadow: `0 0 10px ${def.cor}` }} aria-hidden />
          )}
          {/* Os projéteis */}
          {(st.projeteis ?? []).map((q, k) => (
            <span key={k} className="pointer-events-none absolute z-[258] block rounded-full" style={{ ...roda(q.x, q.y, 0.22), background: `radial-gradient(circle, #fff, ${def.cor} 55%)`, boxShadow: `0 0 8px ${def.cor}` }} aria-hidden />
          ))}

          {/* O gladiador */}
          <div className={`absolute ${ferido && !escudo ? 'piscar' : ''} ${sombra ? 'passo-sombra' : ''}`} style={{ ...emMapa(s.x, s.y), width: `${((1.15 * escalaDe(heroi)) / W) * 100}%`, translate: '-50% -100%', zIndex: 260 + Math.floor(s.y * 4) }}>
            <span className="absolute bottom-[-4%] left-1/2 h-[10%] w-[70%] -translate-x-1/2 rounded-[50%] bg-black/45" />
            <div className={s.andando ? 'andar' : 'respirar'}>
              <Retrato quem={heroi} espelhar={s.dir === 'esq'} />
            </div>
            {escudo && (
              <span className={`escudo-ergue absolute top-[30%] block w-[70%] ${s.dir === 'esq' ? '-left-[25%]' : '-right-[25%]'}`} aria-hidden>
                <Icone nome="escudo" className="w-full drop-shadow-[0_0_6px_#ffb060]" />
              </span>
            )}
          </div>
          {/* O chefão e as cópias (iguaizinhas: só batendo para saber) */}
          {desenhoChefe(st.x, st.y, 'chefe')}
          {(st.copias ?? []).filter((c) => c.viva).map((c, k) => desenhoChefe(c.x, c.y, `c${k}`, true))}

          {naRede && (
            <span className="rede-cai pointer-events-none absolute z-[305] block" style={{ ...emMapa(st.x, st.y - tam * 0.45), width: `${((tam * 0.9) / W) * 100}%`, aspectRatio: '1', translate: '-50% -50%' }} aria-hidden>
              <Icone nome="rede" className="h-full w-full opacity-90" />
            </span>
          )}
          {recente?.tipo === 'errou' && (
            <span className="pointer-events-none absolute z-[310] -translate-x-1/2 whitespace-nowrap font-pixel text-[8px] text-[#ccc] [text-shadow:1px_1px_0_#000] sm:text-xs" style={emMapa(s.x, s.y - 1.8)}>
              {st.etapa === 'cansado' ? 'ELE JÁ ESTÁ CANSADO: BATA!' : 'LONGE DEMAIS PARA A REDE!'}
            </span>
          )}
          {recente?.tipo === 'defendeu' && (
            <span className="pointer-events-none absolute z-[310] -translate-x-1/2 whitespace-nowrap font-pixel text-[8px] text-[#ffb060] [text-shadow:1px_1px_0_#000] sm:text-xs" style={emMapa(s.x, s.y - 1.8)}>
              SEGUROU!
            </span>
          )}
          {cansado && (
            <span className="pointer-events-none absolute z-[310] flex -translate-x-1/2 flex-col items-center" style={emMapa(Math.min(W - 2.2, Math.max(2.2, st.x)), st.y - tam - 0.3)}>
              <span className="emote-pula block w-6 sm:w-8"><Emote emocao="surpreso" /></span>
              <span className="whitespace-nowrap border-2 border-black bg-[#4ad46a] px-1 font-pixel text-[7px] text-black sm:text-[10px]">{naRede ? 'PRESO NA REDE! BATA!' : 'CANSADO! BATA!'}</span>
            </span>
          )}
          {st.etapa === 'mira' && !st.fim && (
            <span className="piscar pointer-events-none absolute left-1/2 top-[3%] z-[310] -translate-x-1/2 whitespace-nowrap border-2 border-black bg-black/70 px-2 py-0.5 font-pixel text-[7px] sm:text-[10px]" style={{ color: def.cor }}>
              {AVISO[p.tipo]}
            </span>
          )}
          {recente?.tipo === 'bloqueou' && (
            <span className="pointer-events-none absolute z-[310] -translate-x-1/2 whitespace-nowrap font-pixel text-[8px] text-[#ccc] [text-shadow:1px_1px_0_#000] sm:text-xs" style={emMapa(st.x, st.y - tam - 0.6)}>
              {st.apanhou ? 'ELE SE RECUPEROU! ESPERE O PRÓXIMO' : 'NÃO ENTRA! ESPERE ELE CANSAR'}
            </span>
          )}
          {recente?.tipo === 'falsa' && (
            <span className="pointer-events-none absolute left-1/2 top-[14%] z-[310] -translate-x-1/2 font-pixel text-[9px] text-[#c8a0ff] [text-shadow:1px_1px_0_#000] sm:text-sm">ERA FALSA!</span>
          )}
          {(recente?.tipo === 'placa' || recente?.tipo === 'furia') && (
            <span className="placa-voa pointer-events-none absolute z-[310] -translate-x-1/2 font-pixel text-[9px] text-[#e8f0ff] [text-shadow:1px_1px_0_#000] sm:text-sm" style={emMapa(st.x, st.y - tam)}>
              -1 PLACA
            </span>
          )}
          {recente?.tipo === 'furia' && (
            <span className="pointer-events-none absolute left-1/2 top-[22%] z-[310] -translate-x-1/2 whitespace-nowrap font-pixel text-xs text-[#ff5a5a] [text-shadow:1px_1px_0_#000] sm:text-base">{nome} FICOU FURIOSO!</span>
          )}
          <div className="pointer-events-none absolute inset-0 z-[300]" style={{ background: 'radial-gradient(ellipse at 50% 55%, transparent 45%, rgba(4,2,12,0.55) 100%)' }} aria-hidden />

          {fase === 'antes' && antes && (
            <div className="absolute inset-0 z-[500]">
              <Falas falas={antes} onFim={() => setFase('mapa')} />
            </div>
          )}
          {fase === 'quebrou' && (
            <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center gap-2 bg-black/60 text-center">
              <p className="armadura-caiu font-pixel text-lg text-[#f2c14e] [text-shadow:2px_2px_0_#000] sm:text-3xl">A ARMADURA CAIU!</p>
              <p className="font-pixel text-[9px] text-white/85 sm:text-xs">Agora é cara a cara.</p>
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
          <div className="flex items-end gap-2">
          <button
            type="button"
            onPointerDown={(ev) => {
              ev.preventDefault();
              habilidade();
            }}
            className="pixel-box botao-luta relative flex flex-col items-center gap-1 overflow-hidden px-3 py-2"
            style={{ '--cor': bh.cor } as CSSProperties}
            aria-label={bh.nome}
          >
            <span className="medalhao">
              <Icone nome={bh.icone} className="w-[62%]" />
            </span>
            <span className="font-pixel text-[7px] text-[#f4e2b4]">{bh.nome}</span>
            {recarga > 0 && <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/60" style={{ height: `${recarga * 100}%` }} aria-hidden />}
          </button>
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
      </div>
      <p className="dica-teclado text-center text-[10px] text-muted">Teclado: setas ou WASD para andar · J, E ou espaço para o golpe · K ou Shift: {bh.nome.toLowerCase()} · Primeira etapa: quebre a armadura</p>
    </div>
  );
}
