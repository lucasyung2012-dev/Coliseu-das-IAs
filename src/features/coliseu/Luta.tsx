import { useEffect, useRef, useState } from 'react';
import { INIMIGOS } from '@/game/historia/inimigos';
import { agir, ANIMO_MAX, ataqueAtual, FOLEGO_MAX, novaLuta, passoLuta, TICK_LUTA, type EstadoLuta } from '@/game/historia/luta';
import type { Fala, Falante, Lugar } from '@/game/historia/roteiro';
import Sprite, { type Paleta } from '@/ui/pixel/Sprite';
import {
  CAPITAO_INCINERADOR,
  DECURIAO,
  FORNALHA,
  GLADIADOR_SUCATA,
  INCINERADOR,
  INCINERADOR_GUERRA,
  INCINERADOR_LANCA,
  INCINERADOR_VELOZ,
  PALETA_CAPITAO,
  PALETA_GUERRA,
  PALETA_INCINERADOR,
  PALETA_LANCA,
  PALETA_PRETORIANO,
  PALETA_SUCATA,
  paletaFornalha,
  PRETORIANO_BATEDOR,
  PRETORIANO_LANCEIRO,
} from '@/ui/pixel/historia';
import { desbloquear, tocar, type NomeSom } from '@/ui/som';
import { Falas, Palco } from './Cenas';
import { Retrato } from './Cenarios';

/** O desenho e o tamanho de cada inimigo (em % da largura da cena). */
const VISUAL: Record<string, { grade: string[]; paleta: Paleta; largura: number }> = {
  incinerador: { grade: INCINERADOR, paleta: PALETA_INCINERADOR, largura: 13 },
  'incinerador-veloz': { grade: INCINERADOR_VELOZ, paleta: { ...PALETA_INCINERADOR, F: '#4ab0ff', Y: '#c8f0ff', M: '#4a5a7a', W: '#8aa0c8' }, largura: 15 },
  'incinerador-lanca-chamas': { grade: INCINERADOR_LANCA, paleta: PALETA_LANCA, largura: 17 },
  'incinerador-duplo': { grade: INCINERADOR_GUERRA, paleta: PALETA_GUERRA, largura: 15 },
  'capitao-incinerador': { grade: CAPITAO_INCINERADOR, paleta: PALETA_CAPITAO, largura: 16 },
  'pretoriano-batedor': { grade: PRETORIANO_BATEDOR, paleta: PALETA_PRETORIANO, largura: 13 },
  'pretoriano-lanceiro': { grade: PRETORIANO_LANCEIRO, paleta: PALETA_PRETORIANO, largura: 13 },
  'pretoriano-veterano': { grade: DECURIAO, paleta: { ...PALETA_PRETORIANO, S: '#d8c070', s: '#8a7030' }, largura: 14 },
  'gladiador-de-sucata': { grade: GLADIADOR_SUCATA, paleta: PALETA_SUCATA, largura: 19 },
};

function SpriteInimigo({ e }: { e: EstadoLuta }) {
  const sinalFogo = e.inimigo.estado === 'sinal' && ataqueAtual(e).tipo === 'fogo';
  if (e.def.id === 'fornalha') return <Sprite grade={FORNALHA} paleta={paletaFornalha(sinalFogo, e.inimigo.fase)} espelhar />;
  const v = VISUAL[e.def.id] ?? VISUAL.incinerador!;
  return <Sprite grade={v.grade} paleta={v.paleta} espelhar />;
}

function Barra({ valor, max, cor, rotulo, fina = false }: { valor: number; max: number; cor: string; rotulo: string; fina?: boolean }) {
  return (
    <div role="meter" aria-label={rotulo} aria-valuenow={Math.round(valor)} aria-valuemin={0} aria-valuemax={max} className={`w-full border border-black bg-black/60 ${fina ? 'h-1.5 sm:h-2' : 'h-2.5 sm:h-3'}`}>
      <div className="h-full transition-[width] duration-150" style={{ width: `${(valor / max) * 100}%`, background: cor }} />
    </div>
  );
}

const SOM: Partial<Record<string, NomeSom>> = {
  acerto: 'espadas',
  bloqueio: 'escudoMetal',
  esquiva: 'selecionar',
  dano: 'falha',
  especial: 'fanfarra',
  fase: 'trombeta',
  guarda: 'clique',
  finta: 'pergunta',
  contra: 'pesada',
  cansado: 'falha',
};
const TEXTO: Record<string, string> = {
  bloqueio: 'BLOQUEOU!',
  esquiva: 'ESQUIVOU!',
  especial: '⭐ ESPECIAL!',
  guarda: 'NA GUARDA',
  fase: '🔥 FURIOSO!',
  finta: 'FINTA!',
  contra: '⚠ CONTRA-ATAQUE!',
  cansado: 'SEM FÔLEGO',
};

/**
 * A luta do modo História: falas antes, a luta, falas depois. Perdeu? Tenta de novo.
 * Controles: ⚔️ golpe, 🛡️ escudo, 💨 esquiva e ⭐ especial (Ânimo cheio).
 * Teclado: J golpe, K escudo, L esquiva, espaço especial.
 * No Coliseu, o Ânimo vem da PLATEIA: ela começa vaiando e muda de lado com as boas jogadas.
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
  const noColiseu = lugar === 'coliseu-arena';
  const [fase, setFase] = useState<'antes' | 'luta' | 'depois' | 'derrota'>(antes?.length ? 'antes' : 'luta');
  const [e, setE] = useState<EstadoLuta>(() => novaLuta(def));
  const [tentativas, setTentativas] = useState(1);
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
      if (noColiseu) tocar('plateia');
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
  const corSinal = at.tipo === 'corpo' ? '#ffd04a' : at.tipo === 'finta' ? '#ffd04a' : '#ff3a3a';
  const cheio = e.animo >= ANIMO_MAX;
  const acaoJ = e.tempo < j.acaoAte ? j.acao : 'parado';
  const largura = def.id === 'fornalha' ? 30 : (VISUAL[def.id]?.largura ?? 13);
  const apanhou = e.eventos.some((ev) => ev.tipo === 'acerto' && ev.ate - e.tempo > 550);
  const plateiaLado = e.animo >= 50;

  return (
    <div className="flex flex-col gap-2">
      <Palco lugar={lugar} className={acaoJ === 'ferido' ? 'tremer' : ''}>
        {/* Placar: vida dos dois, o fôlego e o Ânimo (ou a plateia, no Coliseu) */}
        <div className="absolute inset-x-2 top-2 z-10 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-pixel text-[7px] text-white [text-shadow:1px_1px_0_#000] sm:text-[9px]">{heroi.toUpperCase()}</span>
            <Barra valor={j.vida} max={j.vidaMax} cor="#4ad46a" rotulo="Sua vida" />
            <Barra valor={j.folego} max={FOLEGO_MAX} cor={j.folego < 25 ? '#ff8a3a' : '#5ab0ff'} rotulo="Fôlego" fina />
            <Barra valor={e.animo} max={ANIMO_MAX} cor={cheio ? '#f2c14e' : '#c8962a'} rotulo={noColiseu ? 'Plateia' : 'Ânimo'} />
            <span className={`font-pixel text-[6px] sm:text-[8px] ${cheio ? 'piscar text-[#f2c14e]' : 'text-white/70'}`}>
              {cheio ? (noColiseu ? '📣 A PLATEIA GRITA SEU NOME!' : '⭐ ÂNIMO CHEIO!') : noColiseu ? (plateiaLado ? '👏 A PLATEIA MUDOU DE LADO' : '👎 A PLATEIA VAIA') : 'ÂNIMO'}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="font-pixel text-[7px] text-white [text-shadow:1px_1px_0_#000] sm:text-[9px]">
              {def.chefao && '👑 '}
              {def.nome.toUpperCase()}
              {def.trocaDeFase && ` · FASE ${i.fase + 1}`}
            </span>
            <Barra valor={i.vida} max={def.vida} cor="#e04a3a" rotulo={`Vida de ${def.nome}`} />
          </div>
        </div>

        {/* O herói */}
        <div
          className={`absolute bottom-[14%] left-[22%] z-10 w-[13%] -translate-x-1/2 ${acaoJ === 'golpe' || acaoJ === 'especial' ? 'estocada-dir' : acaoJ === 'parado' ? 'respirar' : ''}`}
          style={{
            translate: acaoJ === 'esquiva' ? '-60% -22%' : undefined,
            transition: 'translate 120ms ease-out',
            filter: acaoJ === 'ferido' ? 'brightness(2.4) saturate(0)' : acaoJ === 'especial' ? 'drop-shadow(0 0 12px #f2c14e)' : undefined,
          }}
        >
          <Retrato quem={heroi} />
          {acaoJ === 'escudo' && (
            <span className="absolute -right-[40%] top-[15%] text-3xl drop-shadow-[0_0_8px_#9fe8ff] sm:text-5xl" aria-hidden>
              🛡️
            </span>
          )}
        </div>

        {/* O inimigo, com o sinal antes do ataque */}
        <div
          className={`absolute bottom-[12%] left-[70%] z-10 -translate-x-1/2 ${sinal ? 'tremer' : def.chefao || def.id.startsWith('pretoriano') || def.id === 'gladiador-de-sucata' ? 'respirar' : 'flutuar'}`}
          style={{
            width: `${largura}%`,
            filter: apanhou ? 'brightness(2.6)' : sinal ? `drop-shadow(0 0 10px ${corSinal})` : i.estado === 'atordoado' ? 'saturate(0.3)' : undefined,
          }}
        >
          <SpriteInimigo e={e} />
          {/* fumaça saindo da chaminé da Fornalha */}
          {def.id === 'fornalha' &&
            [0, 1, 2].map((k) => (
              <span
                key={k}
                className="fumaca-subindo absolute left-[46%] top-[-6%] h-[8%] w-[10%] rounded-full bg-[#3a3a3a]/70"
                style={{ animationDelay: `${k * 600}ms` }}
                aria-hidden
              />
            ))}
          {sinal && (
            <span
              className="absolute -top-[22%] left-1/2 -translate-x-1/2 whitespace-nowrap border-2 border-black px-1 font-pixel text-[7px] text-black sm:text-[10px]"
              style={{ background: corSinal }}
            >
              ! {at.tipo === 'corpo' || at.tipo === 'finta' ? '🛡️ DEFENDA' : '💨 ESQUIVE'}
              {i.contra && ' (RÁPIDO!)'}
            </span>
          )}
          {(i.estado === 'aberto' || i.estado === 'atordoado') && (
            <span className="absolute -top-[22%] left-1/2 -translate-x-1/2 whitespace-nowrap border-2 border-black bg-[#4ad46a] px-1 font-pixel text-[7px] text-black sm:text-[10px]">
              {i.estado === 'atordoado' ? '💫 TONTO!' : '⚔️ ABERTO!'}
            </span>
          )}
        </div>

        {/* Números e avisos que sobem */}
        {e.eventos.map((ev) => (
          <span
            key={ev.id}
            className="subir-sumir pointer-events-none absolute z-20 -translate-x-1/2 whitespace-nowrap font-pixel text-[9px] [text-shadow:2px_2px_0_#000] sm:text-sm"
            style={{
              left: ev.lado === 'jogador' ? '22%' : '70%',
              bottom: '58%',
              color: ev.tipo === 'dano' || ev.tipo === 'contra' ? '#ff5a5a' : ev.tipo === 'guarda' || ev.tipo === 'cansado' ? '#bbb' : '#f2c14e',
            }}
          >
            {ev.tipo === 'acerto' || ev.tipo === 'dano' ? `-${ev.valor}` : TEXTO[ev.tipo]}
          </span>
        ))}

        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('luta')} />}
        {fase === 'depois' && <Falas falas={depois ?? []} onFim={onFim} />}
        {fase === 'derrota' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/75 p-3 text-center">
            <p className="font-pixel text-lg text-[#ff5a5a] sm:text-2xl">VOCÊ CAIU</p>
            <p className="max-w-sm text-sm text-white/80">
              {tentativas >= 2
                ? 'Dicas: não gaste fôlego à toa (cuidado com as FINTAS); bater na guarda três vezes faz ele CONTRA-ATACAR; espere o ABERTO e bata duas ou três vezes.'
                : 'Lembre: sinal AMARELO, escudo. VERMELHO, esquiva. E bata quando ele ficar ABERTO.'}
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => {
                tocar('start');
                setTentativas((t) => t + 1);
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
            className={`pixel-box flex select-none flex-col items-center gap-0.5 py-3 active:translate-y-0.5 disabled:opacity-35 sm:py-4 ${acao === 'especial' && cheio ? 'piscar' : ''}`}
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
      <p className="text-center text-[10px] text-muted">
        Amarelo: 🛡️ · Vermelho: 💨 · ⚔️ no ABERTO · cada ação gasta fôlego (barra azul) · cuidado com as fintas · teclado: J, K, L e espaço
      </p>
    </div>
  );
}
