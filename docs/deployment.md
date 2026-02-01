# Bondify 部署指南

## 🚀 正式環境部署

### 架構
- **前端**: Cloudflare Pages (免費)
- **後端**: Render Web Service (免費)
- **資料庫**: SQLite (封測階段)

---

## 📦 後端部署 (Render)

### 方法 1: 使用 Blueprint (推薦)
1. Fork 或 push 你的 repo 到 GitHub
2. 前往 [Render Dashboard](https://dashboard.render.com)
3. 點擊 "New" → "Blueprint"
4. 連接你的 GitHub repo
5. Render 會自動偵測 `render.yaml` 並部署

### 方法 2: 手動設定
1. 前往 Render Dashboard → "New" → "Web Service"
2. 連接 GitHub repo
3. 設定：
   - **Name**: `bondify-api`
   - **Region**: Singapore
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt && alembic upgrade head
     ```
   - **Start Command**: 
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```

### 環境變數 (在 Render Dashboard 設定)
| 變數 | 值 | 說明 |
|------|-----|------|
| `SECRET_KEY` | (自動產生) | JWT 密鑰 |
| `DATABASE_URL` | `sqlite+aiosqlite:///./data/app.db` | SQLite 路徑 |
| `CORS_ORIGINS` | `https://bondify.pages.dev` | 前端網域 |
| `GOOGLE_API_KEY` | `your-key` | Gemini API Key |
| `LLM_PROVIDER` | `gemini` | LLM 提供者 |

### ⚠️ 注意事項
- 免費方案會在 15 分鐘無流量後休眠
- **SQLite 資料會在重新部署時遺失** (封測可接受)
- 休眠後第一次請求需要 ~30 秒喚醒

### 🔊 TTS 說明
由於 Render 免費方案記憶體不足，Piper TTS 無法使用。
**前端會自動 fallback 到瀏覽器的 Web Speech API**，使用者不會察覺差異。

---

## 🌐 前端部署 (Cloudflare Pages)

### 步驟
1. 前往 [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
2. 點擊 "Create a project" → "Connect to Git"
3. 選擇你的 GitHub repo
4. 設定建置配置：
   - **Project name**: `bondify`
   - **Production branch**: `main`
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (專案根目錄)

### 環境變數 (在 Cloudflare Pages 設定)
| 變數 | 值 |
|------|-----|
| `VITE_API_BASE_URL` | `https://bondify-api.onrender.com` |

> **重要**: 確保這個 URL 與你的 Render 後端網址一致！

### 自訂網域 (可選)
1. 在 Pages 專案中點擊 "Custom domains"
2. 新增你的網域
3. 按照指示設定 DNS

---

## 🔧 部署後設定

### 1. 更新 CORS
部署前端後，取得 Cloudflare Pages 的網址 (例如 `bondify.pages.dev`)，
然後到 Render Dashboard 更新 `CORS_ORIGINS` 環境變數。

### 2. 測試 API
```bash
curl https://bondify-api.onrender.com/health
```

### 3. 封測聲明
建議在前端顯眼位置加入封測聲明：
> ⚠️ 這是刪檔封測版本，所有資料可能會在更新時清除。

---

## 📋 部署清單

- [ ] 後端推送到 GitHub
- [ ] Render 部署完成
- [ ] 取得 Render API URL
- [ ] Cloudflare Pages 部署完成
- [ ] 設定 `VITE_API_BASE_URL` 環境變數
- [ ] 更新 Render 的 `CORS_ORIGINS`
- [ ] 測試完整流程

## Optional
- [ ] UptimeRobot