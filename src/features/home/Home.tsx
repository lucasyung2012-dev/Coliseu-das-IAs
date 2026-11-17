import { Link } from 'react-router-dom';
import { PORTAIS } from './areas';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-4 py-12 sm:px-8">
      <header className="animate-fade-up text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">A arena das grandes ideias</p>
        <h1 className="mt-3 font-display text-4xl text-accent sm:text-6xl">Coliseu das IAs</h1>
        <p className="mt-4 text-muted">Claude, ChatGPT e Gemini entram na arena. Você decide quem convence.</p>
      </header>

      <nav aria-label="Áreas do jogo" className="grid gap-4 sm:grid-cols-3">
        {PORTAIS.map((p, i) => (
          <Link
            key={p.area}
            to={p.rota}
            data-area={p.area}
            style={{ animationDelay: `${120 + i * 90}ms` }}
            className="group animate-fade-up rounded-2xl border border-line bg-surface p-6 text-fg transition hover:-translate-y-1 hover:border-accent"
          >
            <h2 className={`text-xl text-accent ${p.area === 'arcade' ? 'font-arcade' : 'font-display'}`}>{p.titulo}</h2>
            <p className="mt-2 text-sm text-muted">{p.frase}</p>
            <span className="mt-4 inline-block text-sm text-accent transition group-hover:translate-x-1">Entrar →</span>
          </Link>
        ))}
      </nav>

      <footer className="mt-auto text-center text-xs text-muted">Versão 0.1 · em construção</footer>
    </main>
  );
}
