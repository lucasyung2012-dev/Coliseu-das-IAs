import { agir, ANIMO_MAX, ATRIBUTOS_INICIAIS, novaLuta, passoLuta, type AtributosLuta, type DefInimigo, type EstadoLuta } from '@/game/historia/luta';
import { CAPITULOS } from '@/game/historia/roteiro';
import { atributosDoSave, criarSave, ESTILO_DA_IA } from '@/game/historia/saves';

/**
 * Os jeitos de lutar (pedido do Lucas, 21/11/2026): Cassius guardião, Octavius
 * estrategista, Helios vidente. Um boneco que só dá um golpe de corpo (ou de fogo).
 */
const boneco = (tipo: 'corpo' | 'fogo' = 'corpo'): DefInimigo => ({
  id: 'boneco',
  nome: 'Boneco',
  vida: 500,
  fases: [{ ataques: [{ nome: 'Pancada', tipo, sinalMs: 600, dano: 20, abertoMs: 900 }], pausaMs: [800, 800] }],
});
const com = (estilo: AtributosLuta['estilo']): AtributosLuta => ({ ...ATRIBUTOS_INICIAIS, estilo });
const fixo = () => 0;

/** Anda até faltar `ms` para o golpe chegar e faz a ação; depois deixa o golpe chegar. */
function defender(s0: EstadoLuta, a: AtributosLuta, acao: 'escudo' | 'esquiva', ms = 150): EstadoLuta {
  let s = s0;
  for (let k = 0; k < 400 && !(s.inimigo.estado === 'sinal' && s.inimigo.estadoAte - s.tempo <= ms); k++) s = passoLuta(s, a, fixo);
  s = agir(s, acao, a);
  for (let k = 0; k < 40 && s.inimigo.estado === 'sinal'; k++) s = passoLuta(s, a, fixo);
  return s;
}

describe('Cassius, o Guardião', () => {
  const a = com('guardiao');
  it('bloqueio na última hora guarda uma página; cedo demais, não', () => {
    expect(defender(novaLuta(boneco(), a), a, 'escudo', 150).estilo.paginas).toBe(1);
    expect(defender(novaLuta(boneco(), a), a, 'escudo', 420).estilo.paginas).toBe(0);
  });
  it('o golpe no aberto cita as páginas e bate muito mais', () => {
    let s = defender(novaLuta(boneco(), a), a, 'escudo');
    s = { ...s, estilo: { ...s.estilo, paginas: 3 }, jogador: { ...s.jogador, acaoAte: 0 } };
    const comPaginas = agir(s, 'golpe', a);
    const semPaginas = agir({ ...s, estilo: { ...s.estilo, paginas: 0 } }, 'golpe', a);
    expect(comPaginas.estilo.paginas).toBe(0);
    expect(s.inimigo.vida - comPaginas.inimigo.vida).toBeGreaterThan(2.5 * (s.inimigo.vida - semPaginas.inimigo.vida));
    expect(comPaginas.eventos.some((e) => e.tipo === 'citacao')).toBe(true);
  });
  it('o escudo na hora certa segura até o fogo inteiro; cedo, segura 75%', () => {
    expect(defender(novaLuta(boneco('fogo'), a), a, 'escudo', 150).jogador.vida).toBe(100);
    const cedo = defender(novaLuta(boneco('fogo'), a), a, 'escudo', 600);
    expect(cedo.jogador.vidaMax - cedo.jogador.vida).toBe(5);
  });
  it('o escudo fica levantado enquanto segura, e abaixa ao soltar', () => {
    let s = agir(novaLuta(boneco(), a), 'escudo', a);
    expect(s.jogador.acaoAte - s.tempo).toBeGreaterThan(1000);
    s = agir(s, 'soltar', a);
    expect(s.jogador.acaoAte).toBe(s.tempo);
  });
  it('DEVOLVER: só depois de bloquear, e bate dobrado', () => {
    const parado = novaLuta(boneco(), a);
    expect(agir(parado, 'esquiva', a)).toBe(parado);
    const s = defender(novaLuta(boneco(), a), a, 'escudo');
    const d = agir({ ...s, jogador: { ...s.jogador, acaoAte: 0 } }, 'esquiva', a);
    expect(d.eventos.some((e) => e.tipo === 'riposta')).toBe(true);
    expect(s.inimigo.vida - d.inimigo.vida).toBeGreaterThanOrEqual(16);
  });
  it('MURALHA DE LIVROS: bloqueia tudo e devolve metade', () => {
    let s = { ...novaLuta(boneco('fogo'), a), animo: ANIMO_MAX };
    s = agir(s, 'especial', a);
    expect(s.eventos.some((e) => e.tipo === 'muralha')).toBe(true);
    const antes = s.inimigo.vida;
    for (let k = 0; k < 80 && !s.eventos.some((e) => e.tipo === 'reflexo'); k++) s = passoLuta(s, a, fixo);
    expect(s.jogador.vida).toBe(s.jogador.vidaMax);
    expect(antes - s.inimigo.vida).toBe(10);
  });
});

describe('Octavius, o Estrategista', () => {
  const a = com('estrategista');
  it('rolar na última hora faz o inimigo tropeçar (fica aberto bem mais tempo)', () => {
    const naHora = defender(novaLuta(boneco(), a), a, 'esquiva', 150);
    const cedo = defender(novaLuta(boneco(), a), a, 'esquiva', 340);
    expect(naHora.eventos.some((e) => e.tipo === 'tropeco')).toBe(true);
    expect(naHora.inimigo.estadoAte - naHora.tempo).toBeGreaterThan(cedo.inimigo.estadoAte - cedo.tempo + 600);
  });
  it('REDE no ataque: cancela o golpe e prende; na guarda, ele escapa; depois recarrega', () => {
    let s = novaLuta(boneco(), a);
    expect(agir(s, 'escudo', a).eventos.some((e) => e.tipo === 'escapou')).toBe(true);
    for (let k = 0; k < 400 && s.inimigo.estado !== 'sinal'; k++) s = passoLuta(s, a, fixo);
    const preso = agir(s, 'escudo', a);
    expect(preso.inimigo.estado).toBe('atordoado');
    expect(preso.eventos.some((e) => e.tipo === 'rede')).toBe(true);
    expect(agir({ ...preso, jogador: { ...preso.jogador, acaoAte: 0 } }, 'escudo', a).jogador.redePronta).toBe(preso.jogador.redePronta);
  });
  it('TRIDENTE: fura um pouco a guarda de longe, sem provocar contra-ataque', () => {
    let s = novaLuta(boneco(), a);
    for (let k = 0; k < 3; k++) s = agir({ ...s, jogador: { ...s.jogador, golpePronto: 0, acaoAte: 0 } }, 'golpe', a);
    expect(500 - s.inimigo.vida).toBeGreaterThan(6);
    expect(s.inimigo.contra).toBe(false);
  });
  it('ROLAR: o próximo golpe é pelas costas (contra-ataque)', () => {
    const s = defender(novaLuta(boneco(), a), a, 'esquiva');
    const g = agir({ ...s, jogador: { ...s.jogador, acaoAte: 0, golpePronto: 0 } }, 'golpe', a);
    expect(g.eventos.some((e) => e.tipo === 'riposta')).toBe(true);
  });
  it('PLANO B: pancada e ele fica tonto um bom tempo', () => {
    const s = agir({ ...novaLuta(boneco(), a), animo: ANIMO_MAX }, 'especial', a);
    expect(s.inimigo.estado).toBe('atordoado');
    expect(s.inimigo.estadoAte - s.tempo).toBeGreaterThanOrEqual(2500);
    expect(s.eventos.some((e) => e.tipo === 'planob')).toBe(true);
  });
});

describe('Helios, o Vidente', () => {
  const a = com('vidente');
  it('tem menos vida', () => {
    expect(novaLuta(boneco(), a).jogador.vidaMax).toBe(88);
  });
  it('lampejo na última hora junta luz (até 3)', () => {
    expect(defender(novaLuta(boneco(), a), a, 'esquiva', 150).estilo.luz).toBe(1);
    let s = novaLuta(boneco(), a);
    s = { ...s, estilo: { ...s.estilo, luz: 3 } };
    expect(defender(s, a, 'esquiva', 150).estilo.luz).toBe(3);
  });
  it('ESPELHO: o fogo volta inteiro para quem soprou', () => {
    const s = defender(novaLuta(boneco('fogo'), a), a, 'escudo');
    expect(s.jogador.vida).toBe(s.jogador.vidaMax);
    expect(500 - s.inimigo.vida).toBe(20);
  });
  it('LAMPEJO com luz, no aviso: cancela o ataque e gasta a luz', () => {
    let s = novaLuta(boneco(), a);
    s = { ...s, estilo: { ...s.estilo, luz: 1 } };
    for (let k = 0; k < 400 && s.inimigo.estado !== 'sinal'; k++) s = passoLuta(s, a, fixo);
    const l = agir(s, 'golpe', a);
    expect(l.estilo.luz).toBe(0);
    expect(l.inimigo.estado).toBe('aberto');
    expect(l.eventos.some((e) => e.tipo === 'lampejo')).toBe(true);
  });
  it('ECLIPSE: os 3 próximos golpes erram, e a luz vira dano', () => {
    const base = { ...novaLuta(boneco(), a), animo: ANIMO_MAX };
    const semLuz = agir(base, 'especial', a);
    const comLuz = agir({ ...base, estilo: { ...base.estilo, luz: 3 } }, 'especial', a);
    expect(semLuz.inimigo.vida - comLuz.inimigo.vida).toBe(27);
    expect(comLuz.estilo.cego).toBe(3);
    let s = comLuz;
    for (let k = 0; k < 400 && s.estilo.cego > 0; k++) s = passoLuta(s, a, fixo);
    expect(s.estilo.cego).toBe(0);
    expect(s.jogador.vida).toBe(s.jogador.vidaMax);
    expect(s.eventos.some((e) => e.tipo === 'erro') || s.seq > comLuz.seq).toBe(true);
  });
});

describe('sem estilo, a luta continua igual', () => {
  it('o especial neutro dá 28 de dano e deixa tonto', () => {
    const s = agir({ ...novaLuta(boneco()), animo: ANIMO_MAX }, 'especial');
    expect(500 - s.inimigo.vida).toBe(28);
    expect(s.estilo.paginas + s.estilo.luz + s.estilo.cego).toBe(0);
  });
});

describe('o capítulo 1 ensina o jeito de lutar de cada um', () => {
  it.each([
    ['claude', 'pagina'],
    ['chatgpt', 'tropeco'],
    ['gemini', 'luz'],
  ] as const)('%s: treino de %s', (ia, evento) => {
    const cap1 = CAPITULOS[ia][0]!;
    const treino = cap1.cenas.find((c) => c.tipo === 'luta' && c.treino);
    expect(treino?.tipo === 'luta' && treino.treino?.evento).toBe(evento);
    // E o estilo do save de verdade é o que esse treino ensina.
    const a = atributosDoSave(criarSave(ia));
    expect(a.estilo).toBe(ESTILO_DA_IA[ia]);
  });
});

describe('a sequência perfeita: três golpes depois de boa defesa soltam o arremate (22/11/2026)', () => {
  it('Cassius: o terceiro DEVOLVER vira GOLPE DE ESCUDO (e guarda uma página)', () => {
    const a = com('guardiao');
    const s = novaLuta(boneco(), a);
    const g = agir({ ...s, jogador: { ...s.jogador, ripostaAte: s.tempo + 1000, combo: 2, acaoAte: 0 } }, 'esquiva', a);
    expect(g.eventos.some((e) => e.tipo === 'arremate' && e.valor === 0)).toBe(true);
    expect(g.estilo.paginas).toBe(1);
    expect(g.jogador.combo).toBe(0);
  });
  it('Octavius: o terceiro golpe pelas costas vira ESTOCADA TRIPLA', () => {
    const a = com('estrategista');
    const s = novaLuta(boneco(), a);
    const g = agir({ ...s, jogador: { ...s.jogador, ripostaAte: s.tempo + 1000, combo: 2, acaoAte: 0, golpePronto: 0 } }, 'golpe', a);
    expect(g.eventos.some((e) => e.tipo === 'arremate' && e.valor === 1)).toBe(true);
    expect(g.inimigo.estado).toBe('atordoado');
  });
  it('Helios: a CONSTELAÇÃO enche a luz', () => {
    const a = com('vidente');
    const s = novaLuta(boneco(), a);
    const g = agir({ ...s, jogador: { ...s.jogador, ripostaAte: s.tempo + 1000, combo: 2, acaoAte: 0, golpePronto: 0 } }, 'golpe', a);
    expect(g.eventos.some((e) => e.tipo === 'arremate' && e.valor === 2)).toBe(true);
    expect(g.estilo.luz).toBe(3);
  });
  it('golpe comum (sem defesa antes) não conta para a sequência', () => {
    const a = com('guardiao');
    let s = novaLuta(boneco(), a);
    for (let k = 0; k < 5; k++) s = agir({ ...s, jogador: { ...s.jogador, golpePronto: 0, acaoAte: 0 } }, 'golpe', a);
    expect(s.jogador.combo ?? 0).toBe(0);
  });
});
