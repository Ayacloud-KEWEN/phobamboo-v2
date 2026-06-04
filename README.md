# PhoBamboo v2 — 餐厅点餐 & 会员系统（可复用）

将原来的「静态网页 + Firebase」完整重构为现代全栈架构，部署在**你自己的 VPS** + **PostgreSQL**。

## 技术栈
- **前端**：Vue 3 + Vite + Pinia + Vue Router + vue-i18n + Tailwind（`frontend/`）
- **后端**：Node + Express + Prisma + Socket.IO（`backend/`）
- **数据库**：PostgreSQL · **图片**：VPS 本地磁盘 · **实时**：WebSocket

## 功能
- 📱 **顾客端（手机）**：多语言菜单 🇫🇷🇬🇧🇨🇳（国旗下拉切换）、扫码点餐
  （`/order?table=5`）、电话会员登录或游客下单。
- 🧾 **柜台（平板）**：实时订单流、结账 → 自动计入积分、按电话查询/调整积分。
- 📊 **统计台（平板）**：营业额、订单、会员、积分、每日柱状图，
  以及老板设置（KDS 开关、积分规则）。
- 🍜 **菜单管理（手机/电脑）**：菜品 & 奖励 CRUD、三语名称、套餐配菜、压缩图片上传。
- 🔥 **KDS 厨房屏（可选）**：实时接单 + 声音提醒，**默认关闭**，老板可在统计台一键开启。

## 会员积分规则（可配置）
按会员**当天累计消费**计分：未达阈值（`pointsThreshold`，默认 20€）不给分，
达到后 `floor(总额 × pointsPerEuro)`。每单只补发与当天已发积分的差额。

## 复用到别的餐厅
几乎全部由 `RestaurantConfig` 表驱动（名称、logo、主色、默认语言、货币、
积分率/阈值、KDS 开关）。需要进一步改造时：
- `frontend/src/theme/theme.css` + `tailwind.config.js` —— 品牌配色
- `frontend/src/components/CustomerFooter.vue` —— 地址 / 营业时间 / 联系方式
- `frontend/src/i18n/locales/*.json` —— 文案

## 本地启动
```bash
# 后端（端口 4000）
cd backend && cp .env.example .env   # 配置 DATABASE_URL 等
npm install && npx prisma migrate dev && npm run seed && npm run dev
# 前端（端口 5173，代理到 4000）
cd frontend && npm install && npm run dev
```

## 部署
详见 **[DEPLOY.md](DEPLOY.md)**，或直接用一键脚本（在 VPS 项目根目录运行）：
```bash
sudo bash scripts/setup-postgres.sh   # 首次：检查/安装 PostgreSQL 并建库（可选）
bash scripts/deploy.sh                 # 安装依赖、build、迁移、seed、PM2 启动
```
采用**单端口**架构：后端同时托管前端、API、WebSocket、图片。无域名时直接
访问 `http://你的IP:4000`；有域名后在 CloudPanel 加 Reverse Proxy → `127.0.0.1:4000`
并启用 Let's Encrypt SSL，代码无需改动。

## 详细文档
- [backend/README.md](backend/README.md) —— API、数据模型、Firebase 迁移
- [frontend/README.md](frontend/README.md) —— 路由、i18n、复用说明
- [DEPLOY.md](DEPLOY.md) —— CloudPanel 完整部署步骤
