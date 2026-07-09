import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test } from 'bun:test';
import React from 'react';

import { useLessonViewStore } from '../../stores/lessonViewStore';
import { useSelectionStore } from '../../stores/selectionStore';
import { clearMocks, mockResponse, setupRPC } from '../../testUtils';
import CardEditor from './CardEditor';

setupRPC();

const mockRange = {
  getBoundingClientRect: () => ({
    left: 100,
    top: 50,
    width: 100,
    height: 20,
    bottom: 70,
    right: 200,
    toJSON: () => {},
  }),
  commonAncestorContainer: document.body,
  startContainer: document.body,
  startOffset: 0,
  endContainer: document.body,
  endOffset: 20,
  toString: () => 'selected text',
  setStart: () => {},
  setEnd: () => {},
};

function setupStore() {
  useLessonViewStore.setState({ courseId: 'cs101', moduleId: 'mod-01' });
  useSelectionStore.setState({
    showCardEditor: true,
    selection: { text: 'selected text', range: mockRange as unknown as Range },
    pickerPos: { x: 200, y: 300, selectionTop: 280 },
    showToolbar: false,
    showNoteEditor: false,
    noteText: '',
    selectedHighlightId: null,
  });
}

beforeEach(() => {
  useSelectionStore.setState({
    showCardEditor: false,
    showToolbar: false,
    showNoteEditor: false,
    noteText: '',
    selection: null,
    pickerPos: { x: 0, y: 0, selectionTop: 0 },
    selectedHighlightId: null,
  });
  useLessonViewStore.setState({
    courseId: '',
    moduleId: '',
    contentRef: { current: null } as React.RefObject<HTMLDivElement | null>,
  });
});

describe('CardEditor', () => {
  const user = userEvent.setup();

  test('renders with selected text and placeholders', () => {
    setupStore();
    const { getByText, getAllByText } = render(<CardEditor />);
    expect(getByText('Create Card')).toBeInTheDocument();
    expect(getAllByText('Front')).toHaveLength(2); // tab button + label
    expect(getByText('Back')).toBeInTheDocument();
    expect(getByText('Cloze Card')).toBeInTheDocument();
  });

  test('returns null when showCardEditor is false', () => {
    const { container } = render(<CardEditor />);
    expect(container.innerHTML).toBe('');
  });

  test('returns null when selection is null', () => {
    useSelectionStore.setState({ showCardEditor: true, selection: null });
    const { container } = render(<CardEditor />);
    expect(container.innerHTML).toBe('');
  });

  test('save disabled when back empty', () => {
    setupStore();
    const { getByText } = render(<CardEditor />);
    const saveBtn = getByText('Save').closest('button');
    expect(saveBtn).toBeDisabled();
  });

  test('cancel closes editor', async () => {
    setupStore();
    const { getByText } = render(<CardEditor />);
    await user.click(getByText('Cancel'));
    expect(useSelectionStore.getState().showCardEditor).toBe(false);
  });

  test('save in normal mode — closes editor', async () => {
    clearMocks();
    mockResponse('addUserCard', { id: 'card-1' });
    setupStore();
    const { container, getByText } = render(<CardEditor />);
    // Front is auto-filled from selection.text. Back needs typing.
    const textareas = container.querySelectorAll('textarea');
    await user.type(textareas[1], 'A JS library for UIs');
    await user.click(getByText('Save'));
    expect(useSelectionStore.getState().showCardEditor).toBe(false);
  });

  test('save in cloze mode — closes editor', async () => {
    clearMocks();
    mockResponse('addUserCard', { id: 'card-2' });
    setupStore();
    const { container, getByText } = render(<CardEditor />);
    await user.click(getByText('Cloze Card'));
    // Front is auto-filled from selection.text. Back needs typing.
    const textareas = container.querySelectorAll('textarea');
    await user.type(textareas[1], 'A JS library');
    await user.click(getByText('Save'));
    expect(useSelectionStore.getState().showCardEditor).toBe(false);
  });
});
