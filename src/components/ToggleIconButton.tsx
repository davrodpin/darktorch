import { IconButton, Tooltip } from '@mui/material';
import React from 'react';

type ToggleState<T extends string> = {
  value: T;
  icon: React.ReactNode;
  /** Tooltip label — should describe what clicking does (target-state semantics). */
  tooltip: string;
  ariaLabel: string;
};

export type ToggleIconButtonProps<T extends string> = {
  /** The current active value. */
  value: T;
  /** Exactly two states: [stateA, stateB]. The button shows the OTHER state's icon/tooltip. */
  states: [ToggleState<T>, ToggleState<T>];
  onChange: (next: T) => void;
  disabled?: boolean;
  /** Tooltip text shown when disabled (e.g. permission message). */
  disabledTooltip?: string;
};

/**
 * A single icon button that toggles between two states.
 * Shows the icon/label of the state it will SWITCH TO on click (target-state semantics).
 */
export function ToggleIconButton<T extends string>({
  value,
  states,
  onChange,
  disabled = false,
  disabledTooltip,
}: ToggleIconButtonProps<T>) {
  const currentIndex = states.findIndex((s) => s.value === value);
  const targetIndex = currentIndex === 0 ? 1 : 0;
  const target = states[targetIndex];

  const tooltipTitle = disabled && disabledTooltip ? disabledTooltip : target.tooltip;

  return (
    <Tooltip title={tooltipTitle} placement="top">
      {/* span required so Tooltip works when button is disabled */}
      <span style={{ display: 'inline-flex' }}>
        <IconButton
          size="small"
          aria-label={target.ariaLabel}
          disabled={disabled}
          onClick={() => onChange(target.value)}
          sx={{
            backgroundColor: 'white',
            color: 'common.black',
            border: '1px solid',
            borderColor: 'common.black',
            borderRadius: 1,
            padding: '4px 8px',
            '&:hover': {
              backgroundColor: 'white',
            },
            '&.Mui-disabled': {
              backgroundColor: 'white',
              color: 'grey.500',
              borderColor: 'grey.400',
            },
            '& .MuiSvgIcon-root, & svg': {
              color: 'inherit',
              fill: 'currentColor',
              fontSize: '1.1rem',
            },
          }}
        >
          {target.icon}
        </IconButton>
      </span>
    </Tooltip>
  );
}
