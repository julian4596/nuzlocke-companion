import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Julian/.gemini/antigravity/brain/f98719b2-e7d2-43cf-b540-8cc5d9c3b830';

test.describe('Blaze Black All Fixtures E2E and Visual Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and indexedDB before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      indexedDB.deleteDatabase('keyval-store');
    });
  });

  test('Julian Save: Team (6 Pokemon) and PC Storage (Sentret in Box 1)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // Navigate to Load Game and Import
    await page.click('button:has-text("Load Game")');
    await page.click('button:has-text("Import saved game")');

    const filePath = path.resolve(process.cwd(), 'tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav');
    await page.setInputFiles('input[type="file"]', filePath);

    await page.fill('input[placeholder="e.g., FireRed Hardcore Nuzlocke"]', 'Julian - Blaze Black');
    await page.click('button:has-text("Save Run")');

    // Click to open the run
    await page.locator('h2', { hasText: 'Julian - Blaze Black' }).click();

    // 1. Verify Team View
    await expect(page.locator('h2:has-text("Your Team")')).toBeVisible();
    await expect(page.locator('.pokemon-card')).toHaveCount(6);
    await expect(page.locator('.pokemon-card').filter({ hasText: 'TEWOTT' })).toBeVisible();
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'julian_team.png'), fullPage: true });

    // 2. Verify PC Storage View
    await page.click('a:has-text("PC Boxes")');
    await expect(page.locator('h2:has-text("PC Storage")')).toBeVisible();
    await expect(page.locator('.pokemon-card')).toHaveCount(1);
    await expect(page.locator('.pokemon-card').filter({ hasText: 'Sentret' })).toBeVisible();
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'julian_pc_storage.png'), fullPage: true });
  });

  test('Ricky 1 Save: Team (3 Pokemon), PC Storage & Graveyard (1 Dead: TEWOTT)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await page.click('button:has-text("Load Game")');
    await page.click('button:has-text("Import saved game")');

    const filePath = path.resolve(process.cwd(), 'tests/fixtures/Pokemon Blaze Black v3.1 - Complete Ricky.sav');
    await page.setInputFiles('input[type="file"]', filePath);

    await page.fill('input[placeholder="e.g., FireRed Hardcore Nuzlocke"]', 'Ricky 1 - Blaze Black');
    await page.click('button:has-text("Save Run")');

    await page.locator('h2', { hasText: 'Ricky 1 - Blaze Black' }).click();

    // 1. Verify Team View (PANPAN, STARTRET, PATO)
    await expect(page.locator('h2:has-text("Your Team")')).toBeVisible();
    await expect(page.locator('.pokemon-card')).toHaveCount(3);
    await expect(page.locator('.pokemon-card').filter({ hasText: 'PANPAN' })).toBeVisible();
    await expect(page.locator('.pokemon-card').filter({ hasText: 'STARTRET' })).toBeVisible();
    await expect(page.locator('.pokemon-card').filter({ hasText: 'PATO' })).toBeVisible();
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ricky1_team.png'), fullPage: true });

    // 2. Verify PC Storage View (Before graveyard configured, TEWOTT is in PC Storage Box 8)
    await page.click('a:has-text("PC Boxes")');
    await expect(page.locator('h2:has-text("PC Storage")')).toBeVisible();
    await expect(page.locator('.pokemon-card')).toHaveCount(1);
    await expect(page.locator('.pokemon-card').filter({ hasText: 'TEWOTT' })).toBeVisible();
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ricky1_pc_storage.png'), fullPage: true });

    // 3. Set Up Graveyard (Select Box 8)
    await page.click('a:has-text("Dead Pokémon")');
    await expect(page.locator('h2:has-text("Set Up Your Graveyard")')).toBeVisible();
    await page.click('button:has-text("Box 8")');
    await page.click('button:has-text("Save Graveyard")');

    // Verify Graveyard View contains TEWOTT (1 Death)
    await expect(page.locator('h2:has-text("Graveyard")')).toBeVisible();
    await expect(page.locator('.pokemon-card')).toHaveCount(1);
    await expect(page.locator('.pokemon-card').filter({ hasText: 'TEWOTT' })).toBeVisible();
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ricky1_graveyard.png'), fullPage: true });
  });

  test('Ricky 2 Save: Team (3 Pokemon), PC Storage & Graveyard (2 Dead: TEWOTT, PATO)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await page.click('button:has-text("Load Game")');
    await page.click('button:has-text("Import saved game")');

    const filePath = path.resolve(process.cwd(), 'tests/fixtures/Pokemon Blaze Black v3.1 - Complete Ricky 2.sav');
    await page.setInputFiles('input[type="file"]', filePath);

    await page.fill('input[placeholder="e.g., FireRed Hardcore Nuzlocke"]', 'Ricky 2 - Blaze Black');
    await page.click('button:has-text("Save Run")');

    await page.locator('h2', { hasText: 'Ricky 2 - Blaze Black' }).click();

    // 1. Verify Team View (PANPAN, STARTRET, ZUUWOO)
    await expect(page.locator('h2:has-text("Your Team")')).toBeVisible();
    await expect(page.locator('.pokemon-card')).toHaveCount(3);
    await expect(page.locator('.pokemon-card').filter({ hasText: 'PANPAN' })).toBeVisible();
    await expect(page.locator('.pokemon-card').filter({ hasText: 'STARTRET' })).toBeVisible();
    await expect(page.locator('.pokemon-card').filter({ hasText: 'ZUUWOO' })).toBeVisible();
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ricky2_team.png'), fullPage: true });

    // 2. Set Up Graveyard (Select Box 8)
    await page.click('a:has-text("Dead Pokémon")');
    await expect(page.locator('h2:has-text("Set Up Your Graveyard")')).toBeVisible();
    await page.click('button:has-text("Box 8")');
    await page.click('button:has-text("Save Graveyard")');

    // Verify Graveyard View contains both TEWOTT and PATO (2 Deaths)
    await expect(page.locator('h2:has-text("Graveyard")')).toBeVisible();
    await expect(page.locator('.pokemon-card')).toHaveCount(2);
    await expect(page.locator('.pokemon-card').filter({ hasText: 'TEWOTT' })).toBeVisible();
    await expect(page.locator('.pokemon-card').filter({ hasText: 'PATO' })).toBeVisible();
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ricky2_graveyard.png'), fullPage: true });

    // 3. Verify PC Storage View (After Box 8 is set as graveyard, PC Storage has 0 non-graveyard Pokemon)
    await page.click('a:has-text("PC Boxes")');
    await expect(page.locator('h2:has-text("PC Storage")')).toBeVisible();
    await expect(page.locator('text=No Pokémon found here')).toBeVisible();
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ricky2_pc_storage.png'), fullPage: true });
  });
});
