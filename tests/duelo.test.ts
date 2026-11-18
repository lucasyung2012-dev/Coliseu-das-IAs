import { choque, forca, jogadaDoRival, puxar, resultado, LIMITE } from '@/game/duelo/motor';
import type { Carta } from '@/game/tribunal/dilemas';

const carta = (temas: Carta['temas'], id = 'x'): Carta => ({ id, titulo: id, texto: '', temas });

describe('duelo em tempo real', () => {
  it('a força para o setor segue a tabela do Tribunal', () => {
    expect(forca(carta(['logica', 'viabilidade']), 'logico')).toBe(3);
    expect(forca(carta(['imagem', 'custo']), 'logico')).toBe(-1);
  });

  it('o argumento puxa o setor para quem lançou, com limite', () => {
    expect(puxar(0, 2, 'eu')).toBe(4);
    expect(puxar(0, 2, 'rival')).toBe(-4);
    expect(puxar(0, -1, 'eu')).toBe(-1.5);
    expect(puxar(9, 3, 'eu')).toBe(LIMITE);
  });

  it('no choque no ar passa o argumento mais forte para aquela plateia', () => {
    expect(choque(carta(['logica']), carta(['imagem']), 'logico')).toBe('eu');
    expect(choque(carta(['custo']), carta(['logica']), 'logico')).toBe('rival');
    expect(choque(carta(['custo']), carta(['pessoas']), 'logico')).toBe('empate');
  });

  it('ganha quem tem mais setores; empate em setores vai para a soma', () => {
    expect(resultado([{ lider: 'logico', valor: 3 }, { lider: 'cetico', valor: 1 }, { lider: 'artista', valor: -8 }])).toBe('vitoria');
    expect(resultado([{ lider: 'logico', valor: 3 }, { lider: 'cetico', valor: -1 }, { lider: 'artista', valor: 0 }])).toBe('vitoria');
    expect(resultado([{ lider: 'logico', valor: 0 }, { lider: 'cetico', valor: 0 }, { lider: 'artista', valor: 0 }])).toBe('empate');
  });

  it('o rival que acerta sempre escolhe a jogada mais forte', () => {
    const mao = [carta(['custo', 'imagem'], 'fraca'), carta(['logica', 'viabilidade'], 'forte')];
    const j = jogadaDoRival(mao, [{ lider: 'logico', valor: 0 }, { lider: 'artista', valor: 0 }, { lider: 'cetico', valor: 0 }], 1, () => 0);
    expect(j.carta.id).toBe('forte');
    expect(j.setor).toBe(0);
  });
});
