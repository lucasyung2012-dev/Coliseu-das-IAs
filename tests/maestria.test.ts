import { recompensasDe, recompensasNovas, tituloDoNivel, titulosDe, visualDoNivel } from '@/game/maestria';
import { IAS } from '@/game/personagens';
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
    expect(recompensasNovas(4, 5, 'claude').map((r) => r.tipo)).toEqual(['titulo', 'fala']);
    expect(recompensasNovas(1, 100, 'gemini')).toHaveLength(recompensasDe('gemini').length);
    expect(recompensasNovas(6, 7, 'chatgpt')).toEqual([]);
  });

  it('cada combatente tem os seus títulos e recompensas (nos mesmos níveis), nenhum igual ao dos outros', () => {
    expect(tituloDoNivel(1, 'claude').nome).toBe('Aluno da Ágora');
    expect(tituloDoNivel(100, 'chatgpt').nome).toBe('Almirante Eterno');
    expect(tituloDoNivel(60, 'gemini').nome).toBe('Mestre das Constelações');
    const titulos = IAS.flatMap((ia) => titulosDe(ia).map((t) => t.nome));
    expect(new Set(titulos).size).toBe(24);
    const recompensas = IAS.flatMap((ia) => recompensasDe(ia).map((r) => r.nome));
    expect(new Set(recompensas).size).toBeGreaterThanOrEqual(30);
    for (const ia of IAS) {
      expect(titulosDe(ia).map((t) => t.nivel)).toEqual(titulosDe('claude').map((t) => t.nivel));
      expect(recompensasDe(ia).map((r) => r.tipo)).toEqual(recompensasDe('claude').map((r) => r.tipo));
      // O primeiro título não pode ser "Recruta" (é a patente da liga).
      expect(titulosDe(ia)[0]!.nome).not.toMatch(/Recruta/);
    }
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
