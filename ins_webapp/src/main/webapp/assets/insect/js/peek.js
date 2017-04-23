$(document).ready(function(){

    var websocket;
    var versionChangeAlertShown = false;
    setSessionTimer();
    establishWSConnection();
    new Clipboard('#proxy-endpoint-clipboard');

    var entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    toastr.options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": true,
      "progressBar": true,
      "positionClass": "toast-top-center",
      "preventDuplicates": false,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "5000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    }

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

    function escapeHtml (string) {
        return String(string).replace(/[&<>"'`=\/]/g, function (s) {
            return entityMap[s];
        });
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
                wsActivitOn();
                console.log("proxy message");
                preprocessProxyMessage(resp);
                prependProxyResponse(resp);
            } else {
                preprocessSubMessage(resp);
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

    function wsActivitOn() {
        $('#indicator-ws').removeClass("btn-success");
        $('#indicator-ws').addClass("btn-teal");
        setTimeout(wsActivitOff, 150);
    }

    function wsActivitOff() {
        $('#indicator-ws').removeClass("btn-teal");
        $('#indicator-ws').addClass("btn-success");
    }

    function preprocessSubMessage(data) {
        checkForVersionChange(data.releaseKey);
    }

    function preprocessProxyMessage(data) {
        checkForVersionChange(data.proxy.general.releaseKey);
    }

    function checkForVersionChange(releaseKey) {
        if(releaseKey !== configObj.releaseKey) {
            if(!versionChangeAlertShown) {
                toastr["warning"]("New version of the application had just been deployed.<br/>Please reload the page to use it.<br/>&nbsp;&nbsp;(#" + escapeHtml(releaseKey) + ")", "New Version Deployed!")
                //invalidate cache??
                versionChangeAlertShown = true;
            }
        }
    }

    function prependProxyResponse(data) {
        var inPage = augmentProxyResponse(data);
        $('#proxy-updates').prepend(inPage.content);
        $('#'+inPage.tid).fadeIn(100);

        $('#result-buttons').show();
        $('.tooltipx').tooltipster({
            theme: 'tooltipster-light'
        });
    }

    function augmentProxyResponse(data) {
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
        var tid = Math.random().toString(36).substring(3);

        var requestheaderpp = "";
        if(data.proxy.request.header !== "") {
            var requestheaderobj = JSON.parse(atob(data.proxy.request.header));
            requestheaderpp = JSON.stringify(requestheaderobj, " ", 2);
        }
        var requestbodypp = "";
        var requestbodysourcedisplay = "";
        if(data.proxy.request.body !== "") {
            var requestbodysource = atob(data.proxy.request.body);
            var requestbodyobj;
            try {
                requestbodyobj = JSON.parse(requestbodysource);
                requestbodypp = JSON.stringify(requestbodyobj, " ", 2);
                requestbodysourcedisplay = requestbodysource;
            } catch (err) {
                requestbodyobj = {};
                requestbodypp = 'Not JSON response!';
                if(requestbodysource.indexOf("html") !== -1 || requestbodysource.indexOf("HTML") !== -1) {
                    requestbodysourcedisplay = 'HTML Content -not displayed-';
                } else if (requestbodysource.indexOf("xml") !== -1 || requestbodysource.indexOf("XML") !== -1) {
                    requestbodysourcedisplay = 'XML Content -not displayed-';
                }
            }
        }
        var responseheaderpp = "";
        if(data.proxy.response.header !== "") {
            var responseheaderobj = JSON.parse(atob(data.proxy.response.header));
            responseheaderpp = JSON.stringify(responseheaderobj, " ", 2);
        }
        var responsebodypp = "";
        var responsebodysourcedisplay = "";
        if(data.proxy.response.body !== "") {
            var responsebodysource = atob(data.proxy.response.body);
            var responsebodyobj;
            try {
                responsebodyobj = JSON.parse(responsebodysource);
                responsebodypp = JSON.stringify(responsebodyobj, " ", 2);
                responsebodysourcedisplay = responsebodysource;
            } catch (err) {
                responsebodyobj = {};
                responsebodypp = 'Not JSON response!';
                if(responsebodysource.indexOf("html") !== -1 || responsebodysource.indexOf("HTML") !== -1) {
                    responsebodysourcedisplay = 'HTML Content -not displayed-';
                } else if (responsebodysource.indexOf("xml") !== -1 || responsebodysource.indexOf("XML") !== -1) {
                    responsebodysourcedisplay = 'XML Content -not displayed-';
                }
            }
        }

        //data.proxy.general.dateDispatch
        var date = new Date();
        data['augment'] = { codecolor: color,
                            tid: tid,
                            timestamp: date.toLocaleString(),
                            methodcolor: color1,
                            protocolor: colorProto,
                            requestheader: atob(data.proxy.request.header),
                            requestbody: requestbodysourcedisplay,
                            responseheader: atob(data.proxy.response.header),
                            responsebody: responsebodysourcedisplay,
                            requestheaderhtml: requestheaderpp,
                            requestbodyhtml: requestbodypp,
                            responseheaderhtml: responseheaderpp,
                            responsebodyhtml: responsebodypp
                           };

        var source   = $("#proxy-capture-template").html();
        var sourcep = source.replace(new RegExp("<%", 'g'), "{{");
        var sourcer = sourcep.replace(new RegExp("%>", 'g'), "}}");
        var template = Handlebars.compile(sourcer);
        var retObj = { content: template(data),
                        tid: tid};
        return retObj;
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

    $(document).delegate('.remove-line', 'click', function(e) {
        var tableId = $(this).data("section-id");
        $('#' + tableId).remove();
        $('#' + tableId + '-tooltip').remove();
        if($('#proxy-updates').children('table').length == 0) {
            $('#result-buttons').hide();
        }
    });

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
        $.post( configObj.selftestWebProxy, function( data ) {
            console.log(data);
        });
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
