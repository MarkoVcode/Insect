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

/**
 * RESPONSIBILITY Providing tool set around session/subscriber ID handling
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
