set -euo pipefail

mode="${1:-}"
file="${2:-}"
: "${BACKUP_PASSPHRASE:?BACKUP_PASSPHRASE is required}"
[ -f "$file" ] || { echo "usage: $0 verify|restore <file.dump.enc>" >&2; exit 2; }

decrypt() { openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 -pass env:BACKUP_PASSPHRASE -in "$file"; }
restore_cmd() { ${PG_RESTORE:-pg_restore} "$@"; }

case "$mode" in
  verify)
    decrypt >/dev/null 2>&1 || { echo "cannot decrypt: wrong BACKUP_PASSPHRASE or the file is corrupted" >&2; exit 1; }
    entries=$(decrypt | restore_cmd --list | grep -c -v '^;' || true)
    if [ "$entries" -lt 1 ]; then echo "archive has no entries - backup is not usable" >&2; exit 1; fi
    decrypt | restore_cmd --list | grep -q 'TABLE DATA public users' \
      || { echo "warning: no 'users' table data found in archive" >&2; exit 1; }
    echo "OK: ${entries} archive entries, users table present"
    ;;
  restore)
    : "${DATABASE_URL:?DATABASE_URL (the EMPTY target database) is required}"
    decrypt | restore_cmd --no-owner --no-privileges --exit-on-error --dbname "$DATABASE_URL"
    echo "restore finished"
    ;;
  *) echo "usage: $0 verify|restore <file.dump.enc>" >&2; exit 2 ;;
esac
