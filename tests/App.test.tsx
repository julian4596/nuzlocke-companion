import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '@/App';
import * as fs from 'fs';
import * as path from 'path';

describe('App Component', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('renders the title on start screen', () => {
    render(<App />);
    expect(screen.getByText(/Pokémon NUZLOCKE tracker/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Load Game/i })).toBeDefined();
  });

  it('navigates to Load Game and imports a save file', async () => {
    render(<App />);
    const loadGameBtn = screen.getByRole('button', { name: /Load Game/i });
    fireEvent.click(loadGameBtn);

    await waitFor(() => {
      expect(screen.getByText(/Import saved game/i)).toBeDefined();
    });

    const importBtn = screen.getByText(/Import saved game/i);
    fireEvent.click(importBtn);

    await waitFor(() => {
      expect(screen.getByLabelText(/Upload Save File/i)).toBeDefined();
    });

    const fixturePath = path.resolve(__dirname, 'fixtures/Pokemon Blaze Black v3.1 - Complete.sav');
    const buffer = fs.readFileSync(fixturePath);
    const file = new File([buffer], 'Pokemon Blaze Black v3.1 - Complete.sav', { type: 'application/octet-stream' });
    
    const fileInput = screen.getByLabelText(/Upload Save File/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/e.g., FireRed Hardcore Nuzlocke/i)).toBeDefined();
    });

    const nameInput = screen.getByPlaceholderText(/e.g., FireRed Hardcore Nuzlocke/i);
    fireEvent.change(nameInput, { target: { value: 'Julian Blaze Black' } });

    const saveRunBtn = screen.getByRole('button', { name: /Save Run/i });
    fireEvent.click(saveRunBtn);

    await waitFor(() => {
      expect(screen.getByText(/Julian Blaze Black/i)).toBeDefined();
    });
  });

  it('loads a Blaze Black save and navigates through Party, PC Storage, and Graveyard', async () => {
    render(<App />);
    
    // Navigate to load game
    const loadGameBtn = screen.getByRole('button', { name: /Load Game/i });
    fireEvent.click(loadGameBtn);

    await waitFor(() => {
      expect(screen.getByText(/Import saved game/i)).toBeDefined();
    });

    // Import Blaze Black Ricky save
    const importBtn = screen.getByText(/Import saved game/i);
    fireEvent.click(importBtn);

    const fixturePath = path.resolve(__dirname, 'fixtures/Pokemon Blaze Black v3.1 - Complete Ricky.sav');
    const buffer = fs.readFileSync(fixturePath);
    const file = new File([buffer], 'Pokemon Blaze Black v3.1 - Complete Ricky.sav', { type: 'application/octet-stream' });
    
    const fileInput = screen.getByLabelText(/Upload Save File/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/e.g., FireRed Hardcore Nuzlocke/i)).toBeDefined();
    });

    const nameInput = screen.getByPlaceholderText(/e.g., FireRed Hardcore Nuzlocke/i);
    fireEvent.change(nameInput, { target: { value: 'Ricky Run' } });

    const saveRunBtn = screen.getByRole('button', { name: /Save Run/i });
    fireEvent.click(saveRunBtn);

    await waitFor(() => {
      expect(screen.getByText(/Ricky Run/i)).toBeDefined();
    });

    // Click on the imported run to load it
    const runCard = screen.getByText(/Ricky Run/i);
    fireEvent.click(runCard);

    // Verify Party view is shown with team members
    await waitFor(() => {
      expect(screen.getAllByText(/Your Team/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/PANPAN/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/STARTRET/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/PATO/i).length).toBeGreaterThan(0);
    });

    // Navigate to PC Storage
    const pcStorageLink = screen.getByText(/PC Boxes \(1-13\)/i);
    fireEvent.click(pcStorageLink);

    await waitFor(() => {
      expect(screen.getAllByText(/PC Storage/i).length).toBeGreaterThan(0);
      // TEWOTT should be in PC storage
      expect(screen.getAllByText(/TEWOTT/i).length).toBeGreaterThan(0);
    });

    // Navigate to Graveyard
    const graveyardLink = screen.getByText(/💀 Dead Pokémon/i);
    fireEvent.click(graveyardLink);

    await waitFor(() => {
      expect(screen.getByText(/Set Up Your Graveyard/i)).toBeDefined();
    });

    // Select Box 8 as graveyard
    const box8Btn = screen.getByRole('button', { name: /Box 8/i });
    fireEvent.click(box8Btn);

    const saveGraveyardBtn = screen.getByRole('button', { name: /Save Graveyard/i });
    fireEvent.click(saveGraveyardBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/💀 Graveyard/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/TEWOTT/i).length).toBeGreaterThan(0);
    });
  });
});
