import React from 'react';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';

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
    >
      {options.map((opt) => (
        <ToggleButton
          key={opt.value}
          value={opt.value}
          aria-label={opt.ariaLabel}
          disabled={opt.disabled}
          onClick={opt.onClick}
        >
          <Tooltip title={opt.tooltip} placement="top">
            <span style={{ display: 'inline-flex' }}>{opt.icon}</span>
          </Tooltip>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

