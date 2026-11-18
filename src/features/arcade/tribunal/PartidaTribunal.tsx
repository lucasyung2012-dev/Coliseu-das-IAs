import { useEffect, useState, type CSSProperties } from 'react';
import { PERSONAGENS, type IaId } from '@/game/personagens';
import { JURADOS, type JuradoId } from '@/game/jurados';
import { useProgresso } from '@/game/progresso';
import { ACERTO_TREINO, modoRanqueado, useDificuldade } from '@/game/conta';
import { FALAS_PRETOR, GOSTOS, REACOES, TEMAS } from '@/game/tribunal/temas';
import type { Carta } from '@/game/tribunal/dilemas';
import {
  avancar,
  efeitoNoJurado,
  jogarAleatoria,
  jogarCarta,
  ladoRival,
  novaPartida,
  podeUsarHabilidade,
  ponteiro,
  TOTAL_TEMPOS,
  usarHabilidade,
  type EstadoTribunal,
} from '@/game/tribunal/motor';
import { GladiadorPixel, JuradoPixel, PretorPixel } from '@/ui/pixel/Personagens';
import { PretorDestaque, VERDE, VERMELHO } from './visual';
import { desbloquear, tocar } from '@/ui/som';
import VereditoTribunal from './VereditoTribunal';

const SEGUNDOS = 90;
const NOMES_TEMPO = ['Sustentação oral', 'Réplica', 'Alegações finais'];

const corDe = (id: IaId) => `rgb(${PERSONAGENS[id].cor})`;
const FALAS_DO_TEMPO = ['Apresentem suas teses!', 'Agora, respondam ao rival!', 'Alegações finais: este tempo vale mais!'];

interface Props {
  ia: IaId;
  rival: IaId;
  jurados: JuradoId[];
  onRevanche: () => void;
  onSair: () => void;
}

export default function PartidaTribunal({ ia, rival, jurados, onRevanche, onSair }: Props) {
  const { trofeus } = useProgresso();
  const dificuldade = useDificuldade();
  // O modo (valendo troféus ou treino) fica fixo do começo ao fim da partida.
  const [ranqueado] = useState(() => modoRanqueado());
  const [e, setE] = useState<EstadoTribunal>(() =>
    novaPartida({ ia, rival, jurados, trofeus: trofeus[ia], acerto: ranqueado ? undefined : ACERTO_TREINO[dificuldade] }),
  );
  const [comecou, setComecou] = useState(false);
  const [escolhida, setEscolhida] = useState<string | null>(null);
  const [modoHabilidade, setModoHabilidade] = useState(false);
  const [restante, setRestante] = useState(SEGUNDOS);

  // Cronômetro de 90 s por tempo; ao zerar, o tribunal joga uma carta por você.
  // O relógio é zerado nos botões que abrem um tempo (Começar e Próximo tempo),
  // nunca aqui, para o efeito de "tempo esgotado" não ver o valor velho.
  useEffect(() => {
    if (!comecou || e.fase !== 'escolha') return;
    const id = window.setInterval(() => setRestante((r) => r - 1), 1000);
    return () => window.clearInterval(id);
  }, [comecou, e.fase, e.tempo]);

  useEffect(() => {
    if (restante <= 0 && e.fase === 'escolha' && comecou) {
      tocar('martelo');
      setE((s) => jogarAleatoria(s));
      setEscolhida(null);
      setModoHabilidade(false);
    }
  }, [restante, e.fase, comecou]);

  useEffect(() => {
    if (e.fase === 'revelacao') tocar('vs');
  }, [e.fase, e.rodadas.length]);

  const voce = PERSONAGENS[ia];
  const dele = PERSONAGENS[rival];
  const ultima = e.rodadas[e.rodadas.length - 1];

  if (e.fase === 'fim') {
    return <VereditoTribunal estado={e} treino={!ranqueado} onRevanche={onRevanche} onSair={onSair} />;
  }

  if (!comecou) {
    return (
      <Briefing
        e={e}
        onComecar={() => {
          desbloquear();
          tocar('start');
          setRestante(SEGUNDOS);
          setComecou(true);
        }}
      />
    );
  }

  const apresentar = () => {
    if (!escolhida) return;
    desbloquear();
    tocar('clique');
    setE((s) => jogarCarta(s, escolhida));
    setEscolhida(null);
    setModoHabilidade(false);
  };

  const habilidade = () => {
    desbloquear();
    tocar('selecionar');
    if (ia === 'gemini') setE((s) => usarHabilidade(s, { tipo: 'visao' }));
    else setModoHabilidade((m) => !m);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Quem é quem: você (verde) contra o rival (vermelho), com a IA e o lado de cada um */}
      <FaixaCombatentes e={e} />

      {/* Tempo, dilema e cronômetro, com o Pretor anunciando o tempo */}
      <div className="pixel-box flex items-center gap-3 p-3">
        <div className="w-10 shrink-0 sm:w-12">
          <PretorPixel />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-pixel text-[9px] text-[rgb(242_193_78)]">
            TEMPO {e.tempo + 1}/{TOTAL_TEMPOS} · {NOMES_TEMPO[e.tempo]!.toUpperCase()}
            {e.tempo === TOTAL_TEMPOS - 1 && ' · VALE 1,5×'}
          </p>
          <p className="mt-1 text-sm font-semibold">{e.dilema.pergunta}</p>
          <p className="text-xs italic text-muted">Pretor: "{FALAS_DO_TEMPO[e.tempo]}"</p>
        </div>
        {e.fase === 'escolha' && (
          <p className={`font-pixel text-lg tabular-nums ${restante <= 10 ? 'piscar text-accent-2' : 'text-accent'}`} aria-label={`${restante} segundos`}>
            ⏱ {Math.max(0, restante)}
          </p>
        )}
      </div>

      {/* Avisos do rival e do Pretor */}
      {e.fase === 'escolha' && e.avisos.map((a) => <Aviso key={a} texto={textoAviso(a, rival)} cor={VERMELHO} />)}
      {e.fase === 'revelacao' && ultima?.automatica && <Aviso texto={`Pretor: "${FALAS_PRETOR.tempoEsgotado}"`} cor="rgb(242 193 78)" />}

      {/* Júri */}
      <section aria-label="Júri" className="grid grid-cols-5 gap-1.5 sm:gap-3">
        {e.jurados.map((j, i) => (
          <CadeiraJurado
            key={j}
            jurado={j}
            valor={ponteiro(e, j)}
            corVoce={VERDE}
            corRival={VERMELHO}
            fala={e.fase === 'revelacao' && ultima ? falaDoJurado(j, ultima, i) : null}
            alvo={modoHabilidade && ia === 'claude' && ponteiro(e, j) < 0}
            onAlvo={() => {
              tocar('jurado');
              setE((s) => usarHabilidade(s, { tipo: 'diplomacia', jurado: j }));
              setModoHabilidade(false);
            }}
          />
        ))}
      </section>

      {e.fase === 'escolha' && (
        <>
          {e.visao && e.cartaRival && (
            <div className="flex flex-col gap-2">
              <p className="font-pixel text-[9px]" style={{ color: VERMELHO }}>
                👁 VISÃO: A CARTA QUE {dele.gladiador.toUpperCase()} VAI JOGAR
              </p>
              <CartaView carta={e.cartaRival} e={e} cor={VERMELHO} doRival />
            </div>
          )}

          {modoHabilidade && (
            <Aviso
              texto={ia === 'claude' ? 'Diplomacia: toque num jurado que está do lado do rival (marcado com ✋).' : 'Improviso: toque na carta que você quer trocar.'}
              cor={VERDE}
            />
          )}

          <section aria-label="Sua mão" className="grid gap-3 sm:grid-cols-2">
            {e.mao.map((c) => (
              <CartaView
                key={c.id}
                carta={c}
                e={e}
                cor={VERDE}
                selecionada={escolhida === c.id}
                trocar={modoHabilidade && ia === 'chatgpt'}
                onClick={() => {
                  desbloquear();
                  if (modoHabilidade && ia === 'chatgpt') {
                    tocar('selecionar');
                    setE((s) => usarHabilidade(s, { tipo: 'improviso', cartaId: c.id }));
                    setModoHabilidade(false);
                    return;
                  }
                  tocar('clique');
                  setEscolhida(c.id);
                }}
              />
            ))}
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={habilidade}
              disabled={!podeUsarHabilidade(e)}
              className="pixel-box pixel-hover px-3 py-2 font-pixel text-[10px] disabled:opacity-40"
              style={{ color: corDe(ia) }}
            >
              ★ {voce.habilidade.nome.toUpperCase()} {e.habilidadeUsada ? '(USADA)' : ''}
            </button>
            <button
              type="button"
              onClick={apresentar}
              disabled={!escolhida}
              className="pixel-box pixel-hover px-5 py-3 font-pixel text-xs text-accent disabled:opacity-40"
            >
              ⚖ APRESENTAR CARTA
            </button>
          </div>
        </>
      )}

      {e.fase === 'revelacao' && ultima && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 font-pixel text-[9px]" style={{ color: VERDE }}>
                ▶ VOCÊ · {voce.ia.toUpperCase()} ({voce.gladiador.toUpperCase()})
              </p>
              <CartaView carta={ultima.cartaJogador} e={e} cor={VERDE} tempoFixo={ultima.tempo} revelada />
            </div>
            <div>
              <p className="mb-1 font-pixel text-[9px]" style={{ color: VERMELHO }}>
                ◀ RIVAL · {dele.ia.toUpperCase()} ({dele.gladiador.toUpperCase()})
              </p>
              <CartaView carta={ultima.cartaRival} e={e} cor={VERMELHO} tempoFixo={ultima.tempo} doRival revelada />
            </div>
          </div>
          <button
            type="button"
            autoFocus
            onClick={() => {
              desbloquear();
              tocar(e.tempo + 1 < TOTAL_TEMPOS ? 'clique' : 'martelo');
              setRestante(SEGUNDOS);
              setE((s) => avancar(s));
            }}
            className="pixel-box pixel-hover self-end px-5 py-3 font-pixel text-xs text-accent"
          >
            {e.tempo + 1 < TOTAL_TEMPOS ? `▶ TEMPO ${e.tempo + 2}` : '⚖ OUVIR O VEREDITO'}
          </button>
        </>
      )}
    </div>
  );
}

function textoAviso(aviso: string, rival: IaId): string {
  const nome = PERSONAGENS[rival].gladiador;
  if (aviso.startsWith('diplomacia:')) {
    const j = aviso.split(':')[1] as JuradoId;
    return `${nome} usou Diplomacia: o ${JURADOS[j].nome} voltou para o meio!`;
  }
  if (aviso === 'improviso') return `${nome} usou Improviso e trocou uma carta da mão.`;
  if (aviso === 'visao') return `${nome} usou Visão: neste tempo ele vai ver a sua carta antes de jogar a dele!`;
  return aviso;
}

/** Frase do jurado sobre a última rodada: primeiro sobre a sua carta, se ela mexeu nele. */
function falaDoJurado(j: JuradoId, r: EstadoTribunal['rodadas'][number], i: number): { texto: string; lado: 'voce' | 'rival' } | null {
  const ef = r.efeitos[j];
  if (!ef) return null;
  const qual = ef.jogador.reacao ? ('voce' as const) : ef.rival.reacao ? ('rival' as const) : null;
  if (!qual) return null;
  const reacao = (qual === 'voce' ? ef.jogador.reacao : ef.rival.reacao)!;
  const frases = REACOES[j][reacao];
  return { texto: frases[(r.tempo + i) % frases.length]!, lado: qual };
}

function Aviso({ texto, cor }: { texto: string; cor: string }) {
  return (
    <p className="surgir pixel-box px-3 py-2 text-sm" style={{ borderLeft: `4px solid ${cor}` }}>
      {texto}
    </p>
  );
}

function CadeiraJurado(props: {
  jurado: JuradoId;
  valor: number;
  corVoce: string;
  corRival: string;
  fala: { texto: string; lado: 'voce' | 'rival' } | null;
  alvo: boolean;
  onAlvo: () => void;
}) {
  const j = JURADOS[props.jurado];
  const g = GOSTOS[props.jurado];
  // A ficha inteira fica esverdeada (seu lado) ou avermelhada (lado do rival).
  const lado = props.valor > 0 ? 'voce' : props.valor < 0 ? 'rival' : 'meio';
  const cor = lado === 'voce' ? props.corVoce : lado === 'rival' ? props.corRival : null;
  const tinta: CSSProperties = cor
    ? { background: `color-mix(in srgb, ${cor} ${8 + Math.abs(props.valor) * 7}%, rgb(var(--surface)))`, boxShadow: `0 0 0 2px ${cor}` }
    : {};
  const conteudo = (
    <>
      <div className="mx-auto w-9 sm:w-14">
        <JuradoPixel jurado={props.jurado} />
      </div>
      <p className="mt-1 truncate font-pixel text-[6px] sm:text-[8px]" style={{ color: j.toga }}>
        {j.nome.toUpperCase()}
      </p>
      <p className="mt-0.5 text-[9px] leading-tight text-muted sm:text-[10px]" title="Ama · gosta · não gosta">
        {TEMAS[g.ama].icone}
        {TEMAS[g.gosta].icone} <span className="opacity-60">✗{TEMAS[g.naoGosta].icone}</span>
      </p>
      <Ponteiro valor={props.valor} corVoce={props.corVoce} corRival={props.corRival} />
      <p className="mt-1 font-pixel text-[6px] sm:text-[8px]" style={{ color: lado === 'voce' ? props.corVoce : lado === 'rival' ? props.corRival : undefined }}>
        {lado === 'voce' ? 'SEU LADO ▶' : lado === 'rival' ? '◀ RIVAL' : 'NO MEIO'}
      </p>
      {props.alvo && <p className="piscar mt-1 text-sm">✋</p>}
    </>
  );
  return (
    <div className="relative flex flex-col">
      {props.alvo ? (
        <button
          type="button"
          onClick={props.onAlvo}
          aria-label={`Usar Diplomacia no ${j.nome}`}
          className="pixel-box pixel-hover p-1.5 text-center transition-all duration-500 sm:p-2"
          style={tinta}
        >
          {conteudo}
        </button>
      ) : (
        <div className="pixel-box p-1.5 text-center transition-all duration-500 sm:p-2" style={tinta}>
          {conteudo}
        </div>
      )}
      {props.fala && (
        <p
          className="surgir mt-1.5 rounded bg-black/70 p-1.5 text-[10px] leading-snug sm:text-xs"
          style={{ borderTop: `3px solid ${props.fala.lado === 'voce' ? props.corVoce : props.corRival}` }}
        >
          {props.fala.lado === 'voce' ? '▶ ' : '◀ '}
          {props.fala.texto}
        </p>
      )}
    </div>
  );
}

/** 7 casas: as 3 da esquerda são do rival, o meio é neutro, as 3 da direita são suas. */
function Ponteiro({ valor, corVoce, corRival }: { valor: number; corVoce: string; corRival: string }) {
  return (
    <div className="mt-1.5 flex justify-center gap-[2px]" role="meter" aria-valuemin={-3} aria-valuemax={3} aria-valuenow={valor} aria-label="Ponteiro do jurado">
      {[-3, -2, -1, 0, 1, 2, 3].map((i) => {
        const cheio = (valor > 0 && i > 0 && i <= valor) || (valor < 0 && i < 0 && i >= valor);
        const style: CSSProperties = {
          background: cheio ? (i > 0 ? corVoce : corRival) : i === 0 ? 'rgb(var(--line))' : 'rgb(var(--bg))',
          boxShadow: cheio ? `0 0 6px ${i > 0 ? corVoce : corRival}` : undefined,
        };
        return <span key={i} className="h-2 w-1.5 transition-all duration-500 sm:h-3 sm:w-2.5" style={style} />;
      })}
    </div>
  );
}

function CartaView(props: {
  carta: Carta;
  e: EstadoTribunal;
  cor: string;
  selecionada?: boolean;
  doRival?: boolean;
  revelada?: boolean;
  trocar?: boolean;
  tempoFixo?: number;
  onClick?: () => void;
}) {
  const { carta, e } = props;
  const tempo = props.tempoFixo ?? e.tempo;
  // Do ponto de vista de quem joga a carta: 👍 = puxa o jurado para o lado dela.
  const efeitos = e.jurados.map((j) => ({ j, v: efeitoNoJurado(carta, j, tempo).valor })).filter((x) => x.v !== 0);
  const corpo = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs">
          {carta.temas.map((t) => (
            <span key={t} className="mr-2 whitespace-nowrap">
              {TEMAS[t].icone} {TEMAS[t].nome}
            </span>
          ))}
        </p>
        {props.trocar && <span className="font-pixel text-[8px] text-accent">↻ TROCAR</span>}
      </div>
      <h3 className="mt-2 font-pixel text-[10px] leading-relaxed sm:text-xs" style={{ color: props.cor }}>
        {carta.titulo}
      </h3>
      <p className="mt-1 text-sm leading-snug">{carta.texto}</p>
      {efeitos.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-muted">
          {efeitos.map(({ j, v }) => (
            <span key={j} className={v > 0 ? 'text-fg' : 'opacity-70'}>
              {v > 0 ? '👍' : '👎'} {JURADOS[j].nome}
            </span>
          ))}
        </p>
      )}
    </>
  );
  const base = `pixel-box block w-full p-3 text-left transition ${props.revelada ? 'surgir' : ''}`;
  const destaque: CSSProperties = props.selecionada ? { boxShadow: `0 0 0 3px ${props.cor}, 0 0 24px -4px ${props.cor}`, transform: 'translateY(-4px)' } : {};
  if (!props.onClick) return <div className={base}>{corpo}</div>;
  return (
    <button type="button" onClick={props.onClick} aria-pressed={props.selecionada} className={`${base} pixel-hover`} style={destaque}>
      {corpo}
    </button>
  );
}

/**
 * Faixa de quem é quem, presente no briefing e em toda a partida: você (verde)
 * contra o rival (vermelho), com o gladiador, a IA, o lado e a opinião de cada um.
 */
function FaixaCombatentes({ e, comTese = false }: { e: EstadoTribunal; comTese?: boolean }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 sm:gap-3">
      <Combatente id={e.ia} quem="voce" lado={e.dilema.lados[e.ladoJogador]} comTese={comTese} />
      <p className="self-center font-pixel text-sm text-[rgb(242_193_78)] sm:text-xl">VS</p>
      <Combatente id={e.rival} quem="rival" lado={e.dilema.lados[ladoRival(e.ladoJogador)]} comTese={comTese} />
    </div>
  );
}

function Combatente({ id, quem, lado, comTese }: { id: IaId; quem: 'voce' | 'rival'; lado: { nome: string; tese: string }; comTese: boolean }) {
  const p = PERSONAGENS[id];
  const cor = quem === 'voce' ? VERDE : VERMELHO;
  return (
    <div
      className={`pixel-box flex min-w-0 items-center gap-2 p-2 sm:gap-3 sm:p-3 ${quem === 'rival' ? 'flex-row-reverse text-right' : ''}`}
      style={{ boxShadow: `0 0 0 3px ${cor}, 0 0 22px -6px ${cor}` }}
    >
      <div className="w-9 shrink-0 sm:w-14">
        <GladiadorPixel ia={id} espelhar={quem === 'rival'} />
      </div>
      <div className="min-w-0">
        <p className="font-pixel text-[8px] sm:text-[10px]" style={{ color: cor }}>
          {quem === 'voce' ? 'VOCÊ' : 'RIVAL'}
        </p>
        <p className="mt-1 truncate text-sm font-semibold sm:text-base">
          <span style={{ color: corDe(id) }}>{p.emblema}</span> {p.ia}
        </p>
        <p className="truncate text-[11px] text-muted sm:text-xs">{p.gladiador}</p>
        <p className="mt-1 inline-block px-1.5 py-0.5 font-pixel text-[7px] text-black sm:text-[9px]" style={{ background: cor }}>
          {lado.nome.toUpperCase()}
        </p>
        {comTese && <p className="mt-1.5 text-xs leading-snug">"{lado.tese}"</p>}
      </div>
    </div>
  );
}

function Briefing({ e, onComecar }: { e: EstadoTribunal; onComecar: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <PretorDestaque fala={FALAS_PRETOR.abertura}>
        <h2 className="mt-3 text-lg font-semibold sm:text-xl">{e.dilema.pergunta}</h2>
      </PretorDestaque>
      <FaixaCombatentes e={e} comTese />
      <section aria-label="O que cada jurado gosta">
        <p className="mb-2 font-pixel text-[9px] text-muted">CONHEÇA O JÚRI</p>
        <ul className="grid gap-2 sm:grid-cols-5">
          {e.jurados.map((j) => {
            const g = GOSTOS[j];
            return (
              <li key={j} className="pixel-box flex items-center gap-3 p-2 sm:flex-col sm:text-center">
                <div className="w-10 shrink-0">
                  <JuradoPixel jurado={j} />
                </div>
                <div className="min-w-0 text-xs">
                  <p className="font-pixel text-[8px]" style={{ color: JURADOS[j].toga }}>
                    {JURADOS[j].nome.toUpperCase()}
                  </p>
                  <p className="mt-1">
                    Ama {TEMAS[g.ama].icone} {TEMAS[g.ama].nome}
                  </p>
                  <p>
                    Gosta {TEMAS[g.gosta].icone} {TEMAS[g.gosta].nome}
                  </p>
                  <p className="text-muted">
                    Não gosta {TEMAS[g.naoGosta].icone} {TEMAS[g.naoGosta].nome}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
      <p className="text-sm text-muted">
        Em cada um dos 3 tempos, escolha 1 de 4 cartas. Ela puxa para o seu lado os jurados que gostam dos temas dela. Ganha quem tiver mais jurados no fim. O 3º
        tempo vale 1,5×.
      </p>
      <button type="button" autoFocus onClick={onComecar} className="pixel-box pixel-hover self-center px-6 py-3 font-pixel text-sm text-accent">
        ⚖ COMEÇAR
      </button>
    </div>
  );
}
