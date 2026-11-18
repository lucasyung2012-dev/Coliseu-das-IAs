import { GLADIADORES, JURADOS_PIXEL, LOUROS, MARTELO, PRETOR } from '@/ui/pixel/sprites';
import { desenhar } from '@/ui/pixel/desenho';
import { sortearJurados, TODOS_JURADOS } from '@/game/jurados';
import { sortearRival } from '@/game/personagens';

const larguraUnica = (grade: string[]) => new Set(grade.map((l) => l.length)).size === 1;

describe('pincel de pixel', () => {
  it('pinta o retângulo e traça o contorno em volta', () => {
    expect(desenhar(4, 4, [['C', 1, 1]], 0)).toEqual(['.K..', 'KCK.', '.K..', '....']);
  });
});

describe('desenhos em pixel', () => {
  it('têm todas as linhas com a mesma largura', () => {
    for (const g of [LOUROS, MARTELO, PRETOR, ...Object.values(GLADIADORES), ...Object.values(JURADOS_PIXEL)]) {
      expect(larguraUnica(g)).toBe(true);
    }
  });

  it('cada gladiador e cada jurado tem um desenho próprio', () => {
    const gladiadores = Object.values(GLADIADORES).map((g) => g.join('\n'));
    expect(new Set(gladiadores).size).toBe(3);
    const jurados = Object.values(JURADOS_PIXEL).map((g) => g.join('\n'));
    expect(new Set(jurados).size).toBe(8);
  });
});

describe('sorteios', () => {
  it('sorteia 5 jurados diferentes entre os 8', () => {
    expect(TODOS_JURADOS).toHaveLength(8);
    for (let i = 0; i < 20; i++) {
      const j = sortearJurados();
      expect(j).toHaveLength(5);
      expect(new Set(j).size).toBe(5);
    }
  });

  it('nunca sorteia a própria IA como rival', () => {
    for (let i = 0; i < 20; i++) expect(sortearRival('claude')).not.toBe('claude');
    expect(sortearRival('gemini', () => 0.99)).toBe('chatgpt');
  });
});
