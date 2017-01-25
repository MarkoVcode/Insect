package org.scg.websockets.servlet;

import org.eclipse.jetty.websocket.servlet.WebSocketServlet;
import org.eclipse.jetty.websocket.servlet.WebSocketServletFactory;
import org.scg.websockets.integration.MessagesListener;
import org.scg.websockets.registry.WSSessionRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;

/**
 * Created by developer on 15/03/16.
 */
public class TOCPushServiceSocketServlet extends WebSocketServlet {

    private static final Logger LOG = LoggerFactory.getLogger(TOCPushServiceSocketServlet.class);

    @Override
    public void configure(WebSocketServletFactory factory) {
        factory.getPolicy().setIdleTimeout(800000);
        factory.register(TOCPushServiceWebSocket.class);
        LOG.info("Servlet configure TOCPushServiceWebSocket.class: " + this.toString());
    }

    @Override
    public void destroy()
    {
        super.destroy();
        LOG.info("Servlet destroy: " + this.toString());
    }

    @Override
    public void init() throws ServletException {
        super.init();
        WSSessionRegistry.getInstance();  //just instantiate SessionRegistry
        MessagesListener ml = null;
        try {
            ml = new MessagesListener();
        } catch (Exception e) {
            e.printStackTrace();
        }
        new Thread(ml).start();
        LOG.info("Servlet init finished: " + this.toString());
    }
}
