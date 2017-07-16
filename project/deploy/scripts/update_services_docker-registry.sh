#!/bin/sh

# Remove Exited containers
docker ps -a | grep Exit | cut -d ' ' -f 1 | xargs -r docker rm

# Remove dangling volumes
docker volume ls -qf dangling=true | xargs -r docker volume rm

docker pull softcognito/webapp_insect:${PARAMETER_BUILD_NUMBER}
docker pull softcognito/websockets_insect:${PARAMETER_BUILD_NUMBER}
docker pull softcognito/api_insect:${PARAMETER_BUILD_NUMBER}

docker service update --image softcognito/webapp_insect:${PARAMETER_BUILD_NUMBER} web
docker service update --image softcognito/websockets_insect:${PARAMETER_BUILD_NUMBER} ws
docker service update --image softcognito/api_insect:${PARAMETER_BUILD_NUMBER} api
