$(document).ready(function(){

    var editors = {};

    var httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    var httpMethodsNoBody = ['DELETE'];
    var httpCodes = ['200', '204', '400', '401', '404', '500'];
    var httpCodesNoBody = ['204'];

    var editorOptions = {
        modes: ['text', 'code', 'tree', 'form', 'view'],
        mode: 'code',
        ace: ace
    };

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
    });

    $(document).delegate('.mock-delete-resource-button', 'click', function(e) {
        var group = $( this ).data("mock-group");
        $("#mock-resource-container-"+group).remove();
    });

    $(document).delegate('.mock-add-header-button', 'click', function(e) {
        var group = $( this ).data("mock-group");
        var template = Handlebars.compile(getTemplate("#mock-headers-template"));
        var data = {group: group,
                    tid: Math.random().toString(36).substring(18)};
        $("#mock-headers-container-"+group).append(template(data));
    });

    $(document).delegate('.mock-method-select', 'change', function(e) {
        var dropdownGroup = $(this).data("mock-method-group");
        var payload = $(this).data("mock-payload");
        var item=$(this);
        if(item.val() === 'DELETE') {
            $("#"+payload).hide();
        } else {
            $("#"+payload).show();
        }
        $('.'+dropdownGroup).each(function(i, obj) {
            if(item[0].name !== obj.name) {
                for (var i=0; i<obj.length; i++){
                    if (obj.options[i].value == item.val())
                        obj.remove(i);
                }
            }
        });
    });


//$("option[value='foo']").remove();
//or better (if you have few selects in the page):
//$("#select_id option[value='foo']").remove();


    $(document).delegate('.mock-delete-header-button', 'click', function(e) {
        var group = $( this ).data("mock-group");
        $("#mock-header-"+group).remove();
    });

    $(document).delegate('.mock-add-method-button', 'click', function(e) {
        var group = $( this ).data("mock-group");
        var template = Handlebars.compile(getTemplate("#mock-method-template"));
        var data = {group: group,
                    methods_options: generateDropdownList(httpMethods),
                    codes_options: generateDropdownList(httpCodes),
                    tid: Math.random().toString(36).substring(18)};
        $("#mock-methods-"+group).append(template(data));
        var editorId = "jsoneditor-" + data.group + "-" + data.tid;
        var json = {
            'array': [1, 2, 3],
            'boolean': true,
            'null': null,
            'number': 123,
            'object': {'a': 'b', 'c': 'd'},
            'string': 'Hello World'
        };
        var container = document.getElementById(editorId);

        editors[editorId] = new JSONEditor(container, editorOptions, json);

    });

    $(document).delegate('.mock-delete-method-button', 'click', function(e) {
        var group = $( this ).data("mock-group");
        $("#mock-method-container-"+group).remove();
    });

    //this implemented by
    //do this on change keyup and paste
    //$(document).delegate('.json-payload', 'change', function(e) {
        //var jsonPayload = $(this).val();
        //catch
        //var obj = JSON.parse(jsonPayload);
        // if err mark this red
        //console.log("change json");
    //});

    function generateDropdownList(inputList) {
        var output = "";
        for(var i=0; i<inputList.length; i++) {
            output = output + "<option name=\"" + inputList[i] + "\">" + inputList[i] + "</option>";
        }
        return output;
    }

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
        //move json from editor to hidden field
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
        var sourcep = source.replace(new RegExp("<%", 'g'), "{{")
                            .replace(new RegExp("%>", 'g'), "}}")
                            .replace(new RegExp("<&", 'g'), "{{{")
                            .replace(new RegExp("&>", 'g'), "}}}");
        return sourcep;
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
                                        payload: btoa(fromFormObject[key][resource][method]['payload'])};
                   // btoa atob
                   //here payload base64
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
