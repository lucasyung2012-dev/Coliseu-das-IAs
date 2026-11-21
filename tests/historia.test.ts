import { INIMIGOS } from '@/game/historia/inimigos';
import { agir, ANIMO_MAX, ataqueAtual, novaLuta, passoLuta, TICK_LUTA, type EstadoLuta } from '@/game/historia/luta';
import { avancarSave, criarSave } from '@/game/historia/saves';
import { CAPITULOS } from '@/game/historia/roteiro';

const fixo = () => 0;
/** Anda a luta até o inimigo começar o sinal. */
function ateSinal(s: EstadoLuta): EstadoLuta {
  let r = s;
  for (let i = 0; i < 200 && r.inimigo.estado !== 'sinal'; i++) r = passoLuta(r, undefined, fixo);
  return r;
}
/** Anda até o golpe chegar (fim do sinal). */
function ateImpacto(s: EstadoLuta): EstadoLuta {
  let r = s;
  for (let i = 0; i < 200 && r.inimigo.estado === 'sinal'; i++) r = passoLuta(r, undefined, fixo);
  return r;
}

describe('luta do modo História', () => {
  it('o inimigo dá o sinal antes de atacar; sem reagir, o golpe acerta', () => {
    let s = ateSinal(novaLuta(INIMIGOS.incinerador!));
    expect(s.inimigo.estado).toBe('sinal');
    s = ateImpacto(s);
    expect(s.jogador.vida).toBe(100 - ataqueAtual(novaLuta(INIMIGOS.incinerador!)).dano);
    expect(s.inimigo.estado).toBe('aberto');
  });

  it('escudo segura o golpe de corpo; o inimigo fica aberto e o golpe entra cheio', () => {
    let s = ateSinal(novaLuta(INIMIGOS.incinerador!));
    // Levanta o escudo bem perto do golpe.
    for (let i = 0; i < 200 && s.tempo + 300 < s.inimigo.estadoAte; i++) s = passoLuta(s, undefined, fixo);
    s = agir(s, 'escudo');
    s = ateImpacto(s);
    expect(s.jogador.vida).toBe(100);
    expect(s.inimigo.estado).toBe('aberto');
    const antes = s.inimigo.vida;
    s = agir(s, 'golpe');
    expect(s.inimigo.vida).toBe(antes - 8);
  });

  it('o jato de fogo atravessa o escudo pela metade; esquivando, não pega nada', () => {
    const base = novaLuta(INIMIGOS['incinerador-lanca-chamas']!);
    let s = ateSinal(base);
    expect(ataqueAtual(s).tipo).toBe('fogo');
    for (let i = 0; i < 200 && s.tempo + 300 < s.inimigo.estadoAte; i++) s = passoLuta(s, undefined, fixo);
    const comEscudo = ateImpacto(agir(s, 'escudo'));
    expect(comEscudo.jogador.vida).toBe(100 - 6);
    const esquivando = ateImpacto(agir(s, 'esquiva'));
    expect(esquivando.jogador.vida).toBe(100);
    expect(esquivando.animo).toBeGreaterThan(0);
  });

  it('em guarda, o inimigo defende quase tudo; o especial só com o Ânimo cheio', () => {
    let s = novaLuta(INIMIGOS.incinerador!);
    s = agir(s, 'golpe');
    expect(s.inimigo.vida).toBe(INIMIGOS.incinerador!.vida - 1);
    expect(agir(s, 'especial')).toBe(s);
    s = { ...s, animo: ANIMO_MAX, tempo: s.tempo + 1000 };
    s = agir(s, 'especial');
    expect(s.animo).toBe(0);
    expect(s.inimigo.estado).toBe('atordoado');
  });

  it('a Fornalha muda de fase na metade da vida; vencer e perder encerram a luta', () => {
    let s = novaLuta(INIMIGOS.fornalha!);
    s = { ...s, inimigo: { ...s.inimigo, estado: 'aberto', estadoAte: 99_999 } };
    for (let i = 0; i < 8; i++) s = agir({ ...s, tempo: s.tempo + 400 }, 'golpe');
    expect(s.inimigo.fase).toBe(1);
    for (let i = 0; i < 20 && !s.fim; i++) s = agir({ ...s, tempo: s.tempo + 400 }, 'golpe');
    expect(s.fim).toBe('vitoria');
    let d = novaLuta(INIMIGOS.fornalha!);
    d = { ...d, jogador: { ...d.jogador, vida: 1 } };
    for (let i = 0; i < 2000 && !d.fim; i++) d = passoLuta(d, undefined, fixo);
    expect(d.fim).toBe('derrota');
    expect(TICK_LUTA).toBeGreaterThan(0);
  });
});

describe('saves e roteiro', () => {
  it('o save começa no capítulo 1 e marca os capítulos terminados', () => {
    const s = criarSave('claude', new Date('2026-11-20T10:00:00Z'));
    expect(s).toMatchObject({ gladiador: 'claude', capitulo: 1, cena: 0, concluidos: [] });
    expect(avancarSave(s, 2, 0).concluidos).toEqual([1]);
  });

  it('o Capítulo 1 do Cassius tem 5 batalhas e o chefão Fornalha', () => {
    const cap1 = CAPITULOS.claude[0]!;
    const lutas = cap1.cenas.filter((c) => c.tipo === 'luta');
    expect(lutas).toHaveLength(6);
    expect(lutas[5]).toMatchObject({ inimigo: 'fornalha' });
    for (const l of lutas) if (l.tipo === 'luta') expect(INIMIGOS[l.inimigo]).toBeDefined();
  });
});
