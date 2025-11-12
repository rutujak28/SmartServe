import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const adminButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-admin-primary text-white hover:bg-admin-primary/90',
        secondary: 'bg-admin-secondary text-white hover:bg-admin-secondary/90',
        success: 'bg-admin-success text-white hover:bg-admin-success/90',
        danger: 'bg-admin-destructive text-white hover:bg-admin-destructive/90',
        warning: 'bg-admin-warning text-white hover:bg-admin-warning/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-admin-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface AdminButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof adminButtonVariants> {
  asChild?: boolean;
}

const AdminButton = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(adminButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
AdminButton.displayName = 'AdminButton';

export { AdminButton, adminButtonVariants };
