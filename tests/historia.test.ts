import { INIMIGOS } from '@/game/historia/inimigos';
import { agir, ANIMO_MAX, ataqueAtual, novaLuta, passoLuta, TICK_LUTA, type EstadoLuta } from '@/game/historia/luta';
import { ajustarOrdem, avancarSave, criarSave } from '@/game/historia/saves';
import { CAPITULOS, PROLOGO } from '@/game/historia/roteiro';

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
    expect(s.inimigo.vida).toBe(antes - 7);
  });

  it('o jato de fogo atravessa o escudo pela metade; esquivando, não pega nada', () => {
    const base = novaLuta(INIMIGOS['incinerador-lanca-chamas']!);
    let s = ateSinal(base);
    expect(ataqueAtual(s).tipo).toBe('fogo');
    for (let i = 0; i < 200 && s.tempo + 300 < s.inimigo.estadoAte; i++) s = passoLuta(s, undefined, fixo);
    const comEscudo = ateImpacto(agir(s, 'escudo'));
    expect(comEscudo.jogador.vida).toBe(100 - 9);
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

  it('a Fornalha tem três fases; vencer e perder encerram a luta', () => {
    let s = novaLuta(INIMIGOS.fornalha!);
    s = { ...s, inimigo: { ...s.inimigo, estado: 'aberto', estadoAte: 99_999 } };
    const bate = (x: EstadoLuta) => agir({ ...x, tempo: x.tempo + 400, jogador: { ...x.jogador, folego: 100 } }, 'golpe');
    for (let i = 0; i < 40 && s.inimigo.fase < 1; i++) s = bate(s);
    expect(s.inimigo.vida / 180).toBeLessThanOrEqual(0.66);
    for (let i = 0; i < 40 && s.inimigo.fase < 2; i++) s = bate(s);
    expect(s.inimigo.fase).toBe(2);
    for (let i = 0; i < 40 && !s.fim; i++) s = bate(s);
    expect(s.fim).toBe('vitoria');
    let d = novaLuta(INIMIGOS.fornalha!);
    d = { ...d, jogador: { ...d.jogador, vida: 1 } };
    for (let i = 0; i < 2000 && !d.fim; i++) d = passoLuta(d, undefined, fixo);
    expect(d.fim).toBe('derrota');
    expect(TICK_LUTA).toBeGreaterThan(0);
  });

  it('combo: vários golpes seguidos, e só depois do último ele fica aberto', () => {
    const def = { id: 't', nome: 'T', vida: 50, fases: [{ ataques: [{ nome: 'C', tipo: 'corpo' as const, sinalMs: 500, dano: 5, abertoMs: 900, combo: 3, comboMs: 300 }], pausaMs: [800, 800] as [number, number] }] };
    // Anda até o próximo golpe acertar (a vida muda).
    const umGolpe = (x: EstadoLuta) => {
      let r = x;
      const v = x.jogador.vida;
      for (let i = 0; i < 200 && r.jogador.vida === v; i++) r = passoLuta(r, undefined, fixo);
      return r;
    };
    let s = umGolpe(ateSinal(novaLuta(def)));
    expect(s.inimigo.estado).toBe('sinal');
    s = umGolpe(s);
    expect(s.inimigo.estado).toBe('sinal');
    s = umGolpe(s);
    expect(s.inimigo.estado).toBe('aberto');
    expect(s.jogador.vida).toBe(100 - 15);
  });

  it('finta não machuca; três golpes na guarda e ele contra-ataca; sem fôlego, não age', () => {
    const def = { id: 't', nome: 'T', vida: 50, contra: 9, fases: [{ ataques: [{ nome: 'F', tipo: 'finta' as const, sinalMs: 500, dano: 0, abertoMs: 0 }], pausaMs: [800, 800] as [number, number] }] };
    let s = ateImpacto(ateSinal(novaLuta(def)));
    expect(s.jogador.vida).toBe(100);
    expect(s.inimigo.estado).toBe('espera');
    for (let i = 0; i < 3; i++) s = agir({ ...s, tempo: s.tempo + 400 }, 'golpe');
    expect(s.inimigo.contra).toBe(true);
    expect(ataqueAtual(s).dano).toBe(9);
    const cansado = { ...s, tempo: s.tempo + 2000, jogador: { ...s.jogador, folego: 5, acaoAte: 0 } };
    expect(agir(cansado, 'esquiva').jogador.acao).not.toBe('esquiva');
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
    const lutas = cap1.cenas.filter((c) => c.tipo === 'luta' && !c.treino);
    expect(lutas).toHaveLength(6);
    expect(lutas[5]).toMatchObject({ inimigo: 'fornalha' });
    for (const l of lutas) if (l.tipo === 'luta') expect(INIMIGOS[l.inimigo]).toBeDefined();
  });

  it('Capítulo 1 na ordem nova: a luta de treino vem antes de todas, e a Lívia desce pelo alçapão depois dos livros', () => {
    const ids = CAPITULOS.claude[0]!.cenas.map((c) => c.id);
    expect(ids.slice(0, 7)).toEqual(['c1-abertura', 'c1-estantes', 'c1-plano', 'c1-treino-paginas', 'c1-depois-treino', 'c1-luta1', 'c1-esconder']);
    expect(ids[7]).toBe('c1-alcapao');
    expect(ids[11]).toBe('c1-escada');
  });

  it('save antigo do Capítulo 1 acha a mesma cena na ordem nova (uma vez só)', () => {
    const antigo = { ...criarSave('claude'), ordem: undefined };
    // A escada era a cena 10 e agora é a 11; a primeira luta era a 3 e agora é a 5.
    expect(ajustarOrdem({ ...antigo, cena: 10 }).cena).toBe(11);
    expect(ajustarOrdem({ ...antigo, cena: 3 }).cena).toBe(5);
    expect(ajustarOrdem({ ...antigo, cena: 14 }).cena).toBe(15);
    const novo = ajustarOrdem({ ...antigo, cena: 10 });
    expect(ajustarOrdem(novo)).toBe(novo);
    // Outro capítulo ou outro gladiador: não muda a cena.
    expect(ajustarOrdem({ ...antigo, capitulo: 2, cena: 4 }).cena).toBe(4);
    expect(ajustarOrdem({ ...antigo, gladiador: 'chatgpt', cena: 4 }).cena).toBe(4);
    expect(criarSave('claude').ordem).toBe(4);
    expect(ajustarOrdem({ ...antigo, capitulo: 4, cena: 2 }).cena).toBe(3);
    expect(ajustarOrdem({ ...antigo, ordem: 3, capitulo: 4, cena: 8 }).cena).toBe(9);
    expect(ajustarOrdem({ ...antigo, capitulo: 2, cena: 6 }).cena).toBe(7);
  });

  it('o Capítulo 2 tem 4 batalhas (a última no Coliseu), o desafio da carroça e nenhum chefão', () => {
    const cap2 = CAPITULOS.claude[1]!;
    expect(cap2.titulo).toBe('Correntes de Bronze');
    const lutas = cap2.cenas.filter((c) => c.tipo === 'luta');
    expect(lutas).toHaveLength(4);
    for (const l of lutas) if (l.tipo === 'luta') expect(INIMIGOS[l.inimigo]!.chefao).toBeFalsy();
    expect(lutas[3]).toMatchObject({ lugar: 'coliseu-arena', inimigo: 'gladiador-de-sucata' });
    expect(cap2.cenas.some((c) => c.tipo === 'desafio' && c.desafio === 'segurar-carroca')).toBe(true);
  });

  it('o prólogo é longo e termina no título', () => {
    expect(PROLOGO.length).toBeGreaterThanOrEqual(15);
    expect(PROLOGO[PROLOGO.length - 1]!.lugar).toBe('titulo');
  });

  it("o prólogo mostra Roma, a praça com a Eco e o Fio, e quem anda vai para um lugar dentro da cena", () => {
    expect(PROLOGO[0]!.efeito).toBe("panoramica");
    const praca = PROLOGO.filter((q) => q.lugar === "roma-praca");
    expect(praca.some((q) => q.personagens?.some((p) => p.quem === "eco") && q.personagens?.some((p) => p.quem === "fio"))).toBe(true);
    const quadros = [...PROLOGO, ...Object.values(CAPITULOS).flat().flatMap((c) => c.cenas).flatMap((c) => (c.tipo === "cutscene" ? c.quadros : []))];
    for (const q of quadros) {
      for (const p of q.personagens ?? []) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(100);
      }
    }
  });
});
