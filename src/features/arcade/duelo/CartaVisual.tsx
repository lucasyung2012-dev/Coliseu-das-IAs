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
  const gotas = custo ?? info.custo;
  // Pergaminho romano: papel envelhecido, com os rolos de madeira em cima e embaixo.
  const rolo = 'block h-1.5 w-full rounded-full sm:h-2';
  return (
    <span
      className="relative flex h-full w-full flex-col items-stretch overflow-hidden rounded-sm text-center"
      style={{
        background: 'linear-gradient(180deg, #f3e6c4 0%, #e6d2a0 55%, #d8bf86 100%)',
        boxShadow: `0 0 0 2px ${moldura}, inset 0 0 12px rgb(120 80 30 / 0.45), 0 3px 0 rgb(0 0 0 / 0.5)`,
      }}
    >
      <span className={rolo} style={{ background: 'linear-gradient(180deg, #8a5a2e, #5e3a1a)' }} />
      {/* Faixa da classe, na cor dela */}
      {!mini && (
        <span className="block py-0.5 font-pixel text-[6px] tracking-wider text-black sm:text-[8px]" style={{ background: moldura }}>
          {PAPEIS[info.papel].toUpperCase()}
        </span>
      )}
      {/* Gota com o custo */}
      <span
        className={`absolute left-1 z-10 grid place-items-center ${mini ? 'top-2 h-5 w-5' : 'top-5 h-6 w-6 sm:top-6 sm:h-8 sm:w-8'}`}
        title={`Custa ${gotas} gotas`}
      >
        <span
          className="absolute inset-0 rotate-45 rounded-[50%_0_50%_50%] border-2 border-[#0b2a5c]"
          style={{ background: gotas === 0 ? '#f2c14e' : 'radial-gradient(circle at 35% 35%, #bfe6ff, #2f86ff 70%)' }}
        />
        <span className={`relative font-pixel text-white [text-shadow:1px_1px_0_#0b2a5c] ${mini ? 'text-[8px]' : 'text-[9px] sm:text-xs'}`}>{gotas}</span>
      </span>
      {/* Janela da arte */}
      <span
        className={`mx-1.5 mt-1 flex items-end justify-center rounded-sm border border-[#8a5a2e]/60 ${mini ? 'py-1' : 'py-1.5'}`}
        style={{ background: `radial-gradient(ellipse at 50% 80%, color-mix(in srgb, ${moldura} 55%, #2a1a10), #2a1a10 80%)` }}
      >
        <Arte tipo={tipo} paleta={paleta} pequena={mini} grande={tamanho === 'mao'} />
      </span>
      {/* Nome escrito no pergaminho */}
      <span
        className={`mx-1 mt-1 px-0.5 font-pixel leading-snug text-[#3a2410] ${mini ? 'text-[5px] sm:text-[6px]' : 'text-[7px] sm:text-[10px]'}`}
        style={{ textShadow: `0 0 1px ${corNome}` }}
      >
        {info.nome.toUpperCase()}
      </span>
      {!mini && (
        <>
          {/* Personalidade e força, escritas por extenso */}
          <span className="mt-1 flex flex-wrap items-center justify-center gap-1 px-1">
            <span className="rounded-sm px-1 py-0.5 font-pixel text-[6px] text-black sm:text-[8px]" style={{ background: moldura }}>
              ★ {info.jeito.toUpperCase()}
            </span>
            {info.forca > 0 && (
              <span className="rounded-sm bg-[#3a2410] px-1 py-0.5 font-pixel text-[6px] text-[#f3e6c4] sm:text-[8px]">FORÇA {info.forca}</span>
            )}
          </span>
          {mostrarDica && <span className="mt-1 px-1.5 text-[10px] leading-snug text-[#3a2410] sm:text-[11px]">{info.dica}</span>}
        </>
      )}
      {rodape}
      <span className={`${rolo} mt-auto`} style={{ background: 'linear-gradient(180deg, #8a5a2e, #5e3a1a)' }} />
    </span>
  );
}
