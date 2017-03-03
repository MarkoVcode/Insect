$(document).ready(function(){

    var websocket;
    setSessionTimer();
    establishWSConnection();
    new Clipboard('#proxy-endpoint-clipboard');

    function setSessionTimer() {
        var currentTimestamp = (((new Date().getTime()) / 1000) | 0);
        if(localStorage.getItem('created-'+configObj.psid) == null) {
            localStorage.setItem('created-'+configObj.psid, currentTimestamp);
        }
        var storageTime = parseInt(localStorage.getItem('created-'+configObj.psid));
        var configTime = configObj.sessionTimeout;
        var timeout = storageTime + configTime - currentTimestamp;
        if(timeout < 0) {
            window.open("/peek","_self");
        } else {
            var display = $('#session-timeout');
            startTimer(timeout, display);
        }
    }

    function establishWSConnection() {
        websocket = new WebSocket(configObj.websocketsURL);

        websocket.onopen = function (event) {
            var wsid = getCookie("JSESSIONID");
            var object = {psId: configObj.psid, wsId: wsid};
            websocket.send(JSON.stringify(object));
        };

        websocket.onmessage = function (event) {
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

        websocket.onclose = function (event) {
            updateWSIndicator(false);
            console.log("Reconnecting to WS");
            establishWSConnection();
        }
    }

    function prependProxyResponse(data) {
        $('#proxy-updates').prepend(contentProxyResponse(data));
        $('.remove-line').click(function (e) {
            var tableId = $(this).data("section-id");
            $('#' + tableId).remove();
            if($('#proxy-updates').children().length == 0) {
                $('#result-buttons').hide();
            }
        });
        $('#result-buttons').show();
    }

    function contentProxyResponse(data) {
        var tid = Math.random().toString(36).substring(7);
        var color1;
        if(data.proxy.request.method === 'GET') {
            color1 = "success";
        } else if (data.proxy.request.method === 'POST') {
            color1 = "info";
        } else if (data.proxy.request.method === 'PUT') {
            color1 = "warning";
        } else if (data.proxy.request.method === 'PATCH') {
            color1 = "warning";
        } else if (data.proxy.request.method === 'DELETE') {
            color1 = "danger";
        } else {
            color1 = "purple";
        }
        var colorProto;
        if(data.proxy.request.protocol == 'http:') {
            colorProto = "danger";
        } else if (data.proxy.request.protocol == 'https:') {
            colorProto = "warning";
        } else {
            colorProto = "danger";
        }
        var frameInfoDate = "&nbsp;<span class=\"label label-primary\">Dispatch Timestamp</span>&nbsp;" + data.proxy.general.dateDispatch;
        var frameInfoResponseTime = "&nbsp;<span class=\"label label-primary\">Response Time [us]</span>&nbsp;" + data.proxy.general.responseTime;
        var frameInfo = frameInfoDate + frameInfoResponseTime;
        var reqHPart = "<span class=\"label label-default\">Header</span>&nbsp;" + atob(data.proxy.request.header);
        var reqMPart = "<span class=\"label label-"+color1+"\">Method</span>&nbsp;" + data.proxy.request.method;
        var reqHoPart = "<span class=\"label label-primary\">Host</span>&nbsp;" + data.proxy.request.host;
        var reqPPart = "<span class=\"label label-primary\">Path</span>&nbsp;" + data.proxy.request.path;
        var reqPrPart = "<span class=\"label label-"+colorProto+"\">Protocol</span>&nbsp;" + data.proxy.request.protocol;
        var reqBPart = "<span class=\"label label-purple\">Body</span><code class=\"language-json\">" + atob(data.proxy.request.body) + "</code>";
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

        var resBPart = "<span class=\"label label-purple\">Body</span><code class=\"language-json\">" + atob(data.proxy.response.body) + "</code>";
        var responseHeader = resHPart +"<br>"+ resCPart +"<br>"+ resMPart +"<br>"+ resBPart;
        return "<table id=\""+tid+"\" class=\"table table-bordered table-striped table-info\"><tbody><tr><td></td><td>" + frameInfo + "</td><td><button type=\"button\" class=\"btn btn-xs btn-outline btn-danger remove-line\" data-section-id=\""+tid+"\"><i class=\"fa fa-close\"></i></button></td></tr><tr><tr><td>Request:</td><td>"+requestHeader+"</td><td></td></tr><tr><td>Response:</td><td>"+responseHeader+"</td><td></td></tr></tbody></table>";
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
            $('#proxy-endpoint-testget').prop('disabled', false);
            $('#proxy-upstream-selftest').prop('disabled', true);
        } else {
            $('#indicator-proxy').removeClass("btn-success");
            $('#indicator-proxy').addClass("btn-danger");
            $('#indicator-proxy').html("Proxy Inactive");
            $('#proxy-endpoint-testget').prop('disabled', true);
            $('#proxy-upstream-selftest').prop('disabled', false);
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

    $('#proxy-print-result').click(function(){
        html2canvas($('#screengrab-main-content'),
        {
            onrendered: function (canvas) {
                var a = document.createElement('a');
                a.href = canvas.toDataURL("image/png");
                a.download = 'screen-insectin-space-peek-'+Date.now()+'.png';
                a.click();
            }
        });
    });

    $('#proxy-result-clearall').click(function(){
        $('#proxy-updates').html("");
        $('#result-buttons').hide();
    });

    $('#proxy-endpoint-testget').click(function(){
        $.get( $('#endpoint-url').html(), function( data ) {});
    });

    $('#proxy-upstream-selftest').click(function(){
        $('#api-endpoint').val(configObj.selftestURL);
        changeProxyState("activate");
    });

    function changeProxyState(state) {
        var endpoint = $('#api-endpoint').val();
        var validation = validateEndpoint(endpoint);
        if(validation === 'OK') {
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
                    $('#api-endpoint-error').html("");
                } else {
                    updateInactivePresentation();
                    updateProxyIndicator(false);
                    $('#api-endpoint-error').html("");
                }
            }).fail(function (xhr, ajaxOptions, thrownError) {
                showRequestError();
                $('#api-endpoint-error').html("");
            });
        } else {
            $('#api-endpoint-error').html(validation);
        }
    }

    function validateEndpoint(endpoint) {
        if (endpoint.length === 0){
            return "Provide upstream endpoint to start proxy!";
        } else if(endpoint.indexOf("insectin.space/service/proxy") !== -1) {
            return "Selfie not allowed!";
        } else if(endpoint.indexOf("http://") === -1 && endpoint.indexOf("https://") === -1 ) {
            return "This must be a valid URL with protocol.";
        } else if (/[#~<>\?&]+$/.test(endpoint)) {
            return "Sorry this endpoint doesn't seem to be valid!";
        }
        return "OK";
        //~<>&\$\?@ - doesnt work properly !!!
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
    var timerElement = $('#session-timeout');
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

        if (minutes <= 0 && seconds <= 0) {
            window.open("/peek","_self");
        } else if (minutes < 1) {
            timerElement.removeClass("btn-warning");
            timerElement.removeClass("btn-success");
            timerElement.addClass("btn-danger");
        } else if (minutes < 10) {
            timerElement.removeClass("btn-danger");
            timerElement.removeClass("btn-success");
            timerElement.addClass("btn-warning");
        } else {
            timerElement.removeClass("btn-danger");
            timerElement.removeClass("btn-warning");
            timerElement.addClass("btn-success");
        }

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
