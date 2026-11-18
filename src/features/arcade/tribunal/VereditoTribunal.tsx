import { useEffect, useRef, useState } from 'react';
import { PERSONAGENS } from '@/game/personagens';
import { JURADOS } from '@/game/jurados';
import { nivelMaestria, obterProgresso, registrarPartida, type Partida } from '@/game/progresso';
import { FALAS_VITORIA, recompensasNovas, visualDoNivel } from '@/game/maestria';
import GladiadorEnfeitado from '@/ui/pixel/GladiadorEnfeitado';
import { FALAS_PRETOR } from '@/game/tribunal/temas';
import { cartaDecisiva, veredito, type EstadoTribunal, type Voto } from '@/game/tribunal/motor';
import { JuradoPixel } from '@/ui/pixel/Personagens';
import { PretorDestaque, VERDE, VERMELHO } from './visual';
import { prefereMenosMovimento } from '@/ui/movimento';
import { desbloquear, tocar } from '@/ui/som';
import { Faiscas } from '../cenas/Palco';

const PAUSA_VOTO = 700;

/** Martelo, votos revelados cadeira por cadeira e o resultado com troféus, XP e o porquê de cada voto. */
export default function VereditoTribunal({
  estado: e,
  treino,
  onRevanche,
  onSair,
}: {
  estado: EstadoTribunal;
  treino: boolean;
  onRevanche: () => void;
  onSair: () => void;
}) {
  const v = veredito(e);
  const [revelados, setRevelados] = useState(() => (prefereMenosMovimento() ? e.jurados.length : 0));
  const [partida, setPartida] = useState<Partida | null>(null);
  const registrada = useRef(false);
  const fim = revelados >= e.jurados.length;

  // Registra a partida uma vez só (o StrictMode roda os efeitos duas vezes em desenvolvimento).
  useEffect(() => {
    if (registrada.current) return;
    registrada.current = true;
    setPartida(
      registrarPartida({
        modo: 'tribunal',
        ia: e.ia,
        rival: e.rival,
        venceu: v.resultado === 'vitoria',
        empate: v.resultado === 'empate',
        treino,
        dilema: e.dilema.pergunta,
      }),
    );
    tocar('martelo');
  }, []);

  useEffect(() => {
    if (fim) return;
    const id = window.setTimeout(() => {
      tocar('jurado');
      setRevelados((n) => n + 1);
    }, PAUSA_VOTO + (revelados === 0 ? 600 : 0));
    return () => window.clearTimeout(id);
  }, [revelados, fim]);

  useEffect(() => {
    if (!fim) return;
    tocar(v.resultado === 'vitoria' ? 'vitoria' : v.resultado === 'derrota' ? 'derrota' : 'clique');
  }, [fim]);

  const voce = PERSONAGENS[e.ia];
  const dele = PERSONAGENS[e.rival];
  const titulo = v.resultado === 'vitoria' ? 'VITÓRIA!' : v.resultado === 'derrota' ? 'DERROTA' : 'EMPATE';

  return (
    <div className="flex flex-col gap-5">
      <PretorDestaque fala={FALAS_PRETOR.veredito}>
          <p className="mt-2 font-pixel text-lg tabular-nums">
            <span style={{ color: VERDE }}>{Math.min(v.jogador, contar(e, revelados, 'jogador'))}</span>
            <span className="text-muted"> × </span>
            <span style={{ color: VERMELHO }}>{Math.min(v.rival, contar(e, revelados, 'rival'))}</span>
          </p>
      </PretorDestaque>

      <ul className="grid grid-cols-5 gap-1.5 sm:gap-3" aria-label="Votos do júri">
        {e.jurados.map((j, i) => {
          const voto = v.votos[j]!;
          const aberto = i < revelados;
          const cor = voto === 'jogador' ? VERDE : voto === 'rival' ? VERMELHO : 'rgb(var(--line))';
          return (
            <li
              key={j}
              className="pixel-box flex flex-col items-center p-1.5 text-center transition-all duration-300 sm:p-2"
              style={aberto ? { background: `color-mix(in srgb, ${cor} 28%, rgb(var(--surface)))`, boxShadow: `0 0 0 3px ${cor}` } : undefined}
            >
              <div className={`w-9 sm:w-14 ${aberto ? 'surgir' : ''}`}>
                <JuradoPixel jurado={j} />
              </div>
              <p className="mt-1 truncate font-pixel text-[6px] sm:text-[8px]">{JURADOS[j].nome.toUpperCase()}</p>
              <p className="mt-1 font-pixel text-[7px] sm:text-[9px]" style={{ color: aberto ? cor : undefined }}>
                {aberto ? (voto === 'jogador' ? 'VOCÊ' : voto === 'rival' ? 'RIVAL' : 'DIVIDIDO') : '?'}
              </p>
            </li>
          );
        })}
      </ul>

      {fim && (
        <section className="pixel-box relative flex flex-col items-center gap-3 overflow-hidden p-5 text-center" aria-live="polite">
          {v.resultado === 'vitoria' && <Faiscas x={50} y={20} />}
          <h2
            className={`pancada neon font-pixel text-3xl sm:text-5xl ${v.resultado === 'derrota' ? 'text-accent-2' : 'text-accent'}`}
          >
            {titulo}
          </h2>
          <p className="text-sm text-muted">
            {v.jogador} voto{v.jogador === 1 ? '' : 's'} para {voce.gladiador} · {v.rival} para {dele.gladiador}
          </p>
          {partida && (
            <p className="font-pixel text-xs tabular-nums sm:text-sm">
              {treino ? 'MODO TREINO · NÃO VALE TROFÉUS' : <>🏆 {partida.trofeus > 0 ? `+${partida.trofeus}` : partida.trofeus} · ⭐ +{partida.xp} XP</>}
            </p>
          )}
          {partida && <Conquistas e={e} partida={partida} venceu={v.resultado === 'vitoria'} />}

          <ul className="mt-2 w-full max-w-xl space-y-1.5 text-left text-sm">
            {e.jurados.map((j) => (
              <li key={j}>
                <span className="font-semibold" style={{ color: JURADOS[j].toga }}>
                  {JURADOS[j].nome}:
                </span>{' '}
                {porque(e, j, v.votos[j]!, voce.gladiador, dele.gladiador)}
              </li>
            ))}
          </ul>

          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              autoFocus
              onClick={() => {
                desbloquear();
                tocar('clique');
                onRevanche();
              }}
              className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent"
            >
              ↻ REVANCHE
            </button>
            <button
              type="button"
              onClick={() => {
                tocar('clique');
                onSair();
              }}
              className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px]"
            >
              ◀ ARCADE
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function contar(e: EstadoTribunal, revelados: number, quem: Voto): number {
  const v = veredito(e);
  return e.jurados.slice(0, revelados).filter((j) => v.votos[j] === quem).length;
}

function porque(e: EstadoTribunal, j: Parameters<typeof cartaDecisiva>[1], voto: Voto, voce: string, rival: string): string {
  if (voto === 'abstencao') return 'ficou dividido e não votou.';
  const carta = cartaDecisiva(e, j, voto);
  const quem = voto === 'jogador' ? voce : rival;
  return carta ? `votou em ${quem}, convencido por "${carta.titulo}".` : `votou em ${quem}.`;
}

/**
 * O que a partida rendeu de Maestria: na vitória, a pose e a fala (se já
 * liberadas); e, se o nível subiu, o aviso com as recompensas novas.
 */
function Conquistas({ e, partida, venceu }: { e: EstadoTribunal; partida: Partida; venceu: boolean }) {
  const xpDepois = obterProgresso().xp[e.ia];
  const antes = nivelMaestria(xpDepois - partida.xp);
  const depois = nivelMaestria(xpDepois);
  const visual = visualDoNivel(depois);
  const novas = recompensasNovas(antes, depois);
  return (
    <>
      {venceu && (visual.pose || visual.fala) && (
        <div className="flex items-end gap-3">
          {visual.pose && (
            <div className="pulos-vitoria w-16 sm:w-20">
              <GladiadorEnfeitado ia={e.ia} parado />
            </div>
          )}
          {visual.fala && <p className="mb-2 max-w-[14rem] rounded bg-black/60 px-3 py-2 text-left text-sm italic">"{FALAS_VITORIA[e.ia]}"</p>}
        </div>
      )}
      {depois > antes && (
        <div className="surgir pixel-box w-full max-w-md p-3" style={{ boxShadow: '0 0 0 3px rgb(242 193 78), 0 0 24px -4px rgb(242 193 78)' }}>
          <p className="font-pixel text-[10px] text-[rgb(242_193_78)]">⭐ MAESTRIA {depois}!</p>
          {novas.map((r) => (
            <p key={r.nome} className="mt-1 text-sm">
              {r.icone} <strong>{r.nome}</strong>: <span className="text-muted">{r.descricao}</span>
            </p>
          ))}
        </div>
      )}
    </>
  );
}
