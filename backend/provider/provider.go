package provider

import (
	"backend/config"
	"backend/store"
	"fmt"
	"net"
	"strings"

	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
)

type Service interface {
	Serve() error
	Stop()
}

type Provider struct {
	configure *config.Configure `di.inject:"appConfigure"`
	consumer  *kafka.Consumer
}

func (provider *Provider) Serve() {
	var (
		topics  []string
		message *kafka.Message
		ipStr   = ""
	)

	go func() {
		ips, err := net.LookupIP(provider.configure.Config.KafkaHost)

		for _, ip := range ips {
			if ip.To4() != nil {
				ipStr = ip.String()
				break
			}
		}

		if ipStr == "" {
			log.Fatalf("Dns no resolve hosts: %s", provider.configure.Config.KafkaHost)
		}

		if provider.consumer, err = kafka.NewConsumer(&kafka.ConfigMap{
			"broker.address.family": "v4",
			"bootstrap.servers":     fmt.Sprintf("%s:%s", ipStr, provider.configure.Config.KafkaPort),
			"group.id":              provider.configure.Config.KafkaGroup,
			"auto.offset.reset":     "smallest",
		}); err != nil {
			log.Fatalf("Kafka connection error: %s", err.Error())
		}
		defer provider.close()

		if topics, err = provider.topics(); err != nil {
			log.Fatalf("Couldn't get topics: %s", err.Error())
		}

		if err = provider.consumer.SubscribeTopics(topics, nil); err != nil {
			log.Fatalf("Kafka: failed to subscribe on topics - '%s'. Err: %s", topics, err.Error())
		}

		for {

			select {
			case <-provider.configure.GlobalContext.Done():
				return

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

func (provider *Provider) topics() (topics []string, err error) {
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
	return
}
