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
  esquivar,
  EVENTOS,
  FOLEGO_MAX,
  golpeFinal,
  GOLPES_FINAIS,
  jogarCarta,
  LIMITE,
  novoDuelo,
  passo,
  podeJogar,
  progresso,
  resultadoFinal,
  RODADA_MS,
  TICK,
  type Altura,
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

// Geometria do palco (em %): onde ficam os gladiadores e as duas alturas dos golpes.
const ALTURA_Y: Record<Altura, number> = { alto: 50, baixo: 79 };
const SAIDA: Record<Lado, number> = { eu: 22, rival: 78 };
const ESCUDO_X: Record<Lado, number> = { eu: 25, rival: 75 };

function embaralhar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const ICONE_PROJETIL: Record<Projetil['tipo'], string> = { argumento: '⚔️', forte: '💥', dado: '📊', raio: '☀️', replica: '🔁' };

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

  // Sons: cada efeito ou aviso novo toca uma vez.
  const visto = useRef(0);
  useEffect(() => {
    const novos: NomeSom[] = [];
    for (const x of e.efeitos) {
      if (x.id <= visto.current) continue;
      if (x.tipo === 'rosas' && x.lado === 'eu') novos.push('jurado');
      if (x.tipo === 'tomates' && x.lado === 'eu') novos.push('falha');
      if (x.tipo === 'bloqueio' || x.tipo === 'replica') novos.push('espadas');
      if (x.tipo === 'esquiva') novos.push('passos');
      if (x.tipo === 'final') novos.push('fanfarra');
    }
    for (const a of e.avisos) if (a.id > visto.current && a.lado === null && e.fase === 'luta') novos.push('plateia');
    visto.current = Math.max(visto.current, ...e.efeitos.map((x) => x.id), ...e.avisos.map((a) => a.id));
    [...new Set(novos)].forEach((s) => tocar(s));
  }, [e.efeitos, e.avisos, e.fase]);

  useEffect(() => {
    if (e.fase === 'intervalo') tocar('martelo');
    if (e.fase === 'fim') {
      const r = resultadoFinal(e);
      tocar(r === 'vitoria' ? 'vitoria' : r === 'derrota' ? 'derrota' : 'martelo');
    }
  }, [e.fase]);

  const lancar = (carta: CartaDuelo, altura?: Altura) => {
    desbloquear();
    tocar('selecionar');
    setE((s) => jogarCarta(s, 'eu', carta.id, altura));
  };
  const mexer = (mov: 'pular' | 'abaixar') => {
    desbloquear();
    setE((s) => esquivar(s, 'eu', mov));
  };
  const final = () => {
    desbloquear();
    setE((s) => golpeFinal(s, 'eu', ia));
  };

  // Teclado: ⬆/W pula, ⬇/S abaixa, espaço solta o golpe final.
  useEffect(() => {
    if (pausado) return;
    const tecla = (ev: KeyboardEvent) => {
      if (ev.key === 'ArrowUp' || ev.key === 'w' || ev.key === 'W') mexer('pular');
      else if (ev.key === 'ArrowDown' || ev.key === 's' || ev.key === 'S') mexer('abaixar');
      else if (ev.key === ' ') final();
      else return;
      ev.preventDefault();
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });

  if (e.fase === 'fim') return <FimDuelo e={e} ia={ia} rival={rival} onDeNovo={onDeNovo} onSair={onSair} />;

  const voce = PERSONAGENS[ia];
  const dele = PERSONAGENS[rival];
  const restante = Math.max(0, Math.ceil((RODADA_MS - e.tempo) / 1000));
  const eu = e.eu;
  const esquivaPronta = eu.esquivaProntaEm <= e.tempo && eu.atordoadoAte <= e.tempo;
  const evento = e.evento && e.evento.ate > e.tempo ? e.evento : null;
  // Dica de defesa: o golpe do rival que está mais perto de chegar.
  const ameaca = e.projeteis
    .filter((x) => x.de === 'rival')
    .sort((a, b) => progresso(b, e.tempo) - progresso(a, e.tempo))[0];

  return (
    <div className="flex flex-col gap-3">
      {tutorial.aberto && <ComoJogar titulo="DUELO" slides={TUTORIAL_DUELO} onFechar={tutorial.fechar} />}

      <div className="pixel-box flex items-center justify-between gap-3 px-3 py-2">
        <p className="min-w-0 flex-1 text-xs sm:text-sm">
          <span className="font-pixel text-[9px] text-[rgb(242_193_78)]">PROTÓTIPO · </span>
          {dilema.pergunta} <span style={{ color: VERDE }}>Você: {dilema.lados[config.lado].nome}</span>
        </p>
        <BotaoComoJogar onClick={tutorial.abrir} />
      </div>

      {/* Placar: rodadas, plateia (cabo de guerra) e relógio */}
      <div className="pixel-box grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2">
        <Pontos nome={voce.gladiador} cor={VERDE} vitorias={e.rodadas.eu} />
        <div>
          <p className="text-center font-pixel text-[8px] text-muted">
            RODADA {e.rodada}/3 · PLATEIA ·{' '}
            <span className={`tabular-nums ${restante <= 5 ? 'piscar text-accent-2' : 'text-accent'}`}>⏱ {restante}</span>
          </p>
          <BarraPlateia valor={e.plateia} />
        </div>
        <Pontos nome={dele.gladiador} cor={VERMELHO} vitorias={e.rodadas.rival} direita />
      </div>

      <Palco rodando={false} onPular={() => undefined}>
        <CenaColiseu corA={`rgb(${voce.cor})`} corB={`rgb(${dele.cor})`} />

        {/* As duas alturas dos golpes */}
        {(['alto', 'baixo'] as Altura[]).map((a) => (
          <div key={a} className="pointer-events-none absolute inset-x-[20%] border-t-2 border-dashed border-white/15" style={{ top: `${ALTURA_Y[a]}%` }}>
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-full font-pixel text-[6px] text-white/40 sm:text-[8px]">{a.toUpperCase()}</span>
          </div>
        ))}

        <Gladiador lado="eu" l={eu} tempo={e.tempo}>
          <GladiadorEnfeitado ia={ia} parado />
        </Gladiador>
        <Gladiador lado="rival" l={e.rival} tempo={e.tempo}>
          <GladiadorPixel ia={rival} liga={liga} espelhar />
        </Gladiador>

        {/* Golpes voando, cada um com a frase do debate */}
        {e.projeteis.map((pr) => {
          const prog = Math.min(1, Math.max(0, progresso(pr, e.tempo)));
          const x = SAIDA[pr.de] + (SAIDA[pr.de === 'eu' ? 'rival' : 'eu'] - SAIDA[pr.de]) * prog;
          const cor = pr.tipo === 'raio' ? '#f2c14e' : pr.de === 'eu' ? VERDE : VERMELHO;
          return (
            <div key={pr.id} className="projetil absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${x}%`, top: `${ALTURA_Y[pr.altura]}%` }} aria-hidden>
              {pr.frase && <span className="mb-0.5 max-w-[22vw] truncate bg-black/70 px-1 text-[7px] sm:max-w-40 sm:text-[10px]" style={{ color: cor }}>"{pr.frase}"</span>}
              <span
                className={`rounded-full border-2 bg-black/80 px-1.5 py-0.5 ${pr.valor >= 4 ? 'text-base sm:text-2xl' : 'text-xs sm:text-base'}`}
                style={{ borderColor: cor, boxShadow: `0 0 14px 3px ${cor}` }}
              >
                {ICONE_PROJETIL[pr.tipo]}
                {pr.valor > 2 && <span className="ml-0.5 font-pixel text-[7px] sm:text-[9px]">+{pr.valor}</span>}
              </span>
            </div>
          );
        })}

        {/* O leão: aparece no portão e varre o chão no impacto */}
        {evento?.tipo === 'leao' && evento.impactoEm !== undefined && (
          <>
            {!evento.resolvido ? (
              <div className="surgir absolute bottom-[3%] left-1/2 z-10 -translate-x-1/2 text-center">
                <p className="piscar font-pixel text-[8px] text-accent-2 sm:text-xs">PULE EM {Math.max(1, Math.ceil((evento.impactoEm - e.tempo) / 1000))}!</p>
                <p className="text-3xl sm:text-5xl">🦁</p>
              </div>
            ) : (
              <>
                <span className="leao-esq absolute bottom-[3%] z-10 text-3xl sm:text-5xl">🦁</span>
                <span className="leao-dir absolute bottom-[3%] z-10 text-3xl sm:text-5xl">🦁</span>
              </>
            )}
          </>
        )}
        {evento?.tipo === 'petalas' && <Chuva tipo="petalas" lado={null} />}
        {evento?.tipo === 'silencio' && <div className="pointer-events-none absolute inset-0 bg-[rgb(20_20_60/0.35)]" />}

        {/* Faixa do evento da arena */}
        {evento && (
          <div className="absolute left-1/2 top-[3%] z-20 -translate-x-1/2 text-center">
            <p className="pancada neon whitespace-nowrap font-pixel text-[9px] text-[rgb(242_193_78)] sm:text-sm">
              {EVENTOS[evento.tipo].icone} {EVENTOS[evento.tipo].titulo}
            </p>
            <p className="mt-1 bg-black/60 px-2 text-[9px] sm:text-xs">{EVENTOS[evento.tipo].dica}</p>
          </div>
        )}

        {/* Avisos: combos, réplicas, golpes finais, esquivas */}
        <div className="pointer-events-none absolute inset-x-2 top-[22%] z-20 flex flex-col gap-1">
          {e.avisos
            .filter((a) => a.lado !== null || e.fase !== 'luta')
            .slice(-3)
            .map((a) => (
              <p
                key={a.id}
                className={`pancada w-fit max-w-[60%] bg-black/70 px-2 py-0.5 font-pixel text-[7px] leading-relaxed sm:text-[10px] ${a.lado === 'rival' ? 'self-end text-right' : a.lado === 'eu' ? 'self-start' : 'self-center'}`}
                style={{ color: a.lado === 'eu' ? VERDE : a.lado === 'rival' ? VERMELHO : '#f2c14e' }}
              >
                {a.texto}
              </p>
            ))}
        </div>

        {/* Efeitos */}
        {e.efeitos.map((x) =>
          x.tipo === 'rosas' || x.tipo === 'tomates' ? (
            <Chuva key={x.id} tipo={x.tipo} lado={x.lado} />
          ) : x.tipo === 'bloqueio' || x.tipo === 'replica' ? (
            <Faiscas key={x.id} x={ESCUDO_X[x.lado]} y={60} cor={x.tipo === 'replica' ? (x.lado === 'eu' ? VERDE : VERMELHO) : undefined} />
          ) : x.tipo === 'final' ? (
            <div key={x.id} className="clarao pointer-events-none absolute inset-0 z-20" style={{ background: x.lado === 'eu' ? 'rgb(242 193 78 / 0.6)' : 'rgb(255 74 90 / 0.5)' }} />
          ) : (
            <span key={x.id} className="pancada absolute top-[40%] z-10 text-2xl sm:text-4xl" style={{ left: `${x.lado === 'eu' ? 12 : 80}%` }} aria-hidden>
              💨
            </span>
          ),
        )}

        {/* Entre as rodadas */}
        {e.fase === 'intervalo' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/70 text-center">
            <p className="pancada neon font-pixel text-sm text-accent sm:text-2xl">{e.avisos[e.avisos.length - 1]?.texto ?? 'FIM DA RODADA'}</p>
            <p className="font-pixel text-[9px] text-muted sm:text-xs">
              {e.rodadas.eu} × {e.rodadas.rival} · PREPARE-SE PARA A RODADA {e.rodada + 1}
            </p>
          </div>
        )}
      </Palco>

      {/* Defesa: pular, abaixar e a dica do golpe que vem */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <button
          type="button"
          disabled={!esquivaPronta || e.fase !== 'luta'}
          onClick={() => mexer('pular')}
          className="pixel-box pixel-hover px-2 py-3 font-pixel text-[9px] disabled:opacity-40 sm:text-[11px]"
        >
          ⤒ PULAR <span className="block text-[7px] text-muted">desvia do BAIXO · ⬆/W</span>
        </button>
        <p className="w-28 text-center text-[10px] leading-tight sm:w-40 sm:text-xs" aria-live="polite">
          {eu.atordoadoAte > e.tempo ? (
            <span className="text-accent-2">💫 Você está tonto!</span>
          ) : ameaca ? (
            <span style={{ color: VERMELHO }}>Golpe {ameaca.altura.toUpperCase()} vindo: {ameaca.tipo === 'raio' ? 'nada bloqueia!' : ameaca.altura === 'baixo' ? 'PULE!' : 'ABAIXE!'}</span>
          ) : (
            <span className="text-muted">Ataque com as cartas!</span>
          )}
        </p>
        <button
          type="button"
          disabled={!esquivaPronta || e.fase !== 'luta'}
          onClick={() => mexer('abaixar')}
          className="pixel-box pixel-hover px-2 py-3 font-pixel text-[9px] disabled:opacity-40 sm:text-[11px]"
        >
          ⤓ ABAIXAR <span className="block text-[7px] text-muted">desvia do ALTO · ⬇/S</span>
        </button>
      </div>

      {/* Fôlego e golpe final */}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <p className="font-pixel text-[9px] text-muted">
            FÔLEGO {Math.floor(eu.folego)}/{FOLEGO_MAX}
            {evento?.tipo === 'silencio' && <span className="text-accent-2"> · SILÊNCIO: SEM RECUPERAR</span>}
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
          className={`pixel-box pixel-hover px-3 py-2 font-pixel text-[9px] text-[rgb(242_193_78)] disabled:opacity-40 ${eu.aplausos >= APLAUSOS_MAX ? 'piscar' : ''}`}
        >
          ⭐ {GOLPES_FINAIS[ia].nome.toUpperCase()} {'👏'.repeat(eu.aplausos)}
          {'·'.repeat(APLAUSOS_MAX - eu.aplausos)}
        </button>
      </div>

      <section aria-label="Suas cartas" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {eu.mao.map((c) => (
          <CartaNaMao key={c.id} carta={c} pode={podeJogar(e, 'eu', c.id)} onJogar={(a) => lancar(c, a)} />
        ))}
      </section>
    </div>
  );
}

function CartaNaMao({ carta, pode, onJogar }: { carta: CartaDuelo; pode: boolean; onJogar: (a?: Altura) => void }) {
  const info = CARTAS[carta.tipo];
  const ouro = '#f2c14e';
  return (
    <div className={`pixel-box flex flex-col gap-1 p-2 text-left transition ${pode ? '' : 'opacity-50'}`} style={info.rara ? { boxShadow: `0 0 0 2px ${ouro}, 0 0 16px -4px ${ouro}` } : undefined}>
      <p className="flex items-center justify-between gap-1">
        <span className="font-pixel text-[8px] leading-relaxed" style={{ color: info.rara ? ouro : VERDE }}>
          {info.icone} {info.nome.toUpperCase()}
        </span>
        <span className="shrink-0 font-pixel text-[8px] text-accent" title="Custo em fôlego">
          💨{info.custo}
        </span>
      </p>
      <p className="line-clamp-2 text-[11px] italic leading-snug">"{carta.frase}"</p>
      <p className="text-[10px] leading-snug text-muted">
        {info.rara && <span style={{ color: ouro }}>RARA · </span>}
        {info.efeito}
      </p>
      {info.comAltura ? (
        <div className="mt-auto grid grid-cols-2 gap-1">
          {(['alto', 'baixo'] as Altura[]).map((a) => (
            <button
              key={a}
              type="button"
              disabled={!pode}
              onClick={() => onJogar(a)}
              aria-label={`${info.nome} ${a}`}
              className="pixel-box pixel-hover px-1 py-1.5 font-pixel text-[8px] disabled:cursor-not-allowed"
            >
              {a === 'alto' ? '▲ ALTO' : '▼ BAIXO'}
            </button>
          ))}
        </div>
      ) : (
        <button type="button" disabled={!pode} onClick={() => onJogar()} aria-label={`Usar ${info.nome}`} className="pixel-box pixel-hover mt-auto px-1 py-1.5 font-pixel text-[8px] disabled:cursor-not-allowed">
          USAR
        </button>
      )}
    </div>
  );
}

/** Um gladiador no palco, com as poses: pulando, abaixado, escudo, tonto, imune. */
function Gladiador({ lado, l, tempo, children }: { lado: Lado; l: Lutador; tempo: number; children: ReactNode }) {
  const pulando = !!l.esquiva && l.esquiva.evita === 'baixo' && l.esquiva.ate >= tempo;
  const abaixado = !!l.esquiva && l.esquiva.evita === 'alto' && l.esquiva.ate >= tempo;
  const tonto = l.atordoadoAte > tempo;
  const imune = l.imuneAte > tempo;
  const escudo = l.escudo && l.escudo.ate >= tempo ? l.escudo : null;
  const pose = pulando ? 'translateY(-55%)' : abaixado ? 'scaleY(0.55)' : 'none';
  return (
    <>
      <div className={`absolute bottom-[4%] w-[13%] ${lado === 'eu' ? 'left-[8%]' : 'right-[8%]'}`}>
        {imune && <div className="aura-imune pointer-events-none absolute -inset-[20%] rounded-full" />}
        {tonto && <span className="absolute -top-[18%] left-1/2 z-10 -translate-x-1/2 text-lg sm:text-3xl">💫</span>}
        <div className="pose" style={{ transform: pose, transformOrigin: 'bottom', filter: tonto ? 'grayscale(0.7)' : undefined }}>
          {children}
        </div>
      </div>
      {escudo && (
        <span
          className="surgir absolute z-10 -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-4xl"
          style={{ left: `${ESCUDO_X[lado]}%`, top: `${ALTURA_Y[escudo.altura]}%`, filter: `drop-shadow(0 0 8px ${lado === 'eu' ? VERDE : VERMELHO})` }}
          aria-hidden
        >
          🛡️
        </span>
      )}
    </>
  );
}

function Pontos({ nome, cor, vitorias, direita = false }: { nome: string; cor: string; vitorias: number; direita?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 ${direita ? 'items-end' : 'items-start'}`}>
      <p className="max-w-[24vw] truncate font-pixel text-[8px] sm:text-[10px]" style={{ color: cor }}>
        {nome.toUpperCase()}
      </p>
      <p className="flex gap-1" aria-label={`${vitorias} rodadas ganhas`}>
        {[0, 1].map((i) => (
          <span key={i} className="h-2.5 w-2.5 border border-white/40 sm:h-3 sm:w-3" style={{ background: i < vitorias ? cor : 'transparent' }} />
        ))}
      </p>
    </div>
  );
}

/** A plateia inteira: o meio é neutro, a esquerda é sua (verde), a direita é do rival. */
function BarraPlateia({ valor }: { valor: number }) {
  const pct = (Math.abs(valor) / LIMITE) * 50;
  return (
    <div className="relative mt-1 h-4 w-full bg-black/60 sm:h-5" role="meter" aria-label="Plateia" aria-valuenow={valor} aria-valuemin={-LIMITE} aria-valuemax={LIMITE}>
      <div className="absolute inset-y-0 left-1/2 z-10 w-0.5 bg-white/70" />
      <div
        className="absolute inset-y-0 transition-all duration-300"
        style={valor >= 0 ? { left: `${50 - pct}%`, width: `${pct}%`, background: VERDE } : { left: '50%', width: `${pct}%`, background: VERMELHO }}
      />
      <span className="absolute inset-0 flex items-center justify-center font-pixel text-[8px] text-white [text-shadow:1px_1px_0_#000]">
        {valor > 0 ? `+${valor} SEU` : valor < 0 ? `${-valor} DO RIVAL` : 'DIVIDIDA'}
      </span>
    </div>
  );
}

/** Rosas (acertou), tomates (levou o golpe) ou pétalas (evento) caindo da arquibancada. */
function Chuva({ tipo, lado }: { tipo: 'rosas' | 'tomates' | 'petalas'; lado: Lado | null }) {
  const x = lado === 'eu' ? 15 : lado === 'rival' ? 85 : 50;
  const n = lado === null ? 12 : 5;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[25%] z-10 h-[70%]" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="chuva absolute text-base sm:text-2xl"
          style={{ left: lado === null ? `${4 + i * 8}%` : `${x - 8 + i * 4}%`, animationDelay: `${(i % 5) * 90}ms`, animationIterationCount: lado === null ? 'infinite' : undefined }}
        >
          {tipo === 'rosas' ? (i % 2 ? '🌹' : '🌿') : tipo === 'tomates' ? '🍅' : '🌸'}
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
        <span style={{ color: VERDE }}>{e.rodadas.eu}</span> × <span style={{ color: VERMELHO }}>{e.rodadas.rival}</span>
      </p>
      <p className="text-sm">
        Rodadas: <span style={{ color: VERDE }}>{PERSONAGENS[ia].gladiador}</span> contra <span style={{ color: VERMELHO }}>{PERSONAGENS[rival].gladiador}</span>
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
