package org.scg.websockets.integration;

import fi.iki.elonen.NanoHTTPD;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by developer on 14/05/16.
 * RESPONSIBILITY: PROCESS HTTP request with message or unsubscribe request
 */
public class MessageRequest {

    private static final String MESSAGE = "/push/";
    private static final String UNSUBSCRIBE = "/unsubscribe/";

    private String method;
    private String uri;
    private NanoHTTPD.IHTTPSession session;
    private boolean unsubscribe = false;
    private String subscriptionId;
    private boolean requestValid= true;


    private static Logger LOG = LoggerFactory.getLogger(MessageRequest.class);

    public MessageRequest(NanoHTTPD.IHTTPSession session) {
        method = session.getMethod().toString(); // POST
        uri = session.getUri(); // /push/4234234
        this.session = session;
        processRequestURI();
    }

    private void processRequestURI() {
        if(hasMessage()) {
            subscriptionId = getSubscriptionIdFromPushMessage();
        } else if(hasUnsubscribe()) {
            unsubscribe = true;
            subscriptionId = getSubscriptionIdFromUnsubscribe();
        } else {
            requestValid = false;
        }
    }

    public boolean isRequestValid() {
        return requestValid;
    }

    public boolean isUnsubscribe() {
        return unsubscribe;
    }

    private String getSubscriptionIdFromPushMessage() {
        return getId(MESSAGE);
    }

    private String getSubscriptionIdFromUnsubscribe() {
        return getId(UNSUBSCRIBE);
    }

    private String getId(String type) {
        String[] parts = uri.split(type);
        if(parts.length > 1) {
            return parts[1];
        }
        return null;
    }

    public String getSubscriptionId() {
        return subscriptionId;
    }

    public String getMessage() {
        String jsonMessage = null;
        Map<String, String> requestBody = new HashMap<String, String>();
        try {
            session.parseBody(requestBody);
            jsonMessage = requestBody.get("postData");
        } catch (Exception e) {
            LOG.error("Can't parse request body", e);
        }
        return jsonMessage;
    }

    private boolean hasMessage() {
        if("POST".equalsIgnoreCase(method) && uri.startsWith(MESSAGE)) {
            return true;
        }
        return false;
    }

    private boolean hasUnsubscribe() {
        if("POST".equalsIgnoreCase(method) && uri.startsWith(UNSUBSCRIBE)) {
            return true;
        }
        return false;
    }
}
