import { useTranslation } from 'react-i18next';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../layouts/PageHeader';
import PageContent from '../layouts/PageContent';
import ReviewView from '../components/views/ReviewView';
import CourseSwitcher from '../components/CourseSwitcher';
import type { Course } from '../../bun/types';

interface ReviewPageProps {
  courseId: string;
  onBack: () => void;
  onSwitchCourse: (course: Course) => void;
}

export default function ReviewPage({ courseId, onBack, onSwitchCourse }: ReviewPageProps) {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader
        onBack={onBack}
        title={t('common.review')}
        center={<CourseSwitcher currentCourseId={courseId} onSelect={onSwitchCourse} />}
      />
      <PageContent>
        <ReviewView courseId={courseId} />
      </PageContent>
    </PageLayout>
  );
}
