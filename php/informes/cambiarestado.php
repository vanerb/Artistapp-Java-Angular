<?php
include('../Connection.php');
include('../Crud.php');
session_start();

if (!is_null($_SESSION['user'])) {


    $id = $_GET["id"];
    
    $database = new Crud();
    $sqlConnection = new Connection();
    $sql = $sqlConnection->getConnection();
    $usuario = $_SESSION['user'];

    $result = $database->getinfo("SELECT * FROM informes WHERE id='$id'");

    while ($row = $result->fetch_assoc()) {
        $estado = $row['estado'];
    }
    if ($estado == "pendiente") {
        $database->CambiarEstado($id, "resuelta");
        echo "added";
    } else {
        $database->CambiarEstado($id, "pendiente");
        echo "added";
    }
}
