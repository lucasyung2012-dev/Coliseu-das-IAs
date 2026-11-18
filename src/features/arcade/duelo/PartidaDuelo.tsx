import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { PERSONAGENS, type IaId } from '@/game/personagens';
import { ACERTO_RIVAL } from '@/game/tribunal/motor';
import { indiceLiga } from '@/game/ligas';
import { ACERTO_TREINO, modoRanqueado, useDificuldade } from '@/game/conta';
import { marcarPartidaAberta, registrarAbandono, registrarPartida, useProgresso } from '@/game/progresso';
import { DILEMAS, type LadoId } from '@/game/tribunal/dilemas';
import {
  baralhoDaIa,
  baralhoInicial,
  CARGA_MS,
  CARTAS,
  custoAgora,
  ESTILO_PREFERIDO,
  ESTILOS,
  duracaoDaRodada,
  FOLEGO_MAX,
  FOLEGO_POR_SEGUNDO,
  GLADIADOR_ALCANCE,
  GLADIADOR_RECARGA_MS,
  golpeDoGladiador,
  jogarCarta,
  novoDuelo,
  passo,
  podeJogar,
  PONTA,
  prorrogacao,
  RODADAS,
  resultadoFinal,
  ritmoDoFolego,
  TICK,
  TRIBUNA_VIDA,
  validarBaralho,
  type CartaDuelo,
  type EfeitoVisual,
  type EstadoDuelo,
  type EstiloIa,
  type Lado,
  type TipoCarta,
  type Lutador,
} from '@/game/duelo/motor';
import { Link } from 'react-router-dom';
import { Arte, CartaVisual } from './CartaVisual';
import Anfora from './Anfora';
import { CenaColiseu } from '../cenas/Cenarios';
import { Faiscas } from '../cenas/Palco';
import { GladiadorPixel, PretorPixel } from '@/ui/pixel/Personagens';
import GladiadorEnfeitado, { useAparencia } from '@/ui/pixel/GladiadorEnfeitado';
import Sprite, { type Paleta } from '@/ui/pixel/Sprite';
import { EFEITOS, LARGURA_TROPA, PALETA_EFEITOS, paletaTropa, TRIBUNA, TROPAS } from '@/ui/pixel/tropas';
import { desbloquear, tocar, type NomeSom } from '@/ui/som';
import { PretorDestaque } from '../tribunal/visual';
import ComoJogar, { BotaoComoJogar, TUTORIAL_DUELO, useTutorial } from '../ComoJogar';

const OURO = '#f2c14e';

/** As cores de cada lado vêm da IA escolhida (pedido do Lucas). */
interface Cores {
  cor: string;
  escura: string;
  paleta: Paleta;
}
function coresDaIa(id: IaId): Cores {
  const [r, g, b] = PERSONAGENS[id].cor.split(' ').map(Number) as [number, number, number];
  const cor = `rgb(${r} ${g} ${b})`;
  const escura = `rgb(${Math.round(r * 0.55)} ${Math.round(g * 0.55)} ${Math.round(b * 0.55)})`;
  return { cor, escura, paleta: paletaTropa(cor, escura) };
}

function embaralhar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const agoraMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/** Abertura do debate: o tema, quem defende cada lado e a contagem 3, 2, 1. */
type Abertura = 'tema' | 'entrada' | 3 | 2 | 1 | 'lutem' | null;
const TEMPO_ABERTURA: Record<Exclude<Abertura, null>, number> = { tema: 0, entrada: 3400, 3: 800, 2: 800, 1: 800, lutem: 700 };
const PROXIMA: Record<Exclude<Abertura, null>, Abertura> = { tema: 'entrada', entrada: 3, 3: 2, 2: 1, 1: 'lutem', lutem: null };

export default function PartidaDuelo({
  ia,
  rival,
  onDeNovo,
  onSair,
  doisJogadores = false,
}: {
  ia: IaId;
  rival: IaId;
  onDeNovo: () => void;
  onSair: () => void;
  /** Modo 2 jogadores no mesmo aparelho: o "rival" é o Jogador 2. */
  doisJogadores?: boolean;
}) {
  const p = useProgresso();
  const dificuldade = useDificuldade();
  const { liga } = useAparencia(ia);
  const tutorial = useTutorial('duelo');
  const [acerto] = useState(() => (modoRanqueado() ? ACERTO_RIVAL[indiceLiga(p.trofeus[ia])]! : ACERTO_TREINO[dificuldade]));
  const [config] = useState(() => ({ lado: (Math.random() < 0.5 ? 'favor' : 'contra') as LadoId, dilema: Math.floor(Math.random() * DILEMAS.length) }));
  const dilema = DILEMAS[config.dilema]!;
  const ladoRival: LadoId = config.lado === 'favor' ? 'contra' : 'favor';
  const cores = useMemo<Record<Lado, Cores>>(() => ({ eu: coresDaIa(ia), rival: coresDaIa(rival) }), [ia, rival]);
  // Meu baralho salvo contra o baralho do estilo que a IA rival sorteou.
  // No modo 2 jogadores, o Jogador 2 joga com o baralho inicial da IA que escolheu.
  const [baralhos] = useState(() => ({
    eu: validarBaralho(p.baralhoDuelo, baralhoInicial(ia)),
    rival: doisJogadores ? { estilo: ESTILO_PREFERIDO[rival], cartas: baralhoInicial(rival) } : baralhoDaIa(rival),
  }));
  const [e, setE] = useState<EstadoDuelo>(() =>
    novoDuelo({
      frasesEu: embaralhar(dilema.lados[config.lado].tempos.flat().map((c) => c.titulo)),
      frasesRival: embaralhar(dilema.lados[ladoRival].tempos.flat().map((c) => c.titulo)),
      baralhoEu: baralhos.eu,
      baralhoRival: baralhos.rival.cartas,
    }),
  );
  // Segurar e soltar: qual carta está sendo segurada e desde quando.
  const [segurando, setSegurando] = useState<Record<Lado, { id: string; inicio: number } | null>>({ eu: null, rival: null });
  const [abertura, setAbertura] = useState<Abertura>('tema');
  const pausado = tutorial.aberto || abertura !== null;

  // A contagem anda sozinha; o tema espera o jogador ler com calma e apertar ESTOU PRONTO.
  useEffect(() => {
    if (abertura === null || abertura === 'tema' || tutorial.aberto) return;
    if (abertura === 'entrada') {
      tocar('portao');
      window.setTimeout(() => tocar('passos'), 400);
      window.setTimeout(() => tocar('plateia'), 1600);
    }
    if (typeof abertura === 'number') tocar('roleta');
    if (abertura === 'lutem') tocar('vs');
    const id = window.setTimeout(() => setAbertura(PROXIMA[abertura]), TEMPO_ABERTURA[abertura]);
    return () => window.clearTimeout(id);
  }, [abertura, tutorial.aberto]);

  useEffect(() => {
    if (pausado) return;
    const ctx = { acerto, iaRival: rival, aleatorio: Math.random, rivalHumano: doisJogadores };
    const id = window.setInterval(() => setE((s) => passo(s, ctx)), TICK);
    return () => window.clearInterval(id);
  }, [acerto, rival, pausado]);

  // Sons: cada efeito novo toca uma vez (um de cada tipo por vez).
  const visto = useRef(0);
  useEffect(() => {
    const novos: NomeSom[] = [];
    for (const x of e.efeitos) {
      if (x.id <= visto.current) continue;
      if (x.tipo === 'choque' || x.tipo === 'escudo') novos.push('espadas');
      if (x.tipo === 'tribuna') novos.push(x.lado === 'rival' ? 'plateia' : 'falha');
      if (x.tipo === 'super' || x.tipo === 'raio') novos.push('fanfarra');
      if (x.tipo === 'golpe') novos.push('passos');
      if (x.tipo === 'flecha') novos.push('roleta');
      if (x.tipo === 'feitico') novos.push('selecionar');
      if (x.tipo === 'riso' || x.tipo === 'pulo') novos.push('clique');
    }
    visto.current = Math.max(visto.current, ...e.efeitos.map((x) => x.id));
    [...new Set(novos)].forEach((s) => tocar(s));
  }, [e.efeitos]);

  useEffect(() => {
    if (e.fase === 'intervalo') tocar('martelo');
    if (e.fase === 'fim') {
      const r = resultadoFinal(e);
      tocar(r === 'vitoria' ? 'vitoria' : r === 'derrota' ? 'derrota' : 'martelo');
      // O Duelo ainda é protótipo: entra no histórico como treino (sem troféus nem XP).
      // A partida de 2 jogadores é amistosa: não entra no histórico.
      if (!doisJogadores) registrarPartida({ modo: 'duelo', ia, rival, venceu: r === 'vitoria', empate: r === 'empate', treino: true, dilema: dilema.pergunta });
    }
  }, [e.fase]);

  // Saiu no meio (voltou, trocou de tela)? Vale derrota. Se já acabou, não faz nada.
  useEffect(() => () => void registrarAbandono(), []);

  const jogar = (lado: Lado, carta: CartaDuelo, carga: number) => {
    if (pausado) return;
    desbloquear();
    tocar(carga >= 1 ? 'start' : 'selecionar');
    setE((s) => jogarCarta(s, lado, carta.id, carga));
  };
  const comecarCarga = (lado: Lado, carta: CartaDuelo) => {
    desbloquear();
    setSegurando((x) => ({ ...x, [lado]: { id: carta.id, inicio: agoraMs() } }));
  };
  const soltar = (lado: Lado, carta: CartaDuelo) => {
    const seg = segurando[lado];
    if (seg?.id !== carta.id) return;
    jogar(lado, carta, Math.min(1, (agoraMs() - seg.inicio) / CARGA_MS));
    setSegurando((x) => ({ ...x, [lado]: null }));
  };
  const gladiador = (lado: Lado) => {
    if (pausado) return;
    desbloquear();
    setE((s) => golpeDoGladiador(s, lado));
  };
  // Teclado. Jogador 1: segure 1 a 4 para carregar e solte para lançar; G ou espaço = golpe.
  // Jogador 2 (no modo 2 jogadores): 7, 8, 9 e 0 para as cartas; H = golpe.
  const TECLAS_J2 = ['7', '8', '9', '0'];
  useEffect(() => {
    if (pausado) return;
    const cartaDaTecla = (k: string): [Lado, CartaDuelo] | null => {
      const n = Number(k);
      if (n >= 1 && n <= 4 && e.eu.mao[n - 1]) return ['eu', e.eu.mao[n - 1]!];
      const j = TECLAS_J2.indexOf(k);
      if (doisJogadores && j >= 0 && e.rival.mao[j]) return ['rival', e.rival.mao[j]!];
      return null;
    };
    const desce = (ev: KeyboardEvent) => {
      if (ev.repeat) return;
      const achou = cartaDaTecla(ev.key);
      if (achou && podeJogar(e, achou[0], achou[1].id)) comecarCarga(achou[0], achou[1]);
      else if (ev.key === 'g' || ev.key === 'G' || ev.key === ' ') {
        ev.preventDefault();
        gladiador('eu');
      } else if (doisJogadores && (ev.key === 'h' || ev.key === 'H')) gladiador('rival');
    };
    const sobe = (ev: KeyboardEvent) => {
      const achou = cartaDaTecla(ev.key);
      if (achou) soltar(achou[0], achou[1]);
    };
    window.addEventListener('keydown', desce);
    window.addEventListener('keyup', sobe);
    return () => {
      window.removeEventListener('keydown', desce);
      window.removeEventListener('keyup', sobe);
    };
  });

  if (e.fase === 'fim') return <FimDuelo e={e} ia={ia} rival={rival} cores={cores} onDeNovo={onDeNovo} onSair={onSair} doisJogadores={doisJogadores} />;

  const voce = PERSONAGENS[ia];
  const dele = PERSONAGENS[rival];
  const restante = Math.max(0, Math.ceil((duracaoDaRodada(e) - e.tempo) / 1000));
  const extra = prorrogacao(e);
  const tribunaBatida = (l: Lado) => e.efeitos.some((x) => x.tipo === 'tribuna' && x.lado === l);
  const lados: Record<Lado, LadoDoDebate> = {
    eu: { nome: voce.gladiador, ia: voce.ia, cor: cores.eu.cor, lado: dilema.lados[config.lado].nome, tese: dilema.lados[config.lado].tese },
    rival: { nome: dele.gladiador, ia: dele.ia, cor: cores.rival.cor, lado: dilema.lados[ladoRival].nome, tese: dilema.lados[ladoRival].tese },
  };

  /**
   * A ânfora de gotas, as cartas (grandes), a carta na manga e o golpe do gladiador
   * de um lado. No modo 2 jogadores, o Jogador 2 tem os dele espelhados, à direita.
   */
  const controles = (lado: Lado) => {
    const l = e[lado];
    const c = cores[lado];
    const pronto = l.gladiadorProntoEm <= e.tempo;
    const espelhado = lado === 'rival';
    const compacto = doisJogadores;
    const nome = doisJogadores ? (lado === 'eu' ? 'JOGADOR 1' : 'JOGADOR 2') : null;
    const manga = l.monte[0];
    return (
      <div className="flex flex-col gap-1">
        {nome && (
          <p className={`font-pixel text-[9px] sm:text-[11px] ${espelhado ? 'text-right' : ''}`} style={{ color: c.cor }}>
            {nome} · {PERSONAGENS[lado === 'eu' ? ia : rival].gladiador.toUpperCase()}
          </p>
        )}
        <div className={`grid items-stretch gap-2 sm:gap-3 ${espelhado ? 'grid-cols-[auto_1fr_auto] [direction:rtl]' : 'grid-cols-[auto_1fr_auto]'}`}>
          <div className="[direction:ltr]">
            <Anfora
              gotas={l.folego}
              max={FOLEGO_MAX}
              cor={doisJogadores ? c.cor : undefined}
              rotulo={ritmoDoFolego(e, lado) > FOLEGO_POR_SEGUNDO ? (extra ? 'GOTAS EM DOBRO' : 'VIRADA +25%') : undefined}
            />
          </div>
          <section aria-label={lado === 'eu' ? 'Suas cartas' : 'Cartas do Jogador 2'} className={`grid grid-cols-4 gap-2 [direction:ltr] ${compacto ? 'gap-1' : ''}`}>
            {l.mao.map((carta, i) => (
              <CartaNaMao
                key={carta.id}
                carta={carta}
                numero={lado === 'eu' ? String(i + 1) : TECLAS_J2[i]!}
                custo={custoAgora(l, carta.tipo)}
                pode={podeJogar(e, lado, carta.id) && !pausado}
                carregando={segurando[lado]?.id === carta.id}
                cores={c}
                onSegurar={() => comecarCarga(lado, carta)}
                onSoltar={() => soltar(lado, carta)}
                onCancelar={() => setSegurando((x) => ({ ...x, [lado]: null }))}
                onTocar={() => jogar(lado, carta, 0)}
              />
            ))}
          </section>
          <div className="flex flex-col items-center justify-around gap-2 [direction:ltr]">
            {/* A carta na manga: a próxima que entra na mão (no lugar da que for jogada) */}
            {manga && (
              <div className="flex flex-col items-center gap-0.5" aria-label={`Carta na manga: ${CARTAS[manga.tipo].nome}`}>
                <span className="font-pixel text-[6px] text-[rgb(242_193_78)] sm:text-[8px]">NA MANGA</span>
                <span className="relative block w-14 pt-2 sm:w-[4.5rem]">
                  {/* A manga da toga, com a carta saindo dela */}
                  <span key={manga.id} className="surgir relative z-0 block w-[80%] -rotate-12">
                    <CartaVisual tipo={manga.tipo} paleta={c.paleta} corNome={c.cor} tamanho="mini" />
                  </span>
                  <span
                    className="absolute -bottom-1 -right-1 z-10 h-[45%] w-[70%] rounded-[50%_50%_40%_40%] border-2 border-[#8a7f6a]"
                    style={{ background: 'linear-gradient(160deg, #f4efe2, #cfc6b0)', boxShadow: `inset -3px -3px 0 ${c.escura}` }}
                    aria-hidden
                  />
                </span>
              </div>
            )}
            <BotaoRedondo
              rotulo="GOLPE"
              icone="🗡️"
              cor={c.cor}
              progresso={pronto ? 1 : 1 - (l.gladiadorProntoEm - e.tempo) / GLADIADOR_RECARGA_MS}
              pronto={pronto && e.fase === 'luta' && !pausado}
              dica="Golpe do gladiador: ele já bate sozinho em quem entra no círculo de luz; tocando, dá um golpe extra (-1). Recarrega em 8 s."
              onClick={() => gladiador(lado)}
            />
          </div>
        </div>
      </div>
    );
  };

  // Antes da luta: o tema, com calma, como no Tribunal.
  if (abertura === 'tema') {
    return (
      <>
        {tutorial.aberto && <ComoJogar titulo="DUELO" slides={TUTORIAL_DUELO} onFechar={tutorial.fechar} />}
        <BriefingDuelo
          pergunta={dilema.pergunta}
          voce={lados.eu}
          dele={lados.rival}
          iaVoce={ia}
          iaDele={rival}
          liga={liga}
          baralhoEu={baralhos.eu}
          estiloRival={baralhos.rival.estilo}
          paletaEu={cores.eu.paleta}
          doisJogadores={doisJogadores}
          onPronto={() => {
            desbloquear();
            tocar('start');
            setAbertura('entrada');
            // A partida começou: sair antes do fim conta como derrota.
            if (!doisJogadores) marcarPartidaAberta({ modo: 'duelo', ia, rival, treino: true, dilema: dilema.pergunta });
          }}
          onComoJogar={tutorial.abrir}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tutorial.aberto && <ComoJogar titulo="DUELO" slides={TUTORIAL_DUELO} onFechar={tutorial.fechar} />}
      <div className="flex justify-end">
        <BotaoComoJogar onClick={tutorial.abrir} />
      </div>

      {/* Placar: a vida das duas Tribunas, a rodada e o relógio */}
      <div className="pixel-box grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2">
        <VidaTribuna nome={voce.gladiador} cor={cores.eu.cor} vida={e.tribunas.eu} lado={lados.eu.lado} batida={tribunaBatida('eu')} minha />
        <p className="text-center font-pixel text-[8px] leading-relaxed text-muted sm:text-[10px]">
          {extra ? <span className="piscar text-[rgb(242_193_78)]">⚡ PRORROGAÇÃO</span> : `RODADA ${e.rodada}/${RODADAS}`}
          <br />
          <span className={`tabular-nums ${restante <= 10 ? 'piscar text-accent-2' : 'text-accent'}`}>⏱ {restante}</span>
        </p>
        <VidaTribuna nome={dele.gladiador} cor={cores.rival.cor} vida={e.tribunas.rival} lado={lados.rival.lado} batida={tribunaBatida('rival')} direita />
      </div>

      {/* A arena, mais comprida */}
      <div className="pixel-box relative aspect-[16/9] w-full overflow-hidden sm:aspect-[5/2]">
        <CenaColiseu corA={cores.eu.cor} corB={cores.rival.cor} viva festa={tribunaBatida('eu') || tribunaBatida('rival')} />

        <p className="absolute inset-x-0 top-[3%] z-10 truncate px-3 text-center text-[9px] text-white/80 [text-shadow:1px_1px_0_#000] sm:text-xs">
          {dilema.pergunta}{' '}
          <span style={{ color: cores.eu.cor }}>
            Você: {dilema.lados[config.lado].nome.toUpperCase()}
          </span>
        </p>

        {/* Alcance do gladiador: um círculo de luz no chão */}
        {(['eu', 'rival'] as Lado[]).map((l) => (
          <div
            key={`alcance-${l}`}
            className="alcance-luz pointer-events-none absolute bottom-[0%] h-[16%] rounded-[50%]"
            style={{
              left: `${PONTA[l] - GLADIADOR_ALCANCE}%`,
              width: `${GLADIADOR_ALCANCE * 2}%`,
              background: `radial-gradient(ellipse at center, color-mix(in srgb, ${cores[l].cor} 45%, transparent) 0%, color-mix(in srgb, ${cores[l].cor} 18%, transparent) 55%, transparent 72%)`,
              boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${cores[l].cor} 35%, transparent)`,
            }}
          />
        ))}

        {/* As Tribunas, com o gladiador em cima */}
        {(['eu', 'rival'] as Lado[]).map((l) => (
          <div key={`tribuna-${l}`} className={`absolute bottom-0 w-[15%] ${l === 'eu' ? 'left-[5%]' : 'right-[5%]'}`}>
            {/* Na entrada, o gladiador chega andando pela arena e sobe na Tribuna */}
            <div className={abertura === 'entrada' ? (l === 'eu' ? 'chegar-esq' : 'chegar-dir') : ''}>
              <Gladiador
                lado={l}
                l={e[l]}
                tempo={e.tempo}
                golpeando={abertura === 'lutem' || e.efeitos.some((x) => x.tipo === 'golpe' && x.lado === l)}
                onTocar={l === 'eu' || doisJogadores ? () => gladiador(l) : undefined}
              >
                {l === 'eu' ? <GladiadorEnfeitado ia={ia} parado /> : <GladiadorPixel ia={rival} liga={liga} espelhar />}
              </Gladiador>
            </div>
            <div className={`relative ${tribunaBatida(l) ? 'tremer' : ''}`} role="img" aria-label={`Tribuna ${l === 'eu' ? 'sua' : 'do rival'} (${lados[l].lado}): ${e.tribunas[l]} de vida`}>
              <Sprite grade={TRIBUNA} paleta={cores[l].paleta} />
              {/* Placa com o lado do debate */}
              <span
                className="absolute left-1/2 top-[30%] -translate-x-1/2 whitespace-nowrap border-2 bg-black/80 px-1 py-0.5 font-pixel text-[6px] text-white sm:text-[10px]"
                style={{ borderColor: cores[l].cor, textShadow: `0 0 6px ${cores[l].cor}` }}
              >
                {lados[l].lado.toUpperCase()}
              </span>
            </div>
          </div>
        ))}

        {/* As tropas */}
        {e.tropas.map((t) => {
          const parada = (t.paradaAte ?? 0) > e.tempo;
          const correndo = (t.rapidaAte ?? 0) > e.tempo;
          const saltando = t.puloEm !== undefined && e.tempo - t.puloEm < 600;
          const estocada = t.golpeouEm !== undefined && e.tempo - t.golpeouEm < 250;
          const ferida = t.feridaEm !== undefined && e.tempo - t.feridaEm < 160;
          const atras = t.de === 'eu' ? -1 : 1;
          // Movimento da tropa: salta em arco, dá estocada quando golpeia, marcha quando anda.
          const pose = saltando ? 'saltar' : estocada ? (t.de === 'eu' ? 'estocada-dir' : 'estocada-esq') : parada ? '' : 'marchar';
          const filtros = [
            t.carregada ? `drop-shadow(0 0 4px ${OURO})` : '',
            // Aplauso: rastro de velocidade atrás da tropa.
            correndo ? `drop-shadow(${atras * 6}px 0 0 color-mix(in srgb, ${cores[t.de].cor} 55%, transparent)) drop-shadow(${atras * 12}px 0 0 color-mix(in srgb, ${cores[t.de].cor} 25%, transparent))` : '',
            // Parada (Piada ou Pausa): fica azulada, congelada.
            parada ? 'saturate(0.4) brightness(1.25) hue-rotate(170deg)' : '',
            // Levou golpe: pisca branco.
            ferida ? 'brightness(2.6)' : '',
          ].join(' ');
          return (
            <div
              key={t.id}
              className="tropa absolute bottom-[4%] z-10 -translate-x-1/2"
              style={{ left: `${t.x}%`, width: `${LARGURA_TROPA[t.tipo]}%`, transition: saltando ? 'left 550ms ease-out' : undefined }}
              aria-hidden
            >
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-black/80 px-1 font-pixel text-[7px] sm:-top-5 sm:text-[11px]"
                style={{ color: t.carregada ? OURO : cores[t.de].cor }}
              >
                {Math.ceil(t.forca)}
              </span>
              {parada && <span className="girar-estrelas absolute -top-6 left-1/2 -translate-x-1/2 font-pixel text-[8px] text-[rgb(159_232_255)] sm:-top-9 sm:text-sm">✦ ✦</span>}
              <div className={pose} style={{ filter: filtros.trim() || undefined, opacity: t.someEm !== undefined && t.someEm - e.tempo < 2000 ? 0.6 : undefined }}>
                <Sprite grade={TROPAS[t.tipo]} paleta={cores[t.de].paleta} espelhar={t.de === 'rival'} />
              </div>
            </div>
          );
        })}

        {/* Efeitos */}
        {e.efeitos.map((x) => (
          <EfeitoNaArena key={x.id} x={x} cor={cores[x.lado].cor} />
        ))}

        {e.aviso && e.fase === 'luta' && (
          <p
            key={e.aviso.texto + e.aviso.ate}
            className="pancada neon absolute left-1/2 top-[16%] z-20 -translate-x-1/2 whitespace-nowrap bg-black/60 px-2 py-1 font-pixel text-[9px] sm:text-sm"
            style={{ color: e.aviso.lado ? cores[e.aviso.lado].cor : OURO }}
          >
            {e.aviso.texto}
          </p>
        )}

        {e.fase === 'intervalo' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/70 text-center">
            <p className="pancada neon font-pixel text-sm text-accent sm:text-2xl">{e.aviso?.texto ?? 'FIM DA RODADA'}</p>
            <p className="font-pixel text-[9px] text-muted sm:text-xs">
              TRIBUNAS {e.tribunas.eu} × {e.tribunas.rival} · {e.rodada >= RODADAS ? 'PREPARE-SE PARA A PRORROGAÇÃO' : `PREPARE-SE PARA A RODADA ${e.rodada + 1}`}
            </p>
          </div>
        )}

        {abertura === 'entrada' && (
          <p className="pancada neon absolute left-1/2 top-[18%] z-40 w-max max-w-[90%] -translate-x-1/2 bg-black/60 px-3 py-1 text-center font-pixel text-[8px] leading-relaxed text-[rgb(242_193_78)] sm:text-base">
            OS GLADIADORES ENTRAM NA ARENA!
          </p>
        )}
        {abertura !== null && abertura !== 'entrada' && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60">
            <p key={String(abertura)} className="contagem neon font-pixel text-4xl text-accent sm:text-7xl">
              {abertura === 'lutem' ? 'LUTEM!' : abertura}
            </p>
          </div>
        )}
      </div>

      {doisJogadores ? (
        // Duas pessoas no mesmo aparelho: Jogador 1 à esquerda, Jogador 2 à direita.
        <div className="grid gap-3 lg:grid-cols-2">
          {controles('eu')}
          {controles('rival')}
        </div>
      ) : (
        controles('eu')
      )}
      <p className="text-center text-[10px] text-muted sm:text-xs">Toque para lançar · segure até a barrinha encher: +1 de força (custa +1 💧)</p>
    </div>
  );
}

interface LadoDoDebate {
  nome: string;
  ia: string;
  cor: string;
  lado: string;
  tese: string;
}

/** Antes da luta, como no Tribunal: o tema em destaque, a sua opinião e a do rival. Começa quando você quiser. */
function BriefingDuelo({
  pergunta,
  voce,
  dele,
  iaVoce,
  iaDele,
  liga,
  baralhoEu,
  estiloRival,
  paletaEu,
  onPronto,
  onComoJogar,
  doisJogadores = false,
}: {
  pergunta: string;
  voce: LadoDoDebate;
  dele: LadoDoDebate;
  iaVoce: IaId;
  iaDele: IaId;
  liga: number;
  baralhoEu: TipoCarta[];
  estiloRival: EstiloIa;
  paletaEu: Paleta;
  onPronto: () => void;
  onComoJogar: () => void;
  doisJogadores?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <BotaoComoJogar onClick={onComoJogar} />
      </div>
      <PretorDestaque fala="Leia com calma: este é o tema do duelo.">
        <p className="mt-3 font-pixel text-[9px] text-[rgb(242_193_78)] sm:text-[11px]">⚖ O TEMA</p>
        <h2 className="mt-2 text-xl font-semibold leading-snug sm:text-3xl">{pergunta}</h2>
      </PretorDestaque>

      <div className="grid gap-3 sm:grid-cols-[3fr_2fr]">
        {/* Você: bem em destaque */}
        <section aria-label="Sua opinião" className="pixel-box flex items-center gap-4 p-4" style={{ boxShadow: `0 0 0 3px ${voce.cor}, 0 0 24px -6px ${voce.cor}` }}>
          <div className="w-16 shrink-0 sm:w-20">
            <GladiadorEnfeitado ia={iaVoce} parado />
          </div>
          <div className="min-w-0">
            <p className="font-pixel text-[8px] sm:text-[10px]" style={{ color: voce.cor }}>
              {doisJogadores ? 'JOGADOR 1' : 'VOCÊ'} · {voce.nome.toUpperCase()} · {voce.ia.toUpperCase()}
            </p>
            <p className="mt-1 font-pixel text-base text-white sm:text-2xl" style={{ textShadow: `0 0 10px ${voce.cor}` }}>
              {voce.lado.toUpperCase()}
            </p>
            <p className="mt-2 text-sm font-semibold leading-snug sm:text-base">Sua opinião: "{voce.tese}"</p>
          </div>
        </section>
        {/* O rival */}
        <section aria-label="Opinião do rival" className="pixel-box flex items-center gap-3 p-4 opacity-90" style={{ boxShadow: `0 0 0 2px ${dele.cor}` }}>
          <div className="w-12 shrink-0 sm:w-14">
            <GladiadorPixel ia={iaDele} liga={liga} espelhar />
          </div>
          <div className="min-w-0">
            <p className="font-pixel text-[8px] sm:text-[9px]" style={{ color: dele.cor }}>
              {doisJogadores ? 'JOGADOR 2' : 'RIVAL'} · {dele.nome.toUpperCase()} · {dele.ia.toUpperCase()}
            </p>
            <p className="mt-1 font-pixel text-sm text-white sm:text-lg">{dele.lado.toUpperCase()}</p>
            <p className="mt-1 text-xs italic leading-snug text-muted sm:text-sm">"{dele.tese}"</p>
            <p className="mt-2 font-pixel text-[7px] text-[rgb(242_193_78)] sm:text-[8px]">
              {doisJogadores ? 'BARALHO' : 'BARALHO DO RIVAL'}: ESTILO {ESTILOS[estiloRival].nome.toUpperCase()}
            </p>
          </div>
        </section>
      </div>

      {/* Meu baralho para esta luta */}
      <section aria-label="Meu baralho nesta luta" className="pixel-box flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="font-pixel text-[8px] sm:text-[10px]" style={{ color: voce.cor }}>
            🃏 SEU BARALHO
          </p>
          <Link to="/arena/duelo" onClick={() => tocar('clique')} className="font-pixel text-[8px] text-accent hover:underline sm:text-[9px]">
            ✎ TROCAR CARTAS
          </Link>
        </div>
        <ul className="grid grid-cols-8 gap-1">
          {baralhoEu.map((c) => (
            <li key={c} className="flex flex-col items-center" title={`${CARTAS[c].nome}: ${CARTAS[c].dica}`}>
              <Arte tipo={c} paleta={paletaEu} pequena />
              <span className="font-pixel text-[5px] text-muted sm:text-[7px]">💨{CARTAS[c].custo}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-center text-sm text-muted">Suas tropas levam as frases do seu lado. Defenda a sua opinião derrubando a Tribuna do rival!</p>
      <button type="button" autoFocus onClick={onPronto} className="pixel-box pixel-hover self-center px-6 py-3 font-pixel text-xs text-accent sm:text-sm">
        ⚔ ESTOU PRONTO
      </button>
    </div>
  );
}

function CartaNaMao(props: {
  carta: CartaDuelo;
  numero: string;
  custo: number;
  pode: boolean;
  carregando: boolean;
  cores: Cores;
  onSegurar: () => void;
  onSoltar: () => void;
  onCancelar: () => void;
  onTocar: () => void;
}) {
  const { carta, numero, custo, pode, carregando, cores } = props;
  const info = CARTAS[carta.tipo];
  // Depois de segurar e soltar, o navegador ainda manda um clique: este ignora.
  const ignorarClique = useRef(false);
  const carrega = !!info.carrega;
  return (
    <button
      type="button"
      disabled={!pode}
      onPointerDown={(ev) => {
        if (!pode || !carrega) return;
        ev.currentTarget.setPointerCapture?.(ev.pointerId);
        props.onSegurar();
      }}
      onPointerUp={() => {
        if (!carregando) return;
        ignorarClique.current = true;
        props.onSoltar();
      }}
      onPointerCancel={props.onCancelar}
      onClick={() => {
        if (ignorarClique.current) {
          ignorarClique.current = false;
          return;
        }
        props.onTocar();
      }}
      onContextMenu={(ev) => ev.preventDefault()}
      aria-label={`${info.nome}, ${info.forca ? `força ${info.forca}, ` : ''}custa ${custo}`}
      title={info.dica}
      className="relative select-none transition [-webkit-touch-callout:none] enabled:hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <CartaVisual
        tipo={carta.tipo}
        paleta={cores.paleta}
        corNome={cores.cor}
        custo={custo}
        tamanho="mao"
        rodape={
          <>
            <span className="mt-auto hidden pb-0.5 font-pixel text-[7px] text-muted sm:block">[{numero}]</span>
            {/* Barra de carga: cheia = +1 de força (custa +1 de fôlego) */}
            {carrega && (
              <span className="relative mt-auto block h-1.5 w-full bg-black/60" aria-hidden>
                {carregando && <span className="carga-enchendo absolute inset-y-0 left-0" style={{ animationDuration: `${CARGA_MS}ms` } as CSSProperties} />}
              </span>
            )}
          </>
        }
      />
    </button>
  );
}

/** Gladiador em cima da Tribuna: defende. O seu dá um golpe quando você toca nele. */
function Gladiador({ lado, l, tempo, golpeando, onTocar, children }: { lado: Lado; l: Lutador; tempo: number; golpeando: boolean; onTocar?: () => void; children: ReactNode }) {
  const pronto = l.gladiadorProntoEm <= tempo;
  const corpo = (
    <>
      {l.fala && (
        <span
          key={l.fala.ate}
          className={`surgir absolute bottom-[105%] z-10 block w-[230%] rounded bg-white px-1.5 py-1 text-[8px] leading-tight text-black sm:text-[11px] ${lado === 'eu' ? 'left-0 text-left' : 'right-0 text-right'}`}
        >
          "{l.fala.texto}"
        </span>
      )}
      {l.escudo > 0 && <span className="absolute -top-[2%] left-1/2 z-10 -translate-x-1/2 text-sm sm:text-xl">{'🛡️'.repeat(l.escudo)}</span>}
      <div className={golpeando ? (lado === 'eu' ? 'investida-esq' : 'investida-dir') : ''}>{children}</div>
    </>
  );
  // Em pé no alto da Tribuna, na plataforma de cima.
  const pos = 'relative z-10 mx-auto -mb-[14%] block w-[92%]';
  return onTocar ? (
    <button type="button" onClick={onTocar} disabled={!pronto} aria-label="Golpe do gladiador" className={`${pos} text-left disabled:cursor-default`}>
      {corpo}
      {pronto && <span className="piscar absolute -bottom-1 left-1/2 -translate-x-1/2 font-pixel text-[6px] text-[rgb(242_193_78)] sm:text-[8px]">TOQUE</span>}
    </button>
  ) : (
    <div className={pos}>{corpo}</div>
  );
}

/** Vida de uma Tribuna no placar (treme e pisca quando leva golpe). */
function VidaTribuna({
  nome,
  cor,
  vida,
  lado,
  batida,
  minha = false,
  direita = false,
}: {
  nome: string;
  cor: string;
  vida: number;
  lado: string;
  batida: boolean;
  minha?: boolean;
  direita?: boolean;
}) {
  const pct = (vida / TRIBUNA_VIDA) * 100;
  // Levou golpe: a barra treme e pisca (vermelho quando é a sua, dourado quando você acertou o rival).
  const brilho = batida ? (minha ? '0 0 0 2px #ff3b4a, 0 0 18px #ff3b4a' : '0 0 0 2px #f2c14e, 0 0 18px #f2c14e') : undefined;
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${direita ? 'items-end' : 'items-start'} ${batida ? 'tremer' : ''}`}>
      <p className="max-w-full truncate font-pixel text-[8px] sm:text-[10px]" style={{ color: cor }}>
        🏛️ {nome.toUpperCase()}
        <span className="ml-1 text-white">· {lado.toUpperCase()}</span>
      </p>
      <div
        className="relative h-3 w-full bg-black/60 sm:h-4"
        style={{ boxShadow: brilho }}
        role="meter"
        aria-label={`Tribuna de ${nome}`}
        aria-valuenow={vida}
        aria-valuemin={0}
        aria-valuemax={TRIBUNA_VIDA}
      >
        <div className={`absolute inset-y-0 transition-all duration-300 ${direita ? 'right-0' : 'left-0'}`} style={{ width: `${pct}%`, background: batida && minha ? '#ff3b4a' : cor }} />
        {batida && !minha && <span className="pancada absolute -top-5 left-1/2 -translate-x-1/2 font-pixel text-[9px] text-[rgb(242_193_78)]">BOA!</span>}
        <span className="absolute inset-0 flex items-center justify-center font-pixel text-[7px] text-white [text-shadow:1px_1px_0_#000] sm:text-[8px]">
          {vida}/{TRIBUNA_VIDA}
        </span>
      </div>
    </div>
  );
}

function FimDuelo({
  e,
  ia,
  rival,
  cores,
  onDeNovo,
  onSair,
  doisJogadores = false,
}: {
  e: EstadoDuelo;
  ia: IaId;
  rival: IaId;
  cores: Record<Lado, Cores>;
  onDeNovo: () => void;
  onSair: () => void;
  doisJogadores?: boolean;
}) {
  const r = resultadoFinal(e);
  return (
    <div className="pixel-box flex flex-col items-center gap-4 p-5 text-center">
      <div className="relative w-24 sm:w-32">
        <PretorPixel />
        <span className="pancada absolute -right-10 top-1/3 text-5xl sm:text-6xl">{r === 'vitoria' ? '👍' : r === 'derrota' ? '👎' : '✋'}</span>
      </div>
      <p className="font-pixel text-[9px] text-[rgb(242_193_78)]">O CÉSAR DECIDIU</p>
      {e.aviso && <p className="font-pixel text-[9px] text-muted">{e.aviso.texto}</p>}
      <h2 className={`pancada neon font-pixel text-3xl sm:text-5xl ${r === 'derrota' ? 'text-accent-2' : 'text-accent'}`}>
        {doisJogadores
          ? r === 'vitoria'
            ? 'JOGADOR 1 VENCEU!'
            : r === 'derrota'
              ? 'JOGADOR 2 VENCEU!'
              : 'EMPATE'
          : r === 'vitoria'
            ? 'VITÓRIA!'
            : r === 'derrota'
              ? 'DERROTA'
              : 'EMPATE'}
      </h2>
      <p className="font-pixel text-[10px] leading-relaxed sm:text-sm">
        VIDA DAS TRIBUNAS
        <br />
        <span style={{ color: cores.eu.cor }}>
          {PERSONAGENS[ia].gladiador} {e.tribunas.eu}
        </span>{' '}
        ×{' '}
        <span style={{ color: cores.rival.cor }}>
          {e.tribunas.rival} {PERSONAGENS[rival].gladiador}
        </span>
      </p>
      <p className="font-pixel text-[8px] text-muted">{doisJogadores ? 'PARTIDA AMISTOSA · 2 JOGADORES' : 'PROTÓTIPO · AINDA NÃO VALE TROFÉUS'}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" autoFocus onClick={onDeNovo} className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent">
          ↻ JOGAR DE NOVO
        </button>
        <button type="button" onClick={onSair} className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px]">
          ◀ ARCADE
        </button>
      </div>
    </div>
  );
}

/** Botão redondo de ação (golpe do gladiador, habilidade), com anel que enche até ficar pronto. */
function BotaoRedondo({
  rotulo,
  icone,
  cor,
  progresso,
  pronto,
  dica,
  onClick,
}: {
  rotulo: string;
  icone: string;
  cor: string;
  progresso: number;
  pronto: boolean;
  dica: string;
  onClick: () => void;
}) {
  const graus = Math.max(0, Math.min(1, progresso)) * 360;
  return (
    <button type="button" disabled={!pronto} onClick={onClick} aria-label={dica} title={dica} className="group flex flex-col items-center gap-1 disabled:cursor-not-allowed">
      <span
        className={`grid h-14 w-14 place-items-center rounded-full p-1 sm:h-20 sm:w-20 ${pronto ? 'piscar' : ''}`}
        style={{ background: `conic-gradient(${cor} ${graus}deg, rgb(255 255 255 / 0.12) 0)`, boxShadow: pronto ? `0 0 18px ${cor}` : undefined }}
      >
        <span className={`grid h-full w-full place-items-center rounded-full bg-[rgb(20_14_30)] text-2xl transition group-hover:brightness-125 sm:text-4xl ${pronto ? '' : 'opacity-50'}`}>
          {icone}
        </span>
      </span>
      <span className="max-w-[5.5rem] text-center font-pixel text-[6px] leading-tight sm:text-[8px]" style={{ color: pronto ? cor : undefined }}>
        {rotulo}
      </span>
    </button>
  );
}

/** Cada efeito da luta em pixel: flechas e pedras voando, cortes, raios, feitiços, risadas. */
function EfeitoNaArena({ x, cor }: { x: EfeitoVisual; cor: string }) {
  const paleta = { ...PALETA_EFEITOS, C: cor };
  const alvo = x.x ?? 50;
  const voo = (largura: number, ms: number, base: string, filho: ReactNode, arco = false) => (
    <div
      className={`voar pointer-events-none absolute z-20 -translate-x-1/2 ${base}`}
      style={{ '--de': `${x.x0 ?? alvo}%`, '--ate': `${alvo}%`, width: `${largura}%`, animationDuration: `${ms}ms` } as CSSProperties}
      aria-hidden
    >
      <div className={arco ? 'arco' : ''} style={{ animationDuration: `${ms}ms` }}>
        {filho}
      </div>
    </div>
  );
  const indo = (x.x0 ?? 0) <= alvo;
  switch (x.tipo) {
    case 'flecha':
      return voo(3.5, 420, 'bottom-[14%]', <Sprite grade={EFEITOS.flecha} paleta={paleta} espelhar={!indo} />);
    case 'dardo':
      return voo(5, 420, 'bottom-[12%]', <Sprite grade={EFEITOS.dardo} paleta={paleta} espelhar={!indo} />);
    case 'pedra':
      return voo(2.5, 650, 'bottom-[14%]', <Sprite grade={EFEITOS.pedra} paleta={paleta} />, true);
    case 'choque':
      return (
        <>
          <Faiscas x={alvo} y={86} cor="#ffffff" />
          <div className="pancada pointer-events-none absolute bottom-[10%] z-20 w-[6%] -translate-x-1/2" style={{ left: `${alvo}%` }} aria-hidden>
            <Sprite grade={EFEITOS.corte} paleta={paleta} espelhar={x.lado === 'rival'} />
          </div>
        </>
      );
    case 'golpe':
      return (
        <div className="pancada pointer-events-none absolute bottom-[10%] z-20 w-[9%] -translate-x-1/2" style={{ left: `${alvo}%`, filter: `drop-shadow(0 0 8px ${OURO})` }} aria-hidden>
          <Sprite grade={EFEITOS.corte} paleta={{ ...paleta, W: OURO }} espelhar={x.lado === 'rival'} />
        </div>
      );
    case 'raio':
      return (
        <div className="cair pointer-events-none absolute bottom-[8%] z-20 w-[5%]" style={{ left: `${alvo}%`, filter: 'drop-shadow(0 0 8px #ffe066)' }} aria-hidden>
          <Sprite grade={EFEITOS.raio} paleta={paleta} />
        </div>
      );
    case 'tribuna':
      return <Faiscas x={x.lado === 'eu' ? 12 : 88} y={55} cor={cor} />;
    case 'super':
      return <div className="clarao pointer-events-none absolute inset-0 z-20" style={{ background: `color-mix(in srgb, ${cor} 45%, transparent)` }} />;
    case 'escudo':
      return (
        <div
          className="onda-area pointer-events-none absolute bottom-[10%] z-20 aspect-square w-[12%] -translate-x-1/2 rounded-full border-4"
          style={{ left: `${alvo}%`, borderColor: OURO, boxShadow: `0 0 16px ${OURO}` }}
          aria-hidden
        />
      );
    case 'pulo':
      return <Faiscas x={alvo} y={92} cor="#e8c89a" />;
    case 'morte':
      // A tropa caiu: some numa nuvem de poeira em pixel.
      return (
        <div className="fumaca pointer-events-none absolute bottom-[6%] z-20 aspect-square w-[6%] -translate-x-1/2" style={{ left: `%` }} aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} />
          ))}
        </div>
      );
    case 'dano':
      // O número do dano subindo em cima da tropa ferida.
      return (
        <p
          className="subir-sumir pointer-events-none absolute bottom-[26%] z-30 -translate-x-1/2 font-pixel text-[9px] text-[#ff5a5a] [text-shadow:2px_2px_0_#000] sm:text-base"
          style={{ left: `${alvo}%` }}
        >
          -{Number.isInteger(x.valor) ? x.valor : (x.valor ?? 0).toFixed(1)}
        </p>
      );
    case 'riso':
      return (
        <p className="subir-sumir pointer-events-none absolute bottom-[24%] z-20 -translate-x-1/2 whitespace-nowrap font-pixel text-[8px] text-[rgb(255_224_102)] [text-shadow:2px_2px_0_#000] sm:text-sm" style={{ left: `${alvo}%` }}>
          HA HA!
        </p>
      );
    case 'feitico': {
      const tipo = x.icone as 'refutacao' | 'pergunta' | 'pausa' | 'aplauso';
      if (tipo === 'refutacao')
        return (
          <>
            <div className="cair pointer-events-none absolute bottom-[10%] z-20 w-[6%]" style={{ left: `${alvo}%`, filter: 'drop-shadow(0 0 8px #ff3b4a)' }} aria-hidden>
              <Sprite grade={EFEITOS.refutacao} paleta={paleta} />
            </div>
            <Faiscas x={alvo} y={86} cor="#ff3b4a" />
          </>
        );
      if (tipo === 'pergunta')
        return (
          <>
            <div className="onda-area pointer-events-none absolute bottom-[2%] z-20 aspect-[2/1] w-[28%] -translate-x-1/2 rounded-[50%] border-[6px]" style={{ left: `${alvo}%`, borderColor: '#b07cff' }} aria-hidden />
            <div className="pancada pointer-events-none absolute bottom-[28%] z-20 w-[6%] -translate-x-1/2" style={{ left: `${alvo}%` }} aria-hidden>
              <Sprite grade={EFEITOS.pergunta} paleta={{ ...paleta, G: '#b07cff' }} />
            </div>
          </>
        );
      return (
        <>
          <div className="clarao pointer-events-none absolute inset-0 z-20" style={{ background: tipo === 'pausa' ? 'rgb(159 232 255 / 0.5)' : 'rgb(242 193 78 / 0.3)' }} />
          <div className="pancada pointer-events-none absolute left-1/2 top-[25%] z-20 w-[12%] -translate-x-1/2" aria-hidden>
            <Sprite grade={EFEITOS[tipo]} paleta={paleta} />
          </div>
        </>
      );
    }
    default:
      return null;
  }
}
