#!/usr/bin/env node
/**
 * 魔搭(ModelScope) 首次登录脚本
 *
 * 用途：打开一个专用浏览器 profile（不碰你日常 Edge 的配置），
 * 你在窗口里扫码/短信登录一次，登录态会保存在该 profile 里，
 * 之后 daily.mjs 每天复用。
 *
 * 用法：
 *   node plugins/modelscope-daily/login.mjs
 *
 * 登录态目录：
 *   K:\AI\DSH-Automation\modelscope-profile（可用 DSH_AUTOMATION_DIR 覆盖）
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

console.log('请在弹出的窗口里登录魔搭（扫码/手机号均可），登录成功后本脚本会自动退出。');
console.log('等待登录中（最多 5 分钟）...');

let ok = false;
for (let i = 0; i < 100; i++) {
  await page.waitForTimeout(3000);
  const txt = await page.evaluate(() => document.body.innerText.slice(0, 3000)).catch(() => '');
  const loggedIn = /个人主页|我的Notebook|账号设置/.test(txt) && !/请登录|扫码登录|手机号登录/.test(txt);
  if (loggedIn) {
    ok = true;
    break;
  }
}

if (ok) {
  console.log('登录成功，登录态已保存到：', profileDir);
  await page.waitForTimeout(1500);
} else {
  console.log('5 分钟内未检测到登录状态。可以重跑本脚本再试。');
  process.exitCode = 1;
}
await ctx.close();