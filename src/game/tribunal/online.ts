/**
 * Tribunal online (duas pessoas, sala por código). O aparelho de quem criou a sala
 * é o juiz: guarda a partida do ponto de vista dele ("jogador") e o convidado é o
 * "rival". O convidado vê a mesma partida espelhada (`espelhar`), como se ele fosse
 * o jogador. As ações do rival usam o mesmo truque: espelha, age como jogador,
 * espelha de volta. Os dois escolhem ao mesmo tempo; a rodada se resolve quando
 * os dois escolheram. Visão (Helios): quem usou espera o outro escolher e vê a carta.
 */
import type { JuradoId } from '../jurados';
import type { IaId } from '../personagens';
import type { Dilema, LadoId } from './dilemas';
import {
  efeitoNoJurado,
  ladoRival,
  novaPartida,
  PONTEIRO_MAX,
  PONTEIRO_MIN,
  ponteiro,
  usarHabilidade,
  type Aleatorio,
  type EstadoTribunal,
  type Habilidade,
  type Rodada,
} from './motor';

export type LadoTribunal = 'jogador' | 'rival';

const neg = (v: number) => (v === 0 ? 0 : -v);
const limitarPonteiro = (v: number) => Math.max(PONTEIRO_MIN, Math.min(PONTEIRO_MAX, v));

export function novaPartidaOnline(ini: { ia: IaId; rival: IaId; jurados: JuradoId[]; dilema: Dilema; lado: LadoId }, aleatorio: Aleatorio = Math.random): EstadoTribunal {
  return novaPartida({ ...ini, trofeus: 0, acerto: 0, doisHumanos: true }, aleatorio);
}

/** A mesma partida vista do outro lado (o convidado vê assim). Espelhar duas vezes volta ao original. */
export function espelhar(e: EstadoTribunal): EstadoTribunal {
  return {
    ...e,
    ia: e.rival,
    rival: e.ia,
    ladoJogador: ladoRival(e.ladoJogador),
    ponteiros: Object.fromEntries(Object.entries(e.ponteiros).map(([j, v]) => [j, neg(v ?? 0)])),
    mao: e.maoRival,
    reserva: e.reservaRival,
    maoRival: e.mao,
    reservaRival: e.reserva,
    habilidadeUsada: e.habilidadeRivalUsada,
    habilidadeRivalUsada: e.habilidadeUsada,
    visao: !!e.visaoRival,
    visaoRival: e.visao,
    escolhaJogador: e.escolhaRival ?? null,
    escolhaRival: e.escolhaJogador ?? null,
    cartaRival: null,
    rodadas: e.rodadas.map(
      (r): Rodada => ({
        ...r,
        cartaJogador: r.cartaRival,
        cartaRival: r.cartaJogador,
        efeitos: Object.fromEntries(
          Object.entries(r.efeitos).map(([j, ef]) => [j, ef && { jogador: ef.rival, rival: ef.jogador, antes: neg(ef.antes), depois: neg(ef.depois) }]),
        ),
      }),
    ),
  };
}

/** Faz uma ação do ponto de vista de um lado: o rival age no espelho. */
function doLado(e: EstadoTribunal, lado: LadoTribunal, f: (s: EstadoTribunal) => EstadoTribunal): EstadoTribunal {
  return lado === 'jogador' ? f(e) : espelhar(f(espelhar(e)));
}

/** Este lado pode escolher agora? (Quem usou a Visão espera o outro escolher.) */
export function podeEscolher(e: EstadoTribunal, lado: LadoTribunal): boolean {
  const v = lado === 'jogador' ? e : espelhar(e);
  if (v.fase !== 'escolha' || v.escolhaJogador) return false;
  return !v.visao || !!v.escolhaRival;
}

/** Um lado escolhe a carta (escondida). Quando os dois escolheram, a rodada se resolve. */
export function escolher(e: EstadoTribunal, lado: LadoTribunal, cartaId: string, automatica = false): EstadoTribunal {
  if (!podeEscolher(e, lado)) return e;
  const s = doLado(e, lado, (v) => (v.mao.some((c) => c.id === cartaId) ? { ...v, escolhaJogador: cartaId } : v));
  return s.escolhaJogador && s.escolhaRival ? resolver(s, automatica) : s;
}

/** As duas cartas na mesa: aplica nos jurados e passa para a revelação. */
function resolver(e: EstadoTribunal, automatica: boolean): EstadoTribunal {
  const carta = e.mao.find((c) => c.id === e.escolhaJogador)!;
  const cartaRival = e.maoRival.find((c) => c.id === e.escolhaRival)!;
  const efeitos: Rodada['efeitos'] = {};
  const ponteiros = { ...e.ponteiros };
  for (const j of e.jurados) {
    const jogador = efeitoNoJurado(carta, j, e.tempo);
    const rival = efeitoNoJurado(cartaRival, j, e.tempo);
    const antes = ponteiro(e, j);
    const depois = limitarPonteiro(antes + jogador.valor - rival.valor);
    ponteiros[j] = depois;
    efeitos[j] = { jogador, rival, antes, depois };
  }
  return {
    ...e,
    ponteiros,
    rodadas: [...e.rodadas, { tempo: e.tempo, cartaJogador: carta, cartaRival, efeitos, automatica }],
    escolhaJogador: null,
    escolhaRival: null,
    fase: 'revelacao',
  };
}

/** Habilidade de um dos lados (cada pessoa usa a da IA dela, uma vez por partida). */
export function habilidadeDoLado(e: EstadoTribunal, lado: LadoTribunal, h: Habilidade): EstadoTribunal {
  // Já escolheu a carta? A habilidade não muda mais nada neste tempo.
  const v = lado === 'jogador' ? e : espelhar(e);
  if (v.escolhaJogador) return e;
  return doLado(e, lado, (s) => usarHabilidade(s, h));
}

/** Tempo esgotado: o tribunal escolhe por quem ainda não escolheu (primeiro quem não usou a Visão). */
export function tempoEsgotado(e: EstadoTribunal, aleatorio: Aleatorio = Math.random): EstadoTribunal {
  if (e.fase !== 'escolha') return e;
  let s = e;
  const ordem: LadoTribunal[] = e.visao ? ['rival', 'jogador'] : ['jogador', 'rival'];
  for (const lado of ordem) {
    if (s.fase !== 'escolha') break;
    const v = lado === 'jogador' ? s : espelhar(s);
    if (v.escolhaJogador) continue;
    const carta = v.mao[Math.floor(aleatorio() * v.mao.length)];
    if (carta) s = escolher({ ...s, ...(lado === 'jogador' ? { visao: false } : { visaoRival: false }) }, lado, carta.id, true);
  }
  return s;
}
