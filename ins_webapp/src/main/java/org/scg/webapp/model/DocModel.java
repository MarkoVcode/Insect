package org.scg.webapp.model;

import org.scg.common.Properties;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by developer on 2/23/17.
 */
public class DocModel {
    private static final Properties PROP = Properties.getInstance();
    private Map<String, Object> model = new HashMap<String, Object>();

    public DocModel() {
        generateModel();
    }

    private void generateModel() {
        //model.put("version", PROP.getVersionForWeb());
        //model.put("build_info", PROP.getWebSignature());
    }

    public Map<String, Object> getModel() {
        return model;
    }
}
