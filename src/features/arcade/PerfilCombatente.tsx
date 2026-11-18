import type { CSSProperties, ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { IAS, PERSONAGENS, type IaId } from '@/game/personagens';
import { LIGAS, ligaDe, proximaLiga } from '@/game/ligas';
import { nivelMaestria, totalPartidas, useProgresso, XP_POR_NIVEL, type PlacarModo } from '@/game/progresso';
import { proximoTitulo, tituloDoNivel, TITULOS } from '@/game/maestria';
import { GladiadorPixel } from '@/ui/pixel/Personagens';
import { tocar } from '@/ui/som';

/** Perfil do combatente: troféus e liga, Maestria detalhada, estatísticas e últimas partidas. */
export default function PerfilCombatente() {
  const { ia } = useParams();
  const p = useProgresso();
  if (!ia || !IAS.includes(ia as IaId)) return <Navigate to="/arena" replace />;
  const id = ia as IaId;
  const pers = PERSONAGENS[id];
  const trofeus = p.trofeus[id];
  const prox = proximaLiga(trofeus);
  const xp = p.xp[id];
  const nivel = nivelMaestria(xp);
  const titulo = tituloDoNivel(nivel);
  const proxTitulo = proximoTitulo(nivel);
  const est = p.estatisticas[id];
  const total = totalPartidas(est);
  const vitorias = est.duelo.vitorias + est.tribunal.vitorias;
  const minhas = p.partidas.filter((pt) => pt.ia === id).slice(0, 5);
  const estilo = { '--ia': pers.cor } as CSSProperties;

  return (
    <main data-area="arcade" className="fundo-arcade relative min-h-screen text-fg" style={estilo}>
      <div className="crt-overlay" />
      <div className="relative mx-auto flex max-w-3xl flex-col gap-5 px-4 pb-16 pt-6 sm:px-8">
        <Link to="/arena" onClick={() => tocar('clique')} className="self-start font-pixel text-[10px] text-muted hover:text-accent">
          ◀ ARCADE
        </Link>

        {/* Ficha do gladiador */}
        <section className="pixel-box pixel-ia grid items-center gap-5 p-5 sm:grid-cols-[auto_1fr]" aria-label={`Perfil de ${pers.gladiador}`}>
          <div className="relative mx-auto w-40 sm:w-52">
            <div className="aura-pretor absolute inset-[-10%] rounded-full opacity-60" style={{ background: `radial-gradient(circle, rgb(${pers.cor} / 0.5), transparent 65%)` }} aria-hidden />
            <div className="respirar relative">
              <GladiadorPixel ia={id} />
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-pixel text-[10px] text-[rgb(var(--ia))]">
              {pers.emblema} {pers.ia.toUpperCase()}
            </p>
            <h1 className="mt-2 font-pixel text-3xl sm:text-4xl">{pers.gladiador.toUpperCase()}</h1>
            <p className="mt-1 text-sm text-muted">
              {pers.titulo} · {pers.lema}
            </p>
            <p className="mt-3 inline-block bg-[rgb(var(--ia))] px-2 py-1 font-pixel text-[9px] text-black">★ {titulo.nome.toUpperCase()}</p>
            <p className="mt-3 text-sm italic">"{pers.ficha.frase}"</p>
          </div>
        </section>

        <Bloco titulo="📖 QUEM É {NOME}" nome={pers.gladiador.toUpperCase()}>
          <p className="text-sm leading-relaxed">{pers.ficha.historia}</p>
          <p className="text-sm">
            <strong className="text-[rgb(var(--ia))]">Estilo de luta:</strong> {pers.ficha.estilo}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="pixel-box p-3 text-sm">
              <p className="font-pixel text-[9px] text-accent">PONTOS FORTES</p>
              <ul className="mt-2 space-y-1">
                {pers.ficha.fortes.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
            </div>
            <div className="pixel-box p-3 text-sm">
              <p className="font-pixel text-[9px] text-accent-2">PONTOS FRACOS</p>
              <ul className="mt-2 space-y-1">
                {pers.ficha.fracos.map((f) => (
                  <li key={f}>✗ {f}</li>
                ))}
              </ul>
            </div>
          </div>
        </Bloco>

        <Bloco titulo={`★ HABILIDADE: ${pers.habilidade.nome.toUpperCase()}`}>
          <p className="text-sm">Uma vez por partida, na hora que você escolher.</p>
          <p className="text-sm">
            <strong>⚖ No Tribunal:</strong> {pers.habilidade.tribunal}
          </p>
          <p className="text-sm">
            <strong>⚔ No Duelo:</strong> {pers.habilidade.duelo}
          </p>
          <p className="pixel-box p-3 text-sm" style={{ borderLeft: '4px solid rgb(var(--ia))' }}>
            💡 <strong>Dica:</strong> {pers.habilidade.dica}
          </p>
        </Bloco>

        {/* Troféus e liga */}
        <Bloco titulo="🏆 TROFÉUS E LIGA">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-pixel text-2xl tabular-nums">{trofeus}</span>
            <span className="font-pixel text-[10px] text-accent">{ligaDe(trofeus).nome.toUpperCase()}</span>
          </div>
          <Barra valor={prox ? prox.progresso : 1} rotulo="Progresso até a próxima liga" />
          <p className="text-xs text-muted">{prox ? `Faltam ${prox.faltam} troféus para ${prox.liga.nome}.` : 'Você chegou à liga máxima: Imperadores!'}</p>
          {/* Prévia da trilha: as 5 ligas em ordem. A trilha completa, em mapa, vem depois. */}
          <ol className="mt-2 grid grid-cols-5 gap-1.5" aria-label="Ligas">
            {LIGAS.map((l) => {
              const alcancada = trofeus >= l.min;
              const atual = ligaDe(trofeus).id === l.id;
              return (
                <li
                  key={l.id}
                  className={`pixel-box p-1.5 text-center ${alcancada ? '' : 'opacity-40'}`}
                  style={atual ? { boxShadow: '0 0 0 3px rgb(var(--ia)), 0 0 18px -4px rgb(var(--ia))' } : undefined}
                >
                  <p className="text-base">{alcancada ? '🏛️' : '🔒'}</p>
                  <p className="mt-1 font-pixel text-[6px] sm:text-[8px]">{l.nome.toUpperCase()}</p>
                  <p className="text-[10px] tabular-nums text-muted">{l.min}+</p>
                </li>
              );
            })}
          </ol>
          <Link
            to={`/arena/mapa/${id}`}
            onClick={() => tocar('selecionar')}
            className="pixel-box pixel-hover self-start px-3 py-2 font-pixel text-[10px] text-[rgb(242_193_78)]"
          >
            🗺 ABRIR O MAPA DE TROFÉUS
          </Link>
        </Bloco>

        {/* Maestria */}
        <Bloco titulo="⭐ MAESTRIA">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-pixel text-lg">
              NÍVEL {nivel}
              <span className="text-xs text-muted"> / 100</span>
            </p>
            <p className="text-xs text-muted tabular-nums">{xp} XP no total</p>
          </div>
          <Barra valor={(xp % XP_POR_NIVEL) / XP_POR_NIVEL} rotulo="Progresso no nível" />
          <p className="text-xs text-muted">
            {xp % XP_POR_NIVEL}/{XP_POR_NIVEL} XP neste nível
          </p>
          <p className="text-sm">
            Título atual: <strong className="text-[rgb(var(--ia))]">{titulo.nome}</strong>. <span className="text-muted">{titulo.frase}</span>
          </p>
          {proxTitulo && (
            <p className="text-sm text-muted">
              Próximo título: <strong className="text-fg">{proxTitulo.nome}</strong> no nível {proxTitulo.nivel} (faltam {(proxTitulo.nivel - 1) * XP_POR_NIVEL - xp} XP).
            </p>
          )}
          <ol className="mt-1 grid grid-cols-2 gap-1.5 sm:grid-cols-4" aria-label="Títulos de Maestria">
            {TITULOS.map((t) => {
              const ganho = nivel >= t.nivel;
              return (
                <li key={t.nivel} className={`pixel-box p-2 text-xs ${ganho ? '' : 'opacity-45'}`}>
                  <p className="font-pixel text-[8px] text-muted">NÍVEL {t.nivel}</p>
                  <p className={`mt-1 ${ganho ? 'text-[rgb(var(--ia))]' : ''}`}>
                    {ganho ? '✓' : '🔒'} {t.nome}
                  </p>
                </li>
              );
            })}
          </ol>
          <p className="text-xs text-muted">Como ganhar XP: vitória +40, empate +20, derrota +20. Treino não dá XP.</p>
        </Bloco>

        {/* Estatísticas */}
        <Bloco titulo="📊 ESTATÍSTICAS">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Numero rotulo="Partidas" valor={total} />
            <Numero rotulo="Vitórias" valor={total ? `${Math.round((vitorias / total) * 100)}%` : '—'} />
            <Numero rotulo="Sequência atual" valor={est.sequencia} />
            <Numero rotulo="Melhor sequência" valor={est.melhorSequencia} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Placar nome="⚔ Duelo" placar={est.duelo} />
            <Placar nome="⚖ Tribunal" placar={est.tribunal} />
          </div>
          <p className="text-xs text-muted">Só partidas que valem troféus. O treino não entra aqui.</p>
        </Bloco>

        <Bloco titulo="📜 ÚLTIMAS PARTIDAS DE {NOME}" nome={pers.gladiador.toUpperCase()}>
          {minhas.length === 0 ? (
            <p className="text-sm text-muted">{pers.gladiador} ainda não pisou na arena.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {minhas.map((pt) => (
                <li key={pt.id} className="flex items-center gap-2">
                  <span aria-hidden>{pt.modo === 'duelo' ? '⚔' : '⚖'}</span>
                  <span className="min-w-0 flex-1 truncate">
                    contra {PERSONAGENS[pt.rival].gladiador} ·{' '}
                    <span className={pt.empate ? 'text-muted' : pt.venceu ? 'text-accent' : 'text-accent-2'}>{pt.empate ? 'Empate' : pt.venceu ? 'Vitória' : 'Derrota'}</span>
                  </span>
                  <span className="font-pixel text-[9px] tabular-nums text-muted">{pt.treino ? 'TREINO' : `${pt.trofeus > 0 ? '+' : ''}${pt.trofeus} 🏆`}</span>
                </li>
              ))}
            </ul>
          )}
        </Bloco>
      </div>
    </main>
  );
}

function Bloco({ titulo, nome, children }: { titulo: string; nome?: string; children: ReactNode }) {
  const texto = nome ? titulo.replace('{NOME}', nome) : titulo;
  return (
    <section aria-label={texto.replace(/^\S+\s/, '')} className="pixel-box flex flex-col gap-3 p-4">
      <h2 className="font-pixel text-[10px] text-accent-2">{texto}</h2>
      {children}
    </section>
  );
}

function Barra({ valor, rotulo }: { valor: number; rotulo: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, valor)) * 100);
  return (
    <div role="progressbar" aria-label={rotulo} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="h-3 overflow-hidden bg-bg">
      <div
        className="h-full bg-[repeating-linear-gradient(90deg,rgb(var(--ia))_0_10px,transparent_10px_12px)] transition-[width] duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Numero({ rotulo, valor }: { rotulo: string; valor: ReactNode }) {
  return (
    <div className="pixel-box p-2 text-center">
      <p className="font-pixel text-base tabular-nums">{valor}</p>
      <p className="mt-1 text-[11px] text-muted">{rotulo}</p>
    </div>
  );
}

function Placar({ nome, placar }: { nome: string; placar: PlacarModo }) {
  return (
    <div className="pixel-box flex items-center justify-between gap-2 p-2 text-sm">
      <span>{nome}</span>
      <span className="tabular-nums">
        <span className="text-accent">{placar.vitorias}V</span> · <span className="text-muted">{placar.empates}E</span> ·{' '}
        <span className="text-accent-2">{placar.derrotas}D</span>
      </span>
    </div>
  );
}
