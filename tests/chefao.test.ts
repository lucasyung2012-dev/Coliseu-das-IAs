import { ARENA_RATO_REI, golpearChefao, novoChefao, passoChefao, VIDA_REI, type EstadoChefao } from '@/game/historia/chefaoMapa';
import { livre } from '@/game/historia/mundo';
import { CAPITULOS } from '@/game/historia/roteiro';

/** O Rato-Rei no mapa aberto (22/11/2026): mira, investida, bate na coluna, fica tonto, apanha. */
const m = ARENA_RATO_REI;
const rodar = (st0: EstadoChefao, heroi: { x: number; y: number }, ms: number) => {
  let st = st0;
  for (let t = 0; t < ms; t += 20) st = passoChefao(m, st, heroi, 20);
  return st;
};
const correndo = (x: number, y: number, vx: number, vy: number): EstadoChefao => {
  const st = novoChefao();
  return { ...st, chefe: { ...st.chefe, x, y, vx, vy, estado: 'carga', ate: 99999 } };
};

describe('o Rato-Rei no mapa aberto', () => {
  it('a arena é um retângulo, o começo é livre e está no capítulo 4 do Cassius', () => {
    for (const l of m.mapa) expect(l.length).toBe(m.mapa[0]!.length);
    expect(livre(m, m.inicio[0] + 0.5, m.inicio[1] + 0.8)).toBe(true);
    const cena = CAPITULOS.claude.flatMap((c) => c.cenas).find((c) => c.id === 'c4-luta-rato-rei');
    expect(cena?.tipo === 'luta' && cena.noMapa).toBe(true);
  });

  it('ele mira e depois corre na direção de onde você estava', () => {
    const st = rodar(novoChefao(), { x: 3.5, y: 4.8 }, 1900);
    expect(st.chefe.estado === 'carga' || st.chefe.estado === 'tonto').toBe(true);
    expect(st.chefe.x).toBeLessThan(9.5);
  });

  it('bateu na parede: fica tonto, e só tonto o golpe entra', () => {
    const longe = { x: 10.5, y: 2.8 };
    const st = rodar(correndo(2.5, 4.8, -8, 0), longe, 400);
    expect(st.chefe.estado).toBe('tonto');
    expect(st.eventos.some((e) => e.tipo === 'parede')).toBe(true);
    const perto = { x: st.chefe.x + 0.8, y: st.chefe.y };
    const bateu = golpearChefao(st, perto);
    expect(bateu.chefe.vida).toBe(VIDA_REI - 1);
    // De novo na mesma hora: espera o golpe recarregar.
    expect(golpearChefao(bateu, perto).chefe.vida).toBe(VIDA_REI - 1);
    // Mirando, o golpe não entra.
    const mirando = { ...st, chefe: { ...st.chefe, estado: 'mira' as const } };
    expect(golpearChefao(mirando, perto).chefe.vida).toBe(VIDA_REI);
  });

  it('a investida machuca, e sem vida você cai', () => {
    const heroi = { x: 6.5, y: 4.8 };
    const st = rodar({ ...correndo(8.5, 4.8, -8, 0), vida: 18 }, heroi, 300);
    expect(st.vida).toBe(0);
    expect(st.fim).toBe('derrota');
  });

  it('cada investida machuca uma vez só (antes, passava por cima e acertava duas)', () => {
    const st = rodar(correndo(10.5, 4.8, -8, 0), { x: 6.5, y: 4.8 }, 1000);
    expect(st.vida).toBe(82);
  });

  it('o último golpe ganha a luta', () => {
    const st = rodar(correndo(2.5, 4.8, -8, 0), { x: 10.5, y: 2.8 }, 400);
    const quase = { ...st, chefe: { ...st.chefe, vida: 1 } };
    expect(golpearChefao(quase, { x: st.chefe.x + 0.5, y: st.chefe.y }).fim).toBe('vitoria');
  });
});
