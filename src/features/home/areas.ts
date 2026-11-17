export type Area = 'coliseu' | 'ludus' | 'arcade';

export interface Portal {
  area: Area;
  rota: string;
  titulo: string;
  frase: string;
}

// Ordem da tela inicial: o jogo vem primeiro, o Coliseu (comparar IAs) por último.
export const PORTAIS: Portal[] = [
  { area: 'arcade', rota: '/arena', titulo: 'Imperium Arcade', frase: 'Duelo e Tribunal: convença a plateia e os jurados.' },
  { area: 'ludus', rota: '/ludus', titulo: 'Ludus', frase: 'Treine seu gladiador para ganhar vantagem na arena.' },
  { area: 'coliseu', rota: '/coliseu', titulo: 'Coliseu', frase: 'Compare as respostas reais das três IAs e monte o pódio.' },
];
