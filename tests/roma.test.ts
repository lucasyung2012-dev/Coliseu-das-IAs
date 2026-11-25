import { parte1 } from '@/game/historia/historiaUnica';
import { BAIRROS, bairroDaCena, bairrosParaPassear, estadoRoma, mundoDePasseio, PASSEIOS, type BairroId } from '@/game/historia/roma';
import { livre } from '@/game/historia/mundo';
import { ALTURA_RUAS, LARGURA_RUAS, mapaDasRuas, mundoDasRuas, PORTAS } from '@/game/historia/ruas';
import { achouEmRoma, criarSaveUnica } from '@/game/historia/saves';

/** O mapa de Roma (22/11/2026): os bairros, onde a história está e onde cada um dos três está. */
describe('o mapa de Roma', () => {
  it('toda cena da Parte 1 cai num bairro que existe no mapa', () => {
    const ids = new Set(BAIRROS.map((b) => b.id));
    for (const a of parte1()) for (const c of a.cenas) expect(ids.has(bairroDaCena(c)), c.id).toBe(true);
  });

  it('no começo, a história está na Biblioteca e o resto está na névoa', () => {
    const e = estadoRoma(1, 0);
    expect(e.atual).toBe('biblioteca');
    expect(e.visitados).toEqual(['biblioteca']);
    expect(e.herois.cassius).toBe('biblioteca');
    expect(e.herois.octavius).toBeNull();
    expect(e.proximo).toBe('porto');
    expect(e.juntos).toBe(false);
  });

  it('no fim do Ato 1, cada um está no seu lugar', () => {
    const fim = parte1()[0]!.cenas.length - 1;
    const e = estadoRoma(1, fim);
    expect(e.herois).toEqual({ cassius: 'biblioteca', octavius: 'porto', helios: 'observatorio' });
  });

  it('no Encontro, os três estão juntos no Ludus', () => {
    const e = estadoRoma(3, 2);
    expect(e.atual).toBe('ludus');
    expect(e.juntos).toBe(true);
    expect(e.herois).toEqual({ cassius: 'ludus', octavius: 'ludus', helios: 'ludus' });
  });

  it('terminada a Parte 1, não tem próximo destino', () => {
    expect(estadoRoma(7, 0).proximo).toBeNull();
  });
});

describe('os bairros vivos (24/11/2026)', () => {
  it('cada bairro tem três pessoas, quem pede ajuda, um segredo e a coisa perdida, tudo em lugar onde dá para pisar', () => {
    for (const b of Object.keys(PASSEIOS) as BairroId[]) {
      const m = mundoDePasseio(b)!;
      expect(m, b).not.toBeNull();
      expect(m.pessoas.length, b).toBe(4);
      expect(m.coisas.map((c) => c.id).sort(), b).toEqual(['perdido', 'segredo']);
      for (const p of m.pessoas) for (const [x, y] of p.rota) expect(livre(m, x + 0.5, y + 0.8), `${b}: ${p.id}`).toBe(true);
      for (const c of m.coisas) expect(livre(m, c.x + 0.5, c.y + 0.8), `${b}: ${c.id}`).toBe(true);
    }
  });
  it('as pessoas ficam perto da entrada (dá para ver ao chegar)', () => {
    for (const b of Object.keys(PASSEIOS) as BairroId[]) {
      const m = mundoDePasseio(b)!;
      for (const p of m.pessoas.filter((x) => x.id.startsWith('gente'))) {
        const [x, y] = p.rota[0]!;
        expect(Math.hypot(x - m.inicio[0], y - m.inicio[1]), `${b}: ${p.id}`).toBeLessThan(14);
      }
    }
  });
  it('achar o segredo e a coisa perdida dá peças uma vez só; depois elas somem e o dono agradece', () => {
    let s = criarSaveUnica();
    s = achouEmRoma(s, 'roma-segredo-subura');
    s = achouEmRoma(s, 'roma-pedido-subura');
    s = achouEmRoma(s, 'roma-pedido-subura');
    expect(s.pecas).toBe(3 + 5);
    const m = mundoDePasseio('subura', s.roma)!;
    expect(m.coisas.map((c) => c.id)).toEqual([]);
    expect(m.pessoas.find((p) => p.id === 'pedido')!.falas[0]!.texto).toMatch(/Obrigado/);
  });
  it('antes do Encontro não dá para passear; depois, só nos bairros já visitados', () => {
    expect(bairrosParaPassear(estadoRoma(2, 3))).toEqual([]);
    const depois = bairrosParaPassear(estadoRoma(3, 2));
    expect(depois.length).toBeGreaterThan(0);
    expect(depois).not.toContain('aqueduto');
  });
});

describe('Roma caminhável (25/11/2026)', () => {
  it('a cidade tem 64 × 40 ladrilhos, todas as linhas do mesmo tamanho', () => {
    const m = mapaDasRuas();
    expect(m.length).toBe(ALTURA_RUAS);
    for (const l of m) expect(l.length).toBe(LARGURA_RUAS);
  });
  it('de qualquer porta dá para chegar a pé em todas as outras', () => {
    const m = mundoDasRuas({ ato: 4, inicio: 'coliseu', visitados: [], segredos: [], abertos: [] });
    const ok = (x: number, y: number) => y >= 0 && y < m.mapa.length && x >= 0 && x < m.mapa[0]!.length && livre(m, x + 0.5, y + 0.8);
    const visto = new Set<string>([`${m.inicio[0]},${m.inicio[1]}`]);
    const fila: [number, number][] = [m.inicio];
    expect(ok(...m.inicio)).toBe(true);
    for (let i = 0; i < fila.length; i++) {
      const [x, y] = fila[i]!;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const k = `${x + dx},${y + dy}`;
        if (visto.has(k) || !ok(x + dx, y + dy)) continue;
        visto.add(k);
        fila.push([x + dx, y + dy]);
      }
    }
    for (const [b, [px, py]] of Object.entries(PORTAS)) expect(visto.has(`${px},${py}`), b).toBe(true);
  });
  it('a Pintora de Estrelas dá a dica de um segredo que falta, num lugar já visitado', () => {
    const m = mundoDasRuas({ ato: 4, inicio: 'forum', visitados: ['subura', 'porto'], segredos: ['subura'], abertos: ['subura'] });
    const p = m.pessoas.find((x) => x.id === 'pintora')!;
    expect(p.falas.some((f) => /PORTO DE ÓSTIA/.test(f.texto))).toBe(true);
  });
});

describe('os interiores únicos (25/11/2026)', () => {
  it('cada lugar tem um mapa só dele, diferente de todos os outros, com a porta de volta para a rua', async () => {
    const { INTERIORES } = await import('@/game/historia/interiores');
    const lugares = Object.keys(PASSEIOS);
    const desenhos = new Set<string>();
    for (const b of lugares) {
      const m = INTERIORES[b];
      expect(m, b).toBeDefined();
      for (const l of m!.mapa) expect(l.length, b).toBe(m!.mapa[0]!.length);
      expect(m!.mapa.some((l) => l.includes('P')), b).toBe(true);
      desenhos.add(m!.mapa.join('\n'));
    }
    expect(desenhos.size).toBe(lugares.length);
  });
});
