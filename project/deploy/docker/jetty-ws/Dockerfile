FROM jetty:alpine

COPY artifacts/ROOT.war /var/lib/jetty/webapps/ROOT.war

ENV APP_NAME websockets_insect
ENV CONSUL_URL consul:8500

CMD ["java","-jar", "/usr/local/jetty/start.jar"]
