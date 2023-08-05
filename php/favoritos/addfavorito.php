<?php
include('../Connection.php');
include('../Crud.php');
session_start();

if (!is_null($_SESSION['user'])) {

    $id_ref = $_GET['id'];

    $database = new Crud();
    $sqlConnection = new Connection();
    $sql = $sqlConnection->getConnection();
    $usuario = $_SESSION['user'];

    $result = $database->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");

    while ($row = $result->fetch_assoc()) {
        $id = $row['id'];
    }

    
    $result = $database->getinfo("SELECT COUNT(*) as total FROM favoritos WHERE id_usuario='$id' AND id_usuariopin = '$id_ref'");
    $count = $result->fetch_assoc()["total"];
    if($count == 0){
        $data = array($id, $id_ref);
        $database->AddFavorito($data);
        echo "added";
    }
    else{
        echo "error1";
    }
   
        
    
    
   
}
