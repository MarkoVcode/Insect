$(document).ready(function(){

var fiveMinutes = 60 * 5,
        display = $('#session-timeout');
    startTimer(fiveMinutes, display);

    var exampleSocket = new WebSocket(configObj.websocketsURL);
    exampleSocket.onopen = function (event) {
        var wsid = getCookie("JSESSIONID");
        var object = {psId: configObj.psid, wsId: wsid};
        exampleSocket.send(JSON.stringify(object));
    };

    exampleSocket.onmessage = function (event) {
        var resp = JSON.parse(event.data);
        if(resp.proxy) {
            console.log("proxy message");
            prependProxyResponse(resp);
        } else {
            if(resp.subscribed) {
                updateWSIndicator(true);
            }
        }
    }

    function prependProxyResponse(data) {
        $('#proxy-updates').prepend(contentProxyResponse(data));
        $('.remove-line').click(function (e) {
            var tableId = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.id;
            $('#' + tableId).remove();
            console.log('delete');
        });
    }

    function contentProxyResponse(data) {
        var tid = Math.random().toString(36).substring(7);
        var reqHPart = "<span class=\"label label-default\">Header</span>&nbsp;" + atob(data.proxy.request.header);
        var reqMPart = "<span class=\"label label-primary\">Method</span>&nbsp;" + data.proxy.request.method;
        var reqHoPart = "<span class=\"label label-primary\">Host</span>&nbsp;" + data.proxy.request.host;
        var reqPPart = "<span class=\"label label-primary\">Path</span>&nbsp;" + data.proxy.request.path;
        var reqPrPart = "<span class=\"label label-primary\">Protocol</span>&nbsp;" + data.proxy.request.protocol;
        var reqBPart = "<span class=\"label label-purple\">Body</span>&nbsp;" + atob(data.proxy.request.body);
        var requestHeader = reqHPart +"<br>"+ reqMPart +"<br>"+ reqHoPart +"<br>"+ reqPPart +"<br>"+ reqPrPart +"<br>"+ reqBPart;
        var resHPart = "<span class=\"label label-default\">Header</span>&nbsp;" + atob(data.proxy.response.header);
        var color;
        if(data.proxy.response.code >= 200 && data.proxy.response.code < 300) {
            color = "success";
        } else if (data.proxy.response.code >= 300 && data.proxy.response.code < 400) {
            color = "info";
        } else if (data.proxy.response.code >= 400 && data.proxy.response.code < 500) {
            color = "warning";
        } else {
            color = "danger";
        }
        var resCPart = "<span class=\"label label-"+color+"\">Code</span>&nbsp;" + data.proxy.response.code;
        var resMPart = "<span class=\"label label-"+color+"\">Message</span>&nbsp;" + data.proxy.response.message;

        var resBPart = "<span class=\"label label-purple\">Body</span>&nbsp;" + atob(data.proxy.response.body);
        var responseHeader = resHPart +"<br>"+ resCPart +"<br>"+ resMPart +"<br>"+ resBPart;
        return "<table id=\""+tid+"\" class=\"table table-bordered table-striped table-info\"><tbody><tr><td></td><td></td><td><button type=\"button\" class=\"btn btn-xs btn-outline btn-danger remove-line\"><i class=\"fa fa-close\"></i></button></td></tr><tr><tr><td>Request:</td><td>"+requestHeader+"</td><td></td></tr><tr><td>Response:</td><td>"+responseHeader+"</td><td></td></tr></tbody></table>";
    }

    exampleSocket.onclose = function (event) {
        updateWSIndicator(false);
    }

    function updateWSIndicator(state) {
        if(state) {
            $('#indicator-ws').removeClass("btn-danger");
            $('#indicator-ws').addClass("btn-success");
            $('#indicator-ws').html("Online");
        } else {
            $('#indicator-ws').removeClass("btn-success");
            $('#indicator-ws').addClass("btn-danger");
            $('#indicator-ws').html("Offline");
        }
    }

    function updateProxyIndicator(state) {
        if(state) {
            $('#indicator-proxy').removeClass("btn-danger");
            $('#indicator-proxy').addClass("btn-success");
            $('#indicator-proxy').html("Proxy Active");
        } else {
            $('#indicator-proxy').removeClass("btn-success");
            $('#indicator-proxy').addClass("btn-danger");
            $('#indicator-proxy').html("Proxy Inactive");
        }
    }

    if($('#api-endpoint').val().length == 0) {
        if(localStorage.getItem('endpoint-'+configObj.psid) != null) {
            $('#api-endpoint').val(localStorage.getItem('endpoint-'+configObj.psid));
        } else {
            $('#api-endpoint').val(localStorage.getItem('endpoint-latest'));
        }
    }
    if(localStorage.getItem('endpoint-latest') == null) {
        localStorage.setItem('endpoint-latest', $('#api-endpoint').val());
    }

    $('#proxy-reset').click(function (e) {
        window.open("/peek","_self");
    });
    $('#proxy-start').click(function (e) {
        changeProxyState("activate");
    });
    $('#proxy-stop').click(function (e) {
        changeProxyState("deactivate");
    });

    function changeProxyState(state) {
        var endpoint = $('#api-endpoint').val();
        var postData = {
                proxyurl: endpoint,
                activity: state
                };
        $.ajax({
            url: window.location.href,
            method: 'POST',
            dataType: 'json',
            data: postData
        }).done(function (data) {
            if(data.active) {
                updateActivePresentation();
                localStorage.setItem('endpoint-'+configObj.psid, endpoint);
                localStorage.setItem('endpoint-latest', endpoint);
                updateProxyIndicator(true);
            } else {
                updateInactivePresentation();
                updateProxyIndicator(false);
            }
        }).fail(function (xhr, ajaxOptions, thrownError) {
            showRequestError();
        });
    }

    function updateActivePresentation() {
        $('#proxy-start').prop('disabled', true);
        $('#proxy-stop').prop('disabled', false);
        $('#api-endpoint').prop('disabled', true);
    }

    function updateInactivePresentation() {
        $('#proxy-start').prop('disabled', false);
        $('#proxy-stop').prop('disabled', true);
        $('#api-endpoint').prop('disabled', false);
    }

    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    function showRequestError() {

    }

    function startTimer(duration, display) {
    var start = Date.now(),
        diff,
        minutes,
        seconds;
    function timer() {
        // get the number of seconds that have elapsed since
        // startTimer() was called
        diff = duration - (((Date.now() - start) / 1000) | 0);

        // does the same job as parseInt truncates the float
        minutes = (diff / 60) | 0;
        seconds = (diff % 60) | 0;

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.html(minutes + ":" + seconds);

        if (diff <= 0) {
            // add one second so that the count down starts at the full duration
            // example 05:00 not 04:59
            start = Date.now() + 1000;
        }
    };
    // we don't want to wait a full second before the timer starts
    timer();
    setInterval(timer, 1000);
}
});
