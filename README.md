# Track! 我们的小账本

一个可安装到 iPhone 主屏幕的美元记账 PWA。

## 部署

把本目录里的文件部署到任意 HTTPS 静态托管即可，例如 GitHub Pages、Vercel 或 Netlify。

部署后，在 iPhone Safari 打开线上地址，点击分享按钮，选择“添加到主屏幕”。

## 数据

账本数据保存在当前设备浏览器的 `localStorage`。换手机或清除 Safari 网站数据前，请先在应用里导出 JSON 备份。

## 文件

- `index.html`：应用页面
- `styles.css`：界面样式
- `app.js`：记账和分析逻辑
- `manifest.webmanifest`：PWA 安装信息
- `sw.js`：离线缓存
- `app-icon.png` / `icon.svg`：主屏幕图标
