# Fix: Toolbar disappears on 3rd "Add Note" click

## Root Cause

`useSelection.ts` RAF callback (line 43-53): when `selectionchange` fires from clicking toolbar `<button>`, `activeElement` is `<button>` — NOT in `INPUT/TEXTAREA/SELECT/contentEditable` guard list (lines 44-51). The only remaining guard `showNoteEditor || showCardEditor` (line 53) fails if RAF fires before `openNoteEditor()` updates store (event timing race).

Result: `resetSelection()` → `showToolbar: false, selection: null` → toolbar unmounts.

## Fix

**File:** `src/mainview/hooks/useSelection.ts`  
**Location:** line 52, before `showNoteEditor || showCardEditor` guard

Add check: if `activeElement` is inside `[data-testid="selection-toolbar"]`, don't reset.

### Before (line 52-54):
```ts
            const st = useSelectionStore.getState();
            if (st.showNoteEditor || st.showCardEditor) return;
            st.resetSelection();
```

### After:
```ts
            const toolbar = document.querySelector('[data-testid="selection-toolbar"]');
            if (toolbar?.contains(active)) return;
            const st = useSelectionStore.getState();
            if (st.showNoteEditor || st.showCardEditor) return;
            st.resetSelection();
```

## Verification

1. `bun run typecheck` — 0 errors
2. `bun run lint` — clean
3. `bun run test` — snapshot tests may need update if any test asserts toolbar behavior on button click
4. Manual: select text → click Add Note 3× → toolbar stays visible throughout
