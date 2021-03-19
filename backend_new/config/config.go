package config

import (
	"context"
	"fmt"
	"github.com/heetch/confita"
	"github.com/heetch/confita/backend/env"
	"github.com/heetch/confita/backend/flags"
	log "github.com/sirupsen/logrus"
)

type Config struct {
	kafkaHost    string `config:"kafka-host" envconfig:"kafka-host"`
	kafkaPort    string `config:"kafka-port" envconfig:"kafka-port"`
	KafkaGroup   string `config:"kafka-group-id" envconfig:"kafka-group-id"`
	databaseHost string `config:"db-host" envconfig:"db-port"`
	databasePort string `config:"db-port" envconfig:"db-port"`
}

func (config *Config) Defaults() *Config {
	config.kafkaHost = "127.0.0.1"
	config.kafkaPort = "9092"
	config.KafkaGroup = "kafka-ui-messages-fetch"
	config.databaseHost = "127.0.0.1"
	config.databasePort = "28015"
	return config
}

func (config *Config) KafkaBrokers() string {
	return fmt.Sprintf("%s:%s", config.kafkaHost, config.kafkaPort)
}

func (config *Config) DatabaseServer() string {
	return fmt.Sprintf("%s:%s", config.databaseHost, config.databasePort)
}

type Configure struct {
	GlobalContext    context.Context `di.inject:"appContext"`
	Config           *Config         `di.inject:"appConfig"`
	serveMessageChan chan interface{}
}

func (configure *Configure) ServeReadChannel() <-chan interface{} {
	return configure.serveMessageChan
}

func (configure *Configure) ServeWriteChannel() chan interface{} {
	return configure.serveMessageChan
}

func (configure *Configure) LoadConfig() (cfg *Configure, err error) {
	configure.serveMessageChan = make(chan interface{})

	if err = confita.NewLoader(flags.NewBackend(), env.NewBackend()).Load(context.Background(), configure.Config); err != nil {
		log.Warn("Error load config")
		return configure, err
	}

	return configure, nil
}
