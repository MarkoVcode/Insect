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
import spark.ModelAndView;
import spark.template.mustache.MustacheTemplateEngine;

import static spark.Spark.get;

/**
 * Created by developer on 1/22/17.
 */

/**
 * RESPONSIBILITY Setup route for 404 case
 */
public class Page404 {
    private static final Properties PROP = Properties.getInstance();
    private static final org.slf4j.Logger LOG = org.slf4j.LoggerFactory.getLogger(Page404.class);

    public Page404() {
        setupRoutes();
    }

    protected void setupRoutes() {
        get("*", (rq, rs) -> {
            if(rq.pathInfo().matches("../../assets.*|/assets.*|/robots.txt|/.well-known/pki-validation/gsdv.txt|favicon.ico")) {
                return null;
            }
            rs.status(404);
            LOG.error("Page not found: " + rq.pathInfo());
            MustacheTemplateEngine m = new MustacheTemplateEngine();
            ModelAndView mv = new ModelAndView(null, PROP.getWebappTemplatesDir()+"errors/error404.mustache");
            return m.render(mv);
        });
    }
}
