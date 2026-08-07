import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SaveLoader from '../src/components/SaveLoader';

describe('SaveLoader', () => {
  it('renders a file input with label', () => {
    const onFileLoad = vi.fn();
    render(<SaveLoader onFileLoad={onFileLoad} />);
    const input = screen.getByLabelText(/Upload Save File/i);
    expect(input).toBeDefined();
    expect(input.getAttribute('type')).toBe('file');
  });

  it('reads selected .sav file and calls onFileLoad with ArrayBuffer', async () => {
    const onFileLoad = vi.fn();
    render(<SaveLoader onFileLoad={onFileLoad} />);

    const input = screen.getByLabelText(/Upload Save File/i);
    
    // Create a mock binary file
    const fileContent = new Uint8Array([0x50, 0x4f, 0x4b, 0x45]); // "POKE"
    const file = new File([fileContent.buffer], 'pokemon_emerald.sav', { type: 'application/octet-stream' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onFileLoad).toHaveBeenCalledTimes(1);
    });

    const callArg = onFileLoad.mock.calls[0][0];
    expect(callArg).toBeInstanceOf(ArrayBuffer);
    expect(new Uint8Array(callArg)).toEqual(fileContent);
  });
});
