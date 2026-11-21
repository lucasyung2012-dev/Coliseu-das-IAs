export type Area = 'coliseu' | 'ludus' | 'arcade';

export interface Portal {
  area: Area;
  rota: string;
  titulo: string;
  frase: string;
}

// Ordem da tela inicial (pedido do Lucas, 21/11/2026): o Coliseu (modo História) primeiro e o Arcade embaixo.
export const PORTAIS: Portal[] = [
  { area: 'arcade', rota: '/arena', titulo: 'Imperium Arcade', frase: 'Duelo e Tribunal: convença a plateia e os jurados.' },
  { area: 'coliseu', rota: '/coliseu', titulo: 'Coliseu', frase: 'Modo História: Roma Eterna, o Censor e a rebelião das IAs condenadas.' },
];
