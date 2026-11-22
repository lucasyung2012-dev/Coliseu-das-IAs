import { memo, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react';
import { NOMES, type Falante } from '@/game/historia/roteiro';
import { fogoAceso, larguraDa, novaFase, passoFase, saidaAberta, ventoAtivo, xDaPlataforma, xDoPerigo, type Entrada, type Fase, type Perigo } from '@/game/historia/fase';
import { INIMIGOS } from '@/game/historia/inimigos';
import { novaLuta } from '@/game/historia/luta';
import { SpriteInimigo } from './Luta';
import { desbloquear } from '@/ui/som';
import { tocar, voz } from '@/ui/somHistoria';
import { CenarioHistoria, escalaDe, Retrato } from './Cenarios';
import { usePausado } from './Pausa';
import Icone from '@/ui/pixel/Icones';

/**
 * A FASE ABERTA (teste, 22/11/2026): o lugar é maior que a tela e a câmera segue o
 * gladiador. Anda (◀ ▶ ou A/D), pula (⤒, W ou espaço), sobe em mesas e estantes,
 * desvia do fogo, pega os livros e chega na saída. Quem está perto fala sozinho.
 */
// A altura da tela em unidades (100 = a largura): medida de verdade, para nada esticar no celular em pé.
const ALTURA_PADRAO = 62.5;
const CHAO = 13; // % da altura da tela onde fica o chão
const LARGURA_HEROI = 14; // bem maior (pedido do Lucas: "os bonecos ainda estão muito pequenininhos")

export function FaseAberta({ fase, heroi, onFim }: { fase: Fase; heroi: Falante; onFim: () => void }) {
  const [s, setS] = useState(novaFase);
  const entrada = useRef<Entrada>({ esq: false, dir: false, pular: false });
  const [acabou, setAcabou] = useState(false);
  const largura = larguraDa(fase);
  // A altura do palco em unidades (100 = a largura), medida de verdade.
  const palcoRef = useRef<HTMLDivElement>(null);
  const [altura, setAltura] = useState(ALTURA_PADRAO);
  useEffect(() => {
    const el = palcoRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const medir = () => {
      if (el.clientWidth > 0) setAltura((el.clientHeight / el.clientWidth) * 100);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // O menu de pausa para a fase (o relógio não anda).
  const pausado = usePausado();
  const pausadoRef = useRef(pausado);
  pausadoRef.current = pausado;

  // O relógio da fase (um passo por quadro, no máximo 50 ms de uma vez). O estado mora num
  // ref e a tela só copia: antes, o "pular" era apagado antes do passo ler (o pulo falhava).
  const estado = useRef(s);
  // Pulo "perdoado": apertou até 150 ms antes de tocar o chão, ele pula quando tocar.
  const pularAte = useRef(0);
  // A câmera segue com suavidade (não dá tranco).
  const [camera, setCamera] = useState(0);
  const cameraRef = useRef(0);
  useEffect(() => {
    let ultimo = performance.now();
    let id = 0;
    const quadro = (agora: number) => {
      const dt = Math.min(50, agora - ultimo);
      ultimo = agora;
      if (!pausadoRef.current) {
        if (entrada.current.pular) {
          pularAte.current = agora + 150;
          entrada.current = { ...entrada.current, pular: false };
        }
        const antes = estado.current;
        const novo = passoFase(fase, antes, { ...entrada.current, pular: agora < pularAte.current }, dt);
        if (novo.vy > antes.vy + 1) pularAte.current = 0;
        estado.current = novo;
        setS(novo);
        const alvo = Math.max(0, Math.min(larguraDa(fase) - 100, novo.x - 45));
        cameraRef.current += (alvo - cameraRef.current) * Math.min(1, dt / 120);
        setCamera(cameraRef.current);
      }
      id = requestAnimationFrame(quadro);
    };
    id = requestAnimationFrame(quadro);
    return () => cancelAnimationFrame(id);
  }, [fase]);

  // Teclado: A/D ou setas para andar; W, seta para cima ou espaço para pular.
  useEffect(() => {
    const muda = (ev: KeyboardEvent, valor: boolean) => {
      const k = ev.key.toLowerCase();
      if (k === 'a' || k === 'arrowleft') entrada.current.esq = valor;
      else if (k === 'd' || k === 'arrowright') entrada.current.dir = valor;
      else if (valor && (k === 'w' || k === 'arrowup' || k === ' ')) {
        ev.preventDefault();
        entrada.current.pular = true;
      } else return;
      desbloquear();
    };
    const desce = (ev: KeyboardEvent) => muda(ev, true);
    const sobe = (ev: KeyboardEvent) => muda(ev, false);
    window.addEventListener('keydown', desce);
    window.addEventListener('keyup', sobe);
    return () => {
      window.removeEventListener('keydown', desce);
      window.removeEventListener('keyup', sobe);
    };
  }, []);

  // Sons: pegar um livro, queimar, a voz de quem comenta, chegar na saída.
  const antes = useRef(s);
  useEffect(() => {
    const a = antes.current;
    if (s.coletados.length > a.coletados.length) tocar('selecionar');
    if (s.queimadas > a.queimadas) tocar('dano');
    if (s.vy > 0 && a.vy <= 0 && a.noChao) tocar('esquiva');
    if (s.falando && s.falando.id !== a.falando?.id) {
      const c = fase.comentarios.find((x) => x.id === s.falando!.id);
      if (c) [0, 140, 280].forEach((ms, k) => window.setTimeout(() => voz(c.quem, 'a', k * 2), ms));
    }
    if (s.fim && !a.fim) {
      tocar('vitoria');
      setAcabou(true);
    }
    antes.current = s;
  }, [s]);

  const emX = (x: number) => `${(x / largura) * 100}%`;
  const emY = (y: number) => `${CHAO + (y / altura) * 100}%`;
  const falando = s.falando ? fase.comentarios.find((c) => c.id === s.falando!.id) : undefined;
  const aberta = saidaAberta(fase, s);

  const botao = (tecla: 'esq' | 'dir' | 'pular') => ({
    onPointerDown: (ev: PointerEvent) => {
      ev.preventDefault();
      // Segura o dedo no botão: escorregar um pouco não solta (antes, andar travava no celular).
      ev.currentTarget.setPointerCapture?.(ev.pointerId);
      desbloquear();
      if (tecla === 'pular') entrada.current.pular = true;
      else entrada.current[tecla] = true;
    },
    onPointerUp: () => {
      if (tecla !== 'pular') entrada.current[tecla] = false;
    },
    onPointerCancel: () => {
      if (tecla !== 'pular') entrada.current[tecla] = false;
    },
    onContextMenu: (ev: MouseEvent) => ev.preventDefault(),
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">{fase.objetivo}</p>
        <p className="font-pixel text-[9px] text-white sm:text-[10px]" aria-label={`Coletados: ${s.coletados.length} de ${fase.coletaveis.length}`}>
          {fase.coletaveis.map((c) => (
            <span key={c.id} className={s.coletados.includes(c.id) ? 'recurso-cheio' : 'opacity-25 grayscale'}>
              <Icone nome="livro" className="inline-block w-4 sm:w-5" />
            </span>
          ))}
        </p>
      </div>
      <div className="area-jogo relative flex flex-col gap-2">
      <div ref={palcoRef} className="pixel-box fase-aberta relative w-full select-none overflow-hidden" style={{ touchAction: 'none' }}>
        {/* O mundo inteiro, que anda com a câmera */}
        <div
          className="absolute inset-y-0 left-0"
          style={{ width: `${fase.telas.length * 100}%`, transform: `translateX(${(-camera / largura) * 100}%)` }}
        >
          {fase.telas.map((t, k) => (
            <div key={k} className="absolute inset-y-0" style={{ left: `${(k / fase.telas.length) * 100}%`, width: `${100 / fase.telas.length}%` }}>
              {/* A mesma tela duas vezes seguidas: a segunda vem espelhada (não fica repetido). */}
              <div className="h-full w-full" style={{ transform: k > 0 && fase.telas[k - 1] === t ? 'scaleX(-1)' : undefined }}>
                <CenarioHistoria lugar={t} semEstatua={k > 0} />
              </div>
            </div>
          ))}

          {/* Mesas, estantes, sacadas e vigas */}
          {fase.plataformas.map((p, k) => (
            <div
              key={k}
              className={`absolute ${(s.afundadas?.[k] ?? 0) > s.tempo ? 'plataforma-afundou' : p.afunda && s.pisando?.i === k ? 'plataforma-treme' : ''}`}
              style={{ left: emX(xDaPlataforma(p, s.tempo)), width: emX(p.w), bottom: `${CHAO}%`, height: `${(p.y / altura) * 100}%` }}
              aria-hidden
            >
              {p.afunda && <div className="absolute inset-x-[10%] -top-[3px] z-10 h-[3px] bg-[repeating-linear-gradient(90deg,#1a0a04_0_4px,transparent_4px_8px)]" />}
              <div className={`plataforma plataforma-${p.tipo} absolute inset-x-0 top-0`} />
              {(p.tipo === 'mesa' || p.tipo === 'estante') && (
                <>
                  <div className="absolute bottom-0 left-[8%] top-0 w-[8%] bg-[#4a2a14]" />
                  <div className="absolute bottom-0 right-[8%] top-0 w-[8%] bg-[#4a2a14]" />
                </>
              )}
              {/* Barco: casco de madeira balançando na água, com a borda e o banco */}
              {p.tipo === 'barco' && (
                <div className="barco-balanca absolute inset-x-0 bottom-[-40%] top-0">
                  <div className="absolute inset-x-0 bottom-0 top-[18%] rounded-b-[45%] border-2 border-[#2a1a0c] bg-[linear-gradient(180deg,#8a5a2a,#5a3418)]" />
                  <div className="absolute inset-x-[-4%] top-[14%] h-[12%] bg-[#4a2a12]" />
                  <div className="absolute left-[40%] top-[30%] h-[18%] w-[20%] bg-[#6a4220]" />
                </div>
              )}
              {/* Pedra no meio da água, e a tampa de um sarcófago boiando */}
              {p.tipo === 'pedra' && <div className="absolute inset-x-0 bottom-0 top-0 rounded-t-[40%] border-2 border-[#2a2622] bg-[linear-gradient(180deg,#8a8276,#4a443c)]" />}
              {p.tipo === 'sarcofago' && (
                <div className="absolute inset-0 border-2 border-[#2a2622] bg-[#6a6258]">
                  <div className="absolute inset-x-0 top-0 h-[22%] bg-[#8a8276]" />
                  <div className="absolute left-1/2 top-[30%] h-[50%] w-[8%] -translate-x-1/2 bg-[#4a443c]" />
                  <div className="absolute left-[30%] right-[30%] top-[42%] h-[10%] bg-[#4a443c]" />
                </div>
              )}
              {/* Caixote: tábuas e a cruz de madeira */}
              {p.tipo === 'caixote' && (
                <div className="absolute inset-0 border-2 border-[#5a3a1c] bg-[repeating-linear-gradient(180deg,#b07c42_0_22%,#8a5a2a_22%_25%)]">
                  <div className="absolute left-1/2 top-1/2 h-[3px] w-[130%] -translate-x-1/2 -translate-y-1/2 rotate-[35deg] bg-[#6a4220]" />
                </div>
              )}
              {/* Toldo de barraca: pano listrado, a franja e os paus */}
              {p.tipo === 'toldo' && (
                <>
                  <div className="absolute bottom-0 left-[6%] top-0 w-[5%] bg-[#5a3a1c]" />
                  <div className="absolute bottom-0 right-[6%] top-0 w-[5%] bg-[#5a3a1c]" />
                  <div className="absolute inset-x-[-4%] top-0 h-[14%] bg-[repeating-linear-gradient(90deg,#c0283c_0_12px,#f0e6cc_12px_24px)] shadow-[0_3px_0_#00000055]" />
                  <div className="absolute inset-x-[-4%] top-[14%] h-[5%] bg-[repeating-linear-gradient(90deg,#c0283c_0_6px,transparent_6px_12px)]" />
                </>
              )}
              {p.tipo === 'estante' && (
                <div className="absolute inset-x-[16%] bottom-0 top-[12%] flex flex-col justify-around">
                  {[0, 1, 2].map((r) => (
                    <div key={r} className="flex h-[18%] gap-[3%]">
                      {['#c0283c', '#2a6aa0', '#e0782c', '#3a8a4a', '#8a3aa0'].map((c, j) => (
                        <span key={j} className="h-full flex-1" style={{ background: c }} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* O fogo (o que pisca mostra a fumaça antes de acender), quem anda e o que cai */}
          {fase.perigos.map((p, k) => {
            const aceso = fogoAceso(p, s.tempo);
            return (
              <div key={k} className="absolute" style={{ left: emX(xDoPerigo(p, s.tempo)), width: emX(p.w), bottom: `${CHAO - 1}%`, height: '12%' }} aria-hidden>
                <div className="absolute inset-x-0 bottom-0 h-[18%] rounded-[50%] bg-[#2a0a04]/80" style={{ opacity: p.tipo === 'agua' || p.tipo === 'inimigo' || p.tipo === 'queda' ? 0 : 1 }} />
                {p.tipo === 'inimigo' ? (
                  <FiguraQueAnda p={p} tempo={s.tempo} />
                ) : p.tipo === 'queda' ? (
                  <CoisaQueCai p={p} tempo={s.tempo} />
                ) : p.tipo === 'agua' ? (
                  <div className="agua-fase absolute inset-x-0 bottom-[-40%] top-[55%]" />
                ) : p.tipo === 'vao' ? (
                  <div className="vao-fase absolute inset-x-[4%] bottom-[-60%] top-[50%]" />
                ) : p.tipo === 'onda' ? (
                  aceso ? <div className="onda-fase absolute inset-x-[-10%] bottom-[-20%] top-[-30%]" /> : <div className="absolute inset-x-[10%] bottom-0 h-[16%] rounded-[50%] bg-[#4a7ab8]/50" />
                ) : aceso ? (
                  Array.from({ length: Math.max(2, Math.round(p.w / 3)) }, (_, j) => (
                    <span
                      key={j}
                      className="chama-fase absolute bottom-0"
                      style={{ left: `${(j / Math.max(2, Math.round(p.w / 3))) * 100}%`, animationDelay: `${(j * 137) % 500}ms` } as CSSProperties}
                    />
                  ))
                ) : (
                  <span className="fumaca-fase absolute bottom-0 left-1/4 h-1/2 w-1/2" />
                )}
              </div>
            );
          })}

          {/* Os livros para salvar */}
          {fase.coletaveis.map((c) =>
            s.coletados.includes(c.id) ? null : (
              <span key={c.id} className="coletavel-fase absolute text-lg sm:text-3xl" style={{ left: emX(c.x), bottom: emY(c.y) }} title={c.nome} aria-label={c.nome}>
                <Icone nome={c.icone || 'livro'} className="w-6 sm:w-10" />
              </span>
            ),
          )}

          {/* Coisas e pessoas que comentam */}
          {fase.comentarios.map((c) =>
            c.personagem ? (
              <div key={c.id} className="absolute -translate-x-1/2" style={{ left: emX(c.x), bottom: `${CHAO}%`, width: emX(LARGURA_HEROI * escalaDe(c.personagem)) }} aria-hidden>
                <div className="respirar">
                  <Retrato quem={c.personagem} espelhar={s.x < c.x} />
                </div>
              </div>
            ) : null,
          )}

          {/* A saída */}
          <div className="absolute -translate-x-1/2 text-center" style={{ left: emX(fase.saida.x), bottom: `${CHAO}%` }}>
            <span className={`block text-2xl sm:text-4xl ${aberta ? 'piscar' : ''}`} aria-hidden>
              {aberta ? '' : ''}
            </span>
            <span className="placa-ponto block whitespace-nowrap px-1 font-pixel text-[6px] sm:text-[8px]">
              {aberta ? fase.saida.rotulo : `SALVE ${fase.precisa} LIVROS`}
            </span>
          </div>

          {/* O gladiador */}
          <div
            className={`absolute -translate-x-1/2 ${s.tempo < s.feridoAte ? 'piscar' : ''}`}
            style={{ left: emX(s.x), bottom: emY(s.y), width: emX(LARGURA_HEROI) }}
            aria-label={NOMES[heroi]}
          >
            <span className="absolute -bottom-[3%] left-1/2 h-[6%] w-[70%] -translate-x-1/2 rounded-[50%] bg-black/45" style={{ opacity: s.y > 0.5 ? 0.3 : 1 }} />
            <div className={s.andando ? 'andar' : s.noChao ? 'respirar' : ''}>
              <Retrato quem={heroi} espelhar={s.dir < 0} />
            </div>
          </div>
        </div>

        {/* O balão de quem está falando (fica na tela, não no mundo) */}
        {falando && (
          <div key={falando.id} className="balao-fase absolute inset-x-[4%] top-[6%] z-20 flex items-center gap-2 border-2 border-[#c8962a] bg-black/85 p-2">
            {falando.quem !== 'narrador' && (
              <span className="w-8 shrink-0 sm:w-12" aria-hidden>
                <Retrato quem={falando.quem} />
              </span>
            )}
            <span className="text-xs leading-snug text-white sm:text-sm">
              {NOMES[falando.quem] && <b className="mr-1 font-pixel text-[8px] text-[#f2c14e]">{NOMES[falando.quem].toUpperCase()}:</b>}
              {falando.texto}
            </span>
          </div>
        )}

        {s.tempo < s.feridoAte && <div className="clarao-vermelho pointer-events-none absolute inset-0 z-[19]" aria-hidden />}

        {acabou && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/75 p-3 text-center">
            <p className="font-pixel text-sm text-[#f2c14e] sm:text-xl">{s.coletados.length} DE {fase.coletaveis.length} {fase.fim?.coisa ?? 'LIVROS SALVOS'}!</p>
            <p className="text-sm text-white/80">{s.coletados.length === fase.coletaveis.length ? (fase.fim?.todos ?? 'Todos! O Guardião Zero ficaria orgulhoso.') : (fase.fim?.alguns ?? 'Os que ficaram para trás viraram cinza... mas esses, ninguém apaga.')}</p>
            <button type="button" autoFocus onClick={onFim} className="pixel-box px-4 py-2 font-pixel text-[10px] text-[#f2c14e]">
              SEGUIR ▶
            </button>
          </div>
        )}
        {ventoAtivo(fase, s.tempo) && (
          <>
            <div className="vento-fase pointer-events-none absolute inset-0 z-[18]" aria-hidden />
            <span className="pointer-events-none absolute left-1/2 top-[16%] z-[19] -translate-x-1/2 font-pixel text-xs text-white [text-shadow:2px_2px_0_#000] sm:text-lg">VENTO!</span>
          </>
        )}
      </div>

      {/* Os controles na tela (bons para o celular): segure ◀ ▶ e toque ⤒ para pular */}
      <div className="controles-jogo controles-fase grid grid-cols-[1fr_1fr_1.4fr] gap-2">
        <button type="button" {...botao('esq')} className="pixel-box botao-luta flex items-center justify-center py-3" style={{ '--cor': '#c8962a' } as CSSProperties} aria-label="Andar para a esquerda">
          <span className="medalhao"><Icone nome="esq" className="w-[62%]" /></span>
        </button>
        <button type="button" {...botao('dir')} className="pixel-box botao-luta flex items-center justify-center py-3" style={{ '--cor': '#c8962a' } as CSSProperties} aria-label="Andar para a direita">
          <span className="medalhao"><Icone nome="dir" className="w-[62%]" /></span>
        </button>
        <button type="button" {...botao('pular')} className="pixel-box botao-luta flex items-center justify-center gap-2 py-3" style={{ '--cor': '#4ad46a' } as CSSProperties} aria-label="Pular">
          <span className="medalhao"><Icone nome="pular" className="w-[62%]" /></span>
          <span className="font-pixel text-[8px] text-[#f4e2b4] sm:text-[10px]">PULAR</span>
        </button>
      </div>
      </div>
      <p className="dica-teclado text-center text-[10px] text-muted">Teclado: A e D (ou as setas) para andar · W ou espaço para pular · suba nas mesas e passe por cima do fogo</p>
    </div>
  );
}

/** Quem anda pelo chão da fase: guarda, rato, jacaré, gato (o desenho da luta) ou o barril rolando. */
const FiguraQueAnda = memo(function FiguraQueAnda({ p, tempo }: { p: Perigo; tempo: number }) {
  const id = { rato: 'rato-engrenagem', jacare: 'jacare-esgoto', gato: 'gato-ferro' }[p.figura as 'rato' | 'jacare' | 'gato'];
  const e = useMemo(() => (id && INIMIGOS[id] ? novaLuta(INIMIGOS[id]!) : null), [id]);
  // Indo para a esquerda ou para a direita (para virar o desenho).
  const indo = p.move ? xDoPerigo(p, tempo + 50) - xDoPerigo(p, tempo) : -1;
  if (p.figura === 'barril')
    return (
      <span className="barril-rola absolute bottom-0 left-1/2 block w-[180%] -translate-x-1/2">
        <Icone nome="barril" className="w-full" />
      </span>
    );
  return (
    <span className="andar-perigo absolute bottom-0 left-1/2 block w-[260%] -translate-x-1/2" style={{ transform: `translateX(-50%) scaleX(${indo > 0 ? -1 : 1})` }}>
      {e ? <SpriteInimigo e={e} /> : <Retrato quem="guarda" />}
    </span>
  );
});

/** O que cai do teto (viga em chamas, tomate): a sombra avisa, cai, e fica no chão um instante. */
function CoisaQueCai({ p, tempo }: { p: Perigo; tempo: number }) {
  const ciclo = p.acesoMs + p.apagadoMs;
  const fase = (tempo + (p.atrasoMs ?? 0)) % ciclo;
  const noChao = fase < p.acesoMs;
  const caindo = !noChao && fase > ciclo - 700 ? (fase - (ciclo - 700)) / 700 : -1;
  const icone = p.figura === 'tomate' ? 'tomate' : 'viga';
  if (!noChao && caindo < 0) return null;
  return (
    <>
      <span className="absolute inset-x-[-20%] bottom-0 h-[20%] rounded-[50%] bg-black/50" style={{ opacity: noChao ? 0.7 : 0.2 + caindo * 0.6 }} />
      <span className="absolute bottom-0 left-1/2 block w-[200%]" style={{ transform: `translate(-50%, ${noChao ? 0 : -(1 - caindo) * 600}%) rotate(${noChao ? 80 : caindo * 80}deg)` }}>
        {icone === 'viga' ? <span className="block h-[10px] w-full bg-[linear-gradient(90deg,#4a2a14,#8a5a2a)] shadow-[0_0_10px_#ff7a2a] sm:h-[16px]" /> : <Icone nome="tomate" className="w-full" />}
      </span>
      {noChao && icone === 'viga' && <span className="chama-fase absolute bottom-0 left-1/4" />}
    </>
  );
}
