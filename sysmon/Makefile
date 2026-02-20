.PHONY: build-ui build-linux build-windows run tidy

build-ui:
	cd ui && npm install && npm run build

build-linux: build-ui
	GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/sysmon-linux ./cmd/agent

build-windows: build-ui
	GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o bin/sysmon.exe ./cmd/agent

run:
	go run ./cmd/agent --config config.yaml

tidy:
	go mod tidy
