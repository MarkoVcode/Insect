package org.scg.common.tool;

/**
 * Created by developer on 1/24/17.
 */
public class SIDTool {

    public static String WS_KEY_SUFFIX = "_WS";

    public static String buildWSSessionsKey(String psid) {
        return psid + WS_KEY_SUFFIX;
    }

    public static String buildWSSessionKey(String psid, String wsSssionId) {
        return psid + ":" + wsSssionId;
    }

    public static String extractPsIdFromWSSessionKey(String sessionKey) {
        int ind = sessionKey.indexOf(":");
        return sessionKey.substring(0,ind);
    }

    public static String extractWsIdFromWSSessionKey(String sessionKey) {
        int ind = sessionKey.indexOf(":");
        return sessionKey.substring(ind+1 , sessionKey.length());
    }

}
