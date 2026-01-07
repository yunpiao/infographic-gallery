import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-ring',
          'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',

          // Size variants
          size === 'sm' && 'h-9 px-3 text-sm rounded-lg',
          size === 'md' && 'h-11 px-5 text-sm rounded-xl',
          size === 'lg' && 'h-14 px-8 text-base rounded-xl',

          // Variant styles
          variant === 'primary' && [
            'gradient-bg text-white',
            'shadow-sm hover:shadow-[var(--shadow-accent)] hover:-translate-y-0.5',
            'hover:brightness-110',
          ],
          variant === 'secondary' && [
            'bg-[var(--muted)] text-[var(--foreground)]',
            'hover:bg-[var(--border)]',
          ],
          variant === 'outline' && [
            'border border-[var(--border)] bg-transparent text-[var(--foreground)]',
            'hover:border-[var(--accent)]/30 hover:bg-[var(--muted)]/50',
            'hover:shadow-sm',
          ],
          variant === 'ghost' && [
            'bg-transparent text-[var(--muted-foreground)]',
            'hover:text-[var(--foreground)] hover:bg-[var(--muted)]',
          ],

          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
