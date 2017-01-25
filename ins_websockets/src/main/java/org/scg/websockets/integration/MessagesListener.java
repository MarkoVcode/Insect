package org.scg.websockets.integration;

import fi.iki.elonen.NanoHTTPD;
import org.scg.common.Properties;
import org.scg.websockets.registry.WSSessionRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

/**
 * Receives push messages - must be protected!! for local calls only no internet access
 * This to be implemented on web socket servlet?
 */

/**
 * Created by developer on 10/05/16.
 * RESPONSIBILITY: Receive HTTP requests from API with message or unsubscribe request
 */
public class MessagesListener extends NanoHTTPD implements Runnable {

    private static final Properties PROP = Properties.getInstance();
    private static Logger LOG = LoggerFactory.getLogger(MessagesListener.class);

    public MessagesListener() throws IOException {
        super(PROP.getWebsocketInstanceInternalPort());
        System.out.println("\nWebSockets Messages Listener Running! " + PROP.getWebsocketsInternalURL()+"\n");  //what is my IP????
    }

    @Override
    public void run() {
        try {
            start(NanoHTTPD.SOCKET_READ_TIMEOUT, false);
        } catch (IOException ioe) {
            System.err.println("Couldn't start server:\n" + ioe);
        }
    }

    @Override
    public Response serve(IHTTPSession session) {
        MessageRequest mr = new MessageRequest(session);
        if(mr.isRequestValid()) {
            if (mr.isUnsubscribe()) {
                WSSessionRegistry.getInstance().removeSession(mr.getSubscriptionId());
            } else {
                WSSessionRegistry.getInstance().push(mr.getSubscriptionId(), mr.getMessage());
            }
            return newFixedLengthResponse(Response.Status.NO_CONTENT, "application/json", null);
        }
        return newFixedLengthResponse(Response.Status.BAD_REQUEST, "application/json", null);
    }
}
