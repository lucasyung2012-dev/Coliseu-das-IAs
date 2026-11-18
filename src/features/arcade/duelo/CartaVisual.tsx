import type { ReactNode } from 'react';
import { CARTAS, PAPEIS, type Papel, type TipoCarta } from '@/game/duelo/motor';
import Sprite, { type Paleta } from '@/ui/pixel/Sprite';
import { EFEITOS, PALETA_EFEITOS, TROPAS } from '@/ui/pixel/tropas';

/** Cor da moldura de cada classe de carta. */
export const PAPEL_COR: Record<Papel, string> = {
  leve: '#4ec9b0',
  pesada: '#e07a5f',
  longe: '#8fd16a',
  defesa: '#8da9c4',
  feitico: '#f2c14e',
};

/** Cada feitiço tem a sua cor (antes Refutação e Pergunta se confundiam). */
export const COR_FEITICO: Partial<Record<TipoCarta, string>> = { refutacao: '#ff3b4a', pergunta: '#b07cff', pausa: '#6fd6ff', aplauso: '#f2c14e' };

/** Cor da moldura de uma carta: a da classe, ou a do próprio feitiço. */
export const corDaCarta = (tipo: TipoCarta) => COR_FEITICO[tipo] ?? PAPEL_COR[CARTAS[tipo].papel];

type Feitico = 'refutacao' | 'pergunta' | 'pausa' | 'aplauso';

/** O desenho da carta: a tropa em pixel, ou o desenho em pixel do feitiço (na cor dele). */
export function Arte({ tipo, paleta, pequena = false, grande = false }: { tipo: TipoCarta; paleta: Paleta; pequena?: boolean; grande?: boolean }) {
  const tropa = CARTAS[tipo].tropa;
  const altura = pequena ? 'h-9 sm:h-10' : grande ? 'h-16 sm:h-24' : 'h-14 sm:h-16';
  const largura =
    tropa === 'elefante' ? (pequena ? 'w-12' : grande ? 'w-24 sm:w-32' : 'w-20') : pequena ? 'w-8' : grande ? 'w-14 sm:w-20' : 'w-12 sm:w-14';
  return (
    <span className={`flex items-end justify-center ${altura}`} aria-hidden>
      {tropa ? (
        <span className={largura}>
          <Sprite grade={TROPAS[tropa]} paleta={paleta} />
        </span>
      ) : (
        <span className={pequena ? 'w-5' : grande ? 'w-9 sm:w-12' : 'w-8 sm:w-10'} style={{ filter: `drop-shadow(0 0 6px ${corDaCarta(tipo)})` }}>
          <Sprite grade={EFEITOS[tipo as Feitico]} paleta={{ ...PALETA_EFEITOS, G: corDaCarta(tipo) }} />
        </span>
      )}
    </span>
  );
}

/**
 * A carta desenhada como carta de verdade: moldura na cor da classe, joia com o
 * fôlego, janela com a arte, placa com o nome, fita com a personalidade e a força.
 * `tamanho`: 'mao' (na luta), 'colecao' (na sala do Duelo) ou 'mini'.
 */
export function CartaVisual({
  tipo,
  paleta,
  corNome,
  custo,
  tamanho = 'colecao',
  mostrarDica = false,
  rodape,
}: {
  tipo: TipoCarta;
  paleta: Paleta;
  corNome: string;
  custo?: number;
  tamanho?: 'mao' | 'colecao' | 'mini';
  mostrarDica?: boolean;
  rodape?: ReactNode;
}) {
  const info = CARTAS[tipo];
  const moldura = corDaCarta(tipo);
  const mini = tamanho === 'mini';
  const fol = custo ?? info.custo;
  return (
    <span
      className="relative flex h-full w-full flex-col items-stretch overflow-hidden rounded-md border-2 text-center"
      style={{
        borderColor: moldura,
        background: `linear-gradient(180deg, color-mix(in srgb, ${moldura} 30%, #1a1226) 0%, #140e1e 70%)`,
        boxShadow: `inset 0 0 0 1px rgb(0 0 0 / 0.6), 0 3px 0 rgb(0 0 0 / 0.5)`,
      }}
    >
      {/* Faixa da classe */}
      {!mini && (
        <span className="block py-0.5 font-pixel text-[6px] tracking-wider text-black sm:text-[8px]" style={{ background: moldura }}>
          {PAPEIS[info.papel].toUpperCase()}
        </span>
      )}
      {/* Joia de fôlego */}
      <span
        className={`absolute left-1 z-10 grid place-items-center rounded-full border-2 border-black font-pixel text-white [text-shadow:1px_1px_0_#000] ${mini ? 'top-1 h-5 w-5 text-[8px]' : 'top-4 h-6 w-6 text-[9px] sm:top-5 sm:h-8 sm:w-8 sm:text-xs'}`}
        style={{ background: fol === 0 ? '#f2c14e' : 'radial-gradient(circle at 35% 35%, #ff9be6, #b02ab8 70%)' }}
        title="Fôlego"
      >
        {fol}
      </span>
      {/* Janela da arte */}
      <span
        className={`mx-1 mt-1 flex items-end justify-center rounded-sm ${mini ? 'py-1' : 'py-1.5'}`}
        style={{ background: `radial-gradient(ellipse at 50% 80%, color-mix(in srgb, ${moldura} 45%, transparent), rgb(0 0 0 / 0.35) 75%)` }}
      >
        <Arte tipo={tipo} paleta={paleta} pequena={mini} grande={tamanho === 'mao'} />
      </span>
      {/* Placa do nome */}
      <span className={`mx-1 mt-1 rounded-sm bg-black/60 px-0.5 py-0.5 font-pixel leading-snug ${mini ? 'text-[5px] sm:text-[6px]' : 'text-[7px] sm:text-[10px]'}`} style={{ color: corNome }}>
        {info.nome.toUpperCase()}
      </span>
      {!mini && (
        <>
          {/* Fita da personalidade e a força */}
          <span className="mt-1 flex items-center justify-center gap-1 px-1">
            <span className="rounded-sm px-1 py-0.5 font-pixel text-[6px] text-black sm:text-[8px]" style={{ background: '#f2c14e' }}>
              ★ {info.jeito.toUpperCase()}
            </span>
            {info.forca > 0 && (
              <span className="rounded-sm bg-black/60 px-1 py-0.5 font-pixel text-[6px] text-white sm:text-[8px]" title="Força">
                ⚔{info.forca}
              </span>
            )}
          </span>
          {mostrarDica && <span className="mt-1 px-1.5 pb-1.5 text-[10px] leading-snug text-white/75 sm:text-[11px]">{info.dica}</span>}
        </>
      )}
      {rodape}
    </span>
  );
}
