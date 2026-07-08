import { useTranslation } from 'react-i18next';

import { useSettingsStore } from '../../stores/settingsStore';

export default function ReadingModeToggle() {
  const { t } = useTranslation();
  const readingMode = useSettingsStore((s) => s.readingMode);
  const setReadingMode = useSettingsStore((s) => s.setReadingMode);

  return (
    <button
      onClick={() => setReadingMode(readingMode === 'active' ? 'normal' : 'active')}
      className={`px-2 py-1 text-xs rounded transition-colors ${
        readingMode === 'active'
          ? 'bg-indigo-600 text-white'
          : 'bg-gray-700 text-gray-400 hover:text-gray-200'
      }`}
      title={t('lesson.readingMode')}
    >
      {t('lesson.readingMode')}
    </button>
  );
}
