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
  return (
    <PageLayout>
      <PageHeader
        onBack={onBack}
        center={<CourseSwitcher currentCourseId={courseId} onSelect={onSwitchCourse} />}
      />
      <PageContent>
        <ReviewView courseId={courseId} />
      </PageContent>
    </PageLayout>
  );
}
