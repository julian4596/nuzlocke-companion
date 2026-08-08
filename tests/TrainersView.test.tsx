import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrainersView, { TrainerCapGroup, Trainer } from '@/components/TrainersView';

describe('TrainersView Component', () => {
  it('renders "No trainers found" when trainers prop is empty', () => {
    render(<TrainersView trainers={[]} />);
    expect(screen.getByText(/No trainers found for this game/i)).toBeDefined();
  });

  it('renders grouped trainers with cap header and Pokémon stats', () => {
    const mockGroups: TrainerCapGroup[] = [
      {
        cap: 'Brock',
        level: '14',
        trainers: [
          {
            name: 'Lab Rival(Bulbasaur)',
            money: '80',
            route: 'Pallet Town',
            location: "Oak's Lab",
            team: [
              {
                species: 'Charmander',
                level: '5',
                moves: ['Scratch', 'Growl'],
                hp: '18',
                atk: '11',
                def: '9',
                spa: '11',
                spd: '10',
                spe: '9',
              },
            ],
          },
        ],
      },
    ];

    render(<TrainersView trainers={mockGroups} />);

    // Verify Cap Header
    expect(screen.getByText(/Brock/i)).toBeDefined();

    // Verify Trainer details
    expect(screen.getByText('Lab Rival(Bulbasaur)')).toBeDefined();
    expect(screen.getByText(/Pallet Town/i)).toBeDefined();
    expect(screen.getByText('Charmander')).toBeDefined();
    expect(screen.getByText('Lv. 5')).toBeDefined();

    // Verify Pokemon stats string
    expect(
      screen.getByText('HP 18 | Atk 11 | Def 9 | SpA 11 | SpD 10 | Spe 9')
    ).toBeDefined();
  });

  it('renders legacy flat trainers array gracefully under a default group', () => {
    const mockFlatTrainers: Trainer[] = [
      {
        name: 'Youngster Joey',
        money: '100',
        route: 'Route 30',
        location: '',
        team: [
          {
            species: 'Rattata',
            level: '4',
            moves: ['Tackle', 'Tail Whip'],
          },
        ],
      },
    ];

    render(<TrainersView trainers={mockFlatTrainers} />);

    expect(screen.getByText('Youngster Joey')).toBeDefined();
    expect(screen.getByText('Rattata')).toBeDefined();
    // No stats row should render if stats are missing
    expect(screen.queryByText(/HP/i)).toBeNull();
  });
});
