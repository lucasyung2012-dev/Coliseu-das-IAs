import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { NOMES, type EmCena, type Emocao, type Fala, type Falante, type JeitoFala, type Lugar, type PontoExplorar, type Quadro, type ZoomFala } from '@/game/historia/roteiro';
import Emote from '@/ui/pixel/Emotes';
import { prefereMenosMovimento } from '@/ui/movimento';
import { desbloquear } from '@/ui/som';
import { tocar, voz } from '@/ui/somHistoria';
import { CenarioHistoria, escalaDe, Retrato } from './Cenarios';

/**
 * A caixa de fala: retrato, nome e o texto aparecendo letra por letra, com a "voz"
 * do personagem (um barulhinho próprio). Toque para completar; toque de novo para seguir.
 */
/**
 * A emoção e o jeito de falar de uma fala: o que o roteiro mandou ou, se não mandou,
 * um palpite pelo texto (grito = palavra em MAIÚSCULAS com "!", dúvida = termina em "?").
 */
export function emocaoDa(f: { quem?: Falante; texto: string; emocao?: Emocao; jeito?: JeitoFala }): { emocao: Emocao; jeito?: JeitoFala } {
  if (!f.quem || f.quem === 'narrador') return { emocao: 'normal', jeito: f.jeito };
  const grita = /!/.test(f.texto) && /\b[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{4,}\b/.test(f.texto);
  const jeito = f.jeito ?? (grita ? 'grito' : undefined);
  if (f.emocao) return { emocao: f.emocao, jeito };
  return { emocao: /\?\s*$/.test(f.texto) ? 'pensando' : 'normal', jeito };
}

/** O texto com emoção: no grito, cada letra treme. */
function TextoComEmocao({ texto, jeito }: { texto: string; jeito?: JeitoFala }) {
  if (jeito !== 'grito') return <>{texto}</>;
  return (
    <>
      {texto.split('').map((c, k) => (
        <span key={k} className="letra-treme inline-block whitespace-pre" style={{ animationDelay: `${(k * 53) % 300}ms` }}>
          {c}
        </span>
      ))}
    </>
  );
}

/** O retrato grande de quem fala, que muda de jeito com a emoção, e o balãozinho em cima. */
export function RetratoGrande({ quem, emocao }: { quem: Falante; emocao: Emocao }) {
  return (
    <span key={`${quem}-${emocao}`} className={`retrato-grande relative block w-full emo-${emocao}`} aria-hidden>
      {emocao !== 'normal' && (
        <span className="emote-pula absolute -top-[18%] right-[-4%] z-10 block w-[36%]">
          <Emote emocao={emocao} />
        </span>
      )}
      <Retrato quem={quem} />
    </span>
  );
}

/** O zoom da cena (pedido pela fala: chegar perto numa revelação, ou susto). */
const ZoomContexto = createContext<(z: ZoomFala | null) => void>(() => undefined);

export function CaixaFala({ fala, onSeguir }: { fala: Fala; onSeguir: () => void }) {
  const { emocao, jeito } = emocaoDa(fala);
  const [mostrado, completo, completar] = useDigitando(fala.texto, 0, fala.quem, jeito === 'devagar' ? 70 : jeito === 'grito' ? 22 : 28);
  const mudarZoom = useContext(ZoomContexto);
  useEffect(() => {
    mudarZoom(fala.zoom ?? null);
    return () => mudarZoom(null);
  }, []);
  const comRetrato = fala.quem !== 'narrador' && fala.quem !== 'povo';
  return (
    <div className="absolute inset-x-2 bottom-2 z-20 flex items-end gap-2 sm:inset-x-4 sm:bottom-4 sm:gap-3">
      {/* O personagem grande, do lado da caixa (no zoom, ele fica ainda maior) */}
      {comRetrato && (
        <span className={`retrato-fala shrink-0 ${fala.zoom ? 'w-[30%] sm:w-[24%]' : 'w-[24%] sm:w-[19%]'}`}>
          <RetratoGrande quem={fala.quem} emocao={emocao} />
        </span>
      )}
      <button
        type="button"
        autoFocus
        onClick={() => {
          desbloquear();
          if (!completo) return completar();
          tocar('pagina');
          onSeguir();
        }}
        className={`caixa-fala min-w-0 flex-1 border-4 border-double bg-black/90 p-2 text-left sm:p-3 ${jeito === 'grito' ? 'border-[#ff7a5a]' : 'border-[#e8d8b0]'}`}
      >
        {NOMES[fala.quem] && <span className="block font-pixel text-[8px] text-[#f2c14e] sm:text-[10px]">{NOMES[fala.quem].toUpperCase()}</span>}
        <span
          className={`mt-1 block leading-snug ${fala.quem === 'narrador' ? 'italic text-white/70' : 'text-white'} ${jeito === 'sussurro' ? 'text-xs italic text-white/70 sm:text-sm' : jeito === 'grito' ? 'text-base font-bold sm:text-lg' : 'text-sm sm:text-base'}`}
        >
          <TextoComEmocao texto={mostrado} jeito={jeito} />
          {/* o resto do texto, invisível, para a caixa não mudar de tamanho enquanto digita */}
          <span className="invisible">{fala.texto.slice(mostrado.length)}</span>
        </span>
        <span className={`mt-1 block text-right font-pixel text-[9px] text-[#f2c14e] ${completo ? 'piscar' : 'opacity-0'}`}>▼</span>
      </button>
    </div>
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
  // O zoom que a fala pediu: o cenário chega perto (ou dá o susto) e escurece em volta.
  const [zoom, setZoom] = useState<ZoomFala | null>(null);
  return (
    <ZoomContexto.Provider value={setZoom}>
      <div className={`pixel-box palco-historia relative w-full overflow-hidden ${zoom === 'susto' ? 'tremer-forte' : ''} ${className}`}>
        <div className={`absolute inset-0 transition-transform duration-700 ease-out ${zoom === 'perto' ? 'scale-[1.18]' : zoom === 'susto' ? 'scale-[1.28] duration-150' : 'scale-100'}`}>
          <CenarioHistoria lugar={lugar} />
        </div>
        {zoom && <div className="vinheta-zoom pointer-events-none absolute inset-0 z-[9]" aria-hidden />}
        {children}
      </div>
    </ZoomContexto.Provider>
  );
}

/** Texto aparecendo letra por letra (o toque completa na hora), com a voz de quem fala. */
function useDigitando(texto: string, chave: number, quem?: Falante, msPorLetra = 28): [string, boolean, () => void] {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    if (prefereMenosMovimento()) {
      setN(texto.length);
      return;
    }
    const id = window.setInterval(() => setN((x) => (x >= texto.length ? x : x + 1)), msPorLetra);
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
function Ator({ p, falando, outrosFalam }: { p: EmCena; falando?: boolean; outrosFalam?: boolean }) {
  const anda = p.de !== undefined && p.de !== p.x && !prefereMenosMovimento();
  const [pos, setPos] = useState(anda ? (p.de ?? p.x) : p.x);
  const [andando, setAndando] = useState(anda);
  const [dur, setDur] = useState(anda ? Math.abs(p.x - (p.de ?? p.x)) * MS_POR_PASSO : 0);
  const [indo, setIndo] = useState<'esq' | 'dir'>(anda && (p.de ?? 0) > p.x ? 'esq' : 'dir');
  const posRef = useRef(pos);
  // Anda até `x` (no começo, vindo de `de`; e depois, sempre que o próximo quadro mudar a posição dele).
  useEffect(() => {
    const de = posRef.current;
    if (de === p.x || prefereMenosMovimento()) {
      setPos(p.x);
      posRef.current = p.x;
      return;
    }
    const d = Math.abs(p.x - de) * MS_POR_PASSO;
    setDur(d);
    setIndo(de > p.x ? 'esq' : 'dir');
    setAndando(true);
    const a = window.setTimeout(() => {
      setPos(p.x);
      posRef.current = p.x;
    }, 40);
    const b = window.setTimeout(() => setAndando(false), d + 60);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [p.x]);
  // Anda virado para onde vai; parado, fica como o roteiro pediu.
  const espelhar = andando ? indo === 'esq' : p.espelhar;
  return (
    <div
      className="absolute bottom-[12%] z-10 -translate-x-1/2"
      style={{
        left: `${pos}%`,
        width: `${p.tamanho !== undefined ? p.tamanho * 1.5 : 21 * escalaDe(p.quem)}%`,
        transition: `left ${dur}ms linear, filter 300ms`,
        // Quem fala fica em destaque; os outros, um pouco no escuro.
        filter: outrosFalam ? 'brightness(0.62) saturate(0.8)' : falando ? 'drop-shadow(0 0 6px rgba(242,193,78,0.55))' : undefined,
      }}
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
  const emocaoQ = q ? emocaoDa(q) : { emocao: 'normal' as Emocao, jeito: undefined };
  const [mostrado, completo, completar] = useDigitando(q?.texto ?? '', i, q?.quem, emocaoQ.jeito === 'devagar' ? 70 : emocaoQ.jeito === 'grito' ? 22 : 28);
  // AUTO: a cena segue sozinha depois de ler (fica lembrado neste aparelho).
  const [auto, setAuto] = useState(() => {
    try {
      return localStorage.getItem('coliseu.cutscene.auto') === '1';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    if (!q) onFim();
    else if (q.som) tocar(q.som);
  }, [q]);
  useEffect(() => {
    if (!auto || !completo || !q) return;
    const id = window.setTimeout(() => setI((n) => n + 1), 1400 + q.texto.length * 22);
    return () => window.clearTimeout(id);
  }, [auto, completo, i]);
  if (!q) return null;
  const seguir = () => {
    desbloquear();
    if (!completo) return completar();
    tocar('pagina');
    setI((n) => n + 1);
  };
  const elenco: EmCena[] = q.personagens ?? (q.quem && q.quem !== 'narrador' && q.quem !== 'arauto' && q.quem !== 'povo' ? [{ quem: q.quem, x: 50, entrada: 'surgir' }] : []);
  const titulo = q.lugar === 'titulo';
  // Quadros seguidos no mesmo lugar são um "plano" só: o cenário e a câmera continuam
  // (antes, tudo recomeçava a cada fala). Trocou de lugar: a tela escurece e clareia.
  let plano = i;
  while (plano > 0 && quadros[plano - 1]!.lugar === q.lugar) plano--;
  const efeitoPlano = quadros.slice(plano, i + 1).reduce<Quadro['efeito']>((ef, x) => (x.efeito === 'zoom' || x.efeito === 'panoramica' ? x.efeito : ef), undefined);
  const variosEmCena = elenco.length > 1 && !!q.quem;
  return (
    <div className="flex flex-col gap-2">
    <div className={`pixel-box palco-historia relative w-full overflow-hidden ${q.efeito === "tremor" || q.zoom === "susto" ? "tremer-forte" : ""}`}>
      {/* o cenário, com a câmera se mexendo devagar durante o plano inteiro */}
      <div key={`bg-${plano}`} className={`absolute inset-0 transition-transform duration-700 ease-out ${q.zoom === "perto" ? "scale-[1.18]" : q.zoom === "susto" ? "scale-[1.28] duration-150" : ""} ${efeitoPlano === 'zoom' ? 'cena-aproxima' : efeitoPlano === 'panoramica' ? 'cena-panorama' : 'cena-respira'}`}>
        <CenarioHistoria lugar={q.lugar} />
      </div>
      {/* os personagens em cena (quem continua no quadro seguinte anda até o novo lugar) */}
      {elenco.map((p, k) => (
        <Ator key={`${plano}-${p.quem}-${elenco.slice(0, k).filter((x) => x.quem === p.quem).length}`} p={p} falando={p.quem === q.quem} outrosFalam={variosEmCena && p.quem !== q.quem} />
      ))}
      {/* troca de lugar: escurece e clareia */}
      <div key={`fade-${plano}`} className="troca-plano pointer-events-none absolute inset-0 z-[16] bg-black" aria-hidden />
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
      <div className="absolute right-2 top-[8%] z-30 flex gap-1">
        <button
          type="button"
          onClick={() => {
            const novo = !auto;
            setAuto(novo);
            try {
              localStorage.setItem('coliseu.cutscene.auto', novo ? '1' : '0');
            } catch {
              /* sem armazenamento: vale só agora */
            }
          }}
          aria-pressed={auto}
          className={`px-2 py-1 font-pixel text-[8px] ${auto ? 'bg-[#f2c14e] text-black' : 'bg-black/60 text-white/70 hover:text-white'}`}
        >
          AUTO {auto ? '●' : '○'}
        </button>
        <button type="button" onClick={onFim} className="bg-black/60 px-2 py-1 font-pixel text-[8px] text-white/70 hover:text-white">
          PULAR ▶▶
        </button>
      </div>
      {/* a barrinha do progresso da cena */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[17] h-[3px] bg-white/10" aria-hidden>
        <div className="h-full bg-[#c8962a] transition-[width] duration-500" style={{ width: `${((i + 1) / quadros.length) * 100}%` }} />
      </div>
    </div>
    {/* O texto fica embaixo da cena, para não cobrir os personagens; com o retrato de quem fala */}
    {!titulo && (
      <button key={`caixa-${i}`} type="button" autoFocus onClick={seguir} className={`caixa-cutscene flex w-full items-end gap-3 border-4 border-double bg-black/90 p-3 text-left ${emocaoQ.jeito === 'grito' ? 'border-[#ff7a5a]' : 'border-[#e8d8b0]'}`}>
        {q.quem && q.quem !== 'narrador' && q.quem !== 'povo' && (
          <span className="w-16 shrink-0 sm:w-24">
            <RetratoGrande quem={q.quem} emocao={emocaoQ.emocao} />
          </span>
        )}
        <span className={`min-w-0 flex-1 ${q.quem && q.quem !== 'narrador' ? '' : 'text-center'}`}>
          {q.quem && NOMES[q.quem] && <span className="block font-pixel text-[8px] text-[#f2c14e] sm:text-[10px]">{NOMES[q.quem].toUpperCase()}</span>}
          <span
            className={`block min-h-[3.9em] leading-snug sm:min-h-[2.6em] ${q.quem ? 'text-white' : 'italic text-white/90'} ${emocaoQ.jeito === 'sussurro' ? 'text-xs italic text-white/70 sm:text-base' : emocaoQ.jeito === 'grito' ? 'text-base font-bold sm:text-xl' : 'text-sm sm:text-lg'}`}
          >
            <TextoComEmocao texto={mostrado} jeito={emocaoQ.jeito} />
          </span>
          <span className={`mt-1 block font-pixel text-[8px] text-[#f2c14e] ${completo ? 'piscar' : 'opacity-0'}`}>{auto ? 'AUTO' : 'TOQUE PARA SEGUIR ▼'}</span>
        </span>
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
  onPonto,
}: {
  lugar: Lugar;
  objetivo: string;
  pontos: PontoExplorar[];
  heroi: Falante;
  onFim: () => void;
  /** Chamado quando a conversa de um ponto termina (usado pelos segredos). */
  onPonto?: (p: PontoExplorar) => void;
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
        {objetivo} {faltam.length === 0 && '✔'}
      </p>
      <Palco lugar={lugar}>
        {pontos.map((p, k) => (
          <button
            key={p.id}
            type="button"
            onClick={() => ir(p)}
            aria-label={p.rotulo}
            className="absolute z-10 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${p.x}%`, bottom: p.personagem ? "22%" : k % 2 ? "40%" : "24%", width: p.personagem ? `${15 * escalaDe(p.personagem)}%` : "auto" }}
          >
            {p.personagem && (
              <span className="respirar block w-full" aria-hidden>
                <Retrato quem={p.personagem} espelhar={p.x > x} azul={p.personagem === "censor" && lugar === "coliseu-livre"} />
              </span>
            )}
            <span
              className={`placa-ponto mt-1 block max-w-[30vw] px-1.5 py-0.5 text-center font-pixel text-[7px] leading-tight sm:max-w-none sm:whitespace-nowrap sm:text-[9px] ${vistos.includes(p.id) ? "vista" : p.obrigatorio ? "nova" : ""}`}
            >
              {p.rotulo}
            </span>
          </button>
        ))}
        {/* o gladiador */}
        <div
          className="absolute bottom-[14%] z-10 w-[15%] -translate-x-1/2 ease-linear"
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
              onPonto?.(falando);
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
