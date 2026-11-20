import { useProgresso, nivelMaestria, recordeDe } from '@/game/progresso';
import { indiceLiga } from '@/game/ligas';
import { visualDoNivel, type Visual } from '@/game/maestria';
import type { IaId } from '@/game/personagens';
import { GladiadorPixel } from './Personagens';
import Sprite from './Sprite';
import { LOUROS, PALETA_OURO } from './sprites';

/** Tamanho do gladiador em cada liga: ele cresce conforme sobe (Recrutas → Imperadores). */
const ESCALA_POR_LIGA = [0.82, 0.88, 0.94, 1, 1.08];

/** Troféus da liga Imperadores: o recorde que dá a coroa radiada (prêmio do mapa). */
export const TROFEUS_IMPERADOR = 7000;

/**
 * Coroa radiada do Imperador (prêmio da liga Imperadores no mapa): pontas de ouro
 * como raios de sol e pedras vermelhas na faixa, a coroa dos imperadores nas
 * moedas romanas. Diferente da coroa de louros do Mestre (Maestria 100).
 */
const COROA_RADIADA = ['..Y...Y...Y..', '.YY..YYY..YY.', 'YYYYYYYYYYYYY', 'YRYYRYYYRYYRY', 'DDDDDDDDDDDDD'];

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
}

/**
 * O gladiador com tudo o que ele conquistou: equipamento e tamanho da liga
 * (troféus) e armadura, aura, moldura e coroa da Maestria.
 */
export default function GladiadorEnfeitado({ ia, comMoldura, espelhar, parado }: Props) {
  const { liga, visual, imperador } = useAparencia(ia);
  const corpo = (
    <div className="relative">
      {visual.aura !== 'nenhuma' && <div className={`aura-${visual.aura} aura-${ia} pointer-events-none absolute inset-[-12%] rounded-full`} aria-hidden />}
      <div style={{ transform: `scale(${ESCALA_POR_LIGA[liga]})`, transformOrigin: '50% 100%' }}>
        <div className={parado ? '' : 'respirar'}>
          <GladiadorPixel ia={ia} liga={liga} armadura={visual.armadura} espelhar={espelhar} />
        </div>
      </div>
      {imperador ? (
        <div className="pointer-events-none absolute left-1/2 top-[-6%] w-[40%] -translate-x-1/2 drop-shadow-[0_0_4px_#f2c14e]" aria-hidden>
          <Sprite grade={COROA_RADIADA} paleta={{ Y: '#f2c14e', R: '#e0283c', D: '#b07a1e' }} />
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
  if (!comMoldura || visual.moldura === 'nenhuma') return corpo;
  return <div className={`moldura-${visual.moldura} p-2`}>{corpo}</div>;
}
