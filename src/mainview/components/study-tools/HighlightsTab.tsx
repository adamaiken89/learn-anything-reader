import { useTranslation } from 'react-i18next';
import { useHighlights } from '../../hooks/useHighlights';

interface HighlightsTabProps {
  courseId: string;
  moduleId: string | number;
}

export default function HighlightsTab({ courseId, moduleId }: HighlightsTabProps) {
  const { t } = useTranslation();
  const { highlights, loading, deleteHighlight } = useHighlights(courseId, moduleId);

  if (loading) {
    return <p className="text-xs text-gray-500">{t('studyTools.loadingHighlights')}</p>;
  }

  if (highlights.length === 0) {
    return <p className="text-xs text-gray-500">{t('studyTools.noHighlights')}</p>;
  }

  return (
    <div>
      {highlights.map((h) => (
        <div key={h.id} className="bg-gray-800 border border-gray-700 rounded p-2 mb-2">
          <p className="text-xs text-gray-300 line-clamp-2">{h.selectedText}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} />
            <button
              onClick={() => deleteHighlight(h.id)}
              className="text-[10px] text-red-400 hover:text-red-300"
            >
              {t('common.delete')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
