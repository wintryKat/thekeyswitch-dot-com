import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SwitchComparisonTable from '../SwitchComparisonTable';
import type { KeySwitch } from '@/lib/graphql/types';

const switch1: KeySwitch = {
  id: '1',
  name: 'Cherry MX Red',
  manufacturer: 'Cherry',
  type: 'linear',
  actuationForceGf: 45,
  bottomOutForceGf: 75,
  preTravelMm: 2.0,
  totalTravelMm: 4.0,
  springType: 'Coil',
  stemMaterial: 'POM',
  housingMaterial: 'Nylon',
  priceUsd: 0.35,
  tags: [],
};

const switch2: KeySwitch = {
  id: '2',
  name: 'Gateron Yellow',
  manufacturer: 'Gateron',
  type: 'linear',
  actuationForceGf: 50,
  bottomOutForceGf: 65,
  preTravelMm: 2.0,
  totalTravelMm: 4.0,
  tags: [],
};

describe('SwitchComparisonTable', () => {
  it('returns null for empty switches array', () => {
    const { container } = render(<SwitchComparisonTable switches={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders switch names as column headers', () => {
    render(<SwitchComparisonTable switches={[switch1, switch2]} />);
    expect(screen.getByText('Cherry MX Red')).toBeInTheDocument();
    expect(screen.getByText('Gateron Yellow')).toBeInTheDocument();
  });

  it('renders specification row labels', () => {
    render(<SwitchComparisonTable switches={[switch1]} />);
    expect(screen.getByText('Manufacturer')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Actuation Force')).toBeInTheDocument();
    expect(screen.getByText('Bottom-out Force')).toBeInTheDocument();
    expect(screen.getByText('Pre-travel')).toBeInTheDocument();
    expect(screen.getByText('Total Travel')).toBeInTheDocument();
    expect(screen.getByText('Spring')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
  });

  it('shows formatted spec values', () => {
    render(<SwitchComparisonTable switches={[switch1]} />);
    expect(screen.getByText('Cherry')).toBeInTheDocument();
    expect(screen.getByText('Linear')).toBeInTheDocument();
    expect(screen.getByText('45gf')).toBeInTheDocument();
    expect(screen.getByText('75gf')).toBeInTheDocument();
    expect(screen.getByText('$0.35')).toBeInTheDocument();
  });

  it('shows dash for missing values', () => {
    render(<SwitchComparisonTable switches={[switch2]} />);
    // switch2 has no springType, stemMaterial, housingMaterial, priceUsd, soundProfile
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('renders a table element', () => {
    render(<SwitchComparisonTable switches={[switch1]} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
