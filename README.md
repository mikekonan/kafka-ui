# kafka-ui
Application to browse and visualize kafka topics and messages at realtime.

## What is in the box?
1. Web application.
    - Realtime updates
    - Split view
    - Browse message headers (copying header key or value on click)
2. Rethinkdb - store consumed topics and messages.
3. Piper - nodejs module that pipes kafka messages into rethinkdb.
4. Provider - simple http server that acts as a client to the database and provides streaming api for the webapp.

## Running
`docker run --rm -p 8000:80 -p 9002:9002 -e "KAFKA_HOST=kafka" -e "KAFKA_PORT:9092" mikekonan/kafka-ui:latest`

or via docker-compose.yml:

```
  kafka-ui:
    image: mikekonan/kafka-ui:latest
    container_name: kafka-ui
    volumes:
      - ./kafka-ui/rethinkdb_data:/rethinkdb_data
    ports:
      - 8000:80
      - 9002:9002
    environment:
      KAFKA_HOST: "kafka"
      WS_PORT: 9002
```


## Options:
- Use `WS_PORT` to set the backend web socket port `(default: 9002)`
- Use `KAFKA_HOST` to set the kafka dns name `(default: 127.0.0.1)`
- Use `KAFKA_PORT` to set the kafka port `(default: 9092)`
- Use `DB_HOST` to set the rethinkdb dns name `(default: 127.0.0.1)`
- Use `DB_PORT` to set the rethinkdb port `(default: 28015)`

## Plans
[x] Filtering messages
[ ] Add ability to publish messages
