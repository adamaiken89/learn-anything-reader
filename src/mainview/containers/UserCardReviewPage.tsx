import PageLayout from '../layouts/PageLayout';
import PageHeader from '../layouts/PageHeader';
import PageContent from '../layouts/PageContent';
import UserCardReviewView from '../components/views/UserCardReviewView';
import CourseSwitcher from '../components/CourseSwitcher';
import type { Course } from '../../bun/types';

interface UserCardReviewPageProps {
  courseId: string;
  onBack: () => void;
  onSwitchCourse: (course: Course) => void;
}

export default function UserCardReviewPage({ courseId, onBack, onSwitchCourse }: UserCardReviewPageProps) {
  return (
    <PageLayout>
      <PageHeader
        onBack={onBack}
        center={<CourseSwitcher currentCourseId={courseId} onSelect={onSwitchCourse} />}
      />
      <PageContent>
        <UserCardReviewView courseId={courseId} />
      </PageContent>
    </PageLayout>
  );
}