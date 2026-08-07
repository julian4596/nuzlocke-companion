import { describe, it, expect } from 'vitest';
import { GBASaveParser } from '@/lib/GBASaveParser';

describe('GBASaveParser', () => {
  it('should initialize and throw on invalid size', () => {
    const parser = new GBASaveParser();
    const badBuffer = new ArrayBuffer(100);
    expect(() => parser.parse(badBuffer)).toThrow('Invalid save file size');
  });

  it('should accept valid 128KB save file', () => {
    const parser = new GBASaveParser();
    const valid128kBuffer = new ArrayBuffer(131072);
    const result = parser.parse(valid128kBuffer);
    expect(result).toBeDefined();
    expect(result.trainerName).toBe('Player');
  });

  it('should accept valid 64KB save file', () => {
    const parser = new GBASaveParser();
    const valid64kBuffer = new ArrayBuffer(65536);
    const result = parser.parse(valid64kBuffer);
    expect(result).toBeDefined();
    expect(result.trainerName).toBe('Player');
  });
});
