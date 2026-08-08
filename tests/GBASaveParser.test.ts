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

describe('GBASaveParser Save Slot Detection', () => {
  it('should identify the correct active save offset', () => {
    // Create a mock 64KB buffer
    const buffer = new ArrayBuffer(65536);
    const view = new DataView(buffer);
    
    // Save A: Section 0 at 0x0000, Save Index at 0x0FFC = 5
    view.setUint32(0x0FFC, 5, true); // Little endian
    
    // Save B: Section 0 at 0xE000, Save Index at 0xEFFC = 10 (Most recent)
    view.setUint32(0xE000 + 0x0FFC, 10, true);
    
    const parser = new GBASaveParser();
    const offset = parser.findActiveSaveOffset(buffer);
    
    expect(offset).toBe(0xE000);
  });

  it('should return 0x0000 when Save A has a higher save index', () => {
    const buffer = new ArrayBuffer(65536);
    const view = new DataView(buffer);
    
    // Save A: Section 0 at 0x0000, Save Index at 0x0FFC = 15
    view.setUint32(0x0FFC, 15, true);
    
    // Save B: Section 0 at 0xE000, Save Index at 0xEFFC = 10
    view.setUint32(0xE000 + 0x0FFC, 10, true);
    
    const parser = new GBASaveParser();
    const offset = parser.findActiveSaveOffset(buffer);
    
    expect(offset).toBe(0x0000);
  });
});

