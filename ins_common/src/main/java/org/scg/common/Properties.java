package org.scg.common;

import java.util.Map;

/**
 * Created by developer on 1/23/17.
 */
public class Properties {

    public static final String BUILDTAG = "<BUILDTAG>";
    public static final String BUILDDATE = "<BUILDDATE>";
    public static final String RELEASEVERSION = "<RELEASEVERSION>";
    private static final String ENVIRONMENT = "<ENVIRONMENT>";

    private static Properties INSTANCE;

    private static final Map<String, String> ENV = System.getenv();

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

    private Properties() { }

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

    public Map<String, String> getSystemEnvironment() {
        return ENV;
    }

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
        return "http://"+WEBSOCKETS_HOST+":"+WEBSOCKETS_INTERNAL_PORT;
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
}
