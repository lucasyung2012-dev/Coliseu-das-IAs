import { useState } from 'react';
import { desbloquear, tocar } from '@/ui/som';

/**
 * Tutorial em slides ("Como jogar"), pedido pelo Lucas para o Duelo e o Tribunal.
 * Abre sozinho na primeira vez de cada modo e depois pelo botão ❓.
 */
export interface Slide {
  icone: string;
  titulo: string;
  texto: string;
}

const chave = (modo: string) => `coliseu.tutorial.${modo}`;

function jaViu(modo: string): boolean {
  try {
    return localStorage.getItem(chave(modo)) === '1';
  } catch {
    return false;
  }
}

function marcarVisto(modo: string) {
  try {
    localStorage.setItem(chave(modo), '1');
  } catch {
    /* sem armazenamento: o tutorial só volta a abrir sozinho na próxima vez */
  }
}

/** Estado do tutorial: aberto na primeira vez do modo. */
export function useTutorial(modo: string) {
  const [aberto, setAberto] = useState(() => !jaViu(modo));
  return {
    aberto,
    abrir: () => {
      desbloquear();
      tocar('clique');
      setAberto(true);
    },
    fechar: () => {
      marcarVisto(modo);
      setAberto(false);
    },
  };
}

export function BotaoComoJogar({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="pixel-box pixel-hover px-2 py-1 font-pixel text-[8px] text-accent sm:text-[9px]">
      ❓ COMO JOGAR
    </button>
  );
}

export default function ComoJogar({ titulo, slides, onFechar }: { titulo: string; slides: Slide[]; onFechar: () => void }) {
  const [i, setI] = useState(0);
  const slide = slides[i]!;
  const ultimo = i === slides.length - 1;
  const ir = (n: number) => {
    desbloquear();
    tocar('selecionar');
    setI(n);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label={`Como jogar: ${titulo}`}>
      <div className="pixel-box flex w-full max-w-md flex-col items-center gap-4 bg-[rgb(var(--bg))] p-5 text-center">
        <div className="flex w-full items-center justify-between">
          <p className="font-pixel text-[9px] text-[rgb(242_193_78)]">COMO JOGAR · {titulo}</p>
          <button type="button" onClick={onFechar} className="font-pixel text-[8px] text-muted hover:text-accent">
            PULAR ✕
          </button>
        </div>
        <div key={i} className="surgir flex flex-col items-center gap-3">
          <p className="text-5xl" aria-hidden>
            {slide.icone}
          </p>
          <h2 className="font-pixel text-xs leading-relaxed text-accent sm:text-sm">{slide.titulo}</h2>
          <p className="text-sm leading-relaxed">{slide.texto}</p>
        </div>
        <div className="flex gap-1.5" aria-label={`Passo ${i + 1} de ${slides.length}`}>
          {slides.map((_, n) => (
            <span key={n} className="h-2 w-2" style={{ background: n === i ? 'rgb(var(--accent))' : 'rgb(var(--line))' }} />
          ))}
        </div>
        <div className="flex gap-3">
          <button type="button" disabled={i === 0} onClick={() => ir(i - 1)} className="pixel-box pixel-hover px-3 py-2 font-pixel text-[10px] disabled:opacity-30">
            ◀
          </button>
          {ultimo ? (
            <button
              type="button"
              autoFocus
              onClick={() => {
                desbloquear();
                tocar('start');
                onFechar();
              }}
              className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent"
            >
              ENTENDI! ⚔
            </button>
          ) : (
            <button type="button" autoFocus onClick={() => ir(i + 1)} className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent">
              PRÓXIMO ▶
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const TUTORIAL_DUELO: Slide[] = [
  { icone: '🏟️', titulo: 'CONQUISTE A PLATEIA', texto: 'A barra lá em cima é a plateia. Cada golpe que acerta puxa ela para o seu lado (verde). Puxou até o fim, ou estava na frente quando o tempo acabou: a rodada é sua. Quem ganhar 2 rodadas vence.' },
  { icone: '⚔️', titulo: 'CARTAS SÃO GOLPES', texto: 'Cada carta traz uma frase do debate e custa fôlego. Argumento (⚔️) é rápido, Argumento forte (💥) é lento mas puxa muito. Toque em ▲ ALTO ou ▼ BAIXO na carta para lançar naquela altura.' },
  { icone: '🤸', titulo: 'PULE OU ABAIXE', texto: 'Golpe BAIXO vindo? PULE (⬆ ou W). Golpe ALTO? ABAIXE (⬇ ou S). Esquivar é de graça, mas precisa de um tempinho para recarregar.' },
  { icone: '🛡️', titulo: 'ESCUDO E RÉPLICA', texto: 'O Escudo bloqueia a altura que você escolher por 1,5 s. A Réplica (🔁), bem na hora em que o golpe vai bater, devolve ele mais forte!' },
  { icone: '🔗', titulo: 'COMBOS', texto: 'Retórica em cadeia: 2 Argumentos e depois um Forte, rapidinho, e o Forte voa em dobro de velocidade. Contra-ataque perfeito: atacou logo depois de bloquear? Golpe em dobro!' },
  { icone: '⭐', titulo: 'GOLPE FINAL', texto: 'Cada acerto dá um aplauso. Com 5, solte o golpe final da sua IA (ESPAÇO): Muralha de escudos (Claude), Rede (ChatGPT) ou Raio solar (Gemini).' },
  { icone: '🦁', titulo: 'A ARENA TEM SURPRESAS', texto: 'Às vezes soltam o leão (PULE!), a arena fica em silêncio (sem fôlego novo) ou chove pétalas (aplausos em dobro). Fique de olho no aviso!' },
];

export const TUTORIAL_TRIBUNAL: Slide[] = [
  { icone: '⚖️', titulo: 'CONVENÇA O JÚRI', texto: 'Um dilema, dois lados: você (verde) contra o rival (vermelho). Cinco jurados decidem quem argumentou melhor em 3 tempos.' },
  { icone: '🧩', titulo: 'CADA CARTA TEM 2 TEMAS', texto: 'Lógica, Prova, Pessoas, Tradição, Viabilidade, Custo, Inovação, Imagem. Cada jurado ama um tema, gosta de outro e não gosta de um terceiro.' },
  { icone: '👍', titulo: 'LEIA OS JURADOS', texto: 'Na carta aparece 👍 para quem vai gostar e 👎 para quem não vai. Escolha a carta que agrada mais jurados sem irritar os outros.' },
  { icone: '⏱️', titulo: '90 SEGUNDOS POR TEMPO', texto: 'Se o tempo acabar, o tribunal joga uma carta por você. O último tempo vale 1,5×: guarde uma carta boa para ele!' },
  { icone: '✨', titulo: 'SUA HABILIDADE', texto: 'Cada IA tem uma habilidade que pode usar uma vez por partida. Use na hora certa para virar o jogo.' },
];
