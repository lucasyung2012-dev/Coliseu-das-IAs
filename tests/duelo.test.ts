import {
  bonusDaCarga,
  golpeDoGladiador,
  INTERVALO_MS,
  jogarCarta,
  montarMonte,
  novoDuelo,
  passo,
  resultadoFinal,
  RODADA_MS,
  TICK,
  usarHabilidade,
  type EstadoDuelo,
  type Lado,
  type TipoCarta,
  type Tropa,
} from '@/game/duelo/motor';

const sempre = (v: number) => () => v;
// acerto 0: o rival não joga sozinho nem usa o gladiador (os testes controlam tudo).
const ctx = { acerto: 0, iaRival: 'chatgpt' as const, aleatorio: sempre(0.5) };

function base(): EstadoDuelo {
  return { ...novoDuelo(['frase a'], ['frase b'], sempre(0.5)), proximoRival: Number.POSITIVE_INFINITY };
}

function comMao(s: EstadoDuelo, lado: Lado, tipos: TipoCarta[], folego = 10): EstadoDuelo {
  const l = { ...s[lado], folego, mao: tipos.map((tipo, i) => ({ id: `${lado}${i}`, tipo, frase: 'f' })) };
  return lado === 'eu' ? { ...s, eu: l } : { ...s, rival: l };
}

function tropa(de: Lado, x: number, forca: number, id = 900): Tropa {
  return { id, de, tipo: 'legionario', forca, forcaInicial: forca, x, carregada: false, proximoGolpe: 0 };
}

function avancar(s: EstadoDuelo, ms: number): EstadoDuelo {
  let x = s;
  for (let t = 0; t < ms; t += TICK) x = passo(x, ctx);
  return x;
}

describe('duelo v4: tropas de argumentos', () => {
  it('monte de 15 cartas com só 1 arqueiro', () => {
    const monte = montarMonte(['a'], 'eu', sempre(0.3));
    const conta = (t: TipoCarta) => monte.filter((c) => c.tipo === t).length;
    expect(monte).toHaveLength(15);
    expect([conta('argumento'), conta('forte'), conta('dado'), conta('capciosa'), conta('apelo')]).toEqual([8, 4, 1, 1, 1]);
  });

  it('segurar e soltar: metade da carga dá +1, carga cheia dá +2 (o arqueiro não ganha)', () => {
    expect([bonusDaCarga(0), bonusDaCarga(0.4), bonusDaCarga(0.5), bonusDaCarga(1)]).toEqual([0, 0, 1, 2]);
    const s = comMao(base(), 'eu', ['argumento', 'dado'], 20);
    const forte = jogarCarta(s, 'eu', 'eu0', 1).tropas[0]!;
    expect(forte.forca).toBe(4);
    expect(forte.carregada).toBe(true);
    expect(jogarCarta(s, 'eu', 'eu1', 1).tropas[0]!.forca).toBe(1);
  });

  it('o gladiador do rival tira 1 do legionário que chega: ele puxa a plateia com o que sobrou', () => {
    let s = jogarCarta(comMao(base(), 'eu', ['argumento']), 'eu', 'eu0');
    expect(s.eu.folego).toBe(8);
    s = avancar(s, 5500);
    expect(s.tropas).toHaveLength(0);
    expect(s.plateia).toBe(1);
    expect(s.eu.carga).toBe(1);
  });

  it('tropas que se encontram lutam e a mais forte segue com o que sobrou', () => {
    let s = jogarCarta(comMao(base(), 'eu', ['forte']), 'eu', 'eu0');
    s = jogarCarta(comMao(s, 'rival', ['argumento']), 'rival', 'rival0');
    s = avancar(s, 4000);
    expect(s.tropas).toHaveLength(1);
    expect(s.tropas[0]).toMatchObject({ de: 'eu', forca: 2 });
    s = avancar(s, 7000);
    expect(s.plateia).toBe(1);
  });

  it('no máximo 2 arqueiros seus em campo', () => {
    let s = comMao(base(), 'eu', ['dado', 'dado', 'dado'], 20);
    s = jogarCarta(jogarCarta(s, 'eu', 'eu0'), 'eu', 'eu1');
    expect(s.tropas).toHaveLength(2);
    expect(jogarCarta(s, 'eu', 'eu2')).toBe(s);
  });

  it('toque no gladiador: golpe na hora e depois recarga', () => {
    let s = { ...base(), tropas: [tropa('rival', 30, 3)] };
    s = golpeDoGladiador(s, 'eu');
    expect(s.tropas[0]!.forca).toBe(2);
    expect(golpeDoGladiador(s, 'eu')).toBe(s);
  });

  it('Claude (Ponderação): o escudo segura golpes que chegariam', () => {
    let s = base();
    s = usarHabilidade({ ...s, eu: { ...s.eu, carga: 4 } }, 'eu', 'claude');
    expect(s.eu.escudo).toBe(2);
    s = avancar({ ...s, tropas: [tropa('rival', 20.5, 3)] }, 300);
    expect(s.plateia).toBe(0);
    expect(s.eu.escudo).toBe(1);
  });

  it('ChatGPT (Improviso): só a próxima carta sai de graça', () => {
    let s = comMao(base(), 'eu', ['forte', 'forte']);
    s = usarHabilidade({ ...s, eu: { ...s.eu, carga: 4 } }, 'eu', 'chatgpt');
    s = jogarCarta(s, 'eu', 'eu0');
    expect(s.eu.folego).toBe(10);
    s = jogarCarta(s, 'eu', 'eu1');
    expect(s.eu.folego).toBe(6);
  });

  it('Gemini (Visão): o raio tira 3 da tropa inimiga mais perto, não limpa a arena', () => {
    let s = { ...base(), tropas: [tropa('rival', 40, 4, 1), tropa('rival', 70, 4, 2)] };
    s = usarHabilidade({ ...s, eu: { ...s.eu, carga: 4 } }, 'eu', 'gemini');
    expect(s.tropas.map((t) => t.forca)).toEqual([1, 4]);
  });

  it('habilidade só com a carga cheia', () => {
    const s = base();
    expect(usarHabilidade(s, 'eu', 'gemini')).toBe(s);
  });

  it('virada: nos últimos 30 s quem perde recupera fôlego 25% mais rápido', () => {
    let s = base();
    s = { ...s, tempo: 40_000, plateia: -2, eu: { ...s.eu, folego: 0 }, rival: { ...s.rival, folego: 0 } };
    s = avancar(s, 1000);
    expect(s.eu.folego).toBeCloseTo(1.25);
    expect(s.rival.folego).toBeCloseTo(1);
  });

  it('melhor de 3: rodada acaba na plateia toda, tem intervalo e termina com 2 vitórias', () => {
    let s = { ...base(), plateia: 9, tropas: [tropa('eu', 79.5, 2)] };
    s = passo(s, ctx);
    expect(s.fase).toBe('intervalo');
    expect(s.rodadas).toEqual({ eu: 1, rival: 0 });
    s = avancar(s, INTERVALO_MS + TICK);
    expect(s.fase).toBe('luta');
    expect(s.rodada).toBe(2);
    expect(s.plateia).toBe(0);
    s = passo({ ...s, tempo: RODADA_MS - TICK, plateia: 1, proximoRival: Number.POSITIVE_INFINITY }, ctx);
    expect(s.fase).toBe('fim');
    expect(resultadoFinal(s)).toBe('vitoria');
  });
});
