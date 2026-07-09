import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ContentWidth, TransitionStyle } from '../../stores/settingsStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useViewStore } from '../../stores/viewStore';
import type { Theme } from '../../themes';
import { THEMES } from '../../themes';

const THEME_LABELS: Record<Theme, string> = {
  dark: 'settings.themes.dark',
  oled: 'settings.themes.oled',
  nord: 'settings.themes.nord',
  sepia: 'settings.themes.sepia',
  gruvbox: 'settings.themes.gruvbox',
  light: 'settings.themes.light',
  'solarized-dark': 'settings.themes.solarized',
  catppuccin: 'settings.themes.catppuccin',
  dracula: 'settings.themes.dracula',
  'tokyo-night': 'settings.themes.tokyoNight',
  'rose-pine': 'settings.themes.rosePine',
  everforest: 'settings.themes.everforest',
  notebook: 'settings.themes.notebook',
  'one-dark': 'settings.themes.oneDark',
  terminal: 'settings.themes.terminal',
  monokai: 'settings.themes.monokai',
  monochrome: 'settings.themes.monochrome',
  'night-owl': 'settings.themes.nightOwl',
};

const THEME_ICONS: Record<Theme, string> = {
  dark: 'icons.themeDark',
  oled: 'icons.themeOled',
  nord: 'icons.themeNord',
  sepia: 'icons.themeSepia',
  gruvbox: 'icons.themeGruvbox',
  light: 'icons.themeLight',
  'solarized-dark': 'icons.themeSolarized',
  catppuccin: 'icons.themeCatppuccin',
  dracula: 'icons.themeDracula',
  'tokyo-night': 'icons.themeTokyoNight',
  'rose-pine': 'icons.themeRosePine',
  everforest: 'icons.themeEverforest',
  notebook: 'icons.themeNotebook',
  'one-dark': 'icons.themeOneDark',
  terminal: 'icons.themeTerminal',
  monokai: 'icons.themeMonokai',
  monochrome: 'icons.themeMonochrome',
  'night-owl': 'icons.themeNightOwl',
};

const TRANSITION_LABELS: Record<TransitionStyle, string> = {
  none: 'settings.transitionNone',
  slide: 'settings.transitionSlide',
  flip: 'settings.transitionFlip',
  fade: 'settings.transitionFade',
};

const WIDTH_LABELS: Record<ContentWidth, string> = {
  narrow: 'lesson.narrow',
  standard: 'lesson.standard',
  wide: 'lesson.wide',
};

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
        active
          ? 'bg-indigo-700/50 border-indigo-500 text-indigo-200'
          : 'bg-gray-800/60 border-gray-600/50 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

export default function AppearancePopover() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fontSize = useSettingsStore((s) => s.fontSize);
  const incFontSize = useSettingsStore((s) => s.incFontSize);
  const decFontSize = useSettingsStore((s) => s.decFontSize);
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const contentWidth = useSettingsStore((s) => s.contentWidth);
  const setContentWidth = useSettingsStore((s) => s.setContentWidth);
  const transitionStyle = useSettingsStore((s) => s.transitionStyle);
  const setTransitionStyle = useSettingsStore((s) => s.setTransitionStyle);
  const push = useViewStore((s) => s.push);

  const btnRef = useRef<HTMLButtonElement>(null);

  const getDropdownLeft = useCallback((): number => {
    const btn = btnRef.current;
    const wrapper = ref.current;
    if (!btn || !wrapper) return 0;
    const wrapperRect = wrapper.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    return btnRect.left - wrapperRect.left;
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative z-50">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className={`relative z-50 px-2 py-1 text-[11px] rounded border transition-colors ${
          open
            ? 'bg-gray-800 text-white border-gray-600'
            : 'bg-gray-700/50 border-gray-600/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-200'
        }`}
        title={t('lesson.appearance')}
      >
        📥
      </button>
      {open && (
        <div
          className="absolute top-full mt-2 z-40 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl p-3.5 min-w-[280px] max-h-[min(400px,60vh)] overflow-y-auto"
          style={{ left: getDropdownLeft() }}
        >
          {/* Arrow */}
          <div className="absolute -top-1.5 left-4 w-3 h-3 bg-gray-900/95 border-l border-t border-gray-700/50 rotate-45" />
          {/* Font Size */}
          <div className="mb-3">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {t('settings.fontSize')}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={decFontSize}
                className="w-7 h-7 flex items-center justify-center rounded bg-gray-800 border border-gray-600/50 text-gray-300 hover:bg-gray-700 text-sm"
              >
                A⁻
              </button>
              <span className="w-6 text-center text-xs text-gray-300 tabular-nums">{fontSize}</span>
              <button
                onClick={incFontSize}
                className="w-7 h-7 flex items-center justify-center rounded bg-gray-800 border border-gray-600/50 text-gray-300 hover:bg-gray-700 text-sm"
              >
                A⁺
              </button>
            </div>
          </div>

          {/* Content Width */}
          <div className="mb-3">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {t('settings.contentWidth')}
            </div>
            <div className="flex gap-1.5">
              {(['narrow', 'standard', 'wide'] as ContentWidth[]).map((w) => (
                <Pill
                  key={w}
                  label={t(WIDTH_LABELS[w])}
                  active={contentWidth === w}
                  onClick={() => setContentWidth(w)}
                />
              ))}
            </div>
          </div>

          {/* Theme Grid */}
          <div className="mb-3">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {t('settings.readingTheme')}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {THEMES.map((th) => (
                <button
                  key={th}
                  onClick={() => setTheme(th)}
                  className={`rounded-lg p-1.5 text-center transition-colors ${
                    theme === th
                      ? 'ring-1 ring-indigo-500 bg-indigo-900/20'
                      : 'hover:bg-gray-700/50'
                  }`}
                >
                  <div className="text-xs">{t(THEME_ICONS[th])}</div>
                  <div className="text-[9px] text-gray-400 leading-tight mt-0.5 truncate">
                    {t(THEME_LABELS[th])}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => push({ type: 'settings' })}
              className="w-full mt-1.5 text-[10px] text-gray-500 hover:text-gray-300 transition-colors text-center"
            >
              {t('settings.moreInSettings')}
            </button>
          </div>

          {/* Page Transition */}
          <div className="mb-1">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {t('settings.pageTransition')}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(['none', 'slide', 'flip', 'fade'] as TransitionStyle[]).map((ts) => (
                <Pill
                  key={ts}
                  label={t(TRANSITION_LABELS[ts])}
                  active={transitionStyle === ts}
                  onClick={() => setTransitionStyle(ts)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
