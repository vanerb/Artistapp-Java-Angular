
$(document).ready(function () {
    
    $("#addform #nombre").on("input blur", function() {
        if ($("#addform #nombre").val() == "" || $("#addform #nombre").val().length >= 45 || $("#addform #nombre").val().trim() === "") {
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

    $("#addform #imgpubli").on("input blur", function() {
        if ($("#addform #imgpubli").val() == "") {
            $("#addform #imgpubli").css({ "background-color": "red" })
        }
        else {
            $("#addform #imgpubli").css({ "background-color": "" })
        }

    })




    $("#editform #nombre").on("input blur", function() {
        if ($("#editform #nombre").val() == "" || $("#editform #nombre").val().length >= 45 || $("#editform #nombre").val().trim() === "") {
            $("#editform #nombre").css({ "background-color": "red" })
        }
        else {
            $("#editform #nombre").css({ "background-color": "" })
        }

    })
    $("#editform #descripcion").blur(function () {
        if ($("#editform #descripcion").val() == "" || $("#editform #descripcion").val().length >= 244 || $("#editform #descripcion").val().trim() === "") {
            $("#editform #descripcion").css({ "background-color": "red" })
        }
        else {
            $("#editform #descripcion").css({ "background-color": "" })
        }

    })

    $("#editform #imgpubli").on("input blur", function() {
        if ($("#editform #imgpubli").val() == "") {
            $("#editform #imgpubli").css({ "background-color": "red" })
        }
        else {
            $("#editform #imgpubli").css({ "background-color": "" })
        }

    })



    var coded;

    $.ajax({
        type: "GET",
        url: "php/sesion.php",
        success: function (datos) {
            //  console.log(datos);
            //menu de artistas
            if (datos == "1") {
                $("#editform #imgpublied").css({"display":"none"});
                $("#editform select#tipo").css({"display":"none"});
                $("#editform #megusta").css({"display":"none"});

                $("#editform label[for='tipo']").css({"display":"none"});
                $("#editform label[for='imgpublied']").css({"display":"none"});
                $("#editform label[for='megusta']").css({"display":"none"});



                $("#publishow").css({ "display": "none" });

                $("body").on("click", "#btpubli", function () {
                    // console.log("CLICK");
                    $("#addform").css({ "display": "block" });
                })
                $.ajax({
                    type: "GET",
                    url: "php/publicaciones/showcat.php",
                    success: function (datos) {
                        var listado = jQuery.parseJSON(datos);
                        for (var x of listado) {
                            $("<option value='" + x.id + "'>" + x.nombre + "</option>").appendTo("#editpublicacion #id_categoria");
                            $("<option value='" + x.id + "'>" + x.nombre + "</option>").appendTo("#addpublicacion #id_categoria");

                        }


                    }
                });

                EditPubli(datos);
                FindPubli("#publicacion");

                AddButton();

                //Actualizar(datos);
                CloseDialogo();
                AddPubli(datos);


                DeletePubli("#publicacion", datos);

                ActivarPublicacion("#publicacion", datos);
                DesactivarPublicacion("#publicacion", datos);











                // Obtener los primeros 6 productos al cargar la página
                $.ajax({
                    url: 'php/publicaciones/showpubliusercargar.php',
                    dataType: 'json',
                    success: function (data) {
                        // Mostrar los primeros 6 productos
                        // Mostrar los siguientes 6 productos
                        for (var i = 0; i < data.length; i++) {
                            var publi = data[i];
                            $('<div id="publicarta" class="card col-md-3 shadow-sm"><img src="' + publi.imagen + '" class="card-img-top" alt="..."><div class="card-body"><h5 class="card-title">' + publi.titulo + '</h5><p class="card-text">' + publi.tipo + '</p><div id="bteditar"><input type="button" id="editar" name="' + publi.id + '" value="Editar"></div><div id="btactivar"><input id="activar" class="btn btn-primary" type="button" name="' + publi.id + '" value="Activar"></div><div id="btdesactivar"><input id="desactivar" class="btn btn-primary" type="button" name="' + publi.id + '" value="Desactivar"></div><div id="bteliminar"><input id="eliminar" class="btn btn-primary" type="button" name="' + publi.id + '" value="Eliminar"></div></div></div>').appendTo("#publicacion");


                        }
                        // Mostrar el botón para cargar más productos si hay más de 6 productos
                        if (data.length >= 6) {
                            $('#cargar-mas-publi').show();
                        }

                        $("#publicacion #publicarta").filter(function () {

                            var tipo = $(this).find(".card-text:eq(0)").text();


                            return tipo === "private";
                        }).css({ "background-color": "lightgrey" });



                        $("#publicacion #publicarta").filter(function () {

                            var tipo = $(this).find(".card-text:eq(0)").text();
                            return tipo === "private";
                        }).find("#btdesactivar").css({ "display": "none" });

                        $("#publicacion #publicarta").filter(function () {

                            var tipo = $(this).find(".card-text:eq(0)").text();


                            return tipo === "private";
                        }).find("#btactivar").css({ "display": "block" });



                        $("#publicacion #publicarta").filter(function () {

                            var tipo = $(this).find(".card-text:eq(0)").text();
                            return tipo === "public";
                        }).find("#btactivar").css({ "display": "none" });

                        $("#publicacion #publicarta").filter(function () {

                            var tipo = $(this).find(".card-text:eq(0)").text();


                            return tipo === "public";
                        }).find("#btdesactivar").css({ "display": "block" });

                    }
                });






                // Cuando se hace clic en el botón "Cargar más productos", cargar los siguientes 6 productos
                $('#cargar-mas-publi').click(function () {
                    // Obtener el número de productos ya mostrados

                    var num_productos_mostrados = $('#publicacion div#publicarta').length;

                    // Cargar los siguientes 6 productos
                    $.ajax({
                        url: 'php/publicaciones/showpubliusercargar.php',
                        data: {
                            offset: num_productos_mostrados,
                            limit: 6
                        },
                        dataType: 'json',
                        success: function (data) {
                            // Mostrar los siguientes 6 productos
                            for (var i = 0; i < data.length; i++) {
                                var publi = data[i];
                                $('<div id="publicarta" class="card col-md-3 shadow-sm"><img src="' + publi.imagen + '" class="card-img-top" alt="..."><div class="card-body"><h5 class="card-title">' + publi.titulo + '</h5><p class="card-text">' + publi.tipo + '</p><div id="bteditar"><input type="button" id="editar" name="' + publi.id + '" value="Editar"></div><div id="btactivar"><input id="activar" class="btn btn-primary" type="button" name="' + publi.id + '" value="Activar"></div><div id="btdesactivar"><input id="desactivar" class="btn btn-primary" type="button" name="' + publi.id + '" value="Desactivar"></div><div id="bteliminar"><input id="eliminar" class="btn btn-primary" type="button" name="' + publi.id + '" value="Eliminar"></div></div></div>').appendTo("#publicacion");

                            }

                            // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                            if (data.length < 6) {
                                $('#cargar-mas-publi').hide();
                            }

                            $("#publicacion #publicarta").filter(function () {

                                var tipo = $(this).find(".card-text:eq(0)").text();


                                return tipo === "private";
                            }).css({ "background-color": "lightgrey" });



                            $("#publicacion #publicarta").filter(function () {

                                var tipo = $(this).find(".card-text:eq(0)").text();
                                return tipo === "private";
                            }).find("#btdesactivar").css({ "display": "none" });

                            $("#publicacion #publicarta").filter(function () {

                                var tipo = $(this).find(".card-text:eq(0)").text();


                                return tipo === "private";
                            }).find("#btactivar").css({ "display": "block" });



                            $("#publicacion #publicarta").filter(function () {

                                var tipo = $(this).find(".card-text:eq(0)").text();
                                return tipo === "public";
                            }).find("#btactivar").css({ "display": "none" });

                            $("#publicacion #publicarta").filter(function () {

                                var tipo = $(this).find(".card-text:eq(0)").text();


                                return tipo === "public";
                            }).find("#btdesactivar").css({ "display": "block" });
                        }
                    });
                });





















            }
            //Menu de Administradores
            else if (datos == "2") {
                

                $("#editform #imgpublied").css({"display":"block"});
                $("#editform select#tipo").css({"display":"block"});
                $("#editform #megusta").css({"display":"block"});

                $("#editform label[for='tipo']").css({"display":"block"});
                $("#editform label[for='imgpublied']").css({"display":"block"});
                $("#editform label[for='megusta']").css({"display":"block"});


                $("#cargar-mas-publi").css({ "display": "none" });
                $("<select name='id_usuario' id='id_usuario'>").prependTo("#addpublicacion");
                $("<select name='id_usuario' id='id_usuario'>").prependTo("#editpublicacion");
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


                $("body").on("click", "#anadir", function () {
                    // console.log("CLICK");
                    $("#addform").css({ "display": "block" });
                })

                $.ajax({
                    type: "GET",
                    url: "php/publicaciones/showcat.php",
                    success: function (datos) {
                        var listado = jQuery.parseJSON(datos);
                        for (var x of listado) {
                            $("<option value='" + x.id + "'>" + x.nombre + "</option>").appendTo("#editpublicacion #id_categoria");
                            $("<option value='" + x.id + "'>" + x.nombre + "</option>").appendTo("#addpublicacion #id_categoria");

                        }


                    }
                });

                $.ajax({
                    type: "GET",
                    url: "php/showusers.php",
                    success: function (datos) {
                        var listado1 = jQuery.parseJSON(datos);
                        for (var x of listado1) {
                            $("<option value='" + x.id + "'>" + x.usuario + "</option>").appendTo("#editpublicacion #id_usuario");
                            $("<option value='" + x.id + "'>" + x.usuario + "</option>").appendTo("#addpublicacion #id_usuario");

                        }


                    }
                });

                // Actualizar(datos);
                CloseDialogo();
                AddPubli(datos);

                FindPubli("#publishow");
                EditPubli(datos);

                DeletePubli("#publishow", datos);
            }
            //Menu de No artistas
            else if (datos == "3") {
                window.location.href = "index.html";


            }
            //Menu adminsitradores de eventos
            else if (datos == "4") {

                $("#editform #imgpublied").css({"display":"none"});
                $("#editform select#tipo").css({"display":"none"});
                $("#editform #megusta").css({"display":"none"});

                $("#editform label[for='tipo']").css({"display":"none"});
                $("#editform label[for='imgpublied']").css({"display":"none"});
                $("#editform label[for='megusta']").css({"display":"none"});

                $("#publishow").css({ "display": "none" });
                $("body").on("click", "#btpubli", function () {
                    //  console.log("CLICK");
                    $("#addform").css({ "display": "block" });
                })
                $.ajax({
                    type: "GET",
                    url: "php/publicaciones/showcat.php",
                    success: function (datos) {
                        var listado = jQuery.parseJSON(datos);
                        for (var x of listado) {
                            $("<option value='" + x.id + "'>" + x.nombre + "</option>").appendTo("#editpublicacion #id_categoria");
                            $("<option value='" + x.id + "'>" + x.nombre + "</option>").appendTo("#addpublicacion #id_categoria");

                        }


                    }
                });


                AddButton();
                FindPubli("#publicacion");

                EditPubli(datos);

                //Actualizar(datos);
                CloseDialogo();
                AddPubli(datos);


                DeletePubli("#publicacion", datos);
                ActivarPublicacion("#publicacion", datos);
                DesactivarPublicacion("#publicacion", datos);


                // Obtener los primeros 6 productos al cargar la página
                $.ajax({
                    url: 'php/publicaciones/showpubliusercargar.php',
                    dataType: 'json',
                    success: function (data) {
                        // Mostrar los primeros 6 productos
                        // Mostrar los siguientes 6 productos
                        for (var i = 0; i < data.length; i++) {
                            var publi = data[i];
                            $('<div id="publicarta" class="card col-md-3 shadow-sm"><img src="' + publi.imagen + '" class="card-img-top" alt="..."><div class="card-body"><h5 class="card-title">' + publi.titulo + '</h5><p class="card-text">' + publi.tipo + '</p><div id="bteditar"><input type="button" id="editar" name="' + publi.id + '" value="Editar"></div><div id="btactivar"><input id="activar" class="btn btn-primary" type="button" name="' + publi.id + '" value="Activar"></div><div id="btdesactivar"><input id="desactivar" class="btn btn-primary" type="button" name="' + publi.id + '" value="Desactivar"></div><div id="bteliminar"><input id="eliminar" class="btn btn-primary" type="button" name="' + publi.id + '" value="Eliminar"></div></div></div>').appendTo("#publicacion");


                        }
                        // Mostrar el botón para cargar más productos si hay más de 6 productos
                        if (data.length >= 6) {
                            $('#cargar-mas-publi').show();
                        }

                        $("#publicacion #publicarta").filter(function () {

                            var tipo = $(this).find(".card-text:eq(0)").text();


                            return tipo === "private";
                        }).css({ "background-color": "lightgrey" });




                        $("#publicacion #publicarta").filter(function () {

                            var tipo = $(this).find(".card-text:eq(0)").text();
                            return tipo === "private";
                        }).find("#btdesactivar").css({ "display": "none" });

                        $("#publicacion #publicarta").filter(function () {

                            var tipo = $(this).find(".card-text:eq(0)").text();


                            return tipo === "private";
                        }).find("#btactivar").css({ "display": "block" });



                        $("#publicacion #publicarta").filter(function () {

                            var tipo = $(this).find(".card-text:eq(0)").text();
                            return tipo === "public";
                        }).find("#btactivar").css({ "display": "none" });

                        $("#publicacion #publicarta").filter(function () {

                            var tipo = $(this).find(".card-text:eq(0)").text();


                            return tipo === "public";
                        }).find("#btdesactivar").css({ "display": "block" });
                    }
                });

                // Cuando se hace clic en el botón "Cargar más productos", cargar los siguientes 6 productos
                $('#cargar-mas-publi').click(function () {
                    // Obtener el número de productos ya mostrados

                    var num_productos_mostrados = $('#publicacion div#publicarta').length;

                    // Cargar los siguientes 6 productos
                    $.ajax({
                        url: 'php/publicaciones/showpubliusercargar.php',
                        data: {
                            offset: num_productos_mostrados,
                            limit: 6
                        },
                        dataType: 'json',
                        success: function (data) {
                            // Mostrar los siguientes 6 productos
                            for (var i = 0; i < data.length; i++) {
                                var publi = data[i];
                                $('<div id="publicarta" class="card col-md-3 shadow-sm"><img src="' + publi.imagen + '" class="card-img-top" alt="..."><div class="card-body"><h5 class="card-title">' + publi.titulo + '</h5><p class="card-text">' + publi.tipo + '</p><div id="bteditar"><input type="button" id="editar" name="' + publi.id + '" value="Editar"></div><div id="btactivar"><input id="activar" class="btn btn-primary" type="button" name="' + publi.id + '" value="Activar"></div><div id="btdesactivar"><input id="desactivar" class="btn btn-primary" type="button" name="' + publi.id + '" value="Desactivar"></div><div id="bteliminar"><input id="eliminar" class="btn btn-primary" type="button" name="' + publi.id + '" value="Eliminar"></div></div></div>').appendTo("#publicacion");

                            }

                            // Ocultar el botón de "Cargar más productos" si ya no hay más productos por mostrar
                            if (data.length < 6) {
                                $('#cargar-mas-publi').hide();
                            }

                            $("#publicacion #publicarta").filter(function () {

                                var tipo = $(this).find(".card-text:eq(0)").text();


                                return tipo === "private";
                            }).css({ "background-color": "lightgrey" });


                            $("#publicacion #publicarta").filter(function () {

                                var tipo = $(this).find(".card-text:eq(0)").text();
                                return tipo === "private";
                            }).find("#btdesactivar").css({ "display": "none" });

                            $("#publicacion #publicarta").filter(function () {

                                var tipo = $(this).find(".card-text:eq(0)").text();


                                return tipo === "private";
                            }).find("#btactivar").css({ "display": "block" });



                            $("#publicacion #publicarta").filter(function () {

                                var tipo = $(this).find(".card-text:eq(0)").text();
                                return tipo === "public";
                            }).find("#btactivar").css({ "display": "none" });

                            $("#publicacion #publicarta").filter(function () {

                                var tipo = $(this).find(".card-text:eq(0)").text();


                                return tipo === "public";
                            }).find("#btdesactivar").css({ "display": "block" });
                        }
                    });
                });

            }
        }

    });
    function AddButton() {
        $("<button id='btpubli'>Añadir</button>").appendTo("#botones");
    }


    function FindPubli(target) {
        $(target).on("click", "#editar", function () {
            coded = $(this).parents("#bteditar").find('input[type="button"]').attr('name');
            // console.log(coded);
            $("#editform").css({ "display": "block" });
            $.ajax({
                type: "GET",
                url: "php/publicaciones/findpubligeneral.php?id=" + coded,
                success: function (datos) {
                    var listado = jQuery.parseJSON(datos);
                    for (var x of listado) {
                        $("#editpublicacion input[type='text']:eq(0)").val(x.titulo);
                        $("#editpublicacion input[type='text']:eq(1)").val(x.descripcion);
                        $("#editpublicacion #tipo").val(x.tipo);
                        $("#editpublicacion #id_categoria").val(x.id_categoria);
                        $("#editpublicacion #id_usuario").val(x.id_usuario);
                        $("#editpublicacion input[type='number']:eq(0)").val(x.megusta);
                        $("#editpublicacion input[type='hidden']:eq(0)").val(x.imagen);

                        $("#editform #imgpublied").val("");
                    }


                }
            });

        });
    }



    function ActivarPublicacion(target, tipo) {
        $(target).on("click", "#activar", function () {
            var cod = $(this).parents("#btactivar").find('input[type="button"]').attr('name');
            //  console.log(cod);

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
                                url: "php/publicaciones/activardesactivarpubli.php?id=" + cod,
                                success: function (datos) {
                                    //  console.log(datos);
                                    Actualizar(tipo);

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



    function DesactivarPublicacion(target, tipo) {
        $(target).on("click", "#desactivar", function () {
            var cod = $(this).parents("#btdesactivar").find('input[type="button"]').attr('name');
            //  console.log(cod);

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
                                url: "php/publicaciones/activardesactivarpubli.php?id=" + cod,
                                success: function (datos) {
                                    //  console.log(datos);
                                    Actualizar(tipo);

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

    function DeletePubli(target, tipo) {
        if (tipo == 2) {
            $(target).on("click", "#borrar", function () {
                var cod = $(this).parents("#btborrar").find('input[type="button"]').attr('name');
                //  console.log(cod);

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
                                    url: "php/publicaciones/deletepubli.php?id=" + cod,
                                    success: function (datos) {
                                        //  console.log(datos);
                                        cargarDatos(1);

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
        else {
            $(target).on("click", "#eliminar", function () {
                var cod = $(this).parents("#bteliminar").find('input[type="button"]').attr('name');
                //  console.log(cod);

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
                                    url: "php/publicaciones/deletepubli.php?id=" + cod,
                                    success: function (datos1) {
                                        console.log(datos1);
                                        Actualizar(tipo);

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

    }

    function EditPubli(tipo) {
        $("#editpublicacion").on("click", "#btedit", function (e) {



            e.preventDefault();
            var data = new FormData();

            //Form data
            var form_data = $('#editpublicacion').serializeArray();
            $.each(form_data, function (key, input) {
                data.append(input.name, input.value);
            });

            var file_data = $('input[name="imgpublied"]')[0].files;
            for (var i = 0; i < file_data.length; i++) {
                data.append("imgpublied[]", file_data[i]);
            }

            //  console.log(coded);
            //Custom data
            data.append('key', 'value');
            $.ajax({
                url: 'php/publicaciones/editpubli.php?id=' + coded, // point to server-side PHP script 
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
                        }
                        else {
                            Actualizar(tipo);
                        }

                        $("#editform").css({ "display": "none" });

                    }
                    else if (php_script_response == "error1") {
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
                    else if (php_script_response == "error8" || php_script_response == "") {
                        $("<div></div>").appendTo("body")
                            .html("<div><h3>El número de me gustas no puede ser menor a la actual</h3></div>")
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

    function AddPubli(tipo) {
        $("#addpublicacion").on("click", "#btadd", function (e) {
            e.preventDefault();
            var data = new FormData();

            //Form data
            var form_data = $('#addpublicacion').serializeArray();
            $.each(form_data, function (key, input) {
                data.append(input.name, input.value);
            });

            var file_data = $('input[name="imgpubli"]')[0].files;
            for (var i = 0; i < file_data.length; i++) {
                data.append("imgpubli[]", file_data[i]);
            }

            //Custom data
            data.append('key', 'value');
            $.ajax({
                url: 'php/publicaciones/addpubli.php', // point to server-side PHP script 
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
                            $("#addform #id_usuario").prop('selectedIndex', 0);
                        }
                        else {
                            Actualizar(tipo);
                        }

                        $("#addform").css({ "display": "none" });
                        $("#addform #nombre").val("");
                        $("#addform #descripcion").val("");
                        $("#addform #tipo").prop('selectedIndex', 0);
                        $("#addform #nombre").val("");
                        $("#addform #id_categoria").prop('selectedIndex', 0);
                        $("#addform #imgpubli").val("");

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
                            .html("<div><h3>Se ha superado el límite de caracteres</h3></div>")
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

    function CloseDialogo() {
        $("body").on("click", "#close", function () {
            $("#addform").css({ "display": "none" });
            $("#editform").css({ "display": "none" });
        })
    }

    function Actualizar(tipo) {

        $("#publicacion").empty();
        // Obtener los primeros 6 productos al cargar la página
        $.ajax({
            url: 'php/publicaciones/showpubliusercargar.php',
            dataType: 'json',
            success: function (data) {
                // Mostrar los primeros 6 productos
                // Mostrar los siguientes 6 productos
                for (var i = 0; i < data.length; i++) {
                    var publi = data[i];
                    $('<div id="publicarta" class="card col-md-3 shadow-sm"><img src="' + publi.imagen + '" class="card-img-top" alt="..."><div class="card-body"><h5 class="card-title">' + publi.titulo + '</h5><p class="card-text">' + publi.tipo + '</p><div id="bteditar"><input type="button" id="editar" name="' + publi.id + '" value="Editar"></div><div id="btactivar"><input id="activar" class="btn btn-primary" type="button" name="' + publi.id + '" value="Activar"></div><div id="btdesactivar"><input id="desactivar" class="btn btn-primary" type="button" name="' + publi.id + '" value="Desactivar"></div><div id="bteliminar"><input id="eliminar" class="btn btn-primary" type="button" name="' + publi.id + '" value="Eliminar"></div></div></div>').appendTo("#publicacion");

                }
                // Mostrar el botón para cargar más productos si hay más de 6 productos
                if (data.length >= 6) {
                    $('#cargar-mas-publi').show();
                }

                $("#publicacion #publicarta").filter(function () {

                    var tipo = $(this).find(".card-text:eq(0)").text();


                    return tipo === "private";
                }).css({ "background-color": "lightgrey" });


                $("#publicacion #publicarta").filter(function () {

                    var tipo = $(this).find(".card-text:eq(0)").text();
                    return tipo === "private";
                }).find("#btdesactivar").css({ "display": "none" });

                $("#publicacion #publicarta").filter(function () {

                    var tipo = $(this).find(".card-text:eq(0)").text();


                    return tipo === "private";
                }).find("#btactivar").css({ "display": "block" });



                $("#publicacion #publicarta").filter(function () {

                    var tipo = $(this).find(".card-text:eq(0)").text();
                    return tipo === "public";
                }).find("#btactivar").css({ "display": "none" });

                $("#publicacion #publicarta").filter(function () {

                    var tipo = $(this).find(".card-text:eq(0)").text();


                    return tipo === "public";
                }).find("#btdesactivar").css({ "display": "block" });
            }
        });


    }





    function cargarDatos(pagina) {
        var $tabla = $('#tablapubli');
        var $paginacion = $('#paginacion');
        $.ajax({
            url: 'php/publicaciones/showpubligeneral.php',
            data: { offset: (pagina - 1) * 6, limit: 6 },
            dataType: 'json',
            success: function (response) {
                var datos = response.data;
                var totalPaginas = response.totalPaginas;
                var htmlTabla = '';
                for (var i = 0; i < datos.length; i++) {

                    htmlTabla += '<tr>';
                    htmlTabla += '<td>' + datos[i].id + '</td>';
                    htmlTabla += '<td>' + datos[i].titulo + '</td>';
                    htmlTabla += '<td>' + datos[i].descripcion + '</td>';
                    htmlTabla += '<td>' + datos[i].tipo + '</td>';
                    htmlTabla += '<td>' + datos[i].catnom + '</td>';
                    htmlTabla += '<td>' + datos[i].usuario + '</td>';
                    htmlTabla += '<td>' + datos[i].megusta + '</td>';
                    htmlTabla += '<td><img src="' + datos[i].imagen + '" width="100px" height="100px"></td>';
                    htmlTabla += "<td><div id='btborrar'><input type='button' data-id='" + datos[i].id + "' id='borrar' name='" + datos[i].id + "' value='Eliminar'></div></td>";
                    htmlTabla += "<td><div id='bteditar'><input type='button' data-id='" + datos[i].id + "' id='editar' name='" + datos[i].id + "' value='Editar'></div></td>";
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


                $("#tablapubli tbody tr").each(function () {
                    var tipopubli = $(this).find("td:eq(3)").text();
                    console.log(tipopubli);
                    if (tipopubli == "private") {
                        $(this).addClass("publi-privada");
                    }
                });
            },
            error: function (xhr, status, error) {
                console.log("Error al cargar los datos: " + error);
            }
        });
    }












});