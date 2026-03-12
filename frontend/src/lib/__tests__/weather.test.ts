import { describe, it, expect } from 'vitest';
import { getWeatherDescription, getWeatherEmoji } from '../weather';

describe('getWeatherDescription', () => {
  it('returns correct description for clear sky', () => {
    expect(getWeatherDescription(0)).toBe('Clear sky');
  });

  it('returns correct description for common codes', () => {
    expect(getWeatherDescription(1)).toBe('Mainly clear');
    expect(getWeatherDescription(2)).toBe('Partly cloudy');
    expect(getWeatherDescription(3)).toBe('Overcast');
    expect(getWeatherDescription(45)).toBe('Fog');
    expect(getWeatherDescription(61)).toBe('Slight rain');
    expect(getWeatherDescription(71)).toBe('Slight snow');
    expect(getWeatherDescription(95)).toBe('Thunderstorm');
  });

  it('returns "Unknown" for unrecognized codes', () => {
    expect(getWeatherDescription(999)).toBe('Unknown');
    expect(getWeatherDescription(-1)).toBe('Unknown');
  });
});

describe('getWeatherEmoji', () => {
  it('returns sun for clear sky during day', () => {
    expect(getWeatherEmoji(0, true)).toBe('\u2600\uFE0F');
  });

  it('returns moon for clear sky at night', () => {
    expect(getWeatherEmoji(0, false)).toBe('\uD83C\uDF19');
  });

  it('returns partly cloudy emoji for codes 1-3 during day', () => {
    expect(getWeatherEmoji(1, true)).toBe('\u26C5');
    expect(getWeatherEmoji(2, true)).toBe('\u26C5');
    expect(getWeatherEmoji(3, true)).toBe('\u26C5');
  });

  it('returns cloud emoji for codes 1-3 at night', () => {
    expect(getWeatherEmoji(1, false)).toBe('\u2601\uFE0F');
  });

  it('returns fog emoji for codes 4-48', () => {
    expect(getWeatherEmoji(45, true)).toBe('\uD83C\uDF2B\uFE0F');
    expect(getWeatherEmoji(48, false)).toBe('\uD83C\uDF2B\uFE0F');
  });

  it('returns rain emoji for codes 61-65', () => {
    expect(getWeatherEmoji(61, true)).toBe('\uD83C\uDF27\uFE0F');
    expect(getWeatherEmoji(65, false)).toBe('\uD83C\uDF27\uFE0F');
  });

  it('returns snow emoji for codes 71-75', () => {
    expect(getWeatherEmoji(71, true)).toBe('\uD83C\uDF28\uFE0F');
  });

  it('returns thunderstorm emoji for codes above 82', () => {
    expect(getWeatherEmoji(95, true)).toBe('\u26C8\uFE0F');
    expect(getWeatherEmoji(99, false)).toBe('\u26C8\uFE0F');
  });
});
