import { useTranslation } from 'react-i18next';
import { usePomodoroStore } from '../stores/pomodoroStore';
import type { PomodoroMode } from '../stores/pomodoroStore';

interface Props {
  compact?: boolean;
}

export default function PomodoroTimer({ compact = false }: Props) {
  const { t } = useTranslation();
  const { status, mode, remaining, completedSessions, start, pause, resume, stop } =
    usePomodoroStore();

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const presets: { mode: PomodoroMode; label: string; duration: string }[] = [
    { mode: 'focus', label: t('pomodoro.focus'), duration: '25m' },
    { mode: 'shortBreak', label: t('pomodoro.shortBreak'), duration: '5m' },
    { mode: 'longBreak', label: t('pomodoro.longBreak'), duration: '15m' },
  ];

  if (compact) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-lg w-36">
        {status === 'idle' && (
          <button
            onClick={() => start('focus')}
            className="w-full py-1 text-[10px] rounded bg-red-700 hover:bg-red-600 text-white transition-colors"
          >
            {t('pomodoro.focus')}
          </button>
        )}
        {status !== 'idle' && (
          <>
            <div className="text-center py-1">
              <div className="text-base font-mono font-bold text-gray-200 tabular-nums">{display}</div>
            </div>
            <div className="flex gap-1">
              {status === 'running' && (
                <button
                  onClick={pause}
                  className="flex-1 py-0.5 text-[10px] bg-amber-700 hover:bg-amber-600 rounded text-white"
                >
                  {t('pomodoro.pause')}
                </button>
              )}
              {status === 'paused' && (
                <button
                  onClick={resume}
                  className="flex-1 py-0.5 text-[10px] bg-emerald-700 hover:bg-emerald-600 rounded text-white"
                >
                  {t('pomodoro.resume')}
                </button>
              )}
              <button
                onClick={stop}
                className="py-0.5 px-1.5 text-[10px] bg-gray-700 hover:bg-gray-600 rounded text-gray-400"
              >
                {t('pomodoro.stop')}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg w-48">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-xs text-red-400">🍅</span>
        <span className="text-[10px] font-semibold text-gray-300">{t('pomodoro.title')}</span>
        <span className="text-[10px] text-gray-500 ml-auto">
          {t('pomodoro.session', { count: completedSessions })}
        </span>
      </div>

      {status === 'idle' && (
        <div className="flex gap-1">
          {presets.map((p) => (
            <button
              key={p.mode}
              onClick={() => start(p.mode)}
              className={`flex-1 py-1 text-[10px] rounded transition-colors ${
                mode === p.mode
                  ? 'bg-red-700 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {status !== 'idle' && (
        <>
          <div className="text-center py-2">
            <div className="text-lg font-mono font-bold text-gray-200 tabular-nums">{display}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              {presets.find((p) => p.mode === mode)?.label}
            </div>
          </div>
          <div className="flex gap-1">
            {status === 'running' && (
              <button
                onClick={pause}
                className="flex-1 py-1 text-[10px] bg-amber-700 hover:bg-amber-600 rounded text-white"
              >
                {t('pomodoro.pause')}
              </button>
            )}
            {status === 'paused' && (
              <button
                onClick={resume}
                className="flex-1 py-1 text-[10px] bg-emerald-700 hover:bg-emerald-600 rounded text-white"
              >
                {t('pomodoro.resume')}
              </button>
            )}
            {status === 'finished' && (
              <button
                onClick={() => start('focus')}
                className="flex-1 py-1 text-[10px] bg-indigo-700 hover:bg-indigo-600 rounded text-white"
              >
                {t('pomodoro.focus')}
              </button>
            )}
            <button
              onClick={stop}
              className="py-1 px-2 text-[10px] bg-gray-700 hover:bg-gray-600 rounded text-gray-400"
            >
              {t('pomodoro.stop')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
