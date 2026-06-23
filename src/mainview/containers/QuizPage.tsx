import PageLayout from '../layouts/PageLayout';
import PageHeader from '../layouts/PageHeader';
import PageContent from '../layouts/PageContent';
import QuizView from '../components/views/QuizView';
import CourseSwitcher from '../components/CourseSwitcher';
import type { Course } from '../../bun/types';

interface QuizPageProps {
  courseId: string;
  moduleId: number;
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
        <QuizView courseId={courseId} moduleId={moduleId} />
      </PageContent>
    </PageLayout>
  );
}
