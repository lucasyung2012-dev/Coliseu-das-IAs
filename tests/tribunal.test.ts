import { DILEMAS, type Carta } from '@/game/tribunal/dilemas';
import {
  avancar,
  cartaDecisiva,
  efeitoNoJurado,
  jogarAleatoria,
  jogarCarta,
  novaPartida,
  ponteiro,
  usarHabilidade,
  veredito,
  type EstadoTribunal,
} from '@/game/tribunal/motor';
import { GOSTOS, TEMAS } from '@/game/tribunal/temas';

const carta = (temas: Carta['temas']): Carta => ({ id: 't', titulo: 'T', texto: 'T', temas });
/** Sorteio fixo: sempre o primeiro da lista e o rival sempre acerta. */
const fixo = () => 0;

describe('efeito de uma carta no jurado', () => {
  it('ama +2, gosta +1, não gosta −1, e soma os dois temas', () => {
    expect(efeitoNoJurado(carta(['logica']), 'logico', 0)).toEqual({ valor: 2, reacao: 'ama' });
    expect(efeitoNoJurado(carta(['viabilidade']), 'logico', 0)).toEqual({ valor: 1, reacao: 'gosta' });
    expect(efeitoNoJurado(carta(['imagem']), 'logico', 0)).toEqual({ valor: -1, reacao: 'naoGosta' });
    expect(efeitoNoJurado(carta(['logica', 'viabilidade']), 'logico', 0).valor).toBe(3);
    expect(efeitoNoJurado(carta(['custo']), 'logico', 0)).toEqual({ valor: 0, reacao: null });
  });

  it('todos os jurados contam igual (sem resistência diferente)', () => {
    expect(efeitoNoJurado(carta(['prova']), 'cetico', 0).valor).toBe(2);
    expect(efeitoNoJurado(carta(['pessoas']), 'empatico', 0).valor).toBe(2);
  });

  it('o 3º tempo vale 1,5×, com limite de ±3', () => {
    expect(efeitoNoJurado(carta(['logica']), 'logico', 2).valor).toBe(3);
    expect(efeitoNoJurado(carta(['imagem']), 'logico', 2).valor).toBe(-2);
    expect(efeitoNoJurado(carta(['logica', 'viabilidade']), 'logico', 2).valor).toBe(3);
  });

  it('a tabela é equilibrada: cada tema tem 1 jurado que ama, 1 que gosta e 1 que não gosta', () => {
    for (const tema of Object.keys(TEMAS)) {
      const g = Object.values(GOSTOS);
      expect(g.filter((x) => x.ama === tema)).toHaveLength(1);
      expect(g.filter((x) => x.gosta === tema)).toHaveLength(1);
      expect(g.filter((x) => x.naoGosta === tema)).toHaveLength(1);
    }
  });
});

describe('conteúdo', () => {
  it('tem 30 dilemas, com ids e perguntas diferentes', () => {
    expect(DILEMAS).toHaveLength(30);
    expect(new Set(DILEMAS.map((d) => d.id)).size).toBe(30);
    expect(new Set(DILEMAS.map((d) => d.pergunta)).size).toBe(30);
  });

  it('cada dilema tem 6 cartas por tempo nos dois lados, com temas válidos e ids únicos', () => {
    for (const d of DILEMAS) {
      const ids = new Set<string>();
      for (const lado of [d.lados.favor, d.lados.contra]) {
        expect(lado.tempos).toHaveLength(3);
        for (const t of lado.tempos) {
          expect(t).toHaveLength(6);
          for (const c of t) {
            ids.add(c.id);
            expect(c.temas).toHaveLength(2);
            expect(c.temas[0]).not.toBe(c.temas[1]);
            for (const tema of c.temas) expect(TEMAS[tema]).toBeDefined();
          }
        }
      }
      expect(ids.size).toBe(36);
    }
  });
});

function partida(over: Partial<Parameters<typeof novaPartida>[0]> = {}): EstadoTribunal {
  return novaPartida(
    { ia: 'claude', rival: 'chatgpt', jurados: ['logico', 'cetico', 'empatico', 'tradicionalista', 'estrategista'], trofeus: 0, lado: 'favor', ...over },
    fixo,
  );
}

describe('partida', () => {
  it('começa com 4 cartas na mão, ponteiros no meio e o rival já com a carta escolhida', () => {
    const e = partida();
    expect(e.mao).toHaveLength(4);
    expect(e.reserva).toHaveLength(2);
    expect(e.jurados.every((j) => ponteiro(e, j) === 0)).toBe(true);
    expect(e.cartaRival).not.toBeNull();
    expect(e.fase).toBe('escolha');
  });

  it('jogar uma carta move os ponteiros pela soma dos efeitos e registra a rodada', () => {
    const e = partida();
    const minha = e.mao[0]!;
    const depois = jogarCarta(e, minha.id, fixo);
    const r = depois.rodadas[0]!;
    for (const j of e.jurados) {
      const esperado = Math.max(-3, Math.min(3, efeitoNoJurado(minha, j, 0).valor - efeitoNoJurado(r.cartaRival, j, 0).valor));
      expect(ponteiro(depois, j)).toBe(esperado);
    }
    expect(depois.fase).toBe('revelacao');
  });

  it('passa pelos 3 tempos até o fim e dá um veredito coerente com os ponteiros', () => {
    let e = partida();
    for (let t = 0; t < 3; t++) {
      e = jogarAleatoria(e, fixo);
      e = avancar(e, fixo);
    }
    expect(e.fase).toBe('fim');
    const v = veredito(e);
    expect(v.jogador + v.rival).toBeLessThanOrEqual(5);
    for (const j of e.jurados) {
      const p = ponteiro(e, j);
      expect(v.votos[j]).toBe(p > 0 ? 'jogador' : p < 0 ? 'rival' : 'abstencao');
      if (v.votos[j] !== 'abstencao') expect(cartaDecisiva(e, j, v.votos[j]!)).not.toBeNull();
    }
  });
});

describe('habilidades', () => {
  it('Claude (Diplomacia) traz de volta ao meio um jurado do lado do rival, uma vez só', () => {
    let e = partida({ ia: 'claude' });
    e = { ...e, ponteiros: { ...e.ponteiros, cetico: -3 } };
    e = usarHabilidade(e, { tipo: 'diplomacia', jurado: 'cetico' });
    expect(ponteiro(e, 'cetico')).toBe(0);
    expect(e.habilidadeUsada).toBe(true);
    const de_novo = usarHabilidade({ ...e, ponteiros: { ...e.ponteiros, logico: -2 } }, { tipo: 'diplomacia', jurado: 'logico' });
    expect(ponteiro(de_novo, 'logico')).toBe(-2);
  });

  it('ChatGPT (Improviso) troca 1 carta da mão pela primeira da reserva', () => {
    const e = partida({ ia: 'chatgpt', rival: 'claude' });
    const sai = e.mao[1]!;
    const entra = e.reserva[0]!;
    const depois = usarHabilidade(e, { tipo: 'improviso', cartaId: sai.id });
    expect(depois.mao.map((c) => c.id)).toContain(entra.id);
    expect(depois.mao.map((c) => c.id)).not.toContain(sai.id);
    expect(depois.mao).toHaveLength(4);
  });

  it('Gemini (Visão) revela a carta do rival neste tempo', () => {
    const e = usarHabilidade(partida({ ia: 'gemini', rival: 'claude' }), { tipo: 'visao' });
    expect(e.visao).toBe(true);
    expect(e.cartaRival).not.toBeNull();
  });

  it('o rival Gemini responde depois do jogador no 3º tempo', () => {
    let e = partida({ ia: 'claude', rival: 'gemini' });
    e = avancar(jogarAleatoria(e, fixo), fixo);
    e = avancar(jogarAleatoria(e, fixo), fixo);
    expect(e.tempo).toBe(2);
    expect(e.rivalRespondeDepois).toBe(true);
    expect(e.cartaRival).toBeNull();
    expect(e.avisos).toContain('visao');
  });
});
