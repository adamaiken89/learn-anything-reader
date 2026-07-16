import { useEffect, useEffectEvent } from 'react';

import { useQuizStore } from '../stores/quizStore';

export function useQuizKeyboard() {
  const status = useQuizStore((s) => s.status);
  const hasAnswer = useQuizStore((s) => s.hasAnswer);
  const currentQuestion = useQuizStore((s) => s.currentQuestion);
  const highlightedIdx = useQuizStore((s) => s.highlightedIdx);
  const selectAnswer = useQuizStore((s) => s.selectAnswer);
  const nextQuestion = useQuizStore((s) => s.nextQuestion);
  const setHighlightedIdx = useQuizStore((s) => s.setHighlightedIdx);

  const handleKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    const options =
      currentQuestion?.type !== 'cloze' ? Object.keys(currentQuestion?.options ?? {}) : [];
    const maxIdx = options.length - 1;

    switch (e.key) {
      case 'ArrowDown':
      case 'j': {
        e.preventDefault();
        const next = highlightedIdx < 0 ? 0 : Math.min(highlightedIdx + 1, maxIdx);
        setHighlightedIdx(next);
        break;
      }
      case 'ArrowUp':
      case 'k': {
        e.preventDefault();
        const prev = highlightedIdx <= 0 ? 0 : highlightedIdx - 1;
        setHighlightedIdx(prev);
        break;
      }
      case 'a':
      case 'b':
      case 'c':
      case 'd': {
        if (hasAnswer || currentQuestion?.type === 'cloze') break;
        const idx = e.key.charCodeAt(0) - 'a'.charCodeAt(0);
        if (idx < options.length) {
          selectAnswer(options[idx]);
        }
        break;
      }
      case 'Enter': {
        if (hasAnswer) {
          nextQuestion();
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        nextQuestion();
        break;
      }
    }
  });

  useEffect(() => {
    if (status !== 'ready') return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);
}
