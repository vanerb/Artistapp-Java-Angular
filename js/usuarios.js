
$(document).ready(function () {

    //Actualizar();





    //COMIENZO CARGAR


    // Obtener los primeros 6 productos al cargar la página
    $.ajax({
        url: 'php/usuarios/showuserscargar.php',
        dataType: 'json',
        success: function (data) {
            // Mostrar los primeros 6 productos
            // Mostrar los siguientes 6 productos
            for (var i = 0; i < data.length; i++) {
                var user = data[i];
                $('<div id="usuarioscartas" class="card col-md-3"><div class="carta"><div id="content-user"><img class="card-img-top" src="' + user.imagen + '" alt="Imagen de usuario" width="100px" height="100px" ><div class="card-body"><h5 class="card-title">' + user.usuario + '</h5><p class="card-text">' + user.biografia + '</p><div id="verdetalles"><input type="button" id="btdetalles" name="' + user.id + '" class="btn btn-primary" value="Ver detalles"></div><div id="fijar"><input type="button" id="btfijar" name="' + user.id + '" class="btn btn-primary" value="Fijar"></div></div></div></div></div>').appendTo("#usuarios");
            }
            // Mostrar el botón para cargar más productos si hay más de 6 productos
            if (data.length >= 6) {
                $('#cargar-mas-user').show();
            }
        }
    });

    // Cuando se hace clic en el botón "Cargar más productos", cargar los siguientes 6 productos
    $('#cargar-mas-user').click(function () {
        // Obtener el número de productos ya mostrados

        var num_productos_mostrados = $('#usuarios div#usuarioscartas').length;

        // Cargar los siguientes 6 productos
        $.ajax({
            url: 'php/usuarios/showuserscargar.php',
            data: {
                offset: num_productos_mostrados,
                limit: 6
            },
            dataType: 'json',
            success: function (data) {
                // Mostrar los siguientes 6 productos
                for (var i = 0; i < data.length; i++) {
                    var user = data[i];
                    $('<div id="usuarioscartas" class="card col-md-3"><div class="carta"><div id="content-user"><img class="card-img-top" src="' + user.imagen + '" alt="Imagen de usuario" width="100px" height="100px" ><div class="card-body"><h5 class="card-title">' + user.usuario + '</h5><p class="card-text">' + user.biografia + '</p><div id="verdetalles"><input type="button" id="btdetalles" name="' + user.id + '" class="btn btn-primary" value="Ver detalles"></div><div id="fijar"><input type="button" id="btfijar" name="' + user.id + '" class="btn btn-primary" value="Fijar"></div></div></div></div></div>').appendTo("#usuarios");
                }

                // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                if (data.length < 6) {
                    $('#cargar-mas-user').hide();
                }
            }
        });
    });





    //FIN CARGAR





    //COMIENZO FILTROS



    //INICIO FILTROS

    $('#cargar-mas-filtro-user').hide();

    var offset = 0; // Declarar variable fuera de la función click

    $("body").on("click", "#filtrosusers #filtrar", function () {
        $('#cargar-mas-user').hide();
        offset = 0; // Reiniciar offset al hacer una nueva búsqueda
        $("#usuarios").empty();

        var datos = $("form#filtrosusers").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

        $.ajax({
            type: "GET",
            url: "php/usuarios/filtrarusers.php",
            data: datos,
            dataType: 'json',
            success: function (data) {
                mostrarProductos(data); // Mostrar los primeros 6 productos
                // Mostrar el botón para cargar más productos si hay más de 6 productos
                if (data.length >= 6) {
                    $('#cargar-mas-filtro-user').show();
                } else {
                    $('#cargar-mas-filtro-user').hide(); // Ocultar el botón si no hay más productos para mostrar
                }
            },
        });
    });

    $("body").on('keydown', function (e) {
        
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $('#cargar-mas-user').hide();
            offset = 0; // Reiniciar offset al hacer una nueva búsqueda
            $("#usuarios").empty();

            var datos = $("form#filtrosusers").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

            $.ajax({
                type: "GET",
                url: "php/usuarios/filtrarusers.php",
                data: datos,
                dataType: 'json',
                success: function (data) {
                    mostrarProductos(data); // Mostrar los primeros 6 productos
                    // Mostrar el botón para cargar más productos si hay más de 6 productos
                    if (data.length >= 6) {
                        $('#cargar-mas-filtro-user').show();
                    } else {
                        $('#cargar-mas-filtro-user').hide(); // Ocultar el botón si no hay más productos para mostrar
                    }
                },
            });
        }


    });





    $("body").on("click", "#cargar-mas-filtro-user", function () {
        $('#cargar-mas-user').hide();
        offset += 6; // Incrementar offset en 6
        var datos = $("form#filtrosusers").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

        $.ajax({
            type: "GET",
            url: "php/usuarios/filtrarusers.php",
            data: datos,
            dataType: 'json',
            success: function (data) {
                mostrarProductos(data); // Mostrar los siguientes 6 productos
                // Mostrar el botón para cargar más productos si hay más de 6 productos
                if (data.length < 6) {
                    $('#cargar-mas-filtro-user').hide(); // Ocultar el botón si no hay más productos para mostrar
                }
            },
        });
    });

    //FIN FILTROS

    $("body").on("click", "#filtrosusers #quitarfiltrar", function () {
        $("#filtrosusers #buscar").val("");
        $('#cargar-mas-user').hide();
        offset = 0; // Reiniciar offset al hacer una nueva búsqueda
        $("#usuarios").empty();

        var datos = $("form#filtrosusers").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

        $.ajax({
            type: "GET",
            url: "php/usuarios/filtrarusers.php",
            data: datos,
            dataType: 'json',
            success: function (data) {
                mostrarProductos(data); // Mostrar los primeros 6 productos
                // Mostrar el botón para cargar más productos si hay más de 6 productos
                if (data.length >= 6) {
                    $('#cargar-mas-filtro-user').show();
                } else {
                    $('#cargar-mas-filtro-user').hide(); // Ocultar el botón si no hay más productos para mostrar
                }
            },
        });
    })





    function mostrarProductos(data) {
        for (var i = 0; i < data.length; i++) {
            var user = data[i];
            $('<div id="usuarioscartas" class="card col-md-3"><div class="carta"><div id="content-user"><img class="card-img-top" src="' + user.imagen + '" alt="Imagen de usuario" width="100px" height="100px" ><div class="card-body"><h5 class="card-title">' + user.usuario + '</h5><p class="card-text">' + user.biografia + '</p><div id="verdetalles"><input type="button" id="btdetalles" name="' + user.id + '" class="btn btn-primary" value="Ver detalles"></div><div id="fijar"><input type="button" id="btfijar" name="' + user.id + '" class="btn btn-primary" value="Fijar"></div></div></div></div></div>').appendTo("#usuarios");
        }
    }




















    $("#usuarios").on("click", "#btfijar", function () {
        var codigo = $(this).parents("#fijar").find('input[type="button"]').attr('name');

        console.log(codigo);

        $.ajax({
            type: "GET",
            url: "php/favoritos/addfavorito.php?id=" + codigo,
            success: function (datos) {
                console.log(datos);
                if (datos == "error1" || datos == "") {
                    $("<div></div>").appendTo("body")
                        .html("<div><h3>Ya has fijado a este usuario</h3></div>")
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








    var codp;
    $("#usuarios").on("click", "#btdetalles", function () {
        codp = $(this).parents("#verdetalles").find('input[type="button"]').attr('name');
        //console.log(codp);

        $("#showuser").css({ "display": "block" });
        $("#detallesuser").empty();
        $.ajax({
            type: "GET",
            url: "php/usuarios/finduser.php?id=" + codp,
            success: function (datos) {
                var listado = jQuery.parseJSON(datos);
                for (var x of listado) {
                    if (x.id_tipo == 7) {
                        //$('<h1>' + x.usuario + '</h1><img src="' + x.imagen + '" width="300px" height="300px"><p>' + x.biografia + '</p><ul class="nav nav-tabs"><li id="avisostab" class="nav-item"><a class="nav-link active" data-toggle="tab" href="#tab2">Avisos</a></li></ul><div class="tab-content"><div id="tab2" class="tab-pane active">No ha publicado ningún aviso</div></div>').appendTo("#detallesuser");
                        $('<h1>' + x.usuario + '</h1><img src="' + x.imagen + '" width="300px" height="300px"><p>' + x.biografia + '</p></div>').appendTo("#detallesuser");

                    }
                    else {
                        $('<h1>' + x.usuario + '</h1><img src="' + x.imagen + '" width="300px" height="300px"><p>' + x.biografia + '</p><ul class="nav nav-tabs"><li id="publicacionestab" class="nav-item"><a class="nav-link active" data-toggle="tab" href="#tab1">Publicaciones</a></li><li id="avisostab" class="nav-item"><a class="nav-link" data-toggle="tab" href="#tab2">Avisos</a></li><li id="eventostab" class="nav-item"><a class="nav-link" data-toggle="tab" href="#tab3">Eventos</a></li></ul><div class="tab-content"><div id="tab1" class="tab-pane active"><div class="row" id="tabpubli"></div></div><div id="tab2" class="tab-pane"><div id="tabavisos"></div></div><div id="tab3" class="tab-pane"><div class="row" id="tabeventos"></div></div></div>').appendTo("#detallesuser");

                    }
                }

                $('<div class="row"><div class="col-md-6"><button style="display: none;" id="cargar-mas-user-publi">Cargar más</button></div></div>').appendTo("#tab1");
                $('<div class="row"><div class="col-md-6"><button style="display: none;" id="cargar-mas-user-event">Cargar más</button></div></div>').appendTo("#tab3");

                $('<div class="row"><div class="col-md-6"><button style="display: none;" id="cargar-mas-user-aviso">Cargar más</button></div></div>').appendTo("#tab2");

                //PUBLICACIONES

                // Obtener los primeros 6 productos al cargar la página
                $.ajax({
                    url: 'php/publicaciones/showpubliusercargardescubrir.php?id=' + codp,
                    dataType: 'json',
                    success: function (data) {
                        // Mostrar los primeros 6 productos
                        // Mostrar los siguientes 6 productos
                        for (var i = 0; i < data.length; i++) {
                            var publi = data[i];
                            $('<div id="imgveruser" class="card col-md-3 shadow-sm"><div id="' + publi.id + '" class="carta"><img src="' + publi.imagen + '" class="card-img-top" alt="..." width="350px" height="200px"></div><div class="card-body"><h5 class="card-title">' + publi.titulo + '</h5></div></div></div><br>').appendTo("#tabpubli");
                        }
                        // Mostrar el botón para cargar más productos si hay más de 6 productos
                        if (data.length >= 6) {
                            $('#cargar-mas-user-publi').show();
                        }
                    }
                });

                // Cuando se hace clic en el botón "Cargar más productos", cargar los siguientes 6 productos
                $('#cargar-mas-user-publi').click(function () {
                    // Obtener el número de productos ya mostrados

                    var num_productos_mostrados = $('#tabpubli div#imgveruser').length;

                    // Cargar los siguientes 6 productos
                    $.ajax({
                        url: 'php/publicaciones/showpubliusercargardescubrir.php?id=' + codp,
                        data: {
                            offset: num_productos_mostrados,
                            limit: 6
                        },
                        dataType: 'json',
                        success: function (data) {
                            // Mostrar los siguientes 6 productos
                            for (var i = 0; i < data.length; i++) {
                                var publi = data[i];
                                $('<div id="imgveruser" class="card col-md-3 shadow-sm"><div id="' + publi.id + '" class="carta"><img src="' + publi.imagen + '" class="card-img-top" alt="..." width="350px" height="200px"></div><div class="card-body"><h5 class="card-title">' + publi.titulo + '</h5></div></div></div><br>').appendTo("#tabpubli");
                            }

                            // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                            if (data.length < 6) {
                                $('#cargar-mas-user-publi').hide();
                            }
                        }
                    });
                });






                //AVISOS


                // Obtener los primeros 6 productos al cargar la página
                $.ajax({
                    url: 'php/avisos/shiwavisousercargardescubrir.php?id=' + codp,
                    dataType: 'json',
                    success: function (data) {
                        // Mostrar los primeros 6 productos
                        // Mostrar los siguientes 6 productos
                        for (var i = 0; i < data.length; i++) {
                            var aviso = data[i];
                            var fechapubli = aviso.fecha_publicacion; // supongamos que esta es tu fecha en formato ISO
                            var fechapubliformat = moment(fechapubli).format("DD/MM/YYYY");
                            $('<div id="avisocartauser" class="card my-3"><div class="card-header"><h5 class="card-title">' + aviso.titulo + '</h5><p class="card-text">Por <a href="#">' + aviso.usuario + '</a> el <span class="text-muted">' + fechapubliformat + '</span></p></div><div class="card-body"><p class="card-text">' + aviso.aviso + '</p></div></div>').appendTo("#tabavisos");
                        }
                        // Mostrar el botón para cargar más productos si hay más de 6 productos
                        if (data.length >= 6) {
                            $('#cargar-mas-user-aviso').show();
                        }
                    }
                });

                // Cuando se hace clic en el botón "Cargar más productos", cargar los siguientes 6 productos
                $('#cargar-mas-user-aviso').click(function () {
                    // Obtener el número de productos ya mostrados

                    var num_productos_mostrados = $('#tab2 div#avisocartauser').length;

                    // Cargar los siguientes 6 productos
                    $.ajax({
                        url: 'php/avisos/shiwavisousercargardescubrir.php?id=' + codp,
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
                                $('<div id="avisocartauser" class="card my-3"><div class="card-header"><h5 class="card-title">' + aviso.titulo + '</h5><p class="card-text">Por <a href="#">' + aviso.usuario + '</a> el <span class="text-muted">' + fechapubliformat + '</span></p></div><div class="card-body"><p class="card-text">' + aviso.aviso + '</p></div></div>').appendTo("#tabavisos");
                            }

                            // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                            if (data.length < 6) {
                                $('#cargar-mas-user-aviso').hide();
                            }
                        }
                    });
                });



                //EVENTOS

                // Obtener los primeros 6 productos al cargar la página
                $.ajax({
                    url: 'php/eventos/showeventusercargardescubrir.php?id=' + codp,
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

                            $('<div id="eventcartauser" class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">Fecha inicio: ' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">Fecha fin: ' + fechafinformat + '</small></p><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div></div></div>').appendTo("#tabeventos");
                            
                        }
                        // Mostrar el botón para cargar más productos si hay más de 6 productos
                        if (data.length >= 6) {
                            $('#cargar-mas-user-event').show();
                        }
                    }
                });

                // Cuando se hace clic en el botón "Cargar más productos", cargar los siguientes 6 productos
                $('#cargar-mas-user-event').click(function () {
                    // Obtener el número de productos ya mostrados

                    var num_productos_mostrados = $('#tabeventos div#eventcartauser').length;

                    // Cargar los siguientes 6 productos
                    $.ajax({
                        url: 'php/eventos/showeventusercargardescubrir.php?id=' + codp,
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
                                $('<div id="eventcartauser" class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">Fecha inicio: ' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">Fecha fin: ' + fechafinformat + '</small></p><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div></div></div>').appendTo("#tabeventos");
                                
                            }

                            // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                            if (data.length < 6) {
                                $('#cargar-mas-user-event').hide();
                            }
                        }
                    });
                });








            }
        });



    });























    var codevent;

    ActualizarEventos(codevent);

    function ActualizarEventos(codevent) {
        $("body").on("click", "#detalles", function () {
            $("#detallesuser ul").empty();
            $("#titulouser").empty();
            codevent = $(this).parents("#btdetalles").find('input[type="button"]').attr('name');
            $("#showuser").css({ "display": "none" });
            // console.log(codevent);
            $("#showEventuser").css({ "display": "block" });

            $.ajax({
                type: "GET",
                url: "php/eventos/showlist.php?id=" + codevent,
                success: function (datos) {
                    var listado = jQuery.parseJSON(datos);
                    var nombre;
                    for (var x of listado) {
                        nombre = x.evento_nombre;
                        ubicacion = x.ubicacion;
                        $('<li class="list-group-item">' + x.usuario + '</li>').appendTo("#detallesuser ul");
                    }
                    if (nombre != null) {
                        $('<h1 class="display-4">' + nombre + '</h1>').appendTo("#titulouser");
                        $('<h2>' + ubicacion + '</h2>').appendTo("#titulouser");
                    }
                    else {

                        $("#titulouser").empty();
                        $("<h1>Sin participantes</h1>").appendTo("#titulouser");



                    }

                }
            });
        })
    }

    $("#detallesuser").on("click", "#entrar", function () {
        codevent = $(this).parents("#btentrar").find('input[type="button"]').attr('name');
        // console.log(codevent);
        $.ajax({
            type: "GET",
            url: "php/eventos/enterinevent.php?id=" + codevent,
            success: function (datos) {
                console.log(datos);
                if (datos == "added") {
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
                else if (datos == "error1") {
                    $("<div></div>").appendTo("body")
                        .html("<div><h3>Ya se ha enviado la solicitud, espera que un administrador la procese</h3></div>")
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

    $("body").on("click", "#saliruser", function () {
        // console.log(codevent);
        $.ajax({
            type: "GET",
            url: "php/eventos/exitevent.php?id_evento=" + codevent,
            success: function (datos) {

                $("#detallesuser ul").empty();
                $("#titulouser").empty();

                $.ajax({
                    type: "GET",
                    url: "php/eventos/showlist.php?id=" + codevent,
                    success: function (datos) {
                        var listado = jQuery.parseJSON(datos);
                        var nombre;
                        for (var x of listado) {
                            nombre = x.evento_nombre;
                            $('<li class="list-group-item">' + x.usuario + '</li>').appendTo("#detallesuser ul");
                        }
                        if (nombre != null) {
                            $('<h1>' + nombre + '</h1>').appendTo("#titulouser");

                        }
                        else {

                            $("#titulouser").empty();
                            $("<h1>Sin participantes</h1>").appendTo("#titulouser");



                        }

                    }
                });
            }
        });
    })


    $("body").on("click", "#imgveruser", function () {
        $("#showuser").css({ "display": "none" });

        $("#verimagenuser").css({ "display": "block" });
        cod = $(this).find(".carta").attr('id');
        ActualizarPanel(cod);


    })

    function ActualizarPanel(cod) {
        $("#publiveruser").empty();
        $.ajax({
            type: "GET",
            url: "php/publicaciones/findpubligeneral.php?id=" + cod,
            success: function (datos) {
                var listado = jQuery.parseJSON(datos);
                for (var x of listado) {
                    $("<div class='row'><div class='col-md-12'><img src='" + x.imagen + "'></div></div><div class='row'><div class='col-md-12'><h1>" + x.titulo + "</h1><hr></div></div><div class='row'><div class='col-md-12'><h2>" + x.descripcion + "</h2></div></div><div class='row'><div class='col-md-6'><p>Usuario: " + x.usuario + "</p></div><div class='col-md-6'><p>Categoría: " + x.catnom + "</p></div></div><div id='megusta' class='row'><div class='col-md-12'><img src='media/corazon.png' width='64px' height='64px'><p>" + x.megusta + "<p></div></div>").appendTo("#publiveruser");
                    $.ajax({
                        type: "GET",
                        url: "php/publicaciones/showlikespubli.php?id=" + cod,
                        success: function (usuario) {

                            var listado = jQuery.parseJSON(usuario);
                            for (var x of listado) {
                                // console.log(x.megusta);
                                if (x.megusta == 1) {
                                    $("#publiveruser #btlikediv").css({ "display": "none" });
                                    $("#publiveruser #btdislikediv").css({ "display": "block" });

                                }
                                else if (x.megusta == 0) {
                                    $("#publiveruser #btlikediv").css({ "display": "block" });
                                    $("#btdislikediv").css({ "display": "none" });
                                }
                                else {
                                    $("#publiveruser #btlikediv").css({ "display": "block" });
                                    $("#publiveruser #btdislikediv").css({ "display": "none" });
                                }
                            }

                        }
                    });
                    $("<div id='btlikediv' style='display: block'><input id='btlike' type='button' name='" + x.id + "' value='Like'></div>").appendTo("#publiveruser")
                    $("<div id='btdislikediv' style='display: none'><input id='btdislike' type='button' name='" + x.id + "' value='Dislike'></div>").appendTo("#publiveruser")

                }


            },
            error: function (xhr) {
                alert("Atencion: se ha producido un error");
                $("#mensaje1").append(xhr.statusText + xhr.responseText);
            },
        });
    }


    $("#publiveruser").on("click", "#btlike", function () {


        var cod = $(this).parents("#btlikediv").find('input[type="button"]').attr('name');
        // console.log(cod);

        $.ajax({
            type: "GET",
            url: "php/publicaciones/likepubli.php?id=" + cod,
            success: function (usuario) {
                ActualizarPanel(cod);
                $.ajax({
                    type: "GET",
                    url: "php/publicaciones/showlikespubli.php?id=" + cod,
                    success: function (usuario) {

                        var listado = jQuery.parseJSON(usuario);
                        for (var x of listado) {
                            // console.log(x.megusta);
                            if (x.megusta == 1) {
                                $("#publiveruser #btlikediv").css({ "display": "none" });
                                $("#publiveruser #btdislikediv").css({ "display": "block" });

                            }
                            else if (x.megusta == 0) {
                                $("#publiveruser #btlikediv").css({ "display": "block" });
                                $("#publiveruser #btdislikediv").css({ "display": "none" });
                            }
                            else {
                                $("#publiveruser #btlikediv").css({ "display": "block" });
                                $("#publiveruser #btdislikediv").css({ "display": "none" });
                            }
                        }

                    }
                });

            }
        });


    });



    $("#publiveruser").on("click", "#btdislike", function () {
        var cod = $(this).parents("#btdislikediv").find('input[type="button"]').attr('name');
        // console.log(cod);

        $.ajax({
            type: "GET",
            url: "php/publicaciones/dislikepubli.php?id=" + cod,
            success: function (datos) {
                ActualizarPanel(cod);
                $.ajax({
                    type: "GET",
                    url: "php/publicaciones/showlikespubli.php?id=" + cod,
                    success: function (usuario) {

                        var listado = jQuery.parseJSON(usuario);
                        for (var x of listado) {
                            // console.log(x.megusta);
                            if (x.megusta == 1) {
                                $("#publiveruser #btlikediv").css({ "display": "none" });
                                $("#publiveruser #btdislikediv").css({ "display": "block" });

                            }
                            else if (x.megusta == 0) {
                                $("#publiveruser #btlikediv").css({ "display": "block" });
                                $("#publiveruser #btdislikediv").css({ "display": "none" });
                            }
                            else {
                                $("#publiveruser #btlikediv").css({ "display": "block" });
                                $("#publiveruser #btdislikediv").css({ "display": "none" });
                            }
                        }

                    }
                });

            }
        });



    });



    CloseDialogo();

    function CloseDialogo() {
        $("body").on("click", "#close", function () {
            $("#showuser").css({ "display": "none" });
            $("#verimagenuser").css({ "display": "none" });
            $("#showEventuser").css({ "display": "none" });

        })
    }
    function Actualizar() {
        $.ajax({
            type: "GET",
            url: "php/usuarios/showusers.php",
            success: function (datos) {
                var listado = jQuery.parseJSON(datos);
                for (var x of listado) {
                    $('<div class="card"><div class="carta"><div id="content-user"><img class="card-img-top" src="' + x.imagen + '" alt="Imagen de usuario" width="100px" height="100px" ><div class="card-body"><h5 class="card-title">' + x.usuario + '</h5><p class="card-text">' + x.biografia + '</p><div id="verdetalles"><input type="button" id="btdetalles" name="' + x.id + '" class="btn btn-primary" value="Ver detalles"></div></div></div></div></div>').appendTo("#usuarios");
                }


            }
        });
    }







});