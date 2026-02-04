import { Box } from '@mui/material';
import React from 'react';
import { DisplayModeToggle } from './DisplayModeToggle';

export interface PlayerControlsProps {
  displayMode: 'number' | 'hourglass' | 'torch';
  onDisplayModeChange: (mode: 'number' | 'hourglass' | 'torch') => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  displayMode,
  onDisplayModeChange,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <DisplayModeToggle value={displayMode} onChange={onDisplayModeChange} />
    </Box>
  );
};
