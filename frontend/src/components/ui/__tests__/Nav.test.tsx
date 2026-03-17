import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Nav from '../Nav';

let mockPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

// Mock ThemeToggle to simplify Nav tests
vi.mock('../ThemeToggle', () => ({
  default: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}));

describe('Nav', () => {
  beforeEach(() => {
    mockPathname = '/';
  });

  it('renders all navigation links', () => {
    render(<Nav />);
    expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('About').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Résumé').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Blog').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Switches').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Weather').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Contact').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the site name link', () => {
    render(<Nav />);
    expect(screen.getByText('The Key Switch')).toBeInTheDocument();
  });

  it('contains ThemeToggle', () => {
    render(<Nav />);
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('mobile menu toggles open and close', async () => {
    render(<Nav />);
    const hamburger = screen.getByRole('button', { name: /open navigation menu/i });
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(hamburger);
    expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    expect(hamburger).toHaveAccessibleName(/close navigation menu/i);

    await userEvent.click(hamburger);
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    expect(hamburger).toHaveAccessibleName(/open navigation menu/i);
  });
});
