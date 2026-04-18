#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
HOST="127.0.0.1"
PORT="4173"
BASE_URL="http://${HOST}:${PORT}"
LOG_FILE="${ROOT_DIR}/.r0-smoke-vite.log"
ROUTES_FILE="${ROOT_DIR}/tests/r0/http/routes.txt"
WITH_LOCAL_ENV="${ROOT_DIR}/scripts/with-local-env.sh"

cd "$ROOT_DIR"

echo "[r0-smoke:http] building app"
"$WITH_LOCAL_ENV" npm run build >/dev/null

echo "[r0-smoke:http] starting preview server at ${BASE_URL}"
rm -f "$LOG_FILE"
npm run preview -- --host "$HOST" --port "$PORT" >"$LOG_FILE" 2>&1 &
SERVER_PID=$!

cleanup() {
  if kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

READY=0
ATTEMPTS=0
while [ "$ATTEMPTS" -lt 30 ]; do
  if curl -fsS "$BASE_URL/" >/dev/null 2>&1; then
    READY=1
    break
  fi
  ATTEMPTS=$((ATTEMPTS + 1))
  sleep 1
done

if [ "$READY" -ne 1 ]; then
  echo "[r0-smoke:http] preview server did not become ready"
  echo "[r0-smoke:http] last log output:"
  tail -n 40 "$LOG_FILE" || true
  exit 1
fi

check_route() {
  route="$1"
  attempts=0

  while [ "$attempts" -lt 5 ]; do
    if curl -fsS "${BASE_URL}${route}" >/dev/null 2>&1; then
      echo "[r0-smoke:http] ok ${route}"
      return 0
    fi
    attempts=$((attempts + 1))
    sleep 1
  done

  echo "[r0-smoke:http] failed ${route}"
  echo "[r0-smoke:http] last log output:"
  tail -n 40 "$LOG_FILE" || true
  exit 1
}

while IFS= read -r route || [ -n "$route" ]; do
  case "$route" in
    ''|'#'*) continue ;;
  esac

  check_route "$route"
done < "$ROUTES_FILE"

echo ""
echo "[r0-smoke:http] http-level route smoke passed"
echo "[r0-smoke:http] dev server log: ${LOG_FILE}"
