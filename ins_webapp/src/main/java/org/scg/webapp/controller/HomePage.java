package org.scg.webapp.controller;

import org.scg.db.DB;
import org.scg.webapp.model.AjaxResponse;
import org.scg.webapp.model.PeekModel;
import spark.ModelAndView;
import spark.template.mustache.MustacheTemplateEngine;

import static spark.Spark.*;

/**
 * Created by developer on 1/22/17.
 */
public class HomePage {

    public HomePage() {
        setupRoutes();
    }

    protected void setupRoutes() {
        get("/", (rq, rs) -> new ModelAndView(null, "ins_webapp/src/main/resources/templates/home/home.mustache"), new MustacheTemplateEngine());
        before("/peek/:psid", (rq, rs) -> {
            DB db = DB.getInstance();
            if(!db.isValidProxySession(rq.params(":psid"))) {
                rs.redirect("/peek");
                halt();
            }
        });
//        get("/peek/:psid", (rq, rs) -> new ModelAndView(null, "ins_webapp/src/main/resources/templates/peek/peek.mustache"), new MustacheTemplateEngine());
        get("/peek/:psid", (rq, rs) -> {
            PeekModel pm = new PeekModel(rq);
            MustacheTemplateEngine m = new MustacheTemplateEngine();
            pm.generateModel();
            ModelAndView mv = new ModelAndView(pm.getModel(), "ins_webapp/src/main/resources/templates/peek/peek.mustache");
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
            DB db = DB.getInstance();
            String key = db.createProxySession();
            db.setSessionOwnership(rq.session().id(), key);
            rs.redirect("/peek/"+key);
            halt();
        });
    }
}
