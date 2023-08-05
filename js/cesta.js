
$(document).ready(function () {
   
    var totalapagar = 0;
    document.addEventListener('contextmenu', function (e) {
        if (e.target.nodeName === 'IMG') {
            e.preventDefault();
        }
    }, false);

    Actualizar();

    $("#cesta").on("click", "#eliminar", function () {
        var cod = $(this).parents("#bteliminar").find('input[type="button"]').attr('name');
        // console.log(cod);
        $.ajax({
            type: "GET",
            url: "php/tienda/deleteelementcesta.php?id_producto=" + cod,
            success: function (datos) {
                // console.log(datos);
                Actualizar();

            },
        });
    })

    $("body").on("click", "#pagar", function () {
        //window.location.href = "checkout.html";
        var datos = {
            total: totalapagar
        };
        var queryString = $.param(datos);
        window.location.href = 'checkout.html?' + queryString;
        
    })


    function Actualizar() {
        $("#cesta").empty();
        $("#cestatotal").empty();
        $("#cestagastos").empty();
        var total = 0;
        var envio = 0;

        $.ajax({
            type: "GET",
            url: "php/tienda/cesta.php",
            success: function (datos) {
                var cesta = jQuery.parseJSON(datos);
                for (var x of cesta) {
                    if (x.imagen != "media/no-item.png") {
                        var imagen = x.imagen;
                        var cadena = imagen.split("/");
                        $('<div class="item"><div class="row"><div class="col-md-4"><img src="imglowres/low' + cadena[1] + '" alt="Producto 1" width="120px" height="100px" ></div><div class="col-md-8"><h4>' + x.nombre + '</h4><p>' + x.descripcion + '</p><p class="price">' + x.precio + '</p><div id="bteliminar"><input id="eliminar" class="btn btn-primary" type="button" name="' + x.id + '" value="Eliminar"></div></div></div></div>').appendTo("#cesta");

                        //   console.log(total);
                    }
                    else {
                        $('<div class="item"><div class="row"><div class="col-md-4"><img src="' + x.imagen + '" alt="Producto 1" width="120px" height="100px" ></div><div class="col-md-8"><h4>' + x.nombre + '</h4><p>' + x.descripcion + '</p><p class="price">' + x.precio + '</p><div id="bteliminar"><input id="eliminar" class="btn btn-primary" type="button" name="' + x.id + '" value="Eliminar"></div></div></div></div>').appendTo("#cesta");
                    }
                    total += parseFloat(x.precio);

                }

                $.ajax({
                    type: "GET",
                    url: "php/tienda/gastosdeenvio.php",
                    success: function (datos1) {
                        $("#cestagastos").empty();
                        $("#cestatotal").empty();

                        //  console.log(datos1);
                        if (datos1 == "addenvio") {
                            $('<div class="item"><div class="row"><div class="col-md-8"><h4>Gastos de envío:</h4></div><div class="col-md-4"><p class="price">4.00€</p></div></div></div>').appendTo("#cestagastos");
                            envio = envio + 4;
                            totalapagar = total + envio;
                            // console.log(envio);
                            $('<div class="item"><div class="row"><div class="col-md-8"><h4>Total:</h4></div><div class="col-md-4"><p class="price">' + totalapagar.toFixed(2) + ' €</p></div></div></div>').appendTo("#cestatotal");

                        }
                        else {
                            $('<div class="item"><div class="row"><div class="col-md-8"><h4>Gastos de envío:</h4></div><div class="col-md-4"><p class="price">0.00€</p></div></div></div>').appendTo("#cestagastos");
                            envio = 0;
                            totalapagar = total + envio;
                            // console.log(envio);
                            $('<div class="item"><div class="row"><div class="col-md-8"><h4>Total:</h4></div><div class="col-md-4"><p class="price">' + totalapagar.toFixed(2) + ' €</p></div></div></div>').appendTo("#cestatotal");
                        }


                    },
                });

                $('<div class="item"><div class="row"><div class="col-md-8"><h4>Gastos de envío:</h4></div><div class="col-md-4"><p class="price">0.00€</p></div></div></div>').appendTo("#cestagastos");

                // console.log(envio);
                $('<div class="item"><div class="row"><div class="col-md-8"><h4>Total:</h4></div><div class="col-md-4"><p class="price"> 0.00 €</p></div></div></div>').appendTo("#cestatotal");

                if (total.toFixed(2) == "0.00") {
                    $("#pagar").prop("disabled", true);

                }
                else {
                    $("#pagar").prop("disabled", false);

                }

            },
        });


    }
});