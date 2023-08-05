
$(document).ready(function () {
   
    $("#nombre").on("input blur", function() {
        if ($("#nombre").val() == "" || $("#nombre").val().length >= 80 || $("#nombre").val().trim() === "") {
            $("#nombre").css({ "background-color": "red" })
        }
        else {
            $("#nombre").css({ "background-color": "" })
        }

    })

    $("#direccion").on("input blur", function() {
        if ($("#direccion").val().length >= 244 || $("#direccion").val().trim() === "") {
            $("#direccion").css({ "background-color": "red" })
        }
        else {
            $("#direccion").css({ "background-color": "" })
        }

    })

    $("#telefono").on("input blur", function() {
        if ($("#telefono").val().length >= 15 || $("#telefono").val().trim() === "") {
            $("#telefono").css({ "background-color": "red" })
        }
        else {
            $("#telefono").css({ "background-color": "" })
        }

    })


    $("#fechainicio").on("input blur", function() {
        if ($("#fechainicio").val() == "") {
            $("#fechainicio").css({ "background-color": "red" })
        }
        else {
            $("#fechainicio").css({ "background-color": "" })
        }

    })

    $("#fechafin").on("input blur", function() {
        if ($("#fechafin").val() == "") {
            $("#fechafin").css({ "background-color": "red" })
        }
        else {
            $("#fechafin").css({ "background-color": "" })
        }

    })

    



    $.ajax({
        type: "GET",
        url: "php/sesion.php",
        success: function (datos) {
            // console.log(datos);
            //menu de artistas
            if (datos == "1") {
                var buscar;

                $("#editform").css({ "display": "none" });

                //ActualizarPedido("#pedidosadmin", datos);
                cargarDatosUsuario(1);

                var codi;


                $("#pedidosadmin").on("click", "#verpedido", function () {
                    codi = $(this).parents("#pedidosadmin td").find('input[type="button"]').attr('name');

                    

                    //ActualizarPedidosProducto("#pedidosproductos", datos, codi);
                    cargarDatosProductoUsuario(1, codi);
                    $("#verpedidosindv").css({ "display": "block" });
                    $(document).on('click', '.pagina', function () {
                        
                        cargarDatosProductoUsuario($(this).data('pagina'), codi);
                    });

                    console.log(cod);
                });


                RellenarSelectUser();


                $("body").on("click", "#close", function () {
                    $("#editform").css({ "display": "none" });
                    $("#verpedidosindv").css({ "display": "none" });
                })

                BuscarPedido("#pedidosadmin");
                EditarPedido(datos);

                EliminarPedido("#pedidosadmin", datos, codi);
                Devolver("#pedidosproductos", datos, codi);

                $(document).on('click', '.pagina', function () {
                    cargarDatosUsuario($(this).data('pagina'));
                });

              

            }
            //Menu de Administradores
            else if (datos == "2") {
                var buscar;
                var codi;
                $("#editform").css({ "display": "none" });

                //ActualizarPedido("#pedidosadmin", datos);
                cargarDatosAdministrador(1);

                $("#pedidosadmin").on("click", "#verpedido", function () {
                    var codi = $(this).parents("#pedidosadmin td").find('input[type="button"]').attr('name');

                    cargarDatoProductoAdmin(1, codi);

                    console.log(codi);
                    $("#verpedidosindv").css({ "display": "block" });
                    $(document).on('click', '.pagina', function () {
                        cargarDatoProductoAdmin($(this).data('pagina'), codi);
                    });

                    

                });



                $("body").on("click", "#close", function () {
                    $("#editform").css({ "display": "none" });
                    $("#verpedidosindv").css({ "display": "none" });

                })

                BuscarPedido("#pedidosadmin");
                RellenarSelectUser();
                EliminarPedido("#pedidosadmin", datos, codi);

                EditarPedido(datos);
                Devolver("#pedidosproductos", datos, codi)

                $(document).on('click', '.pagina', function () {
                    cargarDatosAdministrador($(this).data('pagina'));
                });

               


            }
            //Menu de No artistas
            else if (datos == "3") {
                window.location.href = "index.html";
            }
            //Menu adminsitradores de eventos
            else if (datos == "4") {
                var buscar;
                var codi;
                $("#editform").css({ "display": "none" });
                cargarDatosUsuario(1);
                // ActualizarPedido("#pedidosadmin", datos);
                
                $("#pedidosadmin").on("click", "#verpedido", function () {
                    var codi = $(this).parents("#pedidosadmin td").find('input[type="button"]').attr('name');
                    cargarDatosProductoUsuario(1, codi);

                    $("#pedidosadmin").on('click', '.pagina', function () {
                        cargarDatosProductoUsuario($(this).data('pagina'), codi);
                    });
                    $("#verpedidosindv").css({ "display": "block" });

                 
                });




                RellenarSelectUser();


                $("body").on("click", "#close", function () {
                    $("#editform").css({ "display": "none" });
                    $("#verpedidosindv").css({ "display": "none" });

                })

                BuscarPedido("#pedidosadmin");
                EditarPedido(datos);
                EliminarPedido("#pedidosadmin", datos, codi);
                Devolver("#pedidosproductos", datos, codi)
                $(document).on('click', '.pagina', function () {
                    cargarDatosUsuario($(this).data('pagina'));
                });

              
            }


            function EditarPedido(tipo) {
                $("#editpedido").on("click", "#btedit", function () {
                    // console.log("EDITADO");
                    data = $("form#editpedido").serialize();
                    // console.log(data);
                    $.ajax({
                        type: "GET",
                        url: "php/pedidos/editpedido.php?id=" + buscar,
                        data: data,
                        success: function (datos) {
                            console.log(datos);
                            if (datos == "added") {
                                $("#editform").css({ "display": "none" })
                                if(tipo == 2){
                                    cargarDatosAdministrador(1);
                                }else{
                                    cargarDatosUsuario(1);
                                }
                            }

                            else if (datos == "error2" || datos == "") {
                                $("<div></div>").appendTo("body")
                                    .html("<div><h3>Has superado el límite de carácteres</h3></div>")
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
                            else if (datos == "error3" || datos == "") {
                                $("<div></div>").appendTo("body")
                                    .html("<div><h3>No se pueden dejar espacios en blanco</h3></div>")
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
                            else if (datos == "error4" || datos == "") {
                                $("<div></div>").appendTo("body")
                                    .html("<div><h3>El formato del número de teléfono no es correcto</h3></div>")
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





                        }
                    })
                });
            }


            function Devolver(target, tipo, id) {
                $(target).on("click", "#devolver", function () {
                    var cod = $(this).parents(target + " td").find('input[type="button"]').attr('name');

                    var prods = cod.split(",");


                    $("<div></div>").appendTo("body")
                    .html("<div><h3>¿Estás segruo de que quieres devolver el producto?</h3></div>")
                    .dialog({
                        resizable: false,
                        modal: true,
                        title: "Confirmacion",
                        buttons: {
                            "Si": function () {
                                // Si se confirma, hacer algo
                                $.ajax({
                                    type: "GET",
                                    url: "php/pedidos/devolverpedidos.php?id=" + prods[0] + "&id_prod=" + prods[1],
                                    success: function (datos) {
                                        // console.log(datos);
                                        $("#verpedidosindv").css({ "display": "none" });
                                        if(tipo == 2){
                                            cargarDatoProductoAdmin(1, id);
                                            cargarDatosAdministrador(1);
                                        }else{
                                            cargarDatosProductoUsuario(1, id);
                                            cargarDatosUsuario(1);
                                        }
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
            }


            function BuscarPedido(target) {
                $(target).on("click", "#editar", function () {
                    buscar = $(this).parents(target + " td").find('input[type="button"]').attr('name');
                    $.ajax({
                        type: "GET",
                        url: "php/pedidos/findpedido.php?id=" + buscar,
                        success: function (datos) {
                            $("#editform").css({ "display": "block" });
                            var pedidos = jQuery.parseJSON(datos);
                            for (var x of pedidos) {
                                $("#editpedido input[type='text']:eq(0)").val(x.nombre);
                                //$("#editpedido input[type='text']:eq(0)").val(x.usuario);
                                $("#editpedido select:eq(0)").val(x.id_usuario);
                                $("#editpedido select:eq(1)").val(x.estado);
                                $("#editpedido input[type='text']:eq(1)").val(x.direccion);
                                $("#editpedido input[type='text']:eq(2)").val(x.telefono);



                            }
                        },
                    });
                })
            }

            function RellenarSelectUser() {
                $.ajax({
                    type: "GET",
                    url: "php/pedidos/showuserspedidos.php",
                    success: function (datos) {
                        var usuarios = jQuery.parseJSON(datos);
                        for (var x of usuarios) {
                            $("<option value='" + x.id + "'>" + x.usuario + "</option>").appendTo("#editform select:eq(0)")


                        }
                    },
                });
            }


            function EliminarPedido(target, tipo, id) {
                $(target).on("click", "#borrar", function () {
                    var cod = $(this).parents(target + " td").find('input[type="button"]').attr('name');
                    // console.log(cod);

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
                                        url: "php/pedidos/deletepedido.php?id=" + cod,
                                        success: function (datos) {
                                            if(tipo == 2){
                                                cargarDatoProductoAdmin(1, id);
                                                cargarDatosAdministrador(1);
                                            }else{
                                                cargarDatosProductoUsuario(1, id);
                                                cargarDatosUsuario(1);
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


            function cargarDatosUsuario(pagina) {
                var $tabla = $('#pedidosadmin');
                var $paginacion = $('#paginacion');
                $.ajax({
                    url: 'php/pedidos/showpedidos.php',
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
                            htmlTabla += '<td>' + datos[i].usuario + '</td>';
                            htmlTabla += '<td>' + datos[i].estado + '</td>';
                            htmlTabla += '<td><input type="button" data-id="' + datos[i].id + '" id="borrar" name="' + datos[i].id + '" value="Eliminar"></td>';
                            htmlTabla += '<td><input type="button" id="editar" data-id="' + datos[i].id + '" name="' + datos[i].id + '" value="Editar"></td>';
                            htmlTabla += '<td><input type="button" id="verpedido" data-id="' + datos[i].id + '" name="' + datos[i].id + '" value="Ver pedido"></td>';
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





            function cargarDatosAdministrador(pagina) {
                var $tabla = $('#pedidosadmin');
                var $paginacion = $('#paginacion');
                $.ajax({
                    url: 'php/pedidos/showpedidosadmin.php',
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
                            htmlTabla += '<td>' + datos[i].usuario + '</td>';
                            htmlTabla += '<td>' + datos[i].estado + '</td>';
                            htmlTabla += '<td><input type="button" data-id="' + datos[i].id + '" id="borrar" name="' + datos[i].id + '" value="Eliminar"></td>';
                            htmlTabla += '<td><input type="button" id="editar" data-id="' + datos[i].id + '" name="' + datos[i].id + '" value="Editar"></td>';
                            htmlTabla += '<td><input type="button" id="verpedido" data-id="' + datos[i].id + '" name="' + datos[i].id + '" value="Ver pedido"></td>';
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



            //PEDIDOS PRPDUCTO

            function cargarDatosProductoUsuario(pagina, id) {
                console.log(id);
                var $tabla = $('#pedidosproductos');
                var $paginacion = $('#paginaciondetalles');
                $.ajax({
                    url: 'php/pedidos/showpedidosandproduct.php?id=' + id,
                    data: { offset: (pagina - 1) * 6, limit: 6 },
                    dataType: 'json',
                    success: function (response) {
                        var datos = response.data;
                        var totalPaginas = response.totalPaginas;
                        var htmlTabla = '';
                        for (var i = 0; i < datos.length; i++) {
                            console.log(datos[i].nombre);
                            htmlTabla += '<tr>';
                            htmlTabla += '<td>' + datos[i].id + '</td>';
                            htmlTabla += '<td>' + datos[i].nombre + '</td>';
                            htmlTabla += '<td>' + datos[i].usuario + '</td>';
                            htmlTabla += '<td>' + datos[i].prod_nom + '</td>';
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

            function cargarDatoProductoAdmin(pagina, id) {
                var $tabla = $('#pedidosproductos');
                var $paginacion = $('#paginaciondetalles');
                $.ajax({

                    url: 'php/pedidos/showpedidosandproductadmin.php?id=' + id,
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
                            htmlTabla += '<td>' + datos[i].usuario + '</td>';
                            htmlTabla += '<td>' + datos[i].prod_nom + '</td>';
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




        },
    });
});