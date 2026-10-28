#!/usr/bin/env node
/**
 * 魔搭(ModelScope) 每日魔粒自动领取 + 每日互动(点赞后立即取消)
 *
 * 流程：
 *   1. 专用 profile 打开 /my/overview，确认登录态，读魔粒余额
 *   2. 尝试页面上的「签到/领取」按钮（实测没有，登录即自动发放）
 *   3. 每日互动：在模型页点赞 → 等 2 秒 → 取消点赞（不留痕迹，降低风控风险）
 *      每日上限 10 次（+2 魔粒/次）
 *   4. 复核额度计数与余额，写日志
 *
 * 用法：
 *   node plugins/modelscope-daily/daily.mjs                    # 无头 + 互动
 *   node plugins/modelscope-daily/daily.mjs --headed --dump    # 有头 + 存页面快照
 *   node plugins/modelscope-daily/daily.mjs --no-likes         # 只登录，不互动
 *   node plugins/modelscope-daily/daily.mjs --likes-max 3      # 本次最多做 3 个
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
const noLikes = argv.includes('--no-likes');
const likesMaxArg = argv.indexOf('--likes-max');
const likesMax = likesMaxArg >= 0 ? Math.max(0, Number(argv[likesMaxArg + 1]) || 0) : 10;

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
  viewport: { width: 1440, height: 1000 },
  locale: 'zh-CN',
  args: ['--disable-blink-features=AutomationControlled'],
});
const page = ctx.pages()[0] || (await ctx.newPage());

const ICON = {
  outline: (h) => h.includes('shoucangzhuangtai216x16'),
  fill: (h) => /zhuangtai3-fill20x20/i.test(h),
};

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

async function likeState() {
  return page.evaluate((icons) => {
    const href = (x) => x.getAttribute('href') || x.getAttribute('xlink:href') || '';
    const uses = Array.from(document.querySelectorAll('use'));
    const counts = (re) => uses.filter((x) => (typeof re === 'string' ? href(x).includes(re) : re.test(href(x)))).length;
    return { outline: counts('shoucangzhuangtai216x16'), fill: counts(/zhuangtai3-fill20x20/i) };
  }, null).catch(() => ({ outline: 0, fill: 0 }));
}

async function clickIcon(mode) {
  const h = await page.evaluateHandle((mode) => {
    const href = (x) => x.getAttribute('href') || x.getAttribute('xlink:href') || '';
    const match = (h) => (mode === 'outline' ? h.includes('shoucangzhuangtai216x16') : /zhuangtai3-fill20x20/i.test(h));
    const uses = Array.from(document.querySelectorAll('use')).filter((x) => match(href(x)));
    if (!uses.length) return null;
    const top = uses
      .map((x) => ({ x, y: (x.getBoundingClientRect && x.getBoundingClientRect().y) || 0 }))
      .sort((a, b) => a.y - b.y)[0].x;
    return top.closest('button, [role="button"], [data-autolog]') || top.closest('svg')?.parentElement || top;
  }, mode);
  const el = h.asElement();
  if (!el) return false;
  await el.click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(2200);
  return true;
}

async function likesRemaining() {
  await page.goto('https://modelscope.cn/magicube/usage?tab=earn', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3500);
  const text = await page.evaluate(() => document.body.innerText).catch(() => '');
  const m = text.match(/收藏\/喜欢[\s\S]{0,80}?今日剩余\s*(\d+)\s*次/);
  return m ? Number(m[1]) : null;
}

try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 3000)).catch(() => '');
  const loggedIn = /个人主页|我的Notebook|账号设置/.test(bodyText) && !/请登录|扫码登录|手机号登录/.test(bodyText);
  log('loggedIn =', loggedIn, '| url =', page.url());
  if (!loggedIn) {
    log('NEED_LOGIN: 登录态失效，请运行 login.mjs');
    process.exitCode = 2;
    await ctx.close();
    process.exit();
  }

  const before = await readBalance();
  log('魔粒余额（开始前）=', before);

  let claimed = await clickClaimLike('page');
  if (!claimed) {
    const cube = page.locator('button[aria-label="Magic Cube"]').first();
    if (await cube.count().catch(() => 0)) {
      await cube.click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(1500);
      claimed = await clickClaimLike('magic-cube');
      await page.keyboard.press('Escape').catch(() => {});
    }
  }
  log(claimed ? 'CLAIM: clicked' : 'CLAIM: 无按钮（登录即发放）');

  let done = 0;
  let tried = 0;
  let remaining = null;
  if (!noLikes && likesMax > 0) {
    remaining = await likesRemaining();
    log('互动额度 今日剩余 =', remaining);
    const target = Math.min(likesMax, remaining == null ? likesMax : remaining);

    if (target > 0) {
      await page.goto('https://modelscope.cn/models?page=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(4000);
      const links = await page.$$eval('a[href*="/models/"]', (as) =>
        [...new Set(as.map((a) => a.href.split('?')[0]).filter((u) => /\/models\/[^/]+\/[^/]+$/.test(u)))],
      ).catch(() => []);

      for (const link of links) {
        if (done >= target) break;
        if (tried >= target + 12) break;
        tried++;
        try {
          await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 45000 });
          await page.waitForTimeout(3500);
          const st0 = await likeState();
          if (st0.fill > 0) {
            log('skip (already liked):', link);
            continue;
          }
          const okLike = await clickIcon('outline');
          const st1 = await likeState();
          if (!okLike || st1.fill === 0) {
            log('like failed:', link, JSON.stringify(st0), '->', JSON.stringify(st1));
            continue;
          }
          await page.waitForTimeout(800);
          const okUnlike = await clickIcon('fill');
          const st2 = await likeState();
          if (!okUnlike || st2.fill > 0) {
            log('UNLIKE FAILED, 请手动取消:', link, JSON.stringify(st2));
            continue;
          }
          done++;
          log(`like+unlike ok (${done}/${target}):`, link);
        } catch (e) {
          log('like phase error:', link, e.message);
        }
      }
    }
  } else if (noLikes) {
    log('互动已跳过 (--no-likes)');
  }

  const after = await readBalance();
  log('魔粒余额（结束后）=', after, '| 变化 =', before != null && after != null ? after - before : null);
  log('互动完成数 =', done, '| 尝试页面数 =', tried, '| 剩余额度(开始前) =', remaining);

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