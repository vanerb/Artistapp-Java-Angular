<?php
include('../Connection.php');
include('../Crud.php');
session_start();


$id = $_GET['id'];

if (isset($id)) {
    if (!empty($id)) {
       
        $database = new Crud();
        $sqlConnection = new Connection();


        $result = $database->getinfo("SELECT COUNT(*) as total FROM categoria JOIN publicaciones ON publicaciones.id_categoria = categoria.id WHERE publicaciones.id_categoria = '$id'");

        // Obtener el número de usuarios con ese nombre de usuario
        $count = $result->fetch_assoc()["total"];

        if ($count == 0) {
            $database->DeleteCategory($id);
            echo "deleted";
        }
        else{
            echo "error1";
        }





        
    }
}