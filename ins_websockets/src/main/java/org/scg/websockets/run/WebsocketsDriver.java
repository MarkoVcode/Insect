package org.scg.websockets.run;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.scg.common.Properties;
import org.scg.websockets.servlet.PushServiceSocketServlet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by developer on 10/05/16.
 */
public class WebsocketsDriver implements Runnable {

    private static final Properties PROP = Properties.getInstance();
    private static final Logger LOG = LoggerFactory.getLogger(WebsocketsDriver.class);

    private Server server;
    private ServletContextHandler ctx = new ServletContextHandler();

    public static void main(String[] args) throws Exception {
        WebsocketsDriver wsd = new WebsocketsDriver();
        wsd.run();
    }

    private WebsocketsDriver() {
        init();
        setupServlets();
    }

    @Override
    public void run() {
        startServer();
    }

    private void init() {
        LOG.info("Starting WebSocket: " + PROP.getPublicWebsocketsUrl());
        server = new Server(PROP.getPublicWebsocketsPort());
        ctx.setContextPath(PROP.getWebsocketsRoot());
    }

    private void setupServlets() {
        ServletHolder sh = ctx.addServlet(PushServiceSocketServlet.class, PROP.getWebsocketsServletPath());
        sh.setInitOrder(1);
        server.setHandler(ctx);
    }

    private void startServer() {
        try {
            server.start();
        } catch (Exception e) {
            LOG.error("Server Start", e);
        }
        try {
            server.join();
        } catch (InterruptedException e) {
            LOG.error("Servie Join", e);
        }
    }
}
