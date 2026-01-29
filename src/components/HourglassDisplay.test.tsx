import { ThemeProvider } from '@mui/material/styles';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { shadowdarkTheme } from '../theme/shadowdarkTheme';
import { HourglassDisplay } from './HourglassDisplay';

const defaultProps = {
  progress: 0.5,
  isRunning: false,
  isLowTime: false,
  isCriticalTime: false,
  isCompleted: false,
};

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={shadowdarkTheme}>{ui}</ThemeProvider>);
}

describe('HourglassDisplay', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders without crashing', () => {
    renderWithTheme(<HourglassDisplay {...defaultProps} />);
    expect(screen.getByRole('img', { name: 'Hourglass timer' })).toBeInTheDocument();
  });

  it('renders at progress 0 without crashing', () => {
    renderWithTheme(<HourglassDisplay {...defaultProps} progress={0} />);
    expect(screen.getByRole('img', { name: 'Hourglass timer' })).toBeInTheDocument();
  });

  it('renders at progress 0.5 without crashing', () => {
    renderWithTheme(<HourglassDisplay {...defaultProps} progress={0.5} />);
    expect(screen.getByRole('img', { name: 'Hourglass timer' })).toBeInTheDocument();
  });

  it('renders at progress 1 without crashing', () => {
    renderWithTheme(<HourglassDisplay {...defaultProps} progress={1} />);
    expect(screen.getByRole('img', { name: 'Hourglass timer' })).toBeInTheDocument();
  });

  it('renders when completed', () => {
    renderWithTheme(<HourglassDisplay {...defaultProps} progress={0} isCompleted />);
    expect(screen.getByRole('img', { name: 'Hourglass timer' })).toBeInTheDocument();
  });

  it('renders when running without crashing', () => {
    renderWithTheme(<HourglassDisplay {...defaultProps} isRunning />);
    expect(screen.getByRole('img', { name: 'Hourglass timer' })).toBeInTheDocument();
  });
});
