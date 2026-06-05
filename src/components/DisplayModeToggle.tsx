import { HourglassEmpty, Timer } from '@mui/icons-material';
import React from 'react';
import { ToggleIconButton } from './ToggleIconButton';

export interface DisplayModeToggleProps {
  value: 'number' | 'hourglass';
  onChange: (mode: 'number' | 'hourglass') => void;
}

export const DisplayModeToggle: React.FC<DisplayModeToggleProps> = ({
  value,
  onChange,
}) => {
  return (
    <ToggleIconButton<'number' | 'hourglass'>
      value={value}
      onChange={onChange}
      states={[
        {
          value: 'hourglass',
          icon: <HourglassEmpty fontSize="small" />,
          tooltip: 'Switch to hourglass display.',
          ariaLabel: 'Switch to hourglass display',
        },
        {
          value: 'number',
          icon: <Timer fontSize="small" />,
          tooltip: 'Switch to numeric MM:SS display.',
          ariaLabel: 'Switch to numeric display',
        },
      ]}
    />
  );
};
