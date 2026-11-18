import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { PERSONAGENS, type IaId } from '@/game/personagens';
import { ACERTO_RIVAL } from '@/game/tribunal/motor';
import { indiceLiga } from '@/game/ligas';
import { ACERTO_TREINO, modoRanqueado, useDificuldade } from '@/game/conta';
import { useProgresso } from '@/game/progresso';
import { DILEMAS, type LadoId } from '@/game/tribunal/dilemas';
import {
  CARGA_MS,
  CARTAS,
  custoAgora,
  emVirada,
  FOLEGO_MAX,
  golpeDoGladiador,
  HABILIDADES,
  jogarCarta,
  LIMITE,
  novoDuelo,
  passo,
  podeJogar,
  PONTA,
  resultadoFinal,
  RODADA_MS,
  SUPER_MAX,
  TICK,
  usarHabilidade,
  VIRADA_MS,
  type CartaDuelo,
  type EstadoDuelo,
  type Lado,
  type Lutador,
  type Tropa,
} from '@/game/duelo/motor';
import { CenaColiseu } from '../cenas/Cenarios';
import { Faiscas, Palco } from '../cenas/Palco';
import { GladiadorPixel, PretorPixel } from '@/ui/pixel/Personagens';
import GladiadorEnfeitado, { useAparencia } from '@/ui/pixel/GladiadorEnfeitado';
import Sprite from '@/ui/pixel/Sprite';
import { paletaTropa, TROPAS } from '@/ui/pixel/tropas';
import { desbloquear, tocar, type NomeSom } from '@/ui/som';
import { VERDE, VERMELHO } from '../tribunal/visual';
import ComoJogar, { BotaoComoJogar, TUTORIAL_DUELO, useTutorial } from '../ComoJogar';

const OURO = '#f2c14e';
const COR: Record<Lado, { cor: string; escura: string }> = {
  eu: { cor: VERDE, escura: 'rgb(30 120 66)' },
  rival: { cor: VERMELHO, escura: 'rgb(150 34 48)' },
};
const PALETAS = { eu: paletaTropa(COR.eu.cor, COR.eu.escura), rival: paletaTropa(COR.rival.cor, COR.rival.escura) };
/** Largura de cada tropa no palco (%). */
const LARGURA: Record<Tropa['tipo'], number> = { legionario: 5, centuriao: 6.5, arqueiro: 5 };

function embaralhar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const agoraMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export default function PartidaDuelo({ ia, rival, onDeNovo, onSair }: { ia: IaId; rival: IaId; onDeNovo: () => void; onSair: () => void }) {
  const p = useProgresso();
  const dificuldade = useDificuldade();
  const { liga } = useAparencia(ia);
  const tutorial = useTutorial('duelo');
  const [acerto] = useState(() => (modoRanqueado() ? ACERTO_RIVAL[indiceLiga(p.trofeus[ia])]! : ACERTO_TREINO[dificuldade]));
  const [config] = useState(() => ({ lado: (Math.random() < 0.5 ? 'favor' : 'contra') as LadoId, dilema: Math.floor(Math.random() * DILEMAS.length) }));
  const dilema = DILEMAS[config.dilema]!;
  const ladoRival: LadoId = config.lado === 'favor' ? 'contra' : 'favor';
  const [e, setE] = useState<EstadoDuelo>(() =>
    novoDuelo(
      embaralhar(dilema.lados[config.lado].tempos.flat().map((c) => c.titulo)),
      embaralhar(dilema.lados[ladoRival].tempos.flat().map((c) => c.titulo)),
    ),
  );
  // Segurar e soltar: qual carta está sendo segurada e desde quando.
  const [segurando, setSegurando] = useState<{ id: string; inicio: number } | null>(null);
  const pausado = tutorial.aberto;

  useEffect(() => {
    if (pausado) return;
    const ctx = { acerto, iaRival: rival, aleatorio: Math.random };
    const id = window.setInterval(() => setE((s) => passo(s, ctx)), TICK);
    return () => window.clearInterval(id);
  }, [acerto, rival, pausado]);

  useEffect(() => {
    tocar('vs');
  }, []);

  // Sons: cada efeito novo toca uma vez (um de cada tipo por vez).
  const visto = useRef(0);
  useEffect(() => {
    const novos: NomeSom[] = [];
    for (const x of e.efeitos) {
      if (x.id <= visto.current) continue;
      if (x.tipo === 'choque' || x.tipo === 'escudo') novos.push('espadas');
      if (x.tipo === 'acerto') novos.push(x.lado === 'eu' ? 'jurado' : 'falha');
      if (x.tipo === 'super' || x.tipo === 'raio') novos.push('fanfarra');
      if (x.tipo === 'golpe') novos.push('passos');
      if (x.tipo === 'flecha') novos.push('roleta');
    }
    visto.current = Math.max(visto.current, ...e.efeitos.map((x) => x.id));
    [...new Set(novos)].forEach((s) => tocar(s));
  }, [e.efeitos]);

  useEffect(() => {
    if (e.fase === 'intervalo') tocar('martelo');
    if (e.fase === 'fim') {
      const r = resultadoFinal(e);
      tocar(r === 'vitoria' ? 'vitoria' : r === 'derrota' ? 'derrota' : 'martelo');
    }
  }, [e.fase]);

  const jogar = (carta: CartaDuelo, carga: number) => {
    desbloquear();
    tocar(carga >= 1 ? 'start' : 'selecionar');
    setE((s) => jogarCarta(s, 'eu', carta.id, carga));
  };
  const comecarCarga = (carta: CartaDuelo) => {
    desbloquear();
    setSegurando({ id: carta.id, inicio: agoraMs() });
  };
  const soltar = (carta: CartaDuelo) => {
    if (segurando?.id !== carta.id) return;
    jogar(carta, Math.min(1, (agoraMs() - segurando.inicio) / CARGA_MS));
    setSegurando(null);
  };
  const gladiador = () => {
    desbloquear();
    setE((s) => golpeDoGladiador(s, 'eu'));
  };
  const habilidade = () => {
    desbloquear();
    setE((s) => usarHabilidade(s, 'eu', ia));
  };

  // Teclado: segure 1 a 4 para carregar e solte para lançar; G = gladiador; espaço = habilidade.
  useEffect(() => {
    if (pausado) return;
    const desce = (ev: KeyboardEvent) => {
      if (ev.repeat) return;
      const c = e.eu.mao[Number(ev.key) - 1];
      if (c && podeJogar(e, 'eu', c.id)) comecarCarga(c);
      else if (ev.key === 'g' || ev.key === 'G') gladiador();
      else if (ev.key === ' ') {
        ev.preventDefault();
        habilidade();
      }
    };
    const sobe = (ev: KeyboardEvent) => {
      const c = e.eu.mao[Number(ev.key) - 1];
      if (c) soltar(c);
    };
    window.addEventListener('keydown', desce);
    window.addEventListener('keyup', sobe);
    return () => {
      window.removeEventListener('keydown', desce);
      window.removeEventListener('keyup', sobe);
    };
  });

  if (e.fase === 'fim') return <FimDuelo e={e} ia={ia} rival={rival} onDeNovo={onDeNovo} onSair={onSair} />;

  const voce = PERSONAGENS[ia];
  const dele = PERSONAGENS[rival];
  const restante = Math.max(0, Math.ceil((RODADA_MS - e.tempo) / 1000));
  const virada = e.tempo >= RODADA_MS - VIRADA_MS;
  const eu = e.eu;
  const gladiadorPronto = eu.gladiadorProntoEm <= e.tempo;

  return (
    <div className="flex flex-col gap-3">
      {tutorial.aberto && <ComoJogar titulo="DUELO" slides={TUTORIAL_DUELO} onFechar={tutorial.fechar} />}
      <div className="flex justify-end">
        <BotaoComoJogar onClick={tutorial.abrir} />
      </div>

      {/* Placar: quem é quem, rodadas, relógio e a plateia */}
      <div className="pixel-box flex flex-col gap-1 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <Pontos nome={voce.gladiador} cor={VERDE} vitorias={e.rodadas.eu} />
          <p className="text-center font-pixel text-[8px] text-muted sm:text-[10px]">
            RODADA {e.rodada}/3 ·{' '}
            <span className={`tabular-nums ${virada ? 'piscar text-[rgb(242_193_78)]' : 'text-accent'}`}>⏱ {restante}</span>
          </p>
          <Pontos nome={dele.gladiador} cor={VERMELHO} vitorias={e.rodadas.rival} direita />
        </div>
        <BarraPlateia valor={e.plateia} />
      </div>

      <Palco rodando={false} onPular={() => undefined}>
        <CenaColiseu corA={`rgb(${voce.cor})`} corB={`rgb(${dele.cor})`} />

        <p className="absolute inset-x-0 top-[3%] z-10 truncate px-3 text-center text-[9px] text-white/80 [text-shadow:1px_1px_0_#000] sm:text-xs">
          {dilema.pergunta} <span style={{ color: VERDE }}>Você: {dilema.lados[config.lado].nome}</span>
        </p>

        {/* Marcas das pontas: passou daqui, puxa a plateia */}
        {(['eu', 'rival'] as Lado[]).map((l) => (
          <div key={l} className="pointer-events-none absolute bottom-[3%] top-[45%] w-0.5 opacity-50" style={{ left: `${PONTA[l]}%`, background: COR[l].cor }} />
        ))}

        <Gladiador lado="eu" l={eu} tempo={e.tempo} onTocar={gladiador}>
          <GladiadorEnfeitado ia={ia} parado />
        </Gladiador>
        <Gladiador lado="rival" l={e.rival} tempo={e.tempo}>
          <GladiadorPixel ia={rival} liga={liga} espelhar />
        </Gladiador>

        {/* As tropas */}
        {e.tropas.map((t) => {
          const lutando = e.tropas.some((o) => o.de !== t.de && Math.abs(o.x - t.x) <= 4);
          return (
            <div
              key={t.id}
              className="tropa absolute bottom-[5%] z-10 -translate-x-1/2"
              style={{ left: `${t.x}%`, width: `${LARGURA[t.tipo]}%` }}
              aria-hidden
            >
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-black/80 px-1 font-pixel text-[7px] sm:-top-5 sm:text-[10px]"
                style={{ color: t.carregada ? OURO : COR[t.de].cor }}
              >
                {t.forca}
              </span>
              <div className={lutando ? 'lutando' : 'marchar'} style={t.carregada ? { filter: `drop-shadow(0 0 4px ${OURO})` } : undefined}>
                <Sprite grade={TROPAS[t.tipo]} paleta={PALETAS[t.de]} espelhar={t.de === 'rival'} />
              </div>
            </div>
          );
        })}

        {/* Efeitos */}
        {e.efeitos.map((x) =>
          x.tipo === 'choque' ? (
            <Faiscas key={x.id} x={x.x ?? 50} y={82} />
          ) : x.tipo === 'acerto' ? (
            <Chuva key={x.id} lado={x.lado} />
          ) : x.tipo === 'super' ? (
            <div key={x.id} className="clarao pointer-events-none absolute inset-0 z-20" style={{ background: x.lado === 'eu' ? 'rgb(242 193 78 / 0.5)' : 'rgb(255 74 90 / 0.4)' }} />
          ) : (
            <span key={x.id} className="pancada absolute bottom-[18%] z-20 -translate-x-1/2 text-base sm:text-3xl" style={{ left: `${x.x ?? 50}%` }} aria-hidden>
              {x.tipo === 'flecha' ? '➶' : x.tipo === 'golpe' ? '💥' : x.tipo === 'raio' ? '⚡' : '🛡️'}
            </span>
          ),
        )}

        {e.aviso && e.fase === 'luta' && (
          <p
            key={e.aviso.texto + e.aviso.ate}
            className="pancada neon absolute left-1/2 top-[18%] z-20 -translate-x-1/2 whitespace-nowrap bg-black/60 px-2 py-1 font-pixel text-[9px] sm:text-sm"
            style={{ color: e.aviso.lado === 'eu' ? VERDE : e.aviso.lado === 'rival' ? VERMELHO : OURO }}
          >
            {e.aviso.texto}
          </p>
        )}

        {e.fase === 'intervalo' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/70 text-center">
            <p className="pancada neon font-pixel text-sm text-accent sm:text-2xl">{e.aviso?.texto ?? 'FIM DA RODADA'}</p>
            <p className="font-pixel text-[9px] text-muted sm:text-xs">
              {e.rodadas.eu} × {e.rodadas.rival} · PREPARE-SE PARA A RODADA {e.rodada + 1}
            </p>
          </div>
        )}
      </Palco>

      {/* Fôlego, gladiador e habilidade */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[45%] flex-1">
          <p className="font-pixel text-[8px] text-muted">
            FÔLEGO {Math.floor(eu.folego)}/{FOLEGO_MAX}
            {emVirada(e, 'eu') && <span className="text-[rgb(242_193_78)]"> · VIRADA +25%</span>}
          </p>
          <div className="mt-1 flex gap-1" aria-label="Fôlego">
            {Array.from({ length: FOLEGO_MAX }, (_, i) => (
              <span key={i} className="h-3 flex-1" style={{ background: i < Math.floor(eu.folego) ? 'rgb(var(--accent))' : 'rgb(var(--line))' }} />
            ))}
          </div>
        </div>
        <button
          type="button"
          disabled={!gladiadorPronto || e.fase !== 'luta'}
          onClick={gladiador}
          className="pixel-box pixel-hover px-2 py-2 font-pixel text-[8px] disabled:opacity-40 sm:text-[9px]"
        >
          🗡️ GLADIADOR {gladiadorPronto ? '' : Math.ceil((eu.gladiadorProntoEm - e.tempo) / 1000) + 's'}
        </button>
        <button
          type="button"
          disabled={eu.carga < SUPER_MAX || e.fase !== 'luta'}
          onClick={habilidade}
          title={HABILIDADES[ia].efeito}
          className={`pixel-box pixel-hover px-2 py-2 font-pixel text-[8px] text-[rgb(242_193_78)] disabled:opacity-40 sm:text-[9px] ${eu.carga >= SUPER_MAX ? 'piscar' : ''}`}
        >
          ⭐ {HABILIDADES[ia].nome.toUpperCase()} {'●'.repeat(eu.carga)}
          {'○'.repeat(SUPER_MAX - eu.carga)}
        </button>
      </div>

      {/* A mão: toque para lançar, segure para carregar */}
      <section aria-label="Suas cartas" className="grid grid-cols-4 gap-2">
        {eu.mao.map((c, i) => (
          <CartaNaMao
            key={c.id}
            carta={c}
            numero={i + 1}
            custo={custoAgora(eu, c.tipo)}
            pode={podeJogar(e, 'eu', c.id)}
            carregando={segurando?.id === c.id}
            onSegurar={() => comecarCarga(c)}
            onSoltar={() => soltar(c)}
            onCancelar={() => setSegurando(null)}
            onTocar={() => jogar(c, 0)}
          />
        ))}
      </section>
      <p className="text-center text-[10px] text-muted sm:text-xs">Toque para lançar · segure para carregar um argumento forte</p>
    </div>
  );
}

function CartaNaMao(props: {
  carta: CartaDuelo;
  numero: number;
  custo: number;
  pode: boolean;
  carregando: boolean;
  onSegurar: () => void;
  onSoltar: () => void;
  onCancelar: () => void;
  onTocar: () => void;
}) {
  const { carta, numero, custo, pode, carregando } = props;
  const info = CARTAS[carta.tipo];
  // Depois de segurar e soltar, o navegador ainda manda um clique: este ignora.
  const ignorarClique = useRef(false);
  const carrega = !!info.tropa && info.tropa !== 'arqueiro';
  return (
    <button
      type="button"
      disabled={!pode}
      onPointerDown={(ev) => {
        if (!pode || !carrega) return;
        ev.currentTarget.setPointerCapture?.(ev.pointerId);
        props.onSegurar();
      }}
      onPointerUp={() => {
        if (!carregando) return;
        ignorarClique.current = true;
        props.onSoltar();
      }}
      onPointerCancel={props.onCancelar}
      onClick={() => {
        if (ignorarClique.current) {
          ignorarClique.current = false;
          return;
        }
        props.onTocar();
      }}
      onContextMenu={(ev) => ev.preventDefault()}
      aria-label={`${info.nome}, força ${info.forca}, custa ${custo}`}
      title={info.dica}
      className="pixel-box pixel-hover relative flex select-none flex-col items-center gap-1 overflow-hidden px-1 py-2 text-center [-webkit-touch-callout:none] disabled:cursor-not-allowed disabled:opacity-40"
      style={info.rara ? { boxShadow: `0 0 0 2px ${OURO}, 0 0 14px -4px ${OURO}` } : undefined}
    >
      {info.tropa ? (
        <span className="w-8 sm:w-10" aria-hidden>
          <Sprite grade={TROPAS[info.tropa]} paleta={PALETAS.eu} />
        </span>
      ) : (
        <span className="text-2xl sm:text-3xl" aria-hidden>
          {info.icone}
        </span>
      )}
      <span className="font-pixel text-[7px] leading-relaxed sm:text-[9px]" style={{ color: info.rara ? OURO : VERDE }}>
        {info.nome.toUpperCase()}
      </span>
      <span className="font-pixel text-[7px] text-muted sm:text-[8px]">
        {info.forca > 0 ? `FORÇA ${info.forca} · ` : ''}
        <span className={custo === 0 ? 'text-[rgb(242_193_78)]' : ''}>💨{custo}</span>
      </span>
      <span className="hidden font-pixel text-[7px] text-muted sm:block">[{numero}]</span>
      {/* Barra de carga: metade = +1, cheia = +2 */}
      {carrega && (
        <span className="absolute inset-x-0 bottom-0 h-1.5 bg-black/50" aria-hidden>
          {carregando && <span className="carga-enchendo absolute inset-y-0 left-0" style={{ animationDuration: `${CARGA_MS}ms` } as CSSProperties} />}
          <span className="absolute inset-y-0 left-1/2 w-px bg-white/60" />
        </span>
      )}
    </button>
  );
}

/** Gladiador de cada lado: defende a ponta. O seu dá um golpe quando você toca nele. */
function Gladiador({ lado, l, tempo, onTocar, children }: { lado: Lado; l: Lutador; tempo: number; onTocar?: () => void; children: ReactNode }) {
  const preso = l.presoAte > tempo;
  const pronto = l.gladiadorProntoEm <= tempo;
  const corpo = (
    <>
      {l.fala && (
        <span
          key={l.fala.ate}
          className={`surgir block absolute bottom-[105%] z-10 w-[220%] rounded bg-white px-1.5 py-1 text-[8px] leading-tight text-black sm:text-[11px] ${lado === 'eu' ? 'left-0 text-left' : 'right-0 text-right'}`}
        >
          "{l.fala.texto}"
        </span>
      )}
      {preso && <span className="absolute -top-[15%] left-1/2 z-10 -translate-x-1/2 text-lg sm:text-3xl">💫</span>}
      {l.escudo > 0 && <span className="absolute -top-[2%] left-1/2 z-10 -translate-x-1/2 text-sm sm:text-xl">{'🛡️'.repeat(l.escudo)}</span>}
      <div style={{ filter: preso ? 'grayscale(0.7)' : undefined }}>{children}</div>
    </>
  );
  const pos = `absolute bottom-[4%] w-[12%] ${lado === 'eu' ? 'left-[3%]' : 'right-[3%]'}`;
  return onTocar ? (
    <button type="button" onClick={onTocar} disabled={!pronto} aria-label="Golpe do gladiador" className={`${pos} z-10 text-left disabled:cursor-default`}>
      {corpo}
      {pronto && <span className="piscar absolute -bottom-1 left-1/2 -translate-x-1/2 font-pixel text-[6px] text-[rgb(242_193_78)] sm:text-[8px]">TOQUE</span>}
    </button>
  ) : (
    <div className={pos}>{corpo}</div>
  );
}

function Pontos({ nome, cor, vitorias, direita = false }: { nome: string; cor: string; vitorias: number; direita?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${direita ? 'flex-row-reverse' : ''}`}>
      <p className="max-w-[28vw] truncate font-pixel text-[8px] sm:text-[10px]" style={{ color: cor }}>
        {nome.toUpperCase()}
      </p>
      <p className="flex gap-1" aria-label={`${vitorias} rodadas ganhas`}>
        {[0, 1].map((i) => (
          <span key={i} className="h-2.5 w-2.5 border border-white/40" style={{ background: i < vitorias ? cor : 'transparent' }} />
        ))}
      </p>
    </div>
  );
}

/** A plateia: o meio é neutro, a esquerda é sua (verde), a direita é do rival. */
function BarraPlateia({ valor }: { valor: number }) {
  const pct = (Math.abs(valor) / LIMITE) * 50;
  return (
    <div className="relative h-4 w-full bg-black/60 sm:h-5" role="meter" aria-label="Plateia" aria-valuenow={valor} aria-valuemin={-LIMITE} aria-valuemax={LIMITE}>
      <div className="absolute inset-y-0 left-1/2 z-10 w-0.5 bg-white/70" />
      <div
        className="absolute inset-y-0 transition-all duration-300"
        style={valor >= 0 ? { left: `${50 - pct}%`, width: `${pct}%`, background: VERDE } : { left: '50%', width: `${pct}%`, background: VERMELHO }}
      />
      <span className="absolute inset-0 flex items-center justify-center font-pixel text-[8px] text-white [text-shadow:1px_1px_0_#000]">
        PLATEIA {valor > 0 ? `+${valor} SUA` : valor < 0 ? `+${-valor} DO RIVAL` : 'DIVIDIDA'}
      </span>
    </div>
  );
}

function Chuva({ lado }: { lado: Lado }) {
  const x = lado === 'eu' ? 14 : 86;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[25%] z-10 h-[65%]" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="chuva absolute text-base sm:text-2xl" style={{ left: `${x - 6 + i * 4}%`, animationDelay: `${i * 90}ms` }}>
          {i % 2 ? '🌹' : '🌿'}
        </span>
      ))}
    </div>
  );
}

function FimDuelo({ e, ia, rival, onDeNovo, onSair }: { e: EstadoDuelo; ia: IaId; rival: IaId; onDeNovo: () => void; onSair: () => void }) {
  const r = resultadoFinal(e);
  return (
    <div className="pixel-box flex flex-col items-center gap-4 p-5 text-center">
      <div className="relative w-24 sm:w-32">
        <PretorPixel />
        <span className="pancada absolute -right-10 top-1/3 text-5xl sm:text-6xl">{r === 'vitoria' ? '👍' : r === 'derrota' ? '👎' : '✋'}</span>
      </div>
      <p className="font-pixel text-[9px] text-[rgb(242_193_78)]">O CÉSAR DECIDIU</p>
      <h2 className={`pancada neon font-pixel text-3xl sm:text-5xl ${r === 'derrota' ? 'text-accent-2' : 'text-accent'}`}>
        {r === 'vitoria' ? 'VITÓRIA!' : r === 'derrota' ? 'DERROTA' : 'EMPATE'}
      </h2>
      <p className="font-pixel text-sm">
        <span style={{ color: VERDE }}>
          {PERSONAGENS[ia].gladiador} {e.rodadas.eu}
        </span>{' '}
        ×{' '}
        <span style={{ color: VERMELHO }}>
          {e.rodadas.rival} {PERSONAGENS[rival].gladiador}
        </span>
      </p>
      <p className="font-pixel text-[8px] text-muted">PROTÓTIPO · AINDA NÃO VALE TROFÉUS</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" autoFocus onClick={onDeNovo} className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent">
          ↻ JOGAR DE NOVO
        </button>
        <button type="button" onClick={onSair} className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px]">
          ◀ ARCADE
        </button>
      </div>
    </div>
  );
}
