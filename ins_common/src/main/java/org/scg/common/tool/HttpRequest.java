package org.scg.common.tool;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Created by developer on 1/26/17.
 */
public class HttpRequest {

    private final static String USER_AGENT = "TOC-REST-Service";
    private static Logger LOG = LoggerFactory.getLogger(HttpRequest.class);

    public static void post(String url, String body) throws Exception {
        URL obj = new URL(url);
        HttpURLConnection con = (HttpURLConnection) obj.openConnection();

        con.setRequestMethod("POST");
        con.setRequestProperty("User-Agent", USER_AGENT);
        con.setRequestProperty("Accept-Language", "en-US,en;q=0.5");
        con.setRequestProperty("accept", "application/json");
        con.setRequestProperty("Content-Type", "application/json");
        con.setDoOutput(true);

        byte[] outputInBytes = body.getBytes("UTF-8");
        OutputStream os = con.getOutputStream();
        os.write( outputInBytes );
        os.close();

        int responseCode = con.getResponseCode();
        if(responseCode != 204) {
            StringBuilder sb = new StringBuilder();
            sb.append("Sending 'POST' request to URL : " + url);
            sb.append("Body : " + body);
            sb.append("Response Code : " + responseCode);

            BufferedReader in = new BufferedReader(
                new InputStreamReader(con.getInputStream()));
            String inputLine;
            StringBuffer response = new StringBuffer();

            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
            in.close();

            sb.append(response.toString());
            LOG.error("Push message has not been delivered! " + sb.toString());
        }
    }

    public static String get(String url) throws Exception {
        URL obj = new URL(url);
        HttpURLConnection con = (HttpURLConnection) obj.openConnection();

        con.setRequestMethod("GET");
        con.setRequestProperty("User-Agent", USER_AGENT);
        con.setRequestProperty("Accept-Language", "en-US,en;q=0.5");
        con.setRequestProperty("accept", "application/json");
        con.setDoOutput(true);

        int responseCode = con.getResponseCode();
        BufferedReader in = new BufferedReader(
            new InputStreamReader(con.getInputStream()));
        String inputLine;
        StringBuffer response = new StringBuffer();

        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();
        return response.toString();
    }

    public static int post(String url, String body, String tocen) throws Exception {
        URL obj = new URL(url);
        HttpURLConnection con = (HttpURLConnection) obj.openConnection();

        con.setRequestMethod("POST");
        con.setRequestProperty("User-Agent", USER_AGENT);
        con.setRequestProperty("Accept-Language", "en-US,en;q=0.5");
        con.setRequestProperty("accept", "application/json");
        con.setRequestProperty("Content-Type", "application/json");
        con.setRequestProperty("Authorization", "TOCen " + tocen);
        con.setDoOutput(true);

        byte[] outputInBytes = body.getBytes("UTF-8");
        OutputStream os = con.getOutputStream();
        os.write(outputInBytes);
        os.close();

        return con.getResponseCode();
    }
}
