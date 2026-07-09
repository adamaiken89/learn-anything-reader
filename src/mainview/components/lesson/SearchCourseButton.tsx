import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useLessonUIStore } from '../../stores/lessonUIStore';
import { Button } from '../ui';

function SearchCourseButton() {
  const { t } = useTranslation();
  const setSearchCourseOpen = useLessonUIStore((s) => s.setSearchCourseOpen);

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => setSearchCourseOpen(true)}
      title={t('lesson.searchCourse')}
    >
      <Search size={14} /> {t('lesson.searchCourse')}
    </Button>
  );
}

export default SearchCourseButton;
