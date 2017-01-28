package org.scg.webapp.run;

import org.scg.common.Properties;
import org.scg.webapp.controller.HomePage;
import org.scg.webapp.controller.Page404;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import spark.ModelAndView;
import spark.servlet.SparkApplication;
import spark.template.mustache.MustacheTemplateEngine;

import static spark.Spark.*;

/**
 * Created by developer on 1/18/17.
 */
public class WebappDriver implements SparkApplication {

    private static final Properties PROP = Properties.getInstance();
    private static final Logger LOG = LoggerFactory.getLogger(WebappDriver.class);

    {
        LOG.info("Starting Application: ins_webapp");
    }

    @Override
    public void init() {

        LOG.trace("TRACE");
        LOG.debug("DEBUG");
        LOG.info("INFO");
        LOG.warn("WARN");
        LOG.error("ERROR");

        new HomePage();
        new Page404();

        exception(Exception.class, (e, request, response) -> {
            response.status(500);
            LOG.error("500 server error page shown: " + e);
            e.printStackTrace();
            MustacheTemplateEngine m = new MustacheTemplateEngine();
            ModelAndView mv = new ModelAndView(null, PROP.getWebappTemplatesDir()+"/errors/error500.mustache");
            response.body(m.render(mv));
        });
    }

    public static void main(String[] args) {
        WebappDriver wa = new WebappDriver();
        port(PROP.getPublicWebapplicationPort());
        String projectDir = System.getProperty("user.dir");
        String staticDir = PROP.getWebappStaticDir();
        String externalFolder = projectDir + staticDir;
        externalStaticFileLocation(externalFolder);
        wa.init();
    }
}
