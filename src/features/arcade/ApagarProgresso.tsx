import { useState } from 'react';
import { redefinirProgresso } from '@/game/progresso';
import { desbloquear, tocar } from '@/ui/som';

const PALAVRA = 'APAGAR';

/**
 * Apagar todo o progresso com dupla confirmação: primeiro um aviso do que se
 * perde, depois é preciso digitar APAGAR. Não dá para desfazer.
 */
export default function ApagarProgresso() {
  const [passo, setPasso] = useState<'fechado' | 'aviso' | 'digitar' | 'feito'>('fechado');
  const [texto, setTexto] = useState('');

  const fechar = () => {
    tocar('clique');
    setPasso('fechado');
    setTexto('');
  };

  if (passo === 'fechado' || passo === 'feito') {
    return (
      <div className="flex flex-col items-center gap-2 pt-4">
        {passo === 'feito' && <p className="font-pixel text-[9px] text-accent">PROGRESSO APAGADO. BOA SORTE NA NOVA JORNADA!</p>}
        <button
          type="button"
          onClick={() => {
            desbloquear();
            tocar('clique');
            setPasso('aviso');
          }}
          className="font-pixel text-[9px] text-muted underline-offset-4 hover:text-accent-2 hover:underline"
        >
          🗑 APAGAR PROGRESSO
        </button>
      </div>
    );
  }

  return (
    <section role="alertdialog" aria-labelledby="apagar-titulo" className="pixel-box mx-auto flex w-full max-w-md flex-col gap-3 p-5" style={{ boxShadow: '0 0 0 3px rgb(255 74 90)' }}>
      <h2 id="apagar-titulo" className="font-pixel text-xs text-[rgb(255_74_90)]">
        {passo === 'aviso' ? '⚠ APAGAR TODO O PROGRESSO?' : '⚠ ÚLTIMA CONFIRMAÇÃO'}
      </h2>
      {passo === 'aviso' ? (
        <>
          <p className="text-sm">
            Isso apaga, <strong>neste aparelho e na nuvem</strong> (se a conta estiver conectada), os troféus, as ligas, a Maestria e o histórico das 3 IAs. <strong>Não dá para desfazer.</strong>
          </p>
          <div className="flex justify-end gap-3">
            <button type="button" autoFocus onClick={fechar} className="pixel-box pixel-hover px-3 py-2 font-pixel text-[10px]">
              CANCELAR
            </button>
            <button
              type="button"
              onClick={() => {
                tocar('clique');
                setPasso('digitar');
              }}
              className="pixel-box px-3 py-2 font-pixel text-[10px] text-[rgb(255_74_90)]"
            >
              CONTINUAR
            </button>
          </div>
        </>
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={(ev) => {
            ev.preventDefault();
            if (texto.trim().toUpperCase() !== PALAVRA) return;
            redefinirProgresso();
            tocar('derrota');
            setTexto('');
            setPasso('feito');
          }}
        >
          <label htmlFor="apagar-confirmacao" className="text-sm">
            Para apagar, digite <strong>{PALAVRA}</strong>:
          </label>
          <input
            id="apagar-confirmacao"
            autoFocus
            autoComplete="off"
            value={texto}
            onChange={(ev) => setTexto(ev.target.value)}
            className="border-2 border-line bg-bg px-3 py-2 font-pixel text-xs uppercase text-fg outline-none focus:border-[rgb(255_74_90)]"
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={fechar} className="pixel-box pixel-hover px-3 py-2 font-pixel text-[10px]">
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={texto.trim().toUpperCase() !== PALAVRA}
              className="px-3 py-2 font-pixel text-[10px] text-black disabled:opacity-40"
              style={{ background: 'rgb(255 74 90)' }}
            >
              APAGAR TUDO
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
