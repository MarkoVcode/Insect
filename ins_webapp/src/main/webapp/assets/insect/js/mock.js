$(document).ready(function(){

    $( document ).delegate( '#mock-deploy-1', 'click', function(e) {
        var form = $('#mock-form-1');
        var formser = form.serialize();
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
                    tid: Math.random().toString(36).substring(7)};
        $("#mock-methods-container-"+group).append(template(data));
        $('.mock-add-method-button').click(function(e){
            var group = $( this ).data("mock-group");
            var template = Handlebars.compile(getTemplate("#mock-method-template"));
            var data = {group: group,
                        tid: Math.random().toString(36).substring(7)};
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
});
