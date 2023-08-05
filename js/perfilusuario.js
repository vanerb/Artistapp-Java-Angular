
$(document).ready(function () {

    //Comprueba la sesion y segun lo que obtenga muestra un menu o otro
    $.ajax({
        type: "GET",
        url: "php/sesion.php",
        success: function (datos) {
            // console.log(datos);
            //menu de artistas
            if (datos == "1") {
                $("#anadirpubli").css({ "display": "block" });
                $("#publicacionestab").css({ "display": "block" });
                $("#eventostab").css({ "display": "block" });
                $("#generarmensaje").css({ "display": "none" });

            }
            //Menu de Administradores
            else if (datos == "2") {
                // console.log("ADMIn");
                $("#anadirpubli").css({ "display": "block" });
                $("#publicacionestab").css({ "display": "block" });
                $("#eventostab").css({ "display": "block" });

                $("#generarmensaje").css({ "display": "block" });

            }
            //Menu de No artistas
            else if (datos == "3") {
                //  console.log("ADMIn");
                $("#anadirpubli").css({ "display": "none" });
                $("#publicacionestab a").removeClass("active");

                $("#publicacionestab").css({ "display": "none" });
                $("#eventostab").css({ "display": "none" });
                $("#avisostab").css({ "display": "none" });

                $("#usuariostab a.nav-link").addClass("active");
                $("#menu0").removeClass("tab-pane active").addClass("tab-pane fade");

                $("#menu3").removeClass("tab-pane fade").addClass("tab-pane active");

                $("#generarmensaje").css({ "display": "none" });

            }
            //Menu adminsitradores de eventos
            else if (datos == "4") {
                //console.log("ADMIn");
                $("#anadirpubli").css({ "display": "block" });
                $("#publicacionestab").css({ "display": "block" });
                $("#eventostab").css({ "display": "block" });

                $("#generarmensaje").css({ "display": "none" });
            }
            else {


                if (window.location.pathname == "/artistapp/index.html" || window.location.pathname == "/artistapp/") {

                }
                else {
                    window.location.href = "login.html";

                }




            }





        },
    });







    //PARTE PUBLICACIONES


    // Obtener los primeros 6 productos al cargar la página
    $.ajax({
        url: 'php/usuarios/showpublicargar.php',
        dataType: 'json',
        success: function (data) {
            // Mostrar los primeros 6 productos
            // Mostrar los siguientes 6 productos
            for (var i = 0; i < data.length; i++) {
                var publi = data[i];
                $('<div id="imgver" class="card col-md-3 shadow-sm"><div id="' + publi.id + '" class="carta"><img src="' + publi.imagen + '" class="card-img-top" alt="..." width="350px" height="200px"></div><div class="card-body"><h5 class="card-title">' + publi.titulo + '</h5></div></div>').appendTo("#showpublitarjeta");
            }
            // Mostrar el botón para cargar más productos si hay más de 6 productos
            if (data.length >= 6) {
                $('#cargar-mas-publi').show();
            }
        }
    });

    // Cuando se hace clic en el botón "Cargar más productos", cargar los siguientes 6 productos
    $('#cargar-mas-publi').click(function () {
        // Obtener el número de productos ya mostrados

        var num_productos_mostrados = $('#showpublitarjeta div#imgver').length;

        // Cargar los siguientes 6 productos
        $.ajax({
            url: 'php/usuarios/showpublicargar.php',
            data: {
                offset: num_productos_mostrados,
                limit: 6
            },
            dataType: 'json',
            success: function (data) {
                // Mostrar los siguientes 6 productos
                for (var i = 0; i < data.length; i++) {
                    var publi = data[i];
                    $('<div id="imgver" class="card col-md-3 shadow-sm"><div id="' + publi.id + '" class="carta"><img src="' + publi.imagen + '" class="card-img-top" alt="..." width="350px" height="200px"></div><div class="card-body"><h5 class="card-title">' + publi.titulo + '</h5></div></div>').appendTo("#showpublitarjeta");
                }

                // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                if (data.length < 6) {
                    $('#cargar-mas-publi').hide();
                }
            }
        });
    });




    //PARTE AVISOS

    $('<div class="row"><div class="col-md-6"><button style="display: none;" id="cargar-mas-aviso">Cargar más</button></div></div>').appendTo("#menu1");
    // Obtener los primeros 6 productos al cargar la página
    $.ajax({
        url: 'php/usuarios/showavisocargar.php',
        dataType: 'json',
        success: function (data) {
            // Mostrar los primeros 6 productos
            // Mostrar los siguientes 6 productos
            for (var i = 0; i < data.length; i++) {
                var aviso = data[i];
                var fechaaviso = aviso.fecha_publicacion; // supongamos que esta es tu fecha en formato ISO
                var fechaavisoformat = moment(fechaaviso).format("DD/MM/YYYY");
                $('<div id="avisoscard" class="card my-3"><div class="card-header"><h5 class="card-title">' + aviso.titulo + '</h5><p class="card-text">Por <a href="#">' + aviso.usuario + '</a> el <span class="text-muted">' + fechaavisoformat + '</span></p></div><div class="card-body"><p class="card-text">' + aviso.aviso + '</p></div></div>').appendTo("#avisotab");

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

        var num_productos_mostrados = $('#menu1 div#avisoscard').length;

        // Cargar los siguientes 6 productos
        $.ajax({
            url: 'php/usuarios/showavisocargar.php',
            data: {
                offset: num_productos_mostrados,
                limit: 6
            },
            dataType: 'json',
            success: function (data) {
                // Mostrar los siguientes 6 productos
                for (var i = 0; i < data.length; i++) {
                    var aviso = data[i];
                    var fechaaviso = aviso.fecha_publicacion; // supongamos que esta es tu fecha en formato ISO
                    var fechaavisoformat = moment(fechaaviso).format("DD/MM/YYYY");
                    $('<div id="avisoscard" class="card my-3"><div class="card-header"><h5 class="card-title">' + aviso.titulo + '</h5><p class="card-text">Por <a href="#">' + aviso.usuario + '</a> el <span class="text-muted">' + fechaavisoformat + '</span></p></div><div class="card-body"><p class="card-text">' + aviso.aviso + '</p></div></div>').appendTo("#menu1");
                }

                // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                if (data.length < 6) {
                    $('#cargar-mas-aviso').hide();
                }
            }
        });
    });



    //PARTE EVENTOS


    // Obtener los primeros 6 productos al cargar la página
    $.ajax({
        url: 'php/usuarios/showeventcargar.php',
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
                $('<div id="eventocard" class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">Fecha inicio: ' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">Fecha fin: ' + fechafinformat + '</small></p><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div></div></div>').appendTo("#shoevent");
            }
            // Mostrar el botón para cargar más productos si hay más de 6 productos
            if (data.length >= 6) {
                $('#cargar-mas-event').show();
            }

            $("#shoevent .card a").filter(function () {

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

        var num_productos_mostrados = $('#shoevent div#eventocard').length;

        // Cargar los siguientes 6 productos
        $.ajax({
            url: 'php/usuarios/showeventcargar.php',
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
                    $('<div id="eventocard" class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">Fecha inicio: ' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">Fecha fin: ' + fechafinformat + '</small></p><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div></div></div>').appendTo("#shoevent");
                }

                // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                if (data.length < 6) {
                    $('#cargar-mas-event').hide();
                }

                $("#shoevent .card a").filter(function () {

                    var link = $(this).attr('href');
                    console.log(link);

                    return link == "Sin Link";
                }).each(function () {
                    $(this).replaceWith("<p class='disabled-link'>Sin Link</p>");
                });
            }
        });
    });
























    $("#editperfilform #nombre").on("input blur", function () {
        if ($("#editperfilform #nombre").val() == "" || $("#editperfilform #nombre").val().trim() === "" || $("#editperfilform #nombre").val().length > 100) {
            $("#editperfilform #nombre").css({ "background-color": "red" })
        }
        else {
            $("#editperfilform #nombre").css({ "background-color": "" })
        }

    })

    $("#editperfilform #apellidos").on("input blur", function () {
        if ($("#editperfilform #apellidos").val() == "" || $("#editperfilform #apellidos").val().trim() === "" || $("#editperfilform #apellidos").val().length > 140) {
            $("#editperfilform #apellidos").css({ "background-color": "red" })
        }
        else {
            $("#editperfilform #apellidos").css({ "background-color": "" })
        }

    })

    $("#editperfilform #usuario").on("input blur", function () {
        if ($("#editperfilform #usuario").val() == "" || $("#editperfilform #usuario").val().trim() === "" || $("#editperfilform #usuario").val().length > 100) {
            $("#editperfilform #usuario").css({ "background-color": "red" })
        }
        else {
            $("#editperfilform #usuario").css({ "background-color": "" })
        }

    })

    $("#editperfilform #correo").on("input blur", function () {
        if ($("#editperfilform #correo").val() == "" || !validateEmail($("#editperfilform #correo").val()) || $("#editperfilform #correo").val().trim() === "" || $("#edituser #correo").val().length > 240) {
            $("#editperfilform #correo").css({ "background-color": "red" })
        }
        else {
            $("#editperfilform #correo").css({ "background-color": "" })
        }

    })

    $("#editperfilform #biografia").on("input blur", function () {
        if ($("#editperfilform #biografia").val() == "" || $("#editperfilform #biografia").val().trim() === "" || $("#editperfilform #biografia").val().length > 240) {
            $("#editperfilform #biografia").css({ "background-color": "red" })
        }
        else {
            $("#editperfilform #biografia").css({ "background-color": "" })
        }

    })






    $("#editcontrasenaform #antcontrasena").on("input blur", function () {
        if ($("#editcontrasenaform #antcontrasena").val() == "") {
            $("#editcontrasenaform #antcontrasena").css({ "background-color": "red" })
        }
        else {
            $("#editcontrasenaform #antcontrasena").css({ "background-color": "" })
        }

    })

    $("#editcontrasenaform #nuevacontrasena").on("input blur", function () {
        if ($("#editcontrasenaform #nuevacontrasena").val() == "" || !validatePassword($("#editcontrasenaform #nuevacontrasena").val()) || $("#editcontrasenaform #nuevacontrasena").val().trim() === "" || $("#editcontrasenaform #nuevacontrasena").val().length > 240) {
            $("#editcontrasenaform #nuevacontrasena").css({ "background-color": "red" })
        }
        else {
            $("#editcontrasenaform #nuevacontrasena").css({ "background-color": "" })
        }

    })

    $("#editcontrasenaform #repcontrasena").on("input blur", function () {
        if ($("#editcontrasenaform #repcontrasena").val() == "" || $("#editcontrasenaform #repcontrasena").val() != $("#editcontrasenaform #nuevacontrasena").val()) {
            $("#editcontrasenaform #repcontrasena").css({ "background-color": "red" })
        }
        else {
            $("#editcontrasenaform #repcontrasena").css({ "background-color": "" })
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
        url: "php/usuarios/showuserprofile.php",
        success: function (datos) {
            var listado = jQuery.parseJSON(datos);
            for (var x of listado) {
                $("<div class='row'><div class='col-md-12'><h1>" + x.usuario + "</h1></div></div><div class='row'><div class='col-md-6'><img src='" + x.imagen + "' width='300px' height='300px'></div></div><div class='row'><div class='col-md-6'><p>" + x.biografia + "</p></div></div>").appendTo("#usuarioinfo");
                if (x.id_tipo == 3 || x.id_tipo == 1) {
                    $("#anadirevento").css({ "display": "block" });
                }
                else {
                    $("#anadirevento").css({ "display": "none" });


                }
            }

        },
        error: function (xhr) {
            alert("Atencion: se ha producido un error");
            $("#mensaje1").append(xhr.statusText + xhr.responseText);
        },
    });


    var cod;

    $("body").on("click", "#imgver", function () {
        $("#verimagenuser").css({ "display": "block" });
        cod = $(this).find(".carta").attr('id');
        // console.log(cod);
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
                                //  console.log(x.megusta);
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
                            //  console.log(x.megusta);
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

    //EVENTOS




    ActualizarEventos();

    $("body").on("click", "#saliruser", function () {

        var codevent = $(this).parents("#btsalir").find('input[type="button"]').attr('name');
        console.log(codevent);
        $.ajax({
            type: "GET",
            url: "php/eventos/exitevent.php?id_evento=" + codevent,
            success: function (datos) {

                $("#detallesuser ul").empty();
                $("#titulouser").empty();
                $("#botonexit").empty();

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

                        $("#showEventuser").css({ "display": "none" });


                    }
                });


                $("#shoevent").empty();


                $.ajax({
                    url: 'php/usuarios/showeventcargar.php',
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
                            $('<div id="eventocard" class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">Fecha inicio: ' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">Fecha fin: ' + fechafinformat + '</small></p><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div></div></div>').appendTo("#shoevent");
                        }
                        // Mostrar el botón para cargar más productos si hay más de 6 productos
                        if (data.length >= 6) {
                            $('#cargar-mas-event').show();
                        }

                        $("#shoevent .card a").filter(function () {

                            var link = $(this).attr('href');
                            console.log(link);

                            return link == "Sin Link";
                        }).each(function () {
                            $(this).replaceWith("<p class='disabled-link'>Sin Link</p>");
                        });
                    }
                });








            }
        });
    })

    function ActualizarEventos() {
        $("body").on("click", "#detalles", function () {
            $("#detallesuser ul").empty();
            $("#titulouser").empty();
            $("#botonexit").empty();
            var codevent = $(this).parents("#btdetalles").find('input[type="button"]').attr('name');
            $("#showuser").css({ "display": "none" });
            // console.log(codevent);
            $("#showEventuser").css({ "display": "block" });
            $(' <div id="btsalir" class="col-md-8"><input id="saliruser" name="' + codevent + '" type="button" value="Salir" class="btn btn-primary w-100"></div>').appendTo("#botonexit");

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






    CloseDialogo();

    function CloseDialogo() {
        $("body").on("click", "#close", function () {
            $("#verimagenuser").css({ "display": "none" });
            $("#showEventuser").css({ "display": "none" });
            $("#editcontrasena").css({ "display": "none" });
            $("#editperfil").css({ "display": "none" });

        })
    }


    $("body").on("click", "#cambiarcontrasena", function () {
        $("#editcontrasena").css({ "display": "block" });
    })

    $("body").on("click", "#btchangepassword", function () {
        var data = $("form#editcontrasenaform").serialize();

        $.ajax({
            type: "GET",
            data: data,
            url: "php/usuarios/changepassword.php",
            success: function (datos) {
                //console.log(datos);
                if (datos == "added") {
                    $("#editcontrasena").css({ "display": "none" });
                    $("#editcontrasena #antcontrasena").val("");
                    $("#editcontrasena #nuevacontrasena").val("");
                    $("#editcontrasena #repcontrasena").val("");


                }
                else if (datos == "error1" || datos == "") {
                    $("<div></div>").appendTo("body")
                        .html("<div><h3>No se pueden dejar espacios en blanco o campos vacíos</h3></div>")
                        .dialog({
                            resizable: false,
                            modal: true,
                            title: "Confirmar",
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
                            title: "Confirmar",
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
                else if (datos == "error7" || datos == "") {
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
    });


    $("body").on("click", "#editinfo", function () {
        $("#editperfil").css({ "display": "block" });

        $.ajax({
            type: "GET",
            url: "php/usuarios/showuserprofile.php",
            success: function (datos) {
                var listado = jQuery.parseJSON(datos);
                for (var x of listado) {
                    $("#editperfilform").find("input[type='text']:eq(0)").val(x.nombre);
                    $("#editperfilform").find("input[type='text']:eq(1)").val(x.apellidos);
                    $("#editperfilform").find("input[type='text']:eq(2)").val(x.usuario);
                    $("#editperfilform").find("input[type='text']:eq(3)").val(x.correo);
                    $("#editperfilform").find("input[type='text']:eq(4)").val(x.biografia);
                    $("#editperfilform").find("input[type='hidden']:eq(0)").val(x.imagen);


                }

            },
            error: function (xhr) {
                alert("Atencion: se ha producido un error");
                $("#mensaje1").append(xhr.statusText + xhr.responseText);
            },
        });


    })

    $("body").on("click", "#anadirpubli", function () {
        window.location.href = "adminpubli.html";
    })

    $("body").on("click", "#anadiravisos", function () {
        window.location.href = "adminavisos.html";

    })

    $("body").on("click", "#anadirevento", function () {
        window.location.href = "admineventos.html";

    })

    $("body").on("click", "#reportar", function () {
        window.location.href = "informes.html";

    })

    $("body").on("click", "#btchangeperfil", function (e) {
        e.preventDefault();
        var data = new FormData();

        //Form data
        var form_data = $('#editperfilform').serializeArray();
        $.each(form_data, function (key, input) {
            data.append(input.name, input.value);
        });

        var file_data = $('input[name="imagen"]')[0].files;
        for (var i = 0; i < file_data.length; i++) {
            data.append("imagen[]", file_data[i]);
        }

        //Custom data
        data.append('key', 'value');
        $.ajax({
            url: 'php/usuarios/edituser.php', // point to server-side PHP script 
            dataType: 'text',  // what to expect back from the PHP script, if anything
            cache: false,
            contentType: false,
            processData: false,
            data: data,
            type: 'post',
            success: function (php_script_response) {
                if (php_script_response == "added") {
                    window.location.href = "perfilusuario.html";

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
                else if (php_script_response == "error3" || php_script_response == "") {
                    $("<div></div>").appendTo("body")
                        .html("<div><h3>El formato de la imagen no es correcto</h3></div>")
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
                else if (php_script_response == "error2" || php_script_response == "") {
                    $("<div></div>").appendTo("body")
                        .html("<div><h3>El usuario o el correo ya existe</h3></div>")
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
                else if (php_script_response == "error4" || php_script_response == "") {
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
                else if (php_script_response == "error7" || php_script_response == "") {
                    $("<div></div>").appendTo("body")
                        .html("<div><h3>La imagen seleccionada es demasiado grande</h3></div>")
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
                else if (php_script_response == "error8" || php_script_response == "") {
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

            }
        });

    });
});