import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SwitchCard from '../SwitchCard';
import type { KeySwitch } from '@/lib/graphql/types';

const baseSw: KeySwitch = {
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
  tags: ['gaming'],
};

describe('SwitchCard', () => {
  it('renders switch name and manufacturer', () => {
    render(
      <SwitchCard sw={baseSw} isSelected={false} onToggle={() => {}} disabled={false} />,
    );
    expect(screen.getByText('Cherry MX Red')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('shows type badge', () => {
    render(
      <SwitchCard sw={baseSw} isSelected={false} onToggle={() => {}} disabled={false} />,
    );
    expect(screen.getByText('Linear')).toBeInTheDocument();
  });

  it('shows spec values', () => {
    render(
      <SwitchCard sw={baseSw} isSelected={false} onToggle={() => {}} disabled={false} />,
    );
    expect(screen.getByText('45gf')).toBeInTheDocument();
    expect(screen.getByText('75gf')).toBeInTheDocument();
    expect(screen.getByText('4mm')).toBeInTheDocument();
    expect(screen.getByText('2mm')).toBeInTheDocument();
  });

  it('shows material info', () => {
    render(
      <SwitchCard sw={baseSw} isSelected={false} onToggle={() => {}} disabled={false} />,
    );
    expect(screen.getByText('Coil')).toBeInTheDocument();
    expect(screen.getByText('POM')).toBeInTheDocument();
    expect(screen.getByText('Nylon')).toBeInTheDocument();
  });

  it('shows price', () => {
    render(
      <SwitchCard sw={baseSw} isSelected={false} onToggle={() => {}} disabled={false} />,
    );
    expect(screen.getByText('~$0.35/switch')).toBeInTheDocument();
  });

  it('compare checkbox calls onToggle', async () => {
    const onToggle = vi.fn();
    render(
      <SwitchCard sw={baseSw} isSelected={false} onToggle={onToggle} disabled={false} />,
    );
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);
    expect(onToggle).toHaveBeenCalledWith('1');
  });

  it('compare checkbox is checked when selected', () => {
    render(
      <SwitchCard sw={baseSw} isSelected={true} onToggle={() => {}} disabled={false} colorIndex={0} />,
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('shows Unknown type for unrecognized switch types', () => {
    const unknownSw = { ...baseSw, type: 'exotic' };
    render(
      <SwitchCard sw={unknownSw} isSelected={false} onToggle={() => {}} disabled={false} />,
    );
    expect(screen.getByText('exotic')).toBeInTheDocument();
  });
});
