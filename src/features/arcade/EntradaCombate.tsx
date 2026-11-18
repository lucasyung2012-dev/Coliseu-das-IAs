import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sortearRival, type IaId } from '@/game/personagens';
import { sortearJurados, type JuradoId } from '@/game/jurados';
import { useProgresso } from '@/game/progresso';
import IntroDuelo from './cenas/IntroDuelo';
import IntroTribunal from './cenas/IntroTribunal';
import PartidaTribunal from './tribunal/PartidaTribunal';
import { desbloquear, tocar } from '@/ui/som';

interface Sorteio {
  rodada: number;
  rival: IaId;
  jurados: JuradoId[];
}

const novoSorteio = (ia: IaId, rodada: number, rival?: IaId): Sorteio => ({ rodada, rival: rival ?? sortearRival(ia), jurados: sortearJurados() });

/**
 * Entrada do Duelo ou do Tribunal: o filminho e, depois dele, a partida.
 * O Tribunal já é jogável (Etapa 1b); o Duelo chega na Etapa 1c.
 */
export default function EntradaCombate({ modo }: { modo: 'duelo' | 'tribunal' }) {
  const { iaAtual } = useProgresso();
  const navegar = useNavigate();
  const [sorteio, setSorteio] = useState(() => novoSorteio(iaAtual, 0));
  const [jogando, setJogando] = useState(false);

  const deNovo = () => {
    desbloquear();
    tocar('clique');
    setSorteio((s) => novoSorteio(iaAtual, s.rodada + 1));
  };
  // Revanche: mesmo rival, júri novo, direto para a partida (sem repetir o filminho).
  const revanche = () => setSorteio((s) => novoSorteio(iaAtual, s.rodada + 1, s.rival));

  const fim =
    modo === 'tribunal' ? (
      <div className="pixel-box flex flex-col items-center gap-4 p-5 text-center">
        <p className="font-pixel text-[10px] text-accent sm:text-xs">O JÚRI ESTÁ PRONTO</p>
        <button
          type="button"
          autoFocus
          onClick={() => {
            desbloquear();
            tocar('start');
            setJogando(true);
          }}
          className="pixel-box pixel-hover px-5 py-3 font-pixel text-xs text-accent"
        >
          ⚖ ENTRAR NA SESSÃO
        </button>
      </div>
    ) : (
      <div className="pixel-box flex flex-col items-center gap-4 p-5 text-center">
        <p className="font-pixel text-[10px] text-accent sm:text-xs">TUDO PRONTO PARA O DUELO</p>
        <p className="max-w-md text-sm text-muted">A partida de verdade chega na Etapa 1c. Por enquanto, dá para ver a entrada de novo, com outro rival.</p>
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
      <div className="relative mx-auto flex max-w-4xl flex-col gap-5 px-4 pb-16 pt-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link to="/arena" className="font-pixel text-[10px] text-muted hover:text-accent">
            ◀ ARCADE
          </Link>
          <p className="font-pixel text-[10px] text-accent-2">{modo === 'duelo' ? '⚔ DUELO' : '⚖ TRIBUNAL'}</p>
        </div>
        {modo === 'duelo' ? (
          <IntroDuelo key={sorteio.rodada} ia={iaAtual} rival={sorteio.rival} fim={fim} />
        ) : jogando ? (
          <PartidaTribunal
            key={sorteio.rodada}
            ia={iaAtual}
            rival={sorteio.rival}
            jurados={sorteio.jurados}
            onRevanche={revanche}
            onSair={() => navegar('/arena')}
          />
        ) : (
          <IntroTribunal key={sorteio.rodada} ia={iaAtual} rival={sorteio.rival} jurados={sorteio.jurados} fim={fim} />
        )}
      </div>
    </main>
  );
}
