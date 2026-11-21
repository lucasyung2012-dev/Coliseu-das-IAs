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

/** Marca os tutoriais como vistos, para os testes irem direto ao jogo. */
function tutoriaisVistos() {
  localStorage.setItem('coliseu.tutorial.tribunal', '1');
  localStorage.setItem('coliseu.tutorial.duelo', '1');
}

describe('App', () => {
  beforeEach(() => {
    sessionStorage.clear();
    tutoriaisVistos();
  });

  it('o tutorial do Tribunal abre sozinho na primeira vez e depois pelo botão', () => {
    localStorage.removeItem('coliseu.tutorial.tribunal');
    abrir('/arena/tribunal');
    fireEvent.click(screen.getByRole('button', { name: /PULAR/ }));
    fireEvent.click(screen.getByRole('button', { name: /ENTRAR NA SESSÃO/ }));
    const dialogo = screen.getByRole('dialog', { name: /Como jogar: TRIBUNAL/ });
    for (let i = 0; i < 4; i++) fireEvent.click(within(dialogo).getByRole('button', { name: /PRÓXIMO/ }));
    fireEvent.click(within(dialogo).getByRole('button', { name: /ENTENDI/ }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(localStorage.getItem('coliseu.tutorial.tribunal')).toBe('1');
    fireEvent.click(screen.getByRole('button', { name: /COMO JOGAR/ }));
    expect(screen.getByRole('dialog', { name: /Como jogar: TRIBUNAL/ })).toBeInTheDocument();
  });

  it('mostra os portais na tela inicial (o Ludus fica dentro do Coliseu)', () => {
    abrir('/');
    expect(screen.getByRole('heading', { level: 1, name: 'Coliseu das IAs' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Imperium Arcade/ })).toHaveAttribute('href', '/arena');
    expect(screen.getByRole('link', { name: /Coliseu/ })).toHaveAttribute('href', '/coliseu');
  });

  it('Coliseu (modo História): prólogo, saves, escolher o Cassius e abrir o Capítulo 1', () => {
    localStorage.removeItem('coliseu.historia.prologo');
    abrir('/coliseu');
    // O prólogo é uma cutscene (o texto aparece letra por letra); dá para pular.
    expect(screen.getByRole('button', { name: /PULAR/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /PULAR/ }));
    fireEvent.click(screen.getByRole('button', { name: /NOVA HISTÓRIA/ }));
    expect(screen.getByRole('button', { name: /OCTAVIUS/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /CASSIUS/ }));
    expect(screen.getByText('A NOITE DAS CHAMAS')).toBeInTheDocument();
    // O save foi criado e aparece na lista ao voltar.
    fireEvent.click(screen.getByRole('button', { name: /SAVES/ }));
    expect(screen.getByRole('button', { name: /CONTINUAR/ })).toBeInTheDocument();
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
    abrir('/arena/duelo/jogar');
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

  it('sair no meio da partida pede confirmação e conta como derrota', () => {
    abrir('/arena/tribunal');
    fireEvent.click(screen.getByRole('button', { name: /PULAR/ }));
    fireEvent.click(screen.getByRole('button', { name: /ENTRAR NA SESSÃO/ }));
    fireEvent.click(screen.getByRole('button', { name: /COMEÇAR/ }));
    fireEvent.click(screen.getByRole('link', { name: /ARCADE/ }));
    const aviso = screen.getByRole('dialog', { name: /Sair da partida/ });
    fireEvent.click(within(aviso).getByRole('button', { name: /SAIR/ }));
    const salvo = JSON.parse(localStorage.getItem('coliseu.progresso.v1')!);
    expect(salvo.partidas[0]).toMatchObject({ modo: 'tribunal', venceu: false, abandono: true });
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
    // Perfil em abas: GERAL abre primeiro; cada aba mostra o seu assunto.
    expect(screen.getByRole('region', { name: 'ESTATÍSTICAS' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /TROFÉUS/ }));
    expect(screen.getByRole('list', { name: 'Ligas' }).children).toHaveLength(5);
    expect(screen.getByRole('list', { name: 'Evolução por liga' }).children).toHaveLength(5);
    expect(screen.getByRole('region', { name: 'MEU COLISEU' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /MAESTRIA/ }));
    expect(screen.getByRole('list', { name: 'Títulos de Maestria' }).children).toHaveLength(8);
    expect(screen.getByRole('list', { name: 'Recompensas de Maestria' }).children).toHaveLength(12);
    fireEvent.click(screen.getByRole('tab', { name: /HISTÓRIA/ }));
    expect(screen.getByRole('region', { name: /QUEM É HELIOS/ })).toBeInTheDocument();
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

describe('duelo jogável (protótipo)', () => {
  it('2 jogadores: o Jogador 2 escolhe a IA e a partida mostra os dois lados', () => {
    localStorage.setItem('coliseu.tutorial.duelo', '1');
    abrir('/arena/duelo/2j');
    fireEvent.click(screen.getAllByRole('button', { name: /Jogador 2 com/ })[0]!);
    expect(screen.getByText(/JOGADOR 1 ·/)).toBeInTheDocument();
    expect(screen.getByText(/JOGADOR 2 ·/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /ESTOU PRONTO/ }));
    expect(screen.getByRole('region', { name: 'Suas cartas' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Cartas do Jogador 2' })).toBeInTheDocument();
  });

  it('sala do Duelo: baralho à esquerda, organizar por gotas, Jogar e 2 jogadores', () => {
    abrir('/arena/duelo');
    expect(screen.getByRole('region', { name: 'Seu baralho' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /POR GOTAS/ }));
    expect(screen.getByRole('region', { name: /Do mais barato ao mais caro/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /JOGAR/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /2 jogadores/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Duelo online/ })).toBeEnabled();
  });

  it('Duelo online: a sala abre com CRIAR SALA e ENTRAR NA SALA, e avisa código errado', () => {
    abrir('/arena/duelo/online');
    expect(screen.getByRole('heading', { name: /DUELO ONLINE/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /CRIAR SALA/ })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/ENTRAR NA SALA/), { target: { value: '42' } });
    fireEvent.click(screen.getByRole('button', { name: /ENTRAR ▶/ }));
    expect(screen.getByRole('alert')).toHaveTextContent(/LEAO-42/);
  });

  it('Tribunal online fica no Tribunal: botão no Arcade e sala própria', () => {
    sessionStorage.setItem('coliseu.boot.vista', '1');
    abrir('/arena');
    expect(screen.getByRole('link', { name: /TRIBUNAL ONLINE/ })).toHaveAttribute('href', '/arena/tribunal/online');
    abrir('/arena/tribunal/online');
    expect(screen.getByRole('heading', { name: /TRIBUNAL ONLINE/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /CRIAR SALA/ })).toBeInTheDocument();
  });

  it('tutorial na primeira vez, golpes no toque e no teclado, e o polegar do César no fim das rodadas', () => {
    localStorage.removeItem('coliseu.tutorial.duelo');
    vi.useFakeTimers();
    try {
      abrir('/arena/duelo/jogar');
      fireEvent.click(screen.getByRole('button', { name: /PULAR/ }));
      fireEvent.click(screen.getByRole('button', { name: /LUTAR/ }));
      const dialogo = screen.getByRole('dialog', { name: /Como jogar: DUELO/ });
      fireEvent.click(within(dialogo).getByRole('button', { name: /PULAR/ }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      // Abertura como no Tribunal: o tema e a sua opinião; começa no ESTOU PRONTO e conta 3, 2, 1.
      expect(screen.getByRole('region', { name: 'Sua opinião' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /ESTOU PRONTO/ }));
      for (let i = 0; i < 9; i++) {
        act(() => {
          vi.advanceTimersByTime(900);
        });
      }
      expect(screen.getAllByRole('meter', { name: /Tribuna de/ })).toHaveLength(2);
      const botoes = within(screen.getByRole('region', { name: 'Suas cartas' })).getAllByRole('button');
      expect(botoes.length).toBeGreaterThanOrEqual(4);
      fireEvent.click(botoes.find((b) => !(b as HTMLButtonElement).disabled)!);
      // Rodadas de 1:30 e 1:30 e a Prorrogação de 20 s, com intervalos.
      for (let i = 0; i < 260; i++) {
        act(() => {
          vi.advanceTimersByTime(1000);
        });
      }
      expect(screen.getByText('O CÉSAR DECIDIU')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /JOGAR DE NOVO/ })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
