hash=$(shell git rev-parse HEAD)

run:
	docker build -t ynab:${hash} .
	docker run -p 8765:8080 ynab:${hash}
