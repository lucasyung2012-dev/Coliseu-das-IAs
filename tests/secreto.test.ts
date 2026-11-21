import { INIMIGOS } from '@/game/historia/inimigos';
import { modoDaLuta, novaLuta, ATRIBUTOS_INICIAIS } from '@/game/historia/luta';
import { CAPITULOS, type PontoExplorar } from '@/game/historia/roteiro';
import { CAP_SECRETO, capitulosDoSave, chaveCompleta, equipeDoSecreto, PEDACOS_DA_CHAVE, saveCompleto } from '@/game/historia/roteiro4';
import { criarSave, criarSaveSecreto } from '@/game/historia/saves';
import { historiaEmUso, premiosHistoriaDe, saveTerminado, terminados } from '@/game/premiosHistoria';

/** O capítulo secreto, Os Três (pedido do Lucas, 21/11/2026): escondido, mas canônico. */
describe('o capítulo secreto', () => {
  it('cada final tem um pedaço da chave, que não é obrigatório', () => {
    const pontos = Object.values(CAPITULOS)
      .flat()
      .flatMap((cap) => cap.cenas.flatMap((c) => (c.tipo === 'explorar' ? c.pontos : [])))
      .filter((p: PontoExplorar) => p.segredo);
    expect(pontos.map((p) => p.segredo).sort()).toEqual(PEDACOS_DA_CHAVE.map((k) => k.id).sort());
    for (const p of pontos) expect(p.obrigatorio).toBeFalsy();
    // Cada pedaço está no último capítulo do caminho dele.
    for (const k of PEDACOS_DA_CHAVE) {
      const finalDoCaminho = CAPITULOS[k.caminho][CAPITULOS[k.caminho].length - 1]!;
      expect(finalDoCaminho.cenas.some((c) => c.tipo === 'explorar' && c.pontos.some((p) => p.segredo === k.id))).toBe(true);
    }
  });

  it('a grade só abre com os três pedaços', () => {
    expect(chaveCompleta(undefined)).toBe(false);
    expect(chaveCompleta(['chave-cassius', 'chave-octavius'])).toBe(false);
    expect(chaveCompleta(['chave-helios', 'chave-cassius', 'chave-octavius'])).toBe(true);
  });

  it('o save secreto tem um capítulo só e termina depois dele', () => {
    const s = criarSaveSecreto();
    expect(s.secreto).toBe(true);
    expect(capitulosDoSave(s)).toEqual([CAP_SECRETO]);
    expect(saveCompleto(s)).toBe(false);
    expect(saveCompleto({ ...s, capitulo: 2 })).toBe(true);
    expect(saveTerminado({ ...s, capitulo: 2 })).toBe(true);
    expect(saveCompleto({ ...criarSave('claude'), capitulo: 2 })).toBe(false);
  });

  it('nunca duas lutas seguidas, e todo inimigo existe', () => {
    CAP_SECRETO.cenas.forEach((c, k) => {
      if (c.tipo === 'luta') {
        expect(INIMIGOS[c.inimigo], c.inimigo).toBeDefined();
        if (k > 0) expect(CAP_SECRETO.cenas[k - 1]!.tipo, c.id).not.toBe('luta');
      }
    });
    expect(new Set(CAP_SECRETO.cenas.map((c) => c.id)).size).toBe(CAP_SECRETO.cenas.length);
  });

  it('tem o trio no Ludus (controlando os três) e termina no Coliseu Livre', () => {
    expect(CAP_SECRETO.cenas.some((c) => c.tipo === 'desafio' && c.desafio === 'trio')).toBe(true);
    const ultima = CAP_SECRETO.cenas[CAP_SECRETO.cenas.length - 1]!;
    expect(ultima.tipo === 'cutscene' && ultima.quadros.every((q) => q.lugar === 'coliseu-livre')).toBe(true);
  });

  it('o Núcleo muda de modo a cada fase: escudo, escuro e ilusões', () => {
    const s = novaLuta(INIMIGOS.nucleo!, ATRIBUTOS_INICIAIS);
    expect(modoDaLuta(s)).toEqual({ escudoGigante: true, escuro: false, ilusoes: false });
    expect(modoDaLuta({ ...s, inimigo: { ...s.inimigo, fase: 1 } })).toEqual({ escudoGigante: false, escuro: true, ilusoes: false });
    expect(modoDaLuta({ ...s, inimigo: { ...s.inimigo, fase: 2 } })).toEqual({ escudoGigante: false, escuro: false, ilusoes: true });
  });

  it('a equipe tem os três, e nenhum abaixo de um veterano', () => {
    const forte = { ...criarSave('chatgpt'), capitulo: 8, treinos: { vida: 8, forca: 5 } };
    const eq = equipeDoSecreto([forte]);
    expect(Object.keys(eq).sort()).toEqual(['cassius', 'helios', 'octavius']);
    expect(eq.octavius.vida).toBeGreaterThan(eq.cassius.vida);
    expect(eq.helios.tecnicas).toContain('espelho-de-sol');
    expect(eq.cassius.tecnicas).toContain('quebra-guarda');
  });
});

describe('prêmios da História no Arcade', () => {
  const cassiusFeito = { ...criarSave('claude'), capitulo: 8 };
  it('libera os do caminho terminado e só entra em uso com USAR', () => {
    expect(terminados([cassiusFeito, criarSave('chatgpt')])).toEqual(new Set(['claude']));
    expect(historiaEmUso('claude', [cassiusFeito])).toEqual({});
    expect(historiaEmUso('claude', [cassiusFeito], { arena: 'h-arena-claude', companheiro: 'h-comp-claude' })).toEqual({ arena: 'biblioteca-chamas', companheiro: 'paginas' });
  });
  it('não usa prêmio ainda trancado', () => {
    expect(historiaEmUso('chatgpt', [cassiusFeito], { companheiro: 'h-comp-chatgpt' })).toEqual({});
    expect(historiaEmUso('claude', [cassiusFeito], { titulo: 'h-titulo-tres' })).toEqual({});
  });
  it('o prêmio secreto vale para os três, com a moldura de ouro', () => {
    const segredo = { ...criarSaveSecreto(), capitulo: 2 };
    for (const ia of ['claude', 'chatgpt', 'gemini'] as const) {
      expect(premiosHistoriaDe(ia).filter((p) => p.requer === 'secreto')).toHaveLength(3);
      expect(historiaEmUso(ia, [segredo], { titulo: 'h-titulo-tres', comemoracao: 'h-comemora-tres', arena: 'h-arena-livre' })).toEqual({
        titulo: 'Os Três',
        molduraOuro: true,
        osTres: true,
        arena: 'coliseu-livre',
      });
    }
  });
});
