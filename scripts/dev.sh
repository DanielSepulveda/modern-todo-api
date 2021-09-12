#!/usr/bin/env bash
set -e

cleanup() {
    docker-compose down
    trap '' EXIT INT TERM
    exit $err
}

trap cleanup SIGINT EXIT

# Make sure docker-compose is installed
if ! hash docker-compose 2>/dev/null; then
  echo -e '\033[0;31mPlease install docker-compose\033[0m'
  exit 1
fi

docker-compose up -d --force-recreate

npm run dev-server
