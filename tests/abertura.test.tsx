import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AberturaApp, { precisaAbertura } from '@/features/abertura/AberturaApp';

describe('Abertura do app', () => {
  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it('não aparece nos testes (nem para quem pede menos movimento)', () => {
    expect(precisaAbertura()).toBe(false);
  });

  it('PULAR fecha a abertura e lembra na sessão', () => {
    vi.useFakeTimers();
    const onFim = vi.fn();
    render(<AberturaApp onFim={onFim} />);
    expect(screen.getByRole('dialog', { name: /Abertura/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /PULAR/ }));
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(onFim).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('coliseu.abertura.vista')).toBe('1');
  });
});
