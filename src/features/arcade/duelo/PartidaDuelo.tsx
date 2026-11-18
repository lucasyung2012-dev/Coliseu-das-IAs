import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { PERSONAGENS, type IaId } from '@/game/personagens';
import { JURADOS, sortearJurados } from '@/game/jurados';
import { ACERTO_RIVAL } from '@/game/tribunal/motor';
import { indiceLiga } from '@/game/ligas';
import { ACERTO_TREINO, modoRanqueado, useDificuldade } from '@/game/conta';
import { useProgresso } from '@/game/progresso';
import { DILEMAS, type Carta, type LadoId } from '@/game/tribunal/dilemas';
import { GOSTOS, TEMAS } from '@/game/tribunal/temas';
import {
  APLAUSOS_MAX,
  choque,
  CUSTO,
  DURACAO,
  FOLEGO_MAX,
  FOLEGO_POR_SEGUNDO,
  forca,
  jogadaDoRival,
  LIMITE,
  placar,
  puxar,
  resultado,
  TAMANHO_MAO,
  VOO_MS,
  type Lado,
  type Setor,
} from '@/game/duelo/motor';
import { CenaColiseu } from '../cenas/Cenarios';
import { Faiscas, Palco } from '../cenas/Palco';
import { GladiadorPixel, JuradoPixel, PretorPixel } from '@/ui/pixel/Personagens';
import GladiadorEnfeitado, { useAparencia } from '@/ui/pixel/GladiadorEnfeitado';
import { desbloquear, tocar } from '@/ui/som';
import { VERDE, VERMELHO } from '../tribunal/visual';

// Onde cada setor fica no palco (% do palco) e de onde saem os argumentos.
const SETOR_X = [17, 50, 83];
const ALVO_Y = 30;
const ORIGEM: Record<Lado, { x: number; y: number }> = { eu: { x: 22, y: 72 }, rival: { x: 78, y: 72 } };
const TICK = 100;

interface Projetil {
  id: number;
  lado: Lado;
  carta: Carta;
  setor: number;
  lancadoEm: number;
}

interface Efeito {
  id: number;
  tipo: 'rosas' | 'tomates' | 'choque' | 'epico';
  lado: Lado;
  setor?: number;
  ate: number;
}

interface Estado {
  tempo: number;
  fim: boolean;
  setores: Setor[];
  folego: number;
  folegoRival: number;
  aplausos: number;
  aplausosRival: number;
  mao: Carta[];
  monte: Carta[];
  maoRival: Carta[];
  monteRival: Carta[];
  projeteis: Projetil[];
  efeitos: Efeito[];
  proximoRival: number;
  seq: number;
}

function embaralhar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function inicio(ladoJogador: LadoId, dilemaIdx: number): Estado {
  const d = DILEMAS[dilemaIdx]!;
  const meu = embaralhar(d.lados[ladoJogador].tempos.flat());
  const dele = embaralhar(d.lados[ladoJogador === 'favor' ? 'contra' : 'favor'].tempos.flat());
  return {
    tempo: 0,
    fim: false,
    setores: sortearJurados(3).map((lider) => ({ lider, valor: 0 })),
    folego: 6,
    folegoRival: 6,
    aplausos: 0,
    aplausosRival: 0,
    mao: meu.slice(0, TAMANHO_MAO),
    monte: meu.slice(TAMANHO_MAO),
    maoRival: dele.slice(0, TAMANHO_MAO),
    monteRival: dele.slice(TAMANHO_MAO),
    projeteis: [],
    efeitos: [],
    proximoRival: 2500,
    seq: 0,
  };
}

/** Tira a carta da mão, puxa outra do monte (a jogada volta para o fundo) e cria o projétil. */
function lancar(e: Estado, lado: Lado, carta: Carta, setor: number): Estado {
  const meu = lado === 'eu';
  const mao = meu ? e.mao : e.maoRival;
  const monte = meu ? e.monte : e.monteRival;
  const novaMao = mao.filter((c) => c.id !== carta.id);
  const [proxima, ...resto] = monte;
  if (proxima) novaMao.push(proxima);
  const projetil: Projetil = { id: e.seq + 1, lado, carta, setor, lancadoEm: e.tempo };
  return {
    ...e,
    seq: e.seq + 1,
    projeteis: [...e.projeteis, projetil],
    ...(meu
      ? { mao: novaMao, monte: [...resto, carta], folego: e.folego - CUSTO }
      : { maoRival: novaMao, monteRival: [...resto, carta], folegoRival: e.folegoRival - CUSTO }),
  };
}

function discursoEpico(e: Estado, lado: Lado): Estado {
  return {
    ...e,
    seq: e.seq + 1,
    setores: e.setores.map((s) => ({ ...s, valor: puxar(s.valor, 3, lado) })),
    efeitos: [...e.efeitos, { id: e.seq + 1, tipo: 'epico', lado, ate: e.tempo + 1500 }],
    ...(lado === 'eu' ? { aplausos: 0 } : { aplausosRival: 0 }),
  };
}

/** Um passo do relógio: fôlego, choques no ar, chegadas, jogada do rival e fim. */
function passo(e: Estado, acerto: number, sons: (s: Parameters<typeof tocar>[0]) => void): Estado {
  if (e.fim) return e;
  const tempo = e.tempo + TICK;
  let s: Estado = {
    ...e,
    tempo,
    folego: Math.min(FOLEGO_MAX, e.folego + (FOLEGO_POR_SEGUNDO * TICK) / 1000),
    folegoRival: Math.min(FOLEGO_MAX, e.folegoRival + (FOLEGO_POR_SEGUNDO * TICK) / 1000),
    efeitos: e.efeitos.filter((x) => x.ate > tempo),
  };
  const progresso = (p: Projetil) => (tempo - p.lancadoEm) / VOO_MS;

  // Choque no ar: argumentos dos dois lados indo para o mesmo setor, ambos já no meio do caminho.
  const removidos = new Set<number>();
  const bonus = new Set<number>();
  for (const a of s.projeteis.filter((p) => p.lado === 'eu')) {
    const b = s.projeteis.find((p) => p.lado === 'rival' && p.setor === a.setor && !removidos.has(p.id) && progresso(p) >= 0.55);
    if (!b || removidos.has(a.id) || progresso(a) < 0.55) continue;
    const quem = choque(a.carta, b.carta, s.setores[a.setor]!.lider);
    if (quem !== 'rival') removidos.add(b.id);
    if (quem !== 'eu') removidos.add(a.id);
    if (quem === 'eu') bonus.add(a.id);
    if (quem === 'rival') bonus.add(b.id);
    s = { ...s, seq: s.seq + 1, efeitos: [...s.efeitos, { id: s.seq + 1, tipo: 'choque', lado: 'eu', setor: a.setor, ate: tempo + 700 }] };
    sons('espadas');
  }

  // Chegadas: o argumento puxa o setor; rosas se a plateia amou, tomates se não gostou.
  const voando: Projetil[] = [];
  for (const p of s.projeteis) {
    if (removidos.has(p.id)) continue;
    if (progresso(p) < 1) {
      voando.push(p);
      continue;
    }
    const setor = s.setores[p.setor]!;
    const f = forca(p.carta, setor.lider) + (bonus.has(p.id) ? 1 : 0);
    s = { ...s, setores: s.setores.map((x, i) => (i === p.setor ? { ...x, valor: puxar(x.valor, f, p.lado) } : x)) };
    if (f >= 2 || f <= 0) {
      s = { ...s, seq: s.seq + 1, efeitos: [...s.efeitos, { id: s.seq + 1, tipo: f >= 2 ? 'rosas' : 'tomates', lado: p.lado, setor: p.setor, ate: tempo + 1200 }] };
      if (p.lado === 'eu') sons(f >= 2 ? 'jurado' : 'falha');
    }
    if (f >= 2) s = p.lado === 'eu' ? { ...s, aplausos: Math.min(APLAUSOS_MAX, s.aplausos + 1) } : { ...s, aplausosRival: Math.min(APLAUSOS_MAX, s.aplausosRival + 1) };
  }
  s = { ...s, projeteis: voando };

  // O rival joga quando tem fôlego; usa o Discurso Épico assim que pode.
  if (s.aplausosRival >= APLAUSOS_MAX) {
    s = discursoEpico(s, 'rival');
    sons('fanfarra');
  }
  if (tempo >= s.proximoRival && s.folegoRival >= CUSTO) {
    const j = jogadaDoRival(s.maoRival, s.setores, acerto, Math.random);
    s = lancar(s, 'rival', j.carta, j.setor);
    s = { ...s, proximoRival: tempo + 1600 + Math.random() * (2600 - acerto * 1200) };
  }

  if (tempo >= DURACAO * 1000) s = { ...s, fim: true, projeteis: [] };
  return s;
}

export default function PartidaDuelo({ ia, rival, onDeNovo, onSair }: { ia: IaId; rival: IaId; onDeNovo: () => void; onSair: () => void }) {
  const p = useProgresso();
  const dificuldade = useDificuldade();
  const { liga } = useAparencia(ia);
  const [acerto] = useState(() => (modoRanqueado() ? ACERTO_RIVAL[indiceLiga(p.trofeus[ia])]! : ACERTO_TREINO[dificuldade]));
  const [config] = useState(() => ({ lado: (Math.random() < 0.5 ? 'favor' : 'contra') as LadoId, dilema: Math.floor(Math.random() * DILEMAS.length) }));
  const [e, setE] = useState<Estado>(() => inicio(config.lado, config.dilema));
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const sonsPendentes = useRef<Parameters<typeof tocar>[0][]>([]);

  useEffect(() => {
    tocar('vs');
    const id = window.setInterval(() => {
      setE((s) => passo(s, acerto, (som) => sonsPendentes.current.push(som)));
    }, TICK);
    return () => window.clearInterval(id);
  }, [acerto]);

  // Sons decididos dentro do passo tocam depois da atualização (um de cada por tick).
  useEffect(() => {
    const unicos = [...new Set(sonsPendentes.current)];
    sonsPendentes.current = [];
    unicos.forEach((s) => tocar(s));
  });

  useEffect(() => {
    if (e.fim) tocar(resultado(e.setores) === 'vitoria' ? 'vitoria' : resultado(e.setores) === 'derrota' ? 'derrota' : 'martelo');
  }, [e.fim]);

  const dilema = DILEMAS[config.dilema]!;
  const voce = PERSONAGENS[ia];
  const dele = PERSONAGENS[rival];
  const restante = Math.max(0, Math.ceil(DURACAO - e.tempo / 1000));
  const carta = e.mao.find((c) => c.id === selecionada) ?? null;

  const mirar = (setor: number) => {
    if (!carta || e.folego < CUSTO || e.fim) return;
    desbloquear();
    tocar('selecionar');
    setE((s) => lancar(s, 'eu', carta, setor));
    setSelecionada(null);
  };

  if (e.fim) return <FimDuelo e={e} ia={ia} rival={rival} onDeNovo={onDeNovo} onSair={onSair} />;

  return (
    <div className="flex flex-col gap-3">
      <div className="pixel-box flex items-center justify-between gap-3 px-3 py-2">
        <p className="min-w-0 truncate text-xs sm:text-sm">
          <span className="font-pixel text-[9px] text-[rgb(242_193_78)]">PROTÓTIPO · </span>
          {dilema.pergunta} <span style={{ color: VERDE }}>Você: {dilema.lados[config.lado].nome}</span>
        </p>
        <p className={`font-pixel text-lg tabular-nums ${restante <= 10 ? 'piscar text-accent-2' : 'text-accent'}`}>⏱ {restante}</p>
      </div>

      <Palco rodando={false} onPular={() => undefined}>
        <CenaColiseu corA={`rgb(${voce.cor})`} corB={`rgb(${dele.cor})`} />

        {/* Os 3 setores da plateia: tocar num setor lança a carta escolhida nele */}
        {e.setores.map((s, i) => (
          <button
            key={s.lider}
            type="button"
            onClick={() => mirar(i)}
            disabled={!carta || e.folego < CUSTO}
            aria-label={`Setor do ${JURADOS[s.lider].nome}`}
            className={`absolute top-[3%] w-[30%] -translate-x-1/2 rounded bg-black/55 p-1 text-center transition ${carta ? 'ring-2 ring-[rgb(242_193_78)] hover:bg-black/75' : ''}`}
            style={{ left: `${SETOR_X[i]}%` }}
          >
            <div className="mx-auto w-[22%]">
              <JuradoPixel jurado={s.lider} />
            </div>
            <p className="font-pixel text-[6px] sm:text-[8px]" style={{ color: JURADOS[s.lider].toga }}>
              {JURADOS[s.lider].nome.toUpperCase()}
            </p>
            <p className="text-[9px] sm:text-[11px]">
              {TEMAS[GOSTOS[s.lider].ama].icone}
              {TEMAS[GOSTOS[s.lider].gosta].icone} <span className="opacity-60">✗{TEMAS[GOSTOS[s.lider].naoGosta].icone}</span>
            </p>
            <BarraSetor valor={s.valor} />
          </button>
        ))}

        {/* Gladiadores */}
        <div className="absolute bottom-[4%] left-[10%] w-[14%]">
          <GladiadorEnfeitado ia={ia} />
        </div>
        <div className="absolute bottom-[4%] right-[10%] w-[14%]">
          <div className="respirar">
            <GladiadorPixel ia={rival} liga={liga} espelhar />
          </div>
        </div>

        {/* Argumentos voando */}
        {e.projeteis.map((pr) => {
          const de = ORIGEM[pr.lado];
          const estilo = {
            '--x0': `${de.x}%`,
            '--y0': `${de.y}%`,
            '--x1': `${SETOR_X[pr.setor]}%`,
            '--y1': `${ALVO_Y}%`,
            animationDuration: `${VOO_MS}ms`,
            boxShadow: `0 0 14px 3px ${pr.lado === 'eu' ? VERDE : VERMELHO}`,
            borderColor: pr.lado === 'eu' ? VERDE : VERMELHO,
          } as CSSProperties;
          return (
            <div key={pr.id} className="argumento-voando absolute z-10 rounded-full border-2 bg-black/80 px-1.5 py-0.5 text-xs sm:text-base" style={estilo} aria-hidden>
              {pr.carta.temas.map((t) => TEMAS[t].icone).join('')}
            </div>
          );
        })}

        {/* Efeitos: choque no ar, rosas, tomates e o Discurso Épico */}
        {e.efeitos.map((x) =>
          x.tipo === 'choque' ? (
            <Faiscas key={x.id} x={SETOR_X[x.setor ?? 1]!} y={ALVO_Y + 10} />
          ) : x.tipo === 'epico' ? (
            <div key={x.id} className="clarao pointer-events-none absolute inset-0 z-20" style={{ background: x.lado === 'eu' ? 'rgb(242 193 78 / 0.6)' : 'rgb(255 74 90 / 0.5)' }} />
          ) : (
            <Chuva key={x.id} tipo={x.tipo} lado={x.lado} />
          ),
        )}
      </Palco>

      {/* Fôlego, aplausos e a mão */}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <p className="font-pixel text-[9px] text-muted">
            FÔLEGO {Math.floor(e.folego)}/{FOLEGO_MAX} · cada argumento custa {CUSTO}
          </p>
          <div className="mt-1 flex gap-1" aria-label="Fôlego">
            {Array.from({ length: FOLEGO_MAX }, (_, i) => (
              <span key={i} className="h-3 flex-1" style={{ background: i < Math.floor(e.folego) ? 'rgb(var(--accent))' : 'rgb(var(--line))' }} />
            ))}
          </div>
        </div>
        <button
          type="button"
          disabled={e.aplausos < APLAUSOS_MAX}
          onClick={() => {
            desbloquear();
            tocar('fanfarra');
            setE((s) => discursoEpico(s, 'eu'));
          }}
          className="pixel-box pixel-hover px-3 py-2 font-pixel text-[9px] text-[rgb(242_193_78)] disabled:opacity-40"
        >
          📣 DISCURSO ÉPICO {e.aplausos}/{APLAUSOS_MAX}
        </button>
      </div>

      <section aria-label="Seus argumentos" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {e.mao.map((c) => {
          const sel = c.id === selecionada;
          const pode = e.folego >= CUSTO;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={sel}
              onClick={() => {
                desbloquear();
                tocar('clique');
                setSelecionada(sel ? null : c.id);
              }}
              className={`pixel-box p-2 text-left transition ${pode ? 'pixel-hover' : 'opacity-50'}`}
              style={sel ? { boxShadow: `0 0 0 3px ${VERDE}, 0 0 20px -4px ${VERDE}`, transform: 'translateY(-4px)' } : undefined}
            >
              <p className="text-sm">{c.temas.map((t) => TEMAS[t].icone).join(' ')}</p>
              <p className="mt-1 font-pixel text-[8px] leading-relaxed" style={{ color: VERDE }}>
                {c.titulo}
              </p>
              {/* Força da carta em cada setor, na ordem da arquibancada */}
              <p className="mt-1 flex gap-1 text-[10px]">
                {e.setores.map((s) => {
                  const f = forca(c, s.lider);
                  return (
                    <span key={s.lider} className={f >= 2 ? 'text-accent' : f <= 0 ? 'text-accent-2' : 'text-muted'}>
                      {f >= 2 ? '▲▲' : f === 1 ? '▲' : f === 0 ? '·' : '▼'}
                    </span>
                  );
                })}
              </p>
            </button>
          );
        })}
      </section>
      <p className="text-center text-xs text-muted">
        {carta ? 'Agora toque num setor da plateia para lançar o argumento.' : 'Escolha um argumento e toque no setor da plateia que mais gosta dele (▲▲).'}
      </p>
    </div>
  );
}

/** Barra de um setor: metade esquerda é sua (verde), direita é do rival (vermelho). */
function BarraSetor({ valor }: { valor: number }) {
  const pct = (Math.abs(valor) / LIMITE) * 50;
  return (
    <div className="relative mt-0.5 h-1.5 w-full bg-black/60 sm:h-2" aria-label={`Setor em ${valor}`} role="meter" aria-valuenow={valor} aria-valuemin={-LIMITE} aria-valuemax={LIMITE}>
      <div className="absolute inset-y-0 left-1/2 w-px bg-white/60" />
      <div
        className="absolute inset-y-0 transition-all duration-300"
        style={valor >= 0 ? { left: `${50 - pct}%`, width: `${pct}%`, background: VERDE } : { left: '50%', width: `${pct}%`, background: VERMELHO }}
      />
    </div>
  );
}

/** Rosas (a plateia amou) ou tomates (não gostou) caindo sobre quem lançou. */
function Chuva({ tipo, lado }: { tipo: 'rosas' | 'tomates'; lado: Lado }) {
  const x = lado === 'eu' ? 17 : 83;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[35%] z-10 h-[60%]" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="chuva absolute text-base sm:text-2xl" style={{ left: `${x - 8 + i * 4}%`, animationDelay: `${i * 90}ms` }}>
          {tipo === 'rosas' ? (i % 2 ? '🌹' : '🌿') : '🍅'}
        </span>
      ))}
    </div>
  );
}

/** Fim: o polegar do César decide, e o placar dos setores. */
function FimDuelo({ e, ia, rival, onDeNovo, onSair }: { e: Estado; ia: IaId; rival: IaId; onDeNovo: () => void; onSair: () => void }) {
  const r = resultado(e.setores);
  const pl = placar(e.setores);
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
      <p className="text-sm">
        Setores: <span style={{ color: VERDE }}>{pl.eu} seus</span> × <span style={{ color: VERMELHO }}>{pl.rival} de {PERSONAGENS[rival].gladiador}</span>
      </p>
      <ul className="grid w-full max-w-md grid-cols-3 gap-2">
        {e.setores.map((s) => (
          <li key={s.lider} className="pixel-box p-2 text-xs">
            <div className="mx-auto w-8">
              <JuradoPixel jurado={s.lider} />
            </div>
            <p className="font-pixel text-[7px]">{JURADOS[s.lider].nome.toUpperCase()}</p>
            <p style={{ color: s.valor > 0 ? VERDE : s.valor < 0 ? VERMELHO : undefined }}>{s.valor > 0 ? 'Seu' : s.valor < 0 ? 'Do rival' : 'Dividido'}</p>
          </li>
        ))}
      </ul>
      <p className="font-pixel text-[8px] text-muted">PROTÓTIPO · NÃO VALE TROFÉUS · {PERSONAGENS[ia].gladiador.toUpperCase()}</p>
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
