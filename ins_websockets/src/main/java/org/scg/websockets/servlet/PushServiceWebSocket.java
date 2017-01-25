package org.scg.websockets.servlet;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.*;
import org.scg.common.Properties;
import org.scg.common.tool.JSONHelper;
import org.scg.common.tool.SIDTool;
import org.scg.db.DB;
import org.scg.websockets.message.SubInboundMessage;
import org.scg.websockets.message.SubOutboundMessage;
import org.scg.websockets.registry.WSSessionRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

/**
 * Created by developer on 15/03/16.
 */
@WebSocket(maxIdleTime=800000)
public class PushServiceWebSocket {

    private static final Properties PROP = Properties.getInstance();
    private static final DB DB_INSTANCE = DB.getInstance();
    private static final Logger LOG = LoggerFactory.getLogger(PushServiceWebSocket.class);
    private Session session;
    //private SubInboundMessage message;

    // called when the socket connection with the browser is established
    @OnWebSocketConnect
    public void handleConnect(Session session) {
        this.session = session;
    }

    // called when the connection closed
    @OnWebSocketClose
    public void handleClose(int statusCode, String reason) {
        WSSessionRegistry.getInstance().removeSessionByHashCode(session.hashCode());
        LOG.error("Connection closed with statusCode=" + statusCode + ", reason=" + reason);
    }

    // called when a message received from the browser
    @OnWebSocketMessage
    public void handleMessage(String message) {
        LOG.info("Received message session request: " + message);
        SubInboundMessage messageIn = (SubInboundMessage) JSONHelper.getInstance().deSerialize(message, SubInboundMessage.class);
        String wsSessionRegKey = SIDTool.buildWSSessionKey(messageIn.getPsId(), messageIn.getWsId());
        WSSessionRegistry.getInstance().addSession(wsSessionRegKey, session);
        DB_INSTANCE.registerWSSession(messageIn.getPsId(), messageIn.getWsId(), PROP.getWebsocketsInternalURL());
        SubOutboundMessage obm = new SubOutboundMessage();
        obm.setSubscribed(true);
        obm.setSubmesage("OK");
        obm.setPsId(messageIn.getPsId());
        obm.setWsId(messageIn.getWsId());
        obm.setBuild(PROP.BUILDTAG);
        obm.setBuilddate(PROP.BUILDDATE);
        obm.setVersion(PROP.RELEASEVERSION);
        try {
            session.getRemote().sendString(JSONHelper.getInstance().serialize(obm));
        } catch (IOException e) {
            LOG.error("WebSocket Session could not be created - missing chain");
        //    WSSessionRegistry.getInstance().removeSession(wsSessionRegKey);
        //    stop();
            e.printStackTrace();
        }
    }

    // called in case of an error
    @OnWebSocketError
    public void handleError(Throwable error) {
        LOG.error("WebSocket Error!", error);
    }

    // closes the socket
    private void stop() {
        LOG.error("Stop Called");
        try {
            session.disconnect();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
