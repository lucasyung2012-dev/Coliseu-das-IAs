import { ligasCruzadas, PARADAS, posicaoNoMapa } from '@/game/mapa';

describe('mapa de troféus', () => {
  it('tem as 5 ligas como paradas, em ordem, de baixo para cima', () => {
    expect(PARADAS.filter((p) => p.liga).map((p) => p.liga)).toEqual(['Recrutas', 'Gladiadores', 'Centuriões', 'Pretorianos', 'Imperadores']);
    for (let i = 1; i < PARADAS.length; i++) expect(PARADAS[i]!.y).toBeLessThan(PARADAS[i - 1]!.y);
  });

  it('coloca o gladiador no começo, no meio de duas paradas e no fim', () => {
    expect(posicaoNoMapa(0)).toEqual({ x: PARADAS[0]!.x, y: PARADAS[0]!.y });
    const meio = posicaoNoMapa(50);
    expect(meio.y).toBeLessThan(PARADAS[0]!.y);
    expect(meio.y).toBeGreaterThan(PARADAS[1]!.y);
    expect(posicaoNoMapa(99999)).toEqual({ x: PARADAS[PARADAS.length - 1]!.x, y: PARADAS[PARADAS.length - 1]!.y });
  });

  it('avisa as ligas cruzadas para a festa', () => {
    expect(ligasCruzadas(450, 520)).toEqual(['Gladiadores']);
    expect(ligasCruzadas(100, 200)).toEqual([]);
  });
});
