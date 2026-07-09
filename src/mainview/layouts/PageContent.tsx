import type { ReactNode } from 'react';

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

export default function PageContent({ children, className = '' }: PageContentProps) {
  return (
    <main
      data-testid="page-content"
      className={`overflow-y-auto flex-1 flex flex-col px-6 min-h-0 ${className}`}
    >
      {children}
    </main>
  );
}
