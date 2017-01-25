package org.scg.websockets.message;

/**
 * Created by developer on 1/24/17.
 */
public class SubOutboundMessage extends SubInboundMessage {

    private boolean subscribed;
    private String submesage;
    private String build;
    private String builddate;
    private String version;

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

    public String getBuild() {
        return build;
    }

    public void setBuild(String build) {
        this.build = build;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getBuilddate() {
        return builddate;
    }

    public void setBuilddate(String builddate) {
        this.builddate = builddate;
    }
}
