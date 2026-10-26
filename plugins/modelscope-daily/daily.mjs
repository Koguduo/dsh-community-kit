#!/usr/bin/env node
/**
 * 榄旀惌(ModelScope) 姣忔棩榄旂矑鑷姩棰嗗彇
 *
 * 閫昏緫锛? *   1. 鐢ㄤ笓鐢?profile 鎵撳紑 /my/overview锛堢櫥褰曟€佸鐢?login.mjs 淇濆瓨鐨勶級
 *   2. 璇汇€孧agic Cube銆嶆寜閽笂鐨勯瓟绮掓暟
 *   3. 鍏堟壂鎻忛〉闈笂銆岀鍒?棰嗗彇銆嶇被鎸夐挳锛屾壘涓嶅埌灏辩偣寮€ Magic Cube 鍐嶆壂鎻? *   4. 鐐瑰嚮鍚庡鏍搁瓟绮掓暟鍙樺寲锛屽啓鏃ュ織
 *
 * 鐢ㄦ硶锛? *   node modelscope-daily/daily.mjs                 # 鏃犲ご锛堣鍒掍换鍔＄敤锛? *   node modelscope-daily/daily.mjs --headed        # 鏈夊ご锛岃倝鐪艰瀵? *   node modelscope-daily/daily.mjs --headed --dump # 棰濆淇濆瓨椤甸潰鏂囨湰/鎴浘锛屼究浜庤皟閫夋嫨鍣? *
 * 榄旂矑瑙勫垯锛氭瘡澶╃櫥褰曢€?200 + 缁戦樋閲屼簯 50锛屽綋鏃ユ湁鏁堬紝涓嶇敤灏辨竻闆躲€? */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const root = process.env.DSH_AUTOMATION_DIR || 'K:\\AI\\DSH-Automation';
const profileDir = path.join(root, 'modelscope-profile');
const logDir = path.join(root, 'logs');
fs.mkdirSync(logDir, { recursive: true });

const argv = process.argv.slice(2);
const headed = argv.includes('--headed');
const dump = argv.includes('--dump');
const url = process.env.MODELSCOPE_URL || 'https://modelscope.cn/my/overview';
const stamp = () => new Date().toISOString();
const today = () => stamp().slice(0, 10);
const log = (...a) => {
  const line = `[${stamp()}] ${a.join(' ')}`;
  console.log(line);
  fs.appendFileSync(path.join(logDir, `${today()}.log`), line + '\n');
};

const ctx = await chromium.launchPersistentContext(profileDir, {
  channel: 'msedge',
  headless: !headed,
  viewport: { width: 1280, height: 860 },
  locale: 'zh-CN',
  args: ['--disable-blink-features=AutomationControlled'],
});
const page = ctx.pages()[0] || (await ctx.newPage());

async function readBalance() {
  return page.evaluate(() => {
    const el = document.querySelector('button[aria-label="Magic Cube"]');
    if (!el) return null;
    const n = (el.textContent || '').replace(/[^\d]/g, '');
    return n ? Number(n) : null;
  }).catch(() => null);
}

async function clickClaimLike(label) {
  // 鍊欓€?1锛氳涔夋寜閽?  const rx = /绛惧埌|棰嗗彇/;
  const locs = [page.locator('button, a, [role="button"]'), page.locator('[class*="btn"]')];
  for (const loc of locs) {
    const n = await loc.count().catch(() => 0);
    for (let i = 0; i < Math.min(n, 300); i++) {
      const el = loc.nth(i);
      const txt = ((await el.innerText().catch(() => '')) || '').trim();
      if (!txt || txt.length > 8 || !rx.test(txt)) continue;
      if (!(await el.isVisible().catch(() => false))) continue;
      if (!(await el.isEnabled().catch(() => true))) continue;
      await el.click({ timeout: 2500 }).catch(() => {});
      log(`clicked [${label}] "${txt}"`);
      return true;
    }
  }
  return false;
}

try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 3000)).catch(() => '');
  const loggedIn = /涓汉涓婚〉|鎴戠殑Notebook|璐﹀彿璁剧疆/.test(bodyText) && !/璇风櫥褰晐鎵爜鐧诲綍|鎵嬫満鍙风櫥褰?.test(bodyText);
  log('loggedIn =', loggedIn, '| url =', page.url());
  if (!loggedIn) {
    log('NEED_LOGIN: 鐧诲綍鎬佸け鏁堬紝璇疯繍琛?node modelscope-daily/login.mjs');
    process.exitCode = 2;
    await ctx.close();
    process.exit();
  }

  const before = await readBalance();
  log('榄旂矑浣欓锛堢偣鍑诲墠锛?', before);

  let claimed = false;
  claimed = await clickClaimLike('page');
  if (!claimed) {
    const cube = page.locator('button[aria-label="Magic Cube"]').first();
    if (await cube.count().catch(() => 0)) {
      await cube.click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(1500);
      claimed = await clickClaimLike('magic-cube');
      if (!claimed) log('椤甸潰/Magic Cube 鍐呮湭鎵惧埌銆岀鍒?棰嗗彇銆嶆寜閽紙鍙兘鐧诲綍鍗宠嚜鍔ㄥ彂鏀撅級');
      await page.keyboard.press('Escape').catch(() => {});
    } else {
      log('鏈壘鍒?Magic Cube 鎸夐挳');
    }
  }

  await page.waitForTimeout(2000);
  const after = await readBalance();
  const delta = before != null && after != null ? after - before : null;
  log('榄旂矑浣欓锛堢偣鍑诲悗锛?', after, '| 鍙樺寲 =', delta);
  log(claimed ? 'RESULT: CLAIMED' : 'RESULT: VISITED_ONLY');

  if (dump) {
    fs.writeFileSync(path.join(root, 'last-dump.txt'), await page.evaluate(() => document.body.innerText));
    fs.writeFileSync(path.join(root, 'last-dump.html'), await page.content());
    await page.screenshot({ path: path.join(root, 'last-dump.png') }).catch(() => {});
    log('dump 宸蹭繚瀛樺埌', root);
  }
  process.exitCode = 0;
} catch (e) {
  log('ERROR', e.message);
  await page.screenshot({ path: path.join(root, 'error.png') }).catch(() => {});
  process.exitCode = 1;
} finally {
  await ctx.close();
}