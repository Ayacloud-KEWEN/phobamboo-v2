#!/usr/bin/env bash
#
# PhoBamboo 一键部署 / 更新脚本（幂等，可重复运行）。
# 在 VPS 的项目根目录运行：
#   bash scripts/deploy.sh
#
# 前置条件：
#   - 已装 Node 20+ 和 npm
#   - PostgreSQL 就绪（见 scripts/setup-postgres.sh）
#   - backend/.env 已配置好 DATABASE_URL、JWT_SECRET 等
#
# 可选环境变量：
#   SKIP_BUILD=1     跳过前端 build
#   RUN_FIREBASE=1   额外执行一次 Firebase 数据迁移（需配好 service account）
#
set -euo pipefail

# 定位项目根目录（脚本所在目录的上一级）
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

green() { printf '\033[0;32m%s\033[0m\n' "$1"; }
yellow() { printf '\033[0;33m%s\033[0m\n' "$1"; }
red() { printf '\033[0;31m%s\033[0m\n' "$1"; }
step() { printf '\n\033[1;34m▶ %s\033[0m\n' "$1"; }

# ---------- 检查 Node ----------
command -v node >/dev/null 2>&1 || { red "未找到 Node.js，请先安装 Node 20+。"; exit 1; }
green "Node $(node -v) / npm $(npm -v)"

# ---------- 后端 .env 检查 ----------
if [[ ! -f backend/.env ]]; then
  yellow "backend/.env 不存在，从 .env.example 复制。请编辑后重新运行！"
  cp backend/.env.example backend/.env
  red "⚠️  请先编辑 backend/.env（至少 DATABASE_URL 和 JWT_SECRET），然后再次运行本脚本。"
  exit 1
fi

# ---------- 前端 build ----------
if [[ "${SKIP_BUILD:-}" != "1" ]]; then
  step "构建前端"
  cd "$ROOT/frontend"
  [[ -f .env ]] || cp .env.example .env
  npm ci
  npm run build
  green "✅ 前端已构建到 frontend/dist"
else
  yellow "跳过前端 build（SKIP_BUILD=1）"
fi

# ---------- 后端依赖 + 数据库 ----------
step "安装后端依赖"
cd "$ROOT/backend"
npm ci

step "同步数据库表结构（按 schema 建表/更新，幂等）"
npx prisma db push

step "初始化默认配置 + 管理员账号（幂等）"
npm run seed

if [[ "${RUN_FIREBASE:-}" == "1" ]]; then
  step "迁移 Firebase 数据"
  npm run migrate:firebase
fi

# ---------- PM2 启动 / 重启 ----------
step "启动后端服务（PM2）"
if ! command -v pm2 >/dev/null 2>&1; then
  yellow "未找到 pm2，正在全局安装..."
  npm install -g pm2
fi

if pm2 describe phobamboo >/dev/null 2>&1; then
  pm2 restart phobamboo --update-env
  green "✅ 已重启 phobamboo"
else
  pm2 start ecosystem.config.cjs
  pm2 save
  green "✅ 已启动 phobamboo（建议运行一次 'pm2 startup' 设置开机自启）"
fi

# ---------- 健康检查 ----------
step "健康检查"
PORT="$(grep -E '^PORT=' .env | cut -d= -f2 | tr -d '\"' || true)"
PORT="${PORT:-4000}"
sleep 2
if curl -fsS "http://localhost:${PORT}/api/health" >/dev/null; then
  green "🎉 部署完成！访问 http://<你的VPS-IP>:${PORT}"
  green "   后台： http://<你的VPS-IP>:${PORT}/admin/login"
else
  red "健康检查失败，请查看日志： pm2 logs phobamboo"
  exit 1
fi
