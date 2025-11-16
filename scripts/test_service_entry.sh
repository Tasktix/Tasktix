#!/bin/sh
set -e

npm run prisma:deploy

# Signal tests can start
touch /tmp/prisma-ready

# Keep container alive for running prisma:reset later
sleep infinity