import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '@/App';

describe('App Component', () => {
  it('renders the title', () => {
    render(<App />);
    expect(screen.getByText(/Nuzlocke/i)).toBeDefined();
  });

  it('renders SaveLoader component', () => {
    render(<App />);
    expect(screen.getByLabelText(/Upload Save File/i)).toBeDefined();
  });

  it('renders uploaded team data', async () => {
    render(<App />);
    const input = screen.getByLabelText(/Upload Save File/i);
    
    // Create a mock 128KB valid save buffer with 1 pokemon
    const SECTION_SIZE = 4096;
    const buffer = new ArrayBuffer(131072);
    const view = new DataView(buffer);
    // Active save A
    view.setUint32(0x0FFC, 1, true);
    // Section 1 at block 1
    view.setUint16(SECTION_SIZE + 0x0FF4, 1, true);
    // Party count
    view.setUint32(SECTION_SIZE + 0x0234, 1, true);
    // Pokemon PID
    view.setUint32(SECTION_SIZE + 0x0238, 0x99887766, true);
    
    const file = new File([new Uint8Array(buffer)], 'test.sav', { type: 'application/octet-stream' });
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/2575857510/i)).toBeDefined();
    });
  });

  it('navigates to Guides view and renders grouped trainers with stats', async () => {
    render(<App />);
    const input = screen.getByLabelText(/Upload Save File/i);
    
    const SECTION_SIZE = 4096;
    const buffer = new ArrayBuffer(131072);
    const view = new DataView(buffer);
    view.setUint32(0x0FFC, 1, true);
    // Section 0 at offset 0 (for game version detection FRLG)
    view.setUint16(0x0FF4, 0, true);
    view.setUint32(0x00AC, 1, true);
    // Section 1 at offset SECTION_SIZE (for team parsing)
    view.setUint16(SECTION_SIZE + 0x0FF4, 1, true);
    view.setUint32(SECTION_SIZE + 0x0234, 1, true);
    view.setUint32(SECTION_SIZE + 0x0238, 0x99887766, true);

    const file = new File([new Uint8Array(buffer)], 'test.sav', { type: 'application/octet-stream' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getAllByText(/Your Team/i).length).toBeGreaterThan(0);
    });

    const guidesButton = screen.getByRole('button', { name: /Trainers & Caps/i });
    fireEvent.click(guidesButton);

    await waitFor(() => {
      expect(screen.getByText(/Trainers Guide/i)).toBeDefined();
      expect(screen.getByText(/Cap: Brock/i)).toBeDefined();
      expect(screen.getByText(/Lab Rival\(Bulbasaur\)/i)).toBeDefined();
      expect(screen.getByText(/HP 18 \| Atk 11 \| Def 9 \| SpA 11 \| SpD 10 \| Spe 9/i)).toBeDefined();
    });
  });
});


