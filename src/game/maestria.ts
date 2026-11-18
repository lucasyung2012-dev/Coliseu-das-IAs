/**
 * Títulos de Maestria: cada IA ganha um título novo conforme sobe de nível.
 * O XP vem das partidas que valem (vitória +40, empate +20, derrota +20).
 */
export interface Titulo {
  nivel: number;
  nome: string;
  frase: string;
}

export const TITULOS: Titulo[] = [
  { nivel: 1, nome: 'Recruta', frase: 'Acabou de entrar na escola de gladiadores.' },
  { nivel: 5, nome: 'Aprendiz do Ludus', frase: 'Já sabe segurar o escudo dos argumentos.' },
  { nivel: 10, nome: 'Legionário', frase: 'Marcha firme em qualquer debate.' },
  { nivel: 20, nome: 'Veterano', frase: 'Já viu de tudo na arena.' },
  { nivel: 30, nome: 'Campeão da Arena', frase: 'A plateia grita o nome dele.' },
  { nivel: 50, nome: 'Lenda do Coliseu', frase: 'Contam histórias das suas vitórias.' },
  { nivel: 75, nome: 'Herói de Roma', frase: 'Tem uma estátua no Fórum.' },
  { nivel: 100, nome: 'Imortal', frase: 'O Senado inteiro se levanta quando ele entra.' },
];

export function tituloDoNivel(nivel: number): Titulo {
  return [...TITULOS].reverse().find((t) => nivel >= t.nivel) ?? TITULOS[0]!;
}

export function proximoTitulo(nivel: number): Titulo | null {
  return TITULOS.find((t) => t.nivel > nivel) ?? null;
}
