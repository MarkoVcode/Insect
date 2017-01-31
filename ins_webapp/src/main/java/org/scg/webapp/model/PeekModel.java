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
package org.scg.webapp.model;

import org.apache.commons.beanutils.BeanUtils;
import org.eclipse.jetty.util.MultiMap;
import org.eclipse.jetty.util.UrlEncoded;
import org.scg.common.Properties;
import org.scg.db.DB;
import org.scg.webapp.dto.ajax.AjaxResponse;
import org.scg.webapp.dto.form.ProxySettings;
import spark.Request;

import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by developer on 1/22/17.
 */

/**
 * RESPONSIBILITY Participating in content generation for Peek page
 */
public class PeekModel {
    private static final Properties PROP = Properties.getInstance();
    private Map<String, Object> model = new HashMap<String, Object>();
    private String psid;
    private String sessionId;
    private Request request;

    private DB db = DB.getInstance();

    public PeekModel(Request rq) {
        this.psid = rq.params(":psid");
        this.sessionId = rq.session().id();
        request = rq;
    }

    public void generateModel() {
        model.put("psid", psid);
        model.put("new_api_endpoint", PROP.getProxyAPIEndpoint() + psid);
        model.put("proxy_api_endpoint", getProxyApiEndpoint());
        model.put("is_active", db.isProxyActive(psid));
        model.put("config_websockets_url", PROP.getWebWebsocketsUrl());
        model.put("config_session_timeout", PROP.getRedisDefaultSessionExpiration());
        model.put("has_ownership", db.isSessionOwner(sessionId ,psid));
        model.put("version", PROP.getVersionForWeb());
        model.put("build_info", PROP.getWebSignature());
    }

    public AjaxResponse processAjaxRequest() {
        AjaxResponse ar = new AjaxResponse();
        ProxySettings proxySettingsBean = (ProxySettings) populateRequestBean(ProxySettings.class);
        //TODO better validation for proxy URL here
        if("activate".equalsIgnoreCase(proxySettingsBean.getActivity()) && proxySettingsBean.getProxyurl().length() > 10) {
            db.setProxyApiEndpoint(psid, proxySettingsBean.getProxyurl());
            ar.setBody("{\"active\": true}");
        } else {
            db.setProxyApiEndpoint(psid, "");
            ar.setBody("{\"active\": false}");
        }
        return ar;
    }

    private String getProxyApiEndpoint() {
        return db.getProxyApiEndpoint(psid);
    }

    public Map<String, Object> getModel() {
        return model;
    }

    public Object populateRequestBean(Class<?> clazz) {
        MultiMap<String> params = new MultiMap<String>();
        UrlEncoded.decodeTo(request.body(), params, "UTF-8");
        Object o = null;
        try {
            o = clazz.newInstance();
        } catch (InstantiationException | IllegalAccessException e1) {
            e1.printStackTrace();
        }
        //Console.out(params.toString());
        try {
            BeanUtils.populate(o, params);
        } catch (IllegalAccessException | InvocationTargetException e) {
            e.printStackTrace();
        }
        return o;
    }
}
