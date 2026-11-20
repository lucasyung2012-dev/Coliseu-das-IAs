import { coliseuEmUso, premiosDe, premiosNovos } from '@/game/coliseu';
import { PARADAS } from '@/game/mapa';
import { IAS } from '@/game/personagens';
import { coliseuDe, escolherPremio, obterProgresso, recordeDe, redefinirProgresso, registrarPartida, substituirProgresso } from '@/game/progresso';

describe('prêmios do mapa (o seu Coliseu vai crescendo)', () => {
  it('cada combatente tem um prêmio em cada uma das 13 paradas; as ligas mudam a arena', () => {
    for (const ia of IAS) {
      expect(premiosDe(ia).map((p) => p.trofeus)).toEqual(PARADAS.map((p) => p.trofeus));
      for (const pa of PARADAS) {
        const pr = premiosDe(ia).find((p) => p.trofeus === pa.trofeus)!;
        expect(pr.tipo === 'arena').toBe(!!pa.liga);
      }
    }
  });

  it('os prêmios de cada combatente são só dele (nomes, estandartes e comemorações diferentes)', () => {
    const nomes = IAS.flatMap((ia) => premiosDe(ia).map((p) => p.nome));
    expect(new Set(nomes).size).toBe(39);
    const pequenos = IAS.flatMap((ia) => premiosDe(ia).filter((p) => p.tipo !== 'arena').map((p) => p.id));
    expect(new Set(pequenos).size).toBe(24);
  });

  it('sem escolha, vale o mais novo de cada tipo; a escolha só vale se já foi ganha', () => {
    expect(coliseuEmUso('claude', 0)).toEqual({ arena: 'madeira', estandarte: 'nenhum', comemoracao: 'nenhuma' });
    expect(coliseuEmUso('claude', 1200)).toEqual({ arena: 'pedra', estandarte: 'balanca', comemoracao: 'pergaminho' });
    expect(coliseuEmUso('chatgpt', 1200)).toEqual({ arena: 'pedra', estandarte: 'navio', comemoracao: 'bandeiras' });
    expect(coliseuEmUso('gemini', 1200, { arena: 'madeira', estandarte: 'estrela' })).toMatchObject({ arena: 'madeira', estandarte: 'estrela' });
    // Prêmio de outro combatente ou ainda não ganho não vale.
    expect(coliseuEmUso('gemini', 1200, { estandarte: 'coruja' }).estandarte).toBe('lua');
    expect(coliseuEmUso('gemini', 1200, { arena: 'imperial' }).arena).toBe('pedra');
  });

  it('premiosNovos lista só o que foi ganho entre os dois recordes', () => {
    expect(premiosNovos('claude', 90, 260).map((p) => p.id)).toEqual(['coruja', 'folhas']);
    expect(premiosNovos('gemini', 500, 500)).toEqual([]);
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
      escolherPremio('claude', 'estandarte', 'coruja');
      escolherPremio('claude', 'arena', 'madeira');
      expect(coliseuDe(obterProgresso(), 'claude').arena).toBe('madeira');
      registrarPartida({ modo: 'tribunal', ia: 'claude', rival: 'gemini', venceu: true, dilema: 'x' });
      const v = coliseuDe(obterProgresso(), 'claude');
      expect(v.arena).toBe('pedra');
      expect(v.estandarte).toBe('coruja');
    });
  });
});
