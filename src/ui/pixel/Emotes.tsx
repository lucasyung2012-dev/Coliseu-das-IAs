import type { Emocao } from '@/game/historia/roteiro';
import { desenhar, type Passo } from './desenho';
import Sprite from './Sprite';

/**
 * Os balõezinhos de emoção que aparecem em cima de quem fala (desenhados em pixel, sem
 * emoji: regra do Lucas). Surpreso = exclamação, pensando = interrogação, bravo = a marca
 * de raiva, medo = gota de suor, triste = lágrimas, feliz = coração, determinado = chama.
 */
const PALETA = { K: '#140c08', Y: '#ffd04a', W: '#ffffff', R: '#e0283c', r: '#ff8a8a', B: '#5ab0ff', b: '#bfe4ff', P: '#ff5ab8', p: '#ffb0dc', O: '#ff8a2a' };

const FORMAS: Partial<Record<Emocao, Passo[]>> = {
  surpreso: [['Y', 4, 0, 3, 6], ['W', 5, 0, 1, 5], ['Y', 4, 8, 3, 2]],
  pensando: [['Y', 2, 0, 6, 2], ['Y', 7, 1, 2, 3], ['Y', 5, 4, 3, 2], ['Y', 4, 5, 2, 2], ['Y', 1, 1, 2, 2], ['Y', 4, 8, 2, 2]],
  bravo: [['R', 1, 1, 3, 1], ['R', 1, 1, 1, 3], ['R', 6, 1, 3, 1], ['R', 8, 1, 1, 3], ['R', 1, 6, 1, 3], ['R', 1, 8, 3, 1], ['R', 8, 6, 1, 3], ['R', 6, 8, 3, 1], ['r', 2, 2, 1, 1], ['r', 7, 2, 1, 1]],
  medo: [['B', 4, 0, 2, 2], ['B', 3, 2, 4, 2], ['B', 2, 4, 6, 4], ['B', 3, 8, 4, 1], ['b', 3, 4, 1, 2]],
  triste: [['B', 1, 2, 2, 3], ['B', 1, 5, 2, 1], ['b', 1, 2, 1, 1], ['B', 6, 4, 2, 3], ['B', 6, 7, 2, 1], ['b', 6, 4, 1, 1]],
  feliz: [['P', 1, 1, 3, 3], ['P', 5, 1, 3, 3], ['P', 1, 3, 7, 2], ['P', 2, 5, 5, 1], ['P', 3, 6, 3, 1], ['P', 4, 7, 1, 1], ['p', 2, 2, 1, 1]],
  determinado: [['O', 4, 0, 2, 2], ['O', 3, 2, 4, 2], ['O', 2, 4, 6, 3], ['Y', 4, 4, 2, 3], ['O', 3, 7, 4, 2], ['W', 4, 5, 1, 1]],
};

const CACHE: Partial<Record<Emocao, string[]>> = {};

export default function Emote({ emocao, className }: { emocao: Emocao; className?: string }) {
  const forma = FORMAS[emocao];
  if (!forma) return null;
  const grade = (CACHE[emocao] ??= desenhar(12, 12, forma));
  return <Sprite grade={grade} paleta={PALETA} className={className} />;
}
