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

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by developer on 1/26/17.
 */

/**
 * RESPONSIBILITY Handling Consul JSON payload
 */
public class JSONConsulHelper  {

    private static JSONArray consulService;

    public static List<String> fetchConsulServiceIPs(String serviceJSON) {
        List<String> ipList = new ArrayList<>();
        if(null != serviceJSON) {
            try {
                consulService = (JSONArray) new JSONParser().parse(serviceJSON);
            } catch (ParseException e) {
                e.printStackTrace();
            }
            for (Object object : consulService) {
                JSONObject jsonObject = (JSONObject) object;
                ipList.add((String) jsonObject.get("ServiceAddress"));
            }
        }
        return ipList;
    }
}
