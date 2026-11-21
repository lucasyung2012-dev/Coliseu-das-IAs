import { DILEMAS } from '@/game/tribunal/dilemas';
import { avancar, ponteiro, veredito } from '@/game/tribunal/motor';
import { escolher, espelhar, habilidadeDoLado, novaPartidaOnline, podeEscolher, tempoEsgotado } from '@/game/tribunal/online';

const fixo = () => 0.3;
const jurados = ['logico', 'cetico', 'empatico', 'tradicionalista', 'estrategista'] as const;
const nova = (ia: 'claude' | 'chatgpt' | 'gemini' = 'claude', rival: 'claude' | 'chatgpt' | 'gemini' = 'gemini') =>
  novaPartidaOnline({ ia, rival, jurados: [...jurados], dilema: DILEMAS[0]!, lado: 'favor' }, fixo);

describe('Tribunal online (duas pessoas)', () => {
  it('ninguém escolhe sozinho: a rodada só se resolve quando os dois escolhem', () => {
    let e = nova();
    expect(e.doisHumanos).toBe(true);
    expect(e.cartaRival).toBeNull();
    e = escolher(e, 'jogador', e.mao[0]!.id);
    expect(e.fase).toBe('escolha');
    expect(podeEscolher(e, 'jogador')).toBe(false);
    e = escolher(e, 'rival', e.maoRival[1]!.id);
    expect(e.fase).toBe('revelacao');
    expect(e.rodadas[0]!.cartaJogador.id).toBe(e.mao[0]!.id);
    expect(e.rodadas[0]!.cartaRival.id).toBe(e.maoRival[1]!.id);
  });

  it('espelhar troca os lados e espelhar duas vezes volta ao original', () => {
    let e = escolher(escolher(nova(), 'jogador', nova().mao[0]!.id), 'rival', nova().maoRival[0]!.id);
    const v = espelhar(e);
    expect(v.ia).toBe('gemini');
    expect(v.ladoJogador).toBe('contra');
    for (const j of jurados) expect(ponteiro(v, j)).toBe(ponteiro(e, j) === 0 ? 0 : -ponteiro(e, j));
    expect(veredito(v).jogador).toBe(veredito(e).rival);
    expect(espelhar(v)).toEqual(e);
    e = avancar(e, fixo);
    expect(e.tempo).toBe(1);
    expect(e.escolhaJogador).toBeNull();
  });

  it('Visão (Helios) online: quem usou espera o outro escolher', () => {
    let e = nova('claude', 'gemini');
    e = habilidadeDoLado(e, 'rival', { tipo: 'visao' });
    expect(e.visaoRival).toBe(true);
    expect(podeEscolher(e, 'rival')).toBe(false);
    e = escolher(e, 'jogador', e.mao[2]!.id);
    expect(podeEscolher(e, 'rival')).toBe(true);
    // Do lado do Helios, a carta escolhida pelo outro aparece.
    expect(espelhar(e).escolhaRival).toBe(e.mao[2]!.id);
  });

  it('Diplomacia e Improviso funcionam para o rival (pessoa)', () => {
    let e = nova('gemini', 'chatgpt');
    const antes = e.maoRival.map((c) => c.id);
    e = habilidadeDoLado(e, 'rival', { tipo: 'improviso', cartaId: antes[0]! });
    expect(e.habilidadeRivalUsada).toBe(true);
    expect(e.maoRival.map((c) => c.id)).not.toContain(antes[0]);
  });

  it('tempo esgotado: o tribunal escolhe por quem não escolheu e resolve', () => {
    let e = nova();
    e = escolher(e, 'jogador', e.mao[0]!.id);
    e = tempoEsgotado(e, fixo);
    expect(e.fase).toBe('revelacao');
    expect(e.rodadas[0]!.automatica).toBe(true);
  });
});
