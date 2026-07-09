import { HIGHLIGHT_COLORS } from '../rehypeHighlightText';

interface ColorPickerRowProps {
  activeHighlightColor?: string;
  onSelectColor: (color: string) => void;
  onDeleteHighlight?: () => void;
}

export function ColorPickerRow({
  activeHighlightColor,
  onSelectColor,
  onDeleteHighlight,
}: ColorPickerRowProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 px-2 py-1.5">
      {Object.entries(HIGHLIGHT_COLORS)
        .filter(([name]) => name !== 'note')
        .map(([name, color]) => {
          const isActive = activeHighlightColor === name;
          return (
            <button
              key={name}
              onClick={() => (isActive ? onDeleteHighlight?.() : onSelectColor(name))}
              className={`w-4 h-4 rounded-full border transition-all shrink-0 ${
                isActive
                  ? 'border-white scale-125 ring-1 ring-white opacity-100'
                  : 'border-gray-500 opacity-80 hover:opacity-100 hover:scale-125'
              }`}
              style={{ backgroundColor: color }}
              title={name}
            />
          );
        })}
    </div>
  );
}
