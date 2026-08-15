import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to the app
  await page.goto('http://localhost:5173');
  
  // Wait for the app to load
  await page.waitForTimeout(1000);
  
  // Take screenshot of Start Screen
  await page.screenshot({ path: 'start_screen.png' });
  
  // Navigate to load game
  await page.click('button:has-text("Load Game")');
  
  // Open import modal
  await page.click('button:has-text("Import saved game")');
  
  // Upload save file
  const filePath = path.resolve(process.cwd(), 'tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav');
  await page.setInputFiles('input[type="file"]', filePath);
  
  // Name the run
  await page.fill('input[placeholder="e.g., FireRed Hardcore Nuzlocke"]', 'Screenshot Run');
  await page.click('button:has-text("Save Run")');
  
  // Click on the run
  await page.click('h2:has-text("Screenshot Run")');
  
  // Wait for party to load
  await page.waitForSelector('h2:has-text("Your Team")');
  
  // Wait a bit for rendering
  await page.waitForTimeout(500);

  // Take screenshot of Party
  await page.screenshot({ path: 'party.png' });
  
  // Click on PC Storage in the sidebar
  await page.click('a:has-text("PC Boxes")');
  
  // Wait a bit for rendering
  await page.waitForTimeout(500);
  
  // Take screenshot of PC Storage
  await page.screenshot({ path: 'pc_storage.png' });
  
  // Click on Graveyard
  await page.click('a:has-text("Dead Pokémon")');
  
  // Wait a bit
  await page.waitForTimeout(500);
  
  // Take screenshot
  await page.screenshot({ path: 'graveyard.png' });
  
  await browser.close();
  console.log('Screenshots taken!');
})();
