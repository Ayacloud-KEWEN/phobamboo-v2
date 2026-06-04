# 更新记录 (CHANGELOG)

本文件记录 PhoBamboo v2 重构以来的主要更新。日期格式 YYYY-MM-DD。

---

## 2026-06-04

### 🎉 v2.0 完整重构（从 Firebase 静态网页 → Vue3 全栈）
- **架构**：前端 Vue3 + Vite + Pinia + vue-i18n + Tailwind；后端 Node + Express + Prisma + Socket.IO；数据库 PostgreSQL（VPS 自托管）。
- **数据迁移**：Firebase Firestore → PostgreSQL（菜品 132 / 奖励 3 / 会员 5 / 订单 61）。图片改存 VPS 本地磁盘。
- **多语言**：中 / 英 / 法三语，右上角国旗下拉切换（vue-i18n）。
- **顾客端**：首页菜单浏览 + 扫码点餐（`?table=`）+ 电话会员登录/游客。
- **柜台（平板）**：Socket.IO 实时订单流、结账自动计积分、按电话查/改积分。
- **统计台**：营业额/订单/会员/积分汇总、每日营收图、老板设置（KDS 开关、积分规则）。
- **菜单后台**：菜品/奖励 CRUD、三语名称、套餐配菜、图片压缩上传。
- **KDS 厨房屏**：实时接单 + 声音提醒，可选模块默认关闭。
- **会员积分规则**：满 20€/天累计才按 1:1 计分（配置驱动，可调阈值/倍率）。
- **部署**：单端口架构（后端同时托管前端/API/WebSocket/图片），适配 CloudPanel；含一键脚本 `setup-postgres.sh` / `deploy.sh`、PM2 守护、`DEPLOY.md` 指南。

### 🐛 修复
- **部署建表**：改用 `prisma db push`（仓库无迁移文件，`migrate deploy` 不建表）。
- **后端健壮性**：路由 async 错误统一捕获 + 全局错误中间件 + 进程级兜底，数据库出错不再 crash 整个 Node 进程（此前 Node 15+ 会因未处理 rejection 退出）。

### 💄 顾客端 UI 按原版精确还原（对照 legacy/index.html、order1.html）
- **菜单渲染**：按 `sub_category` 分组带小标题；饮料/酒水改为列表行（非卡片）；菜品卡大图 + 价格浮层 + POP/HOT/VÉGÉ 标签 + NA.png 占位。
- **点单页**：欢迎卡 + 积分组件、底部 Panier/Fidélité 栏、菜品卡 Ajouter 按钮（带数量）、右侧购物车抽屉、套餐弹窗（前菜 +3.80€）、会员弹窗（进度条 + 规则 + 兑换）、GDPR 登录、infos 弹窗、购物车 localStorage 持久化。
- **首页**：Menu PDF 打印、回到顶部按钮。

### 💄 UI 细节修正
- 修复「两个目录栏」+「目录栏贴底线」（CategoryTabs 在移动模式下误渲染桌面胶囊）。
- 饮料/酒水桌面端改两列排列，减少左侧空白。
- 修改桌号改用竹绿风格弹窗（替代浏览器原生 prompt）。
- **Footer 三语化**（地址保留原文）；营业时间下新增「Service sur place à partir de 15€/pers.」。
- 后台 Menu 每个菜品加删除按钮（删除前二次确认）。
- 首页/点单页左上角 SVG 图标替换为 logo.png（取自 `config.logo`）。
