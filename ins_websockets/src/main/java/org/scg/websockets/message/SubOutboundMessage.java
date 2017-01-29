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
package org.scg.websockets.message;

/**
 * Created by developer on 1/24/17.
 */

/**
 * RESPONSIBILITY DTO for subscribe request response
 */
public class SubOutboundMessage extends SubInboundMessage {

    private boolean subscribed;
    private String submessage;
    private String build;
    private String builddate;
    private String version;

    public boolean isSubscribed() {
        return subscribed;
    }

    public void setSubscribed(boolean subscribed) {
        this.subscribed = subscribed;
    }

    public String getSubmesage() {
        return submessage;
    }

    public void setSubmesage(String submesage) {
        this.submessage = submesage;
    }

    public String getBuild() {
        return build;
    }

    public void setBuild(String build) {
        this.build = build;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getBuilddate() {
        return builddate;
    }

    public void setBuilddate(String builddate) {
        this.builddate = builddate;
    }
}
