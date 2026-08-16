import { chromium, devices } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  
  const viewports = [
    { name: 'desktop', viewport: { width: 1280, height: 720 } },
    { name: 'tablet', viewport: { width: 800, height: 600 } },
    { name: 'mobile', ...devices['iPhone 13'] }
  ];

  for (const vp of viewports) {
    console.log(`Taking screenshots for ${vp.name}...`);
    
    const contextOptions = { ...vp };
    delete contextOptions.name;
    
    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    
    // Navigate to the app
    await page.goto('http://localhost:5173');
    
    // Wait for the app to load
    await page.waitForTimeout(1000);
    
    // Take screenshot of Start Screen
    await page.screenshot({ path: `${vp.name}_start_screen.png` });
    
    // Navigate to load game
    await page.click('button:has-text("Load Game")');
    await page.waitForTimeout(1000);
    
    // Take screenshot of Load Screen
    await page.screenshot({ path: `${vp.name}_load_screen.png` });
    
    // Open import modal
    await page.click('button:has-text("Import saved game")');
    
    // Upload save file
    const filePath = path.resolve(process.cwd(), 'tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav');
    await page.setInputFiles('input[type="file"]', filePath);
    
    // Name the run
    await page.fill('input[placeholder="e.g., FireRed Hardcore Nuzlocke"]', `Screenshot Run ${vp.name}`);
    await page.click('button:has-text("Save Run")');
    
    // Click on the run
    await page.click(`h2:has-text("Screenshot Run ${vp.name}")`);
    
    // Wait for party to load
    await page.waitForSelector('h2:has-text("Your Team")');
    
    // Wait a bit for rendering
    await page.waitForTimeout(1000);
  
    // Take screenshot of Party
    await page.screenshot({ path: `${vp.name}_party_screen.png` });
    
    // Click on PC Storage in the sidebar
    await page.click('a:has-text("PC Boxes")');
    
    // Wait a bit for rendering
    await page.waitForTimeout(1000);
    
    // Take screenshot of PC Storage
    await page.screenshot({ path: `${vp.name}_pc_screen.png` });
    
    // Click on Graveyard
    await page.click('a:has-text("Dead Pokémon")');
    
    // Wait a bit
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await page.screenshot({ path: `${vp.name}_graveyard_screen.png` });
    
    await context.close();
  }
  
  await browser.close();
  console.log('Screenshots taken!');
})();
