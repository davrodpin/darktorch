import { HourglassEmpty, LocalFireDepartment, Timer } from '@mui/icons-material';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import React from 'react';

export interface DisplayModeToggleProps {
  value: 'number' | 'hourglass' | 'torch';
  onChange: (mode: 'number' | 'hourglass' | 'torch') => void;
}

export const DisplayModeToggle: React.FC<DisplayModeToggleProps> = ({
  value,
  onChange,
}) => {
  return (
    <ToggleButtonGroup
      size="small"
      value={value}
      exclusive
      onChange={(_event, nextValue: 'number' | 'hourglass' | 'torch' | null) => {
        if (!nextValue) return;
        onChange(nextValue);
      }}
      aria-label="Display mode"
      sx={{
        '& .MuiToggleButton-root': {
          backgroundColor: 'white !important',
          color: 'black !important',
          border: '1px solid black !important',
          '&:hover': {
            backgroundColor: 'white !important',
          },
          '&.Mui-selected': {
            backgroundColor: 'black !important',
            color: 'white !important',
            '&:hover': {
              backgroundColor: 'black !important',
            },
          },
        },
      }}
    >
      <ToggleButton
        value="hourglass"
        aria-label="Hourglass display"
        sx={{
          backgroundColor: value === 'hourglass' ? 'black' : 'white',
          color: value === 'hourglass' ? 'white' : 'black',
          border: '1px solid black',
          padding: '4px 8px',
          minWidth: 0,
          '&:hover': {
            backgroundColor: value === 'hourglass' ? 'black' : 'white',
          },
          '& .MuiSvgIcon-root, & svg': {
            color: 'inherit',
            fill: 'currentColor',
            fontSize: '1.1rem',
          },
        }}
      >
        <Tooltip title="Show an hourglass animation (no numeric timer)." placement="top">
          <span style={{ display: 'inline-flex' }}>
            <HourglassEmpty fontSize="small" />
          </span>
        </Tooltip>
      </ToggleButton>

      <ToggleButton
        value="torch"
        aria-label="Torch display"
        sx={{
          backgroundColor: value === 'torch' ? 'black' : 'white',
          color: value === 'torch' ? 'white' : 'black',
          border: '1px solid black',
          padding: '4px 8px',
          minWidth: 0,
          '&:hover': {
            backgroundColor: value === 'torch' ? 'black' : 'white',
          },
          '& .MuiSvgIcon-root, & svg': {
            color: 'inherit',
            fill: 'currentColor',
            fontSize: '1.1rem',
          },
        }}
      >
        <Tooltip title="Show a torch that burns down (no numeric timer)." placement="top">
          <span style={{ display: 'inline-flex' }}>
            <LocalFireDepartment fontSize="small" />
          </span>
        </Tooltip>
      </ToggleButton>

      <ToggleButton
        value="number"
        aria-label="Numeric display"
        sx={{
          backgroundColor: value === 'number' ? 'black' : 'white',
          color: value === 'number' ? 'white' : 'black',
          border: '1px solid black',
          padding: '4px 8px',
          minWidth: 0,
          '&:hover': {
            backgroundColor: value === 'number' ? 'black' : 'white',
          },
          '& .MuiSvgIcon-root, & svg': {
            color: 'inherit',
            fill: 'currentColor',
            fontSize: '1.1rem',
          },
        }}
      >
        <Tooltip title="Show remaining time as MM:SS." placement="top">
          <span style={{ display: 'inline-flex' }}>
            <Timer fontSize="small" />
          </span>
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
