import { useEffect } from 'react';
import { useCourseStore } from '../stores/courseStore';
import type { Course } from '../../bun/types';

interface Props {
  onSelectCourse: (course: Course) => void;
  onOpenSettings: () => void;
  onOpenBookmarks: () => void;
}

export default function CourseListView({ onSelectCourse, onOpenSettings, onOpenBookmarks }: Props) {
  const courses = useCourseStore((s) => s.courses);
  const loading = useCourseStore((s) => s.loading);
  const error = useCourseStore((s) => s.error);
  const load = useCourseStore((s) => s.load);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading courses...</div>;
  if (error) return <div className="p-8 text-center text-red-400">Error: {error}</div>;

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400">CourseReader</h1>
          <p className="text-sm text-gray-400 mt-0.5">Desktop study app</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onOpenBookmarks}
            className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Bookmarks
          </button>
          <button
            onClick={onOpenSettings}
            className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Settings
          </button>
        </div>
      </header>

      <main className="px-6 py-8 overflow-y-auto flex-1">
        {courses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No courses found. Add courses to the courses/ directory.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => onSelectCourse(course)}
              className="text-left bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl p-5 transition-colors group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                    {course.displayName}
                  </h2>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-400">
                    <span className="bg-gray-700 px-2 py-0.5 rounded">{course.targetLevel}</span>
                    <span className="bg-gray-700 px-2 py-0.5 rounded">
                      {course.timeBudgetHours}h
                    </span>
                    <span className="bg-gray-700 px-2 py-0.5 rounded">
                      {course.modules.length} modules
                    </span>
                  </div>
                  {course.learningObjectives.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {course.learningObjectives.slice(0, 3).map((obj, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                          <span className="text-indigo-500 mt-0.5 shrink-0">→</span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <span className="text-gray-600 group-hover:text-indigo-400 ml-4 mt-1 shrink-0">
                  →
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
