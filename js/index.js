
$(document).ready(function () {
    
    $.ajax({
        type: "GET",
        url: "php/sesion.php",
        success: function (datos) {
           // console.log(datos);
            //menu de artistas
            if (datos == "1") {

            }
            //Menu de Administradores
            else if (datos == "2") {
                
            }
            //Menu de No artistas
            else if (datos == "3") {
                
            }
            //Menu adminsitradores de eventos
            else if (datos == "4") {
                
            }
            else {


                if (window.location.pathname == "/artistapp/index.html" || window.location.pathname == "/artistapp/") {
                    $('<div class="row"><div class="col-md-6"><button id="registro">¡Registrate!</button></div><div class="col-md-6"><button id="iniciasesion">¡Inicia sesión!</button></div></div>').appendTo("#botones");
                }
                else {
                    window.location.href = "login.html";

                }




            }





        },
    });



    $("body").on("click", "#registro", function () {  
        window.location.href = "registro.html";
    })

    $("body").on("click", "#iniciasesion", function () {  
        window.location.href = "login.html";

    })
});