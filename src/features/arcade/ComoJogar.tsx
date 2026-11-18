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
  { icone: '🏰', titulo: 'DERRUBE A TORRE', texto: 'Cada gladiador fica em cima da sua torre. Toda tropa sua que chega na torre do rival tira dela a força que tem. Derrubou a torre: vitória na hora! Se ninguém derrubar, ganha quem tiver mais vida no fim da 3ª rodada.' },
  { icone: '⚔️', titulo: 'CARTAS VIRAM TROPAS', texto: '⚔️ Frase rápida (legionário): barata e veloz, força 2. 🛡️ Tese (centurião): cara e lenta, força 4. 🏹 Fato (arqueiro): atira de longe, mas cai com um golpe. Quando duas tropas se encontram, elas lutam e a que sobrar segue em frente.' },
  { icone: '💪', titulo: 'SEGURE PARA CARREGAR', texto: 'Tocou rápido: tropa normal. Segure a carta até a barrinha encher: a tropa sai com +1 de força e brilhando, mas custa +1 de fôlego. E o rival não espera!' },
  { icone: '🗡️', titulo: 'SEU GLADIADOR', texto: 'Lá de cima da torre, ele bate sozinho em toda tropa inimiga que entra no círculo de luz do chão (tira 1 de força). Toque nele para um golpe extra; depois ele precisa de 8 s para recarregar.' },
  { icone: '⭐', titulo: 'HABILIDADE', texto: 'Cada tropa que acerta a torre do rival enche a habilidade da sua IA. Claude: 🛡️ Escudo (bloqueia 2 golpes na torre). ChatGPT: 🃏 Carta grátis. Gemini: ⚡ Raio (tira 3 da tropa mais perto).' },
  { icone: '⚡', titulo: 'VIRADA E PRORROGAÇÃO', texto: 'Na 3ª rodada, quem tem menos vida recupera fôlego mais rápido. Se as torres empatarem na vida, vem a prorrogação: 20 s com fôlego em dobro!' },
];




export const TUTORIAL_TRIBUNAL: Slide[] = [
  { icone: '⚖️', titulo: 'CONVENÇA O JÚRI', texto: 'Um dilema, dois lados: você (verde) contra o rival (vermelho). Cinco jurados decidem quem argumentou melhor em 3 tempos.' },
  { icone: '🧩', titulo: 'CADA CARTA TEM 2 TEMAS', texto: 'Lógica, Prova, Pessoas, Tradição, Viabilidade, Custo, Inovação, Imagem. Cada jurado ama um tema, gosta de outro e não gosta de um terceiro.' },
  { icone: '👍', titulo: 'LEIA OS JURADOS', texto: 'Na carta aparece 👍 para quem vai gostar e 👎 para quem não vai. Escolha a carta que agrada mais jurados sem irritar os outros.' },
  { icone: '⏱️', titulo: '90 SEGUNDOS POR TEMPO', texto: 'Se o tempo acabar, o tribunal joga uma carta por você. O último tempo vale 1,5×: guarde uma carta boa para ele!' },
  { icone: '✨', titulo: 'SUA HABILIDADE', texto: 'Cada IA tem uma habilidade que pode usar uma vez por partida. Use na hora certa para virar o jogo.' },
];
