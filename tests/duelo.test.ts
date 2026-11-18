import {
  golpeFinal,
  INTERVALO_MS,
  jogarCarta,
  montarMonte,
  novoDuelo,
  passo,
  resultadoFinal,
  RODADA_MS,
  TICK,
  type EstadoDuelo,
  type Lado,
  type TipoCarta,
} from '@/game/duelo/motor';

const sempre = (v: number) => () => v;
// acerto 0: o rival nunca responde (os testes controlam tudo).
const ctx = { acerto: 0, iaRival: 'chatgpt' as const, aleatorio: sempre(0.5) };

/** Duelo sem ataques automáticos do rival. */
function base(): EstadoDuelo {
  return { ...novoDuelo(['frase a'], ['frase b'], sempre(0.5)), proximoRival: Number.POSITIVE_INFINITY };
}

function comMao(s: EstadoDuelo, lado: Lado, tipos: TipoCarta[]): EstadoDuelo {
  const l = { ...s[lado], folego: 10, mao: tipos.map((tipo, i) => ({ id: `${lado}${i}`, tipo, frase: 'f' })) };
  return lado === 'eu' ? { ...s, eu: l } : { ...s, rival: l };
}

function avancar(s: EstadoDuelo, ms: number): EstadoDuelo {
  let x = s;
  for (let t = 0; t < ms; t += TICK) x = passo(x, ctx);
  return x;
}

/** Os dois lançam ao mesmo tempo. */
function duelo(meu: TipoCarta, dele: TipoCarta): EstadoDuelo {
  let s = comMao(comMao(base(), 'eu', [meu]), 'rival', [dele]);
  s = jogarCarta(s, 'eu', 'eu0');
  return jogarCarta(s, 'rival', 'rival0');
}

describe('duelo v3: choque no ar', () => {
  it('monta um monte de 15 cartas: 8 argumentos, 4 fortes e 1 de cada rara', () => {
    const monte = montarMonte(['a', 'b'], 'eu', sempre(0.3));
    const conta = (t: TipoCarta) => monte.filter((c) => c.tipo === t).length;
    expect(monte).toHaveLength(15);
    expect([conta('argumento'), conta('forte'), conta('dado'), conta('capciosa'), conta('apelo')]).toEqual([8, 4, 1, 1, 1]);
  });

  it('golpe que chega puxa a plateia, dá aplauso e mostra a frase', () => {
    let s = jogarCarta(comMao(base(), 'eu', ['argumento']), 'eu', 'eu0');
    expect(s.eu.folego).toBe(8);
    expect(s.eu.fala?.texto).toBe('f');
    s = avancar(s, 2700);
    expect(s.plateia).toBe(2);
    expect(s.eu.aplausos).toBe(1);
  });

  it('sem fôlego não joga', () => {
    let s = comMao(base(), 'eu', ['forte']);
    s = { ...s, eu: { ...s.eu, folego: 3 } };
    expect(jogarCarta(s, 'eu', 'eu0')).toBe(s);
  });

  it('força igual: os dois golpes somem no choque', () => {
    const s = avancar(duelo('argumento', 'argumento'), 1500);
    expect(s.projeteis).toHaveLength(0);
    expect(s.efeitos.some((x) => x.tipo === 'choque')).toBe(true);
    expect(avancar(s, 2000).plateia).toBe(0);
  });

  it('o mais forte passa com a força que sobrou', () => {
    const s = avancar(duelo('forte', 'argumento'), 3500);
    expect(s.plateia).toBe(2);
  });

  it('o dado irrefutável atravessa o golpe do rival', () => {
    const s = avancar(duelo('dado', 'argumento'), 3100);
    expect(s.plateia).toBe(3 - 2);
  });

  it('pergunta capciosa deixa o rival sem jogar', () => {
    const s = comMao(jogarCarta(comMao(base(), 'eu', ['capciosa']), 'eu', 'eu0'), 'rival', ['argumento']);
    expect(jogarCarta(s, 'rival', 'rival0')).toBe(s);
  });

  it('golpe final só com 5 aplausos; a Muralha do Claude apaga os golpes do rival', () => {
    let s = jogarCarta(comMao(base(), 'rival', ['forte']), 'rival', 'rival0');
    expect(golpeFinal(s, 'eu', 'claude')).toBe(s);
    s = golpeFinal({ ...s, eu: { ...s.eu, aplausos: 5 } }, 'eu', 'claude');
    expect(s.projeteis).toHaveLength(0);
    expect(s.eu.aplausos).toBe(0);
  });

  it('o Raio solar do Gemini atravessa tudo com força 5', () => {
    let s = jogarCarta(comMao(base(), 'rival', ['forte']), 'rival', 'rival0');
    s = avancar(golpeFinal({ ...s, eu: { ...s.eu, aplausos: 5 } }, 'eu', 'gemini'), 1700);
    expect(s.plateia).toBe(5);
  });

  it('melhor de 3: rodada acaba na plateia toda, tem intervalo e termina com 2 vitórias', () => {
    let s = comMao(base(), 'eu', ['forte']);
    s = avancar(jogarCarta({ ...s, plateia: 7 }, 'eu', 'eu0'), 3500);
    expect(s.fase).toBe('intervalo');
    expect(s.rodadas).toEqual({ eu: 1, rival: 0 });
    s = avancar(s, INTERVALO_MS + TICK);
    expect(s.fase).toBe('luta');
    expect(s.rodada).toBe(2);
    expect(s.plateia).toBe(0);
    s = passo({ ...s, tempo: RODADA_MS - TICK, plateia: 1, projeteis: [] }, ctx);
    expect(s.fase).toBe('fim');
    expect(resultadoFinal(s)).toBe('vitoria');
  });
});
