package org.scg.webapp.model;

import org.scg.common.Properties;
import org.scg.common.tool.HttpRequest;
import org.scg.webapp.dto.ajax.AjaxResponse;
import spark.Request;

/**
 * Created by developer on 3/14/17.
 */
public class SelftestModel {

    private static final Properties PROP = Properties.getInstance();
    private String psid;
    private Request request;

    public SelftestModel(Request rq) {
        this.psid = rq.params(":psid");
        request = rq;
    }

    public AjaxResponse processAjaxRequest() {
        AjaxResponse ar = new AjaxResponse();
        try {
            HttpRequest.get(PROP.getProxyAPIEndpoint()+psid);
        } catch (Exception e) {
            e.printStackTrace();
        }
        ar.setBody("{\"request\": true}");
        return ar;
    }
}
