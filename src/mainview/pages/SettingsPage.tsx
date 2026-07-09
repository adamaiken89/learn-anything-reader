import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import AboutSection from '../components/settings/AboutSection';
import ApiKeySection from '../components/settings/ApiKeySection';
import AppearanceSection from '../components/settings/AppearanceSection';
import DangerSection from '../components/settings/DangerSection';
import LanguageSection from '../components/settings/LanguageSection';
import SyncSection from '../components/settings/SyncSection';
import PageContent from '../layouts/PageContent';
import PageHeader from '../layouts/PageHeader';
import PageLayout from '../layouts/PageLayout';

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  return (
    <PageLayout>
      <PageHeader onBack={onBack} title={t('common.settings')} hideHeaderActions />
      <PageContent>
        <div className="py-8">
          {/* Integration */}
          <div className="anim-fade-in-up">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {t('settings.integration')}
            </h2>
            <div className="space-y-4 mb-8">
              <ApiKeySection />
              <SyncSection />
            </div>
          </div>

          {/* Preferences */}
          <div className="anim-fade-in-up" style={{ animationDelay: '60ms' }}>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {t('settings.preferences')}
            </h2>
            <div className="space-y-4 mb-8">
              <AppearanceSection />
              <LanguageSection />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="anim-fade-in-up" style={{ animationDelay: '120ms' }}>
            <DangerSection />
          </div>

          {/* About */}
          <div className="anim-fade-in-up" style={{ animationDelay: '180ms' }}>
            <div className="mt-8">
              <AboutSection />
            </div>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
}
