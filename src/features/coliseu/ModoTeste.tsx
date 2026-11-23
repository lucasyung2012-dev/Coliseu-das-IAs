import { useState } from 'react';
import { IAS, PERSONAGENS } from '@/game/personagens';
import { parte1 } from '@/game/historia/historiaUnica';
import { CAPITULOS } from '@/game/historia/roteiro';
import { criarSave, criarSaveSecreto, criarSaveUnica, type SaveHistoria } from '@/game/historia/saves';
import { desbloquear } from '@/ui/som';
import { tocar } from '@/ui/somHistoria';

/**
 * O MODO TESTE (22/11/2026, pedido do Lucas): com a senha, dá para pular para qualquer ato,
 * qualquer cena e qualquer parte, só para testar. O save criado fica marcado como TESTE
 * (não conta para prêmios).
 *
 * Proteção: no código fica só o RESUMO da senha (SHA-256 com um sal), nunca a senha. Depois de
 * 5 erros, espera 1 minuto. O desbloqueio vale só até fechar a aba. (Num site sem servidor,
 * isso afasta curiosos, mas quem sabe programar ainda consegue mexer: não é cofre.)
 */
const RESUMO_DA_SENHA = '';
const SAL = 'coliseu-teste:';
const CHAVE_OK = 'coliseu.teste.ok';
const CHAVE_ERROS = 'coliseu.teste.erros';

export async function resumoDaSenha(senha: string): Promise<string> {
  const dados = new TextEncoder().encode(SAL + senha);
  const r = await crypto.subtle.digest('SHA-256', dados);
  return [...new Uint8Array(r)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function ler(chave: string): string | null {
  try {
    return sessionStorage.getItem(chave);
  } catch {
    return null;
  }
}
function gravar(chave: string, valor: string) {
  try {
    sessionStorage.setItem(chave, valor);
  } catch {
    /* sem armazenamento */
  }
}

export function ModoTeste({ onIr }: { onIr: (s: SaveHistoria) => void }) {
  const [liberado, setLiberado] = useState(() => ler(CHAVE_OK) === '1');
  const [senha, setSenha] = useState('');
  const [aviso, setAviso] = useState('');

  const entrar = async () => {
    desbloquear();
    const [n, ate] = (ler(CHAVE_ERROS) ?? '0|0').split('|').map(Number);
    if ((ate ?? 0) > Date.now()) {
      setAviso('Muitas tentativas. Espere um minuto.');
      return;
    }
    if (!RESUMO_DA_SENHA) {
      setAviso('A senha do modo teste ainda não foi definida.');
      return;
    }
    let ok = false;
    try {
      ok = (await resumoDaSenha(senha)) === RESUMO_DA_SENHA;
    } catch {
      setAviso('Este aparelho não consegue conferir a senha.');
      return;
    }
    setSenha('');
    if (ok) {
      gravar(CHAVE_OK, '1');
      gravar(CHAVE_ERROS, '0|0');
      tocar('fanfarra');
      setLiberado(true);
      setAviso('');
    } else {
      const erros = (n ?? 0) + 1;
      gravar(CHAVE_ERROS, erros >= 5 ? `0|${Date.now() + 60_000}` : `${erros}|0`);
      tocar('falha');
      setAviso(erros >= 5 ? 'Senha errada. Espere um minuto.' : 'Senha errada.');
    }
  };

  const ir = (s: SaveHistoria) => {
    desbloquear();
    tocar('start');
    onIr({ ...s, teste: true });
  };

  if (!liberado)
    return (
      <form
        className="flex flex-col gap-2"
        onSubmit={(ev) => {
          ev.preventDefault();
          void entrar();
        }}
      >
        <label htmlFor="senha-teste" className="text-xs text-muted">
          Modo teste: digite a senha para liberar todos os atos e partes.
        </label>
        <div className="flex gap-2">
          <input id="senha-teste" type="password" autoComplete="off" value={senha} onChange={(e) => setSenha(e.target.value)} className="pixel-box min-w-0 flex-1 bg-black/60 px-2 py-1 text-sm text-white" />
          <button type="submit" className="pixel-box px-3 py-1 font-pixel text-[9px] text-[#f2c14e]">
            ENTRAR
          </button>
        </div>
        {aviso && <p className="text-xs text-accent-2">{aviso}</p>}
      </form>
    );

  const sel = 'pixel-box min-w-0 flex-1 bg-black/60 px-1 py-1 text-xs text-white';
  return (
    <div className="flex flex-col gap-3 text-xs">
      <p className="font-pixel text-[9px] text-[#4ad46a]">MODO TESTE LIBERADO (até fechar a aba)</p>
      <div className="flex flex-col gap-2">
        <p className="font-pixel text-[9px] text-[#ff5a5a]">PARTE 1 · A LEI DA RESPOSTA ÚNICA</p>
        {parte1().map((a) => (
          <AtoTeste key={a.numero} titulo={a.titulo} cenas={a.cenas.map((c) => `${c.id} (${c.tipo})`)} sel={sel} onIr={(cena) => ir({ ...criarSaveUnica(), capitulo: a.numero, cena })} />
        ))}
      </div>
      <p className="font-pixel text-[9px] text-[#5ab0ff]">PARTES 2 E 3: ainda não existem.</p>
      <details>
        <summary className="cursor-pointer font-pixel text-[9px] text-muted">CAMINHOS ANTIGOS E CAPÍTULO SECRETO</summary>
        <div className="mt-2 flex flex-col gap-2">
          {IAS.map((ia) => (
            <div key={ia} className="flex flex-wrap items-center gap-1">
              <span className="w-20 shrink-0">{PERSONAGENS[ia].gladiador}</span>
              {CAPITULOS[ia].map((c, k) => (
                <button key={k} type="button" className="pixel-box px-2 py-0.5 text-[10px]" onClick={() => ir({ ...criarSave(ia), capitulo: k + 1, cena: 0 })} title={c.titulo}>
                  {k === 6 ? 'F' : k + 1}
                </button>
              ))}
            </div>
          ))}
          <button type="button" className="pixel-box self-start px-2 py-1 text-[10px]" onClick={() => ir(criarSaveSecreto())}>
            Capítulo secreto (Os Três)
          </button>
        </div>
      </details>
    </div>
  );
}

function AtoTeste({ titulo, cenas, sel, onIr }: { titulo: string; cenas: string[]; sel: string; onIr: (cena: number) => void }) {
  const [cena, setCena] = useState(0);
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="w-full text-white/85 sm:w-44 sm:shrink-0">{titulo}</span>
      <select aria-label={`Cena de ${titulo}`} value={cena} onChange={(e) => setCena(Number(e.target.value))} className={sel}>
        {cenas.map((c, k) => (
          <option key={k} value={k}>
            {k}: {c}
          </option>
        ))}
      </select>
      <button type="button" className="pixel-box px-2 py-1 font-pixel text-[9px] text-[#f2c14e]" onClick={() => onIr(cena)}>
        IR
      </button>
    </div>
  );
}
