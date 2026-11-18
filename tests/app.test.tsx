import { fireEvent, render, screen } from '@testing-library/react';
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
});
