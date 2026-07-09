# Reading Experience

Book-like prose styles defined via CSS custom properties in `.book-content` CSS class in `index.css`. Theme tokens computed by `themeToCSSVars()` in `themes.ts`.

## Themes

18 themes: Dark, OLED, Nord, Sepia, Gruvbox, Light, Solarized Dark, Catppuccin, Dracula, Tokyo Night, Rose Pine, Everforest, Notebook, One Dark, Terminal, Monokai, Monochrome, Night Owl

- Theme type defined in `themes.ts` as `Theme` union
- `cycleTheme()` for LessonToolbar, `setTheme(t)` for SettingsPage grid
- Each theme: 40+ CSS custom properties applied to `.book-content` (text, headings, code highlighting, blockquotes, tables)
- Tokens include syntax highlighting colors for highlight.js code blocks

## Typography

- Decorative headers with clear h1-h6 hierarchy
- Custom dark syntax highlighting theme (highlight.js)
- Blockquotes with indigo accent
- Nested list styling
- GFM table support via `remarkGfm`
- Adjustable font size (10–28px)
- Content width: narrow / standard / wide

## Navigation

- Section-based navigation with scroll tracking
- Module switch (`onNextModule`/`onPrevModule`) scrolls content to top
- Section panel star color: bookmarked → yellow, active section → white, inactive → grey
- Within-lesson search (`ViewerSearch`) with match count and prev/next navigation
- ⌘K global search (`SearchOverlay`) with course filter chips and section-level scroll-to

## Page Transitions

LessonPage supports 4 transition styles: none, flip, slide, fade. Configurable in SettingsPage or toggled via LessonToolbar. Uses CSS transforms only (no animation library).

## Focus Mode

Toggleable distraction-free reading mode. Hides bottom search button and side study panel. Toggled via LessonToolbar or keyboard shortcut.

## Module declarations

`src/types/` holds ambient `.d.ts` files for packages lacking `@types`:
- `js-yaml.d.ts` — `load`/`dump` signatures
- `three.d.ts` — bare `declare module "three"` (electrobun dependency)
- `jest-dom.d.ts` — `expect().toBeInTheDocument()` etc. (vitest compat)
