import { lazy, Suspense } from 'react';
import { useProgresso, nivelMaestria, recordeDe, useHistoriaVisual } from '@/game/progresso';
import { indiceLiga } from '@/game/ligas';
import { visualDoNivel, type Visual } from '@/game/maestria';
import type { IaId } from '@/game/personagens';
import type { VisualHistoria } from '@/game/premiosHistoria';
import { GladiadorPixel } from './Personagens';
import Sprite from './Sprite';
import { LOUROS, PALETA_OURO } from './sprites';

// O companheiro da História (Gaivota, Lumen ou as páginas): carregado só quando está em uso.
const Companheiro = lazy(() => import('./Companheiro'));

/** Tamanho do gladiador em cada liga: ele cresce conforme sobe (Recrutas → Imperadores). */
const ESCALA_POR_LIGA = [0.82, 0.88, 0.94, 1, 1.08];

/** Troféus da liga Imperadores: o recorde que dá a coroa radiada (prêmio do mapa). */
export const TROFEUS_IMPERADOR = 7000;

/**
 * Coroa dos Imperadores (prêmio da liga Imperadores no mapa), uma de cada combatente,
 * todas coroas romanas de verdade e diferentes dos louros da Maestria 100:
 * Cassius = coroa cívica de carvalho (com bolotas), Octavius = coroa naval (com
 * proas de navio), Helios = coroa radiada (pontas como raios de sol).
 */
const COROAS: Record<IaId, { grade: string[]; paleta: Record<string, string> }> = {
  claude: {
    grade: ['.G.G..G..G.G.', 'GGGGGGGGGGGGG', 'GBGGGBGBGGGBG', 'DDDDDDDDDDDDD'],
    paleta: { G: '#4a8a3a', B: '#c8862a', D: '#2e5a24' },
  },
  chatgpt: {
    grade: ['.Y...Y...Y...', 'YYY.YYY.YYY..', 'YYYYYYYYYYYYY', 'YAYYAYYAYYAYY', 'DDDDDDDDDDDDD'],
    paleta: { Y: '#f2c14e', A: '#2a6aa0', D: '#b07a1e' },
  },
  gemini: {
    grade: ['..Y...Y...Y..', '.YY..YYY..YY.', 'YYYYYYYYYYYYY', 'YRYYRYYYRYYRY', 'DDDDDDDDDDDDD'],
    paleta: { Y: '#f2c14e', R: '#e0283c', D: '#b07a1e' },
  },
};

/** Liga, visual de Maestria e se a IA já chegou aos Imperadores (recorde), pelo progresso salvo. */
export function useAparencia(ia: IaId): { liga: number; visual: Visual; imperador: boolean } {
  const p = useProgresso();
  return { liga: indiceLiga(p.trofeus[ia]), visual: visualDoNivel(nivelMaestria(p.xp[ia])), imperador: recordeDe(p, ia) >= TROFEUS_IMPERADOR };
}

interface Props {
  ia: IaId;
  /** Retrato (Arcade e perfil): mostra a moldura da Maestria. */
  comMoldura?: boolean;
  espelhar?: boolean;
  /** Sem a "respiração" (quando o pai já anima o gladiador). */
  parado?: boolean;
  /** Aparência de outro jogador (Duelo online): no lugar da que está salva neste aparelho. */
  aparencia?: { liga: number; visual: Visual; imperador: boolean };
}

/**
 * O gladiador com tudo o que ele conquistou: equipamento e tamanho da liga
 * (troféus) e armadura, aura, moldura e coroa da Maestria.
 */
export default function GladiadorEnfeitado({ ia, comMoldura, espelhar, parado, aparencia }: Props) {
  const daqui = useAparencia(ia);
  const { liga, visual, imperador } = aparencia ?? daqui;
  // Prêmios da História (só deste aparelho: no Duelo online, o rival não mostra os dele).
  const historia = useHistoriaVisual(ia);
  const hist: VisualHistoria = aparencia ? {} : historia;
  const corpo = (
    <div className="relative">
      {visual.aura !== 'nenhuma' && <div className={`aura-${visual.aura} aura-${ia} pointer-events-none absolute inset-[-12%] rounded-full`} aria-hidden />}
      <div style={{ transform: `scale(${ESCALA_POR_LIGA[liga]})`, transformOrigin: '50% 100%' }}>
        <div className={parado ? '' : 'respirar'}>
          <GladiadorPixel ia={ia} liga={liga} armadura={visual.armadura} espelhar={espelhar} />
        </div>
      </div>
      {hist.companheiro && (
        <Suspense fallback={null}>
          <Companheiro qual={hist.companheiro} espelhar={espelhar} />
        </Suspense>
      )}
      {imperador ? (
        <div className="pointer-events-none absolute left-1/2 top-[-6%] w-[40%] -translate-x-1/2 drop-shadow-[0_0_4px_#f2c14e]" aria-hidden>
          <Sprite grade={COROAS[ia].grade} paleta={COROAS[ia].paleta} />
        </div>
      ) : visual.coroa && (
        <div className="pointer-events-none absolute left-1/2 top-[-4%] flex w-[46%] -translate-x-1/2 justify-center gap-[4%]" aria-hidden>
          <div className="w-1/2">
            <Sprite grade={LOUROS} paleta={PALETA_OURO} />
          </div>
          <div className="w-1/2">
            <Sprite grade={LOUROS} paleta={PALETA_OURO} espelhar />
          </div>
        </div>
      )}
    </div>
  );
  // O título secreto "Os Três" dá a moldura de ouro com brilho.
  if (comMoldura && hist.molduraOuro) return <div className="moldura-ouro moldura-tres p-2">{corpo}</div>;
  if (!comMoldura || visual.moldura === 'nenhuma') return corpo;
  return <div className={`moldura-${visual.moldura} p-2`}>{corpo}</div>;
}
