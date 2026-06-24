import PageLayout from '../layouts/PageLayout';
import PageHeader from '../layouts/PageHeader';
import PageContent from '../layouts/PageContent';
import UserCardReviewSection from '../sections/UserCardReviewSection';
import CourseSwitcher from '../components/CourseSwitcher';
import type { Course } from '../../bun/types';

interface UserCardReviewPageProps {
  courseId: string;
  onBack: () => void;
  onSwitchCourse: (course: Course) => void;
}

export default function UserCardReviewPage({
  courseId,
  onBack,
  onSwitchCourse,
}: UserCardReviewPageProps) {
  return (
    <PageLayout>
      <PageHeader
        onBack={onBack}
        center={<CourseSwitcher currentCourseId={courseId} onSelect={onSwitchCourse} />}
      />
      <PageContent>
        <UserCardReviewSection courseId={courseId} />
      </PageContent>
    </PageLayout>
  );
}
