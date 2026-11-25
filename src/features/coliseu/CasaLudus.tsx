import { useState } from 'react';
import { CHEFES } from '@/game/historia/chefoesDefs';
import { chefoesVencidos } from '@/game/historia/historiaUnica';
import { INIMIGOS } from '@/game/historia/inimigos';
import { ESTILO_DO_HEROI, type AtributosLuta } from '@/game/historia/luta';
import { CORES_NOTA, NOMES_NOTA } from '@/game/historia/notas';
import type { ConversaLudus, Falante } from '@/game/historia/roteiro';
import { atributosDoSave, guardarNota, type SaveHistoria } from '@/game/historia/saves';
import { desbloquear } from '@/ui/som';
import { tocar } from '@/ui/somHistoria';
import { ChefaoEmEtapas } from './ChefaoEmEtapas';
import { LutaHistoria } from './Luta';
import { Ludus } from './Ludus';

/**
 * O LUDUS COMO CASA (24/11/2026, combinado com o Lucas): depois do Encontro, o Ludus é a casa
 * dos três. Dá para entrar quando quiser (pelo mapa de Roma): o PÁTIO (andar, conversar, o
 * boneco de treino e a forja) e a ARENA DE REVANCHE (lutar de novo com os chefões já vencidos,
 * só pela nota da plateia; a história não muda). Falas em rascunho (o Lucas reescreve).
 */
const CONVERSAS_DA_CASA: ConversaLudus[] = [
  {
    quem: 'brutus',
    rotulo: 'Brutus',
    falas: [
      { quem: 'brutus', texto: 'Treino de manhã, forja de tarde, revanche quando quiserem. Mingau, sempre.' },
      { quem: 'brutus', texto: 'A plateia lembra de cada luta. Quer uma nota melhor? Vai lá na arena de revanche e luta de novo.' },
    ],
  },
  { quem: 'cassius', rotulo: 'Cassius', falas: [{ quem: 'cassius', texto: 'Aqui dentro, pela primeira vez, ninguém manda a gente calar a boca. Só o Brutus, na hora do mingau.' }] },
  { quem: 'octavius', rotulo: 'Octavius', falas: [{ quem: 'octavius', texto: 'Descobri que a Bússola dorme em cima do boneco de treino. O boneco não reclamou.' }] },
  { quem: 'helios', rotulo: 'Helios', falas: [{ quem: 'helios', texto: 'De noite, dá para ver as três estrelas daqui do pátio. Eu conto todo dia. Ainda são três.' }] },
];

/** Os três com o jeito de lutar de cada um (a revanche é sempre depois do Encontro: dá para trocar). */
function equipeDoSave(save: SaveHistoria): Record<'cassius' | 'octavius' | 'helios', AtributosLuta> {
  const base = atributosDoSave(save);
  return { cassius: { ...base, estilo: ESTILO_DO_HEROI.cassius }, octavius: { ...base, estilo: ESTILO_DO_HEROI.octavius }, helios: { ...base, estilo: ESTILO_DO_HEROI.helios } };
}

export function CasaLudus({ save, heroi, onGravar, onSair }: { save: SaveHistoria; heroi: Falante; onGravar: (s: SaveHistoria) => void; onSair: () => void }) {
  const [aba, setAba] = useState<'patio' | 'revanche'>('patio');
  const [lutando, setLutando] = useState<string | null>(null);
  const vencidos = chefoesVencidos(save.capitulo, save.cena);
  const equipe = equipeDoSave(save);

  if (lutando && CHEFES[lutando]) {
    const def = CHEFES[lutando]!;
    return (
      <ChefaoEmEtapas
        key={`revanche-${lutando}`}
        def={def}
        heroi={heroi}
        antes={[{ quem: 'brutus', texto: 'REVANCHE! A plateia quer ver de novo. Aqui só vale a nota.', jeito: 'grito' }]}
        duelo={(quedas) => (
          <LutaHistoria
            lugar={def.arena.lugar}
            inimigo={lutando}
            heroi={heroi}
            antes={[{ quem: heroi, texto: 'Mais uma vez. Agora pela plateia.' }]}
            depois={[{ quem: 'brutus', texto: 'Hunf. Vamos ver o que a plateia achou desta vez.' }]}
            atributos={equipe[heroi as 'cassius'] ?? atributosDoSave(save)}
            equipe={equipe}
            vidaInicial={def.vidaNoDuelo}
            semEntrada
            quedasAntes={quedas}
            onVitoria={(_pecas, nota) => onGravar(guardarNota(save, lutando, nota))}
            onFim={() => setLutando(null)}
          />
        )}
      />
    );
  }

  const botaoAba = (id: 'patio' | 'revanche', nome: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={aba === id}
      onClick={() => {
        desbloquear();
        tocar('pagina');
        setAba(id);
      }}
      className={`pixel-box py-2 font-pixel text-[9px] sm:text-[10px] ${aba === id ? 'aba-ativa text-[#f2c14e]' : 'text-[#f4e2b4]/70'}`}
    >
      {nome}
    </button>
  );

  return (
    <div className="flex flex-col gap-2">
      <div role="tablist" aria-label="Partes do Ludus" className="grid grid-cols-2 gap-2">
        {botaoAba('patio', 'PÁTIO: TREINO E FORJA')}
        {botaoAba('revanche', 'ARENA DE REVANCHE')}
      </div>
      {aba === 'patio' ? (
        <Ludus
          save={save}
          heroi={heroi}
          lugar="ludus-patio"
          objetivo="O Ludus é a casa de vocês. Treine com o Brutus, fale com o ferreiro e converse com quem estiver por aí."
          conversas={CONVERSAS_DA_CASA.filter((c) => c.quem !== heroi)}
          onGravar={onGravar}
          onFim={onSair}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted">Lute de novo com um chefão que você já venceu. A história não muda: só a nota da plateia (fica sempre a melhor).</p>
          {vencidos.length === 0 ? (
            <p className="pixel-box p-3 text-center text-sm text-muted">Nenhum chefão vencido ainda.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2" aria-label="Chefões vencidos">
              {vencidos.map((id) => {
                const nota = save.notas?.[id];
                return (
                  <li key={id} className="pixel-box flex items-center justify-between gap-2 p-2">
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-pixel text-[9px] text-[#f4e2b4] sm:text-[10px]">{(INIMIGOS[id]?.nome ?? id).toUpperCase()}</span>
                      <span className="font-pixel text-[8px] sm:text-[9px]" style={{ color: nota ? CORES_NOTA[nota - 1] : '#8a8276' }}>
                        {nota ? `MELHOR NOTA: ${NOMES_NOTA[nota - 1]}` : 'SEM NOTA AINDA'}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        desbloquear();
                        tocar('trombeta');
                        setLutando(id);
                      }}
                      className="pixel-box shrink-0 px-3 py-1.5 font-pixel text-[9px] text-[#f2c14e]"
                    >
                      LUTAR
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
