import { useEffect, useState } from 'react';
import Sprite from '@/ui/pixel/Sprite';
import { GladiadorPixel } from '@/ui/pixel/Personagens';
import { IAS } from '@/game/personagens';
import { prefereMenosMovimento, useSequencia } from '@/ui/movimento';
import { desbloquear, tocar } from '@/ui/som';

/**
 * Abertura do app (pedido do Lucas): noite sobre o Coliseu, o sol do logo nasce
 * atrás dele, os três gladiadores entram na arena e as letras do título caem como
 * pedras. Toque para entrar. Aparece uma vez por sessão e dá para pular.
 */
const CHAVE = 'coliseu.abertura.vista';
const TITULO = ['COLISEU', 'DAS IAS'];

// O Coliseu em pixel, desenhado por código: três andares de arcos e a borda de cima.
// P = pedra clara, p = pedra na sombra, a = dentro do arco (escuro), K = contorno.
function desenharColiseu(): string[] {
  const largura = 72;
  const linhas: string[] = [];
  const andar = (alturaArco: number, passo: number, recuo: number) => {
    // Faixa (cornija) em cima de cada andar
    linhas.push(' '.repeat(recuo) + 'K'.repeat(largura - recuo * 2) + ' '.repeat(recuo));
    linhas.push(' '.repeat(recuo) + 'P'.repeat(largura - recuo * 2) + ' '.repeat(recuo));
    for (let y = 0; y < alturaArco; y++) {
      let l = '';
      for (let x = recuo; x < largura - recuo; x++) {
        const m = (x - recuo) % passo;
        // O arco: abertura no meio de cada vão, com o topo arredondado.
        const meio = passo / 2;
        const dist = Math.abs(m + 0.5 - meio);
        const raio = passo / 2 - 1.5;
        const dentro = y === 0 ? dist < raio - 1 : dist < raio;
        l += dentro ? 'a' : m === 0 ? 'p' : 'P';
      }
      linhas.push(' '.repeat(recuo) + l + ' '.repeat(recuo));
    }
  };
  andar(3, 6, 4);
  andar(5, 6, 2);
  andar(6, 6, 1);
  andar(7, 6, 0);
  linhas.push('K'.repeat(largura));
  return linhas;
}
const COLISEU = desenharColiseu();
const PALETA_COLISEU = { K: '#140c22', P: '#c9a27a', p: '#8a6448', a: '#2a1240' };

// Estrelas fixas (mesmas posições sempre, para não pular a cada render).
const ESTRELAS = Array.from({ length: 40 }, (_, i) => ({
  x: (i * 37) % 100,
  y: (i * 53) % 55,
  d: (i % 5) * 0.4,
  g: i % 7 === 0,
}));

export function precisaAbertura(): boolean {
  if (import.meta.env.MODE === 'test' || prefereMenosMovimento()) return false;
  try {
    return sessionStorage.getItem(CHAVE) !== '1';
  } catch {
    return false;
  }
}

export default function AberturaApp({ onFim }: { onFim: () => void }) {
  // 0 noite · 1 sol nasce · 2 gladiadores entram · 3 título cai · 4 toque para entrar
  const [fase, pular] = useSequencia([300, 1500, 2700, 4300]);
  const [saindo, setSaindo] = useState(false);

  // As pedras do título batem no chão: um baque só (se o som já estiver liberado).
  useEffect(() => {
    if (fase === 3) tocar('portao');
  }, [fase]);

  const entrar = () => {
    if (saindo) return;
    try {
      sessionStorage.setItem(CHAVE, '1');
    } catch {
      /* sem sessionStorage: só não lembra */
    }
    desbloquear();
    tocar('start');
    setSaindo(true);
    window.setTimeout(onFim, 450);
  };

  return (
    <div
      role="dialog"
      aria-label="Abertura do Coliseu das IAs"
      className={`fixed inset-0 z-[100] flex cursor-pointer select-none flex-col items-center justify-end overflow-hidden transition-opacity duration-500 ${saindo ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'linear-gradient(#0a0618 0%, #1c0f3a 55%, #3a1a4a 80%, #5a2a3a 100%)' }}
      onClick={() => (fase >= 4 ? entrar() : pular())}
    >
      {/* Céu estrelado */}
      {ESTRELAS.map((s, i) => (
        <span
          key={i}
          className="abertura-estrela absolute bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.g ? 4 : 2, height: s.g ? 4 : 2, animationDelay: `${s.d}s` }}
          aria-hidden
        />
      ))}

      {/* O sol do logo nasce atrás do Coliseu */}
      <img
        src={`${import.meta.env.BASE_URL}logo.svg`}
        alt=""
        aria-hidden
        className="absolute left-1/2 w-[38vmin] -translate-x-1/2 transition-all duration-[1400ms] ease-out [image-rendering:pixelated]"
        style={{ bottom: fase >= 1 ? '34%' : '8%', opacity: fase >= 1 ? 1 : 0, filter: 'drop-shadow(0 0 30px #ffd04a)' }}
      />

      {/* O título: cada letra cai como uma pedra */}
      <h1 className="absolute inset-x-0 top-[8%] z-20 flex flex-col items-center gap-2 font-pixel text-[9vmin] leading-none sm:text-[8vmin]" aria-label="Coliseu das IAs">
        {fase >= 3 &&
          TITULO.map((palavra, p) => (
            <span key={palavra} className="flex" aria-hidden>
              {[...palavra].map((letra, i) => (
                <span
                  key={i}
                  className="abertura-pedra inline-block text-[#f2c14e] [text-shadow:4px_4px_0_#5a2a12,0_0_18px_rgb(255_208_74/0.5)]"
                  style={{ animationDelay: `${(p * 7 + i) * 60}ms`, width: letra === ' ' ? '0.5em' : undefined }}
                >
                  {letra}
                </span>
              ))}
            </span>
          ))}
      </h1>

      {/* O Coliseu e os três gladiadores entrando na arena */}
      <div className="relative z-10 w-[min(92vw,900px)]">
        <Sprite grade={COLISEU} paleta={PALETA_COLISEU} />
        <div className="absolute inset-x-0 bottom-[2%] flex items-end justify-center gap-[6%]">
          {IAS.map((ia, i) => (
            <div
              key={ia}
              className={`w-[11%] ${fase >= 2 ? 'abertura-entrar' : 'opacity-0'}`}
              style={{ animationDelay: `${i * 220}ms` }}
            >
              <GladiadorPixel ia={ia} espelhar={i === 2} />
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-10 h-[6vh] w-full bg-[#5a3a22]" style={{ boxShadow: 'inset 0 4px 0 #8a6448' }} />

      {/* Toque para entrar */}
      <p className={`absolute bottom-[2vh] z-20 font-pixel text-[10px] text-white sm:text-sm ${fase >= 4 ? 'piscar' : 'opacity-0'}`}>
        TOQUE PARA ENTRAR
      </p>
      <button
        type="button"
        onClick={(ev) => {
          ev.stopPropagation();
          entrar();
        }}
        className="absolute right-4 top-4 z-30 font-pixel text-[9px] text-white/60 hover:text-white"
      >
        PULAR ▶
      </button>
    </div>
  );
}
