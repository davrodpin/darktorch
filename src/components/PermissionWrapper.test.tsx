import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const hasPermission = vi.fn(() => true);

vi.mock('../hooks/usePlayerRole', () => ({
  usePlayerRole: () => ({
    hasPermission,
  }),
}));

import { PermissionWrapper } from './PermissionWrapper';

describe('PermissionWrapper', () => {
  afterEach(() => {
    cleanup();
    hasPermission.mockReset();
  });

  it('renders children when permission allows', () => {
    hasPermission.mockReturnValue(true);
    render(
      <PermissionWrapper requiredRole="GM">
        <div>Secret</div>
      </PermissionWrapper>
    );
    expect(screen.getByText('Secret')).toBeInTheDocument();
  });

  it('renders fallback when permission denies', () => {
    hasPermission.mockReturnValue(false);
    render(
      <PermissionWrapper requiredRole="GM" fallback={<div>Nope</div>}>
        <div>Secret</div>
      </PermissionWrapper>
    );
    expect(screen.queryByText('Secret')).toBeNull();
    expect(screen.getByText('Nope')).toBeInTheDocument();
  });
});

