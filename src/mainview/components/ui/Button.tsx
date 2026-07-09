import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 hover:shadow-md hover:-translate-y-0.5',
        secondary:
          'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:shadow-sm hover:-translate-y-0.5',
        danger: 'bg-red-700 text-white hover:bg-red-600 hover:shadow-sm hover:-translate-y-0.5',
        ghost: 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50',
        outline:
          'border border-gray-600/30 text-gray-400 hover:border-gray-400 hover:text-gray-200 hover:bg-gray-600/20 hover:shadow-sm hover:-translate-y-0.5',
        toggle: 'bg-gray-700 text-gray-200 hover:bg-gray-600',
        toggleActive: 'bg-indigo-600 text-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-sm',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  ref?: React.Ref<HTMLButtonElement>;
  loading?: boolean;
}

export const Button = ({
  ref,
  className,
  variant,
  size,
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
      ) : null}
      {children}
    </button>
  );
};

Button.displayName = 'Button';
