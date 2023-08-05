
$(document).ready(function () {
    
    //Validaciones de campos
    $("#addform #titulo").on("input blur", function() {

        if ($("#addform #titulo").val() == "" || $("#addform #titulo").val().length >= 50 || $("#addform #titulo").val().trim() === "") {
            $("#addform #titulo").css({ "background-color": "red" })


        }
        else {
            $("#addform #titulo").css({ "background-color": "" })

        }

    })
    $("#addform #aviso").on("input blur", function() {
        if ($("#addform #aviso").val() == "" || $("#addform #aviso").val().length >= 144 || $("#addform #aviso").val().trim() === "") {
            $("#addform #aviso").css({ "background-color": "red" })
        }
        else {
            $("#addform #aviso").css({ "background-color": "" })

        }

    })


    $("#editform #aviso").on("input blur", function() {
        if ($("#editform #aviso").val() == "" || $("#editform #aviso").val().length >= 144 || $("#editform #aviso").val().trim() === "") {
            $("#editform #aviso").css({ "background-color": "red" })
        }
        else {
            $("#editform #aviso").css({ "background-color": "" })

        }

    })

    $("#editform #titulo").on("input blur", function() {

        if ($("#editform #titulo").val() == "" || $("#editform #titulo").val().length >= 50 || $("#editform #titulo").val().trim() === "") {
            $("#editform #titulo").css({ "background-color": "red" })


        }
        else {
            $("#editform #titulo").css({ "background-color": "" })

        }

    })

    //Segun el tipo de sesion se muestran una estructura de tarjetas de eventos o otras 1=artistas 2=Administrador 3=Visitante 4=Administrador de eventos
    //Tambien segun el tipo de sesion se hacen unas acciones u otras
    $.ajax({
        type: "GET",
        url: "php/sesion.php",
        success: function (datos) {
            console.log(datos);
            //menu de artistas
            if (datos == "1") {

                $("#avisos").css({ "display": "none" })
                $('<button type="button" id="anadir">Añadir</button>').appendTo("#avisoscreados");
                // Obtener los primeros 6 productos al cargar la página
                $.ajax({
                    url: 'php/avisos/shiwavisousercargar.php',
                    dataType: 'json',
                    success: function (data) {
                        // Mostrar los primeros 6 productos
                        // Mostrar los siguientes 6 productos
                        for (var i = 0; i < data.length; i++) {
                            var aviso = data[i];
                            var fechapubli = aviso.fecha_publicacion; // supongamos que esta es tu fecha en formato ISO
                            var fechapubliformat = moment(fechapubli).format("DD/MM/YYYY");
                            $('<div id="avisocarta" class="card my-3"><div class="card-header"><h5 class="card-title">' + aviso.titulo + '</h5><p class="card-text">Por <a href="#">' + aviso.usuario + '</a> el <span class="text-muted">' + fechapubliformat + '</span></p></div><div class="card-body"><p class="card-text">' + aviso.aviso + '</p></div><div id="bteliminar" class="card-footer"><input id="borrar" type="button" name="' + aviso.id + '" value="Eliminar"></div></div>').appendTo("#avisoscreados");

                        }
                        // Mostrar el botón para cargar más productos si hay más de 6 productos
                        if (data.length >= 6) {
                            $('#cargar-mas-aviso').show();
                        }
                    }
                });

                // Cuando se hace clic en el botón "Cargar más productos", cargar los siguientes 6 productos
                $('#cargar-mas-aviso').click(function () {
                    // Obtener el número de productos ya mostrados

                    var num_productos_mostrados = $('#avisoscreados div#avisocarta').length;

                    // Cargar los siguientes 6 productos
                    $.ajax({
                        url: 'php/avisos/shiwavisousercargar.php',
                        data: {
                            offset: num_productos_mostrados,
                            limit: 6
                        },
                        dataType: 'json',
                        success: function (data) {
                            // Mostrar los siguientes 6 productos
                            for (var i = 0; i < data.length; i++) {
                                var aviso = data[i];
                                var fechapubli = aviso.fecha_publicacion; // supongamos que esta es tu fecha en formato ISO
                                var fechapubliformat = moment(fechapubli).format("DD/MM/YYYY");
                                $('<div id="avisocarta" class="card my-3"><div class="card-header"><h5 class="card-title">' + aviso.titulo + '</h5><p class="card-text">Por <a href="#">' + aviso.usuario + '</a> el <span class="text-muted">' + fechapubliformat + '</span></p></div><div class="card-body"><p class="card-text">' + aviso.aviso + '</p></div><div id="bteliminar" class="card-footer"><input id="borrar" type="button" name="' + aviso.id + '" value="Eliminar"></div></div>').appendTo("#avisoscreados");

                            }

                            // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                            if (data.length < 6) {
                                $('#cargar-mas-aviso').hide();
                            }
                        }
                    });
                });





                //Actualizar(datos, "#avisoscreados");
                AddAviso("#addform", datos, "#avisoscreados");
                CloseDialogo();
                MostrarDialogo();
                Eliminar("#avisoscreados", datos);
            }
            //Menu de Administradores
            else if (datos == "2") {

                $("#cargar-mas-aviso").css({ "display": "none" })
                cargarDatos(1);
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
                var cod;
                //Actualizar(datos, "#avisos");
                AddAviso("#addform", datos, "#avisos");
                CloseDialogo();
                MostrarDialogo();
                Eliminar("#avisos", datos);
                $("<select name='id_usuario' id='id_usuario'></select>").prependTo("#addaviso");
                $("<select name='id_usuario' id='id_usuario'></select>").prependTo("#editaviso");

                RellenaUsuarios();

                $("#avisos").on("click", "#editar", function () {
                    $("#editform").css({ "display": "block" });
                    cod = $(this).parents("#avisos td").find('input[type="button"]').attr('name');
                    $.ajax({
                        type: "GET",
                        url: "php/avisos/findaviso.php?id=" + cod,
                        success: function (datos) {
                            //console.log(cod);

                            var pedidos = jQuery.parseJSON(datos);
                            for (var x of pedidos) {
                                $("#editaviso").find("input[type='text']:eq(0)").val(x.titulo);
                                $("#editaviso").find("input[type='text']:eq(1)").val(x.aviso);
                                $("#editaviso #id_usuario").val(x.id_usuario);


                            }


                        },
                    });
                })

                $("#editform").on("click", "#btedit", function () {
                    //console.log("EDITADO");
                    data = $("form#editaviso").serialize();
                    //console.log(data);
                    //console.log(cod);

                    $.ajax({
                        type: "GET",
                        url: "php/avisos/editaviso.php?id=" + cod,
                        data: data,
                        success: function (datos1) {
                            if (datos1 == "added") {
                                $("#editform").css({ "display": "none" });
                                cargarDatos(1);

                                //console.log(datos1);

                            }
                            else if (datos1 == "error1" || datos1 == "") {
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
                                    .html("<div><h3>Se ha llegado al máximo de carácteres</h3></div>")
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
            //Menu de No artistas
            else if (datos == "3") {

                window.location.href = "index.html";

            }
            //Menu adminsitradores de eventos
            else if (datos == "4") {
                $("#avisos").css({ "display": "none" })
                //Actualizar(datos, "#avisoscreados");
                AddAviso("#addform", datos, "#avisoscreados");
                CloseDialogo();
                MostrarDialogo();
                Eliminar("#avisoscreados", datos);
                $('<button type="button" id="anadir">Añadir</button>').appendTo("#avisoscreados");
                // Obtener los primeros 6 productos al cargar la página
                $.ajax({
                    url: 'php/avisos/shiwavisousercargar.php',
                    dataType: 'json',
                    success: function (data) {
                        // Mostrar los primeros 6 productos
                        // Mostrar los siguientes 6 productos
                        for (var i = 0; i < data.length; i++) {
                            var aviso = data[i];
                            var fechapubli = aviso.fecha_publicacion; // supongamos que esta es tu fecha en formato ISO
                            var fechapubliformat = moment(fechapubli).format("DD/MM/YYYY");
                            $('<div id="avisocarta" class="card my-3"><div class="card-header"><h5 class="card-title">' + aviso.titulo + '</h5><p class="card-text">Por <a href="#">' + aviso.usuario + '</a> el <span class="text-muted">' + fechapubliformat + '</span></p></div><div class="card-body"><p class="card-text">' + aviso.aviso + '</p></div><div id="bteliminar" class="card-footer"><input id="borrar" type="button" name="' + aviso.id + '" value="Eliminar"></div></div>').appendTo("#avisoscreados");

                        }
                        // Mostrar el botón para cargar más productos si hay más de 6 productos
                        if (data.length >= 6) {
                            $('#cargar-mas-aviso').show();
                        }
                    }
                });

                // Cuando se hace clic en el botón "Cargar más productos", cargar los siguientes 6 productos
                $('#cargar-mas-aviso').click(function () {
                    // Obtener el número de productos ya mostrados

                    var num_productos_mostrados = $('#avisoscreados div#avisocarta').length;

                    // Cargar los siguientes 6 productos
                    $.ajax({
                        url: 'php/avisos/shiwavisousercargar.php',
                        data: {
                            offset: num_productos_mostrados,
                            limit: 6
                        },
                        dataType: 'json',
                        success: function (data) {
                            // Mostrar los siguientes 6 productos
                            for (var i = 0; i < data.length; i++) {
                                var aviso = data[i];
                                var fechapubli = aviso.fecha_publicacion; // supongamos que esta es tu fecha en formato ISO
                                var fechapubliformat = moment(fechapubli).format("DD/MM/YYYY");
                                $('<div id="avisocarta" class="card my-3"><div class="card-header"><h5 class="card-title">' + aviso.titulo + '</h5><p class="card-text">Por <a href="#">' + aviso.usuario + '</a> el <span class="text-muted">' + fechapubliformat + '</span></p></div><div class="card-body"><p class="card-text">' + aviso.aviso + '</p></div><div id="bteliminar" class="card-footer"><input id="borrar" type="button" name="' + aviso.id + '" value="Eliminar"></div></div>').appendTo("#avisoscreados");

                            }

                            // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                            if (data.length < 6) {
                                $('#cargar-mas-aviso').hide();
                            }
                        }
                    });
                });

            }
        }
    });




    //PAGINACION DE TABLA ADMINISTRADOR 

    function cargarDatos(pagina) {
        var $tabla = $('#avisos');
        var $paginacion = $('#paginacion');
        $.ajax({
            url: 'php/avisos/showavisoadmin.php',
            data: { offset: (pagina - 1) * 6, limit: 6 },
            dataType: 'json',
            success: function (response) {
                var datos = response.data;
                var totalPaginas = response.totalPaginas;
                var htmlTabla = '';
                for (var i = 0; i < datos.length; i++) {
                    var fechapubli = datos[i].fecha_publicacion; // supongamos que esta es tu fecha en formato ISO
                    var fechapubliformat = moment(fechapubli).format("DD/MM/YYYY");
                    htmlTabla += '<tr>';
                    htmlTabla += '<td>' + datos[i].id + '</td>';
                    htmlTabla += '<td>' + datos[i].titulo + '</td>';
                    htmlTabla += '<td>' + datos[i].aviso + '</td>';
                    htmlTabla += '<td>' + fechapubliformat + '</td>';
                    htmlTabla += '<td>' + datos[i].usuario + '</td>';
                    htmlTabla += '<td><input type="button" data-id="' + datos[i].id + '" id="borrar" name="' + datos[i].id + '" value="Eliminar"></td>';
                    htmlTabla += '<td><input type="button" id="editar" data-id="' + datos[i].id + '" name="' + datos[i].id + '" value="Editar"></td>';
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



    //FIN PAGINACION DE TABLA ADMINISTRADOR 













    function RellenaUsuarios() {
        $.ajax({
            type: "GET",
            url: "php/showusers.php",
            success: function (datos) {
                var listado1 = jQuery.parseJSON(datos);
                for (var x of listado1) {
                    $("<option value='" + x.id + "'>" + x.usuario + "</option>").appendTo("#editform #id_usuario");
                    $("<option value='" + x.id + "'>" + x.usuario + "</option>").appendTo("#addform #id_usuario");

                }


            }
        });
    }

    function CloseDialogo() {
        $("body").on("click", "#close", function () {
            $("#addform").css({ "display": "none" });
            $("#editform").css({ "display": "none" });

        })
    }

    function MostrarDialogo() {
        $("body").on("click", "#anadir", function () {

            $("#addform").css({ "display": "block" });
        })

        $("body").on("click", "#editar", function () {

            $("#editform").css({ "display": "block" });
        })
    }
    function AddAviso(target, tipo, targetact) {

        // console.log("CLICK");
        $(target).on("click", "#btadd", function () {
            // console.log("AÑADIDO");
            data = $("form#addaviso").serialize();
            $.ajax({
                type: "GET",
                url: "php/avisos/addaviso.php",
                data: data,
                success: function (datos) {
                    if (datos == "added") {
                        $("#addform").css({ "display": "none" });
                        if (tipo == 2) {
                            cargarDatos(1);
                            $("#addform #id_usuario").prop('selectedIndex', 0);
                        }
                        else{
                            Actualizar(tipo, targetact);

                        }
                        
                        $("#addform #titulo").val("");
                        $("#addform #aviso").val("");
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
                            .html("<div><h3>Se ha llegado al máximo de carácteres</h3></div>")
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

    function Eliminar(target, tipo) {
        $(target).on("click", "#borrar", function () {


            if (tipo == 2) {
                var cod = $(this).parents(target + " td").find('input[type="button"]').attr('name');

            }
            else {
                var cod = $(this).parents("#bteliminar").find('input[type="button"]').attr('name');

            }

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
                                url: "php/avisos/deleteaviso.php?id=" + cod,
                                success: function (datos) {

                                    if (tipo == 2) {
                                        cargarDatos(1);

                                    }
                                    else {
                                        Actualizar(tipo, target)

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




    function Actualizar(tipo, target) {


        $(target).empty();

        $('<button type="button" id="anadir">Añadir</button>').appendTo(target);
        // Obtener los primeros 6 productos al cargar la página
        $.ajax({
            url: 'php/avisos/shiwavisousercargar.php',
            dataType: 'json',
            success: function (data) {
                // Mostrar los primeros 6 productos
                // Mostrar los siguientes 6 productos
                for (var i = 0; i < data.length; i++) {
                    var aviso = data[i];
                    var fechapubli = aviso.fecha_publicacion; // supongamos que esta es tu fecha en formato ISO
                    var fechapubliformat = moment(fechapubli).format("DD/MM/YYYY");
                    $('<div id="avisocarta" class="card my-3"><div class="card-header"><h5 class="card-title">' + aviso.titulo + '</h5><p class="card-text">Por <a href="#">' + aviso.usuario + '</a> el <span class="text-muted">' + fechapubliformat + '</span></p></div><div class="card-body"><p class="card-text">' + aviso.aviso + '</p></div><div id="bteliminar" class="card-footer"><input id="borrar" type="button" name="' + aviso.id + '" value="Eliminar"></div></div>').appendTo("#avisoscreados");

                }
                // Mostrar el botón para cargar más productos si hay más de 6 productos
                if (data.length >= 6) {
                    $('#cargar-mas-aviso').show();
                }
            }
        });

    }
});