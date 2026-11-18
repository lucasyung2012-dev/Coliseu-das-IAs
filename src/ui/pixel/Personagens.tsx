import Sprite from './Sprite';
import { GLADIADOR, gradeBusto, paletaBusto, paletaGladiador } from './sprites';
import { PERSONAGENS, type IaId } from '@/game/personagens';
import { JURADOS, type JuradoId } from '@/game/jurados';

interface Base {
  className?: string;
  escala?: number;
  espelhar?: boolean;
}

export function GladiadorPixel({ ia, ...resto }: Base & { ia: IaId }) {
  const p = PERSONAGENS[ia];
  return <Sprite grade={GLADIADOR} paleta={paletaGladiador(p.cor)} titulo={`${p.gladiador} (${p.ia})`} {...resto} />;
}

export function JuradoPixel({ jurado, ...resto }: Base & { jurado: JuradoId }) {
  const j = JURADOS[jurado];
  return <Sprite grade={gradeBusto(j.acessorio)} paleta={paletaBusto(j.toga, j.cabelo, j.corAcessorio)} titulo={`Jurado ${j.nome}`} {...resto} />;
}

export function PretorPixel(props: Base) {
  return <Sprite grade={gradeBusto('louros')} paleta={paletaBusto('#c0283c', '#ececec', '#f2c14e')} titulo="Pretor Supremo" {...props} />;
}
