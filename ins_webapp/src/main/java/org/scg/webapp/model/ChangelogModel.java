package org.scg.webapp.model;

import org.scg.common.Properties;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by developer on 2/17/17.
 */
public class ChangelogModel {

    private static final Properties PROP = Properties.getInstance();
    private Map<String, Object> model = new HashMap<String, Object>();

    public ChangelogModel() {
        generateModel();
    }

    private void generateModel() {
        model.put("version", PROP.getVersionForWeb());
        model.put("build_info", PROP.getWebSignature());
    }

    public Map<String, Object> getModel() {
        return model;
    }
}
