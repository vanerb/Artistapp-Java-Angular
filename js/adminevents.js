
$(document).ready(function () {

    



    $("#addform #nombre").on("input blur", function() {
        if ($("#addform #nombre").val() == "" || $("#addform #nombre").val().length >= 80 || $("#addform #nombre").val().trim() === "") {
            $("#addform #nombre").css({ "background-color": "red" })
        }
        else {
            $("#addform #nombre").css({ "background-color": "" })
        }

    })
    $("#addform #ubicacion").on("input blur", function() {
        if ($("#addform #ubicacion").val().length >= 80) {
            $("#addform #ubicacion").css({ "background-color": "red" })
        }
        else {
            $("#addform #ubicacion").css({ "background-color": "" })

        }
    })
    $("#addform #link").on("input blur", function() {
        if ($("#addform #link").val().length >= 244) {
            $("#addform #link").css({ "background-color": "red" })
        }
        else {
            $("#addform #link").css({ "background-color": "" })

        }
    })
    $("#addform #fechainicio").on("input blur", function() {
        if ($("#addform #fechainicio").val() == "") {
            $("#addform #fechainicio").css({ "background-color": "red" })
        }
        else {
            $("#addform #fechainicio").css({ "background-color": "" })
        }

    })

    $("#addform #fechafin").on("input blur", function() {
        if ($("#addform #fechafin").val() == "") {
            $("#addform #fechafin").css({ "background-color": "red" })
        }
        else {
            $("#addform #fechafin").css({ "background-color": "" })
        }

    })


    $("#editform #nombre").on("input blur", function() {
        if ($("#editform #nombre").val() == "" || $("#editform #nombre").val().length >= 80 || $("#editform #nombre").val().trim() === "") {
            $("#editform #nombre").css({ "background-color": "red" })
        }
        else {
            $("#editform #nombre").css({ "background-color": "" })
        }

    })
    $("#editform #fechainicio").on("input blur", function() {
        if ($("#editform #fechainicio").val() == "") {
            $("#editform #fechainicio").css({ "background-color": "red" })
        }
        else {
            $("#editform #fechainicio").css({ "background-color": "" })
        }

    })

    $("#editform #fechafin").on("input blur", function() {
        if ($("#editform #fechafin").val() == "") {
            $("#editform #fechafin").css({ "background-color": "red" })
        }
        else {
            $("#editform #fechafin").css({ "background-color": "" })
        }

    })

    $("#editform #ubicacion").on("input blur", function() {
        if ($("#editform #ubicacion").val().length >= 80) {
            $("#editform #ubicacion").css({ "background-color": "red" })
        }
        else {
            $("#editform #ubicacion").css({ "background-color": "" })

        }
    })
    $("#editform #link").on("input blur", function() {
        if ($("#editform #link").val().length >= 244) {
            $("#editform #link").css({ "background-color": "red" })
        }
        else {
            $("#editform #link").css({ "background-color": "" })

        }
    })

    




    var cod;

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

                $("#addbutton").css({"display":"none"});
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
            

                //MostrarDatos("#eventos", datos);
                OcultarDialogo();
                CloseDialogo();

                AddEvent(datos, "#addform");

                MostrarEvent();

                DeleteEvent(datos, "#eventos")

                if (datos == 2) {
                    $("<label for='id_usuario'>Usuario</label><select name='id_usuario' id='id_usuario'></select>").prependTo("#addevento");
                    $.ajax({
                        type: "GET",
                        url: "php/eventos/showusers.php",
                        success: function (datos) {
                            var eventosuser = jQuery.parseJSON(datos);
                            for (var x of eventosuser) {
                                $("<option value='" + x.id + "'>" + x.usuario + "</option>").appendTo("#addevento select#id_usuario");
                                $("#id_usuario").val(x.id);
                            }
                        },
                    });
                    $("<label for='id_usuario'>Usuario</label><select name='id_usuario' id='id_usuario'></select>").prependTo("#editevento");

                    $.ajax({
                        type: "GET",
                        url: "php/eventos/showusers.php",
                        success: function (datos) {
                            var eventosuser = jQuery.parseJSON(datos);
                            for (var x of eventosuser) {
                                $("<option value='" + x.id + "'>" + x.usuario + "</option>").appendTo("#editevento select#id_usuario");
                                $("#id_usuario").val(x.id);
                            }
                        },
                    });
                }

                Buscar("#eventos", datos);
                EditEvent(datos, "#editform");
                var cod;
                $("#admineventos").on("click", "#eliminarlista", function () {
                    var codi = $(this).attr('name');
                    console.log(codi);
                    $.ajax({
                        type: "GET",
                        url: "php/eventos/exiteventwithuser.php?id_evento=" + cod + "&id_user=" + codi,
                        success: function (datos) {

                            ActualizarListado();
                        }
                    });
                })

                var coduser;
                $("#admineventos").on("click", "#aceptarlista", function () {
                    var codi = $(this).attr('name');
                    coduser = codi;
                    //  console.log(codi);
                    $.ajax({
                        type: "GET",
                        url: "php/eventos/modificaestado.php?id_evento=" + cod + "&id_user=" + codi,
                        success: function (datos) {

                            ActualizarListado();

                        }
                    });
                })

                $("<button type='button' id='mostrarentradas'>Mostrar nuevas entradas</button>").appendTo("#admineventos #detalles");
                $("<button type='button' id='mostrarusuarios'>Mostrar los usuarios</button>").appendTo("#admineventos #detalles");

                $("#admineventos #detalles").on("click", "#mostrarentradas", function () {
                    $("#admineventos #titulo").empty();
                    $("#admineventos #detalles ul").empty();
                    ActualizarListado();

                })

                $("#admineventos #detalles").on("click", "#mostrarusuarios", function () {
                    $("#admineventos #detalles ul").empty();
                    $("#admineventos #titulo").empty();
                    VerUsuariosEliminar();
                });
                $("#admineventos #mostrarentradas").css({ "margin": "20px" })



                function ActualizarListado() {
                    $("#admineventos #detalles ul").empty();
                    $("#admineventos #titulo").empty();
                    $.ajax({
                        type: "GET",
                        url: "php/eventos/showlistaforacept.php?id=" + cod,
                        success: function (datos) {
                            var listado = jQuery.parseJSON(datos);
                            var nombre;
                            for (var x of listado) {
                                // console.log(x.estado);
                                nombre = x.evento_nombre;
                                console.log(cod);
                                console.log(coduser);
                                $('<li class="list-group-item">' + x.usuario + ' <div id="bteliminarlista"><input id="eliminarlista" type="button" name="' + x.id + '" value="Eliminar"></div><div id="btaceptarlista"><input id="aceptarlista" type="button" name="' + x.id + '" value="Aceptar"></div></li>').appendTo("#admineventos #detalles ul");

                            }


                            if (nombre != null) {
                                $('<h1 class="display-4">' + nombre + '</h1>').appendTo("#admineventos #titulo");

                            }
                            else {
                                $("#admineventos #titulo").empty();

                                $("<h1>No hay nuevas entradas</h1>").appendTo("#admineventos #titulo");
                            }



                        }
                    });
                }


                function VerUsuariosEliminar() {
                    $.ajax({
                        type: "GET",
                        url: "php/eventos/showlist.php?id=" + cod,
                        success: function (datos) {
                            var listado = jQuery.parseJSON(datos);
                            var nombre;
                            for (var x of listado) {
                                nombre = x.evento_nombre;
                                $('<li class="list-group-item">' + x.usuario + '<div id="bteliminarlista"><input id="eliminarlista" type="button" name="' + x.id + '" value="Eliminar"></div></li>').appendTo("#admineventos #detalles ul");
                            }
                            if (nombre != null) {
                                $('<h1 class="display-4">' + nombre + '</h1>').appendTo("#admineventos #titulo");

                            }
                            else {

                                $("#titulo").empty();
                                $("<h1>Sin participantes</h1>").appendTo("#admineventos #titulo");



                            }

                        }
                    });
                }


                $("#eventos").on("click", "#verdetalles", function () {
                    $("#admineventos #detalles ul").empty();
                    $("#admineventos #titulo").empty();
                    cod = $(this).parents("#eventos td").find('input[type="button"]').attr('name');
                    $("#admineventos #showEvent").css({ "display": "block" });
                    $.ajax({
                        type: "GET",
                        url: "php/eventos/showlistaforacept.php?id=" + cod,
                        success: function (datos) {
                            var listado = jQuery.parseJSON(datos);
                            var nombre;
                            for (var x of listado) {
                                nombre = x.evento_nombre;
                                $('<li class="list-group-item">' + x.usuario + ' <div id="bteliminarlista"><input id="eliminarlista" type="button" name="' + x.id + '" value="Eliminar"></div><div id="btaceptarlista"><input id="aceptarlista" type="button" name="' + x.id + '" value="Aceptar"></div></li>').appendTo("#admineventos #detalles ul");



                            }

                            if (nombre != null) {
                                $('<h1 class="display-4">' + nombre + '</h1>').appendTo("#admineventos #titulo");

                            }
                            else {

                                $("#admineventos #titulo").empty();
                                $("<h1>No hay nuevas entradas</h1>").appendTo("#admineventos #titulo");
                            }

                        }
                    });
                })


            }
            //Menu de No artistas
            else if (datos == "3") {
                window.location.href = "index.html";

            }
            //Menu adminsitradores de eventos
            else if (datos == "4") {


                $("#addbutton").css({"display":"block"});

                $("#eventos").css({"display":"none"});




                // Obtener los primeros 6 productos al cargar la página
                $.ajax({
                    url: 'php/eventos/showeventadminusercargar.php',
                    dataType: 'json',
                    success: function (data) {
                        // Mostrar los primeros 6 productos
                        // Mostrar los siguientes 6 productos
                        for (var i = 0; i < data.length; i++) {
                            var event = data[i];
                            var fechaini = event.fecha_inicio; // supongamos que esta es tu fecha en formato ISO
                            var fechainicioformat = moment(fechaini).format("DD/MM/YYYY");

                            var fechafin = event.fecha_fin; // supongamos que esta es tu fecha en formato ISO
                            var fechafinformat = moment(fechafin).format("DD/MM/YYYY");

                            var fechaActual = new Date();

                            var fechaFormateada = moment(fechaActual).format("DD/MM/YYYY");

                            //$('<div class="card h-100"><img class="card-img-top" src="' + x.imagen + '" width="400px" height="250px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + x.nombre + '</h4><p class="card-text">' + x.ubicacion + '</p></div><div class="card-footer"><small class="text-muted">' + x.link + '</small></div><div class="card-footer"><small class="text-muted">Fecha inicio: ' + x.fecha_inicio + '</small></div><div class="card-footer"><small class="text-muted">Fecha fin: ' + x.fecha_fin + '</small></div><div id="btentrar" class="card-footer"><input id="entrar" type="button" name="' + x.id + '" value="Entrar" class="btn btn-primary checkout-btn"></div><div id="btdetalles" class="card-footer"><input id="detalles" type="button" name="' + x.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div><div id="bteliminar" class="card-footer"><input type="button" id="borrar" name="' + x.id + '" value="Eliminar"></div></div>').appendTo(target);
                            $('<div id="eventcarta" class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">' + fechafinformat + '</small></p><div id="btentrar"><input id="entrar" type="button" name="' + event.id + '" value="Entrar" class="btn btn-primary checkout-btn"></div><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div><div id="bteditar"><input id="editar" type="button" name="' + event.id + '" value="Editar" class="btn btn-primary checkout-btn"></div>  <div id="bteliminar"><input type="button" id="borrar" name="' + event.id + '" value="Eliminar"></div></div></div>').appendTo("#showeventcreate");


                            $("#showeventcreate #eventcarta").filter(function () {
                                var fechaActual = new Date();

                                var fechafinformat = $(this).find(".text-muted:eq(2)").text();

                                var fechaFin = moment(fechafinformat, "DD/MM/YYYY").toDate();
                                return fechaActual > fechaFin;
                            }).css({ "background-color": "lightgrey" });

                           

                        }
                        // Mostrar el botón para cargar más productos si hay más de 6 productos
                        if (data.length >= 6) {
                            $('#cargar-mas-event').show();
                        }

                        $("#showeventcreate .card a").filter(function () {

                            var link = $(this).attr('href');
                            console.log(link);
            
                            return link == "Sin Link";
                        }).each(function () {
                            $(this).replaceWith("<p class='disabled-link'>Sin Link</p>");
                        });
                    }
                });

                // Cuando se hace clic en el botón "Cargar más productos", cargar los siguientes 6 productos
                $('#cargar-mas-event').click(function () {
                    // Obtener el número de productos ya mostrados

                    var num_productos_mostrados = $('#showeventcreate div#eventcarta').length;

                    // Cargar los siguientes 6 productos
                    $.ajax({
                        url: 'php/eventos/showeventadminusercargar.php',
                        data: {
                            offset: num_productos_mostrados,
                            limit: 6
                        },
                        dataType: 'json',
                        success: function (data) {
                            // Mostrar los siguientes 6 productos
                            for (var i = 0; i < data.length; i++) {
                                var event = data[i];
                                var fechaini = event.fecha_inicio; // supongamos que esta es tu fecha en formato ISO
                                var fechainicioformat = moment(fechaini).format("DD/MM/YYYY");

                                var fechafin = event.fecha_fin; // supongamos que esta es tu fecha en formato ISO
                                var fechafinformat = moment(fechafin).format("DD/MM/YYYY");

                                var fechaActual = new Date();

                                var fechaFormateada = moment(fechaActual).format("DD/MM/YYYY");

                                //$('<div class="card h-100"><img class="card-img-top" src="' + x.imagen + '" width="400px" height="250px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + x.nombre + '</h4><p class="card-text">' + x.ubicacion + '</p></div><div class="card-footer"><small class="text-muted">' + x.link + '</small></div><div class="card-footer"><small class="text-muted">Fecha inicio: ' + x.fecha_inicio + '</small></div><div class="card-footer"><small class="text-muted">Fecha fin: ' + x.fecha_fin + '</small></div><div id="btentrar" class="card-footer"><input id="entrar" type="button" name="' + x.id + '" value="Entrar" class="btn btn-primary checkout-btn"></div><div id="btdetalles" class="card-footer"><input id="detalles" type="button" name="' + x.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div><div id="bteliminar" class="card-footer"><input type="button" id="borrar" name="' + x.id + '" value="Eliminar"></div></div>').appendTo(target);
                                $('<div id="eventcarta" class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">' + fechafinformat + '</small></p><div id="btentrar"><input id="entrar" type="button" name="' + event.id + '" value="Entrar" class="btn btn-primary checkout-btn"></div><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div><div id="bteditar"><input id="editar" type="button" name="' + event.id + '" value="Editar" class="btn btn-primary checkout-btn"></div>  <div id="bteliminar"><input type="button" id="borrar" name="' + event.id + '" value="Eliminar"></div></div></div>').appendTo("#showeventcreate");


                                $("#showeventcreate #eventcarta").filter(function () {
                                    var fechaActual = new Date();

                                    var fechafinformat = $(this).find(".text-muted:eq(2)").text();

                                    var fechaFin = moment(fechafinformat, "DD/MM/YYYY").toDate();
                                    return fechaActual > fechaFin;
                                }).css({ "background-color": "lightgrey" });

                            }

                            // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                            if (data.length < 6) {
                                $('#cargar-mas-event').hide();
                            }

                            $("#showeventcreate .card a").filter(function () {

                                var link = $(this).attr('href');
                                console.log(link);
                
                                return link == "Sin Link";
                            }).each(function () {
                                $(this).replaceWith("<p class='disabled-link'>Sin Link</p>");
                            });
                        }
                    });
                });






















                //MostrarDatos("#showeventcreate", datos);
                OcultarDialogo();
                CloseDialogo();
                AddEvent(datos, "#addform");

                MostrarEvent();
                DeleteEvent(datos, "#showeventcreate")
                Buscar("#showeventcreate", datos);

                EditEvent(datos, "#editform");



                $("#eventoscreados").on("click", "#salir", function () {
                    $.ajax({
                        type: "GET",
                        url: "php/eventos/exitevent.php?id_evento=" + cod,
                        success: function (datos) {

                            ActualizarListado();
                        }
                    });
                })


                $("#eventoscreados").on("click", "#eliminarlista", function () {
                    var codi = $(this).attr('name');
                    // console.log(codi);
                    $.ajax({
                        type: "GET",
                        url: "php/eventos/exiteventwithuser.php?id_evento=" + cod + "&id_user=" + codi,
                        success: function (datos) {

                            ActualizarListado();
                        }
                    });
                })



                $("#eventoscreados").on("click", "#aceptarlista", function () {
                    var codi = $(this).attr('name');
                    console.log(codi);
                    $.ajax({
                        type: "GET",
                        url: "php/eventos/modificaestado.php?id_evento=" + cod + "&id_user=" + codi,
                        success: function (datos) {

                            ActualizarListado();
                        }
                    });
                })

                $("#showeventcreate").on("click", "#entrar", function () {
                    var cod = $(this).parents("#btentrar").find('input[type="button"]').attr('name');
                    // console.log(cod);
                    $.ajax({
                        type: "GET",
                        url: "php/eventos/enterinevent.php?id=" + cod,
                        success: function (datos) {
                            if(datos == "added"){
                                $("<div></div>").appendTo("body")
                                .html("<div><h3>Se ha enviado la peticion</h3></div>")
                                .dialog({
                                    resizable: false,
                                    modal: true,
                                    title: "Aviso",
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
                            else if(datos == "error1"){
                                $("<div></div>").appendTo("body")
                                .html("<div><h3>Ya se ha enviado la solicitud, espera a que un administrador la procese</h3></div>")
                                .dialog({
                                    resizable: false,
                                    modal: true,
                                    title: "Aviso",
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


                function VerUsuariosEliminar() {
                    $.ajax({
                        type: "GET",
                        url: "php/eventos/showlist.php?id=" + cod,
                        success: function (datos) {
                            var listado = jQuery.parseJSON(datos);
                            var nombre;
                            for (var x of listado) {
                                nombre = x.evento_nombre;
                                $('<li class="list-group-item">' + x.usuario + '<div id="bteliminarlista"><input id="eliminarlista" type="button" name="' + x.id + '" value="Eliminar"></div></li>').appendTo("#eventoscreados #detalles ul");
                            }
                            if (nombre != null) {
                                $('<h1 class="display-4">' + nombre + '</h1>').appendTo("#eventoscreados #titulo");

                            }
                            else {

                                $("#eventoscreados #titulo").empty();
                                $("<h1>Sin participantes</h1>").appendTo("#eventoscreados #titulo");



                            }

                        }
                    });
                }

                $("<button type='button' id='mostrarentradas'>Mostrar nuevas entradas</button>").appendTo("#eventoscreados #detalles");
                $("<button type='button' id='mostrarusuarios'>Mostrar los usuarios</button>").appendTo("#eventoscreados #detalles");

                $("#eventoscreados #detalles").on("click", "#mostrarentradas", function () {
                    $("#eventoscreados #titulo").empty();
                    $("#eventoscreados #detalles ul").empty();
                    ActualizarListado();

                })

                $("#eventoscreados #detalles").on("click", "#mostrarusuarios", function () {
                    $("#eventoscreados #detalles ul").empty();
                    $("#eventoscreados #titulo").empty();
                    VerUsuariosEliminar();
                });
                $("#eventoscreados #mostrarentradas").css({ "margin": "20px" })




                function ActualizarListado() {
                    $("#eventoscreados #detalles ul").empty();
                    $("#eventoscreados #titulo").empty();
                    console.log(cod);
                    $.ajax({
                        type: "GET",
                        url: "php/eventos/showlistaforacept.php?id=" + cod,
                        success: function (datos) {
                            var listado = jQuery.parseJSON(datos);
                            var nombre;
                            for (var x of listado) {
                                nombre = x.evento_nombre;
                                $('<li class="list-group-item">' + x.usuario + ' <div id="bteliminarlista"><input id="eliminarlista" type="button" name="' + x.id + '" value="Eliminar"></div><div id="btaceptarlista"><input id="aceptarlista" type="button" name="' + x.id + '" value="Aceptar"></div></li>').appendTo("#eventoscreados #detalles ul");

                            }


                            if (nombre != null) {
                                $('<h1 class="display-4">' + nombre + '</h1>').appendTo("#eventoscreados #titulo");

                            }
                            else {
                                $("#eventoscreados #titulo").empty();
                                $("<h1>No hay nuevas entradas</h1>").appendTo("#eventoscreados #titulo");

                            }



                        }
                    });
                }






                $("#showeventcreate").on("click", "#detalles", function () {
                    $("#eventoscreados #detalles ul").empty();
                    $("#eventoscreados #titulo").empty();
                    cod = $(this).parents("#btdetalles").find('input[type="button"]').attr('name');
                    $("#eventoscreados #showEvent").css({ "display": "block" });
                    $.ajax({
                        type: "GET",
                        url: "php/eventos/showlistaforacept.php?id=" + cod,
                        success: function (datos) {
                            var listado = jQuery.parseJSON(datos);
                            var nombre;
                            for (var x of listado) {
                                nombre = x.evento_nombre;
                                $('<li class="list-group-item">' + x.usuario + ' <div id="bteliminarlista"><input id="eliminarlista" type="button" name="' + x.id + '" value="Eliminar"></div><div id="btaceptarlista"><input id="aceptarlista" type="button" name="' + x.id + '" value="Aceptar"></div></li>').appendTo("#eventoscreados #detalles ul");


                            }
                            if (nombre != null) {
                                $('<h1 class="display-4">' + nombre + '</h1>').appendTo("#eventoscreados #titulo");

                            }
                            else {

                                $("#titulo").empty();
                                $("<h1>No hay nuevas entradas</h1>").appendTo("#eventoscreados #titulo");


                            }




                        }
                    });
                })
            }
        }
    });

    function CloseDialogo() {
        $("body").on("click", "#close", function () {
            $("#editform").css({ "display": "none" });
            $("#addform").css({ "display": "none" });
            $("#admineventos #showEvent").css({ "display": "none" });
            $("#eventoscreados #showEvent").css({ "display": "none" });
        })
    }

    function OcultarDialogo() {

        $("#editform").css({ "display": "none" });
        $("#addform").css({ "display": "none" });

    }




    function cargarDatos(pagina) {
        var $tabla = $('#eventos');
        var $paginacion = $('#paginacion');
        $.ajax({
            url: 'php/eventos/showeventsadmin.php',
            data: { offset: (pagina - 1) * 6, limit: 6 },
            dataType: 'json',
            success: function (response) {
                var datos = response.data;
                var totalPaginas = response.totalPaginas;
                var htmlTabla = '';
                for (var i = 0; i < datos.length; i++) {
                    var fechainicio = datos[i].fecha_inicio; // supongamos que esta es tu fecha en formato ISO
                    var fechainicioformat = moment(fechainicio).format("DD/MM/YYYY");
                    var fechafin = datos[i].fecha_fin; // supongamos que esta es tu fecha en formato ISO
                    var fechafinformat = moment(fechafin).format("DD/MM/YYYY");
                    htmlTabla += '<tr>';
                    htmlTabla += '<td>' + datos[i].id + '</td>';
                    htmlTabla += '<td>' + datos[i].nombre + '</td>';
                    htmlTabla += '<td>' + datos[i].ubicacion + '</td>';
                    htmlTabla += '<td>' + datos[i].link + '</td>';
                    htmlTabla += '<td>' + fechainicioformat + '</td>';
                    htmlTabla += '<td>' + fechafinformat + '</td>';
                    htmlTabla += '<td><img src="' + datos[i].imagen + '" width="100px" height="100px"></td>';
                    htmlTabla += '<td>' + datos[i].usuario + '</td>';
                    htmlTabla += '<td><input type="button" data-id="' + datos[i].id + '" id="borrar" name="' + datos[i].id + '" value="Eliminar"></td>';
                    htmlTabla += '<td><input type="button" data-id="' + datos[i].id + '" id="verdetalles" name="' + datos[i].id + '" value="Ver"></td>';
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

                 // Itera sobre cada fila de la tabla
                 $("#eventos tbody tr").each(function () {
                    var fechaActual = new Date();

                    var fechafinformat = $(this).find("td:eq(5)").text();

                    var fechaFin = moment(fechafinformat, "DD/MM/YYYY").toDate();


                    console.log(fechafinformat);
                    if (fechaActual > fechaFin) {
                        $(this).addClass("fecha-vencida");
                    }
                });
            },
            error: function (xhr, status, error) {
                console.log("Error al cargar los datos: " + error);
            }
        });
    }

   




    function MostrarDatos(target, tipo) {


        $(target).empty();
        //$("#addbutton").empty();
        //$('<button type="button" id="anadir">Añadir</button>').appendTo("#addbutton");

        // Obtener los primeros 6 productos al cargar la página
        $.ajax({
            url: 'php/eventos/showeventadminusercargar.php',
            dataType: 'json',
            success: function (data) {
                // Mostrar los primeros 6 productos
                // Mostrar los siguientes 6 productos
                for (var i = 0; i < data.length; i++) {
                    var event = data[i];
                    var fechaini = event.fecha_inicio; // supongamos que esta es tu fecha en formato ISO
                    var fechainicioformat = moment(fechaini).format("DD/MM/YYYY");

                    var fechafin = event.fecha_fin; // supongamos que esta es tu fecha en formato ISO
                    var fechafinformat = moment(fechafin).format("DD/MM/YYYY");

                    var fechaActual = new Date();

                    var fechaFormateada = moment(fechaActual).format("DD/MM/YYYY");

                    //$('<div class="card h-100"><img class="card-img-top" src="' + x.imagen + '" width="400px" height="250px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + x.nombre + '</h4><p class="card-text">' + x.ubicacion + '</p></div><div class="card-footer"><small class="text-muted">' + x.link + '</small></div><div class="card-footer"><small class="text-muted">Fecha inicio: ' + x.fecha_inicio + '</small></div><div class="card-footer"><small class="text-muted">Fecha fin: ' + x.fecha_fin + '</small></div><div id="btentrar" class="card-footer"><input id="entrar" type="button" name="' + x.id + '" value="Entrar" class="btn btn-primary checkout-btn"></div><div id="btdetalles" class="card-footer"><input id="detalles" type="button" name="' + x.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div><div id="bteliminar" class="card-footer"><input type="button" id="borrar" name="' + x.id + '" value="Eliminar"></div></div>').appendTo(target);
                    $('<div id="eventcarta" class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">' + fechafinformat + '</small></p><div id="btentrar"><input id="entrar" type="button" name="' + event.id + '" value="Entrar" class="btn btn-primary checkout-btn"></div><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div><div id="bteditar"><input id="editar" type="button" name="' + event.id + '" value="Editar" class="btn btn-primary checkout-btn"></div>  <div id="bteliminar"><input type="button" id="borrar" name="' + event.id + '" value="Eliminar"></div></div></div>').appendTo("#showeventcreate");


                    $("#showeventcreate #eventcarta").filter(function () {
                        var fechaActual = new Date();

                        var fechafinformat = $(this).find(".text-muted:eq(2)").text();

                        var fechaFin = moment(fechafinformat, "DD/MM/YYYY").toDate();
                        return fechaActual > fechaFin;
                    }).css({ "background-color": "lightgrey" });

                }
                // Mostrar el botón para cargar más productos si hay más de 6 productos
                if (data.length >= 6) {
                    $('#cargar-mas-event').show();
                }

                $("#showeventcreate .card a").filter(function () {

                    var link = $(this).attr('href');
                    console.log(link);
    
                    return link == "Sin Link";
                }).each(function () {
                    $(this).replaceWith("<p class='disabled-link'>Sin Link</p>");
                });
            }
        });


    }


    function MostrarEvent() {
        $("body").on("click", "#anadir", function () {
            $("#addform").css({ "display": "block" });


        })

    }



    function AddEvent(tipo, target) {
        $(target).on("click", "#btadd", function (e) {
            e.preventDefault();
            var data = new FormData();

            //Form data
            var form_data = $('#addevento').serializeArray();
            $.each(form_data, function (key, input) {
                data.append(input.name, input.value);
            });

            var file_data = $('input[name="imgeventoadd"]')[0].files;
            for (var i = 0; i < file_data.length; i++) {
                data.append("imgeventoadd[]", file_data[i]);
            }

            //Custom data
            data.append('key', 'value');
            $.ajax({
                url: 'php/eventos/addevent.php', // point to server-side PHP script 
                dataType: 'text',  // what to expect back from the PHP script, if anything
                cache: false,
                contentType: false,
                processData: false,
                data: data,
                type: 'post',
                success: function (php_script_response) {

                    if (php_script_response == "added") {
                        if (tipo == 2) {
                            cargarDatos(1);
                            $("#addform").css({ "display": "none" });
                            $("#addform #nombre").val("");
                            $("#addform #ubicacion").val("");
                            $("#addform #fechainicio").val("");
                            $("#addform #fechafin").val("");
                            $("#addform #link").val("");
                            $("#addform #id_usuario").prop('selectedIndex', 0);
                            $("#addform #imgeventoadd").val("");


                        }
                        else if (tipo == 4) {
                            MostrarDatos("#showeventcreate", tipo);
                            $("#addform").css({ "display": "none" });
                            $("#addform #nombre").val("");
                            $("#addform #ubicacion").val("");
                            $("#addform #fechainicio").val("");
                            $("#addform #fechafin").val("");
                            $("#addform #link").val("");
                            $("#addform #id_usuario").val("");
                            $("#addform #imgeventoadd").val("");
                        }
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

                    else if (php_script_response == "error2") {
                        $("<div></div>").appendTo("body")
                            .html("<div><h3>Las fechas no son correctas</h3></div>")
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
                    else if (php_script_response == "error3" || php_script_response == "") {
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
                    else if (php_script_response == "error4" || php_script_response == "") {
                        $("<div></div>").appendTo("body")
                            .html("<div><h3>Has superado el límite de carácteres</h3></div>")
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

                    else if (php_script_response == "error5" || php_script_response == "") {
                        $("<div></div>").appendTo("body")
                            .html("<div><h3>Este evento ya ha sido creado</h3></div>")
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
                    else if (php_script_response == "error7" || php_script_response == "") {
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





                }
            });
        })
    }

    function Buscar(target, tipo) {
        $(target).on("click", "#editar", function () {

            if (tipo == 2) {
                $("#editform").css({ "display": "block" });
                cod = $(this).parents(target + " td").find('input[type="button"]').attr('name');
                console.log(cod);
                $.ajax({
                    type: "GET",
                    url: "php/eventos/findevent.php?id=" + cod,
                    success: function (datos) {

                        var pedidos = jQuery.parseJSON(datos);
                        for (var x of pedidos) {
                            $("#editevento").find("input[type='text']:eq(0)").val(x.nombre);
                            $("#editevento").find("input[type='text']:eq(1)").val(x.ubicacion);
                            $("#editevento").find("input[type='text']:eq(2)").val(x.link);
                            $("#editevento").find("input[type='date']:eq(0)").val(x.fecha_inicio);
                            $("#editevento").find("input[type='date']:eq(1)").val(x.fecha_fin);
                            $("#editevento #id_usuario").val(x.id_usuario);
                            $("#editevento").find("input[type='hidden']:eq(0)").val(x.imagen);

                            $("#editform #imgeventoedit").val("");

                        }



                    },
                });

            }
            else if (tipo == 4) {
                $("#editform").css({ "display": "block" });
                cod = $(this).parents(target + " #bteditar").find('input[type="button"]').attr('name');
                console.log(cod);
                $.ajax({
                    type: "GET",
                    url: "php/eventos/findevent.php?id=" + cod,
                    success: function (datos) {

                        //editar bteditar
                        if (tipo == 4) {
                            var pedidos = jQuery.parseJSON(datos);
                            for (var x of pedidos) {
                                $("#editevento").find("input[type='text']:eq(0)").val(x.nombre);
                                $("#editevento").find("input[type='text']:eq(1)").val(x.ubicacion);
                                $("#editevento").find("input[type='text']:eq(2)").val(x.link);
                                $("#editevento").find("input[type='date']:eq(0)").val(x.fecha_inicio);
                                $("#editevento").find("input[type='date']:eq(1)").val(x.fecha_fin);

                                $("#editevento").find("input[type='hidden']:eq(0)").val(x.imagen);

                                $("#editform #imgeventoedit").val("");

                            }
                        }

                    },
                });
            }




        })
    }


    function EditEvent(tipo, target) {
        $(target).on("click", "#btedit", function (e) {
            e.preventDefault();
            var data = new FormData();

            //Form data
            var form_data = $('#editevento').serializeArray();
            $.each(form_data, function (key, input) {
                data.append(input.name, input.value);
            });

            var file_data = $('input[name="imgeventoedit"]')[0].files;
            for (var i = 0; i < file_data.length; i++) {
                data.append("imgeventoedit[]", file_data[i]);
            }
            console.log(cod);

            //Custom data
            data.append('key', 'value');
            $.ajax({
                url: 'php/eventos/editevent.php?id_evento=' + cod, // point to server-side PHP script 
                dataType: 'text',  // what to expect back from the PHP script, if anything
                cache: false,
                contentType: false,
                processData: false,
                data: data,
                type: 'post',
                success: function (php_script_response) {
                    // console.log(php_script_response);

                    if (php_script_response == "added") {
                        $("#editform").css({ "display": "none" });
                        if (tipo == 2) {
                            cargarDatos(1);
                        }
                        else if (tipo == 4) {
                            MostrarDatos("#showeventcreate", tipo);
                        }


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

                    else if (php_script_response == "error2") {
                        $("<div></div>").appendTo("body")
                            .html("<div><h3>Las fechas no son correctas</h3></div>")
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
                    else if (php_script_response == "error3" || php_script_response == "") {
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
                    else if (php_script_response == "error4" || php_script_response == "") {
                        $("<div></div>").appendTo("body")
                            .html("<div><h3>Has superado el límite de carácteres</h3></div>")
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
                    else if (php_script_response == "error5" || php_script_response == "") {
                        $("<div></div>").appendTo("body")
                            .html("<div><h3>Este evento ya ha sido creado</h3></div>")
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
                    else if (php_script_response == "error7" || php_script_response == "") {
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


                }
            });
        })

    }

    function DeleteEvent(tipo, target) {
        $(target).on("click", "#borrar", function () {
            if (tipo == 2) {
                var cod = $(this).parents(target + " td").find('input[type="button"]').attr('name');

            }
            else if (tipo == 4) {
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
                            // console.log(cod);
                            $.ajax({
                                type: "GET",
                                url: "php/eventos/deleteevent.php?id=" + cod,
                                success: function (datos) {
                                    if (tipo == 2) {
                                        cargarDatos(1);

                                    }
                                    else if (tipo == 4) {
                                        MostrarDatos("#showeventcreate", tipo);

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


});