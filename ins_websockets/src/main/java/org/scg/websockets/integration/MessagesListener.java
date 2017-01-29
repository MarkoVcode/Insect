/**
 *  Copyright 2015 MarkoV
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * InsectIn.space
 *
 * Project home: https://github.com/MarkoVcode/Insect
 *
 * @build <BUILDTAG>
 * @date <BUILDDATE>
 * @version <RELEASEVERSION>
 */
package org.scg.websockets.integration;

import fi.iki.elonen.NanoHTTPD;
import org.scg.common.Properties;
import org.scg.websockets.registry.WSSessionRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

/**
 * Receives push messages - must be secured for local calls only
 */

/**
 * Created by developer on 10/05/16.
 * RESPONSIBILITY: Receive HTTP requests from API with message
 */
public class MessagesListener extends NanoHTTPD implements Runnable {

    private static final Properties PROP = Properties.getInstance();
    private static Logger LOG = LoggerFactory.getLogger(MessagesListener.class);

    public MessagesListener() throws IOException {
        super(PROP.getWebsocketInstanceInternalPort());
        System.out.println("\nWebSockets Messages Listener Running! " + PROP.getWebsocketsInternalURL()+"\n");
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
