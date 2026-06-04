#!/usr/bin/env bash
#
# 检查 / 安装 PostgreSQL 并创建数据库 + 用户（幂等，可重复运行）。
# 用法（在 VPS 上，需 root/sudo）：
#   sudo PG_PASS='你的密码' bash scripts/setup-postgres.sh
# 可选环境变量（带默认值）：
#   PG_DB=phobamboo  PG_USER=phobamboo  PG_PASS=changeme
#
set -euo pipefail

PG_DB="${PG_DB:-phobamboo}"
PG_USER="${PG_USER:-phobamboo}"
PG_PASS="${PG_PASS:-changeme}"

green() { printf '\033[0;32m%s\033[0m\n' "$1"; }
yellow() { printf '\033[0;33m%s\033[0m\n' "$1"; }
red() { printf '\033[0;31m%s\033[0m\n' "$1"; }

if [[ "${PG_PASS}" == "changeme" ]]; then
  yellow "⚠️  正在使用默认密码 'changeme'，强烈建议用 PG_PASS='...' 覆盖。"
fi

# 1. 安装 PostgreSQL（如未安装）
if command -v psql >/dev/null 2>&1; then
  green "✅ PostgreSQL 已安装：$(psql --version)"
else
  yellow "未检测到 PostgreSQL，开始安装..."
  if command -v apt >/dev/null 2>&1; then
    apt update
    apt install -y postgresql postgresql-contrib
  else
    red "未找到 apt。请手动安装 PostgreSQL 后重试。"
    exit 1
  fi
fi

# 2. 确保服务运行
systemctl enable --now postgresql || true

# 3. 创建用户（如不存在）
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${PG_USER}'" | grep -q 1; then
  green "✅ 用户 ${PG_USER} 已存在，更新密码。"
  sudo -u postgres psql -c "ALTER USER ${PG_USER} WITH PASSWORD '${PG_PASS}';" >/dev/null
else
  sudo -u postgres psql -c "CREATE USER ${PG_USER} WITH PASSWORD '${PG_PASS}';" >/dev/null
  green "✅ 已创建用户 ${PG_USER}"
fi

# 4. 创建数据库（如不存在）
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${PG_DB}'" | grep -q 1; then
  green "✅ 数据库 ${PG_DB} 已存在。"
else
  sudo -u postgres psql -c "CREATE DATABASE ${PG_DB} OWNER ${PG_USER};" >/dev/null
  green "✅ 已创建数据库 ${PG_DB}"
fi
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${PG_DB} TO ${PG_USER};" >/dev/null

echo
green "🎉 PostgreSQL 就绪。请把下面这行写入 backend/.env 的 DATABASE_URL："
echo "    DATABASE_URL=\"postgresql://${PG_USER}:${PG_PASS}@localhost:5432/${PG_DB}?schema=public\""
