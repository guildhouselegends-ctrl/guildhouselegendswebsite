import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const screenshotDir = join(__dirname, 'temporary screenshots');
if (!existsSync(screenshotDir)) {
  mkdirSync(screenshotDir, { recursive: true });
}

const existing = readdirSync(screenshotDir);
const numbers = existing
  .map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1]))
  .filter(n => !isNaN(n));
const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

const filename = label
  ? `screenshot-${nextNum}-${label}.png`
  : `screenshot-${nextNum}.png`;
const outputPath = join(screenshotDir, filename);

const chromePaths = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Users/barre/AppData/Local/Google/Chrome/Application/chrome.exe',
  'C:/Users/nateh/.cache/puppeteer/chrome/win64-131.0.6778.204/chrome-win64/chrome.exe',
];

const executablePath = chromePaths.find(p => existsSync(p));
if (!executablePath) {
  console.error('Chrome not found. Please install Google Chrome.');
  process.exit(1);
}

console.log(`Using Chrome at: ${executablePath}`);

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

// Let fonts and animations settle
await new Promise(r => setTimeout(r, 1500));

await page.screenshot({ path: outputPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved to: ${outputPath}`);
