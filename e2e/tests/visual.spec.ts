import { test, expect } from '../fixtures';

test.describe('Visual regression', () => {
  test('CourseList page', async ({ page }) => {
    await page.waitForSelector('button:has-text("Introduction to Programming")');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('course-list.png', { maxDiffPixels: 200 });
  });

  test('ModuleList page', async ({ page }) => {
    await page.waitForSelector('button:has-text("Introduction to Programming")');
    await page.click('button:has-text("Introduction to Programming")');
    await page.waitForSelector('button:has-text("Getting Started")');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('module-list.png', { maxDiffPixels: 200 });
  });

  test('Lesson page top', async ({ page }) => {
    await page.waitForSelector('button:has-text("Introduction to Programming")');
    await page.click('button:has-text("Introduction to Programming")');
    await page.waitForSelector('button:has-text("Getting Started")');
    await page.click('button:has-text("Getting Started")');
    await page.waitForSelector('text=Welcome to Introduction to Programming');
    await page.waitForTimeout(600);
    await expect(page).toHaveScreenshot('lesson-top.png', { maxDiffPixels: 200 });
  });

  test('Lesson page scrolled down', async ({ page }) => {
    await page.waitForSelector('button:has-text("Introduction to Programming")');
    await page.click('button:has-text("Introduction to Programming")');
    await page.waitForSelector('button:has-text("Getting Started")');
    await page.click('button:has-text("Getting Started")');
    await page.waitForSelector('text=Welcome to Introduction to Programming');
    await page.waitForTimeout(600);
    await page.evaluate(() => {
      const scroller = document.querySelector('.overflow-y-auto') as HTMLElement;
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    });
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('lesson-bottom.png', { maxDiffPixels: 200 });
  });

  test('Quiz page', async ({ page }) => {
    await page.waitForSelector('button:has-text("Introduction to Programming")');
    await page.click('button:has-text("Introduction to Programming")');
    await page.waitForSelector('button:has-text("Getting Started")');
    await page.click('button:has-text("Getting Started")');
    await page.waitForSelector('text=Welcome to Introduction to Programming');
    await page.waitForTimeout(600);
    const quizBtn = page.locator('button:has-text("Quiz"), button:has-text("quiz"), [data-testid="quiz-tab"], [aria-label="Quiz"]');
    if (await quizBtn.isVisible()) {
      await quizBtn.click();
      await page.waitForTimeout(500);
    }
    await expect(page).toHaveScreenshot('quiz.png', { maxDiffPixels: 200 });
  });
});
