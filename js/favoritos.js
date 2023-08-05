$(document).ready(function () {

    // Obtener los primeros 6 productos al cargar la página
    $.ajax({
        url: 'php/favoritos/showfavorito.php',
        dataType: 'json',
        success: function (data) {
            // Mostrar los primeros 6 productos
            // Mostrar los siguientes 6 productos
            for (var i = 0; i < data.length; i++) {
                var user = data[i];
                $('<div id="usuarioscartas" class="card col-md-3"><div class="carta"><div id="content-user"><img class="card-img-top" src="' + user.imagen + '" alt="Imagen de usuario" width="100px" height="100px" ><div class="card-body"><h5 class="card-title">' + user.usuario + '</h5><p class="card-text">' + user.biografia + '</p><div id="verdetalles"><input type="button" id="btdetalles" name="' + user.id + '" class="btn btn-primary" value="Ver detalles"></div><div id="desfijar"><input type="button" id="btdesfijar" name="' + user.id + '" class="btn btn-primary" value="Dejar de fijar"></div></div></div></div></div>').appendTo("#favtab");
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

        var num_productos_mostrados = $('#favtab div#usuarioscartas').length;

        // Cargar los siguientes 6 productos
        $.ajax({
            url: 'php/favoritos/showfavorito.php',
            data: {
                offset: num_productos_mostrados,
                limit: 6
            },
            dataType: 'json',
            success: function (data) {
                // Mostrar los siguientes 6 productos
                for (var i = 0; i < data.length; i++) {
                    var user = data[i];
                    $('<div id="usuarioscartas" class="card col-md-3"><div class="carta"><div id="content-user"><img class="card-img-top" src="' + user.imagen + '" alt="Imagen de usuario" width="100px" height="100px" ><div class="card-body"><h5 class="card-title">' + user.usuario + '</h5><p class="card-text">' + user.biografia + '</p><div id="verdetalles"><input type="button" id="btdetalles" name="' + user.id + '" class="btn btn-primary" value="Ver detalles"></div><div id="desfijar"><input type="button" id="btdesfijar" name="' + user.id + '" class="btn btn-primary" value="Dejar de fijar"></div></div></div></div></div>').appendTo("#favtab");
                }

                // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                if (data.length < 6) {
                    $('#cargar-mas-user').hide();
                }
            }
        });
    });


    $("#favtab").on("click", "#btdesfijar", function () {  
        var codigo = $(this).parents("#desfijar").find('input[type="button"]').attr('name');

        console.log(codigo);

        $.ajax({
            type: "GET",
            url: "php/favoritos/deletefavorito.php?id=" + codigo,
            success: function (datos) {
                $("#favtab").empty();
                $.ajax({
                    url: 'php/favoritos/showfavorito.php',
                    dataType: 'json',
                    success: function (data) {
                        
                        // Mostrar los primeros 6 productos
                        // Mostrar los siguientes 6 productos
                        for (var i = 0; i < data.length; i++) {
                            var user = data[i];
                            $('<div id="usuarioscartas" class="card col-md-3"><div class="carta"><div id="content-user"><img class="card-img-top" src="' + user.imagen + '" alt="Imagen de usuario" width="100px" height="100px" ><div class="card-body"><h5 class="card-title">' + user.usuario + '</h5><p class="card-text">' + user.biografia + '</p><div id="verdetalles"><input type="button" id="btdetalles" name="' + user.id + '" class="btn btn-primary" value="Ver detalles"></div><div id="desfijar"><input type="button" id="btdesfijar" name="' + user.id + '" class="btn btn-primary" value="Dejar de fijar"></div></div></div></div></div>').appendTo("#favtab");
                        }
                        // Mostrar el botón para cargar más productos si hay más de 6 productos
                        if (data.length >= 6) {
                            $('#cargar-mas-user').show();
                        }
                    }
                });
            }
        });
    })























    //AQUI EMPIEZA LO MISMO QUE EN USUARIOS


    var codp;
    $("#favtab").on("click", "#btdetalles", function () {
        codp = $(this).parents("#verdetalles").find('input[type="button"]').attr('name');
        //console.log(codp);

        $("#showuserfav").css({ "display": "block" });
        $("#detallesuserfav").empty();
        $.ajax({
            type: "GET",
            url: "php/usuarios/finduser.php?id=" + codp,
            success: function (datos) {
                var listado = jQuery.parseJSON(datos);
                for (var x of listado) {
                    if (x.id_tipo == 7) {
                        //$('<h1>' + x.usuario + '</h1><img src="' + x.imagen + '" width="300px" height="300px"><p>' + x.biografia + '</p><ul class="nav nav-tabs"><li id="avisostab" class="nav-item"><a class="nav-link active" data-toggle="tab" href="#tab2">Avisos</a></li></ul><div class="tab-content"><div id="tab2" class="tab-pane active">No ha publicado ningún aviso</div></div>').appendTo("#detallesuser");
                        $('<h1>' + x.usuario + '</h1><img src="' + x.imagen + '" width="300px" height="300px"><p>' + x.biografia + '</p></div>').appendTo("#detallesuserfav");

                    }
                    else {
                        $('<h1>' + x.usuario + '</h1><img src="' + x.imagen + '" width="300px" height="300px"><p>' + x.biografia + '</p><ul class="nav nav-tabs"><li id="publicacionestab" class="nav-item"><a class="nav-link active" data-toggle="tab" href="#tab1">Publicaciones</a></li><li id="avisostab" class="nav-item"><a class="nav-link" data-toggle="tab" href="#tab2">Avisos</a></li><li id="eventostab" class="nav-item"><a class="nav-link" data-toggle="tab" href="#tab3">Eventos</a></li></ul><div class="tab-content"><div id="tab1" class="tab-pane active"><div class="row" id="tabpubli"></div></div><div id="tab2" class="tab-pane"><div id="tabavisos"></div></div><div id="tab3" class="tab-pane"><div class="row" id="tabeventos"></div></div></div>').appendTo("#detallesuserfav");

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
                console.log(codp);
                $("#tabeventos").empty();
                // Obtener los primeros 6 productos al cargar la página
                $.ajax({
                    url: 'php/eventos/showeventusercargardescubrir.php?id=' + codp,
                    dataType: 'json',
                    success: function (data) {
                        // Mostrar los primeros 6 productos
                        // Mostrar los siguientes 6 productos
                        for (var i = 0; i < data.length; i++) {
                            var evento = data[i];
                            console.log(data[i]);
                            var fechaini = evento.fecha_inicio; // supongamos que esta es tu fecha en formato ISO
                            var fechainicioformat = moment(fechaini).format("DD/MM/YYYY");

                            var fechafin = evento.fecha_fin; // supongamos que esta es tu fecha en formato ISO
                            var fechafinformat = moment(fechafin).format("DD/MM/YYYY");
                            
                            $('<div id="eventcartauser" class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + evento.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + evento.nombre + '</h4><p class="card-text">' + evento.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + evento.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">Fecha inicio: ' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">Fecha fin: ' + fechafinformat + '</small></p><div id="btdetalles"><input id="detalles" type="button" name="' + evento.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div></div></div>').appendTo("#tabeventos");
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



    $("body").on("click", "#imgveruser", function () {
        $("#showuserfav").css({ "display": "none" });

        $("#verimagenuserfav").css({ "display": "block" });
        cod = $(this).find(".carta").attr('id');
        ActualizarPanel(cod);


    })

    function ActualizarPanel(cod) {
        $("#publiveruserfav").empty();
        $.ajax({
            type: "GET",
            url: "php/publicaciones/findpubligeneral.php?id=" + cod,
            success: function (datos) {
                var listado = jQuery.parseJSON(datos);
                for (var x of listado) {
                    $("<div class='row'><div class='col-md-12'><img src='" + x.imagen + "'></div></div><div class='row'><div class='col-md-12'><h1>" + x.titulo + "</h1><hr></div></div><div class='row'><div class='col-md-12'><h2>" + x.descripcion + "</h2></div></div><div class='row'><div class='col-md-6'><p>Usuario: " + x.usuario + "</p></div><div class='col-md-6'><p>Categoría: " + x.catnom + "</p></div></div><div id='megusta' class='row'><div class='col-md-12'><img src='media/corazon.png' width='64px' height='64px'><p>" + x.megusta + "<p></div></div>").appendTo("#publiveruserfav");
                    $.ajax({
                        type: "GET",
                        url: "php/publicaciones/showlikespubli.php?id=" + cod,
                        success: function (usuario) {

                            var listado = jQuery.parseJSON(usuario);
                            for (var x of listado) {
                                // console.log(x.megusta);
                                if (x.megusta == 1) {
                                    $("#publiveruserfav #btlikediv").css({ "display": "none" });
                                    $("#publiveruserfav #btdislikediv").css({ "display": "block" });

                                }
                                else if (x.megusta == 0) {
                                    $("#publiveruserfav #btlikediv").css({ "display": "block" });
                                    $("#btdislikedivfav").css({ "display": "none" });
                                }
                                else {
                                    $("#publiveruserfav #btlikediv").css({ "display": "block" });
                                    $("#publiveruserfav #btdislikediv").css({ "display": "none" });
                                }
                            }

                        }
                    });
                    $("<div id='btlikediv' style='display: block'><input id='btlike' type='button' name='" + x.id + "' value='Like'></div>").appendTo("#publiveruserfav")
                    $("<div id='btdislikediv' style='display: none'><input id='btdislike' type='button' name='" + x.id + "' value='Dislike'></div>").appendTo("#publiveruserfav")

                }


            },
            error: function (xhr) {
                alert("Atencion: se ha producido un error");
                $("#mensaje1").append(xhr.statusText + xhr.responseText);
            },
        });
    }


    $("#publiveruserfav").on("click", "#btlike", function () {


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
                                $("#publiveruserfav #btlikediv").css({ "display": "none" });
                                $("#publiveruserfav #btdislikediv").css({ "display": "block" });

                            }
                            else if (x.megusta == 0) {
                                $("#publiveruserfav #btlikediv").css({ "display": "block" });
                                $("#publiveruserfav #btdislikediv").css({ "display": "none" });
                            }
                            else {
                                $("#publiveruserfav #btlikediv").css({ "display": "block" });
                                $("#publiveruserfav #btdislikediv").css({ "display": "none" });
                            }
                        }

                    }
                });

            }
        });


    });



    $("#publiveruserfav").on("click", "#btdislike", function () {
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
                                $("#publiveruserfav #btlikediv").css({ "display": "none" });
                                $("#publiveruserfav #btdislikediv").css({ "display": "block" });

                            }
                            else if (x.megusta == 0) {
                                $("#publiveruserfav #btlikediv").css({ "display": "block" });
                                $("#publiveruserfav #btdislikediv").css({ "display": "none" });
                            }
                            else {
                                $("#publiveruserfav #btlikediv").css({ "display": "block" });
                                $("#publiveruserfav #btdislikediv").css({ "display": "none" });
                            }
                        }

                    }
                });

            }
        });



    });


    $("#detallesuserfav").on("click", "#detalles", function () {
        console.log("click");
        $("#detallesuserfav ul").empty();
        $("#titulouserfav").empty();
        codevent = $(this).parents("#btdetalles").find('input[type="button"]').attr('name');
        $("#showuserfav").css({ "display": "none" });
        // console.log(codevent);
        $("#showEventuserfav").css({ "display": "block" });

        $.ajax({
            type: "GET",
            url: "php/eventos/showlist.php?id=" + codevent,
            success: function (datos) {
                var listado = jQuery.parseJSON(datos);
                var nombre;
                for (var x of listado) {
                    nombre = x.evento_nombre;
                    ubicacion = x.ubicacion;
                    $('<li class="list-group-item">' + x.usuario + '</li>').appendTo("#detallesuserfav ul");
                }
                if (nombre != null) {
                    $('<h1 class="display-4">' + nombre + '</h1>').appendTo("#titulouserfav");
                    $('<h2>' + ubicacion + '</h2>').appendTo("#titulouserfav");
                }
                else {

                    $("#titulouserfav").empty();
                    $("<h1>Sin participantes</h1>").appendTo("#titulouserfav");



                }

            }
        });
    })

   




    CloseDialogo();

    function CloseDialogo() {
        $("body").on("click", "#close", function () {
            $("#showuserfav").css({ "display": "none" });
            $("#verimagenuserfav").css({ "display": "none" });
            $("#showEventuserfav").css({ "display": "none" });
        })
    }

});