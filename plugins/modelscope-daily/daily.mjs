#!/usr/bin/env node
/**
 * 魔搭(ModelScope) 每日魔粒自动领取
 *
 * 逻辑：
 *   1. 用专用 profile 打开 /my/overview（登录态复用 login.mjs 保存的）
 *   2. 读「Magic Cube」按钮上的魔粒数
 *   3. 先扫描页面上「签到/领取」类按钮，找不到就点开 Magic Cube 再扫描
 *   4. 点击后复核魔粒数变化，写日志
 *
 * 用法：
 *   node plugins/modelscope-daily/daily.mjs                 # 无头（计划任务用）
 *   node plugins/modelscope-daily/daily.mjs --headed        # 有头，肉眼观察
 *   node plugins/modelscope-daily/daily.mjs --headed --dump # 额外保存页面文本/截图
 *
 * 魔粒规则：每天登录送 200 + 绑阿里云 50，当日有效，不用就清零。
 */
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
  const rx = /签到|领取/;
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
  const loggedIn = /个人主页|我的Notebook|账号设置/.test(bodyText) && !/请登录|扫码登录|手机号登录/.test(bodyText);
  log('loggedIn =', loggedIn, '| url =', page.url());
  if (!loggedIn) {
    log('NEED_LOGIN: 登录态失效，请运行 node plugins/modelscope-daily/login.mjs');
    process.exitCode = 2;
    await ctx.close();
    process.exit();
  }

  const before = await readBalance();
  log('魔粒余额（点击前）=', before);

  let claimed = false;
  claimed = await clickClaimLike('page');
  if (!claimed) {
    const cube = page.locator('button[aria-label="Magic Cube"]').first();
    if (await cube.count().catch(() => 0)) {
      await cube.click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(1500);
      claimed = await clickClaimLike('magic-cube');
      if (!claimed) log('页面/Magic Cube 内未找到「签到/领取」按钮（可能登录即自动发放）');
      await page.keyboard.press('Escape').catch(() => {});
    } else {
      log('未找到 Magic Cube 按钮');
    }
  }

  await page.waitForTimeout(2000);
  const after = await readBalance();
  const delta = before != null && after != null ? after - before : null;
  log('魔粒余额（点击后）=', after, '| 变化 =', delta);
  log(claimed ? 'RESULT: CLAIMED' : 'RESULT: VISITED_ONLY');

  if (dump) {
    fs.writeFileSync(path.join(root, 'last-dump.txt'), await page.evaluate(() => document.body.innerText));
    fs.writeFileSync(path.join(root, 'last-dump.html'), await page.content());
    await page.screenshot({ path: path.join(root, 'last-dump.png') }).catch(() => {});
    log('dump 已保存到', root);
  }
  process.exitCode = 0;
} catch (e) {
  log('ERROR', e.message);
  await page.screenshot({ path: path.join(root, 'error.png') }).catch(() => {});
  process.exitCode = 1;
} finally {
  await ctx.close();
}