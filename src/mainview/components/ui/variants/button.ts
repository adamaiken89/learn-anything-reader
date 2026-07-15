import { cva, type VariantProps } from 'class-variance-authority';

import { TOGGLE_ACTIVE_CLASSES } from './toggle';

export const buttonVariants = cva(
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
        toggleActive: TOGGLE_ACTIVE_CLASSES,
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

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
