import { juntarProgresso, progressoInicial, registrarPartida, redefinirProgresso, type Progresso } from '@/game/progresso';
import { contaConfigurada, modoRanqueado } from '@/game/conta';

const com = (over: Partial<Progresso>): Progresso => ({ ...progressoInicial(), ...over });

describe('juntar o progresso do aparelho com o da nuvem', () => {
  it('na primeira vez soma o melhor dos dois e une o histórico sem repetir', () => {
    const pt = (id: string, quando: string) => ({ id, quando, modo: 'tribunal' as const, ia: 'claude' as const, rival: 'gemini' as const, venceu: true, trofeus: 40, xp: 40, dilema: 'x' });
    const local = com({ trofeus: { claude: 100, chatgpt: 0, gemini: 5 }, xp: { claude: 10, chatgpt: 0, gemini: 0 }, partidas: [pt('a', '2026-11-18T10:00:00Z')], atualizadoEm: '2026-11-18T10:00:00Z' });
    const nuvem = com({ trofeus: { claude: 40, chatgpt: 80, gemini: 0 }, xp: { claude: 90, chatgpt: 0, gemini: 0 }, partidas: [pt('b', '2026-11-17T10:00:00Z'), pt('a', '2026-11-18T10:00:00Z')], atualizadoEm: '2026-11-17T10:00:00Z' });
    const j = juntarProgresso(local, nuvem, true);
    expect(j.trofeus).toEqual({ claude: 100, chatgpt: 80, gemini: 5 });
    expect(j.xp.claude).toBe(90);
    expect(j.partidas.map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('depois da primeira vez vale a cópia alterada por último (inclusive um progresso apagado)', () => {
    const velha = com({ trofeus: { claude: 500, chatgpt: 0, gemini: 0 }, atualizadoEm: '2026-11-17T10:00:00Z' });
    const apagada = com({ atualizadoEm: '2026-11-18T10:00:00Z' });
    expect(juntarProgresso(apagada, velha, false)).toBe(apagada);
    expect(juntarProgresso(velha, apagada, false)).toBe(apagada);
  });
});

describe('modo treino', () => {
  beforeEach(() => {
    localStorage.clear();
    redefinirProgresso();
  });

  it('partida de treino não dá troféus nem XP, mas entra no histórico', () => {
    const pt = registrarPartida({ modo: 'tribunal', ia: 'claude', rival: 'gemini', venceu: true, treino: true, dilema: 'x' });
    expect(pt.trofeus).toBe(0);
    expect(pt.xp).toBe(0);
    expect(pt.treino).toBe(true);
  });

  it('com a chave do Dropbox no jogo e sem conta conectada, as partidas são treino', () => {
    expect(contaConfigurada()).toBe(true);
    expect(modoRanqueado()).toBe(false);
  });
});
