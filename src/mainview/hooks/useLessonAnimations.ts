import type { RightPanel } from '../stores/settingsStore';
import { useDelayedUnmount } from './useDelayedUnmount';

export function useLessonAnimations(params: {
  focusMode: boolean;
  rightPanel: RightPanel;
  showPomodoro: boolean;
}) {
  return {
    showSectionsPanel: useDelayedUnmount(params.rightPanel !== false && !params.focusMode, 250),
    showPomodoroTimer: useDelayedUnmount(params.showPomodoro, 200),
  };
}
