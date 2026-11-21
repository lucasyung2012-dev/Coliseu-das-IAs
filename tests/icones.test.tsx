import { render } from '@testing-library/react';
import Icone, { ICONES } from '@/ui/pixel/Icones';

/** Os ícones em pixel dos botões (no lugar dos emojis, pedido do Lucas em 22/11/2026). */
describe('ícones dos botões', () => {
  it.each(ICONES)('%s é desenhado (com contorno)', (nome) => {
    const { container } = render(<Icone nome={nome} />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('viewBox')).toBe('0 0 16 16');
    expect(container.querySelectorAll('rect').length).toBeGreaterThan(5);
  });
});
