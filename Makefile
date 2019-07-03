#!/bin/zsh

hash=$(shell git rev-parse HEAD)
image=ynab:${hash}

server_folder=./server/src/main/resources/static/spa

push:
	$(eval running_container := $(shell docker ps -f 'expose=8080' --format '{{.ID}}'))
	[[ ! -z "${running_container}" ]] && docker kill ${running_container} || echo "No running container"
	docker build -t ${image} .
	docker run -d -p 8765:8080 ${image}
	$(eval container_id := $(shell docker ps -f 'ancestor=${image}' --format '{{.ID}}'))
	mkdir -p /tmp/docker_finance_files
	docker cp ${container_id}:/app/target/ynab-0.0.1.jar /tmp/docker_finance_files
	scp /tmp/docker_finance_files/ynab-0.0.1.jar linode:Workspace/bin

build-and-push:
	cd ./cli && yarn install && yarn build-prod
	rm -rf ${server_folder} && mkdir -p ${server_folder}
	cp -R ./cli/dist/* ${server_folder}
	cd ./server && mvn -q clean install
	scp ./server/target/ynab-0.0.1.jar linode:Workspace/bin

