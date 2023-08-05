
$(document).ready(function () {
   
    $("#adduser #nombre").on("input blur", function() {
        if ($("#adduser #nombre").val() == "" || $("#adduser #nombre").val().trim() === "" || $("#adduser #nombre").val().length >= 100) {
            $("#adduser #nombre").css({ "background-color": "red" })
        }
        else {
            $("#adduser #nombre").css({ "background-color": "" })
        }

    })

    $("#adduser #usuario").on("input blur", function() {
        if ($("#adduser #usuario").val() == "" || $("#adduser #usuario").val().trim() === "" || $("#adduser #usuario").val().length >= 100 ) {
            $("#adduser #usuario").css({ "background-color": "red" })
        }
        else {
            $("#adduser #usuario").css({ "background-color": "" })
        }

    })

    $("#adduser #correo").on("input blur", function() {
        if ($("#adduser #correo").val() == "" || !validateEmail($("#adduser #correo").val()) || $("#adduser #correo").val().trim() === "" || $("#adduser #correo").val().length >= 240 ) {
            $("#adduser #correo").css({ "background-color": "red" })
        }
        else {
            $("#adduser #correo").css({ "background-color": "" })
        }

    })


    $("#adduser #contrasena").on("input blur", function() {
        if ($("#adduser #contrasena").val() == "" || !validatePassword($("#adduser #contrasena").val()) || $("#adduser #contrasena").val().trim() === "" || $("#adduser #contrasena").val().length >= 240) {
            $("#adduser #contrasena").css({ "background-color": "red" })
        }
        else {
            $("#adduser #contrasena").css({ "background-color": "" })
        }

    })
    $("#adduser #repcontrasena").on("input blur", function() {
        if ($("#adduser #repcontrasena").val() == "" || $("#adduser #repcontrasena").val() !=  $("#adduser #contrasena").val()) {
            $("#adduser #repcontrasena").css({ "background-color": "red" })
        }
        else {
            $("#adduser #repcontrasena").css({ "background-color": "" })
        }

    })

    

    $("#adduser #nuevacontrasena").on("input blur", function() {
        if ($("#adduser #nuevacontrasena").val() == "" || !validatePassword($("#adduser #nuevacontrasena").val()) || $("#adduser #nuevacontrasena").val().trim() === "" || $("#adduser #nuevacontrasena").val().length >= 240) {
            $("#adduser #nuevacontrasena").css({ "background-color": "red" })
        }
        else {
            $("#adduser #nuevacontrasena").css({ "background-color": "" })
        }

    })

    $("#adduser #apellidos").on("input blur", function() {
        if ($("#adduser #apellidos").val() == "" || $("#adduser #apellidos").val().trim() === "" || $("#adduser #apellidos").val().length >= 140) {
            $("#adduser #apellidos").css({ "background-color": "red" })
        }
        else {
            $("#adduser #apellidos").css({ "background-color": "" })
        }

    })


    $("#edituser #nombre").on("input blur", function() {
        if ($("#edituser #nombre").val() == "" || $("#edituser #nombre").val().trim() === "" || $("#edituser #nombre").val().length >= 100) {
            $("#edituser #nombre").css({ "background-color": "red" })
        }
        else {
            $("#edituser #nombre").css({ "background-color": "" })
        }

    })

    $("#edituser #apellidos").on("input blur", function() {
        if ($("#edituser #apellidos").val() == "" || $("#edituser #apellidos").val().trim() === "" || $("#edituser #apellidos").val().length >= 140) {
            $("#edituser #apellidos").css({ "background-color": "red" })
        }
        else {
            $("#edituser #apellidos").css({ "background-color": "" })
        }

    })

    $("#edituser #usuario").on("input blur", function() {
        if ($("#edituser #usuario").val() == "" || $("#edituser #usuario").val().trim() === "" || $("#edituser #usuario").val().length >= 100) {
            $("#edituser #usuario").css({ "background-color": "red" })
        }
        else {
            $("#edituser #usuario").css({ "background-color": "" })
        }

    })

    $("#edituser #correo").on("input blur", function() {
        if ($("#edituser #correo").val() == "" || !validateEmail($("#edituser #correo").val()) || $("#edituser #correo").val().trim() === "" || $("#edituser #correo").val().length >= 240) {
            $("#edituser #correo").css({ "background-color": "red" })
        }
        else {
            $("#edituser #correo").css({ "background-color": "" })
        }

    })

    $("#edituser #biografia").on("input blur", function() {
        if ($("#edituser #biografia").val() == "" || $("#edituser #biografia").val().trim() === "" || $("#edituser #biografia").val().length >= 240) {
            $("#edituser #biografia").css({ "background-color": "red" })
        }
        else {
            $("#edituser #biografia").css({ "background-color": "" })
        }

    })

   
    $("#editcontrasenaform #contrasena").on("input blur", function() {
        if ($("#editcontrasenaform #contrasena").val() == "" || !validatePassword($("#editcontrasenaform #contrasena").val()) || $("#editcontrasenaform #contrasena").val().trim() === "" || $("#editcontrasenaform #contrasena").val().length >= 240) {
            $("#editcontrasenaform #contrasena").css({ "background-color": "red" })
        }
        else {
            $("#editcontrasenaform #contrasena").css({ "background-color": "" })
        }

    })




    $("#editcontrasenaform #repcontrasena").on("input blur", function() {
        if ($("#editcontrasenaform #repcontrasena").val() == "" || $("#editcontrasenaform #repcontrasena").val() !=  $("#editcontrasenaform #nuevacontrasena").val()) {
            $("#editcontrasenaform #repcontrasena").css({ "background-color": "red" })
        }
        else {
            $("#editcontrasenaform #repcontrasena").css({ "background-color": "" })
        }

    })

    

    $("#editcontrasenaform #nuevacontrasena").on("input blur", function() {
        if ($("#editcontrasenaform #nuevacontrasena").val() == "" || !validatePassword($("#editcontrasenaform #nuevacontrasena").val()) || $("#editcontrasenaform #nuevacontrasena").val().trim() === "" || $("#editcontrasenaform #nuevacontrasena").val().length >= 240) {
            $("#editcontrasenaform #nuevacontrasena").css({ "background-color": "red" })
        }
        else {
            $("#editcontrasenaform #nuevacontrasena").css({ "background-color": "" })
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

    $("#edituser #apellidos").on("input blur", function() {
        if ($("#edituser #apellidos").val() == "" || $("#edituser #apellidos").val().trim() === "" || $("#edituser #apellidos").val().length >= 140) {
            $("#edituser #apellidos").css({ "background-color": "red" })
        }
        else {
            $("#edituser #apellidos").css({ "background-color": "" })
        }

    })



    $.ajax({
        type: "GET",
        url: "php/sesion.php",
        success: function (datos) {
           // console.log(datos);
            //menu de artistas
            if (datos == "1") {
                window.location.href = "index.html";
            }
            //Menu de Administradores
            else if (datos == "2") {
              //  console.log("ADMIn");
                //MostrarUsuarios();
                cargarDatos(1);
                AddUsuarios();
                EditUsuarios();
                DeleteUsuarios();
                OcultarDialogo();
                CambiarContrasena();
                $(document).on('click', '.pagina', function () {
                    cargarDatos($(this).data('pagina'));
                });
            
                $(document).on('click', '.borrar', function () {
                    var id = $(this).data('id');
                    // ... código para borrar la fila correspondiente al ID ...
                });
            
                $(document).on('click', '.editar', function () {
                    var id = $(this).data('id');
                    // ... código para editar la fila correspondiente al ID ...
                });

            }
            //Menu de No artistas
            else if (datos == "3") {
              //  console.log("ADMIn");
                window.location.href = "index.html";

            }
            //Menu adminsitradores de eventos
            else if (datos == "4") {
              //  console.log("ADMIn");
                window.location.href = "index.html";

            }

        },
    });

    $.ajax({
        type: "GET",
        url: "php/usuarios/showtypeofuser.php",
        success: function (datos) {
            var listado = jQuery.parseJSON(datos);
            for (var x of listado) {
                $("<option value='" + x.id + "'>" + x.nombre + "</option>").appendTo("#addform #id_tipo");
                //$("<option value='" + x.id + "'>" + x.nombre + "</option>").appendTo("#editform #id_tipo");

            }

        }
    });


    function OcultarDialogo() {
        $("body").on("click", "#close", function () {
            $("#editform").css({ "display": "none" });
            $("#addform").css({ "display": "none" });

        })


    }


    function AddUsuarios() {

        $("body").on("click", "#anadir", function () {

            $("#addform").css({ "display": "block" });
            $.ajax({
                type: "GET",
                url: "php/usuarios/showtypeofuser.php",
                success: function (datos) {
                    var listado = jQuery.parseJSON(datos);
                    for (var x of listado) {
                        $("<option value='" + x.id + "'>" + x.nombre + "</option>").appendTo("adduser#id_tipo");

                    }

                }
            });
        })

        $("#adduser").on("click", "#btadd", function () {
            var data = $("form#adduser").serialize();
          //  console.log(data);
            $.ajax({
                type: "GET",
                data: data,
                url: "php/usuarios/adduser.php",
                success: function (datos) {
                    if (datos == "added") {
                        $("#addform").css({ "display": "none" });
                        cargarDatos(1);
                        $("#addform #nombre").val("");
                        $("#addform #apellidos").val("");
                        $("#addform #usuario").val("");
                        $("#addform #correo").val("");
                        $("#addform #contrasena").val("");
                        $("#addform #repcontrasena").val("");
                        $("#addform #id_tipo").prop('selectedIndex', 0);

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
                            title: "Error",
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
                            title: "Error",
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
                            title: "Error",
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
                            title: "Error",
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
                            title: "Error",
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
                            title: "Error",
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



                },
            });
        })

    }


    function EditUsuarios() {

        var cod;
        $("body").on("click", "#editar", function () {
            $.ajax({
                type: "GET",
                url: "php/usuarios/showtypeofuser.php",
                success: function (datos) {
                    var listado = jQuery.parseJSON(datos);
                    for (var x of listado) {
                        $("<option value='" + x.id + "'>" + x.nombre + "</option>").appendTo("edituser#id_tipo");

                    }

                }
            });
            cod = $(this).parents("#usuarios td").find('input[type="button"]').attr('name');

            $("#editform").css({ "display": "block" });

            $.ajax({
                type: "GET",
                url: "php/usuarios/finduser.php?id=" + cod,
                success: function (datos) {
                    var pedidos = jQuery.parseJSON(datos);
                    for (var x of pedidos) {
                        $("#edituser").find("input[type='text']:eq(0)").val(x.nombre);
                        $("#edituser").find("input[type='text']:eq(1)").val(x.apellidos);
                        $("#edituser").find("input[type='text']:eq(2)").val(x.usuario);
                        $("#edituser").find("input[type='email']:eq(0)").val(x.correo);
                        $("#edituser #id_tipo").val(x.id_tipo);

                        $("#edituser").find("input[type='text']:eq(3)").val(x.biografia);
                        $("#edituser").find("input[type='hidden']:eq(0)").val(x.imagen);

                    }
                },
            });

        })

        $("body").on("click", "#btedit", function (e) {
         //   console.log(cod);
            e.preventDefault();
            var data = new FormData();

            //Form data
            var form_data = $('#edituser').serializeArray();
            $.each(form_data, function (key, input) {
                data.append(input.name, input.value);
            });

            var file_data = $('input[name="fotoperfil"]')[0].files;
            for (var i = 0; i < file_data.length; i++) {
                data.append("fotoperfil[]", file_data[i]);
            }

            //Custom data
            data.append('key', 'value');
            $.ajax({
                url: 'php/usuarios/edituseradmin.php?id=' + cod, // point to server-side PHP script 
                dataType: 'text',  // what to expect back from the PHP script, if anything
                cache: false,
                contentType: false,
                processData: false,
                data: data,
                type: 'post',
                success: function (php_script_response) {
                    console.log(php_script_response);
                    if (php_script_response == "added") {
                        window.location.href = "adminusers.html";

                    }
                    else if (php_script_response == "error1" || php_script_response == "") {
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
                    else if(php_script_response == "error3" || php_script_response == ""){
                        $("<div></div>").appendTo("body")
                        .html("<div><h3>El formato de la imagen no es correcto</h3></div>")
                        .dialog({
                            resizable: false,
                            modal: true,
                            title: "Error",
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
                    else if(php_script_response == "error2" || php_script_response == ""){
                        $("<div></div>").appendTo("body")
                        .html("<div><h3>El usuario o el correo ya existe</h3></div>")
                        .dialog({
                            resizable: false,
                            modal: true,
                            title: "Error",
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
                    else if(php_script_response == "error4" || php_script_response == ""){
                        $("<div></div>").appendTo("body")
                        .html("<div><h3>Se ha llegado al máximo de carácteres</h3></div>")
                        .dialog({
                            resizable: false,
                            modal: true,
                            title: "Error",
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
                    else if(php_script_response == "error7" || php_script_response == ""){
                        $("<div></div>").appendTo("body")
                        .html("<div><h3>La imagen seleccionada es demasiado grande</h3></div>")
                        .dialog({
                            resizable: false,
                            modal: true,
                            title: "Error",
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
                    else if(php_script_response == "error8" || php_script_response == ""){
                        $("<div></div>").appendTo("body")
                        .html("<div><h3>El correo no es válido</h3></div>")
                        .dialog({
                            resizable: false,
                            modal: true,
                            title: "Error",
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
    }

    function DeleteUsuarios() {

        $("body").on("click", "#borrar", function () {
            var cod = $(this).parents("#usuarios td").find('input[type="button"]').attr('name');

           console.log(cod);

            $("<div></div>").appendTo("body")
                    .html("<div><h3>¿Está seguro?</h3></div>")
                    .dialog({
                        resizable: false,
                        modal: true,
                        title: "Confirmar",
                        buttons: {
                            "Sí": function () {
                                // Si se confirma, hacer algo
                                $.ajax({
                                    type: "GET",
                                    url: "php/usuarios/deleteuser.php?id=" + cod,
                                    success: function (datos) {
                                       // console.log(datos);
                                        if(datos == "deleted"){
                                            cargarDatos(1);
                    
                                        }
                                        else if(datos == "error1" || datos == ""){
                                            $("<div></div>").appendTo("body")
                                                .html("<div><h3>No se puede eliminar</h3></div>")
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
                                });
                                $(this).dialog("close");
                            },
                            "No": function () {
                                // Si se cancela, no hacer nada
                                $(this).dialog("close");
                            }
                        },
                        close: function () {
                            // Si se cierra el diálogo, quitarlo del DOM
                            $(this).remove();
                        }
                    });



          
        })
    }






    function cargarDatos(pagina) {
        var $tabla = $('#usuarios');
        var $paginacion = $('#paginacion');
        $.ajax({
            url: 'php/usuarios/showusers.php',
            data: { offset: (pagina - 1) * 6, limit: 6 },
            dataType: 'json',
            success: function (response) {
                var datos = response.data;
                var totalPaginas = response.totalPaginas;
                var htmlTabla = '';
                for (var i = 0; i < datos.length; i++) {
                    
                    htmlTabla += '<tr>';
                    htmlTabla += '<td>' + datos[i].id + '</td>';
                    htmlTabla += '<td>' + datos[i].nombre + '</td>';
                    htmlTabla += '<td>' + datos[i].apellidos + '</td>';
                    htmlTabla += '<td>' + datos[i].usuario + '</td>';
                    htmlTabla += '<td>' + datos[i].correo + '</td>';
                    htmlTabla += '<td>' + datos[i].tipo_usuario + '</td>';
                    htmlTabla += '<td><img src="' + datos[i].imagen + '" width="100px" height="100px"></td>';
                    //htmlTabla += '<td>' + datos[i].biografia + '</td>';
                    htmlTabla += '<td><input type="button" data-id="' + datos[i].id + '" id="borrar" name="' + datos[i].id + '" value="Eliminar"></td>';
                    htmlTabla += '<td><input type="button" data-id="' + datos[i].id + '" id="editar" name="' + datos[i].id + '" value="Editar"></td>';
                    htmlTabla += '<td><input type="button" data-id="' + datos[i].id + '" id="cambiarcontrasena" name="' + datos[i].id + '" value="Cambiar\ncontraseña"></td>';
                    htmlTabla += '</tr>';
                }
                $tabla.find('tbody').html(htmlTabla);
                // Actualizar la paginación
                var htmlPaginacion = '<ul class="pagination">';
                for (var i = 1; i <= totalPaginas; i++) {
                    htmlPaginacion += '<li><button class="pagina" data-pagina="' + i + '">' + i + '</button></li>';
                }
                htmlPaginacion += '</ul>';
                $paginacion.html(htmlPaginacion);
                $paginacion.find('.pagina').removeClass('active');
                $paginacion.find('.pagina[data-pagina="' + pagina + '"]').addClass('active');
            },
            error: function (xhr, status, error) {
                console.log("Error al cargar los datos: " + error);
            }
        });
    }

   

















   

    function CambiarContrasena() {
        var cod;
        $("body").on("click", "#cambiarcontrasena", function () {
            $("#editcontrasena").css({ "display": "block" });

            cod = $(this).parents("#usuarios td").find('input[type="button"]').attr('name');
          //  console.log(cod);
        })

        $("body").on("click", "#btchangepassword", function () {
           // console.log(cod);
            var data = $("form#editcontrasenaform").serialize();

            $.ajax({
                type: "GET",
                data: data,
                url: "php/usuarios/changepasswordadmin.php?id=" + cod,
                success: function (datos) {
                    if(datos == "added"){
                        $("#editcontrasena").css({ "display": "none" });
                        $("#editcontrasena #nuevacontrasena").val("");
                        $("#editcontrasena #repcontrasena").val("");

                    }
                    else if (datos == "error1" || datos == "") {
                        $("<div></div>").appendTo("body")
                            .html("<div><h3>No se pueden dejar espacios en blanco o campos vacíos</h3></div>")
                            .dialog({
                                resizable: false,
                                modal: true,
                                title: "Error",
                                buttons: {
                                    "Aceptar": function () {
                                        // Si se confirma, hacer algo
    
                                        $(this).dialog("close");
                                    }
                                },
                                close: function () {
                                    // Si se cierra el diálogo, quitarlo del DOM
                                    $(this).remove();
                                }
                            });
                    }
                    else if (datos == "error2") {
                        $("<div></div>").appendTo("body")
                            .html("<div><h3>La contraseña no es correcta</h3></div>")
                            .dialog({
                                resizable: false,
                                modal: true,
                                title: "Error",
                                buttons: {
                                    "Aceptar": function () {
                                        // Si se confirma, hacer algo
    
                                        $(this).dialog("close");
                                    }
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
                            title: "Error",
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

                },
            });
        })

        $("body").on("click", "#close", function () {
            $("#editcontrasena").css({ "display": "none" });

        })


    }

    function OcultarDialogo() {
        $("body").on("click", "#close", function () {
            $("#editform").css({ "display": "none" });
            $("#addform").css({ "display": "none" });
        })


    }



});