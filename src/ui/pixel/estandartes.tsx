import Sprite from './Sprite';
import type { EstandarteId } from '@/game/coliseu';

/**
 * Estandartes da Tribuna (prêmios do mapa de troféus): pano na cor da IA, com
 * barra e franja de ouro e o emblema no meio (loba, leão, javali, águia).
 */
const EMBLEMAS: Record<Exclude<EstandarteId, 'nenhum'>, string[]> = {
  loba: ['E....E', 'EE..EE', 'EEEEEE', 'E.EE.E', '.EEEE.', '..EE..'],
  leao: ['.EEEE.', 'EE..EE', 'E.EE.E', 'E.EE.E', 'EE..EE', '.EEEE.'],
  javali: ['......', '.EEEE.', 'EEEEEE', 'EE.EEE', '.E..E.', '.E..E.'],
  aguia: ['..EE..', 'E.EE.E', 'EEEEEE', '.EEEE.', '..EE..', '.E..E.'],
};

function grade(id: Exclude<EstandarteId, 'nenhum'>): string[] {
  const linhas: string[] = ['GGGGGGGGGGGG', '.YYYYYYYYYY.'];
  for (let y = 0; y < 13; y++) {
    const e = y >= 3 && y < 9 ? EMBLEMAS[id][y - 3]! : '......';
    // .Y R [emblema de 6] R Y. = 12 colunas
    linhas.push('.YR' + [...e].map((c) => (c === 'E' ? 'E' : 'R')).join('') + 'RY.');
  }
  linhas.push('.YRRRRRRRRY.', '.YRRR..RRRY.', '.YRR....RRY.');
  return linhas;
}

export function Estandarte({ id, cor, className }: { id: EstandarteId; cor: string; className?: string }) {
  if (id === 'nenhum') return null;
  // Águia de ouro: pano púrpura imperial, para ser o mais especial.
  const pano = id === 'aguia' ? '#6a2a8a' : cor;
  return <Sprite grade={grade(id)} paleta={{ G: '#c8962a', Y: '#f2c14e', R: pano, E: '#fff2b0' }} className={className} />;
}
