#!/bin/sh
REGISTRY_HOST=doc-reg

### PREPARE ARTIFACTS
mkdir -p project/deploy/docker/jetty-web/artifacts
mkdir -p project/deploy/docker/jetty-ws/artifacts
mkdir -p project/deploy/docker/nodejs/artifacts
cp -f ins_webapp/build/libs/InserProxy_WebApplication.war project/deploy/docker/jetty-web/artifacts/ROOT.war
cp -f ins_websockets/build/libs/InserProxy_WebSockets.war project/deploy/docker/jetty-ws/artifacts/ROOT.war
tar -czvf project/deploy/docker/nodejs/artifacts/nodejsapp.tar ins_proxy/src

### CREATE IMAGES

docker build -t webapp_insect_${BUILD_NUMBER} project/deploy/docker/jetty-web
docker build -t websockets_insect_${BUILD_NUMBER} project/deploy/docker/jetty-ws
docker build -t api_insect_${BUILD_NUMBER} project/deploy/docker/nodejs

docker tag api_insect_${BUILD_NUMBER} ${REGISTRY_HOST}:5000/api_insect:${BUILD_NUMBER}
docker tag websockets_insect_${BUILD_NUMBER} ${REGISTRY_HOST}:5000/websockets_insect:${BUILD_NUMBER}
docker tag webapp_insect_${BUILD_NUMBER} ${REGISTRY_HOST}:5000/webapp_insect:${BUILD_NUMBER}

### PUSH IMAGES TO REGISTRY

docker push ${REGISTRY_HOST}:5000/webapp_insect:${BUILD_NUMBER}
docker push ${REGISTRY_HOST}:5000/websockets_insect:${BUILD_NUMBER}
docker push ${REGISTRY_HOST}:5000/api_insect:${BUILD_NUMBER}

docker rmi ${REGISTRY_HOST}:5000/webapp_insect:${BUILD_NUMBER}
docker rmi ${REGISTRY_HOST}:5000/websockets_insect:${BUILD_NUMBER}
docker rmi ${REGISTRY_HOST}:5000/api_insect:${BUILD_NUMBER}

docker rmi webapp_insect_${BUILD_NUMBER}
docker rmi websockets_insect_${BUILD_NUMBER}
docker rmi api_insect_${BUILD_NUMBER}

