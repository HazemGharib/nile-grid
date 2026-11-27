import { test, expect } from '@playwright/test';

test.describe('Nile Grid Game', () => {
  test('should load the game and display main menu', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });
    
    await page.waitForTimeout(2000);
  });

  test('should have correct title', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle('Nile Grid');
  });

  test('should be installable as PWA', async ({ page }) => {
    await page.goto('/');
    
    const manifestLink = await page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', /manifest/);
  });

  test('should respond to keyboard input', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForTimeout(2000);
    
    await page.click('canvas');
    
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    
    await page.waitForTimeout(500);
    
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('should handle touch events on mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'chromium', 'Tap not supported on desktop Chrome');
    
    await page.goto('/');
    
    await page.waitForTimeout(2000);
    
    const canvas = page.locator('canvas');
    await canvas.tap();
    
    await page.waitForTimeout(500);
    
    await expect(canvas).toBeVisible();
  });

  test('should maintain pixel-perfect rendering', async ({ page }) => {
    await page.goto('/');
    
    const canvas = page.locator('canvas');
    await expect(canvas).toHaveCSS('image-rendering', /pixelated|crisp-edges/);
  });
});
