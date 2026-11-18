import {
  bonusDaCarga,
  FOLEGO_POR_SEGUNDO,
  golpeDoGladiador,
  INTERVALO_MS,
  jogarCarta,
  montarMonte,
  novoDuelo,
  passo,
  PRORROGACAO_MS,
  resultadoFinal,
  RODADA_MS,
  TICK,
  TORRE_VIDA,
  usarHabilidade,
  type EstadoDuelo,
  type Lado,
  type TipoCarta,
  type Tropa,
} from '@/game/duelo/motor';

const sempre = (v: number) => () => v;
// acerto 0: o rival não usa o gladiador; proximoRival infinito: não joga sozinho.
const ctx = { acerto: 0, iaRival: 'chatgpt' as const, aleatorio: sempre(0.5) };
const SEM_RIVAL = Number.POSITIVE_INFINITY;

function base(): EstadoDuelo {
  return { ...novoDuelo(['frase a'], ['frase b'], sempre(0.5)), proximoRival: SEM_RIVAL };
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

describe('duelo v5: tropas contra a torre', () => {
  it('monte de 15 cartas, sem as cartas roubadas, com só 1 arqueiro', () => {
    const monte = montarMonte(['a'], 'eu', sempre(0.3));
    const conta = (t: TipoCarta) => monte.filter((c) => c.tipo === t).length;
    expect(monte).toHaveLength(15);
    expect([conta('argumento'), conta('forte'), conta('dado')]).toEqual([9, 5, 1]);
  });

  it('segurar e soltar: carga cheia dá só +1 e custa +1 de fôlego (o arqueiro não carrega)', () => {
    expect([bonusDaCarga(0), bonusDaCarga(0.6), bonusDaCarga(1)]).toEqual([0, 0, 1]);
    const s = comMao(base(), 'eu', ['argumento', 'dado'], 20);
    const depois = jogarCarta(s, 'eu', 'eu0', 1);
    expect(depois.tropas[0]).toMatchObject({ forca: 3, carregada: true });
    expect(depois.eu.folego).toBe(17);
    expect(jogarCarta(s, 'eu', 'eu1', 1).tropas[0]!.forca).toBe(1);
    // Sem fôlego sobrando para a carga, a tropa sai normal.
    expect(jogarCarta(comMao(base(), 'eu', ['argumento'], 2), 'eu', 'eu0', 1).tropas[0]!.forca).toBe(2);
  });

  it('o gladiador do rival tira 1 do legionário; ele chega e tira o resto da torre', () => {
    let s = jogarCarta(comMao(base(), 'eu', ['argumento']), 'eu', 'eu0');
    expect(s.eu.folego).toBe(8);
    s = avancar(s, 5500);
    expect(s.tropas).toHaveLength(0);
    expect(s.torres).toEqual({ eu: TORRE_VIDA, rival: TORRE_VIDA - 1 });
    expect(s.eu.carga).toBe(1);
  });

  it('tropas que se encontram lutam e a mais forte segue com o que sobrou', () => {
    let s = jogarCarta(comMao(base(), 'eu', ['forte']), 'eu', 'eu0');
    s = jogarCarta(comMao(s, 'rival', ['argumento']), 'rival', 'rival0');
    s = avancar(s, 4000);
    expect(s.tropas).toHaveLength(1);
    expect(s.tropas[0]).toMatchObject({ de: 'eu', forca: 2 });
    s = avancar(s, 7000);
    expect(s.torres.rival).toBe(TORRE_VIDA - 1);
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

  it('Claude (Escudo): bloqueia golpes que chegariam na torre', () => {
    let s = base();
    s = usarHabilidade({ ...s, eu: { ...s.eu, carga: 4 } }, 'eu', 'claude');
    expect(s.eu.escudo).toBe(2);
    s = avancar({ ...s, tropas: [tropa('rival', 20.5, 3)] }, 300);
    expect(s.torres.eu).toBe(TORRE_VIDA);
    expect(s.eu.escudo).toBe(1);
  });

  it('ChatGPT (Carta grátis): só a próxima carta sai de graça', () => {
    let s = comMao(base(), 'eu', ['forte', 'forte']);
    s = usarHabilidade({ ...s, eu: { ...s.eu, carga: 4 } }, 'eu', 'chatgpt');
    s = jogarCarta(s, 'eu', 'eu0');
    expect(s.eu.folego).toBe(10);
    s = jogarCarta(s, 'eu', 'eu1');
    expect(s.eu.folego).toBe(6);
  });

  it('Gemini (Raio): tira 3 da tropa inimiga mais perto, não limpa a arena', () => {
    let s = { ...base(), tropas: [tropa('rival', 40, 4, 1), tropa('rival', 70, 4, 2)] };
    s = usarHabilidade({ ...s, eu: { ...s.eu, carga: 4 } }, 'eu', 'gemini');
    expect(s.tropas.map((t) => t.forca)).toEqual([1, 4]);
  });

  it('habilidade só com a carga cheia', () => {
    const s = base();
    expect(usarHabilidade(s, 'eu', 'gemini')).toBe(s);
  });

  it('torre no chão: fim na hora', () => {
    let s = { ...base(), torres: { eu: TORRE_VIDA, rival: 1 }, tropas: [tropa('eu', 79.5, 3)] };
    s = passo(s, ctx);
    expect(s.fase).toBe('fim');
    expect(s.torres.rival).toBe(0);
    expect(resultadoFinal(s)).toBe('vitoria');
  });

  it('virada: na 3ª rodada, quem tem menos vida recupera fôlego 25% mais rápido', () => {
    let s = base();
    s = { ...s, rodada: 3, torres: { eu: 20, rival: 25 }, eu: { ...s.eu, folego: 0 }, rival: { ...s.rival, folego: 0 } };
    s = avancar(s, 1000);
    expect(s.eu.folego).toBeCloseTo(FOLEGO_POR_SEGUNDO * 1.25);
    expect(s.rival.folego).toBeCloseTo(FOLEGO_POR_SEGUNDO);
  });

  it('as torres guardam a vida entre as rodadas; no fim da 3ª, ganha quem tem mais vida', () => {
    let s = { ...base(), torres: { eu: 25, rival: 20 } };
    s = passo({ ...s, tempo: RODADA_MS - TICK }, ctx);
    expect(s.fase).toBe('intervalo');
    s = avancar(s, INTERVALO_MS + TICK);
    expect(s).toMatchObject({ fase: 'luta', rodada: 2, torres: { eu: 25, rival: 20 } });
    s = passo({ ...s, rodada: 3, tempo: RODADA_MS - TICK, proximoRival: SEM_RIVAL }, ctx);
    expect(s.fase).toBe('fim');
    expect(resultadoFinal(s)).toBe('vitoria');
  });

  it('empate na vida depois da 3ª rodada: prorrogação de 20 s com fôlego em dobro', () => {
    let s = { ...base(), rodada: 3, torres: { eu: 18, rival: 18 } };
    s = passo({ ...s, tempo: RODADA_MS - TICK }, ctx);
    expect(s.fase).toBe('intervalo');
    s = avancar(s, INTERVALO_MS + TICK);
    expect(s.rodada).toBe(4);
    s = { ...s, proximoRival: SEM_RIVAL, eu: { ...s.eu, folego: 0 } };
    s = avancar(s, 1000);
    expect(s.eu.folego).toBeCloseTo(FOLEGO_POR_SEGUNDO * 2);
    s = passo({ ...s, tempo: PRORROGACAO_MS - TICK }, ctx);
    expect(s.fase).toBe('fim');
    expect(resultadoFinal(s)).toBe('empate');
  });
});
