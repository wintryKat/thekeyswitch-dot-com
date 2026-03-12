import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '../Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card><p>Card content</p></Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    render(<Card><span>Inside</span></Card>);
    const el = screen.getByText('Inside').parentElement;
    expect(el?.tagName).toBe('DIV');
  });

  it('applies custom className', () => {
    render(<Card className="extra-class"><span>Test</span></Card>);
    const el = screen.getByText('Test').parentElement;
    expect(el?.className).toContain('extra-class');
  });
});
