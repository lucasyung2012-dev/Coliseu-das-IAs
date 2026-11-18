import type { Carta, Dilema } from '../dilemas';

type Linha = [titulo: string, texto: string, temas: Carta['temas']];

/** Ajuda a escrever: [título, texto, temas] → Carta com id estável. */
export function cartas(prefixo: string, lista: Linha[]): Carta[] {
  return lista.map(([titulo, texto, temas], i) => ({ id: `${prefixo}-${i + 1}`, titulo, texto, temas }));
}

/** Monta um dilema a partir das 6 listas (3 tempos de cada lado). */
export function dilema(
  id: string,
  pergunta: string,
  favor: { tese: string; tempos: [Linha[], Linha[], Linha[]] },
  contra: { tese: string; tempos: [Linha[], Linha[], Linha[]] },
): Dilema {
  return {
    id,
    pergunta,
    lados: {
      favor: { nome: 'A favor', tese: favor.tese, tempos: [cartas(`${id}-f1`, favor.tempos[0]), cartas(`${id}-f2`, favor.tempos[1]), cartas(`${id}-f3`, favor.tempos[2])] },
      contra: { nome: 'Contra', tese: contra.tese, tempos: [cartas(`${id}-c1`, contra.tempos[0]), cartas(`${id}-c2`, contra.tempos[1]), cartas(`${id}-c3`, contra.tempos[2])] },
    },
  };
}
