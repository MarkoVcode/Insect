package org.scg.websockets.message;

import java.io.Serializable;

/**
 * Created by developer on 15/03/16.
 */
public class SubInboundMessage implements Serializable {
    // Proxy session ID
    private String psId;
    // Web session ID
    private String wsId;

    public String getPsId() {
        return psId;
    }

    public void setPsId(String psId) {
        this.psId = psId;
    }

    public String getWsId() {
        return wsId;
    }

    public void setWsId(String wsId) {
        this.wsId = wsId;
    }
}
