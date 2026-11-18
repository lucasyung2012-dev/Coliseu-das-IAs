import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
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
  duracaoDaRodada,
  FOLEGO_MAX,
  FOLEGO_POR_SEGUNDO,
  GLADIADOR_ALCANCE,
  golpeDoGladiador,
  HABILIDADES,
  jogarCarta,
  novoDuelo,
  passo,
  podeJogar,
  PONTA,
  prorrogacao,
  RODADAS,
  resultadoFinal,
  ritmoDoFolego,
  SUPER_MAX,
  TICK,
  TORRE_VIDA,
  usarHabilidade,
  type CartaDuelo,
  type EstadoDuelo,
  type Lado,
  type Lutador,
  type Tropa,
} from '@/game/duelo/motor';
import { CenaColiseu } from '../cenas/Cenarios';
import { Faiscas } from '../cenas/Palco';
import { GladiadorPixel, PretorPixel } from '@/ui/pixel/Personagens';
import GladiadorEnfeitado, { useAparencia } from '@/ui/pixel/GladiadorEnfeitado';
import Sprite, { type Paleta } from '@/ui/pixel/Sprite';
import { paletaTropa, TORRE, TROPAS } from '@/ui/pixel/tropas';
import { desbloquear, tocar, type NomeSom } from '@/ui/som';
import ComoJogar, { BotaoComoJogar, TUTORIAL_DUELO, useTutorial } from '../ComoJogar';

const OURO = '#f2c14e';
/** Largura de cada tropa na arena (% da largura). */
const LARGURA: Record<Tropa['tipo'], number> = { legionario: 6, centuriao: 7.5, arqueiro: 6 };

/** As cores de cada lado vêm da IA escolhida (pedido do Lucas). */
interface Cores {
  cor: string;
  escura: string;
  paleta: Paleta;
}
function coresDaIa(id: IaId): Cores {
  const [r, g, b] = PERSONAGENS[id].cor.split(' ').map(Number) as [number, number, number];
  const cor = `rgb(${r} ${g} ${b})`;
  const escura = `rgb(${Math.round(r * 0.55)} ${Math.round(g * 0.55)} ${Math.round(b * 0.55)})`;
  return { cor, escura, paleta: paletaTropa(cor, escura) };
}

function embaralhar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const agoraMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/** Abertura do debate: o tema, quem defende cada lado e a contagem 3, 2, 1. */
type Abertura = 'tema' | 3 | 2 | 1 | 'lutem' | null;
const TEMPO_ABERTURA: Record<Exclude<Abertura, null>, number> = { tema: 3800, 3: 800, 2: 800, 1: 800, lutem: 700 };
const PROXIMA: Record<Exclude<Abertura, null>, Abertura> = { tema: 3, 3: 2, 2: 1, 1: 'lutem', lutem: null };

export default function PartidaDuelo({ ia, rival, onDeNovo, onSair }: { ia: IaId; rival: IaId; onDeNovo: () => void; onSair: () => void }) {
  const p = useProgresso();
  const dificuldade = useDificuldade();
  const { liga } = useAparencia(ia);
  const tutorial = useTutorial('duelo');
  const [acerto] = useState(() => (modoRanqueado() ? ACERTO_RIVAL[indiceLiga(p.trofeus[ia])]! : ACERTO_TREINO[dificuldade]));
  const [config] = useState(() => ({ lado: (Math.random() < 0.5 ? 'favor' : 'contra') as LadoId, dilema: Math.floor(Math.random() * DILEMAS.length) }));
  const dilema = DILEMAS[config.dilema]!;
  const ladoRival: LadoId = config.lado === 'favor' ? 'contra' : 'favor';
  const cores = useMemo<Record<Lado, Cores>>(() => ({ eu: coresDaIa(ia), rival: coresDaIa(rival) }), [ia, rival]);
  const [e, setE] = useState<EstadoDuelo>(() =>
    novoDuelo(
      embaralhar(dilema.lados[config.lado].tempos.flat().map((c) => c.titulo)),
      embaralhar(dilema.lados[ladoRival].tempos.flat().map((c) => c.titulo)),
    ),
  );
  // Segurar e soltar: qual carta está sendo segurada e desde quando.
  const [segurando, setSegurando] = useState<{ id: string; inicio: number } | null>(null);
  const [abertura, setAbertura] = useState<Abertura>('tema');
  const pausado = tutorial.aberto || abertura !== null;

  // A abertura anda sozinha (espera o tutorial fechar).
  useEffect(() => {
    if (abertura === null || tutorial.aberto) return;
    if (typeof abertura === 'number') tocar('roleta');
    if (abertura === 'lutem') tocar('vs');
    const id = window.setTimeout(() => setAbertura(PROXIMA[abertura]), TEMPO_ABERTURA[abertura]);
    return () => window.clearTimeout(id);
  }, [abertura, tutorial.aberto]);

  useEffect(() => {
    if (pausado) return;
    const ctx = { acerto, iaRival: rival, aleatorio: Math.random };
    const id = window.setInterval(() => setE((s) => passo(s, ctx)), TICK);
    return () => window.clearInterval(id);
  }, [acerto, rival, pausado]);

  // Sons: cada efeito novo toca uma vez (um de cada tipo por vez).
  const visto = useRef(0);
  useEffect(() => {
    const novos: NomeSom[] = [];
    for (const x of e.efeitos) {
      if (x.id <= visto.current) continue;
      if (x.tipo === 'choque' || x.tipo === 'escudo') novos.push('espadas');
      if (x.tipo === 'torre') novos.push(x.lado === 'rival' ? 'plateia' : 'falha');
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
    if (pausado) return;
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
    if (pausado) return;
    desbloquear();
    setE((s) => golpeDoGladiador(s, 'eu'));
  };
  const habilidade = () => {
    if (pausado) return;
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

  if (e.fase === 'fim') return <FimDuelo e={e} ia={ia} rival={rival} cores={cores} onDeNovo={onDeNovo} onSair={onSair} />;

  const voce = PERSONAGENS[ia];
  const dele = PERSONAGENS[rival];
  const restante = Math.max(0, Math.ceil((duracaoDaRodada(e) - e.tempo) / 1000));
  const extra = prorrogacao(e);
  const eu = e.eu;
  const gladiadorPronto = eu.gladiadorProntoEm <= e.tempo;
  const torreBatida = (l: Lado) => e.efeitos.some((x) => x.tipo === 'torre' && x.lado === l);

  return (
    <div className="flex flex-col gap-3">
      {tutorial.aberto && <ComoJogar titulo="DUELO" slides={TUTORIAL_DUELO} onFechar={tutorial.fechar} />}
      <div className="flex justify-end">
        <BotaoComoJogar onClick={tutorial.abrir} />
      </div>

      {/* Placar: a vida das duas torres, a rodada e o relógio */}
      <div className="pixel-box grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2">
        <VidaTorre nome={voce.gladiador} cor={cores.eu.cor} vida={e.torres.eu} />
        <p className="text-center font-pixel text-[8px] leading-relaxed text-muted sm:text-[10px]">
          {extra ? <span className="piscar text-[rgb(242_193_78)]">⚡ PRORROGAÇÃO</span> : `RODADA ${e.rodada}/${RODADAS}`}
          <br />
          <span className={`tabular-nums ${restante <= 10 ? 'piscar text-accent-2' : 'text-accent'}`}>⏱ {restante}</span>
        </p>
        <VidaTorre nome={dele.gladiador} cor={cores.rival.cor} vida={e.torres.rival} direita />
      </div>

      {/* A arena, mais comprida */}
      <div className="pixel-box relative aspect-[2/1] w-full overflow-hidden sm:aspect-[21/9]">
        <CenaColiseu corA={cores.eu.cor} corB={cores.rival.cor} viva festa={torreBatida('eu') || torreBatida('rival')} />

        <p className="absolute inset-x-0 top-[3%] z-10 truncate px-3 text-center text-[9px] text-white/80 [text-shadow:1px_1px_0_#000] sm:text-xs">
          {dilema.pergunta}{' '}
          <span style={{ color: cores.eu.cor }}>
            Você: {dilema.lados[config.lado].nome.toUpperCase()}
          </span>
        </p>

        {/* Alcance do gladiador: um círculo de luz no chão */}
        {(['eu', 'rival'] as Lado[]).map((l) => (
          <div
            key={`alcance-${l}`}
            className="alcance-luz pointer-events-none absolute bottom-[0%] h-[16%] rounded-[50%]"
            style={{
              left: `${PONTA[l] - GLADIADOR_ALCANCE}%`,
              width: `${GLADIADOR_ALCANCE * 2}%`,
              background: `radial-gradient(ellipse at center, color-mix(in srgb, ${cores[l].cor} 45%, transparent) 0%, color-mix(in srgb, ${cores[l].cor} 18%, transparent) 55%, transparent 72%)`,
              boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${cores[l].cor} 35%, transparent)`,
            }}
          />
        ))}

        {/* As torres, com o gladiador em cima */}
        {(['eu', 'rival'] as Lado[]).map((l) => (
          <div key={`torre-${l}`} className={`absolute bottom-0 w-[12%] ${l === 'eu' ? 'left-[6%]' : 'right-[6%]'}`}>
            <Gladiador
              lado={l}
              l={e[l]}
              tempo={e.tempo}
              golpeando={e.efeitos.some((x) => x.tipo === 'golpe' && x.lado === l)}
              onTocar={l === 'eu' ? gladiador : undefined}
            >
              {l === 'eu' ? <GladiadorEnfeitado ia={ia} parado /> : <GladiadorPixel ia={rival} liga={liga} espelhar />}
            </Gladiador>
            <div className={torreBatida(l) ? 'tremer' : ''} role="img" aria-label={`Torre ${l === 'eu' ? 'sua' : 'do rival'}: ${e.torres[l]} de vida`}>
              <Sprite grade={TORRE} paleta={cores[l].paleta} />
            </div>
          </div>
        ))}

        {/* As tropas */}
        {e.tropas.map((t) => {
          const lutando = e.tropas.some((o) => o.de !== t.de && Math.abs(o.x - t.x) <= 4);
          return (
            <div key={t.id} className="tropa absolute bottom-[4%] z-10 -translate-x-1/2" style={{ left: `${t.x}%`, width: `${LARGURA[t.tipo]}%` }} aria-hidden>
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-black/80 px-1 font-pixel text-[7px] sm:-top-5 sm:text-[11px]"
                style={{ color: t.carregada ? OURO : cores[t.de].cor }}
              >
                {t.forca}
              </span>
              <div className={lutando ? 'lutando' : 'marchar'} style={t.carregada ? { filter: `drop-shadow(0 0 4px ${OURO})` } : undefined}>
                <Sprite grade={TROPAS[t.tipo]} paleta={cores[t.de].paleta} espelhar={t.de === 'rival'} />
              </div>
            </div>
          );
        })}

        {/* Efeitos */}
        {e.efeitos.map((x) =>
          x.tipo === 'choque' ? (
            <Faiscas key={x.id} x={x.x ?? 50} y={84} />
          ) : x.tipo === 'torre' ? (
            <Faiscas key={x.id} x={x.lado === 'eu' ? 12 : 88} y={60} cor={cores[x.lado].cor} />
          ) : x.tipo === 'super' ? (
            <div key={x.id} className="clarao pointer-events-none absolute inset-0 z-20" style={{ background: `color-mix(in srgb, ${cores[x.lado].cor} 45%, transparent)` }} />
          ) : (
            <span key={x.id} className="pancada absolute bottom-[20%] z-20 -translate-x-1/2 text-base sm:text-3xl" style={{ left: `${x.x ?? 50}%` }} aria-hidden>
              {x.tipo === 'flecha' ? '➶' : x.tipo === 'golpe' ? '💥' : x.tipo === 'raio' ? '⚡' : '🛡️'}
            </span>
          ),
        )}

        {e.aviso && e.fase === 'luta' && (
          <p
            key={e.aviso.texto + e.aviso.ate}
            className="pancada neon absolute left-1/2 top-[16%] z-20 -translate-x-1/2 whitespace-nowrap bg-black/60 px-2 py-1 font-pixel text-[9px] sm:text-sm"
            style={{ color: e.aviso.lado ? cores[e.aviso.lado].cor : OURO }}
          >
            {e.aviso.texto}
          </p>
        )}

        {e.fase === 'intervalo' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/70 text-center">
            <p className="pancada neon font-pixel text-sm text-accent sm:text-2xl">{e.aviso?.texto ?? 'FIM DA RODADA'}</p>
            <p className="font-pixel text-[9px] text-muted sm:text-xs">
              TORRES {e.torres.eu} × {e.torres.rival} · {e.rodada >= RODADAS ? 'PREPARE-SE PARA A PRORROGAÇÃO' : `PREPARE-SE PARA A RODADA ${e.rodada + 1}`}
            </p>
          </div>
        )}

        {abertura !== null && (
          <AberturaDebate
            etapa={abertura}
            pergunta={dilema.pergunta}
            voce={{ nome: voce.gladiador, ia: voce.ia, cor: cores.eu.cor, lado: dilema.lados[config.lado].nome, tese: dilema.lados[config.lado].tese }}
            dele={{ nome: dele.gladiador, ia: dele.ia, cor: cores.rival.cor, lado: dilema.lados[ladoRival].nome, tese: dilema.lados[ladoRival].tese }}
            onPular={() => setAbertura(null)}
          />
        )}
      </div>

      {/* Fôlego */}
      <div>
        <p className="font-pixel text-[8px] text-muted">
          FÔLEGO {Math.floor(eu.folego)}/{FOLEGO_MAX}
          {ritmoDoFolego(e, 'eu') > FOLEGO_POR_SEGUNDO && <span className="text-[rgb(242_193_78)]">{extra ? ' · FÔLEGO EM DOBRO' : ' · VIRADA +25%'}</span>}
        </p>
        <div className="mt-1 flex gap-1" aria-label="Fôlego">
          {Array.from({ length: FOLEGO_MAX }, (_, i) => (
            <span key={i} className="h-3 flex-1" style={{ background: i < Math.floor(eu.folego) ? cores.eu.cor : 'rgb(var(--line))' }} />
          ))}
        </div>
      </div>

      {/* Gladiador e habilidade */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!gladiadorPronto || e.fase !== 'luta' || pausado}
          onClick={gladiador}
          className="pixel-box pixel-hover flex flex-col items-center gap-1 px-2 py-2 text-center disabled:opacity-40"
        >
          <span className="font-pixel text-[8px] sm:text-[10px]">
            🗡️ GOLPE DO GLADIADOR {gladiadorPronto ? '' : `· ${Math.ceil((eu.gladiadorProntoEm - e.tempo) / 1000)}s`}
          </span>
          <span className="text-[9px] leading-tight text-muted sm:text-[11px]">Ele já bate sozinho em quem entra no círculo de luz. Toque: golpe extra (-1).</span>
        </button>
        <button
          type="button"
          disabled={eu.carga < SUPER_MAX || e.fase !== 'luta' || pausado}
          onClick={habilidade}
          className={`pixel-box pixel-hover flex flex-col items-center gap-1 px-2 py-2 text-center disabled:opacity-40 ${eu.carga >= SUPER_MAX ? 'piscar' : ''}`}
        >
          <span className="font-pixel text-[8px] text-[rgb(242_193_78)] sm:text-[10px]">
            {HABILIDADES[ia].icone} {HABILIDADES[ia].nome.toUpperCase()} {'●'.repeat(eu.carga)}
            {'○'.repeat(SUPER_MAX - eu.carga)}
          </span>
          <span className="text-[9px] leading-tight text-muted sm:text-[11px]">
            {HABILIDADES[ia].efeito} {eu.carga < SUPER_MAX && `Enche com ${SUPER_MAX} tropas que acertam a torre.`}
          </span>
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
            pode={podeJogar(e, 'eu', c.id) && !pausado}
            carregando={segurando?.id === c.id}
            cores={cores.eu}
            onSegurar={() => comecarCarga(c)}
            onSoltar={() => soltar(c)}
            onCancelar={() => setSegurando(null)}
            onTocar={() => jogar(c, 0)}
          />
        ))}
      </section>
      <p className="text-center text-[10px] text-muted sm:text-xs">Toque para lançar · segure até a barrinha encher: +1 de força (custa +1 💨)</p>
    </div>
  );
}

interface LadoDoDebate {
  nome: string;
  ia: string;
  cor: string;
  lado: string;
  tese: string;
}

/** Abertura: o tema do debate, a tese de cada lado e a contagem 3, 2, 1. */
function AberturaDebate({ etapa, pergunta, voce, dele, onPular }: { etapa: Exclude<Abertura, null>; pergunta: string; voce: LadoDoDebate; dele: LadoDoDebate; onPular: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-2 bg-black/80 px-3 text-center sm:gap-3">
      <button type="button" onClick={onPular} className="absolute right-2 top-2 bg-black/60 px-2 py-1 font-pixel text-[8px] text-fg hover:text-accent sm:text-[10px]">
        PULAR ▶▶
      </button>
      {etapa === 'tema' ? (
        <>
          <p className="surgir font-pixel text-[8px] text-[rgb(242_193_78)] sm:text-xs">⚖ O TEMA DO DUELO</p>
          <h2 className="surgir max-w-xl text-sm font-semibold sm:text-xl">{pergunta}</h2>
          <div className="grid w-full max-w-2xl grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
            {[voce, dele].map((x, i) => (
              <div key={x.nome} className={`surgir flex flex-col gap-1 ${i === 0 ? 'order-1 text-left' : 'order-3 text-right'}`} style={{ animationDelay: `${300 + i * 300}ms` }}>
                <p className="font-pixel text-[8px] sm:text-[11px]" style={{ color: x.cor }}>
                  {i === 0 ? 'VOCÊ · ' : ''}
                  {x.nome.toUpperCase()} · {x.ia.toUpperCase()}
                </p>
                <p className="font-pixel text-[10px] text-white sm:text-base" style={{ textShadow: `0 0 8px ${x.cor}` }}>
                  {x.lado.toUpperCase()}
                </p>
                <p className="line-clamp-3 text-[9px] italic leading-snug text-white/80 sm:text-xs">"{x.tese}"</p>
              </div>
            ))}
            <p className="pancada neon order-2 font-pixel text-base text-accent sm:text-3xl">VS</p>
          </div>
        </>
      ) : (
        <p key={String(etapa)} className="contagem neon font-pixel text-4xl text-accent sm:text-7xl">
          {etapa === 'lutem' ? 'LUTEM!' : etapa}
        </p>
      )}
    </div>
  );
}

function CartaNaMao(props: {
  carta: CartaDuelo;
  numero: number;
  custo: number;
  pode: boolean;
  carregando: boolean;
  cores: Cores;
  onSegurar: () => void;
  onSoltar: () => void;
  onCancelar: () => void;
  onTocar: () => void;
}) {
  const { carta, numero, custo, pode, carregando, cores } = props;
  const info = CARTAS[carta.tipo];
  // Depois de segurar e soltar, o navegador ainda manda um clique: este ignora.
  const ignorarClique = useRef(false);
  const carrega = info.tropa !== 'arqueiro';
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
      <span className={info.tropa === 'centuriao' ? 'w-10 sm:w-14' : 'w-8 sm:w-11'} aria-hidden>
        <Sprite grade={TROPAS[info.tropa]} paleta={cores.paleta} />
      </span>
      <span className="font-pixel text-[8px] leading-relaxed sm:text-[10px]" style={{ color: info.rara ? OURO : cores.cor }}>
        {info.icone} {info.nome.toUpperCase()}
      </span>
      <span className="font-pixel text-[7px] text-muted sm:text-[8px]">
        FORÇA {info.forca} · <span className={custo === 0 ? 'text-[rgb(242_193_78)]' : ''}>💨{custo}</span>
      </span>
      <span className="hidden text-[10px] leading-tight text-muted sm:block">{info.dica}</span>
      <span className="hidden font-pixel text-[7px] text-muted sm:block">[{numero}]</span>
      {/* Barra de carga: cheia = +1 de força (custa +1 de fôlego) */}
      {carrega && (
        <span className="absolute inset-x-0 bottom-0 h-1.5 bg-black/50" aria-hidden>
          {carregando && <span className="carga-enchendo absolute inset-y-0 left-0" style={{ animationDuration: `${CARGA_MS}ms` } as CSSProperties} />}
        </span>
      )}
    </button>
  );
}

/** Gladiador em cima da torre: defende. O seu dá um golpe quando você toca nele. */
function Gladiador({ lado, l, tempo, golpeando, onTocar, children }: { lado: Lado; l: Lutador; tempo: number; golpeando: boolean; onTocar?: () => void; children: ReactNode }) {
  const pronto = l.gladiadorProntoEm <= tempo;
  const corpo = (
    <>
      {l.fala && (
        <span
          key={l.fala.ate}
          className={`surgir absolute bottom-[105%] z-10 block w-[230%] rounded bg-white px-1.5 py-1 text-[8px] leading-tight text-black sm:text-[11px] ${lado === 'eu' ? 'left-0 text-left' : 'right-0 text-right'}`}
        >
          "{l.fala.texto}"
        </span>
      )}
      {l.escudo > 0 && <span className="absolute -top-[2%] left-1/2 z-10 -translate-x-1/2 text-sm sm:text-xl">{'🛡️'.repeat(l.escudo)}</span>}
      <div className={golpeando ? (lado === 'eu' ? 'investida-esq' : 'investida-dir') : ''}>{children}</div>
    </>
  );
  // Em pé no alto da torre (logo acima dela, com os pés nas ameias).
  const pos = 'relative z-10 mx-auto -mb-[18%] block w-[78%]';
  return onTocar ? (
    <button type="button" onClick={onTocar} disabled={!pronto} aria-label="Golpe do gladiador" className={`${pos} text-left disabled:cursor-default`}>
      {corpo}
      {pronto && <span className="piscar absolute -bottom-1 left-1/2 -translate-x-1/2 font-pixel text-[6px] text-[rgb(242_193_78)] sm:text-[8px]">TOQUE</span>}
    </button>
  ) : (
    <div className={pos}>{corpo}</div>
  );
}

/** Vida de uma torre no placar. */
function VidaTorre({ nome, cor, vida, direita = false }: { nome: string; cor: string; vida: number; direita?: boolean }) {
  const pct = (vida / TORRE_VIDA) * 100;
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${direita ? 'items-end' : 'items-start'}`}>
      <p className="max-w-full truncate font-pixel text-[8px] sm:text-[10px]" style={{ color: cor }}>
        🏰 {nome.toUpperCase()}
      </p>
      <div className="relative h-3 w-full bg-black/60 sm:h-4" role="meter" aria-label={`Torre de ${nome}`} aria-valuenow={vida} aria-valuemin={0} aria-valuemax={TORRE_VIDA}>
        <div className={`absolute inset-y-0 transition-all duration-300 ${direita ? 'right-0' : 'left-0'}`} style={{ width: `${pct}%`, background: cor }} />
        <span className="absolute inset-0 flex items-center justify-center font-pixel text-[7px] text-white [text-shadow:1px_1px_0_#000] sm:text-[8px]">
          {vida}/{TORRE_VIDA}
        </span>
      </div>
    </div>
  );
}

function FimDuelo({ e, ia, rival, cores, onDeNovo, onSair }: { e: EstadoDuelo; ia: IaId; rival: IaId; cores: Record<Lado, Cores>; onDeNovo: () => void; onSair: () => void }) {
  const r = resultadoFinal(e);
  return (
    <div className="pixel-box flex flex-col items-center gap-4 p-5 text-center">
      <div className="relative w-24 sm:w-32">
        <PretorPixel />
        <span className="pancada absolute -right-10 top-1/3 text-5xl sm:text-6xl">{r === 'vitoria' ? '👍' : r === 'derrota' ? '👎' : '✋'}</span>
      </div>
      <p className="font-pixel text-[9px] text-[rgb(242_193_78)]">O CÉSAR DECIDIU</p>
      {e.aviso && <p className="font-pixel text-[9px] text-muted">{e.aviso.texto}</p>}
      <h2 className={`pancada neon font-pixel text-3xl sm:text-5xl ${r === 'derrota' ? 'text-accent-2' : 'text-accent'}`}>
        {r === 'vitoria' ? 'VITÓRIA!' : r === 'derrota' ? 'DERROTA' : 'EMPATE'}
      </h2>
      <p className="font-pixel text-[10px] leading-relaxed sm:text-sm">
        VIDA DAS TORRES
        <br />
        <span style={{ color: cores.eu.cor }}>
          {PERSONAGENS[ia].gladiador} {e.torres.eu}
        </span>{' '}
        ×{' '}
        <span style={{ color: cores.rival.cor }}>
          {e.torres.rival} {PERSONAGENS[rival].gladiador}
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
