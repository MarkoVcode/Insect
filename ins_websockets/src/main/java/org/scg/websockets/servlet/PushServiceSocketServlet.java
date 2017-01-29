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
public class PushServiceSocketServlet extends WebSocketServlet {

    private static final Logger LOG = LoggerFactory.getLogger(PushServiceSocketServlet.class);

    @Override
    public void configure(WebSocketServletFactory factory) {
        factory.getPolicy().setIdleTimeout(800000);
        factory.register(PushServiceWebSocket.class);
        LOG.info("Servlet configure PushServiceWebSocket.class: " + this.toString());
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
