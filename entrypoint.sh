#!/usr/bin/env bash
rethinkdb --bind all & nginx & /app/kafka-backend & wait -n
pkill -P $$
