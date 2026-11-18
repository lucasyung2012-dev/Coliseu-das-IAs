import { somLigado, volumeAtual } from './som';

/**
 * A voz do Pretor Supremo (ideia do Lucas): usa a voz do próprio navegador
 * (Web Speech API), sem custo e sem arquivos. Tom grave e devagar, em pt-BR.
 * Respeita o botão de som e o volume. Sem suporte (como nos testes), fica mudo.
 */
export function vozDisponivel(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && somLigado();
}

/** Prefere uma voz masculina em português do Brasil; senão, qualquer voz em português. */
function escolherVoz(): SpeechSynthesisVoice | null {
  const pt = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('pt'));
  const br = pt.filter((v) => /br/i.test(v.lang));
  return (
    br.find((v) => /daniel|ricardo|antonio|ant[oô]nio|felipe|male|masculin/i.test(v.name)) ?? br[0] ?? pt[0] ?? null
  );
}

/** O Pretor fala. `fila` espera a fala anterior terminar; senão, corta e fala já. */
export function falar(texto: string, { fila = false }: { fila?: boolean } = {}) {
  if (!vozDisponivel()) return;
  const s = window.speechSynthesis;
  if (!fila) s.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = 'pt-BR';
  const v = escolherVoz();
  if (v) u.voice = v;
  u.pitch = 0.55;
  u.rate = 0.9;
  u.volume = volumeAtual();
  s.speak(u);
}

export function calar() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}
