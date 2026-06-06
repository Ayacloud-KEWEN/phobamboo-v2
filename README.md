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
- 📊 **销售/客户大屏（`/insights`，独立登录）**：与后台分离的**只读**经营大屏，
  单独的 viewer 账号。含今日/总营业额、现金/刷卡拆分、客单价、本周/本月营收、
  近 14 天柱状图、**高峰时段**、堂食/外带占比、会员/游客占比、回头客率、
  新会员、取消率、畅销菜、最佳客户、最近成交。每分钟自动刷新。
- 🧰 **桌号二维码生成器**（后台 QR 页）：批量生成各桌二维码（中心嵌 logo），可打印。

## 销售大屏经营指标（/insights）
后端 `routes/insights.js`（`requireInsights`，独立 JWT scope）：
- `POST /api/insights/login` — viewer 账号登录（角色 `viewer`，seed 创建）。
- `GET /overview` — 今日/总营业额、订单数、会员数、积分、现金/刷卡。
- `GET /kpis` — 客单价、每单件数、本周/本月营收、堂食vs外带、会员vs游客、
  回头客率、7天新会员、取消率、24h 时段分布。
- `GET /daily` `/top-products` `/top-members` `/recent-orders`。

> 鉴权隔离：`requireAuth`（后台）拒绝 viewer 令牌；`requireInsights` 只认
> `scope=insights`。viewer 只能访问大屏接口，碰不到后台写操作。

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

## 🔄 改了代码后，如何在 VPS 上更新

本地改完 → `git push` 到 GitHub 后，在 VPS 上执行：

```bash
cd /home/app          # 项目目录
git pull              # 拉最新代码
bash scripts/deploy.sh
```

`scripts/deploy.sh` 会自动完成一整套（幂等，可重复跑）：
1. **重新 build 前端**（`frontend/` → `dist/`）
2. `npm ci` 安装前后端依赖（package.json 有变动时）
3. `npx prisma db push` —— **数据库结构有改动时自动同步新字段/表**（老数据不动）
4. `npm run seed` —— 幂等补齐默认配置 / 账号
5. `pm2 restart`（或首次 `pm2 start`）重启后端

更新后**强刷浏览器**（Ctrl+Shift+R）；平板/手机若装了 PWA，关掉 App 再开（清旧缓存）。

**只改了后端**（没动前端）可加 `SKIP_BUILD=1` 跳过前端构建，更快：
```bash
SKIP_BUILD=1 bash scripts/deploy.sh
```

> 提示：
> - 涉及 **schema 改动**（如新增字段/角色）时，`deploy.sh` 的 `prisma db push` 会处理，无需手动操作。
> - 改了 `.env`（如密钥、HOST、seed 账号）后，需 `pm2 restart phobamboo` 才生效。
> - 升级前建议先 `bash scripts/backup.sh` 备份数据库。
> - 避开营业高峰更新（`vite build` 会短暂占用 CPU/内存）。

## 详细文档
- [使用说明.md](使用说明.md) —— **给餐馆老板看的通俗操作手册**
- [CHANGELOG.md](CHANGELOG.md) —— 更新记录
- [backend/README.md](backend/README.md) —— API、数据模型、Firebase 迁移
- [frontend/README.md](frontend/README.md) —— 路由、i18n、复用说明
- [DEPLOY.md](DEPLOY.md) —— CloudPanel 完整部署步骤
