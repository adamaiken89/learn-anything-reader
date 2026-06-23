import PageLayout from '../layouts/PageLayout';
import PageHeader from '../layouts/PageHeader';
import PageContent from '../layouts/PageContent';
import ReviewSection from '../sections/ReviewSection';
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
        <ReviewSection courseId={courseId} />
      </PageContent>
    </PageLayout>
  );
}
