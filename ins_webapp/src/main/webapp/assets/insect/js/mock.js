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
});
