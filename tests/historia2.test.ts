import { INIMIGOS } from '@/game/historia/inimigos';
import { agir, ATRIBUTOS_INICIAIS, novaLuta, passoLuta, type EstadoLuta } from '@/game/historia/luta';
import { aprender, atributosDoSave, CAMINHOS_ABERTOS, criarSave, forjar, ganharEquipamento, ganharPecas, treinar, treinoFeito } from '@/game/historia/saves';
import { CAPITULOS, cenaValida, proximaCena, type Capitulo } from '@/game/historia/roteiro';

/** Todas as versões do capítulo (uma por opção da escolha, se ele tiver uma escolha). */
function versoes(cap: Capitulo): Record<string, string>[] {
  const escolha = cap.cenas.find((c) => c.tipo === 'escolha');
  if (!escolha || escolha.tipo !== 'escolha') return [{}];
  return escolha.opcoes.map((o) => ({ [escolha.id]: o.valor }));
}

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

  it('nunca duas lutas seguidas sem nada no meio (pedido do Lucas)', () => {
    // Em capítulos com ESCOLHA, cada rota é conferida separada (só as cenas daquela rota).
    for (const cap of [...CAPITULOS.claude, ...CAPITULOS.chatgpt]) {
      for (const esc of versoes(cap)) {
        const cenas = cap.cenas.filter((c) => cenaValida(c, esc));
        cenas.forEach((c, k) => {
          if (k > 0 && c.tipo === 'luta') expect(cenas[k - 1]!.tipo, `${cap.titulo}: ${c.id}`).not.toBe('luta');
        });
      }
    }
  });

  it('a escolha de rota do Octavius: cada rota tem 3 lutas próprias, depois o cofre e o Cobrador', () => {
    const cap = CAPITULOS.chatgpt[3]!;
    expect(cap.titulo).toBe('O Mercado das Engrenagens');
    for (const esc of versoes(cap)) {
      const lutas = cap.cenas.filter((c) => cenaValida(c, esc) && c.tipo === 'luta');
      expect(lutas).toHaveLength(5);
      expect(lutas[4]).toMatchObject({ inimigo: 'cobrador' });
    }
    // Andando de cena em cena pela rota do esgoto, nunca passa por uma luta dos telhados.
    const esc = { 'o4-rota': 'esgoto' };
    const vistas: string[] = [];
    for (let i = proximaCena(cap, -1, esc); i < cap.cenas.length; i = proximaCena(cap, i, esc)) vistas.push(cap.cenas[i]!.id);
    expect(vistas).toContain('o4-b2');
    expect(vistas).not.toContain('o4-a1');
    expect(vistas).not.toContain('o4-c1');
  });

  it('o caminho do Octavius está completo: 6 capítulos e o final, com o Caio e o titã', () => {
    const caps = CAPITULOS.chatgpt;
    expect(caps.map((c) => c.numero)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    const chefes = caps.flatMap((c) => c.cenas).flatMap((c) => (c.tipo === 'luta' && INIMIGOS[c.inimigo]!.chefao ? [c.inimigo] : []));
    expect(chefes).toEqual(['almirante-ferrugem', 'feitor-tambor', 'cobrador', 'almirante-aco', 'leviata', 'censor-tita-octavius']);
    const desafios = caps.flatMap((c) => c.cenas).flatMap((c) => (c.tipo === 'desafio' ? [c.desafio] : []));
    expect(desafios).toEqual(expect.arrayContaining(['perseguicao', 'canhoes', 'estrelas', 'barcos']));
  });

  it('os desafios novos aparecem: furtivo, ritmo, proteger a Lívia e as armadilhas', () => {
    const desafios = [...CAPITULOS.claude, ...CAPITULOS.chatgpt].flatMap((c) => c.cenas).flatMap((c) => (c.tipo === 'desafio' ? [c.desafio] : []));
    for (const d of ['furtivo', 'ritmo', 'proteger', 'armadilhas'] as const) expect(desafios).toContain(d);
  });

  it('o Ludus do Cassius tem 2 minigames dele (forja e memória) e o dos três juntos', () => {
    const cap3 = CAPITULOS.claude[2]!.cenas.flatMap((c) => (c.tipo === 'desafio' ? [c.desafio] : []));
    expect(cap3).toEqual(expect.arrayContaining(['forja', 'memoria', 'trio']));
  });

  it('cada caminho tem a sua história: o Octavius não tem criança ajudando; tem o Marco e a Gaivota Sete', () => {
    const quem = CAPITULOS.chatgpt.flatMap((c) => c.cenas).flatMap((c) =>
      c.tipo === 'cutscene' ? c.quadros.flatMap((q) => [q.quem, ...(q.personagens ?? []).map((p) => p.quem)]) : c.tipo === 'conversa' ? c.falas.map((f) => f.quem) : [],
    );
    expect(quem).not.toContain('nina');
    expect(quem).not.toContain('livia');
    expect(quem).toContain('marco');
    expect(quem).toContain('gaivota');
  });

  it('o Capítulo 2 do Octavius: As Galés, 4 lutas e o Feitor do Tambor, com remar e tempestade', () => {
    const cap = CAPITULOS.chatgpt[1]!;
    expect(cap.titulo).toBe('As Galés');
    const lutas = cap.cenas.filter((c) => c.tipo === 'luta');
    expect(lutas).toHaveLength(5);
    expect(lutas[4]).toMatchObject({ inimigo: 'feitor-tambor' });
    const desafios = cap.cenas.flatMap((c) => (c.tipo === 'desafio' ? [c.desafio] : []));
    expect(desafios).toEqual(expect.arrayContaining(['remar', 'tempestade']));
  });

  it('o Ludus do Octavius tem os minigames dele (corrida e torre), o dos três, 2 lutas e a ESQUIVA DUPLA', () => {
    const cap = CAPITULOS.chatgpt[2]!;
    expect(cap.titulo).toBe('O Ludus');
    const desafios = cap.cenas.flatMap((c) => (c.tipo === 'desafio' ? [c.desafio] : []));
    expect(desafios).toEqual(expect.arrayContaining(['corrida', 'torre', 'trio']));
    expect(cap.cenas.filter((c) => c.tipo === 'luta')).toHaveLength(2);
    expect(cap.cenas.some((c) => c.tipo === 'ludus' && c.obrigatorio === 'esquiva-dupla')).toBe(true);
  });

  it('ESQUIVA DUPLA: esquiva recarrega na metade e o golpe depois de esquivar entra dobrado', () => {
    const a = { ...ATRIBUTOS_INICIAIS, tecnicas: ['esquiva-dupla' as const] };
    let s = novaLuta(INIMIGOS.incinerador!, a);
    for (let i = 0; i < 200 && s.inimigo.estado !== 'sinal'; i++) s = passoLuta(s, a, () => 0);
    for (let i = 0; i < 200 && s.tempo + 250 < s.inimigo.estadoAte; i++) s = passoLuta(s, a, () => 0);
    s = agir(s, 'esquiva', a);
    expect(s.jogador.esquivaPronta - s.tempo).toBe(425);
    for (let i = 0; i < 200 && s.inimigo.estado === 'sinal'; i++) s = passoLuta(s, a, () => 0);
    const antes = s.inimigo.vida;
    s = agir({ ...s, jogador: { ...s.jogador, acaoAte: 0 } }, 'golpe', a);
    expect(antes - s.inimigo.vida).toBeCloseTo(15.4);
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
