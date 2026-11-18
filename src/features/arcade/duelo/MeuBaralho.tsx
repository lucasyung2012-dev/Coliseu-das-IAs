import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PERSONAGENS } from '@/game/personagens';
import { escolherBaralho, useProgresso } from '@/game/progresso';
import { baralhoInicial, CARTAS, ESTILO_PREFERIDO, ESTILOS, PAPEIS, TAMANHO_BARALHO, TODAS_AS_CARTAS, validarBaralho, type Papel, type TipoCarta } from '@/game/duelo/motor';
import GladiadorEnfeitado from '@/ui/pixel/GladiadorEnfeitado';
import { paletaTropa } from '@/ui/pixel/tropas';
import { desbloquear, tocar } from '@/ui/som';
import { CartaVisual } from './CartaVisual';

const OURO = '#f2c14e';
type Ordem = 'classe' | 'folego';

/** As cores do baralho são as da IA que você está usando. */
function coresDe(cor: string) {
  const [r, g, b] = cor.split(' ').map(Number) as [number, number, number];
  const forte = `rgb(${r} ${g} ${b})`;
  return { forte, paleta: paletaTropa(forte, `rgb(${Math.round(r * 0.55)} ${Math.round(g * 0.55)} ${Math.round(b * 0.55)})`) };
}

/**
 * Sala do Duelo (pedido do Lucas): à esquerda, grande, o seu baralho (organizado
 * por classe ou por fôlego); à direita, JOGAR (contra a IA) e 2 JOGADORES.
 * O baralho se salva sozinho quando tem as 8 cartas e vale para os próximos duelos.
 */
export default function SalaDoDuelo() {
  const p = useProgresso();
  const navegar = useNavigate();
  const ia = PERSONAGENS[p.iaAtual];
  const { forte, paleta } = coresDe(ia.cor);
  const inicial = baralhoInicial(p.iaAtual);
  const estilo = ESTILOS[ESTILO_PREFERIDO[p.iaAtual]].nome;
  const salvo = validarBaralho(p.baralhoDuelo, inicial);
  const [escolhidas, setEscolhidas] = useState<TipoCarta[]>(salvo);
  const [ordem, setOrdem] = useState<Ordem>('classe');
  const [mensagem, setMensagem] = useState('');
  const completo = escolhidas.length === TAMANHO_BARALHO;
  const media = escolhidas.length ? escolhidas.reduce((t, c) => t + CARTAS[c].custo, 0) / escolhidas.length : 0;

  // Salva sozinho quando o baralho fica completo e diferente do salvo.
  useEffect(() => {
    if (completo && escolhidas.join() !== salvo.join()) {
      escolherBaralho(escolhidas);
      setMensagem('✔ Baralho salvo!');
    }
  }, [escolhidas]);

  const alternar = (c: TipoCarta) => {
    desbloquear();
    setMensagem('');
    if (escolhidas.includes(c)) {
      tocar('clique');
      setEscolhidas((l) => l.filter((x) => x !== c));
    } else if (!completo) {
      tocar('selecionar');
      setEscolhidas((l) => [...l, c]);
    } else {
      tocar('falha');
      setMensagem('Seu baralho já tem 8 cartas: toque numa dele para tirar.');
    }
  };

  const papeis = Object.keys(PAPEIS) as Papel[];
  const grupos: { titulo: string; cartas: TipoCarta[] }[] =
    ordem === 'classe'
      ? papeis.map((papel) => ({ titulo: PAPEIS[papel], cartas: TODAS_AS_CARTAS.filter((c) => CARTAS[c].papel === papel) }))
      : [{ titulo: 'Do mais barato ao mais caro', cartas: [...TODAS_AS_CARTAS].sort((a, b) => CARTAS[a].custo - CARTAS[b].custo || CARTAS[a].nome.localeCompare(CARTAS[b].nome)) }];

  return (
    <main data-area="arcade" className="fundo-arcade relative min-h-screen text-fg">
      <div className="crt-overlay" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-16 pt-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link to="/arena" onClick={() => tocar('clique')} className="font-pixel text-[10px] text-muted hover:text-accent">
            ◀ ARCADE
          </Link>
          <p className="font-pixel text-[10px] text-accent-2">⚔ DUELO</p>
        </div>
        <header className="text-center">
          <h1 className="neon font-pixel text-xl text-accent sm:text-3xl">⚔ SALA DO DUELO</h1>
          <p className="mt-2 text-sm text-muted">
            Monte o seu baralho e escolha como jogar. <span style={{ color: forte }}>{ia.ia}</span> gosta de jogar com{' '}
            <strong className="text-[rgb(242_193_78)]">{estilo}</strong>: o baralho inicial dele é desse estilo.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          {/* Esquerda: o baralho */}
          <div className="flex min-w-0 flex-col gap-4">
            <section aria-label="Seu baralho" className="pixel-box flex flex-col gap-3 p-4" style={{ boxShadow: `0 0 0 3px ${forte}, 0 0 30px -8px ${forte}` }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-pixel text-[10px] sm:text-xs" style={{ color: forte }}>
                  🃏 SEU BARALHO · {escolhidas.length}/{TAMANHO_BARALHO}
                </p>
                <p className="font-pixel text-[9px] text-muted">GOTAS EM MÉDIA {media.toFixed(1)}</p>
              </div>
              <ul className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {Array.from({ length: TAMANHO_BARALHO }, (_, i) => {
                  const c = escolhidas[i];
                  return (
                    <li key={c ?? `vazio-${i}`} className="aspect-[3/4]">
                      {c ? (
                        <button type="button" onClick={() => alternar(c)} aria-label={`Tirar ${CARTAS[c].nome}`} className="surgir h-full w-full transition hover:-translate-y-1">
                          <CartaVisual tipo={c} paleta={paleta} corNome={forte} tamanho="mini" />
                        </button>
                      ) : (
                        <div className="flex h-full items-center justify-center rounded-md border-2 border-dashed border-white/20 font-pixel text-xs text-white/30">+</div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs" aria-live="polite" style={{ color: mensagem.startsWith('✔') ? OURO : undefined }}>
                  {mensagem || (completo ? 'Toque numa carta do baralho para tirar.' : `Faltam ${TAMANHO_BARALHO - escolhidas.length} cartas.`)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    tocar('clique');
                    setEscolhidas([...inicial]);
                  }}
                  className="font-pixel text-[8px] text-muted hover:text-accent"
                >
                  ↺ BARALHO INICIAL DO {ia.ia.toUpperCase()} ({estilo.toUpperCase()})
                </button>
              </div>
            </section>

            {/* Organizar a coleção */}
            <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Organizar as cartas">
              <span className="font-pixel text-[9px] text-muted">ORGANIZAR:</span>
              {(
                [
                  ['classe', 'POR CLASSE'],
                  ['folego', 'POR GOTAS'],
                ] as [Ordem, string][]
              ).map(([o, nome]) => (
                <button
                  key={o}
                  type="button"
                  role="radio"
                  aria-checked={ordem === o}
                  onClick={() => {
                    tocar('clique');
                    setOrdem(o);
                  }}
                  className={`px-3 py-1.5 font-pixel text-[9px] ${ordem === o ? 'bg-[rgb(242_193_78)] text-black' : 'pixel-box pixel-hover text-muted'}`}
                >
                  {nome}
                </button>
              ))}
            </div>

            {grupos.map((g) => (
              <section key={g.titulo} aria-label={g.titulo} className="flex flex-col gap-2">
                <h2 className="font-pixel text-[10px] text-accent-2 sm:text-xs">{g.titulo.toUpperCase()}</h2>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {g.cartas.map((c) => {
                    const no = escolhidas.includes(c);
                    return (
                      <li key={c}>
                        <button
                          type="button"
                          onClick={() => alternar(c)}
                          aria-pressed={no}
                          aria-label={`${CARTAS[c].nome}: ${CARTAS[c].dica}`}
                          className="relative block h-full w-full transition hover:-translate-y-1"
                          style={no ? { filter: `drop-shadow(0 0 8px ${forte})`, transform: 'translateY(-3px)' } : { opacity: completo ? 0.6 : 1 }}
                        >
                          <CartaVisual tipo={c} paleta={paleta} corNome={forte} mostrarDica />
                          {no && (
                            <span className="absolute right-1 top-4 rounded-full bg-black px-1 font-pixel text-[9px] sm:top-5" style={{ color: forte }}>
                              ✔
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          {/* Direita: como jogar */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
            <section aria-label="Seu combatente" className="pixel-box flex items-center gap-3 p-4">
              <div className="w-16 shrink-0">
                <GladiadorEnfeitado ia={p.iaAtual} parado />
              </div>
              <div className="min-w-0">
                <p className="font-pixel text-[9px]" style={{ color: forte }}>
                  {ia.ia.toUpperCase()}
                </p>
                <p className="font-pixel text-sm">{ia.gladiador.toUpperCase()}</p>
                <Link to="/arena" className="font-pixel text-[8px] text-muted hover:text-accent">
                  ↺ TROCAR DE IA
                </Link>
              </div>
            </section>
            <button
              type="button"
              disabled={!completo}
              onClick={() => {
                desbloquear();
                tocar('start');
                navegar('/arena/duelo/jogar');
              }}
              className="pixel-box pixel-hover flex flex-col items-center gap-1 px-4 py-6 disabled:opacity-40"
              style={completo ? { boxShadow: `0 0 0 3px ${OURO}, 0 0 28px -6px ${OURO}` } : undefined}
            >
              <span className="neon font-pixel text-xl text-accent sm:text-2xl">▶ JOGAR</span>
              <span className="text-xs text-muted">{completo ? 'Contra uma IA rival' : 'Complete o baralho com 8 cartas'}</span>
            </button>
            <button type="button" disabled className="pixel-box flex flex-col items-center gap-1 px-4 py-4 opacity-60" aria-label="2 jogadores (em breve)">
              <span className="font-pixel text-sm text-fg">👥 2 JOGADORES</span>
              <span className="font-pixel text-[8px] text-[rgb(242_193_78)]">EM BREVE · NO MESMO APARELHO</span>
            </button>
            <p className="text-center text-xs text-muted">Sair no meio de uma partida conta como derrota.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
