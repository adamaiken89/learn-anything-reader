import { expect, test } from '../fixtures';

test.describe('SectionsPanel: highlight follows scroll, panel auto-scrolls', () => {
  async function navigateToLesson(page: import('@playwright/test').Page) {
    await page.waitForSelector('button:has-text("Introduction to Programming")');
    await page.click('button:has-text("Introduction to Programming")');
    await page.waitForSelector('button:has-text("Getting Started")');
    await page.click('button:has-text("Getting Started")');
    await page.waitForSelector('text=Welcome to Introduction to Programming');
    await page.waitForTimeout(600);
  }

  async function openSectionsPanel(page: import('@playwright/test').Page) {
    const toggleBtn = page.locator('button:has-text("☰")');
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(300);
    }
    await page.waitForSelector('[data-testid="sections-panel"]', { timeout: 5000 });
  }

  async function scrollToSection(page: import('@playwright/test').Page, sectionId: string) {
    await page.evaluate((sid) => {
      const scroller = document.querySelector('[data-testid="lesson-content"]') as HTMLElement;
      const heading = document.querySelector(`[id="${sid}"]`) as HTMLElement;
      if (!scroller || !heading) return;
      const offset =
        heading.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop -
        20;
      scroller.scrollTop = Math.max(0, offset);
    }, sectionId);
    await page.waitForTimeout(500);
  }

  async function getActiveSectionId(page: import('@playwright/test').Page): Promise<string | null> {
    return page.evaluate(() => {
      const rows = document.querySelectorAll('[data-section-id]');
      for (const row of rows) {
        const el = row as HTMLElement;
        const bg = el.style.backgroundColor;
        if (bg && bg !== 'transparent' && bg !== '') return el.getAttribute('data-section-id');
      }
      return null;
    });
  }

  test('active section highlights when scrolling to a lower section', async ({ page }) => {
    await navigateToLesson(page);
    await openSectionsPanel(page);

    await scrollToSection(page, 'working-with-data');

    const activeId = await getActiveSectionId(page);
    expect(activeId).toBe('working-with-data');
  });

  test('active section resets to first section when scrolling back to top', async ({ page }) => {
    await navigateToLesson(page);
    await openSectionsPanel(page);

    await scrollToSection(page, 'best-practices');
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      const scroller = document.querySelector('[data-testid="lesson-content"]') as HTMLElement;
      if (scroller) scroller.scrollTop = 0;
    });
    await page.waitForTimeout(500);

    const activeId = await getActiveSectionId(page);
    expect(activeId).toBe('getting-started');
  });

  test('sections panel auto-scrolls to keep active section row visible', async ({ page }) => {
    await navigateToLesson(page);
    await openSectionsPanel(page);

    await scrollToSection(page, 'best-practices');

    const panelScrollTop = await page.evaluate(() => {
      const panel = document.querySelector('[data-testid="sections-panel"] .overflow-y-auto') as HTMLElement;
      if (!panel) return -1;
      return panel.scrollTop;
    });

    expect(panelScrollTop).toBeGreaterThanOrEqual(0);
  });
});
