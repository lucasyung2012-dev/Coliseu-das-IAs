import {
  BARALHO_PADRAO,
  baralhoDaIa,
  bonusDaCarga,
  DURACOES_MS,
  FOLEGO_POR_SEGUNDO,
  golpeDoGladiador,
  INTERVALO_MS,
  jogarCarta,
  montarMonte,
  novoDuelo,
  passo,
  PRORROGACAO_MS,
  resultadoFinal,
  ritmoDoFolego,
  TICK,
  TODAS_AS_CARTAS,
  TRIBUNA_VIDA,
  usarHabilidade,
  validarBaralho,
  type EstadoDuelo,
  type Lado,
  type TipoCarta,
  type TipoTropa,
  type Tropa,
} from '@/game/duelo/motor';

const sempre = (v: number) => () => v;
// acerto 0: o rival não usa o gladiador; proximoRival infinito: não joga sozinho.
const ctx = { acerto: 0, iaRival: 'chatgpt' as const, aleatorio: sempre(0.5) };
const SEM_RIVAL = Number.POSITIVE_INFINITY;

function base(): EstadoDuelo {
  return { ...novoDuelo({ frasesEu: ['frase a'], frasesRival: ['frase b'] }, sempre(0.5)), proximoRival: SEM_RIVAL };
}

function comMao(s: EstadoDuelo, lado: Lado, tipos: TipoCarta[], folego = 10): EstadoDuelo {
  const l = { ...s[lado], folego, mao: tipos.map((tipo, i) => ({ id: `${lado}${i}`, tipo, frase: 'f' })) };
  return lado === 'eu' ? { ...s, eu: l } : { ...s, rival: l };
}

let seq = 900;
function tropa(de: Lado, x: number, forca: number, tipo: TipoTropa = 'legionario', extra: Partial<Tropa> = {}): Tropa {
  seq += 1;
  return { id: seq, de, tipo, forca, forcaInicial: forca, x, carregada: false, proximoGolpe: 0, ...extra };
}

function avancar(s: EstadoDuelo, ms: number): EstadoDuelo {
  let x = s;
  for (let t = 0; t < ms; t += TICK) x = passo(x, ctx);
  return x;
}

/** Joga uma carta minha (com bastante fôlego). */
const jogar = (s: EstadoDuelo, tipo: TipoCarta, carga = 0) => jogarCarta(comMao(s, 'eu', [tipo], 20), 'eu', 'eu0', carga);

describe('duelo v7: baralho', () => {
  it('16 cartas na coleção; baralho salvo inválido vira o baralho inicial', () => {
    expect(TODAS_AS_CARTAS).toHaveLength(16);
    expect(validarBaralho(undefined)).toEqual(BARALHO_PADRAO);
    expect(validarBaralho(['frase', 'frase', 'tese'])).toEqual(BARALHO_PADRAO);
    const meu: TipoCarta[] = ['piada', 'discurso', 'citacao', 'estatistica', 'prova', 'contra', 'pergunta', 'pausa'];
    expect(validarBaralho(meu)).toEqual(meu);
    expect(montarMonte(['a'], 'eu', meu, sempre(0.3))).toHaveLength(8);
  });

  it('a IA monta 8 cartas sem repetir, com o estilo preferido dela', () => {
    const { estilo, cartas } = baralhoDaIa('claude', sempre(0.1));
    expect(estilo).toBe('muralha');
    expect(new Set(cartas).size).toBe(8);
    expect(baralhoDaIa('chatgpt', sempre(0.1)).estilo).toBe('pressa');
    expect(baralhoDaIa('gemini', sempre(0.1)).estilo).toBe('artilharia');
  });
});

describe('duelo v7: cartas e personalidades', () => {
  it('Frase rápida chega e tira da Tribuna o que sobrou depois do gladiador', () => {
    let s = jogar(base(), 'frase');
    s = avancar(s, 5500);
    expect(s.tribunas).toEqual({ eu: TRIBUNA_VIDA, rival: TRIBUNA_VIDA - 1 });
    expect(s.eu.carga).toBe(1);
  });

  it('segurar e soltar: +1 de força pagando +1 de fôlego (o Fato não carrega)', () => {
    expect([bonusDaCarga(0), bonusDaCarga(0.6), bonusDaCarga(1)]).toEqual([0, 0, 1]);
    const s = jogar(base(), 'frase', 1);
    expect(s.tropas[0]).toMatchObject({ forca: 3, carregada: true });
    expect(s.eu.folego).toBe(17);
    expect(jogar(base(), 'fato', 1).tropas[0]!.forca).toBe(1);
  });

  it('Exemplos: são dois pequenos', () => {
    const s = jogar(base(), 'exemplos');
    expect(s.tropas.filter((t) => t.tipo === 'exemplo')).toHaveLength(2);
  });

  it('Analogia pula a primeira tropa inimiga', () => {
    let s = { ...jogar(base(), 'analogia'), tropas: [] as Tropa[] };
    s = jogar({ ...s, tropas: [tropa('rival', 40, 5, 'barricada', { someEm: 99_000 })] }, 'analogia');
    s = avancar(s, 1500);
    const cavaleiro = s.tropas.find((t) => t.tipo === 'cavaleiro');
    expect(cavaleiro?.x).toBeGreaterThan(40);
    expect(cavaleiro?.pulou).toBe(true);
    expect(s.tropas.find((t) => t.tipo === 'barricada')?.forca).toBe(5);
  });

  it('Piada faz o inimigo parar de tanto rir', () => {
    let s = { ...base(), tropas: [tropa('eu', 50, 1, 'bobo'), tropa('rival', 53, 3)] };
    s = passo(s, ctx);
    expect(s.tropas.find((t) => t.de === 'rival')!.paradaAte).toBeGreaterThan(s.tempo);
  });

  it('Tese é firme: flecha tira só metade', () => {
    let s = { ...base(), tropas: [tropa('eu', 50, 4, 'centuriao'), tropa('rival', 70, 1, 'arqueiro')] };
    s = avancar(s, 2100);
    expect(s.tropas.find((t) => t.tipo === 'centuriao')!.forca).toBeCloseTo(3);
  });

  it('Citação de autoridade: tropa perto do Senador bate mais forte', () => {
    let s = { ...base(), tropas: [tropa('eu', 45, 3, 'senador'), tropa('eu', 50, 2), tropa('rival', 53, 5, 'barricada', { someEm: 99_000 })] };
    s = passo(s, ctx);
    expect(s.tropas.find((t) => t.tipo === 'barricada')!.forca).toBe(3);
  });

  it('Contra-argumento devolve 1 a cada golpe', () => {
    let s = { ...base(), tropas: [tropa('rival', 75, 3, 'escudeiro'), tropa('eu', 72, 2)] };
    s = passo(s, ctx);
    expect(s.tropas.find((t) => t.tipo === 'escudeiro')!.forca).toBe(2);
    expect(s.tropas.some((t) => t.de === 'eu')).toBe(false);
  });

  it('Estatística: no máximo 1, some em 10 s', () => {
    let s = comMao(base(), 'eu', ['estatistica', 'estatistica'], 20);
    s = jogarCarta(s, 'eu', 'eu0');
    expect(jogarCarta(s, 'eu', 'eu1')).toBe(s);
    s = avancar(s, 10_100);
    expect(s.tropas.some((t) => t.tipo === 'balista')).toBe(false);
  });

  it('Prova (catapulta) para de longe e só ataca a Tribuna', () => {
    let s = jogar(base(), 'prova');
    s = avancar(s, 7500);
    expect(s.tribunas.rival).toBe(TRIBUNA_VIDA - 2);
    expect(s.tropas.find((t) => t.tipo === 'catapulta')!.x).toBeCloseTo(40, 0);
  });

  it('Muralha de lógica não ataca e some em 12 s', () => {
    let s = jogar(base(), 'muralha');
    expect(s.tropas[0]).toMatchObject({ tipo: 'barricada', x: 30 });
    s = avancar(s, 12_100);
    expect(s.tropas).toHaveLength(0);
  });

  it('Refutação tira 2 da tropa inimiga mais perto; Pergunta retórica tira 1 do grupo', () => {
    let s = { ...base(), tropas: [tropa('rival', 30, 3), tropa('rival', 34, 2), tropa('rival', 60, 2)] };
    s = jogar(s, 'refutacao');
    expect(s.tropas.map((t) => t.forca)).toEqual([1, 2, 2]);
    s = jogar(s, 'pergunta');
    expect(s.tropas.map((t) => t.forca)).toEqual([1, 2]);
  });

  it('Pausa dramática congela os inimigos; Aplauso acelera os seus', () => {
    let s = { ...base(), tropas: [tropa('rival', 60, 2), tropa('eu', 30, 2)] };
    s = jogar(s, 'pausa');
    const antes = s.tropas.find((t) => t.de === 'rival')!.x;
    s = avancar(s, 1000);
    expect(s.tropas.find((t) => t.de === 'rival')!.x).toBe(antes);
    s = jogar(s, 'aplauso');
    expect(s.tropas.find((t) => t.de === 'eu')!.rapidaAte).toBeGreaterThan(s.tempo);
  });

  it('Discurso épico empolga: com o elefante vivo, o fôlego volta mais rápido', () => {
    const s = { ...base(), tropas: [tropa('eu', 30, 8, 'elefante')] };
    expect(ritmoDoFolego(s, 'eu')).toBeCloseTo(FOLEGO_POR_SEGUNDO * 1.3);
    expect(ritmoDoFolego(s, 'rival')).toBeCloseTo(FOLEGO_POR_SEGUNDO);
  });
});

describe('duelo v7: gladiador, habilidades e Tribuna', () => {
  it('toque no gladiador: golpe na hora e depois recarga', () => {
    let s = { ...base(), tropas: [tropa('rival', 30, 3)] };
    s = golpeDoGladiador(s, 'eu');
    expect(s.tropas[0]!.forca).toBe(2);
    expect(golpeDoGladiador(s, 'eu')).toBe(s);
  });

  it('Escudo (Claude), Carta grátis (ChatGPT) e Raio (Gemini)', () => {
    let s = usarHabilidade({ ...base(), eu: { ...base().eu, carga: 4 } }, 'eu', 'claude');
    s = avancar({ ...s, tropas: [tropa('rival', 20.5, 3)] }, 300);
    expect(s.tribunas.eu).toBe(TRIBUNA_VIDA);
    expect(s.eu.escudo).toBe(1);

    let g = comMao(base(), 'eu', ['tese', 'tese']);
    g = usarHabilidade({ ...g, eu: { ...g.eu, carga: 4 } }, 'eu', 'chatgpt');
    g = jogarCarta(g, 'eu', 'eu0');
    expect(g.eu.folego).toBe(10);

    let r = { ...base(), tropas: [tropa('rival', 40, 4), tropa('rival', 70, 4)] };
    r = usarHabilidade({ ...r, eu: { ...r.eu, carga: 4 } }, 'eu', 'gemini');
    expect(r.tropas.map((t) => t.forca)).toEqual([1, 4]);
  });

  it('Tribuna no chão: fim na hora', () => {
    let s = { ...base(), tribunas: { eu: TRIBUNA_VIDA, rival: 1 }, tropas: [tropa('eu', 79.5, 3)] };
    s = passo(s, ctx);
    expect(s.fase).toBe('fim');
    expect(resultadoFinal(s)).toBe('vitoria');
  });

  it('rodadas de 1:30, 1:30 e a final de 30 s; empate na vida vai para a prorrogação', () => {
    expect([...DURACOES_MS]).toEqual([90_000, 90_000, 30_000]);
    let s = { ...base(), tribunas: { eu: 20, rival: 20 } };
    s = passo({ ...s, tempo: 90_000 - TICK }, ctx);
    expect(s.fase).toBe('intervalo');
    s = avancar(s, INTERVALO_MS + TICK);
    expect(s).toMatchObject({ fase: 'luta', rodada: 2, tribunas: { eu: 20, rival: 20 } });
    s = passo({ ...s, rodada: 3, tempo: 30_000 - TICK, proximoRival: SEM_RIVAL }, ctx);
    expect(s.fase).toBe('intervalo');
    s = avancar(s, INTERVALO_MS + TICK);
    expect(s.rodada).toBe(4);
    s = passo({ ...s, tempo: PRORROGACAO_MS - TICK, proximoRival: SEM_RIVAL }, ctx);
    expect(s.fase).toBe('fim');
    expect(resultadoFinal(s)).toBe('empate');
  });
});
