import { lerMensagem, mesmaConta, normalizarCodigo, novoCodigo, resultadoDe, VERSAO_ONLINE, type CartaoCombatente } from '@/game/duelo/online';
import { visualDoNivel } from '@/game/maestria';

const cartao = (conta: string | null, ia: CartaoCombatente['ia'] = 'claude'): CartaoCombatente => ({
  versao: VERSAO_ONLINE,
  ia,
  liga: 0,
  visual: visualDoNivel(1),
  imperador: false,
  coliseu: { arena: 'madeira', estandarte: 'nenhum', comemoracao: 'nenhuma' },
  baralho: ['frase', 'tese'],
  conta,
});

describe('Duelo online', () => {
  it('o código da sala é uma palavra e dois números, e aceita o que a pessoa digitar', () => {
    const c = novoCodigo(() => 0.5);
    expect(c).toMatch(/^[A-Z]+-\d{2}$/);
    expect(normalizarCodigo('leão 42')).toBe('LEAO-42');
    expect(normalizarCodigo('Leao-42')).toBe('LEAO-42');
    expect(normalizarCodigo(' coruja07 ')).toBe('CORUJA-07');
    expect(normalizarCodigo('42')).toBeNull();
    expect(normalizarCodigo('LEAO')).toBeNull();
  });

  it('a mesma conta dos dois lados não joga; sem conta sempre pode', () => {
    expect(mesmaConta(cartao('abc'), cartao('abc', 'gemini'))).toBe(true);
    expect(mesmaConta(cartao('abc'), cartao('xyz'))).toBe(false);
    expect(mesmaConta(cartao(null), cartao(null))).toBe(false);
  });

  it('o convidado vê o resultado ao contrário do juiz', () => {
    expect(resultadoDe('anfitriao', 'vitoria')).toBe('vitoria');
    expect(resultadoDe('convidado', 'vitoria')).toBe('derrota');
    expect(resultadoDe('convidado', 'derrota')).toBe('vitoria');
    expect(resultadoDe('convidado', 'empate')).toBe('empate');
  });

  it('só aceita mensagens conhecidas e cartões da mesma versão', () => {
    expect(lerMensagem({ t: 'ola', cartao: cartao(null) })).not.toBeNull();
    expect(lerMensagem({ t: 'ola', cartao: { ...cartao(null), versao: 999 } })).toBeNull();
    expect(lerMensagem({ t: 'ola', cartao: { ...cartao(null), ia: 'hal9000' } })).toBeNull();
    expect(lerMensagem({ t: 'acao', acao: { tipo: 'golpe' } })).not.toBeNull();
    expect(lerMensagem({ t: 'hackear' })).toBeNull();
    expect(lerMensagem('texto')).toBeNull();
  });
});
