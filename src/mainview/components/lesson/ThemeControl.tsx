import { useTranslation } from 'react-i18next';

import { useSettingsStore } from '../../stores/settingsStore';
import { THEME_ICONS, THEME_LABELS } from '../../themes';
import { Button } from '../ui';

function ThemeControl() {
  const { t } = useTranslation();
  const theme = useSettingsStore((s) => s.theme);
  const cycleTheme = useSettingsStore((s) => s.cycleTheme);

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={cycleTheme}
      title={`${t('settings.readingTheme')}: ${t(THEME_LABELS[theme])}`}
    >
      {t(THEME_ICONS[theme])}
    </Button>
  );
}

export default ThemeControl;
