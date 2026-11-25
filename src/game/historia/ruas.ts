import type { Mundo, Pessoa, Coisa } from './mundo';
import type { BairroId } from './roma';
import { BAIRROS } from './roma';
import { MURALHA, POS, RIO, RUAS, dist, pertoDaLinha } from './romaGeo';
import type { Falante } from './roteiro';

/**
 * ROMA CAMINHÁVEL (25/11/2026, pedido do Lucas: "poder andar pelas ruas, não só os bairros, o
 * mapa inteiro aberto"). A cidade de ladrilhos é feita com a MESMA geometria do mapa desenhado
 * (romaGeo): o rio com as pontes, a muralha com os portões, as ruas de pedra, os quarteirões de
 * casas com vielas e, na frente de cada lugar, a fachada dele com a porta. Andando até a porta e
 * apertando para interagir, você entra no lugar.
 *
 * Ladrilhos novos: ',' grama · '^' árvore · '%' casa (telhado e fachada) · '=' ponte.
 * A PINTORA DE ESTRELAS anda pela cidade num lugar sorteado: é ela quem pinta as três estrelas
 * nos muros, e dá a dica de um segredo de Roma que ainda falta achar. (Falas em rascunho.)
 */
export const ESCALA_RUAS = 5; // 1 ladrilho = 5 unidades do mapa (o mapa tem 320 × 200)
export const LARGURA_RUAS = 64;
export const ALTURA_RUAS = 40;

const ladrilhoDe = (b: BairroId): [number, number] => [Math.floor(POS[b][0] / ESCALA_RUAS), Math.floor(POS[b][1] / ESCALA_RUAS)];
/** A porta de cada lugar (o ladrilho de baixo, no meio da fachada). */
export const PORTAS: Record<BairroId, [number, number]> = Object.fromEntries(
  (Object.keys(POS) as BairroId[]).map((b) => {
    const [x, y] = ladrilhoDe(b);
    return [b, [x, y + 1]];
  }),
) as Record<BairroId, [number, number]>;

// O mar: a beira passa por estes pontos (igual ao mapa desenhado).
const BEIRA: [number, number][] = [[0, 118], [26, 124], [44, 142], [56, 156], [62, 170], [70, 186], [72, 200]];
function noMar(x: number, y: number): boolean {
  if (y < BEIRA[0]![1]) return false;
  for (let k = 1; k < BEIRA.length; k++) {
    const [ax, ay] = BEIRA[k - 1]!;
    const [bx, by] = BEIRA[k]!;
    if (y <= by) return x < ax + ((y - ay) / (by - ay || 1)) * (bx - ax);
  }
  return x < 72;
}

function sorteio(semente: number) {
  let a = semente;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A cidade de ladrilhos (sempre igual). */
export function mapaDasRuas(): string[] {
  const S = ESCALA_RUAS;
  const g: string[][] = Array.from({ length: ALTURA_RUAS }, () => Array.from({ length: LARGURA_RUAS }, () => ','));
  const centro = (x: number, y: number): [number, number] => [x * S + S / 2, y * S + S / 2];
  const elipse = (mx: number, my: number) => Math.sqrt(((mx - MURALHA.cx) / MURALHA.rx) ** 2 + ((my - MURALHA.cy) / MURALHA.ry) ** 2);
  const r = sorteio(11);
  for (let y = 0; y < ALTURA_RUAS; y++)
    for (let x = 0; x < LARGURA_RUAS; x++) {
      const [mx, my] = centro(x, y);
      const e = elipse(mx, my);
      // Dentro da muralha: quarteirões de casas (4 × 3) separados por vielas.
      if (e < 0.965) g[y]![x] = x % 5 === 4 || y % 4 === 3 ? '.' : '%';
      if (e >= 0.965 && e < 1.035) g[y]![x] = '#';
      if (noMar(mx, my)) g[y]![x] = 'w';
      if (RIO.some((p, k) => k > 0 && dist(mx, my, RIO[k - 1]!, p) < 5.6)) g[y]![x] = 'w';
    }
  // As ruas de pedra (sobre a água, viram ponte).
  for (let y = 0; y < ALTURA_RUAS; y++)
    for (let x = 0; x < LARGURA_RUAS; x++) {
      const [mx, my] = centro(x, y);
      if (RUAS.some((l) => pertoDaLinha(mx, my, l, 4.4))) g[y]![x] = g[y]![x] === 'w' ? '=' : '.';
    }
  // Na frente de cada lugar: uma praça, a fachada (5 × 4) e a calçada em volta.
  for (const b of Object.keys(POS) as BairroId[]) {
    const [px, py] = PORTAS[b];
    for (let y = py - 5; y <= py + 2; y++)
      for (let x = px - 4; x <= px + 4; x++) if (g[y]?.[x] !== undefined && Math.hypot(x - px, (y - py) * 1.2) < 4.6 && g[y]![x] !== '=') g[y]![x] = '.';
    for (let y = py - 5; y <= py - 1; y++)
      for (let x = px - 3; x <= px + 3; x++) if (g[y]?.[x] !== undefined) g[y]![x] = '.';
    for (let y = py - 4; y <= py - 1; y++)
      for (let x = px - 2; x <= px + 2; x++) if (g[y]?.[x] !== undefined) g[y]![x] = '#';
  }
  // Árvores no campo (nunca colada na rua nem na porta).
  for (let y = 0; y < ALTURA_RUAS; y++)
    for (let x = 0; x < LARGURA_RUAS; x++) {
      if (g[y]![x] !== ',' || r() > 0.09) continue;
      const vizinhoRua = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g[y + dy!]?.[x + dx!] === '.' || g[y + dy!]?.[x + dx!] === '=');
      if (!vizinhoRua) g[y]![x] = '^';
    }
  return g.map((l) => l.join(''));
}

/** Falas do povo na rua (mudam com o ato). Rascunho: o Lucas reescreve. */
function boatos(ato: number): [Falante, string][] {
  const sempre: [Falante, string][] = [
    ['povo', 'Bom dia, gladiador! Ou boa tarde. Aqui na rua a gente perde a conta.'],
    ['feirante', 'Pão quente! Azeitona! Engrenagem usada! ...Tá, a engrenagem não é de comer.'],
    ['crianca', 'Você é um dos três? Posso tocar no seu escudo? Só um pouquinho?'],
    ['copista', '(baixinho) Se precisar de um esconderijo, procura a pena desenhada na parede.'],
  ];
  const doAto: [Falante, string][] =
    ato <= 3
      ? [['povo', 'Dizem que três gladiadores fugiram e agora andam juntos. Que bobagem. ...Né?']]
      : ato === 4
        ? [['povo', 'Pintaram um olho vermelho em tudo que é estandarte. Parece que está me olhando.'], ['guarda', 'Circulando, circulando. Nada para ver aqui.']]
        : ato === 5
          ? [['povo', 'Os Grandes Jogos! Já comprei meu lugar na arquibancada. Bem lá em cima.'], ['guarda', 'No dia dos Jogos, ninguém sai da fila.']]
          : [['povo', 'O céu ficou escuro no meio do dia. Minha avó disse que é sinal de mudança.']];
  return [...doAto, ...sempre];
}

/** Dica da Pintora para um segredo que ainda falta. */
function dicaDaPintora(faltam: BairroId[]): string {
  const b = faltam[0];
  if (!b) return 'Você já achou todas as minhas estrelas. Agora sou eu que vou te seguir por aí. (Risos.)';
  const nome = BAIRROS.find((x) => x.id === b)?.nome ?? '';
  return `Tem uma estrela minha que ninguém achou: ${nome}. Fica no meio do caminho, nem na entrada, nem lá no fundo. Olha com calma.`;
}

export interface OpcoesRuas {
  ato: number;
  /** Onde o gladiador aparece (na porta deste lugar). */
  inicio: BairroId;
  visitados: BairroId[];
  segredos: string[];
  /** Os lugares que abrem (os outros ficam com a porta trancada). */
  abertos: BairroId[];
  /** O sorteio da vez (onde a Pintora está). */
  semente?: number;
}

/** A Roma caminhável, pronta para o MundoAberto. */
export function mundoDasRuas(o: OpcoesRuas): Mundo {
  const mapa = mapaDasRuas();
  const r = sorteio(o.semente ?? 1);
  const anda = (x: number, y: number) => mapa[y]?.[x] === '.' || mapa[y]?.[x] === '=' || mapa[y]?.[x] === ',';
  // As ruas de verdade (ladrilho de pedra com outro de pedra do lado), fora das praças das portas.
  const ruas: [number, number][] = [];
  mapa.forEach((l, y) =>
    l.split('').forEach((c, x) => {
      if (c !== '.' || mapa[y]?.[x + 1] !== '.') return;
      if (Object.values(PORTAS).some(([px, py]) => Math.hypot(px - x, py - y) < 4)) return;
      ruas.push([x, y]);
    }),
  );
  const escolhe = () => ruas[Math.floor(r() * ruas.length)] ?? [PORTAS.coliseu[0], PORTAS.coliseu[1] + 1];
  // As portas: tocar nelas entra no lugar (o Ludus é a casa de vocês).
  const coisas: Coisa[] = (Object.keys(PORTAS) as BairroId[]).map((b) => {
    const nome = BAIRROS.find((x) => x.id === b)?.nome ?? '';
    const texto = o.abertos.includes(b) ? `A entrada: ${nome}.` : `${nome}: a porta está trancada. A história de vocês ainda não passou por aqui.`;
    return { id: `porta-${b}`, x: PORTAS[b][0], y: PORTAS[b][1], falas: [{ quem: 'narrador', texto }] };
  });
  // O povo passeando (vai e volta entre dois ladrilhos vizinhos).
  const pessoas: Pessoa[] = boatos(o.ato).map(([quem, texto], k) => {
    const [x, y] = escolhe();
    return { id: `rua-${k}`, quem, rota: anda(x + 1, y) ? [[x, y], [x + 1, y]] : [[x, y]], falas: [{ quem, texto }] };
  });
  // A Pintora de Estrelas, num lugar sorteado da cidade.
  const faltam = (Object.keys(POS) as BairroId[]).filter((b) => b !== 'ludus' && o.visitados.includes(b) && !o.segredos.includes(b));
  const [qx, qy] = escolhe();
  pessoas.push({
    id: 'pintora',
    quem: 'pintora',
    rota: [[qx, qy]],
    falas: [
      { quem: 'pintora', texto: 'Psiu! Aqui, atrás de você. Não, não sou guarda. Olha minhas mãos: tinta dourada.' },
      { quem: 'pintora', texto: 'As três estrelas nos muros? Fui eu. Eu pinto onde tem segredo guardado.' },
      { quem: 'pintora', texto: dicaDaPintora(faltam) },
      { quem: 'pintora', texto: 'Agora vai, antes que alguém veja a gente conversando. Amanhã eu estou em outro lugar.' },
    ],
  });
  const [ix, iy] = PORTAS[o.inicio];
  return {
    id: 'ruas-de-roma',
    mapa,
    objetivo: 'As ruas de Roma. Ande até a porta de um lugar para entrar. Alguém pinta estrelas pela cidade: quem será?',
    inicio: [ix, Math.min(ALTURA_RUAS - 1, iy + 1)],
    coisas,
    pessoas,
    tema: 'rua',
    lugar: 'roma-praca',
    claro: true,
    fachadas: (Object.keys(PORTAS) as BairroId[]).map((b) => ({ id: b, x: PORTAS[b][0] - 2, y: PORTAS[b][1] - 4, nome: BAIRROS.find((x) => x.id === b)?.nome ?? '' })),
  };
}
