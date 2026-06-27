import type { Course } from '../../bun/types';
import CourseSwitcher from '../components/CourseSwitcher';
import PageContent from '../layouts/PageContent';
import PageHeader from '../layouts/PageHeader';
import PageLayout from '../layouts/PageLayout';
import QuizSection from '../sections/QuizSection';

interface QuizPageProps {
  courseId: string;
  moduleId: string;
  onBack: () => void;
  onSwitchCourse: (course: Course) => void;
}

export default function QuizPage({ courseId, moduleId, onBack, onSwitchCourse }: QuizPageProps) {
  return (
    <PageLayout>
      <PageHeader
        onBack={onBack}
        center={<CourseSwitcher currentCourseId={courseId} onSelect={onSwitchCourse} />}
      />
      <PageContent>
        <QuizSection courseId={courseId} moduleId={moduleId} />
      </PageContent>
    </PageLayout>
  );
}
