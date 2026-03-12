import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactPage from '../contact/page';

describe('ContactPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders form fields', () => {
    render(<ContactPage />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<ContactPage />);
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('honeypot field is hidden', () => {
    render(<ContactPage />);
    const honeypot = screen.getByLabelText(/website/i);
    // The parent div has absolute positioning off-screen
    const parent = honeypot.closest('[aria-hidden="true"]');
    expect(parent).toBeInTheDocument();
  });

  it('shows success message on successful submit', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, message: 'Message received. Thank you!' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(<ContactPage />);
    await userEvent.type(screen.getByLabelText(/^name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/message/i), 'Hello there');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText('Message received. Thank you!')).toBeInTheDocument();
  });

  it('shows error message on failed submit', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ success: false, message: 'All fields are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(<ContactPage />);
    await userEvent.type(screen.getByLabelText(/^name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/message/i), 'Hello');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText('All fields are required.')).toBeInTheDocument();
  });

  it('shows generic error on network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    render(<ContactPage />);
    await userEvent.type(screen.getByLabelText(/^name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/message/i), 'Hello');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument();
  });
});
