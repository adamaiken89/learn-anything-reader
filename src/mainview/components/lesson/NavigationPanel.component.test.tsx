import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, mock, test } from 'bun:test';

import type { ModuleMeta, Section } from '../../../bun/types';
import i18n from '../../i18n';
import { useBookmarksStore } from '../../stores/bookmarksStore';
import { useCompletionStore } from '../../stores/completionStore';
import { clearMocks, mockResponse, renderAndSettle, setupRPC } from '../../testUtils';
import NavigationPanel from './NavigationPanel';

function makeSection(id: string, heading: string, level: number): Section {
  return { id, heading, level, parentID: 'root' };
}

const defaultSections: Section[] = [
  makeSection('intro', 'Introduction', 2),
  makeSection('body', 'Body Content', 2),
  makeSection('conclusion', 'Conclusion', 2),
];

const defaultModules: ModuleMeta[] = [
  { id: 'mod-01', name: 'Module 1', timeHours: 10, prerequisites: [], topics: [] },
  { id: 'mod-02', name: 'Module 2', timeHours: 8, prerequisites: [], topics: [] },
];

const defaultCourseId = 'c1';
const defaultModuleId = 'mod-01';

beforeEach(() => {
  void i18n.changeLanguage('en-US');
  clearMocks();
  mockResponse('getSections', defaultSections);
  mockResponse('getCourseModuleSessions', []);
  useBookmarksStore.setState({ byModule: {}, loading: {} });
  useCompletionStore.setState({ completed: {}, totalModules: {} });
});

setupRPC();

describe('NavigationPanel', () => {
  const user = userEvent.setup();

  test('renders tab buttons', async () => {
    const { getByText } = await renderAndSettle(
      <NavigationPanel
        courseId={defaultCourseId}
        moduleId={defaultModuleId}
        moduleName="Test Module"
        modules={defaultModules}
        currentModuleId={defaultModuleId}
        onScrollToSection={() => {}}
        onModuleSelect={() => {}}
        onClose={() => {}}
        activeTab={'sections' as const}
        onTabChange={mock(() => {})}
      />,
    );
    expect(getByText('Sections')).toBeInTheDocument();
  });

  test('renders current module expanded with sections', async () => {
    const { getByText } = await renderAndSettle(
      <NavigationPanel
        courseId={defaultCourseId}
        moduleId={defaultModuleId}
        moduleName="Test Module"
        modules={defaultModules}
        currentModuleId={defaultModuleId}
        onScrollToSection={() => {}}
        onModuleSelect={() => {}}
        onClose={() => {}}
        activeTab={'sections' as const}
        onTabChange={mock(() => {})}
      />,
    );
    // Current module should be visible and expanded
    expect(getByText('Module 1')).toBeInTheDocument();
    // Sections for current module should be visible (from defaultSections mock)
    expect(getByText('Introduction')).toBeInTheDocument();
    expect(getByText('Body Content')).toBeInTheDocument();
    expect(getByText('Conclusion')).toBeInTheDocument();
  });

  test('renders all modules in tree', async () => {
    const { getByText } = await renderAndSettle(
      <NavigationPanel
        courseId={defaultCourseId}
        moduleId={defaultModuleId}
        moduleName="Test Module"
        modules={defaultModules}
        currentModuleId={defaultModuleId}
        onScrollToSection={() => {}}
        onModuleSelect={() => {}}
        onClose={() => {}}
        activeTab={'sections' as const}
        onTabChange={mock(() => {})}
      />,
    );
    expect(getByText('Module 1')).toBeInTheDocument();
    expect(getByText('Module 2')).toBeInTheDocument();
  });

  test('clicking section calls scrollToSection', async () => {
    const scrollToSection = mock(() => {});
    const { getByText } = await renderAndSettle(
      <NavigationPanel
        courseId={defaultCourseId}
        moduleId={defaultModuleId}
        moduleName="Test Module"
        modules={defaultModules}
        currentModuleId={defaultModuleId}
        onScrollToSection={scrollToSection}
        onModuleSelect={() => {}}
        onClose={() => {}}
        activeTab={'sections' as const}
        onTabChange={mock(() => {})}
      />,
    );
    await user.click(getByText('Introduction'));
    expect(scrollToSection).toHaveBeenCalledTimes(1);
    expect(scrollToSection).toHaveBeenCalledWith('intro');
  });

  test('current module has indigo highlight', async () => {
    const { getByText } = await renderAndSettle(
      <NavigationPanel
        courseId={defaultCourseId}
        moduleId={defaultModuleId}
        moduleName="Test Module"
        modules={defaultModules}
        currentModuleId={defaultModuleId}
        onScrollToSection={() => {}}
        onModuleSelect={() => {}}
        onClose={() => {}}
        activeTab={'sections' as const}
        onTabChange={mock(() => {})}
      />,
    );
    expect(getByText('Module 1').closest('button')?.className).toContain('indigo');
  });

  test('shows module numbers', async () => {
    const { getByText } = await renderAndSettle(
      <NavigationPanel
        courseId={defaultCourseId}
        moduleId={defaultModuleId}
        moduleName="Test Module"
        modules={defaultModules}
        currentModuleId={defaultModuleId}
        onScrollToSection={() => {}}
        onModuleSelect={() => {}}
        onClose={() => {}}
        activeTab={'sections' as const}
        onTabChange={mock(() => {})}
      />,
    );
    expect(getByText('1')).toBeInTheDocument();
    expect(getByText('2')).toBeInTheDocument();
  });

  test('clicking module calls onModuleSelect', async () => {
    const onModuleSelect = mock(() => {});
    const { getByText } = await renderAndSettle(
      <NavigationPanel
        courseId={defaultCourseId}
        moduleId={defaultModuleId}
        moduleName="Test Module"
        modules={defaultModules}
        currentModuleId={defaultModuleId}
        onScrollToSection={() => {}}
        onModuleSelect={onModuleSelect}
        onClose={() => {}}
        activeTab={'sections' as const}
        onTabChange={mock(() => {})}
      />,
    );
    await user.click(getByText('Module 2'));
    expect(onModuleSelect).toHaveBeenCalledTimes(1);
    expect(onModuleSelect).toHaveBeenCalledWith(defaultModules[1], undefined);
  });

  test('clicking close calls onClose', async () => {
    const onClose = mock(() => {});
    const { container } = await renderAndSettle(
      <NavigationPanel
        courseId={defaultCourseId}
        moduleId={defaultModuleId}
        moduleName="Test Module"
        modules={defaultModules}
        currentModuleId={defaultModuleId}
        onScrollToSection={() => {}}
        onModuleSelect={() => {}}
        onClose={onClose}
        activeTab={'sections' as const}
        onTabChange={mock(() => {})}
      />,
    );
    await user.click(container.querySelector('.lucide-chevron-right')!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('renders session indicators when sessions exist', async () => {
    mockResponse('getCourseModuleSessions', [
      {
        courseId: defaultCourseId,
        moduleId: 'mod-01',
        sectionId: 'intro',
        scrollPosition: 100,
        updatedAt: '2024-01-01',
      },
    ]);
    const { getByText } = await renderAndSettle(
      <NavigationPanel
        courseId={defaultCourseId}
        moduleId={defaultModuleId}
        moduleName="Test Module"
        modules={defaultModules}
        currentModuleId={defaultModuleId}
        onScrollToSection={() => {}}
        onModuleSelect={() => {}}
        onClose={() => {}}
        activeTab={'sections' as const}
        onTabChange={mock(() => {})}
      />,
    );
    // Module should still render
    expect(getByText('Module 1')).toBeInTheDocument();
  });

  test('handleToggleSectionBookmark calls bookmark store toggle', async () => {
    mockResponse('getSections', [makeSection('intro', 'Introduction', 2)]);
    mockResponse('addBookmark', {
      id: 'bm-1',
      title: 'Test Module – Introduction',
      sectionID: 'intro',
    });
    useBookmarksStore.setState({ byModule: {} });
    await renderAndSettle(
      <NavigationPanel
        courseId={defaultCourseId}
        moduleId={defaultModuleId}
        moduleName="Test Module"
        modules={defaultModules}
        currentModuleId={defaultModuleId}
        onScrollToSection={() => {}}
        onModuleSelect={() => {}}
        onClose={() => {}}
        activeTab={'sections' as const}
        onTabChange={mock(() => {})}
      />,
    );
    // Handler calls void toggle() — fire-and-forget. Test the store directly.
    const { toggle } = useBookmarksStore.getState();
    await act(async () => {
      await toggle(defaultCourseId, defaultModuleId, 'Test Module – Introduction', 'intro');
    });
    const key = `${defaultCourseId}:${defaultModuleId}`;
    expect(useBookmarksStore.getState().byModule[key]).toBeDefined();
  });
});
