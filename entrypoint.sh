#!/usr/bin/env bash
concurrently --kill-others \
  "rethinkdb --bind all" \
  "node /app/piper/index.js" \
  "node /app/provider/index.js" \
  "node /app/proxy/index.js" \
  "npm start --prefix /app/webapp"