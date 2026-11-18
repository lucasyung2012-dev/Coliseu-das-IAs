import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PERSONAGENS, type IaId } from '@/game/personagens';
import { ACERTO_RIVAL } from '@/game/tribunal/motor';
import { indiceLiga } from '@/game/ligas';
import { ACERTO_TREINO, modoRanqueado, useDificuldade } from '@/game/conta';
import { useProgresso } from '@/game/progresso';
import { DILEMAS, type LadoId } from '@/game/tribunal/dilemas';
import {
  APLAUSOS_MAX,
  CARTAS,
  FOLEGO_MAX,
  golpeFinal,
  GOLPES_FINAIS,
  jogarCarta,
  LIMITE,
  novoDuelo,
  passo,
  podeJogar,
  posicao,
  resultadoFinal,
  RODADA_MS,
  TICK,
  type CartaDuelo,
  type EstadoDuelo,
  type Lado,
  type Lutador,
  type Projetil,
} from '@/game/duelo/motor';
import { CenaColiseu } from '../cenas/Cenarios';
import { Faiscas, Palco } from '../cenas/Palco';
import { GladiadorPixel, PretorPixel } from '@/ui/pixel/Personagens';
import GladiadorEnfeitado, { useAparencia } from '@/ui/pixel/GladiadorEnfeitado';
import { desbloquear, tocar, type NomeSom } from '@/ui/som';
import { VERDE, VERMELHO } from '../tribunal/visual';
import ComoJogar, { BotaoComoJogar, TUTORIAL_DUELO, useTutorial } from '../ComoJogar';

/** Altura da faixa dos golpes no palco (em %). */
const FAIXA_Y = 64;
const OURO = '#f2c14e';
const ICONE: Record<Projetil['tipo'], string> = { argumento: '⚔️', forte: '💥', dado: '📊', raio: '☀️' };

function embaralhar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

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
  const pausado = tutorial.aberto;

  // O relógio do duelo (para enquanto o tutorial está aberto).
  useEffect(() => {
    if (pausado) return;
    const ctx = { acerto, iaRival: rival, aleatorio: Math.random };
    const id = window.setInterval(() => setE((s) => passo(s, ctx)), TICK);
    return () => window.clearInterval(id);
  }, [acerto, rival, pausado]);

  useEffect(() => {
    tocar('vs');
  }, []);

  // Sons: cada efeito novo toca uma vez.
  const visto = useRef(0);
  useEffect(() => {
    const novos: NomeSom[] = [];
    for (const x of e.efeitos) {
      if (x.id <= visto.current) continue;
      if (x.tipo === 'choque') novos.push('espadas');
      if (x.tipo === 'acerto') novos.push(x.lado === 'eu' ? 'jurado' : 'falha');
      if (x.tipo === 'final') novos.push('fanfarra');
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

  const jogar = (carta: CartaDuelo) => {
    desbloquear();
    tocar('selecionar');
    setE((s) => jogarCarta(s, 'eu', carta.id));
  };
  const final = () => {
    desbloquear();
    setE((s) => golpeFinal(s, 'eu', ia));
  };

  // Teclado: 1 a 4 jogam as cartas, espaço solta o golpe final.
  useEffect(() => {
    if (pausado) return;
    const tecla = (ev: KeyboardEvent) => {
      const n = Number(ev.key);
      if (n >= 1 && n <= 4) {
        const c = e.eu.mao[n - 1];
        if (c) jogar(c);
      } else if (ev.key === ' ') {
        ev.preventDefault();
        final();
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });

  if (e.fase === 'fim') return <FimDuelo e={e} ia={ia} rival={rival} onDeNovo={onDeNovo} onSair={onSair} />;

  const voce = PERSONAGENS[ia];
  const dele = PERSONAGENS[rival];
  const restante = Math.max(0, Math.ceil((RODADA_MS - e.tempo) / 1000));
  const eu = e.eu;

  return (
    <div className="flex flex-col gap-3">
      {tutorial.aberto && <ComoJogar titulo="DUELO" slides={TUTORIAL_DUELO} onFechar={tutorial.fechar} />}

      {/* Placar: quem é quem, rodadas, relógio e a plateia */}
      <div className="pixel-box flex flex-col gap-1 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <Pontos nome={voce.gladiador} cor={VERDE} vitorias={e.rodadas.eu} />
          <p className="text-center font-pixel text-[8px] text-muted sm:text-[10px]">
            RODADA {e.rodada}/3 · <span className={`tabular-nums ${restante <= 5 ? 'piscar text-accent-2' : 'text-accent'}`}>⏱ {restante}</span>
          </p>
          <Pontos nome={dele.gladiador} cor={VERMELHO} vitorias={e.rodadas.rival} direita />
        </div>
        <BarraPlateia valor={e.plateia} />
      </div>

      <Palco rodando={false} onPular={() => undefined}>
        <CenaColiseu corA={`rgb(${voce.cor})`} corB={`rgb(${dele.cor})`} />

        {/* O dilema, numa linha só */}
        <p className="absolute inset-x-0 top-[3%] z-10 truncate px-3 text-center text-[9px] text-white/80 [text-shadow:1px_1px_0_#000] sm:text-xs">
          {dilema.pergunta} <span style={{ color: VERDE }}>Você: {dilema.lados[config.lado].nome}</span>
        </p>

        {/* A faixa dos golpes */}
        <div className="pointer-events-none absolute inset-x-[20%] border-t-2 border-dashed border-white/15" style={{ top: `${FAIXA_Y}%` }} />

        <Gladiador lado="eu" l={eu} tempo={e.tempo}>
          <GladiadorEnfeitado ia={ia} parado />
        </Gladiador>
        <Gladiador lado="rival" l={e.rival} tempo={e.tempo}>
          <GladiadorPixel ia={rival} liga={liga} espelhar />
        </Gladiador>

        {/* Golpes voando: o número é a força */}
        {e.projeteis.map((pr) => {
          const cor = pr.tipo === 'raio' ? OURO : pr.de === 'eu' ? VERDE : VERMELHO;
          return (
            <div
              key={pr.id}
              className="projetil absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${posicao(pr, e.tempo)}%`, top: `${FAIXA_Y}%` }}
              aria-hidden
            >
              <span
                className={`flex items-center gap-0.5 rounded-full border-2 bg-black/85 px-1.5 py-0.5 ${pr.forca >= 4 ? 'text-base sm:text-2xl' : 'text-xs sm:text-lg'}`}
                style={{ borderColor: cor, boxShadow: `0 0 12px 2px ${cor}` }}
              >
                {ICONE[pr.tipo]}
                <span className="font-pixel text-[8px] sm:text-[11px]" style={{ color: cor }}>
                  {pr.forca}
                </span>
              </span>
            </div>
          );
        })}

        {/* Efeitos: faíscas no choque, rosas no acerto, clarão no golpe final */}
        {e.efeitos.map((x) =>
          x.tipo === 'choque' ? (
            <Faiscas key={x.id} x={x.x ?? 50} y={FAIXA_Y} />
          ) : x.tipo === 'acerto' ? (
            <Chuva key={x.id} lado={x.lado} />
          ) : (
            <div key={x.id} className="clarao pointer-events-none absolute inset-0 z-20" style={{ background: x.lado === 'eu' ? 'rgb(242 193 78 / 0.55)' : 'rgb(255 74 90 / 0.45)' }} />
          ),
        )}

        {/* Um aviso por vez, no meio */}
        {e.aviso && e.fase === 'luta' && (
          <p
            key={e.aviso.texto + e.aviso.ate}
            className="pancada neon absolute left-1/2 top-[22%] z-20 -translate-x-1/2 whitespace-nowrap bg-black/60 px-2 py-1 font-pixel text-[9px] sm:text-sm"
            style={{ color: e.aviso.lado === 'eu' ? VERDE : e.aviso.lado === 'rival' ? VERMELHO : OURO }}
          >
            {e.aviso.texto}
          </p>
        )}

        {/* Entre as rodadas */}
        {e.fase === 'intervalo' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/70 text-center">
            <p className="pancada neon font-pixel text-sm text-accent sm:text-2xl">{e.aviso?.texto ?? 'FIM DA RODADA'}</p>
            <p className="font-pixel text-[9px] text-muted sm:text-xs">
              {e.rodadas.eu} × {e.rodadas.rival} · PREPARE-SE PARA A RODADA {e.rodada + 1}
            </p>
          </div>
        )}
      </Palco>

      {/* Fôlego e golpe final, numa linha */}
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-pixel text-[8px] text-muted">
            FÔLEGO {Math.floor(eu.folego)}/{FOLEGO_MAX}
          </p>
          <div className="mt-1 flex gap-1" aria-label="Fôlego">
            {Array.from({ length: FOLEGO_MAX }, (_, i) => (
              <span key={i} className="h-3 flex-1" style={{ background: i < Math.floor(eu.folego) ? 'rgb(var(--accent))' : 'rgb(var(--line))' }} />
            ))}
          </div>
        </div>
        <button
          type="button"
          disabled={eu.aplausos < APLAUSOS_MAX || e.fase !== 'luta'}
          onClick={final}
          title={GOLPES_FINAIS[ia].efeito}
          className={`pixel-box pixel-hover shrink-0 px-3 py-2 font-pixel text-[9px] text-[rgb(242_193_78)] disabled:opacity-40 ${eu.aplausos >= APLAUSOS_MAX ? 'piscar' : ''}`}
        >
          ⭐ {GOLPES_FINAIS[ia].nome.toUpperCase()} {eu.aplausos}/{APLAUSOS_MAX}
        </button>
      </div>

      {/* A mão: um toque lança */}
      <section aria-label="Suas cartas" className="grid grid-cols-4 gap-2">
        {eu.mao.map((c, i) => {
          const info = CARTAS[c.tipo];
          const pode = podeJogar(e, 'eu', c.id);
          return (
            <button
              key={c.id}
              type="button"
              disabled={!pode}
              onClick={() => jogar(c)}
              aria-label={`${info.nome}, força ${info.forca}, custa ${info.custo}`}
              title={info.dica}
              className="pixel-box pixel-hover flex flex-col items-center gap-1 px-1 py-2 text-center disabled:cursor-not-allowed disabled:opacity-40"
              style={info.rara ? { boxShadow: `0 0 0 2px ${OURO}, 0 0 14px -4px ${OURO}` } : undefined}
            >
              <span className="text-2xl sm:text-3xl" aria-hidden>
                {info.icone}
              </span>
              <span className="font-pixel text-[7px] leading-relaxed sm:text-[9px]" style={{ color: info.rara ? OURO : VERDE }}>
                {info.nome.toUpperCase()}
              </span>
              <span className="font-pixel text-[7px] text-muted sm:text-[8px]">
                {info.forca > 0 ? `FORÇA ${info.forca} · ` : ''}💨{info.custo}
              </span>
              <span className="hidden font-pixel text-[7px] text-muted sm:block">[{i + 1}]</span>
            </button>
          );
        })}
      </section>
    </div>
  );
}

/** Gladiador no palco, com o balão da frase e o "preso" (tonto). */
function Gladiador({ lado, l, tempo, children }: { lado: Lado; l: Lutador; tempo: number; children: ReactNode }) {
  const preso = l.presoAte > tempo;
  return (
    <div className={`absolute bottom-[4%] w-[13%] ${lado === 'eu' ? 'left-[7%]' : 'right-[7%]'}`}>
      {l.fala && (
        <p
          key={l.fala.ate}
          className={`surgir absolute bottom-[105%] z-10 w-[220%] rounded bg-white px-1.5 py-1 text-[8px] leading-tight text-black sm:text-[11px] ${lado === 'eu' ? 'left-0' : 'right-0 text-right'}`}
        >
          "{l.fala.texto}"
        </p>
      )}
      {preso && <span className="absolute -top-[15%] left-1/2 z-10 -translate-x-1/2 text-lg sm:text-3xl">💫</span>}
      <div style={{ filter: preso ? 'grayscale(0.7)' : undefined }}>{children}</div>
    </div>
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

/** Rosas caindo sobre quem acertou o golpe. */
function Chuva({ lado }: { lado: Lado }) {
  const x = lado === 'eu' ? 14 : 86;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[30%] z-10 h-[65%]" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="chuva absolute text-base sm:text-2xl" style={{ left: `${x - 6 + i * 4}%`, animationDelay: `${i * 90}ms` }}>
          {i % 2 ? '🌹' : '🌿'}
        </span>
      ))}
    </div>
  );
}

/** Fim: o polegar do César decide, com o placar das rodadas. */
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
        <span style={{ color: VERDE }}>{PERSONAGENS[ia].gladiador} {e.rodadas.eu}</span> × <span style={{ color: VERMELHO }}>{e.rodadas.rival} {PERSONAGENS[rival].gladiador}</span>
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
