const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/emirf/AppData/Local/Temp/ss_home_light.png' });

  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/emirf/AppData/Local/Temp/ss_home_dark.png' });

  await page.goto('http://localhost:5174/menu/food');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:/Users/emirf/AppData/Local/Temp/ss_food_dark.png' });
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'C:/Users/emirf/AppData/Local/Temp/ss_food_light.png' });

  await browser.close();
  console.log('done');
})();
