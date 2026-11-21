import type { CSSProperties } from 'react';
import type { Lugar } from '@/game/historia/roteiro';
import { temaDoLugar } from '@/ui/musica';

/**
 * O PRIMEIRO PLANO (pedido do Lucas, 22/11/2026: "fundo em camadas", para parecer mais
 * fundo, meio 3D). Coisas escuras NA FRENTE do cenário (colunas, correntes, lanternas,
 * cordas) e partículas (brasas, poeira, respingos) que andam MAIS RÁPIDO que o fundo
 * quando a câmera se mexe. `camera` é quanto a câmera andou (100 = uma tela).
 */
const VELOCIDADE = 1.45;

type Peca = { x: number; tipo: 'coluna' | 'corrente' | 'lanterna' | 'corda' | 'estalactite' | 'telhado' };

function pecasDo(tema: string): Peca[] {
  const lista: Peca[] = [];
  for (let k = 0; k < 14; k++) {
    const x = k * 58 + 20;
    if (tema === 'mar') lista.push({ x, tipo: k % 2 ? 'corda' : 'lanterna' });
    else if (tema === 'catacumbas' || tema === 'nucleo') lista.push({ x, tipo: k % 2 ? 'estalactite' : 'corrente' });
    else if (tema === 'ceu') lista.push({ x, tipo: k % 3 === 0 ? 'telhado' : 'lanterna' });
    else lista.push({ x, tipo: k % 2 ? 'coluna' : k % 4 === 0 ? 'lanterna' : 'corrente' });
  }
  return lista;
}

export function PrimeiroPlano({ lugar, camera }: { lugar: Lugar; camera: number }) {
  const tema = temaDoLugar(lugar);
  const deslocado = camera * VELOCIDADE;
  const particula = tema === 'chamas' || tema === 'chefao' ? 'brasa' : tema === 'mar' ? 'respingo' : tema === 'ceu' || tema === 'livre' ? 'brilho' : 'poeira';
  return (
    <div className="primeiro-plano pointer-events-none absolute inset-0 z-[12] overflow-hidden" aria-hidden>
      {pecasDo(tema).map((p, k) => {
        const left = p.x - deslocado;
        if (left < -20 || left > 120) return null;
        return <PecaFrente key={k} tipo={p.tipo} left={left} />;
      })}
      {/* partículas que flutuam na frente (também andam com a câmera) */}
      {Array.from({ length: 10 }, (_, k) => {
        const left = ((((k * 37 + 11) * 3 - deslocado * 1.2) % 140) + 140) % 140 - 20;
        return (
          <span
            key={`p${k}`}
            className={`particula-frente particula-${particula} absolute`}
            style={{ left: `${left}%`, top: `${(k * 23) % 80 + 6}%`, animationDelay: `${(k * 433) % 3000}ms` } as CSSProperties}
          />
        );
      })}
    </div>
  );
}

function PecaFrente({ tipo, left }: { tipo: Peca['tipo']; left: number }) {
  const base: CSSProperties = { left: `${left}%` };
  if (tipo === 'coluna')
    return (
      <div className="absolute bottom-0 top-0 w-[6%]" style={base}>
        <div className="absolute inset-x-0 top-0 h-[6%] bg-[#0a0503]" />
        <div className="absolute inset-x-[10%] bottom-0 top-[6%] bg-[linear-gradient(90deg,#140a06,#2a1a10_40%,#0c0604)] opacity-90" />
        <div className="absolute inset-x-0 bottom-0 h-[5%] bg-[#0a0503]" />
      </div>
    );
  if (tipo === 'corrente')
    return <div className="balanca-frente absolute top-0 h-[22%] w-[1.2%] bg-[repeating-linear-gradient(180deg,#1a1410_0_6px,#3a3028_6px_9px)]" style={base} />;
  if (tipo === 'lanterna')
    return (
      <div className="balanca-frente absolute top-0 flex w-[3%] flex-col items-center" style={base}>
        <span className="h-[2.4rem] w-[2px] bg-[#1a1410] sm:h-[4rem]" />
        <span className="h-4 w-full rounded-sm bg-[#ffb04a] shadow-[0_0_16px_6px_rgba(255,160,60,0.45)] sm:h-6" />
      </div>
    );
  if (tipo === 'corda') return <div className="absolute top-0 h-full w-[0.8%] origin-top rotate-[8deg] bg-[#2a1c10]/90" style={base} />;
  if (tipo === 'estalactite')
    return <div className="absolute top-0 h-[16%] w-[4%] bg-[#0c0806] [clip-path:polygon(0_0,100%_0,55%_100%)]" style={base} />;
  return <div className="absolute bottom-0 h-[10%] w-[22%] bg-[repeating-linear-gradient(90deg,#1a0c08_0_8px,#2a160c_8px_10px)] [clip-path:polygon(0_40%,100%_0,100%_100%,0_100%)]" style={base} />;
}
