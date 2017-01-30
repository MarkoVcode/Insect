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
package org.scg.webapp.controller;

import org.scg.common.Properties;
import org.scg.db.DB;
import org.scg.webapp.dto.ajax.AjaxResponse;
import org.scg.webapp.model.PeekModel;
import spark.ModelAndView;
import spark.template.mustache.MustacheTemplateEngine;

import static spark.Spark.*;

/**
 * Created by developer on 1/22/17.
 */

/**
 * RESPONSIBILITY Setting up the routes for the site
 */
public class HomePage {
    private static final Properties PROP = Properties.getInstance();
    public HomePage() {
        setupRoutes();
    }

    protected void setupRoutes() {
        get("/", (rq, rs) -> new ModelAndView(null, PROP.getWebappTemplatesDir()+"home/home.mustache"), new MustacheTemplateEngine());
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
            DB db = DB.getInstance();
            String key = db.createProxySession();
            db.setSessionOwnership(rq.session().id(), key);
            rs.redirect("/peek/"+key);
            halt();
        });
    }
}
