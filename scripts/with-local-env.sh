#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
TEMP_ENV_FILE="${ROOT_DIR}/.env.local"
CREATED_TEMP_ENV=0

if [ ! -f "${ROOT_DIR}/.env" ] && [ ! -f "${ROOT_DIR}/.env.local" ]; then
  cp "${ROOT_DIR}/.env.example" "$TEMP_ENV_FILE"
  CREATED_TEMP_ENV=1
fi

cleanup() {
  if [ "$CREATED_TEMP_ENV" -eq 1 ] && [ -f "$TEMP_ENV_FILE" ]; then
    rm -f "$TEMP_ENV_FILE"
  fi
}

trap cleanup EXIT INT TERM

cd "$ROOT_DIR"
"$@"
