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

import java.util.Date;

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

    public String getProxyApiEndpoint(String psid) {
        return JEDIS.get(psid);
    }
    public String getMockConfig(String psid) {
        String key = SIDTool.buildMockSessionsKey(psid);
        return JEDIS.get(key);
    }

    public boolean isSessionOwner(String session, String pSessionId) {
        String skey = SIDTool.buildWSSessionKey(pSessionId, session);
        if(JEDIS.exists(skey)) {
            String psid = JEDIS.get(skey);
            if(pSessionId.equals(psid)) {
                return true;
            }
        }
        return false;
    }

    private void setSessionOwnership(String session, String pSessionId) {
        String skey = SIDTool.buildWSSessionKey(pSessionId,session);
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

    public void updateProxyApiEndpoint(String psid, String endpointURL) {
        JEDIS.set(psid, endpointURL);
        JEDIS.expire(psid, getRealExpirationTime(psid));
    }

    public void updateMockConfig(String psid, String mockConfigJson) {
        String key = SIDTool.buildMockSessionsKey(psid);
        JEDIS.set(key, mockConfigJson);
        JEDIS.expire(key, getRealExpirationTime(psid));
    }

    public String fetchDeployedMockSlot(String psid) {
        String key = SIDTool.buildMockSessionsKey(psid);
        String mock = JEDIS.get(key);
        if(mock.isEmpty()) {
            return null;
        }
        //TODO improve this code:
        int index = mock.indexOf("mockid\":\"");
        String mockid = mock.substring(index);
        String[] parts = mockid.split("\"");
        String name = parts[2];
        //mockid":"mock1"}
        //check this for mock1 - 5
        //{"mockid":"mock1","mock":[{"path":"","methods":{"GET":{"code":"200","payload":{"array":[1,2,3],"boolean":true,"null":null,"number":123,"object":{"a":"b","c":"d"},"string":"Hello World"},"headers":{}},"POST":{"code":"200","payload":{"array":[1,2,3],"boolean":true,"null":null,"number":123,"object":{"a":"b","c":"d"},"string":"Hello World"},"headers":{}}}}]}
        //{"mock":[{"path":"","methods":{"GET":{"code":"200","payload":{"array":[1,2,3],"boolean":true,"null":null,"number":123,"object":{"a":"b","c":"d"},"string":"Hello World"},"headers":{}},"POST":{"code":"200","payload":{"array":[1,2,3],"boolean":true,"null":null,"number":123,"object":{"a":"b","c":"d"},"string":"Hello World"},"headers":{}}}}]}
        return name;
    }

    private Integer getRealExpirationTime(String psid) {
        String key = SIDTool.buildExpireSessionsKey(psid);
        Long futureTime = Long.parseLong(JEDIS.get(key));
        Long timeNow = (new Date()).getTime()/1000;
        if(futureTime > timeNow) {
            return futureTime.intValue() - timeNow.intValue();
        }
        return 1;
    }

    private void createProxySession(String psid) {
        JEDIS.set(psid, "");
        JEDIS.expire(psid, PROP.getRedisDefaultSessionExpiration());
    }

    private void createProxySessionTimer(String psid) {
        String key = SIDTool.buildExpireSessionsKey(psid);
        Long timeToExpire = (new Date()).getTime()/1000 + PROP.getRedisDefaultSessionExpiration();
        JEDIS.set(key, ""+timeToExpire);
        JEDIS.expire(key, PROP.getRedisDefaultSessionExpiration());
    }

    private void createMockSession(String psid) {
        String key = SIDTool.buildMockSessionsKey(psid);
        JEDIS.set(key, "");
        JEDIS.expire(key, PROP.getRedisDefaultSessionExpiration());
    }

    /**
     * This method is called only once when the session starts
     */
    public String createInsectSession(String webSessionId) {
        String psid = SIDTool.generateProxySessionId();
        createProxySession(psid);
        setSessionOwnership(webSessionId, psid);
        createProxySessionTimer(psid);
        createMockSession(psid);
        return psid;
    }

}
