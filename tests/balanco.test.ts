import { INIMIGOS } from '@/game/historia/inimigos';
import { agir, ANIMO_MAX, ataqueAtual, ATRIBUTOS_INICIAIS, novaLuta, passoLuta, type AtributosLuta, type DefInimigo, type EstadoLuta } from '@/game/historia/luta';
import { CAPITULOS } from '@/game/historia/roteiro';

/**
 * Balanço das lutas da História (21/11/2026: o Lucas não conseguia vencer a Fornalha).
 * Um "bom jogador" robô reage no tempo certo (escudo no amarelo, esquiva no vermelho,
 * bate no ABERTO), mas erra uma defesa a cada cinco. Ele tem que vencer TODAS as lutas
 * com os atributos que o jogador teria naquele ponto da história. E quem só aperta
 * GOLPE sem parar tem que perder para os chefões.
 */
const meio = () => 0.5;

function bomJogador(def: DefInimigo, a: AtributosLuta, erraACada = 5): EstadoLuta {
  let s = novaLuta(def, a);
  let reagiuEm = -1;
  let defesas = 0;
  for (let t = 0; t < 8000 && !s.fim; t++) {
    s = passoLuta(s, a, meio);
    const i = s.inimigo;
    const j = s.jogador;
    const protegido = s.tempo < j.acaoAte && (j.acao === 'escudo' || j.acao === 'esquiva');
    if (i.estado === 'sinal') {
      if (reagiuEm !== i.estadoAte && s.tempo >= i.estadoAte - 200) {
        reagiuEm = i.estadoAte;
        if (protegido) continue;
        defesas++;
        if (defesas % erraACada === 0) continue;
        const at = ataqueAtual(s);
        s = agir(s, at.tipo === 'corpo' || at.tipo === 'finta' ? 'escudo' : 'esquiva', a);
      }
      continue;
    }
    if (i.estado === 'aberto' || i.estado === 'atordoado') {
      if (s.animo >= ANIMO_MAX) s = agir(s, 'especial', a);
      else if (j.folego >= 40) s = agir(s, 'golpe', a);
      continue;
    }
    // Na guarda: só quem sabe a QUEBRA-GUARDA bate (três seguidos).
    if (a.tecnicas?.includes('quebra-guarda') && j.folego >= 60 && s.tempo >= i.proximoEm - 2000) s = agir(s, 'golpe', a);
  }
  return s;
}

function soGolpe(def: DefInimigo, a: AtributosLuta): EstadoLuta {
  let s = novaLuta(def, a);
  for (let t = 0; t < 8000 && !s.fim; t++) {
    s = passoLuta(s, a, meio);
    s = agir(s, s.animo >= ANIMO_MAX ? 'especial' : 'golpe', a);
  }
  return s;
}

/** Atributos de um jogador normal em cada capítulo (alguns treinos e o equipamento do caminho). */
const ATRIBUTOS: Record<number, AtributosLuta> = {
  1: ATRIBUTOS_INICIAIS,
  2: ATRIBUTOS_INICIAIS,
  3: { vida: 110, forca: 1, defesa: 1, carisma: 1, tecnicas: ['contra-ataque'] },
  4: { vida: 110, forca: 2, defesa: 2, carisma: 1, tecnicas: ['contra-ataque'] },
  5: { vida: 120, forca: 2, defesa: 2, carisma: 2, tecnicas: ['contra-ataque', 'quebra-guarda'] },
  6: { vida: 140, forca: 3, defesa: 3, carisma: 2, tecnicas: ['contra-ataque', 'quebra-guarda'] },
  7: { vida: 140, forca: 3, defesa: 3, carisma: 2, tecnicas: ['contra-ataque', 'quebra-guarda'] },
};

const lutas = [...CAPITULOS.claude, ...CAPITULOS.chatgpt].flatMap((cap) =>
  cap.cenas.flatMap((c) => (c.tipo === 'luta' ? [{ cap: cap.numero, inimigo: c.inimigo }] : [])),
);

describe('balanço das lutas da História', () => {
  it.each(lutas)('um bom jogador vence: capítulo $cap, $inimigo', ({ cap, inimigo }) => {
    const def = INIMIGOS[inimigo]!;
    const fim = bomJogador(def, ATRIBUTOS[cap] ?? ATRIBUTOS_INICIAIS);
    expect(fim.fim, `${inimigo}: terminou com ${Math.round(fim.jogador.vida)} de vida, inimigo com ${Math.round(fim.inimigo.vida)}/${def.vida}, ${Math.round(fim.tempo / 1000)} s`).toBe('vitoria');
  });

  it.each([
    ['fornalha', 1],
    ['almirante-ferrugem', 1],
    ['arquivista', 4],
    ['leao-mecanico', 6],
    ['censor-tita', 7],
  ] as const)('só apertar GOLPE perde para o chefão %s', (id, cap) => {
    expect(soGolpe(INIMIGOS[id]!, ATRIBUTOS[cap]!).fim).not.toBe('vitoria');
  });
});
