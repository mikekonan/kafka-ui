.PHONY: help all prepare build clean lint
.DEFAULT_GOAL := help

all: prepare build

prepare: ## Prepare build, generate enums
	go generate ./...

build: ## Build binary
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -o kafka-backend main.go

clean: ## clean working tree
	rm -f kafka-backend*
	find . -wholename '*_enum.go' -delete

lint: ## golangci linter
	golangci-lint run -e ST1006,SA1029,S1034 --path-prefix $(PWD)

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'