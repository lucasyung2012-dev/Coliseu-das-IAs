import { calar, falar } from '@/ui/voz';
import { alternarSom, somLigado } from '@/ui/som';

class FalaFalsa {
  lang = '';
  pitch = 1;
  rate = 1;
  volume = 1;
  voice: unknown = null;
  constructor(public text: string) {}
}

describe('voz do Pretor', () => {
  const falas: FalaFalsa[] = [];
  const cancel = vi.fn();

  beforeEach(() => {
    falas.length = 0;
    cancel.mockClear();
    vi.stubGlobal('SpeechSynthesisUtterance', FalaFalsa);
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { speak: (u: FalaFalsa) => falas.push(u), cancel, getVoices: () => [] },
    });
    if (!somLigado()) alternarSom();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete (window as { speechSynthesis?: unknown }).speechSynthesis;
  });

  it('fala em português, grave e devagar', () => {
    falar('O júri vai votar.');
    expect(falas).toHaveLength(1);
    expect(falas[0]!.text).toBe('O júri vai votar.');
    expect(falas[0]!.lang).toBe('pt-BR');
    expect(falas[0]!.pitch).toBeLessThan(1);
    expect(falas[0]!.rate).toBeLessThan(1);
  });

  it('corta a fala anterior, a não ser que seja em fila', () => {
    falar('um');
    falar('dois', { fila: true });
    expect(cancel).toHaveBeenCalledTimes(1);
    calar();
    expect(cancel).toHaveBeenCalledTimes(2);
  });

  it('fica mudo com o som desligado', () => {
    alternarSom();
    falar('não deve falar');
    expect(falas).toHaveLength(0);
    alternarSom();
  });
});
