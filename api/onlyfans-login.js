import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed' });
  }

  const { username, password } = req.body;

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto('https://onlyfans.com/login', { waitUntil: 'networkidle2' });

    await page.type('input[name=email]', username);
    await page.type('input[name=password]', password);
    await page.click('button[type=submit]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await browser.close();

    res.status(200).json({ success: true, message: 'Login attempted for user', username });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
}