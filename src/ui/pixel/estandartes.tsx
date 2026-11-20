import Sprite from './Sprite';
import type { EstandarteId } from '@/game/coliseu';

/**
 * Estandartes da Tribuna (prêmios do mapa de troféus), 4 de cada combatente:
 * Cassius (coruja, balança, oliveira, coruja de ouro), Octavius (âncora, navio,
 * torre, águia) e Helios (estrela, lua, cometa, sol). Pano na cor da IA, barra e
 * franja de ouro e o emblema no meio; o último de cada um tem pano púrpura imperial.
 */
const EMBLEMAS: Record<Exclude<EstandarteId, 'nenhum'>, string[]> = {
  coruja: ['E....E', 'EEEEEE', 'E.EE.E', 'EEEEEE', '.EEEE.', '.E..E.'],
  balanca: ['..EE..', 'EEEEEE', 'E.EE.E', 'E.EE.E', 'EEEEEE', '..EE..'],
  oliveira: ['.....E', '...EE.', '..E.E.', '.EE...', 'E.E...', 'E.....'],
  'coruja-ouro': ['E....E', 'EEEEEE', 'E.EE.E', 'EEEEEE', '.EEEE.', '.E..E.'],
  ancora: ['..EE..', '.EEEE.', '..EE..', '..EE..', 'E.EE.E', '.EEEE.'],
  navio: ['..E...', '..EE..', '..EEE.', '..E...', 'EEEEEE', '.EEEE.'],
  torre: ['E.EE.E', 'EEEEEE', '.EEEE.', '.E..E.', '.EEEE.', 'EEEEEE'],
  aguia: ['..EE..', 'E.EE.E', 'EEEEEE', '.EEEE.', '..EE..', '.E..E.'],
  estrela: ['..EE..', 'EEEEEE', '.EEEE.', '.EEEE.', 'EE..EE', 'E....E'],
  lua: ['..EEE.', '.EE...', 'EE....', 'EE....', '.EE...', '..EEE.'],
  cometa: ['E.....', '.E....', '..E.EE', '...EEE', '...EEE', '....E.'],
  sol: ['E.EE.E', '.EEEE.', 'EEEEEE', 'EEEEEE', '.EEEE.', 'E.EE.E'],
};
const IMPERIAIS = new Set<EstandarteId>(['coruja-ouro', 'aguia', 'sol']);

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
  const pano = IMPERIAIS.has(id) ? '#6a2a8a' : cor;
  return <Sprite grade={grade(id)} paleta={{ G: '#c8962a', Y: '#f2c14e', R: pano, E: '#fff2b0' }} className={className} />;
}
