
$(document).ready(function () {

    //ActualizarPubli();


    //COMIENZO CARGAR


    // Obtener los primeros 6 productos al cargar la página
    $.ajax({
        url: 'php/publicaciones/showpublicargar.php',
        dataType: 'json',
        success: function (data) {
            // Mostrar los primeros 6 productos
            // Mostrar los siguientes 6 productos
            for (var i = 0; i < data.length; i++) {
                var publi = data[i];
                $('<div id="imgver" class="col-md-3 card shadow-sm"><div id="' + publi.id + '" class="carta"><img src="' + publi.imagen + '" class="card-img-top" alt="..." width="350px" height="200px"></div><div class="card-body"><h5 class="card-title">' + publi.titulo + '</h5></div></div>').appendTo("#publicacion")
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

        var num_productos_mostrados = $('#publicacion div#imgver').length;

        // Cargar los siguientes 6 productos
        $.ajax({
            url: 'php/publicaciones/showpublicargar.php',
            data: {
                offset: num_productos_mostrados,
                limit: 6
            },
            dataType: 'json',
            success: function (data) {
                // Mostrar los siguientes 6 productos
                for (var i = 0; i < data.length; i++) {
                    var publi = data[i];
                    $('<div id="imgver" class="col-md-3 card shadow-sm"><div id="' + publi.id + '" class="carta"><img src="' + publi.imagen + '" class="card-img-top" alt="..." width="350px" height="200px"></div><div class="card-body"><h5 class="card-title">' + publi.titulo + '</h5></div></div>').appendTo("#publicacion")
                }

                // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                if (data.length < 6) {
                    $('#cargar-mas-publi').hide();
                }
            }
        });
    });





    //FIN CARGAR





    //COMIENZO FILTROS



    //INICIO FILTROS

    $('#cargar-mas-filtro-publi').hide();

    var offset = 0; // Declarar variable fuera de la función click

    $("body").on("click", "#filtrospubli #filtrar", function () {
        $('#cargar-mas-publi').hide();
        offset = 0; // Reiniciar offset al hacer una nueva búsqueda
        $("#publicacion").empty();

        var datos = $("form#filtrospubli").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

        $.ajax({
            type: "GET",
            url: "php/publicaciones/filtrarpubli.php",
            data: datos,
            dataType: 'json',
            success: function (data) {
                mostrarProductos(data); // Mostrar los primeros 6 productos
                // Mostrar el botón para cargar más productos si hay más de 6 productos
                if (data.length >= 6) {
                    $('#cargar-mas-filtro-publi').show();
                } else {
                    $('#cargar-mas-filtro-publi').hide(); // Ocultar el botón si no hay más productos para mostrar
                }
            },
        });
    });


    //QUE SE ACTUALICE CON LAS TECLAS
    $("body").on('keydown', function (e) {
        
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            // Aquí puedes ejecutar la acción que deseas realizar
            $('#cargar-mas-publi').hide();
            offset = 0; // Reiniciar offset al hacer una nueva búsqueda
            $("#publicacion").empty();

            var datos = $("form#filtrospubli").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

            $.ajax({
                type: "GET",
                url: "php/publicaciones/filtrarpubli.php",
                data: datos,
                dataType: 'json',
                success: function (data) {
                    mostrarProductos(data); // Mostrar los primeros 6 productos
                    // Mostrar el botón para cargar más productos si hay más de 6 productos
                    if (data.length >= 6) {
                        $('#cargar-mas-filtro-publi').show();
                    } else {
                        $('#cargar-mas-filtro-publi').hide(); // Ocultar el botón si no hay más productos para mostrar
                    }
                },
            });
        }


    });



    $("body").on("click", "#cargar-mas-filtro-publi", function () {
        $('#cargar-mas-publi').hide();
        offset += 6; // Incrementar offset en 6
        var datos = $("form#filtrospubli").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

        $.ajax({
            type: "GET",
            url: "php/publicaciones/filtrarpubli.php",
            data: datos,
            dataType: 'json',
            success: function (data) {
                mostrarProductos(data); // Mostrar los siguientes 6 productos
                // Mostrar el botón para cargar más productos si hay más de 6 productos
                if (data.length < 6) {
                    $('#cargar-mas-filtro-publi').hide(); // Ocultar el botón si no hay más productos para mostrar
                }
            },
        });
    });

    function mostrarProductos(data) {
        for (var i = 0; i < data.length; i++) {
            var publi = data[i];
            $('<div id="imgver" class="col-md-3 card shadow-sm"><div id="' + publi.id + '" class="carta"><img src="' + publi.imagen + '" class="card-img-top" alt="..." width="350px" height="200px"></div><div class="card-body"><h5 class="card-title">' + publi.titulo + '</h5></div></div>').appendTo("#publicacion")
        }
    }


    //FIN FILTROS

    $("body").on("click", "#quitarfiltrar", function () {
        $("#filtrospubli #categoria").val("");
        $("#filtrospubli #buscar").val("");
        $('#cargar-mas-publi').hide();
        offset = 0; // Reiniciar offset al hacer una nueva búsqueda
        $("#publicacion").empty();

        var datos = $("form#filtrospubli").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

        $.ajax({
            type: "GET",
            url: "php/publicaciones/filtrarpubli.php",
            data: datos,
            dataType: 'json',
            success: function (data) {
                mostrarProductos(data); // Mostrar los primeros 6 productos
                // Mostrar el botón para cargar más productos si hay más de 6 productos
                if (data.length >= 6) {
                    $('#cargar-mas-filtro-publi').show();
                } else {
                    $('#cargar-mas-filtro-publi').hide(); // Ocultar el botón si no hay más productos para mostrar
                }
            },
        });
    })







    //FIN FILTROS

















    var cod;

    $("body").on("click", "#imgver", function () {
        $("#verimagen").css({ "display": "block" });
        cod = $(this).find(".carta").attr('id');
        // console.log(cod);
        ActualizarPanel(cod);


    })

    $.ajax({
        type: "GET",
        url: "php/publicaciones/showcat.php",
        success: function (datos) {
            $("<option value=''>Todo</option>").appendTo("#categoria");

            var categorias = jQuery.parseJSON(datos);
            for (var x of categorias) {
                $("<option value='" + x.id + "'>" + x.nombre + "</option>").appendTo("#categoria");
            }
        },
    });







    $("#publiver").on("click", "#btlike", function () {


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
                                $("#btlikediv").css({ "display": "none" });
                                $("#btdislikediv").css({ "display": "block" });

                            }
                            else if (x.megusta == 0) {
                                $("#btlikediv").css({ "display": "block" });
                                $("#btdislikediv").css({ "display": "none" });
                            }
                            else {
                                $("#btlikediv").css({ "display": "block" });
                                $("#btdislikediv").css({ "display": "none" });
                            }
                        }

                    }
                });

            }
        });


    });



    $("#publiver").on("click", "#btdislike", function () {
        var cod = $(this).parents("#btdislikediv").find('input[type="button"]').attr('name');
        console.log(cod);

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
                                $("#btlikediv").css({ "display": "none" });
                                $("#btdislikediv").css({ "display": "block" });

                            }
                            else if (x.megusta == 0) {
                                $("#btlikediv").css({ "display": "block" });
                                $("#btdislikediv").css({ "display": "none" });
                            }
                            else {
                                $("#btlikediv").css({ "display": "block" });
                                $("#btdislikediv").css({ "display": "none" });
                            }
                        }

                    }
                });

            }
        });



    });


    function ActualizarPanel(cod) {
        $("#publiver").empty();
        $.ajax({
            type: "GET",
            url: "php/publicaciones/findpubligeneral.php?id=" + cod,
            success: function (datos) {
                var listado = jQuery.parseJSON(datos);
                for (var x of listado) {
                    $("<div class='row'><div class='col-md-12'><img src='" + x.imagen + "'></div></div><div class='row'><div class='col-md-12'><h1>" + x.titulo + "</h1><hr></div></div><div class='row'><div class='col-md-12'><h2>" + x.descripcion + "</h2></div></div><div class='row'><div class='col-md-6'><p>Usuario: " + x.usuario + "</p></div><div class='col-md-6'><p>Categoría: " + x.catnom + "</p></div></div><div id='megusta' class='row'><div class='col-md-12'><img src='media/corazon.png' width='64px' height='64px'><p>" + x.megusta + "<p></div></div>").appendTo("#publiver");
                    $.ajax({
                        type: "GET",
                        url: "php/publicaciones/showlikespubli.php?id=" + cod,
                        success: function (usuario) {

                            var listado = jQuery.parseJSON(usuario);
                            for (var x of listado) {
                                // console.log(x.megusta);
                                if (x.megusta == 1) {
                                    $("#btlikediv").css({ "display": "none" });
                                    $("#btdislikediv").css({ "display": "block" });

                                }
                                else if (x.megusta == 0) {
                                    $("#btlikediv").css({ "display": "block" });
                                    $("#btdislikediv").css({ "display": "none" });
                                }
                                else {
                                    $("#btlikediv").css({ "display": "block" });
                                    $("#btdislikediv").css({ "display": "none" });
                                }
                            }

                        }
                    });
                    $("<div id='btlikediv' style='display: block'><input id='btlike' type='button' name='" + x.id + "' value='Like'></div>").appendTo("#publiver")
                    $("<div id='btdislikediv' style='display: none'><input id='btdislike' type='button' name='" + x.id + "' value='Dislike'></div>").appendTo("#publiver")

                }


            },
            error: function (xhr) {
                alert("Atencion: se ha producido un error");
                $("#mensaje1").append(xhr.statusText + xhr.responseText);
            },
        });
    }

    $("body").on("click", "#close", function () {
        $("#verimagen").css({ "display": "none" });
    })






});