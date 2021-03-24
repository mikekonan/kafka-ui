package store

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
	rethink "gopkg.in/rethinkdb/rethinkdb-go.v6"

	"backend/config"
)

const (
	dbName       = "topics"
	tableName    = "message"
	index        = "topic"
	NewTopicChan = "topicChan"
	SkipTopics   = "__consumer_offsets"
)

type Service interface {
	Serve()
	Stop()
}

type RethinkService struct {
	configure      *config.Configure `di.inject:"appConfigure"`
	connectionPool map[uuid.UUID]*rethink.Session
	topics         []string
	newTopicChan   chan string
}

func (rethinkService *RethinkService) Topics(socketContext context.Context, startChan <-chan interface{}) <-chan Message {
	var (
		cursor  *rethink.Cursor
		err     error
		msgChan = make(chan Message, 1)
		topic   string
	)

	go func() {
		defer close(msgChan)

		id, _ := rethinkService.connect(true)
		defer rethinkService.close(id)

		termTopics := rethink.Table(tableName).Distinct(rethink.DistinctOpts{
			Index: index,
		})

		for {
			select {
			case <-socketContext.Done():
				log.Info("Close rethinkDb connection for read topics. Socket context close")
				return

			case <-rethinkService.configure.GlobalContext.Done():
				log.Info("Close rethinkDb connection for read topics. Application context close")
				return

			case topic = <-rethinkService.newTopicChan:
				log.Tracef("Get new topic: %s", topic)
				msgChan <- Message{Topic: topic}

			case <-startChan:
				if cursor, err = termTopics.Run(rethinkService.connectionPool[id]); err != nil {
					log.Error(err.Error())
				}

				for cursor.Next(&topic) {
					msgChan <- Message{Topic: topic}
				}
			}
		}
	}()

	return msgChan
}

func (rethinkService *RethinkService) Messages(socketContext context.Context, filterChan <-chan Filters) <-chan Message {
	msgChan := make(chan Message, 1)

	go func() {
		var (
			filter      Filters
			changesChan = make(chan Message)
		)
		defer close(msgChan)

		id, _ := rethinkService.connect(true)
		defer rethinkService.close(id)

		rethinkService.listenChanges(socketContext, id, changesChan)

		for {
			select {
			case <-socketContext.Done():
				log.Info("Close rethinkDb connection for read messages. Socket context close")
				return

			case <-rethinkService.configure.GlobalContext.Done():
				log.Info("Close rethinkDb connection for read messages. Application context close")
				return

			case filter = <-filterChan:
				rethinkService.getLastMessages(id, msgChan, filter)

			case msg := <-changesChan:
				if filter.Topic == "" || len(filter.Filters) == 0 {
					continue
				}

				if msg.Filter(filter) {
					msgChan <- msg
				}
			}
		}
	}()

	return msgChan
}

func (rethinkService *RethinkService) listenChanges(socketContext context.Context, id uuid.UUID, msgChan chan Message) {
	go func() {
		var (
			changes Changes
			cursor  *rethink.Cursor
		)
		defer cursor.Close()

		for {
			select {
			case <-socketContext.Done():
				log.Info("Close rethinkDb connection for read messages. Socket context close")
				return

			case <-rethinkService.configure.GlobalContext.Done():
				log.Info("Close rethinkDb connection for read messages. Application context close")
				return

			default:
				cursor, err := rethink.Table(tableName).Changes().Run(rethinkService.connectionPool[id])
				if err != nil {
					log.Errorf("RethinkDb get changes error: %s", err.Error())
				}

				if cursor.Next(&changes) {
					msgChan <- changes.NewValue
				}
			}
		}
	}()
}

func (rethinkService *RethinkService) Serve() {
	var (
		err        error
		retryCount = 10
	)
	for retryCount > 0 {
		if err = rethinkService.InitializeContext(); err != nil {
			retryCount--
			time.Sleep(1 * time.Second)
			continue
		}
		break
	}

	if retryCount == 0 && err != nil {
		log.Fatalf("Db error: %s", err.Error())
	}

	go func() {
		id, _ := rethinkService.connect(true)
		defer rethinkService.close(id)

		// init start topics
		var topic string
		cursor, _ := rethink.Table(tableName).Distinct(rethink.DistinctOpts{
			Index: index,
		}).Run(rethinkService.connectionPool[id])

		for cursor.Next(&topic) {
			if strings.Contains(topic, SkipTopics) {
				continue
			}
			rethinkService.topics = append(rethinkService.topics, topic)
		}

		for {
			select {
			case <-rethinkService.configure.GlobalContext.Done():
				return

			case msg, ok := <-rethinkService.configure.ServeReadChannel():
				if !ok {
					return
				}

				rethinkService.appendTopic(msg.(Message).Topic)

				err := rethink.Table(tableName).Insert(msg.(Message)).Exec(rethinkService.connectionPool[id])
				if err != nil {
					log.Warnf("Insert message error: %s", err.Error())
				}
			}
		}
	}()
}

func (rethinkService *RethinkService) Stop() {
}

func (rethinkService *RethinkService) InitializeContext() error {
	var (
		err error
		id  uuid.UUID
	)
	// Create DB
	rethinkService.connectionPool = make(map[uuid.UUID]*rethink.Session)
	rethinkService.newTopicChan = make(chan string)

	if id, err = rethinkService.connect(false); err != nil {
		return err
	}

	if err = rethinkService.executeCreateIfAbsent(rethink.DBList().Contains(dbName), rethink.DBCreate(dbName), id); err != nil {
		return err
	}

	rethinkService.close(id)

	// Create Table And Index
	if id, err = rethinkService.connect(true); err != nil {
		return err
	}

	if err = rethinkService.executeCreateIfAbsent(rethink.TableList().Contains(tableName), rethink.TableCreate(tableName), id); err != nil {
		return err
	}

	if err = rethinkService.executeCreateIfAbsent(rethink.Table(tableName).IndexList().Contains(index), rethink.Table(tableName).IndexCreate(index), id); err != nil {
		return err
	}

	_ = rethink.Table(tableName).IndexWait().Exec(rethinkService.connectionPool[id])
	rethinkService.close(id)

	return nil
}

func (rethinkService *RethinkService) connect(isDbCreated bool) (uuid.UUID, error) {
	var (
		session *rethink.Session
		err     error
	)

	connectOpts := rethink.ConnectOpts{
		Address: rethinkService.configure.Config.DatabaseServer(),
	}

	if isDbCreated {
		connectOpts.Database = dbName
	}

	if session, err = rethink.Connect(connectOpts); err != nil {
		return [16]byte{}, err
	}

	id := uuid.New()
	rethinkService.connectionPool[id] = session

	return id, nil
}

func (rethinkService *RethinkService) close(id uuid.UUID) {
	rethinkService.connectionPool[id].Close()
	delete(rethinkService.connectionPool, id)
}

func (rethinkService *RethinkService) executeCreateIfAbsent(listTerm rethink.Term, createTerm rethink.Term, id uuid.UUID) error {
	var (
		isContains bool
		dbResponse *rethink.Cursor
		err        error
	)

	if dbResponse, err = listTerm.Run(rethinkService.connectionPool[id]); err != nil {
		return err
	}

	dbResponse.Next(&isContains)
	if !isContains {
		if err = createTerm.Exec(rethinkService.connectionPool[id]); err != nil {
			return err
		}
	}

	return nil
}

func (rethinkService *RethinkService) getLastMessages(id uuid.UUID, msgChan chan Message, filters Filters) {
	var filterTerm = rethink.Table(tableName)

	if filters.Topic != "" {
		filterTerm = filterTerm.GetAllByIndex(index, filters.Topic)
	}

	cursor, err := filterTerm.OrderBy(rethink.Desc("timestamp")).Limit(20).OrderBy(rethink.Asc("timestamp")).Run(rethinkService.connectionPool[id])
	if err != nil {
		log.Warnf("Get desc error: %s", err.Error())
		return
	}

	var msgs []Message
	if err = cursor.All(&msgs); err != nil {
		log.Warnf("Get all messages error: %s", err.Error())
		return
	}

	for _, msg := range msgs {
		if msg.Filter(filters) {
			msgChan <- msg
		}
	}
}

func (rethinkService *RethinkService) appendTopic(topic string) {
	for _, v := range rethinkService.topics {
		if v == topic || strings.Contains(v, SkipTopics) {
			return
		}
	}
	rethinkService.topics = append(rethinkService.topics, topic)
	log.Tracef("Send new topic: %s", topic)
	rethinkService.newTopicChan <- topic
}
