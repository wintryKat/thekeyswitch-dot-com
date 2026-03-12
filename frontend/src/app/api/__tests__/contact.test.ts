import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/server before importing the route
vi.mock('next/server', () => {
  class MockNextRequest {
    private _body: string;
    private _headers: Map<string, string>;

    constructor(url: string, init?: { method?: string; body?: string; headers?: Record<string, string> }) {
      this._body = init?.body || '';
      this._headers = new Map(Object.entries(init?.headers || {}));
    }

    get headers() {
      return {
        get: (key: string) => this._headers.get(key) ?? null,
      };
    }

    async json() {
      return JSON.parse(this._body);
    }
  }

  class MockNextResponse {
    static json(body: unknown, init?: { status?: number }) {
      return {
        status: init?.status ?? 200,
        body,
        async json() {
          return body;
        },
      };
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
  };
});

// Import after mocks
const { POST } = await import('../contact/route');
const { NextRequest } = await import('next/server');

function createRequest(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    // Reset rate limit map between tests by dynamically re-importing would be complex,
    // so we just ensure tests don't hit the rate limit by using different IPs
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('returns success for valid submission', async () => {
    const req = createRequest(
      { name: 'Alice', email: 'alice@example.com', message: 'Hello!' },
      { 'x-forwarded-for': '1.1.1.1' },
    );
    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toBe('Message received. Thank you!');
  });

  it('returns error for missing name', async () => {
    const req = createRequest(
      { name: '', email: 'a@b.com', message: 'Hello' },
      { 'x-forwarded-for': '2.2.2.2' },
    );
    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toBe('All fields are required.');
    expect(res.status).toBe(400);
  });

  it('returns error for missing email', async () => {
    const req = createRequest(
      { name: 'Bob', email: '', message: 'Hello' },
      { 'x-forwarded-for': '3.3.3.3' },
    );
    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('returns error for invalid email format', async () => {
    const req = createRequest(
      { name: 'Bob', email: 'not-an-email', message: 'Hello' },
      { 'x-forwarded-for': '4.4.4.4' },
    );
    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toBe('Please provide a valid email address.');
    expect(res.status).toBe(400);
  });

  it('silently succeeds when honeypot is filled (bot detection)', async () => {
    const req = createRequest(
      { name: 'Bot', email: 'bot@spam.com', message: 'Buy now!', website: 'http://spam.com' },
      { 'x-forwarded-for': '5.5.5.5' },
    );
    const res = await POST(req);
    const json = await res.json();
    // Returns success but does nothing
    expect(json.success).toBe(true);
    expect(json.message).toBe('Message received. Thank you!');
  });

  it('rate limits after too many requests from same IP', async () => {
    const ip = '9.9.9.9';
    // Send 6 requests (limit is 5)
    for (let i = 0; i < 5; i++) {
      const req = createRequest(
        { name: 'User', email: 'user@test.com', message: 'Hello' },
        { 'x-forwarded-for': ip },
      );
      await POST(req);
    }

    const req = createRequest(
      { name: 'User', email: 'user@test.com', message: 'Hello' },
      { 'x-forwarded-for': ip },
    );
    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toContain('Too many requests');
    expect(res.status).toBe(429);
  });
});
