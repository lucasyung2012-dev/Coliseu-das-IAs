import { useEffect, type CSSProperties } from 'react';
import type { ComemoracaoId } from '@/game/coliseu';
import type { IaId } from '@/game/personagens';
import GladiadorEnfeitado from '@/ui/pixel/GladiadorEnfeitado';
import Sprite from '@/ui/pixel/Sprite';
import { tocar } from '@/ui/som';

/**
 * Comemoração de vitória (prêmios do mapa de troféus), por cima da tela de fim:
 * rosas da plateia, gladiador erguendo a arma, trombetas com confete ou fogos.
 * Só visual; fica atrás dos botões (pointer-events: none).
 */
const ROSA = ['.RR.', 'RRRR', '.RR.', '..G.', '.GG.', '..G.'];
const TROMBETA = ['Y.......', 'YY......', 'YYYYYYYY', 'YY......', 'Y.......'];
const CORES_CONFETE = ['#ff5ab8', '#4ef0dc', '#f2c14e', '#9f7bff', '#ff8a4a', '#ffffff'];

// Posições fixas (o mesmo desenho toda vez), espalhadas pela largura.
const pedacos = (n: number) => Array.from({ length: n }, (_, i) => ({ x: (i * 37 + 7) % 100, atraso: (i * 173) % 1400, giro: (i * 47) % 360 }));

export default function Comemoracao({ tipo, ia }: { tipo: ComemoracaoId; ia: IaId }) {
  useEffect(() => {
    if (tipo === 'rosas') tocar('plateia');
    if (tipo === 'arma') tocar('espadas');
    if (tipo === 'trombetas' || tipo === 'fogos') tocar('fanfarra');
  }, [tipo]);

  if (tipo === 'nenhuma') return null;
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {tipo === 'rosas' &&
        pedacos(16).map((p, i) => (
          <span key={i} className="comemora-cair absolute top-0 w-3 sm:w-4" style={{ left: `${p.x}%`, animationDelay: `${p.atraso}ms`, '--giro': `${p.giro}deg` } as CSSProperties}>
            <Sprite grade={ROSA} paleta={{ R: '#e0283c', G: '#3a8a3a' }} />
          </span>
        ))}

      {tipo === 'arma' && (
        <div className="comemora-erguer absolute bottom-2 left-3 w-14 sm:w-20">
          <GladiadorEnfeitado ia={ia} parado />
        </div>
      )}

      {tipo === 'trombetas' && (
        <>
          <div className="comemora-soprar absolute left-2 top-3 w-12 sm:w-16">
            <Sprite grade={TROMBETA} paleta={{ Y: '#f2c14e' }} espelhar />
          </div>
          <div className="comemora-soprar absolute right-2 top-3 w-12 sm:w-16">
            <Sprite grade={TROMBETA} paleta={{ Y: '#f2c14e' }} />
          </div>
          {pedacos(24).map((p, i) => (
            <span
              key={i}
              className="comemora-cair absolute top-0 h-1.5 w-1.5 sm:h-2 sm:w-2"
              style={{ left: `${p.x}%`, background: CORES_CONFETE[i % CORES_CONFETE.length], animationDelay: `${p.atraso}ms`, '--giro': `${p.giro}deg` } as CSSProperties}
            />
          ))}
        </>
      )}

      {tipo === 'fogos' &&
        [
          { x: 18, y: 25, c: '#ff5ab8', d: 0 },
          { x: 50, y: 15, c: '#f2c14e', d: 500 },
          { x: 82, y: 28, c: '#4ef0dc', d: 950 },
          { x: 35, y: 40, c: '#9f7bff', d: 1400 },
        ].map((f, i) => (
          <div key={i} className="absolute" style={{ left: `${f.x}%`, top: `${f.y}%` }}>
            {Array.from({ length: 10 }, (_, k) => (
              <span
                key={k}
                className="comemora-fogo absolute h-1.5 w-1.5 sm:h-2 sm:w-2"
                style={{ background: f.c, boxShadow: `0 0 6px ${f.c}`, animationDelay: `${f.d}ms`, '--ang': `${k * 36}deg` } as CSSProperties}
              />
            ))}
          </div>
        ))}
    </div>
  );
}
