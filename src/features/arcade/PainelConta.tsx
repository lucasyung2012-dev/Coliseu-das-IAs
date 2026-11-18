import { useEffect, useState } from 'react';
import {
  concluirLogin,
  contaConfigurada,
  desconectar,
  entrarNoDropbox,
  escolherDificuldade,
  modoRanqueado,
  NOMES_DIFICULDADE,
  sincronizar,
  useConta,
  useDificuldade,
  type Dificuldade,
} from '@/game/conta';
import { pegarVolta } from '@/services/dropbox';
import { desbloquear, tocar } from '@/ui/som';

const hora = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

/**
 * Faixa da conta no Arcade: diz se as partidas valem troféus (com conta) ou são
 * treino (sem conta, com dificuldade), e conecta ou desconecta o Dropbox.
 */
export default function PainelConta() {
  const c = useConta();
  const dificuldade = useDificuldade();
  const ranqueado = modoRanqueado(c);
  const [aberto, setAberto] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [esperandoCodigo, setEsperandoCodigo] = useState(false);

  // Voltou do login do Dropbox: termina sozinho e abre o painel para mostrar o resultado.
  useEffect(() => {
    const volta = pegarVolta();
    if (!volta) return;
    setAberto(true);
    if (volta.code) void concluirLogin(volta.code);
  }, []);

  if (!contaConfigurada()) return null;

  const clique = (f: () => void) => () => {
    desbloquear();
    tocar('clique');
    f();
  };

  return (
    <section aria-label="Conta e modo de jogo" className="pixel-box p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={`font-pixel text-[10px] ${ranqueado ? 'text-accent' : 'text-[rgb(242_193_78)]'}`}>
            {ranqueado ? '🏆 VALENDO TROFÉUS' : '🎯 MODO TREINO · SEM TROFÉUS'}
          </p>
          <p className="mt-1 text-xs text-muted">
            {c.conta
              ? `Conectado ao Dropbox${c.conta.nome ? ` como ${c.conta.nome}` : ''}. ${
                  c.situacao === 'sincronizando' ? 'Salvando…' : c.sincronizadoEm ? `Salvo na nuvem às ${hora(c.sincronizadoEm)}.` : ''
                }`
              : 'Conecte o Dropbox para jogar valendo troféus e salvar o progresso na nuvem.'}
          </p>
        </div>
        <button type="button" onClick={clique(() => setAberto((a) => !a))} className="pixel-box pixel-hover px-3 py-2 font-pixel text-[9px]">
          ☁ {c.conta ? 'CONTA' : 'CONECTAR'}
        </button>
      </div>

      {!ranqueado && (
        <div className="mt-3 flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Dificuldade do treino">
          <span className="text-xs text-muted">Dificuldade:</span>
          {(['facil', 'medio', 'dificil'] as Dificuldade[]).map((d) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={dificuldade === d}
              onClick={clique(() => escolherDificuldade(d))}
              className={`px-2 py-1 font-pixel text-[9px] ${dificuldade === d ? 'bg-[rgb(242_193_78)] text-black' : 'pixel-box text-muted'}`}
            >
              {NOMES_DIFICULDADE[d].toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {c.erro && <p className="mt-2 text-xs text-[rgb(255_74_90)]">{c.erro}</p>}

      {aberto && (
        <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3 text-sm">
          {c.conta ? (
            <>
              <p>
                Conta: <strong>{c.conta.nome || 'Dropbox'}</strong>
                {c.conta.email && <span className="text-muted"> ({c.conta.email})</span>}
              </p>
              <p className="text-xs text-muted">O jogo só usa a pasta Aplicativos/Coliseu do seu Dropbox. Nenhum outro arquivo é lido.</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={clique(() => void sincronizar())} className="pixel-box pixel-hover px-3 py-2 font-pixel text-[9px] text-accent">
                  ↻ SALVAR AGORA
                </button>
                <button type="button" onClick={clique(() => void desconectar())} className="pixel-box pixel-hover px-3 py-2 font-pixel text-[9px]">
                  DESCONECTAR
                </button>
              </div>
              <p className="text-xs text-muted">Desconectar deixa o progresso neste aparelho e na nuvem; as próximas partidas aqui viram treino.</p>
            </>
          ) : (
            <>
              <p>Entre com a sua conta do Dropbox. Dá para entrar com "Continuar com o Google" na tela do Dropbox.</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={clique(() => void entrarNoDropbox('voltar'))}
                  className="pixel-box pixel-hover px-3 py-2 font-pixel text-[9px] text-accent"
                >
                  ☁ ENTRAR COM O DROPBOX
                </button>
                <button
                  type="button"
                  onClick={clique(() => {
                    setEsperandoCodigo(true);
                    void entrarNoDropbox('codigo');
                  })}
                  className="pixel-box pixel-hover px-3 py-2 font-pixel text-[9px]"
                >
                  ENTRAR COM CÓDIGO
                </button>
              </div>
              {esperandoCodigo && (
                <form
                  className="flex flex-wrap items-end gap-2"
                  onSubmit={(ev) => {
                    ev.preventDefault();
                    if (codigo.trim()) void concluirLogin(codigo);
                  }}
                >
                  <label htmlFor="codigo-dropbox" className="w-full text-xs text-muted">
                    O Dropbox abriu em outra aba e mostrou um código. Copie e cole aqui:
                  </label>
                  <input
                    id="codigo-dropbox"
                    value={codigo}
                    onChange={(ev) => setCodigo(ev.target.value)}
                    autoComplete="off"
                    className="min-w-0 flex-1 border-2 border-line bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-accent"
                  />
                  <button type="submit" className="pixel-box pixel-hover px-3 py-2 font-pixel text-[9px] text-accent">
                    CONFIRMAR
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
