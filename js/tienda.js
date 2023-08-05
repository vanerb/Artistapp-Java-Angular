

$(document).ready(function () {
    
    //document.oncontextmenu = function () { return false; }
    document.addEventListener('contextmenu', function (e) {
        if (e.target.nodeName === 'IMG') {
            e.preventDefault();
        }
    }, false);


    //INICIO FILTROS

    $('#cargar-mas-filtro').hide();

    var offset = 0; // Declarar variable fuera de la función click

    $("body").on("click", "#filtrar", function () {
        $('#cargar-mas').hide();
        offset = 0; // Reiniciar offset al hacer una nueva búsqueda
        $("#productos").empty();

        var datos = $("form#filtros").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

        $.ajax({
            type: "GET",
            url: "php/tienda/filtros.php",
            data: datos,
            dataType: 'json',
            success: function (data) {
                mostrarProductos(data); // Mostrar los primeros 6 productos
                // Mostrar el botón para cargar más productos si hay más de 6 productos
                if (data.length >= 6) {
                    $('#cargar-mas-filtro').show();
                } else {
                    $('#cargar-mas-filtro').hide(); // Ocultar el botón si no hay más productos para mostrar
                }
            },
        });
    });


    $("body").on('keypress', function (e) {

        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $('#cargar-mas').hide();
            offset = 0; // Reiniciar offset al hacer una nueva búsqueda
            $("#productos").empty();
    
            var datos = $("form#filtros").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX
    
            $.ajax({
                type: "GET",
                url: "php/tienda/filtros.php",
                data: datos,
                dataType: 'json',
                success: function (data) {
                    mostrarProductos(data); // Mostrar los primeros 6 productos
                    // Mostrar el botón para cargar más productos si hay más de 6 productos
                    if (data.length >= 6) {
                        $('#cargar-mas-filtro').show();
                    } else {
                        $('#cargar-mas-filtro').hide(); // Ocultar el botón si no hay más productos para mostrar
                    }
                },
            });
        }
    });


    $("body").on("click", "#cargar-mas-filtro", function () {
        $('#cargar-mas').hide();
        offset += 6; // Incrementar offset en 6
        var datos = $("form#filtros").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

        $.ajax({
            type: "GET",
            url: "php/tienda/filtros.php",
            data: datos,
            dataType: 'json',
            success: function (data) {
                mostrarProductos(data); // Mostrar los siguientes 6 productos
                // Mostrar el botón para cargar más productos si hay más de 6 productos
                if (data.length < 6) {
                    $('#cargar-mas-filtro').hide(); // Ocultar el botón si no hay más productos para mostrar
                }
            },
        });
    });

    function mostrarProductos(data) {
        for (var i = 0; i < data.length; i++) {
            var producto = data[i];
            if (producto.imagen != "media/no-item.png") {
                var imagen = producto.imagen;
                var cadena = imagen.split("/");
                $('#productos').append('<div id="product"  class="col-md-4"><div class="card" id="' + producto.id + '"><img src="imglowres/low' + cadena[1] + '" class="card-img-top" alt="Producto 1" height="300px"><div class="card-body"><h5 class="card-title">' + producto.nombre + '</h5><p class="card-text">' + producto.precio + ' €</p><div id="btcomprar"><input value="Ver detalles" id="comprar" class="btn btn-primary" type="button" name="' + producto.id + '"></div></div></div></div>');
            }
            else {
                $('#productos').append('<div id="product"  class="col-md-4"><div class="card" id="' + producto.id + '"><img src="' + producto.imagen + '" class="card-img-top" alt="Producto 1" height="300px"><div class="card-body"><h5 class="card-title">' + producto.nombre + '</h5><p class="card-text">' + producto.precio + ' €</p><div id="btcomprar"><input value="Ver detalles" id="comprar" class="btn btn-primary" type="button" name="' + producto.id + '"></div></div></div></div>');
            }
        }
    }


    //FIN FILTROS

    $("body").on("click", "#quitarfiltrar", function () {
        $("#filtros #buscar").val("");
        $("#filtros #precio").val("");
        $("#filtros #tipo").val("");
        $('#cargar-mas').hide();
        offset = 0; // Reiniciar offset al hacer una nueva búsqueda
        $("#productos").empty();

        var datos = $("form#filtros").serialize() + '&offset=' + offset + "&limit=" + 6; // Incluir offset en los datos enviados por AJAX

        $.ajax({
            type: "GET",
            url: "php/tienda/filtros.php",
            data: datos,
            dataType: 'json',
            success: function (data) {
                mostrarProductos(data); // Mostrar los primeros 6 productos
                // Mostrar el botón para cargar más productos si hay más de 6 productos
                if (data.length >= 6) {
                    $('#cargar-mas-filtro').show();
                } else {
                    $('#cargar-mas-filtro').hide(); // Ocultar el botón si no hay más productos para mostrar
                }
            },
        });
    })

    $.ajax({
        type: "GET",
        url: "php/productos/showtipo.php",
        success: function (datos) {
            $("<option value=''>Todo</option>").appendTo("select#tipo");

            var productos = jQuery.parseJSON(datos);
            for (var x of productos) {
                $("<option value='" + x.id + "'>" + x.nombre + "</option>").appendTo("select#tipo");
            }

        },
    });



    //EMPUEZA CARGAR


    // Obtener los primeros 6 productos al cargar la página
    $.ajax({
        url: 'php/productos/showproductcargar.php',
        dataType: 'json',
        success: function (data) {
            // Mostrar los primeros 6 productos
            // Mostrar los siguientes 6 productos
            for (var i = 0; i < data.length; i++) {
                var producto = data[i];
                if (producto.imagen != "media/no-item.png") {
                    var imagen = producto.imagen;
                    var cadena = imagen.split("/");
                    $('#productos').append('<div id="product"  class="col-md-4"><div class="card" id="' + producto.id + '"><img src="imglowres/low' + cadena[1] + '" class="card-img-top" alt="Producto 1" height="300px"><div class="card-body"><h5 class="card-title">' + producto.nombre + '</h5><p class="card-text">' + producto.precio + ' €</p><div id="btcomprar"><input value="Ver detalles" id="comprar" class="btn btn-primary" type="button" name="' + producto.id + '"></div></div></div></div>');
                }
                else {
                    $('#productos').append('<div id="product"  class="col-md-4"><div class="card" id="' + producto.id + '"><img src="' + producto.imagen + '" class="card-img-top" alt="Producto 1" height="300px"><div class="card-body"><h5 class="card-title">' + producto.nombre + '</h5><p class="card-text">' + producto.precio + ' €</p><div id="btcomprar"><input value="Ver detalles" id="comprar" class="btn btn-primary" type="button" name="' + producto.id + '"></div></div></div></div>');
                }

            }
            // Mostrar el botón para cargar más productos si hay más de 6 productos
            if (data.length >= 6) {
                $('#cargar-mas').show();
            }
        }
    });

    // Cuando se hace clic en el botón "Cargar más productos", cargar los siguientes 6 productos
    $('#cargar-mas').click(function () {
        // Obtener el número de productos ya mostrados

        var num_productos_mostrados = $('#productos div#product').length;

        // Cargar los siguientes 6 productos
        $.ajax({
            url: 'php/productos/showproductcargar.php',
            data: {
                offset: num_productos_mostrados,
                limit: 6
            },
            dataType: 'json',
            success: function (data) {
                // Mostrar los siguientes 6 productos
                for (var i = 0; i < data.length; i++) {

                    var producto = data[i];
                    if (producto.imagen != "media/no-item.png") {
                        var imagen = producto.imagen;
                        var cadena = imagen.split("/");
                        $('#productos').append('<div id="product"  class="col-md-4"><div class="card" id="' + producto.id + '"><img src="imglowres/low' + cadena[1] + '" class="card-img-top" alt="Producto 1" height="300px"><div class="card-body"><h5 class="card-title">' + producto.nombre + '</h5><p class="card-text">' + producto.precio + ' €</p><div id="btcomprar"><input value="Ver detalles" id="comprar" class="btn btn-primary" type="button" name="' + producto.id + '"></div></div></div></div>');
                    }
                    else {
                        $('#productos').append('<div id="product"  class="col-md-4"><div class="card" id="' + producto.id + '"><img src="' + producto.imagen + '" class="card-img-top" alt="Producto 1" height="300px"><div class="card-body"><h5 class="card-title">' + producto.nombre + '</h5><p class="card-text">' + producto.precio + ' €</p><div id="btcomprar"><input value="Ver detalles" id="comprar" class="btn btn-primary" type="button" name="' + producto.id + '"></div></div></div></div>');
                    }
                }

                // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                if (data.length < 6) {
                    $('#cargar-mas').hide();
                }
            }
        });
    });


    //FIN CARGAR








    
    var codp
    $("#productos").on("click", "#product", function () {
        $("#detalles").empty();
        codp = $(this).find(".card").attr('id');
        $("#showprod").css({ "display": "block" });
        // console.log(codp);
        $.ajax({
            type: "GET",
            url: "php/productos/detalleproductshow.php?id=" + codp,
            success: function (datos) {
                var detalles = jQuery.parseJSON(datos);
                for (var x of detalles) {
                    if (x.imagen != "media/no-item.png") {
                        var imagen = x.imagen;
                        var cadena = imagen.split("/");
                        $('<h1>' + x.nombre + '</h1><hr><div class="row"><div class="col-md-6"><img src="imglowres/low' + cadena[1] + '" alt="Imagen del producto" width="250px" height="350px"></div><div class="col-md-6"><p>' + x.descripcion + '</p></div></div><hr><div class="row"><div class="col-md-12"><h2>' + x.precio + ' €</h2></div></div><br><div class="row"><div id="btcomprar" class="col-md-12"><input type="button" name="' + x.id + '" id="comprar" class="btn btn-primary w-100" value="Añadir al carrito"></div></div>').appendTo("#detalles");
                    }
                    else {
                        $('<h1>' + x.nombre + '</h1><hr><div class="row"><div class="col-md-6"><img src="' + x.imagen + '" alt="Imagen del producto" width="250px" height="350px"></div><div class="col-md-6"><p>' + x.descripcion + '</p></div></div><hr><div class="row"><div class="col-md-12"><h2>' + x.precio + ' €</h2></div></div><br><div class="row"><div id="btcomprar" class="col-md-12"><input type="button" name="' + x.id + '" id="comprar" class="btn btn-primary w-100" value="Añadir al carrito"></div></div>').appendTo("#detalles");
                    }

                }

            }
        });
    })


    CloseDialogo();

    function CloseDialogo() {
        $("body").on("click", "#close", function () {
            $("#showprod").css({ "display": "none" });

        })
    }


    $("#detalles").on("click", "#comprar", function () {
        // console.log("CLICKKK");
        var cod = $(this).parents("#btcomprar").find('input[type="button"]').attr('name');
        // console.log(cod);
        $.ajax({
            type: "GET",
            url: "php/tienda/comprar.php?id_producto=" + cod,
            success: function (datos) {
                if (datos == "error1") {
                    $("<div></div>").appendTo("body")
                        .html("<div><h3>Ya ha agregado este elemento</h3></div>")
                        .dialog({
                            resizable: false,
                            modal: true,
                            title: "Error",
                            buttons: {
                                "Aceptar": function () {

                                    $(this).dialog("close");
                                }
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

    

    cargarDatosPedidos(1);


    function cargarDatosPedidos(pagina) {
        var $tabla = $('#pedidos');
        var $paginacion = $('#paginacion');
        $.ajax({
            url: 'php/tienda/showpedidos.php',
            data: { offset: (pagina - 1) * 6, limit: 6 },
            dataType: 'json',
            success: function (response) {
                var datos = response.data;
                var totalPaginas = response.totalPaginas;
                var htmlTabla = '';
                for (var i = 0; i < datos.length; i++) {
                    htmlTabla += '<tr>';
                    //htmlTabla += '<td>' + datos[i].id + '</td>';
                    htmlTabla += '<td>' + datos[i].usuario + '</td>';
                    htmlTabla += '<td>' + datos[i].nombre + '</td>';
                    htmlTabla += '<td>' + datos[i].precio + '</td>';
                    htmlTabla += '<td>' + datos[i].estado + '</td>';
                    htmlTabla += '<td><input type="button" data-id="' + datos[i].id + '" id="devolver" name="' + datos[i].id + ',' + datos[i].prod_id + '" value="Devolver"></td>';
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

    $(document).on('click', '.pagina', function () {
        cargarDatosPedidos($(this).data('pagina'));
    });



   

    $("#pedidos").on("click", "#devolver", function () {

        var cod = $(this).parents("#pedidos tbody td").find('input[type="button"]').attr('name');
        //  console.log(cod);
        var prods = cod.split(",");
        $("<div></div>").appendTo("body")
            .html("<div><h3>¿Estás seguro de que quieres devolver el producto?</h3></div>")
            .dialog({
                resizable: false,
                modal: true,
                title: "Confirmacion",
                buttons: {
                    "Si": function () {


                        $.ajax({
                            type: "GET",
                            url: "php/pedidos/devolverpedidos.php?id=" + prods[0] + "&id_prod=" + prods[1],
                            success: function (datos) {
                                cargarDatosPedidos(1);
                            },
                        });
                        $(this).dialog("close");
                    },
                    "No": function () {
                        // Si se confirma, hacer algo

                        $(this).dialog("close");
                    },

                },
                close: function () {
                    // Si se cierra el diálogo, quitarlo del DOM
                    $(this).remove();
                }
            });






    })

    var cod;
    $("#pedidosdigitales").on("click", "#descarga", function () {
        var imagenruta;
        cod = $(this).parents("#pedidosdigitales tbody td").find('input[type="button"]').attr('name');
        // console.log(cod);
        $.ajax({
            type: "GET",
            url: "php/tienda/findpedidodigital.php?id=" + cod,
            success: function (datos) {
                var productos = jQuery.parseJSON(datos);
                for (var x of productos) {
                    $.ajax({
                        url: x.archivos,
                        method: 'GET',
                        xhrFields: {
                            responseType: 'blob' // Especificar que la respuesta es un objeto blob
                        },
                        success: function (response) {
                            var nombre;
                            nombre = x.archivos;
                            console.log(nombre);
                            var nombreArchivo = nombre.split('/').pop();
                            var extension = nombreArchivo.split('.').pop();
                            console.log(extension); // esto mostrará 'jpg' en la consola

                            // Crear un objeto URL a partir de la respuesta
                            var blobUrl = URL.createObjectURL(response);

                            // Crear un enlace de descarga y asignar el objeto URL a su propiedad href
                            var downloadLink = $('<a>', {
                                href: blobUrl,
                                download: 'descarga.' + extension
                            }).appendTo('body');

                            // Hacer clic en el enlace de descarga para iniciar la descarga
                            downloadLink[0].click();

                            // Eliminar el enlace de descarga del DOM
                            downloadLink.remove();

                            // Liberar el objeto URL de la memoria
                            URL.revokeObjectURL(blobUrl);
                        },
                        error: function () {
                            // console.log('Error al descargar la imagen');
                        }
                    });

                }
            },

        });



    })

    cargarDatosPedidosDigitales(1);
    function cargarDatosPedidosDigitales(pagina) {
        var $tabla = $('#pedidosdigitales');
        var $paginacion = $('#paginaciondigital');
        $.ajax({
            url: 'php/tienda/showpedidosdigitales.php',
            data: { offset: (pagina - 1) * 6, limit: 6 },
            dataType: 'json',
            success: function (response) {
                var datos = response.data;
                var totalPaginas = response.totalPaginas;
                var htmlTabla = '';
                for (var i = 0; i < datos.length; i++) {
                    htmlTabla += '<tr>';
                    //htmlTabla += '<td>' + datos[i].id + '</td>';
                    htmlTabla += '<td>' + datos[i].usuario + '</td>';
                    htmlTabla += '<td>' + datos[i].nombre + '</td>';
                    htmlTabla += '<td>' + datos[i].precio + '</td>';
                    htmlTabla += '<td><input data-id="' + datos[i].id + '" name="' + datos[i].id_producto + '" value="Descargar" type="button" id="descarga"></td>';
                    htmlTabla += '</tr>';
                }
                $tabla.find('tbody').html(htmlTabla);
                // Actualizar la paginación
                var htmlPaginacion = '<ul class="pagination">';
                for (var i = 1; i <= totalPaginas; i++) {
                    htmlPaginacion += '<li><button class="pagina1" data-pagina="' + i + '">' + i + '</button></li>';
                }
                htmlPaginacion += '</ul>';
                $paginacion.html(htmlPaginacion);
                $paginacion.find('.pagina1').removeClass('active');
                $paginacion.find('.pagina1[data-pagina="' + pagina + '"]').addClass('active');
            },
            error: function (xhr, status, error) {
                console.log("Error al cargar los datos: " + error);
            }
        });
    }

    $(document).on('click', '.pagina1', function () {
        cargarDatosPedidosDigitales($(this).data('pagina'));
    });


   



});