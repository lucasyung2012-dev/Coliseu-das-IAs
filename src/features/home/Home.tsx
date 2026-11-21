import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IAS } from '@/game/personagens';
import { GladiadorPixel } from '@/ui/pixel/Personagens';
import { prefereMenosMovimento } from '@/ui/movimento';
import { desbloquear, tocar } from '@/ui/som';
import { tocar as tocarHistoria } from '@/ui/somHistoria';
import { CenarioHistoria } from '../coliseu/Cenarios';
import { Portoes } from '../coliseu/Portoes';
import CenaPortalColiseu from './CenaPortalColiseu';
import { PORTAIS } from './areas';

/**
 * A tela inicial (refeita em 21/11/2026, o Lucas achou genérica): Roma Eterna à noite
 * no alto, com o nome do jogo bem grande; depois o Coliseu (o modo História, primeiro)
 * e o Imperium Arcade embaixo. Entrar no Coliseu abre os portões de pedra.
 */
export default function Home() {
  const arcade = PORTAIS.find((p) => p.area === 'arcade');
  const coliseu = PORTAIS.find((p) => p.area === 'coliseu');
  return (
    <main className="flex min-h-screen flex-col">
      {/* O topo: Roma Eterna à noite e o nome do jogo */}
      <header className="relative h-[46vh] min-h-[260px] w-full overflow-hidden sm:h-[52vh]">
        <CenarioHistoria lugar="roma-noite" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,3,20,0.1)_0%,rgba(5,3,20,0.05)_50%,#0c0a10_100%)]" aria-hidden />
        <div className="absolute inset-x-0 top-[10%] flex flex-col items-center px-3 text-center">
          <p className="animate-fade-up font-pixel text-[9px] tracking-[0.35em] text-[#f2c14e] [text-shadow:2px_2px_0_#000] sm:text-xs">A ARENA DAS GRANDES IDEIAS</p>
          <h1 className="titulo-jogo abertura-pedra mt-3 font-pixel text-[2.1rem] leading-[1.15] text-[#f2c14e] sm:text-7xl" aria-label="Coliseu das IAs">
            COLISEU
            <span className="block text-[1.35rem] text-white sm:text-5xl">DAS IAS</span>
          </h1>
          <p className="animate-fade-up mt-3 max-w-md text-sm text-white/85 [text-shadow:1px_1px_0_#000] sm:text-base" style={{ animationDelay: '300ms' }}>
            Claude, ChatGPT e Gemini contra a Lei da Resposta Única.
          </p>
        </div>
      </header>

      <nav aria-label="Áreas do jogo" className="mx-auto -mt-10 flex w-full max-w-4xl flex-col gap-6 px-4 pb-10 sm:px-8">
        {coliseu && <PortalColiseu rota={coliseu.rota} frase={coliseu.frase} />}
        {arcade && <PortalArcade rota={arcade.rota} frase={arcade.frase} />}
      </nav>

      <footer className="mt-auto pb-6 text-center text-xs text-muted">Coliseu das IAs · feito pelo Lucas</footer>
    </main>
  );
}

/**
 * O portão do Coliseu (o modo História): o Coliseu sob as três estrelas, com o Olho do
 * Censor no alto e os três condenados na frente. Ao tocar, os portões de pedra se abrem.
 */
function PortalColiseu({ rota, frase }: { rota: string; frase: string }) {
  const navegar = useNavigate();
  const [abrindo, setAbrindo] = useState(false);
  return (
    <>
      <Link
        to={rota}
        data-area="coliseu"
        aria-label={`Coliseu: modo História. ${frase}`}
        onClick={(ev) => {
          desbloquear();
          tocarHistoria('portao');
          if (prefereMenosMovimento()) return;
          ev.preventDefault();
          setAbrindo(true);
          window.setTimeout(() => navegar(rota, { state: { portao: true } }), 750);
        }}
        className="portal-coliseu group animate-fade-up relative block overflow-hidden border-4 border-[#c8962a] bg-black text-fg"
        style={{ animationDelay: '150ms' }}
      >
        {/* A cena: a grade sobe e os três saem do túnel para a areia */}
        <div className="relative aspect-[16/11] w-full sm:aspect-[2/1]">
          <CenaPortalColiseu />
        </div>
        <div className="flex flex-col items-center gap-1 border-t-4 border-[#c8962a] bg-[linear-gradient(180deg,#2a140c,#120806)] p-3 text-center sm:p-5">
          <p className="font-pixel text-[8px] tracking-[0.3em] text-[#ff5a5a] sm:text-[10px]">MODO HISTÓRIA</p>
          <h2 className="font-pixel text-xl text-[#f2c14e] [text-shadow:3px_3px_0_#5a2a12] sm:text-4xl">O COLISEU</h2>
          <p className="max-w-md text-xs text-white/80 sm:text-sm">{frase}</p>
          <p className="piscar mt-1 border-2 border-[#f2c14e] bg-black/70 px-3 py-1 font-pixel text-[9px] text-[#f2c14e] sm:text-xs">▶ ENTRAR NO COLISEU</p>
        </div>
      </Link>
      {/* Os portões de pedra fechando (dentro do Coliseu, eles abrem) */}
      {abrindo && <Portoes modo="fecha" />}
    </>
  );
}

/** Botão do Arcade em forma de tela de fliperama: neon, linhas de TV, gladiadores e "PRESS START". */
function PortalArcade({ rota, frase }: { rota: string; frase: string }) {
  return (
    <Link
      to={rota}
      state={{ boot: true }}
      onMouseEnter={() => tocar('passarMouse')}
      onClick={() => {
        desbloquear();
        tocar('clique');
      }}
      data-area="arcade"
      aria-label={`Imperium Arcade. ${frase}`}
      className="maquina-arcade group animate-fade-up relative block overflow-hidden bg-bg p-5 text-fg sm:p-8"
      style={{ animationDelay: '260ms' }}
    >
      <div className="tela-crt pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative flex flex-col items-center gap-4 text-center">
        <p className="font-pixel text-[9px] tracking-[0.3em] text-accent-2 sm:text-[10px]">★ 1 OU 2 JOGADORES ★</p>
        <h2 className="neon letreiro font-pixel text-2xl leading-snug text-accent sm:text-4xl">Imperium Arcade</h2>
        <p className="-mt-2 font-pixel text-[8px] tracking-[0.2em] text-[rgb(242_193_78)] sm:text-[10px]">ONDE AS LENDAS DO COLISEU GANHAM VIDA</p>
        <div className="flex items-end gap-4 sm:gap-10">
          {IAS.map((id, i) => (
            <div key={id} className="w-12 transition-transform duration-200 group-hover:-translate-y-2 sm:w-20" style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="respirar" style={{ animationDelay: `${i * 200}ms` }}>
                <GladiadorPixel ia={id} espelhar={i === 2} />
              </div>
            </div>
          ))}
        </div>
        <p className="max-w-md text-sm text-muted">{frase}</p>
        <p className="piscar font-pixel text-xs text-[rgb(242_193_78)] sm:text-sm">▶ PRESS START</p>
        <div className="mt-1 flex items-center gap-2 font-pixel text-[8px] text-muted sm:text-[9px]">
          <span className="inline-block h-4 w-2 border-2 border-[rgb(242_193_78)] bg-black" aria-hidden />
          INSERT COIN · CRÉDITOS 00
        </div>
      </div>
    </Link>
  );
}
