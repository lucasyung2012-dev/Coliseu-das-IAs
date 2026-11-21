import { useEffect, useState, type ReactNode } from 'react';
import { NOMES, type EmCena, type Fala, type Falante, type Lugar, type PontoExplorar, type Quadro } from '@/game/historia/roteiro';
import { prefereMenosMovimento } from '@/ui/movimento';
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

/** Texto aparecendo letra por letra (o toque completa na hora). */
function useDigitando(texto: string, chave: number): [string, boolean, () => void] {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    if (prefereMenosMovimento()) {
      setN(texto.length);
      return;
    }
    const id = window.setInterval(() => setN((x) => (x >= texto.length ? x : x + 1)), 28);
    return () => window.clearInterval(id);
  }, [chave]);
  return [texto.slice(0, n), n >= texto.length, () => setN(texto.length)];
}

const ENTRADA: Record<NonNullable<EmCena['entrada']>, string> = { esq: 'entra-esq', dir: 'entra-dir', cima: 'cair-de-cima', surgir: 'surgir' };
const EFEITO_PERSONAGEM: Record<NonNullable<EmCena['efeito']>, string> = { tremer: 'tremer', brilhar: 'brilho-heroi', apagar: 'apagar-ia', caido: 'caido', pequeno: '' };

/**
 * Cutscene: quadros com faixas de cinema, cenário se mexendo devagar, personagens
 * entrando em cena, efeitos (clarão, tremor, fogo, faíscas, festa) e o texto
 * aparecendo letra por letra. Toque para completar/seguir; PULAR vai até o fim.
 */
export function Cutscene({ quadros, onFim }: { quadros: Quadro[]; onFim: () => void }) {
  const [i, setI] = useState(0);
  const q = quadros[i];
  const [mostrado, completo, completar] = useDigitando(q?.texto ?? '', i);
  useEffect(() => {
    if (!q) onFim();
    else if (q.som) tocar(q.som);
  }, [q]);
  if (!q) return null;
  const seguir = () => {
    desbloquear();
    if (!completo) return completar();
    tocar('clique');
    setI((n) => n + 1);
  };
  const elenco: EmCena[] = q.personagens ?? (q.quem && q.quem !== 'narrador' && q.quem !== 'arauto' && q.quem !== 'povo' ? [{ quem: q.quem, x: 50, entrada: 'surgir' }] : []);
  const titulo = q.lugar === 'titulo';
  return (
    <div className={`pixel-box relative aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9] ${q.efeito === 'tremor' ? 'tremer-forte' : ''}`}>
      {/* o cenário, se aproximando devagar */}
      <div key={`bg-${i}`} className={`absolute inset-0 ${q.efeito === 'zoom' ? 'cena-aproxima' : 'cena-respira'}`}>
        <CenarioHistoria lugar={q.lugar} />
      </div>
      {/* os personagens em cena */}
      {elenco.map((p, k) => (
        <div
          key={`${i}-${k}-${p.quem}`}
          className={`absolute bottom-[30%] z-10 -translate-x-1/2 sm:bottom-[26%] ${p.entrada ? ENTRADA[p.entrada] : ''}`}
          style={{ left: `${p.x}%`, width: `${p.tamanho ?? 14}%` }}
          aria-hidden
        >
          <div className={p.efeito ? EFEITO_PERSONAGEM[p.efeito] : 'respirar'}>
            <Retrato quem={p.quem} espelhar={p.espelhar} azul={p.azul} />
          </div>
        </div>
      ))}
      {/* efeitos */}
      {q.efeito === 'clarao' && <div key={`fx-${i}`} className="clarao pointer-events-none absolute inset-0 z-20 bg-white" />}
      {q.efeito === 'escuro' && <div className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(circle,transparent_30%,rgba(0,0,0,0.85))]" />}
      {(q.efeito === 'fogo' || q.efeito === 'faiscas' || q.efeito === 'festa') &&
        Array.from({ length: 16 }, (_, k) => (
          <span
            key={`${i}-p${k}`}
            className={`pointer-events-none absolute z-[6] ${q.efeito === 'festa' ? 'comemora-cair top-0 h-1.5 w-1.5' : 'brasa-subindo bottom-0 h-1 w-1'}`}
            style={{
              left: `${(k * 37 + 11) % 100}%`,
              animationDelay: `${(k * 211) % 1600}ms`,
              background: q.efeito === 'festa' ? ['#ff5ab8', '#4ef0dc', '#f2c14e', '#ffffff'][k % 4] : q.efeito === 'fogo' ? '#ff8a3a' : '#ffd04a',
            }}
            aria-hidden
          />
        ))}
      {/* faixas de cinema */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[15] h-[7%] bg-black" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-[7%] bg-black" />
      {titulo ? (
        <button type="button" autoFocus onClick={seguir} className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 text-center">
          <span className="abertura-pedra font-pixel text-xl text-[#f2c14e] [text-shadow:3px_3px_0_#5a2a12] sm:text-4xl">COLISEU DAS IAS</span>
          <span className="surgir font-pixel text-[9px] text-white sm:text-sm">A LEI DA RESPOSTA ÚNICA</span>
          <span className="piscar mt-4 font-pixel text-[8px] text-[#f2c14e]">TOQUE PARA COMEÇAR ▶</span>
        </button>
      ) : (
        <button
          type="button"
          autoFocus
          onClick={seguir}
          className="absolute inset-x-2 bottom-[8%] z-20 border-2 border-[#c8962a] bg-black/85 p-2 text-center sm:inset-x-8 sm:p-3"
        >
          {q.quem && NOMES[q.quem] && <span className="block font-pixel text-[8px] text-[#f2c14e] sm:text-[10px]">{NOMES[q.quem].toUpperCase()}</span>}
          <span className="block min-h-[2.6em] text-sm leading-snug text-white sm:text-lg">{mostrado}</span>
          <span className={`mt-1 block font-pixel text-[8px] text-[#f2c14e] ${completo ? 'piscar' : 'opacity-0'}`}>TOQUE PARA SEGUIR ▶</span>
        </button>
      )}
      <button type="button" onClick={onFim} className="absolute right-2 top-[8%] z-30 bg-black/60 px-2 py-1 font-pixel text-[8px] text-white/70 hover:text-white">
        PULAR ▶▶
      </button>
    </div>
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
