package org.scg.common;

import org.scg.common.tool.HttpRequest;
import org.scg.common.tool.JSONConsulHelper;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.*;

/**
 * Created by developer on 1/23/17.
 */
public class Properties {

    public static final String BUILDTAG = "<BUILDTAG>";
    public static final String BUILDDATE = "<BUILDDATE>";
    public static final String RELEASEVERSION = "<RELEASEVERSION>";

    private static final String DEV_ENVIRONMENT = "DEVELOPMENT";
    private static final String ENVIRONMENT = "<ENVIRONMENT>";
    private static Properties INSTANCE;

    private static final Map<String, String> ENV = System.getenv();
    private static Map<String, String> HOST_IP_ADDRESS_CACHE = new HashMap<>();
    /**
     * THESE PROPERTIES ARE GOING TO BE IN EXT FILE:
     */
    private static final Integer REDIS_PORT= 6379;
    private static final String  REDIS_HOST= "127.0.0.1";
    private static final Integer REDIS_DEFAULT_SESSION_EXPIRATION = 60*60*24;
    private static final Integer WEBSOCKETS_PUBLIC_PORT = 3333;
    private static final Integer WEBSOCKETS_INTERNAL_PORT = 8090;
    private static final String  WEBSOCKETS_PUBLIC_URL = "";
    private static final String  WEBSOCKETS_ROOT = "";
    private static final String  WEBSOCKETS_SERVLET_PATH = "/tocpush";
    private static final String  WEBSOCKETS_HOST = "127.0.0.1";
    private static final Integer WEBAPP_PUBLIC_PORT = 8088;
    private static final String  WEBAPP_STATIC_DIR = "/toc_webapp/src/main/webapp";
    private static final String  WEBAPP_TEMPLATES_DIR = "ins_webapp/src/main/resources/templates";
    private static final String  PROXY_API_ENDPOINT = "https://192.168.56.95:8080/service/proxy/";

    private Properties() {
        getHostIpAddress(); //run it when instantiated and put in cache
    }

    private List<String> discoverAllHostIP4s() {
        List<String> allHostIPs = new ArrayList<>();
        try {
            Enumeration e = NetworkInterface.getNetworkInterfaces();
            while (e.hasMoreElements()) {
                NetworkInterface n = (NetworkInterface) e.nextElement();
                Enumeration ee = n.getInetAddresses();
                while (ee.hasMoreElements()) {
                    InetAddress i = (InetAddress) ee.nextElement();
                    String host = i.getHostAddress();
                    if (!host.startsWith("127.0") && !host.contains(":")) {
                        allHostIPs.add(i.getHostAddress());
                    }
                }
            }
        } catch (SocketException e1) {
            e1.printStackTrace();
        }
        return allHostIPs;
    }

    public static Properties getInstance() {
        if(null == INSTANCE) {
            synchronized (Properties.class) {
                if(null == INSTANCE) {
                    INSTANCE = new Properties();
                }
            }
        }
        return INSTANCE;
    }

    public String getCurrentEnvironment() {
        if("<ENVIRONMENT>".equals(ENVIRONMENT)) {
            return DEV_ENVIRONMENT;
        }
        return ENVIRONMENT;
    }

    public Map<String, String> getSystemEnvironment() {
        return ENV;
    }

    public String getEnvHostname() { return ENV.get("HOSTNAME");}

    public int getRedisPort()
    {
        return REDIS_PORT;
    }

    public String getRedisHost()
    {
        return REDIS_HOST;
    }

    public int getRedisDefaultSessionExpiration()
    {
        return REDIS_DEFAULT_SESSION_EXPIRATION;
    }

    public int getPublicWebsocketsPort()
    {
        return WEBSOCKETS_PUBLIC_PORT;
    }
    public String getPublicWebsocketsUrl()
    {
        return WEBSOCKETS_PUBLIC_URL;
    }
    public String getWebsocketsRoot()
    {
        return WEBSOCKETS_ROOT;
    }
    public String getWebsocketsHost()
    {
        return WEBSOCKETS_HOST;
    }
    public String getWebsocketsInternalURL()
    {
        return "http://"+getHostIpAddress()+":"+WEBSOCKETS_INTERNAL_PORT;
    }
    public String getWebsocketsServletPath()
    {
        return WEBSOCKETS_SERVLET_PATH;
    }


    public int getPublicWebapplicationPort()
    {
        return WEBAPP_PUBLIC_PORT;
    }
    public String getWebappStaticDir()
    {
        return WEBAPP_STATIC_DIR;
    }
    public String getWebappTemplatesDir()
    {
        return WEBAPP_TEMPLATES_DIR ;
    }
    public String getProxyAPIEndpoint()
    {
        return PROXY_API_ENDPOINT;
    }

    public int getWebsocketInstanceInternalPort() { return WEBSOCKETS_INTERNAL_PORT; }

    /**
     * ENV FOR DOCKER:
     *     APP_NAME=websockets_insect OR APP_NAME=api_insect OR APP_NAME=webapp_insect
     *     CONSUL_URL=consul:8500
     *     Only websockets_insect - needs IP discovery to operate - for other is optional
     *     could be used for logging or so. But the environment settings should be present for
     *     all of them.
     * @return
     */
    public String getHostIpAddress() {
        if(DEV_ENVIRONMENT.equals(getCurrentEnvironment()) || null == ENV.get("CONSUL_URL") || null == ENV.get("APP_NAME")) {
            return "localhost";
        }
        if(HOST_IP_ADDRESS_CACHE.containsKey(getEnvHostname())) {
            return HOST_IP_ADDRESS_CACHE.get(getEnvHostname());
        } else {
            List<String> ip4s = discoverAllHostIP4s();
            //curl -s  http://consul:8500/v1/catalog/service/websockets_testpreview
            String url = "http://" + ENV.get("CONSUL_URL") + "/v1/catalog/service/" + ENV.get("APP_NAME");
            String responseFromConsul = "";
            try {
                responseFromConsul = HttpRequest.get(url);
            } catch (Exception e) {
                e.printStackTrace();
            }
            List<String> hostAddress = JSONConsulHelper.fetchConsulServiceIPs(responseFromConsul);

            if (!ip4s.isEmpty() && !hostAddress.isEmpty()) {
                for (String hostAllAddress : ip4s) {
                    for (String configAddress : hostAddress) {
                        if (hostAllAddress.equals(configAddress)) {
                            HOST_IP_ADDRESS_CACHE.put(getEnvHostname(), hostAllAddress);
                            return hostAllAddress;
                        }
                    }
                }
            }
        }
        return "HOST_IP_ADDRESS";
    }
}
