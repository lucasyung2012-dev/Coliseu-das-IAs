import { createContext, useContext, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { alternarSom, desbloquear, mudarVolume, useSomLigado, useVolume } from '@/ui/som';
import { tocar } from '@/ui/somHistoria';
import { alternarMusica, useMusicaLigada } from '@/ui/musica';

/**
 * O MENU DE PAUSA do modo História (pedido do Lucas, 22/11/2026: "como todos os jogos têm,
 * GTA, Red Dead, Homem-Aranha"). Pausa a luta e a fase aberta, e tem: continuar, salvar,
 * controles, opções (som, volume, texto automático) e sair.
 */
export const PausaContexto = createContext(false);
export const usePausado = () => useContext(PausaContexto);

type Aba = 'menu' | 'controles' | 'opcoes' | 'mapa';

/** O menu de pausa. O Mapa de Roma mora aqui dentro (22/11/2026): é por ele que se vê onde a história está. */
export function MenuPausa({ onContinuar, onSaves, mapa }: { onContinuar: () => void; onSaves: () => void; mapa?: ReactNode }) {
  const [aba, setAba] = useState<Aba>('menu');
  const [salvo, setSalvo] = useState(false);
  const som = useSomLigado();
  const volume = useVolume();
  const musica = useMusicaLigada();
  const [auto, setAuto] = useState(() => {
    try {
      return localStorage.getItem('coliseu.cutscene.auto') === '1';
    } catch {
      return false;
    }
  });
  const clique = () => {
    desbloquear();
    tocar('clique');
  };
  const item = 'pixel-box w-full px-4 py-3 text-left font-pixel text-[10px] text-[#f4e2b4] sm:text-xs';
  return (
    <div className="menu-pausa fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="Menu de pausa">
      <div className={`flex w-full ${aba === 'mapa' ? 'max-h-[92vh] max-w-3xl overflow-y-auto' : 'max-w-sm'} flex-col gap-3 border-4 border-[#c8962a] bg-[linear-gradient(180deg,#2a1a10,#120806)] p-4 shadow-[0_0_40px_rgba(242,193,78,0.25)]`}>
        <p className="text-center font-pixel text-base text-[#f2c14e] [text-shadow:2px_2px_0_#5a2a12] sm:text-xl">
          {aba === 'menu' ? 'PAUSA' : aba === 'controles' ? 'CONTROLES' : aba === 'mapa' ? 'MAPA DE ROMA' : 'OPÇÕES'}
        </p>

        {aba === 'menu' && (
          <>
            <button type="button" autoFocus className={item} onClick={() => (clique(), onContinuar())}>
              ▶ CONTINUAR
            </button>
            <button
              type="button"
              className={item}
              onClick={() => {
                clique();
                tocar('pagina');
                setSalvo(true);
              }}
            >
              SALVAR {salvo && <span className="ml-2 text-[#4ad46a]">✓ SALVO!</span>}
            </button>
            {salvo && <p className="-mt-2 text-center text-[11px] text-muted">O jogo também salva sozinho no começo de cada cena.</p>}
            {mapa && (
              <button type="button" className={item} onClick={() => (clique(), tocar('pagina'), setAba('mapa'))}>
                MAPA DE ROMA
              </button>
            )}
            <button type="button" className={item} onClick={() => (clique(), setAba('controles'))}>
              CONTROLES
            </button>
            <button type="button" className={item} onClick={() => (clique(), setAba('opcoes'))}>
              OPÇÕES
            </button>
            <button type="button" className={item} onClick={() => (clique(), onSaves())}>
              SAIR PARA OS SAVES
            </button>
            <Link to="/" className={`${item} block`} onClick={clique}>
              SAIR PARA O INÍCIO
            </Link>
          </>
        )}

        {aba === 'controles' && (
          <div className="flex flex-col gap-2 text-sm text-white/85">
            <p className="font-pixel text-[9px] text-[#f2c14e]">NA LUTA</p>
            <p>Botão 1: <b>J</b> ou →  ·  Botão 2: <b>K</b> ou ↓  ·  Botão 3: <b>L</b> ou ←  ·  Especial: <b>espaço</b></p>
            <p>Luz (no escuro): <b>U</b>  ·  Trocar de gladiador (capítulo secreto): <b>1</b>, <b>2</b>, <b>3</b></p>
            <p className="text-xs text-muted">Cada gladiador luta do seu jeito, e o nome de cada botão aparece na luta. Cassius: GLÁDIO, SEGURE O ESCUDO e DEVOLVER. Octavius: TRIDENTE, REDE e ROLAR. Helios: LAMPEJO, ESPELHO e PASSO DE SOMBRA. Bata quando o inimigo ficar ABERTO.</p>
            <p className="mt-1 font-pixel text-[9px] text-[#f2c14e]">NAS FASES</p>
            <p>Andar: <b>A</b> e <b>D</b> (ou as setas)  ·  Pular: <b>W</b> ou <b>espaço</b></p>
            <p className="text-xs text-muted">No celular, use os botões ◀ ▶ e PULAR embaixo da tela.</p>
            <p className="mt-1 font-pixel text-[9px] text-[#f2c14e]">CONVERSAS E CENAS</p>
            <p>Toque (ou Enter) para completar o texto e seguir. AUTO segue sozinho; PULAR pula a cena.</p>
            <button type="button" className={`${item} mt-2 text-center`} onClick={() => (clique(), setAba('menu'))}>
              ◀ VOLTAR
            </button>
          </div>
        )}

        {aba === 'mapa' && (
          <>
            {mapa}
            <button type="button" autoFocus className={item} onClick={() => (clique(), setAba('menu'))}>
              ◀ VOLTAR
            </button>
          </>
        )}
        {aba === 'opcoes' && (
          <div className="flex flex-col gap-3">
            <button type="button" className={item} onClick={() => (alternarSom(), clique())}>
              {som ? 'SOM: LIGADO' : 'SOM: DESLIGADO'}
            </button>
            <button type="button" className={item} onClick={() => (alternarMusica(), clique())}>
              {musica ? 'MÚSICA: LIGADA' : 'MÚSICA: DESLIGADA'}
            </button>
            <label className="flex flex-col gap-1 font-pixel text-[9px] text-[#f4e2b4]">
              VOLUME: {Math.round(volume * 100)}%
              <input type="range" min={0} max={100} value={Math.round(volume * 100)} onChange={(ev) => mudarVolume(Number(ev.target.value) / 100)} className="accent-[#f2c14e]" />
            </label>
            <button
              type="button"
              className={item}
              onClick={() => {
                clique();
                const novo = !auto;
                setAuto(novo);
                try {
                  localStorage.setItem('coliseu.cutscene.auto', novo ? '1' : '0');
                } catch {
                  /* sem armazenamento: vale só agora */
                }
              }}
            >
              {auto ? 'CENAS: AUTOMÁTICAS' : 'CENAS: TOCAR PARA SEGUIR'}
            </button>
            <button type="button" className={`${item} text-center`} onClick={() => (clique(), setAba('menu'))}>
              ◀ VOLTAR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
