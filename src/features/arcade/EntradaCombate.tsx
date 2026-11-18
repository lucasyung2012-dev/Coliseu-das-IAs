import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sortearRival, type IaId } from '@/game/personagens';
import { sortearJurados, type JuradoId } from '@/game/jurados';
import { useProgresso } from '@/game/progresso';
import IntroDuelo from './cenas/IntroDuelo';
import IntroTribunal from './cenas/IntroTribunal';
import { desbloquear, tocar } from '@/ui/som';

interface Sorteio {
  rodada: number;
  rival: IaId;
  jurados: JuradoId[];
}

const novoSorteio = (ia: IaId, rodada: number): Sorteio => ({ rodada, rival: sortearRival(ia), jurados: sortearJurados() });

/**
 * Entrada do Duelo ou do Tribunal: o filminho e, por enquanto, o aviso de que a
 * partida em si chega na próxima etapa.
 */
export default function EntradaCombate({ modo }: { modo: 'duelo' | 'tribunal' }) {
  const { iaAtual } = useProgresso();
  const [sorteio, setSorteio] = useState(() => novoSorteio(iaAtual, 0));
  const deNovo = () => {
    desbloquear();
    tocar('clique');
    setSorteio((s) => novoSorteio(iaAtual, s.rodada + 1));
  };

  const fim = (
    <div className="pixel-box flex flex-col items-center gap-4 p-5 text-center">
      <p className="font-pixel text-[10px] text-accent sm:text-xs">TUDO PRONTO PARA O {modo === 'duelo' ? 'DUELO' : 'TRIBUNAL'}</p>
      <p className="max-w-md text-sm text-muted">
        A partida de verdade chega na {modo === 'duelo' ? 'Etapa 1c' : 'Etapa 1b'}. Por enquanto, dá para ver a entrada de novo, com outro rival
        {modo === 'tribunal' ? ' e outros jurados' : ''}.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={deNovo} className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent">
          ↻ VER DE NOVO
        </button>
        <Link to="/arena" className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px]">
          ◀ ARCADE
        </Link>
      </div>
    </div>
  );

  return (
    <main data-area="arcade" className="fundo-arcade relative min-h-screen text-fg">
      <div className="crt-overlay" />
      <div className="relative mx-auto flex max-w-4xl flex-col gap-5 px-4 pb-12 pt-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link to="/arena" className="font-pixel text-[10px] text-muted hover:text-accent">
            ◀ ARCADE
          </Link>
          <p className="font-pixel text-[10px] text-accent-2">{modo === 'duelo' ? '⚔ DUELO' : '⚖ TRIBUNAL'}</p>
        </div>
        {modo === 'duelo' ? (
          <IntroDuelo key={sorteio.rodada} ia={iaAtual} rival={sorteio.rival} fim={fim} />
        ) : (
          <IntroTribunal key={sorteio.rodada} ia={iaAtual} rival={sorteio.rival} jurados={sorteio.jurados} fim={fim} />
        )}
      </div>
    </main>
  );
}
