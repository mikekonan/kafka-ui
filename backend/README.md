# GO Backend for kafka-ui

## WebSocket

1. Create a socket (ws://localhost:9002/) \
   1.1 Read messages:
   ```json
   {
     "message": {
       "topic": "string", 
       "headers": {}, 
       "offset": 0, 
       "partition": 0, 
       "timestamp": 123456789, 
       "at": "2020-02-05T10:10:10", 
       "payloadSize": 457, 
       "message": {} 
     }
   }
   ```
   1.2 Read topics
   ```json
      {
        "topic": {
          "topic": "string"
        }
      }
      ```
