import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FloatingActionButtonProps {
  icon: LucideIcon;
  label?: string;
  onClick: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export function FloatingActionButton({
  icon: Icon,
  label,
  onClick,
  className,
  position = 'bottom-right',
}: FloatingActionButtonProps) {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  };

  return (
    <Button
      onClick={onClick}
      className={cn(
        'fixed z-50 h-14 w-14 rounded-full shadow-lg md:hidden',
        'flex items-center justify-center',
        'bg-primary hover:bg-primary/90',
        'active:scale-95 transition-transform',
        positionClasses[position],
        className
      )}
      aria-label={label}
    >
      <Icon className="h-6 w-6" />
    </Button>
  );
}
