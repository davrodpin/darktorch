import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import React from 'react';

type TwoIconToggleOption<T extends string> = {
  value: T;
  ariaLabel: string;
  tooltip: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

export type TwoIconToggleGroupProps<T extends string> = {
  ariaLabel: string;
  value: T;
  onChange?: (value: T) => void;
  disabled?: boolean;
  options: [TwoIconToggleOption<T>, TwoIconToggleOption<T>];
};

export function TwoIconToggleGroup<T extends string>({
  ariaLabel,
  value,
  onChange,
  disabled,
  options,
}: TwoIconToggleGroupProps<T>) {
  return (
    <ToggleButtonGroup
      size="small"
      value={value}
      exclusive
      onChange={(_event, nextValue: T | null) => {
        if (!nextValue) return;
        onChange?.(nextValue);
      }}
      disabled={disabled}
      aria-label={ariaLabel}
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
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <ToggleButton
            key={opt.value}
            value={opt.value}
            aria-label={opt.ariaLabel}
            disabled={opt.disabled}
            onClick={opt.onClick}
            sx={{
              backgroundColor: selected ? 'black' : 'white',
              color: selected ? 'white' : 'black',
              border: '1px solid black',
              padding: '4px 8px',
              minWidth: 0,
              '&:hover': {
                backgroundColor: selected ? 'black' : 'white',
              },
              '& .MuiSvgIcon-root, & svg': {
                color: 'inherit',
                fill: 'currentColor',
                fontSize: '1.1rem',
              },
            }}
          >
            <Tooltip title={opt.tooltip} placement="top">
              <span style={{ display: 'inline-flex' }}>{opt.icon}</span>
            </Tooltip>
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
}

