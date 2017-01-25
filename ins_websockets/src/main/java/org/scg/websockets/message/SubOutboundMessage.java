package org.scg.websockets.message;

import java.io.Serializable;

/**
 * Created by developer on 1/24/17.
 */
public class SubOutboundMessage extends SubInboundMessage {

    private boolean subscribed;
    private String submesage;

    public boolean isSubscribed() {
        return subscribed;
    }

    public void setSubscribed(boolean subscribed) {
        this.subscribed = subscribed;
    }

    public String getSubmesage() {
        return submesage;
    }

    public void setSubmesage(String submesage) {
        this.submesage = submesage;
    }
}
