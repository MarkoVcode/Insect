$(document).ready(function(){

    $( document ).delegate( '#mock-deploy-1', 'click', function(e) {
        //set listener on class and here fetch nearest form
        var form = $('#mock-form-1');
        var formser = form.serialize();
        var elems = formser.split("&");
        var arrayLength = elems.length;
        var oout = {};
        for (var i = 0; i < arrayLength; i++) {
            if(elems[i].startsWith("path")) {
                getPathParams(elems[i], oout);
            } else {
                getConfigParams(elems[i], oout);
            }
        }

        localStorage.setItem('mock1', JSON.stringify(convertToSettingsObject(oout)));
        localStorage.setItem('mockt', JSON.stringify(oout));
        console.log("  dd");
        $.ajax({
            url: form.attr('action'),
            method: 'POST',
            data: form.serialize(),
            success: function (response) {
                var pContent = $(response).find("#ajax-form-container");
                $("#ajax-form-container").html(pContent);
            }
        });
    });

    $('.mock-add-resource-button').click(function(e){
        var group = $( this ).data("mock-group");
        var template = Handlebars.compile(getTemplate("#mock-resource-template"));
        var data = {group: group,
                    tid: Math.random().toString(36).substring(18)};
        $("#mock-methods-container-"+group).append(template(data));
        $('.mock-add-method-button').click(function(e){
            var group = $( this ).data("mock-group");
            var template = Handlebars.compile(getTemplate("#mock-method-template"));
            var data = {group: group,
                        tid: Math.random().toString(36).substring(18)};
            $("#mock-methods-"+group).append(template(data));
            $('.mock-delete-method-button').click(function(e){
                var group = $( this ).data("mock-group");
                $("#mock-method-container-"+group).remove();
            });
        });
        $('.mock-delete-resource-button').click(function(e){
            var group = $( this ).data("mock-group");
            $("#mock-resource-container-"+group).remove();
        });
    });

    function getTemplate(template) {
        var source  = $(template).html();
        var sourcep = source.replace(new RegExp("<%", 'g'), "{{");
        return sourcep.replace(new RegExp("%>", 'g'), "}}");
    }

    function getMockBankName(no) {
        return "mock"+no;
    }

    function getPathParams(pathParamString, output) {
        var pathParam = pathParamString.split("=");
        var paramName = pathParam[0].split("-");
        if( typeof output[getMockBankName(paramName[1])] === 'undefined' ) {
            output[getMockBankName(paramName[1])] = {};
        }
        return output[getMockBankName(paramName[1])][paramName[2]] = {path: pathParam[1]};
    }

    function getConfigParams(pathParamString, output) {
        var pathParam = pathParamString.split("=");
        var paramName = pathParam[0].split("-");
        if( typeof output[getMockBankName(paramName[1])] === 'undefined' ) {
            output[getMockBankName(paramName[1])] = {};
        }
        if( typeof output[getMockBankName(paramName[1])][paramName[2]] === 'undefined' ) {
            output[getMockBankName(paramName[1])][paramName[2]] = {};
        }
        if( typeof output[getMockBankName(paramName[1])][paramName[2]][paramName[3]] === 'undefined' ) {
            output[getMockBankName(paramName[1])][paramName[2]][paramName[3]] = {};
        }
        return output[getMockBankName(paramName[1])][paramName[2]][paramName[3]][paramName[0]] = pathParam[1];
    }

    function convertToSettingsObject(fromFormObject) {
        var obj = {};
        var mock;
        for(var key in fromFormObject) {
            if(fromFormObject.hasOwnProperty(key)) {
                mock = key;
                for(var resource in fromFormObject[key]) {
                    if(fromFormObject[key].hasOwnProperty(resource)) {
                        obj[mock] = {path: fromFormObject[key][resource]['path'], methods: {}};
                        for(var method in fromFormObject[key][resource]) {
                            if(fromFormObject[key][resource].hasOwnProperty(method)) {
                                obj[mock]['methods'] = {}
                            }
                        }
                    }
                }
            }
        }
        return obj;
    }
                         //   console.log(fromFormObject[key][resource]);
});
