import { agir, ANIMO_MAX, ATRIBUTOS_INICIAIS, novaLuta, passoLuta, type AtributosLuta, type DefInimigo, type EstadoLuta } from '@/game/historia/luta';

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
  it('o escudo segura 70% do fogo', () => {
    const s = defender(novaLuta(boneco('fogo'), a), a, 'escudo');
    expect(s.jogador.vidaMax - s.jogador.vida).toBe(6);
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
  it('aparar deixa passar um pouco do golpe', () => {
    const s = defender(novaLuta(boneco(), a), a, 'escudo');
    expect(s.jogador.vidaMax - s.jogador.vida).toBe(5);
  });
  it('REDE: o inimigo fica preso quase 3 segundos', () => {
    const s = agir({ ...novaLuta(boneco(), a), animo: ANIMO_MAX }, 'especial', a);
    expect(s.inimigo.estado).toBe('atordoado');
    expect(s.inimigo.estadoAte - s.tempo).toBeGreaterThanOrEqual(2500);
    expect(s.eventos.some((e) => e.tipo === 'rede')).toBe(true);
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
