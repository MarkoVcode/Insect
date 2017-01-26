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
