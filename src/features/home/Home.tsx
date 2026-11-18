import { Link } from 'react-router-dom';
import { IAS } from '@/game/personagens';
import { GladiadorPixel } from '@/ui/pixel/Personagens';
import { PORTAIS } from './areas';

export default function Home() {
  const [arcade, ...outros] = PORTAIS;
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-4 py-12 sm:px-8">
      <header className="animate-fade-up text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">A arena das grandes ideias</p>
        <h1 className="mt-3 font-display text-4xl text-accent sm:text-6xl">Coliseu das IAs</h1>
        <p className="mt-4 text-muted">Claude, ChatGPT e Gemini entram na arena. Você decide quem convence.</p>
      </header>

      <nav aria-label="Áreas do jogo" className="grid gap-5 sm:grid-cols-2">
        {arcade && <PortalArcade rota={arcade.rota} frase={arcade.frase} />}
        {outros.map((p, i) => (
          <Link
            key={p.area}
            to={p.rota}
            data-area={p.area}
            style={{ animationDelay: `${220 + i * 90}ms` }}
            className="group animate-fade-up rounded-2xl border border-line bg-surface p-6 text-fg transition hover:-translate-y-1 hover:border-accent"
          >
            <h2 className="font-display text-xl text-accent">{p.titulo}</h2>
            <p className="mt-2 text-sm text-muted">{p.frase}</p>
            <span className="mt-4 inline-block text-sm text-accent transition group-hover:translate-x-1">Entrar →</span>
          </Link>
        ))}
      </nav>

      <footer className="mt-auto text-center text-xs text-muted">Versão 0.1 · em construção</footer>
    </main>
  );
}

/** Botão do Arcade em forma de tela de fliperama: neon, linhas de TV, gladiadores e "PRESS START". */
function PortalArcade({ rota, frase }: { rota: string; frase: string }) {
  return (
    <Link
      to={rota}
      state={{ boot: true }}
      data-area="arcade"
      aria-label={`Imperium Arcade. ${frase}`}
      className="maquina-arcade group animate-fade-up relative block overflow-hidden bg-bg p-5 text-fg sm:col-span-2 sm:p-8"
      style={{ animationDelay: '120ms' }}
    >
      <div className="tela-crt pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative flex flex-col items-center gap-4 text-center">
        <p className="font-pixel text-[9px] tracking-[0.3em] text-accent-2 sm:text-[10px]">★ 1 JOGADOR ★</p>
        <h2 className="neon letreiro font-pixel text-2xl leading-snug text-accent sm:text-4xl">Imperium Arcade</h2>
        <div className="flex items-end gap-4 sm:gap-10">
          {IAS.map((id, i) => (
            <div key={id} className="w-12 transition-transform duration-200 group-hover:-translate-y-2 sm:w-20" style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="respirar" style={{ animationDelay: `${i * 200}ms` }}>
                <GladiadorPixel ia={id} espelhar={i === 2} />
              </div>
            </div>
          ))}
        </div>
        <p className="max-w-md text-sm text-muted">{frase}</p>
        <p className="piscar font-pixel text-xs text-[rgb(242_193_78)] sm:text-sm">▶ PRESS START</p>
        <div className="mt-1 flex items-center gap-2 font-pixel text-[8px] text-muted sm:text-[9px]">
          <span className="inline-block h-4 w-2 border-2 border-[rgb(242_193_78)] bg-black" aria-hidden />
          INSERT COIN · CRÉDITOS 00
        </div>
      </div>
    </Link>
  );
}
