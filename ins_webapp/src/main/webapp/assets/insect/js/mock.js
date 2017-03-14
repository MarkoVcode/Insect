$(document).ready(function(){

    $( document ).delegate( '.mock-save', 'click', function(e) {
        var id = $(this).data("mock-group")
        if(isMockValid(id)) {
            saveMock(id);
        }
    });

    $( document ).delegate( '.mock-deploy', 'click', function(e) {
        var id = $(this).data("mock-group")
        if(isMockValid(id)) {
            saveMock(id);
            deployMock(id);
        }
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

    function deployMock(id) {
        if(localStorage.getItem('mock'+id) !== null) {
            var mockConfig = localStorage.getItem('mock'+id);
            $.ajax({
                url: configObj.mockDeployURL,
                method: 'POST',
                data: form.serialize(),
                success: function (response) {
                    var pContent = $(response).find("#ajax-form-container");
                    $("#ajax-form-container").html(pContent);
                }
            });
        }
    }

    function isMockValid(id) {
        return true;
    }

    function saveMock(id) {
        var form = $('#mock-form-'+id);
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

        localStorage.setItem('mock'+id, JSON.stringify(convertToSettingsObject(oout)));
        localStorage.setItem('mocko'+id, JSON.stringify(oout));
    }

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
                obj[mock] = [];
                for(var resource in fromFormObject[key]) {
                    if(fromFormObject[key].hasOwnProperty(resource)) {
                        var resourcePath = {path: fromFormObject[key][resource]['path'], methods: {}};
                        for(var method in fromFormObject[key][resource]) {
                            if (method !== 'path') {
                                if(fromFormObject[key][resource].hasOwnProperty(method)) {
                                    resourcePath['methods'][fromFormObject[key][resource][method]['method']] = {
                                        code: fromFormObject[key][resource][method]['respcode'],
                                        payload: fromFormObject[key][resource][method]['payload']};
                                }
                            }
                        }
                        obj[mock].push(resourcePath);
                    }
                }
            }
        }
        return obj;
    }
                         //   console.log(fromFormObject[key][resource]);
});
