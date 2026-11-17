import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';

describe('App', () => {
  it('mostra os três portais na tela inicial', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Coliseu das IAs' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Imperium Arcade/ })).toHaveAttribute('href', '/arena');
    expect(screen.getByRole('link', { name: /Ludus/ })).toHaveAttribute('href', '/ludus');
    expect(screen.getByRole('link', { name: /Coliseu/ })).toHaveAttribute('href', '/coliseu');
  });

  it('abre a tela provisória do Arcade', () => {
    render(
      <MemoryRouter initialEntries={['/arena']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/chega na Etapa 1/)).toBeInTheDocument();
  });
});
