import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StarRating from './StarRating';

describe('StarRating', () => {
    it('renderiza el aria-label con la calificación', () => {
        render(<StarRating rating={4} />);
        expect(screen.getByRole('img', { name: 'Calificación 4.0 de 5' })).toBeInTheDocument();
    });

    it('muestra el valor cuando showValue es true y rating > 0', () => {
        render(<StarRating rating={3.5} showValue />);
        expect(screen.getByText('3.5')).toBeInTheDocument();
    });

    it('no muestra el valor si rating es 0', () => {
        render(<StarRating rating={0} showValue />);
        expect(screen.queryByText('0.0')).not.toBeInTheDocument();
    });

    it('renderiza span (no interactivo) cuando no se pasa onRate', () => {
        render(<StarRating rating={5} />);
        const container = screen.getByRole('img').firstChild;
        expect(container?.nodeName).not.toBe('BUTTON');
    });

    it('es interactivo cuando se pasa onRate y dispara la calificación al hacer clic', async () => {
        const user = userEvent.setup();
        const onRate = vi.fn();
        render(<StarRating rating={0} onRate={onRate} />);

        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(5);

        await user.click(buttons[2]);
        expect(onRate).toHaveBeenCalledWith(3);
    });
});