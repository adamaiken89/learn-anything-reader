import { CheckSquare, Layers, Type } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Course } from '../../../bun/types';
import { api } from '../../api';
import { countCompleted, useCompletionStore } from '../../stores/completionStore';
import { useViewStore } from '../../stores/viewStore';
import CourseTags from './CourseTags';
import ProgressBar from './ProgressBar';

export default function CourseCard({ course }: { course: Course }) {
  const { t } = useTranslation();
  const push = useViewStore((s) => s.push);
  const completed = useCompletionStore((s) => s.completed);
  const totalModules = useCompletionStore((s) => s.totalModules);
  const total = totalModules[course.id] ?? course.modules.length;
  const done = countCompleted(completed, course.id);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const [hasCloze, setHasCloze] = useState(false);
  const [hasCumulative, setHasCumulative] = useState(false);

  useEffect(() => {
    const moduleId = course.modules[0]?.id;
    if (moduleId) {
      api.quiz
        .hasCloze(course.id, moduleId)
        .then(setHasCloze)
        .catch(() => {});
    }
    api.quiz
      .hasCumulative(course.id)
      .then(setHasCumulative)
      .catch(() => {});
  }, [course.id, course.modules]);

  const handleClick = () => {
    void api.session.getCourseModuleSessions(course.id).then((sessions) => {
      if (sessions.length > 0) {
        const last = sessions[0];
        const mod = course.modules.find((m) => m.id === last.moduleId);
        if (mod) {
          push({ type: 'lesson', course, module: mod, sectionID: last.sectionId || undefined });
          return;
        }
      }
      push({ type: 'lesson', course, module: course.modules[0] });
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const quizBtnClass =
    'flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-gray-700/50 text-gray-400 hover:text-gray-200 hover:bg-gray-600/50 transition-colors cursor-pointer';

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className="text-left bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-indigo-500/30 rounded-lg p-5 transition-all duration-200 group cursor-pointer"
    >
      <h2 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
        {course.displayName}
      </h2>
      <CourseTags
        targetLevel={course.targetLevel}
        timeHours={course.timeBudgetHours}
        moduleCount={course.modules.length}
      />
      {total > 0 && <ProgressBar pct={pct} />}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            push({ type: 'quiz', course, module: course.modules[0] });
          }}
          className={quizBtnClass}
          title={t('lesson.quizMCQ', 'MCQ')}
        >
          <CheckSquare className="w-3 h-3" />
          {t('lesson.quizMCQ', 'MCQ')}
        </button>
        {hasCloze && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              push({ type: 'clozeQuiz', course, module: course.modules[0] });
            }}
            className={quizBtnClass}
            title={t('lesson.quizCloze', 'Cloze')}
          >
            <Type className="w-3 h-3" />
            {t('lesson.quizCloze', 'Cloze')}
          </button>
        )}
        {hasCumulative && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              push({ type: 'cumulativeQuiz', course });
            }}
            className={quizBtnClass}
            title={t('lesson.quizCumulative', 'Cumulative')}
          >
            <Layers className="w-3 h-3" />
            {t('lesson.quizCumulative', 'Cumulative')}
          </button>
        )}
      </div>
    </div>
  );
}
