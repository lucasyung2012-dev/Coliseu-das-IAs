import { useState } from 'react';
import type { Lugar, OpcaoEscolha } from '@/game/historia/roteiro';
import { desbloquear } from '@/ui/som';
import { tocar } from '@/ui/somHistoria';
import { Falas, Palco } from './Cenas';

/**
 * Uma ESCOLHA do roteiro (ex.: a rota pelo Mercado das Engrenagens: telhados, esgoto
 * ou feira). Cada opção leva a cenas e lutas diferentes. Depois de escolher, aparecem as
 * falas daquela opção e o jogo segue pela rota escolhida.
 */
export function EscolhaRota({ lugar, pergunta, opcoes, onEscolher }: { lugar: Lugar; pergunta: string; opcoes: OpcaoEscolha[]; onEscolher: (valor: string) => void }) {
  const [escolhida, setEscolhida] = useState<OpcaoEscolha | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <Palco lugar={lugar}>
        {!escolhida && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 p-3 text-center">
            <p className="font-pixel text-[9px] tracking-[0.2em] text-[#ff5a5a] sm:text-xs">ESCOLHA O PLANO</p>
            <p className="max-w-xl font-pixel text-xs text-[#f2c14e] [text-shadow:2px_2px_0_#000] sm:text-lg">{pergunta}</p>
          </div>
        )}
        {escolhida?.falas?.length ? <Falas falas={escolhida.falas} onFim={() => onEscolher(escolhida.valor)} /> : null}
      </Palco>
      {!escolhida && (
        <div className="grid gap-2 sm:grid-cols-3">
          {opcoes.map((o, k) => (
            <button
              key={o.valor}
              type="button"
              onClick={() => {
                desbloquear();
                tocar('selecionar');
                if (o.falas?.length) setEscolhida(o);
                else onEscolher(o.valor);
              }}
              className="pixel-box pixel-hover flex flex-col items-center gap-1 p-3 text-center"
              style={{ boxShadow: `0 0 0 2px ${['#f2c14e', '#4ef0dc', '#ff5ab8'][k % 3]}` }}
            >
              <span className="medalhao font-pixel text-base text-black sm:text-xl" aria-hidden>
                {'ABC'[k]}
              </span>
              <span className="font-pixel text-[10px] text-[#f2c14e] sm:text-xs">
                PLANO {'ABC'[k]}: {o.rotulo.toUpperCase()}
              </span>
              <span className="text-xs text-muted">{o.descricao}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
