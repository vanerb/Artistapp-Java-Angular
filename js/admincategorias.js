
$(document).ready(function () {

   
    $("#addcat #nombre").on("input blur", function() {
        if ($("#addcat #nombre").val() == "" || $("#addcat #nombre").val().trim() === "" || $("#addcat #nombre").val().length >= 50) {
            $("#addcat #nombre").css({ "background-color": "red" })
        }
        else {
            $("#addcat #nombre").css({ "background-color": "" })
        }

    })

    $("#editcat #nombre").on("input blur", function() {
        if ($("#editcat #nombre").val() == "" || $("#editcat #nombre").val().trim() === "" || $("#editcat #nombre").val().length >= 50) {
            $("#editcat #nombre").css({ "background-color": "red" })
        }
        else {
            $("#editcat #nombre").css({ "background-color": "" })
        }

    })

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
                // console.log("ADMIn");
                //MostrarCategorias();
                cargarDatos(1);
                AddCategoria();
                OcultarDialogo();
                DeleteCategoria();
                EditCategoria();




            }
            //Menu de No artistas
            else if (datos == "3") {
                //console.log("ADMIn");
                window.location.href = "index.html";

            }
            //Menu adminsitradores de eventos
            else if (datos == "4") {
                //console.log("ADMIn");
                window.location.href = "index.html";

            }

        },
    });

    function OcultarDialogo() {
        $("body").on("click", "#close", function () {
            $("#editform").css({ "display": "none" });
            $("#addform").css({ "display": "none" });
        })


    }


    function cargarDatos(pagina) {
        var $tabla = $('#categorias');
        var $paginacion = $('#paginacion');
        $.ajax({
            url: 'php/categorias/categorias.php',
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


    function AddCategoria() {
        $("body").on("click", "#anadir", function () {
            $("#addform").css({ "display": "block" });
        })

        $("#addcat").on("click", "#btadd", function () {
            var data = $("form#addcat").serialize();
            // console.log(data);
            $.ajax({
                type: "GET",
                data: data,
                url: "php/categorias/addcategoria.php",
                success: function (datos) {
                    if (datos == "added") {
                        $("#addform").css({ "display": "none" });
                        //MostrarCategorias();
                        cargarDatos(1);
                        $("#addform #nombre").val("");
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
                            .html("<div><h3>La categoría ya existe</h3></div>")
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
                    else if (datos == "error3" || datos == "") {
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


                    // console.log(datos);

                },
            });
        })

    }


    function EditCategoria() {
        var cod;
        $("body").on("click", "#editar", function () {
            cod = $(this).parents("#categorias td").find('input[type="button"]').attr('name');

            $("#editform").css({ "display": "block" });

            $.ajax({
                type: "GET",
                url: "php/categorias/findcategory.php?id=" + cod,
                success: function (datos) {
                    var pedidos = jQuery.parseJSON(datos);
                    for (var x of pedidos) {
                        $("#editcat").find("input[type='text']:eq(0)").val(x.nombre);
                    }
                },
            });

        })

        $("body").on("click", "#btedit", function () {
            // console.log(cod);
            var data = $("form#editcat").serialize();

            $.ajax({
                type: "GET",
                data: data,
                url: "php/categorias/editcategory.php?id=" + cod,
                success: function (datos) {
                    if (datos == "added") {
                        //MostrarCategorias();
                        cargarDatos(1);
                        $("#editform").css({ "display": "none" });

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
                            .html("<div><h3>La categoría ya existe</h3></div>")
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
                    else if (datos == "error3" || datos == "") {
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


                },
            });
        })
    }

    function DeleteCategoria() {

        $("body").on("click", "#borrar", function () {
            var cod = $(this).parents("#categorias td").find('input[type="button"]').attr('name');


            $("<div></div>").appendTo("body")
                .html("<div><h3>¿Está seguro?</h3></div>")
                .dialog({
                    resizable: false,
                    modal: true,
                    title: "Confirmar",
                    buttons: {
                        "Sí": function () {
                            // Si se confirma, hacer algo
                            //  console.log(cod);
                            $.ajax({
                                type: "GET",
                                url: "php/categorias/deletecategory.php?id=" + cod,
                                success: function (datos) {
                                    //MostrarCategorias();
                                    if(datos == "deleted"){
                                        cargarDatos(1);
                                    }
                                    else if(datos == "error1"){
                                        $("<div></div>").appendTo("body")
                                        .html("<div><h3>Esta categoría esta asociada a una publicación</h3></div>")
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