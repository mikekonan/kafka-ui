#!/usr/bin/env bash
#stackoverflow helps
rethinkdb --bind all & nginx & /app/kafka-backend & wait -n
pkill -P $$

# it's my
#RETHINK_PID_FILE="./rethink.pid"
#BACKEND_PID_FILE="./backend.pid"
#NODE_PID_FILE="./node.pid"
#
#function read_and_kill_pid() {
#  pid=$(<"$1")
#  echo "" > "$1"
#
#  if [ -n "$pid" ] && [ -e /proc/"$pid" ]
#  then
#    echo "kill pid: $pid($2)"
#    kill "$pid"
#  fi
#}
#
#{ rethinkdb --bind all; echo "$!" > $RETHINK_PID_FILE; } \
#& { /app/backend; echo "$!" > $BACKEND_PID_FILE; } \
#& { npm start --prefix /app/webapp; echo "$!" > $NODE_PID_FILE; } \
#& wait -n
#
#read_and_kill_pid $RETHINK_PID_FILE rethinkdb
#read_and_kill_pid $BACKEND_PID_FILE kafka-backend
#read_and_kill_pid $NODE_PID_FILE node-front
#exit 0
