package org.scg.webapp.model;

import org.scg.db.DB;
import org.scg.webapp.dto.ajax.AjaxResponse;
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
        if(db.isSessionOwner(sessionId ,psid)) {
            String body = request.body();
            ar.setBody("{\"status\":\"OK\"}");
            db.updateMockConfig(psid, body);
        }
        return ar;
    }

}
