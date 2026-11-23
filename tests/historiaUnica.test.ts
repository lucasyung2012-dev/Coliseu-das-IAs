import { heroiDaCena, parte1, TIME_DESDE_O_ATO } from '@/game/historia/historiaUnica';
import { capitulosDoSave, saveCompleto } from '@/game/historia/roteiro4';
import { criarSaveUnica } from '@/game/historia/saves';

/** A história única, Parte 1 (22/11/2026): a primeira montagem a partir dos capítulos de hoje. */
describe('a história única, Parte 1', () => {
  const atos = parte1();

  it('tem os seis atos, com nome (não "Ato 1")', () => {
    expect(atos.map((a) => a.titulo)).toEqual(['A Noite das Três Estrelas', 'Foragidos', 'O Encontro', 'A Marca do Olho', 'Os Grandes Jogos', 'A Queda do Censor']);
    for (const a of atos) expect(a.titulo).not.toMatch(/^Ato/);
  });

  it('nenhuma cena repetida e nenhum ato vazio', () => {
    const ids = atos.flatMap((a) => a.cenas.map((c) => c.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of atos) expect(a.cenas.length).toBeGreaterThan(3);
  });

  it('o Ato 1 intercala os três na ordem Cassius, Octavius, Helios', () => {
    const quem: string[] = [];
    for (const c of atos[0]!.cenas) {
      if (c.id.includes('corte')) continue;
      const h = heroiDaCena(c);
      if (quem[quem.length - 1] !== h) quem.push(h);
    }
    expect(quem).toEqual(['cassius', 'octavius', 'helios', 'cassius', 'octavius', 'helios', 'cassius', 'octavius', 'helios']);
  });

  it('o Ato 2 segue a ordem das celas: Helios preso primeiro, depois Cassius, depois Octavius', () => {
    const fins = atos[1]!.cenas.filter((c) => /-(fim|naufragio)$/.test(c.id)).map((c) => c.id);
    expect(fins).toEqual(['h2-fim', 'c2-fim', 'o2-naufragio']);
  });

  it('cada cena tem o seu gladiador', () => {
    expect(heroiDaCena(atos[0]!.cenas.find((c) => c.id === 'o1-abertura'))).toBe('octavius');
    expect(heroiDaCena(atos[0]!.cenas.find((c) => c.id === 'h1-chefao'))).toBe('helios');
    expect(heroiDaCena(atos[3]!.cenas.find((c) => c.id === 'c5-chefao'))).toBe('cassius');
  });

  it('nunca duas lutas seguidas (o "enquanto isso" separa os pedaços)', () => {
    for (const a of atos)
      a.cenas.forEach((c, k) => {
        if (k > 0 && c.tipo === 'luta') expect(a.cenas[k - 1]!.tipo, `${a.titulo}: ${c.id}`).not.toBe('luta');
      });
  });

  it('termina com o Núcleo e, depois dos créditos, a voz no cano', () => {
    const ultimo = atos[5]!.cenas;
    expect(ultimo.some((c) => c.id.startsWith('s-'))).toBe(true);
    expect(ultimo[ultimo.length - 1]!.id).toBe('u6-cano');
    expect(TIME_DESDE_O_ATO).toBe(3);
  });

  it('o save da história única usa os atos e termina depois do sexto', () => {
    const s = criarSaveUnica();
    expect(s.unica).toBe(true);
    expect(capitulosDoSave(s)).toBe(atos);
    expect(saveCompleto(s)).toBe(false);
    expect(saveCompleto({ ...s, capitulo: 7 })).toBe(true);
  });
});

describe('o Encontro (as cenas novas)', () => {
  const ato3 = parte1()[2]!.cenas.map((c) => c.id);
  it('os três desconfiados na cela, a primeira luta juntos, a muralha e o Brutus contando do Pólux', () => {
    expect(ato3).toEqual(expect.arrayContaining(['u3-cela', 'u3-desconfianca', 'u3-estatua', 'u3-trio', 'u3-polux']));
    expect(ato3[ato3.length - 1]).toBe('u3-polux');
    expect(ato3.indexOf('u3-cela')).toBeLessThan(ato3.indexOf('u3-estatua'));
  });
});
