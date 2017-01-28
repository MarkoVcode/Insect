#!/bin/sh
REGISTRY_HOST=doc-reg

# Remove Exited containers
docker ps -a | grep Exit | cut -d ' ' -f 1 | xargs -r docker rm

# Remove dangling volumes
docker volume ls -qf dangling=true | xargs -r docker volume rm

docker pull ${REGISTRY_HOST}:5000/webapp_insect:${PARAMETER_BUILD_NUMBER}
docker pull ${REGISTRY_HOST}:5000/websockets_insect:${PARAMETER_BUILD_NUMBER}
docker pull ${REGISTRY_HOST}:5000/api_insect:${PARAMETER_BUILD_NUMBER}

docker service update --image ${REGISTRY_HOST}:5000/webapp_insect:${PARAMETER_BUILD_NUMBER} web
docker service update --image ${REGISTRY_HOST}:5000/websockets_insect:${PARAMETER_BUILD_NUMBER} ws
docker service update --image ${REGISTRY_HOST}:5000/api_insect:${PARAMETER_BUILD_NUMBER} api
