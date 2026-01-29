import { HourglassEmpty, Timer } from '@mui/icons-material';
import React from 'react';
import { TwoIconToggleGroup } from './TwoIconToggleGroup';

export interface DisplayModeToggleProps {
  value: 'number' | 'hourglass';
  onChange: (mode: 'number' | 'hourglass') => void;
}

export const DisplayModeToggle: React.FC<DisplayModeToggleProps> = ({
  value,
  onChange,
}) => {
  return (
    <TwoIconToggleGroup<'number' | 'hourglass'>
      ariaLabel="Display mode"
      value={value}
      onChange={onChange}
      options={[
        {
          value: 'hourglass',
          ariaLabel: 'Hourglass display',
          tooltip: 'Show an hourglass animation (no numeric timer).',
          icon: <HourglassEmpty fontSize="small" />,
        },
        {
          value: 'number',
          ariaLabel: 'Numeric display',
          tooltip: 'Show remaining time as MM:SS.',
          icon: <Timer fontSize="small" />,
        },
      ]}
    />
  );
};
