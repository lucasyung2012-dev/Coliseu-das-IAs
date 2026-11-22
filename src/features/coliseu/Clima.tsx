import type { CSSProperties } from 'react';
import type { ClimaArena } from '@/game/historia/chefoes';
import type { Lugar } from '@/game/historia/roteiro';

/** O ar de cada lugar no duelo (22/11/2026): brasas no fogo, chuva no mar, poeira nas catacumbas... */
export const CLIMA_DO_LUGAR: Partial<Record<Lugar, ClimaArena>> = {
  'biblioteca-chamas': 'brasas',
  'roma-chamas': 'brasas',
  'ludus-forja': 'brasas',
  'biblioteca-estantes': 'poeira',
  'biblioteca-salao': 'poeira',
  'biblioteca-escada': 'poeira',
  catacumbas: 'poeira',
  'catacumbas-arquivo': 'poeira',
  forum: 'poeira',
  'coliseu-arena': 'poeira',
  'galera-tempestade': 'chuva',
  'frota-noite': 'chuva',
  'mar-batalha': 'chuva',
  'subura-esgoto': 'gotas',
  aqueduto: 'gotas',
  'coliseu-inundado': 'gotas',
  observatorio: 'estrelas',
  'observatorio-ataque': 'estrelas',
  'telhados-noite': 'estrelas',
  'coliseu-eclipse': 'estrelas',
  'templo-oraculo': 'fumaca',
  'templo-apolo': 'fumaca',
  'nucleo-camara': 'faiscas',
  hipogeu: 'faiscas',
  'cofre-cobrador': 'moedas',
};

/** O ar da arena: cada clima com as suas partículas (sempre as mesmas, para não piscar). */
export function ClimaDaArena({ clima, z = 246 }: { clima: ClimaArena; z?: number }) {
  const n = clima === 'chuva' ? 34 : clima === 'fumaca' ? 8 : 18;
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden clima-${clima}`} style={{ zIndex: z }} aria-hidden>
      {Array.from({ length: n }, (_, k) => {
        const x = (k * 37 + 11) % 100;
        const atraso = -((k * 613) % 4000) / 1000;
        const dur = 2.2 + ((k * 7) % 10) / 4;
        return <span key={k} className="particula-clima absolute block" style={{ left: `${x}%`, animationDelay: `${atraso}s`, animationDuration: `${clima === 'chuva' ? dur / 3 : dur}s` } as CSSProperties} />;
      })}
    </div>
  );
}
