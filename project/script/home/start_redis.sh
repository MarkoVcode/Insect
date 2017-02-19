#!/bin/sh

docker ps -a | grep insectredis | cut -d ' ' -f 1 | xargs -r docker start
