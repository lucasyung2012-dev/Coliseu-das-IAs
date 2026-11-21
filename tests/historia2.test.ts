import { INIMIGOS } from '@/game/historia/inimigos';
import { agir, ATRIBUTOS_INICIAIS, novaLuta, passoLuta, type EstadoLuta } from '@/game/historia/luta';
import { aprender, atributosDoSave, CAMINHOS_ABERTOS, criarSave, forjar, ganharEquipamento, ganharPecas, treinar, treinoFeito } from '@/game/historia/saves';
import { CAPITULOS } from '@/game/historia/roteiro';

const fixo = () => 0;
function ateSinal(s: EstadoLuta, a = ATRIBUTOS_INICIAIS): EstadoLuta {
  let r = s;
  for (let i = 0; i < 200 && r.inimigo.estado !== 'sinal'; i++) r = passoLuta(r, a, fixo);
  return r;
}
function ateImpacto(s: EstadoLuta, a = ATRIBUTOS_INICIAIS): EstadoLuta {
  let r = s;
  for (let i = 0; i < 200 && r.inimigo.estado === 'sinal'; i++) r = passoLuta(r, a, fixo);
  return r;
}
/** Bloqueia o próximo golpe do inimigo. */
function bloquear(s0: EstadoLuta, a = ATRIBUTOS_INICIAIS): EstadoLuta {
  let s = ateSinal(s0, a);
  for (let i = 0; i < 200 && s.tempo + 300 < s.inimigo.estadoAte; i++) s = passoLuta(s, a, fixo);
  s = agir(s, 'escudo', a);
  return ateImpacto(s, a);
}

describe('golpes do Ludus', () => {
  it('CONTRA-ATAQUE: golpe logo depois de bloquear entra dobrado e deixa tonto (só para quem aprendeu)', () => {
    const sem = ATRIBUTOS_INICIAIS;
    const com = { ...ATRIBUTOS_INICIAIS, tecnicas: ['contra-ataque' as const] };
    const a = bloquear(novaLuta(INIMIGOS.incinerador!, sem), sem);
    const normal = agir(a, 'golpe', sem);
    expect(a.inimigo.vida - normal.inimigo.vida).toBe(7);
    const b = bloquear(novaLuta(INIMIGOS.incinerador!, com), com);
    const forte = agir(b, 'golpe', com);
    expect(b.inimigo.vida - forte.inimigo.vida).toBeCloseTo(15.4);
    expect(forte.inimigo.estado).toBe('atordoado');
    expect(forte.eventos.some((e) => e.tipo === 'riposta')).toBe(true);
  });

  it('QUEBRA-GUARDA: três golpes na guarda deixam o inimigo tonto em vez de ele contra-atacar', () => {
    const com = { ...ATRIBUTOS_INICIAIS, tecnicas: ['quebra-guarda' as const] };
    let s = novaLuta(INIMIGOS['caes-de-ferro']!, com);
    for (let i = 0; i < 3; i++) s = agir({ ...s, tempo: s.tempo + 400 }, 'golpe', com);
    expect(s.inimigo.contra).toBe(false);
    expect(s.inimigo.estado).toBe('atordoado');
    expect(s.eventos.some((e) => e.tipo === 'quebra')).toBe(true);
  });

  it('o escudo gigante do Pretor de Aço não deixa nada entrar na guarda', () => {
    let s = novaLuta(INIMIGOS['pretor-de-aco']!);
    s = agir({ ...s, tempo: 400 }, 'golpe');
    expect(s.inimigo.vida).toBe(INIMIGOS['pretor-de-aco']!.vida);
  });

  it('na luta final, o especial chama um aliado', () => {
    const s = agir({ ...novaLuta(INIMIGOS['censor-tita']!), animo: 100 }, 'especial');
    expect(s.eventos.some((e) => e.tipo === 'aliado')).toBe(true);
  });
});

describe('o save no Ludus', () => {
  it('treino vale uma vez por capítulo; golpe aprendido fica; o ferreiro cobra peças', () => {
    let s = { ...criarSave('claude'), capitulo: 3 };
    s = treinar(s, 'forca');
    s = treinar(s, 'forca');
    expect(atributosDoSave(s).forca).toBe(2);
    expect(treinoFeito(s, 'forca')).toBe(true);
    s = aprender(s, 'contra-ataque');
    expect(atributosDoSave(s).tecnicas).toEqual(['contra-ataque']);
    expect(forjar(s, 'bracelete').equipamento ?? []).toEqual([]);
    s = forjar(ganharPecas(s, 7), 'bracelete');
    expect(s.pecas).toBe(1);
    expect(atributosDoSave(s).forca).toBe(3);
    s = ganharEquipamento(s, 'elmo-brutus');
    expect(atributosDoSave(s)).toMatchObject({ vida: 120, defesa: 2 });
  });
});

describe('os capítulos', () => {
  it('o caminho do Cassius tem os 6 capítulos e o final, com as batalhas combinadas', () => {
    const caps = CAPITULOS.claude;
    expect(caps.map((c) => c.numero)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    const lutas = (n: number) => caps[n - 1]!.cenas.filter((c) => c.tipo === 'luta');
    expect(lutas(3)).toHaveLength(1);
    expect(lutas(4)).toHaveLength(5);
    expect(lutas(4)[4]).toMatchObject({ inimigo: 'arquivista' });
    expect(lutas(5)).toHaveLength(6);
    expect(lutas(5)[5]).toMatchObject({ inimigo: 'pretor-de-aco' });
    expect(lutas(6)).toHaveLength(4);
    expect(lutas(6)[3]).toMatchObject({ inimigo: 'leao-mecanico' });
    expect(lutas(7)[0]).toMatchObject({ inimigo: 'censor-tita' });
  });

  it('todo inimigo existe; o Ludus ensina o contra-ataque no 3 e a quebra-guarda antes do Pretor', () => {
    for (const cap of [...CAPITULOS.claude, ...CAPITULOS.chatgpt])
      for (const c of cap.cenas) if (c.tipo === 'luta') expect(INIMIGOS[c.inimigo], c.inimigo).toBeDefined();
    const ludus = CAPITULOS.claude.flatMap((c) => c.cenas.map((x) => ({ cap: c.numero, x }))).filter((c) => c.x.tipo === 'ludus');
    expect(ludus.find((l) => l.x.tipo === 'ludus' && l.x.obrigatorio === 'contra-ataque')?.cap).toBe(3);
    expect(ludus.find((l) => l.x.tipo === 'ludus' && l.x.obrigatorio === 'quebra-guarda')?.cap).toBe(5);
  });

  it('o Octavius já pode ser jogado: Capítulo 1 com o desafio dos planos e o Almirante Ferrugem', () => {
    expect(CAMINHOS_ABERTOS).toContain('chatgpt');
    const cap = CAPITULOS.chatgpt[0]!;
    expect(cap.titulo).toBe('Ordem Impossível');
    expect(cap.cenas.some((c) => c.tipo === 'desafio' && c.desafio === 'escolher-plano')).toBe(true);
    const lutas = cap.cenas.filter((c) => c.tipo === 'luta');
    expect(lutas[lutas.length - 1]).toMatchObject({ inimigo: 'almirante-ferrugem' });
  });
});
