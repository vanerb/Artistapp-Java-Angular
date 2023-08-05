
$(document).ready(function () {

  

    $("#nombre").on("input blur", function() {
        if ($("#nombre").val() == "" || $("#nombre").val().trim() === "" || $("#nombre").val().length > 100) {
            $("#nombre").css({ "background-color": "red" })
        }
        else {
            $("#nombre").css({ "background-color": "" })
        }

    })
    $("#apellidos").on("input blur", function() {
        if ($("#apellidos").val() == "" ||  $("#apellidos").val().trim() === "" || $("#apellidos").val().length > 140) {
            $("#apellidos").css({ "background-color": "red" })
        }
        else {
            $("#apellidos").css({ "background-color": "" })
        }

    })
    $("#usuario").on("input blur", function() {
        if ($("#usuario").val() == "" || $("#usuario").val().trim() === "" || $("#usuario").val().length > 100) {
            $("#usuario").css({ "background-color": "red" })
        }
        else {
            $("#usuario").css({ "background-color": "" })
        }

    })

    $("#correo").on("input blur", function() {
        if ($("#correo").val() == "" || !validateEmail($("#correo").val()) || $("#correo").val().trim() === "" || $("#correo").val().length > 240) {
            $("#correo").css({ "background-color": "red" })
        }
        else {
            $("#correo").css({ "background-color": "" })
        }

    })

    $("#contrasena").on("input blur", function() {
        if ($("#contrasena").val() == "" || !validatePassword($("#contrasena").val()) || $("#contrasena").val().trim() === "" || $("#contrasena").val().length > 240) {
            $("#contrasena").css({ "background-color": "red" });
        } else {
            $("#contrasena").css({ "background-color": "" });
        }
    });

    $("#contrasena").tooltip();

    $("#repcontrasena").on("input blur", function() {
        if ($("#repcontrasena").val() == "" || $("#repcontrasena").val()!=$("#contrasena").val()) {
            $("#repcontrasena").css({ "background-color": "red" })
        }
        else {
            $("#repcontrasena").css({ "background-color": "" })
        }

    })

    function validateEmail(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    function validatePassword(password) {
        var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        return re.test(password);
    }

    $.ajax({
        type: "GET",
        url: "php/usuarios/showtypeofuser.php",
        success: function (datos) {
            var listado = jQuery.parseJSON(datos);
            for (var x of listado) {
                $("<option value='" + x.id + "'>" + x.nombre + "</option>").appendTo("#id_tipo");
            }

        }
    });

    $("body").on("click", "#registrarse", function () {
        data = $("form#adduser").serialize();
        $.ajax({
            type: "GET",
            url: "php/usuarios/adduser.php",
            data: data,
            success: function (datos) {
                if(datos == "added"){
                   // console.log(datos);
                    window.location.href = "login.html";

                    $.ajax({
                        type: "GET",
                        data: {
                            nombreusuario: $("#adduser #usuario").val(),
                        },
                        url: "php/discordbot.php?estado=logusuario",
                        success: function (datos) {

                        }
                    });

                    $("#adduser #nombre").val("");
                    $("#adduser #apellidos").val("");
                    $("#adduser #usuario").val("");
                    $("#adduser #correo").val("");
                    $("#adduser #contrasena").val("");
                    $("#adduser #repcontrasena").val("");
                    $("#adduser #id_tipo").prop('selectedIndex', 0);

                   

                }
                else if(datos == "error1"){
                    $("<div></div>").appendTo("body")
                        .html("<div><h3>No se pueden dejar espacios en blanco o campos vacíos</h3></div>")
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

                else if(datos == "error2" || datos == ""){
                    $("<div></div>").appendTo("body")
                    .html("<div><h3>Este nombre de usuario ya existe</h3></div>")
                    .dialog({
                        resizable: false,
                        modal: true,
                        title: "Confirmar",
                        buttons: {
                            "Aceptar": function () {
                                // Si se confirma, hacer algo
                               
                                $(this).dialog("close");
                            },
                           
                        },
                        close: function () {
                            // Si se cierra el diálogo, quitarlo del DOM
                            $(this).remove();
                        }
                    });
                }

                else if(datos == "error6" || datos == ""){
                    $("<div></div>").appendTo("body")
                    .html("<div><h3>Este correo ya existe</h3></div>")
                    .dialog({
                        resizable: false,
                        modal: true,
                        title: "Confirmar",
                        buttons: {
                            "Aceptar": function () {
                                // Si se confirma, hacer algo
                               
                                $(this).dialog("close");
                            },
                           
                        },
                        close: function () {
                            // Si se cierra el diálogo, quitarlo del DOM
                            $(this).remove();
                        }
                    });
                }

                else if(datos == "error5" || datos == ""){
                    $("<div></div>").appendTo("body")
                    .html("<div><h3>Las contraseñas no son iguales</h3></div>")
                    .dialog({
                        resizable: false,
                        modal: true,
                        title: "Confirmar",
                        buttons: {
                            "Aceptar": function () {
                                // Si se confirma, hacer algo
                               
                                $(this).dialog("close");
                            },
                           
                        },
                        close: function () {
                            // Si se cierra el diálogo, quitarlo del DOM
                            $(this).remove();
                        }
                    });
                }

                else if(datos == "error3" || datos == ""){
                    $("<div></div>").appendTo("body")
                    .html("<div><h3>Se ha llegado al máximo de carácteres</h3></div>")
                    .dialog({
                        resizable: false,
                        modal: true,
                        title: "Confirmar",
                        buttons: {
                            "Aceptar": function () {
                                // Si se confirma, hacer algo
                               
                                $(this).dialog("close");
                            },
                           
                        },
                        close: function () {
                            // Si se cierra el diálogo, quitarlo del DOM
                            $(this).remove();
                        }
                    });
                }

                else if(datos == "error8" || datos == ""){
                    $("<div></div>").appendTo("body")
                    .html("<div><h3>El correo no es válido</h3></div>")
                    .dialog({
                        resizable: false,
                        modal: true,
                        title: "Confirmar",
                        buttons: {
                            "Aceptar": function () {
                                // Si se confirma, hacer algo
                               
                                $(this).dialog("close");
                            },
                           
                        },
                        close: function () {
                            // Si se cierra el diálogo, quitarlo del DOM
                            $(this).remove();
                        }
                    });
                }

                else if(datos == "error7" || datos == ""){
                    $("<div></div>").appendTo("body")
                    .html("<div><h3>La contraseña no es válida</h3></div>")
                    .dialog({
                        resizable: false,
                        modal: true,
                        title: "Confirmar",
                        buttons: {
                            "Aceptar": function () {
                                // Si se confirma, hacer algo
                               
                                $(this).dialog("close");
                            },
                           
                        },
                        close: function () {
                            // Si se cierra el diálogo, quitarlo del DOM
                            $(this).remove();
                        }
                    });
                }
                

            }
        });
    })
});