import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { INIMIGOS } from '@/game/historia/inimigos';
import { agir, modoDaLuta, usarPlano, ANIMO_MAX, ataqueAtual, ATRIBUTOS_INICIAIS, FOLEGO_MAX, novaLuta, passoLuta, TICK_LUTA, type AtributosLuta, type Estilo, type EstadoLuta, type EventoLuta } from '@/game/historia/luta';
import { NOMES, type EntradaInimigo, type Fala, type Falante, type Lugar } from '@/game/historia/roteiro';
import Sprite, { type Paleta } from '@/ui/pixel/Sprite';
import {
  CAPITAO_INCINERADOR,
  DECURIAO,
  FORNALHA,
  GLADIADOR_SUCATA,
  INCINERADOR,
  INCINERADOR_GUERRA,
  INCINERADOR_LANCA,
  INCINERADOR_VELOZ,
  PALETA_CAPITAO,
  PALETA_GUERRA,
  PALETA_INCINERADOR,
  PALETA_LANCA,
  PALETA_PRETORIANO,
  PALETA_SUCATA,
  paletaFornalha,
  PRETORIANO_BATEDOR,
  PRETORIANO_LANCEIRO,
} from '@/ui/pixel/historia';
import {
  CAO_DE_FERRO,
  CENSOR_TITA,
  DIMAQUERO,
  MARINHEIRO_FERRO,
  MIRMILAO_BRONZE,
  PALETA_ALMIRANTE,
  PALETA_CAO_DE_FERRO,
  PALETA_DIMAQUERO,
  PALETA_MARINHEIRO,
  PALETA_MIRMILAO,
  PALETA_PRETOR,
  PALETA_RATO,
  PALETA_RETIARIO,
  ALMIRANTE_FERRUGEM,
  ARQUIVISTA,
  LEAO_MECANICO,
  paletaArquivista,
  paletaLeao,
  paletaTita,
  PRETOR_DE_ACO,
  RATO_ENGRENAGEM,
  RETIARIO_MECANICO,
} from '@/ui/pixel/historia2';
import { BRUTUS, PALETA_BRUTUS } from '@/ui/pixel/historia';
import {
  CAPATAZ,
  COZINHEIRO_BORDO,
  FEITOR_TAMBOR,
  GUARDA_CHICOTE,
  PALETA_CAPATAZ,
  PALETA_COZINHEIRO,
  PALETA_FEITOR,
  PALETA_GUARDA_CHICOTE,
  COBRADOR,
  LEVIATA,
  paletaCobrador,
  paletaLeviata,
  PALETA_TOURO,
  TOURO_BRONZE,
} from '@/ui/pixel/historia3';
import {
  ALMIRANTE_ACO,
  CAMPEAO_NAVAL,
  FEIRANTE_AUTOMATO,
  GATO_FERRO,
  GUARDA_FEIRA,
  IMEDIATO_FERRO,
  JACARE_ESGOTO,
  LIMPADOR_ESGOTO,
  MERGULHADOR,
  PALETA_CAMPEAO_NAVAL,
  PALETA_FEIRANTE,
  PALETA_GATO_FERRO,
  PALETA_GUARDA_FEIRA,
  PALETA_IMEDIATO,
  PALETA_JACARE,
  PALETA_LIMPADOR,
  PALETA_MERGULHADOR,
  PALETA_SENTINELA,
  PALETA_TRITAO,
  PALETA_VIGIA_TELHADO,
  paletaAlmiranteAco,
  SENTINELA_CAIS,
  TRITAO_MECANICO,
  VIGIA_TELHADO,
} from '@/ui/pixel/historia4';
import {
  APAGADOR,
  APAGADOR_GRANDE,
  CACADOR_SOMBRAS,
  ECLIPSE,
  ESTATUA_VIVA,
  GIGANTE_SOMBRAS,
  GUARDA_AQUEDUTO,
  GUARDIAO_AQUEDUTO,
  MORCEGO_MECANICO,
  PALETA_APAGADOR,
  PALETA_APAGADOR_GRANDE,
  PALETA_CACADOR,
  PALETA_ESTATUA,
  PALETA_GUARDA_AQUEDUTO,
  PALETA_MORCEGO,
  PALETA_PRETORIANO_NOTURNO,
  PALETA_SACERDOTE,
  paletaEclipse,
  paletaGiganteSombras,
  paletaGuardiaoAqueduto,
  paletaSibilaCorrompida,
  PRETORIANO_NOTURNO,
  SACERDOTE_BRONZE,
  SIBILA_CORROMPIDA,
} from '@/ui/pixel/historia5';
import { GUARDIAO_NUCLEO, NUCLEO, PALETA_GUARDIAO_NUCLEO, paletaNucleo } from '@/ui/pixel/historia6';
import { GladiadorPixel } from '@/ui/pixel/Personagens';
import type { IaId } from '@/game/personagens';
import { desbloquear } from '@/ui/som';
import { tocar, type SomHistoria } from '@/ui/somHistoria';
import { Falas, Palco } from './Cenas';
import { usePausado } from './Pausa';
import Icone from '@/ui/pixel/Icones';
import { Retrato } from './Cenarios';

/** O desenho e o tamanho de cada inimigo (em % da largura da cena). */
const VISUAL: Record<string, { grade: string[]; paleta: Paleta; largura: number }> = {
  incinerador: { grade: INCINERADOR, paleta: PALETA_INCINERADOR, largura: 13 },
  'incinerador-veloz': { grade: INCINERADOR_VELOZ, paleta: { ...PALETA_INCINERADOR, F: '#4ab0ff', Y: '#c8f0ff', M: '#4a5a7a', W: '#8aa0c8' }, largura: 15 },
  'incinerador-lanca-chamas': { grade: INCINERADOR_LANCA, paleta: PALETA_LANCA, largura: 17 },
  'incinerador-duplo': { grade: INCINERADOR_GUERRA, paleta: PALETA_GUERRA, largura: 15 },
  'capitao-incinerador': { grade: CAPITAO_INCINERADOR, paleta: PALETA_CAPITAO, largura: 16 },
  'pretoriano-batedor': { grade: PRETORIANO_BATEDOR, paleta: PALETA_PRETORIANO, largura: 13 },
  'pretoriano-lanceiro': { grade: PRETORIANO_LANCEIRO, paleta: PALETA_PRETORIANO, largura: 13 },
  'pretoriano-veterano': { grade: DECURIAO, paleta: { ...PALETA_PRETORIANO, S: '#d8c070', s: '#8a7030' }, largura: 14 },
  'gladiador-de-sucata': { grade: GLADIADOR_SUCATA, paleta: PALETA_SUCATA, largura: 19 },
  'boneco-de-treino': { grade: BRUTUS, paleta: PALETA_BRUTUS, largura: 17 },
  'caes-de-ferro': { grade: CAO_DE_FERRO, paleta: PALETA_CAO_DE_FERRO, largura: 20 },
  'rato-engrenagem': { grade: RATO_ENGRENAGEM, paleta: PALETA_RATO, largura: 13 },
  'rato-rei': { grade: RATO_ENGRENAGEM, paleta: { ...PALETA_RATO, E: '#ffd04a' }, largura: 19 },
  'patrulha-catacumba': { grade: PRETORIANO_LANCEIRO, paleta: { ...PALETA_PRETORIANO, R: '#5a3a6a', C: '#3a2a4a' }, largura: 13 },
  'patrulha-sargento': { grade: PRETORIANO_BATEDOR, paleta: { ...PALETA_PRETORIANO, R: '#5a3a6a', C: '#3a2a4a', S: '#c8b070' }, largura: 14 },
  'pretoriano-escudeiro': { grade: DECURIAO, paleta: PALETA_PRETORIANO, largura: 14 },
  'pretoriano-lanceiro-elite': { grade: PRETORIANO_LANCEIRO, paleta: { ...PALETA_PRETORIANO, S: '#e0e4f0', R: '#e04a3a' }, largura: 14 },
  'pretoriano-incendiario': { grade: PRETORIANO_BATEDOR, paleta: { ...PALETA_PRETORIANO, R: '#ff6a2a', C: '#a83a10', E: '#ffd04a' }, largura: 14 },
  'centuriao-de-aco': { grade: DECURIAO, paleta: { ...PALETA_PRETORIANO, S: '#f2c14e', s: '#8a6a1a', R: '#8a1a1a' }, largura: 15 },
  'pretor-de-aco': { grade: PRETOR_DE_ACO, paleta: PALETA_PRETOR, largura: 22 },
  'retiario-mecanico': { grade: RETIARIO_MECANICO, paleta: PALETA_RETIARIO, largura: 19 },
  'mirmilao-bronze': { grade: MIRMILAO_BRONZE, paleta: PALETA_MIRMILAO, largura: 19 },
  dimaquero: { grade: DIMAQUERO, paleta: PALETA_DIMAQUERO, largura: 18 },
  'marinheiro-ferro': { grade: MARINHEIRO_FERRO, paleta: PALETA_MARINHEIRO, largura: 15 },
  'marinheiro-arpao': { grade: MARINHEIRO_FERRO, paleta: { ...PALETA_MARINHEIRO }, largura: 15 },
  'marinheiro-canhao': { grade: MARINHEIRO_FERRO, paleta: { ...PALETA_MARINHEIRO }, largura: 16 },
  'contramestre-ferro': { grade: MARINHEIRO_FERRO, paleta: { ...PALETA_MARINHEIRO }, largura: 18 },
  'almirante-ferrugem': { grade: ALMIRANTE_FERRUGEM, paleta: PALETA_ALMIRANTE, largura: 22 },
  'guarda-chicote': { grade: GUARDA_CHICOTE, paleta: PALETA_GUARDA_CHICOTE, largura: 15 },
  'cozinheiro-bordo': { grade: COZINHEIRO_BORDO, paleta: PALETA_COZINHEIRO, largura: 17 },
  'marujo-ferro': { grade: MARINHEIRO_FERRO, paleta: { ...PALETA_MARINHEIRO, E: '#ffd04a' }, largura: 16 },
  capataz: { grade: CAPATAZ, paleta: PALETA_CAPATAZ, largura: 18 },
  'feitor-tambor': { grade: FEITOR_TAMBOR, paleta: PALETA_FEITOR, largura: 24 },
  'valentao-celas': { grade: GLADIADOR_SUCATA, paleta: { ...PALETA_SUCATA, G: '#6a4a3a', g: '#a8806a', E: '#ffd04a', A: '#5a3a2a' }, largura: 18 },
  'touro-bronze': { grade: TOURO_BRONZE, paleta: { ...PALETA_TOURO, E: '#ffb02a' }, largura: 26 },
  'vigia-telhado': { grade: VIGIA_TELHADO, paleta: PALETA_VIGIA_TELHADO, largura: 15 },
  'gato-ferro': { grade: GATO_FERRO, paleta: PALETA_GATO_FERRO, largura: 20 },
  'vigia-chefe': { grade: VIGIA_TELHADO, paleta: { ...PALETA_VIGIA_TELHADO, E: '#ffd04a' }, largura: 17 },
  'jacare-esgoto': { grade: JACARE_ESGOTO, paleta: PALETA_JACARE, largura: 26 },
  'limpador-esgoto': { grade: LIMPADOR_ESGOTO, paleta: PALETA_LIMPADOR, largura: 16 },
  'jacare-rei': { grade: JACARE_ESGOTO, paleta: { ...PALETA_JACARE, E: '#ffd04a' }, largura: 32 },
  'feirante-automato': { grade: FEIRANTE_AUTOMATO, paleta: PALETA_FEIRANTE, largura: 16 },
  'guarda-feira': { grade: GUARDA_FEIRA, paleta: PALETA_GUARDA_FEIRA, largura: 16 },
  'feirante-chefe': { grade: FEIRANTE_AUTOMATO, paleta: { ...PALETA_FEIRANTE, E: '#ffd04a' }, largura: 18 },
  'guarda-cofre': { grade: GUARDA_FEIRA, paleta: { ...PALETA_GUARDA_FEIRA, E: '#ffd04a' }, largura: 17 },
  'sentinela-cais': { grade: SENTINELA_CAIS, paleta: PALETA_SENTINELA, largura: 15 },
  'imediato-ferro': { grade: IMEDIATO_FERRO, paleta: PALETA_IMEDIATO, largura: 18 },
  'tritao-mecanico': { grade: TRITAO_MECANICO, paleta: PALETA_TRITAO, largura: 18 },
  mergulhador: { grade: MERGULHADOR, paleta: PALETA_MERGULHADOR, largura: 17 },
  'mergulhador-elite': { grade: MERGULHADOR, paleta: { ...PALETA_MERGULHADOR, E: '#ffd04a' }, largura: 18 },
  'campeao-naval': { grade: CAMPEAO_NAVAL, paleta: PALETA_CAMPEAO_NAVAL, largura: 20 },
  apagador: { grade: APAGADOR, paleta: PALETA_APAGADOR, largura: 15 },
  'morcego-mecanico': { grade: MORCEGO_MECANICO, paleta: PALETA_MORCEGO, largura: 16 },
  'pretoriano-noturno': { grade: PRETORIANO_NOTURNO, paleta: PALETA_PRETORIANO_NOTURNO, largura: 15 },
  'apagador-grande': { grade: APAGADOR_GRANDE, paleta: PALETA_APAGADOR_GRANDE, largura: 18 },
  'morcego-enxame': { grade: MORCEGO_MECANICO, paleta: { ...PALETA_MORCEGO, E: '#ffd04a' }, largura: 20 },
  'vigia-noturno': { grade: PRETORIANO_NOTURNO, paleta: { ...PALETA_PRETORIANO_NOTURNO, E: '#ffd04a' }, largura: 15 },
  'morcego-gigante': { grade: MORCEGO_MECANICO, paleta: PALETA_MORCEGO, largura: 22 },
  'pretoriano-besteiro': { grade: PRETORIANO_NOTURNO, paleta: PALETA_PRETORIANO_NOTURNO, largura: 16 },
  'cacador-aprendiz': { grade: CACADOR_SOMBRAS, paleta: { ...PALETA_CACADOR, E: '#ffd04a' }, largura: 16 },
  'gato-telhado': { grade: GATO_FERRO, paleta: { ...PALETA_GATO_FERRO, E: '#ffd04a' }, largura: 20 },
  'cacador-sombras': { grade: CACADOR_SOMBRAS, paleta: PALETA_CACADOR, largura: 20 },
  'carcereiro-noturno': { grade: PRETORIANO_NOTURNO, paleta: { ...PALETA_PRETORIANO_NOTURNO, E: '#ff8a3a' }, largura: 16 },
  'apagador-espiao': { grade: APAGADOR, paleta: PALETA_APAGADOR, largura: 16 },
  'estatua-treino': { grade: ESTATUA_VIVA, paleta: { ...PALETA_ESTATUA, E: '#ffd04a' }, largura: 17 },
  'guarda-aqueduto': { grade: GUARDA_AQUEDUTO, paleta: PALETA_GUARDA_AQUEDUTO, largura: 16 },
  'morcego-aqueduto': { grade: MORCEGO_MECANICO, paleta: PALETA_MORCEGO, largura: 18 },
  'guarda-comporta': { grade: GUARDA_AQUEDUTO, paleta: { ...PALETA_GUARDA_AQUEDUTO, E: '#ffd04a' }, largura: 17 },
  'apagador-aqueduto': { grade: APAGADOR_GRANDE, paleta: PALETA_APAGADOR_GRANDE, largura: 18 },
  'pretoriano-noturno-elite': { grade: PRETORIANO_NOTURNO, paleta: { ...PALETA_PRETORIANO_NOTURNO, E: '#ffd04a' }, largura: 17 },
  'sacerdote-bronze': { grade: SACERDOTE_BRONZE, paleta: PALETA_SACERDOTE, largura: 15 },
  'estatua-viva': { grade: ESTATUA_VIVA, paleta: PALETA_ESTATUA, largura: 17 },
  'sacerdote-incenso': { grade: SACERDOTE_BRONZE, paleta: { ...PALETA_SACERDOTE, E: '#ffd04a' }, largura: 16 },
  'estatua-arqueira': { grade: ESTATUA_VIVA, paleta: PALETA_ESTATUA, largura: 17 },
  'sacerdote-supremo': { grade: SACERDOTE_BRONZE, paleta: { ...PALETA_SACERDOTE, E: '#ff3a3a' }, largura: 19 },
  'apagador-colosso': { grade: APAGADOR_GRANDE, paleta: { ...PALETA_APAGADOR_GRANDE, E: '#ffd04a' }, largura: 22 },
  'morcego-eclipse': { grade: MORCEGO_MECANICO, paleta: PALETA_MORCEGO, largura: 22 },
  'gladiador-sombra': { grade: CACADOR_SOMBRAS, paleta: PALETA_CACADOR, largura: 18 },
  'pretoriano-eclipse': { grade: PRETORIANO_NOTURNO, paleta: PALETA_PRETORIANO_NOTURNO, largura: 17 },
  'campeao-sombrio': { grade: CACADOR_SOMBRAS, paleta: { ...PALETA_CACADOR, E: '#ff3a3a' }, largura: 21 },
};

const SOMBRAS: Record<string, IaId> = { 'sombra-cassius': 'claude', 'sombra-octavius': 'chatgpt', 'sombra-helios': 'gemini' };

/** Larguras dos inimigos que mudam de cor com a fase (desenhados à parte). */
const LARGURA_ESPECIAL: Record<string, number> = { fornalha: 30, arquivista: 20, 'leao-mecanico': 32, 'censor-tita': 38, 'censor-tita-octavius': 38, 'censor-tita-helios': 38, eclipse: 26, 'guardiao-aqueduto': 26, 'sibila-corrompida': 20, 'gigante-sombras': 32, cobrador: 22, leviata: 34, 'almirante-aco': 24, nucleo: 40, 'guardiao-nucleo': 24, 'sombra-cassius': 14, 'sombra-octavius': 14, 'sombra-helios': 14 };

function SpriteInimigo({ e }: { e: EstadoLuta }) {
  const sinalFogo = e.inimigo.estado === 'sinal' && ataqueAtual(e).tipo === 'fogo';
  if (e.def.id === 'fornalha') return <Sprite grade={FORNALHA} paleta={paletaFornalha(sinalFogo, e.inimigo.fase)} espelhar />;
  if (e.def.id === 'arquivista') return <Sprite grade={ARQUIVISTA} paleta={paletaArquivista(false)} espelhar />;
  if (e.def.id === 'leao-mecanico') return <Sprite grade={LEAO_MECANICO} paleta={paletaLeao(e.inimigo.fase > 0 || sinalFogo)} espelhar />;
  if (e.def.id === 'eclipse') return <Sprite grade={ECLIPSE} paleta={paletaEclipse(e.inimigo.fase)} espelhar />;
  if (e.def.id === 'guardiao-aqueduto') return <Sprite grade={GUARDIAO_AQUEDUTO} paleta={paletaGuardiaoAqueduto(e.inimigo.fase)} espelhar />;
  if (e.def.id === 'sibila-corrompida') return <Sprite grade={SIBILA_CORROMPIDA} paleta={paletaSibilaCorrompida(e.inimigo.fase)} espelhar />;
  if (e.def.id === 'gigante-sombras') return <Sprite grade={GIGANTE_SOMBRAS} paleta={paletaGiganteSombras(e.inimigo.fase)} espelhar />;
  if (e.def.id === 'censor-tita' || e.def.id === 'censor-tita-octavius' || e.def.id === 'censor-tita-helios') return <Sprite grade={CENSOR_TITA} paleta={paletaTita(e.inimigo.fase)} espelhar />;
  if (e.def.id === 'cobrador') return <Sprite grade={COBRADOR} paleta={paletaCobrador(e.inimigo.fase > 0 || sinalFogo)} espelhar />;
  if (e.def.id === 'leviata') return <Sprite grade={LEVIATA} paleta={paletaLeviata(e.inimigo.fase)} espelhar />;
  if (e.def.id === 'almirante-aco') return <Sprite grade={ALMIRANTE_ACO} paleta={paletaAlmiranteAco(e.inimigo.fase)} espelhar />;
  if (e.def.id === 'nucleo') return <Sprite grade={NUCLEO} paleta={paletaNucleo(e.inimigo.fase)} espelhar />;
  if (e.def.id === 'guardiao-nucleo') return <Sprite grade={GUARDIAO_NUCLEO} paleta={PALETA_GUARDIAO_NUCLEO} espelhar />;
  // As sombras dos três (capítulo secreto): o próprio gladiador, escuro e de olho vermelho.
  const sombra = SOMBRAS[e.def.id];
  if (sombra) return <div className="sombra-heroi"><GladiadorPixel ia={sombra} espelhar /></div>;
  const v = VISUAL[e.def.id] ?? VISUAL.incinerador!;
  return <Sprite grade={v.grade} paleta={v.paleta} espelhar />;
}

function Barra({ valor, max, cor, rotulo, fina = false }: { valor: number; max: number; cor: string; rotulo: string; fina?: boolean }) {
  return (
    <div role="meter" aria-label={rotulo} aria-valuenow={Math.round(valor)} aria-valuemin={0} aria-valuemax={max} className={`w-full border border-black bg-black/60 ${fina ? 'h-1.5 sm:h-2' : 'h-2.5 sm:h-3'}`}>
      <div className="h-full transition-[width] duration-150" style={{ width: `${(valor / max) * 100}%`, background: cor }} />
    </div>
  );
}

const SOM: Partial<Record<string, SomHistoria>> = {
  acerto: 'espadas',
  bloqueio: 'escudoMetal',
  esquiva: 'esquiva',
  dano: 'dano',
  especial: 'especial',
  fase: 'fase',
  guarda: 'guarda',
  finta: 'finta',
  contra: 'contra',
  cansado: 'cansado',
  riposta: 'riposta',
  quebra: 'quebra',
  plano: 'plano',
  reflexo: 'reflexo',
  aliado: 'aliado',
  // os jeitos de lutar
  pagina: 'pagina',
  citacao: 'quebra',
  muralha: 'especial',
  tropeco: 'riposta',
  rede: 'especial',
  luz: 'reflexo',
  eclipse: 'especial',
  erro: 'finta',
};

/**
 * Os botões e o jeito de cada gladiador (pedido do Lucas: cada um luta diferente).
 * A ordem é sempre golpe, defesa, esquiva e especial; muda o nome, o ícone e a dica.
 */
const BOTOES: Record<Estilo | 'neutro', { golpe: [string, string]; escudo: [string, string]; esquiva: [string, string]; especial: [string, string]; icones: Record<'golpe' | 'escudo' | 'esquiva' | 'especial', string>; dica: string; cor: string }> = {
  guardiao: {
    golpe: ['', 'GLÁDIO'],
    escudo: ['', 'ESCUDO'],
    esquiva: ['', 'ESQUIVA'],
    especial: ['', 'MURALHA'],
    icones: { golpe: 'gladio', escudo: 'escudo', esquiva: 'esquiva', especial: 'muralha' },
    dica: 'GUARDIÃO: bloqueie NA ÚLTIMA HORA para guardar páginas; o próximo golpe no ABERTO cita todas e bate muito. Esquiva pesada. MURALHA: tudo bloqueado e metade volta.',
    cor: '#e0782c',
  },
  estrategista: {
    golpe: ['', 'TRIDENTE'],
    escudo: ['', 'APARAR'],
    esquiva: ['', 'ROLAR'],
    especial: ['', 'REDE'],
    icones: { golpe: 'tridente', escudo: 'aparar', esquiva: 'rolar', especial: 'rede' },
    dica: 'ESTRATEGISTA: role NA ÚLTIMA HORA e ele TROPEÇA (fica aberto muito tempo). Aparar deixa passar um pouco. Use os PLANOS do cenário. REDE: preso e sem atacar.',
    cor: '#2aa08a',
  },
  vidente: {
    golpe: ['', 'LANÇA'],
    escudo: ['', 'ESPELHO'],
    esquiva: ['', 'LAMPEJO'],
    especial: ['', 'ECLIPSE'],
    icones: { golpe: 'lanca', escudo: 'espelho', esquiva: 'lampejo', especial: 'eclipse' },
    dica: 'VIDENTE: você vê o PRÓXIMO golpe (até as fintas). Lampejo NA ÚLTIMA HORA junta luz. Menos vida. ECLIPSE: os 3 próximos golpes erram, e a luz vira raio.',
    cor: '#f2c14e',
  },
  neutro: {
    golpe: ['', 'GOLPE'],
    escudo: ['', 'ESCUDO'],
    esquiva: ['', 'ESQUIVA'],
    especial: ['', 'ESPECIAL'],
    icones: { golpe: 'gladio', escudo: 'escudo', esquiva: 'esquiva', especial: 'especial' },
    dica: '',
    cor: '#f2c14e',
  },
};

/** A cena de entrada do especial (como nos jogos de luta): faixa na diagonal com o gladiador e o nome. */
const NOME_ESPECIAL: Partial<Record<EventoLuta['tipo'], string>> = {
  muralha: 'MURALHA DE LIVROS',
  rede: 'REDE E TRIDENTE',
  eclipse: 'ECLIPSE',
  especial: 'GOLPE ESPECIAL',
};
const TEXTO: Record<string, string> = {
  bloqueio: 'BLOQUEOU!',
  esquiva: 'ESQUIVOU!',
  especial: 'ESPECIAL!',
  guarda: 'NA GUARDA',
  fase: 'FURIOSO!',
  finta: 'FINTA!',
  contra: 'CONTRA-ATAQUE!',
  cansado: 'SEM FÔLEGO',
  riposta: 'CONTRA-ATAQUE!',
  plano: 'PLANO B!',
  reflexo: 'REFLETIU!',
  quebra: 'GUARDA QUEBRADA!',
  aliado: '',
  pagina: '+PÁGINA!',
  citacao: 'CITAÇÃO!',
  muralha: '',
  tropeco: 'TROPEÇOU!',
  rede: '',
  luz: '+LUZ!',
  eclipse: '',
  erro: 'X ERROU!',
};

/** O que pode aparecer no cenário para o Octavius usar (no porto, no navio...). */
const PLANOS = [
  { icone: 'barril', nome: 'ROLAR O BARRIL' },
  { icone: 'rede', nome: 'REDE DE PESCA' },
  { icone: 'gancho', nome: 'GANCHO DO GUINDASTE' },
  { icone: 'corda', nome: 'PUXAR A CORDA' },
  { icone: 'caixote', nome: 'CAIXOTE NA CABEÇA' },
];

/** Faíscas voando para todos os lados, um corte e um anel: o impacto de um golpe. */
function Impacto({ x, cor, corte = false, grande = false }: { x: string; cor: string; corte?: boolean; grande?: boolean }) {
  const n = grande ? 14 : 9;
  return (
    <span className="pointer-events-none absolute bottom-[34%] z-20 h-0 w-0" style={{ left: x }} aria-hidden>
      <span className="anel-impacto absolute h-16 w-16 rounded-full border-4 sm:h-24 sm:w-24" style={{ borderColor: cor, left: '-2rem', top: '-2rem' }} />
      {corte && <span className="corte-golpe absolute -left-10 -top-1 h-1.5 w-20 bg-white shadow-[0_0_8px_#fff] sm:-left-14 sm:w-28" />}
      {Array.from({ length: n }, (_, k) => {
        const ang = (k / n) * Math.PI * 2 + (k % 2) * 0.3;
        const dist = (grande ? 70 : 42) + (k % 3) * 12;
        return (
          <span
            key={k}
            className="faisca-voa absolute h-1.5 w-1.5 sm:h-2 sm:w-2"
            style={{ background: k % 3 ? cor : '#ffffff', '--dx': `${Math.cos(ang) * dist}px`, '--dy': `${Math.sin(ang) * dist}px` } as CSSProperties}
          />
        );
      })}
    </span>
  );
}

/** O jeito de chegar de cada bicho (quando a cena não pede um jeito especial). */
function entradaDe(id: string, chefao: boolean): EntradaInimigo {
  if (/morcego|veloz|gaivota|vigia-telhado/.test(id)) return 'voando';
  if (/jacare|mergulhador|tritao|leviata|limpador-esgoto/.test(id)) return 'agua';
  if (/rato|caes|gato|cacador/.test(id)) return 'rapido';
  if (chefao || /fornalha|tita|colosso|gigante|touro|leao|centuriao|pretor-de-aco/.test(id)) return 'pesado';
  return 'andando';
}
const DURACAO_ENTRADA: Record<EntradaInimigo, number> = { janela: 1900, voando: 1700, pesado: 2100, rapido: 900, agua: 1500, andando: 1400 };
const SONS_ENTRADA: Record<EntradaInimigo, [SomHistoria, number][]> = {
  janela: [['catapulta', 350], ['pesada', 1250]],
  voando: [['galope', 200], ['escudoMetal', 1350]],
  pesado: [['pesada', 150], ['pesada', 650], ['pesada', 1150], ['pesada', 1650]],
  rapido: [['galope', 0]],
  agua: [['onda', 100]],
  andando: [['passos', 0], ['passos', 700]],
};

/** O que acontece em volta da chegada: o vidro estourando, a poeira no chão, a água espirrando. */
function EfeitoEntrada({ entrada }: { entrada: EntradaInimigo }) {
  const cacos: [number, number][] = [
    [-60, -40], [-30, -70], [10, -80], [50, -50], [70, 10], [-70, 20], [30, 60], [-20, 70], [60, 70], [-50, -10],
  ];
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {entrada === 'janela' && (
        <>
          {/* a janela alta da biblioteca, de noite, que ele estoura para entrar */}
          <div className="janela-entrada absolute z-[9] left-[33%] top-[9%] h-[50%] w-[38%] rounded-t-[50%]">
            <span className="vidro-entrada absolute inset-0 rounded-t-[50%] bg-[linear-gradient(135deg,#6a8ad8aa,#a8c8ff66_40%,#3a4a9a88)]" />
          </div>
          {cacos.map(([dx, dy], k) => (
            <span
              key={k}
              className="caco-vidro absolute z-[12] left-[52%] top-[32%] block h-[3%] w-[2%] bg-[#c8dcff]"
              style={{ '--dx': `${dx * 3}%`, '--dy': `${dy * 3}%`, animationDelay: `${330 + (k % 3) * 40}ms`, rotate: `${k * 37}deg` } as CSSProperties}
            />
          ))}
          <span className="clarao-entrada absolute z-[12] left-[52%] top-[32%] block h-[30%] w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </>
      )}
      {entrada === 'agua' &&
        [-12, -6, 0, 6, 12].map((dx, k) => (
          <span key={k} className="respingo-entrada absolute z-[12] bottom-[12%] block h-[5%] w-[3%] rounded-full bg-[#8ad0ff]" style={{ left: `${70 + dx}%`, animationDelay: `${200 + k * 50}ms`, '--dx': `${dx * 4}%` } as CSSProperties} />
        ))}
      {entrada !== 'voando' && entrada !== 'agua' &&
        [-10, -5, 0, 5, 10].map((dx, k) => (
          <span
            key={k}
            className="poeira-entrada absolute z-[12] bottom-[11%] block h-[6%] w-[6%] rounded-full bg-[#c8b89a]"
            style={{ left: `${70 + dx}%`, '--dx': `${dx * 5}%`, animationDelay: `${(entrada === 'janela' ? 1250 : entrada === 'pesado' ? 1650 : entrada === 'rapido' ? 600 : 1100) + k * 30}ms` } as CSSProperties}
          />
        ))}
    </div>
  );
}

/**
 * A luta do modo História: falas antes, a luta, falas depois. Perdeu? Tenta de novo.
 * Controles: golpe, escudo, esquiva e especial (Ânimo cheio).
 * Teclado: J golpe, K escudo, L esquiva, espaço especial.
 * No Coliseu, o Ânimo vem da PLATEIA: ela começa vaiando e muda de lado com as boas jogadas.
 */
export function LutaHistoria({
  lugar,
  inimigo,
  heroi: heroiInicial,
  antes,
  depois,
  onFim,
  atributos: atributosDoHeroi = ATRIBUTOS_INICIAIS,
  treino,
  onVitoria,
  equipe,
  entrada: entradaPedida,
}: {
  lugar: Lugar;
  inimigo: string;
  heroi: Falante;
  antes?: Fala[];
  depois?: Fala[];
  onFim: () => void;
  /** Força, defesa, vida, carisma e os golpes aprendidos (vêm do save). */
  atributos?: AtributosLuta;
  /** Treino do Ludus: o objetivo é fazer `quantos` vezes o evento; não dá para perder. */
  treino?: { evento: EventoLuta['tipo']; quantos: number; rotulo: string };
  /** Venceu: recebe as peças de máquina que o inimigo deixou. */
  onVitoria?: (pecas: number) => void;
  /** Capítulo secreto: os três lutam juntos e dá para TROCAR de gladiador no meio da luta. */
  equipe?: Partial<Record<Falante, AtributosLuta>>;
  /** Como o inimigo chega (a janela quebrando no capítulo 1, por exemplo). */
  entrada?: EntradaInimigo;
}) {
  const def = INIMIGOS[inimigo]!;
  const [heroi, setHeroi] = useState<Falante>(heroiInicial);
  const atributos = equipe?.[heroi] ?? atributosDoHeroi;
  // O relógio da luta e o teclado leem sempre o gladiador que está lutando agora.
  const atributosRef = useRef(atributos);
  atributosRef.current = atributos;
  const noColiseu = lugar === 'coliseu-arena' || lugar === 'coliseu-noite';
  // O Octavius luta com PLANOS: coisas do cenário que aparecem e dá para usar.
  const comPlanos = heroi === 'octavius' && !treino;
  const [planosUsados, setPlanosUsados] = useState<number[]>([]);
  // Luta no escuro (Helios): só se vê o sinal com a LUZ (dura 4 s e recarrega em 5,5 s).
  const [luzAte, setLuzAte] = useState(0);
  const [luzPronta, setLuzPronta] = useState(0);
  const acenderRef = useRef<() => void>(() => undefined);
  // Trocar de gladiador (capítulo secreto): o novo entra no lugar, com a vida e o fôlego de agora.
  const trocarRef = useRef<(q: Falante) => void>(() => undefined);
  trocarRef.current = (q: Falante) => {
    if (fase !== 'luta' || q === heroi) return;
    desbloquear();
    tocar('selecionar');
    setHeroi(q);
    setLuzAte(0);
  };
  const [feitos, setFeitos] = useState(0);
  // Antes de tudo, o inimigo CHEGA (inteiro, com animação): ninguém aparece do nada.
  const entrada = treino ? null : entradaPedida ?? entradaDe(inimigo, !!def.chefao);
  const [fase, setFase] = useState<'chegada' | 'antes' | 'luta' | 'depois' | 'derrota'>(entrada ? 'chegada' : antes?.length ? 'antes' : 'luta');
  useEffect(() => {
    if (!entrada) return;
    const sons = SONS_ENTRADA[entrada];
    const ids = sons.map(([som, ms]) => window.setTimeout(() => tocar(som), ms));
    ids.push(window.setTimeout(() => setFase(antes?.length ? 'antes' : 'luta'), DURACAO_ENTRADA[entrada]));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, []);
  const [e, setE] = useState<EstadoLuta>(() => novaLuta(def, atributos));
  const [tentativas, setTentativas] = useState(1);
  const modo = modoDaLuta(e);
  const escuro = modo.escuro;
  const visto = useRef(0);
  // Golpes seguidos sem apanhar (o COMBO na tela).
  const [combo, setCombo] = useState(0);

  // O menu de pausa (MENU ou Esc) para o relógio da luta.
  const pausado = usePausado();
  useEffect(() => {
    if (fase !== 'luta' || pausado) return;
    const id = window.setInterval(() => setE((s) => passoLuta(s, atributosRef.current)), TICK_LUTA);
    return () => window.clearInterval(id);
  }, [fase, pausado]);

  // Fim da luta e os sons de cada acontecimento.
  useEffect(() => {
    for (const ev of e.eventos) {
      if (ev.id <= visto.current) continue;
      const som = SOM[ev.tipo];
      if (som) tocar(som);
      if (ev.tipo === 'acerto' || ev.tipo === 'especial' || ev.tipo === 'plano' || ev.tipo === 'citacao') setCombo((c) => c + 1);
      if (ev.tipo === 'dano' || ev.tipo === 'contra') setCombo(0);
      // No treino do ESPECIAL vale o especial de qualquer jeito de lutar (Muralha, Rede, Eclipse).
      if (treino && (ev.tipo === treino.evento || (treino.evento === 'especial' && (ev.tipo === 'muralha' || ev.tipo === 'rede' || ev.tipo === 'eclipse')))) setFeitos((n) => n + 1);
    }
    visto.current = Math.max(visto.current, ...e.eventos.map((x) => x.id), 0);
    if (fase === 'luta' && e.fim === 'vitoria') {
      tocar('vitoria');
      onVitoria?.(def.pecas ?? (def.chefao ? 6 : 2));
      if (noColiseu) tocar('plateia');
      setFase('depois');
    }
    if (fase === 'luta' && e.fim === 'derrota') {
      // No treino não tem derrota: o Brutus te levanta e segue.
      if (treino) {
        visto.current = 0;
        setE(novaLuta(def, atributos));
        return;
      }
      tocar('derrota');
      setFase('derrota');
    }
  }, [e]);

  const apertar = (acao: 'golpe' | 'escudo' | 'esquiva' | 'especial') => {
    if (fase !== 'luta' || pausado) return;
    desbloquear();
    setE((s) => agir(s, acao, atributosRef.current));
  };

  useEffect(() => {
    if (fase !== 'luta') return;
    const tecla = (ev: KeyboardEvent) => {
      if (ev.repeat) return;
      const k = ev.key.toLowerCase();
      if (k === 'j' || k === 'arrowright') apertar('golpe');
      else if (k === 'k' || k === 'arrowdown') apertar('escudo');
      else if (k === 'l' || k === 'arrowleft') apertar('esquiva');
      else if (k === 'u') acenderRef.current();
      else if (equipe && (k === '1' || k === '2' || k === '3')) {
        const q = (Object.keys(equipe) as Falante[])[Number(k) - 1];
        if (q) trocarRef.current(q);
      }
      else if (k === ' ') {
        ev.preventDefault();
        apertar('especial');
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [fase, pausado]);

  const j = e.jogador;
  const i = e.inimigo;
  const at = ataqueAtual(e);
  const sinal = i.estado === 'sinal';
  const corSinal = at.tipo === 'corpo' ? '#ffd04a' : at.tipo === 'finta' ? '#ffd04a' : '#ff3a3a';
  const cheio = e.animo >= ANIMO_MAX;
  const acaoJ = e.tempo < j.acaoAte ? j.acao : 'parado';
  // Os inimigos também ficaram maiores (pedido do Lucas: "os bonecos estão muito pequenininhos").
  const largura = Math.min(52, (LARGURA_ESPECIAL[def.id] ?? VISUAL[def.id]?.largura ?? 13) * 1.32);
  const apanhou = e.eventos.some((ev) => ev.tipo === 'acerto' && ev.ate - e.tempo > 550);
  const plateiaLado = e.animo >= 50;
  // O inimigo avança quando o golpe dele chega; cai quando perde.
  const atacou = e.eventos.some((ev) => (ev.tipo === 'dano' || ev.tipo === 'bloqueio' || ev.tipo === 'esquiva') && ev.ate - e.tempo > 450);
  const vencido = e.fim === 'vitoria';
  // O Arquivista: nas fintas, quem treme são as cópias falsas; a verdadeira fica parada.
  const ilusao = modo.ilusoes && sinal && at.tipo === 'finta';
  // No escuro, o sinal do inimigo só aparece com a LUZ acesa.
  const aceso = !escuro || e.tempo < luzAte;
  const podeLuz = escuro && fase === 'luta' && e.tempo >= luzPronta;
  acenderRef.current = () => {
    if (!podeLuz) return;
    desbloquear();
    tocar('reflexo');
    setLuzAte(e.tempo + 4000);
    setLuzPronta(e.tempo + 5500);
  };
  const aliado = e.eventos.find((ev) => ev.tipo === 'aliado');
  const quemAjuda = aliado && def.aliados ? (def.aliados[aliado.valor ?? 0] as Falante | undefined) : undefined;
  // O jeito de lutar de quem está na arena agora (muda na troca do capítulo secreto).
  const estilo = atributos.estilo;
  const bot = BOTOES[estilo ?? 'neutro'];
  const rec = e.estilo;
  const naMuralha = e.tempo < rec.muralhaAte;
  const naRede = e.tempo < rec.redeAte;
  // A faixa do especial: aparece enquanto o evento do especial está na tela.
  const especialAgora = e.eventos.find((ev) => NOME_ESPECIAL[ev.tipo] && ev.ate - e.tempo > 0);

  // Treino: chegou no objetivo, acabou (as falas de "depois" aparecem).
  useEffect(() => {
    if (treino && fase === 'luta' && feitos >= treino.quantos) {
      tocar('vitoria');
      setFase('depois');
    }
  }, [feitos]);

  return (
    <div className="flex flex-col gap-2">
      <Palco lugar={lugar} className={acaoJ === 'ferido' || (fase === 'chegada' && entrada === 'pesado') ? 'tremer-forte' : ''}>
        {fase === 'chegada' && entrada && <EfeitoEntrada entrada={entrada} />}
        {/* Placar: vida dos dois, o fôlego e o Ânimo (ou a plateia, no Coliseu) */}
        <div className="absolute inset-x-2 top-2 z-20 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-pixel text-[7px] text-white [text-shadow:1px_1px_0_#000] sm:text-[9px]">{heroi.toUpperCase()}</span>
            <Barra valor={j.vida} max={j.vidaMax} cor="#4ad46a" rotulo="Sua vida" />
            <Barra valor={j.folego} max={FOLEGO_MAX} cor={j.folego < 25 ? '#ff8a3a' : '#5ab0ff'} rotulo="Fôlego" fina />
            <Barra valor={e.animo} max={ANIMO_MAX} cor={cheio ? '#f2c14e' : '#c8962a'} rotulo={noColiseu ? 'Plateia' : 'Ânimo'} />
            <span className={`font-pixel text-[6px] sm:text-[8px] ${cheio ? 'piscar text-[#f2c14e]' : 'text-white/70'}`}>
              {cheio ? (noColiseu ? 'A PLATEIA GRITA SEU NOME!' : 'ÂNIMO CHEIO!') : noColiseu ? (plateiaLado ? 'A PLATEIA MUDOU DE LADO' : 'A PLATEIA VAIA') : 'ÂNIMO'}
            </span>
            {/* O que o jeito de lutar guardou: páginas (Cassius), luz (Helios), rede (Octavius) */}
            {estilo === 'guardiao' && (
              <span className="flex items-center gap-0.5 text-xs sm:text-base" aria-label={`Páginas: ${rec.paginas} de 3`}>
                {[0, 1, 2].map((k) => (
                  <span key={k} className={k < rec.paginas ? 'recurso-cheio' : 'opacity-25 grayscale'}>
                    <Icone nome="pagina" className="w-3 sm:w-5" />
                  </span>
                ))}
                {naMuralha && <span className="piscar ml-1 font-pixel text-[6px] text-[#e0782c] sm:text-[8px]">MURALHA!</span>}
              </span>
            )}
            {estilo === 'vidente' && (
              <span className="flex items-center gap-0.5 text-xs sm:text-base" aria-label={`Luz: ${rec.luz} de 3`}>
                {[0, 1, 2].map((k) => (
                  <span key={k} className={k < rec.luz ? 'recurso-cheio' : 'opacity-25 grayscale'}>
                    <Icone nome="sol" className="w-3 sm:w-5" />
                  </span>
                ))}
                {rec.cego > 0 && <span className="ml-1 font-pixel text-[6px] text-[#b89aff] sm:text-[8px]">×{rec.cego}</span>}
              </span>
            )}
            {estilo === 'estrategista' && (
              <span className="font-pixel text-[6px] text-[#2aa08a] sm:text-[8px]">{naRede ? 'PRESO NA REDE!' : 'ROLE NA HORA: ELE TROPEÇA'}</span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="font-pixel text-[7px] text-white [text-shadow:1px_1px_0_#000] sm:text-[9px]">
              {def.chefao && ''}
              {def.nome.toUpperCase()}
              {def.trocaDeFase && ` · FASE ${i.fase + 1}`}
            </span>
            <Barra valor={i.vida} max={def.vida} cor="#e04a3a" rotulo={`Vida de ${def.nome}`} />
          </div>
        </div>

        {/* Sombras no chão */}
        <span className="pointer-events-none absolute bottom-[12%] left-[22%] z-[9] h-[4%] w-[17%] -translate-x-1/2 rounded-[50%] bg-black/50" aria-hidden style={{ scale: acaoJ === 'esquiva' ? '0.6' : '1', transition: 'scale 120ms' }} />
        {!vencido && <span className="pointer-events-none absolute bottom-[10%] left-[70%] z-[9] h-[4%] -translate-x-1/2 rounded-[50%] bg-black/50" style={{ width: `${largura * 0.85}%` }} aria-hidden />}

        {/* A sombra que fica para trás na esquiva */}
        {acaoJ === 'esquiva' && (
          <div className="rastro-esquiva pointer-events-none absolute bottom-[14%] left-[22%] z-[9] w-[19%] -translate-x-1/2 opacity-40" aria-hidden>
            <Retrato quem={heroi} />
          </div>
        )}

        {/* O herói */}
        <div
          className={`absolute bottom-[14%] left-[22%] z-10 w-[19%] -translate-x-1/2 ${acaoJ === 'golpe' || acaoJ === 'especial' ? 'investida-dir' : acaoJ === 'parado' ? 'respirar-t' : ''}`}
          style={{
            // Cada um esquiva do seu jeito: o Cassius pula pesado, o Octavius rola no chão, o Helios some num lampejo.
            translate:
              acaoJ === 'esquiva'
                ? estilo === 'estrategista'
                  ? '-75% 0'
                  : estilo === 'vidente'
                    ? '-90% -6%'
                    : '-50% -18%'
                : acaoJ === 'ferido'
                  ? '-18% 0'
                  : undefined,
            transition: 'translate 120ms ease-out',
            filter: acaoJ === 'ferido' ? 'brightness(2.4) saturate(0)' : acaoJ === 'especial' ? `drop-shadow(0 0 12px ${bot.cor})` : naMuralha ? 'drop-shadow(0 0 6px #e0782c)' : undefined,
          }}
        >
          <div className={acaoJ === 'esquiva' ? (estilo === 'estrategista' ? 'esquiva-rolar' : estilo === 'vidente' ? 'esquiva-lampejo' : '') : ''}>
            <Retrato quem={heroi} />
          </div>
          {acaoJ === 'escudo' && (
            <span className={`absolute -right-[40%] top-[15%] text-3xl sm:text-5xl ${estilo === 'vidente' ? 'drop-shadow-[0_0_10px_#ffe08a]' : 'drop-shadow-[0_0_8px_#9fe8ff]'}`} aria-hidden>
              <Icone nome={bot.icones.escudo} className="w-8 sm:w-14" />
            </span>
          )}
          {/* Páginas guardadas voando em volta do Cassius; luz em volta do Helios */}
          {estilo === 'guardiao' &&
            Array.from({ length: rec.paginas }, (_, k) => (
              <span key={k} className="orbita-recurso absolute left-1/2 top-[30%] text-xs sm:text-lg" style={{ animationDelay: `${k * -600}ms` }} aria-hidden>
                <Icone nome="pagina" className="w-3 sm:w-5" />
              </span>
            ))}
          {estilo === 'vidente' &&
            Array.from({ length: rec.luz }, (_, k) => (
              <span key={k} className="orbita-recurso absolute left-1/2 top-[30%] h-2 w-2 rounded-full bg-[#ffe08a] shadow-[0_0_8px_#ffd04a] sm:h-3 sm:w-3" style={{ animationDelay: `${k * -600}ms` }} aria-hidden />
            ))}
        </div>

        {/* MURALHA DE LIVROS: uma parede de livros na frente do Cassius */}
        {naMuralha && (
          <div className="muralha-livros pointer-events-none absolute bottom-[13%] left-[33%] z-[11] flex h-[34%] w-[5%] flex-col-reverse" aria-hidden>
            {['#c0283c', '#2a6aa0', '#e0782c', '#3a8a4a', '#8a3aa0', '#d0a040', '#c0283c', '#2a6aa0'].map((c, k) => (
              <span key={k} className="block w-full flex-1 border border-black" style={{ background: c, marginLeft: `${(k % 3) * 8}%` }} />
            ))}
          </div>
        )}

        {/* O inimigo, com o sinal antes do ataque (e a chegada dele, no começo) */}
        <div className={`pointer-events-none absolute inset-0 z-10 [&>*]:pointer-events-auto ${fase === 'chegada' && entrada ? `entrada-${entrada}` : ''}`}>
        <div
          className={`absolute bottom-[12%] left-[70%] z-10 -translate-x-1/2 ${vencido ? 'inimigo-vencido' : atacou ? 'investida-esq' : sinal && !ilusao ? 'tremer-t' : ilusao ? 'respirar-t' : def.chefao || def.id.startsWith('pretoriano') || def.id === 'gladiador-de-sucata' ? 'respirar-t' : 'flutuar'}`}
          style={{
            width: `${largura}%`,
            translate: apanhou && !vencido ? '8% 0' : undefined,
            transition: 'translate 90ms ease-out',
            filter: apanhou ? 'brightness(2.6)' : !aceso ? 'brightness(0.55) saturate(0.4)' : sinal && !ilusao ? `drop-shadow(0 0 10px ${corSinal})` : i.estado === 'atordoado' ? 'saturate(0.3)' : undefined,
          }}
        >
          <SpriteInimigo e={e} />
          {/* fumaça saindo da chaminé da Fornalha */}
          {def.id === 'fornalha' &&
            [0, 1, 2].map((k) => (
              <span
                key={k}
                className="fumaca-subindo absolute left-[46%] top-[-6%] h-[8%] w-[10%] rounded-full bg-[#3a3a3a]/70"
                style={{ animationDelay: `${k * 600}ms` }}
                aria-hidden
              />
            ))}
          {sinal && !ilusao && aceso && (
            <span
              className="absolute -top-[22%] left-1/2 -translate-x-1/2 whitespace-nowrap border-2 border-black px-1 font-pixel text-[7px] text-black sm:text-[10px]"
              style={{ background: corSinal }}
            >
              ! {at.tipo === 'corpo' || at.tipo === 'finta' ? 'DEFENDA' : 'ESQUIVE'}
              {i.contra && ' (RÁPIDO!)'}
            </span>
          )}
          {(i.estado === 'aberto' || i.estado === 'atordoado') && (
            <span className="absolute -top-[22%] left-1/2 -translate-x-1/2 whitespace-nowrap border-2 border-black bg-[#4ad46a] px-1 font-pixel text-[7px] text-black sm:text-[10px]">
              {i.estado === 'atordoado' ? (naRede ? 'PRESO!' : 'TONTO!') : 'ABERTO!'}
            </span>
          )}
          {/* Vidente: vê o PRÓXIMO golpe antes do sinal (até a finta) */}
          {estilo === 'vidente' && i.estado === 'espera' && aceso && !vencido && fase === 'luta' && (
            <span className="visao-proxima absolute -top-[22%] left-1/2 -translate-x-1/2 whitespace-nowrap border-2 border-[#ffe08a] bg-black/80 px-1 font-pixel text-[6px] text-[#ffe08a] sm:text-[9px]">
              PRÓXIMO: {at.tipo === 'finta' ? 'FINTA' : at.tipo === 'corpo' ? `${bot.escudo[0]} ESPELHO` : `${bot.esquiva[0]} LAMPEJO`}
              {(at.combo ?? 1) > 1 && ` ×${at.combo}`}
            </span>
          )}
          {/* REDE E TRIDENTE: a rede jogada por cima dele */}
          {naRede && !vencido && (
            <svg viewBox="0 0 20 20" className="rede-cai pointer-events-none absolute inset-[-8%] h-[116%] w-[116%]" aria-hidden>
              {[2, 6, 10, 14, 18].map((p) => (
                <g key={p} stroke="#d8c8a0" strokeWidth="0.6" opacity="0.9">
                  <line x1={p} y1="0" x2={p - 2} y2="20" />
                  <line x1="0" y1={p} x2="20" y2={p + 1} />
                </g>
              ))}
            </svg>
          )}
        </div>
        </div>

        {/* ECLIPSE: a lua cobre o sol, o céu escurece e o inimigo erra os próximos golpes */}
        {rec.cego > 0 && fase === 'luta' && (
          <>
            <div className="eclipse-tela pointer-events-none absolute inset-0 z-[14]" aria-hidden />
            <span className="pointer-events-none absolute left-[70%] top-[18%] z-20 -translate-x-1/2 font-pixel text-[8px] text-[#d8c8ff] [text-shadow:1px_1px_0_#000] sm:text-xs">
              CEGO: {'X'.repeat(rec.cego)}
            </span>
          </>
        )}

        {/* As cópias falsas do Arquivista: nas fintas, são elas que tremem e brilham */}
        {modo.ilusoes && !vencido &&
          [52, 88].map((x) => (
            <div
              key={x}
              className={`pointer-events-none absolute bottom-[12%] z-[9] -translate-x-1/2 opacity-60 ${ilusao ? 'tremer-t' : 'flutuar'}`}
              style={{ left: `${x}%`, width: `${largura * 0.85}%`, filter: ilusao ? 'drop-shadow(0 0 10px #ffd04a)' : undefined }}
              aria-hidden
            >
              <Sprite grade={ARQUIVISTA} paleta={paletaArquivista(true)} espelhar />
            </div>
          ))}

        {/* Na luta final, o especial chama um aliado que entra correndo */}
        {quemAjuda && aliado && (
          <div key={aliado.id} className="pointer-events-none absolute inset-0 z-20" aria-hidden>
            <div className="entra-esq absolute bottom-[14%] left-[44%] w-[19%] -translate-x-1/2">
              <Retrato quem={quemAjuda} azul={quemAjuda === 'censor'} />
            </div>
            <span className="lute-entra absolute left-1/2 top-[30%] -translate-x-1/2 whitespace-nowrap font-pixel text-xs text-[#f2c14e] [text-shadow:2px_2px_0_#000] sm:text-xl">
              {quemAjuda === 'octavius' ? 'OCTAVIUS: CARGA EM EQUIPE!' : quemAjuda === 'helios' ? 'HELIOS: RAIO DE SOL!' : quemAjuda === 'censor' ? 'O CENSOR: A LUZ AZUL!' : 'CASSIUS: ESCUDO DE LIVROS!'}
            </span>
          </div>
        )}

        {/* No escuro: tudo apagado, só um círculo de luz em volta do herói (ou a arena toda com a LUZ) */}
        {escuro && fase === 'luta' && (
          <div
            className="pointer-events-none absolute inset-0 z-[15] transition-opacity duration-300"
            style={{ background: 'radial-gradient(circle at 22% 70%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.82) 30%), radial-gradient(ellipse at 70% 72%, rgba(40,30,60,0.35) 0%, transparent 22%)', opacity: aceso ? 0 : 1 }}
            aria-hidden
          />
        )}
        {escuro && fase === 'luta' && !aceso && sinal && (
          <span className="pointer-events-none absolute left-[70%] top-[30%] z-20 -translate-x-1/2 font-pixel text-[9px] text-white/80 sm:text-xs">ALGO SE MEXE... (LUZ!)</span>
        )}

        {/* Os PLANOS do Octavius: a cada 7 segundos aparece algo no cenário para usar */}
        {comPlanos && fase === 'luta' && !vencido && (() => {
          const vez = Math.floor(e.tempo / 7000);
          const resto = e.tempo % 7000;
          if (vez < 1 || resto < 3800 || planosUsados.includes(vez)) return null;
          const item = PLANOS[vez % PLANOS.length]!;
          return (
            <button
              key={vez}
              type="button"
              onPointerDown={(ev) => {
                ev.preventDefault();
                desbloquear();
                setPlanosUsados((u) => [...u, vez]);
                setE((s) => usarPlano(s, atributos));
              }}
              className="surgir absolute z-20 flex -translate-x-1/2 flex-col items-center border-2 border-[#f2c14e] bg-black/80 px-2 py-1"
              style={{ left: `${44 + (vez % 3) * 5}%`, top: `${30 + (vez % 2) * 12}%` }}
              aria-label={`Usar o plano: ${item.nome}`}
            >
              <span className="piscar text-2xl sm:text-4xl" aria-hidden>
                <Icone nome={item.icone} className="w-10 sm:w-14" />
              </span>
              <span className="whitespace-nowrap font-pixel text-[7px] text-[#f2c14e] sm:text-[9px]">PLANO: {item.nome}</span>
            </button>
          );
        })()}

        {/* Treino do Ludus: o objetivo e quanto falta */}
        {treino && fase === 'luta' && (
          <span className="absolute left-1/2 top-[30%] z-20 -translate-x-1/2 whitespace-nowrap border-2 border-[#c8962a] bg-black/80 px-2 py-1 font-pixel text-[8px] text-[#f2c14e] sm:text-[11px]">
            {treino.rotulo}: {Math.min(feitos, treino.quantos)}/{treino.quantos}
          </span>
        )}

        {/* Impactos: faíscas, cortes, anéis, clarões */}
        {e.eventos.map((ev) => {
          const x = ev.lado === 'jogador' ? '22%' : '70%';
          if (ev.tipo === 'acerto') return <Impacto key={`fx${ev.id}`} x={x} cor="#ffd04a" corte />;
          if (ev.tipo === 'dano') return <Impacto key={`fx${ev.id}`} x={x} cor="#ff4a3a" />;
          if (ev.tipo === 'bloqueio') return <Impacto key={`fx${ev.id}`} x="30%" cor="#9fe8ff" />;
          if (ev.tipo === 'especial' || ev.tipo === 'aliado') return <Impacto key={`fx${ev.id}`} x="70%" cor="#f2c14e" corte grande />;
          if (ev.tipo === 'riposta') return <Impacto key={`fx${ev.id}`} x="66%" cor="#9fe8ff" corte grande />;
          if (ev.tipo === 'quebra') return <Impacto key={`fx${ev.id}`} x="68%" cor="#ff8a3a" grande />;
          if (ev.tipo === 'plano') return <Impacto key={`fx${ev.id}`} x="70%" cor="#c8962a" grande />;
          if (ev.tipo === 'reflexo') return <Impacto key={`fx${ev.id}`} x="66%" cor="#ffe08a" corte grande />;
          if (ev.tipo === 'citacao') return <Impacto key={`fx${ev.id}`} x="70%" cor="#e0782c" corte grande />;
          if (ev.tipo === 'tropeco') return <Impacto key={`fx${ev.id}`} x="70%" cor="#2aa08a" />;
          if (ev.tipo === 'pagina') return <Impacto key={`fx${ev.id}`} x="30%" cor="#f0dcae" />;
          if (ev.tipo === 'luz') return <Impacto key={`fx${ev.id}`} x="22%" cor="#ffe08a" />;
          if (ev.tipo === 'muralha' || ev.tipo === 'rede' || ev.tipo === 'eclipse') return <Impacto key={`fx${ev.id}`} x="70%" cor={bot.cor} corte grande />;
          return null;
        })}
        {e.eventos.some((ev) => ev.tipo === 'dano' || ev.tipo === 'contra') && <div className="clarao-vermelho pointer-events-none absolute inset-0 z-[19]" aria-hidden />}
        {e.eventos.some((ev) => ev.tipo === 'especial' || ev.tipo === 'fase' || ev.tipo === 'muralha' || ev.tipo === 'rede' || ev.tipo === 'eclipse') && <div className="clarao pointer-events-none absolute inset-0 z-[19] bg-white" aria-hidden />}
        {/* pouca vida: as bordas pulsam vermelho */}
        {fase === 'luta' && j.vida / j.vidaMax < 0.3 && <div className="perigo-bordas pointer-events-none absolute inset-0 z-[18]" aria-hidden />}
        {/* A faixa do especial: o gladiador grande na diagonal e o nome do golpe */}
        {especialAgora && !treino && (
          <div key={especialAgora.id} className="corte-especial pointer-events-none absolute inset-x-0 top-[30%] z-[25] flex h-[34%] items-center overflow-hidden" aria-hidden>
            <div className="corte-faixa absolute inset-0" style={{ background: `linear-gradient(100deg, transparent 0%, ${bot.cor}dd 12%, #120806ee 45%, ${bot.cor}dd 88%, transparent 100%)` }} />
            <div className="corte-heroi relative ml-[8%] w-[18%]">
              <Retrato quem={heroi} />
            </div>
            <span className="corte-nome relative ml-[4%] font-pixel text-sm text-white [text-shadow:3px_3px_0_#000] sm:text-3xl">{NOME_ESPECIAL[especialAgora.tipo]}!</span>
          </div>
        )}
        {/* LUTE! no começo */}
        {fase === 'luta' && e.tempo < 1100 && (
          <span className="lute-entra pointer-events-none absolute left-1/2 top-[38%] z-30 -translate-x-1/2 font-pixel text-3xl text-[#f2c14e] [text-shadow:3px_3px_0_#5a2a12] sm:text-5xl">LUTE!</span>
        )}
        {/* COMBO */}
        {combo >= 3 && fase === 'luta' && (
          <span key={combo} className="combo-pop pointer-events-none absolute left-[46%] top-[24%] z-20 -translate-x-1/2 whitespace-nowrap font-pixel text-[10px] text-[#ffd04a] [text-shadow:2px_2px_0_#000] sm:text-base">
            COMBO ×{combo}
          </span>
        )}

        {/* Números e avisos que sobem */}
        {e.eventos.map((ev) => (
          <span
            key={ev.id}
            className={`subir-sumir pointer-events-none absolute z-20 -translate-x-1/2 whitespace-nowrap font-pixel [text-shadow:2px_2px_0_#000] ${ev.tipo === 'acerto' || ev.tipo === 'dano' ? 'text-sm sm:text-xl' : 'text-[9px] sm:text-sm'}`}
            style={{
              left: ev.lado === 'jogador' ? '22%' : '70%',
              bottom: '58%',
              color: ev.tipo === 'dano' || ev.tipo === 'contra' ? '#ff5a5a' : ev.tipo === 'guarda' || ev.tipo === 'cansado' ? '#bbb' : '#f2c14e',
            }}
          >
            {ev.tipo === "acerto" || ev.tipo === "dano" ? (ev.valor ? `-${ev.valor}` : "NADA ENTRA!") : TEXTO[ev.tipo]}
          </span>
        ))}

        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('luta')} />}
        {fase === 'depois' && <Falas falas={depois ?? []} onFim={onFim} />}
        {fase === 'derrota' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/75 p-3 text-center">
            <p className="font-pixel text-lg text-[#ff5a5a] sm:text-2xl">VOCÊ CAIU</p>
            <p className="max-w-sm text-sm text-white/80">
              {tentativas >= 2
                ? 'Dicas: não gaste fôlego à toa (cuidado com as FINTAS); bater na guarda três vezes faz ele CONTRA-ATACAR; espere o ABERTO e bata duas ou três vezes.'
                : 'Lembre: sinal AMARELO, escudo. VERMELHO, esquiva. E bata quando ele ficar ABERTO.'}
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => {
                tocar('start');
                setTentativas((t) => t + 1);
                // A luta nova conta os acontecimentos do zero: sem isto, os sons ficavam mudos depois de cair.
                visto.current = 0;
                setE(novaLuta(def, atributos));
                setCombo(0);
                setPlanosUsados([]);
                setLuzAte(0);
                setLuzPronta(0);
                setFase('luta');
              }}
              className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent"
            >
              ↻ TENTAR DE NOVO
            </button>
          </div>
        )}
      </Palco>

      {/* Os botões grandes (bons para o iPad) */}
      <div className="botoes-luta grid grid-cols-4 gap-2">
        {(
          [
            ['golpe', bot.icones.golpe, bot.golpe[1], '#e04a3a'],
            ['escudo', bot.icones.escudo, bot.escudo[1], '#ffd04a'],
            ['esquiva', bot.icones.esquiva, bot.esquiva[1], '#7ad0ff'],
            ['especial', bot.icones.especial, bot.especial[1], bot.cor],
          ] as const
        ).map(([acao, icone, nome, cor]) => (
          <button
            key={acao}
            type="button"
            disabled={fase !== 'luta' || (acao === 'especial' && !cheio)}
            onPointerDown={(ev) => {
              ev.preventDefault();
              apertar(acao);
            }}
            className={`pixel-box botao-luta flex select-none flex-col items-center gap-1 pb-2 pt-3 disabled:opacity-40 sm:pb-3 sm:pt-4 ${acao === 'especial' && cheio ? 'pronto' : ''}`}
            style={{ '--cor': cor } as CSSProperties}
            aria-label={nome}
          >
            <span className="medalhao" aria-hidden>
              <Icone nome={icone} className="w-[62%]" />
            </span>
            <span className="font-pixel text-[7px] text-[#f4e2b4] [text-shadow:1px_1px_0_#000] sm:text-[9px]">{nome}</span>
          </button>
        ))}
      </div>
      {/* Capítulo secreto: trocar de gladiador no meio da luta (teclas 1, 2 e 3) */}
      {equipe && (
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(equipe) as Falante[]).map((q, k) => (
            <button
              key={q}
              type="button"
              disabled={fase !== 'luta' || q === heroi}
              onPointerDown={(ev) => {
                ev.preventDefault();
                trocarRef.current(q);
              }}
              className={`pixel-box flex select-none items-center justify-center gap-2 py-2 font-pixel text-[8px] sm:text-[10px] ${q === heroi ? 'troca-ativa text-[#f2c14e]' : 'text-[#f4e2b4]'}`}
              style={{ opacity: q === heroi ? 1 : 0.85 }}
              aria-label={`Trocar para ${NOMES[q]}`}
            >
              <span className="w-6 sm:w-8" aria-hidden>
                <Retrato quem={q} />
              </span>
              {q === heroi ? `▶ ${NOMES[q].toUpperCase()}` : `${k + 1}: ${NOMES[q].toUpperCase()}`}
            </button>
          ))}
        </div>
      )}
      {/* Helios no escuro: a LUZ mostra o sinal do inimigo por alguns segundos */}
      {escuro && (
        <button
          type="button"
          disabled={!podeLuz}
          onPointerDown={(ev) => {
            ev.preventDefault();
            acenderRef.current();
          }}
          className={`pixel-box select-none py-3 font-pixel text-[10px] text-[#ffe08a] disabled:opacity-40 sm:text-xs ${podeLuz && !aceso ? 'animate-pulse' : ''}`}
          style={{ boxShadow: '0 0 0 2px #ffe08a' }}
        >
          LUZ {aceso ? '(ACESA)' : podeLuz ? '(PRONTA: toque para ver o sinal)' : '(recarregando...)'} · tecla U
        </button>
      )}
      {bot.dica && (
        <p className="dica-luta text-center text-[10px] sm:text-xs" style={{ color: bot.cor }}>
          {bot.dica}
        </p>
      )}
      <p className="dica-luta text-center text-[10px] text-muted">
        Amarelo: {bot.escudo[1]} · Vermelho: {bot.esquiva[1]} · {bot.golpe[1]} no ABERTO · cada ação gasta fôlego (barra azul) · cuidado com as fintas · teclado: J, K, L e espaço
      </p>
    </div>
  );
}
