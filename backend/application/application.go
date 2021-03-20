package application

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/goioc/di"
	log "github.com/sirupsen/logrus"
)

type Service interface {
	Serve()
	Stop()
}

type Application struct {
	cancel   context.CancelFunc
	services []Service
}

func New(cancel context.CancelFunc, serviceName ...string) *Application {
	application := Application{
		cancel: cancel,
	}
	for _, value := range serviceName {
		application.services = append(application.services, di.GetInstance(value).(Service))
	}

	return &application
}

func (application *Application) Run() error {
	for _, service := range application.services {
		service.Serve()
	}

	return application.waitTerminate()
}

func (application *Application) Stop() {
	for _, service := range application.services {
		service.Stop()
	}
}

func (application *Application) waitTerminate() error {
	var (
		stopChan = make(chan os.Signal, 1)
		signals  = []os.Signal{syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT}
	)
	signal.Notify(stopChan, signals...)

	log.Infof("Wait terminate signal")
	log.Infof("Signal: %s", (<-stopChan).String())

	application.cancel()
	application.Stop()

	signal.Stop(stopChan)
	close(stopChan)
	return nil
}
