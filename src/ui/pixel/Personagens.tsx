import Sprite from './Sprite';
import { gradeGladiador, JURADOS_PIXEL, PRETOR, paletaBusto, paletaGladiador, type Armadura } from './sprites';
import { PERSONAGENS, type IaId } from '@/game/personagens';
import { JURADOS, type JuradoId } from '@/game/jurados';

interface Base {
  className?: string;
  escala?: number;
  espelhar?: boolean;
}

// As grades mudam pouco (3 IAs × 5 ligas): guardadas depois de desenhadas.
const cache = new Map<string, string[]>();
function grade(ia: IaId, liga: number) {
  const k = `${ia}-${liga}`;
  if (!cache.has(k)) cache.set(k, gradeGladiador(ia, liga));
  return cache.get(k)!;
}

/** Gladiador em pixel. `liga` (0 a 4) muda o equipamento; `armadura` vem da Maestria. */
export function GladiadorPixel({ ia, armadura, liga = 0, ...resto }: Base & { ia: IaId; armadura?: Armadura; liga?: number }) {
  const p = PERSONAGENS[ia];
  return <Sprite grade={grade(ia, liga)} paleta={paletaGladiador(p.cor, armadura, ia)} titulo={`${p.gladiador} (${p.ia})`} {...resto} />;
}

export function JuradoPixel({ jurado, ...resto }: Base & { jurado: JuradoId }) {
  const j = JURADOS[jurado];
  const paleta = paletaBusto({ toga: j.toga, cabelo: j.cabelo, acessorio: j.corAcessorio, objeto: j.corObjeto });
  return <Sprite grade={JURADOS_PIXEL[jurado]} paleta={paleta} titulo={`Jurado ${j.nome}`} {...resto} />;
}

export function PretorPixel(props: Base) {
  return (
    <Sprite
      grade={PRETOR}
      paleta={paletaBusto({ toga: '#c0283c', cabelo: '#ececec', acessorio: '#f2c14e', objeto: '#f2c14e' })}
      titulo="Pretor Supremo"
      {...props}
    />
  );
}
