import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';

function abrir(rota: string) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App', () => {
  beforeEach(() => sessionStorage.clear());

  it('mostra os três portais na tela inicial', () => {
    abrir('/');
    expect(screen.getByRole('heading', { level: 1, name: 'Coliseu das IAs' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Imperium Arcade/ })).toHaveAttribute('href', '/arena');
    expect(screen.getByRole('link', { name: /Ludus/ })).toHaveAttribute('href', '/ludus');
    expect(screen.getByRole('link', { name: /Coliseu/ })).toHaveAttribute('href', '/coliseu');
  });

  it('mostra a sala de fliperama na primeira visita: a moeda entra e o crédito sobe', () => {
    abrir('/arena');
    expect(screen.getByRole('dialog', { name: /Entrada do Imperium Arcade/ })).toBeInTheDocument();
    expect(screen.getByText('CRÉDITOS 00')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Inserir moeda' }));
    expect(screen.getByText('CRÉDITOS 01')).toBeInTheDocument();
  });

  it('o botão de pular sai da sala de fliperama e lembra nesta visita', () => {
    abrir('/arena');
    fireEvent.click(screen.getByRole('button', { name: /PULAR/ }));
    expect(screen.queryByRole('dialog', { name: /Entrada do Imperium Arcade/ })).not.toBeInTheDocument();
    expect(sessionStorage.getItem('coliseu.boot.vista')).toBe('1');
  });

  it('o botão de som liga e desliga', () => {
    abrir('/');
    const botao = screen.getByRole('button', { name: 'Desligar sons' });
    fireEvent.click(botao);
    expect(screen.getByRole('button', { name: 'Ligar sons' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ligar sons' }));
  });

  it('abre o Arcade com o gladiador em destaque, os dois modos e o histórico vazio', () => {
    sessionStorage.setItem('coliseu.boot.vista', '1');
    abrir('/arena');
    expect(screen.queryByRole('button', { name: /Fliperama ligando/ })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Imperium Arcade' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'CASSIUS' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Duelo/ })).toHaveAttribute('href', '/arena/duelo');
    expect(screen.getByRole('link', { name: /Tribunal/ })).toHaveAttribute('href', '/arena/tribunal');
    expect(screen.getByText(/primeira glória/)).toBeInTheDocument();
  });

  it('troca o gladiador em destaque ao escolher outra IA', () => {
    sessionStorage.setItem('coliseu.boot.vista', '1');
    abrir('/arena');
    fireEvent.click(screen.getByRole('radio', { name: /Gemini/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'HELIOS' })).toBeInTheDocument();
  });

  it('roda a entrada do Duelo e, ao pular, mostra o fim com "ver de novo"', () => {
    abrir('/arena/duelo');
    fireEvent.click(screen.getByRole('button', { name: /PULAR/ }));
    expect(screen.getByText('VS')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /VER DE NOVO/ })).toBeInTheDocument();
  });

  it('roda a entrada do Tribunal com 5 jurados', () => {
    abrir('/arena/tribunal');
    fireEvent.click(screen.getByRole('button', { name: /PULAR/ }));
    expect(screen.getByRole('list', { name: 'Jurados desta sessão' }).children).toHaveLength(5);
    expect(screen.getByText('A SESSÃO ESTÁ ABERTA')).toBeInTheDocument();
  });

  it('joga um Tribunal inteiro: briefing, 3 tempos, veredito e histórico', () => {
    vi.useFakeTimers();
    try {
      abrir('/arena/tribunal');
      fireEvent.click(screen.getByRole('button', { name: /PULAR/ }));
      fireEvent.click(screen.getByRole('button', { name: /ENTRAR NA SESSÃO/ }));
      expect(screen.getByRole('region', { name: 'O que cada jurado gosta' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /COMEÇAR/ }));

      for (let t = 1; t <= 3; t++) {
        expect(screen.getByText(new RegExp(`TEMPO ${t}/3`))).toBeInTheDocument();
        const mao = within(screen.getByRole('region', { name: 'Sua mão' })).getAllByRole('button');
        expect(mao).toHaveLength(4);
        fireEvent.click(mao[0]!);
        fireEvent.click(screen.getByRole('button', { name: /APRESENTAR CARTA/ }));
        fireEvent.click(screen.getByRole('button', { name: t < 3 ? new RegExp(`TEMPO ${t + 1}`) : /OUVIR O VEREDITO/ }));
      }

      expect(screen.getByRole('list', { name: 'Votos do júri' }).children).toHaveLength(5);
      // Os votos aparecem um a um: cada voto agenda o próximo, então o relógio anda em passos.
      for (let i = 0; i < 8; i++) {
        act(() => {
          vi.advanceTimersByTime(1000);
        });
      }
      expect(screen.getByRole('heading', { name: /VITÓRIA!|DERROTA|EMPATE/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /REVANCHE/ })).toBeInTheDocument();
      const salvo = JSON.parse(localStorage.getItem('coliseu.progresso.v1')!);
      expect(salvo.partidas[0].modo).toBe('tribunal');
    } finally {
      vi.useRealTimers();
    }
  });

  it('o tempo esgotado joga uma carta pelo jogador', () => {
    vi.useFakeTimers();
    try {
      abrir('/arena/tribunal');
      fireEvent.click(screen.getByRole('button', { name: /PULAR/ }));
      fireEvent.click(screen.getByRole('button', { name: /ENTRAR NA SESSÃO/ }));
      fireEvent.click(screen.getByRole('button', { name: /COMEÇAR/ }));
      act(() => {
        vi.advanceTimersByTime(91_000);
      });
      expect(screen.getByText(/Silêncio não é argumento/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /TEMPO 2/ })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('apagar progresso', () => {
  it('pede duas confirmações e só apaga depois de digitar APAGAR', () => {
    sessionStorage.setItem('coliseu.boot.vista', '1');
    localStorage.setItem(
      'coliseu.progresso.v1',
      JSON.stringify({ versao: 1, iaAtual: 'claude', trofeus: { claude: 120, chatgpt: 0, gemini: 0 }, xp: { claude: 0, chatgpt: 0, gemini: 0 }, partidas: [] }),
    );
    abrir('/configuracoes');
    fireEvent.click(screen.getByRole('button', { name: /APAGAR PROGRESSO/ }));
    fireEvent.click(screen.getByRole('button', { name: 'CONTINUAR' }));
    const apagar = screen.getByRole('button', { name: 'APAGAR TUDO' });
    expect(apagar).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/digite/), { target: { value: 'apagar' } });
    fireEvent.click(apagar);
    expect(screen.getByText(/PROGRESSO APAGADO/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('coliseu.progresso.v1')!).trofeus.claude).toBe(0);
  });
});

describe('configurações', () => {
  it('tem conta, treino, som, animações, progresso e sobre, e os interruptores funcionam', () => {
    abrir('/configuracoes');
    for (const nome of ['CONTA', 'MODO TREINO', 'SOM', 'ANIMAÇÕES', 'PROGRESSO', 'SOBRE']) {
      expect(screen.getByRole('region', { name: nome })).toBeInTheDocument();
    }
    const entrada = screen.getByRole('switch', { name: /Entrada do fliperama/ });
    expect(entrada).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(entrada);
    expect(screen.getByRole('switch', { name: /Entrada do fliperama/ })).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(screen.getByRole('radio', { name: 'DIFÍCIL' }));
    expect(screen.getByRole('radio', { name: 'DIFÍCIL' })).toHaveAttribute('aria-checked', 'true');
    // volta ao padrão para não afetar os outros testes
    fireEvent.click(screen.getByRole('switch', { name: /Entrada do fliperama/ }));
  });

  it('o Arcade leva às Configurações e mostra o subtítulo novo', () => {
    sessionStorage.setItem('coliseu.boot.vista', '1');
    abrir('/arena');
    expect(screen.getByText('TODOS OS CAMINHOS LEVAM À ARENA')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Configurações' })).toHaveAttribute('href', '/configuracoes');
  });
});

describe('perfil do combatente', () => {
  it('abre pelo Arcade e mostra troféus, Maestria com títulos e estatísticas', () => {
    sessionStorage.setItem('coliseu.boot.vista', '1');
    abrir('/arena');
    const link = screen.getByRole('link', { name: /VER PERFIL DE CASSIUS/ });
    expect(link).toHaveAttribute('href', '/arena/perfil/claude');
    abrir('/arena/perfil/gemini');
    expect(screen.getByRole('heading', { level: 1, name: 'HELIOS' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Títulos de Maestria' }).children).toHaveLength(8);
    expect(screen.getByRole('list', { name: 'Ligas' }).children).toHaveLength(5);
    expect(screen.getByRole('list', { name: 'Recompensas de Maestria' }).children).toHaveLength(12);
    expect(screen.getByRole('list', { name: 'Evolução por liga' }).children).toHaveLength(5);
    expect(screen.getByRole('region', { name: 'ESTATÍSTICAS' })).toBeInTheDocument();
  });

  it('um endereço de perfil inválido volta para o Arcade', () => {
    sessionStorage.setItem('coliseu.boot.vista', '1');
    abrir('/arena/perfil/xyz');
    expect(screen.getByRole('heading', { level: 1, name: 'Imperium Arcade' })).toBeInTheDocument();
  });
});

describe('mapa de troféus na tela', () => {
  it('abre pelo perfil e mostra o gladiador no mapa', () => {
    abrir('/arena/mapa/chatgpt');
    expect(screen.getByRole('heading', { name: /MAPA DE TROFÉUS/ })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Octavius está com \d+ troféus/ })).toBeInTheDocument();
    expect(screen.getByText(/IMPERADORES · 7000/)).toBeInTheDocument();
  });
});
