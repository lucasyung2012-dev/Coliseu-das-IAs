/**
 * AS 7 NOTAS DA PLATEIA (combinado com o Lucas, 22/11/2026; feito em 24/11/2026). Depois de
 * cada chefão, a plateia reage. Por trás, um placar de 0 a 100:
 * - até 40 pela vida que sobrou;
 * - até 20 pela rapidez (45 s ou menos vale tudo; 2 min e meio ou mais, nada);
 * - até 20 pelas defesas perfeitas (bloqueio na hora, rolada na hora, lampejo, rede, arremate...);
 * - até 20 por não ter caído (cair uma vez vale 10; duas ou mais, nada).
 * As frases são rascunho (o Lucas pode reescrever).
 */
export const NOMES_NOTA = ['SILÊNCIO', 'MURMÚRIO', 'APLAUSOS', 'GRITOS', 'OVAÇÃO', 'CHUVA DE FLORES', 'O POLEGAR DO IMPERADOR'] as const;

export const FRASES_NOTA = [
  'Ninguém se mexe. Você venceu... mas a plateia esperava mais.',
  'Uns cochicham. Alguém bate palma lá no fundo.',
  'A plateia aplaude. Foi uma boa luta.',
  'Gritam o seu nome! A arena inteira acordou.',
  'Ovação! A plateia de pé, batendo os pés no chão.',
  'Chovem flores na arena. Quase perfeito!',
  'O Imperador se levanta e faz o sinal com o polegar. Perfeito.',
] as const;

/** A cor de cada nota: do cinza do silêncio ao dourado do Imperador. */
export const CORES_NOTA = ['#8a8276', '#a8a090', '#c8c0b0', '#e0d090', '#f2c14e', '#ff9ad0', '#ffe08a'] as const;

/** Os acontecimentos da luta que contam como defesa perfeita (ou golpe depois de uma). */
export const DEFESAS_PERFEITAS = new Set(['pagina', 'tropeco', 'luz', 'riposta', 'lampejo', 'rede', 'arremate']);

export interface DadosDaLuta {
  /** Vida que sobrou, de 0 a 1. */
  vidaPct: number;
  segundos: number;
  perfeitas: number;
  /** Quantas vezes caiu (na primeira etapa e no duelo). */
  quedas: number;
}

const entre = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function pontosDaLuta(d: DadosDaLuta): number {
  const vida = 40 * entre(d.vidaPct, 0, 1);
  const rapidez = 20 * entre((150 - d.segundos) / (150 - 45), 0, 1);
  const defesas = Math.min(20, d.perfeitas * 4);
  const semCair = d.quedas <= 0 ? 20 : d.quedas === 1 ? 10 : 0;
  return Math.round(vida + rapidez + defesas + semCair);
}

/** A nota (1 a 7) pelos pontos. */
export function notaDosPontos(p: number): number {
  let n = 1;
  for (const limite of [25, 40, 55, 68, 80, 92]) if (p >= limite) n++;
  return n;
}
