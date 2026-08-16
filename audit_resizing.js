import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  
  const viewports = [
    { name: 'mobile-xs', width: 320, height: 568 },
    { name: 'mobile-sm', width: 480, height: 850 },
    { name: 'tablet-sm', width: 640, height: 960 },
    { name: 'tablet-md', width: 768, height: 1024 },
    { name: 'desktop-lg', width: 1024, height: 768 },
    { name: 'desktop-xl', width: 1280, height: 800 },
    { name: 'desktop-2xl', width: 1536, height: 864 }
  ];

  for (const vp of viewports) {
    console.log(`Taking screenshots for ${vp.name}...`);
    
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Load Game")').catch(() => {});
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Import saved game")').catch(() => {});
    
    const filePath = path.resolve(process.cwd(), 'tests/fixtures/Pokemon Blaze Black v3.1 - Complete.sav');
    await page.setInputFiles('input[type="file"]', filePath).catch(() => {});
    
    await page.fill('input[placeholder="e.g., FireRed Hardcore Nuzlocke"]', `Audit Run ${vp.name}`).catch(() => {});
    await page.click('button:has-text("Save Run")').catch(() => {});
    
    await page.click(`h2:has-text("Audit Run ${vp.name}")`).catch(() => {});
    
    await page.waitForSelector('h2:has-text("Your Team")', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);
  
    await page.screenshot({ path: `audit_${vp.name}_party.png` });
    
    await page.click('a:has-text("PC Boxes")').catch(() => {});
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: `audit_${vp.name}_pc.png` });
    
    await context.close();
  }
  
  await browser.close();
  console.log('Audit screenshots taken!');
})();
