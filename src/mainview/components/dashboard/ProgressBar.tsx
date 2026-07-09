import { cva } from 'class-variance-authority';

const progressBarVariants = cva('bg-gray-700 rounded overflow-hidden', {
  variants: {
    size: {
      sm: 'h-1.5',
      md: 'h-2',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export default function ProgressBar({ pct, size = 'md' }: { pct: number; size?: 'sm' | 'md' }) {
  return (
    <div className="mt-3">
      <div className={progressBarVariants({ size })}>
        <div
          className="h-full bg-indigo-500 transition-all group-hover:drop-shadow-[0_0_3px_rgba(99,102,241,0.4)]"
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
    </div>
  );
}
