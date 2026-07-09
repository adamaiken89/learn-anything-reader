import {
  ACCENT_INDIGO,
  ACCENT_INDIGO_LIGHT,
  COMPLETION_GREEN,
  COMPLETION_GREEN_DARK,
} from '../../colors';
import { useCurrentLesson } from '../../hooks/useCurrentLesson';
import { countCompleted, useCompletionStore } from '../../stores/completionStore';

function ProgressBadge() {
  const { course } = useCurrentLesson();
  const completedCount = useCompletionStore((s) =>
    course ? countCompleted(s.completed, course.id) : 0,
  );
  const totalModules = course ? course.modules.length : 0;

  if (totalModules === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-2 rounded-full overflow-hidden bg-gray-700">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.max(2, (completedCount / totalModules) * 100)}%`,
            background:
              completedCount === totalModules
                ? `linear-gradient(90deg, ${COMPLETION_GREEN}, ${COMPLETION_GREEN_DARK})`
                : ACCENT_INDIGO,
            boxShadow: completedCount > 0 ? `0 0 6px ${ACCENT_INDIGO_LIGHT}40` : 'none',
          }}
        />
      </div>
      <span className="text-xs text-gray-400 tabular-nums">
        {completedCount}/{totalModules}
      </span>
    </div>
  );
}

export default ProgressBadge;
