import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PERSONAGENS } from '@/game/personagens';
import { escolherBaralho, useProgresso } from '@/game/progresso';
import { BARALHO_PADRAO, CARTAS, PAPEIS, TAMANHO_BARALHO, TODAS_AS_CARTAS, validarBaralho, type Papel, type TipoCarta } from '@/game/duelo/motor';
import Sprite from '@/ui/pixel/Sprite';
import { paletaTropa, TROPAS } from '@/ui/pixel/tropas';
import { desbloquear, tocar } from '@/ui/som';

const OURO = '#f2c14e';

/** As cores do baralho são as da IA que você está usando. */
function coresDe(cor: string) {
  const [r, g, b] = cor.split(' ').map(Number) as [number, number, number];
  const forte = `rgb(${r} ${g} ${b})`;
  return { forte, paleta: paletaTropa(forte, `rgb(${Math.round(r * 0.55)} ${Math.round(g * 0.55)} ${Math.round(b * 0.55)})`) };
}

/** Meu baralho: monte as 8 cartas uma vez; fica salvo para os próximos duelos (e na nuvem). */
export default function MeuBaralho() {
  const p = useProgresso();
  const ia = PERSONAGENS[p.iaAtual];
  const { forte, paleta } = coresDe(ia.cor);
  const salvo = validarBaralho(p.baralhoDuelo);
  const [escolhidas, setEscolhidas] = useState<TipoCarta[]>(salvo);
  const [mensagem, setMensagem] = useState('');
  const completo = escolhidas.length === TAMANHO_BARALHO;
  const mudou = escolhidas.join() !== salvo.join();
  const media = escolhidas.length ? escolhidas.reduce((t, c) => t + CARTAS[c].custo, 0) / escolhidas.length : 0;

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
      setMensagem('Seu baralho já tem 8 cartas: tire uma para colocar outra.');
    }
  };
  const salvar = () => {
    desbloquear();
    tocar('fanfarra');
    escolherBaralho(escolhidas);
    setMensagem('✔ Baralho salvo! Ele vale para os próximos duelos.');
  };

  const papeis = Object.keys(PAPEIS) as Papel[];
  return (
    <main data-area="arcade" className="fundo-arcade relative min-h-screen text-fg">
      <div className="crt-overlay" />
      <div className="relative mx-auto flex max-w-5xl flex-col gap-5 px-4 pb-16 pt-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link to="/arena" onClick={() => tocar('clique')} className="font-pixel text-[10px] text-muted hover:text-accent">
            ◀ ARCADE
          </Link>
          <Link to="/arena/duelo" onClick={() => tocar('clique')} className="font-pixel text-[10px] text-accent-2 hover:text-accent">
            ⚔ IR PARA O DUELO
          </Link>
        </div>
        <header className="text-center">
          <h1 className="neon font-pixel text-xl text-accent sm:text-3xl">🃏 MEU BARALHO</h1>
          <p className="mt-2 text-sm text-muted">
            Escolha <strong className="text-fg">8 das 16 cartas</strong>. Cada uma tem um jeito próprio de jogar. As cores são as de{' '}
            <span style={{ color: forte }}>{ia.gladiador} ({ia.ia})</span>.
          </p>
        </header>

        {/* Os 8 escolhidos, em destaque */}
        <section aria-label="Cartas do meu baralho" className="pixel-box flex flex-col gap-3 p-4" style={{ boxShadow: `0 0 0 3px ${forte}, 0 0 30px -8px ${forte}` }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-pixel text-[10px] sm:text-xs" style={{ color: forte }}>
              SEU BARALHO · {escolhidas.length}/{TAMANHO_BARALHO}
            </p>
            <p className="font-pixel text-[9px] text-muted">FÔLEGO MÉDIO 💨 {media.toFixed(1)}</p>
          </div>
          <ul className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {Array.from({ length: TAMANHO_BARALHO }, (_, i) => {
              const c = escolhidas[i];
              return (
                <li key={i}>
                  {c ? (
                    <button
                      type="button"
                      onClick={() => alternar(c)}
                      aria-label={`Tirar ${CARTAS[c].nome}`}
                      className="surgir pixel-box pixel-hover flex h-full w-full flex-col items-center gap-1 p-1.5 text-center"
                    >
                      <Arte tipo={c} paleta={paleta} pequena />
                      <span className="font-pixel text-[6px] leading-snug sm:text-[7px]" style={{ color: forte }}>
                        {CARTAS[c].nome.toUpperCase()}
                      </span>
                      <span className="font-pixel text-[7px] text-muted">💨{CARTAS[c].custo}</span>
                    </button>
                  ) : (
                    <div className="flex aspect-[3/4] items-center justify-center border-2 border-dashed border-white/20 font-pixel text-[8px] text-white/30">+</div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              disabled={!completo || !mudou}
              onClick={salvar}
              className="pixel-box pixel-hover px-5 py-2 font-pixel text-[10px] text-accent disabled:opacity-40"
            >
              💾 SALVAR BARALHO
            </button>
            <button
              type="button"
              onClick={() => {
                tocar('clique');
                setEscolhidas([...BARALHO_PADRAO]);
                setMensagem('');
              }}
              className="pixel-box pixel-hover px-3 py-2 font-pixel text-[9px] text-muted"
            >
              ↺ BARALHO INICIAL
            </button>
          </div>
          <p className="min-h-[1.25rem] text-center text-xs" aria-live="polite" style={{ color: mensagem.startsWith('✔') ? OURO : undefined }}>
            {mensagem || (!completo ? `Faltam ${TAMANHO_BARALHO - escolhidas.length} cartas.` : mudou ? 'Toque em SALVAR para guardar.' : 'Este é o baralho salvo.')}
          </p>
        </section>

        {/* A coleção, por tipo */}
        {papeis.map((papel) => (
          <section key={papel} aria-label={PAPEIS[papel]} className="flex flex-col gap-2">
            <h2 className="font-pixel text-[10px] text-accent-2 sm:text-xs">{PAPEIS[papel].toUpperCase()}</h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TODAS_AS_CARTAS.filter((c) => CARTAS[c].papel === papel).map((c) => {
                const info = CARTAS[c];
                const no = escolhidas.includes(c);
                return (
                  <li key={c}>
                    <button
                      type="button"
                      onClick={() => alternar(c)}
                      aria-pressed={no}
                      aria-label={`${info.nome}: ${info.dica}`}
                      className="pixel-box pixel-hover relative flex h-full w-full flex-col items-center gap-1.5 p-3 text-center transition"
                      style={no ? { boxShadow: `0 0 0 3px ${forte}, 0 0 18px -4px ${forte}`, transform: 'translateY(-3px)' } : undefined}
                    >
                      {no && (
                        <span className="absolute right-1.5 top-1.5 font-pixel text-[8px]" style={{ color: forte }}>
                          ✔
                        </span>
                      )}
                      <span className="absolute left-1.5 top-1.5 font-pixel text-[9px] text-[rgb(242_193_78)]">💨{info.custo}</span>
                      <Arte tipo={c} paleta={paleta} />
                      <span className="font-pixel text-[8px] leading-relaxed sm:text-[10px]" style={{ color: forte }}>
                        {info.icone} {info.nome.toUpperCase()}
                      </span>
                      <span className="rounded bg-black/50 px-1.5 py-0.5 font-pixel text-[7px] text-[rgb(242_193_78)] sm:text-[8px]">★ {info.jeito.toUpperCase()}</span>
                      <span className="text-[11px] leading-snug text-muted">{info.dica}</span>
                      {info.forca > 0 && <span className="font-pixel text-[7px] text-muted">FORÇA {info.forca}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}

/** O desenho da carta: a tropa em pixel, ou o ícone grande nos feitiços. */
export function Arte({ tipo, paleta, pequena = false, grande = false }: { tipo: TipoCarta; paleta: Record<string, string>; pequena?: boolean; grande?: boolean }) {
  const tropa = CARTAS[tipo].tropa;
  const altura = pequena ? 'h-9 sm:h-10' : grande ? 'h-16 sm:h-24' : 'h-14 sm:h-16';
  const largura =
    tropa === 'elefante' ? (pequena ? 'w-12' : grande ? 'w-24 sm:w-32' : 'w-20') : pequena ? 'w-8' : grande ? 'w-14 sm:w-20' : 'w-12 sm:w-14';
  return (
    <span className={`flex items-end justify-center ${altura}`} aria-hidden>
      {tropa ? (
        <span className={largura}>
          <Sprite grade={TROPAS[tropa]} paleta={paleta} />
        </span>
      ) : (
        <span className={pequena ? 'text-2xl' : grande ? 'text-5xl sm:text-6xl' : 'text-4xl sm:text-5xl'}>{CARTAS[tipo].icone}</span>
      )}
    </span>
  );
}
