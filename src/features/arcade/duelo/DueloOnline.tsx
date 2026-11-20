import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IAS, PERSONAGENS, type IaId } from '@/game/personagens';
import { coliseuDe, escolherBaralho, nivelMaestria, recordeDe, useProgresso } from '@/game/progresso';
import { impressaoDaConta } from '@/game/conta';
import { indiceLiga, PATENTES } from '@/game/ligas';
import { visualDoNivel } from '@/game/maestria';
import { baralhoInicial, CARTAS, novoDuelo, TAMANHO_BARALHO, TODAS_AS_CARTAS, validarBaralho, type EstadoDuelo, type TipoCarta } from '@/game/duelo/motor';
import { paletaTropa } from '@/ui/pixel/tropas';
import { CartaVisual } from './CartaVisual';
import { mesmaConta, normalizarCodigo, novoCodigo, VERSAO_ONLINE, type CartaoCombatente } from '@/game/duelo/online';
import { DILEMAS, type LadoId } from '@/game/tribunal/dilemas';
import { criarSala, entrarNaSala, ErroSala, type Sala } from '@/services/sala';
import GladiadorEnfeitado, { TROFEUS_IMPERADOR } from '@/ui/pixel/GladiadorEnfeitado';
import { desbloquear, tocar } from '@/ui/som';
import PartidaDuelo from './PartidaDuelo';

/**
 * Duelo online por código de sala (combinado com o Lucas): quem cria a sala recebe
 * um código (tipo LEAO-42), o amigo digita e os dois aparelhos se ligam direto.
 * Partida amistosa (sem troféus). Cada um leva o seu cartão de visita (IA, liga,
 * Maestria, prêmios do mapa e baralho) e vê a SUA arena. A mesma conta dos dois
 * lados não joga. Se as IAs forem iguais, o convidado escolhe outra.
 */
type Fase =
  | { tipo: 'inicio' }
  | { tipo: 'abrindo' }
  | { tipo: 'esperando'; codigo: string }
  | { tipo: 'entrando' }
  | { tipo: 'sala' }
  | { tipo: 'jogando'; config: { lado: LadoId; dilema: number }; inicial: EstadoDuelo; rodada: number }
  | { tipo: 'fim'; mensagem: string };

function embaralhar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export default function DueloOnline() {
  const p = useProgresso();
  const navegar = useNavigate();
  const [fase, setFase] = useState<Fase>({ tipo: 'inicio' });
  const [erro, setErro] = useState('');
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [minhaIa, setMinhaIa] = useState<IaId>(p.iaAtual);
  const [conta, setConta] = useState<string | null>(null);
  const [cartaoRival, setCartaoRival] = useState<CartaoCombatente | null>(null);
  // Baralho confirmado na sala (pedido do Lucas: os dois confirmam antes de começar).
  const [pronto, setPronto] = useState(false);
  const [editando, setEditando] = useState(false);
  const sala = useRef<Sala | null>(null);
  const saindo = useRef(false);

  // A impressão digital da conta (para a mesma conta não jogar contra ela mesma).
  useEffect(() => {
    void impressaoDaConta().then(setConta);
  }, []);

  const meuCartao: CartaoCombatente = {
    versao: VERSAO_ONLINE,
    ia: minhaIa,
    liga: indiceLiga(p.trofeus[minhaIa]),
    visual: visualDoNivel(nivelMaestria(p.xp[minhaIa])),
    imperador: recordeDe(p, minhaIa) >= TROFEUS_IMPERADOR,
    coliseu: coliseuDe(p, minhaIa),
    baralho: validarBaralho(p.baralhoDuelo, baralhoInicial(minhaIa)),
    pronto,
    conta,
  };

  // Sempre que o meu cartão mudar (troquei de IA ou de baralho, confirmei, a conta chegou), mando de novo.
  useEffect(() => {
    if (sala.current && (fase.tipo === 'sala' || fase.tipo === 'esperando')) sala.current.enviar({ t: 'ola', cartao: meuCartao });
  }, [minhaIa, conta, fase.tipo, pronto, p.baralhoDuelo?.join()]);

  // Voltou para a sala (revanche): os dois confirmam o baralho de novo.
  useEffect(() => {
    if (fase.tipo === 'sala') setPronto(false);
  }, [fase.tipo]);

  // Fechou a tela: fecha a sala.
  useEffect(
    () => () => {
      saindo.current = true;
      sala.current?.enviar({ t: 'sair' });
      sala.current?.fechar();
    },
    [],
  );

  const ligar = (s: Sala) => {
    sala.current = s;
    s.ouvir((m) => {
      if (m.t === 'ola') setCartaoRival(m.cartao);
      if (m.t === 'versao-diferente') setErro('Os dois aparelhos estão com versões diferentes do jogo. Feche o jogo e abra de novo nos dois (ou recarregue a página) e crie outra sala.');
      if (m.t === 'comecar') setFase((f) => ({ tipo: 'jogando', config: m.config, inicial: m.inicial, rodada: f.tipo === 'jogando' ? f.rodada + 1 : 1 }));
      if (m.t === 'revanche') setFase({ tipo: 'sala' });
      if (m.t === 'sair') {
        s.fechar();
        setFase({ tipo: 'fim', mensagem: 'O seu amigo saiu da sala.' });
      }
    });
    s.aoCair(() => {
      if (!saindo.current) setFase({ tipo: 'fim', mensagem: 'A conexão caiu. Confira a internet e crie outra sala.' });
    });
    setFase({ tipo: 'sala' });
    s.enviar({ t: 'ola', cartao: meuCartao });
  };

  const criar = async () => {
    desbloquear();
    tocar('start');
    setErro('');
    setFase({ tipo: 'abrindo' });
    // Se o código sorteado já estiver em uso, tenta outro.
    for (let tentativa = 0; tentativa < 3; tentativa++) {
      const codigo = novoCodigo();
      try {
        const s = await criarSala(codigo, () => setFase({ tipo: 'esperando', codigo }), () => saindo.current || sala.current !== null);
        if (saindo.current) return s.fechar();
        tocar('fanfarra');
        return ligar(s);
      } catch (e) {
        if (e instanceof ErroSala && e.motivo === 'codigo-em-uso') continue;
        setErro(e instanceof Error ? e.message : 'Não deu para abrir a sala.');
        return setFase({ tipo: 'inicio' });
      }
    }
    setErro('Não deu para abrir a sala. Tente de novo.');
    setFase({ tipo: 'inicio' });
  };

  const entrar = async () => {
    desbloquear();
    const codigo = normalizarCodigo(codigoDigitado);
    if (!codigo) {
      tocar('falha');
      return setErro('O código é uma palavra e dois números, tipo LEAO-42.');
    }
    tocar('start');
    setErro('');
    setFase({ tipo: 'entrando' });
    try {
      const s = await entrarNaSala(codigo);
      if (saindo.current) return s.fechar();
      tocar('fanfarra');
      ligar(s);
    } catch (e) {
      tocar('falha');
      setErro(e instanceof Error ? e.message : 'Não deu para entrar na sala.');
      setFase({ tipo: 'inicio' });
    }
  };

  const anfitriao = sala.current?.papel === 'anfitriao';
  const contaRepetida = !!cartaoRival && mesmaConta(meuCartao, cartaoRival);
  const iaRepetida = !!cartaoRival && cartaoRival.ia === minhaIa;

  const comecar = () => {
    if (!sala.current || !cartaoRival || contaRepetida || iaRepetida || !pronto || !cartaoRival.pronto) return;
    desbloquear();
    tocar('start');
    const config = { lado: (Math.random() < 0.5 ? 'favor' : 'contra') as LadoId, dilema: Math.floor(Math.random() * DILEMAS.length) };
    const dilema = DILEMAS[config.dilema]!;
    const outroLado: LadoId = config.lado === 'favor' ? 'contra' : 'favor';
    const inicial = novoDuelo({
      frasesEu: embaralhar(dilema.lados[config.lado].tempos.flat().map((c) => c.titulo)),
      frasesRival: embaralhar(dilema.lados[outroLado].tempos.flat().map((c) => c.titulo)),
      baralhoEu: meuCartao.baralho,
      baralhoRival: cartaoRival.baralho,
    });
    sala.current.enviar({ t: 'comecar', config, inicial });
    setFase((f) => ({ tipo: 'jogando', config, inicial, rodada: f.tipo === 'jogando' ? f.rodada + 1 : 1 }));
  };

  const sairDaSala = () => {
    saindo.current = true;
    sala.current?.enviar({ t: 'sair' });
    sala.current?.fechar();
    navegar('/arena/duelo');
  };

  return (
    <main data-area="arcade" className="fundo-arcade relative min-h-screen text-fg">
      <div className="crt-overlay" />
      <div className={`relative mx-auto flex ${fase.tipo === 'jogando' ? 'max-w-[1600px]' : 'max-w-3xl'} flex-col gap-5 px-4 pb-16 pt-6 sm:px-8`}>
        <div className="flex items-center justify-between">
          <button type="button" onClick={sairDaSala} className="font-pixel text-[10px] text-muted hover:text-accent">
            ◀ SALA DO DUELO
          </button>
          <p className="font-pixel text-[10px] text-accent-2">🌐 DUELO ONLINE</p>
        </div>

        {fase.tipo === 'jogando' && cartaoRival && sala.current ? (
          <PartidaDuelo
            key={fase.rodada}
            ia={anfitriao ? minhaIa : cartaoRival.ia}
            rival={anfitriao ? cartaoRival.ia : minhaIa}
            online={{ papel: sala.current.papel, sala: sala.current, config: fase.config, inicial: fase.inicial, cartaoRival }}
            onDeNovo={() => {
              sala.current?.enviar({ t: 'revanche' });
              setFase({ tipo: 'sala' });
            }}
            onSair={sairDaSala}
          />
        ) : (
          <>
            <header className="text-center">
              <h1 className="neon font-pixel text-lg text-accent sm:text-2xl">🌐 DUELO ONLINE</h1>
              <p className="mt-2 text-sm text-muted">Cada um no seu aparelho. Crie uma sala e passe o código para o seu amigo, ou entre na sala dele. Partida amistosa: não vale troféus.</p>
            </header>

            {erro && (
              <p role="alert" className="pixel-box p-3 text-center text-sm text-accent-2">
                {erro}
              </p>
            )}

            {fase.tipo === 'inicio' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <button type="button" onClick={() => void criar()} className="pixel-box pixel-hover flex flex-col items-center gap-2 px-4 py-6">
                  <span className="neon font-pixel text-base text-accent sm:text-lg">➕ CRIAR SALA</span>
                  <span className="text-xs text-muted">Você recebe um código para passar ao amigo.</span>
                </button>
                <form
                  className="pixel-box flex flex-col items-center gap-2 px-4 py-5"
                  onSubmit={(ev) => {
                    ev.preventDefault();
                    void entrar();
                  }}
                >
                  <label htmlFor="codigo-sala" className="font-pixel text-sm text-fg">
                    🔑 ENTRAR NA SALA
                  </label>
                  <input
                    id="codigo-sala"
                    value={codigoDigitado}
                    onChange={(ev) => setCodigoDigitado(ev.target.value)}
                    placeholder="LEAO-42"
                    autoCapitalize="characters"
                    autoComplete="off"
                    className="w-40 border-2 border-white/30 bg-black/60 px-2 py-1 text-center font-pixel text-sm uppercase text-[rgb(242_193_78)]"
                  />
                  <button type="submit" className="pixel-box pixel-hover px-3 py-1 font-pixel text-[10px] text-accent">
                    ENTRAR ▶
                  </button>
                </form>
              </div>
            )}

            {(fase.tipo === 'abrindo' || fase.tipo === 'entrando') && (
              <p className="piscar text-center font-pixel text-xs text-muted">{fase.tipo === 'abrindo' ? 'ABRINDO A SALA…' : 'PROCURANDO A SALA…'}</p>
            )}

            {fase.tipo === 'esperando' && (
              <section aria-label="Código da sala" className="pixel-box flex flex-col items-center gap-3 p-6 text-center">
                <p className="font-pixel text-[10px] text-muted">PASSE ESTE CÓDIGO PARA O SEU AMIGO</p>
                <p className="neon select-all font-pixel text-3xl tracking-widest text-[rgb(242_193_78)] sm:text-5xl">{fase.codigo}</p>
                <p className="piscar font-pixel text-[9px] text-muted">ESPERANDO O AMIGO ENTRAR…</p>
              </section>
            )}

            {fase.tipo === 'sala' && (
              <section aria-label="Sala" className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <CartaoNaSala titulo="VOCÊ" cartao={meuCartao} meu />
                  {cartaoRival ? <CartaoNaSala titulo="SEU AMIGO" cartao={cartaoRival} /> : <p className="pixel-box piscar grid place-items-center p-6 font-pixel text-[9px] text-muted">CONECTANDO…</p>}
                </div>

                {/* O seu baralho: dá para mudar aqui mesmo; depois, confirmar. */}
                {!contaRepetida && (
                  <BaralhoNaSala
                    ia={minhaIa}
                    baralho={meuCartao.baralho}
                    pronto={pronto}
                    onMudar={() => {
                      tocar('clique');
                      setEditando(true);
                    }}
                    onConfirmar={() => {
                      desbloquear();
                      tocar(pronto ? 'clique' : 'selecionar');
                      setPronto(!pronto);
                    }}
                  />
                )}
                {editando && (
                  <EditorDeBaralho
                    ia={minhaIa}
                    inicial={meuCartao.baralho}
                    onFechar={(novo) => {
                      if (novo) escolherBaralho(novo);
                      setPronto(false);
                      setEditando(false);
                    }}
                  />
                )}

                {contaRepetida ? (
                  <p role="alert" className="pixel-box p-4 text-center font-pixel text-[10px] leading-relaxed text-accent-2">
                    🚫 VOCÊ NÃO PODE JOGAR CONTRA VOCÊ MESMO. OS DOIS APARELHOS ESTÃO COM A MESMA CONTA.
                  </p>
                ) : iaRepetida && !anfitriao ? (
                  <div className="pixel-box flex flex-col items-center gap-3 p-4 text-center">
                    <p className="font-pixel text-[10px] text-[rgb(242_193_78)]">O SEU AMIGO JÁ ESTÁ COM {PERSONAGENS[minhaIa].ia.toUpperCase()}. ESCOLHA OUTRA IA:</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {IAS.filter((x) => x !== minhaIa).map((x) => (
                        <button
                          key={x}
                          type="button"
                          onClick={() => {
                            tocar('selecionar');
                            setMinhaIa(x);
                            setPronto(false);
                          }}
                          className="pixel-box pixel-hover px-3 py-2 font-pixel text-[10px]"
                          style={{ color: `rgb(${PERSONAGENS[x].cor})` }}
                        >
                          {PERSONAGENS[x].ia.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : iaRepetida ? (
                  <p className="piscar text-center font-pixel text-[9px] text-muted">OS DOIS ESTÃO COM A MESMA IA: O SEU AMIGO ESTÁ ESCOLHENDO OUTRA…</p>
                ) : !pronto || !cartaoRival?.pronto ? (
                  <p className="text-center font-pixel text-[9px] leading-relaxed text-muted">
                    {!pronto ? 'CONFIRME O SEU BARALHO PARA COMEÇAR.' : 'ESPERANDO O SEU AMIGO CONFIRMAR O BARALHO…'}
                  </p>
                ) : anfitriao ? (
                  <button
                    type="button"
                    onClick={comecar}
                    className="pixel-box pixel-hover mx-auto px-6 py-4 font-pixel text-lg text-accent"
                    style={{ boxShadow: '0 0 0 3px #f2c14e, 0 0 28px -6px #f2c14e' }}
                  >
                    ⚔ COMEÇAR O DUELO
                  </button>
                ) : (
                  <p className="piscar text-center font-pixel text-[9px] text-muted">OS DOIS ESTÃO PRONTOS! ESPERANDO QUEM CRIOU A SALA COMEÇAR…</p>
                )}
              </section>
            )}

            {fase.tipo === 'fim' && (
              <section className="pixel-box flex flex-col items-center gap-3 p-6 text-center" role="status">
                <p className="font-pixel text-sm text-accent-2">📴 {fase.mensagem.toUpperCase()}</p>
                <Link to="/arena/duelo" className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent">
                  ◀ VOLTAR À SALA DO DUELO
                </Link>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

/** O cartão de visita de cada jogador na sala: o gladiador com as conquistas e os prêmios. */
function CartaoNaSala({ titulo, cartao, meu = false }: { titulo: string; cartao: CartaoCombatente; meu?: boolean }) {
  const pers = PERSONAGENS[cartao.ia];
  return (
    <div className="pixel-box flex items-center gap-4 p-4" style={{ boxShadow: `0 0 0 3px rgb(${pers.cor})` }}>
      <div className="w-16 shrink-0 sm:w-20">
        <GladiadorEnfeitado ia={cartao.ia} parado aparencia={meu ? undefined : cartao} />
      </div>
      <div className="min-w-0">
        <p className="font-pixel text-[9px] text-muted">{titulo}</p>
        <p className="font-pixel text-sm" style={{ color: `rgb(${pers.cor})` }}>
          {pers.gladiador.toUpperCase()} · {pers.ia.toUpperCase()}
        </p>
        <p className="mt-1 font-pixel text-[8px] text-[rgb(242_193_78)]">{PATENTES[cartao.liga]?.toUpperCase()}</p>
        <p className="mt-1 text-xs text-muted">Baralho de {cartao.baralho.length} cartas · {cartao.conta ? 'com conta' : 'sem conta'}</p>
        <p className={`mt-1 font-pixel text-[8px] ${cartao.pronto ? 'text-[rgb(242_193_78)]' : 'text-muted'}`}>{cartao.pronto ? '✔ BARALHO CONFIRMADO' : 'ESCOLHENDO O BARALHO…'}</p>
      </div>
    </div>
  );
}

/** As cores das cartas são as da IA (igual à Sala do Duelo). */
function coresDe(ia: IaId) {
  const [r, g, b] = PERSONAGENS[ia].cor.split(' ').map(Number) as [number, number, number];
  const forte = `rgb(${r} ${g} ${b})`;
  return { forte, paleta: paletaTropa(forte, `rgb(${Math.round(r * 0.55)} ${Math.round(g * 0.55)} ${Math.round(b * 0.55)})`) };
}

/** O seu baralho na sala: as 8 cartas, MUDAR e CONFIRMAR (pedido do Lucas). */
function BaralhoNaSala({ ia, baralho, pronto, onMudar, onConfirmar }: { ia: IaId; baralho: TipoCarta[]; pronto: boolean; onMudar: () => void; onConfirmar: () => void }) {
  const { forte, paleta } = coresDe(ia);
  return (
    <section aria-label="Seu baralho na sala" className="pixel-box flex flex-col gap-3 p-4" style={pronto ? { boxShadow: '0 0 0 3px #f2c14e' } : undefined}>
      <p className="font-pixel text-[10px]" style={{ color: forte }}>
        🃏 SEU BARALHO {pronto && <span className="text-[rgb(242_193_78)]">· ✔ CONFIRMADO</span>}
      </p>
      <ul className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {baralho.map((c) => (
          <li key={c}>
            <CartaVisual tipo={c} paleta={paleta} corNome={forte} tamanho="mini" />
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" disabled={pronto} onClick={onMudar} className="pixel-box pixel-hover px-3 py-2 font-pixel text-[10px] text-muted disabled:opacity-40">
          ✏️ MUDAR BARALHO
        </button>
        <button
          type="button"
          onClick={onConfirmar}
          className={`px-4 py-2 font-pixel text-[10px] ${pronto ? 'pixel-box pixel-hover text-muted' : 'bg-[rgb(242_193_78)] text-black'}`}
        >
          {pronto ? '↺ DESFAZER' : '✔ CONFIRMAR BARALHO'}
        </button>
      </div>
    </section>
  );
}

/** Trocar as cartas do baralho dentro da sala (salva para os próximos duelos também). */
function EditorDeBaralho({ ia, inicial, onFechar }: { ia: IaId; inicial: TipoCarta[]; onFechar: (novo: TipoCarta[] | null) => void }) {
  const { forte, paleta } = coresDe(ia);
  const [escolhidas, setEscolhidas] = useState<TipoCarta[]>(inicial);
  const completo = escolhidas.length === TAMANHO_BARALHO;
  const alternar = (c: TipoCarta) => {
    if (escolhidas.includes(c)) {
      tocar('clique');
      setEscolhidas((l) => l.filter((x) => x !== c));
    } else if (!completo) {
      tocar('selecionar');
      setEscolhidas((l) => [...l, c]);
    } else tocar('falha');
  };
  return (
    <div role="dialog" aria-label="Mudar baralho" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3">
      <div className="pixel-box flex max-h-full w-full max-w-3xl flex-col gap-3 overflow-y-auto p-4">
        <p className="font-pixel text-xs" style={{ color: forte }}>
          ✏️ MUDAR BARALHO · {escolhidas.length}/{TAMANHO_BARALHO}
        </p>
        <p className="text-xs text-muted">Toque numa carta para pôr ou tirar. O baralho fica salvo para os próximos duelos.</p>
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {TODAS_AS_CARTAS.map((c) => {
            const no = escolhidas.includes(c);
            return (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => alternar(c)}
                  aria-pressed={no}
                  aria-label={CARTAS[c].nome}
                  className="block w-full rounded-sm transition"
                  style={no ? { boxShadow: `0 0 0 3px ${forte}`, transform: 'translateY(-3px)' } : { opacity: completo ? 0.4 : 0.8 }}
                >
                  <CartaVisual tipo={c} paleta={paleta} corNome={forte} tamanho="mini" />
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => onFechar(null)} className="pixel-box pixel-hover px-3 py-2 font-pixel text-[10px] text-muted">
            ✖ CANCELAR
          </button>
          <button
            type="button"
            disabled={!completo}
            onClick={() => {
              tocar('start');
              onFechar(escolhidas);
            }}
            className="bg-[rgb(242_193_78)] px-4 py-2 font-pixel text-[10px] text-black disabled:opacity-40"
          >
            {completo ? '✔ SALVAR BARALHO' : `FALTAM ${TAMANHO_BARALHO - escolhidas.length}`}
          </button>
        </div>
      </div>
    </div>
  );
}
