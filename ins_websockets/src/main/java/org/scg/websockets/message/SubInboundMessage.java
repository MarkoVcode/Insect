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

import java.io.Serializable;

/**
 * Created by developer on 15/03/16.
 */

/**
 * RESPONSIBILITY DTO for subscribe request
 */
public class SubInboundMessage implements Serializable {
    // Proxy session ID
    private String psId;
    // Web session ID
    private String wsId;

    public String getPsId() {
        return psId;
    }

    public void setPsId(String psId) {
        this.psId = psId;
    }

    public String getWsId() {
        return wsId;
    }

    public void setWsId(String wsId) {
        this.wsId = wsId;
    }
}
