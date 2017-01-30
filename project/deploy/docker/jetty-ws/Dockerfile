FROM jetty:alpine

COPY artifacts/ROOT.war /var/lib/jetty/webapps/ROOT.war

ENV SERVICE_NAME websockets_insect
ENV CONSUL_URL consul:8500
ENV ENVIRONMENT PRODUCTION

CMD ["java","-jar", "/usr/local/jetty/start.jar"]
