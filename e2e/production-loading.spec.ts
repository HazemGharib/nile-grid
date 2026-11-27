import { test, expect } from '@playwright/test';

/**
 * Production-build smoke tests.
 * Run with: npm run test:e2e:prod
 *
 * Asserts the Vite production build reaches MainMenu/GameScene
 * within a hard time budget — catching async-preload / SW stalls.
 */

type SceneInfo = { key: string; active: boolean; visible: boolean };

async function getActiveScenes(page: import('@playwright/test').Page): Promise<SceneInfo[]> {
  return page.evaluate(() => {
    const g = (window as unknown as {
      game?: {
        scene?: {
          scenes: Array<{
            scene: { key: string; isActive: () => boolean; isVisible: () => boolean };
          }>;
        };
      };
    }).game;
    if (!g?.scene?.scenes) return [];
    return g.scene.scenes.map((s) => ({
      key: s.scene.key,
      active: s.scene.isActive(),
      visible: s.scene.isVisible(),
    }));
  });
}

async function waitForScene(
  page: import('@playwright/test').Page,
  sceneKey: string,
  timeoutMs: number
): Promise<SceneInfo[]> {
  const deadline = Date.now() + timeoutMs;
  let last: SceneInfo[] = [];
  while (Date.now() < deadline) {
    last = await getActiveScenes(page);
    if (last.some((s) => s.key === sceneKey && s.active)) {
      return last;
    }
    await page.waitForTimeout(250);
  }
  throw new Error(
    `Timed out waiting for active scene "${sceneKey}". Last state: ${JSON.stringify(last)}`
  );
}

test.describe('Production Build Loading', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ context }) => {
    // Service worker is optional for this smoke test; don't fail the page if SW fetch is blocked.
    // Prefer letting SW load normally — aborting /sw.js surfaces as an uncaught registration error.
    await context.addInitScript(() => {
      // Soften SW registration failures so e2e focuses on asset/load pipeline
      const originalRegister = navigator.serviceWorker?.register?.bind(navigator.serviceWorker);
      if (originalRegister) {
        navigator.serviceWorker.register = ((...args: Parameters<ServiceWorkerContainer['register']>) =>
          originalRegister(...args).catch(() => ({
            unregister: async () => true,
          }) as unknown as ServiceWorkerRegistration)) as typeof navigator.serviceWorker.register;
      }
    });
  });

  test('reaches MainMenuScene within 30 seconds after production load', async ({ page }) => {
    const failedAssets: string[] = [];
    const loadedArt: string[] = [];

    page.on('response', (response) => {
      if (!response.url().includes('/art/')) return;
      if (response.status() !== 200) {
        failedAssets.push(`${response.url()} -> ${response.status()}`);
      } else {
        loadedArt.push(response.url());
      }
    });

    const pageErrors: string[] = [];
    page.on('pageerror', (err) => {
      // Ignore known SW registration noise; fail on anything else
      if (/ServiceWorker|service worker/i.test(err.message)) return;
      pageErrors.push(err.message);
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });

    const scenes = await waitForScene(page, 'MainMenuScene', 30000);

    expect(pageErrors).toEqual([]);
    expect(scenes.some((s) => s.key === 'MainMenuScene' && s.active)).toBe(true);
    expect(scenes.some((s) => s.key === 'LoadingScene' && s.active)).toBe(false);
    expect(failedAssets).toEqual([]);
    expect(loadedArt.some((u) => u.includes('sprites.json'))).toBe(true);
    expect(loadedArt.some((u) => u.includes('ismailia-m1-3.json'))).toBe(true);
    expect(loadedArt.some((u) => u.includes('ground.png'))).toBe(true);
    expect(loadedArt.length).toBeGreaterThan(20);
  });

  test('can leave MainMenu into gameplay within budget', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });
    await waitForScene(page, 'MainMenuScene', 30000);

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();

    // Click center of canvas (START button area), then Space as backup
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.keyboard.press('Space');

    const deadline = Date.now() + 20000;
    let last: SceneInfo[] = [];
    while (Date.now() < deadline) {
      last = await getActiveScenes(page);
      const pastMenu = last.some(
        (s) =>
          s.active &&
          (s.key === 'GameScene' || s.key === 'DialogueScene' || s.key === 'UIScene')
      );
      if (pastMenu) {
        expect(pastMenu).toBe(true);
        return;
      }
      // Keep trying input in case the first click missed
      await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await page.keyboard.press('Space');
      await page.waitForTimeout(400);
    }
    throw new Error(`Did not reach gameplay. Last scenes: ${JSON.stringify(last)}`);
  });
});
