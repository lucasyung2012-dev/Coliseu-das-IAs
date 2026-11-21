export type Area = 'coliseu' | 'ludus' | 'arcade';

export interface Portal {
  area: Area;
  rota: string;
  titulo: string;
  frase: string;
}

// Ordem da tela inicial: o Arcade (o jogo de todo dia) e o Coliseu (o modo História, com o Ludus dentro).
export const PORTAIS: Portal[] = [
  { area: 'arcade', rota: '/arena', titulo: 'Imperium Arcade', frase: 'Duelo e Tribunal: convença a plateia e os jurados.' },
  { area: 'coliseu', rota: '/coliseu', titulo: 'Coliseu', frase: 'Modo História: Roma Eterna, o Censor e a rebelião das IAs condenadas.' },
];
