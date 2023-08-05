
$(document).ready(function () {
   
    $.ajax({
        type: "GET",
        url: "php/sesion.php",
        success: function (datos) {
          //  console.log(datos);
            //menu de artistas
            if (datos == "1") {
                $('<div class="row"><div class="card col-md-3"><img src="./media/productos-icon.png" width="250px" height="250px"><h3>PRODUCTOS</h3><p><a href="adminproduct.html">Entrar</a></div><div class="card col-md-3"><img src="./media/avisos-icon.png" width="250px" height="250px"><h3>AVISOS</h3><p><a href="adminavisos.html">Entrar</a></div><div class="card col-md-3"><img src="./media/pedidos-icon.png" width="250px" height="250px"><h3>PEDIDOS</h3><p><a href="adminpedidos.html">Entrar</a></div></div><div class="row"><div class="card col-md-3"><img src="./media/tienda-icon.png" width="250px" height="250px"><h3>TIENDA</h3><p><a href="tienda.html">Entrar</a></div><div class="card col-md-3"><img src="./media/publicaciones-icon.png" width="250px" height="250px"><h3>PUBLICACIONES</h3><p><a href="adminpubli.html">Entrar</a></div></div>').appendTo("#panel");
            }
            //Menu de Administradores
            else if (datos == "2") {
               // console.log("ADMIn");
                $('<div class="row"><div class="card col-md-3"><img src="./media/productos-icon.png" width="250px" height="250px"><h3>PRODUCTOS</h3><p><a href="adminproduct.html">Entrar</a></div><div class="card col-md-3"><img src="./media/pedidos-icon.png" width="250px" height="250px"><h3>PEDIDOS</h3><p><a href="adminpedidos.html">Entrar</a></div><div class="card col-md-3"><img src="./media/avisos-icon.png" width="250px" height="250px"><h3>AVISOS</h3><p><a href="adminavisos.html">Entrar</a></div></div><div class="row"><div class="card col-md-3"><img src="./media/tienda-icon.png" width="250px" height="250px"><h3>TIENDA</h3><p><a href="tienda.html">Entrar</a></div><div class="card col-md-3"><img src="./media/publicaciones-icon.png" width="250px" height="250px"><h3>PUBLICACIONES</h3><p><a href="adminpubli.html">Entrar</a></div><div class="card col-md-3"><img src="./media/eventos-icon.png" width="250px" height="250px"><h3>EVENTOS</h3><p><a href="admineventos.html">Entrar</a></p></div></div><div class="row"><div class="card col-md-3"><img src="./media/categorias.png" width="250px" height="250px"><h3>CATEGORÍAS</h3><p><a href="admincategorias.html">Entrar</a></p></div><div class="card col-md-3"><img src="./media/users-icon.png" width="250px" height="250px"><h3>USUARIOS</h3><p><a href="adminusers.html">Entrar</a></p></div><div class="card col-md-3"><img src="./media/informe.png" width="250px" height="250px"><h3>INFORMES</h3><p><a href="informes.html">Entrar</a></p></div></div>').appendTo("#panel");


            }
            //Menu de No artistas
            else if (datos == "3") {
               // console.log("ADMIn");
                window.location.href = "index.html";

            }
            //Menu adminsitradores de eventos
            else if (datos == "4") {
              //  console.log("ADMIn");
                $('<div class="row"><div class="card col-md-3"><img src="./media/productos-icon.png" width="250px" height="250px"><h3>PRODUCTOS</h3><p><a href="adminproduct.html">Entrar</a></div><div class="card col-md-3"><img src="./media/pedidos-icon.png" width="250px" height="250px"><h3>PEDIDOS</h3><p><a href="adminpedidos.html">Entrar</a></div><div class="card col-md-3"><img src="./media/avisos-icon.png" width="250px" height="250px"><h3>AVISOS</h3><p><a href="adminavisos.html">Entrar</a></div></div><div class="row"><div class="card col-md-3"><img src="./media/tienda-icon.png" width="250px" height="250px"><h3>TIENDA</h3><p><a href="tienda.html">Entrar</a></div><div class="card col-md-3"><img src="./media/publicaciones-icon.png" width="250px" height="250px"><h3>PUBLICACIONES</h3><p><a href="adminpubli.html">Entrar</a></div><div class="card col-md-3"><img src="./media/eventos-icon.png" width="250px" height="250px"><h3>EVENTOS</h3><p><a href="admineventos.html">Entrar</a></p></div></div>').appendTo("#panel");

            }

        },
    });


   



});