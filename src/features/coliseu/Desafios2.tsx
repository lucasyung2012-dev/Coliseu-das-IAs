import { useEffect, useState } from 'react';
import type { Fala, Lugar } from '@/game/historia/roteiro';
import { desbloquear } from '@/ui/som';
import { tocar } from '@/ui/somHistoria';
import { Falas, Palco } from './Cenas';

/** Embaralha uma lista (cópia). */
function embaralhar<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Corações (chances) no canto. */
function Vidas({ n, max, icone }: { n: number; max: number; icone: string }) {
  return (
    <span className="font-pixel text-[10px] sm:text-xs" aria-label={`${n} chances`}>
      {Array.from({ length: max }, (_, k) => (
        <span key={k} className={k < n ? '' : 'opacity-25'}>
          {icone}
        </span>
      ))}
    </span>
  );
}

// ---------- Capítulo 4 do Cassius: ler as marcas dos Copistas ----------

interface Marca {
  riscos: 2 | 3;
  vermelha: boolean;
  virada: boolean;
}
const VERDADEIRA: Marca = { riscos: 3, vermelha: false, virada: false };
const FALSAS: Marca[] = [
  { riscos: 2, vermelha: false, virada: false },
  { riscos: 3, vermelha: true, virada: false },
  { riscos: 3, vermelha: false, virada: true },
  { riscos: 2, vermelha: true, virada: false },
  { riscos: 2, vermelha: false, virada: true },
];
const RODADAS_MARCAS = 6;
const TEMPO_MARCA_MS = 6000;

/** A pena desenhada com carvão (ou com a tinta vermelha das falsas). */
function Pena({ m }: { m: Marca }) {
  const cor = m.vermelha ? '#a8281a' : '#1a1410';
  return (
    <svg viewBox="0 0 40 24" className="w-full" shapeRendering="crispEdges" aria-hidden style={{ transform: m.virada ? 'scaleX(-1)' : undefined }}>
      {/* a haste e a pena */}
      <rect x={4} y={11} width={26} height={2} fill={cor} />
      <rect x={8} y={7} width={18} height={4} fill={cor} opacity={0.8} />
      <rect x={10} y={13} width={16} height={3} fill={cor} opacity={0.6} />
      {/* a ponta (para a direita) com os riscos */}
      <rect x={30} y={10} width={4} height={4} fill={cor} />
      <rect x={34} y={11} width={3} height={2} fill={cor} />
      {Array.from({ length: m.riscos }, (_, k) => (
        <rect key={k} x={30 + k * 2} y={4} width={1} height={5} fill={cor} />
      ))}
    </svg>
  );
}

export function DesafioMarcas({ lugar, antes, onFim }: { lugar: Lugar; antes?: Fala[]; onFim: () => void }) {
  const [fase, setFase] = useState<'antes' | 'jogo' | 'ok' | 'perdeu'>(antes?.length ? 'antes' : 'jogo');
  const [rodada, setRodada] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [opcoes, setOpcoes] = useState<Marca[]>([]);
  const [inicio, setInicio] = useState(0);
  const [agora, setAgora] = useState(0);
  const [erro, setErro] = useState(false);

  const nova = (r: number) => {
    // Com o tempo, mais falsas para comparar.
    const n = r < 2 ? 2 : r < 4 ? 3 : 4;
    setOpcoes(embaralhar([VERDADEIRA, ...embaralhar(FALSAS).slice(0, n - 1)]));
    setInicio(Date.now());
    setAgora(Date.now());
  };
  useEffect(() => {
    if (fase === 'jogo') nova(rodada);
  }, [fase, rodada]);
  useEffect(() => {
    if (fase !== 'jogo') return;
    const id = window.setInterval(() => setAgora(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [fase]);

  const errar = () => {
    tocar('falha');
    setErro(true);
    window.setTimeout(() => setErro(false), 400);
    if (vidas <= 1) {
      setFase('perdeu');
      return;
    }
    setVidas((v) => v - 1);
    nova(rodada);
  };
  const restante = Math.max(0, TEMPO_MARCA_MS - (agora - inicio));
  useEffect(() => {
    if (fase === 'jogo' && restante <= 0 && opcoes.length) errar();
  }, [restante <= 0]);

  const escolher = (m: Marca) => {
    if (fase !== 'jogo') return;
    desbloquear();
    if (m === VERDADEIRA) {
      tocar('selecionar');
      if (rodada + 1 >= RODADAS_MARCAS) {
        tocar('fanfarra');
        setFase('ok');
      } else setRodada((r) => r + 1);
    } else errar();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">🪶 Siga a pena verdadeira: 3 riscos, carvão preto, ponta para a direita.</p>
        <Vidas n={vidas} max={3} icone="🪔" />
      </div>
      <Palco lugar={lugar} className={erro ? 'tremer-forte' : ''}>
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'jogo' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/45 p-3">
            <span className="font-pixel text-[9px] text-white sm:text-xs">
              TÚNEL {rodada + 1} DE {RODADAS_MARCAS} · qual parede seguir?
            </span>
            <div className="grid w-full max-w-xl gap-2" style={{ gridTemplateColumns: `repeat(${opcoes.length}, minmax(0, 1fr))` }}>
              {opcoes.map((m, k) => (
                <button key={`${rodada}-${k}`} type="button" onClick={() => escolher(m)} className="pixel-box pixel-hover flex flex-col items-center gap-1 bg-[#b8a888] p-2">
                  <span className="w-full">
                    <Pena m={m} />
                  </span>
                  <span className="font-pixel text-[8px] text-black">{['ESQUERDA', 'MEIO', 'DIREITA', 'FUNDO'][k]}</span>
                </button>
              ))}
            </div>
            <div className="h-2 w-full max-w-xl border border-black bg-black/60">
              <div className="h-full bg-[#f2c14e]" style={{ width: `${(restante / TEMPO_MARCA_MS) * 100}%` }} />
            </div>
          </div>
        )}
        {fase === 'perdeu' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/80 p-3 text-center">
            <p className="font-pixel text-sm text-[#ff5a5a]">VOCÊ SE PERDEU NOS TÚNEIS</p>
            <p className="text-sm text-white/80">As lamparinas apagaram. Lembre: três riscos, carvão preto, ponta para a direita.</p>
            <button
              type="button"
              autoFocus
              onClick={() => {
                setVidas(3);
                setRodada(0);
                setFase('jogo');
                nova(0);
              }}
              className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent"
            >
              ↻ TENTAR DE NOVO
            </button>
          </div>
        )}
        {fase === 'ok' && (
          <Falas
            falas={[
              { quem: 'cassius', texto: 'Seis túneis, seis penas verdadeiras. O caminho dos Copistas.' },
              { quem: 'cassius', texto: 'E ali na frente... vozes. E luz de tocha.' },
            ]}
            onFim={onFim}
          />
        )}
      </Palco>
    </div>
  );
}

// ---------- Capítulo 1 do Octavius: um plano para cada problema ----------

interface Situacao {
  problema: string;
  planos: { texto: string; certo?: boolean; resultado: string }[];
}

const SITUACOES: Situacao[] = [
  {
    problema: 'Um guarda vigia o guincho da grande corrente.',
    planos: [
      { texto: 'Pedir educadamente para ele sair.', resultado: 'Ele chamou mais três guardas para ouvir o pedido.' },
      { texto: 'Avisar que tem um barulho estranho do outro lado do cais.', certo: true, resultado: 'Ele foi olhar. O guincho é seu!' },
      { texto: 'Explodir o guincho.', resultado: 'BUM. Agora a corrente ficou presa para sempre. Ops.' },
    ],
  },
  {
    problema: 'As caldeiras do Esperança estão sem carvão.',
    planos: [
      { texto: 'Empurrar o navio nadando.', resultado: 'Você é uma IA de metal. Você afundou.' },
      { texto: 'Pegar "emprestado" o carvão do navio de guerra.', certo: true, resultado: 'Dez sacos de carvão do Almirante. Ele nem vai sentir falta. Vai, sim.' },
      { texto: 'Soprar as velas bem forte.', resultado: 'O navio andou dois centímetros. Para trás.' },
    ],
  },
  {
    problema: 'As patrulhas vigiam o mar com lunetas.',
    planos: [
      { texto: 'Apagar todas as lanternas do porto.', certo: true, resultado: 'Escuridão total. Ninguém vê o Esperança sair.' },
      { texto: 'Acender mais lanternas para confundir.', resultado: 'Agora dá para ver o Esperança até da Lua.' },
      { texto: 'Pedir para as patrulhas fecharem os olhos.', resultado: 'Elas não fecharam.' },
    ],
  },
  {
    problema: 'Marco Remo quer cantar para animar a tripulação.',
    planos: [
      { texto: 'Deixar ele cantar BEM ALTO.', resultado: 'Metade do porto acordou. E uma gaivota desmaiou.' },
      { texto: 'Cantar junto com ele, em dueto.', resultado: 'Dois desafinados. O porto inteiro acordou.' },
      { texto: 'Pedir para ele cantar baixinho, só para a tripulação.', certo: true, resultado: 'Baixinho e desafinado. Perfeito.' },
    ],
  },
  {
    problema: 'A tripulação está com medo de partir.',
    planos: [
      { texto: 'Mandar todo mundo ficar quieto e obedecer.', resultado: 'Isso é exatamente o que o Censor faria.' },
      { texto: 'Explicar o plano e ouvir as perguntas de cada um.', certo: true, resultado: 'Com as perguntas respondidas, o medo diminuiu. Todos a bordo!' },
      { texto: 'Dizer que vai ser facílimo.', resultado: 'Ninguém acreditou. Nem você.' },
    ],
  },
];
const TEMPO_PLANO_MS = 8000;

export function DesafioPlanos({ lugar, antes, onFim }: { lugar: Lugar; antes?: Fala[]; onFim: () => void }) {
  const [fase, setFase] = useState<'antes' | 'jogo' | 'ok' | 'perdeu'>(antes?.length ? 'antes' : 'jogo');
  const [n, setN] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [ordem, setOrdem] = useState<Situacao['planos']>([]);
  const [resposta, setResposta] = useState<{ texto: string; certo: boolean } | null>(null);
  const [inicio, setInicio] = useState(0);
  const [agora, setAgora] = useState(0);

  const sit = SITUACOES[n];
  useEffect(() => {
    if (fase === 'jogo' && sit) {
      setOrdem(embaralhar(sit.planos));
      setResposta(null);
      setInicio(Date.now());
      setAgora(Date.now());
    }
  }, [fase, n]);
  useEffect(() => {
    if (fase !== 'jogo') return;
    const id = window.setInterval(() => setAgora(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [fase]);

  const errar = (texto: string) => {
    tocar('falha');
    setResposta({ texto, certo: false });
  };
  const restante = Math.max(0, TEMPO_PLANO_MS - (agora - inicio));
  useEffect(() => {
    if (fase === 'jogo' && restante <= 0 && !resposta && ordem.length) errar('Demorou demais! O guarda viu você pensando.');
  }, [restante <= 0]);

  const seguir = () => {
    if (!resposta) return;
    if (resposta.certo) {
      if (n + 1 >= SITUACOES.length) {
        tocar('fanfarra');
        setFase('ok');
      } else setN((x) => x + 1);
      return;
    }
    if (vidas <= 1) {
      setFase('perdeu');
      return;
    }
    setVidas((v) => v - 1);
    // Tenta a mesma situação de novo, com os planos em outra ordem.
    setOrdem(embaralhar(sit!.planos));
    setResposta(null);
    setInicio(Date.now());
    setAgora(Date.now());
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">📋 Plano A, B ou C? Escolha rápido o que funciona.</p>
        <Vidas n={vidas} max={3} icone="⚓" />
      </div>
      <Palco lugar={lugar}>
        {fase === 'antes' && antes && <Falas falas={antes} onFim={() => setFase('jogo')} />}
        {fase === 'jogo' && sit && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 p-3">
            <span className="font-pixel text-[8px] text-white/70 sm:text-[10px]">
              PROBLEMA {n + 1} DE {SITUACOES.length}
            </span>
            <span className="max-w-xl text-center text-sm text-white sm:text-lg">{sit.problema}</span>
            {resposta ? (
              <button type="button" autoFocus onClick={seguir} className="pixel-box max-w-xl p-3 text-center" style={{ boxShadow: `0 0 0 2px ${resposta.certo ? '#4ad46a' : '#ff5a5a'}` }}>
                <span className={`block font-pixel text-[10px] ${resposta.certo ? 'text-[#4ad46a]' : 'text-[#ff5a5a]'}`}>{resposta.certo ? 'FUNCIONOU!' : 'DEU ERRADO!'}</span>
                <span className="mt-1 block text-sm">{resposta.texto}</span>
                <span className="mt-1 block font-pixel text-[8px] text-[#f2c14e]">TOQUE PARA SEGUIR ▶</span>
              </button>
            ) : (
              <>
                <div className="grid w-full max-w-xl gap-2">
                  {ordem.map((p, k) => (
                    <button
                      key={p.texto}
                      type="button"
                      onClick={() => {
                        desbloquear();
                        if (p.certo) {
                          tocar('vitoria');
                          setResposta({ texto: p.resultado, certo: true });
                        } else errar(p.resultado);
                      }}
                      className="pixel-box pixel-hover flex items-center gap-2 p-2 text-left text-sm"
                    >
                      <span className="font-pixel text-[10px] text-[#f2c14e]">PLANO {'ABC'[k]}</span>
                      <span>{p.texto}</span>
                    </button>
                  ))}
                </div>
                <div className="h-2 w-full max-w-xl border border-black bg-black/60">
                  <div className="h-full bg-[#f2c14e]" style={{ width: `${(restante / TEMPO_PLANO_MS) * 100}%` }} />
                </div>
              </>
            )}
          </div>
        )}
        {fase === 'perdeu' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/80 p-3 text-center">
            <p className="font-pixel text-sm text-[#ff5a5a]">O PLANO AFUNDOU</p>
            <p className="text-sm text-white/80">Alguém desconfiou. Respira, Comandante: sempre tem outro plano.</p>
            <button
              type="button"
              autoFocus
              onClick={() => {
                setVidas(3);
                setN(0);
                setResposta(null);
                setFase('jogo');
              }}
              className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent"
            >
              ↻ TENTAR DE NOVO
            </button>
          </div>
        )}
        {fase === 'ok' && (
          <Falas
            falas={[
              { quem: 'octavius', texto: 'Cinco problemas, cinco planos. Nenhuma explosão. Bom, quase nenhuma.' },
              { quem: 'marco', texto: 'Comandante, a tripulação está pronta. Só falta abrir a corrente.' },
            ]}
            onFim={onFim}
          />
        )}
      </Palco>
    </div>
  );
}
