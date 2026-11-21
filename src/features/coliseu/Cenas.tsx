import { useEffect, useState, type ReactNode } from 'react';
import { NOMES, type Fala, type Falante, type Lugar, type PontoExplorar, type Quadro } from '@/game/historia/roteiro';
import { desbloquear, tocar } from '@/ui/som';
import { CenarioHistoria, Retrato } from './Cenarios';

/** A caixa de fala: retrato, nome e texto. Toque para seguir. */
export function CaixaFala({ fala, onSeguir }: { fala: Fala; onSeguir: () => void }) {
  return (
    <button
      type="button"
      autoFocus
      onClick={() => {
        desbloquear();
        tocar('clique');
        onSeguir();
      }}
      className="absolute inset-x-2 bottom-2 z-20 flex items-end gap-3 border-2 border-[#c8962a] bg-black/85 p-2 text-left sm:inset-x-4 sm:bottom-4 sm:p-3"
    >
      {fala.quem !== 'narrador' && (
        <span className="w-10 shrink-0 sm:w-16" aria-hidden>
          <Retrato quem={fala.quem} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        {NOMES[fala.quem] && <span className="block font-pixel text-[8px] text-[#f2c14e] sm:text-[10px]">{NOMES[fala.quem].toUpperCase()}</span>}
        <span className={`mt-1 block text-sm leading-snug sm:text-base ${fala.quem === 'narrador' ? 'italic text-muted' : 'text-white'}`}>{fala.texto}</span>
      </span>
      <span className="piscar shrink-0 font-pixel text-[9px] text-[#f2c14e]">▶</span>
    </button>
  );
}

/** Uma sequência de falas (usada nas conversas, antes e depois das lutas). */
export function Falas({ falas, onFim }: { falas: Fala[]; onFim: () => void }) {
  const [i, setI] = useState(0);
  const fala = falas[i];
  useEffect(() => {
    if (!fala) onFim();
  }, [fala]);
  if (!fala) return null;
  return <CaixaFala key={i} fala={fala} onSeguir={() => setI((n) => n + 1)} />;
}

/** O palco das cenas: o cenário em pixel, sempre no mesmo formato. */
export function Palco({ lugar, children, className = '' }: { lugar: Lugar; children?: ReactNode; className?: string }) {
  return (
    <div className={`pixel-box relative aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9] ${className}`}>
      <CenarioHistoria lugar={lugar} />
      {children}
    </div>
  );
}

/** Cutscene: quadros com texto; toque para seguir, PULAR para ir até o fim. */
export function Cutscene({ quadros, onFim }: { quadros: Quadro[]; onFim: () => void }) {
  const [i, setI] = useState(0);
  const q = quadros[i];
  useEffect(() => {
    if (!q) onFim();
  }, [q]);
  if (!q) return null;
  const seguir = () => {
    desbloquear();
    tocar('clique');
    setI((n) => n + 1);
  };
  return (
    <Palco lugar={q.lugar}>
      {q.quem && q.quem !== 'narrador' && (
        <div key={`${i}-${q.quem}`} className="surgir absolute bottom-[40%] left-1/2 w-[16%] -translate-x-1/2 sm:bottom-[34%] sm:w-[13%]" aria-hidden>
          <Retrato quem={q.quem} />
        </div>
      )}
      <button
        type="button"
        autoFocus
        onClick={seguir}
        className="absolute inset-x-2 bottom-2 z-20 border-2 border-[#c8962a] bg-black/85 p-3 text-center sm:inset-x-6 sm:bottom-4"
      >
        {q.quem && NOMES[q.quem] && <span className="block font-pixel text-[8px] text-[#f2c14e] sm:text-[10px]">{NOMES[q.quem].toUpperCase()}</span>}
        <span key={i} className="surgir block text-sm leading-snug text-white sm:text-lg">
          {q.texto}
        </span>
        <span className="piscar mt-1 block font-pixel text-[8px] text-[#f2c14e]">TOQUE PARA SEGUIR ▶</span>
      </button>
      <button type="button" onClick={onFim} className="absolute right-2 top-2 z-30 bg-black/60 px-2 py-1 font-pixel text-[8px] text-white/70 hover:text-white">
        PULAR ▶▶
      </button>
    </Palco>
  );
}

/**
 * Andar e explorar: o gladiador anda até o ponto tocado, e a conversa daquele ponto
 * aparece. Os pontos obrigatórios liberam o SEGUIR.
 */
export function Explorar({
  lugar,
  objetivo,
  pontos,
  heroi,
  onFim,
}: {
  lugar: Lugar;
  objetivo: string;
  pontos: PontoExplorar[];
  heroi: Falante;
  onFim: () => void;
}) {
  const [x, setX] = useState(6);
  const [vistos, setVistos] = useState<string[]>([]);
  const [falando, setFalando] = useState<PontoExplorar | null>(null);
  const [andando, setAndando] = useState(false);
  const faltam = pontos.filter((p) => p.obrigatorio && !vistos.includes(p.id));
  const ir = (p: PontoExplorar) => {
    if (andando || falando) return;
    desbloquear();
    tocar('passos');
    setAndando(true);
    // Para um pouco antes do ponto, do lado de onde veio.
    const alvo = p.x > x ? p.x - 8 : p.x + 8;
    setX(alvo);
    window.setTimeout(() => {
      setAndando(false);
      setFalando(p);
    }, 650);
  };
  return (
    <div className="flex flex-col gap-2">
      <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">
        🎯 {objetivo} {faltam.length === 0 && '✔'}
      </p>
      <Palco lugar={lugar}>
        {pontos.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => ir(p)}
            aria-label={p.rotulo}
            className="absolute bottom-[22%] z-10 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${p.x}%`, width: p.personagem ? '9%' : 'auto' }}
          >
            {p.personagem && (
              <span className="block w-full" aria-hidden>
                <Retrato quem={p.personagem} espelhar />
              </span>
            )}
            <span
              className={`mt-1 whitespace-nowrap border-2 bg-black/80 px-1.5 py-0.5 font-pixel text-[7px] sm:text-[9px] ${vistos.includes(p.id) ? 'border-white/30 text-white/60' : `border-[#f2c14e] text-white ${p.obrigatorio ? 'piscar' : ''}`}`}
            >
              {p.icone} {p.rotulo}
            </span>
          </button>
        ))}
        {/* o gladiador */}
        <div
          className={`absolute bottom-[14%] z-10 w-[9%] -translate-x-1/2 transition-[left] duration-[650ms] ease-linear ${andando ? 'marchar' : ''}`}
          style={{ left: `${x}%` }}
          aria-hidden
        >
          <Retrato quem={heroi} />
        </div>
        {falando && (
          <Falas
            falas={falando.falas}
            onFim={() => {
              setVistos((v) => (v.includes(falando.id) ? v : [...v, falando.id]));
              setFalando(null);
            }}
          />
        )}
      </Palco>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted">Toque nos pontos para andar até eles.</p>
        <button
          type="button"
          disabled={faltam.length > 0 || !!falando}
          onClick={() => {
            tocar('selecionar');
            onFim();
          }}
          className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent disabled:opacity-40"
        >
          SEGUIR ▶
        </button>
      </div>
    </div>
  );
}
