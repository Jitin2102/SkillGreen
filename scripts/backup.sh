set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_PASSPHRASE:?BACKUP_PASSPHRASE is required}"

out_dir="${1:-backups}"
mkdir -p "$out_dir"
out="$out_dir/skillgreen-$(date -u +%Y%m%dT%H%M%SZ).dump.enc"

trap 'rc=$?; if [ "$rc" -ne 0 ]; then rm -f "$out"; fi' EXIT

${PG_DUMP:-pg_dump} --format=custom --no-owner --no-privileges "$DATABASE_URL" \
  | openssl enc -aes-256-cbc -pbkdf2 -iter 600000 -salt -pass env:BACKUP_PASSPHRASE -out "$out"

size=$(wc -c < "$out")
if [ "$size" -lt 1024 ]; then
  rm -f "$out"
  echo "backup suspiciously small (${size} bytes); removed" >&2
  exit 1
fi
echo "$out"
