import { GLADIADOR, LOUROS, MARTELO, gradeBusto, type Acessorio } from '@/ui/pixel/sprites';
import { sortearJurados, TODOS_JURADOS } from '@/game/jurados';
import { sortearRival } from '@/game/personagens';

const larguraUnica = (grade: string[]) => new Set(grade.map((l) => l.length)).size === 1;

describe('desenhos em pixel', () => {
  it('têm todas as linhas com a mesma largura', () => {
    expect(larguraUnica(GLADIADOR)).toBe(true);
    expect(larguraUnica(LOUROS)).toBe(true);
    expect(larguraUnica(MARTELO)).toBe(true);
    const acessorios: Acessorio[] = ['nenhum', 'oculos', 'louros', 'boina', 'chapeu', 'protetor'];
    for (const a of acessorios) expect(larguraUnica(gradeBusto(a))).toBe(true);
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
