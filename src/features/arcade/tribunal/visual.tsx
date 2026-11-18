import type { ReactNode } from 'react';
import { PretorPixel } from '@/ui/pixel/Personagens';

// Lados sempre com as mesmas cores, sem depender da cor de cada IA (que confundia):
// verde é você, vermelho é o rival.
export const VERDE = 'rgb(62 224 122)';
export const VERMELHO = 'rgb(255 74 90)';

/** O Pretor em destaque: maior, com aura dourada, respirando, e a fala dele. */
export function PretorDestaque({ fala, children }: { fala: string; children?: ReactNode }) {
  return (
    <div className="pretor-destaque relative flex items-center gap-4 overflow-hidden p-4 sm:gap-6 sm:p-5">
      <div className="relative w-20 shrink-0 sm:w-28">
        <div className="aura-pretor absolute inset-[-20%] rounded-full" aria-hidden />
        <div className="respirar relative">
          <PretorPixel />
        </div>
      </div>
      <div className="relative min-w-0">
        <p className="neon-ouro font-pixel text-xs text-[rgb(242_193_78)] sm:text-base">⚖ PRETOR SUPREMO</p>
        <p className="mt-2 text-sm italic sm:text-base">"{fala}"</p>
        {children}
      </div>
    </div>
  );
}
