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
package org.scg.common.tool;

/**
 * Created by developer on 1/24/17.
 */

import org.apache.commons.lang.RandomStringUtils;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * RESPONSIBILITY Providing tool set around session/subscriber ID handling
 */
public class SIDTool {

    private static String CHARS_KEYS = "qazwsxedcrfvtgbyhnujmikolp1234567890QAZWSXEDCRFVTGBYHNUJMIKOLP";

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

    public static String generateProxySessionId() {
        String base = RandomStringUtils.random(9, CHARS_KEYS);
        String generated = calculatePrefix(base) + base;
        return generated;
    }


    public static boolean isValidProxySessionId(String pSessionId) {
        String key = pSessionId.substring(2,pSessionId.length());
        String regenId = calculatePrefix(key) + key;
        if(pSessionId.equals(regenId)) {
            return true;
        }
        return false;
    }

    private static String calculatePrefix(String key) {
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
