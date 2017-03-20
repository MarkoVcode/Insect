package org.scg.webapp.controller;

import org.scg.common.Properties;
import org.scg.db.DB;
import org.scg.webapp.dto.ajax.AjaxResponse;
import org.scg.webapp.model.PeekModel;
import spark.ModelAndView;
import spark.Request;
import spark.template.mustache.MustacheTemplateEngine;

import static spark.Spark.*;

/**
 * Created by developer on 3/17/17.
 */
public class PeekPage {
    private static final Properties PROP = Properties.getInstance();
    //private static final org.slf4j.Logger LOG = org.slf4j.LoggerFactory.getLogger(PeekPage.class);
    private DB db;
    {
        db = DB.getInstance();
    }

    public PeekPage() {
        setupRoutes();
    }

    protected void setupRoutes() {
        before("/peek/:psid", (rq, rs) -> {
            if(!db.isValidProxySession(rq.params(":psid"))) {
                rs.redirect("/peek");
                halt();
            }
        });

        get("/peek/:psid", (rq, rs) -> {
            PeekModel pm = new PeekModel(rq);
            MustacheTemplateEngine m = new MustacheTemplateEngine();
            pm.generateModel();
            ModelAndView mv = new ModelAndView(pm.getModel(), PROP.getWebappTemplatesDir()+"peek/peek.mustache");
            return m.render(mv);
        });

        post("/peek/:psid", (rq, rs) -> {
            rs.type("application/json");
            PeekModel pm = new PeekModel(rq);
            AjaxResponse response = pm.processAjaxRequest();
            rs.status(response.getCode());
            return response.getBody();
        });

        before("/peek", (rq, rs) -> {
            String key = generateActiveKey(rq);
            rs.redirect("/peek/"+key);
            halt();
        });

        before("/peek/", (rq, rs) -> {
            String key = generateActiveKey(rq);
            rs.redirect("/peek/"+key);
            halt();
        });
    }

    private String generateActiveKey(Request rq) {
        return db.createInsectSession(rq.session().id());
    }
}
