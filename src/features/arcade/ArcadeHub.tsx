import { Link } from 'react-router-dom';
import { IAS, PERSONAGENS, nomeGladiador, type IaId } from '@/game/personagens';
import { ligaDe, proximaLiga, variacaoTrofeus } from '@/game/ligas';
import { escolherIa, nivelMaestria, useProgresso, XP_POR_NIVEL, type Partida } from '@/game/progresso';

const corIa = (id: IaId) => `rgb(${PERSONAGENS[id].cor})`;

export default function ArcadeHub() {
  const p = useProgresso();
  const ia = p.iaAtual;
  const trofeus = p.trofeus[ia];
  const prox = proximaLiga(trofeus);

  return (
    <main data-area="arcade" className="min-h-screen bg-bg text-fg">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-8">
        <Link to="/" className="self-start text-sm text-muted hover:text-accent">
          ← Início
        </Link>

        <header className="animate-fade-up">
          <p className="text-xs uppercase tracking-[0.3em] text-accent-2">A glória tem um novo jogo</p>
          <h1 className="mt-2 font-arcade text-4xl text-accent drop-shadow-[0_0_18px_rgb(var(--accent)/0.45)] sm:text-5xl">
            Imperium Arcade
          </h1>
        </header>

        <section aria-labelledby="titulo-combatente">
          <h2 id="titulo-combatente" className="mb-3 text-sm uppercase tracking-widest text-muted">
            Seu combatente
          </h2>
          <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Escolha sua IA">
            {IAS.map((id) => {
              const pers = PERSONAGENS[id];
              const ativo = id === ia;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={ativo}
                  onClick={() => escolherIa(id)}
                  style={{ borderColor: ativo ? corIa(id) : undefined, boxShadow: ativo ? `0 0 24px -6px ${corIa(id)}` : undefined }}
                  className="rounded-2xl border border-line bg-surface p-4 text-left transition hover:-translate-y-0.5"
                >
                  <span className="text-2xl" style={{ color: corIa(id) }} aria-hidden>
                    {pers.emblema}
                  </span>
                  <p className="mt-1 font-arcade text-lg">{pers.ia}</p>
                  <p className="text-sm text-muted">{nomeGladiador(id)}</p>
                  <p className="mt-2 text-xs text-muted">
                    🏆 {p.trofeus[id]} · {ligaDe(p.trofeus[id]).nome} · Maestria {nivelMaestria(p.xp[id])}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5" aria-label="Liga e maestria">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-arcade text-2xl">
              🏆 {trofeus} <span className="text-base text-muted">· {ligaDe(trofeus).nome}</span>
            </p>
            <p className="text-sm text-muted">
              {prox ? `Faltam ${prox.faltam} para ${prox.liga.nome}` : 'Liga máxima: Imperadores'}
            </p>
          </div>
          <Barra valor={prox ? prox.progresso : 1} rotulo="Progresso até a próxima liga" />
          <p className="mt-4 text-sm text-muted">
            Maestria {nivelMaestria(p.xp[ia])} · {p.xp[ia] % XP_POR_NIVEL}/{XP_POR_NIVEL} XP
          </p>
          <Barra valor={(p.xp[ia] % XP_POR_NIVEL) / XP_POR_NIVEL} rotulo="Progresso de Maestria" fina />
          <p className="mt-4 text-sm">
            <span className="text-accent">Habilidade · {PERSONAGENS[ia].habilidade.nome}:</span>{' '}
            <span className="text-muted">{PERSONAGENS[ia].habilidade.tribunal}</span>
          </p>
        </section>

        <section aria-labelledby="titulo-modos">
          <h2 id="titulo-modos" className="mb-3 text-sm uppercase tracking-widest text-muted">
            Escolha seu combate
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <CartaoModo
              rota="/arena/duelo"
              titulo="Duelo"
              frase="Um round. Duas cartas. Um veredito."
              ganho={variacaoTrofeus('duelo', trofeus, true)}
              perda={variacaoTrofeus('duelo', trofeus, false)}
            />
            <CartaoModo
              rota="/arena/tribunal"
              titulo="Tribunal"
              frase="Três tempos. Cinco jurados. Conquiste a maioria."
              ganho={variacaoTrofeus('tribunal', trofeus, true)}
              perda={variacaoTrofeus('tribunal', trofeus, false)}
            />
          </div>
        </section>

        <Historico partidas={p.partidas} />
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
      className={`mt-2 overflow-hidden rounded-full bg-bg ${fina ? 'h-1.5' : 'h-2.5'}`}
    >
      <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-all duration-700" style={{ width: `${pct}%` }} />
    </div>
  );
}

function CartaoModo(props: { rota: string; titulo: string; frase: string; ganho: number; perda: number }) {
  return (
    <Link
      to={props.rota}
      className="group rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-1 hover:border-accent hover:shadow-[0_0_30px_-8px_rgb(var(--accent)/0.6)]"
    >
      <h3 className="font-arcade text-2xl text-accent">{props.titulo}</h3>
      <p className="mt-1 text-sm text-muted">{props.frase}</p>
      <p className="mt-3 text-sm tabular-nums">
        Vitória <span className="text-accent">+{props.ganho}</span> · Derrota <span className="text-accent-2">{props.perda}</span>
      </p>
      <span className="mt-3 inline-block text-sm text-accent transition group-hover:translate-x-1">Entrar →</span>
    </Link>
  );
}

function Historico({ partidas }: { partidas: Partida[] }) {
  return (
    <section aria-labelledby="titulo-historico">
      <h2 id="titulo-historico" className="mb-3 text-sm uppercase tracking-widest text-muted">
        Últimas partidas
      </h2>
      {partidas.length === 0 ? (
        <p className="text-sm text-muted">A primeira glória ainda está por conquistar.</p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {partidas.slice(0, 8).map((pt) => (
            <li key={pt.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="min-w-0 truncate">
                {pt.modo === 'duelo' ? '⚔️' : '⚖️'} {PERSONAGENS[pt.ia].ia} vs {PERSONAGENS[pt.rival].ia} ·{' '}
                <span className={pt.venceu ? 'text-accent' : 'text-accent-2'}>{pt.venceu ? 'Vitória' : 'Derrota'}</span>
              </span>
              <span className="shrink-0 tabular-nums text-muted">{pt.trofeus > 0 ? `+${pt.trofeus}` : pt.trofeus} 🏆</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
