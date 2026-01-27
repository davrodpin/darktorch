import React from 'react';
import { usePlayerRole } from '../hooks/usePlayerRole';

interface PermissionWrapperProps {
  children: React.ReactNode;
  requiredRole: 'GM' | 'PLAYER' | 'ANY';
  fallback?: React.ReactNode;
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  requiredRole,
  fallback = null,
}) => {
  const { hasPermission } = usePlayerRole();
  
  const canAccess = hasPermission(requiredRole);
  
  return canAccess ? <>{children}</> : <>{fallback}</>;
};

// Higher-order component for conditional rendering
export const withPermission = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole: 'GM' | 'PLAYER' | 'ANY',
  fallback?: React.ReactNode
) => {
  return function WithPermissionComponent(props: P) {
    return (
      <PermissionWrapper requiredRole={requiredRole} fallback={fallback}>
        <WrappedComponent {...props} />
      </PermissionWrapper>
    );
  };
};