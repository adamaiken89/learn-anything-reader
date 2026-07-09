import { useTranslation } from 'react-i18next';

function formatTargetLevel(level: string): string {
  return level
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function CourseTags({
  targetLevel,
  timeHours,
  moduleCount,
}: {
  targetLevel: string;
  timeHours: number;
  moduleCount: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md text-[11px] font-medium">
        {formatTargetLevel(targetLevel)}
      </span>
      <span className="text-xs text-gray-500">
        {timeHours}h · {t('dashboard.modules', { count: moduleCount })}
      </span>
    </div>
  );
}
