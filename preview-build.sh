#!/bin/bash
#
# preview-build.sh: sync site/content to docker-01 and rebuild one Quartz
# preview instance from it.
#
# Usage:
#   preview-build.sh dev
#     rsync content/ to docker-01:~/avl-dev/content/, build with Quartz in a
#     node:22 container, restart wnc-site-dev, print http://192.168.50.66:3320.
#     Refuses to run when the site repo's current branch is main (dev builds
#     come from a work branch; the release build is main's).
#
#   preview-build.sh release
#     Same, but to docker-01:~/avl-build/content/, restarting wnc-site-preview
#     on http://192.168.50.66:3310. Refuses to run unless the current branch
#     is main.
#
# site/calendar.yml ships with the content; the Calendar transformer
# (quartz/plugins/transformers/calendar.ts) renders it at build time.
#
# Exit status: non-zero on a bad/missing argument, a failed branch guard, or a
# failed Quartz build (the container's exit status is propagated). Either way,
# prints the number of "warn" lines the build emitted.
set -euo pipefail

usage() {
  echo "Usage: $(basename "$0") dev|release" >&2
  exit 1
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  usage
fi

TARGET="${1:-}"
if [ "$TARGET" != "dev" ] && [ "$TARGET" != "release" ]; then
  usage
fi

SITE="$(cd "$(dirname "$0")" && pwd)"
CALENDAR_YML="$SITE/calendar.yml"

BRANCH="$(git -C "$SITE" rev-parse --abbrev-ref HEAD)"

if [ "$TARGET" = "dev" ] && [ "$BRANCH" = "main" ]; then
  echo "Refusing: dev builds come from a work branch, not main; check out the work branch first." >&2
  exit 1
fi
if [ "$TARGET" = "release" ] && [ "$BRANCH" != "main" ]; then
  echo "Refusing: release builds come from main, current branch is $BRANCH." >&2
  exit 1
fi

if [ "$TARGET" = "dev" ]; then
  REMOTE_DIR="avl-dev"
  CONTAINER="wnc-site-dev"
  PORT="3320"
else
  REMOTE_DIR="avl-build"
  CONTAINER="wnc-site-preview"
  PORT="3310"
fi

echo "Syncing content to docker-01:~/$REMOTE_DIR/content/..."
rsync -az --delete --exclude .quartz-cache "$SITE/content/" "docker-01:~/$REMOTE_DIR/content/"
rsync -az "$SITE/quartz.config.ts" "$SITE/quartz.layout.ts" "docker-01:~/$REMOTE_DIR/"
if [ -f "$CALENDAR_YML" ]; then
  rsync -az "$CALENDAR_YML" "docker-01:~/$REMOTE_DIR/"
fi
# site/events.yml: the timeline entries the Events transformer draws into pages.
if [ -f "$SITE/events.yml" ]; then
  rsync -az "$SITE/events.yml" "docker-01:~/$REMOTE_DIR/"
fi
rsync -az --delete --exclude .quartz-cache "$SITE/quartz/" "docker-01:~/$REMOTE_DIR/quartz/"

echo "Building on docker-01 (~/$REMOTE_DIR)..."
BUILD_LOG="$(mktemp)"
trap 'rm -f "$BUILD_LOG"' EXIT

set +e
ssh docker-01 "cd ~/$REMOTE_DIR && docker run --rm -v ~/$REMOTE_DIR:/usr/src/app -w /usr/src/app node:22 npx quartz build" 2>&1 | tee "$BUILD_LOG"
BUILD_STATUS="$?"
set -e

WARN_COUNT="$(grep -ic 'warn' "$BUILD_LOG" || true)"
echo "Build warnings: $WARN_COUNT"

if [ "$BUILD_STATUS" -ne 0 ]; then
  echo "Quartz build failed (exit $BUILD_STATUS)." >&2
  exit "$BUILD_STATUS"
fi

echo "Restarting $CONTAINER..."
ssh docker-01 "docker restart $CONTAINER"

echo "http://192.168.50.66:$PORT"
