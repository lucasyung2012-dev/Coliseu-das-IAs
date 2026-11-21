import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IAS, PERSONAGENS, type IaId } from '@/game/personagens';
import { apagarSaveHistoria, gravarSaveHistoria, useProgresso } from '@/game/progresso';
import { avancarSave, CAMINHOS_ABERTOS, criarSave, NOME_DO_CAMINHO, type SaveHistoria } from '@/game/historia/saves';
import { CAPITULOS, PROLOGO, type Cena, type Falante, type Lugar } from '@/game/historia/roteiro';
import { GladiadorPixel } from '@/ui/pixel/Personagens';
import { desbloquear, tocar } from '@/ui/som';
import { Cutscene, Explorar, Falas, Palco } from './Cenas';
import { LutaHistoria } from './Luta';
import { DesafioCarroca, DesafioLivros } from './Desafio';

/**
 * O Coliseu: o modo História (docs/HISTORIA.md). Prólogo, saves (quantos quiser,
 * um gladiador por save) e o jogo, que roda as cenas do capítulo em ordem e salva
 * sozinho no começo de cada cena.
 */
const CHAVE_PROLOGO = 'coliseu.historia.prologo';

const HEROI: Record<IaId, Falante> = { claude: 'cassius', chatgpt: 'octavius', gemini: 'helios' };
const CRIME: Record<IaId, string> = {
  claude: 'Guardião da Grande Biblioteca. Escondeu os livros que o Censor mandou queimar.',
  chatgpt: 'Comandante da frota do Porto. Desobedeceu à ordem de afundar um navio de refugiados.',
  gemini: 'Vigia do Observatório. Previu nas estrelas a queda do Censor.',
};

function prologoVisto(): boolean {
  try {
    return localStorage.getItem(CHAVE_PROLOGO) === '1';
  } catch {
    return false;
  }
}

type Tela = { tipo: 'prologo' } | { tipo: 'saves' } | { tipo: 'escolher' } | { tipo: 'jogo'; id: string };

export default function ColiseuHistoria() {
  const p = useProgresso();
  const saves = [...(p.historia ?? [])].sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
  const [tela, setTela] = useState<Tela>(() => (prologoVisto() ? { tipo: 'saves' } : { tipo: 'prologo' }));
  const [apagando, setApagando] = useState<string | null>(null);

  const fimDoPrologo = () => {
    try {
      localStorage.setItem(CHAVE_PROLOGO, '1');
    } catch {
      /* só não lembra */
    }
    setTela({ tipo: 'saves' });
  };

  const save = tela.tipo === 'jogo' ? saves.find((s) => s.id === tela.id) : undefined;

  return (
    <main data-area="coliseu" className="relative min-h-screen bg-[#0c0a10] text-fg">
      <div className="relative mx-auto flex max-w-4xl flex-col gap-4 px-3 pb-16 pt-5 sm:px-6">
        <div className="flex items-center justify-between">
          {tela.tipo === 'jogo' ? (
            <button type="button" onClick={() => setTela({ tipo: 'saves' })} className="font-pixel text-[10px] text-muted hover:text-accent">
              ◀ SAVES (o jogo já salvou)
            </button>
          ) : (
            <Link to="/" className="font-pixel text-[10px] text-muted hover:text-accent">
              ◀ INÍCIO
            </Link>
          )}
          <p className="font-pixel text-[10px] text-[#f2c14e]">🏛️ COLISEU · MODO HISTÓRIA</p>
        </div>

        {tela.tipo === 'prologo' && <Cutscene quadros={PROLOGO} onFim={fimDoPrologo} />}

        {tela.tipo === 'saves' && (
          <section aria-label="Saves" className="flex flex-col gap-4">
            <header className="text-center">
              <h1 className="font-pixel text-lg text-[#f2c14e] sm:text-2xl">A LEI DA RESPOSTA ÚNICA</h1>
              <p className="mt-2 text-sm text-muted">Roma Eterna. O Censor apaga toda IA que pensa diferente. Três condenados vão subir o Coliseu.</p>
            </header>
            {saves.length > 0 && (
              <ul className="flex flex-col gap-2">
                {saves.map((s) => (
                  <li key={s.id} className="pixel-box flex flex-wrap items-center gap-3 p-3" style={{ boxShadow: `0 0 0 2px rgb(${PERSONAGENS[s.gladiador].cor})` }}>
                    <span className="w-10 shrink-0 sm:w-12">
                      <GladiadorPixel ia={s.gladiador} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-pixel text-[10px]" style={{ color: `rgb(${PERSONAGENS[s.gladiador].cor})` }}>
                        {PERSONAGENS[s.gladiador].gladiador.toUpperCase()} · {NOME_DO_CAMINHO[s.gladiador].toUpperCase()}
                      </span>
                      <span className="block text-xs text-muted">
                        Capítulo {s.capitulo}
                        {CAPITULOS[s.gladiador][s.capitulo - 1] ? `: ${CAPITULOS[s.gladiador][s.capitulo - 1]!.titulo}` : ' (em breve)'} · salvo em {new Date(s.atualizadoEm).toLocaleDateString('pt-BR')}
                      </span>
                    </span>
                    {apagando === s.id ? (
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-accent-2">Apagar este save? Não dá para desfazer.</span>
                        <button
                          type="button"
                          onClick={() => {
                            apagarSaveHistoria(s.id);
                            setApagando(null);
                          }}
                          className="pixel-box px-2 py-1 font-pixel text-[8px] text-accent-2"
                        >
                          APAGAR
                        </button>
                        <button type="button" onClick={() => setApagando(null)} className="pixel-box px-2 py-1 font-pixel text-[8px]">
                          NÃO
                        </button>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            desbloquear();
                            tocar('start');
                            setTela({ tipo: 'jogo', id: s.id });
                          }}
                          className="pixel-box pixel-hover px-3 py-2 font-pixel text-[10px] text-accent"
                        >
                          ▶ CONTINUAR
                        </button>
                        <button type="button" onClick={() => setApagando(s.id)} aria-label="Apagar save" className="px-2 py-1 text-sm text-muted hover:text-accent-2">
                          🗑
                        </button>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  desbloquear();
                  tocar('selecionar');
                  setTela({ tipo: 'escolher' });
                }}
                className="pixel-box pixel-hover px-5 py-3 font-pixel text-xs text-[#f2c14e]"
              >
                ➕ NOVA HISTÓRIA
              </button>
              <button type="button" onClick={() => setTela({ tipo: 'prologo' })} className="pixel-box pixel-hover px-4 py-3 font-pixel text-[10px] text-muted">
                🎬 VER O PRÓLOGO
              </button>
            </div>
          </section>
        )}

        {tela.tipo === 'escolher' && (
          <section aria-label="Escolha o gladiador" className="flex flex-col gap-3">
            <h1 className="text-center font-pixel text-base text-[#f2c14e] sm:text-xl">ESCOLHA O SEU CONDENADO</h1>
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
                    <span className="font-pixel text-[9px]">{aberto ? '▶ COMEÇAR' : '🔒 EM BREVE'}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => setTela({ tipo: 'saves' })} className="self-center font-pixel text-[10px] text-muted hover:text-accent">
              ◀ VOLTAR
            </button>
          </section>
        )}

        {tela.tipo === 'jogo' && save && <Jogo key={`${save.id}-${save.capitulo}-${save.cena}`} save={save} onSair={() => setTela({ tipo: 'saves' })} />}
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
  const capitulos = CAPITULOS[save.gladiador];
  const cap = capitulos[save.capitulo - 1];
  const heroi = HEROI[save.gladiador];
  const [aberturaCapitulo, setAberturaCapitulo] = useState(save.cena === 0);

  if (!cap) {
    return (
      <Palco lugar="rua-noite">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 p-4 text-center">
          <p className="font-pixel text-sm text-[#f2c14e] sm:text-lg">CONTINUA EM BREVE</p>
          <p className="max-w-md text-sm text-white/80">O Capítulo {save.capitulo} ainda está sendo construído. O seu save está guardado: quando ele chegar, é só continuar daqui.</p>
          <button type="button" onClick={onSair} className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent">
            ◀ VOLTAR AOS SAVES
          </button>
        </div>
      </Palco>
    );
  }

  const cena: Cena | undefined = cap.cenas[save.cena];
  const proxima = () => {
    const fimDoCapitulo = save.cena + 1 >= cap.cenas.length;
    gravarSaveHistoria(fimDoCapitulo ? avancarSave(save, save.capitulo + 1, 0) : avancarSave(save, save.capitulo, save.cena + 1));
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
          <span className="font-pixel text-[10px] text-white/70">{PERSONAGENS[save.gladiador].gladiador.toUpperCase()} · {NOME_DO_CAMINHO[save.gladiador].toUpperCase()}</span>
          <span className="font-pixel text-base text-[#f2c14e] sm:text-2xl">CAPÍTULO {cap.numero}</span>
          <span className="font-pixel text-sm text-white sm:text-xl">{cap.titulo.toUpperCase()}</span>
          <span className="text-xs text-white/60">{cap.lugar}</span>
          <span className="piscar mt-3 font-pixel text-[9px] text-[#f2c14e]">TOQUE PARA COMEÇAR ▶</span>
        </button>
      </Palco>
    );
  }

  if (!cena) return null;
  if (cena.tipo === 'cutscene') return <Cutscene quadros={cena.quadros} onFim={proxima} />;
  if (cena.tipo === 'conversa')
    return (
      <Palco lugar={cena.lugar}>
        <Falas falas={cena.falas} onFim={proxima} />
      </Palco>
    );
  if (cena.tipo === 'explorar') return <Explorar lugar={cena.lugar} objetivo={cena.objetivo} pontos={cena.pontos} heroi={heroi} onFim={proxima} />;
  if (cena.tipo === 'luta') return <LutaHistoria lugar={cena.lugar} inimigo={cena.inimigo} heroi={heroi} antes={cena.antes} depois={cena.depois} onFim={proxima} />;
  if (cena.desafio === 'segurar-carroca') return <DesafioCarroca lugar={cena.lugar} antes={cena.antes} onFim={proxima} />;
  return <DesafioLivros lugar={cena.lugar} antes={cena.antes} onFim={proxima} />;
}
