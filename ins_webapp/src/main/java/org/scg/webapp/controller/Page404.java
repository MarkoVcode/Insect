package org.scg.webapp.controller;

import spark.ModelAndView;
import spark.template.mustache.MustacheTemplateEngine;

import static spark.Spark.get;

/**
 * Created by developer on 1/22/17.
 */
public class Page404 {

    private static final org.slf4j.Logger LOG = org.slf4j.LoggerFactory.getLogger(Page404.class);

    public Page404() {
        setupRoutes();
    }

    protected void setupRoutes() {
        get("*", (rq, rs) -> {
            if(rq.pathInfo().matches("../../assets.*|/assets.*|favicon.ico")) {
                return null;
            }
            rs.status(404);
            LOG.error("Page not found: " + rq.pathInfo());
            MustacheTemplateEngine m = new MustacheTemplateEngine();
            ModelAndView mv = new ModelAndView(null, "ins_webapp/src/main/resources/templates/errors/error404.mustache");
            return m.render(mv);
        });
    }
}
