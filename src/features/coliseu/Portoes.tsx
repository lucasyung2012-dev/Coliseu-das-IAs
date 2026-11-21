/**
 * Os portões de pedra do Coliseu. Na tela inicial eles FECHAM (ao tocar em "Entrar no
 * Coliseu"); já dentro do Coliseu, eles ABREM. As animações estão em arcade.css.
 */
export function Portoes({ modo }: { modo: 'fecha' | 'abre' }) {
  const extra = modo === 'abre' ? ' abre' : '';
  const pedra = 'bg-[repeating-linear-gradient(0deg,#5a4a3c_0px,#5a4a3c_38px,#3a2e24_38px,#3a2e24_42px)]';
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" aria-hidden>
      <div className={`portao-esq${extra} absolute inset-y-0 left-0 w-1/2 ${pedra}`}>
        <div className="absolute inset-y-0 right-0 w-3 bg-[#2a1e16]" />
        <div className="absolute right-6 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border-4 border-[#c8962a]" />
        <div className="absolute inset-y-0 right-14 w-2 bg-[#c8962a]/40" />
      </div>
      <div className={`portao-dir${extra} absolute inset-y-0 right-0 w-1/2 ${pedra}`}>
        <div className="absolute inset-y-0 left-0 w-3 bg-[#2a1e16]" />
        <div className="absolute left-6 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border-4 border-[#c8962a]" />
        <div className="absolute inset-y-0 left-14 w-2 bg-[#c8962a]/40" />
      </div>
      <p className={`portao-titulo${extra} absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-pixel text-2xl text-[#f2c14e] [text-shadow:3px_3px_0_#000] sm:text-5xl`}>
        O COLISEU
      </p>
    </div>
  );
}
