import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
  it('renders the title', () => {
    render(<App />);
    expect(screen.getByText('Nuzlocke Save Tracker')).toBeDefined();
  });
});
