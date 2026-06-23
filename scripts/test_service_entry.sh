#!/bin/sh
set -e

npm run prisma:deploy

# Signal tests can start
touch /tmp/prisma-ready

# Keep container alive for running prisma:reset later
if [ -n "${KEEP_ALIVE+x}" ]; then
  sleep infinity
fi
