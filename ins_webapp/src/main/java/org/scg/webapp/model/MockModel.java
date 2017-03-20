package org.scg.webapp.model;

import org.scg.db.DB;
import org.scg.webapp.dto.ajax.AjaxResponse;
import org.scg.webapp.dto.form.MockSettings;
import spark.Request;

/**
 * Created by developer on 3/17/17.
 */
public class MockModel extends AbstractModel {
    private String psid;
    private String sessionId;

    private DB db = DB.getInstance();

    public MockModel(Request rq) {
        this.psid = rq.params(":psid");
        this.sessionId = rq.session().id();
        request = rq;
    }

    public AjaxResponse processAjaxRequest() {
        AjaxResponse ar = new AjaxResponse();
        MockSettings proxyMockBean = (MockSettings) populateRequestBean(MockSettings.class);

      /*  if("activate".equalsIgnoreCase(proxyMockBean.getActivity()) && proxyMockBean.getProxyurl().length() > 10) {
            db.updateProxyApiEndpoint(psid, proxyMockBean.getProxyurl());
            ar.setBody("{\"active\": true}");
        } else {
            db.updateProxyApiEndpoint(psid, "");
            ar.setBody("{\"active\": false}");
        }*/
        return ar;
    }

}
