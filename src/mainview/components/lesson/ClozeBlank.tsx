import { useState } from 'react';

interface ClozeBlankProps {
  answer: string;
}

export default function ClozeBlank({ answer }: ClozeBlankProps) {
  const [input, setInput] = useState('');
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    const isCorrect = input.trim().toLowerCase() === answer.toLowerCase();
    return (
      <span className="cloze-blank revealed">
        <span className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>
          {isCorrect ? '✓' : '✗'}
        </span>{' '}
        <span>{answer}</span>
        {!isCorrect && input.trim() && (
          <span className="text-gray-500 text-xs ml-1">(you: {input.trim()})</span>
        )}
      </span>
    );
  }

  return (
    <span className="cloze-blank-input inline-flex items-center gap-1">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && input.trim()) setRevealed(true);
        }}
        placeholder="Type your answer..."
        className="bg-transparent border-b border-dashed border-gray-500 text-sm px-1 py-0.5 w-24 focus:outline-none focus:border-indigo-400 text-gray-200 placeholder-gray-600"
      />
      {input.trim() && (
        <button
          onClick={() => setRevealed(true)}
          className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors px-1"
        >
          Reveal
        </button>
      )}
    </span>
  );
}
