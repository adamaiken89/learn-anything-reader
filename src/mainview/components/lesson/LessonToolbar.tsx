import { useSettingsStore } from '../../stores/settingsStore';
import FocusPomodoroControls from './FocusPomodoroControls';

export default function LessonToolbar() {
  const focusMode = useSettingsStore((s) => s.focusMode);
  if (!focusMode) return null;

  return (
    <div
      className="sticky top-0 z-40 bg-gray-800 border-b border-gray-700 px-4 py-1.5 flex items-center gap-2 shrink-0"
      data-testid="lesson-toolbar"
    >
      <FocusPomodoroControls />
    </div>
  );
}
