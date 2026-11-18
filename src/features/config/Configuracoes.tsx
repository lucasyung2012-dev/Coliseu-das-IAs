import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { escolherDificuldade, modoRanqueado, NOMES_DIFICULDADE, useConta, useDificuldade, type Dificuldade } from '@/game/conta';
import { alternarSom, desbloquear, mudarVolume, tocar, useSomLigado, useVolume } from '@/ui/som';
import { mudarPreferencia, usePreferencias } from '@/ui/preferencias';
import { anunciar, escolherVoz, FALA_AMOSTRA, useVozPretor, VOZES } from '@/ui/voz';
import ApagarProgresso from '../arcade/ApagarProgresso';
import SecaoConta from './SecaoConta';

const VERSAO = '0.3';

/** Aba de Configurações: conta, treino, som, animações, progresso e sobre. */
export default function Configuracoes() {
  const ranqueado = modoRanqueado(useConta());
  const dificuldade = useDificuldade();
  const somLigado = useSomLigado();
  const volume = useVolume();
  const pref = usePreferencias();
  const voz = useVozPretor();

  return (
    <main data-area="arcade" className="fundo-arcade relative min-h-screen text-fg">
      <div className="crt-overlay" />
      <div className="relative mx-auto flex max-w-2xl flex-col gap-5 px-4 pb-16 pt-6 sm:px-8">
        <Link to="/arena" onClick={() => tocar('clique')} className="self-start font-pixel text-[10px] text-muted hover:text-accent">
          ◀ ARCADE
        </Link>
        <h1 className="neon font-pixel text-xl text-accent sm:text-2xl">⚙ Configurações</h1>

        <Secao titulo="☁ CONTA">
          <SecaoConta />
        </Secao>

        <Secao titulo="🎯 MODO TREINO">
          <p className="text-sm text-muted">
            {ranqueado
              ? 'Com a conta conectada, as partidas valem troféus e o rival joga pela sua liga. A dificuldade abaixo vale quando você jogar sem conta.'
              : 'Sem conta, as partidas são treino: não valem troféus nem XP. Escolha o quanto o rival é esperto.'}
          </p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Dificuldade do treino">
            {(['facil', 'medio', 'dificil'] as Dificuldade[]).map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={dificuldade === d}
                onClick={() => {
                  desbloquear();
                  tocar('clique');
                  escolherDificuldade(d);
                }}
                className={`px-3 py-2 font-pixel text-[9px] ${dificuldade === d ? 'bg-[rgb(242_193_78)] text-black' : 'pixel-box pixel-hover text-muted'}`}
              >
                {NOMES_DIFICULDADE[d].toUpperCase()}
              </button>
            ))}
          </div>
        </Secao>

        <Secao titulo="🔊 SOM">
          <Chave
            id="som-ligado"
            rotulo="Sons do jogo"
            ligado={somLigado}
            onMudar={() => {
              alternarSom();
              tocar('clique');
            }}
          />
          <label htmlFor="volume" className="flex items-center gap-3 text-sm">
            Volume
            <input
              id="volume"
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              disabled={!somLigado}
              onChange={(ev) => mudarVolume(Number(ev.target.value) / 100)}
              onPointerUp={() => tocar('moeda')}
              className="flex-1 accent-[rgb(var(--accent))]"
            />
            <span className="w-10 text-right font-pixel text-[9px] tabular-nums">{Math.round(volume * 100)}</span>
          </label>
        </Secao>

        <Secao titulo="🎙 VOZ DO PRETOR">
          <p className="text-sm text-muted">Escolha a voz do Pretor Supremo no Tribunal. Toque em Ouvir para testar.</p>
          <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Voz do Pretor">
            {VOZES.map((x) => (
              <button
                key={x.id}
                type="button"
                role="radio"
                aria-checked={voz === x.id}
                onClick={() => {
                  desbloquear();
                  escolherVoz(x.id);
                  anunciar([FALA_AMOSTRA]);
                }}
                className={`px-3 py-2 font-pixel text-[9px] ${voz === x.id ? 'bg-[rgb(242_193_78)] text-black' : 'pixel-box pixel-hover text-muted'}`}
              >
                {x.nome.toUpperCase()}
              </button>
            ))}
            <button
              type="button"
              disabled={!somLigado}
              onClick={() => {
                desbloquear();
                anunciar([FALA_AMOSTRA]);
              }}
              className="pixel-box pixel-hover px-3 py-2 font-pixel text-[9px] text-accent disabled:opacity-40"
            >
              ▶ OUVIR
            </button>
          </div>
        </Secao>

        <Secao titulo="✨ ANIMAÇÕES">
          <Chave
            id="entrada-fliperama"
            rotulo="Entrada do fliperama (moeda, máquina ligando e zoom)"
            ligado={pref.entradaFliperama}
            onMudar={() => mudarPreferencia('entradaFliperama', !pref.entradaFliperama)}
          />
          <Chave
            id="menos-movimento"
            rotulo="Reduzir animações"
            ligado={pref.menosMovimento}
            onMudar={() => mudarPreferencia('menosMovimento', !pref.menosMovimento)}
          />
        </Secao>

        <Secao titulo="🗑 PROGRESSO">
          <p className="text-sm text-muted">Apaga troféus, ligas, Maestria e histórico. Pede duas confirmações.</p>
          <ApagarProgresso />
        </Secao>

        <Secao titulo="ℹ SOBRE">
          <p className="text-sm">
            <strong>Coliseu das IAs</strong> · versão {VERSAO}
          </p>
          <p className="text-sm text-muted">Criado por Lucas Yung, com a ajuda do Claude.</p>
        </Secao>
      </div>
    </main>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section aria-label={titulo.replace(/^\S+\s/, '')} className="pixel-box flex flex-col gap-3 p-4">
      <h2 className="font-pixel text-[10px] text-accent-2">{titulo}</h2>
      {children}
    </section>
  );
}

/** Interruptor liga/desliga no estilo do jogo. */
function Chave({ id, rotulo, ligado, onMudar }: { id: string; rotulo: string; ligado: boolean; onMudar: () => void }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={ligado}
      onClick={() => {
        desbloquear();
        onMudar();
      }}
      className="flex items-center justify-between gap-3 text-left text-sm"
    >
      <span>{rotulo}</span>
      <span className={`shrink-0 px-2 py-1 font-pixel text-[9px] ${ligado ? 'bg-accent text-black' : 'pixel-box text-muted'}`}>{ligado ? 'LIGADO' : 'DESLIGADO'}</span>
    </button>
  );
}
