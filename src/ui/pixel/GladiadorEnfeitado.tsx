import { useProgresso, nivelMaestria } from '@/game/progresso';
import { indiceLiga } from '@/game/ligas';
import { visualDoNivel, type Visual } from '@/game/maestria';
import type { IaId } from '@/game/personagens';
import { GladiadorPixel } from './Personagens';
import Sprite from './Sprite';
import { LOUROS, PALETA_OURO } from './sprites';

/** Tamanho do gladiador em cada liga: ele cresce conforme sobe (Recrutas → Imperadores). */
const ESCALA_POR_LIGA = [0.82, 0.88, 0.94, 1, 1.08];

/** Liga e visual de Maestria de uma IA, pelo progresso salvo. */
export function useAparencia(ia: IaId): { liga: number; visual: Visual } {
  const p = useProgresso();
  return { liga: indiceLiga(p.trofeus[ia]), visual: visualDoNivel(nivelMaestria(p.xp[ia])) };
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
  const { liga, visual } = useAparencia(ia);
  const corpo = (
    <div className="relative">
      {visual.aura !== 'nenhuma' && <div className={`aura-${visual.aura} pointer-events-none absolute inset-[-12%] rounded-full`} aria-hidden />}
      <div style={{ transform: `scale(${ESCALA_POR_LIGA[liga]})`, transformOrigin: '50% 100%' }}>
        <div className={parado ? '' : 'respirar'}>
          <GladiadorPixel ia={ia} liga={liga} armadura={visual.armadura} espelhar={espelhar} />
        </div>
      </div>
      {visual.coroa && (
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
