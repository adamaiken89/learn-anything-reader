import { useQuizStore } from '../../stores/quizStore';
import { progressSegmentClass } from '../ui/variants/quiz';

export default function QuizProgressBar() {
  const questions = useQuizStore((s) => s.questions);
  const currentIndex = useQuizStore((s) => s.currentIndex);

  if (questions.length === 0) return null;

  return (
    <div className="flex gap-1.5 mb-5">
      {questions.map((_, i) => (
        <div key={i} className={progressSegmentClass(i < currentIndex, i === currentIndex)} />
      ))}
    </div>
  );
}
