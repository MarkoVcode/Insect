$(document).ready(function(){

    var editors = {};
    var formHeaders = {};
    var loadedMockReg = {};

    var httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    var httpMethodsNoBody = ['DELETE'];
    var httpCodes = ['200', '201', '204', '304', '400', '401', '403', '404', '405', '410', '415', '422', '429', '500'];
    var httpCodesNoBody = ['204'];
    var httpDefaultHeaders = ['Content-Type', 'Location'];
    var httpMethodTemplate = {'GET':{code: 304, payload: {}, body: true,  headers: {'Content-Type': 'application/json'}},
                             'POST':{code: 201, payload: {}, body: true,  headers: {'Content-Type': 'application/json', Location:'http://192.168.56.100:9180/service/mock'}},
                              'PUT':{code: 201, payload: {}, body: true,  headers: {'Content-Type': 'application/json', Location:'http://192.168.56.100:9180/service/mock'}},
                            'PATCH':{code: 200, payload: {}, body: true,  headers: {'Content-Type': 'application/json'}},
                           'DELETE':{code: 204, payload: {}, body: false, headers: {}}};

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
        addResource(group);
    });

    function addResource(group) {
        var template = Handlebars.compile(getTemplate("#mock-resource-template"));
        var tid = Math.random().toString(36).substring(18);
        var data = {group: group,
                    tid: tid};
        $("#mock-methods-container-"+group).append(template(data));
        new Clipboard('#mock-endpoint-clipboard-'+data.group+'-'+data.tid);
        addMethod(group+"-"+tid, null);
    }

    $(document).delegate('.mock-resource-path', 'input', function(e) {
        updateDisplayPath($(this));
    });

    $(document).delegate('.create-new-mock-button', 'click', function(e) {
        var gform = $( this ).data("mock-form");
        var group = $( this ).data("mock-group");
        $( this ).hide();
        $("#"+gform).show();
        addResource(group);
    });


    $(document).delegate('.mockview', 'click', function(e) {
        var mockId = $( this ).data("load-mock");
        if (!loadedMockReg.hasOwnProperty(mockId)) {
            console.log("loaded - mock" + mockId);
            loadMock(mockId);
            loadedMockReg[mockId] = true;
        }
    });

    $(document).delegate('.mock-delete-resource-button', 'click', function(e) {
        var group = $( this ).data("mock-group");
        removeEditors(group);
        $("#mock-resource-container-"+group).remove();
        chainDeleteForLastResourceItem(group);
    });

    function chainDeleteForLastResourceItem(group) {
        var parts = group.split("-", 2);
        if ($('#mock-methods-container-'+parts[0]).children().length < 1) {
            hideEmptyMock(parts[0]);
        }
    }

    $(document).delegate('.mock-add-header-button', 'click', function(e) {
        var group = $( this ).data("mock-group");
        addHeaderLineItem(group, "", "");
    });

    function addHeaderLineItem(group, name, value) {
        var template = Handlebars.compile(getTemplate("#mock-headers-template"));
        var data = {group: group,
                    tid: Math.random().toString(36).substring(18),
                    name: name,
                    value: value};
        $("#mock-headers-container-"+group).append(template(data));
    }

    function addHeaderLineItemDuplicateAware(group, name, value) {
        //check for duplicates here
        addHeaderLineItem(group, name, value);
    }

    $(document).delegate('.mock-method-select', 'change', function(e) {
        var linkedElement = $(this).data("mock-linked");
        var dropdownGroup = $(this).data("mock-method-group");
        var payload = $(this).data("mock-payload");
        var item=$(this);
        updatePayloadView(item[0].id, linkedElement, payload);
        updateMethodGroupWhenChanged(dropdownGroup, item);
        populateMethodTemplate(getGroup(linkedElement),getTid(linkedElement));
    });

    function getGroup(id) {
        //code-dropdown-1-3dddeu3di-gv4fg5vcxr
        var parts = id.split("-", 5);
        return parts[2]+"-"+parts[3];
    }

    function getTid(id) {
        //code-dropdown-1-3dddeu3di-gv4fg5vcxr
        var parts = id.split("-", 5);
        return parts[4];
    }

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
            while(1<obj.length) {
                if(obj.value !== obj[0].value) {
                    obj[0].remove();
                } else {
                    obj[1].remove();
                }
            }
        });
        for(var i = 0; i<availableMethods.length; i++) {
            $('.'+dropdownGroup).append('<option name="'+availableMethods[i]+'">'+availableMethods[i]+'</option>');
        }
    }

    function updatePayloadView(methodId, codeId, payloadId) {
        changePayloadEditorVisibility(payloadId, isPayloadVisible(methodId, codeId));
        //if(isPayloadVisible(methodId, codeId)) {
        //    $("#"+payloadId).show();
        //} else {
        //    $("#"+payloadId).hide();
        //}
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
        var fwSlash = "/";
        if(elem.val().length > 0 && elem.val().startsWith(fwSlash)) {
            fwSlash = "";
        }
        if(elem.val().length == 0) {
            fwSlash = "";
        }
        $('#'+group).html(initVal+fwSlash+escape(elem.val()));//url encode !!!
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
                var json = {
                    'array': [1, 2, 3],
                    'boolean': true,
                    'null': null,
                    'number': 123,
                    'object': {'a': 'b', 'c': 'd'},
                    'string': 'Hello World'
                };
        addMethod(group, json);
    });

    function addMethod(group, body) {
        var template = Handlebars.compile(getTemplate("#mock-method-template"));
        var nonUsedMethods = filterUsedMethods(httpMethods, group);
        var tid = Math.random().toString(36).substring(18);
        var data = {group: group,
                    methods_options: generateDropdownList(nonUsedMethods),
                    codes_options: generateDropdownList(httpCodes),
                    tid: tid};
        $("#mock-methods-"+group).append(template(data));
        var editorId = "jsoneditor-" + data.group + "-" + data.tid;
        var container = document.getElementById(editorId);

        var editor = new JSONEditor(container, editorOptions, body);
        var groups = editorId.split("-", 3);
        putEditor(groups[1]+"-"+groups[2], editorId, editor);

        if(nonUsedMethods.length === 1) {
            $('#'+group).prop('disabled', true);
        }
        updateMethodGroupWhenChanged("dropdown-grp-"+group);
        populateMethodTemplate(group,tid);
    }

    function populateMethodTemplate(group,tid) {
        //method-dropdown-1-8iyrwfjemi-8nhcwhfr
        //code-dropdown-1-y077ujtt9-azd7ioogvi
        var methodSelected = $("#method-dropdown-"+group+"-"+tid).val();
        var template = httpMethodTemplate[methodSelected];
        $("#code-dropdown-"+group+"-"+tid).val(template.code);
        for (var key in template.headers) {
           if (template.headers.hasOwnProperty(key)) {
              addHeaderLineItemDuplicateAware(group+"-"+tid, key, template.headers[key]);
           }
        }
        if(template.body) {
            changePayloadEditorVisibility("jsonpayload-"+group+"-"+tid, true);
            //$("#json-payload-"+group+"-"+tid).show();
        } else {
            changePayloadEditorVisibility("jsonpayload-"+group+"-"+tid, false);
            //$("#json-payload-"+group+"-"+tid).hide();
        }
    }

    function changePayloadEditorVisibility(group, show) {
        if(show) {
            $("#"+group).show();
            $("#ind"+group).val("true");
        } else {
            $("#ind"+group).val("false");
            $("#"+group).hide();
        }
    }

    $(document).delegate('.mock-delete-method-button', 'click', function(e) {
        var group = $( this ).data("mock-group");
        var topGroup = separateTopGroupFromId(group);
        $("#mock-method-container-"+group).remove();
        $('#'+topGroup).prop('disabled', false);
        var groups = group.split("-", 2);
        removeEditor(groups[0]+"-"+groups[1], 'jsoneditor-'+group);
        updateMethodGroupWhenChanged("dropdown-grp-"+separateTopGroupFromId(group));
        chainDeleteForLastMethodItem(group);
    });

    function chainDeleteForLastMethodItem(group) {
        var parts = group.split("-", 2);
        if ($('#mock-methods-'+parts[0]+'-'+parts[1]).children().length < 1) {
            $('#mock-methods-container-'+parts[0]).children().remove();
            hideEmptyMock(parts[0]);
        }
    }

    function hideEmptyMock(id) {
        $('#mock-form-'+id).hide();
        $('#mock-button-'+id).show();
    }

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
                dataType: 'json',
                contentType: 'application/json',
                data: localStorage.getItem('mock'+id),
                success: function (response) {
                    console.log(response);
                    updateMockIndicator(true, 'mock'+id);
                    //var pContent = $(response).find("#ajax-form-container");
                    //$("#ajax-form-container").html(pContent);
                }
            });
        }
    }

    function isMockValid(id) {
        //validate all the editors here!!!!
        return true;
    }

    function getTemplate(template) {
        var source  = $(template).html();
        var sourcep = source.replace(new RegExp("<%", 'g'), "{{")
                            .replace(new RegExp("%>", 'g'), "}}")
                            .replace(new RegExp("<&", 'g'), "{{{")
                            .replace(new RegExp("&>", 'g'), "}}}");
        return sourcep;
    }

    function updateMockIndicator(state, mock) {
        if(state) {
            $('#indicator-mock').removeClass("btn-danger");
            $('#indicator-mock').addClass("btn-success");
            $('#indicator-mock').html("Deployed " + mock);
        } else {
            $('#indicator-mock').removeClass("btn-success");
            $('#indicator-mock').addClass("btn-danger");
            $('#indicator-mock').html("Mock Inactive");
        }
    }

    //##################  LOADING MOCK

    function loadMock(id) {
        var mockJson = localStorage.getItem('mock'+id);
        if(null !== mockJson) {
            var inputObject = JSON.parse(mockJson);
            for(var i = 0; i<inputObject.mock.length; i++) {
                // create resource with: inputObject.mock[i].path
                for (var key in inputObject.mock[i].methods) {
                   if (inputObject.mock[i].methods.hasOwnProperty(key)) {
               //       addMethodFromJson(group+"-"+tid, key, inputObject.mock[i].methods[key]);
                   }
                }
            }
        }
        //loop create resource
            //loop create method
        //end
    }

    //##################  JSON EDITORS
    // group - mock slot (1,2,3 ...)
    // id - id of the instance

    function putEditor(group, id, editor) {
        if( typeof editors[group] === 'undefined' ) {
            editors[group] = {};
        }
        editors[group][id] = editor;
    }

    function pullEditor(group, id) {
        return editors[group][id];
    }

    function removeEditor(group, id) {
        delete editors[group][id];
    }

    function removeEditors(group) {
        delete editors[group];
    }

    //##################  SAVING MOCK

    function saveMock(id) {
        formHeaders = {}; //reset header cache
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
        oout['headers']=formHeaders;
        localStorage.setItem('mock'+id, JSON.stringify(convertToSettingsObject(oout)));
        localStorage.setItem('mocko'+id, JSON.stringify(oout));
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
        if(paramName[0] === 'headername' || paramName[0] === 'headervalue') {
            gatherHeaders(paramName, pathParam);
            return output;
        }
        return output[getMockBankName(paramName[1])][paramName[2]][paramName[3]][paramName[0]] = pathParam[1];
    }

    function gatherHeaders(paramName, pathParam) {
            if( typeof formHeaders[paramName[2]] === 'undefined' ) {
                formHeaders[paramName[2]] = {};
            }
            if( typeof formHeaders[paramName[2]][paramName[3]] === 'undefined' ) {
                formHeaders[paramName[2]][paramName[3]] = {};
            }
            if( typeof formHeaders[paramName[2]][paramName[3]][paramName[4]] === 'undefined' ) {
                formHeaders[paramName[2]][paramName[3]][paramName[4]] = {};
            }
            if( typeof formHeaders[paramName[2]][paramName[3]][paramName[4]][paramName[0]] === 'undefined' ) {
                formHeaders[paramName[2]][paramName[3]][paramName[4]][paramName[0]] = "";
            }
            formHeaders[paramName[2]][paramName[3]][paramName[4]][paramName[0]] = pathParam[1];
    }

    function convertToSettingsObject(fromFormObject) {
        var obj = {};
        var mock;
        for(var key in fromFormObject) {
            if(fromFormObject.hasOwnProperty(key) && key !== 'headers') {
                mock = key;
                obj['mock'] = [];
                obj['mockid'] = mock;
                obj['mockname'] = mock;
                for(var resource in fromFormObject[key]) {
                    if(fromFormObject[key].hasOwnProperty(resource)) {
                        var resourcePath = {path: fromFormObject[key][resource]['path'], methods: {}};
                        for(var method in fromFormObject[key][resource]) {
                            if (method !== 'path') {
                                if(fromFormObject[key][resource].hasOwnProperty(method)) {
                                    resourcePath['methods'][fromFormObject[key][resource][method]['method']] = {
                                        code: fromFormObject[key][resource][method]['respcode'],
                                        payload: fetchJSONEditorContent(fromFormObject[key][resource][method]['payload']),
                                        body: fromFormObject[key][resource][method]['indjsonpayload'], //convert to boolean
                                        headers: buildMockHeaders(fromFormObject['headers'], resource, method)};
                   // btoa atob  btoa()
                                }
                            }
                        }
                        obj['mock'].push(resourcePath);
                    }
                }
            }
        }
        return obj;
    }
    function buildMockHeaders(allHeaders, resource, method) {
        var headersResult = {};
        if(typeof allHeaders[resource] !== 'undefined') {
            if(typeof allHeaders[resource][method] !== 'undefined') {
                for (var key in allHeaders[resource][method]) {
                    if (allHeaders[resource][method].hasOwnProperty(key)) {
                        headersResult[allHeaders[resource][method][key]['headername']] = allHeaders[resource][method][key]['headervalue'];
                    }
                }
            }
        }
        return headersResult;
    }

    function fetchJSONEditorContent(id) {
        var groups = id.split("-", 3);
        return pullEditor(groups[1]+"-"+groups[2], id).get();
        //JSON.stringify();
    }
});
