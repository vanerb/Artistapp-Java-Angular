
$(document).ready(function () {

     //document.oncontextmenu = function () { return false; }
     document.addEventListener('contextmenu', function (e) {
        if (e.target.nodeName === 'IMG') {
            e.preventDefault();
        }
    }, false);


    $("#addform #nombre").on("input blur", function() {
        if ($("#addform #nombre").val() == "" || $("#addform #nombre").val().length >= 30 || $("#addform #nombre").val().trim() === "") {
            $("#addform #nombre").css({ "background-color": "red" })
        }
        else {
            $("#addform #nombre").css({ "background-color": "" })
        }

    })
    $("#addform #descripcion").on("input blur", function() {
        if ($("#addform #descripcion").val() == "" || $("#addform #descripcion").val().length >= 244 || $("#addform #descripcion").val().trim() === "") {
            $("#addform #descripcion").css({ "background-color": "red" })
        }
        else {
            $("#addform #descripcion").css({ "background-color": "" })
        }

    })

    $("#addform #precio").on("input blur", function() {
        if ($("#addform #precio").val() == "" || $("#addform #precio").val().trim() === "") {
            $("#addform #precio").css({ "background-color": "red" })
        }
        else {
            $("#addform #precio").css({ "background-color": "" })
        }

    })

    $("#addform #cantidad").on("input blur", function() {
        if ($("#addform #cantidad").val() == "" || $("#addform #cantidad").val().trim() === "") {
            $("#addform #cantidad").css({ "background-color": "red" })
        }
        else {
            $("#addform #cantidad").css({ "background-color": "" })
        }

    })



    $("#editform #nombre").on("input blur", function() {
        if ($("#editform #nombre").val() == "" || $("#editform #nombre").val().length >= 30 || $("#editform #nombre").val().trim() === "") {
            $("#editform #nombre").css({ "background-color": "red" })
        }
        else {
            $("#editform #nombre").css({ "background-color": "" })
        }

    })
    $("#editform #descripcion").on("input blur", function() {
        if ($("#editform #descripcion").val() == "" || $("#editform #descripcion").val().length >= 244 || $("#editform #descripcion").val().trim() === "") {
            $("#editform #descripcion").css({ "background-color": "red" })
        }
        else {
            $("#editform #descripcion").css({ "background-color": "" })
        }

    })

    $("#editform #precio").on("input blur", function() {
        if ($("#editform #precio").val() == "" || $("#editform #precio").val().trim() === "") {
            $("#editform #precio").css({ "background-color": "red" })
        }
        else {
            $("#editform #precio").css({ "background-color": "" })
        }

    })

    $("#editform #cantidad").on("input blur", function() {
        if ($("#editform #cantidad").val() == "" || $("#editform #cantidad").val().trim() === "") {
            $("#editform #cantidad").css({ "background-color": "red" })
        }
        else {
            $("#editform #cantidad").css({ "background-color": "" })
        }

    })



    

    $.ajax({
        type: "GET",
        url: "php/sesion.php",
        success: function (datos) {
            // console.log(datos);
            //menu de artistas
            if (datos == "1") {
                $("#editform label[for='tipo']").css({"display":"none"});
                $("#editform #tipo").css({"display":"none"});


                cargarDatosUsuario(1);
                var cod;
                AddProductShow();
                CloseDialogo();
                OcultarDialogos();
                rellenarTipo();
                BorrarProduct(datos);


                BuscarProduct(datos);


                EditProduct(datos);



                AddProducto(datos);
                $("#addform #tipo").val(0);
                $("#addform #archivo").css({ "display": "none" });
                $(document).on('click', '.pagina', function () {
                    cargarDatosUsuario($(this).data('pagina'));
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
            //Menu de Administradores
            else if (datos == "2") {
                $("#editform label[for='tipo']").css({"display":"none"});
                $("#editform #tipo").css({"display":"none"});
                cargarDatosAdmin(1);
                var cod;
                AddProductShow();
                CloseDialogo();
                OcultarDialogos();
                rellenarTipo();

                //ActualizarProductos(datos);



                BorrarProduct(datos);

                BuscarProduct(datos);


                EditProduct(datos);


                AddProducto(datos);

                $("<select name='id_usuario' id='id_usuario'></select>").prependTo("#addproduct");
                $("<select name='id_usuario' id='id_usuario'></select>").prependTo("#editproduct");

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
                $("#addform #tipo").val(0);
                $("#addform #archivo").css({ "display": "none" });
                $(document).on('click', '.pagina', function () {
                    cargarDatosAdmin($(this).data('pagina'));
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
                
                window.location.href = "index.html";

            }
            //Menu adminsitradores de eventos
            else if (datos == "4") {
                $("#editform label[for='tipo']").css({"display":"none"});
                $("#editform #tipo").css({"display":"none"});
                var cod;
                AddProductShow();
                CloseDialogo();
                OcultarDialogos();
                rellenarTipo();
                BorrarProduct(datos);


                BuscarProduct(datos);

                EditProduct(datos);

                cargarDatosUsuario(1)


                AddProducto(datos);
                $(document).on('click', '.pagina', function () {
                    cargarDatosUsuario($(this).data('pagina'));
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

            function AddProductShow() {
                $("#productosshow").on("click", "#anadir", function () {
                    $("#editform").css({ "display": "none" });
                    $("#addform").css({ "display": "block" });

                    $("#addform #tipo").val(1);

                    $("#addform #archivo").css({ "display": "none" });

                    $("#addform #tipo").change(function () {
                        if ($("#addform #tipo").val() == 1) {
                            $("#addform #archivo").css({ "display": "none" });
                        }
                        else {
                            $("#addform #archivo").css({ "display": "block" });

                        }
                    })
                })
            }

            function CloseDialogo() {
                $("body").on("click", "#close", function () {
                    $("#editform").css({ "display": "none" });
                    $("#addform").css({ "display": "none" });
                })
            }

            function OcultarDialogos() {
                $("#editform").css({ "display": "none" });
                $("#addform").css({ "display": "none" });
                $("#archivo").css({ "display": "none" });



            }

            function BuscarProduct(tipo) {

                $("#productosshow").on("click", "#editar", function () {
                    $("#editform").css({ "display": "block" });
                    $("#addform").css({ "display": "none" });


                    cod = $(this).parents("#productosshow table td").find('input[type="button"]').attr('name');
                    console.log(cod);
                    $.ajax({
                        type: "GET",
                        url: "php/productos/findproduct.php?id=" + cod,
                        success: function (datos) {
                            var productos = jQuery.parseJSON(datos);
                            for (var x of productos) {
                                if (tipo == 2) {
                                    $("#editform #archivoedit").css({ "display": "none" });
                                    $("#editform #tipo").change(function () {
                                        if ($("#editform #tipo").val() == 1) {
                                            $("#editform #archivoedit").css({ "display": "none" });

                                        }
                                        else {
                                            $("#editform #archivoedit").css({ "display": "block" });

                                        }
                                    })
                                    $("#editproduct input[type='text']:eq(0)").val(x.nombre);
                                    $("#editproduct input[type='text']:eq(1)").val(x.descripcion);
                                    $("#editproduct input[type='number']:eq(0)").val(x.precio);
                                    $("#editproduct input[type='number']:eq(1)").val(x.cantidad);
                                    $("#editproduct input[type='hidden']:eq(0)").val(x.imagen);
                                    $("#editproduct input[type='hidden']:eq(1)").val(x.archivos);
                                    $("#editproduct #tipo").val(x.id_tipo);

                                    $("#editproduct #id_usuario").val(x.id_usuario);
                                    if ($("#editform #tipo").val() == 1) {
                                        $("#editform #archivoedit").css({ "display": "none" });
                                    }
                                    else {
                                        $("#editform #archivoedit").css({ "display": "block" });

                                    }


                                    $("#editform #archivoedit").val("");
                                    $("#editform #imagen1").val("");

                                }
                                else {
                                    $("#editform #archivoedit").css({ "display": "none" });
                                    $("#editform #tipo").change(function () {
                                        if ($("#editform #tipo").val() == 1) {
                                            $("#editform #archivoedit").css({ "display": "none" });
                                        }
                                        else {
                                            $("#editform #archivoedit").css({ "display": "block" });

                                        }
                                    })
                                    $("#editproduct input[type='text']:eq(0)").val(x.nombre);
                                    $("#editproduct input[type='text']:eq(1)").val(x.descripcion);
                                    $("#editproduct input[type='number']:eq(0)").val(x.precio);
                                    $("#editproduct input[type='number']:eq(1)").val(x.cantidad);
                                    $("#editproduct input[type='hidden']:eq(0)").val(x.imagen);
                                    $("#editproduct input[type='hidden']:eq(1)").val(x.archivos);

                                    $("#editproduct #tipo").val(x.id_tipo);
                                    if ($("#editform #tipo").val() == 1) {
                                        $("#editform #archivoedit").css({ "display": "none" });
                                    }
                                    else {
                                        $("#editform #archivoedit").css({ "display": "block" });

                                    }


                                    $("#editform #archivoedit").val("");
                                    $("#editform #imagen1").val("");
                                }


                            }

                        },
                    });
                });
            }


            function cargarDatosUsuario(pagina) {

                var $tabla = $('#productosshowtabla');
                var $paginacion = $('#paginacion');
                $.ajax({
                    url: 'php/productos/showproduct.php',
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
                            htmlTabla += '<td>' + datos[i].descripcion + '</td>';
                            htmlTabla += '<td>' + datos[i].precio + '</td>';
                            htmlTabla += '<td>' + datos[i].cantidad + '</td>';
                            var imagen = datos[i].imagen;
                            var cadena = imagen.split("/");
                            if(imagen == "media/no-item.png"){
                                htmlTabla += '<td><img src="' + imagen + '" width="100px" height="100px"></td>';
                            }
                            else{
                                htmlTabla += '<td><img src="imglowres/low' + cadena[1] + '" width="100px" height="100px"></td>';
                            }
                            
                            htmlTabla += '<td>' + datos[i].tipo + '</td>';
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

            function cargarDatosAdmin(pagina) {
                var $tabla = $('#productosshowtabla');
                var $paginacion = $('#paginacion');
                $.ajax({
                    url: 'php/productos/showproductadmin.php',
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
                            htmlTabla += '<td>' + datos[i].descripcion + '</td>';
                            htmlTabla += '<td>' + datos[i].precio + '</td>';
                            htmlTabla += '<td>' + datos[i].cantidad + '</td>';
                            var imagen = datos[i].imagen;
                            var cadena = imagen.split("/");
                            if(imagen == "media/no-item.png"){
                                htmlTabla += '<td><img src="' + imagen + '" width="100px" height="100px"></td>';
                            }
                            else{
                                htmlTabla += '<td><img src="imglowres/low' + cadena[1] + '" width="100px" height="100px"></td>';
                            }
                            htmlTabla += '<td>' + datos[i].tipo + '</td>';
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









            function BorrarProduct(tipo) {
                $("#productosshow").on("click", "#borrar", function () {
                    var cod = $(this).parents("#productosshow table td").find('input[type="button"]').attr('name');
                    //    console.log(cod);


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
                                        url: "php/productos/deleteproduct.php?id=" + cod,
                                        success: function (datos) {
                                            console.log(datos);
                                            if (datos == "1") {
                                                if (tipo == 2) {
                                                    cargarDatosAdmin(1);
                                                }
                                                else {
                                                    cargarDatosUsuario(1);
                                                }
                                                //$("#editproduct").css({ "display": "none" })
                                            }
                                            else if (datos == "error1" || datos == "") {
                                                $("<div></div>").appendTo("body")
                                                    .html("<div><h3>No se puede eliminar</h3></div>")
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

            function EditProduct(tipo) {
                $("#editproduct").on("click", "#btedit", function (e) {
                    e.preventDefault();
                    var data = new FormData();
                    // console.log(cod);
                    //Form data
                    var form_data = $('#editproduct').serializeArray();
                    $.each(form_data, function (key, input) {
                        data.append(input.name, input.value);
                    });

                    var file_data = $('input[name="imagen1"]')[0].files;
                    for (var i = 0; i < file_data.length; i++) {
                        data.append("imagen1[]", file_data[i]);
                    }

                    var file_data1 = $('input[name="archivoedit"]')[0].files;
                    for (var i = 0; i < file_data1.length; i++) {
                        data.append("archivoedit[]", file_data1[i]);
                    }
                    //Custom data
                    data.append('key', 'value');
                    $.ajax({
                        url: 'php/productos/editproduct.php?id=' + cod, // point to server-side PHP script 
                        dataType: 'text',  // what to expect back from the PHP script, if anything
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: data,
                        type: 'post',
                        success: function (php_script_response) {
                            if (php_script_response == "added") {

                                if (tipo == 2) {
                                    cargarDatosAdmin(1);
                                }
                                else {
                                    cargarDatosUsuario(1);
                                }
                                $("#editproduct input[type='text']:eq(0)").val("");
                                $("#editproduct input[type='text']:eq(1)").val("");
                                $("#editproduct input[type='number']:eq(0)").val("");
                                $("#editproduct input[type='number']:eq(1)").val("");
                                $("#editproduct input[type='hidden']:eq(0)").val("");
                                $("#editproduct input[type='hidden']:eq(1)").val("");
                                $("#editproduct select:eq(0)").val(0);
                                $("#editform").css({ "display": "none" });
                                $("#editform #archivoedit").css({ "display": "none" });

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
                                            }
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
                                    .html("<div><h3>Se ha superado el límite de carácteres</h3></div>")
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

                            else if (php_script_response == "error9" || php_script_response == "") {
                                $("<div></div>").appendTo("body")
                                    .html("<div><h3>Los números tienen que ser mayores o iguales a 0</h3></div>")
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

            function AddProducto(tipo) {
                $("#addproduct").on("click", "#btadd", function (e) {
                    e.preventDefault();
                    var data = new FormData();

                    //Form data
                    var form_data = $('#addproduct').serializeArray();
                    $.each(form_data, function (key, input) {
                        data.append(input.name, input.value);
                    });

                    var file_data = $('input[name="imagen"]')[0].files;
                    for (var i = 0; i < file_data.length; i++) {
                        data.append("imagen[]", file_data[i]);
                    }

                    var file_data1 = $('input[name="archivo"]')[0].files;
                    for (var i = 0; i < file_data1.length; i++) {
                        data.append("archivo[]", file_data1[i]);
                    }

                    //Custom data
                    data.append('key', 'value');
                    $.ajax({
                        url: 'php/productos/addproduct.php', // point to server-side PHP script 
                        dataType: 'text',  // what to expect back from the PHP script, if anything
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: data,
                        type: 'post',
                        success: function (php_script_response) {
                            console.log(php_script_response);
                            if (php_script_response == "added") {

                                if (tipo == 2) {
                                    cargarDatosAdmin(1);
                                    $("#addform #id_usuario").prop('selectedIndex', 0);
                                }
                                else {
                                    cargarDatosUsuario(1);
                                }
                                $("#addform").css({ "display": "none" });
                                $("#addform #nombre").val("");
                                $("#addform #descripcion").val("");
                                $("#addform #precio").val("");
                                $("#addform #cantidad").val("");
                                $("#addform #imagen").val("");
                                $("#addform #archivo").val("");
                                $("#addform #imagen").val("");
                                $("#addform #tipo").prop('selectedIndex', 0);

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
                                            }
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
                                    .html("<div><h3>Se ha superado el límite de carácteres</h3></div>")
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

                            else if (php_script_response == "error9" || php_script_response == "") {
                                $("<div></div>").appendTo("body")
                                    .html("<div><h3>Los números tienen que ser mayores o iguales a 0</h3></div>")
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

            function rellenarTipo() {
                $.ajax({
                    type: "GET",
                    url: "php/productos/showtipo.php",
                    success: function (datos) {
                        var productos_tipo = jQuery.parseJSON(datos);
                        for (var x of productos_tipo) {
                            $("<option value='" + x.id + "'>" + x.nombre + "</option>").appendTo("#addproduct select#tipo");
                        }
                    },
                });

                $.ajax({
                    type: "GET",
                    url: "php/productos/showtipo.php",
                    success: function (datos) {
                        var productos_tipo = jQuery.parseJSON(datos);
                        for (var x of productos_tipo) {
                            $("<option value='" + x.id + "'>" + x.nombre + "</option>").appendTo("#editproduct select#tipo");
                        }
                    },
                });
            }

        },
    });



});