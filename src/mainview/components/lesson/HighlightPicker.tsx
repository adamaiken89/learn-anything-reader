import { useTranslation } from 'react-i18next';
import { HIGHLIGHT_COLORS } from '../rehype-highlight-text';

interface HighlightPickerProps {
  x: number;
  y: number;
  onSelectColor: (color: string) => void;
  onOpenNote: () => void;
  onCreateCard?: () => void;
  onCancel: () => void;
}

export default function HighlightPicker({
  x,
  y,
  onSelectColor,
  onOpenNote,
  onCreateCard,
  onCancel,
}: HighlightPickerProps) {
  const { t } = useTranslation();

  return (
    <div
      className="fixed z-50 flex gap-1 bg-gray-800 border border-gray-600 rounded-lg p-1.5 shadow-xl"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {Object.entries(HIGHLIGHT_COLORS).map(([name, color]) => (
        <button
          key={name}
          onClick={() => onSelectColor(name)}
          className="w-6 h-6 rounded-full border-2 border-gray-600 hover:border-white transition-colors"
          style={{ backgroundColor: color }}
          title={name}
        />
      ))}
      <div className="w-px h-6 bg-gray-600 mx-1" />
      <button
        onClick={onOpenNote}
        className="text-[10px] px-1.5 py-0.5 rounded text-gray-300 hover:bg-gray-700 transition-colors"
        title={t('lesson.addNote')}
      >
        📝 {t('lesson.addNote')}
      </button>
      {onCreateCard && (
        <>
          <div className="w-px h-6 bg-gray-600 mx-1" />
          <button
            onClick={onCreateCard}
            className="text-[10px] px-1.5 py-0.5 rounded text-gray-300 hover:bg-gray-700 transition-colors"
            title={t('lesson.createCard') || 'Create Card'}
          >
            🃏 {t('lesson.createCard') || 'Card'}
          </button>
        </>
      )}
      <div className="w-px h-6 bg-gray-600 mx-1" />
      <button
        onClick={onCancel}
        className="w-6 h-6 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors flex items-center justify-center"
        title={t('lesson.cancelHighlight')}
      >
        ✕
      </button>
    </div>
  );
}
