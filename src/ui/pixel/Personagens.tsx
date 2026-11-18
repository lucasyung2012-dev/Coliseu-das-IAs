import Sprite from './Sprite';
import { GLADIADORES, JURADOS_PIXEL, PRETOR, paletaBusto, paletaGladiador } from './sprites';
import { PERSONAGENS, type IaId } from '@/game/personagens';
import { JURADOS, type JuradoId } from '@/game/jurados';

interface Base {
  className?: string;
  escala?: number;
  espelhar?: boolean;
}

export function GladiadorPixel({ ia, ...resto }: Base & { ia: IaId }) {
  const p = PERSONAGENS[ia];
  return <Sprite grade={GLADIADORES[ia]} paleta={paletaGladiador(p.cor)} titulo={`${p.gladiador} (${p.ia})`} {...resto} />;
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
