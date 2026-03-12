import { describe, it, expect } from 'vitest';
import { formatBytes, formatUptime, formatBytesPerSec } from '../utils';

describe('formatBytes', () => {
  it('returns "0 B" for 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats bytes in B range', () => {
    expect(formatBytes(500)).toBe('500 B');
  });

  it('formats bytes in KB range', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('formats bytes in MB range', () => {
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(5242880)).toBe('5 MB');
  });

  it('formats bytes in GB range', () => {
    expect(formatBytes(1073741824)).toBe('1 GB');
    expect(formatBytes(2147483648)).toBe('2 GB');
  });

  it('formats bytes in TB range', () => {
    expect(formatBytes(1099511627776)).toBe('1 TB');
  });
});

describe('formatUptime', () => {
  it('formats seconds as minutes only', () => {
    expect(formatUptime(120)).toBe('2m');
    expect(formatUptime(0)).toBe('0m');
    expect(formatUptime(59)).toBe('0m');
  });

  it('formats with hours and minutes', () => {
    expect(formatUptime(3600)).toBe('1h 0m');
    expect(formatUptime(3660)).toBe('1h 1m');
    expect(formatUptime(7200)).toBe('2h 0m');
  });

  it('formats with days, hours and minutes', () => {
    expect(formatUptime(86400)).toBe('1d 0h 0m');
    expect(formatUptime(90061)).toBe('1d 1h 1m');
    expect(formatUptime(172800)).toBe('2d 0h 0m');
  });
});

describe('formatBytesPerSec', () => {
  it('appends /s to formatted bytes', () => {
    expect(formatBytesPerSec(0)).toBe('0 B/s');
    expect(formatBytesPerSec(1024)).toBe('1 KB/s');
    expect(formatBytesPerSec(1048576)).toBe('1 MB/s');
  });
});
