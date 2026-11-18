import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sortearRival, type IaId } from '@/game/personagens';
import { sortearJurados, type JuradoId } from '@/game/jurados';
import { registrarAbandono, temPartidaAberta, useProgresso } from '@/game/progresso';
import IntroDuelo from './cenas/IntroDuelo';
import IntroTribunal from './cenas/IntroTribunal';
import PartidaTribunal from './tribunal/PartidaTribunal';
import PartidaDuelo from './duelo/PartidaDuelo';
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
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  // O Duelo volta para a sala dele (baralho e Jogar); o Tribunal volta ao Arcade.
  const voltarPara = modo === 'duelo' ? '/arena/duelo' : '/arena';

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
        <p className="max-w-md text-sm text-muted">Protótipo do Duelo: ainda não vale troféus. Sair no meio conta como derrota.</p>
        <div className="flex flex-wrap justify-center gap-3">
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
            ⚔ LUTAR
          </button>
          <button type="button" onClick={deNovo} className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px]">
            ↻ VER DE NOVO
          </button>
          <Link to={voltarPara} className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px]">
            ◀ VOLTAR
          </Link>
        </div>
      </div>
    );

  return (
    <main data-area="arcade" className="fundo-arcade relative min-h-screen text-fg">
      <div className="crt-overlay" />
      <div className={`relative mx-auto flex ${modo === 'duelo' && jogando ? 'max-w-7xl' : 'max-w-4xl'} flex-col gap-5 px-4 pb-16 pt-6 sm:px-8`}>
        <div className="flex items-center justify-between">
          <Link
            to={voltarPara}
            onClick={(ev) => {
              // No meio da partida, sair conta como derrota: pergunta antes.
              if (temPartidaAberta()) {
                ev.preventDefault();
                tocar('falha');
                setConfirmarSaida(true);
              }
            }}
            className="font-pixel text-[10px] text-muted hover:text-accent"
          >
            ◀ {modo === 'duelo' ? 'SALA DO DUELO' : 'ARCADE'}
          </Link>
          <p className="font-pixel text-[10px] text-accent-2">{modo === 'duelo' ? '⚔ DUELO' : '⚖ TRIBUNAL'}</p>
        </div>
        {confirmarSaida && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="Sair da partida?">
            <div className="pixel-box flex max-w-sm flex-col items-center gap-4 bg-[rgb(var(--bg))] p-5 text-center">
              <p className="font-pixel text-xs text-accent-2">SAIR DA PARTIDA?</p>
              <p className="text-sm">
                A partida ainda não acabou. Se você sair agora, ela conta como <strong className="text-accent-2">DERROTA</strong>.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  autoFocus
                  onClick={() => {
                    tocar('clique');
                    setConfirmarSaida(false);
                  }}
                  className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent"
                >
                  ⚔ CONTINUAR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    tocar('derrota');
                    registrarAbandono();
                    navegar(voltarPara);
                  }}
                  className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent-2"
                >
                  SAIR (DERROTA)
                </button>
              </div>
            </div>
          </div>
        )}
        {modo === 'duelo' ? (
          jogando ? (
            <PartidaDuelo key={sorteio.rodada} ia={iaAtual} rival={sorteio.rival} onDeNovo={revanche} onSair={() => navegar('/arena/duelo')} />
          ) : (
            <IntroDuelo key={sorteio.rodada} ia={iaAtual} rival={sorteio.rival} fim={fim} />
          )
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
