package org.scg.db;

import org.apache.commons.lang.RandomStringUtils;
import org.scg.common.Properties;
import org.scg.common.tool.SIDTool;
import redis.clients.jedis.Jedis;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by developer on 1/22/17.
 */
public class DB {

    private static String CHARS_KEYS = "qazwsxedcrfvtgbyhnujmikolp1234567890QAZWSXEDCRFVTGBYHNUJMIKOLP";
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
        if(isValidProxySessionId(pSessionId)) {
            if (JEDIS.exists(pSessionId)) {
                return true;
            }
        }
        return false;
    }

    public String createProxySession() {
        String key = generateProxySessionId();
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

    private String generateProxySessionId() {
        String base = RandomStringUtils.random(9, CHARS_KEYS);
        String generated = calculatePrefix(base) + base;
        return generated;
    }

    private boolean isValidProxySessionId(String pSessionId) {
        String key = pSessionId.substring(2,pSessionId.length());
        String regenId = calculatePrefix(key) + key;
        if(pSessionId.equals(regenId)) {
            return true;
        }
        return false;
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

    private String calculatePrefix(String key) {
        byte[] bytesOfMessage = new byte[0];
        try {
            bytesOfMessage = key.getBytes("UTF-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        MessageDigest md = null;
        try {
            md = MessageDigest.getInstance("MD5");
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
        byte[] thedigest = md.digest(bytesOfMessage);

        StringBuffer sb = new StringBuffer();
        for (int i = 0; i < 1; i++) {
            sb.append(Integer.toString((thedigest[i] & 0xff) + 0x100, 16).substring(1));
        }
        return sb.toString();
    }
}
