.PHONY: build clean

build:
	go generate ./...
	go build -trimpath -o kafka-backend main.go

build-alpine:
	go generate ./...
	go build -tags musl -trimpath -o kafka-backend main.go

clean:
	rm -f kafka-backend*
	find . -wholename '*_enum.go' -delete