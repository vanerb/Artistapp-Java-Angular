<?php
include('../Connection.php');
include('../Crud.php');

session_start();


$id = $_GET['id'];
if (isset($id)) {
    if (!empty($id)) {
        $database = new Crud();
        $sqlConnection = new Connection();

        $sql = $sqlConnection->getConnection();

        $result = $database->getinfo("SELECT * FROM usuarios WHERE id='$id'");



        while ($row = $result->fetch_assoc()) {


            $imagen = $row['imagen'];
        }





        $result = $database->getinfo("SELECT DISTINCT COUNT(*) as total
        FROM usuarios
        LEFT JOIN pedidos ON usuarios.id = pedidos.id_usuario
        LEFT JOIN avisos ON usuarios.id = avisos.id_usuario
        LEFT JOIN productos ON usuarios.id = productos.id_usuario
        LEFT JOIN publicaciones ON usuarios.id = publicaciones.id_usuario
        LEFT JOIN listado_evento ON usuarios.id = listado_evento.id_usuario
        LEFT JOIN eventos ON usuarios.id = eventos.id_usuario
        LEFT JOIN informes as info1 ON usuarios.id = info1.id_usuario
        LEFT JOIN informes as info2 ON usuarios.id = info2.id_usuarioreferenciado
        WHERE pedidos.id_usuario = '$id'
           OR avisos.id_usuario = '$id'
           OR productos.id_usuario = '$id'
           OR publicaciones.id_usuario = '$id'
           OR listado_evento.id_usuario = '$id'
           OR eventos.id_usuario = '$id'
           OR info1.id_usuario = '$id'
           OR info2.id_usuarioreferenciado = '$id' 
           ;
        ");

        // Obtener el número de usuarios con ese nombre de usuario
        $count = $result->fetch_assoc()["total"];

        if ($count == 0) {
            $result = $database->getinfo("SELECT COUNT(*) as total FROM usuarios WHERE imagen='$imagen' AND id <> '$id'");
                
            // Obtener el número de usuarios con ese nombre de usuario
            $count = $result->fetch_assoc()["total"];
            //$imagenpartes = explode("/", $imagen);

            if ($count == 0) {
                if($imagen != "media/no-user.png"){
                    unlink("../../".$imagen);
                }
                
            } 

            $result = $database->getinfo("SELECT * FROM cesta WHERE id_usuario='$id'");



            while ($row = $result->fetch_assoc()) {
    
    
                $id_cesta = $row['id'];
            }

            $database->vaciar_cesta_producto($id_cesta);
            $database->VaciarFavorito($id);
            $database->VaciarMeGustaListUsuario($id);
            $database->eliminar_cestabyuser($id);
            
            $database->DeleteUsers($id);

            echo "deleted";
        } else {
            echo "error1";
        }
    }
}
