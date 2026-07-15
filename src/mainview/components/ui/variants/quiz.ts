import { cva } from 'class-variance-authority';

export const quizCompletionContainer = cva(
  'w-full max-w-4xl mx-auto px-4 flex-1 flex flex-col justify-center',
);

export const quizNavButton = cva(
  'px-3 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors',
);

export const quizCtaButton = cva(
  'px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
);
