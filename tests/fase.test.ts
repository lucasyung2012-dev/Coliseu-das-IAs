import { fogoAceso, GRAVIDADE, novaFase, passoFase, PULO, saidaAberta, type Entrada, type EstadoFase, type Fase } from '@/game/historia/fase';
import { FASES } from '@/game/historia/fases';
import { CAPITULOS } from '@/game/historia/roteiro';

/** A fase aberta (teste, 22/11/2026): andar, pular, subir na mesa, fogo, livros e saída. */
const nada: Entrada = { esq: false, dir: false, pular: false };
const direita: Entrada = { esq: false, dir: true, pular: false };
const pulo: Entrada = { esq: false, dir: false, pular: true };

function rodar(f: Fase, s0: EstadoFase, e: Entrada, ms: number): EstadoFase {
  let s = s0;
  for (let t = 0; t < ms; t += 20) s = passoFase(f, s, e, 20);
  return s;
}

const pequena: Fase = {
  id: 'teste',
  telas: ['biblioteca-salao', 'biblioteca-chamas'],
  objetivo: '',
  plataformas: [{ x: 30, w: 14, y: 8, tipo: 'mesa' }],
  perigos: [{ x: 60, w: 10, tipo: 'fogo', acesoMs: 0, apagadoMs: 0 }],
  coletaveis: [{ id: 'livro', x: 36, y: 10, icone: '', nome: 'Livro' }],
  comentarios: [{ id: 'oi', x: 20, quem: 'cassius', texto: 'Oi' }],
  saida: { x: 190, rotulo: 'SAÍDA' },
  precisa: 1,
};

describe('a fase aberta', () => {
  it('anda para a direita e para no fim do cenário', () => {
    const s = rodar(pequena, novaFase(), direita, 1000);
    expect(s.x).toBeGreaterThan(40);
    expect(s.dir).toBe(1);
    expect(rodar(pequena, s, { ...nada, esq: true }, 20000).x).toBe(3);
  });

  it('o pulo alcança a altura de uma mesa (e o gladiador volta para o chão)', () => {
    expect((PULO * PULO) / (2 * GRAVIDADE)).toBeGreaterThan(8);
    let s = passoFase(pequena, novaFase(), pulo, 20);
    expect(s.vy).toBeGreaterThan(0);
    s = rodar(pequena, s, nada, 2000);
    expect(s.y).toBe(0);
    expect(s.noChao).toBe(true);
  });

  it('cai em cima da mesa, pega o livro e o comentário fala sozinho', () => {
    let s: EstadoFase = { ...novaFase(), x: 34, y: 14, vy: 0, noChao: false };
    s = rodar(pequena, s, nada, 600);
    expect(s.y).toBe(8);
    expect(s.coletados).toContain('livro');
    const perto = rodar(pequena, { ...novaFase(), x: 18 }, nada, 40);
    expect(perto.falando?.id).toBe('oi');
  });

  it('encostar no fogo volta para o último lugar seguro', () => {
    let s = rodar(pequena, { ...novaFase(), x: 50 }, nada, 100);
    for (let k = 0; k < 100 && s.queimadas === 0; k++) s = passoFase(pequena, s, direita, 20);
    expect(s.queimadas).toBe(1);
    expect(s.x).toBeLessThan(60);
    expect(s.y).toBe(0);
  });

  it('depois de queimar, não dá para atravessar o fogo piscando (o bug do Lucas)', () => {
    let s = rodar(pequena, { ...novaFase(), x: 50 }, nada, 100);
    for (let k = 0; k < 100 && s.queimadas === 0; k++) s = passoFase(pequena, s, direita, 20);
    expect(s.queimadas).toBe(1);
    // Segurando para a direita o tempo todo: nunca passa do fogo (60 a 70).
    for (let k = 0; k < 150; k++) {
      s = passoFase(pequena, s, direita, 20);
      expect(s.x).toBeLessThan(70);
    }
  });

  it('a saída só abre com as coisas que precisa', () => {
    const sem = rodar(pequena, { ...novaFase(), x: 189 }, nada, 100);
    expect(sem.fim).toBe(false);
    const com = rodar(pequena, { ...novaFase(), x: 189, coletados: ['livro'] }, nada, 100);
    expect(saidaAberta(pequena, com)).toBe(true);
    expect(com.fim).toBe(true);
  });

  it('o fogo que pisca acende e apaga', () => {
    const p = { x: 0, w: 5, tipo: 'fogo' as const, acesoMs: 1000, apagadoMs: 500 };
    expect(fogoAceso(p, 200)).toBe(true);
    expect(fogoAceso(p, 1200)).toBe(false);
    expect(fogoAceso(p, 1600)).toBe(true);
  });
});

describe('a Biblioteca em chamas (capítulo 1 do Cassius)', () => {
  const f = FASES['biblioteca-em-chamas']!;
  it('está no capítulo 1 e dá para sair (livros suficientes, alcançáveis)', () => {
    expect(CAPITULOS.claude[0]!.cenas.some((c) => c.tipo === 'fase' && c.fase === f.id)).toBe(true);
    expect(f.coletaveis.length).toBeGreaterThanOrEqual(f.precisa);
    const alcance = (PULO * PULO) / (2 * GRAVIDADE);
    // Cada livro fica ao alcance de um pulo a partir do chão ou de alguma plataforma.
    for (const c of f.coletaveis) {
      const bases = [0, ...f.plataformas.filter((p) => c.x >= p.x - 4 && c.x <= p.x + p.w + 4).map((p) => p.y)];
      expect(bases.some((b) => c.y - b <= alcance + 2), c.id).toBe(true);
    }
    // Cada plataforma alta tem outra mais baixa (ou o chão) por perto para subir.
    for (const p of f.plataformas) {
      const degraus = [0, ...f.plataformas.filter((q) => q !== p && Math.abs(q.x + q.w / 2 - (p.x + p.w / 2)) < 30).map((q) => q.y)];
      expect(degraus.some((d) => d < p.y && p.y - d <= alcance), `plataforma em ${p.x}`).toBe(true);
    }
  });
});
