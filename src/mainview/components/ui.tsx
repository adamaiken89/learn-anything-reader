import { cva } from 'class-variance-authority';

export { Button } from './ui/Button';

export const toggleVariants = cva('px-2 py-0.5 text-xs rounded transition-colors', {
  variants: {
    active: {
      true: 'bg-indigo-600 text-white',
      false: 'bg-gray-700 hover:bg-gray-600',
    },
  },
  defaultVariants: {
    active: false,
  },
});

export const answerVariants = cva(
  'w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3',
  {
    variants: {
      state: {
        correct: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-100',
        wrong: 'bg-red-500/10 border-red-500/40 text-red-100 animate-[shake_0.3s_ease-in-out]',
        selected: 'bg-blue-500/10 border-blue-400/50 text-blue-100',
        neutral: 'bg-gray-800/60 border-gray-600/50 hover:border-gray-400 hover:bg-gray-700/40',
      },
    },
    defaultVariants: {
      state: 'neutral',
    },
  },
);

export const filterVariants = cva('px-3 py-1 text-xs rounded transition-colors', {
  variants: {
    active: {
      true: 'bg-indigo-600 text-white',
      false: 'bg-gray-700 hover:bg-gray-600',
    },
  },
  defaultVariants: {
    active: false,
  },
});

export const selectableCardVariants = cva('p-3 rounded-xl border-2 transition-all', {
  variants: {
    selected: {
      true: 'border-indigo-500 bg-indigo-900/30',
      false: 'border-gray-700 bg-gray-800/50 hover:border-gray-500',
    },
  },
  defaultVariants: {
    selected: false,
  },
});

export const selectableItemVariants = cva('transition-colors', {
  variants: {
    selected: {
      true: 'bg-indigo-600/20 text-indigo-300',
      false: 'text-gray-300 hover:bg-gray-700',
    },
  },
  defaultVariants: {
    selected: false,
  },
});
