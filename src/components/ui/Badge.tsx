import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'muted';
  dot?: boolean;
  dotPulse?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', dot = false, dotPulse = false, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center gap-2 rounded-full px-4 py-1.5',
          'font-mono text-xs uppercase tracking-[0.15em]',

          // Variant styles
          variant === 'default' && [
            'border border-[var(--border)] bg-[var(--card)]',
            'text-[var(--muted-foreground)]',
          ],
          variant === 'accent' && [
            'border border-[var(--accent)]/30 bg-[var(--accent)]/5',
            'text-[var(--accent)]',
          ],
          variant === 'muted' && [
            'bg-[var(--muted)] text-[var(--muted-foreground)]',
          ],

          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'h-2 w-2 rounded-full bg-current',
              dotPulse && 'animate-pulse-dot'
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
