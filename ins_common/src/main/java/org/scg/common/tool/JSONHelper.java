package org.scg.common.tool;

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
 *                                      ThingOnCloud.com SDK
 *
 * Project home: https://github.com/MarkoVcode/ThingOnCloudSDK
 *
 * @build <BUILDTAG>
 * @date <BUILDDATE>
 * @version <RELEASEVERSION>
 */

import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;

import java.io.IOException;
import java.io.Serializable;
import java.io.StringWriter;

public class JSONHelper {

    private static final Logger LOG = org.slf4j.LoggerFactory.getLogger(JSONHelper.class);

    private static volatile JSONHelper INSTANCE;
    private ObjectMapper mapper;

    private JSONHelper() {
        mapper = new ObjectMapper();
        mapper.setSerializationInclusion(Include.NON_NULL);
    }

    public static JSONHelper getInstance() {
        if(null == INSTANCE) {
            synchronized (JSONHelper.class) {
                if (null == INSTANCE) {
                    INSTANCE = new JSONHelper();
                }
            }
        }
        return INSTANCE;
    }

    public String serialize(Serializable bean) {
        StringWriter writer = new StringWriter();
        try {
            mapper.writeValue(writer, bean);
        } catch (JsonGenerationException e) {
            LOG.error("Exception when generating JSON", e);
        } catch (JsonMappingException e) {
            LOG.error("Exception when generating JSON", e);
        } catch (IOException e) {
            LOG.error("Exception when generating JSON", e);
        }
        return writer.toString();
    }

    public Serializable deSerialize(String json, Class<? extends Serializable> clazz) {
        ObjectMapper mapper = new ObjectMapper();
        Serializable returnObject = null;
        if(null != json) {
            try {
                returnObject = mapper.readValue(json, clazz);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return returnObject;
    }
}
