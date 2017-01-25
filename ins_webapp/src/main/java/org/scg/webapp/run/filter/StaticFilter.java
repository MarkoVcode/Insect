package org.scg.webapp.run.filter;

import javax.servlet.*;
import java.io.IOException;

/**
 * Created by developer on 1/24/17.
 */
public class StaticFilter implements Filter {

    private RequestDispatcher defaultRequestDispatcher;

    @Override
    public void destroy() {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
        defaultRequestDispatcher.forward(request, response);
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        this.defaultRequestDispatcher =
            filterConfig.getServletContext().getNamedDispatcher("default");
    }
}
