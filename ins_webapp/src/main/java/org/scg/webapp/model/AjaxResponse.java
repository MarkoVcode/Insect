package org.scg.webapp.model;

/**
 * Created by developer on 1/23/17.
 */
public class AjaxResponse {
    private Integer code = 200;
    private String body;

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }
}
