import { useCallback, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IAS, PERSONAGENS, type IaId } from '@/game/personagens';
import { indiceLiga, ligaDe, patenteDe, proximaLiga, variacaoTrofeus } from '@/game/ligas';
import { escolherIa, nivelMaestria, useColiseu, useProgresso, XP_POR_NIVEL, type Partida } from '@/game/progresso';
import { GladiadorPixel, JuradoPixel, PretorPixel } from '@/ui/pixel/Personagens';
import GladiadorEnfeitado from '@/ui/pixel/GladiadorEnfeitado';
import { CenaColiseu, CenaTribunal } from './cenas/Cenarios';
import { tituloDoNivel } from '@/game/maestria';
import Sprite from '@/ui/pixel/Sprite';
import { LOUROS, PALETA_OURO } from '@/ui/pixel/sprites';
import BootArcade from './BootArcade';
import { modoRanqueado, NOMES_DIFICULDADE, useConta, useDificuldade } from '@/game/conta';
import { usePreferencias } from '@/ui/preferencias';
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
  const treino = !modoRanqueado(useConta());
  const dificuldade = useDificuldade();
  const { entradaFliperama } = usePreferencias();
  const location = useLocation();
  // O fliperama liga ao chegar pela tela inicial e na primeira vez de cada visita
  // (a não ser que a entrada esteja desligada nas Configurações).
  const [boot, setBoot] = useState(
    () => entradaFliperama && ((location.state as { boot?: boolean } | null)?.boot === true || !jaViuBootNestaVisita()),
  );
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
        <div className="flex items-center justify-between gap-3">
          <Link to="/" onClick={() => tocar('clique')} className="font-pixel text-[10px] text-muted hover:text-accent">
            ◀ INÍCIO
          </Link>
          <Link
            to="/configuracoes"
            onClick={() => tocar('clique')}
            aria-label="Configurações"
            className="pixel-box pixel-hover px-2.5 py-1.5 font-pixel text-[10px] text-muted hover:text-accent"
          >
            ⚙ CONFIG
          </Link>
        </div>

        <header className="flex items-center justify-center gap-3 text-center sm:gap-5">
          <Sprite grade={LOUROS} paleta={PALETA_OURO} escala={4} />
          <div>
            <h1 className="neon letreiro font-pixel text-xl leading-snug text-accent sm:text-3xl">Imperium Arcade</h1>
            <p className="mt-2 font-pixel text-[9px] tracking-[0.25em] text-accent-2 sm:text-[10px]">TODOS OS CAMINHOS LEVAM À ARENA</p>
          </div>
          <Sprite grade={LOUROS} paleta={PALETA_OURO} escala={4} espelhar />
        </header>

        {/* Etiqueta do modo: com conta vale troféus; sem conta é treino (detalhes em Configurações). */}
        <Link
          to="/configuracoes"
          onClick={() => tocar('clique')}
          className={`-mt-3 self-center px-3 py-1 text-center font-pixel text-[9px] leading-relaxed hover:underline ${treino ? 'text-[rgb(242_193_78)]' : 'text-accent'}`}
        >
          {treino ? `🎯 TREINO · ${NOMES_DIFICULDADE[dificuldade].toUpperCase()} · CONECTE A CONTA PARA VALER TROFÉUS` : '🏆 VALENDO TROFÉUS'}
        </Link>

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
                <GladiadorEnfeitado ia={troca.anterior} parado />
              </div>
            )}
            <div key={`chega-${troca.n}`} className="chegar-troca">
              <GladiadorEnfeitado ia={ia} comMoldura />
            </div>
          </div>
          <div key={`info-${troca.n}`} className="min-w-0">
            <p className="font-pixel text-[10px] text-[rgb(var(--ia))]">
              {pers.emblema} {pers.ia.toUpperCase()}
            </p>
            <p className="mt-2 font-pixel text-[10px] text-[rgb(242_193_78)]">{patenteDe(trofeus).toUpperCase()}</p>
            <h2 className="nome-troca mt-2 font-pixel text-2xl text-fg sm:text-3xl">{pers.gladiador.toUpperCase()}</h2>
            <p className="mt-1 text-sm text-muted">
              {pers.titulo} · {pers.lema}
            </p>

            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-pixel text-lg tabular-nums">🏆 {trofeus}</span>
              <span className="pixel-box px-2 py-1 font-pixel text-[9px] text-accent">{ligaDe(trofeus).nome.toUpperCase()}</span>
              <Link to={`/arena/mapa/${ia}`} onClick={() => tocar('selecionar')} className="font-pixel text-[9px] text-[rgb(242_193_78)] hover:underline">
                🗺 MAPA
              </Link>
            </div>
            <Barra valor={prox ? prox.progresso : 1} rotulo="Progresso até a próxima liga" />
            <p className="mt-1 text-xs text-muted">{prox ? `Faltam ${prox.faltam} troféus para ${prox.liga.nome}` : 'Liga máxima: Imperadores'}</p>

            <p className="mt-3 font-pixel text-[10px]">
              MAESTRIA {nivelMaestria(p.xp[ia])} · {tituloDoNivel(nivelMaestria(p.xp[ia]), ia).nome.toUpperCase()} <span className="text-muted">· {xpNivel}/{XP_POR_NIVEL} XP</span>
            </p>
            <Barra valor={xpNivel / XP_POR_NIVEL} rotulo="Progresso de Maestria" fina />

            <p className="mt-4 font-pixel text-[10px] text-[rgb(var(--ia))]">★ HABILIDADE NO TRIBUNAL: {pers.habilidade.nome.toUpperCase()}</p>
            <Link
              to={`/arena/perfil/${ia}`}
              onClick={() => {
                desbloquear();
                tocar('selecionar');
              }}
              className="pixel-box pixel-hover mt-4 inline-block px-3 py-2 font-pixel text-[10px] text-[rgb(var(--ia))]"
            >
              ▶ VER PERFIL DE {pers.gladiador.toUpperCase()}
            </Link>
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
                    <GladiadorPixel ia={id} liga={indiceLiga(p.trofeus[id])} />
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
          {/* O Tribunal é o combate principal: bem grande, em cima. O Duelo vem embaixo. */}
          <div className="flex flex-col gap-5">
            <CartaoModo
              rota="/arena/tribunal"
              icone="⚖"
              titulo="Tribunal"
              frase="Três tempos. Cinco jurados. Conquiste a maioria."
              arte={<ArteTribunal />}
              ganho={variacaoTrofeus('tribunal', trofeus, true)}
              perda={variacaoTrofeus('tribunal', trofeus, false)}
              treino={treino}
              grande
            />
            {/* O Tribunal online fica junto do Tribunal (o do Duelo fica na Sala do Duelo). */}
            <Link
              to="/arena/tribunal/online"
              onClick={() => {
                desbloquear();
                tocar('clique');
              }}
              className="pixel-box pixel-hover -mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-3 text-center"
            >
              <span className="font-pixel text-xs text-fg">🌐 TRIBUNAL ONLINE</span>
              <span className="font-pixel text-[8px] text-[rgb(242_193_78)]">COM UM AMIGO · CADA UM NO SEU APARELHO · AMISTOSO</span>
            </Link>
            <CartaoModo
              rota="/arena/duelo"
              icone="⚔"
              titulo="Duelo"
              frase="Monte seu baralho. Tropas de argumentos. Derrube a Tribuna do rival."
              arte={<ArteDuelo ia={ia} />}
              ganho={variacaoTrofeus('duelo', trofeus, true)}
              perda={variacaoTrofeus('duelo', trofeus, false)}
              treino={treino}
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

/** Cartão do modo com uma cena em pixel de fundo (Coliseu ou Tribunal), estilo tela de seleção de fase. */
function CartaoModo(props: {
  rota: string;
  icone: ReactNode;
  titulo: string;
  frase: string;
  arte: ReactNode;
  ganho: number;
  perda: number;
  treino: boolean;
  /** O combate principal (Tribunal): bem maior. */
  grande?: boolean;
}) {
  return (
    <Link
      to={props.rota}
      onMouseEnter={() => tocar('passarMouse')}
      onClick={() => {
        desbloquear();
        tocar('clique');
      }}
      className={`pixel-box pixel-hover group block min-w-0 overflow-hidden transition hover:-translate-y-1 ${props.grande ? 'sm:grid sm:grid-cols-[2fr_1fr]' : 'sm:grid sm:grid-cols-[3fr_2fr]'}`}
    >
      <div className={`relative w-full overflow-hidden ${props.grande ? 'aspect-[16/8]' : 'aspect-[16/6]'}`}>
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">{props.arte}</div>
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--surface))] via-transparent to-transparent" aria-hidden />
        <div className="absolute bottom-2 left-3 flex items-center gap-2">
          <span className={`${props.grande ? 'text-3xl sm:text-4xl' : 'text-2xl'} text-accent drop-shadow-[0_2px_0_#000]`} aria-hidden>
            {props.icone}
          </span>
          <h3 className={`neon font-pixel text-accent drop-shadow-[0_2px_0_#000] ${props.grande ? 'text-xl sm:text-3xl' : 'text-base sm:text-xl'}`}>{props.titulo}</h3>
        </div>
      </div>
      <div className="flex flex-col justify-center p-4">
        {props.grande && <p className="mb-1 font-pixel text-[9px] text-[rgb(242_193_78)]">★ COMBATE PRINCIPAL</p>}
        <p className="text-sm text-muted">{props.frase}</p>
        {props.treino ? (
          <p className="mt-2 text-sm text-[rgb(242_193_78)]">Treino: não vale troféus.</p>
        ) : (
          <p className="mt-2 text-sm tabular-nums">
            Vitória <span className="text-accent">+{props.ganho}</span> · Derrota{' '}
            {props.perda === 0 ? <span className="text-muted">0 (ainda sem troféus a perder)</span> : <span className="text-accent-2">{props.perda}</span>}
          </p>
        )}
        <span className="piscar mt-3 inline-block font-pixel text-[10px] text-accent">▶ ENTRAR</span>
      </div>
    </Link>
  );
}

/** Arte do cartão do Duelo: o Coliseu com o seu gladiador encarando um rival. */
function ArteDuelo({ ia }: { ia: IaId }) {
  const rival = IAS.find((x) => x !== ia)!;
  const { arena } = useColiseu(ia);
  return (
    <>
      <CenaColiseu corA={`rgb(${PERSONAGENS[ia].cor})`} corB={`rgb(${PERSONAGENS[rival].cor})`} arena={arena} tema={ia} />
      <div className="absolute bottom-[4%] left-[22%] w-[17%]">
        <GladiadorPixel ia={ia} />
      </div>
      <div className="absolute bottom-[4%] right-[22%] w-[17%]">
        <GladiadorPixel ia={rival} espelhar />
      </div>
      <p className="absolute left-1/2 top-[38%] -translate-x-1/2 font-pixel text-lg text-[rgb(242_193_78)] drop-shadow-[0_2px_0_#000] sm:text-2xl">VS</p>
    </>
  );
}

/** Arte do cartão do Tribunal: o Pretor na bancada e três jurados. */
function ArteTribunal() {
  return (
    <>
      <CenaTribunal />
      <div className="absolute left-[44.5%] top-[12%] w-[11%]">
        <PretorPixel />
      </div>
      {(['logico', 'empatico', 'cetico'] as const).map((j, i) => (
        <div key={j} className="absolute top-[46%] w-[9%]" style={{ left: `${28 + i * 18}%` }}>
          <JuradoPixel jurado={j} />
        </div>
      ))}
    </>
  );
}

const ROTULO_RESULTADO = (pt: Partida) => (pt.empate ? 'Empate' : pt.venceu ? 'Vitória' : 'Derrota');
const COR_RESULTADO = (pt: Partida) => (pt.empate ? 'text-muted' : pt.venceu ? 'text-accent' : 'text-accent-2');

/** Histórico compacto: uma linha por partida; tocar abre os detalhes. Mostra 5 e um "ver todas". */
function Historico({ partidas }: { partidas: Partida[] }) {
  const [aberta, setAberta] = useState<string | null>(null);
  const [todas, setTodas] = useState(false);
  const lista = todas ? partidas : partidas.slice(0, 5);
  return (
    <section aria-labelledby="titulo-historico">
      <h2 id="titulo-historico" className="mb-3 font-pixel text-[10px] text-muted">
        ÚLTIMAS PARTIDAS
      </h2>
      {partidas.length === 0 ? (
        <p className="text-sm text-muted">A primeira glória ainda está por conquistar.</p>
      ) : (
        <>
          <ul className="pixel-box divide-y divide-line">
            {lista.map((pt) => {
              const aberto = aberta === pt.id;
              return (
                <li key={pt.id}>
                  <button
                    type="button"
                    aria-expanded={aberto}
                    onClick={() => {
                      tocar('clique');
                      setAberta(aberto ? null : pt.id);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-black/20"
                  >
                    <span aria-hidden>{pt.modo === 'duelo' ? '⚔' : '⚖'}</span>
                    <span className="w-5 shrink-0">
                      <GladiadorPixel ia={pt.ia} />
                    </span>
                    <span className="text-muted">×</span>
                    <span className="w-5 shrink-0">
                      <GladiadorPixel ia={pt.rival} espelhar />
                    </span>
                    <span className={`ml-1 font-pixel text-[9px] ${COR_RESULTADO(pt)}`}>{ROTULO_RESULTADO(pt).toUpperCase()}</span>
                    <span className="ml-auto shrink-0 font-pixel text-[9px] tabular-nums text-muted">
                      {pt.treino ? 'TREINO' : `${pt.trofeus > 0 ? '+' : ''}${pt.trofeus} 🏆`}
                    </span>
                    <span className="text-muted" aria-hidden>
                      {aberto ? '▴' : '▾'}
                    </span>
                  </button>
                  {aberto && (
                    <div className="surgir space-y-1 bg-black/20 px-4 py-3 text-xs">
                      <p>
                        <strong>{pt.modo === 'duelo' ? 'Duelo' : 'Tribunal'}</strong> · {new Date(pt.quando).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                      <p className="text-muted">"{pt.dilema}"</p>
                      <p>
                        {PERSONAGENS[pt.ia].gladiador} ({PERSONAGENS[pt.ia].ia}) contra {PERSONAGENS[pt.rival].gladiador} ({PERSONAGENS[pt.rival].ia})
                      </p>
                      <p>
                        {pt.treino ? 'Treino: não valeu troféus nem XP.' : `Troféus: ${pt.trofeus > 0 ? '+' : ''}${pt.trofeus} · XP de Maestria: +${pt.xp}`}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {partidas.length > 5 && (
            <button
              type="button"
              onClick={() => {
                tocar('clique');
                setTodas((t) => !t);
              }}
              className="mt-2 font-pixel text-[9px] text-muted hover:text-accent"
            >
              {todas ? '▴ MOSTRAR MENOS' : `▾ VER TODAS (${partidas.length})`}
            </button>
          )}
        </>
      )}
    </section>
  );
}
