import { recompensasNovas, RECOMPENSAS, tituloDoNivel, visualDoNivel } from '@/game/maestria';
import { patenteDe } from '@/game/ligas';
import { gradeGladiador } from '@/ui/pixel/sprites';

describe('recompensas de Maestria', () => {
  it('libera o visual certo em cada nível', () => {
    expect(visualDoNivel(1)).toMatchObject({ moldura: 'nenhuma', armadura: 'padrao', aura: 'nenhuma', titulo: false, coroa: false });
    expect(visualDoNivel(2).moldura).toBe('bronze');
    expect(visualDoNivel(12)).toMatchObject({ armadura: 'cor', titulo: true, fala: true });
    expect(visualDoNivel(30)).toMatchObject({ moldura: 'prata', aura: 'faiscas', pose: true, entrada: true });
    expect(visualDoNivel(100)).toMatchObject({ moldura: 'ouro', armadura: 'ouro', aura: 'raios', coroa: true });
  });

  it('avisa as recompensas novas ao subir de nível', () => {
    expect(recompensasNovas(4, 5).map((r) => r.tipo)).toEqual(['titulo', 'fala']);
    expect(recompensasNovas(1, 100)).toHaveLength(RECOMPENSAS.length);
    expect(recompensasNovas(6, 7)).toEqual([]);
  });

  it('o primeiro título é Novato, para não confundir com a patente Recruta', () => {
    expect(tituloDoNivel(1).nome).toBe('Novato');
  });
});

describe('evolução pelos troféus', () => {
  it('a patente muda com a liga', () => {
    expect(patenteDe(0)).toBe('Recruta');
    expect(patenteDe(1600)).toBe('Centurião');
    expect(patenteDe(9000)).toBe('Imperador');
  });

  it('o desenho do gladiador muda a partir de Centurião', () => {
    const recruta = gradeGladiador('claude', 0).join('\n');
    expect(gradeGladiador('claude', 1).join('\n')).toBe(recruta);
    const niveis = [2, 3, 4].map((l) => gradeGladiador('claude', l).join('\n'));
    expect(new Set([recruta, ...niveis]).size).toBe(4);
    expect(gradeGladiador('gemini', 4).join('')).toContain('P');
  });
});
