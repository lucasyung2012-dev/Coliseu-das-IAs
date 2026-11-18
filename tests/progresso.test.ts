import { ligaDe, proximaLiga, variacaoTrofeus } from '@/game/ligas';
import { nivelMaestria, redefinirProgresso, registrarPartida } from '@/game/progresso';

describe('ligas', () => {
  it('encontra a liga pela faixa de troféus', () => {
    expect(ligaDe(0).nome).toBe('Recrutas');
    expect(ligaDe(499).nome).toBe('Recrutas');
    expect(ligaDe(500).nome).toBe('Gladiadores');
    expect(ligaDe(7000).nome).toBe('Imperadores');
  });

  it('usa a tabela de troféus de cada modo e liga', () => {
    expect(variacaoTrofeus('tribunal', 0, true)).toBe(40);
    expect(variacaoTrofeus('duelo', 600, false)).toBe(-5);
    expect(variacaoTrofeus('tribunal', 8000, false)).toBe(-30);
  });

  it('não deixa os troféus ficarem negativos', () => {
    expect(variacaoTrofeus('tribunal', 3, false)).toBe(-3);
    expect(Object.is(variacaoTrofeus('duelo', 0, false), 0)).toBe(true);
  });

  it('calcula quanto falta para a próxima liga', () => {
    expect(proximaLiga(400)).toMatchObject({ faltam: 100, progresso: 0.8 });
    expect(proximaLiga(9000)).toBeNull();
  });
});

describe('progresso', () => {
  beforeEach(() => {
    localStorage.clear();
    redefinirProgresso();
  });

  it('registra a partida, soma troféus e XP e guarda no aparelho', () => {
    const pt = registrarPartida({ modo: 'tribunal', ia: 'gemini', rival: 'claude', venceu: true, dilema: 'teste' });
    expect(pt.trofeus).toBe(40);
    expect(pt.xp).toBe(40);
    const salvo = JSON.parse(localStorage.getItem('coliseu.progresso.v1')!);
    expect(salvo.trofeus.gemini).toBe(40);
    expect(salvo.partidas).toHaveLength(1);
  });

  it('calcula o nível de Maestria', () => {
    expect(nivelMaestria(0)).toBe(1);
    expect(nivelMaestria(250)).toBe(3);
    expect(nivelMaestria(1_000_000)).toBe(100);
  });
});

describe('estatísticas do perfil', () => {
  beforeEach(() => {
    localStorage.clear();
    redefinirProgresso();
  });

  it('conta vitórias, derrotas e empates por modo e a melhor sequência; treino não conta', () => {
    const base = { ia: 'claude' as const, rival: 'gemini' as const, dilema: 'x' };
    registrarPartida({ ...base, modo: 'tribunal', venceu: true });
    registrarPartida({ ...base, modo: 'tribunal', venceu: true });
    registrarPartida({ ...base, modo: 'duelo', venceu: false, empate: true });
    registrarPartida({ ...base, modo: 'tribunal', venceu: false });
    registrarPartida({ ...base, modo: 'tribunal', venceu: true, treino: true });
    const e = JSON.parse(localStorage.getItem('coliseu.progresso.v1')!).estatisticas.claude;
    expect(e.tribunal).toEqual({ vitorias: 2, derrotas: 1, empates: 0 });
    expect(e.duelo).toEqual({ vitorias: 0, derrotas: 0, empates: 1 });
    expect(e.sequencia).toBe(0);
    expect(e.melhorSequencia).toBe(2);
  });
});
