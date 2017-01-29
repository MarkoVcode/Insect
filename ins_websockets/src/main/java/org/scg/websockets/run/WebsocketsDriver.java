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

/**
 * RESPONSIBILITY Provides starting point for the websockets service on the local DEV env.
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
        LOG.info("Starting WebSocket: " + PROP.getWebWebsocketsHost());
        server = new Server(PROP.getWebWebsocketsPort());
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
