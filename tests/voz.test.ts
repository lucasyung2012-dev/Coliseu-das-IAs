import { anunciar, calar, FALA_SILENCIO, falaDoVoto, falasDoResultado } from '@/ui/voz';
import { alternarSom, somLigado } from '@/ui/som';

class FalaFalsa {
  lang = '';
  pitch = 1;
  rate = 1;
  volume = 1;
  voice: unknown = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public text: string) {}
}

describe('voz do Pretor', () => {
  it('cada voto tem o id da fala gravada e fala o nome da IA, não do gladiador', () => {
    expect(falaDoVoto('logico', 'claude')).toEqual({ id: 'voto-logico-claude', texto: 'O Lógico vota em Clôd.' });
    expect(falaDoVoto('cetico', 'chatgpt').texto).toBe('O Cético vota em Chat GPT.');
    expect(falaDoVoto('artista', null)).toEqual({ id: 'voto-artista-ninguem', texto: 'O Artista não escolhe ninguém.' });
  });

  it('o resultado diz o placar do vencedor primeiro e declara a IA', () => {
    expect(falasDoResultado(2, 3, 'gemini')).toEqual([
      { id: 'placar-3-2', texto: 'Por três votos a dois,' },
      { id: 'declara-gemini', texto: 'o tribunal declara a vitória de Jêmini!' },
    ]);
    expect(falasDoResultado(1, 0, 'claude')[0]!.texto).toBe('Por um voto a zero,');
    expect(falasDoResultado(2, 2, null)[1]!.id).toBe('declara-empate');
  });

  describe('falando', () => {
    const falas: FalaFalsa[] = [];

    beforeEach(() => {
      falas.length = 0;
      vi.stubGlobal('SpeechSynthesisUtterance', FalaFalsa);
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: { speak: (u: FalaFalsa) => falas.push(u), cancel: vi.fn(), getVoices: () => [] },
      });
      if (!somLigado()) alternarSom();
    });

    afterEach(() => {
      calar();
      vi.unstubAllGlobals();
      delete (window as { speechSynthesis?: unknown }).speechSynthesis;
    });

    it('sem a fala gravada, usa a voz do navegador em português', async () => {
      anunciar([FALA_SILENCIO]);
      await vi.waitFor(() => expect(falas).toHaveLength(1));
      expect(falas[0]!.text).toBe(FALA_SILENCIO.texto);
      expect(falas[0]!.lang).toBe('pt-BR');
    });

    it('fica mudo com o som desligado', async () => {
      alternarSom();
      anunciar([FALA_SILENCIO]);
      await new Promise((ok) => setTimeout(ok, 20));
      expect(falas).toHaveLength(0);
      alternarSom();
    });
  });
});
