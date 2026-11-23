import { parte1 } from '@/game/historia/historiaUnica';
import { BAIRROS, bairroDaCena, estadoRoma } from '@/game/historia/roma';

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
