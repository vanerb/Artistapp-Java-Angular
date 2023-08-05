$(document).ready(function() {
    $('#forgotPasswordForm').submit(function(event) {
        event.preventDefault();
        var email = $('#email').val();

        $.ajax({
            type: 'POST',
            url: $(this).attr('action'),
            data: { email: email },
            success: function(response) {
                if(response == "error1"){
                    $("<div></div>").appendTo("body")
                    .html("<div><h3>El correo no es válido</h3></div>")
                    .dialog({
                        resizable: false,
                        modal: true,
                        title: "Error",
                        buttons: {
                            "Aceptar": function () {

                                $(this).dialog("close");
                            },

                        },
                        close: function () {
                            // Si se cierra el diálogo, quitarlo del DOM
                            $(this).remove();
                        }
                    });
                }
                else{
                    $('#response').html(response);
                }
                
            }
        });
    });
});