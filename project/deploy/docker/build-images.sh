#!/bin/sh

### PREPARE ARTIFACTS
mkdir -p project/deploy/docker/jetty-web/artifacts
mkdir -p project/deploy/docker/jetty-ws/artifacts
mkdir -p project/deploy/docker/nodejs/artifacts
cp -f ins_webapp/build/libs/InserProxy_WebApplication.war project/deploy/docker/jetty-web/artifacts/ROOT.war
cp -f ins_websockets/build/libs/InserProxy_WebSockets.war project/deploy/docker/jetty-ws/artifacts/ROOT.war
tar -czvf project/deploy/docker/nodejs/artifacts/nodejsapp.tar ins_proxy/src

### CREATE IMAGES


### SAVE IMAGES TO REGISTRY


