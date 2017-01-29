#!/bin/sh
REGISTRY_HOST=doc-reg

### CREATE IMAGES

docker build -t nginx_insect_${BUILD_NUMBER} ${WORKSPACE}/../999_pull_infrastructure/insect/nginx

docker tag nginx_insect_${BUILD_NUMBER} ${REGISTRY_HOST}:5000/nginx_insect:${BUILD_NUMBER}

### PUSH IMAGES TO REGISTRY

docker push ${REGISTRY_HOST}:5000/nginx_insect:${BUILD_NUMBER}

docker rmi ${REGISTRY_HOST}:5000/nginx_insect:${BUILD_NUMBER}

docker rmi nginx_insect_${BUILD_NUMBER}
