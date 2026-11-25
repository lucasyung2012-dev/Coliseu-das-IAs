import { chefoesVencidos, heroiDaCena, parte1, TIME_DESDE_O_ATO } from '@/game/historia/historiaUnica';
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

describe('a continuidade da Parte 1 (24/11/2026)', () => {
  const atos = parte1();
  const textos = (a: (typeof atos)[number]) =>
    a.cenas.flatMap((c) =>
      c.tipo === 'cutscene' ? c.quadros.map((q) => q.texto) : c.tipo === 'conversa' ? c.falas.map((f) => f.texto) : c.tipo === 'ludus' ? c.conversas.flatMap((cv) => cv.falas.map((f) => f.texto)) : [],
    );
  it('nenhum cartão do jeito antigo ("FIM DO CAPÍTULO", "FIM DO CAMINHO", "caminho do...")', () => {
    for (const a of atos) for (const t of textos(a)) expect(t, a.titulo).not.toMatch(/FIM DO (CAPÍTULO|CAMINHO)|outras histórias/);
  });
  it('o Censor convoca os Jogos uma vez só, no Fórum (fim do Ato 4)', () => {
    const convoca = textos(atos[3]!).filter((t) => /convoco os Jogos|Jogos da Resposta Única acontecem/.test(t));
    expect(convoca.length).toBe(1);
  });
  it('o elmo do Brutus é dado uma vez só e "os três juntos, pela primeira vez" não se repete', () => {
    const a5 = atos[4]!;
    expect(a5.cenas.filter((c) => (c.tipo === 'ludus' || c.tipo === 'conversa') && c.presente === 'elmo-brutus').length).toBe(1);
    expect(textos(a5).filter((t) => /pela primeira vez/.test(t) && /três juntos/.test(t)).length).toBe(0);
  });
  it('o Titã cai e o Censor muda de lado antes do Núcleo; o "meses depois" vem só no fim', () => {
    const ids = atos[5]!.cenas.map((c) => c.id);
    expect(ids.indexOf('f-desfecho')).toBeLessThan(ids.findIndex((i) => i.startsWith('s-')));
    expect(ids.indexOf('u6-meses')).toBeGreaterThan(ids.findIndex((i) => i.startsWith('s-')));
    const t6 = textos(atos[5]!);
    expect(t6.filter((t) => /^Meses depois/.test(t)).length).toBe(1);
    expect(t6[t6.indexOf(t6.find((t) => /^Meses depois/.test(t))!)]).toBeDefined();
  });
});

describe('a arena de revanche do Ludus (24/11/2026)', () => {
  it('no começo não tem chefão vencido; no Encontro já tem os dos Atos 1 e 2, sem repetir', () => {
    expect(chefoesVencidos(1, 0)).toEqual([]);
    const ate3 = chefoesVencidos(3, 0);
    expect(ate3).toEqual(expect.arrayContaining(['fornalha', 'almirante-ferrugem', 'eclipse', 'cacador-sombras', 'feitor-tambor']));
    expect(new Set(ate3).size).toBe(ate3.length);
  });
  it('no fim da Parte 1, todos os chefões da Parte 1 estão lá', () => {
    expect(chefoesVencidos(7, 0).length).toBeGreaterThanOrEqual(14);
  });
});

describe('as paradas no Ludus viraram conversa (24/11/2026)', () => {
  const atos = parte1();
  it('depois do Encontro, nenhum ato obriga a passar pelo pátio do Ludus', () => {
    for (const a of atos.slice(3)) expect(a.cenas.filter((c) => c.tipo === 'ludus').map((c) => c.id), a.titulo).toEqual([]);
  });
  it('o QUEBRA-GUARDA continua obrigatório, como um treino rápido que ensina o golpe', () => {
    const treino = atos[3]!.cenas.find((c) => c.id === 'c5-ludus-treino');
    expect(treino?.tipo === 'luta' && treino.aprende).toBe('quebra-guarda');
    expect(treino?.tipo === 'luta' && treino.treino?.evento).toBe('quebra');
  });
  it('as conversas da história continuam (o elmo, a Lívia com medo antes do Fórum)', () => {
    const c5 = atos[3]!.cenas.find((c) => c.id === 'c5-ludus');
    expect(c5?.tipo).toBe('conversa');
    expect(c5?.tipo === 'conversa' && c5.falas.some((f) => /medo/.test(f.texto))).toBe(true);
  });
});
