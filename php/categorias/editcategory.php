<?php
include('../Connection.php');
include('../Crud.php');
session_start();


$nombre = $_GET["nombre"];
$id = $_GET['id'];

if (isset($nombre)) {
    if (!empty($nombre)) {
        if (strlen($nombre) > 0 && strlen(trim($nombre)) == 0 || $nombre == "") {
            echo "error1";
        } else {
            if(strlen($nombre)<50){
                $database = new Crud();
                $sqlConnection = new Connection();
                $result = $database->getinfo("SELECT COUNT(*) as total FROM categoria WHERE nombre='$nombre' AND id<>$id");
    
                // Obtener el número de usuarios con ese nombre de usuario
                $count = $result->fetch_assoc()["total"];
    
                if ($count == 0) {
                    $data = array($nombre);
    
                    $database->EditCategory($data, $id);
                    echo "added";
                }
                else{
                    echo "error2";
                }
            }
            else{
                echo "error3";
            }
           



            
        }
    }
}
