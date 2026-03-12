import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('renders as a span element', () => {
    render(<Badge>Label</Badge>);
    const el = screen.getByText('Label');
    expect(el.tagName).toBe('SPAN');
  });

  it('applies custom className', () => {
    render(<Badge className="my-custom">Content</Badge>);
    const el = screen.getByText('Content');
    expect(el.className).toContain('my-custom');
  });

  it('renders with different variants without crashing', () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>);
    expect(screen.getByText('Default')).toBeInTheDocument();

    rerender(<Badge variant="accent">Accent</Badge>);
    expect(screen.getByText('Accent')).toBeInTheDocument();

    rerender(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toBeInTheDocument();

    rerender(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });
});
