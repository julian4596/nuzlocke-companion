import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Load Game")');
  await page.click('button:has-text("Import saved game")');
  
  const filePath = path.resolve(process.cwd(), 'tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav');
  await page.setInputFiles('input[type="file"]', filePath);
  
  await page.fill('input[placeholder="e.g., FireRed Hardcore Nuzlocke"]', 'Refresh Test Run');
  await page.click('button:has-text("Save Run")');
  await page.click('h2:has-text("Refresh Test Run")');
  
  await page.waitForSelector('h2:has-text("Your Team")');
  
  await page.click('a:has-text("PC Boxes")');
  await page.waitForTimeout(500);
  
  console.log("Before refresh:");
  console.log(await page.evaluate(() => document.querySelector('main')?.innerText));
  
  // REFRESH!
  console.log("Refreshing...");
  await page.reload();
  await page.waitForTimeout(2000);
  
  console.log("After refresh:");
  console.log(await page.evaluate(() => document.querySelector('main')?.innerText));
  
  await browser.close();
})();
