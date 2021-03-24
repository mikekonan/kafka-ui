package provider

import (
	"backend/config"
	"backend/store"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

type Service interface {
	Serve()
	Stop()
}

type Provider struct {
	configure *config.Configure `di.inject:"appConfigure"`
	consumer  *kafka.Consumer
}

func (provider *Provider) Serve() {
	var (
		err        error
		topics     []string
		message    *kafka.Message
		topicsChan = make(chan []string)
	)

	go func() {
		if provider.consumer, err = kafka.NewConsumer(&kafka.ConfigMap{
			"bootstrap.servers": provider.configure.Config.KafkaHost,
			"group.id":          provider.configure.Config.KafkaGroup,
			"auto.offset.reset": "smallest",
		}); err != nil {
			log.Fatalf("Kafka connection error: %s", err.Error())
		}
		defer provider.close()

		provider.listenNewTopics(topicsChan)
		topics = <-topicsChan

		if err = provider.consumer.SubscribeTopics(topics, nil); err != nil {
			log.Fatalf("Kafka: failed to subscribe on topics - '%s'. Err: %s", topics, err.Error())
		}

		for {

			select {
			case <-provider.configure.GlobalContext.Done():
				return

			case topics = <-topicsChan:
				_ = provider.consumer.Unsubscribe()
				if err = provider.consumer.SubscribeTopics(topics, nil); err != nil {
					log.Fatalf("Kafka: failed to subscribe on topics - '%s'. Err: %s", topics, err.Error())
				}

			default:
				if message, err = provider.consumer.ReadMessage(-1); err != nil {
					log.Warnf("Kafka read message: %s", err.Error())
					continue
				}
				provider.configure.ServeWriteChannel() <- store.New(*message)
			}
		}
	}()
}

func (provider *Provider) Stop() {
}

func (provider *Provider) close() {
	log.Info("Kafka: close connection....")
	if err := provider.consumer.Unsubscribe(); err != nil {
		log.Warnf("Kafka: Failed unsubscribe: %s", err.Error())
	}

	if err := provider.consumer.Close(); err != nil {
		log.Warnf("Kafka: failed to close connection: %s", err.Error())
	}
}

func (provider *Provider) listenNewTopics(topicChan chan []string) {
	var topics []string
	go func() {
		timer := time.NewTimer(2 * time.Second)

		for {
			select {
			case <-timer.C:
				meta, err := provider.consumer.GetMetadata(nil, true, 3000)
				if err != nil {
					return
				}

				for _, v := range meta.Topics {
					if strings.Contains(v.Topic, store.SkipTopics) {
						continue
					}
					topics = append(topics, v.Topic)
				}

				if len(topics) == 0 {
					topics = append(topics, "*")
				}
				topicChan <- topics
			}
		}
	}()
}
