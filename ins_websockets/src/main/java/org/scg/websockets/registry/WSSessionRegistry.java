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
package org.scg.websockets.registry;

import org.eclipse.jetty.websocket.api.Session;
import org.scg.common.tool.SIDTool;
import org.scg.db.DB;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by developer on 15/03/16.
 */

/**
 * RESPONSIBILITY Manages instance sessions
 */
public class WSSessionRegistry {

    private static volatile WSSessionRegistry INSTANCE;
    private volatile Map<String, Session> sessionRegistry;
    private static final Logger LOG = LoggerFactory.getLogger(WSSessionRegistry.class);

    private WSSessionRegistry() {
        sessionRegistry = new ConcurrentHashMap<>();
    }

    public static WSSessionRegistry getInstance() {
        if(null == INSTANCE) {
            synchronized (WSSessionRegistry.class) {
                if (null == INSTANCE) {
                    INSTANCE = new WSSessionRegistry();
                }
            }
        }
        return INSTANCE;
    }

    public void addSession(String subscriptionId, Session session) {
        sessionRegistry.put(subscriptionId, session);
    }

    public synchronized void removeSession(String subscriptionId) {
        if(sessionRegistry.containsKey(subscriptionId)) {
            Session session = sessionRegistry.get(subscriptionId);
            if(session.isOpen()) {
                session.close();
            }
            sessionRegistry.remove(subscriptionId);
            DB.getInstance().unregisterWSSession(SIDTool.extractPsIdFromWSSessionKey(subscriptionId), SIDTool.extractWsIdFromWSSessionKey(subscriptionId));
        }
    }

    public List<String> purgeSessions() {
        List<String> removed = new ArrayList<>();
        for (Map.Entry entry : sessionRegistry.entrySet()) {
            if(!((Session)entry.getValue()).isOpen()) {
                removed.add((String)entry.getKey());
                removeSession((String)entry.getKey());
            }
        }
        return removed;
    }

    public void push(String subscriptionId, String message) {
        if(sessionRegistry.containsKey(subscriptionId)) {
            Session session = sessionRegistry.get(subscriptionId);
            if (session.isOpen()) {
                try {
                    session.getRemote().sendString(message);
                } catch (IOException e) {
                    LOG.error("Pushing message failed", e);
                }
            } else {
                removeSession(subscriptionId);
            }
        }
    }

    public void removeSessionByHashCode(int i) {
        for (Map.Entry entry : sessionRegistry.entrySet()) {
            if(((Session)entry.getValue()).hashCode() == i) {
                removeSession((String)entry.getKey());
            }
        }
    }
}
