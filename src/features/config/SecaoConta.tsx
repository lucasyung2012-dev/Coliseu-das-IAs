import { useEffect, useState } from 'react';
import { concluirLogin, contaConfigurada, desconectar, entrarNoDropbox, modoRanqueado, sincronizar, useConta } from '@/game/conta';
import { pegarVolta } from '@/services/dropbox';
import { desbloquear, tocar } from '@/ui/som';

const hora = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const botao = 'pixel-box pixel-hover px-3 py-2 font-pixel text-[9px]';

/** Conta do Dropbox: conectar, trocar, salvar agora e desconectar. */
export default function SecaoConta() {
  const c = useConta();
  const ranqueado = modoRanqueado(c);
  const [codigo, setCodigo] = useState('');
  const [esperandoCodigo, setEsperandoCodigo] = useState(false);

  // Voltou do login do Dropbox (ele devolve para esta tela): termina sozinho.
  useEffect(() => {
    const volta = pegarVolta();
    if (volta?.code) void concluirLogin(volta.code);
  }, []);

  if (!contaConfigurada()) return <p className="text-sm text-muted">A conta ainda não está disponível neste jogo.</p>;

  const clique = (f: () => void) => () => {
    desbloquear();
    tocar('clique');
    f();
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className={`font-pixel text-[10px] ${ranqueado ? 'text-accent' : 'text-[rgb(242_193_78)]'}`}>
        {ranqueado ? '🏆 VALENDO TROFÉUS' : '🎯 MODO TREINO · SEM TROFÉUS'}
      </p>

      {c.conta ? (
        <>
          <p>
            Conectado ao Dropbox como <strong>{c.conta.nome || 'você'}</strong>
            {c.conta.email && <span className="text-muted"> ({c.conta.email})</span>}.
          </p>
          <p className="text-xs text-muted">
            {c.situacao === 'sincronizando' ? 'Salvando…' : c.sincronizadoEm ? `Salvo na nuvem às ${hora(c.sincronizadoEm)}.` : 'Ainda não salvo nesta visita.'} O jogo
            só usa a pasta do app no seu Dropbox. Nenhum outro arquivo é lido.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={clique(() => void sincronizar())} className={`${botao} text-accent`}>
              ↻ SALVAR AGORA
            </button>
            <button
              type="button"
              onClick={clique(() => {
                void desconectar().then(() => entrarNoDropbox('voltar'));
              })}
              className={botao}
            >
              ⇄ TROCAR DE CONTA
            </button>
            <button type="button" onClick={clique(() => void desconectar())} className={botao}>
              DESCONECTAR
            </button>
          </div>
          <p className="text-xs text-muted">
            Desconectar deixa o progresso neste aparelho e na nuvem. As próximas partidas aqui viram treino, até alguém conectar uma conta.
          </p>
        </>
      ) : (
        <>
          <p>
            Conecte a sua conta do Dropbox para jogar <strong>valendo troféus</strong> e salvar o progresso na nuvem. Na tela do Dropbox dá para entrar com
            "Continuar com o Google". Conta do Dropbox é grátis.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={clique(() => void entrarNoDropbox('voltar'))} className={`${botao} text-accent`}>
              ☁ ENTRAR COM O DROPBOX
            </button>
            <button
              type="button"
              onClick={clique(() => {
                setEsperandoCodigo(true);
                void entrarNoDropbox('codigo');
              })}
              className={botao}
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
              <button type="submit" className={`${botao} text-accent`}>
                CONFIRMAR
              </button>
            </form>
          )}
        </>
      )}
      {c.erro && <p className="text-xs text-[rgb(255_74_90)]">{c.erro}</p>}
    </div>
  );
}
