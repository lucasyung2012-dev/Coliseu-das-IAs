import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IAS, PERSONAGENS, type IaId } from '@/game/personagens';
import { apagarSaveHistoria, ganharSegredoHistoria, gravarSaveHistoria, useProgresso } from '@/game/progresso';
import { ajustarOrdem, atributosDoSave, avancarSave, CAMINHOS_ABERTOS, criarSave, criarSaveSecreto, criarSaveUnica, ganharPecas, NOME_DO_CAMINHO, type SaveHistoria } from '@/game/historia/saves';
import { heroiDaCena, TIME_DESDE_O_ATO } from '@/game/historia/historiaUnica';
import { estadoRoma } from '@/game/historia/roma';
import { LegendaRoma, MapaRoma } from './MapaRoma';
import { ESTILO_DO_HEROI, type AtributosLuta } from '@/game/historia/luta';
import { PROLOGO, proximaCena, type Cena, type Falante, type Lugar } from '@/game/historia/roteiro';
import { capitulosDoSave, chaveCompleta, equipeDoSecreto, PEDACOS_DA_CHAVE, saveCompleto } from '@/game/historia/roteiro4';
import { GladiadorPixel } from '@/ui/pixel/Personagens';
import { desbloquear } from '@/ui/som';
import { tocar } from '@/ui/somHistoria';
import { Cutscene, Explorar, Falas, Palco } from './Cenas';
import { CenarioHistoria } from './Cenarios';
import { Portoes } from './Portoes';
import Icone from '@/ui/pixel/Icones';
import { LinhaDoTempo } from './LinhaDoTempo';
import { FaseAberta } from './FaseAberta';
import { MenuPausa, PausaContexto } from './Pausa';
import { abafarMusica, temaDoLugar, useMusica, type TemaMusica } from '@/ui/musica';
import { INIMIGOS } from '@/game/historia/inimigos';
import { FASES } from '@/game/historia/fases';
import { MAPAS, MUNDOS, mundoDoExplorar } from '@/game/historia/mundos';
import { MundoAberto } from './MundoAberto';
import { LutaHistoria } from './Luta';
import { ChefaoNoMapa } from './ChefaoNoMapa';
import { ChefaoEmEtapas } from './ChefaoEmEtapas';
import { CHEFES } from '@/game/historia/chefoesDefs';

/** A habilidade de cada um na primeira etapa do chefão (rascunho: o Lucas pode reescrever). */
const FALA_HABILIDADE: Partial<Record<Falante, string>> = {
  cassius: 'E o botão ESCUDO segura quase tudo, mas eu ando devagar com ele.',
  octavius: 'E a REDE: de perto, prende ele na hora e some com as cópias.',
  helios: 'E o PASSO DE SOMBRA: sumo e apareço mais à frente, sem levar nada.',
};
import { DesafioCarroca, DesafioLivros } from './Desafio';
import { DesafioMarcas, DesafioPlanos } from './Desafios2';
import { DesafioArmadilhas, DesafioFurtivo, DesafioProteger, DesafioRitmo } from './Desafios3';
import { Ludus } from './Ludus';
import { EscolhaRota } from './EscolhaRota';
import { MinigameBarcos, MinigameCanhoes, MinigameEstrelas, MinigamePerseguicao } from './MinigamesOctavius';
import { MinigameEnigmas, MinigameEspelhos, MinigameMapaCeu, MinigameSaltos, MinigameTelescopio } from './MinigamesHelios';
import { MinigameCorrida, MinigameForja, MinigameMemoria, MinigameTorre, MinigameTrio } from './MinigamesLudus';
import { DesafioRemar, DesafioTempestade } from './MinigamesMar';

/**
 * O Coliseu: o modo História (docs/HISTORIA.md). Prólogo, saves (quantos quiser,
 * um gladiador por save) e o jogo, que roda as cenas do capítulo em ordem e salva
 * sozinho no começo de cada cena.
 */
const HEROI: Record<IaId, Falante> = { claude: 'cassius', chatgpt: 'octavius', gemini: 'helios' };
const CRIME: Record<IaId, string> = {
  claude: 'Guardião da Grande Biblioteca. Escondeu os livros que o Censor mandou queimar.',
  chatgpt: 'Comandante da frota do Porto. Desobedeceu à ordem de afundar um navio de refugiados.',
  gemini: 'Vigia do Observatório. Previu nas estrelas a queda do Censor.',
};

type Tela = { tipo: 'prologo' } | { tipo: 'saves' } | { tipo: 'escolher' } | { tipo: 'jogo'; id: string };

export default function ColiseuHistoria() {
  const p = useProgresso();
  const saves = [...(p.historia ?? [])].sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
  const [tela, setTela] = useState<Tela>({ tipo: 'saves' });
  const [apagando, setApagando] = useState<string | null>(null);
  // Chegou pela tela inicial: os portões de pedra (fechados lá) se abrem aqui.
  const veioPeloPortao = !!(useLocation().state as { portao?: boolean } | null)?.portao;
  const [portao, setPortao] = useState(veioPeloPortao);
  useEffect(() => {
    if (!portao) return;
    const id = window.setTimeout(() => setPortao(false), 1200);
    return () => window.clearTimeout(id);
  }, []);

  // Toda história nova começa pelo prólogo (pedido do Lucas); no fim dele, escolhe o condenado.
  // Versão 2 (22/11/2026): a história é uma só (os três juntos). Depois do prólogo, ela começa direto.
  const fimDoPrologo = () => {
    const novo = criarSaveUnica();
    gravarSaveHistoria(novo);
    setTela({ tipo: 'jogo', id: novo.id });
  };

  // O segredo: com os três pedaços da chave, aparece uma grade no chão do título. Três toques abrem.
  const temChave = chaveCompleta(p.historiaSegredos);
  const [toquesGrade, setToquesGrade] = useState(0);
  const tocarGrade = () => {
    desbloquear();
    const n = toquesGrade + 1;
    setToquesGrade(n);
    tocar(n >= 3 ? 'portao' : 'martelo');
    if (n < 3) return;
    setToquesGrade(0);
    const novo = criarSaveSecreto();
    gravarSaveHistoria(novo);
    setTela({ tipo: 'jogo', id: novo.id });
  };

  // O menu de pausa (MENU ou Esc): pausa a luta e a fase.
  const [pausado, setPausado] = useState(false);
  // O mapa de Roma aberto pelo minimapa do canto (a história fica parada enquanto isso).
  const [mapaAberto, setMapaAberto] = useState(false);
  useEffect(() => {
    if (tela.tipo !== 'jogo') return;
    const tecla = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setPausado((x) => !x);
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [tela.tipo]);

  const save = tela.tipo === 'jogo' ? saves.find((s) => s.id === tela.id) : undefined;

  // A música de fundo: o tema do lugar da cena (na luta, mais rápida; contra chefão, o tema dele).
  // Fica aqui (e não em cada cena) para não recomeçar a cada fala: só troca quando o tema muda.
  const musica: { tema: TemaMusica; luta: boolean } | null = (() => {
    if (tela.tipo === 'prologo') return { tema: 'rua', luta: false };
    if (tela.tipo !== 'jogo' || !save) return null;
    const c = capitulosDoSave(save)[save.capitulo - 1]?.cenas[save.cena];
    if (!c) return { tema: 'livre', luta: false };
    const luta = c.tipo === 'luta';
    if (luta && INIMIGOS[c.inimigo]?.chefao) return { tema: 'chefao', luta: true };
    return { tema: temaDoLugar(lugarDaCena(c)), luta };
  })();
  useMusica(musica?.tema ?? null, musica?.luta ?? false);
  useEffect(() => abafarMusica(pausado), [pausado]);
  // O save aberto sumiu (apagado em outro aparelho, por exemplo): volta para a lista em vez de ficar em branco.
  useEffect(() => {
    if (tela.tipo === 'jogo' && !save) setTela({ tipo: 'saves' });
  }, [tela, save]);

  return (
    <main data-area="coliseu" className="relative min-h-screen bg-[#0c0a10] text-fg">
      {portao && <Portoes modo="abre" />}
      <div className="coliseu-conteudo relative mx-auto flex max-w-4xl flex-col gap-4 px-3 pb-16 pt-5 sm:px-6">
        <div className="flex items-center justify-between">
          {tela.tipo === 'jogo' ? (
            <button
              type="button"
              onClick={() => {
                desbloquear();
                tocar('clique');
                setPausado(true);
              }}
              className="pixel-box px-3 py-1.5 font-pixel text-[10px] text-[#f2c14e]"
              aria-label="Abrir o menu (pausa)"
            >
              MENU
            </button>
          ) : (
            <Link to="/" className="font-pixel text-[10px] text-muted hover:text-accent">
              ◀ INÍCIO
            </Link>
          )}
          {tela.tipo === 'jogo' && save?.unica ? (
            // O MINIMAPA: Roma inteira, pequenininha, no canto; tocar abre o mapa grande.
            <button
              type="button"
              onClick={() => {
                desbloquear();
                tocar('pagina');
                setMapaAberto(true);
              }}
              className="minimapa pixel-box w-24 p-0.5 sm:w-36"
              aria-label="Abrir o mapa de Roma"
            >
              <MapaRoma estado={estadoRoma(save.capitulo, save.cena)} mini />
            </button>
          ) : (
            <p className="font-pixel text-[10px] text-[#f2c14e]">COLISEU · MODO HISTÓRIA</p>
          )}
        </div>

        {tela.tipo === 'prologo' && <Cutscene quadros={PROLOGO} onFim={fimDoPrologo} />}

        {tela.tipo === 'saves' && (
          <section aria-label="Saves" className="flex flex-col gap-4">
            {/* O título sobre a cena do Coliseu, com o Olho e as três estrelas */}
            <header className="pixel-box relative aspect-[16/9] w-full overflow-hidden sm:aspect-[16/6]">
              <CenarioHistoria lugar="titulo" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_30%,rgba(0,0,0,0.85)_100%)]" aria-hidden />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 p-3 text-center sm:p-5">
                <p className="font-pixel text-[8px] tracking-[0.3em] text-[#ff5a5a] sm:text-[10px]">MODO HISTÓRIA</p>
                <h1 className="titulo-jogo font-pixel text-lg text-[#f2c14e] sm:text-3xl">AS TRÊS ESTRELAS</h1>
                <p className="max-w-lg text-xs text-white/80 sm:text-sm">Roma Eterna. Três IAs condenadas por pensar diferente. A história de Cassius, Octavius e Helios, contada em partes.</p>
              </div>
              {/* Os pedaços da chave já achados (bem discretos, no canto) */}
              {(p.historiaSegredos ?? []).length > 0 && (
                <div className="absolute right-2 top-2 flex gap-1 text-sm opacity-70 sm:text-base" aria-label="Pedaços da chave">
                  {PEDACOS_DA_CHAVE.map((k) => (
                    <span key={k.id} title={(p.historiaSegredos ?? []).includes(k.id) ? k.nome : '?'} className={(p.historiaSegredos ?? []).includes(k.id) ? '' : 'opacity-20 grayscale'}>
                      <Icone nome={k.icone} className="w-5 sm:w-6" />
                    </span>
                  ))}
                </div>
              )}
              {/* A grade escondida: só aparece com a chave inteira */}
              {temChave && (
                <button
                  type="button"
                  onClick={tocarGrade}
                  aria-label="Uma grade no chão da arena"
                  className={`grade-secreta absolute left-[4%] top-[8%] z-10 w-[9%] sm:w-[6%] ${toquesGrade > 0 ? 'grade-tremendo' : ''}`}
                  data-toques={toquesGrade}
                >
                  <svg viewBox="0 0 16 8" className="block w-full" shapeRendering="crispEdges" aria-hidden>
                    <rect x="0" y="0" width="16" height="8" fill="#1a1208" />
                    <rect x="0" y="0" width="16" height="1" fill="#c8962a" />
                    <rect x="0" y="7" width="16" height="1" fill="#c8962a" />
                    {[2, 5, 8, 11, 14].map((x) => (
                      <rect key={x} x={x} y="1" width="1" height="6" fill="#8a6a2a" />
                    ))}
                    <rect x="7" y="3" width="2" height="2" fill={toquesGrade >= 2 ? '#7ad0ff' : toquesGrade === 1 ? '#f2c14e' : '#ff5a5a'} />
                  </svg>
                </button>
              )}
            </header>

            {/* As Partes da história, como cartazes de filme */}
            <PrateleiraPartes saves={saves} />

            <>
            <button
              type="button"
              onClick={() => {
                desbloquear();
                tocar('selecionar');
                setTela({ tipo: 'prologo' });
              }}
              className="pixel-box pixel-hover flex items-center justify-center gap-3 py-4 font-pixel text-sm text-[#f2c14e] sm:text-base"
            >
              + NOVA HISTÓRIA
            </button>

            {saves.length === 0 && <p className="text-center text-sm text-muted">Nenhuma história ainda. Comece uma nova: a história de Cassius, Octavius e Helios.</p>}
            {saves.length > 0 && (
              <>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {saves.map((s) => (
                    <CartaoSave
                      key={s.id}
                      s={s}
                      numero={numeroDoSave(s, p.historia ?? [])}
                      apagando={apagando === s.id}
                      onContinuar={() => {
                        desbloquear();
                        tocar('start');
                        // Save de antes da ordem nova do capítulo 1: acha a cena equivalente.
                        const ajustado = ajustarOrdem(s);
                        if (ajustado !== s) gravarSaveHistoria(ajustado);
                        setTela({ tipo: 'jogo', id: s.id });
                      }}
                      onPedirApagar={() => setApagando(s.id)}
                      onApagar={() => {
                        apagarSaveHistoria(s.id);
                        setApagando(null);
                      }}
                      onNaoApagar={() => setApagando(null)}
                    />
                  ))}
                </ul>
              </>
            )}
            </>
          </section>
        )}

        {tela.tipo === 'escolher' && (
          <section aria-label="Escolha o gladiador" className="flex flex-col gap-3">
            {/* A HISTÓRIA ÚNICA (versão 2): os três juntos, em construção */}
            <button
              type="button"
              onClick={() => {
                desbloquear();
                tocar('start');
                const novo = criarSaveUnica();
                gravarSaveHistoria(novo);
                setTela({ tipo: 'jogo', id: novo.id });
              }}
              className="pixel-box pixel-hover flex flex-col items-center gap-2 p-4 text-center"
              style={{ boxShadow: '0 0 0 3px #f2c14e' }}
            >
              <span className="flex w-40 items-end gap-2" aria-hidden>
                {IAS.map((ia) => (
                  <span key={ia} className="flex-1">
                    <GladiadorPixel ia={ia} />
                  </span>
                ))}
              </span>
              <span className="font-pixel text-sm text-[#f2c14e]">OS TRÊS JUNTOS</span>
              <span className="font-pixel text-[8px] text-[#7ad0ff]">A HISTÓRIA ÚNICA · EM CONSTRUÇÃO</span>
              <span className="text-xs text-muted">A história dos três, contada como um filme: Cassius, Octavius e Helios, na mesma noite.</span>
              <span className="font-pixel text-[9px]">▶ COMEÇAR</span>
            </button>
            <h1 className="text-center font-pixel text-base text-[#f2c14e] sm:text-xl">OU ESCOLHA O SEU CONDENADO</h1>
            <div className="grid gap-3 sm:grid-cols-3">
              {IAS.map((ia) => {
                const aberto = CAMINHOS_ABERTOS.includes(ia);
                const pers = PERSONAGENS[ia];
                return (
                  <button
                    key={ia}
                    type="button"
                    disabled={!aberto}
                    onClick={() => {
                      desbloquear();
                      tocar('start');
                      const novo = criarSave(ia);
                      gravarSaveHistoria(novo);
                      setTela({ tipo: 'jogo', id: novo.id });
                    }}
                    className="pixel-box pixel-hover flex flex-col items-center gap-2 p-4 text-center disabled:opacity-45"
                    style={{ boxShadow: `0 0 0 3px rgb(${pers.cor})` }}
                  >
                    <span className="w-16">
                      <GladiadorPixel ia={ia} />
                    </span>
                    <span className="font-pixel text-sm" style={{ color: `rgb(${pers.cor})` }}>
                      {pers.gladiador.toUpperCase()}
                    </span>
                    <span className="font-pixel text-[8px] text-[#f2c14e]">"{NOME_DO_CAMINHO[ia].toUpperCase()}"</span>
                    <span className="text-xs text-muted">{CRIME[ia]}</span>
                    <span className="font-pixel text-[9px]">{aberto ? '▶ COMEÇAR' : 'EM BREVE'}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => setTela({ tipo: 'saves' })} className="self-center font-pixel text-[10px] text-muted hover:text-accent">
              ◀ VOLTAR
            </button>
          </section>
        )}

        {tela.tipo === 'jogo' && save && (
          <PausaContexto.Provider value={pausado || mapaAberto}>
            <Jogo key={`${save.id}-${save.capitulo}-${save.cena}`} save={save} onSair={() => setTela({ tipo: 'saves' })} />
          </PausaContexto.Provider>
        )}
        {tela.tipo === 'jogo' && pausado && (
          <MenuPausa
            mapa={
              save?.unica ? (
                <div className="flex flex-col gap-2">
                  <MapaRoma estado={estadoRoma(save.capitulo, save.cena)} />
                  <LegendaRoma estado={estadoRoma(save.capitulo, save.cena)} ato={capitulosDoSave(save)[save.capitulo - 1]?.titulo} />
                </div>
              ) : save ? (
                <LinhaDoTempo saves={(p.historia ?? []).filter((s) => !s.unica)} segredos={p.historiaSegredos} />
              ) : undefined
            }
            onContinuar={() => setPausado(false)}
            onSaves={() => {
              setPausado(false);
              setTela({ tipo: 'saves' });
            }}
          />
        )}
        {/* O mapa grande de Roma, aberto pelo minimapa */}
        {tela.tipo === 'jogo' && save?.unica && mapaAberto && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-3" role="dialog" aria-modal="true" aria-label="Mapa de Roma">
            <div className="flex max-h-[94vh] w-full max-w-3xl flex-col gap-3 overflow-y-auto border-4 border-[#c8962a] bg-[linear-gradient(180deg,#2a1a10,#120806)] p-3 sm:p-4">
              <p className="text-center font-pixel text-base text-[#f2c14e] [text-shadow:2px_2px_0_#5a2a12] sm:text-xl">MAPA DE ROMA</p>
              <MapaRoma estado={estadoRoma(save.capitulo, save.cena)} />
              <LegendaRoma estado={estadoRoma(save.capitulo, save.cena)} ato={capitulosDoSave(save)[save.capitulo - 1]?.titulo} />
              <button
                type="button"
                autoFocus
                onClick={() => {
                  tocar('clique');
                  setMapaAberto(false);
                }}
                className="pixel-box px-4 py-3 font-pixel text-[10px] text-[#f4e2b4] sm:text-xs"
              >
                ◀ VOLTAR PARA A HISTÓRIA
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/** O cenário de uma cena (para a tela de abertura do capítulo). */
function lugarDaCena(c: Cena | undefined): Lugar {
  if (!c) return 'rua-noite';
  return c.tipo === 'cutscene' ? (c.quadros[0]?.lugar ?? 'rua-noite') : c.lugar;
}

/** Roda a cena atual do save; ao terminar, salva o avanço (a próxima cena ou o próximo capítulo). */
function Jogo({ save, onSair }: { save: SaveHistoria; onSair: () => void }) {
  const p = useProgresso();
  const capitulos = capitulosDoSave(save);
  const cap = capitulos[save.capitulo - 1];
  // Na história única, cada cena tem o seu gladiador; nos caminhos, é sempre o do save.
  const heroi = save.unica ? heroiDaCena(cap?.cenas[save.cena]) : save.secreto ? 'cassius' : HEROI[save.gladiador];
  const atributos: AtributosLuta =
    save.unica && (heroi === 'cassius' || heroi === 'octavius' || heroi === 'helios') ? { ...atributosDoSave(save), estilo: ESTILO_DO_HEROI[heroi] } : atributosDoSave(save);
  // No capítulo secreto (e na história única, depois do Encontro), os três lutam juntos (troca no meio da luta).
  const timeUnico = !!save.unica && save.capitulo >= TIME_DESDE_O_ATO;
  const equipe = save.secreto
    ? equipeDoSecreto(p.historia ?? [])
    : timeUnico
      ? { cassius: { ...atributosDoSave(save), estilo: ESTILO_DO_HEROI.cassius }, octavius: { ...atributosDoSave(save), estilo: ESTILO_DO_HEROI.octavius }, helios: { ...atributosDoSave(save), estilo: ESTILO_DO_HEROI.helios } }
      : undefined;
  const [aberturaCapitulo, setAberturaCapitulo] = useState(save.cena === 0);

  if (!cap) {
    const completo = saveCompleto(save);
    return (
      <Palco lugar={save.secreto ? 'coliseu-livre' : 'rua-noite'}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 p-4 text-center">
          <p className="font-pixel text-sm text-[#f2c14e] sm:text-lg">{save.unica ? 'FIM DA PARTE 1' : !completo ? 'CONTINUA EM BREVE' : save.secreto ? 'OS TRÊS: SEGREDO COMPLETO!' : 'CAMINHO COMPLETO!'}</p>
          <p className="max-w-md text-sm text-white/80">
            {save.unica
              ? 'A Lei da Resposta Única terminou. Mas uma voz respondeu no cano... A Parte 2 vem aí.'
              : !completo
              ? `O Capítulo ${save.capitulo} ainda está sendo construído. O seu save está guardado: quando ele chegar, é só continuar daqui.`
              : save.secreto
                ? 'O Núcleo aprendeu a ouvir, e o Coliseu agora é lugar de perguntas. No Império Arcade, o Coliseu Livre e o título "Os Três" são seus.'
                : 'Você terminou este caminho. Roma voltou a perguntar. Experimente os outros condenados para ver a história pelos olhos deles. (No Império Arcade tem um prêmio esperando por você.)'}
          </p>
          <button type="button" onClick={onSair} className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent">
            ◀ VOLTAR AOS SAVES
          </button>
        </div>
      </Palco>
    );
  }

  const cena: Cena | undefined = cap.cenas[save.cena];
  // A próxima cena que vale (as cenas de uma rota que o jogador não escolheu são puladas).
  const proxima = (s: SaveHistoria = save) => {
    const i = proximaCena(cap, s.cena, s.escolhas);
    const fimDoCapitulo = i >= cap.cenas.length;
    gravarSaveHistoria(fimDoCapitulo ? avancarSave(s, s.capitulo + 1, 0) : avancarSave(s, s.capitulo, i));
  };

  if (aberturaCapitulo) {
    return (
      <Palco lugar={lugarDaCena(cap.cenas[0])}>
        <button
          type="button"
          autoFocus
          onClick={() => {
            desbloquear();
            tocar('fanfarra');
            setAberturaCapitulo(false);
          }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/75 text-center"
        >
          <span className="font-pixel text-[10px] text-white/70">
            {save.secreto || save.unica ? 'CASSIUS · OCTAVIUS · HELIOS' : `${PERSONAGENS[save.gladiador].gladiador.toUpperCase()} · ${NOME_DO_CAMINHO[save.gladiador].toUpperCase()}`}
          </span>
          <span className="font-pixel text-base text-[#f2c14e] sm:text-2xl" style={save.unica ? { color: COR_DA_PARTE(1) } : undefined}>{save.unica ? 'A LEI DA RESPOSTA ÚNICA' : save.secreto ? 'CAPÍTULO SECRETO' : `CAPÍTULO ${cap.numero}`}</span>
          <span className="font-pixel text-sm text-white sm:text-xl">{cap.titulo.toUpperCase()}</span>
          <span className="text-xs text-white/60">{cap.lugar}</span>
          <span className="piscar mt-3 font-pixel text-[9px] text-[#f2c14e]">TOQUE PARA COMEÇAR ▶</span>
        </button>
      </Palco>
    );
  }

  if (!cena) return null;
  if (cena.tipo === 'escolha')
    return (
      <EscolhaRota
        lugar={cena.lugar}
        pergunta={cena.pergunta}
        opcoes={cena.opcoes}
        onEscolher={(valor) => proxima({ ...save, escolhas: { ...save.escolhas, [cena.id]: valor } })}
      />
    );
  if (cena.tipo === 'cutscene') return <Cutscene quadros={cena.quadros} onFim={() => proxima()} />;
  if (cena.tipo === 'conversa')
    return (
      <Palco lugar={cena.lugar}>
        <Falas falas={cena.falas} onFim={() => proxima()} />
      </Palco>
    );
  if (cena.tipo === 'explorar' && cena.mapa && MAPAS[cena.mapa])
    return (
      <MundoAberto
        key={cena.id}
        mundo={mundoDoExplorar(cena, MAPAS[cena.mapa]!)}
        heroi={heroi}
        onSegredo={ganharSegredoHistoria}
        onFim={() => proxima()}
        lutar={(inimigo, pelasCostas, onVenceu) => (
          <LutaHistoria
            key={`ronda-${inimigo}`}
            lugar={cena.lugar}
            inimigo={inimigo}
            heroi={heroi}
            vantagem={pelasCostas}
            antes={[
              pelasCostas
                ? { quem: 'narrador', texto: 'ATAQUE SURPRESA! Você chegou por trás: ele começa a luta com menos vida.' }
                : { quem: 'narrador', texto: 'Ele te viu! Da próxima, passe por trás dele, sem ele olhar.' },
            ]}
            atributos={atributos}
            onVitoria={(n) => gravarSaveHistoria(ganharPecas(save, n))}
            onFim={onVenceu}
          />
        )}
      />
    );
  if (cena.tipo === 'explorar')
    return (
      <Explorar
        lugar={cena.lugar}
        objetivo={cena.objetivo}
        pontos={cena.pontos}
        heroi={heroi}
        onPonto={(ponto) => {
          // Um pedaço da chave do capítulo secreto: vale para a conta toda.
          if (ponto.segredo) ganharSegredoHistoria(ponto.segredo);
        }}
        onFim={() => proxima()}
      />
    );
  // O chefão no mapa aberto (o teste do Rato-Rei, 22/11/2026).
  if (cena.tipo === 'luta' && cena.noMapa)
    return (
      <ChefaoNoMapa
        key={cena.id}
        chefe={cena.inimigo}
        heroi={heroi}
        antes={cena.antes}
        depois={cena.depois}
        onFim={() => {
          gravarSaveHistoria(ganharPecas(save, INIMIGOS[cena.inimigo]?.pecas ?? 0));
          proxima();
        }}
      />
    );
  // Os chefões em duas etapas (22/11/2026): primeiro o mapa (quebrar a armadura), depois o duelo.
  if (cena.tipo === 'luta' && !cena.treino && CHEFES[cena.inimigo]) {
    const chefe = CHEFES[cena.inimigo]!;
    return (
      <ChefaoEmEtapas
        key={cena.id}
        def={chefe}
        heroi={heroi}
        antes={[{ quem: heroi, texto: `Primeiro, a armadura. ${chefe.dica}` }, ...(FALA_HABILIDADE[heroi] ? [{ quem: heroi, texto: FALA_HABILIDADE[heroi]! }] : [])]}
        duelo={() => (
          <LutaHistoria
            lugar={cena.lugar}
            inimigo={cena.inimigo}
            heroi={heroi}
            antes={[{ quem: heroi, texto: 'A armadura caiu. Agora é cara a cara!', jeito: 'grito' }, ...(cena.antes ?? [])]}
            depois={cena.depois}
            atributos={equipe?.[heroi as 'cassius'] ?? atributos}
            equipe={equipe}
            vidaInicial={chefe.vidaNoDuelo}
            semEntrada
            onVitoria={(n) => gravarSaveHistoria(ganharPecas(save, n))}
            onFim={() => proxima()}
          />
        )}
      />
    );
  }
  if (cena.tipo === 'luta')
    return (
      <LutaHistoria
        lugar={cena.lugar}
        inimigo={cena.inimigo}
        heroi={heroi}
        antes={cena.antes}
        depois={cena.depois}
        atributos={equipe?.[heroi as 'cassius'] ?? atributos}
        equipe={equipe}
        treino={cena.treino}
        entrada={cena.entrada}
        onVitoria={(n) => gravarSaveHistoria(ganharPecas(save, n))}
        onFim={() => proxima()}
      />
    );
  if (cena.tipo === 'mundo') {
    const mundo = MUNDOS[cena.mundo];
    return mundo ? <MundoAberto key={cena.id} mundo={mundo} heroi={heroi} onSegredo={ganharSegredoHistoria} onFim={() => proxima()} /> : null;
  }
  if (cena.tipo === 'fase') {
    const fase = FASES[cena.fase];
    return fase ? <FaseAberta key={cena.id} fase={fase} heroi={heroi} onFim={() => proxima()} /> : null;
  }
  if (cena.tipo === 'ludus')
    return (
      <Ludus
        save={save}
        heroi={heroi}
        lugar={cena.lugar}
        objetivo={cena.objetivo}
        conversas={cena.conversas}
        obrigatorio={cena.obrigatorio}
        presente={cena.presente}
        onGravar={(s) => gravarSaveHistoria({ ...s, atualizadoEm: new Date().toISOString() })}
        onFim={() => proxima()}
      />
    );
  if (cena.desafio === 'furtivo')
    return (
      <DesafioFurtivo
        lugar={cena.lugar}
        heroi={heroi}
        antes={cena.antes}
        depois={cena.depois ?? []}
        vigia={cena.vigia ?? 'a guarda'}
        objetivo={cena.objetivo ?? 'Atravesse sem ser visto.'}
        onFim={() => proxima()}
      />
    );
  if (cena.desafio === 'ritmo')
    return (
      <DesafioRitmo
        lugar={cena.lugar}
        antes={cena.antes}
        depois={cena.depois ?? []}
        objetivo={cena.objetivo ?? 'Toque no tempo certo.'}
        acao={cena.acao ?? 'GIRAR'}
        quantos={cena.quantos ?? 8}
        onFim={() => proxima()}
      />
    );
  if (cena.desafio === 'proteger') return <DesafioProteger lugar={cena.lugar} antes={cena.antes} depois={cena.depois ?? []} onFim={() => proxima()} />;
  if (cena.desafio === 'armadilhas') return <DesafioArmadilhas lugar={cena.lugar} heroi={heroi} antes={cena.antes} depois={cena.depois ?? []} onFim={() => proxima()} />;
  if (cena.desafio === 'forja') return <MinigameForja lugar={cena.lugar} antes={cena.antes} depois={cena.depois ?? []} onFim={() => proxima()} />;
  if (cena.desafio === 'memoria') return <MinigameMemoria lugar={cena.lugar} antes={cena.antes} depois={cena.depois ?? []} onFim={() => proxima()} />;
  if (cena.desafio === 'corrida') return <MinigameCorrida lugar={cena.lugar} antes={cena.antes} depois={cena.depois ?? []} onFim={() => proxima()} />;
  if (cena.desafio === 'torre') return <MinigameTorre lugar={cena.lugar} antes={cena.antes} depois={cena.depois ?? []} onFim={() => proxima()} />;
  if (cena.desafio === 'trio') return <MinigameTrio lugar={cena.lugar} heroi={heroi} todos={!!save.secreto || timeUnico} antes={cena.antes} depois={cena.depois ?? []} onFim={() => proxima()} />;
  if (cena.desafio === 'remar') return <DesafioRemar lugar={cena.lugar} antes={cena.antes} depois={cena.depois ?? []} onFim={() => proxima()} />;
  if (cena.desafio === 'tempestade') return <DesafioTempestade lugar={cena.lugar} antes={cena.antes} depois={cena.depois ?? []} onFim={() => proxima()} />;
  if (cena.desafio === 'telescopio') return <MinigameTelescopio lugar={cena.lugar} antes={cena.antes} depois={cena.depois ?? []} onFim={() => proxima()} />;
  if (cena.desafio === 'saltos') return <MinigameSaltos lugar={cena.lugar} antes={cena.antes} depois={cena.depois ?? []} nivel={cena.nivel} onFim={() => proxima()} />;
  if (cena.desafio === 'espelhos')
    return <MinigameEspelhos lugar={cena.lugar} antes={cena.antes} depois={cena.depois ?? []} nivel={cena.nivel} titulo={cena.objetivo} onFim={() => proxima()} />;
  if (cena.desafio === 'mapa-ceu') return <MinigameMapaCeu lugar={cena.lugar} antes={cena.antes} depois={cena.depois ?? []} onFim={() => proxima()} />;
  if (cena.desafio === 'enigmas') return <MinigameEnigmas lugar={cena.lugar} antes={cena.antes} depois={cena.depois ?? []} onFim={() => proxima()} />;
  if (cena.desafio === 'perseguicao') return <MinigamePerseguicao lugar={cena.lugar} antes={cena.antes} depois={cena.depois ?? []} onFim={() => proxima()} />;
  if (cena.desafio === 'canhoes') return <MinigameCanhoes lugar={cena.lugar} antes={cena.antes} depois={cena.depois ?? []} onFim={() => proxima()} />;
  if (cena.desafio === 'estrelas') return <MinigameEstrelas lugar={cena.lugar} antes={cena.antes} depois={cena.depois ?? []} onFim={() => proxima()} />;
  if (cena.desafio === 'barcos') return <MinigameBarcos lugar={cena.lugar} antes={cena.antes} depois={cena.depois ?? []} onFim={() => proxima()} />;
  if (cena.desafio === 'ler-marcas') return <DesafioMarcas lugar={cena.lugar} antes={cena.antes} onFim={() => proxima()} />;
  if (cena.desafio === 'escolher-plano') return <DesafioPlanos lugar={cena.lugar} antes={cena.antes} onFim={() => proxima()} />;
  if (cena.desafio === 'segurar-carroca') return <DesafioCarroca lugar={cena.lugar} antes={cena.antes} onFim={() => proxima()} />;
  return <DesafioLivros lugar={cena.lugar} antes={cena.antes} onFim={() => proxima()} />;
}

/** Qual história deste gladiador é (pela ordem em que foi criada): "História nº 2 do Octavius". */
function numeroDoSave(s: SaveHistoria, todos: SaveHistoria[]): number {
  return todos.filter((x) => x.gladiador === s.gladiador && !!x.secreto === !!s.secreto && x.criadoEm <= s.criadoEm).length;
}

/**
 * AS PARTES DA HISTÓRIA (22/11/2026): cada Parte é um "filme", com o seu cartaz e a sua cor.
 * A Parte 1 está aberta; a Parte 2 fica escura, com cadeado, até alguém terminar a Parte 1;
 * a Parte 3 fica escondida. Uma Parte 4 no futuro é só mais um cartaz aqui.
 */
const PARTES: { n: number; nome: string; cor: string; lugar: Lugar }[] = [
  { n: 1, nome: 'A LEI DA RESPOSTA ÚNICA', cor: '#ff5a5a', lugar: 'titulo' },
  { n: 2, nome: '???', cor: '#5ab0ff', lugar: 'rua-noite' },
  { n: 3, nome: '???', cor: '#c8a0ff', lugar: 'coliseu-noite' },
];
const COR_DA_PARTE = (n: number) => PARTES.find((x) => x.n === n)?.cor ?? '#f2c14e';

function PrateleiraPartes({ saves }: { saves: SaveHistoria[] }) {
  const terminouParte1 = saves.some((s) => s.unica && saveCompleto(s));
  return (
    <ul className="grid grid-cols-3 gap-2" aria-label="As partes da história">
      {PARTES.map((pt) => {
        const aberta = pt.n === 1;
        const destravada = pt.n === 1 || (pt.n === 2 && terminouParte1);
        return (
          <li key={pt.n} className="pixel-box relative aspect-[3/4] overflow-hidden bg-black" style={{ boxShadow: `0 0 0 2px ${destravada ? pt.cor : '#2a2630'}` }}>
            <div className={`absolute inset-0 ${destravada ? '' : 'brightness-[0.25] grayscale'}`} aria-hidden>
              <CenarioHistoria lugar={pt.lugar} />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(0,0,0,0.9)_100%)]" aria-hidden />
            {!destravada && (
              <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
                {/* o cadeado em pixel */}
                <svg viewBox="0 0 10 12" className="w-[28%]" shapeRendering="crispEdges">
                  <rect x="2" y="0" width="6" height="1" fill="#8a8276" />
                  <rect x="1" y="1" width="1" height="4" fill="#8a8276" />
                  <rect x="8" y="1" width="1" height="4" fill="#8a8276" />
                  <rect x="0" y="5" width="10" height="7" fill="#c8b890" />
                  <rect x="4" y="7" width="2" height="3" fill="#2a2630" />
                </svg>
              </div>
            )}
            <div className="absolute inset-x-1 bottom-1 flex flex-col items-center text-center sm:inset-x-2 sm:bottom-2">
              <span className="font-pixel text-[7px] sm:text-[10px]" style={{ color: destravada ? pt.cor : '#8a8276' }}>
                PARTE {pt.n}
              </span>
              <span className="font-pixel text-[6px] leading-tight text-white sm:text-[9px]">{destravada ? pt.nome : '???'}</span>
              <span className="mt-0.5 text-[8px] text-white/60 sm:text-[10px]">
                {aberta ? (terminouParte1 ? 'terminada' : 'em construção') : destravada ? 'em breve' : pt.n === 2 ? 'termine a Parte 1' : 'em segredo'}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Um save na lista: a cena onde ele parou (com o gladiador), o capítulo, a barra de
 * progresso, o número da história, o dia e a hora em que salvou e os atributos.
 * Feito para dar para diferenciar dois saves do mesmo gladiador.
 */
function CartaoSave({
  s,
  numero,
  apagando,
  onContinuar,
  onPedirApagar,
  onApagar,
  onNaoApagar,
}: {
  s: SaveHistoria;
  numero: number;
  apagando: boolean;
  onContinuar: () => void;
  onPedirApagar: () => void;
  onApagar: () => void;
  onNaoApagar: () => void;
}) {
  const pers = PERSONAGENS[s.gladiador];
  const cor = s.secreto ? '#f2c14e' : `rgb(${pers.cor})`;
  const caps = capitulosDoSave(s);
  const completo = saveCompleto(s);
  const cap = caps[s.capitulo - 1];
  const lugar: Lugar = completo ? (s.secreto ? 'coliseu-livre' : 'biblioteca-salao') : lugarDaCena(cap?.cenas[s.cena]);
  if (s.secreto || s.unica) return <CartaoSecreto s={s} cor={s.unica ? '#7ad0ff' : cor} lugar={lugar} completo={completo} apagando={apagando} onContinuar={onContinuar} onPedirApagar={onPedirApagar} onApagar={onApagar} onNaoApagar={onNaoApagar} />;
  const quando = new Date(s.atualizadoEm);
  const at = atributosDoSave(s);
  return (
    <li className="pixel-box flex flex-col overflow-hidden" style={{ boxShadow: `0 0 0 3px ${cor}` }}>
      {/* Onde a história parou */}
      <div className="relative aspect-[16/7] w-full overflow-hidden">
        <CenarioHistoria lugar={lugar} />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.75)_0%,transparent_55%)]" aria-hidden />
        <div className="absolute bottom-[8%] right-[8%] w-[16%]" aria-hidden>
          <div className="respirar">
            <GladiadorPixel ia={s.gladiador} espelhar />
          </div>
        </div>
        <div className="absolute left-2 top-2 flex flex-col gap-1 sm:left-3 sm:top-3">
          <span className="w-fit border-2 border-black px-1.5 py-0.5 font-pixel text-[8px] text-black sm:text-[9px]" style={{ background: cor }}>
            {pers.gladiador.toUpperCase()} · HISTÓRIA Nº {numero}
          </span>
          <span className="font-pixel text-[8px] text-[#f2c14e] [text-shadow:1px_1px_0_#000] sm:text-[9px]">"{NOME_DO_CAMINHO[s.gladiador].toUpperCase()}"</span>
        </div>
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
          <span className="block font-pixel text-[11px] text-white [text-shadow:2px_2px_0_#000] sm:text-sm">
            {completo ? 'CAMINHO COMPLETO' : `CAPÍTULO ${s.capitulo}`}
          </span>
          {!completo && <span className="block text-xs text-white/85 [text-shadow:1px_1px_0_#000] sm:text-sm">{cap ? cap.titulo : 'em breve'}</span>}
        </div>
      </div>
      {/* Progresso: um quadradinho por capítulo (o 7 é o final) */}
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center gap-1" aria-label={`Progresso: capítulo ${Math.min(s.capitulo, 7)} de 7`}>
          {Array.from({ length: 7 }, (_, k) => (
            <span
              key={k}
              className="h-2.5 flex-1 border border-black"
              style={{ background: k + 1 < s.capitulo ? cor : k + 1 === s.capitulo ? '#f2c14e' : '#2a2630' }}
              title={k === 6 ? 'Final' : `Capítulo ${k + 1}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
          <span>
            {quando.toLocaleDateString('pt-BR')} às {quando.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {s.capitulo >= 3 && (
            <span>
              VIDA {at.vida} · FORÇA {at.forca} · DEFESA {at.defesa} · PEÇAS {s.pecas ?? 0}
            </span>
          )}
        </div>
        {apagando ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-accent-2">Apagar a História nº {numero} do {pers.gladiador}? Não dá para desfazer.</span>
            <button type="button" onClick={onApagar} className="pixel-box px-2 py-1 font-pixel text-[8px] text-accent-2">
              APAGAR
            </button>
            <button type="button" onClick={onNaoApagar} className="pixel-box px-2 py-1 font-pixel text-[8px]">
              NÃO
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button type="button" onClick={onContinuar} className="pixel-box pixel-hover flex-1 py-2.5 font-pixel text-[10px] text-accent sm:text-xs" style={{ boxShadow: `0 0 0 2px ${cor}` }}>
              ▶ CONTINUAR
            </button>
            <button type="button" onClick={onPedirApagar} aria-label="Apagar save" className="px-3 py-2 text-base text-muted hover:text-accent-2">
              APAGAR
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

/** O cartão do save secreto: dourado, com os três gladiadores e a barra de cenas. */
function CartaoSecreto({
  s,
  cor,
  lugar,
  completo,
  apagando,
  onContinuar,
  onPedirApagar,
  onApagar,
  onNaoApagar,
}: {
  s: SaveHistoria;
  cor: string;
  lugar: Lugar;
  completo: boolean;
  apagando: boolean;
  onContinuar: () => void;
  onPedirApagar: () => void;
  onApagar: () => void;
  onNaoApagar: () => void;
}) {
  const quando = new Date(s.atualizadoEm);
  // Na história única, a barra conta as cenas de todos os atos.
  const atos = capitulosDoSave(s);
  const total = s.unica ? atos.reduce((n, a) => n + a.cenas.length, 0) : (atos[0]?.cenas.length ?? 1);
  const feitas = completo ? total : s.unica ? atos.slice(0, s.capitulo - 1).reduce((n, a) => n + a.cenas.length, 0) + s.cena : s.cena;
  const atoAtual = s.unica ? atos[s.capitulo - 1] : undefined;
  return (
    <li className="pixel-box cartao-secreto flex flex-col overflow-hidden sm:col-span-2" style={{ boxShadow: `0 0 0 3px ${cor}` }}>
      <div className="relative aspect-[16/6] w-full overflow-hidden">
        <CenarioHistoria lugar={lugar} />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.8)_0%,transparent_60%)]" aria-hidden />
        <div className="absolute bottom-[8%] right-[4%] flex w-[36%] items-end gap-[4%]" aria-hidden>
          {(['claude', 'chatgpt', 'gemini'] as IaId[]).map((ia) => (
            <div key={ia} className="respirar flex-1">
              <GladiadorPixel ia={ia} espelhar />
            </div>
          ))}
        </div>
        <div className="absolute left-2 top-2 flex flex-col gap-1 sm:left-3 sm:top-3">
          <span className="w-fit border-2 border-black px-1.5 py-0.5 font-pixel text-[8px] text-black sm:text-[9px]" style={{ background: cor }}>{s.unica ? 'PARTE 1' : 'CAPÍTULO SECRETO'}</span>
          <span className="font-pixel text-[8px] text-[#7ad0ff] [text-shadow:1px_1px_0_#000] sm:text-[9px]">{s.unica ? '"A LEI DA RESPOSTA ÚNICA" · EM CONSTRUÇÃO' : '"OS TRÊS"'}</span>
        </div>
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
          <span className="block font-pixel text-[11px] text-white [text-shadow:2px_2px_0_#000] sm:text-sm">{s.unica ? (completo ? 'FIM DA PARTE 1' : (atoAtual?.titulo.toUpperCase() ?? '')) : completo ? 'SEGREDO COMPLETO' : (LUGAR_SECRETO[lugar] ?? 'O HIPOGEU')}</span>
          <span className="block text-xs text-white/85 [text-shadow:1px_1px_0_#000] sm:text-sm">Cassius, Octavius e Helios juntos</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-3">
        <div className="h-2.5 w-full border border-black bg-[#2a2630]" aria-label={`Progresso: cena ${feitas} de ${total}`}>
          <div className="h-full bg-[#f2c14e]" style={{ width: `${Math.round((feitas / total) * 100)}%` }} />
        </div>
        <span className="text-[11px] text-muted">
          {quando.toLocaleDateString('pt-BR')} às {quando.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
        {apagando ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-accent-2">{s.unica ? 'Apagar a história única? Não dá para desfazer.' : 'Apagar o capítulo secreto? A chave continua com você: dá para abrir de novo pela grade.'}</span>
            <button type="button" onClick={onApagar} className="pixel-box px-2 py-1 font-pixel text-[8px] text-accent-2">
              APAGAR
            </button>
            <button type="button" onClick={onNaoApagar} className="pixel-box px-2 py-1 font-pixel text-[8px]">
              NÃO
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button type="button" onClick={onContinuar} className="pixel-box pixel-hover flex-1 py-2.5 font-pixel text-[10px] text-[#f2c14e] sm:text-xs" style={{ boxShadow: `0 0 0 2px ${cor}` }}>
              ▶ CONTINUAR
            </button>
            <button type="button" onClick={onPedirApagar} aria-label="Apagar save" className="px-3 py-2 text-base text-muted hover:text-accent-2">
              APAGAR
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

/** O nome do lugar onde o capítulo secreto parou (no cartão do save). */
const LUGAR_SECRETO: Partial<Record<Lugar, string>> = {
  'coliseu-noite': 'O COLISEU À NOITE',
  'ludus-patio-noite': 'O LUDUS DE MADRUGADA',
  'coliseu-arena': 'A GRADE DA ARENA',
  hipogeu: 'O HIPOGEU',
  'nucleo-camara': 'A CÂMARA DO NÚCLEO',
  'coliseu-livre': 'O COLISEU LIVRE',
};
