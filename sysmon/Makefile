.PHONY: build-linux build-windows run tidy

build-linux:
	GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/sysmon-linux ./cmd/agent

build-windows:
	GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o bin/sysmon.exe ./cmd/agent

run:
	go run ./cmd/agent --config config.yaml

tidy:
	go mod tidy
