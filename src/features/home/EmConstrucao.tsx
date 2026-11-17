import { Link } from 'react-router-dom';
import type { Area } from './areas';

interface Props {
  area: Area;
  titulo: string;
  etapa: string;
}

// Tela provisória de cada área até a etapa dela ficar pronta.
export default function EmConstrucao({ area, titulo, etapa }: Props) {
  return (
    <main data-area={area} className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-4 text-center">
      <h1 className={`text-4xl text-accent ${area === 'arcade' ? 'font-arcade' : 'font-display'}`}>{titulo}</h1>
      <p className="text-muted">Em construção · chega na {etapa}.</p>
      <Link to="/" className="rounded-full border border-line px-5 py-2 text-sm hover:border-accent">
        ← Voltar ao início
      </Link>
    </main>
  );
}
