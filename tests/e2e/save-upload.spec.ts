import { test, expect } from '@playwright/test';
import path from 'path';

test('uploading the Pokemon Blaze Black save file successfully parses the team', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');

  // Find the file input and upload the save file
  const fileInput = page.locator('input[type="file"]');
  const filePath = path.resolve(process.cwd(), 'tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav');
  await fileInput.setInputFiles(filePath);

  // The provided save file now contains a valid team of 6 Pokemon
  // The app should successfully parse it and display the team.
  await expect(page.locator('h2:has-text("Your Team")')).toBeVisible();

  // Verify the team renders with exactly 6 Pokemon
  const pokemonCards = page.locator('.pokemon-card');
  await expect(pokemonCards).toHaveCount(6);
  
  // Verify that the first slot contains the nickname TEWOTT
  await expect(page.locator('text=TEWOTT')).toBeVisible();
});
