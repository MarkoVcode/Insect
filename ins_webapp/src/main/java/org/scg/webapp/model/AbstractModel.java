package org.scg.webapp.model;

import org.apache.commons.beanutils.BeanUtils;
import org.eclipse.jetty.util.MultiMap;
import org.eclipse.jetty.util.UrlEncoded;
import spark.Request;

import java.lang.reflect.InvocationTargetException;

/**
 * Created by developer on 3/17/17.
 */
public abstract class AbstractModel {

    protected Request request;

    protected Object populateRequestBean(Class<?> clazz) {
        MultiMap<String> params = new MultiMap<String>();
        UrlEncoded.decodeTo(request.body(), params, "UTF-8");
        Object o = null;
        try {
            o = clazz.newInstance();
        } catch (InstantiationException | IllegalAccessException e1) {
            e1.printStackTrace();
        }
        //Console.out(params.toString());
        try {
            BeanUtils.populate(o, params);
        } catch (IllegalAccessException | InvocationTargetException e) {
            e.printStackTrace();
        }
        return o;
    }
}
