import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Sidebar from '@/components/Sidebar';

describe('Sidebar Component', () => {
  it('renders navigation buttons including Trainers & Caps button', () => {
    render(<Sidebar currentView="party" runId="123" currentGame="Emerald" />);

    expect(screen.getByText('Your Team')).toBeDefined();
    expect(screen.getByText('PC Boxes (1-13)')).toBeDefined();
    expect(screen.getByText('💀 Dead Pokémon')).toBeDefined();
    expect(screen.getByText('Trainers & Caps')).toBeDefined();
  });

  it('does not render Level Caps list at the bottom of sidebar', () => {
    render(<Sidebar currentView="party" runId="123" currentGame="Emerald" />);

    expect(screen.queryByText('Level Caps')).toBeNull();
  });
});
