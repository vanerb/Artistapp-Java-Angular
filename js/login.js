
$(document).ready(function () {
   
    //Comienzo validaciones campos del login
    var keycount=0;
    $("#user").blur(function(){
        if($("#user").val() == ""){
            $("#user").focus();
            $("#user").css({"background-color":"red"})
        }
        else{
            $("#user").css({"background-color":""})
        }
        
    })
    $("#password").blur(function(){
        if($("#password").val() == ""){
            $("#password").css({"background-color":"red"})
        }
        else{
            $("#password").css({"background-color":""})
        }
        
    })

    //Fin validaciones

    //Boton de login
    $("form#login").find("#logininput").on("click", function () {
       
        var datalog = $("#login").serialize();
       // console.log(datalog);
        //ejecutamos AJAX	
        $.ajax({
            type: "GET",
            url: "php/login.php",
            data: datalog,
            success: function (datos) {
                if(datos == "1"){
                    window.location.href = "index.html";

                    $.ajax({
                        type: "GET",
                        data: {
                            nombreusuario: $("#login #user").val(),
                        },
                        url: "php/discordbot.php?estado=loginuser",
                        success: function (datos) {

                        }
                    });
                }
                else{
                    $("<div></div>").appendTo("body")
                    .html("<div><h3>El usuario o la contraseña no son correctos</h3></div>")
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
                
            },
            error: function (xhr) {
                alert("Atencion: se ha producido un error");
                $("#mensaje1").append(xhr.statusText + xhr.responseText);
            },
        });
    });


});