import { type ButtonVariantProps, buttonVariants } from './variants/button';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {
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
