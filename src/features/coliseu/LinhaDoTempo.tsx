import { useState } from 'react';
import { PERSONAGENS, type IaId } from '@/game/personagens';
import { CAPITULOS } from '@/game/historia/roteiro';
import { chaveCompleta } from '@/game/historia/roteiro4';
import type { SaveHistoria } from '@/game/historia/saves';
import { saveTerminado } from '@/game/premiosHistoria';
import { tocar } from '@/ui/somHistoria';

/**
 * A linha do tempo da História (pedido do Lucas, 21/11/2026: "uma história principal"):
 * os três caminhos acontecem ao mesmo tempo e se cruzam. Um capítulo por linha, os três
 * gladiadores lado a lado, as marcas onde eles se encontram e, no fim, o capítulo
 * secreto "Os Três" como o final de verdade. Capítulo ainda não alcançado aparece "???".
 */
const IAS: IaId[] = ['claude', 'chatgpt', 'gemini'];

/** Onde os caminhos se cruzam (depois de qual capítulo). */
const CRUZAMENTOS: Record<number, string> = {
  3: '✦ No Ludus, os três condenados se conhecem',
  6: '✦ Os três chegam ao Coliseu, cada um pelo seu caminho',
  7: '✦ Os três juntos contra o Titã',
};

/** Até onde cada caminho chegou: o maior capítulo entre os saves daquele gladiador. */
function alcance(saves: SaveHistoria[], ia: IaId): { capitulo: number; terminou: boolean } {
  const meus = saves.filter((s) => !s.secreto && s.gladiador === ia);
  return {
    capitulo: Math.max(0, ...meus.map((s) => s.capitulo)),
    terminou: meus.some(saveTerminado),
  };
}

export function LinhaDoTempo({ saves, segredos }: { saves: SaveHistoria[]; segredos: string[] | undefined }) {
  const [aberta, setAberta] = useState(true);
  const chegou = Object.fromEntries(IAS.map((ia) => [ia, alcance(saves, ia)])) as Record<IaId, { capitulo: number; terminou: boolean }>;
  const temChave = chaveCompleta(segredos);
  const secretoFeito = saves.some((s) => s.secreto && saveTerminado(s));
  const linhas = Math.max(...IAS.map((ia) => CAPITULOS[ia].length));
  return (
    <section aria-label="Linha do tempo da História" className="pixel-box linha-tempo flex flex-col gap-2 p-3 sm:p-4">
      <button
        type="button"
        onClick={() => {
          tocar('pagina');
          setAberta((a) => !a);
        }}
        className="flex items-center justify-between gap-2 text-left"
        aria-expanded={aberta}
      >
        <span className="font-pixel text-[10px] text-[#f2c14e] sm:text-xs">🗺️ A LINHA DO TEMPO</span>
        <span className="font-pixel text-[8px] text-muted">{aberta ? '▲ FECHAR' : '▼ ABRIR'}</span>
      </button>
      {aberta && (
        <>
          <p className="text-xs text-muted">Três condenados, a mesma noite. Os caminhos acontecem juntos e se cruzam. O final de verdade só aparece quando os três terminarem.</p>
          {/* Os três gladiadores no alto de cada coluna */}
          <div className="grid grid-cols-[2.2rem_repeat(3,1fr)] gap-1.5 sm:grid-cols-[3rem_repeat(3,1fr)]">
            <span />
            {IAS.map((ia) => (
              <span key={ia} className="text-center font-pixel text-[7px] sm:text-[9px]" style={{ color: `rgb(${PERSONAGENS[ia].cor})` }}>
                {PERSONAGENS[ia].gladiador.toUpperCase()}
                {chegou[ia].terminou && ' 🏆'}
              </span>
            ))}
            {Array.from({ length: linhas }, (_, k) => {
              const n = k + 1;
              return (
                <Linha key={n} n={n} chegou={chegou} cruzamento={CRUZAMENTOS[n]} />
              );
            })}
          </div>
          {/* O final de verdade: Os Três */}
          <div
            className={`linha-secreta mt-1 flex items-center gap-2 border-2 p-2 ${secretoFeito ? 'border-[#f2c14e]' : temChave ? 'border-[#7ad0ff]' : 'border-dashed border-white/20'}`}
          >
            <span className="text-xl" aria-hidden>
              {secretoFeito ? '🏆' : temChave ? '🔑' : '🔒'}
            </span>
            <span className="flex flex-col">
              <span className={`font-pixel text-[8px] sm:text-[10px] ${secretoFeito || temChave ? 'text-[#f2c14e]' : 'text-white/40'}`}>
                {secretoFeito || temChave ? 'O FINAL: OS TRÊS' : 'O FINAL: ???'}
              </span>
              <span className="text-[11px] text-muted">
                {secretoFeito
                  ? 'Você abriu o segredo. O Coliseu agora é livre.'
                  : temChave
                    ? 'A chave está inteira. Procure a grade no título lá em cima...'
                    : 'Dizem que, depois dos três caminhos, ainda existe um último capítulo.'}
              </span>
            </span>
          </div>
        </>
      )}
    </section>
  );
}

function Linha({ n, chegou, cruzamento }: { n: number; chegou: Record<IaId, { capitulo: number; terminou: boolean }>; cruzamento?: string }) {
  const final = n === 7;
  return (
    <>
      <span className="self-center text-center font-pixel text-[7px] text-white/60 sm:text-[9px]">{final ? 'FIM' : `CAP ${n}`}</span>
      {IAS.map((ia) => {
        const cap = CAPITULOS[ia][n - 1];
        const { capitulo, terminou } = chegou[ia];
        const feito = terminou || capitulo > n;
        const aqui = !terminou && capitulo === n;
        const visto = feito || aqui;
        const cor = `rgb(${PERSONAGENS[ia].cor})`;
        return (
          <div
            key={ia}
            className={`relative flex min-h-[2.6rem] flex-col justify-center border-2 px-1 py-1 text-center ${aqui ? 'linha-aqui' : ''}`}
            style={{ borderColor: visto ? cor : 'rgba(255,255,255,0.12)', background: feito ? `rgb(${PERSONAGENS[ia].cor} / 0.18)` : 'rgba(0,0,0,0.35)' }}
            title={visto && cap ? `${cap.titulo} · ${cap.lugar}` : 'Ainda não'}
          >
            <span className={`text-[9px] leading-tight sm:text-[11px] ${visto ? 'text-white' : 'text-white/30'}`}>{visto && cap ? cap.titulo : '???'}</span>
            {feito && <span className="absolute right-0.5 top-0 text-[9px]" aria-label="Feito">✓</span>}
            {aqui && <span className="font-pixel text-[6px] sm:text-[7px]" style={{ color: cor }}>▶ VOCÊ ESTÁ AQUI</span>}
          </div>
        );
      })}
      {cruzamento && (
        <span className="col-span-4 my-0.5 text-center font-pixel text-[7px] text-[#f2c14e] sm:text-[9px]">{cruzamento}</span>
      )}
    </>
  );
}
