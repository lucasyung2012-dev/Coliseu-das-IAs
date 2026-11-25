import { NOMES_NOTA, notaDosPontos, pontosDaLuta } from '@/game/historia/notas';
import { criarSaveUnica, guardarNota } from '@/game/historia/saves';

/** As 7 notas da plateia (24/11/2026). */
describe('as notas da plateia', () => {
  it('são sete, do Silêncio ao Polegar do Imperador', () => {
    expect(NOMES_NOTA).toHaveLength(7);
    expect(NOMES_NOTA[0]).toBe('SILÊNCIO');
    expect(NOMES_NOTA[6]).toBe('O POLEGAR DO IMPERADOR');
  });
  it('a luta perfeita (vida cheia, rápida, defesas perfeitas, sem cair) é 7', () => {
    expect(notaDosPontos(pontosDaLuta({ vidaPct: 1, segundos: 40, perfeitas: 6, quedas: 0 }))).toBe(7);
  });
  it('vencer raspando, devagar, sem defesa perfeita e caindo muito é 1', () => {
    expect(notaDosPontos(pontosDaLuta({ vidaPct: 0.05, segundos: 200, perfeitas: 0, quedas: 3 }))).toBe(1);
  });
  it('quase perfeito (só um pouco de vida perdida) é 6', () => {
    expect(notaDosPontos(pontosDaLuta({ vidaPct: 0.8, segundos: 50, perfeitas: 5, quedas: 0 }))).toBe(6);
  });
  it('cada queda pesa na nota', () => {
    const base = { vidaPct: 0.7, segundos: 80, perfeitas: 3 };
    expect(pontosDaLuta({ ...base, quedas: 0 })).toBeGreaterThan(pontosDaLuta({ ...base, quedas: 1 }));
    expect(pontosDaLuta({ ...base, quedas: 1 })).toBeGreaterThan(pontosDaLuta({ ...base, quedas: 2 }));
  });
  it('o save guarda a melhor nota de cada chefão e marca que a explicação já foi vista', () => {
    let s = guardarNota(criarSaveUnica(), 'fornalha', 4);
    expect(s.notas).toEqual({ fornalha: 4 });
    expect(s.notaVista).toBe(true);
    s = guardarNota(s, 'fornalha', 2);
    expect(s.notas?.fornalha).toBe(4);
    s = guardarNota(s, 'fornalha', 6);
    expect(s.notas?.fornalha).toBe(6);
    expect(guardarNota(s, 'eclipse', undefined)).toBe(s);
  });
});
