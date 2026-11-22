import { golpearChefe, novoEstadoChefe, passoChefe, type DefChefe, type EstadoChefe, usarHabilidade } from '@/game/historia/chefoes';
import { CHEFES } from '@/game/historia/chefoesDefs';
import { INIMIGOS } from '@/game/historia/inimigos';
import { livre } from '@/game/historia/mundo';
import { CAPITULOS } from '@/game/historia/roteiro';

/** Os chefões em duas etapas (22/11/2026): todos têm arena, são únicos e dá para quebrar a armadura. */
const todas = Object.values(CAPITULOS).flatMap((caps) => caps.flatMap((c) => c.cenas));
const lutasDeChefe = todas.filter((c) => c.tipo === 'luta' && !c.treino && INIMIGOS[c.inimigo]?.chefao);

const rodar = (d: DefChefe, st0: EstadoChefe, heroi: { x: number; y: number }, ms: number) => {
  let st = st0;
  for (let t = 0; t < ms && !st.fim; t += 20) st = passoChefe(d, st, heroi, 20);
  return st;
};

describe('os chefões em duas etapas', () => {
  it('todo chefão da história (menos o Rato-Rei, que é só no mapa) tem a primeira etapa', () => {
    const faltam = lutasDeChefe.filter((c) => c.tipo === 'luta' && !c.noMapa && !CHEFES[c.inimigo]).map((c) => c.id);
    expect(faltam).toEqual([]);
    expect(Object.keys(CHEFES).length).toBe(18);
  });

  it('cada um é único: nenhuma combinação de padrões e arena se repete', () => {
    const jeitos = Object.values(CHEFES).map((d) => d.padroes.map((p) => p.tipo).join('+'));
    expect(new Set(Object.values(CHEFES).map((d) => d.arena.id)).size).toBe(18);
    expect(new Set(jeitos).size).toBeGreaterThanOrEqual(15);
  });

  for (const [id, d] of Object.entries(CHEFES)) {
    describe(id, () => {
      it('a arena é um retângulo, o gladiador e o chefão começam em lugar livre', () => {
        expect(INIMIGOS[d.inimigo]).toBeTruthy();
        for (const l of d.arena.mapa) expect(l.length).toBe(d.arena.mapa[0]!.length);
        expect(livre(d.arena, d.arena.inicio[0] + 0.5, d.arena.inicio[1] + 0.8)).toBe(true);
        expect(livre(d.arena, d.inicio[0] + 0.5, d.inicio[1] + 0.8)).toBe(true);
        expect(d.vidaNoDuelo).toBeGreaterThan(0);
        expect(d.vidaNoDuelo).toBeLessThan(1);
      });

      it('bater fora da hora não tira placa; quem fica colado e bate na hora certa quebra a armadura', () => {
        let st = novoEstadoChefe(d, 1_000_000);
        const colado = () => ({ x: st.x + 0.9, y: st.y + 0.2 });
        const bloq = golpearChefe(d, st, colado());
        expect(bloq.armadura).toBe(d.armadura);
        for (let t = 0; t < 240_000 && !st.fim; t += 20) {
          st = passoChefe(d, st, colado(), 20);
          if (st.etapa === 'cansado' || st.copias) {
            // Nas cópias, bate em todas (a falsa some) até achar o verdadeiro.
            for (const c of st.copias ?? []) if (c.viva) st = golpearChefe(d, { ...st, golpeAte: 0 }, { x: c.x + 0.5, y: c.y + 0.2 });
            st = golpearChefe(d, { ...st, golpeAte: 0 }, colado());
          }
        }
        expect(st.fim).toBe('quebrou');
        expect(st.armadura).toBe(0);
      });

      it('quem fica parado colado nele sem bater acaba caindo', () => {
        const st0 = novoEstadoChefe(d, 100);
        const st = rodar(d, st0, { x: st0.x + 0.9, y: st0.y + 0.2 }, 300_000);
        expect(st.vida).toBeLessThan(100);
      });
    });
  }
});

describe('a habilidade de cada gladiador na primeira etapa', () => {
  const d = CHEFES['fornalha']!;
  it('Cassius: o escudo segura quase todo o dano das zonas', () => {
    const st0 = novoEstadoChefe(d, 100);
    const heroi = { x: st0.zonas![0]!.x, y: st0.zonas![0]!.y };
    const semEscudo = rodar(d, st0, heroi, 3200);
    const comEscudo = rodar(d, { ...st0, escudoAte: 99_999 }, heroi, 3200);
    expect(semEscudo.vida).toBe(100 - d.dano);
    expect(comEscudo.vida).toBeGreaterThan(semEscudo.vida);
  });
  it('Octavius: a rede perto deixa o chefão cansado e some com as cópias; longe, erra', () => {
    const arq = CHEFES['arquivista']!;
    const st0 = { ...novoEstadoChefe(arq, 100), etapa: 'ataque' as const, copias: [{ x: 3, y: 3, viva: true }] };
    const perto = usarHabilidade(arq, st0, { x: st0.x + 1, y: st0.y }, 'rede').st;
    expect(perto.etapa).toBe('cansado');
    expect(perto.copias).toBeUndefined();
    const longe = usarHabilidade(arq, st0, { x: st0.x + 8, y: st0.y }, 'rede').st;
    expect(longe.etapa).toBe('ataque');
    expect(usarHabilidade(arq, perto, { x: st0.x + 1, y: st0.y }, 'rede').st).toBe(perto);
  });
  it('Helios: o passo de sombra anda para a frente, para na parede e não leva dano', () => {
    const st0 = novoEstadoChefe(d, 100);
    const h = { x: 2.5, y: 4.8 };
    const r = usarHabilidade(d, st0, h, 'passo', { x: 1, y: 0 });
    expect(r.heroi!.x).toBeCloseTo(5, 1);
    const parede = usarHabilidade(d, st0, h, 'passo', { x: -1, y: 0 });
    expect(parede.heroi!.x).toBeGreaterThan(1.3);
    expect(livre(d.arena, parede.heroi!.x, parede.heroi!.y)).toBe(true);
    expect(r.st.invulAte).toBeGreaterThan(r.st.tempo);
  });
});
