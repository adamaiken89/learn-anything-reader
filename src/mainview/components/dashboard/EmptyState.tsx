import { FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="text-center py-12 text-gray-500">
      <FolderOpen size={32} className="mx-auto mb-3 text-gray-600" />
      <p className="text-lg mb-2">{t('dashboard.noCourses')}</p>
      <p className="text-sm text-gray-600">
        {t('dashboard.addCoursesHint', { path: '~/.coursereader/subjects/' })}
      </p>
    </div>
  );
}
