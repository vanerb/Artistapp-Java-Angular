
$(document).ready(function () {



    $("#addform #informe").on("input blur", function() {

        if ($("#addform #informe").val() == "" || $("#addform #informe").val().length > 250 || $("#addform #informe").val().trim() === "") {
            $("#addform #informe").css({ "background-color": "red" })


        }
        else {
            $("#addform #informe").css({ "background-color": "" })

        }

    })


    



    $.ajax({
        type: "GET",
        url: "php/sesion.php",
        success: function (datos) {
            // console.log(datos);
            //menu de artistas
            if (datos == "1") {
                Eliminar(datos);
                RellenaUsuarios();
                AddInforme(datos);
                CloseDialogo();

                $.ajax({
                    url: 'php/informes/showinformewithuser.php',
                    dataType: 'json',
                    success: function (data) {
                        // Mostrar los primeros 6 productos
                        // Mostrar los siguientes 6 productos
                        for (var i = 0; i < data.length; i++) {
                            var informe = data[i];

                            $('<div id="informecarta" class="card my-3"><div class="card-header"><p class="card-text">El usuario <a href="#">' + informe.usuarioreporta + '</a> reporta al usuario <a href="#">' + informe.usuario + '</a></p></div><div class="card-body"><p class="card-text">' + informe.informe + '</p></div><div class="card-footer"><p class="card-text">' + informe.estado + '</p></div><div id="bteliminar" class="card-footer"><input id="borrar" type="button" name="' + informe.id + '" value="Cancelar solicitud"></div></div>').appendTo("#informes");

                        }
                        // Mostrar el botón para cargar más productos si hay más de 6 productos
                        if (data.length >= 6) {
                            $('#cargar-mas-informe').show();
                        }
                    }
                });

                // Cuando se hace clic en el botón "Cargar más productos", cargar los siguientes 6 productos
                $('#cargar-mas-informe').click(function () {
                    // Obtener el número de productos ya mostrados

                    var num_productos_mostrados = $('#informes div#informecarta').length;

                    // Cargar los siguientes 6 productos
                    $.ajax({
                        url: 'php/informes/showinformewithuser.php',
                        data: {
                            offset: num_productos_mostrados,
                            limit: 6
                        },
                        dataType: 'json',
                        success: function (data) {
                            // Mostrar los siguientes 6 productos
                            for (var i = 0; i < data.length; i++) {
                                var informe = data[i];

                                $('<div id="informecarta" class="card my-3"><div class="card-header"><p class="card-text">El usuario <a href="#">' + informe.usuarioreporta + '</a> reporta al usuario <a href="#">' + informe.usuario + '</a></p></div><div class="card-body"><p class="card-text">' + informe.informe + '</p></div><div class="card-footer"><p class="card-text">' + informe.estado + '</p></div><div id="bteliminar" class="card-footer"><input id="borrar" type="button" name="' + informe.id + '" value="Cancelar solicitud"></div></div>').appendTo("#informes");

                            }

                            // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                            if (data.length < 6) {
                                $('#cargar-mas-informe').hide();
                            }
                        }
                    });
                });
            }
            //Menu de Administradores
            else if (datos == "2") {
                $("form#addinforme").prepend("<select name='id_usuarioselect' id='id_usuarioselect'></select>");
                $.ajax({
                    type: "GET",
                    url: "php/showuserswithoutadmina.php",
                    success: function (datos) {
                        var listado1 = jQuery.parseJSON(datos);
                        for (var x of listado1) {
                            $("<option value='" + x.id + "'>" + x.usuario + "</option>").appendTo("#addform #id_usuarioselect");

                        }


                    }
                });
                Eliminar(datos);
                RellenaUsuarios();
                AddInforme(datos);
                CloseDialogo();


                $.ajax({
                    url: 'php/informes/showinforme.php',
                    dataType: 'json',
                    success: function (data) {
                        // Mostrar los primeros 6 productos
                        // Mostrar los siguientes 6 productos
                        for (var i = 0; i < data.length; i++) {
                            var informe = data[i];

                            $('<div id="informecarta" class="card my-3"><div class="card-header"><p class="card-text">El usuario <a href="#">' + informe.usuarioreporta + '</a> reporta al usuario <a href="#">' + informe.usuario + '</a></p></div><div class="card-body"><p class="card-text">' + informe.informe + '</p></div><div class="card-footer"><p class="card-text">' + informe.estado + '</p></div><div id="btpendiente" class="card-footer"><input id="pendiente" type="button" name="' + informe.id + '" value="Pendiente"></div><div id="btresuelta" class="card-footer"><input id="resuelta" type="button" name="' + informe.id + '" value="Resuelta"></div><div id="bteliminar" class="card-footer"><input id="borrar" type="button" name="' + informe.id + '" value="Eliminar"></div></div>').appendTo("#informes");

                        }
                        // Mostrar el botón para cargar más productos si hay más de 6 productos
                        if (data.length >= 6) {
                            $('#cargar-mas-informe').show();
                        }

                        $("#informes #informecarta").filter(function () {

                            var tipo = $(this).find(".card-text:eq(2)").text();


                            return tipo === "pendiente";
                        }).find("#btresuelta").css({ "display": "block" });

                        $("#informes #informecarta").filter(function () {

                            var tipo = $(this).find(".card-text:eq(2)").text();


                            return tipo === "pendiente";
                        }).find("#btpendiente").css({ "display": "none" });



                        $("#informes #informecarta").filter(function () {

                            var tipo = $(this).find(".card-text:eq(2)").text();


                            return tipo === "resuelta";
                        }).find("#btresuelta").css({ "display": "none" });

                        $("#informes #informecarta").filter(function () {

                            var tipo = $(this).find(".card-text:eq(2)").text();


                            return tipo === "resuelta";
                        }).find("#btpendiente").css({ "display": "block" });
                    }
                });

                // Cuando se hace clic en el botón "Cargar más productos", cargar los siguientes 6 productos
                $('#cargar-mas-informe').click(function () {
                    // Obtener el número de productos ya mostrados

                    var num_productos_mostrados = $('#informes div#informecarta').length;

                    // Cargar los siguientes 6 productos
                    $.ajax({
                        url: 'php/informes/showinforme.php',
                        data: {
                            offset: num_productos_mostrados,
                            limit: 6
                        },
                        dataType: 'json',
                        success: function (data) {
                            // Mostrar los siguientes 6 productos
                            for (var i = 0; i < data.length; i++) {
                                var informe = data[i];

                                $('<div id="informecarta" class="card my-3"><div class="card-header"><p class="card-text">El usuario <a href="#">' + informe.usuarioreporta + '</a> reporta al usuario <a href="#">' + informe.usuario + '</a></p></div><div class="card-body"><p class="card-text">' + informe.informe + '</p></div><div class="card-footer"><p class="card-text">' + informe.estado + '</p></div><div id="btpendiente" class="card-footer"><input id="pendiente" type="button" name="' + informe.id + '" value="Pendiente"></div><div id="btresuelta" class="card-footer"><input id="resuelta" type="button" name="' + informe.id + '" value="Resuelta"></div><div id="bteliminar" class="card-footer"><input id="borrar" type="button" name="' + informe.id + '" value="Eliminar"></div></div>').appendTo("#informes");

                            }

                            // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                            if (data.length < 6) {
                                $('#cargar-mas-informe').hide();
                            }

                            $("#informes #informecarta").filter(function () {

                                var tipo = $(this).find(".card-text:eq(2)").text();


                                return tipo === "pendiente";
                            }).find("#btresuelta").css({ "display": "block" });

                            $("#informes #informecarta").filter(function () {

                                var tipo = $(this).find(".card-text:eq(2)").text();

                                return tipo === "pendiente";
                            }).find("#btpendiente").css({ "display": "none" });



                            $("#informes #informecarta").filter(function () {

                                var tipo = $(this).find(".card-text:eq(2)").text();


                                return tipo === "resuelta";
                            }).find("#btresuelta").css({ "display": "none" });

                            $("#informes #informecarta").filter(function () {

                                var tipo = $(this).find(".card-text:eq(2)").text();


                                return tipo === "resuelta";
                            }).find("#btpendiente").css({ "display": "block" });
                        }
                    });
                });


                $("#informes").on("click", "#resuelta", function () {
                    var cod = $(this).parents("#btresuelta").find('input[type="button"]').attr('name');
                    console.log(cod);

                    $.ajax({
                        url: 'php/informes/cambiarestado.php?id=' + cod,
                        type: "GET",
                        success: function (data) {
                            console.log(data);
                            if (data == "added") {
                                Actualizar(datos);

                                $.ajax({
                                    type: "GET",
                                    url: "php/discordbot.php?estado=pendiente",
                                    success: function (datos) {
        
                                    }
                                });
                            }

                        }
                    });
                })



                $("#informes").on("click", "#pendiente", function () {
                    var cod = $(this).parents("#btpendiente").find('input[type="button"]').attr('name');
                    console.log(cod);

                    $.ajax({
                        url: 'php/informes/cambiarestado.php?id=' + cod,
                        type: "GET",
                        success: function (data) {
                            console.log(data);
                            if (data == "added") {
                                Actualizar(datos);

                                $.ajax({
                                    type: "GET",
                                    url: "php/discordbot.php?estado=resolver",
                                    success: function (datos) {
        
                                    }
                                });
                            }

                        }
                    });
                })

            }
            //Menu de No artistas
            else if (datos == "3") {
                Eliminar(datos);
                RellenaUsuarios();
                AddInforme(datos);
                CloseDialogo();

                $.ajax({
                    url: 'php/informes/showinformewithuser.php',
                    dataType: 'json',
                    success: function (data) {
                        // Mostrar los primeros 6 productos
                        // Mostrar los siguientes 6 productos
                        for (var i = 0; i < data.length; i++) {
                            var informe = data[i];

                            $('<div id="informecarta" class="card my-3"><div class="card-header"><p class="card-text">El usuario <a href="#">' + informe.usuarioreporta + '</a> reporta al usuario <a href="#">' + informe.usuario + '</a></p></div><div class="card-body"><p class="card-text">' + informe.informe + '</p></div><div class="card-footer"><p class="card-text">' + informe.estado + '</p></div><div id="bteliminar" class="card-footer"><input id="borrar" type="button" name="' + informe.id + '" value="Cancelar solicitud"></div></div>').appendTo("#informes");

                        }
                        // Mostrar el botón para cargar más productos si hay más de 6 productos
                        if (data.length >= 6) {
                            $('#cargar-mas-informe').show();
                        }
                    }
                });

                // Cuando se hace clic en el botón "Cargar más productos", cargar los siguientes 6 productos
                $('#cargar-mas-informe').click(function () {
                    // Obtener el número de productos ya mostrados

                    var num_productos_mostrados = $('#informes div#informecarta').length;

                    // Cargar los siguientes 6 productos
                    $.ajax({
                        url: 'php/informes/showinformewithuser.php',
                        data: {
                            offset: num_productos_mostrados,
                            limit: 6
                        },
                        dataType: 'json',
                        success: function (data) {
                            // Mostrar los siguientes 6 productos
                            for (var i = 0; i < data.length; i++) {
                                var informe = data[i];

                                $('<div id="informecarta" class="card my-3"><div class="card-header"><p class="card-text">El usuario <a href="#">' + informe.usuarioreporta + '</a> reporta al usuario <a href="#">' + informe.usuario + '</a></p></div><div class="card-body"><p class="card-text">' + informe.informe + '</p></div><div class="card-footer"><p class="card-text">' + informe.estado + '</p></div><div id="bteliminar" class="card-footer"><input id="borrar" type="button" name="' + informe.id + '" value="Cancelar solicitud"></div></div>').appendTo("#informes");

                            }

                            // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                            if (data.length < 6) {
                                $('#cargar-mas-informe').hide();
                            }
                        }
                    });
                });

            }
            //Menu adminsitradores de eventos
            else if (datos == "4") {
                Eliminar(datos);
                RellenaUsuarios();
                AddInforme(datos);
                CloseDialogo();

                $.ajax({
                    url: 'php/informes/showinformewithuser.php',
                    dataType: 'json',
                    success: function (data) {
                        // Mostrar los primeros 6 productos
                        // Mostrar los siguientes 6 productos
                        for (var i = 0; i < data.length; i++) {
                            var informe = data[i];

                            $('<div id="informecarta" class="card my-3"><div class="card-header"><p class="card-text">El usuario <a href="#">' + informe.usuarioreporta + '</a> reporta al usuario <a href="#">' + informe.usuario + '</a></p></div><div class="card-body"><p class="card-text">' + informe.informe + '</p></div><div class="card-footer"><p class="card-text">' + informe.estado + '</p></div><div id="bteliminar" class="card-footer"><input id="borrar" type="button" name="' + informe.id + '" value="Cancelar solicitud"></div></div>').appendTo("#informes");

                        }
                        // Mostrar el botón para cargar más productos si hay más de 6 productos
                        if (data.length >= 6) {
                            $('#cargar-mas-informe').show();
                        }
                    }
                });

                // Cuando se hace clic en el botón "Cargar más productos", cargar los siguientes 6 productos
                $('#cargar-mas-informe').click(function () {
                    // Obtener el número de productos ya mostrados

                    var num_productos_mostrados = $('#informes div#informecarta').length;

                    // Cargar los siguientes 6 productos
                    $.ajax({
                        url: 'php/informes/showinformewithuser.php',
                        data: {
                            offset: num_productos_mostrados,
                            limit: 6
                        },
                        dataType: 'json',
                        success: function (data) {
                            // Mostrar los siguientes 6 productos
                            for (var i = 0; i < data.length; i++) {
                                var informe = data[i];

                                $('<div id="informecarta" class="card my-3"><div class="card-header"><p class="card-text">El usuario <a href="#">' + informe.usuarioreporta + '</a> reporta al usuario <a href="#">' + informe.usuario + '</a></p></div><div class="card-body"><p class="card-text">' + informe.informe + '</p></div><div class="card-footer"><p class="card-text">' + informe.estado + '</p></div><div id="bteliminar" class="card-footer"><input id="borrar" type="button" name="' + informe.id + '" value="Cancelar solicitud"></div></div>').appendTo("#informes");

                            }

                            // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                            if (data.length < 6) {
                                $('#cargar-mas-informe').hide();
                            }
                        }
                    });
                });

            }





        },
    });


    function Eliminar(tipo) {
        $("#informes").on("click", "#borrar", function () {

            var cod = $(this).parents("#bteliminar").find('input[type="button"]').attr('name');
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
                            //console.log(cod);
                            $.ajax({
                                type: "GET",
                                url: "php/informes/deleteinforme.php?id=" + cod,
                                success: function (datos) {
                                    Actualizar(tipo);
                                    $.ajax({
                                        type: "GET",
                                        url: "php/discordbot.php?estado=eliminar",
                                        success: function (datos) {
            
                                        }
                                    });
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

    function RellenaUsuarios() {
        $.ajax({
            type: "GET",
            url: "php/showuserswithoutadmina.php",
            success: function (datos) {
                var listado1 = jQuery.parseJSON(datos);
                for (var x of listado1) {
                    $("<option value='" + x.id + "'>" + x.usuario + "</option>").appendTo("form#addinforme #usuariotarget");

                }


            }
        });
    }

    function CloseDialogo() {
        $("body").on("click", "#close", function () {
            $("#addform").css({ "display": "none" });

        })
    }


    function Actualizar(tipo) {
        $("#informes").empty();

        if (tipo == "2") {
            $.ajax({
                url: 'php/informes/showinforme.php',
                dataType: 'json',
                success: function (data) {

                    // Mostrar los primeros 6 productos
                    // Mostrar los siguientes 6 productos
                    for (var i = 0; i < data.length; i++) {
                        var informe = data[i];

                        $('<div id="informecarta" class="card my-3"><div class="card-header"><p class="card-text">El usuario <a href="#">' + informe.usuarioreporta + '</a> reporta al usuario <a href="#">' + informe.usuario + '</a></p></div><div class="card-body"><p class="card-text">' + informe.informe + '</p></div><div class="card-footer"><p class="card-text">' + informe.estado + '</p></div><div id="btpendiente" class="card-footer"><input id="pendiente" type="button" name="' + informe.id + '" value="Pendiente"></div><div id="btresuelta" class="card-footer"><input id="resuelta" type="button" name="' + informe.id + '" value="Resuelta"></div><div id="bteliminar" class="card-footer"><input id="borrar" type="button" name="' + informe.id + '" value="Eliminar"></div></div>').appendTo("#informes");

                    }
                    // Mostrar el botón para cargar más productos si hay más de 6 productos
                    if (data.length >= 6) {
                        $('#cargar-mas-informe').show();
                    }

                    $("#informes #informecarta").filter(function () {

                        var tipo = $(this).find(".card-text:eq(2)").text();


                        return tipo === "pendiente";
                    }).find("#btresuelta").css({ "display": "block" });

                    $("#informes #informecarta").filter(function () {

                        var tipo = $(this).find(".card-text:eq(2)").text();

                        return tipo === "pendiente";
                    }).find("#btpendiente").css({ "display": "none" });



                    $("#informes #informecarta").filter(function () {

                        var tipo = $(this).find(".card-text:eq(2)").text();


                        return tipo === "resuelta";
                    }).find("#btresuelta").css({ "display": "none" });

                    $("#informes #informecarta").filter(function () {

                        var tipo = $(this).find(".card-text:eq(2)").text();


                        return tipo === "resuelta";
                    }).find("#btpendiente").css({ "display": "block" });
                }
            });
        }
        else {
            $.ajax({
                url: 'php/informes/showinformewithuser.php',
                dataType: 'json',
                success: function (data) {
                    // Mostrar los primeros 6 productos
                    // Mostrar los siguientes 6 productos
                    for (var i = 0; i < data.length; i++) {
                        var informe = data[i];

                        $('<div id="informecarta" class="card my-3"><div class="card-header"><p class="card-text">El usuario <a href="#">' + informe.usuarioreporta + '</a> reporta al usuario <a href="#">' + informe.usuario + '</a></p></div><div class="card-body"><p class="card-text">' + informe.informe + '</p></div><div class="card-footer"><p class="card-text">' + informe.estado + '</p></div><div id="bteliminar" class="card-footer"><input id="borrar" type="button" name="' + informe.id + '" value="Cancelar solicitud"></div></div>').appendTo("#informes");

                    }
                    // Mostrar el botón para cargar más productos si hay más de 6 productos
                    if (data.length >= 6) {
                        $('#cargar-mas-informe').show();
                    }
                }
            });
        }


    }

    function AddInforme(tipo) {

        $("body").on("click", "button#addinforme", function () {
            $("#addform").css({ "display": "block" });
        })


        // console.log("CLICK");
        $("form#addinforme").on("click", "#btadd", function () {
            // console.log("AÑADIDO");
            data = $("form#addinforme").serialize();
            //console.log(data);
            $.ajax({
                type: "GET",
                url: "php/informes/addinforme.php",
                data: data,
                success: function (datos) {
                    console.log(datos);
                    if (datos == "added") {
                        if (tipo == 2) {
                            $("#addform #id_usuarioselect").prop('selectedIndex', 0);
                        }
                        $("#addform #informe").val("");
                        $("#addform #usuariotarget").prop('selectedIndex', 0);
                        Actualizar(tipo);
                        $("#addform").css({ "display": "none" });
                        console.log(data);
                        //AQUI SE LLAMA AL PHP QUE EJECUTA LA API DE DISCORD
                        $.ajax({
                            type: "GET",
                            url: "php/discordbot.php?estado=agregar",
                            data: data,
                            success: function (datos) {

                            }
                        });




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

                                        $(this).dialog("close");
                                    },

                                },
                                close: function () {
                                    // Si se cierra el diálogo, quitarlo del DOM
                                    $(this).remove();
                                }
                            });
                    }

                    else if (datos == "error2" || datos == "") {
                        $("<div></div>").appendTo("body")
                            .html("<div><h3>No te puedes reportar a ti mismo</h3></div>")
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

                    


                }
            })
        });
    }


});