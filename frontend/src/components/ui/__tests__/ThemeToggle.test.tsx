import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '../ThemeToggle';

const mockToggleTheme = vi.fn();
let mockTheme: string | undefined = undefined;

vi.mock('../ThemeProvider', () => ({
  useTheme: () => ({
    theme: mockTheme,
    toggleTheme: mockToggleTheme,
  }),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockTheme = undefined;
    mockToggleTheme.mockClear();
  });

  it('renders nothing when theme is undefined', () => {
    mockTheme = undefined;
    const { container } = render(<ThemeToggle />);
    expect(container.innerHTML).toBe('');
  });

  it('renders a button in dark mode with "Switch to light mode" label', () => {
    mockTheme = 'dark';
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /switch to light mode/i });
    expect(button).toBeInTheDocument();
  });

  it('renders a button in light mode with "Switch to dark mode" label', () => {
    mockTheme = 'light';
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(button).toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', async () => {
    mockTheme = 'dark';
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
