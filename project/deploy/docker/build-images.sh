#!/bin/sh

mkdir -pf jetty-web/artifacts
mkdir -pf jetty-ws/artifacts
mkdir -pf nodejs/artifacts

tar  nodejs/artifacts/nodejsapp.tar ../../ins_proxy/
mv ../../ins_webapp/build/libs/InserProxy_WebApplication.war jetty-web/artifacts/ROOT.war
mv ../../ins_websockets/build/libs/InserProxy_WebSockets.war jetty-ws/artifacts/ROOT.war
