import { useCallback, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IAS, PERSONAGENS, type IaId } from '@/game/personagens';
import { ligaDe, proximaLiga, variacaoTrofeus } from '@/game/ligas';
import { escolherIa, nivelMaestria, useProgresso, XP_POR_NIVEL, type Partida } from '@/game/progresso';
import { GladiadorPixel } from '@/ui/pixel/Personagens';
import Sprite from '@/ui/pixel/Sprite';
import { LOUROS, PALETA_OURO } from '@/ui/pixel/sprites';
import BootArcade from './BootArcade';
import ApagarProgresso from './ApagarProgresso';
import { desbloquear, tocar } from '@/ui/som';

const CHAVE_BOOT = 'coliseu.boot.vista';

function jaViuBootNestaVisita(): boolean {
  try {
    return sessionStorage.getItem(CHAVE_BOOT) === '1';
  } catch {
    return false;
  }
}

/** Cor da IA como variável CSS --ia, para bordas e brilhos. */
const varIa = (id: IaId) => ({ '--ia': PERSONAGENS[id].cor }) as CSSProperties;

export default function ArcadeHub() {
  const p = useProgresso();
  const location = useLocation();
  // O fliperama liga ao chegar pela tela inicial, e na primeira vez de cada visita.
  const [boot, setBoot] = useState(() => (location.state as { boot?: boolean } | null)?.boot === true || !jaViuBootNestaVisita());
  const fimBoot = useCallback(() => {
    try {
      sessionStorage.setItem(CHAVE_BOOT, '1');
    } catch {
      /* sem armazenamento: liga de novo na próxima vez */
    }
    setBoot(false);
  }, []);

  // Troca de personagem: o anterior sai correndo enquanto o novo chega.
  const [troca, setTroca] = useState<{ n: number; anterior: IaId | null }>({ n: 0, anterior: null });
  const trocarPara = (id: IaId) => {
    if (id === p.iaAtual) return;
    desbloquear();
    tocar('selecionar');
    setTroca((t) => ({ n: t.n + 1, anterior: p.iaAtual }));
    escolherIa(id);
  };

  const ia = p.iaAtual;
  const pers = PERSONAGENS[ia];
  const trofeus = p.trofeus[ia];
  const prox = proximaLiga(trofeus);
  const xpNivel = p.xp[ia] % XP_POR_NIVEL;

  return (
    <main data-area="arcade" className="fundo-arcade relative min-h-screen text-fg">
      {boot && <BootArcade onFim={fimBoot} />}
      <div className="crt-overlay" />

      <div className="relative mx-auto flex max-w-5xl flex-col gap-7 px-4 pb-12 pt-6 sm:px-8">
        <Link to="/" onClick={() => tocar('clique')} className="self-start font-pixel text-[10px] text-muted hover:text-accent">
          ◀ INÍCIO
        </Link>

        <header className="flex items-center justify-center gap-3 text-center sm:gap-5">
          <Sprite grade={LOUROS} paleta={PALETA_OURO} escala={4} />
          <div>
            <h1 className="neon letreiro font-pixel text-xl leading-snug text-accent sm:text-3xl">Imperium Arcade</h1>
            <p className="mt-2 font-pixel text-[9px] tracking-[0.25em] text-accent-2 sm:text-[10px]">A GLÓRIA TEM UM NOVO JOGO</p>
          </div>
          <Sprite grade={LOUROS} paleta={PALETA_OURO} escala={4} espelhar />
        </header>

        {/* Gladiador em destaque */}
        <section
          aria-label={`Seu combatente: ${pers.gladiador}`}
          style={varIa(ia)}
          className="pixel-box pixel-ia grid items-center gap-5 p-5 sm:grid-cols-[auto_1fr] sm:gap-8"
        >
          <div className="relative mx-auto w-36 sm:w-48">
            <div className="absolute inset-x-2 -bottom-1 h-4 rounded-[50%] bg-[rgb(var(--ia)/0.45)] blur-md" aria-hidden />
            <div key={`onda-${troca.n}`} className="onda absolute inset-x-0 bottom-0 h-6 rounded-[50%] border-4 border-[rgb(var(--ia))]" aria-hidden />
            {troca.anterior && (
              <div
                key={`sai-${troca.n}`}
                className="sair-troca absolute inset-0"
                onAnimationEnd={() => setTroca((t) => ({ ...t, anterior: null }))}
                aria-hidden
              >
                <GladiadorPixel ia={troca.anterior} />
              </div>
            )}
            <div key={`chega-${troca.n}`} className="chegar-troca">
              <div className="respirar">
                <GladiadorPixel ia={ia} />
              </div>
            </div>
          </div>
          <div key={`info-${troca.n}`} className="min-w-0">
            <p className="font-pixel text-[10px] text-[rgb(var(--ia))]">
              {pers.emblema} {pers.ia.toUpperCase()}
            </p>
            <h2 className="nome-troca mt-2 font-pixel text-2xl text-fg sm:text-3xl">{pers.gladiador.toUpperCase()}</h2>
            <p className="mt-1 text-sm text-muted">
              {pers.titulo} · {pers.lema}
            </p>

            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-pixel text-lg tabular-nums">🏆 {trofeus}</span>
              <span className="pixel-box px-2 py-1 font-pixel text-[9px] text-accent">{ligaDe(trofeus).nome.toUpperCase()}</span>
            </div>
            <Barra valor={prox ? prox.progresso : 1} rotulo="Progresso até a próxima liga" />
            <p className="mt-1 text-xs text-muted">{prox ? `Faltam ${prox.faltam} troféus para ${prox.liga.nome}` : 'Liga máxima: Imperadores'}</p>

            <p className="mt-3 font-pixel text-[10px]">
              MAESTRIA {nivelMaestria(p.xp[ia])} <span className="text-muted">· {xpNivel}/{XP_POR_NIVEL} XP</span>
            </p>
            <Barra valor={xpNivel / XP_POR_NIVEL} rotulo="Progresso de Maestria" fina />

            <p className="mt-4 text-sm">
              <span className="font-pixel text-[10px] text-[rgb(var(--ia))]">★ {pers.habilidade.nome.toUpperCase()}</span>
              <span className="mt-1 block text-muted">
                Duelo: {pers.habilidade.duelo} Tribunal: {pers.habilidade.tribunal}
              </span>
            </p>
          </div>
        </section>

        {/* Escolha da IA: lado a lado até no celular */}
        <section aria-labelledby="titulo-escolha">
          <h2 id="titulo-escolha" className="mb-3 font-pixel text-[10px] text-muted">
            ESCOLHA SEU COMBATENTE
          </h2>
          <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Escolha sua IA">
            {IAS.map((id) => {
              const ativo = id === ia;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={ativo}
                  aria-label={`${PERSONAGENS[id].ia}: ${PERSONAGENS[id].gladiador}`}
                  onClick={() => trocarPara(id)}
                  style={varIa(id)}
                  className={`pixel-box flex flex-col items-center gap-2 p-3 transition hover:-translate-y-0.5 ${
                    ativo ? 'pixel-ia' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div key={ativo ? `ativo-${troca.n}` : 'parado'} className={`w-10 sm:w-14 ${ativo && troca.n > 0 ? 'pulo' : ''}`}>
                    <GladiadorPixel ia={id} />
                  </div>
                  <span className="font-pixel text-[9px] sm:text-[10px]">{PERSONAGENS[id].ia}</span>
                  <span className="text-[11px] tabular-nums text-muted">🏆 {p.trofeus[id]}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="titulo-modos">
          <h2 id="titulo-modos" className="mb-3 font-pixel text-[10px] text-muted">
            ESCOLHA SEU COMBATE
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <CartaoModo
              rota="/arena/duelo"
              icone="⚔"
              titulo="Duelo"
              frase="Um round. Duas cartas. Um veredito."
              ganho={variacaoTrofeus('duelo', trofeus, true)}
              perda={variacaoTrofeus('duelo', trofeus, false)}
            />
            <CartaoModo
              rota="/arena/tribunal"
              icone="⚖"
              titulo="Tribunal"
              frase="Três tempos. Cinco jurados. Conquiste a maioria."
              ganho={variacaoTrofeus('tribunal', trofeus, true)}
              perda={variacaoTrofeus('tribunal', trofeus, false)}
            />
          </div>
        </section>

        <Historico partidas={p.partidas} />
        <ApagarProgresso />
      </div>
    </main>
  );
}

function Barra({ valor, rotulo, fina }: { valor: number; rotulo: string; fina?: boolean }) {
  const pct = Math.round(Math.max(0, Math.min(1, valor)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={rotulo}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`mt-2 overflow-hidden bg-bg ${fina ? 'h-2' : 'h-3'}`}
    >
      {/* Barra em "blocos", como a vida de um jogo antigo. */}
      <div
        className="h-full bg-[repeating-linear-gradient(90deg,rgb(var(--accent))_0_10px,transparent_10px_12px)] transition-[width] duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function CartaoModo(props: { rota: string; icone: ReactNode; titulo: string; frase: string; ganho: number; perda: number }) {
  return (
    <Link to={props.rota} onMouseEnter={() => tocar('passarMouse')} onClick={() => { desbloquear(); tocar('clique'); }} className="pixel-box pixel-hover group block min-w-0 p-5 transition hover:-translate-y-1">
      <div className="flex items-center gap-3">
        <span className="text-3xl text-accent" aria-hidden>
          {props.icone}
        </span>
        <h3 className="neon min-w-0 font-pixel text-base text-accent sm:text-xl">{props.titulo}</h3>
      </div>
      <p className="mt-3 text-sm text-muted">{props.frase}</p>
      <p className="mt-3 text-sm tabular-nums">
        Vitória <span className="text-accent">+{props.ganho}</span> · Derrota{' '}
        {props.perda === 0 ? (
          <span className="text-muted">0 (você ainda não tem troféus a perder)</span>
        ) : (
          <span className="text-accent-2">{props.perda}</span>
        )}
      </p>
      <span className="piscar mt-4 inline-block font-pixel text-[10px] text-accent">▶ ENTRAR</span>
    </Link>
  );
}

function Historico({ partidas }: { partidas: Partida[] }) {
  return (
    <section aria-labelledby="titulo-historico">
      <h2 id="titulo-historico" className="mb-3 font-pixel text-[10px] text-muted">
        ÚLTIMAS PARTIDAS
      </h2>
      {partidas.length === 0 ? (
        <p className="text-sm text-muted">A primeira glória ainda está por conquistar.</p>
      ) : (
        <ul className="pixel-box divide-y divide-line">
          {partidas.slice(0, 8).map((pt) => (
            <li key={pt.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="min-w-0 truncate">
                {pt.modo === 'duelo' ? '⚔' : '⚖'} {PERSONAGENS[pt.ia].gladiador} vs {PERSONAGENS[pt.rival].gladiador} ·{' '}
                <span className={pt.empate ? 'text-muted' : pt.venceu ? 'text-accent' : 'text-accent-2'}>{pt.empate ? 'Empate' : pt.venceu ? 'Vitória' : 'Derrota'}</span>
              </span>
              <span className="shrink-0 font-pixel text-[10px] tabular-nums text-muted">
                {pt.trofeus > 0 ? `+${pt.trofeus}` : pt.trofeus} 🏆
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
