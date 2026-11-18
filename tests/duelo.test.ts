import {
  esquivar,
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
// acerto 0: o rival nunca reage aos golpes (os testes controlam tudo).
const ctx = { acerto: 0, iaRival: 'chatgpt' as const, aleatorio: sempre(0.5) };

/** Duelo sem ataques automáticos do rival e sem eventos da arena. */
function base(): EstadoDuelo {
  const s = novoDuelo(['frase a'], ['frase b'], sempre(0.5));
  return { ...s, proximoEvento: Number.POSITIVE_INFINITY, proximoRival: Number.POSITIVE_INFINITY };
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

describe('duelo v2: motor', () => {
  it('monta um monte de 19 cartas com uma de cada rara', () => {
    const monte = montarMonte(['a', 'b'], 'eu', sempre(0.3));
    expect(monte).toHaveLength(19);
    const conta = (t: TipoCarta) => monte.filter((c) => c.tipo === t).length;
    expect([conta('argumento'), conta('forte'), conta('escudo'), conta('replica')]).toEqual([6, 3, 4, 3]);
    expect([conta('capciosa'), conta('dado'), conta('apelo')]).toEqual([1, 1, 1]);
  });

  it('argumento que acerta puxa a plateia e dá aplauso; gasta fôlego', () => {
    let s = comMao(base(), 'eu', ['argumento']);
    s = jogarCarta(s, 'eu', 'eu0', 'alto');
    expect(s.eu.folego).toBe(8);
    s = avancar(s, 1400);
    expect(s.plateia).toBe(2);
    expect(s.eu.aplausos).toBe(1);
  });

  it('sem fôlego não joga', () => {
    let s = comMao(base(), 'eu', ['forte']);
    s = { ...s, eu: { ...s.eu, folego: 3 } };
    expect(jogarCarta(s, 'eu', 'eu0', 'alto')).toBe(s);
  });

  it('pular desvia do golpe baixo; abaixar não', () => {
    const golpe = jogarCarta(comMao(base(), 'rival', ['argumento']), 'rival', 'rival0', 'baixo');
    const pulou = avancar(esquivar(avancar(golpe, 800), 'eu', 'pular'), 700);
    expect(pulou.plateia).toBe(0);
    const abaixou = avancar(esquivar(avancar(golpe, 800), 'eu', 'abaixar'), 700);
    expect(abaixou.plateia).toBe(-2);
  });

  it('escudo bloqueia na altura certa; o dado irrefutável atravessa', () => {
    const comEscudo = (altura: 'alto' | 'baixo') => jogarCarta(comMao(base(), 'eu', ['escudo']), 'eu', 'eu0', altura);
    const ataque = (s: EstadoDuelo, tipo: TipoCarta, ms: number) => avancar(jogarCarta(comMao(s, 'rival', [tipo]), 'rival', 'rival0', 'alto'), ms);
    expect(ataque(comEscudo('alto'), 'argumento', 1400).plateia).toBe(0);
    expect(ataque(comEscudo('baixo'), 'argumento', 1400).plateia).toBe(-2);
    expect(ataque(comEscudo('alto'), 'dado', 1600).plateia).toBe(-3);
  });

  it('combo contra-ataque perfeito: atacar logo depois de bloquear vale o dobro', () => {
    let s = jogarCarta(comMao(base(), 'eu', ['escudo', 'argumento']), 'eu', 'eu0', 'alto');
    s = avancar(jogarCarta(comMao(s, 'rival', ['argumento']), 'rival', 'rival0', 'alto'), 1400);
    expect(s.plateia).toBe(0);
    s = avancar(jogarCarta(s, 'eu', 'eu1', 'baixo'), 1400);
    expect(s.plateia).toBe(4);
  });

  it('combo retórica em cadeia: o forte voa duas vezes mais rápido', () => {
    let s = comMao(base(), 'eu', ['argumento', 'argumento', 'forte']);
    s = jogarCarta(s, 'eu', 'eu0', 'alto');
    s = jogarCarta(s, 'eu', 'eu1', 'alto');
    s = jogarCarta(s, 'eu', 'eu2', 'alto');
    const forte = s.projeteis.find((p) => p.tipo === 'forte');
    expect(forte?.duracao).toBe(1100);
    expect(s.avisos.some((a) => a.texto.includes('RETÓRICA'))).toBe(true);
  });

  it('réplica só funciona no fim do voo e devolve o golpe +1', () => {
    let s = jogarCarta(comMao(base(), 'rival', ['argumento']), 'rival', 'rival0', 'alto');
    s = comMao(s, 'eu', ['replica', 'replica']);
    s = jogarCarta(avancar(s, 400), 'eu', 'eu0');
    expect(s.projeteis.filter((p) => p.de === 'rival')).toHaveLength(1);
    s = jogarCarta(avancar(s, 500), 'eu', 'eu1');
    expect(s.projeteis.filter((p) => p.de === 'rival')).toHaveLength(0);
    expect(avancar(s, 1100).plateia).toBe(3);
  });

  it('pergunta capciosa deixa o rival tonto: ele não joga', () => {
    let s = jogarCarta(comMao(base(), 'eu', ['capciosa']), 'eu', 'eu0');
    s = comMao(s, 'rival', ['argumento']);
    expect(jogarCarta(s, 'rival', 'rival0', 'alto')).toBe(s);
  });

  it('golpe final só com 5 aplausos; o raio solar do Gemini ninguém bloqueia', () => {
    let s = base();
    expect(golpeFinal(s, 'eu', 'gemini')).toBe(s);
    s = { ...s, eu: { ...s.eu, aplausos: 5 } };
    s = jogarCarta(comMao(s, 'rival', ['escudo']), 'rival', 'rival0', 'alto');
    s = avancar(golpeFinal(s, 'eu', 'gemini'), 1100);
    expect(s.plateia).toBe(4);
    expect(s.eu.aplausos).toBe(1);
  });

  it('muralha do Claude: nada atinge por 5 s', () => {
    let s = base();
    s = golpeFinal({ ...s, eu: { ...s.eu, aplausos: 5 } }, 'eu', 'claude');
    s = avancar(jogarCarta(comMao(s, 'rival', ['forte']), 'rival', 'rival0', 'baixo'), 2300);
    expect(s.plateia).toBe(0);
  });

  it('o leão tira 1 de quem não pulou', () => {
    let s = base();
    s = { ...s, evento: { tipo: 'leao', ate: 5000, impactoEm: 200 } };
    s = avancar(esquivar(s, 'eu', 'pular'), 300);
    expect(s.plateia).toBe(1);
  });

  it('melhor de 3: rodada acaba na plateia toda, tem intervalo e termina com 2 vitórias', () => {
    let s = comMao(base(), 'eu', ['forte']);
    s = avancar(jogarCarta({ ...s, plateia: 8 }, 'eu', 'eu0', 'alto'), 2300);
    expect(s.fase).toBe('intervalo');
    expect(s.rodadas).toEqual({ eu: 1, rival: 0 });
    s = avancar(s, INTERVALO_MS + TICK);
    expect(s.fase).toBe('luta');
    expect(s.rodada).toBe(2);
    expect(s.plateia).toBe(0);
    // Segunda rodada no fim do tempo, com vantagem sua.
    s = passo({ ...s, tempo: RODADA_MS - TICK, plateia: 1, projeteis: [] }, ctx);
    expect(s.fase).toBe('fim');
    expect(resultadoFinal(s)).toBe('vitoria');
  });
});
