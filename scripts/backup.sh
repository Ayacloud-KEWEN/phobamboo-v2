#!/usr/bin/env bash
#
# 数据库每日备份脚本。用 pg_dump 导出，自动保留最近 N 天，旧的删除。
#
# 用法：
#   读取 backend/.env 里的 DATABASE_URL 自动备份：
#     bash scripts/backup.sh
#   或手动指定：
#     DATABASE_URL='postgresql://...' BACKUP_DIR=/var/backups/phobamboo bash scripts/backup.sh
#
# 配每日自动备份（凌晨 3:30），在 VPS 上执行一次：
#   crontab -e
#   再加一行（路径换成你的实际路径）：
#   30 3 * * * /bin/bash /home/app/scripts/backup.sh >> /home/app/backup.log 2>&1
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 从 backend/.env 读取 DATABASE_URL（若未通过环境变量传入）
if [[ -z "${DATABASE_URL:-}" && -f "$ROOT/backend/.env" ]]; then
  DATABASE_URL="$(grep -E '^DATABASE_URL=' "$ROOT/backend/.env" | head -1 | cut -d= -f2- | tr -d '"')"
fi
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "未找到 DATABASE_URL（环境变量或 backend/.env）"; exit 1
fi

BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
mkdir -p "$BACKUP_DIR"

STAMP="$(date +%F_%H%M)"
OUT="$BACKUP_DIR/phobamboo_$STAMP.sql.gz"

# pg_dump (libpq) ne comprend pas le paramètre "?schema=..." de Prisma — on l'enlève.
DB_URL_CLEAN="${DATABASE_URL%%\?*}"

echo "备份到 $OUT ..."
pg_dump "$DB_URL_CLEAN" | gzip > "$OUT"
echo "✅ 完成：$(du -h "$OUT" | cut -f1)"

# 删除超过 KEEP_DAYS 天的旧备份
find "$BACKUP_DIR" -name 'phobamboo_*.sql.gz' -type f -mtime +"$KEEP_DAYS" -delete
echo "已清理 $KEEP_DAYS 天前的旧备份。"
