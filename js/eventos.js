
$(document).ready(function () {

    //Comprueba la sesion y segun lo que obtenga muestra un menu o otro
    $.ajax({
        type: "GET",
        url: "php/sesion.php",
        success: function (datos) {
            //menu de artistas
            if (datos == "1") {


                // Obtener los primeros 6 productos al cargar la página
                $.ajax({
                    url: 'php/eventos/showeventcargar.php',
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
                            $('<div class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">Fecha inicio: ' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">Fecha fin: ' + fechafinformat + '</small></p><div id="btentrar"><input id="entrar" type="button" name="' + event.id + '" value="Entrar" class="btn btn-primary checkout-btn"></div><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div></div></div>').appendTo("#evento");
                        }
                        // Mostrar el botón para cargar más productos si hay más de 6 productos
                        if (data.length >= 6) {
                            $('#cargar-mas-event').show();
                        }

                        $("#evento .card a").filter(function () {

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

                    var num_productos_mostrados = $('#evento div.card').length;

                    // Cargar los siguientes 6 productos
                    $.ajax({
                        url: 'php/eventos/showeventcargar.php',
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
                                $('<div class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">Fecha inicio: ' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">Fecha fin: ' + fechafinformat + '</small></p><div id="btentrar"><input id="entrar" type="button" name="' + event.id + '" value="Entrar" class="btn btn-primary checkout-btn"></div><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div></div></div>').appendTo("#evento");
                            }

                            // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                            if (data.length < 6) {
                                $('#cargar-mas-event').hide();
                            }

                            $("#evento .card a").filter(function () {

                                var link = $(this).attr('href');
                                console.log(link);
    
                                return link == "Sin Link";
                            }).each(function () {
                                $(this).replaceWith("<p class='disabled-link'>Sin Link</p>");
                            });
                        }
                    });
                });





                //FIN CARGAR





                //COMIENZO FILTROS



                //INICIO FILTROS

                $('#cargar-mas-filtro-event').hide();

                var offset = 0; // Declarar variable fuera de la función click

                $("body").on("click", "#filtroseventos #filtrar", function () {
                    $('#cargar-mas-event').hide();
                    offset = 0; // Reiniciar offset al hacer una nueva búsqueda
                    $("#evento").empty();

                    var datos = $("form#filtroseventos").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

                    $.ajax({
                        type: "GET",
                        url: "php/eventos/filtrareventos.php",
                        data: datos,
                        dataType: 'json',
                        success: function (data) {
                            mostrarProductos(data); // Mostrar los primeros 6 productos
                            // Mostrar el botón para cargar más productos si hay más de 6 productos
                            if (data.length >= 6) {
                                $('#cargar-mas-filtro-event').show();
                            } else {
                                $('#cargar-mas-filtro-event').hide(); // Ocultar el botón si no hay más productos para mostrar
                            }
                        },
                    });
                });


                $("body").on('keydown', function (e) {
        
                    if (e.keyCode === 13 || e.which === 13) {
                        e.preventDefault();
                        $('#cargar-mas-event').hide();
                        offset = 0; // Reiniciar offset al hacer una nueva búsqueda
                        $("#evento").empty();
    
                        var datos = $("form#filtroseventos").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX
    
                        $.ajax({
                            type: "GET",
                            url: "php/eventos/filtrareventos.php",
                            data: datos,
                            dataType: 'json',
                            success: function (data) {
                                mostrarProductos(data); // Mostrar los primeros 6 productos
                                // Mostrar el botón para cargar más productos si hay más de 6 productos
                                if (data.length >= 6) {
                                    $('#cargar-mas-filtro-event').show();
                                } else {
                                    $('#cargar-mas-filtro-event').hide(); // Ocultar el botón si no hay más productos para mostrar
                                }
                            },
                        });
                    }
                });



                $("body").on("click", "#cargar-mas-filtro-event", function () {
                    $('#cargar-mas-event').hide();
                    offset += 6; // Incrementar offset en 6
                    var datos = $("form#filtroseventos").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

                    $.ajax({
                        type: "GET",
                        url: "php/eventos/filtrareventos.php",
                        data: datos,
                        dataType: 'json',
                        success: function (data) {
                            mostrarProductos(data); // Mostrar los siguientes 6 productos
                            // Mostrar el botón para cargar más productos si hay más de 6 productos
                            if (data.length < 6) {
                                $('#cargar-mas-filtro-event').hide(); // Ocultar el botón si no hay más productos para mostrar
                            }
                        },
                    });
                });

                //FIN FILTROS

                $("body").on("click", "#filtroseventos #quitarfiltrar", function () {
                    $("#filtroseventos #buscar").val("");
                    $("#filtroseventos #fechainicio").val("");
                    $("#filtroseventos #fechafin").val("");
                    $('#cargar-mas-event').hide();
                    offset = 0; // Reiniciar offset al hacer una nueva búsqueda
                    $("#evento").empty();

                    var datos = $("form#filtroseventos").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

                    $.ajax({
                        type: "GET",
                        url: "php/eventos/filtrareventos.php",
                        data: datos,
                        dataType: 'json',
                        success: function (data) {
                            mostrarProductos(data); // Mostrar los primeros 6 productos
                            // Mostrar el botón para cargar más productos si hay más de 6 productos
                            if (data.length >= 6) {
                                $('#cargar-mas-filtro-event').show();
                            } else {
                                $('#cargar-mas-filtro-event').hide(); // Ocultar el botón si no hay más productos para mostrar
                            }
                        },
                    });
                })

                function mostrarProductos(data) {
                    for (var i = 0; i < data.length; i++) {
                        var event = data[i];
                        var fechaini = event.fecha_inicio; // supongamos que esta es tu fecha en formato ISO
                        var fechainicioformat = moment(fechaini).format("DD/MM/YYYY");

                        var fechafin = event.fecha_fin; // supongamos que esta es tu fecha en formato ISO
                        var fechafinformat = moment(fechafin).format("DD/MM/YYYY");
                        $('<div class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">Fecha inicio: ' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">Fecha fin: ' + fechafinformat + '</small></p><div id="btentrar"><input id="entrar" type="button" name="' + event.id + '" value="Entrar" class="btn btn-primary checkout-btn"></div><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div></div></div>').appendTo("#evento");
                    }

                    $("#evento .card a").filter(function () {

                        var link = $(this).attr('href');
                        console.log(link);

                        return link == "Sin Link";
                    }).each(function () {
                        $(this).replaceWith("<p class='disabled-link'>Sin Link</p>");
                    });
                }











            }
            //Menu de Administradores
            else if (datos == "2") {

                // Obtener los primeros 6 productos al cargar la página
                $.ajax({
                    url: 'php/eventos/showeventcargar.php',
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
                            $('<div class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">Fecha inicio: ' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">Fecha fin: ' + fechafinformat + '</small></p><div id="btentrar"><input id="entrar" type="button" name="' + event.id + '" value="Entrar" class="btn btn-primary checkout-btn"></div><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div></div></div>').appendTo("#evento");
                        }
                        // Mostrar el botón para cargar más productos si hay más de 6 productos
                        if (data.length >= 6) {
                            $('#cargar-mas-event').show();
                        }

                        $("#evento .card a").filter(function () {

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

                    var num_productos_mostrados = $('#evento div.card').length;

                    // Cargar los siguientes 6 productos
                    $.ajax({
                        url: 'php/eventos/showeventcargar.php',
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
                                $('<div class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">Fecha inicio: ' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">Fecha fin: ' + fechafinformat + '</small></p><div id="btentrar"><input id="entrar" type="button" name="' + event.id + '" value="Entrar" class="btn btn-primary checkout-btn"></div><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div></div></div>').appendTo("#evento");
                            }

                            // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                            if (data.length < 6) {
                                $('#cargar-mas-event').hide();
                            }

                            $("#evento .card a").filter(function () {

                                var link = $(this).attr('href');
                                console.log(link);
    
                                return link == "Sin Link";
                            }).each(function () {
                                $(this).replaceWith("<p class='disabled-link'>Sin Link</p>");
                            });
                        }
                    });
                });





                //FIN CARGAR





                //COMIENZO FILTROS



                //INICIO FILTROS

                $('#cargar-mas-filtro-event').hide();

                var offset = 0; // Declarar variable fuera de la función click

                $("body").on("click", "#filtroseventos #filtrar", function () {
                    $('#cargar-mas-event').hide();
                    offset = 0; // Reiniciar offset al hacer una nueva búsqueda
                    $("#evento").empty();

                    var datos = $("form#filtroseventos").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

                    $.ajax({
                        type: "GET",
                        url: "php/eventos/filtrareventos.php",
                        data: datos,
                        dataType: 'json',
                        success: function (data) {
                            mostrarProductos(data); // Mostrar los primeros 6 productos
                            // Mostrar el botón para cargar más productos si hay más de 6 productos
                            if (data.length >= 6) {
                                $('#cargar-mas-filtro-event').show();
                            } else {
                                $('#cargar-mas-filtro-event').hide(); // Ocultar el botón si no hay más productos para mostrar
                            }
                        },
                    });
                });

                $("body").on('keydown', function (e) {
        
                    if (e.keyCode === 13 || e.which === 13) {
                        e.preventDefault();
                        $('#cargar-mas-event').hide();
                        offset = 0; // Reiniciar offset al hacer una nueva búsqueda
                        $("#evento").empty();
    
                        var datos = $("form#filtroseventos").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX
    
                        $.ajax({
                            type: "GET",
                            url: "php/eventos/filtrareventos.php",
                            data: datos,
                            dataType: 'json',
                            success: function (data) {
                                mostrarProductos(data); // Mostrar los primeros 6 productos
                                // Mostrar el botón para cargar más productos si hay más de 6 productos
                                if (data.length >= 6) {
                                    $('#cargar-mas-filtro-event').show();
                                } else {
                                    $('#cargar-mas-filtro-event').hide(); // Ocultar el botón si no hay más productos para mostrar
                                }
                            },
                        });
                    }
                });



                $("body").on("click", "#cargar-mas-filtro-event", function () {
                    $('#cargar-mas-event').hide();
                    offset += 6; // Incrementar offset en 6
                    var datos = $("form#filtroseventos").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

                    $.ajax({
                        type: "GET",
                        url: "php/eventos/filtrareventos.php",
                        data: datos,
                        dataType: 'json',
                        success: function (data) {
                            mostrarProductos(data); // Mostrar los siguientes 6 productos
                            // Mostrar el botón para cargar más productos si hay más de 6 productos
                            if (data.length < 6) {
                                $('#cargar-mas-filtro-event').hide(); // Ocultar el botón si no hay más productos para mostrar
                            }
                        },
                    });
                });

                //FIN FILTROS

                $("body").on("click", "#filtroseventos #quitarfiltrar", function () {
                    $("#filtroseventos #buscar").val("");
                    $("#filtroseventos #fechainicio").val("");
                    $("#filtroseventos #fechafin").val("");
                    $('#cargar-mas-event').hide();
                    offset = 0; // Reiniciar offset al hacer una nueva búsqueda
                    $("#evento").empty();

                    var datos = $("form#filtroseventos").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

                    $.ajax({
                        type: "GET",
                        url: "php/eventos/filtrareventos.php",
                        data: datos,
                        dataType: 'json',
                        success: function (data) {
                            mostrarProductos(data); // Mostrar los primeros 6 productos
                            // Mostrar el botón para cargar más productos si hay más de 6 productos
                            if (data.length >= 6) {
                                $('#cargar-mas-filtro-event').show();
                            } else {
                                $('#cargar-mas-filtro-event').hide(); // Ocultar el botón si no hay más productos para mostrar
                            }
                        },
                    });
                })

                function mostrarProductos(data) {
                    for (var i = 0; i < data.length; i++) {
                        var event = data[i];
                        var fechaini = event.fecha_inicio; // supongamos que esta es tu fecha en formato ISO
                        var fechainicioformat = moment(fechaini).format("DD/MM/YYYY");

                        var fechafin = event.fecha_fin; // supongamos que esta es tu fecha en formato ISO
                        var fechafinformat = moment(fechafin).format("DD/MM/YYYY");
                        $('<div class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">Fecha inicio: ' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">Fecha fin: ' + fechafinformat + '</small></p><div id="btentrar"><input id="entrar" type="button" name="' + event.id + '" value="Entrar" class="btn btn-primary checkout-btn"></div><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div></div></div>').appendTo("#evento");
                    }

                    $("#evento .card a").filter(function () {

                        var link = $(this).attr('href');
                        console.log(link);

                        return link == "Sin Link";
                    }).each(function () {
                        $(this).replaceWith("<p class='disabled-link'>Sin Link</p>");
                    });
                }












            }
            //Menu de No artistas
            else if (datos == "3") {

                // Obtener los primeros 6 productos al cargar la página
                $.ajax({
                    url: 'php/eventos/showeventcargar.php',
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
                            $('<div class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">Fecha inicio: ' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">Fecha fin: ' + fechafinformat + '</small></p><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div></div></div>').appendTo("#evento");
                        }
                        // Mostrar el botón para cargar más productos si hay más de 6 productos
                        if (data.length >= 6) {
                            $('#cargar-mas-event').show();
                        }

                        $("#evento .card a").filter(function () {

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

                    var num_productos_mostrados = $('#evento div.card').length;

                    // Cargar los siguientes 6 productos
                    $.ajax({
                        url: 'php/eventos/showeventcargar.php',
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
                                $('<div class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">Fecha inicio: ' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">Fecha fin: ' + fechafinformat + '</small></p><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div></div></div>').appendTo("#evento");
                            }

                            // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                            if (data.length < 6) {
                                $('#cargar-mas-event').hide();
                            }

                            $("#evento .card a").filter(function () {

                                var link = $(this).attr('href');
                                console.log(link);
    
                                return link == "Sin Link";
                            }).each(function () {
                                $(this).replaceWith("<p class='disabled-link'>Sin Link</p>");
                            });
                        }
                    });
                });





                //FIN CARGAR





                //COMIENZO FILTROS



                //INICIO FILTROS

                $('#cargar-mas-filtro-event').hide();

                var offset = 0; // Declarar variable fuera de la función click

                $("body").on("click", "#filtroseventos #filtrar", function () {
                    $('#cargar-mas-event').hide();
                    offset = 0; // Reiniciar offset al hacer una nueva búsqueda
                    $("#evento").empty();

                    var datos = $("form#filtroseventos").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

                    $.ajax({
                        type: "GET",
                        url: "php/eventos/filtrareventos.php",
                        data: datos,
                        dataType: 'json',
                        success: function (data) {
                            mostrarProductos(data); // Mostrar los primeros 6 productos
                            // Mostrar el botón para cargar más productos si hay más de 6 productos
                            if (data.length >= 6) {
                                $('#cargar-mas-filtro-event').show();
                            } else {
                                $('#cargar-mas-filtro-event').hide(); // Ocultar el botón si no hay más productos para mostrar
                            }
                        },
                    });
                });




                $("body").on('keydown', function (e) {
        
                    if (e.keyCode === 13 || e.which === 13) {
                        e.preventDefault();
                        $('#cargar-mas-event').hide();
                        offset = 0; // Reiniciar offset al hacer una nueva búsqueda
                        $("#evento").empty();
    
                        var datos = $("form#filtroseventos").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX
    
                        $.ajax({
                            type: "GET",
                            url: "php/eventos/filtrareventos.php",
                            data: datos,
                            dataType: 'json',
                            success: function (data) {
                                mostrarProductos(data); // Mostrar los primeros 6 productos
                                // Mostrar el botón para cargar más productos si hay más de 6 productos
                                if (data.length >= 6) {
                                    $('#cargar-mas-filtro-event').show();
                                } else {
                                    $('#cargar-mas-filtro-event').hide(); // Ocultar el botón si no hay más productos para mostrar
                                }
                            },
                        });
                    }
                });


                $("body").on("click", "#cargar-mas-filtro-event", function () {
                    $('#cargar-mas-event').hide();
                    offset += 6; // Incrementar offset en 6
                    var datos = $("form#filtroseventos").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

                    $.ajax({
                        type: "GET",
                        url: "php/eventos/filtrareventos.php",
                        data: datos,
                        dataType: 'json',
                        success: function (data) {
                            mostrarProductos(data); // Mostrar los siguientes 6 productos
                            // Mostrar el botón para cargar más productos si hay más de 6 productos
                            if (data.length < 6) {
                                $('#cargar-mas-filtro-event').hide(); // Ocultar el botón si no hay más productos para mostrar
                            }
                        },
                    });
                });

                //FIN FILTROS

                $("body").on("click", "#filtroseventos #quitarfiltrar", function () {
                    $("#filtroseventos #buscar").val("");
                    $("#filtroseventos #fechainicio").val("");
                    $("#filtroseventos #fechafin").val("");
                    $('#cargar-mas-event').hide();
                    offset = 0; // Reiniciar offset al hacer una nueva búsqueda
                    $("#evento").empty();

                    var datos = $("form#filtroseventos").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

                    $.ajax({
                        type: "GET",
                        url: "php/eventos/filtrareventos.php",
                        data: datos,
                        dataType: 'json',
                        success: function (data) {
                            mostrarProductos(data); // Mostrar los primeros 6 productos
                            // Mostrar el botón para cargar más productos si hay más de 6 productos
                            if (data.length >= 6) {
                                $('#cargar-mas-filtro-event').show();
                            } else {
                                $('#cargar-mas-filtro-event').hide(); // Ocultar el botón si no hay más productos para mostrar
                            }
                        },
                    });
                })

                function mostrarProductos(data) {
                    for (var i = 0; i < data.length; i++) {
                        var event = data[i];
                        var fechaini = event.fecha_inicio; // supongamos que esta es tu fecha en formato ISO
                        var fechainicioformat = moment(fechaini).format("DD/MM/YYYY");

                        var fechafin = event.fecha_fin; // supongamos que esta es tu fecha en formato ISO
                        var fechafinformat = moment(fechafin).format("DD/MM/YYYY");
                        $('<div class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">Fecha inicio: ' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">Fecha fin: ' + fechafinformat + '</small></p><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div></div></div>').appendTo("#evento");
                    }

                    $("#evento .card a").filter(function () {

                        var link = $(this).attr('href');
                        console.log(link);

                        return link == "Sin Link";
                    }).each(function () {
                        $(this).replaceWith("<p class='disabled-link'>Sin Link</p>");
                    });
                }













            }
            //Menu adminsitradores de eventos
            else if (datos == "4") {


                // Obtener los primeros 6 productos al cargar la página
                $.ajax({
                    url: 'php/eventos/showeventcargar.php',
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
                            
                            $('<div class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">Fecha inicio: ' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">Fecha fin: ' + fechafinformat + '</small></p><div id="btentrar"><input id="entrar" type="button" name="' + event.id + '" value="Entrar" class="btn btn-primary checkout-btn"></div><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div></div></div>').appendTo("#evento");
                            
                        }
                        // Mostrar el botón para cargar más productos si hay más de 6 productos
                        if (data.length >= 6) {
                            $('#cargar-mas-event').show();
                        }


                        $("#evento .card a").filter(function () {

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

                    var num_productos_mostrados = $('#evento div.card').length;

                    // Cargar los siguientes 6 productos
                    $.ajax({
                        url: 'php/eventos/showeventcargar.php',
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
                                $('<div class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">Fecha inicio: ' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">Fecha fin: ' + fechafinformat + '</small></p><div id="btentrar"><input id="entrar" type="button" name="' + event.id + '" value="Entrar" class="btn btn-primary checkout-btn"></div><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div></div></div>').appendTo("#evento");
                            }

                            // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                            if (data.length < 6) {
                                $('#cargar-mas-event').hide();
                            }

                            $("#evento .card a").filter(function () {

                                var link = $(this).attr('href');
                                console.log(link);
    
                                return link == "Sin Link";
                            }).each(function () {
                                $(this).replaceWith("<p class='disabled-link'>Sin Link</p>");
                            });
                        }
                    });
                });





                //FIN CARGAR





                //COMIENZO FILTROS



                //INICIO FILTROS

                $('#cargar-mas-filtro-event').hide();

                var offset = 0; // Declarar variable fuera de la función click

                $("body").on("click", "#filtroseventos #filtrar", function () {
                    $('#cargar-mas-event').hide();
                    offset = 0; // Reiniciar offset al hacer una nueva búsqueda
                    $("#evento").empty();

                    var datos = $("form#filtroseventos").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

                    $.ajax({
                        type: "GET",
                        url: "php/eventos/filtrareventos.php",
                        data: datos,
                        dataType: 'json',
                        success: function (data) {
                            mostrarProductos(data); // Mostrar los primeros 6 productos
                            // Mostrar el botón para cargar más productos si hay más de 6 productos
                            if (data.length >= 6) {
                                $('#cargar-mas-filtro-event').show();
                            } else {
                                $('#cargar-mas-filtro-event').hide(); // Ocultar el botón si no hay más productos para mostrar
                            }
                        },
                    });
                });


                $("body").on('keydown', function (e) {
        
                    if (e.keyCode === 13 || e.which === 13) {
                        e.preventDefault();
                        $('#cargar-mas-event').hide();
                    offset = 0; // Reiniciar offset al hacer una nueva búsqueda
                    $("#evento").empty();

                    var datos = $("form#filtroseventos").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

                    $.ajax({
                        type: "GET",
                        url: "php/eventos/filtrareventos.php",
                        data: datos,
                        dataType: 'json',
                        success: function (data) {
                            mostrarProductos(data); // Mostrar los primeros 6 productos
                            // Mostrar el botón para cargar más productos si hay más de 6 productos
                            if (data.length >= 6) {
                                $('#cargar-mas-filtro-event').show();
                            } else {
                                $('#cargar-mas-filtro-event').hide(); // Ocultar el botón si no hay más productos para mostrar
                            }
                        },
                    });
                    }
                });



                $("body").on("click", "#cargar-mas-filtro-event", function () {
                    $('#cargar-mas-event').hide();
                    offset += 6; // Incrementar offset en 6
                    var datos = $("form#filtroseventos").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

                    $.ajax({
                        type: "GET",
                        url: "php/eventos/filtrareventos.php",
                        data: datos,
                        dataType: 'json',
                        success: function (data) {
                            mostrarProductos(data); // Mostrar los siguientes 6 productos
                            // Mostrar el botón para cargar más productos si hay más de 6 productos
                            if (data.length < 6) {
                                $('#cargar-mas-filtro-event').hide(); // Ocultar el botón si no hay más productos para mostrar
                            }
                        },
                    });
                });

                //FIN FILTROS

                $("body").on("click", "#filtroseventos #quitarfiltrar", function () {
                    $("#filtroseventos #buscar").val("");
                    $("#filtroseventos #fechainicio").val("");
                    $("#filtroseventos #fechafin").val("");
                    $('#cargar-mas-event').hide();
                    offset = 0; // Reiniciar offset al hacer una nueva búsqueda
                    $("#evento").empty();

                    var datos = $("form#filtroseventos").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

                    $.ajax({
                        type: "GET",
                        url: "php/eventos/filtrareventos.php",
                        data: datos,
                        dataType: 'json',
                        success: function (data) {
                            mostrarProductos(data); // Mostrar los primeros 6 productos
                            // Mostrar el botón para cargar más productos si hay más de 6 productos
                            if (data.length >= 6) {
                                $('#cargar-mas-filtro-event').show();
                            } else {
                                $('#cargar-mas-filtro-event').hide(); // Ocultar el botón si no hay más productos para mostrar
                            }
                        },
                    });
                })

                function mostrarProductos(data) {
                    for (var i = 0; i < data.length; i++) {
                        var event = data[i];
                        var fechaini = event.fecha_inicio; // supongamos que esta es tu fecha en formato ISO
                        var fechainicioformat = moment(fechaini).format("DD/MM/YYYY");

                        var fechafin = event.fecha_fin; // supongamos que esta es tu fecha en formato ISO
                        var fechafinformat = moment(fechafin).format("DD/MM/YYYY");
                        $('<div class="card col-md-3 shadow-sm"><img class="card-img-top" src="' + event.imagen + '" width="300px" height="150px" alt="Evento 1"><div class="card-body"><h4 class="card-title">' + event.nombre + '</h4><p class="card-text">' + event.ubicacion + '</p><p class="card-text"><small class="text-muted"><a href="' + event.link + '">Link a la pagina del evento</a></small></p><p class="card-text"><small class="text-muted">Fecha inicio: ' + fechainicioformat + '</small></p><p class="card-text"><small class="text-muted">Fecha fin: ' + fechafinformat + '</small></p><div id="btentrar"><input id="entrar" type="button" name="' + event.id + '" value="Entrar" class="btn btn-primary checkout-btn"></div><div id="btdetalles"><input id="detalles" type="button" name="' + event.id + '" value="Ver detalles" class="btn btn-primary checkout-btn"></div></div></div>').appendTo("#evento");
                    }

                    $("#evento .card a").filter(function () {

                        var link = $(this).attr('href');
                        console.log(link);

                        return link == "Sin Link";
                    }).each(function () {
                        $(this).replaceWith("<p class='disabled-link'>Sin Link</p>");
                    });
                }











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
















    



    $("#evento").on("click", "#entrar", function () {
        var cod = $(this).parents("#btentrar").find('input[type="button"]').attr('name');
        console.log(cod);
        $.ajax({
            type: "GET",
            url: "php/eventos/enterinevent.php?id=" + cod,
            success: function (datos) {
                console.log(datos);
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

   

    CloseDialogo();

    function CloseDialogo() {
        $("body").on("click", "#close", function () {
            $("#showEvent").css({ "display": "none" });
        })
    }
    var cod;
    $("#evento").on("click", "#detalles", function () {
        $("#detalles ul").empty();
        $("#titulo").empty();
        cod = $(this).parents("#btdetalles").find('input[type="button"]').attr('name');
        $("#showEvent").css({ "display": "block" });
        $.ajax({
            type: "GET",
            url: "php/eventos/showlist.php?id=" + cod,
            success: function (datos) {
                var listado = jQuery.parseJSON(datos);
                var nombre;
                var ubicacion;
                for (var x of listado) {
                    nombre = x.evento_nombre;
                    ubicacion = x.ubicacion;
                    $('<li class="list-group-item">' + x.usuario + '</li>').appendTo("#detalles ul");
                }
                if (nombre != null) {
                    $('<h1 class="display-4">' + nombre + '</h1>').appendTo("#titulo");
                    
                    $("<h2>"+ubicacion+"</h2>").appendTo("#titulo");

                }
                else {

                    $("#titulo").empty();
                    $("<h1>Sin participantes</h1>").appendTo("#titulo");



                }

            }
        });
    })




    function ActualizarListado() {
        $("#detalles ul").empty();
        $("#titulo").empty();
        $.ajax({
            type: "GET",
            url: "php/eventos/showlist.php?id=" + cod,
            success: function (datos) {
                var listado = jQuery.parseJSON(datos);
                var nombre;
                for (var x of listado) {
                    nombre = x.evento_nombre;
                    $('<li class="list-group-item">' + x.usuario + '</li>').appendTo("#detalles ul");
                }
                if (nombre != null) {
                    $('<h1>' + nombre + '</h1>').appendTo("#titulo");

                }
                else {
                    $("#titulo").empty();
                    $("<h1>Sin participantes</h1>").appendTo("#titulo");


                }

            }
        });
    }


    


});