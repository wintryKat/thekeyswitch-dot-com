import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer', () => {
  it('renders copyright with current year', () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
    expect(screen.getByText(/The Key Switch/)).toBeInTheDocument();
  });

  it('contains a GitHub link', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: /github/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://github.com/wintryKat/thekeyswitch-dot-com');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
