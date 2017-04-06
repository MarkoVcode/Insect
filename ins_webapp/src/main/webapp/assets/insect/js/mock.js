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
        new Clipboard('#mock-endpoint-clipboard-'+data.group+'-'+data.tid);
    });

    $(document).delegate('.mock-resource-path', 'input', function(e) {
        updateDisplayPath($(this));
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
        var linkedElement = $(this).data("mock-linked");
        var dropdownGroup = $(this).data("mock-method-group");
        var payload = $(this).data("mock-payload");
        var item=$(this);
        updatePayloadView(item[0].id, linkedElement, payload);
        updateMethodGroupWhenChanged(dropdownGroup, item);
    });

    $(document).delegate('.mock-respcode-select', 'change', function(e) {
        var linkedElement = $(this).data("mock-linked");
        var payload = $(this).data("mock-payload");
        var item=$(this);
        updatePayloadView(linkedElement, item[0].id, payload);
    });

    function updateMethodGroupWhenChanged(dropdownGroup) {
        var selectedMethods=[];
        //build list of selected items
        $('.'+dropdownGroup).each(function(i, obj) {
            selectedMethods.push(obj.value);
        });
        var availableMethods = arrayDiff(httpMethods, selectedMethods);
        //update available options
        $('.'+dropdownGroup).each(function(i, obj) {
            for(var i = 0; i<obj.length; i++) {
                if(obj.value !== obj[i].value) {
                    obj[i].remove();
                }
            }
        });
        for(var i = 0; i<selectedMethods.length; i++) {
            $('.'+dropdownGroup).append('<option name="'+selectedMethods[i]+'">'+selectedMethods[i]+'</option>');
        }
    }

    function updatePayloadView(methodId, codeId, payloadId) {
        if(isPayloadVisible(methodId, codeId)) {
            $("#"+payloadId).show();
        } else {
            $("#"+payloadId).hide();
        }
    }

    function isPayloadVisible(methodId, codeId) {
        var noPayloadOptions = httpMethodsNoBody.concat(httpCodesNoBody);
        var method = $('#'+methodId).val();
        var code = $('#'+codeId).val();
        if(noPayloadOptions.indexOf(method) > -1 || noPayloadOptions.indexOf(code) > -1) {
            return false;
        }
        return true;
    }

    function updateDisplayPath(elem) {
        var group = elem.data("path-target");
        var initVal = elem.data("path-init-val");
        $('#'+group).html(initVal+escape(elem.val()));//url encode !!!
    }

    $(document).delegate('.mock-delete-header-button', 'click', function(e) {
        var group = $( this ).data("mock-group");
        $("#mock-header-"+group).remove();
    });

    function filterUsedMethods(httpMethods, group) {
        var selected = [];
        $('.dropdown-grp-'+group).each(function(i, obj) {
            selected.push(obj.selectedOptions['0'].label);
        });
        return arrayDiff(httpMethods, selected);
    }

    function arrayDiff(httpMethods, selected) {
        if(selected.length === 0) {
            return httpMethods;
        }
        var newSelection =[];
        for(var i = 0; i<httpMethods.length; i++) {
            if(selected.indexOf(httpMethods[i]) === -1) {
                newSelection.push(httpMethods[i]);
            }
        }
        return newSelection;
    }

    $(document).delegate('.mock-add-method-button', 'click', function(e) {
        var group = $( this ).data("mock-group");
        var template = Handlebars.compile(getTemplate("#mock-method-template"));
        var nonUsedMethods = filterUsedMethods(httpMethods, group);
        var data = {group: group,
                    methods_options: generateDropdownList(nonUsedMethods),
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
        if(nonUsedMethods.length === 1) {
            $('#'+group).prop('disabled', true);
        }
    });

    $(document).delegate('.mock-delete-method-button', 'click', function(e) {
        var group = $( this ).data("mock-group");
        var topGroup = separateTopGroupFromId(group);
        $("#mock-method-container-"+group).remove();
        $('#'+topGroup).prop('disabled', false);
    });

    function separateTopGroupFromId(group) {
        var parts = group.split("-", 2);
        return parts[0] + "-" + parts[1];
    }

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
