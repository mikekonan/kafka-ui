package store

import (
	"bytes"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"gopkg.in/confluentinc/confluent-kafka-go.v1/kafka"
	"reflect"
	"strconv"
	"strings"
	"time"
)

const messageFilterFields = "topic;offset;partition;timestamp;at;size;"

type Message struct {
	Topic     string    `rethinkdb:"topic"`
	Headers   []byte    `rethinkdb:"headers"`
	Offset    int       `rethinkdb:"offset"`
	Partition int       `rethinkdb:"partition"`
	Timestamp int64     `rethinkdb:"timestamp"`
	At        time.Time `rethinkdb:"at"`
	Size      int       `rethinkdb:"size"`
	Message   []byte    `rethinkdb:"message"`
}

func (message Message) Filter(filters Filters) bool {
	for _, filter := range filters.Filters {
		if filter.FieldName == "" || filter.Comparator == nil {
			return true
		}

		r := reflect.ValueOf(message)

		if strings.Contains(messageFilterFields, strings.ToLower(filter.FieldName)) {
			val := r.FieldByName(strings.Title(strings.ToLower(filter.FieldName)))
			if !filter.Compare(val.Interface(), filter.FieldValue) {
				return false
			}
		}

		var headers = map[string]string{}
		_ = json.Unmarshal(message.Headers, &headers)

		if val, ok := headers[filter.FieldName]; ok {
			if !strings.EqualFold(val, filter.FieldValue.(string)) {
				return false
			}
		}
	}

	return true
}

type Changes struct {
	OldValue Message `rethinkdb:"old_val"`
	NewValue Message `rethinkdb:"new_val"`
}

func New(msg kafka.Message) Message {
	var (
		dbHeaders []byte
		offset    int64
		err       error
	)

	keyValue := map[string]string{}
	for _, header := range msg.Headers {
		keyValue[header.Key] = string(header.Value)
	}

	if dbHeaders, err = json.Marshal(keyValue); err != nil {
		log.Warnf("Marshal header error: %s", err.Error())
		dbHeaders = []byte(`{}`)
	}

	if offset, err = strconv.ParseInt(msg.TopicPartition.Offset.String(), 10, 64); err != nil {
		log.Warnf("Offset parse error: %s", err.Error())
		offset = 0
	}

	return Message{
		Topic:     *msg.TopicPartition.Topic,
		Headers:   dbHeaders,
		Offset:    int(offset),
		Partition: int(msg.TopicPartition.Partition),
		Timestamp: msg.Timestamp.Unix(),
		At:        msg.Timestamp,
		Size:      len(msg.Value),
		Message:   bytes.NewBufferString(string(msg.Value)).Bytes(),
	}
}

type Comparator interface {
	Compare(interface{}, interface{}) bool
}

type Filters struct {
	Topic   string
	Filters []Filter
}

type Filter struct {
	FieldName  string
	FieldValue interface{}
	Comparator Comparator
}

func (filter Filter) Compare(left, right interface{}) bool {
	return filter.Comparator.Compare(left, right)
}
