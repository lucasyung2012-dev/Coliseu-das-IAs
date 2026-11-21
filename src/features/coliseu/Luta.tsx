import { useEffect, useRef, useState } from 'react';
import { INIMIGOS } from '@/game/historia/inimigos';
import { agir, ANIMO_MAX, ataqueAtual, novaLuta, passoLuta, TICK_LUTA, type EstadoLuta } from '@/game/historia/luta';
import type { Fala, Falante, Lugar } from '@/game/historia/roteiro';
import Sprite from '@/ui/pixel/Sprite';
import { FORNALHA, INCINERADOR, PALETA_INCINERADOR, paletaFornalha } from '@/ui/pixel/historia';
import { desbloquear, tocar, type NomeSom } from '@/ui/som';
import { Falas, Palco } from './Cenas';
import { Retrato } from './Cenarios';

// Cada tipo de Incinerador com uma cor de chama diferente.
const CHAMAS: Record<string, Partial<typeof PALETA_INCINERADOR>> = {
  'incinerador-veloz': { F: '#4ab0ff', Y: '#c8f0ff' },
  'incinerador-lanca-chamas': { F: '#ff2a2a', M: '#6a3a2a' },
  'incinerador-duplo': { M: '#4a4a58', W: '#8a8a98' },
  'capitao-incinerador': { M: '#c8962a', W: '#ffe08a', F: '#ff4a8a' },
};

function SpriteInimigo({ e }: { e: EstadoLuta }) {
  const sinalFogo = e.inimigo.estado === 'sinal' && ataqueAtual(e).tipo === 'fogo';
  if (e.def.id === 'fornalha') return <Sprite grade={FORNALHA} paleta={paletaFornalha(sinalFogo)} espelhar />;
  return <Sprite grade={INCINERADOR} paleta={{ ...PALETA_INCINERADOR, ...CHAMAS[e.def.id] }} espelhar />;
}

function Barra({ valor, max, cor, rotulo }: { valor: number; max: number; cor: string; rotulo: string }) {
  return (
    <div role="meter" aria-label={rotulo} aria-valuenow={Math.round(valor)} aria-valuemin={0} aria-valuemax={max} className="h-2.5 w-full border border-black bg-black/60 sm:h-3">
      <div className="h-full transition-[width] duration-150" style={{ width: `${(valor / max) * 100}%`, background: cor }} />
    </div>
  );
}

const SOM: Partial<Record<string, NomeSom>> = { acerto: 'espadas', bloqueio: 'escudoMetal', esquiva: 'selecionar', dano: 'falha', especial: 'fanfarra', fase: 'trombeta', guarda: 'clique' };

/**
 * A luta do modo História: falas antes, a luta, falas depois. Perdeu? Tenta de novo.
 * Controles: ⚔️ golpe, 🛡️ escudo, 💨 esquiva e ⭐ especial (Ânimo cheio).
 * Teclado: J golpe, K escudo, L esquiva, espaço especial.
 */
export function LutaHistoria({
  lugar,
  inimigo,
  heroi,
  antes,
  depois,
  onFim,
}: {
  lugar: Lugar;
  inimigo: string;
  heroi: Falante;
  antes?: Fala[];
  depois?: Fala[];
  onFim: () => void;
}) {
  const def = INIMIGOS[inimigo]!;
  const [fase, setFase] = useState<'antes' | 'luta' | 'depois' | 'derrota'>(antes?.length ? 'antes' : 'luta');
  const [e, setE] = useState<EstadoLuta>(() => novaLuta(def));
  const visto = useRef(0);

  useEffect(() => {
    if (fase !== 'luta') return;
    const id = window.setInterval(() => setE((s) => passoLuta(s)), TICK_LUTA);
    return () => window.clearInterval(id);
  }, [fase]);

  // Fim da luta e os sons de cada acontecimento.
  useEffect(() => {
    for (const ev of e.eventos) {
      if (ev.id <= visto.current) continue;
      const som = SOM[ev.tipo];
      if (som) tocar(som);
    }
    visto.current = Math.max(visto.current, ...e.eventos.map((x) => x.id), 0);
    if (fase === 'luta' && e.fim === 'vitoria') {
      tocar('vitoria');
      setFase('depois');
    }
    if (fase === 'luta' && e.fim === 'derrota') {
      tocar('derrota');
      setFase('derrota');
    }
  }, [e]);

  const apertar = (acao: 'golpe' | 'escudo' | 'esquiva' | 'especial') => {
    if (fase !== 'luta') return;
    desbloquear();
    setE((s) => agir(s, acao));
  };

  useEffect(() => {
    if (fase !== 'luta') return;
    const tecla = (ev: KeyboardEvent) => {
      if (ev.repeat) return;
      const k = ev.key.toLowerCase();
      if (k === 'j' || k === 'arrowright') apertar('golpe');
      else if (k === 'k' || k === 'arrowdown') apertar('escudo');
      else if (k === 'l' || k === 'arrowleft') apertar('esquiva');
      else if (k === ' ') {
        ev.preventDefault();
        apertar('especial');
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [fase]);

  const j = e.jogador;
  const i = e.inimigo;
  const at = ataqueAtual(e);
  const sinal = i.estado === 'sinal';
  const corSinal = at.tipo === 'corpo' ? '#ffd04a' : '#ff3a3a';
  const cheio = e.animo >= ANIMO_MAX;
  const acaoJ = e.tempo < j.acaoAte ? j.acao : 'parado';

  return (
    <div className="flex flex-col gap-2">
      <Palco lugar={lugar} className={acaoJ === 'ferido' ? 'tremer' : ''}>
        {/* Placar: vida dos dois e o Ânimo */}
        <div className="absolute inset-x-2 top-2 z-10 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-pixel text-[7px] text-white [text-shadow:1px_1px_0_#000] sm:text-[9px]">{heroi.toUpperCase()}</span>
            <Barra valor={j.vida} max={j.vidaMax} cor="#4ad46a" rotulo="Sua vida" />
            <Barra valor={e.animo} max={ANIMO_MAX} cor={cheio ? '#f2c14e' : '#c8962a'} rotulo="Ânimo" />
            <span className={`font-pixel text-[6px] sm:text-[8px] ${cheio ? 'piscar text-[#f2c14e]' : 'text-white/70'}`}>{cheio ? '⭐ ÂNIMO CHEIO!' : 'ÂNIMO'}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="font-pixel text-[7px] text-white [text-shadow:1px_1px_0_#000] sm:text-[9px]">
              {def.chefao && '👑 '}
              {def.nome.toUpperCase()}
            </span>
            <Barra valor={i.vida} max={def.vida} cor="#e04a3a" rotulo={`Vida de ${def.nome}`} />
          </div>
        </div>

        {/* O herói */}
        <div
          className={`absolute bottom-[14%] left-[22%] z-10 w-[12%] -translate-x-1/2 transition-transform duration-150 ${acaoJ === 'golpe' || acaoJ === 'especial' ? 'estocada-dir' : ''}`}
          style={{
            transform: acaoJ === 'esquiva' ? 'translate(-90%, -18%)' : undefined,
            filter: acaoJ === 'ferido' ? 'brightness(2.4)' : acaoJ === 'especial' ? 'drop-shadow(0 0 10px #f2c14e)' : undefined,
          }}
        >
          <Retrato quem={heroi} />
          {acaoJ === 'escudo' && (
            <span className="absolute -right-[35%] top-[20%] text-2xl drop-shadow-[0_0_6px_#9fe8ff] sm:text-4xl" aria-hidden>
              🛡️
            </span>
          )}
        </div>

        {/* O inimigo, com o sinal antes do ataque */}
        <div
          className={`absolute bottom-[14%] left-[70%] z-10 -translate-x-1/2 ${def.chefao ? 'w-[26%]' : 'w-[14%]'} ${sinal ? 'tremer' : ''} ${i.estado === 'espera' && !def.chefao ? 'flutuar' : ''}`}
          style={{ filter: sinal ? `drop-shadow(0 0 8px ${corSinal})` : i.estado === 'atordoado' ? 'saturate(0.3)' : undefined }}
        >
          <SpriteInimigo e={e} />
          {sinal && (
            <span
              className="absolute -top-[30%] left-1/2 -translate-x-1/2 whitespace-nowrap border-2 border-black px-1 font-pixel text-[7px] text-black sm:text-[10px]"
              style={{ background: corSinal }}
            >
              ! {at.tipo === 'corpo' ? '🛡️ DEFENDA' : '💨 ESQUIVE'}
            </span>
          )}
          {(i.estado === 'aberto' || i.estado === 'atordoado') && (
            <span className="absolute -top-[30%] left-1/2 -translate-x-1/2 whitespace-nowrap border-2 border-black bg-[#4ad46a] px-1 font-pixel text-[7px] text-black sm:text-[10px]">
              {i.estado === 'atordoado' ? '💫 TONTO!' : '⚔️ ABERTO!'}
            </span>
          )}
        </div>

        {/* Números e avisos que sobem */}
        {e.eventos.map((ev) => (
          <span
            key={ev.id}
            className="subir-sumir pointer-events-none absolute z-20 -translate-x-1/2 whitespace-nowrap font-pixel text-[9px] [text-shadow:2px_2px_0_#000] sm:text-sm"
            style={{ left: ev.lado === 'jogador' ? '22%' : '70%', bottom: '55%', color: ev.tipo === 'dano' ? '#ff5a5a' : ev.tipo === 'guarda' ? '#bbb' : '#f2c14e' }}
          >
            {ev.tipo === 'acerto' && `-${ev.valor}`}
            {ev.tipo === 'dano' && `-${ev.valor}`}
            {ev.tipo === 'bloqueio' && 'BLOQUEOU!'}
            {ev.tipo === 'esquiva' && 'ESQUIVOU!'}
            {ev.tipo === 'especial' && '⭐ ESPECIAL!'}
            {ev.tipo === 'guarda' && 'NA GUARDA'}
            {ev.tipo === 'fase' && '🔥 FURIOSO!'}
          </span>
        ))}

        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('luta')} />}
        {fase === 'depois' && <Falas falas={depois ?? []} onFim={onFim} />}
        {fase === 'derrota' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/75 text-center">
            <p className="font-pixel text-lg text-[#ff5a5a] sm:text-2xl">VOCÊ CAIU</p>
            <p className="max-w-xs text-sm text-white/80">Lembre: sinal AMARELO, escudo. VERMELHO, esquiva. E bata quando ele ficar ABERTO.</p>
            <button
              type="button"
              autoFocus
              onClick={() => {
                tocar('start');
                setE(novaLuta(def));
                setFase('luta');
              }}
              className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent"
            >
              ↻ TENTAR DE NOVO
            </button>
          </div>
        )}
      </Palco>

      {/* Os botões grandes (bons para o iPad) */}
      <div className="grid grid-cols-4 gap-2">
        {(
          [
            ['golpe', '⚔️', 'GOLPE', '#e04a3a'],
            ['escudo', '🛡️', 'ESCUDO', '#ffd04a'],
            ['esquiva', '💨', 'ESQUIVA', '#ff3a3a'],
            ['especial', '⭐', 'ESPECIAL', '#f2c14e'],
          ] as const
        ).map(([acao, icone, nome, cor]) => (
          <button
            key={acao}
            type="button"
            disabled={fase !== 'luta' || (acao === 'especial' && !cheio)}
            onPointerDown={(ev) => {
              ev.preventDefault();
              apertar(acao);
            }}
            className={`pixel-box flex select-none flex-col items-center gap-0.5 py-3 disabled:opacity-35 sm:py-4 ${acao === 'especial' && cheio ? 'piscar' : ''}`}
            style={{ boxShadow: `0 0 0 2px ${cor}` }}
            aria-label={nome}
          >
            <span className="text-2xl sm:text-3xl" aria-hidden>
              {icone}
            </span>
            <span className="font-pixel text-[7px] sm:text-[9px]" style={{ color: cor }}>
              {nome}
            </span>
          </button>
        ))}
      </div>
      <p className="text-center text-[10px] text-muted">Sinal amarelo: 🛡️ escudo · sinal vermelho: 💨 esquiva · ⚔️ bata quando estiver ABERTO · teclado: J, K, L e espaço</p>
    </div>
  );
}
