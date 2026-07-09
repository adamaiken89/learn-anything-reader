import { useTranslation } from 'react-i18next';

export default function AboutSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">{t('settings.about')}</h3>
      <div className="space-y-2">
        <p className="text-sm text-gray-300 font-medium">{t('common.courseReader')}</p>
        <p className="text-sm text-gray-400">{t('settings.version')}</p>
        <p className="text-sm text-gray-400">{t('settings.aboutDesc')}</p>
        <p className="text-xs text-gray-500 mt-2">macOS · Electrobun</p>
      </div>
    </section>
  );
}
