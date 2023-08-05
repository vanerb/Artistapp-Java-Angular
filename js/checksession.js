$(document).ready(function () {


    //Comprueba la sesion y segun lo que obtenga muestra un menu o otro
    
    $.ajax({
        type: "GET",
        url: "php/sesion.php",
        success: function (datos) {
           // console.log(datos);
            //menu de artistas
            if (datos == "1") {
                $('<nav class="navbar navbar-expand-lg navbar-light bg-light"><a class="navbar-brand" href="index.html"><img src="media/artistapp.png" width="52px" height="52px"></a><button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="navbarNav"><ul class="navbar-nav mr-auto"><li class="nav-item active"><a class="nav-link" href="index.html">Inicio</a></li><li class="nav-item"><a class="nav-link" href="tienda.html">Tienda</a></li><li class="nav-item"><a class="nav-link" href="descubrir.html">Descubrir</a></li></ul><ul class="navbar-nav"><li class="nav-item"><a class="nav-link" href="adminpanel.html">Administración</a></li><li class="nav-item"><a class="nav-link" href="perfilusuario.html">Mi cuenta</a></li><li class="nav-item"><a class="nav-link" href="pedidos.html">Mis pedidos</a></li><li class="nav-item"><a class="nav-link" href="cesta.html">Carrito</a></li><li class="nav-item" id="cerrar"><a class="nav-link" href="login.html">Cerrar Sesión</a></li></ul></div></nav>').appendTo("#menu");
            }
            //Menu de Administradores
            else if (datos == "2") {
              //  console.log("ADMIn");
                $('<nav class="navbar navbar-expand-lg navbar-light bg-light"><a class="navbar-brand" href="index.html"><img src="media/artistapp.png" width="52px" height="52px"></a><button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="navbarNav"><ul class="navbar-nav mr-auto"><li class="nav-item active"><a class="nav-link" href="index.html">Inicio</a></li><li class="nav-item"><a class="nav-link" href="tienda.html">Tienda</a></li><li class="nav-item"><a class="nav-link" href="descubrir.html">Descubrir</a></li></ul><ul class="navbar-nav"><li class="nav-item"><a class="nav-link" href="adminpanel.html">Administración</a></li><li class="nav-item"><a class="nav-link" href="perfilusuario.html">Mi cuenta</a></li><li class="nav-item"><a class="nav-link" href="pedidos.html">Mis pedidos</a></li><li class="nav-item"><a class="nav-link" href="cesta.html">Carrito</a></li><li class="nav-item" id="cerrar"><a class="nav-link" href="login.html">Cerrar Sesión</a></li></ul></div></nav>').appendTo("#menu");
            }
            //Menu de No artistas
            else if (datos == "3") {
              //  console.log("ADMIn");
                $('<nav class="navbar navbar-expand-lg navbar-light bg-light"><a class="navbar-brand" href="index.html"><img src="media/artistapp.png" width="52px" height="52px"></a><button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="navbarNav"><ul class="navbar-nav mr-auto"><li class="nav-item active"><a class="nav-link" href="index.html">Inicio</a></li><li class="nav-item"><a class="nav-link" href="tienda.html">Tienda</a></li><li class="nav-item"><a class="nav-link" href="descubrir.html">Descubrir</a></li></ul><ul class="navbar-nav"><li class="nav-item"><a class="nav-link" href="perfilusuario.html">Mi cuenta</a></li><li class="nav-item"><a class="nav-link" href="pedidos.html">Mis pedidos</a></li><li class="nav-item"><a class="nav-link" href="cesta.html">Carrito</a></li><li class="nav-item" id="cerrar"><a class="nav-link" href="login.html">Cerrar Sesión</a></li></ul></div></nav>').appendTo("#menu");
            }
            //Menu adminsitradores de eventos
            else if (datos == "4") {
               // console.log("ADMIn");
                $('<nav class="navbar navbar-expand-lg navbar-light bg-light"><a class="navbar-brand" href="index.html"><img src="media/artistapp.png" width="52px" height="52px"></a><button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="navbarNav"><ul class="navbar-nav mr-auto"><li class="nav-item active"><a class="nav-link" href="index.html">Inicio</a></li><li class="nav-item"><a class="nav-link" href="tienda.html">Tienda</a></li><li class="nav-item"><a class="nav-link" href="descubrir.html">Descubrir</a></li></ul><ul class="navbar-nav"><li class="nav-item"><a class="nav-link" href="adminpanel.html">Administración</a></li><li class="nav-item"><a class="nav-link" href="perfilusuario.html">Mi cuenta</a></li><li class="nav-item"><a class="nav-link" href="pedidos.html">Mis pedidos</a></li><li class="nav-item"><a class="nav-link" href="cesta.html">Carrito</a></li><li class="nav-item" id="cerrar"><a class="nav-link" href="login.html">Cerrar Sesión</a></li></ul></div></nav>').appendTo("#menu");
            }
            else {


                if (window.location.pathname == "/artistapp/index.html" || window.location.pathname == "/artistapp/") {
                    $('<nav class="navbar navbar-expand-lg navbar-light bg-light"><a class="navbar-brand" href="index.html"><img src="media/artistapp.png" width="52px" height="52px"></a><button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="navbarNav"><ul class="navbar-nav mr-auto"><li class="nav-item active"><a class="nav-link" href="index.html">Inicio</a></li></ul><ul class="navbar-nav"><li class="nav-item"><a class="nav-link" href="login.html">Iniciar sesión</a></li><li class="nav-item"><a class="nav-link" href="registro.html">Registrarse</a></li></ul></div></nav>').appendTo("#menu");

                }
                else {
                    window.location.href = "login.html";

                }




            }





        },
    });

    $("body").on("click", "#cerrar", function () {
       // console.log("ssi");

        $.ajax({
            type: "GET",
            url: "php/sesionclose.php",
            success: function (datos) {

                window.location.href = "login.html";





            },
        });
    })

});