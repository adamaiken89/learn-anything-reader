import { useDraggable } from '@dnd-kit/react';

interface ClozeTokenProps {
  answer: string;
  used: boolean;
}

function ClozeToken({ answer, used }: ClozeTokenProps) {
  const { ref, isDragging } = useDraggable({ id: `cloze-${answer}` });

  if (used) return null;

  return (
    <span
      ref={ref}
      className={`cloze-token${isDragging ? ' cloze-token-dragging' : ''}`}
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      {answer}
    </span>
  );
}

interface ClozeTokenPoolProps {
  answers: string[];
  usedTokens: Set<string>;
}

export default function ClozeTokenPool({ answers, usedTokens }: ClozeTokenPoolProps) {
  if (answers.length === 0) return null;

  return (
    <div className="cloze-token-pool">
      {answers.map((a) => (
        <ClozeToken key={a} answer={a} used={usedTokens.has(a)} />
      ))}
    </div>
  );
}
