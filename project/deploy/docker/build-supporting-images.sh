#!/bin/sh
REGISTRY_HOST=213.32.67.176

### CREATE IMAGES

docker build -t nginx_insect_${BUILD_NUMBER} project/deploy/docker/nginx
docker build -t redis_insect_${BUILD_NUMBER} project/deploy/docker/redis

docker tag nginx_insect_${BUILD_NUMBER} ${REGISTRY_HOST}:5000/nginx_insect:${BUILD_NUMBER}
docker tag redis_insect_${BUILD_NUMBER} ${REGISTRY_HOST}:5000/redis_insect:${BUILD_NUMBER}

### PUSH IMAGES TO REGISTRY

docker push ${REGISTRY_HOST}:5000/nginx_insect:${BUILD_NUMBER}
docker push ${REGISTRY_HOST}:5000/redis_insect:${BUILD_NUMBER}

docker rmi ${REGISTRY_HOST}:5000/nginx_insect:${BUILD_NUMBER}
docker rmi ${REGISTRY_HOST}:5000/redis_insect:${BUILD_NUMBER}

docker rmi nginx_insect_${BUILD_NUMBER}
docker rmi redis_insect_${BUILD_NUMBER}
