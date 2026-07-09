import type { Course, ModuleMeta } from '../../bun/types';
import PageContent from '../layouts/PageContent';
import PageHeader from '../layouts/PageHeader';
import PageLayout from '../layouts/PageLayout';
import ClozeQuizSection from '../sections/ClozeQuizSection';

interface Props {
  course: Course;
  module: ModuleMeta;
  onBack: () => void;
}

export default function ClozeQuizPage({ course, module, onBack }: Props) {
  return (
    <PageLayout>
      <PageHeader
        onBack={onBack}
        center={
          <span className="text-sm font-medium text-gray-300">{module.name} — Cloze Drill</span>
        }
      />
      <PageContent className="quiz-bg">
        <ClozeQuizSection
          courseId={course.id}
          moduleId={module.id}
          course={course}
          module={module}
        />
      </PageContent>
    </PageLayout>
  );
}
