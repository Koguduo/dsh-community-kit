#!/usr/bin/env node
/**
 * 榄旀惌(ModelScope) 棣栨鐧诲綍鑴氭湰
 *
 * 鐢ㄩ€旓細鎵撳紑涓€涓?*涓撶敤**娴忚鍣?profile锛堜笉纰颁綘鏃ュ父 Edge 鐨勯厤缃級锛? * 浣犲湪绐楀彛閲屾壂鐮?鐭俊鐧诲綍涓€娆★紝鐧诲綍鎬佷細淇濆瓨鍦ㄨ profile 閲岋紝
 * 涔嬪悗 daily.mjs 姣忓ぉ澶嶇敤銆? *
 * 鐢ㄦ硶锛? *   node modelscope-daily/login.mjs
 *
 * 鐧诲綍鎬佺洰褰曪細
 *   %LOCALAPPDATA%\dsh-automation\modelscope-profile
 */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const root = process.env.DSH_AUTOMATION_DIR || 'K:\\AI\\DSH-Automation';
const profileDir = path.join(root, 'modelscope-profile');
fs.mkdirSync(profileDir, { recursive: true });

const ctx = await chromium.launchPersistentContext(profileDir, {
  channel: 'msedge',
  headless: false,
  viewport: { width: 1280, height: 860 },
  locale: 'zh-CN',
  args: ['--disable-blink-features=AutomationControlled'],
});

const page = ctx.pages()[0] || (await ctx.newPage());
await page.goto('https://modelscope.cn/my/overview', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});

console.log('璇峰湪寮瑰嚭鐨勭獥鍙ｉ噷鐧诲綍榄旀惌锛堟壂鐮?鎵嬫満鍙峰潎鍙級锛岀櫥褰曟垚鍔熷悗鏈剼鏈細鑷姩閫€鍑恒€?);
console.log('绛夊緟鐧诲綍涓紙鏈€澶?5 鍒嗛挓锛?..');

let ok = false;
for (let i = 0; i < 100; i++) {
  await page.waitForTimeout(3000);
  const txt = await page.evaluate(() => document.body.innerText.slice(0, 3000)).catch(() => '');
  const loggedIn = /涓汉涓婚〉|鎴戠殑Notebook|璐﹀彿璁剧疆/.test(txt) && !/璇风櫥褰晐鎵爜鐧诲綍|鎵嬫満鍙风櫥褰?.test(txt);
  if (loggedIn) {
    ok = true;
    break;
  }
}

if (ok) {
  console.log('鉁?鐧诲綍鎴愬姛锛岀櫥褰曟€佸凡淇濆瓨鍒帮細', profileDir);
  await page.waitForTimeout(1500);
} else {
  console.log('鉂?5 鍒嗛挓鍐呮湭妫€娴嬪埌鐧诲綍鐘舵€併€傚彲浠ラ噸璺戞湰鑴氭湰鍐嶈瘯銆?);
  process.exitCode = 1;
}
await ctx.close();