import Sprite from '@/ui/pixel/Sprite';

/**
 * A ânfora (vaso romano de barro) que mede as GOTAS de cada lado: enche de água
 * azul aos poucos, e cada carta gasta algumas gotas. Ideia do Lucas, inspirada na
 * clepsidra, o relógio de água que media o tempo de fala dos oradores em Roma.
 */
// i = dentro do vaso (onde a água sobe); b = barro; K = contorno.
const FORMA = [
  '....KKKKKKKK....',
  '....KbbbbbbK....',
  '.....KbiibK.....',
  '..KK.KbiibK.KK..',
  '.KbbKKiiiiKKbbK.',
  '.Kb.KiiiiiiK.bK.',
  '..KbKiiiiiiKbK..',
  '...KiiiiiiiiK...',
  '..KiiiiiiiiiiK..',
  '..KiiiiiiiiiiK..',
  '.KiiiiiiiiiiiiK.',
  '.KiiiiiiiiiiiiK.',
  '.KiiiiiiiiiiiiK.',
  '.KiiiiiiiiiiiiK.',
  '..KiiiiiiiiiiK..',
  '..KiiiiiiiiiiK..',
  '...KiiiiiiiiK...',
  '....KiiiiiiK....',
  '.....KiiiiK.....',
  '......KiiK......',
  '.....KbbbbK.....',
  '.....KKKKKK.....',
];
// Faixas decorativas douradas no barro (só onde não tem água).
const FAIXAS = new Set([9, 15]);
const LINHAS_DENTRO = FORMA.map((l, y) => (l.includes('i') ? y : -1)).filter((y) => y >= 0);

const PALETA = {
  K: '#140c22',
  b: '#c06a3c',
  i: '#4a2418',
  g: '#f2c14e',
  A: '#2f86ff',
  L: '#a8dcff',
};

export default function Anfora({ gotas, max, rotulo, cor }: { gotas: number; max: number; rotulo?: string; cor?: string }) {
  const nivel = Math.round((Math.max(0, Math.min(max, gotas)) / max) * LINHAS_DENTRO.length);
  const primeiraComAgua = LINHAS_DENTRO.length - nivel;
  const grade = FORMA.map((linha, y) => {
    const ordem = LINHAS_DENTRO.indexOf(y);
    if (ordem < 0) return linha;
    const comAgua = ordem >= primeiraComAgua;
    const superficie = ordem === primeiraComAgua;
    const vazio = FAIXAS.has(y) ? 'g' : 'i';
    return linha.replace(/i/g, comAgua ? (superficie ? 'L' : 'A') : vazio);
  });
  const cheias = Math.floor(gotas);
  return (
    <div className="flex flex-col items-center gap-1" role="meter" aria-label="Gotas" aria-valuenow={cheias} aria-valuemin={0} aria-valuemax={max}>
      <div className="relative w-14 sm:w-20" style={{ filter: gotas >= max ? 'drop-shadow(0 0 8px #2f86ff)' : undefined }}>
        <Sprite grade={grade} paleta={PALETA} />
        {/* Uma gota caindo na boca da ânfora enquanto ela enche */}
        {gotas < max && <span className="gota-caindo absolute left-1/2 top-[-8%] h-[6%] w-[6%] -translate-x-1/2 rounded-full bg-[#a8dcff]" aria-hidden />}
      </div>
      <p className="font-pixel text-[9px] tabular-nums sm:text-xs" style={{ color: cor ?? '#a8dcff' }}>
        💧 {cheias}/{max}
      </p>
      <p className="font-pixel text-[6px] text-muted sm:text-[8px]">GOTAS</p>
      {rotulo && <p className="max-w-[5rem] text-center font-pixel text-[6px] leading-tight text-[rgb(242_193_78)] sm:text-[7px]">{rotulo}</p>}
    </div>
  );
}
