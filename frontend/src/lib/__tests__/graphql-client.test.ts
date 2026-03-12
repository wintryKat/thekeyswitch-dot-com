import { describe, it, expect } from 'vitest';
import { getServerClient, getPublicUrl } from '../graphql/client';

describe('getPublicUrl', () => {
  it('returns the public GraphQL URL', () => {
    const url = getPublicUrl();
    expect(typeof url).toBe('string');
    expect(url).toContain('graphql');
  });
});

describe('getServerClient', () => {
  it('returns a GraphQLClient instance', () => {
    const client = getServerClient();
    expect(client).toBeDefined();
    expect(typeof client.request).toBe('function');
  });

  it('returns a client with request method when given a token', () => {
    const client = getServerClient('test-token');
    expect(client).toBeDefined();
    expect(typeof client.request).toBe('function');
  });
});
