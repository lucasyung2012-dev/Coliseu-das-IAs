import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NOMES, type EmCena, type Fala, type Falante, type Lugar, type PontoExplorar, type Quadro } from '@/game/historia/roteiro';
import { prefereMenosMovimento } from '@/ui/movimento';
import { desbloquear } from '@/ui/som';
import { tocar, voz } from '@/ui/somHistoria';
import { CenarioHistoria, Retrato } from './Cenarios';

/**
 * A caixa de fala: retrato, nome e o texto aparecendo letra por letra, com a "voz"
 * do personagem (um barulhinho próprio). Toque para completar; toque de novo para seguir.
 */
export function CaixaFala({ fala, onSeguir }: { fala: Fala; onSeguir: () => void }) {
  const [mostrado, completo, completar] = useDigitando(fala.texto, 0, fala.quem);
  return (
    <button
      type="button"
      autoFocus
      onClick={() => {
        desbloquear();
        if (!completo) return completar();
        tocar('pagina');
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
        <span className={`mt-1 block text-sm leading-snug sm:text-base ${fala.quem === 'narrador' ? 'italic text-muted' : 'text-white'}`}>
          {mostrado}
          {/* o resto do texto, invisível, para a caixa não mudar de tamanho enquanto digita */}
          <span className="invisible">{fala.texto.slice(mostrado.length)}</span>
        </span>
      </span>
      <span className={`shrink-0 font-pixel text-[9px] text-[#f2c14e] ${completo ? 'piscar' : 'opacity-0'}`}>▶</span>
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
    <div className={`pixel-box palco-historia relative w-full overflow-hidden ${className}`}>
      <CenarioHistoria lugar={lugar} />
      {children}
    </div>
  );
}

/** Texto aparecendo letra por letra (o toque completa na hora), com a voz de quem fala. */
function useDigitando(texto: string, chave: number, quem?: Falante): [string, boolean, () => void] {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    if (prefereMenosMovimento()) {
      setN(texto.length);
      return;
    }
    const id = window.setInterval(() => setN((x) => (x >= texto.length ? x : x + 1)), 28);
    return () => window.clearInterval(id);
  }, [chave, texto]);
  // Cada letra nova faz a "voz" (só enquanto está digitando, não quando o toque completa).
  const anterior = useRef(0);
  useEffect(() => {
    if (n === anterior.current + 1) voz(quem, texto.charAt(n - 1), n);
    anterior.current = n;
  }, [n]);
  return [texto.slice(0, n), n >= texto.length, () => setN(texto.length)];
}

const ENTRADA: Record<NonNullable<EmCena['entrada']>, string> = { esq: 'entra-esq', dir: 'entra-dir', cima: 'cair-de-cima', surgir: 'surgir' };
const EFEITO_PERSONAGEM: Record<NonNullable<EmCena['efeito']>, string> = { tremer: 'tremer', brilhar: 'brilho-heroi', apagar: 'apagar-ia', caido: 'caido', pequeno: '' };
/** Quanto tempo leva para andar 1% da cena. */
const MS_POR_PASSO = 38;

/** Poeirinha nos pés de quem anda. */
function Poeira() {
  return (
    <span className="pointer-events-none absolute -bottom-[2%] left-1/2 h-0 w-0" aria-hidden>
      {[0, 1, 2].map((k) => (
        <span key={k} className="poeira-passo absolute h-1.5 w-1.5 bg-[#d8c8a8]/70 sm:h-2 sm:w-2" style={{ animationDelay: `${k * 160}ms` }} />
      ))}
    </span>
  );
}

/**
 * Um personagem na cutscene: entra, anda de `de` até `x` (marchando e virado
 * para onde vai, levantando poeira) e depois fica respirando ou com o efeito dele.
 */
function Ator({ p }: { p: EmCena }) {
  const anda = p.de !== undefined && p.de !== p.x && !prefereMenosMovimento();
  const dur = anda ? Math.abs(p.x - (p.de ?? p.x)) * MS_POR_PASSO : 0;
  const [pos, setPos] = useState(anda ? (p.de ?? p.x) : p.x);
  const [andando, setAndando] = useState(anda);
  useEffect(() => {
    if (!anda) return;
    const a = window.setTimeout(() => setPos(p.x), 40);
    const b = window.setTimeout(() => setAndando(false), dur + 60);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);
  // Anda virado para onde vai; parado, fica como o roteiro pediu.
  const espelhar = andando ? (p.de ?? 0) > p.x : p.espelhar;
  return (
    <div
      className="absolute bottom-[12%] z-10 -translate-x-1/2"
      style={{ left: `${pos}%`, width: `${p.tamanho ?? 14}%`, transition: anda ? `left ${dur}ms linear` : undefined }}
      aria-hidden
    >
      <div className={`relative ${p.entrada ? ENTRADA[p.entrada] : ''}`}>
        {/* sombra no chão */}
        {p.efeito !== 'apagar' && <span className="absolute -bottom-[3%] left-1/2 h-[6%] w-[70%] -translate-x-1/2 rounded-[50%] bg-black/45" />}
        <div className={andando ? 'andar' : p.efeito ? EFEITO_PERSONAGEM[p.efeito] : 'respirar'}>
          <Retrato quem={p.quem} espelhar={espelhar} azul={p.azul} />
        </div>
        {andando && <Poeira />}
      </div>
    </div>
  );
}

/**
 * Cutscene: quadros com faixas de cinema, cenário se mexendo devagar, personagens
 * entrando em cena, efeitos (clarão, tremor, fogo, faíscas, festa) e o texto
 * aparecendo letra por letra. Toque para completar/seguir; PULAR vai até o fim.
 */
export function Cutscene({ quadros, onFim }: { quadros: Quadro[]; onFim: () => void }) {
  const [i, setI] = useState(0);
  const q = quadros[i];
  const [mostrado, completo, completar] = useDigitando(q?.texto ?? '', i, q?.quem);
  useEffect(() => {
    if (!q) onFim();
    else if (q.som) tocar(q.som);
  }, [q]);
  if (!q) return null;
  const seguir = () => {
    desbloquear();
    if (!completo) return completar();
    tocar('pagina');
    setI((n) => n + 1);
  };
  const elenco: EmCena[] = q.personagens ?? (q.quem && q.quem !== 'narrador' && q.quem !== 'arauto' && q.quem !== 'povo' ? [{ quem: q.quem, x: 50, entrada: 'surgir' }] : []);
  const titulo = q.lugar === 'titulo';
  return (
    <div className="flex flex-col gap-2">
    <div className={`pixel-box palco-historia relative w-full overflow-hidden ${q.efeito === 'tremor' ? 'tremer-forte' : ''}`}>
      {/* o cenário, se aproximando devagar */}
      <div key={`bg-${i}`} className={`absolute inset-0 ${q.efeito === 'zoom' ? 'cena-aproxima' : q.efeito === 'panoramica' ? 'cena-panorama' : 'cena-respira'}`}>
        <CenarioHistoria lugar={q.lugar} />
      </div>
      {/* os personagens em cena */}
      {elenco.map((p, k) => (
        <Ator key={`${i}-${k}-${p.quem}`} p={p} />
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
      {titulo && (
        <button type="button" autoFocus onClick={seguir} className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 text-center">
          <span className="abertura-pedra font-pixel text-xl text-[#f2c14e] [text-shadow:3px_3px_0_#5a2a12] sm:text-4xl">COLISEU DAS IAS</span>
          <span className="surgir font-pixel text-[9px] text-white sm:text-sm">A LEI DA RESPOSTA ÚNICA</span>
          <span className="piscar mt-4 font-pixel text-[8px] text-[#f2c14e]">TOQUE PARA COMEÇAR ▶</span>
        </button>
      )}
      <button type="button" onClick={onFim} className="absolute right-2 top-[8%] z-30 bg-black/60 px-2 py-1 font-pixel text-[8px] text-white/70 hover:text-white">
        PULAR ▶▶
      </button>
    </div>
    {/* O texto fica embaixo da cena, para não cobrir os personagens */}
    {!titulo && (
      <button type="button" autoFocus onClick={seguir} className="w-full border-2 border-[#c8962a] bg-black/85 p-3 text-center">
        {q.quem && NOMES[q.quem] && <span className="block font-pixel text-[8px] text-[#f2c14e] sm:text-[10px]">{NOMES[q.quem].toUpperCase()}</span>}
        <span className="block min-h-[3.9em] text-sm leading-snug text-white sm:min-h-[2.6em] sm:text-lg">{mostrado}</span>
        <span className={`mt-1 block font-pixel text-[8px] text-[#f2c14e] ${completo ? 'piscar' : 'opacity-0'}`}>TOQUE PARA SEGUIR ▶</span>
      </button>
    )}
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
  const [esquerda, setEsquerda] = useState(false);
  const [duracao, setDuracao] = useState(650);
  const faltam = pontos.filter((p) => p.obrigatorio && !vistos.includes(p.id));
  const ir = (p: PontoExplorar) => {
    if (andando || falando) return;
    desbloquear();
    tocar('passos');
    setAndando(true);
    // Para um pouco antes do ponto, do lado de onde veio.
    const alvo = p.x > x ? p.x - 8 : p.x + 8;
    const dur = Math.max(350, Math.abs(alvo - x) * 16);
    setEsquerda(alvo < x);
    setDuracao(dur);
    setX(alvo);
    window.setTimeout(() => {
      setAndando(false);
      setFalando(p);
    }, dur);
  };
  return (
    <div className="flex flex-col gap-2">
      <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">
        🎯 {objetivo} {faltam.length === 0 && '✔'}
      </p>
      <Palco lugar={lugar}>
        {pontos.map((p, k) => (
          <button
            key={p.id}
            type="button"
            onClick={() => ir(p)}
            aria-label={p.rotulo}
            className="absolute z-10 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${p.x}%`, bottom: p.personagem ? "22%" : k % 2 ? "40%" : "24%", width: p.personagem ? "9%" : "auto" }}
          >
            {p.personagem && (
              <span className="respirar block w-full" aria-hidden>
                <Retrato quem={p.personagem} espelhar={p.x > x} />
              </span>
            )}
            <span
              className={`mt-1 block max-w-[30vw] border-2 bg-black/80 px-1.5 py-0.5 text-center font-pixel text-[7px] leading-tight sm:max-w-none sm:whitespace-nowrap sm:text-[9px] ${vistos.includes(p.id) ? 'border-white/30 text-white/60' : `border-[#f2c14e] text-white ${p.obrigatorio ? 'animate-pulse' : ''}`}`}
            >
              {p.icone} {p.rotulo}
            </span>
          </button>
        ))}
        {/* o gladiador */}
        <div
          className="absolute bottom-[14%] z-10 w-[9%] -translate-x-1/2 ease-linear"
          style={{ left: `${x}%`, transition: `left ${duracao}ms linear` }}
          aria-hidden
        >
          <span className="absolute -bottom-[3%] left-1/2 h-[6%] w-[70%] -translate-x-1/2 rounded-[50%] bg-black/45" />
          <div className={andando ? 'andar' : 'respirar'}>
            <Retrato quem={heroi} espelhar={esquerda} />
          </div>
          {andando && <Poeira />}
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
