# 榄旀惌(ModelScope) 姣忔棩榄旂矑鑷姩棰嗗彇

> 榄旂矑瑙勫垯锛氭瘡澶╃櫥褰曢€?**200**锛岀粦瀹氶樋閲屼簯鍐?**+50**锛屽叡 **250/澶?*锛?*褰撴棩鏈夋晥**銆佷笉鐢ㄦ竻闆躲€?> 鏈柟妗堢敤 Playwright 椹卞姩涓€涓?*涓撶敤** Edge profile锛屾瘡澶╃櫥褰曚竴娆″苟灏濊瘯鐐广€岀鍒?棰嗗彇銆嶏紝
> 鐢?Windows 浠诲姟璁″垝瀹氭椂鎵ц锛岀櫥褰曟€佸拰鏃ュ織閮界暀鍦ㄦ湰鏈恒€?
## 涓€娆℃€у噯澶?
```powershell
cd D:\Documents\deepseek-harness\default-workspace

# 1) 鐧诲綍涓€娆★紙浼氬脊鍑烘祻瑙堝櫒绐楀彛锛屾壂鐮?鐭俊鐧诲綍锛屾垚鍔熷悗鑷姩鍏抽棴锛?node modelscope-daily\login.mjs

# 2) 鎵嬪姩楠岃瘉涓€杞紙鏈夊ご锛岃兘浜茬溂鐪嬪埌瀹冪偣浜嗕粈涔堬級
node modelscope-daily\daily.mjs --headed --dump

# 3) 娉ㄥ唽姣忓ぉ 08:30 鐨勮鍒掍换鍔?powershell -ExecutionPolicy Bypass -File modelscope-daily\install-task.ps1
```

## 鏂囦欢璇存槑

| 鏂囦欢 | 浣滅敤 |
|---|---|
| `login.mjs` | 棣栨鐧诲綍锛岀櫥褰曟€佸啓鍏ヤ笓鐢?profile |
| `daily.mjs` | 姣忔棩鎵ц锛氭墦寮€ `/my/overview` 鈫?璇婚瓟绮掓暟 鈫?鐐圭鍒?棰嗗彇 鈫?澶嶆牳浣欓鍙樺寲 鈫?鍐欐棩蹇?|
| `install-task.ps1` | 娉ㄥ唽/鏇存柊 Windows 璁″垝浠诲姟锛堟瘡澶?08:30锛岄敊杩囧紑鏈鸿ˉ璺戯級 |
| `run-daily.cmd` | 澶囩敤鍏ュ彛锛堟墜鍔?璋冭瘯鐢級 |

## 鏁版嵁浣嶇疆锛堥兘鍦ㄦ湰鏈猴紝涓嶈繘 workspace锛?
```
K:\AI\DSH-Automation\
鈹溾攢 modelscope-profile\     # 涓撶敤娴忚鍣?profile锛堝惈鐧诲綍鎬侊紝鍒嫹璐?涓婁紶锛?鈹斺攢 logs\                   # YYYY-MM-DD.log銆乼ask.log锛涘け璐ユ椂 error.png
```

`--dump` 浼氭妸椤甸潰鏂囨湰/HTML/鎴浘鍐欏埌 `K:\AI\DSH-Automation\`锛岀敤浜庢帓鏌ラ€夋嫨鍣ㄣ€?
## 鏃ュ織鍒よ

- `RESULT: CLAIMED` 鈥?鎵惧埌浜嗗苟鐐逛簡銆岀鍒?棰嗗彇銆?- `RESULT: VISITED_ONLY` 鈥?娌℃壘鍒版寜閽紙寰堝彲鑳界櫥褰曞嵆鑷姩鍙戞斁 200锛屽睘姝ｅ父锛?- `NEED_LOGIN` 鈥?鐧诲綍鎬佸け鏁堬紝閲嶈窇 `login.mjs` 鍗冲彲锛堥€氬父鍑犱釜鏈堜竴娆★級

## 娉ㄦ剰

- 杩欐槸**缃戦〉鑷姩鍖?*锛堢瓑浠蜂簬浣犳墜鍔ㄥ紑娴忚鍣ㄧ櫥褰曪級锛屼笉鏄皟 API锛涙敼鐗堝彲鑳借閫夋嫨鍣ㄥけ鏁堬紝灞婃椂鐢?`--dump` 閲嶆柊瀵逛竴涓嬫寜閽枃妗堬紙鑴氭湰宸叉敮鎸併€岀鍒?棰嗗彇銆嶅鏂囨鍏滃簳锛夈€?- 涓嶈鎶婅繖涓洰褰曟彁浜ゅ埌浠讳綍浠撳簱锛沗modelscope-profile` 閲屾湁浣犵殑鐧诲綍鎬併€?- 鑻ュ叕鍙?瀛︽牎缃戠粶鎴栦唬鐞嗗奖鍝嶈闂紝鑴氭湰璧扮郴缁熼粯璁ょ綉缁滐紙涓嶅己鍒朵唬鐞嗭級銆