import { useEffect, useState } from 'react';

/**
 * Celular em pé (22/11/2026, da revisão visual): a fase e a arena do chefão ficavam pequenas
 * e sobrava meia tela vazia. Aqui a câmera chega mais perto e segue o gladiador.
 */
const CONSULTA = '(orientation: portrait) and (max-width: 700px)';
export function usePerto(): boolean {
  const [perto, setPerto] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(CONSULTA).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(CONSULTA);
    if (!mq) return;
    const muda = () => setPerto(mq.matches);
    mq.addEventListener?.('change', muda);
    return () => mq.removeEventListener?.('change', muda);
  }, []);
  return perto;
}
