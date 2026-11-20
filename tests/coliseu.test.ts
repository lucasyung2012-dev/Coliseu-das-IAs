import { coliseuEmUso, PREMIOS, premiosNovos } from '@/game/coliseu';
import { PARADAS } from '@/game/mapa';
import { coliseuDe, escolherPremio, obterProgresso, recordeDe, redefinirProgresso, registrarPartida, substituirProgresso } from '@/game/progresso';

describe('prêmios do mapa (o seu Coliseu vai crescendo)', () => {
  it('há um prêmio em cada uma das 13 paradas; as ligas mudam a arena', () => {
    expect(PREMIOS.map((p) => p.trofeus)).toEqual(PARADAS.map((p) => p.trofeus));
    for (const pa of PARADAS) {
      const pr = PREMIOS.find((p) => p.trofeus === pa.trofeus)!;
      expect(pr.tipo === 'arena').toBe(!!pa.liga);
    }
  });

  it('sem escolha, vale o mais novo de cada tipo; a escolha só vale se já foi ganha', () => {
    expect(coliseuEmUso(0)).toEqual({ arena: 'madeira', estandarte: 'nenhum', comemoracao: 'nenhuma' });
    expect(coliseuEmUso(1200)).toEqual({ arena: 'pedra', estandarte: 'leao', comemoracao: 'arma' });
    expect(coliseuEmUso(1200, { arena: 'madeira', estandarte: 'loba' })).toMatchObject({ arena: 'madeira', estandarte: 'loba' });
    expect(coliseuEmUso(1200, { arena: 'imperial' }).arena).toBe('pedra');
  });

  it('premiosNovos lista só o que foi ganho entre os dois recordes', () => {
    expect(premiosNovos(90, 260).map((p) => p.id)).toEqual(['loba', 'rosas']);
    expect(premiosNovos(500, 500)).toEqual([]);
  });

  describe('no progresso', () => {
    beforeEach(() => {
      localStorage.clear();
      redefinirProgresso();
    });

    it('cair de troféus não tira prêmio (vale o recorde); cada IA tem a sua linha', () => {
      substituirProgresso({ ...obterProgresso(), trofeus: { claude: 520, chatgpt: 0, gemini: 0 } });
      registrarPartida({ modo: 'tribunal', ia: 'claude', rival: 'gemini', venceu: false, dilema: 'x' });
      const p = obterProgresso();
      expect(p.trofeus.claude).toBeLessThan(520);
      expect(recordeDe(p, 'claude')).toBe(520);
      expect(coliseuDe(p, 'claude').arena).toBe('pedra');
      expect(coliseuDe(p, 'chatgpt').arena).toBe('madeira');
    });

    it('o prêmio novo entra sozinho, mesmo com outro escolhido antes', () => {
      substituirProgresso({ ...obterProgresso(), trofeus: { claude: 495, chatgpt: 0, gemini: 0 } });
      escolherPremio('claude', 'estandarte', 'loba');
      escolherPremio('claude', 'arena', 'madeira');
      expect(coliseuDe(obterProgresso(), 'claude').arena).toBe('madeira');
      registrarPartida({ modo: 'tribunal', ia: 'claude', rival: 'gemini', venceu: true, dilema: 'x' });
      const v = coliseuDe(obterProgresso(), 'claude');
      expect(v.arena).toBe('pedra');
      expect(v.estandarte).toBe('loba');
    });
  });
});
