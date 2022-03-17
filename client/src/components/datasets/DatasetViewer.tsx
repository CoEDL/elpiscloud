import {useAuth} from 'contexts/auth';
import React, {ReactNode} from 'react';

export default function DatasetViewer() {
  const {user} = useAuth();

  if (!user) {
    return EmptyState();
  }

  return EmptyState();
}

interface ContainerProps {
  children: ReactNode;
}

function EmptyState() {
  return (
    <Container>
      <div className="flex h-full flex-col items-center justify-center">
        <p className="select-none text-gray-400">
          No datasets for current user
        </p>
      </div>
    </Container>
  );
}

function Container({children}: ContainerProps) {
  return (
    <div className="h-64 rounded-md border-2 border-slate-200 bg-slate-100 shadow-md">
      {children}
    </div>
  );
}
