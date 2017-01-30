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
package org.scg.db;

import org.scg.common.Properties;
import org.scg.common.tool.SIDTool;
import redis.clients.jedis.Jedis;

/**
 * Created by developer on 1/22/17.
 */

/**
 * RESPONSIBILITY Provide adapter to cache access
 */
public class DB {

    private static Properties PROP = Properties.getInstance();

    private static Jedis JEDIS;
    private static DB INSTANCE;

    private DB() {
        JEDIS = new Jedis(PROP.getRedisHost(), PROP.getRedisPort());
    }

    public static DB getInstance() {
        if(null == INSTANCE) {
            synchronized (DB.class) {
                if(null == INSTANCE) {
                    INSTANCE = new DB();
                }
            }
        }
        return INSTANCE;
    }

    public boolean isValidProxySession(String pSessionId) {
        if(SIDTool.isValidProxySessionId(pSessionId)) {
            if (JEDIS.exists(pSessionId)) {
                return true;
            }
        }
        return false;
    }

    public String createProxySession() {
        String key = SIDTool.generateProxySessionId();
        JEDIS.set(key, "");
        JEDIS.expire(key, PROP.getRedisDefaultSessionExpiration());
        return key;
    }

    public void setProxyApiEndpoint(String psid, String endpointURL) {
        JEDIS.set(psid, endpointURL);
    }

    public String getProxyApiEndpoint(String psid) {
        return JEDIS.get(psid);
    }

    public boolean isSessionOwner(String session, String pSessionId) {
        String skey = SIDTool.buildWSSessionKey(session,pSessionId);
        if(JEDIS.exists(skey)) {
            String psid = JEDIS.get(skey);
            if(pSessionId.equals(psid)) {
                return true;
            }
        }
        return false;
    }

    public void setSessionOwnership(String session, String pSessionId) {
        String skey = SIDTool.buildWSSessionKey(session,pSessionId);
        JEDIS.set(skey, pSessionId);
        JEDIS.expire(skey, PROP.getRedisDefaultSessionExpiration());
    }

    public boolean isProxyActive(String pSessionId) {
        if(getProxyApiEndpoint(pSessionId).length() != 0) {
            return true;
        }
        return false;
    }

    public void registerWSSession(String psid, String wsSssionId, String wsUrl) {
        if (!JEDIS.exists(SIDTool.buildWSSessionsKey(psid))) {
            JEDIS.hset(SIDTool.buildWSSessionsKey(psid), SIDTool.buildWSSessionKey(psid, wsSssionId), wsUrl);
            JEDIS.expire(SIDTool.buildWSSessionsKey(psid), PROP.getRedisDefaultSessionExpiration());
        } else {
            JEDIS.hset(SIDTool.buildWSSessionsKey(psid), SIDTool.buildWSSessionKey(psid, wsSssionId), wsUrl);
        }
    }

    public void unregisterWSSession(String psid, String wsSssionId) {
        if (JEDIS.exists(SIDTool.buildWSSessionsKey(psid))) {
            if(JEDIS.hexists(SIDTool.buildWSSessionsKey(psid), SIDTool.buildWSSessionKey(psid, wsSssionId))) {
                JEDIS.hdel(SIDTool.buildWSSessionsKey(psid), SIDTool.buildWSSessionKey(psid, wsSssionId));
            }
        }
    }

}
