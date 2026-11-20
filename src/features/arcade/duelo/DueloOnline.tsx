import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IAS, PERSONAGENS, type IaId } from '@/game/personagens';
import { coliseuDe, nivelMaestria, recordeDe, useProgresso } from '@/game/progresso';
import { impressaoDaConta } from '@/game/conta';
import { indiceLiga, PATENTES } from '@/game/ligas';
import { visualDoNivel } from '@/game/maestria';
import { baralhoInicial, novoDuelo, validarBaralho, type EstadoDuelo } from '@/game/duelo/motor';
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
    conta,
  };

  // Sempre que o meu cartão mudar (troquei de IA, a conta chegou), mando de novo.
  useEffect(() => {
    if (sala.current && (fase.tipo === 'sala' || fase.tipo === 'esperando')) sala.current.enviar({ t: 'ola', cartao: meuCartao });
  }, [minhaIa, conta, fase.tipo]);

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
    if (!sala.current || !cartaoRival || contaRepetida || iaRepetida) return;
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
                ) : anfitriao ? (
                  <button
                    type="button"
                    disabled={!cartaoRival}
                    onClick={comecar}
                    className="pixel-box pixel-hover mx-auto px-6 py-4 font-pixel text-lg text-accent disabled:opacity-40"
                    style={{ boxShadow: '0 0 0 3px #f2c14e, 0 0 28px -6px #f2c14e' }}
                  >
                    ⚔ COMEÇAR O DUELO
                  </button>
                ) : (
                  <p className="piscar text-center font-pixel text-[9px] text-muted">ESPERANDO QUEM CRIOU A SALA COMEÇAR…</p>
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
      </div>
    </div>
  );
}
