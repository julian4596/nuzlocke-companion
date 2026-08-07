import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '@/App';

describe('App Component', () => {
  it('renders the title', () => {
    render(<App />);
    expect(screen.getByText('Nuzlocke Save Tracker')).toBeDefined();
  });

  it('renders SaveLoader component', () => {
    render(<App />);
    expect(screen.getByLabelText(/Upload Save File/i)).toBeDefined();
  });
});
