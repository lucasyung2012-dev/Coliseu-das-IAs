import { ladrilhoEm, livre, marcarVisto, novoMundo, passoMundo, pertoDe, saidaAbertaMundo, type EntradaMundo } from '@/game/historia/mundo';
import { MUNDOS } from '@/game/historia/mundos';
import { CAPITULOS } from '@/game/historia/roteiro';

/** O mundo visto de cima (22/11/2026): andar livre, paredes, interagir e a saída. */
const nada: EntradaMundo = { cima: false, baixo: false, esq: false, dir: false };
const m = MUNDOS['biblioteca-noite']!;

describe('o mundo visto de cima', () => {
  it('o mapa é um retângulo, o começo é livre e a saída existe', () => {
    const largura = m.mapa[0]!.length;
    for (const linha of m.mapa) expect(linha.length).toBe(largura);
    const s = novoMundo(m);
    expect(livre(m, s.x, s.y)).toBe(true);
    expect(m.mapa.some((l) => l.includes('P'))).toBe(true);
  });

  it('a rota de cada pessoa só passa por chão', () => {
    for (const p of m.pessoas) {
      for (const [x, y] of p.rota) expect(livre(m, x + 0.5, y + 0.8), `${p.id} em ${x},${y}`).toBe(true);
    }
  });

  it('anda e as paredes seguram (desliza encostado)', () => {
    let s = novoMundo(m);
    const x0 = s.x;
    for (let k = 0; k < 20; k++) s = passoMundo(m, s, { ...nada, dir: true }, 50);
    expect(s.x).toBeGreaterThan(x0 + 2);
    expect(s.dir).toBe('dir');
    // Para baixo até a parede: não atravessa.
    for (let k = 0; k < 80; k++) s = passoMundo(m, s, { ...nada, baixo: true }, 50);
    // Os pés param na beirada da parede de baixo (linha 14), sem entrar nela.
    expect(ladrilhoEm(m, s.x, s.y - 0.05)).not.toBe('#');
    expect(s.y).toBeLessThan(14.05);
    expect(livre(m, s.x, s.y)).toBe(true);
  });

  it('durante a conversa ninguém anda', () => {
    const s = novoMundo(m);
    const r = passoMundo(m, s, { ...nada, dir: true }, 200, true);
    expect(r.x).toBe(s.x);
  });

  it('acha a coisa na frente do gladiador', () => {
    // Em pé embaixo da estante (7, 11), olhando para cima.
    const s = { ...novoMundo(m), x: 7.5, y: 12.8, dir: 'cima' as const };
    const alvo = pertoDe(m, s);
    expect(alvo?.tipo === 'coisa' && alvo.c.id).toBe('estante');
  });

  it('a saída só abre depois de falar com a Lívia', () => {
    const s = novoMundo(m);
    expect(saidaAbertaMundo(m, s)).toBe(false);
    expect(saidaAbertaMundo(m, marcarVisto(s, 'livia'))).toBe(true);
    // Na escada, com a Lívia vista: acaba.
    const naSaida = { ...marcarVisto(s, 'livia'), x: 22.5, y: 13.8 };
    expect(passoMundo(m, naSaida, nada, 20).fim).toBe(true);
    expect(passoMundo(m, { ...s, x: 22.5, y: 13.8 }, nada, 20).fim).toBe(false);
  });

  it('está no capítulo 1 do Cassius', () => {
    expect(CAPITULOS.claude[0]!.cenas.some((c) => c.tipo === 'mundo' && c.mundo === m.id)).toBe(true);
  });
});
