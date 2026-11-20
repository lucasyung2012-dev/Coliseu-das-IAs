import { useEffect, useState } from 'react';

/**
 * Aviso discreto quando o aparelho fica sem internet: o jogo continua funcionando
 * (fica guardado no aparelho), e o progresso vai para a conta quando a conexão voltar.
 */
export default function AvisoSemInternet() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine !== false));
  useEffect(() => {
    const atualizar = () => setOnline(navigator.onLine !== false);
    window.addEventListener('online', atualizar);
    window.addEventListener('offline', atualizar);
    return () => {
      window.removeEventListener('online', atualizar);
      window.removeEventListener('offline', atualizar);
    };
  }, []);
  if (online) return null;
  return (
    <p role="status" className="fixed bottom-3 left-3 z-50 max-w-[16rem] border-2 border-[rgb(242_193_78)] bg-black/85 px-3 py-2 font-pixel text-[8px] leading-relaxed text-[rgb(242_193_78)]">
      📴 SEM INTERNET · O JOGO CONTINUA. O PROGRESSO VAI PARA A CONTA QUANDO A CONEXÃO VOLTAR.
    </p>
  );
}
