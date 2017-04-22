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
import org.scg.webapp.model.ChangelogModel;
import org.scg.webapp.model.DocModel;
import org.scg.webapp.model.MockModel;
import org.scg.webapp.model.SelftestModel;
import spark.ModelAndView;
import spark.template.mustache.MustacheTemplateEngine;

import static spark.Spark.get;
import static spark.Spark.post;

/**
 * Created by developer on 1/22/17.
 * RESPONSIBILITY Setting up the routes for the site
 */
public class HomePage {
    private static final Properties PROP = Properties.getInstance();
    public HomePage() {
        setupRoutes();
    }
    private DB db;

    {
        db = DB.getInstance();
    }

    private void setupRoutes() {
        get("/", (rq, rs) -> new ModelAndView(null, PROP.getWebappTemplatesDir()+"home/home.mustache"), new MustacheTemplateEngine());
        get("/changelog", (rq, rs) -> new ModelAndView((new ChangelogModel()).getModel(), PROP.getWebappTemplatesDir()+"changelog/changelog.mustache"), new MustacheTemplateEngine());
        get("/doc", (rq, rs) -> new ModelAndView((new DocModel()).getModel(), PROP.getWebappTemplatesDir()+"doce/doc.mustache"), new MustacheTemplateEngine());

        //Proxy self test GET request
        post("/selftest/:psid", (rq, rs) -> {
            rs.type("application/json");
            SelftestModel pm = new SelftestModel(rq);
            AjaxResponse response = pm.processAjaxRequest();
            rs.status(response.getCode());
            return response.getBody();
        });

        //Deploy mock
        post("/service/mock/:psid", (rq, rs) -> {
            rs.type("application/json");
            MockModel pm = new MockModel(rq);
            AjaxResponse response = pm.processAjaxRequest();
            rs.status(response.getCode());
            return response.getBody();
        });
    }

}
