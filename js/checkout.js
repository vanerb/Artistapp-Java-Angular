
$(document).ready(function () {
   
    $("#checkoutform #nombre").blur(function () {
        if ($("#checkoutform #nombre").val() == "" || $("#checkoutform #nombre").val().trim() === "") {
            $("#checkoutform #nombre").css({ "background-color": "red" })
        }
        else {
            $("#checkoutform #nombre").css({ "background-color": "" })
        }

    })


    $("#checkoutform #direccion").blur(function () {
        if ($("#checkoutform #direccion").val() == "" || $("#checkoutform #direccion").val().trim() === "") {
            $("#checkoutform #direccion").css({ "background-color": "red" })
        }
        else {
            $("#checkoutform #direccion").css({ "background-color": "" })
        }

    })

    $("#checkoutform #telefono").blur(function () {
        if ($("#checkoutform #telefono").val() == "" || $("#checkoutform #telefono").val().trim() === "") {
            $("#checkoutform #telefono").css({ "background-color": "red" })
        }
        else {
            $("#checkoutform #telefono").css({ "background-color": "" })
        }

    })


    $("#checkoutform #nombretarjeta").blur(function () {
        if ($("#checkoutform #nombretarjeta").val() == "" || $("#checkoutform #nombretarjeta").val().trim() === "") {
            $("#checkoutform #nombretarjeta").css({ "background-color": "red" })
        }
        else {
            $("#checkoutform #nombretarjeta").css({ "background-color": "" })
        }

    })

    $("#checkoutform #numerotarjeta").blur(function () {
        if ($("#checkoutform #numerotarjeta").val() == "" || $("#checkoutform #numerotarjeta").val().trim() === "") {
            $("#checkoutform #numerotarjeta").css({ "background-color": "red" })
        }
        else {
            $("#checkoutform #numerotarjeta").css({ "background-color": "" })
        }

    })


    $("#checkoutform #vencimiento").blur(function () {
        if ($("#checkoutform #vencimiento").val() == "" || $("#checkoutform #vencimiento").val().trim() === "") {
            $("#checkoutform #vencimiento").css({ "background-color": "red" })
        }
        else {
            $("#checkoutform #vencimiento").css({ "background-color": "" })
        }

    })

    $("#checkoutform #cvv").blur(function () {
        if ($("#checkoutform #cvv").val() == "" || $("#checkoutform #cvv").val().trim() === "") {
            $("#checkoutform #cvv").css({ "background-color": "red" })
        }
        else {
            $("#checkoutform #cvv").css({ "background-color": "" })
        }

    })


    var queryString = window.location.search;

    // analizar la cadena de consulta para obtener los datos como objeto
    var datos = {};
    queryString.slice(1).split('&').forEach(function (item) {
        var parts = item.split('=');
        datos[parts[0]] = decodeURIComponent(parts[1]);
    });

    console.log(datos.total);
    var total = parseFloat(datos.total) ;

    $.ajax({
        type: "GET",
        url: "php/tienda/countofcesta.php",
        success: function (datos) {
            //  console.log(datos);
            if (datos == "isempty") {

                window.location.href = "tienda.html";

            }


        },
    });

    $("body").on("click", "#pagar1", function () {
        var data = $("form#checkoutform").serialize();
        //  console.log(data);
        $.ajax({
            type: "GET",
            data: data,
            url: "php/tienda/finalizarpedido.php?totalpagar="+total.toFixed(2),
            success: function (datos) {
                if (datos == "added") {
                    window.location.href = "tienda.html";

                }
                else if (datos == "error1") {
                    $("<div></div>").appendTo("body")
                        .html("<div><h3>El numero de teléfono no es correcto</h3></div>")
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
                else if (datos == "error2") {
                    $("<div></div>").appendTo("body")
                        .html("<div><h3>El número de tarjeta no es correcto</h3></div>")
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
                else if (datos == "error3") {
                    $("<div></div>").appendTo("body")
                        .html("<div><h3>El CVV no es correcto</h3></div>")
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
                else if (datos == "error4") {
                    $("<div></div>").appendTo("body")
                        .html("<div><h3>La fecha de vencimiento no es correcto</h3></div>")
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

                else if (datos == "error5") {
                    $("<div></div>").appendTo("body")
                        .html("<div><h3>No hay stock de uno de los productos</h3></div>")
                        .dialog({
                            resizable: false,
                            modal: true,
                            title: "Error",
                            buttons: {
                                "Aceptar": function () {
                                    // Si se confirma, hacer algo
                                    window.location.href = "cesta.html";
                                    $(this).dialog("close");
                                },

                            },
                            close: function () {
                                // Si se cierra el diálogo, quitarlo del DOM
                                $(this).remove();
                            }
                        });
                }
                //   console.log(datos);
            },
        });
    })
});