#!/bin/sh

### CREATE IMAGES

docker build -t nginx_insect_${BUILD_NUMBER} ${WORKSPACE}/../999_pull_infrastructure/insect/nginx

docker tag nginx_insect_${BUILD_NUMBER} softcognito/nginx_insect:${BUILD_NUMBER}

### PUSH IMAGES TO REGISTRY

docker push softcognito/nginx_insect:${BUILD_NUMBER}

docker rmi softcognito/nginx_insect:${BUILD_NUMBER}

docker rmi nginx_insect_${BUILD_NUMBER}
