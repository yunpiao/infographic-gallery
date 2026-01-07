import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'featured';
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden',
          'transition-all duration-300',

          // Variant styles
          variant === 'default' && 'shadow-[var(--shadow-md)]',
          variant === 'elevated' && 'shadow-[var(--shadow-lg)]',
          variant === 'featured' && [
            'relative',
            'before:absolute before:inset-0 before:rounded-xl before:p-[2px]',
            'before:bg-gradient-to-br before:from-[var(--accent)] before:to-[var(--accent-secondary)]',
            'before:-z-10',
          ],

          // Hover effect
          hover && [
            'hover:shadow-[var(--shadow-xl)] hover:-translate-y-1',
            'hover:border-[var(--accent)]/20',
          ],

          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-5 py-4 border-b border-[var(--border)] bg-[var(--muted)]/50',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export type CardContentProps = HTMLAttributes<HTMLDivElement>;

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-5', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';
