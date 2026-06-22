import { cva, VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  "px-3 py-1.5 text-sm rounded-lg transition-colors",
  {
    variants: {
      intent: {
        primary: "bg-indigo-600 hover:bg-indigo-500 text-white",
        secondary: "bg-gray-700 hover:bg-gray-600 text-gray-200",
        danger: "bg-red-700 hover:bg-red-600 text-white",
        success: "bg-emerald-700 hover:bg-emerald-600 text-white",
        ghost: "text-gray-400 hover:text-white",
        amber: "bg-amber-700 hover:bg-amber-600 text-white",
      },
      size: {
        sm: "px-2 py-0.5 text-xs rounded",
        md: "px-3 py-1.5 text-sm rounded-lg",
        lg: "px-6 py-2 rounded-lg",
      },
    },
    defaultVariants: {
      intent: "secondary",
      size: "md",
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export const toggleVariants = cva(
  "px-2 py-0.5 text-xs rounded transition-colors",
  {
    variants: {
      active: {
        true: "bg-indigo-600 text-white",
        false: "bg-gray-700 hover:bg-gray-600",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export const tabVariants = cva(
  "flex-1 px-2 py-2 text-xs font-medium transition-colors",
  {
    variants: {
      active: {
        true: "bg-indigo-600/20 text-indigo-300 border-b-2 border-indigo-400",
        false: "text-gray-500 hover:text-gray-300 hover:bg-gray-800",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export const answerVariants = cva(
  "w-full text-left p-3 rounded-lg border transition-colors",
  {
    variants: {
      state: {
        correct: "bg-emerald-900/30 border-emerald-600",
        wrong: "bg-red-900/30 border-red-600",
        selected: "bg-indigo-900/30 border-indigo-600",
        neutral: "bg-gray-750 border-gray-600 hover:border-gray-500",
      },
    },
    defaultVariants: {
      state: "neutral",
    },
  }
);

export const cardVariants = cva(
  "bg-gray-800 border border-gray-700 rounded-xl transition-colors",
  {
    variants: {
      hover: {
        true: "hover:bg-gray-750 cursor-pointer",
      },
    },
  }
);

export const navButtonVariants = cva(
  "px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
);

export const filterVariants = cva(
  "px-3 py-1 text-xs rounded transition-colors",
  {
    variants: {
      active: {
        true: "bg-indigo-600 text-white",
        false: "bg-gray-700 hover:bg-gray-600",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export const messageVariants = cva(
  "p-2 rounded text-xs",
  {
    variants: {
      role: {
        user: "bg-indigo-900/30 text-indigo-200 ml-4",
        ai: "bg-gray-800 text-gray-300 mr-4",
      },
    },
  }
);

export const sidebarSectionVariants = cva(
  "flex-1 text-left py-1 pr-1 text-xs rounded transition-colors",
  {
    variants: {
      active: {
        true: "bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-400",
        false: "text-gray-400 hover:text-gray-200 hover:bg-gray-800 border-l-2 border-transparent",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);
