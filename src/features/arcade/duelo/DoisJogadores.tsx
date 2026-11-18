import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IAS, PERSONAGENS, type IaId } from '@/game/personagens';
import { useProgresso } from '@/game/progresso';
import { ESTILO_PREFERIDO, ESTILOS } from '@/game/duelo/motor';
import { GladiadorPixel } from '@/ui/pixel/Personagens';
import GladiadorEnfeitado from '@/ui/pixel/GladiadorEnfeitado';
import { desbloquear, tocar } from '@/ui/som';
import PartidaDuelo from './PartidaDuelo';

/**
 * Duelo de 2 jogadores no mesmo aparelho (pedido do Lucas). O Jogador 1 usa a IA
 * e o baralho dele; o Jogador 2 escolhe uma das outras IAs e joga com o baralho
 * inicial dela. Partida amistosa: não vale troféus nem entra no histórico.
 */
export default function DoisJogadores() {
  const { iaAtual } = useProgresso();
  const navegar = useNavigate();
  const [jogador2, setJogador2] = useState<IaId | null>(null);
  const [rodada, setRodada] = useState(0);
  const p1 = PERSONAGENS[iaAtual];

  return (
    <main data-area="arcade" className="fundo-arcade relative min-h-screen text-fg">
      <div className="crt-overlay" />
      <div className={`relative mx-auto flex ${jogador2 ? 'max-w-[1600px]' : 'max-w-4xl'} flex-col gap-5 px-4 pb-16 pt-6 sm:px-8`}>
        <div className="flex items-center justify-between">
          <Link to="/arena/duelo" onClick={() => tocar('clique')} className="font-pixel text-[10px] text-muted hover:text-accent">
            ◀ SALA DO DUELO
          </Link>
          <p className="font-pixel text-[10px] text-accent-2">👥 2 JOGADORES</p>
        </div>

        {jogador2 ? (
          <PartidaDuelo
            key={rodada}
            ia={iaAtual}
            rival={jogador2}
            doisJogadores
            onDeNovo={() => setRodada((r) => r + 1)}
            onSair={() => navegar('/arena/duelo')}
          />
        ) : (
          <>
            <header className="text-center">
              <h1 className="neon font-pixel text-lg text-accent sm:text-2xl">👥 DUELO DE 2 JOGADORES</h1>
              <p className="mt-2 text-sm text-muted">No mesmo aparelho: o Jogador 1 joga do lado esquerdo e o Jogador 2 do lado direito. Partida amistosa, não vale troféus.</p>
            </header>
            <div className="grid gap-4 sm:grid-cols-2">
              <section aria-label="Jogador 1" className="pixel-box flex items-center gap-4 p-4" style={{ boxShadow: `0 0 0 3px rgb(${p1.cor})` }}>
                <div className="w-16 shrink-0 sm:w-20">
                  <GladiadorEnfeitado ia={iaAtual} parado />
                </div>
                <div>
                  <p className="font-pixel text-[9px] text-muted">JOGADOR 1</p>
                  <p className="font-pixel text-sm" style={{ color: `rgb(${p1.cor})` }}>
                    {p1.gladiador.toUpperCase()} · {p1.ia.toUpperCase()}
                  </p>
                  <p className="mt-1 text-xs text-muted">Joga com o seu baralho salvo.</p>
                </div>
              </section>
              <section aria-label="Jogador 2" className="pixel-box flex flex-col gap-3 p-4">
                <p className="font-pixel text-[9px] text-muted">JOGADOR 2: ESCOLHA A SUA IA</p>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="IA do Jogador 2">
                  {IAS.filter((id) => id !== iaAtual).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        desbloquear();
                        tocar('start');
                        setJogador2(id);
                      }}
                      aria-label={`Jogador 2 com ${PERSONAGENS[id].ia}`}
                      className="pixel-box pixel-hover flex flex-col items-center gap-1 p-3"
                      style={{ boxShadow: `0 0 0 2px rgb(${PERSONAGENS[id].cor})` }}
                    >
                      <span className="w-12">
                        <GladiadorPixel ia={id} />
                      </span>
                      <span className="font-pixel text-[9px]" style={{ color: `rgb(${PERSONAGENS[id].cor})` }}>
                        {PERSONAGENS[id].ia.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-muted">Baralho {ESTILOS[ESTILO_PREFERIDO[id]].nome}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
            <p className="text-center text-xs text-muted">No teclado: Jogador 1 usa 1 a 4 e G; Jogador 2 usa 7, 8, 9, 0 e H.</p>
          </>
        )}
      </div>
    </main>
  );
}
